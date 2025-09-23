#pragma warning disable
var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Octopets_Backend>("api")
        .WithExternalHttpEndpoints()
        .WithEnvironment("ERRORS", builder.ExecutionContext.IsPublishMode ? "true" : "false")
        .WithEnvironment("ENABLE_CRUD", builder.ExecutionContext.IsPublishMode ? "false" : "true");

var agent = builder.AddUvApp("agent", "../agent", "agent.py")
    .WithHttpEndpoint(env: "PORT");

// Only add Application Insights in non-development environments
if (builder.ExecutionContext.IsPublishMode)
{
    var frontend = builder.AddDockerfile("frontend", "../frontend", "Dockerfile")
        .WithReference(api)
        .WithReference(agent)
        .WithHttpEndpoint(80, 80)
        .WithExternalHttpEndpoints()
        .WithBuildArg("REACT_APP_USE_MOCK_DATA",  "false")
        .WithBuildArg("REACT_APP_AGENT_API_URL", agent.GetEndpoint("http"));

    var insights = builder.AddAzureApplicationInsights("octopets-appinsights");
    api.WithReference(insights);
    frontend.WithReference(insights);
}
else
{
    builder.AddNpmApp("frontend", "../frontend")
    .WithReference(api).WaitFor(api)
    .WithReference(agent).WaitFor(agent)
    .WithHttpEndpoint(env: "PORT")
    .WithEnvironment("BROWSER", "none")
    .WithEnvironment("REACT_APP_AGENT_API_URL", agent.GetEndpoint("http"));
}

builder.Build().Run(); 