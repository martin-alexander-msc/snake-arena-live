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

### 1. Frontend Development

```bash
cd frontend
npm install
npm run dev
```
*Accessible at `http://localhost:8082` by default.*

### 2. Backend Development

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8081
```
*API docs accessible at `http://127.0.0.1:8081/docs`.*

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
