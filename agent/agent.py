from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uuid
import logging
import os

# Try to import Azure AI and agent-framework, but provide fallback if unavailable
try:
    from azure.ai.projects.aio import AIProjectClient
    from azure.identity.aio import DefaultAzureCredential
    from azure.core.exceptions import AzureError
    AZURE_AI_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Azure AI libraries not available: {e}")
    AIProjectClient = None
    DefaultAzureCredential = None
    AzureError = Exception
    AZURE_AI_AVAILABLE = False

try:
    from agent_framework import ChatAgent
    from agent_framework_azure_ai import AzureAIAgentClient
    AGENT_FRAMEWORK_AVAILABLE = True
except ImportError as e:
    logging.warning(f"agent-framework not available: {e}")
    ChatAgent = None
    AzureAIAgentClient = None
    AGENT_FRAMEWORK_AVAILABLE = False

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
AZURE_AI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AGENT_ID = os.environ.get("AGENT_ID")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Parse CORS origins - can be a single URL or comma-separated list
cors_origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
logger.info(f"CORS origins configured: {cors_origins}")

# Global state for ChatAgent
chat_agent = None

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
    """Initialize Azure AI client if credentials are available"""
    global ai_client
    if not AZURE_AI_ENDPOINT:
        logger.info("Azure AI not configured. Using fallback mode.")
        return
    
    try:
        ai_client = AIProjectClient(
            credential=DefaultAzureCredential(),
            endpoint=AZURE_AI_ENDPOINT
        )
        logger.info("Azure AI client initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize Azure AI client: {e}")
        ai_client = None

# Initialize ChatAgent
async def init_chat_agent():
    """Initialize ChatAgent with Azure AI
    
    Note: When using an existing agent_id, the agent's tools and instructions
    are already configured in AI Foundry. We don't override them here to ensure
    the agent uses the tools and instructions defined in the portal.
    """
    global chat_agent
    if not ai_client or not AGENT_ID or not AGENT_FRAMEWORK_AVAILABLE:
        logger.info("Azure AI or agent-framework not configured. Agent will use fallback responses.")
        chat_agent = None
        return
    
    try:
        # Use AzureAIAgentClient with Azure AI Projects
        # When agent_id is provided, it will use the agent configuration from AI Foundry
        # including tools and instructions defined in the portal
        chat_client = AzureAIAgentClient(
            project_client=ai_client,
            agent_id=AGENT_ID
        )
        
        # Create ChatAgent without overriding instructions or tools
        # This ensures the agent uses the configuration from AI Foundry portal
        chat_agent = ChatAgent(
            chat_client=chat_client
        )
        logger.info("ChatAgent initialized successfully with AI Foundry configuration")
    except Exception as e:
        logger.warning(f"Failed to initialize ChatAgent: {e}")
        chat_agent = None

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