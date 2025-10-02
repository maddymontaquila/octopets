#!/bin/bash
set -e

echo "🐙 Setting up Octopets development environment..."

# Ensure we're in the workspace directory
cd /workspace

# Install .NET Aspire workload
echo "📦 Installing .NET Aspire workload..."
dotnet workload install aspire

# Restore .NET projects
echo "📦 Restoring .NET dependencies..."
dotnet restore

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install Python agent dependencies using uv
echo "📦 Installing Python agent dependencies..."
cd agent
# Initialize uv if needed
if [ ! -f "uv.lock" ]; then
    uv lock
fi
uv sync
cd ..

# Trust HTTPS development certificates
echo "🔒 Setting up HTTPS development certificates..."
dotnet dev-certs https --trust || echo "Certificate trust requires manual approval"

echo "✅ Development environment setup complete!"
echo ""
echo "🚀 To start the application, run: aspire run"
echo ""
echo "📊 The Aspire dashboard will be available at: http://localhost:15888"
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:5000"
echo "🤖 Agent service will be available at: http://localhost:8000"
echo ""
echo "⚙️  Don't forget to configure your Azure AI Foundry settings:"
echo "   - AZURE_AI_ENDPOINT"
echo "   - AGENT_ID"
