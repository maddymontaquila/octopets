# Implementation Plan: Pet Sitter Marketplace Platform

**Branch**: `002-pet-sitter-marketplace2` | **Date**: October 21, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pet-sitter-marketplace2/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a two-sided marketplace platform connecting pet owners with pet sitters through search, booking, and communication capabilities. The platform leverages .NET Aspire orchestration for backend/frontend services, with AI agents providing intelligent search and recommendation features using Microsoft Agent Framework integrated with Azure AI Foundry.

## Technical Context

**Language/Version**: 
- Backend: C# / .NET 9.0
- Frontend: TypeScript / React 18+
- AI Agents: Python 3.11+ with Microsoft Agent Framework (preview)

**Primary Dependencies**: 
- Backend: ASP.NET Core 9.0, Entity Framework Core (In-Memory), Aspire 13.0-preview+
- Frontend: React 18, React Router v6, TypeScript, npm/Node.js
- AI Agents: agent-framework-azure-ai (preview), FastAPI, uv (package manager), httpx (async HTTP)

**Storage**: 
- Development: EF Core In-Memory database (no persistence)
- Production: Azure SQL Database or Cosmos DB (NEEDS CLARIFICATION - determine based on scale requirements)
- File Storage: Azure Blob Storage for profile photos, pet images, document attachments

**Testing**: 
- Backend: xUnit, Integration tests
- Frontend: Playwright (E2E), Jest/React Testing Library (unit)
- AI Agents: pytest, mock AI responses

**Target Platform**: 
- Development: macOS/Windows/Linux via .NET Aspire
- Production: Azure Container Apps (ACA) via Aspire deployment

**Project Type**: Web application (distributed) - Frontend SPA + Backend API + AI Agents

**Performance Goals**: 
- Search results: <2 seconds load time
- Booking submission: <5 minutes end-to-end
- Profile creation: <15 minutes completion time
- Message delivery: <1 minute with notification
- Concurrent users: 1,000+ without degradation

**Constraints**: 
- Aspire-first orchestration (all services through AppHost)
- Mock data synchronization required (frontend/backend/data parity)
- Azure AI Foundry authentication via DefaultAzureCredential
- No hardcoded URLs/ports (service discovery only)
- Python agents must use `uv` for dependency management

**Scale/Scope**: 
- Initial: 1,000 users, ~100-500 sitters, ~500-1000 owners
- 6 user stories (P1-P3 priority)
- 3 specialized AI agents (listings, sitter, orchestrator)
- ~40+ functional requirements across search, booking, profiles, messaging, reviews

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Azure Development Prerequisites ✅
- [x] Azure CLI installed and up-to-date (`az --version`: 2.77.0)
- [x] User authenticated via `az login` (subscription: shboyer subscription)
- [x] Azure MCP best practices invoked for code generation
- [x] Azure AI Toolkit MCP tools invoked for agent development
- [x] Azure AI model guidance obtained for multi-agent system

### Aspire-First Orchestration ✅
- [x] All services will be registered in AppHost.cs
- [x] Service discovery via GetEndpoint() for all inter-service communication
- [x] No standalone service execution planned
- [x] Health checks and observability configured via Aspire

### Multi-Agent Architecture ✅
- [x] Specialized agents planned: listings agent, sitter agent, orchestrator agent
- [x] Microsoft Agent Framework with Azure AI Foundry integration
- [x] FastAPI HTTP endpoints following `/agent/chat` convention
- [x] `uv` for dependency management (no direct pip install)
- [x] DefaultAzureCredential for authentication
- [x] Orchestrator pattern for complex queries

### Mock Data Synchronization ⚠️
- [ ] REQUIRES: Ensure `/data/listing.json`, `frontend/src/data/listingsData.ts`, `backend/Data/AppDbContext.cs` remain synchronized
- [ ] REQUIRES: New entities (Pet, PetSitter, Booking, Message, Review) need mock data in all three locations
- [ ] TOGGLE: `REACT_APP_USE_MOCK_DATA` controlled by AppHost (dev=true, prod=false)

### Service Discovery & Dynamic Configuration ✅
- [x] No hardcoded URLs/ports planned
- [x] Use Aspire service discovery for all endpoints
- [x] Environment variables for agent URLs, FRONTEND_URL
- [x] `IsPublishMode` flag for dev/prod behavior

