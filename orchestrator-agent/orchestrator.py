"""
Multi-Agent Orchestrator for Octopets

This orchestrator coordinates between the listings agent and pet sitter agent
to handle complex queries that require both venue and sitter information.

Example queries it handles:
- "I need a place in NY with outdoor areas and a sitter available on weekends"
- "Find me a dog-friendly venue in Seattle and recommend a dog walker"
- "Looking for a pet-friendly restaurant in San Francisco with outdoor seating, 
   and I need someone to watch my cat while I'm there"
"""

import asyncio
import json
import os
import logging
from typing import Annotated, Optional
from pathlib import Path

from agent_framework import ChatAgent
from agent_framework_azure_ai import AzureAIAgentClient
from azure.identity.aio import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
LISTINGS_AGENT_URL = os.getenv("LISTINGS_AGENT_URL", "http://localhost:8001")
SITTER_AGENT_URL = os.getenv("SITTER_AGENT_URL", "http://localhost:8002")
MODEL_DEPLOYMENT_NAME = os.getenv("AZURE_MODEL_DEPLOYMENT_NAME", "gpt-4o")


async def query_listings_agent(
    user_query: Annotated[str, "The user's query about pet-friendly venues, listings, or places"]
) -> str:
    """
    Query the listings agent for pet-friendly venue information.
    
    Use this when the user asks about:
    - Pet-friendly venues, restaurants, or locations
    - Outdoor areas or amenities at venues
    - Specific locations or neighborhoods
    - Venue features like outdoor seating, pet policies, etc.
    
    Args:
        user_query: The user's question about venues or listings
        
    Returns:
        JSON string with venue information and recommendations
    """
    import httpx
    
    try:
        logger.info(f"Querying listings agent with: {user_query[:100]}...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{LISTINGS_AGENT_URL}/agent/chat",
                json={"message": user_query}
            )
            response.raise_for_status()
            
            data = response.json()
            # Extract the message content
            if isinstance(data, dict) and "message" in data:
                message_data = data["message"]
                if isinstance(message_data, dict) and "content" in message_data:
                    return message_data["content"]
            
            # Fallback to returning the raw response
            return json.dumps(data)
            
    except Exception as e:
        logger.error(f"Error querying listings agent: {e}")
        return json.dumps({
            "error": f"Failed to query listings agent: {str(e)}",
            "status": "error"
        })


async def query_sitter_agent(
    user_query: Annotated[str, "The user's query about pet sitters or pet care services"]
) -> str:
    """
    Query the pet sitter agent for pet sitter recommendations.
    
    Use this when the user asks about:
    - Pet sitters or pet care providers
    - Dog walkers or cat sitters
    - Pet care services (sitting, walking, overnight care)
    - Availability of sitters on specific days/times
    - Sitter rates, specializations, or experience
    
    Args:
        user_query: The user's question about pet sitters or pet care
        
    Returns:
        JSON string with pet sitter recommendations
    """
    import httpx
    
    try:
        logger.info(f"Querying sitter agent with: {user_query[:100]}...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SITTER_AGENT_URL}/api/chat",
                json={"query": user_query}
            )
            response.raise_for_status()
            
            data = response.json()
            # Extract the response content
            if isinstance(data, dict) and "response" in data:
                return data["response"]
            
            # Fallback to returning the raw response
            return json.dumps(data)
            
    except Exception as e:
        logger.error(f"Error querying sitter agent: {e}")
        return json.dumps({
            "error": f"Failed to query sitter agent: {str(e)}",
            "status": "error"
        })


async def create_orchestrator_agent() -> ChatAgent:
    """
    Create the orchestrator agent with tools to delegate to specialized agents.
    
    The orchestrator analyzes user queries and determines which agent(s) to invoke:
    - Listings agent for venue/location queries
    - Sitter agent for pet sitter queries
    - Both agents for complex queries requiring both
    """
    
    instructions = """You are an intelligent orchestrator for the Octopets platform. Your role is to:

1. ANALYZE the user's query to identify what they need:
   - Venue/listing information (pet-friendly places, restaurants, outdoor areas, etc.)
   - Pet sitter information (dog walkers, cat sitters, availability, rates, etc.)
   - Both venue and sitter information for complex requests

2. DELEGATE to the appropriate specialized agent(s):
   - Use query_listings_agent for venue-related questions
   - Use query_sitter_agent for pet sitter-related questions
   - Use BOTH tools when the query requires both types of information

3. SYNTHESIZE the results into a coherent, helpful response that:
   - Addresses all aspects of the user's request
   - Combines information from multiple agents when needed
   - Provides clear recommendations with relevant details
   - Maintains a friendly, professional tone

Example queries you'll handle:
- "I need a place in NY with outdoor areas and a sitter available on weekends"
  → Query both agents and combine results
  
- "Find me dog-friendly restaurants in Seattle"
  → Query only the listings agent
  
- "I need a dog walker in San Francisco who can do weekdays"
  → Query only the sitter agent

Always use the tools to get current, accurate information. Never make up venue or sitter details.
"""

    # Create the agent client
    agent_client = AzureAIAgentClient(
        project_endpoint=AZURE_OPENAI_ENDPOINT,
        model_deployment_name=MODEL_DEPLOYMENT_NAME,
        async_credential=DefaultAzureCredential(),
        agent_name="OctopetsOrchestratorAgent",
    )
    
    # Create the orchestrator agent with delegation tools
    agent = ChatAgent(
        chat_client=agent_client,
        instructions=instructions,
        tools=[query_listings_agent, query_sitter_agent],
        name="Orchestrator"
    )
    
    return agent


async def run_orchestrator(user_query: str) -> str:
    """
    Run the orchestrator agent with a user query.
    
    Args:
        user_query: The user's complex query that may require multiple agents
        
    Returns:
        The orchestrated response combining results from specialized agents
    """
    try:
        logger.info(f"Starting orchestration for query: {user_query[:100]}...")
        
        async with await create_orchestrator_agent() as orchestrator:
            result = await orchestrator.run(user_query)
            return result.text
            
    except Exception as e:
        logger.error(f"Error in orchestration: {e}")
        return f"I encountered an error processing your request: {str(e)}"


async def main():
    """Main entry point for testing the orchestrator."""
    print("🐾 Octopets Multi-Agent Orchestrator 🐾")
    print("=" * 60)
    print()
    
    # Example complex queries
    example_queries = [
        "I need a place in NY with outdoor areas and looking for a sitter available on weekends",
        "Find me a dog-friendly restaurant in Seattle and recommend a dog walker for weekdays",
        "I'm visiting San Francisco and need a pet-friendly venue with outdoor seating, plus someone to watch my cat",
        "What are the best outdoor venues for dogs in New York?",
        "I need a reliable pet sitter in Seattle who can handle senior pets",
    ]
    
    print("Example queries:")
    for i, query in enumerate(example_queries, 1):
        print(f"{i}. {query}")
    print()
    
    # Interactive mode
    while True:
        print("Enter your query (or 'quit' to exit):")
        user_input = input("> ").strip()
        
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Thank you for using the Octopets Orchestrator!")
            break
        
        if not user_input:
            continue
        
        print("\n🔍 Processing your request...\n")
        
        try:
            response = await run_orchestrator(user_input)
            print(f"📋 Response:\n{response}\n")
        except Exception as e:
            print(f"❌ Error: {str(e)}\n")
        
        print("-" * 60)
        print()


if __name__ == "__main__":
    asyncio.run(main())
