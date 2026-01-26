# Builder stage
FROM python:3.12-slim AS builder
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Re-lock to match the 3.12 requirement (in case lock was 3.13)
RUN uv lock

# Install dependencies into .venv
RUN uv sync --no-install-project --no-dev

# Runtime stage
FROM dhi.io/python:3.12
WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY . .

# Set PYTHONPATH to the venv site-packages
ENV PYTHONPATH="/app/.venv/lib/python3.12/site-packages"

# Run application using module execution
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081"]
