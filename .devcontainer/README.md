# Octopets Dev Container

This dev container provides a complete development environment for the Octopets application, including:

## Included Tools & Runtimes

- **.NET 9.0 SDK** - For backend API and Aspire AppHost development
- **Node.js 20** - For React frontend development
- **Python 3.12** - For the agent service
- **uv** - Fast Python package manager for agent dependencies
- **Docker-in-Docker** - For containerization support
- **Azure CLI** - For Azure resource management
- **GitHub CLI** - For GitHub operations
- **Git** - Version control
- **zsh** - Default shell with Oh My Zsh

## VS Code Extensions

The container includes extensions for:
- C# development (C# Dev Kit, OmniSharp)
- .NET Aspire development
- Python development (Pylance, debugpy)
- Frontend development (ESLint, Prettier)
- Docker support
- GitHub Copilot
- Azure tools

## Getting Started

1. **Open in Container**: When you open this project in VS Code, you'll be prompted to reopen in container. Click "Reopen in Container".

2. **Wait for Setup**: The post-create script will automatically:
   - Install .NET Aspire workload
   - Restore .NET dependencies
   - Install npm packages for frontend
   - Set up Python environment with uv
   - Configure HTTPS certificates

3. **Configure Azure AI Foundry** (Required for agent service):
   ```bash
   # Set these in your user secrets or environment
   dotnet user-secrets set "Parameters:FoundryProjectUrl" "your-azure-ai-endpoint"
   dotnet user-secrets set "Parameters:FoundryAgentId" "your-agent-id"
   ```

4. **Start the Application**:
   ```bash
   aspire run
   ```

   This will start all services:
   - Backend API
   - Frontend React app
   - Python agent service
   - Aspire Dashboard (http://localhost:15888)

## Port Forwarding

The following ports are automatically forwarded:
- `3000` - Frontend (React app)
- `5000/5001` - Backend API
- `8000` - Python Agent service
- `15888` - Aspire Dashboard
- `18888` - Aspire OTLP endpoint
- `21888` - Aspire Resource Service

## Development Workflow

### Backend (.NET)
```bash
cd backend
dotnet run
# or use Aspire to run everything together
```

### Frontend (React)
```bash
cd frontend
npm start
```

### Agent (Python)
```bash
cd agent
uv run uvicorn agent:app --reload
# or use Aspire to run everything together
```

### Running Tests
```bash
# Backend tests
dotnet test

# Frontend tests
cd frontend
npm test

# Frontend E2E tests
cd frontend
npm run test:e2e
```

## Environment Variables

The dev container sets up several environment variables:
- `ASPNETCORE_ENVIRONMENT=Development`
- `DOTNET_USE_POLLING_FILE_WATCHER=true` - For hot reload support

Additional environment variables can be configured in:
- `apphost/AppHost.cs` - For Aspire configuration
- `backend/appsettings.Development.json` - For backend API
- `frontend/.env` - For React app (create if needed)
- `agent/agent.py` - For Python agent service

## Troubleshooting

### HTTPS Certificate Issues
If you encounter HTTPS certificate trust issues:
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### Python Dependencies
If agent dependencies fail to install:
```bash
cd agent
uv sync --reinstall
```

### Frontend Issues
If npm packages have issues:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Aspire Dashboard Not Loading
Ensure all required ports are free and not blocked by firewall:
```bash
# Check if ports are in use
lsof -i :15888
lsof -i :18888
lsof -i :21888
```

## Container Customization

To customize the container:
- Edit `.devcontainer/devcontainer.json` for VS Code settings and extensions
- Edit `.devcontainer/Dockerfile` for base image and system packages
- Edit `.devcontainer/post-create.sh` for setup automation

## Azure AI Foundry Setup

The agent service requires Azure AI Foundry configuration:

1. Create an Azure AI Foundry project
2. Deploy an agent
3. Get the endpoint URL and agent ID
4. Configure using user secrets:
   ```bash
   cd apphost
   dotnet user-secrets set "Parameters:FoundryProjectUrl" "https://your-project.cognitiveservices.azure.com/"
   dotnet user-secrets set "Parameters:FoundryAgentId" "your-agent-id"
   ```

## Additional Resources

- [.NET Aspire Documentation](https://learn.microsoft.com/dotnet/aspire/)
- [Azure AI Foundry Documentation](https://learn.microsoft.com/azure/ai-services/agents/)
- [Dev Containers Documentation](https://containers.dev/)
