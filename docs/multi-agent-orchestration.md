# Multi-Agent Orchestration Implementation Guide

## Overview

This implementation adds a **multi-agent orchestrator** to Octopets that coordinates between the listings agent and pet sitter agent to handle complex queries requiring both types of information.

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐   ┌──────────────┐
│ Orchestrator│   │ Direct Agent │
│   Agent     │   │   Calls      │
└──────┬──────┘   └──────────────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌────────┐
│ Listings │ │  Sitter  │ │ Future │
│  Agent   │ │  Agent   │ │ Agents │
└──────────┘ └──────────┘ └────────┘
```

## Components

### 1. Orchestrator Agent (`/orchestrator-agent`)

**Purpose**: Coordinates multiple agents to answer complex queries.

**Key Features**:
- Analyzes user queries using GPT-4
- Uses function calling to delegate to specialized agents
- Combines results into coherent responses
- Built on Agent Framework multi-agent pattern

**Files**:
- `orchestrator.py`: Core orchestration logic with agent tools
- `app.py`: FastAPI wrapper with `/agent/chat` endpoint
- `pyproject.toml`: Dependencies and configuration
- `README.md`: Documentation

### 2. Frontend Integration

**Updated Files**:
- `appConfig.ts`: Added orchestrator URL configuration
- `agentService.ts`: Added `AgentType` enum and multi-agent support

**New AgentService API**:
```typescript
// Send to orchestrator (default for complex queries)
await agentService.sendMessage(message, AgentType.ORCHESTRATOR);

// Send to specific agent
await agentService.sendMessage(message, AgentType.LISTINGS);
await agentService.sendMessage(message, AgentType.SITTER);
```

### 3. AppHost Configuration

The orchestrator is integrated into the Aspire AppHost:
- Port: 8003 (configurable)
- Icon: BranchFork (indicates orchestration)
- Dependencies: Listings Agent (8001), Sitter Agent (8002)
- CORS: Configured for frontend access
- Telemetry: OpenTelemetry instrumentation

## How It Works

### Query Flow

1. **User submits complex query**: 
   ```
   "I need a place in NY with outdoor areas and a sitter available on weekends"
   ```

2. **Frontend sends to orchestrator**:
   ```typescript
   agentService.sendMessage(query, AgentType.ORCHESTRATOR)
   ```

3. **Orchestrator analyzes intent**:
   - Identifies need for venue information (NY, outdoor areas)
   - Identifies need for sitter information (weekends)

4. **Orchestrator delegates**:
   - Calls `query_listings_agent("Find venues in NY with outdoor areas")`
   - Calls `query_sitter_agent("Find sitters available on weekends")`

5. **Specialized agents respond**:
   - Listings agent searches venues with file search
   - Sitter agent searches pet-sitter.json data

6. **Orchestrator synthesizes**:
   - Combines results from both agents
   - Creates unified, coherent response
   - Returns to frontend

### Tool Functions

The orchestrator uses two main tools:

#### `query_listings_agent`
- Delegates to listings agent at port 8001
- Handles venue/location queries
- Uses file search for venue data

#### `query_sitter_agent`
- Delegates to sitter agent at port 8002
- Handles pet sitter queries
- Searches structured JSON data

## Example Queries

### Complex Queries (Use Orchestrator)

✅ **"I need a place in NY with outdoor areas and a sitter available on weekends"**
- Requires both listings and sitter agents
- Orchestrator combines results

✅ **"Find me a dog-friendly restaurant in Seattle and recommend a dog walker"**
- Listings: restaurant search
- Sitter: dog walker recommendations

✅ **"Looking for a venue with outdoor seating in SF and someone to watch my cat"**
- Listings: venue with outdoor seating
- Sitter: cat sitter recommendations

### Simple Queries (Direct Agent)

✅ **"What pet-friendly venues are in New York?"**
- Only needs listings agent
- Can call directly or through orchestrator

✅ **"I need a dog walker in Seattle"**
- Only needs sitter agent
- Can call directly or through orchestrator

## Configuration

### Environment Variables

#### Orchestrator Agent
```bash
# Azure AI Configuration
AZURE_OPENAI_ENDPOINT=https://your-project.services.ai.azure.com/api/projects/your-project
AZURE_MODEL_DEPLOYMENT_NAME=gpt-4o

