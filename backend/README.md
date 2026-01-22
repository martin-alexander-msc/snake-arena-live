# Snake Arena Backend

FastAPI backend for Snake Arena with mock in-memory storage.

## Quick Start

1.  **Sync dependencies**:
    ```bash
    uv sync
    ```

2.  **Run the server**:
    ```bash
    uv run uvicorn main:app --reload --port 8000
    ```

## Testing

### Automated Unit Tests
Run the test suite using `pytest`:
```bash
uv run pytest
```

### Live API Verification
To verify a **running** instance of the backend:
```bash
uv run python verify_api.py --port 8000
```

## Built With

- **FastAPI**
- **Pydantic**
- **Uvicorn**
- **Pytest**
- **uv** (Package & Environment Management)
