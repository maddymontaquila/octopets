```instructions
<rules>
    <project-overview>
    Octopets is a distributed application for discovering and sharing pet-friendly venues, consisting of these main projects:

    1. Frontend (React + TypeScript):
       - Located in /frontend
       - Single-page application using React Router v6
       - Features: venue browsing, filtering, reviews, and listing management
       - Components organized into pages/, components/, and data/ directories
       - Styled with custom CSS in styles/, NOT CSS modules
       - Mock/API data switching via REACT_APP_USE_MOCK_DATA

    2. Backend (ASP.NET Core 9.0):
       - Located in /backend
       - Minimal API architecture with Entity Framework Core
       - Uses in-memory database for development
       - Repository pattern with interfaces in Repositories/Interfaces/
       - Endpoints grouped by feature in /backend/Endpoints/
       - OpenAPI/Scalar UI available in development

    3. Agent Service (Python FastAPI):
       - Located in /agent
       - FastAPI server with Azure AI integration
       - Uses agent-framework from Microsoft for chat functionality
       - Configured via uv/pyproject.toml
       - Provides AI chat endpoints for frontend

    4. AppHost (.NET Aspire):
       - Located in /apphost
       - Orchestrates all services: backend API, frontend, and agent
       - Environment-aware configuration (dev vs production modes)
       - Service discovery and cross-service communication
       - Provides monitoring dashboard

    5. ServiceDefaults:
       - Located in /servicedefaults
       - Shared configuration and defaults for .NET services
       - Includes health checks, telemetry, and resilience patterns
    </project-overview>

    <development-workflow>
    Critical development workflows and commands:

    1. Starting the Application:
       - ALWAYS use `aspire run`
       - This starts all services with proper service discovery and configuration
       - Aspire dashboard provides access to all service logs and endpoints

    2. Mock Data System (Key Pattern):
       - Environment variable REACT_APP_USE_MOCK_DATA controls data source
       - Frontend: DataService in /frontend/src/data/dataService.ts switches between mock/API
       - Backend: Always uses in-memory database with seeded mock data in development
       - AppHost automatically configures mock data mode based on IsPublishMode

    3. API Development:
       - Endpoints in /backend/Endpoints/ follow MapGroup pattern
       - CRUD operations controlled by ENABLE_CRUD environment variable
       - Error simulation controlled by ERRORS environment variable
       - Repository pattern with async/await throughout
       - All endpoints include OpenAPI documentation

    4. Frontend Architecture:
       - Configuration via /frontend/src/config/appConfig.ts
       - Data layer abstraction in /frontend/src/data/dataService.ts
       - TypeScript types in /frontend/src/types/
       - Pages use DataService, never direct fetch calls

    5. Cross-Service Communication:
       - Frontend gets backend URL via service discovery (not hardcoded)
       - Agent service URL passed via REACT_APP_AGENT_API_URL
       - CORS configured dynamically based on FRONTEND_URL environment variable

    6. Python Agent Development:
       - Use `uv` for dependency management (not pip)
       - Agent dependencies from Microsoft agent-framework GitHub repo
       - Requires Azure AI Foundry endpoint and agent ID configuration
       - FastAPI with OpenTelemetry integration
       
       Agent-Framework Specific Patterns:
       - ChatAgent initialized with FoundryChatClient in startup event
       - AIProjectClient uses DefaultAzureCredential for authentication
       - ChatAgent.run() handles conversation state internally (no manual session management)
       - Agent instructions defined at initialization, not per-request
       - Response extraction via result.text from AgentRunResponse object
       - Global agent instance shared across requests (stateless from API perspective)
    </development-workflow>

    <key-patterns>
    1. Environment-Driven Configuration:
       - AppHost.cs uses builder.ExecutionContext.IsPublishMode for environment detection
       - Different behavior for development vs production (mock data, CRUD, errors)
       - All cross-service URLs configured via environment variables, not hardcoded

    2. Aspire Service Orchestration:
       - Services defined with AddProject, AddNpmApp, AddUvApp
       - Use WithReference() for service dependencies
       - WaitFor() ensures proper startup order
       - Environment variables passed via WithEnvironment()

    3. Repository Pattern Implementation:
       - All repositories inherit from interfaces in Repositories/Interfaces/
       - Async operations throughout (GetAllAsync, GetByIdAsync, etc.)
       - Entity Framework Core with in-memory database for development
    </key-patterns>

    <agent-framework-integration>
    Critical agent-framework patterns specific to this implementation:

    1. Initialization Sequence:
       - AIProjectClient created with DefaultAzureCredential() and AZURE_AI_ENDPOINT
       - ChatAgent created with FoundryChatClient(client=ai_client, agent_id=AGENT_ID)
       - Instructions set once at ChatAgent creation, not per-request
       - All initialization happens in FastAPI startup event, not per-request

    2. Request Handling Pattern:
       - Single global chat_agent instance shared across all requests
       - No manual conversation/session management - ChatAgent handles state internally  
       - Direct call: `result = await chat_agent.run(user_message)`
       - Response extraction: `response_content = result.text`
       - Framework manages conversation context automatically

    3. Environment Configuration:
       - AZURE_AI_ENDPOINT: Full AI Foundry project endpoint URL
       - AGENT_ID: Specific agent identifier from AI Foundry
       - FRONTEND_URL: For CORS configuration (can be comma-separated list)
       - OTEL_EXPORTER_OTLP_ENDPOINT: OpenTelemetry endpoint for Aspire integration

    4. Error Handling Strategy:
       - Graceful fallback when ChatAgent unavailable ("Agent not connected")
       - Startup continues even if Azure AI initialization fails
       - Health check endpoint shows Azure AI and agent status separately
       
    5. Dependencies (pyproject.toml):
       - agent-framework sources from GitHub main branch subdirectories
       - Requires azure-ai-projects and azure-identity for Foundry integration
       - OpenTelemetry instrumentation for Aspire dashboard integration

    <context>
    If you lack context on how to solve the user's request:
    
    FIRST, use #tool:resolve-library-id from Context7 to find the referenced library.

    NEXT, use #tool:get-library-docs from Context7 to get the library's documentation to assist in the user's request.
    </context>
</rules>
```