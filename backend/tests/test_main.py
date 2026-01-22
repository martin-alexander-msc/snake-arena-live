import pytest
from httpx import ASGITransport, AsyncClient
from main import app, db
from models import GameMode

@pytest.mark.asyncio
async def test_signup():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/auth/signup",
            json={
                "username": "TestUser",
                "email": "test@example.com",
                "password": "password123"
            }
        )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "TestUser"
    assert "token" in data

@pytest.mark.asyncio
async def test_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/auth/login",
            json={
                "email": "snakemaster@game.com",
                "password": "password123"
            }
        )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "SnakeMaster"
    assert "token" in data

@pytest.mark.asyncio
async def test_get_leaderboard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["rank"] == 1

@pytest.mark.asyncio
async def test_get_live_games():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/live-games")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

@pytest.mark.asyncio
async def test_update_profile():
    # First login to get token
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/auth/login",
            json={"email": "snakemaster@game.com", "password": "password123"}
        )
        token = login_res.json()["token"]
        
        # Update profile
        response = await ac.patch(
            "/users/profile",
            json={"username": "NewMaster"},
            headers={"Authorization": f"Bearer {token}"}
        )
    assert response.status_code == 200
    assert response.json()["username"] == "NewMaster"
