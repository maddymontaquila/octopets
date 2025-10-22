# Quickstart Guide: Pet Sitter Marketplace Development

**Feature Branch**: `002-pet-sitter-marketplace2`  
**Last Updated**: October 21, 2025

This guide provides step-by-step instructions for setting up, developing, and testing the pet sitter marketplace platform.

---

## Prerequisites

### Required Tools

- ✅ **.NET 9.0 SDK** or later
- ✅ **Node.js 18+** and npm
- ✅ **Python 3.11+** with `uv` package manager
- ✅ **Azure CLI** (2.77.0 or later) - `az --version` to verify
- ✅ **Azure subscription** with active login - `az login`
- ✅ **Git** for version control

### Verify Azure Prerequisites (CONSTITUTION REQUIRED)

```bash
# Check Azure CLI version
az --version

# Login to Azure (required for DefaultAzureCredential)
az login

# Verify subscription access
az account show

# Expected output should show your subscription name and ID
```

### Install uv (Python Package Manager)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installation
uv --version
```

---

## Initial Setup

### 1. Clone Repository and Switch to Feature Branch

```bash
# Clone repository
git clone https://github.com/maddymontaquila/octopets.git
cd octopets

# Switch to feature branch
git checkout 002-pet-sitter-marketplace2

# If branch doesn't exist yet, create it
git checkout -b 002-pet-sitter-marketplace2
```

### 2. Verify Existing Project Structure

The Octopets project already has the foundational structure. This feature expands it:

```bash
# Verify directories exist
ls -la apphost/
ls -la backend/
ls -la frontend/
ls -la agent/
ls -la sitter-agent/
ls -la orchestrator-agent/
```

Expected: All directories should exist. If any are missing, check you're on the correct branch.

### 3. Install Backend Dependencies

```bash
# Restore .NET packages
dotnet restore

# Build solution
dotnet build

# Verify no errors
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install

# Verify no errors
cd ..
```

### 5. Install Python Agent Dependencies

Each agent uses `uv` for dependency management:

```bash
# Listings agent
cd agent
uv sync
cd ..

# Sitter agent
cd sitter-agent
uv sync
cd ..

# Orchestrator agent
cd orchestrator-agent
uv sync
cd ..
```

**Note**: The `--pre` flag for `agent-framework-azure-ai` is configured in `pyproject.toml`.

---

## Running the Application

### Single Command Start (Aspire)

The **recommended** way to run the entire application:

```bash
# From repository root
aspire run
```

This command:

1. Starts the AppHost orchestrator
2. Launches backend API
3. Launches frontend React app
4. Starts all 3 Python agents (listings, sitter, orchestrator)
5. Opens Aspire Dashboard at `http://localhost:15888`

**Aspire Dashboard provides**:

- Service endpoints (click to open in browser)
- Real-time logs from all services
- OpenTelemetry traces for requests
- Metrics and resource utilization
- Health check status

### Alternative: dotnet run (Same Effect)

```bash
dotnet run --project apphost
```

### Accessing Services

After `aspire run`, the dashboard shows dynamic endpoints:

- **Frontend**: Usually `http://localhost:5000` (check dashboard)
- **Backend API**: Usually `http://localhost:5001` (check dashboard)
- **Listings Agent**: Port 8001
- **Sitter Agent**: Port 8002
- **Orchestrator Agent**: Port 8003

**Important**: Ports are dynamically assigned by Aspire. Always check the dashboard for actual endpoints.

---

## Development Workflows

### Backend Development

#### Adding a New Entity

1. **Create Model** in `backend/Models/`:

   ```csharp
   // Example: backend/Models/PetSitter.cs
   public class PetSitter
   {
       public Guid Id { get; set; }
       public string FirstName { get; set; } = string.Empty;
       public string Bio { get; set; } = string.Empty;
       // ... other fields from data-model.md
   }
   ```

2. **Add DbSet** to `AppDbContext`:

   ```csharp
   // backend/Data/AppDbContext.cs
   public DbSet<PetSitter> PetSitters => Set<PetSitter>();
   ```

3. **Create Repository** (optional, if using repository pattern):

   ```csharp
   // backend/Repositories/Interfaces/IPetSitterRepository.cs
   public interface IPetSitterRepository
   {
       Task<PetSitter?> GetByIdAsync(Guid id);
       Task<IEnumerable<PetSitter>> SearchAsync(/* params */);
   }
   
   // backend/Repositories/PetSitterRepository.cs
   public class PetSitterRepository : IPetSitterRepository
   {
       private readonly AppDbContext _context;
       // Implementation...
   }
   ```

4. **Register Repository** in `Program.cs`:

   ```csharp
   builder.Services.AddScoped<IPetSitterRepository, PetSitterRepository>();
   ```

