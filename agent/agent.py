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
# Azure AI Foundry project endpoint (not AZURE_OPENAI_ENDPOINT)
AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
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
    print(f"🔍 Starting Azure AI client initialization...")
    print(f"🔍 AZURE_OPENAI_ENDPOINT: {AZURE_OPENAI_ENDPOINT}")
    print(f"🔍 AGENT_ID: {AGENT_ID}")
    
    if not AZURE_OPENAI_ENDPOINT:
        print("Azure AI not configured. Using fallback mode.")
        return
    
    try:
        # Initialize AIProjectClient with the AI Foundry project endpoint
        print("🔍 Attempting connection string initialization...")
        ai_client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=AZURE_OPENAI_ENDPOINT
        )
        print(f"✓ Azure AI client initialized successfully for endpoint: {AZURE_OPENAI_ENDPOINT}")
    except Exception as e:
        # Fallback to direct endpoint if connection string doesn't work
        logger.warning(f"Connection string failed: {e}")
        try:
            print("🔍 Attempting direct endpoint initialization...")
            ai_client = AIProjectClient(
                credential=DefaultAzureCredential(),
                endpoint=AZURE_OPENAI_ENDPOINT
            )
            print(f"✓ Azure AI client initialized with direct endpoint: {AZURE_OPENAI_ENDPOINT}")
        except Exception as e2:
            print(f"❌ Failed to initialize Azure AI client: {e}, {e2}")
            ai_client = None

