# Snake Arena Live

A high-performance, real-time multiplayer snake game built with a modern web stack.

## 🏗 Project Architecture

This repository is organized as a monorepo containing both the frontend and backend components:

- **[frontend/](file:///Users/marty/git/snake-arena-live/frontend/)**: A React application powered by Vite, providing the game UI, real-time rendering, and player controls.
- **[backend/](file:///Users/marty/git/snake-arena-live/backend/)**: A FastAPI application that handles authentication, leaderboards, and live game states.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: (v18+) for the frontend.
- **Python**: (3.12+) with [uv](https://github.com/astral-sh/uv) for the backend.

### Running the Full Stack

The easiest way to run both frontend and backend together:

```bash
npm install  # First time only
npm run dev
```

This will start:
- **Frontend** at `http://localhost:8085`
- **Backend** at `http://localhost:8081` (API docs at `/docs`)

Both servers run simultaneously with color-coded output (cyan for frontend, magenta for backend).

### Running Servers Individually

If you prefer to run them separately:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Accessible at `http://localhost:8085` by default.*

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8081
```
*API docs accessible at `http://127.0.0.1:8081/docs`.*

## 🐳 Docker Support

To run the application with Docker (Postgres database):

1.  **DHI Login** (Required for base images):
    ```bash
    docker login dhi.io
    ```

2.  **Start Services**:
    ```bash
    docker-compose up --build
    ```

3.  **Access**:
    - Frontend: `http://localhost:8085`
    - Backend API: `http://localhost:8081/docs`

## 🧪 Testing

### Backend tests
Run unit tests:
```bash
cd backend
uv run pytest
```

Run integration tests (requires DB setup logic):
```bash
cd backend
uv run pytest tests_integration
```
*Note: Integration tests verify database constraints and connection logic using SQLite.*

### Frontend tests
```bash
cd frontend
npm run test
```

## 🧪 Documentation & Testing

Each sub-project contains its own detailed documentation and test suite:

- **Frontend Documentation**: See [frontend/README.md](file:///Users/marty/git/snake-arena-live/frontend/README.md).
- **Backend Documentation**: See [backend/README.md](file:///Users/marty/git/snake-arena-live/backend/README.md).
- **Agent Guidelines**: See [agents.md](file:///Users/marty/git/snake-arena-live/agents.md) for development workflow best practices.

## 🛠 Technology Stack

### Frontend
- **React** + **Vite**
- **Tailwind CSS** for styling
- **Web Audio API** for synthesized sound effects
- **Vitest** (Unit/Component) & **Playwright** (E2E) for testing

### Backend
- **FastAPI** (Python)
- **Pydantic** for data validation
- **JOSE** & **Passlib** for security/auth
- **uv** for high-performance dependency management
- **Pytest** for testing