### Environment-Aware Behavior ✅
- [x] Development mode: Mock data enabled, CRUD enabled, Swagger exposed
- [x] Production mode: Mock data disabled, CRUD disabled, Application Insights enabled
- [x] Single IsPublishMode flag for environment control

### Observability & Telemetry ✅
- [x] OpenTelemetry via `.WithOtlpExporter()` on all services
- [x] Structured logging in backend (app.Logger)
- [x] Python agents use standard logging module
- [x] Health check endpoints at `/health` for all services
- [x] Aspire Dashboard for development monitoring
- [x] Application Insights for production

### Independent User Story Delivery ✅
- [x] User stories prioritized (P1, P2, P3)
- [x] P1 stories are independently testable and viable as MVP:
  - Pet Owner Search & Discovery
  - Pet Sitter Profile Management
  - Pet Owner Account & Pet Profiles
- [x] No cross-story blocking dependencies identified
- [x] Implementation phases: Setup → Foundational → User Stories → Polish

### Technology Stack Standards ✅
- [x] .NET Aspire 13.0-preview+ for orchestration
- [x] ASP.NET Core 9.0+ with Minimal APIs
- [x] React 18+ with TypeScript and React Router v6
- [x] Python 3.8+ with Microsoft Agent Framework (preview)
- [x] uv for Python package management
- [x] FastAPI for Python API framework
- [x] EF Core In-Memory for backend data
- [x] Docker for containerization
- [x] Azure Application Insights for monitoring

### Prohibited Patterns - Verification ✅
- [x] No direct `pip install` (using uv sync)
- [x] No hardcoded URLs/ports (using Aspire service discovery)
- [x] Mock data will be synchronized across locations
- [x] Agent tools will be configured in Azure AI Foundry
- [x] Thread creation will include `tool_resources` when using file search

**GATE STATUS: ⚠️ CONDITIONAL PASS**

**BLOCKERS**:
- Mock data synchronization requires expansion for new entities (Pet, PetSitter, Booking, Message, Review)
- Production storage decision needed (Azure SQL vs Cosmos DB)

**ACTION REQUIRED BEFORE PHASE 0**:
1. Clarify production database choice based on scale/query patterns
2. Define mock data structure for new entities to maintain synchronization

**RE-CHECK REQUIRED AFTER PHASE 1**: Verify all design artifacts maintain constitution compliance

## Project Structure

### Documentation (this feature)

