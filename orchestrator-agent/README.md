# Octopets Multi-Agent Orchestrator

This orchestrator coordinates between specialized agents to handle complex user queries that require multiple types of information:

- **Listings Agent**: Pet-friendly venues, restaurants, and locations
- **Sitter Agent**: Pet sitter recommendations and availability

## Architecture

The orchestrator uses the [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) multi-agent orchestration pattern. It acts as a coordinator that:

1. **Analyzes** user queries to understand intent
2. **Delegates** sub-tasks to specialized agents using function calling
3. **Synthesizes** results from multiple agents into coherent responses

## Example Queries

The orchestrator excels at handling complex, multi-faceted requests:

```
"I need a place in NY with outdoor areas and looking for a sitter available on weekends"
```

This query requires:
- Listings agent → Find venues in NY with outdoor areas
- Sitter agent → Find sitters available on weekends
- Orchestrator → Combine both results into a unified recommendation

## API Endpoints

### POST `/agent/chat`

Send a message to the orchestrator.

**Request:**
```json
{
  "message": "I need a dog-friendly restaurant in Seattle and a dog walker for weekdays",
  "context": {}
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "content": "Based on your request, I found...",
    "sender": "agent",
    "timestamp": "2024-01-01T00:00:00"
  },
  "suggestions": null
}
```

### GET `/health`

Health check endpoint.

## Environment Variables

```bash
# Azure AI Configuration
AZURE_OPENAI_ENDPOINT=https://your-project.services.ai.azure.com/api/projects/your-project
AZURE_MODEL_DEPLOYMENT_NAME=gpt-4o

# Agent Service URLs
LISTINGS_AGENT_URL=http://localhost:8001
SITTER_AGENT_URL=http://localhost:8002

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=8003

# OpenTelemetry (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## Running Locally

```bash
# Install dependencies
uv sync

# Run the orchestrator
uv run python app.py
```

The API will be available at `http://localhost:8003`.

## How It Works

### 1. Query Analysis
The orchestrator uses GPT-4 to understand the user's intent and identify which specialized agents are needed.

### 2. Agent Delegation
The orchestrator has two tools:
- `query_listings_agent`: Delegates venue/listing queries
- `query_sitter_agent`: Delegates pet sitter queries

The AI model decides which tools to call based on the query.

### 3. Response Synthesis
Results from specialized agents are combined into a coherent, helpful response that addresses all aspects of the user's request.

## Integration with Octopets

The orchestrator is designed to be integrated into the Octopets frontend as an additional option:

1. Frontend detects complex queries (or user selects "Ask both")
2. Frontend calls orchestrator endpoint instead of individual agents
3. Orchestrator coordinates with specialized agents
4. User receives unified response

## Development

### Testing the Orchestrator

You can test the orchestrator directly:

```bash
uv run python orchestrator.py
```

This runs an interactive CLI where you can test queries.

### Adding New Agents

To add a new specialized agent:

1. Create a new tool function in `orchestrator.py`:
```python
async def query_new_agent(user_query: Annotated[str, "Description"]) -> str:
    # Implementation
    pass
```

2. Add the tool to the agent creation:
```python
agent = ChatAgent(
    chat_client=agent_client,
    instructions=instructions,
    tools=[query_listings_agent, query_sitter_agent, query_new_agent],
)
```

3. Update the instructions to include when to use the new agent.

## Monitoring

The orchestrator includes OpenTelemetry instrumentation for observability:
- Request tracing
- Agent invocations
- Tool calls
- Performance metrics

All telemetry is exported to the configured OTLP endpoint (Aspire Dashboard in development).
