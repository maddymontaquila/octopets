<!--
Sync Impact Report:
- Version change: v1.1.0 → v1.2.0
- Modified principles: Frontend Development Standards (added shadcn/ui requirement)
- Added sections: N/A
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md (Constitution Check section ready)
  ✅ spec-template.md (requirements alignment maintained)
  ✅ tasks-template.md (TDD and structure principles align)
- Follow-up TODOs: Update existing frontend to use shadcn/ui components
-->

# Octopets Constitution

## Core Principles

### I. Aspire-First Architecture (NON-NEGOTIABLE)

All services MUST be orchestrated through .NET Aspire AppHost with proper service discovery, health checks, and telemetry integration. Every service MUST use ServiceDefaults for consistent observability and resilience patterns. Cross-service communication MUST use Aspire's service discovery mechanism, never hardcoded URLs. Environment-aware configuration MUST distinguish between development and production modes through `builder.ExecutionContext.IsPublishMode`.

### II. Repository Pattern with Async Throughout

All data access MUST use the repository pattern with clear interfaces in `Repositories/Interfaces/`. Every repository operation MUST be asynchronous using `async/await` with proper `Task<T>` return types. Entity Framework Core with in-memory database MUST be used for development, with configurable providers for production. Data models MUST be consistent between frontend TypeScript types and backend C# models.

### III. Environment-Driven Mock Data System

Frontend and backend MUST support synchronized mock data modes controlled by environment variables. Frontend MUST use `DataService` abstraction in `/frontend/src/data/dataService.ts` that switches between mock and API data based on `REACT_APP_USE_MOCK_DATA`. Backend MUST seed consistent mock data in development mode. AppHost MUST automatically configure mock data settings based on execution context.

### IV. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory: Tests MUST be written first, MUST fail initially, then implementation MUST make them pass. Contract tests MUST be created for all API endpoints using OpenAPI specifications. Integration tests MUST validate cross-service communication. Frontend components MUST have accompanying tests. The Red-Green-Refactor cycle is strictly enforced.

### V. Minimal API with OpenAPI Documentation

Backend APIs MUST use ASP.NET Core Minimal APIs with `MapGroup` pattern for endpoint organization. Every endpoint MUST include OpenAPI documentation with `WithOpenApi()` and proper descriptions. CRUD operations MUST be controlled by `ENABLE_CRUD` environment variable. Error simulation for testing MUST be controlled by `ERRORS` environment variable. Scalar UI MUST be available in development for API exploration.

## Service Architecture Standards

### Cross-Service Communication Patterns

All services MUST communicate through Aspire service discovery using `WithReference()` and `WaitFor()` for proper dependency ordering. CORS MUST be configured dynamically based on `FRONTEND_URL` environment variable supporting comma-separated origins. Agent services MUST expose health check endpoints showing Azure AI connection status. Service URLs MUST never be hardcoded in configuration or code.

### Frontend Development Standards

React applications MUST use TypeScript with functional components and hooks following 2025 best practices. Routing MUST use React Router v6+ with proper component organization in `pages/`, `components/`, and `data/` directories. Design and layout MUST use shadcn/ui components for consistent styling and user interface patterns. Custom CSS files in `styles/` directory are permitted for application-specific styling that extends shadcn/ui, but CSS modules are NOT allowed. Configuration MUST be centralized in `/frontend/src/config/appConfig.ts` with environment variable support.

### Python Agent Integration

Python services MUST use `uv` for dependency management, never `pip`. Agent-framework dependencies MUST source from Microsoft's GitHub repository main branch. FastAPI services MUST include OpenTelemetry instrumentation for Aspire dashboard integration. ChatAgent MUST be initialized once in startup events with global instance sharing across requests. Azure AI integration MUST use DefaultAzureCredential with graceful fallback when unavailable.

## Agent Development Standards

### Agent Initialization and Lifecycle

