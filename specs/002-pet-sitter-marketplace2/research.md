# Research Document: Pet Sitter Marketplace Platform

**Feature Branch**: `002-pet-sitter-marketplace2`  
**Date**: October 21, 2025  
**Status**: In Progress

## Research Tasks

This document captures research findings for technical decisions required by the implementation plan.

---

## 1. Production Database Selection (Azure SQL vs Cosmos DB)

**Context**: Need to determine optimal database for production deployment based on scale requirements and query patterns.

### Decision: **Azure SQL Database**

**Rationale**:
- **Query patterns favor relational**: The marketplace requires complex relational queries (search by location with filters, booking conflicts, message threads, review aggregations)
- **ACID compliance needed**: Booking system requires strong consistency to prevent double-booking
- **Entity relationships**: Strong relationships between Owners, Pets, Sitters, Bookings, Messages, Reviews
- **Scale fits SQL**: Initial scale (1,000 users, 500-1000 owners, 100-500 sitters) well within Azure SQL capacity
- **Cost efficiency**: Azure SQL serverless tier more cost-effective for initial scale than Cosmos DB provisioned throughput
- **Developer familiarity**: Team already using EF Core patterns in codebase

**Alternatives Considered**:
- **Cosmos DB**: Rejected because:
  - Higher cost at initial scale (requires provisioned RU/s)
  - Eventual consistency model problematic for booking conflicts
  - Relational query patterns don't leverage document model benefits
  - Would require significant query restructuring from current EF Core patterns
- **PostgreSQL on Azure**: Viable alternative, but:
  - Azure SQL provides better integration with Aspire deployment
  - Team already familiar with SQL Server/Azure SQL
  - Similar performance characteristics for this workload

**Implementation Notes**:
- Use Azure SQL serverless for cost optimization during low-traffic periods
- Configure auto-pause after 1 hour of inactivity
- Start with Basic tier (5 DTUs), scale to Standard as needed
- Enable automatic tuning and query performance insights
- Migration path from in-memory DB to Azure SQL via EF Core migrations (will need to create migrations for production)

---

## 2. File Storage for Photos and Documents

**Context**: Need storage solution for profile photos, pet images, and document attachments (vet records, feeding instructions).

### Decision: **Azure Blob Storage**

**Rationale**:
- **Cost-effective**: Hot tier for frequently accessed profile photos, Cool tier for archived documents
- **Scalability**: Handles growth from hundreds to thousands of users without configuration changes
- **CDN integration**: Can enable Azure CDN for faster image delivery globally
- **Security**: Built-in encryption at rest, SAS tokens for secure temporary access
- **Aspire support**: Native Azure Blob Storage resource support in Aspire

**Configuration**:
- **Container structure**:
  - `profile-photos/`: Sitter profile images (Hot tier)
  - `pet-photos/`: Pet images (Hot tier)
  - `documents/`: Vet records, care instructions (Cool tier)
  - `message-attachments/`: File attachments in messages (Hot tier, 90-day lifecycle to Cool)
- **Access**: Use Azure Managed Identity from backend API (no connection strings)
- **Limits**: 5MB per profile photo, 10MB per message attachment (per spec FR-014, FR-028)
- **Cleanup**: Lifecycle management policy to delete orphaned files after 90 days

**Alternatives Considered**:
- **Local file system**: Rejected - not scalable, no persistence in container environments
- **Database storage**: Rejected - expensive, poor performance for large files
- **Third-party services** (Cloudinary, Imgix): Rejected - adds external dependency, higher cost for initial scale

---

## 3. Best Practices for EF Core In-Memory to Azure SQL Migration

**Context**: Current development uses EF Core In-Memory database. Need migration strategy to Azure SQL for production.

### Decision: **Dual Database Provider Pattern with EF Core Migrations**

**Rationale**:
- **Seamless development**: Keep in-memory for local dev (fast, no setup)
- **Production-ready**: Use Azure SQL in production with proper schema management
- **Constitution compliant**: Maintains IsPublishMode toggle pattern

**Implementation Strategy**:

1. **AppDbContext Configuration**:
   ```csharp
   // In Program.cs
   if (builder.ExecutionContext.IsPublishMode)
   {
       builder.Services.AddDbContext<AppDbContext>(options =>
           options.UseSqlServer(builder.Configuration.GetConnectionString("OctopetsDb")));
   }
   else
   {
       builder.Services.AddDbContext<AppDbContext>(options =>
           options.UseInMemoryDatabase("OctopetsDb"));
   }
   ```

2. **Migration Strategy**:
   - Create initial migration: `dotnet ef migrations add InitialCreate`
   - Migrations only apply in production (check IsPublishMode in startup)
   - Seed data runs in both modes (in-memory for dev, SQL for production first run)