# Agent Service URLs (auto-configured in Aspire)
LISTINGS_AGENT_URL=http://localhost:8001
SITTER_AGENT_URL=http://localhost:8002

# CORS
FRONTEND_URL=http://localhost:3000

# Server
PORT=8003
```

#### Frontend
```bash
REACT_APP_AGENT_API_URL=http://localhost:8001
REACT_APP_SITTER_AGENT_API_URL=http://localhost:8002
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8003
```

### Aspire Configuration

The AppHost automatically configures:
- Service discovery between agents
- Dynamic URLs for agent communication
- CORS settings
- OpenTelemetry endpoints
- Application Insights (in production)

## Usage in Frontend

### Basic Usage

```typescript
import { agentService, AgentType } from './data/agentService';

// Use orchestrator for complex queries (default)
const response = await agentService.sendMessage(
  "I need a venue and a sitter in NY",
  AgentType.ORCHESTRATOR
);

// Use specific agent for simple queries
const listingsResponse = await agentService.sendMessage(
  "Show me venues in NY",
  AgentType.LISTINGS
);

const sitterResponse = await agentService.sendMessage(
  "Find me a dog walker",
  AgentType.SITTER
);
```

### Smart Routing (Recommended)

```typescript
function determineAgentType(message: string): AgentType {
  const lowerMessage = message.toLowerCase();
  
  // Check for complex query indicators
  const hasVenueKeywords = /venue|place|restaurant|location|outdoor/.test(lowerMessage);
  const hasSitterKeywords = /sitter|walker|care|watch/.test(lowerMessage);
  
  if (hasVenueKeywords && hasSitterKeywords) {
    return AgentType.ORCHESTRATOR;
  }
  
  if (hasSitterKeywords) {
    return AgentType.SITTER;
  }
  
  if (hasVenueKeywords) {
    return AgentType.LISTINGS;
  }
  
  // Default to orchestrator for ambiguous queries
  return AgentType.ORCHESTRATOR;
}

// Usage
const agentType = determineAgentType(userMessage);
const response = await agentService.sendMessage(userMessage, agentType);
```

### UI Options

You can add UI controls to let users choose:

```typescript
// Dropdown selector
<select onChange={(e) => setAgentType(e.target.value)}>
  <option value="orchestrator">Ask Both</option>
  <option value="listings">Venues Only</option>
  <option value="sitter">Sitters Only</option>
</select>

// Or smart buttons
<button onClick={() => sendToAgent(AgentType.ORCHESTRATOR)}>
  Ask Both 🤝
</button>
<button onClick={() => sendToAgent(AgentType.LISTINGS)}>
  Venues 🏪
</button>
<button onClick={() => sendToAgent(AgentType.SITTER)}>
  Sitters 🐾
</button>
```

## Running Locally

### Start All Services with Aspire

```bash
cd apphost
dotnet run
```

This starts:
- Frontend (port 3000)
- Backend API (auto-assigned)
- Listings Agent (port 8001)
- Sitter Agent (port 8002)
- **Orchestrator Agent (port 8003)** ← New!

### Test Individual Services

```bash
# Test listings agent
curl http://localhost:8001/

# Test sitter agent
curl http://localhost:8002/health

# Test orchestrator
curl http://localhost:8003/
```

### Test Orchestrator Directly

```bash
cd orchestrator-agent

# Install dependencies
uv sync

# Run interactive CLI
uv run python orchestrator.py