All AI agents MUST follow the initialization pattern: AIProjectClient creation with DefaultAzureCredential, followed by ChatAgent creation with FoundryChatClient. Agent initialization MUST occur in FastAPI startup events using `@app.on_event("startup")` decorator. Global agent instances MUST be shared across requests with proper null checking. Agent instructions MUST be set once at ChatAgent creation, never modified per-request.

### Agent Error Handling and Resilience

Agent services MUST implement graceful fallback when Azure AI is unavailable, returning standardized error messages like "Agent not connected" rather than throwing exceptions. Agent initialization failures MUST NOT prevent service startup - services MUST continue to run with degraded functionality. All agent operations MUST include try-catch blocks with appropriate logging at ERROR level for failures.

### Agent API Standards

Agent endpoints MUST use standardized Pydantic models: `ChatMessage` (id, content, sender, timestamp), `ChatRequest` (message, optional context), and `ChatResponse` (message, optional suggestions). The main chat endpoint MUST be `/agent/chat` with POST method and `ChatResponse` return model. Agent response extraction MUST use `result.text` from AgentRunResponse objects. All agent endpoints MUST include proper OpenAPI documentation and type hints.

### Agent Health and Monitoring

Agent services MUST expose detailed health information at root endpoint including: Azure AI connection status ("connected"/"disconnected"), agent initialization status ("initialized"/"not initialized"), and agent ID when available. Health checks MUST be non-blocking and return structured JSON responses. Agent services MUST log initialization success/failure with appropriate detail levels.

### Agent Domain Instructions

Agent instructions MUST be domain-specific and defined at service initialization. For Octopets, agents MUST focus on pet-friendly venue assistance, pet care advice, and venue recommendations. Instructions MUST be comprehensive enough to guide agent behavior without requiring per-request context. Future agents MUST follow similar domain-specific instruction patterns rather than generic responses.

## Development Workflow Requirements

### Startup and Orchestration

Applications MUST be started using `aspire run` command, never individual service startup commands. All services MUST be defined in AppHost with proper resource configuration, environment variables, and dependency relationships. Aspire dashboard MUST provide unified access to all service logs, metrics, and endpoints. Health checks MUST be implemented for all services with meaningful status reporting.

### Configuration Management

Environment variables MUST control feature toggles including mock data, CRUD operations, and error simulation. Sensitive configuration MUST be externalized using parameters in production deployments. Service communication endpoints MUST be passed via environment variables using Aspire's service discovery. All configuration MUST be validated at startup with clear error messages for missing required values.

### Observability and Monitoring

All services MUST implement structured logging with appropriate log levels. OpenTelemetry MUST be configured for distributed tracing with OTLP export to Aspire dashboard. Application Insights MUST be configured for production deployments only. Health check endpoints MUST return structured status information including dependency states.

## Quality and Testing Standards

### Testing Strategy Requirements

Unit tests MUST cover business logic with high coverage thresholds. Integration tests MUST validate service contracts and cross-service communication scenarios. End-to-end tests MUST validate complete user workflows using Playwright for frontend testing. Performance tests MUST validate response time and memory usage requirements. Mock data consistency MUST be validated between frontend and backend implementations.

### Code Quality Standards

All code MUST pass linting and formatting checks configured per language (ESLint for TypeScript, EditorConfig for C#, Black/Flake8 for Python). TypeScript MUST be used with strict mode enabled and proper type definitions. C# code MUST follow async/await patterns throughout with proper exception handling. Python code MUST use type hints and follow PEP standards.

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests and code reviews MUST verify compliance with these principles before approval. Any complexity or architectural deviations MUST be explicitly justified with documented rationale for why simpler alternatives were insufficient. Constitution amendments require documentation of changes, approval process, and migration plan for existing code.

All development decisions MUST align with the Aspire-first, test-driven, and environment-aware principles. When in doubt, favor simplicity and explicit configuration over implicit behavior. Use `.github/copilot-instructions.md` for runtime development guidance and agent-specific patterns.

**Version**: 1.2.0 | **Ratified**: 2025-09-25 | **Last Amended**: 2025-09-25
