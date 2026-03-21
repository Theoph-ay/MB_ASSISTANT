FROM python:3.12-slim AS base

# System deps for psycopg (PostgreSQL) and general build
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install uv (fast Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set the WORKDIR to /app first
WORKDIR /app

# Copy dependency files first for caching
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy application source
COPY . .

# Expose the API port
EXPOSE 8000

# Startup script
RUN chmod +x start.sh
CMD ["sh", "start.sh"]

