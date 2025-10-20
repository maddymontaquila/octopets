#!/bin/bash

# Quick start script for Pet Sitter API with UV

echo "🐾 Pet Sitter API - Starting..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your Azure credentials."
    echo ""
fi

# Start the API
echo "🚀 Starting FastAPI server..."
uv run uvicorn app:app --host 0.0.0.0 --port 8000 --reload