# Or run API server
uv run python app.py
```

## Monitoring & Observability

### Aspire Dashboard

View all services in the Aspire Dashboard (usually http://localhost:15888):
- See orchestrator requests
- Trace agent delegation calls
- Monitor performance
- View logs and telemetry

### Telemetry

The orchestrator includes:
- **Request tracing**: Track end-to-end query flow
- **Tool calls**: See which agents were invoked
- **Performance metrics**: Measure response times
- **Error tracking**: Capture and diagnose failures

## Extending the System

### Adding New Agents

1. **Create the agent service** (e.g., `review-agent`)

2. **Add to AppHost**:
```csharp
var review_agent = builder.AddUvApp("review-agent", "../review-agent", "app.py")
    .WithHttpEndpoint(env: "PORT")
    .WithIconName("Comment")
    .WithOtlpExporter();
```

3. **Add tool to orchestrator**:
```python
async def query_review_agent(
    user_query: Annotated[str, "Query about reviews"]
) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{REVIEW_AGENT_URL}/api/chat",
            json={"query": user_query}
        )
        return response.json()["response"]
```

4. **Update agent creation**:
```python
agent = ChatAgent(
    chat_client=agent_client,
    instructions=instructions,
    tools=[
        query_listings_agent, 
        query_sitter_agent,
        query_review_agent  # New!
    ],
)
```

5. **Update frontend**:
```typescript
export enum AgentType {
  LISTINGS = 'listings',
  SITTER = 'sitter',
  REVIEW = 'review',  // New!
  ORCHESTRATOR = 'orchestrator'
}
```

### Advanced Patterns

For more complex orchestration:

#### Sequential Workflows
```python
# Step 1: Get venues
venues = await query_listings_agent(query)

# Step 2: For each venue, get reviews
reviews = []
for venue in venues:
    review = await query_review_agent(f"Reviews for {venue}")
    reviews.append(review)

# Step 3: Synthesize
return synthesize_response(venues, reviews)
```

#### Parallel Execution
```python
import asyncio

# Execute multiple agents in parallel
results = await asyncio.gather(
    query_listings_agent(query),
    query_sitter_agent(query),
    query_review_agent(query)
)

venues, sitters, reviews = results
return combine_results(venues, sitters, reviews)
```

## Troubleshooting

### Orchestrator not starting
- Check `AZURE_OPENAI_ENDPOINT` is set
- Verify agent URLs are accessible
- Check port 8003 is available

### Agents not responding
- Verify listings agent (8001) and sitter agent (8002) are running
- Check Aspire Dashboard for service status
- Review logs for connection errors

### CORS errors
- Ensure `FRONTEND_URL` is configured on orchestrator
- Check Aspire is passing frontend URL correctly
- Verify CORS middleware is enabled

### Tool calls failing
- Check orchestrator can reach agent URLs
- Verify agent endpoints return expected format
- Review OpenTelemetry traces for tool invocations

## Best Practices

1. **Default to Orchestrator**: For production, route all queries through orchestrator
2. **Smart Routing**: Implement keyword detection for optimal agent selection
3. **Graceful Degradation**: Handle agent failures gracefully
4. **Monitor Performance**: Track orchestration overhead
5. **Test Complex Queries**: Focus testing on multi-agent scenarios
6. **Document Intent**: Keep agent instructions clear and specific

## References

- [Agent Framework Multi-Agent Orchestration](https://github.com/microsoft/agent-framework/tree/main/python#5-multi-agent-orchestration)
- [Agent Framework Documentation](https://github.com/microsoft/agent-framework)
- [Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [OpenTelemetry for Python](https://opentelemetry.io/docs/languages/python/)

## Summary

The orchestrator pattern enables Octopets to:
- ✅ Handle complex multi-faceted queries
- ✅ Combine information from multiple specialized agents
- ✅ Provide unified, coherent responses
- ✅ Scale to additional agents in the future
- ✅ Maintain observability across agent interactions

The implementation follows Microsoft Agent Framework best practices and integrates seamlessly with the existing Aspire-based architecture.
