import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db
from db_setup import Base
import sql_models
from datetime import datetime

# Setup Test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Fixture to reset DB
@pytest.fixture(autouse=True)
def run_around_tests():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

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
    # Setup user
    db = TestingSessionLocal()
    user = sql_models.User(
        id="user_1", username="SnakeMaster", email="snakemaster@game.com", 
        hashed_password="password123", highScore=2500, gamesPlayed=150
    )
    db.add(user)
    db.commit()
    db.close()

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
    # Setup data
    db = TestingSessionLocal()
    entry = sql_models.LeaderboardEntry(
        id="l1", rank=1, userId="u1", username="Player1", 
        score=1000, mode="pass-through", date=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.close()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["username"] == "Player1"

@pytest.mark.asyncio
async def test_get_live_games():
    # Live games are in-memory and start empty, so just check it returns empty list
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/live-games")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_update_profile():
    # Setup user
    db = TestingSessionLocal()
    user = sql_models.User(
        id="user_test", username="OriginalName", email="change@game.com", 
        hashed_password="password123"
    )
    db.add(user)
    db.commit()
    db.close()

    # Login to get token
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/auth/login",
            json={"email": "change@game.com", "password": "password123"}
        )
        token = login_res.json()["token"]
        
        # Update profile
        response = await ac.patch(
            "/users/profile",
            json={"username": "NewNAME"},
            headers={"Authorization": f"Bearer {token}"}
        )
    assert response.status_code == 200
    assert response.json()["username"] == "NewNAME"
