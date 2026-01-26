# --- Frontend Build Stage ---
FROM node:18-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Backend Builder Stage ---
FROM python:3.12-slim AS backend-builder
WORKDIR /app/backend

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Re-lock and sync dependencies
RUN uv lock
RUN uv sync --no-install-project --no-dev

# --- Final Runtime Stage ---
FROM dhi.io/python:3.12
WORKDIR /app

# Copy backend virtualenv
COPY --from=backend-builder /app/backend/.venv /app/.venv

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy backend source code
COPY backend/ /app/

# Set PYTHONPATH to the venv site-packages
ENV PYTHONPATH="/app/.venv/lib/python3.12/site-packages"

# Expose the application port
ENV PORT=8081
EXPOSE ${PORT}

# Run the unified application
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
