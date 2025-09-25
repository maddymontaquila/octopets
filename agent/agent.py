from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uuid
import logging
import os

# Azure AI imports
from azure.ai.projects.aio import AIProjectClient
from azure.identity.aio import DefaultAzureCredential
from agent_framework import ChatAgent
from agent_framework.foundry import FoundryChatClient
from azure.core.exceptions import AzureError

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
AZURE_AI_ENDPOINT = os.environ.get("AZURE_AI_ENDPOINT")
AGENT_ID = os.environ.get("AGENT_ID")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Parse CORS origins - can be a single URL or comma-separated list
cors_origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
logger.info(f"CORS origins configured: {cors_origins}")

# In-memory storage for conversations and ChatAgent
chat_agent: Optional[ChatAgent] = None

# Pydantic models for API
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
    suggestions: Optional[List[str]] = None

# Initialize Azure AI client and ChatAgent
ai_client = None

async def init_azure_client():
    global ai_client
    if not ai_client:
        try:
            ai_client = AIProjectClient(
                credential=DefaultAzureCredential(),
                endpoint=AZURE_AI_ENDPOINT
            )
            logger.info("Azure AI client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Azure AI client: {e}")
            ai_client = None

# Initialize ChatAgent
async def init_chat_agent():
    global chat_agent
    if not chat_agent and ai_client:
        chat_agent = ChatAgent(
            chat_client=FoundryChatClient(client=ai_client, agent_id=AGENT_ID),
            instructions="You are a helpful pet-friendly venue assistant for Octopets. Help users find pet-friendly venues, provide pet care advice, and make recommendations based on their needs. Be friendly, informative, and focus on pet-related topics. When users ask about dogs, cats, or other pets, provide helpful suggestions for venues, activities, and care tips."
        )
        logger.info("ChatAgent initialized successfully")

app = FastAPI(title="Octopets Agent API", version="1.0.0")

# CORS middleware to allow frontend connections
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
    """Health check endpoint"""
    azure_status = "connected" if ai_client else "disconnected"
    agent_status = "initialized" if chat_agent else "not initialized"
    return {
        "message": "Octopets Agent API is running! 🐾",
        "azure_ai_status": azure_status,
        "agent_status": agent_status,
        "agent_id": AGENT_ID if ai_client else None
    }

@app.on_event("startup")
async def startup_event():
    """Initialize Azure client and ChatAgent on startup"""
    await init_azure_client()
    if ai_client:
        await init_chat_agent()

@app.post("/agent/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Main chat endpoint that processes user messages and returns agent responses.
    
    The ChatAgent framework handles conversation state internally, so we just
    pass the user message directly to the agent.
    """
    try:
        # Generate response using ChatAgent (handles conversation state internally)
        agent_response_content = await generate_agent_response(request.message)
        
        # Create agent response message for frontend
        agent_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=agent_response_content,
            sender="agent",
            timestamp=datetime.now()
        )
        
        return ChatResponse(
            message=agent_message,
            suggestions=None
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

# Agent logic functions using ChatAgent
async def generate_agent_response(user_message: str) -> str:
    """
    Generate agent response using ChatAgent framework.
    
    Simple approach matching the sample - just pass the message to the agent
    and let it handle conversation state internally.
    """
    if not chat_agent:
        logger.warning("ChatAgent not available, falling back to placeholder response")
        return "Agent not connected"
    
    try:
        # Use the ChatAgent to generate a response - it handles conversation state internally
        result = await chat_agent.run(user_message)
        
        # Extract the actual response content from the AgentRunResponse object
        response_content = result.text
        
        logger.info(f"Received agent response: {response_content[:100]}...")
        return response_content
        
    except Exception as e:
        logger.error(f"Error in ChatAgent response: {e}")
        return "Agent not connected"

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, port=port)