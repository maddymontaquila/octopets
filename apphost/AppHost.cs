#:package CommunityToolkit.Aspire.Hosting.Python.Extensions@9.8.0-beta.394
#:package Aspire.Hosting.NodeJs@9.6.0-preview.1.25468.31
#:package Aspire.Hosting.Azure.ApplicationInsights@9.6.0-preview.1.25468.31
#:package Aspire.Hosting.Azure.AIFoundry@9.6.0-preview.1.25474.8
#:package Aspire.Hosting.Redis@9.6.0-preview.1.25468.31
#:package Aspire.Hosting.Azure.AppContainers@9.5.1
#:package Aspire.Hosting.Docker@9.5.1-preview.1.25502.11
#:package Aspire.Hosting.Azure.ContainerRegistry@9.5.1-preview.1.25502.11
#:project ../backend/Octopets.Backend.csproj
#:sdk Aspire.AppHost.Sdk@9.6.0-preview.1.25468.31
#:property UserSecretsId=octopets
#pragma warning disable

using Azure.Provisioning.AppContainers;
using Azure.Provisioning.ContainerRegistry;


var builder = DistributedApplication.CreateBuilder(args);
var acr = builder.AddAzureContainerRegistry("octopetsacr");

var cae = builder.AddAzureContainerAppEnvironment("octopets-aca")
    .WithAzureContainerRegistry(acr);

var foundryProject = builder.AddParameter("FoundryProjectUrl");
var foundryAgentId = builder.AddParameter("FoundryAgentId");

//var foundryResource = builder.AddParameter("FoundryResource", value: "octopets-foundry");
//var foundryRG = builder.AddParameter("FoundryRG", value: "rg-octopets-demo");

//var foundry = builder.AddAzureAIFoundry("foundry-agent")
//    .AsExisting(foundryResource, foundryRG)
//    .WithIconName("Sparkle");

//foundryResource.WithParentRelationship(foundry);
//foundryRG.WithParentRelationship(foundry);

var api = builder.AddProject<Projects.Octopets_Backend>("api")
    .WithEnvironment("ERRORS", builder.ExecutionContext.IsPublishMode ? "true" : "false")
    .WithEnvironment("ENABLE_CRUD", builder.ExecutionContext.IsPublishMode ? "false" : "true")
    .PublishAsAzureContainerApp((module, containerApp) => { });

var agent = builder.AddUvApp("python-agent-chat", "../agent", "agent.py")
    .WithHttpEndpoint(env: "PORT")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    .WithEnvironment("AGENT_ID", foundryAgentId)
     //.WithReference(foundry)
    .WithIconName("ChatEmpty")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithOtlpExporter();

var sitter_agent = builder.AddUvApp("python-agent-sitter", "../sitter-agent", "app.py")
    .WithHttpEndpoint(env: "PORT")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    //.WithReference(foundry)
    .WithIconName("ChatEmpty")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithOtlpExporter();

var orchestrator = builder.AddUvApp("orchestrator-agent", "../orchestrator-agent", "app.py")
    .WithHttpEndpoint(env: "PORT")
    .WithEnvironment("AZURE_OPENAI_ENDPOINT", foundryProject)
    .WithEnvironment("LISTINGS_AGENT_URL", agent.GetEndpoint("http"))
    .WithEnvironment("SITTER_AGENT_URL", sitter_agent.GetEndpoint("http"))
    //.WithReference(foundry)
    .WithIconName("BranchFork")
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
    .WithOtlpExporter();

var frontend = builder.AddNpmApp("frontend", "../frontend")
    .WithReference(api).WaitFor(api)
    .WithReference(agent).WaitFor(agent)
    .WithReference(sitter_agent).WaitFor(sitter_agent)
    .WithReference(orchestrator).WaitFor(orchestrator)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithEnvironment("BROWSER", "none")
    .WithUrlForEndpoint("http", c => c.DisplayText="Frontend")
    .WithEnvironment("REACT_APP_USE_MOCK_DATA", builder.ExecutionContext.IsPublishMode ? "false" : "true")
    .WithEnvironment("REACT_APP_AGENT_API_URL", agent.GetEndpoint("http"))
    .WithEnvironment("REACT_APP_SITTER_AGENT_API_URL", sitter_agent.GetEndpoint("http"))
    .WithEnvironment("REACT_APP_ORCHESTRATOR_API_URL", orchestrator.GetEndpoint("http"))
    .PublishAsDockerFile()
    .PublishAsAzureContainerApp((module, containerApp) => { })
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