5. **Seed Mock Data** in `AppDbContext.SeedData()`:

   ```csharp
   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
       // Existing seeding...
       
       modelBuilder.Entity<PetSitter>().HasData(
           new PetSitter 
           { 
               Id = Guid.NewGuid(), 
               FirstName = "Jane",
               Bio = "Experienced dog walker..."
           }
       );
   }
   ```

#### Adding a New Endpoint

1. **Create Endpoint File** in `backend/Endpoints/`:

   ```csharp
   // backend/Endpoints/PetSitterEndpoints.cs
   public static class PetSitterEndpoints
   {
       public static RouteGroupBuilder MapPetSitterEndpoints(this IEndpointRouteBuilder routes)
       {
           var group = routes.MapGroup("/api/sitters").WithTags("PetSitters");
           
           group.MapGet("/", GetAllSitters)
               .WithName("GetAllSitters")
               .WithDescription("Returns all active pet sitters")
               .WithOpenApi();
           
           group.MapGet("/{id:guid}", GetSitterById)
               .WithName("GetSitterById")
               .WithDescription("Returns sitter profile by ID")
               .WithOpenApi();
           
           return group;
       }
       
       private static async Task<IResult> GetAllSitters(IPetSitterRepository repo)
       {
           var sitters = await repo.GetAllAsync();
           return Results.Ok(sitters);
       }
       
       private static async Task<IResult> GetSitterById(Guid id, IPetSitterRepository repo)
       {
           var sitter = await repo.GetByIdAsync(id);
           return sitter is null ? Results.NotFound() : Results.Ok(sitter);
       }
   }
   ```

2. **Register Endpoint** in `Program.cs`:

   ```csharp
   // After existing endpoint mappings
   app.MapPetSitterEndpoints();
   ```

3. **Test Endpoint**:
   - Restart backend via Aspire (`aspire run` restarts automatically on code changes)
   - Check Aspire Dashboard logs
   - Access Scalar UI at backend endpoint + `/scalar/v1`
   - Test endpoint: `GET {backend_url}/api/sitters`

#### Backend Best Practices (from Azure MCP)

- ✅ Use Managed Identity (avoid connection strings)
- ✅ Implement retry logic with exponential backoff
- ✅ Add structured logging via `app.Logger`
- ✅ Handle errors gracefully (return proper HTTP status codes)
- ✅ Use parameterized queries (EF Core does this automatically)

### Frontend Development

#### Adding a New Page

1. **Create Page Component** in `frontend/src/pages/`:

   ```tsx
   // frontend/src/pages/SearchPage.tsx
   import React, { useState, useEffect } from 'react';
   import { dataService } from '../data/dataService';
   import SitterCard from '../components/SitterCard';
   
   export const SearchPage: React.FC = () => {
       const [sitters, setSitters] = useState([]);
       const [loading, setLoading] = useState(true);
       
       useEffect(() => {
           const fetchSitters = async () => {
               const results = await dataService.searchSitters({ location: '98052' });
               setSitters(results);
               setLoading(false);
           };
           fetchSitters();
       }, []);
       
       if (loading) return <div>Loading...</div>;
       
       return (
           <div>
               <h1>Find a Pet Sitter</h1>
               {sitters.map(sitter => <SitterCard key={sitter.id} sitter={sitter} />)}
           </div>
       );
   };
   ```

2. **Add Route** to router:

   ```tsx
   // frontend/src/App.tsx or router config
   import { SearchPage } from './pages/SearchPage';
   
   <Route path="/search" element={<SearchPage />} />
   ```

3. **Test**: Navigate to `http://localhost:5000/search` (check Aspire for actual port)

#### Adding Mock Data

1. **Create Mock Data File** in `frontend/src/data/`:

   ```typescript
   // frontend/src/data/sittersData.ts
   import { PetSitter } from './types';
   
   export const mockSitters: PetSitter[] = [
       {
           id: '123e4567-e89b-12d3-a456-426614174000',
           displayName: 'Jane Doe',
           bio: 'Experienced dog walker with 5 years...',
           averageRating: 4.8,
           totalReviews: 42,
           // ... match data-model.md structure
       }
   ];
   ```

2. **Use Mock Data** based on config:

   ```typescript
   // frontend/src/data/dataService.ts
   import { appConfig } from '../config/appConfig';
   import { mockSitters } from './sittersData';
   
   export const dataService = {
       searchSitters: async (params) => {
           if (appConfig.useMockData) {
               return mockSitters; // Local mock data
           }
           const response = await fetch(`${appConfig.apiBaseUrl}/api/search/sitters?${params}`);
           return response.json();
       }
   };
   ```

3. **Toggle Mock Data**:
   - Development: `REACT_APP_USE_MOCK_DATA=true` (set by AppHost)
   - Production: `REACT_APP_USE_MOCK_DATA=false` (set by AppHost)

