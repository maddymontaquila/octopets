#:package Aspire.Hosting.Python@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.NodeJs@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Azure.ApplicationInsights@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Azure.AIFoundry@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Redis@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Azure.AppContainers@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Docker@13.0.0-preview.1.25517.6
#:package Aspire.Hosting.Azure.ContainerRegistry@13.0.0-preview.1.25517.6
#:package CommunityToolkit.Aspire.Hosting.NodeJS.Extensions@9.8.1-beta.410
#:project ../backend/Octopets.Backend.csproj
#:sdk Aspire.AppHost.Sdk@13.0.0-preview.1.25517.6
#:property UserSecretsId=octopets
#pragma warning disable

using Aspire.Hosting.Azure;
using Azure.Provisioning.AppContainers;
using Azure.Provisioning.ContainerRegistry;


var builder = DistributedApplication.CreateBuilder(args);
var acr = builder.AddAzureContainerRegistry("octopetsacr");

var identity = builder.AddAzureUserAssignedIdentity("octopets-identity");

var cae = builder.AddAzureContainerAppEnvironment("octopets-aca")
    .WithAzureContainerRegistry(acr);

var foundryProject = builder.AddParameter("FoundryProjectUrl");
var foundryAgentId = builder.AddParameter("FoundryAgentId");

var api = builder.AddProject<Projects.Octopets_Backend>("api")
    .WithEnvironment("ERRORS", builder.ExecutionContext.IsPublishMode ? "true" : "false")
    .WithEnvironment("ENABLE_CRUD", builder.ExecutionContext.IsPublishMode ? "false" : "true")
    .PublishAsAzureContainerApp((module, containerApp) => { });

var agent = builder.AddPythonScript("chat", "../agent", "agent.py")
    .WithUvEnvironment()
    .WithEndpoint(targetPort: 8001, scheme: builder.ExecutionContext.IsPublishMode ? "https" : "http")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    .WithEnvironment("AGENT_ID", foundryAgentId)
    .WithAzureUserAssignedIdentity(identity)
    .WithIconName("ChatEmpty")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithExternalHttpEndpoints()
    .WithOtlpExporter();

var sitter_agent = builder.AddPythonScript("sitter", "../sitter-agent", "app.py")
    .WithUvEnvironment()
    .WithEndpoint(targetPort: 8002, scheme: builder.ExecutionContext.IsPublishMode ? "https" : "http")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    .WithAzureUserAssignedIdentity(identity)
    .WithIconName("ChatEmpty")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithExternalHttpEndpoints()
    .WithOtlpExporter();

var orchestrator = builder.AddPythonScript("orchestrator", "../orchestrator-agent", "app.py")
    .WithUvEnvironment()
    .WithEndpoint(targetPort: 8003, scheme: builder.ExecutionContext.IsPublishMode ? "https" : "http")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    .WithEnvironment("LISTINGS_AGENT_URL", agent.GetEndpoint(builder.ExecutionContext.IsPublishMode ? "https" : "http"))
    .WithAzureUserAssignedIdentity(identity)
    .WithEnvironment("SITTER_AGENT_URL", sitter_agent.GetEndpoint(builder.ExecutionContext.IsPublishMode ? "https" : "http"))
    .WithIconName("BranchFork")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithExternalHttpEndpoints()
    .WithOtlpExporter();


var frontend = builder.AddNpmApp("frontend", "../frontend")
    .WithNpmPackageInstallation()
    .WithReference(api).WaitFor(api)
    .WithReference(agent).WaitFor(agent)
    .WithReference(sitter_agent).WaitFor(sitter_agent)
    .WithReference(orchestrator).WaitFor(orchestrator)
    .WithHttpEndpoint(targetPort: builder.ExecutionContext.IsPublishMode ? 80 : 3000)
    .WithExternalHttpEndpoints()
    .WithEnvironment("BROWSER", "none")
    .WithUrlForEndpoint("http", c => c.DisplayText="Frontend")
    .WithEnvironment("REACT_APP_AGENT_API_URL", agent.GetEndpoint(builder.ExecutionContext.IsPublishMode ? "https" : "http"))
    .WithEnvironment("REACT_APP_SITTER_AGENT_API_URL", sitter_agent.GetEndpoint(builder.ExecutionContext.IsPublishMode ? "https" : "http"))
    .WithEnvironment("REACT_APP_ORCHESTRATOR_API_URL", orchestrator.GetEndpoint(builder.ExecutionContext.IsPublishMode ? "https" : "http"))
    .PublishAsDockerFile(c => c.WithBuildArg("REACT_APP_USE_MOCK_DATA", builder.ExecutionContext.IsPublishMode ? "false" : "true"))
    .WithOtlpExporter();

// Configure CORS for agent services with frontend URL
agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
sitter_agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
orchestrator.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

// Only add Application Insights in non-development environments
if (builder.ExecutionContext.IsPublishMode)
{
    var insights = builder.AddAzureApplicationInsights("octopets-appinsights");
    api.WithReference(insights);
    frontend.WithReference(insights);
    agent.WithReference(insights);
    sitter_agent.WithReference(insights);
    orchestrator.WithReference(insights);
}

foundryAgentId.WithParentRelationship(agent);
foundryProject.WithParentRelationship(agent);

agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
sitter_agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));
api.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

sitter_agent.WithEnvironment("FRONTEND_URL", frontend.GetEndpoint("http"));

builder.Build().Run();