# Initialize ChatAgent
async def init_chat_agent():
    """Initialize ChatAgent with Azure AI
    
    Note: When using an existing agent_id, the agent's tools and instructions
    are already configured in AI Foundry. We don't override them here to ensure
    the agent uses the tools and instructions defined in the portal.
    """
    global chat_agent
    print("🔍 Starting ChatAgent initialization...")
    print(f"🔍 ai_client is None: {ai_client is None}")
    print(f"🔍 AGENT_ID: {AGENT_ID}")
    print(f"🔍 AGENT_FRAMEWORK_AVAILABLE: {AGENT_FRAMEWORK_AVAILABLE}")
    
    if not ai_client or not AGENT_ID or not AGENT_FRAMEWORK_AVAILABLE:
        print("⚠️ Azure AI or agent-framework not configured. Agent will use fallback responses.")
        chat_agent = None
        return
    
    try:
        # Use AzureAIAgentClient with Azure AI Projects
        # When agent_id is provided, it will use the agent configuration from AI Foundry
        # including tools and instructions defined in the portal
        logger.info(f"Initializing AzureAIAgentClient with agent_id: {AGENT_ID}")
        
        chat_client = AzureAIAgentClient(
            project_client=ai_client,
            agent_id=AGENT_ID
        )
        
        # Log agent definition to verify tools are loaded
        print("🔍 Attempting to retrieve agent definition for diagnostics...")
        try:
            # Retrieve agent definition directly from AI Projects API
            print(f"🔍 Calling ai_client.agents.get_agent({AGENT_ID})...")
            agent_def = await ai_client.agents.get_agent(AGENT_ID)
            print(f"🔍 Agent definition retrieved: {type(agent_def)}")
            if agent_def:
                print(f"✓ Agent definition loaded: {agent_def.name}")
                print(f"✓ Agent model: {agent_def.model}")
                if hasattr(agent_def, 'instructions') and agent_def.instructions:
                    print(f"✓ Agent instructions: {agent_def.instructions[:100]}...")
                if hasattr(agent_def, 'tools') and agent_def.tools:
                    print(f"✓ Agent has {len(agent_def.tools)} tools configured:")
                    for i, tool in enumerate(agent_def.tools):
                        tool_type = type(tool).__name__
                        print(f"  - Tool {i+1}: {tool_type}")
                        if hasattr(tool, 'function'):
                            func = tool.function
                            if hasattr(func, 'name'):
                                print(f"    Function name: {func.name}")
                            if hasattr(func, 'description'):
                                print(f"    Description: {func.description}")
                else:
                    print("⚠️ No tools configured in AI Foundry agent")
                
                # Check tool_resources for file search vector stores
                if hasattr(agent_def, 'tool_resources') and agent_def.tool_resources:
                    print(f"✓ Agent has tool_resources configured")
                    tool_res = agent_def.tool_resources
                    if hasattr(tool_res, 'file_search') and tool_res.file_search:
                        print(f"  - File search resources found")
                        if hasattr(tool_res.file_search, 'vector_store_ids'):
                            vector_store_ids = tool_res.file_search.vector_store_ids
                            if vector_store_ids:
                                print(f"  - Vector store IDs: {vector_store_ids}")
                            else:
                                print(f"  ⚠️ No vector store IDs in file search resources!")
                    else:
                        print(f"  ⚠️ No file_search in tool_resources")
                else:
                    print("⚠️ No tool_resources configured in agent")
            else:
                print("⚠️ No agent definition found (returned None)")
        except Exception as diag_e:
            print(f"❌ Could not retrieve agent definition for diagnostics: {diag_e}")
            import traceback
            traceback.print_exc()
        
        # Create ChatAgent without overriding instructions or tools
        # The AzureAIAgentClient will automatically use the tools and instructions
        # from the AI Foundry agent definition
        chat_agent = ChatAgent(
            chat_client=chat_client
        )
        print("✓ ChatAgent initialized successfully with AI Foundry configuration")
    except Exception as e:
        logger.error(f"✗ Failed to initialize ChatAgent: {e}", exc_info=True)
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
    Generate agent response using Azure AI Agents SDK directly to ensure file search works.
    
    The ChatAgent framework abstraction may not properly invoke file search tools,
    so we use the lower-level agents API directly.
    """
    if not ai_client or not AGENT_ID:
        logger.warning("Agent not available, falling back to placeholder response")
        return "Agent not connected"
    
    try:
        print(f"🔍 Sending message to agent: {user_message[:100]}...")
        
        # Get agent definition to extract tool_resources
        agent_def = await ai_client.agents.get_agent(AGENT_ID)
        
        # Create thread with the agent's vector store for file_search
        # This is CRITICAL - thread must have tool_resources attached for file search to work
        thread_tool_resources = None
        if hasattr(agent_def, 'tool_resources') and agent_def.tool_resources:
            if hasattr(agent_def.tool_resources, 'file_search') and agent_def.tool_resources.file_search:
                vector_store_ids = agent_def.tool_resources.file_search.vector_store_ids
                if vector_store_ids:
                    print(f"🔍 Creating thread with vector stores: {vector_store_ids}")
                    from azure.ai.agents.models import ToolResources, FileSearchToolResource
                    thread_tool_resources = ToolResources(
                        file_search=FileSearchToolResource(
                            vector_store_ids=vector_store_ids
                        )
                    )
        
        # Create thread with tool_resources attached
        thread = await ai_client.agents.threads.create(tool_resources=thread_tool_resources)
        print(f"✓ Created thread: {thread.id}")
        
        # Create a message in the thread
        message = await ai_client.agents.messages.create(
            thread_id=thread.id,
            role="user",
            content=user_message
        )
        print(f"✓ Created message: {message.id}")
        
        # Run the agent with additional instructions to force file search usage
        print(f"🔍 Creating run with agent_id: {AGENT_ID}")
        run = await ai_client.agents.runs.create_and_process(
            thread_id=thread.id,
            agent_id=AGENT_ID,
            additional_instructions="Always search the knowledge base first before providing information. Use the file_search tool to find specific venues and locations from the uploaded documents."
        )
        
        print(f"✓ Run completed with status: {run.status}")
        print(f"🔍 Run ID: {run.id}")
        
        # Try to get run steps to see if file search was invoked
        print(f"🔍 Attempting to retrieve run steps...")
        try:
            # list() returns an AsyncItemPaged directly - don't await it
            run_steps = ai_client.agents.run_steps.list(
                thread_id=thread.id,
                run_id=run.id
            )
            
            steps = []
            async for step in run_steps:
                steps.append(step)
            
            print(f"✓ Found {len(steps)} run steps")
            for i, step in enumerate(steps):
                print(f"  Step {i+1}: type={step.type}, status={step.status}")
                if hasattr(step, 'step_details'):
                    details = step.step_details
                    print(f"    Details type: {type(details).__name__}")
                    if hasattr(details, 'tool_calls') and details.tool_calls:
                        print(f"    ✓ Tool calls found: {len(details.tool_calls)}")
                        for j, tc in enumerate(details.tool_calls):
                            tool_type = type(tc).__name__
                            print(f"      Tool {j+1}: {tool_type}")
                            # Check if it's file search
                            if 'FileSearch' in tool_type or 'file_search' in tool_type.lower():
                                print(f"        ✓ FILE SEARCH WAS INVOKED!")
                    else:
                        print(f"    ⚠️ No tool calls in this step - FILE SEARCH NOT INVOKED")
                        
            if len(steps) == 0:
                print(f"  ⚠️ No steps found - agent may have skipped tool usage")
        except Exception as step_error:
            print(f"⚠️ Could not retrieve run steps: {step_error}")
            import traceback
            traceback.print_exc()
        
        if run.status == "failed":
            print(f"❌ Run failed: {run.last_error}")
            return "I encountered an error processing your request."
        
        # Get the agent's response messages
        messages = []
        async for msg in ai_client.agents.messages.list(thread_id=thread.id):
            messages.append(msg)
        
        # Get the latest assistant message
        for msg in messages:
            if msg.role == "assistant" and msg.text_messages:
                response_content = msg.text_messages[-1].text.value
                print(f"✓ Agent response received ({len(response_content)} chars)")
                
                # Log first 200 chars to see if citations are present
                print(f"🔍 Response preview: {response_content[:200]}...")
                
                # Check for annotations (file citations)
                if hasattr(msg, 'text_messages') and msg.text_messages:
                    text_msg = msg.text_messages[-1]
                    if hasattr(text_msg, 'annotations') and text_msg.annotations:
                        print(f"✓ Response has {len(text_msg.annotations)} annotations (file citations)")
                        for i, annotation in enumerate(text_msg.annotations):
                            print(f"  Annotation {i+1}: {type(annotation).__name__}")
                    else:
                        print(f"⚠️ No annotations found - agent may not be using file search!")
                
                return response_content
        
        return "I couldn't generate a response. Please try again."
        
    except Exception as e:
        logger.error(f"Error in agent response: {e}")
        print(f"❌ Error in agent response: {e}")
        import traceback
        traceback.print_exc()
        return "Agent not connected"

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, port=port)