```text
specs/002-pet-sitter-marketplace2/
├── spec.md              # Feature specification (COMPLETED)
├── plan.md              # This file (/speckit.plan command output - IN PROGRESS)
├── research.md          # Phase 0 output (/speckit.plan command - TODO)
├── data-model.md        # Phase 1 output (/speckit.plan command - TODO)
├── quickstart.md        # Phase 1 output (/speckit.plan command - TODO)
├── contracts/           # Phase 1 output (/speckit.plan command - TODO)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
octopets/
├── apphost/                    # .NET Aspire orchestrator (MODIFY)
│   ├── AppHost.cs             # Service registration and configuration
│   ├── appsettings.json
│   └── Octopets.AppHost.csproj
│
├── backend/                    # ASP.NET Core API (EXPAND)
│   ├── Program.cs             # API startup, middleware, endpoint mapping
│   ├── Data/
│   │   ├── AppDbContext.cs    # EF Core context + seed data (ADD new entities)
│   │   └── DataInitializer.cs
│   ├── Endpoints/             # Minimal API endpoints (ADD new endpoint files)
│   │   ├── ListingEndpoints.cs        # Existing
│   │   ├── ReviewEndpoints.cs         # Existing
│   │   ├── PetSitterEndpoints.cs      # NEW - sitter profiles
│   │   ├── PetOwnerEndpoints.cs       # NEW - owner accounts
│   │   ├── PetProfileEndpoints.cs     # NEW - pet profiles
│   │   ├── BookingEndpoints.cs        # NEW - booking management
│   │   └── MessageEndpoints.cs        # NEW - messaging
│   ├── Models/                # Entity models (ADD new model files)
│   │   ├── Listing.cs                 # Existing
│   │   ├── Review.cs                  # Existing
│   │   ├── PetSitter.cs               # NEW
│   │   ├── PetOwner.cs                # NEW
│   │   ├── PetProfile.cs              # NEW
│   │   ├── Booking.cs                 # NEW
│   │   └── Message.cs                 # NEW
│   ├── Repositories/          # Repository pattern (ADD new repositories)
│   │   ├── Interfaces/
│   │   └── [Entity]Repository.cs
│   └── Octopets.Backend.csproj
│
├── frontend/                   # React SPA (EXPAND)
│   ├── src/
│   │   ├── pages/             # Route components (ADD new pages)
│   │   │   ├── SearchPage.tsx         # NEW - sitter search
│   │   │   ├── SitterProfilePage.tsx  # NEW - view sitter details
│   │   │   ├── BookingPage.tsx        # NEW - booking flow
│   │   │   ├── MessagePage.tsx        # NEW - messaging
│   │   │   ├── PetOwnerDashboard.tsx  # NEW - owner dashboard
│   │   │   └── PetSitterDashboard.tsx # NEW - sitter dashboard
│   │   ├── components/        # Shared components (ADD new components)
│   │   │   ├── SearchFilters.tsx      # NEW
│   │   │   ├── SitterCard.tsx         # NEW
│   │   │   ├── BookingCalendar.tsx    # NEW
│   │   │   ├── PetProfileForm.tsx     # NEW
│   │   │   └── MessageThread.tsx      # NEW
│   │   ├── data/              # Services and mock data (EXPAND)
│   │   │   ├── agentService.ts        # Existing - may need updates
│   │   │   ├── dataService.ts         # Existing API client
│   │   │   ├── listingsData.ts        # Existing mock data
│   │   │   ├── sittersData.ts         # NEW mock data
│   │   │   ├── petsData.ts            # NEW mock data
│   │   │   ├── bookingsData.ts        # NEW mock data
│   │   │   └── messagesData.ts        # NEW mock data
│   │   └── config/
│   │       └── appConfig.ts           # Existing - mock data toggle
│   └── package.json
│
├── agent/                      # Listings agent (MODIFY - enhance for sitter listings)
│   ├── agent.py               # Existing - Azure AI Foundry file search
│   ├── app.py                 # Existing FastAPI server
│   ├── pyproject.toml
│   └── README.md
│
├── sitter-agent/               # Sitter agent (MODIFY - enhance for sitter recommendations)
│   ├── pet_sitter_agent.py    # Existing - function tools
│   ├── app.py                 # Existing FastAPI server
│   ├── data/
│   │   └── pet-sitter.json    # Existing - may need schema updates
│   ├── pyproject.toml
│   └── README.md
│
├── orchestrator-agent/         # Orchestrator agent (MODIFY - coordinate marketplace queries)
│   ├── orchestrator.py        # Existing - multi-agent coordination
│   ├── app.py                 # Existing FastAPI server
│   ├── pyproject.toml
│   └── README.md
│
├── data/                       # Shared mock data (EXPAND)
│   ├── listing.json           # Existing - source of truth for listings
│   ├── sitters.json           # NEW - pet sitter profiles
│   ├── pets.json              # NEW - pet profiles
│   ├── bookings.json          # NEW - booking records
│   └── messages.json          # NEW - message threads
│
├── servicedefaults/            # Shared .NET config (NO CHANGES)
│   └── Extensions.cs
│
└── docs/                       # Documentation (ADD new docs)
    ├── multi-agent-orchestration.md  # Existing
    └── marketplace-workflows.md      # NEW - booking/messaging flows
```

**Structure Decision**: Web application (Option 2) with distributed architecture. The Octopets project already follows this pattern with separate `backend/`, `frontend/`, and multiple agent services. This feature expands existing endpoints, models, and agents to support the full marketplace functionality. Mock data files in `/data` serve as the source of truth, synchronized to frontend and backend.

## Complexity Tracking

**No violations detected** - all patterns align with constitution requirements. This feature:

- Uses existing Aspire orchestration (no new complexity)
- Follows established backend/frontend/agent structure
- Maintains mock data synchronization as required
- Uses service discovery consistently
- Follows prescribed technology stack

**No simpler alternatives required** - the architecture is already optimized for the marketplace use case.

