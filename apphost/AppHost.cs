#:package CommunityToolkit.Aspire.Hosting.Python.Extensions@9.8.0-beta.394
#:package Aspire.Hosting.NodeJs@9.6.0-preview.1.25473.9
#:package Aspire.Hosting.Azure.ApplicationInsights@9.6.0-preview.1.25473.9
#:package Aspire.Hosting.Azure.AIFoundry@9.6.0-preview.1.25474.8
#:project ../backend/Octopets.Backend.csproj
#:sdk Aspire.AppHost.Sdk@9.6.0-preview.1.25473.9
#pragma warning disable

var builder = DistributedApplication.CreateBuilder(args);

var foundryProject = builder.AddParameter("FoundryProjectUrl");
var foundryAgentId = builder.AddParameter("FoundryAgentId");

// var foundryResource = builder.AddParameter("FoundryResource", value: "octopets-foundry");
// var foundryRG = builder.AddParameter("FoundryRG", value: "rg-octopets-demo");

// var foundry = builder.AddAzureAIFoundry("foundry-agent")
//     .AsExisting(foundryResource, foundryRG)
//     .WithIconName("Sparkle");

// foundryResource.WithParentRelationship(foundry);
// foundryRG.WithParentRelationship(foundry);

var api = builder.AddProject<Projects.Octopets_Backend>("api")
    .WithEnvironment("ERRORS", builder.ExecutionContext.IsPublishMode ? "true" : "false")
    .WithEnvironment("ENABLE_CRUD", builder.ExecutionContext.IsPublishMode ? "false" : "true");

var agent = builder.AddUvApp("python-agent-chat", "../agent", "agent.py")
    .WithHttpEndpoint(env: "PORT")
    .WithEnvironment("AZURE_AI_ENDPOINT", foundryProject)
    .WithEnvironment("AGENT_ID", foundryAgentId)
//    .WithReference(foundry)
    .WithIconName("ChatEmpty")
    .WithOtlpExporter();

var frontend = builder.AddNpmApp("frontend", "../frontend")
    .WithReference(api).WaitFor(api)
    .WithReference(agent).WaitFor(agent)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithEnvironment("BROWSER", "none")
    .WithUrlForEndpoint("http", c => c.DisplayText="Frontend")
    .WithEnvironment("REACT_APP_USE_MOCK_DATA", builder.ExecutionContext.IsPublishMode ? "false" : "true")
    .WithEnvironment("REACT_APP_AGENT_API_URL", agent.GetEndpoint("http"));

// Configure CORS for agent service with frontend URL
agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

// Only add Application Insights in non-development environments
if (builder.ExecutionContext.IsPublishMode)
{
    var insights = builder.AddAzureApplicationInsights("octopets-appinsights");
    api.WithReference(insights);
    frontend.WithReference(insights);
}

foundryAgentId.WithParentRelationship(agent);
foundryProject.WithParentRelationship(agent);
agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
api.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

builder.Build().Run();