#### Frontend Best Practices

- ✅ Use TypeScript interfaces matching backend models
- ✅ Handle loading and error states
- ✅ Keep mock data in sync with `/data/*.json` and backend seed data
- ✅ Use React hooks for state management
- ✅ Component names match file names

### Python Agent Development

#### Modifying Existing Agent (Listings Agent)

1. **Update Agent Logic** in `agent/agent.py`:

   ```python
   # agent/agent.py
   from azure.ai.agentframework import AzureAIAgentClient
   
   async def generate_agent_response(query: str):
       client = AzureAIAgentClient(
           endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
           credential=DefaultAzureCredential()
       )
       
       # Use existing agent from Azure AI Foundry
       agent = client.get_agent(agent_id=os.environ["AGENT_ID"])
       
       # Create thread with tool_resources for file search (CRITICAL per constitution)
       thread = client.create_thread(
           tool_resources={
               "file_search": {
                   "vector_store_ids": [os.environ["VECTOR_STORE_ID"]]
               }
           }
       )
       
       # Run agent
       response = client.run_agent(thread_id=thread.id, query=query)
       return response
   ```

2. **Test Locally**:

   ```bash
   cd agent
   
   # Set environment variables
   export AZURE_OPENAI_ENDPOINT="https://your-endpoint.openai.azure.com/"
   export AGENT_ID="your-agent-id"
   export VECTOR_STORE_ID="your-vector-store-id"
   
   # Run standalone
   uv run python agent.py
   
   # Interactive testing
   >> "Find me a pet sitter in Seattle"
   ```

3. **Verify in Aspire**:
   - Run `aspire run`
   - Check Aspire logs for agent startup
   - Test via frontend or direct HTTP: `POST http://localhost:8001/agent/chat`

#### Creating Function Tools (Sitter Agent Pattern)

1. **Define Tool Functions**:

   ```python
   # sitter-agent/pet_sitter_agent.py
   from typing import Annotated
   from azure.ai.agentframework import ChatAgent
   
   def query_sitter_availability(
       sitter_id: Annotated[str, "Sitter UUID"],
       start_date: Annotated[str, "Start date ISO 8601"],
       end_date: Annotated[str, "End date ISO 8601"]
   ) -> str:
       """Query sitter availability for date range"""
       # Load data/pet-sitter.json
       with open("data/pet-sitter.json") as f:
           sitters = json.load(f)
       
       # Filter logic...
       return json.dumps(results)
   
   # Create agent with tools
   agent = ChatAgent(
       name="PetSitterAgent",
       model="gpt-4.1",
       tools=[query_sitter_availability],
       instructions="You help find available pet sitters..."
   )
   ```

2. **Test Tool Invocation**:
   - Check agent logs for "run_steps" showing tool calls
   - Verify tool returns expected JSON
   - Agent should use tool output in final response

#### Agent Best Practices (from Azure AI Toolkit)

- ✅ Use `agent-framework-azure-ai --pre` (preview flag required)
- ✅ Invoke `aitk-get_agent_code_gen_best_practices` before major changes
- ✅ For file search: Include `tool_resources` in thread creation
- ✅ For function calling: Define tools with `Annotated` type hints
- ✅ Log tool invocations for debugging
- ✅ Use `DefaultAzureCredential` (requires `az login`)

### Mock Data Synchronization (CRITICAL)

**Constitution Requirement**: Mock data MUST be synchronized across three locations.

#### Workflow for New Entity

1. **Create Source of Truth** in `/data/`:

   ```json
   // data/sitters.json
   [
     {
       "id": "123e4567-e89b-12d3-a456-426614174000",
       "displayName": "Jane Doe",
       "bio": "Experienced dog walker...",
       "averageRating": 4.8,
       "totalReviews": 42
     }
   ]
   ```

2. **Mirror in Frontend** (`frontend/src/data/sittersData.ts`):

   ```typescript
   export const mockSitters: PetSitter[] = [
     {
       id: '123e4567-e89b-12d3-a456-426614174000',
       displayName: 'Jane Doe',
       bio: 'Experienced dog walker...',
       averageRating: 4.8,
       totalReviews: 42
     }
   ];
   ```

3. **Mirror in Backend** (`backend/Data/AppDbContext.cs`):

   ```csharp
   modelBuilder.Entity<PetSitter>().HasData(
       new PetSitter 
       { 
           Id = new Guid("123e4567-e89b-12d3-a456-426614174000"),
           DisplayName = "Jane Doe",
           Bio = "Experienced dog walker...",
           AverageRating = 4.8m,
           TotalReviews = 42
       }
   );
   ```

**Verification Checklist**:

