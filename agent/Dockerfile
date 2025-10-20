# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy all files
COPY . .

# Install dependencies using uv
RUN uv pip install --system --no-cache .

# Expose the port the app runs on
EXPOSE 8001

# Set environment variables
ENV PORT=8001
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "-m", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8001"]
