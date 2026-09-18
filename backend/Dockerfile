FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Explicitly add both directories to Python's path
ENV PYTHONPATH=/app/backend/app:/app/mcp-server

EXPOSE 8000

# Tell uvicorn exactly which module to run, bypassing the root main.py
CMD sh -c "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