- [ ] All fields match across three locations
- [ ] IDs are identical (use GUIDs)
- [ ] Data types match (decimal in C#, number in TS)
- [ ] Nullable fields handled consistently

---

## Testing

### Backend Unit Tests

```bash
# Run all backend tests
dotnet test backend/Octopets.Backend.Tests.csproj

# Run specific test
dotnet test --filter "TestName=SearchSitters_ReturnsResults"
```

### Frontend E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui
```

### Python Agent Tests

```bash
cd agent

# Run pytest
uv run pytest

# Run with coverage
uv run pytest --cov=agent
```

### Manual Testing via Aspire

1. Run `aspire run`
2. Open Aspire Dashboard (`http://localhost:15888`)
3. Navigate to service endpoint
4. Check logs in real-time
5. Use Scalar UI for API testing (`{backend_url}/scalar/v1`)

---

## Deployment

### Development Deployment

```bash
# Deploy entire application to Azure Container Apps
aspire deploy
```

This command:

1. Provisions Azure resources (Container Apps, SQL Database, Storage, Application Insights)
2. Builds and pushes container images
3. Deploys all services
4. Configures environment variables
5. Sets up service connections

### Production Considerations

- **IsPublishMode = true** triggers:
  - Mock data disabled
  - CRUD operations disabled (if configured)
  - HTTPS endpoints
  - Application Insights enabled
  - Azure SQL Database (instead of in-memory)

- **Environment Variables** (set by Aspire):
  - `FRONTEND_URL`: Frontend endpoint for CORS
  - `AZURE_OPENAI_ENDPOINT`: Azure AI Foundry endpoint
  - `AGENT_ID`: Listings agent ID
  - `VECTOR_STORE_ID`: Vector store for file search
  - Agent URLs for orchestrator communication

---

## Troubleshooting

### Azure CLI Authentication Issues

```bash
# Error: "DefaultAzureCredential failed to retrieve token"
# Solution: Re-authenticate
az login
az account show

# Verify correct subscription
az account set --subscription "your-subscription-name"
```

### Agent Not Finding Files (File Search Agent)

**Issue**: Agent doesn't use file search tool despite having vector store.

**Root Cause**: Missing `tool_resources` in thread creation (per AGENT_FRAMEWORK_FEEDBACK.md).

**Fix**:

```python
# WRONG (agent won't search files)
thread = client.create_thread()

# CORRECT (agent can search files)
thread = client.create_thread(
    tool_resources={
        "file_search": {
            "vector_store_ids": [os.environ["VECTOR_STORE_ID"]]
        }
    }
)
```

### CORS Errors from Frontend

**Issue**: Frontend can't call backend API, CORS error in browser console.

**Root Cause**: `FRONTEND_URL` environment variable mismatch.

**Fix**:

1. Check Aspire Dashboard for actual frontend URL
2. Verify `AppHost.cs` sets `FRONTEND_URL` correctly:

   ```csharp
   var backend = builder.AddProject<Projects.Octopets_Backend>("api")
       .WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
   ```

3. Restart Aspire: `aspire run`

### Mock Data Out of Sync

**Issue**: Frontend shows different data than backend.

**Root Cause**: Mock data not synchronized across `/data/`, frontend, backend.

**Fix**:

1. Choose source of truth (usually `/data/*.json`)
2. Update all three locations with identical data
3. Verify IDs match exactly
4. Restart Aspire

### Dependency Installation Errors (Python)

**Issue**: `uv sync` fails with authentication error for GitHub packages.

**Root Cause**: GitHub authentication required for some packages.

**Fix**:

```bash
# Authenticate with GitHub CLI
gh auth login

# Retry uv sync
uv sync
```

---

## Next Steps

1. **Review Research Document** (`research.md`) for architecture decisions
2. **Review Data Model** (`data-model.md`) for entity relationships
3. **Review API Contracts** (`contracts/api-spec.yaml`) for endpoint details
4. **Proceed to Phase 2**: Run `/speckit.tasks` command to generate task breakdown

---

## Constitution Compliance Quick Check

Before starting development, verify:

- [ ] Azure CLI authenticated (`az account show`)
- [ ] All services registered in `apphost/AppHost.cs`
- [ ] No hardcoded URLs or ports
- [ ] Mock data synchronized across `/data`, frontend, backend
- [ ] Python agents use `uv` (not `pip install` directly)
- [ ] All services have `/health` endpoints
- [ ] OpenTelemetry configured via Aspire

**Remember**: `aspire run` is the ONLY way to start the application. No standalone service execution.

---

**Questions?** Check:

- `.github/copilot-instructions.md` for architecture patterns
- `docs/multi-agent-orchestration.md` for agent coordination
- `AGENT_FRAMEWORK_FEEDBACK.md` for known agent issues
- Aspire Dashboard logs for runtime debugging
