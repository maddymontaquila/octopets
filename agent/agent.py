from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uuid
import logging

# Azure AI imports
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.agents.models import ListSortOrder
from azure.core.exceptions import AzureError



# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Azure AI configuration
AZURE_AI_ENDPOINT = "https://octopets-foundry.services.ai.azure.com/api/projects/octopets-project"
AGENT_ID = "asst_rXORuz2mDU623yYpvf7YxIll"

# Initialize Azure AI client
try:
    ai_client = AIProjectClient(
        credential=DefaultAzureCredential(),
        endpoint=AZURE_AI_ENDPOINT
    )
    logger.info("Azure AI client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Azure AI client: {e}")
    ai_client = None

app = FastAPI(title="Octopets Agent API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # 'user' or 'agent'
    timestamp: datetime
    isTyping: Optional[bool] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[dict] = None  # For passing pet info, location, etc.

class ChatResponse(BaseModel):
    message: ChatMessage
    conversation_id: str
    suggestions: Optional[List[str]] = None  # Optional venue suggestions

class ConversationHistory(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime

# In-memory storage for conversations (replace with database in production)
conversations: dict[str, ConversationHistory] = {}
# Store Azure AI thread IDs mapped to conversation IDs
azure_threads: dict[str, str] = {}

@app.get("/")
async def root():
    """Health check endpoint"""
    azure_status = "connected" if ai_client else "disconnected"
    return {
        "message": "Octopets Agent API is running! 🐾",
        "azure_ai_status": azure_status,
        "agent_id": AGENT_ID if ai_client else None
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Main chat endpoint that processes user messages and returns agent responses.
    
    This endpoint will:
    1. Receive user message and context
    2. Process the message through the agent (LLM/AI logic)
    3. Generate contextual response about pet-friendly venues
    4. Return the response with optional venue suggestions
    """
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get or create conversation history
        if conversation_id not in conversations:
            conversations[conversation_id] = ConversationHistory(
                conversation_id=conversation_id,
                messages=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        
        conversation = conversations[conversation_id]
        
        # Add user message to history
        user_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=request.message,
            sender="user",
            timestamp=datetime.now()
        )
        conversation.messages.append(user_message)
        
        # Generate response using Azure AI Agent
        agent_response_content = await generate_agent_response(
            user_message=request.message,
            conversation_history=conversation.messages,
            context=request.context or {},
            conversation_id=conversation_id
        )
        
        # Create agent response message
        agent_message = ChatMessage(
            id=str(uuid.uuid4()),
            content=agent_response_content,
            sender="agent",
            timestamp=datetime.now()
        )
        conversation.messages.append(agent_message)
        conversation.updated_at = datetime.now()
        
        # TODO: Generate venue suggestions based on conversation
        suggestions = await generate_venue_suggestions(
            conversation_history=conversation.messages,
            context=request.context or {}
        )
        
        return ChatResponse(
            message=agent_message,
            conversation_id=conversation_id,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/api/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation(conversation_id: str):
    """Get conversation history by ID"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversations[conversation_id]

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del conversations[conversation_id]
    return {"message": "Conversation deleted successfully"}

@app.get("/api/venues/suggestions")
async def get_venue_suggestions(
    pet_type: Optional[str] = None,
    venue_type: Optional[str] = None,
    location: Optional[str] = None
):
    """
    Get venue suggestions based on criteria.
    This endpoint can be called independently or as part of chat responses.
    """
    # TODO: Implement venue suggestion logic
    # This would typically query your venues database
    return {
        "suggestions": [],
        "message": "Venue suggestions feature coming soon!"
    }

# Agent logic functions using Azure AI
async def generate_agent_response(
    user_message: str, 
    conversation_history: List[ChatMessage], 
    context: dict,
    conversation_id: str
) -> str:
    """
    Generate agent response using Azure AI Agents.
    
    This function:
    1. Gets or creates an Azure AI thread for the conversation
    2. Sends the user message to the agent
    3. Processes the agent response
    4. Returns the response content
    """
    if not ai_client:
        logger.warning("Azure AI client not available, falling back to placeholder response")
        return get_fallback_response(user_message)
    
    try:
        # Get or create Azure AI thread for this conversation
        thread_id = azure_threads.get(conversation_id)
        
        if not thread_id:
            # Create new thread
            thread = ai_client.agents.threads.create()
            thread_id = thread.id
            azure_threads[conversation_id] = thread_id
            logger.info(f"Created new Azure AI thread {thread_id} for conversation {conversation_id}")
        
        # Send user message to the thread
        message = ai_client.agents.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_message
        )
        
        # Get the agent and run it
        agent = ai_client.agents.get_agent(AGENT_ID)
        run = ai_client.agents.runs.create_and_process(
            thread_id=thread_id,
            agent_id=agent.id
        )
        
        if run.status == "failed":
            logger.error(f"Azure AI run failed: {run.last_error}")
            return get_fallback_response(user_message)
        
        # Get the agent's response
        messages = ai_client.agents.messages.list(
            thread_id=thread_id, 
            order=ListSortOrder.DESCENDING
        )
        
        # Find the latest agent message
        for message in messages:
            if message.role == "assistant" and message.text_messages:
                agent_response = message.text_messages[-1].text.value
                logger.info(f"Received agent response: {agent_response[:100]}...")
                return agent_response
        
        # Fallback if no agent message found
        logger.warning("No agent response found in thread")
        return get_fallback_response(user_message)
        
    except AzureError as e:
        logger.error(f"Azure AI error: {e}")
        return get_fallback_response(user_message)
    except Exception as e:
        logger.error(f"Unexpected error in agent response: {e}")
        return get_fallback_response(user_message)

def get_fallback_response(user_message: str) -> str:
    """
    Fallback response when Azure AI is not available.
    """
    message_lower = user_message.lower()
    
    if any(pet in message_lower for pet in ['dog', 'puppy']):
        return "🐕 That's awesome! Dogs love exploring new places. Are you looking for dog parks, pet-friendly restaurants, or maybe hiking trails? I can help you find spots where your pup can socialize and have fun!"
    elif any(pet in message_lower for pet in ['cat', 'kitten']):
        return "🐱 Cats are wonderful companions! Are you looking for cat-friendly cafes, pet stores with climbing areas, or perhaps quiet outdoor spaces where your kitty can safely explore?"
    elif any(venue in message_lower for venue in ['restaurant', 'cafe', 'food']):
        return "🍽️ Great choice! I can help you find pet-friendly restaurants and cafes where you and your companion can enjoy a meal together. What type of cuisine are you in the mood for?"
    elif any(venue in message_lower for venue in ['park', 'outdoor', 'walk']):
        return "🌳 Perfect! Outdoor activities are great for pets. I can suggest dog parks, hiking trails, beaches, and other outdoor spaces where pets are welcome. What kind of outdoor experience are you looking for?"
    else:
        return "That sounds interesting! 🎯 Based on what you've told me, I can help you find the perfect pet-friendly venues. Would you like me to suggest some options, or do you have a specific type of place in mind?"

async def generate_venue_suggestions(
    conversation_history: List[ChatMessage], 
    context: dict
) -> Optional[List[str]]:
    """
    Generate venue suggestions based on conversation context.
    
    This function should:
    1. Analyze conversation to understand user preferences
    2. Extract pet type, location, and venue preferences
    3. Return relevant venue suggestions
    """
    # Placeholder implementation - replace with actual logic
    # This would typically query your venues database and return relevant suggestions
    return None

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, port=port)