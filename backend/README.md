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

- **FastAPI**: A modern, high-performance web framework for building APIs with Python.
- **Pydantic**: Data validation and settings management using Python type annotations.
- **Uvicorn**: A lightning-fast ASGI server implementation, used to serve the FastAPI application.
- **Pytest**: A robust testing framework for writing and running unit and functional tests.
- **httpx**: A next-generation HTTP client, used in tests and verification scripts for making async requests.
- **Python-jose**: A JOSE (JSON Object Signing and Encryption) implementation, used for JWT authentication.
- **Passlib**: A comprehensive password hashing library, used to securely handle user credentials.
- **uv**: A high-performance Python package and environment manager that replaces `pip` and `venv`.
