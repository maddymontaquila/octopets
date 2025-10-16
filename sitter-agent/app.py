"""
FastAPI wrapper for Pet Sitter Recommendation Agent

This provides REST API endpoints to interact with the pet sitter agent.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import asyncio
import os
from dotenv import load_dotenv

from pet_sitter_agent import run_pet_sitter_agent, search_pet_sitters, get_pet_sitter_details

# Load environment variables
load_dotenv()

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment
API_PORT = int(os.getenv("API_PORT", "8002"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Parse CORS origins - can be a single URL or comma-separated list
cors_origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
logger.info(f"CORS origins configured: {cors_origins}")

# Request/Response Models
class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "query": "I need a dog walker in New York for weekdays, budget is $30/hour"
            }]
        }
    )
    
    query: str = Field(..., description="User's pet sitter request", min_length=1)


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "response": "Based on your requirements, I recommend..."
            }]
        }
    )
    
    response: str = Field(..., description="Agent's recommendation response")


class SearchRequest(BaseModel):
    """Request model for search endpoint."""
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{
                "location": "New York",
                "pet_type": "dogs",
                "service": "dog_walking",
                "max_rate": 30.0
            }]
        }
    )
    
    location: Optional[str] = Field(None, description="Location to search (e.g., 'New York', 'Seattle')")
    pet_type: Optional[str] = Field(None, description="Type of pet (e.g., 'dogs', 'cats', 'birds')")
    service: Optional[str] = Field(None, description="Required service (e.g., 'pet_sitting', 'dog_walking')")
    day_needed: Optional[str] = Field(None, description="Day needed (e.g., 'Monday', 'Saturday')")
    max_rate: Optional[float] = Field(None, description="Maximum hourly rate budget")
    specialization: Optional[str] = Field(None, description="Specific specialization (e.g., 'senior_pets')")


# Initialize FastAPI app
app = FastAPI(
    title="Pet Sitter Recommendation API",
    description="AI-powered pet sitter recommendation service",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Instrument FastAPI with OpenTelemetry
trace.set_tracer_provider(TracerProvider())
otlpExporter = OTLPSpanExporter(endpoint=os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT"))
processor = BatchSpanProcessor(otlpExporter)
trace.get_tracer_provider().add_span_processor(processor)

FastAPIInstrumentor().instrument_app(app)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Pet Sitter Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/api/chat",
            "search": "/api/search",
            "sitter_details": "/api/sitter/{sitter_id}",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the pet sitter recommendation agent.
    
    The agent will analyze your request and provide personalized recommendations
    based on your requirements (location, pet type, budget, schedule, etc.).
    """
    try:
        response = await run_pet_sitter_agent(request.query)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/api/search")
async def search(request: SearchRequest):
    """
    Search for pet sitters with specific criteria.
    
    Returns a filtered list of pet sitters matching your requirements.
    """
    try:
        import json
        result = search_pet_sitters(
            location=request.location,
            pet_type=request.pet_type,
            service=request.service,
            day_needed=request.day_needed,
            max_rate=request.max_rate,
            specialization=request.specialization,
        )
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@app.get("/api/sitter/{sitter_id}")
async def get_sitter_details(sitter_id: int):
    """
    Get detailed information about a specific pet sitter.
    
    Args:
        sitter_id: The unique ID of the pet sitter
    """
    try:
        import json
        result = get_pet_sitter_details(sitter_id)
        response = json.loads(result)
        
        if "error" in response:
            raise HTTPException(status_code=404, detail=response["error"])
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sitter details: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, port=port)
