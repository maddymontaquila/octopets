"""
Pet Sitter Recommendation Agent

This agent provides personalized pet sitter recommendations based on user requests.
It analyzes the pet-sitter.json data and makes intelligent recommendations without
asking follow-up questions.
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Annotated

from agent_framework import ChatAgent
from agent_framework_azure_ai import AzureAIAgentClient
from azure.identity.aio import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def load_pet_sitters() -> str:
    """Load pet sitter data from JSON file and return as formatted string."""
    data_path = Path(__file__).parent / "data" / "pet-sitter.json"
    with open(data_path, "r") as f:
        pet_sitters = json.load(f)
    return json.dumps(pet_sitters, indent=2)


def search_pet_sitters(
    location: Annotated[str, "The location to search for pet sitters (e.g., 'New York', 'Seattle', 'San Francisco')"] = None,
    pet_type: Annotated[str, "Type of pet (e.g., 'dogs', 'cats', 'birds', 'reptiles', 'small_mammals')"] = None,
    service: Annotated[str, "Required service (e.g., 'pet_sitting', 'dog_walking', 'overnight_care', 'exotic_pet_care')"] = None,
    day_needed: Annotated[str, "Day needed (e.g., 'Monday', 'Saturday')"] = None,
    max_rate: Annotated[float, "Maximum hourly rate budget"] = None,
    specialization: Annotated[str, "Specific specialization needed (e.g., 'senior_pets', 'exotic_pets', 'medication_administration')"] = None,
) -> str:
    """
    Search and filter pet sitters based on various criteria.
    Returns a JSON string of matching pet sitters.
    """
    data_path = Path(__file__).parent / "data" / "pet-sitter.json"
    with open(data_path, "r") as f:
        pet_sitters = json.load(f)
    
    filtered_sitters = pet_sitters
    
    # Apply filters
    if location:
        filtered_sitters = [
            s for s in filtered_sitters 
            if location.lower() in s["location"].lower()
        ]
    
    if pet_type:
        filtered_sitters = [
            s for s in filtered_sitters 
            if pet_type.lower() in [pt.lower() for pt in s["typeOfPets"]]
        ]
    
    if service:
        filtered_sitters = [
            s for s in filtered_sitters 
            if service.lower() in [sv.lower() for sv in s["services"]]
        ]
    
    if day_needed:
        filtered_sitters = [
            s for s in filtered_sitters 
            if day_needed in s["daysAvailable"]
        ]
    
    if max_rate:
        filtered_sitters = [
            s for s in filtered_sitters 
            if s["hourlyRate"] <= max_rate
        ]
    
    if specialization:
        filtered_sitters = [
            s for s in filtered_sitters 
            if specialization.lower() in [sp.lower() for sp in s["specializations"]]
        ]
    
    # Sort by rating and review count
    filtered_sitters.sort(key=lambda x: (x["rating"], x["reviewCount"]), reverse=True)
    
    if not filtered_sitters:
        return json.dumps({"message": "No pet sitters found matching the criteria."})
    
    return json.dumps(filtered_sitters[:5], indent=2)  # Return top 5 matches


def get_pet_sitter_details(
    sitter_id: Annotated[int, "The ID of the pet sitter to get details for"],
) -> str:
    """Get detailed information about a specific pet sitter by ID."""
    data_path = Path(__file__).parent / "data" / "pet-sitter.json"
    with open(data_path, "r") as f:
        pet_sitters = json.load(f)
    
    sitter = next((s for s in pet_sitters if s["id"] == sitter_id), None)
    
    if not sitter:
        return json.dumps({"error": f"Pet sitter with ID {sitter_id} not found."})
    
    return json.dumps(sitter, indent=2)


async def run_pet_sitter_agent(user_query: str) -> str:
    """
    Run the pet sitter recommendation agent with a user query.
    
    Args:
        user_query: The user's request for pet sitter recommendations
        
    Returns:
        The agent's recommendation response
    """
    # Azure AI Foundry project endpoint from environment variable
    project_endpoint = os.getenv(
        "AZURE_OPENAI_ENDPOINT",
        "https://opinion-stacks-pets-resource.services.ai.azure.com/api/projects/opinion-stacks-pets"
    )
    model_deployment_name = os.getenv("AZURE_MODEL_DEPLOYMENT_NAME", "gpt-4o")
    agent_name = "PetSitterRecommendationAgent"
    
    # System instructions for the agent
    instructions = """You are a professional pet sitter recommendation assistant. Your role is to:

1. Analyze the user's request carefully to understand their needs (location, pet type, services needed, schedule, budget, special requirements)
2. Use the search_pet_sitters tool to find matching pet sitters based on the criteria
3. Make intelligent recommendations based on the results, considering:
   - Rating and reviews
   - Years of experience
   - Specializations that match the user's needs
   - Availability and services offered
   - Certifications and insurance status
4. Provide a clear, concise recommendation with 2-3 top choices
5. Include relevant details like rates, availability, and why they're a good match
6. DO NOT ask follow-up questions - make the best recommendation based on the information provided

Available pet sitter data includes locations in: New York, Seattle, San Francisco, Los Angeles, Chicago, and Miami.

Always be helpful, professional, and focus on finding the best match for the pet owner's needs."""

    # Create the agent client
    agent_client = AzureAIAgentClient(
        project_endpoint=project_endpoint,
        model_deployment_name=model_deployment_name,
        async_credential=DefaultAzureCredential(),
        agent_name=agent_name,
    )
    
    # The AzureAIAgentClient will automatically create the agent if it doesn't exist
    # when used with ChatAgent context manager
    async with ChatAgent(
        chat_client=agent_client,
        instructions=instructions,
        tools=[search_pet_sitters, get_pet_sitter_details],
    ) as agent:
        result = await agent.run(user_query)
        return result.text


async def main():
    """Main entry point for the pet sitter recommendation agent."""
    print("🐾 Pet Sitter Recommendation Agent 🐾")
    print("=" * 50)
    print()
    
    # Example queries
    example_queries = [
        "I need a dog walker in New York for weekdays, budget is $30/hour",
        "Looking for someone to care for my senior cat in San Francisco on weekends",
        "Need an exotic pet sitter in Seattle who can handle reptiles",
        "I have a large, high-energy dog in Los Angeles that needs daily walks",
    ]
    
    print("Example queries:")
    for i, query in enumerate(example_queries, 1):
        print(f"{i}. {query}")
    print()
    
    # Interactive mode
    while True:
        print("Enter your pet sitter request (or 'quit' to exit):")
        user_input = input("> ").strip()
        
        if user_input.lower() in ["quit", "exit", "q"]:
            print("Thank you for using the Pet Sitter Recommendation Agent!")
            break
        
        if not user_input:
            continue
        
        print("\n🔍 Searching for the best pet sitters...\n")
        
        try:
            response = await run_pet_sitter_agent(user_input)
            print(f"🐾 Recommendation:\n{response}\n")
        except Exception as e:
            print(f"❌ Error: {str(e)}\n")
        
        print("-" * 50)
        print()


if __name__ == "__main__":
    asyncio.run(main())
