# Pet Sitter Recommendation Agent 🐾

An intelligent AI agent that provides personalized pet sitter recommendations based on your specific needs. Built with Microsoft Agent Framework and Azure AI Foundry.

## Features

- **Intelligent Matching**: Analyzes your requirements and matches you with the best pet sitters
- **No Follow-up Questions**: Makes recommendations based on the information you provide
- **Comprehensive Filtering**: Searches by location, pet type, services, availability, budget, and specializations
- **Data-Driven**: Uses real pet sitter profiles with ratings, certifications, and experience
- **Tool-Based**: Leverages function calling to search and filter pet sitter data

## Prerequisites

- Python 3.8 or higher
- Azure CLI installed and authenticated (`az login`)
- Access to Azure AI Foundry project at: `https://opinion-stacks-pets-resource.services.ai.azure.com/api/projects/opinion-stacks-pets`

## Installation

**Important**: The `--pre` flag is REQUIRED while Agent Framework is in preview.

```bash
# Install dependencies
pip install agent-framework-azure-ai --pre
pip install azure-identity python-dotenv

# Or install from requirements.txt
pip install --pre -r requirements.txt
```

## Authentication

The agent uses `DefaultAzureCredential` which automatically picks up your Azure credentials. Make sure you're logged in:

```bash
az login
```

## Usage

### Interactive Mode

Run the agent in interactive mode:

```bash
python pet_sitter_agent.py
```

Then enter your requests, such as:
- "I need a dog walker in New York for weekdays, budget is $30/hour"
- "Looking for someone to care for my senior cat in San Francisco on weekends"
- "Need an exotic pet sitter in Seattle who can handle reptiles"
- "I have a large, high-energy dog in Los Angeles that needs daily walks"

### Programmatic Usage

```python
import asyncio
from pet_sitter_agent import run_pet_sitter_agent

async def main():
    query = "I need a dog walker in New York for weekdays"
    response = await run_pet_sitter_agent(query)
    print(response)

asyncio.run(main())
```

## How It Works

1. **User Query**: You describe your pet sitting needs in natural language
2. **Tool Execution**: The agent uses the `search_pet_sitters` function to filter the database
3. **Intelligent Analysis**: The AI evaluates matches based on ratings, experience, specializations, and your requirements
4. **Recommendation**: Returns 2-3 top choices with detailed reasoning

## Available Tools

### `search_pet_sitters`
Filters pet sitters by:
- Location (New York, Seattle, San Francisco, Los Angeles, Chicago, Miami)
- Pet type (dogs, cats, birds, reptiles, small_mammals)
- Service type (pet_sitting, dog_walking, overnight_care, etc.)
- Day availability
- Maximum hourly rate
- Specializations (senior_pets, exotic_pets, medication_administration, etc.)

### `get_pet_sitter_details`
Retrieves complete profile information for a specific pet sitter by ID.

## Data Source

The agent uses data from `data/pet-sitter.json` which includes:
- 12 professional pet sitters across 6 major US cities
- Detailed profiles with experience, certifications, ratings, and reviews
- Various specializations from senior pet care to exotic animals
- Hourly rates ranging from $18 to $40

## Architecture

- **Framework**: Microsoft Agent Framework (Python)
- **Host**: Azure AI Foundry
- **Model**: GPT-4o (configurable)
- **Authentication**: Azure DefaultAzureCredential
- **Tools**: Custom Python functions for data filtering

## Configuration

The agent is pre-configured to use your Azure AI Foundry endpoint:
```
https://opinion-stacks-pets-resource.services.ai.azure.com/api/projects/opinion-stacks-pets
```

To modify the model deployment or other settings, edit the `run_pet_sitter_agent` function in `pet_sitter_agent.py`.

## Example Output

```
🔍 Searching for the best pet sitters...

🐾 Recommendation:
Based on your needs for a dog walker in New York on weekdays with a $30/hour budget, 
I recommend:

1. **Sarah Johnson** ($25/hour, Rating: 4.9/5)
   - 5 years of experience with dogs and cats
   - Available Monday-Friday
   - Certified in Pet First Aid and Animal CPR
   - Specializes in senior pets and medication administration
   - Great for: Reliable weekday care with professional certifications

2. **Carlos Martinez** ($26/hour, Rating: 4.7/5)
   - 6 years of experience specializing in dogs
   - Available 7 days a week
   - Specializes in pack walking and reactive dogs
   - 203 reviews - highly experienced
   - Great for: Dogs needing socialization or behavioral support
```

## Troubleshooting

- **Authentication Error**: Run `az login` to authenticate with Azure
- **Model Not Found**: Verify your model deployment name in Azure AI Foundry
- **Tool Errors**: Ensure `data/pet-sitter.json` exists and is properly formatted

## License

MIT