3. **Connection String Management**:
   - Development: No connection string needed (in-memory)
   - Production: Aspire injects connection string via Azure SQL resource
   - Use managed identity for authentication (no passwords)

4. **Schema Differences**:
   - In-memory: No foreign key constraints enforced
   - SQL: Add proper indexes, constraints, relationships in migrations
   - Test with SQL LocalDB before production to catch schema issues

**Best Practices from Azure MCP**:
- ✅ Use Managed Identity for authentication (no connection strings)
- ✅ Enable encryption at rest and in transit
- ✅ Implement retry logic with exponential backoff for transient failures
- ✅ Use parameterized queries (EF Core does this automatically)
- ✅ Enable query performance monitoring via Application Insights
- ✅ Configure connection pooling (default in EF Core)

---

## 4. Message Content Moderation Service

**Context**: Per FR-036, need automatic content filtering for reviews (profanity, hate speech, policy violations).

### Decision: **Azure AI Content Safety**

**Rationale**:
- **Microsoft-native**: Seamless integration with Azure infrastructure
- **Multi-category detection**: Hate speech, self-harm, sexual content, violence
- **Configurable severity**: Can set thresholds per category (block high/medium, flag low)
- **Fast response**: <100ms typical latency, suitable for real-time moderation
- **Language support**: Supports English and other languages for global expansion
- **Cost-effective**: Pay-per-call, free tier available (5,000 calls/month)

**Implementation Approach**:
```csharp
// In ReviewEndpoints.cs or MessageEndpoints.cs
var moderationResult = await contentSafetyClient.AnalyzeTextAsync(reviewText);

if (moderationResult.HateSpeechAnalysis.Severity >= Severity.Medium ||
    moderationResult.ViolenceAnalysis.Severity >= Severity.Medium)
{
    return Results.BadRequest(new { error = "Content violates community guidelines" });
}
```

**Configuration**:
- **Threshold settings**:
  - Hate speech: Block High/Medium, Flag Low for manual review
  - Violence: Block High/Medium
  - Self-harm: Block High/Medium
  - Sexual: Block High (Medium allowed for pet health discussions)
- **Workflow**:
  1. User submits review/message
  2. Backend calls Content Safety API
  3. If blocked: Return error to user
  4. If flagged: Store for manual moderation, show to recipient
  5. If clean: Store and display immediately

**Alternatives Considered**:
- **Custom keyword filtering**: Rejected - too simplistic, easy to bypass, high false positive rate
- **Third-party services** (Perspective API, Sift): Rejected - external dependency, less Azure integration
- **Manual moderation only**: Rejected - not scalable, doesn't meet FR-036 automatic filtering requirement

---

## 5. Real-Time Messaging Delivery (< 1 minute requirement per FR-029)

**Context**: Messages between owners and sitters need notification within 1 minute (SC-009).

### Decision: **Polling + Azure SignalR Service (progressive enhancement)**

**Rationale**:
- **Phase 1 (MVP)**: HTTP polling every 30 seconds meets 1-minute requirement
- **Phase 2 (Enhancement)**: Azure SignalR for real-time push notifications
- **Progressive enhancement**: Start simple, add real-time as traffic grows

**Phase 1 Implementation (Polling)**:
```typescript
// frontend/src/services/messageService.ts
setInterval(async () => {
  const unreadMessages = await fetchUnreadMessages();
  if (unreadMessages.length > 0) {
    showNotification(`${unreadMessages.length} new message(s)`);
  }
}, 30000); // Poll every 30 seconds
```

**Phase 2 Implementation (SignalR)**:
- Backend: Add SignalR Hub in ASP.NET Core
- Frontend: Use @microsoft/signalr client
- Connection management: Automatic reconnection, fallback to polling
- Aspire integration: Register SignalR service in AppHost

**Cost Considerations**:
- **Polling**: Free, uses existing API endpoints, more HTTP requests
- **SignalR**: ~$50/month for Free tier (20 concurrent connections), scales with usage
- **Recommendation**: Start with polling for MVP, add SignalR when >100 concurrent users

**Alternatives Considered**:
- **WebSockets only**: Rejected - requires SignalR or custom implementation, overkill for MVP
- **Webhooks**: Rejected - requires public endpoints, complex for browser clients
- **Third-party** (Pusher, PubNub): Rejected - external dependency, higher cost

---

## 6. AI Agent Tool Configuration in Azure AI Foundry

**Context**: Agents need proper tool configuration in Azure AI Foundry to avoid issues documented in AGENT_FRAMEWORK_FEEDBACK.md.

### Decision: **Configure Tools in Azure AI Foundry + Code for New Agents**

