"""
FastAPI wrapper for Octopets Multi-Agent Orchestrator

This provides REST API endpoints for the orchestrator that coordinates
between the listings agent and pet sitter agent.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv

from orchestrator import run_orchestrator

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
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Parse CORS origins - can be a single URL or comma-separated list
cors_origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
logger.info(f"CORS origins configured: {cors_origins}")


# Request/Response Models
class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # "user" or "agent"
    timestamp: datetime


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: ChatMessage
    suggestions: Optional[list[str]] = None


# Initialize FastAPI app
app = FastAPI(
    title="Octopets Orchestrator API",
    description="Multi-agent orchestration for complex queries requiring both venue and sitter information",
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
        "message": "Octopets Multi-Agent Orchestrator API 🐾",
        "version": "1.0.0",
        "description": "Coordinates between listings and sitter agents for complex queries",
        "endpoints": {
            "chat": "/agent/chat",
            "health": "/health",
            "docs": "/docs"
        },
        "agents": {
            "listings": os.getenv("LISTINGS_AGENT_URL", "http://localhost:8001"),
            "sitter": os.getenv("SITTER_AGENT_URL", "http://localhost:8002")
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "azure_ai_status": "connected" if os.getenv("AZURE_OPENAI_ENDPOINT") else "not configured"
    }


@app.post("/agent/chat", response_model=ChatResponse)
async def chat_with_orchestrator(request: ChatRequest):
    """
    Main chat endpoint that processes complex user queries.
    
    The orchestrator analyzes the query and delegates to:
    - Listings agent for venue/location information
    - Sitter agent for pet sitter information
    - Both agents for queries requiring both types of information
    
    Example queries:
    - "I need a place in NY with outdoor areas and a sitter available on weekends"
    - "Find me a dog-friendly restaurant in Seattle and recommend a dog walker"
    """
    try:
        logger.info(f"Received chat request: {request.message[:100]}...")
        
        # Run the orchestrator
        response_content = await run_orchestrator(request.message)
        
        # Create agent response message
        agent_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=response_content,
            sender="agent",
            timestamp=datetime.now()
        )
        
        return ChatResponse(
            message=agent_message,
            suggestions=None
        )
        
    except Exception as e:
        logger.error(f"Error processing chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8003))
    logger.info(f"Starting Orchestrator API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