**Rationale** (from AGENT_FRAMEWORK_FEEDBACK.md lessons learned):
- **File search agents**: Must attach vector store to thread via `tool_resources`
- **Function calling agents**: Can define tools in code (no Azure AI Foundry config needed)
- **Existing agents**: Use Azure AI Foundry agent_id, don't override in code

**Agent-Specific Plans**:

**Listings Agent** (agent/):
- **Type**: File search agent using Azure AI Foundry existing agent
- **Configuration**: Verify vector store has sitter listing data
- **Code pattern**: Pass `agent_id` to `AzureAIAgentClient`, include `tool_resources` in thread creation
- **Data source**: Upload `/data/sitters.json` to vector store for file search

**Sitter Agent** (sitter-agent/):
- **Type**: Function calling agent with local JSON data
- **Configuration**: Define tools in code (no Azure AI Foundry setup needed)
- **Code pattern**: Create `ChatAgent` with `tools=[query_sitter_function]`
- **Data source**: Read `/data/pet-sitter.json` at runtime

**Orchestrator Agent** (orchestrator-agent/):
- **Type**: Function calling agent coordinating other agents
- **Configuration**: Define tools in code for agent delegation
- **Code pattern**: Tools = `[query_listings_agent, query_sitter_agent]`
- **Communication**: Use `httpx.AsyncClient` to call other agent endpoints

**Best Practices from Azure AI Toolkit**:
- ✅ Use `agent-framework-azure-ai --pre` (preview flag required)
- ✅ Invoke `aitk-get_agent_code_gen_best_practices` before code generation
- ✅ Search microsoft/agent-framework GitHub repo for MCP integration examples
- ✅ Implement proper error handling with retry logic
- ✅ Log tool invocations for debugging (see run_steps in agent responses)

---

## 7. Location-Based Search Implementation

**Context**: Per FR-001, need to search sitters by location (zip code, city, address + radius).

### Decision: **Geocoding + Distance Calculation in Backend**

**Rationale**:
- **Azure Maps**: Use Azure Maps Geocoding API to convert addresses/zip codes to coordinates
- **Database queries**: Calculate distance in SQL using geography types
- **Caching**: Cache geocoded results to reduce API calls

**Implementation Strategy**:

1. **Sitter Profile Storage**:
   ```csharp
   public class PetSitter
   {
       public string Address { get; set; }
       public string ZipCode { get; set; }
       public double Latitude { get; set; }
       public double Longitude { get; set; }
   }
   ```

2. **Search Flow**:
   ```
   User enters location → Geocode to lat/lng → Query database with distance filter → Return sorted results
   ```

3. **Distance Calculation** (Haversine formula):
   ```csharp
   // In SQL query or LINQ
   var distance = Math.Acos(
       Math.Sin(lat1) * Math.Sin(lat2) + 
       Math.Cos(lat1) * Math.Cos(lat2) * Math.Cos(lng2 - lng1)
   ) * 6371; // Earth's radius in km
   ```

4. **Azure Maps Integration**:
   - Use Azure Maps Search API for geocoding
   - Cache results in distributed cache (Azure Redis) for 24 hours
   - Fallback to basic zip code prefix matching if API unavailable

**Performance Optimization**:
- **Index**: Add spatial index on (Latitude, Longitude) columns in Azure SQL
- **Pre-filter**: Query only sitters within bounding box before calculating exact distance
- **Pagination**: Limit results to 50 per page (per SC-006, show 5-10 sitters)

**Alternatives Considered**:
- **Google Maps API**: Rejected - higher cost, less Azure integration
- **PostGIS (PostgreSQL)**: Rejected - requires PostgreSQL instead of Azure SQL
- **Client-side calculation**: Rejected - exposes all sitter locations, poor performance

---

## Summary of Research Findings

All NEEDS CLARIFICATION items from Technical Context have been resolved:

1. ✅ **Production Storage**: Azure SQL Database (relational queries, ACID, cost-effective)
2. ✅ **File Storage**: Azure Blob Storage (scalable, secure, Aspire-native)
3. ✅ **Database Migration**: Dual provider pattern with EF Core migrations
4. ✅ **Content Moderation**: Azure AI Content Safety (multi-category, configurable)
5. ✅ **Real-Time Messaging**: Polling (MVP) → SignalR (enhancement)
6. ✅ **AI Agent Tools**: Azure AI Foundry for file search, code for function calling
7. ✅ **Location Search**: Azure Maps + SQL geography + spatial indexing

**Next Phase**: Proceed to Phase 1 (Design & Contracts) - data models, API contracts, quickstart guide.

**Constitution Re-Check**: All decisions maintain alignment with constitution principles:
- Aspire-first orchestration ✅
- Service discovery for all integrations ✅
- Azure-native services with Managed Identity ✅
- Mock data synchronization approach preserved ✅
- Multi-agent architecture enhanced (not violated) ✅
