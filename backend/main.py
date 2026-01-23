import os
from datetime import datetime, timedelta
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from sqlalchemy.orm import Session

from models import (
    User, GameMode, GameStatus, Position, 
    AuthCredentials, SignUpCredentials, AuthResponse,
    LeaderboardEntry, LiveGame, UserStats, 
    Token, TokenData
)
import sql_models
from db_setup import get_db
from database import init_db, live_games

# Configuration
SECRET_KEY = "super-secret-key-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Snake Arena API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth helper setup
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password_and_upgrade(
    plain_password: str,
    stored_hash: str,
    user_db: sql_models.User,
    db: Session
) -> bool:
    try:
        verified = pwd_context.verify(plain_password, stored_hash)
    except UnknownHashError:
        verified = plain_password == stored_hash
        if verified:
            user_db.hashed_password = get_password_hash(plain_password)
            db.commit()
        return verified

    if verified and pwd_context.needs_update(stored_hash):
        user_db.hashed_password = get_password_hash(plain_password)
        db.commit()
    return verified

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(username=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(sql_models.User).filter(sql_models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    # Convert SQLAlchemy model to Pydantic model
    return User(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar=user.avatar,
        highScore=user.highScore,
        gamesPlayed=user.gamesPlayed,
        createdAt=user.createdAt
    )

# --- Auth Routes ---

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(credentials: SignUpCredentials, db: Session = Depends(get_db)):
    # Check if user exists
    existing_email = db.query(sql_models.User).filter(sql_models.User.email == credentials.email).first()
    existing_username = db.query(sql_models.User).filter(sql_models.User.username == credentials.username).first()
    
    if existing_email or existing_username:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    user_id = f"user_{int(datetime.utcnow().timestamp())}"
    hashed_password = get_password_hash(credentials.password)
    
    new_user_db = sql_models.User(
        id=user_id,
        username=credentials.username,
        email=credentials.email,
        hashed_password=hashed_password,
        highScore=0,
        gamesPlayed=0,
        createdAt=datetime.utcnow()
    )
    
    db.add(new_user_db)
    db.commit()
    db.refresh(new_user_db)
    
    token = create_access_token(data={"sub": new_user_db.email})
    
    # Map to Pydantic
    user_response = User(
        id=new_user_db.id,
        username=new_user_db.username,
        email=new_user_db.email,
        highScore=new_user_db.highScore,
        gamesPlayed=new_user_db.gamesPlayed,
        createdAt=new_user_db.createdAt
    )
    
    return AuthResponse(user=user_response, token=token)

@app.post("/auth/login", response_model=AuthResponse)
async def login(credentials: AuthCredentials, db: Session = Depends(get_db)):
    user_db = db.query(sql_models.User).filter(sql_models.User.email == credentials.email).first()
    if not user_db:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password_and_upgrade(credentials.password, user_db.hashed_password, user_db, db):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user_db.email})
    
    user_response = User(
        id=user_db.id,
        username=user_db.username,
        email=user_db.email,
        avatar=user_db.avatar,
        highScore=user_db.highScore,
        gamesPlayed=user_db.gamesPlayed,
        createdAt=user_db.createdAt
    )
    
    return AuthResponse(user=user_response, token=token)

@app.post("/auth/logout")
async def logout():
    return {"detail": "Successfully logged out"}

@app.get("/auth/me", response_model=User)
async def me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Leaderboard Routes ---

@app.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[GameMode] = Query(None), db: Session = Depends(get_db)):
    query = db.query(sql_models.LeaderboardEntry)
    if mode:
        query = query.filter(sql_models.LeaderboardEntry.mode == mode.value)
    
    # Sort by score descending
    entries_db = query.order_by(sql_models.LeaderboardEntry.score.desc()).all()
    
    # Convert to Pydantic models
    entries = []
    for i, e in enumerate(entries_db):
        entries.append(LeaderboardEntry(
            id=e.id,
            rank=i + 1,
            userId=e.userId,
            username=e.username,
            avatar=e.avatar,
            score=e.score,
            mode=GameMode(e.mode), # Convert string back to Enum
            date=e.date
        ))
    return entries

@app.post("/leaderboard/submit", response_model=LeaderboardEntry)
async def submit_score(
    score_data: dict, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    score = score_data.get("score")
    mode = score_data.get("mode")
    
    if score is None or mode is None:
        raise HTTPException(status_code=400, detail="Score and mode are required")
    
    entry_id = f"score_{int(datetime.utcnow().timestamp())}"
    new_entry_db = sql_models.LeaderboardEntry(
        id=entry_id,
        rank=0, # Calculated on read
        userId=current_user.id,
        username=current_user.username,
        avatar=current_user.avatar,
        score=score,
        mode=mode, # Storing as string (Enum value)
        date=datetime.utcnow()
    )
    
    db.add(new_entry_db)
    
    # Update user's high score if applicable
    user_db = db.query(sql_models.User).filter(sql_models.User.id == current_user.id).first()
    if user_db:
        if score > user_db.highScore:
            user_db.highScore = score
        user_db.gamesPlayed += 1
    
    db.commit()
    db.refresh(new_entry_db)
    
    return LeaderboardEntry(
        id=new_entry_db.id,
        rank=0,
        userId=new_entry_db.userId,
        username=new_entry_db.username,
        avatar=new_entry_db.avatar,
        score=new_entry_db.score,
        mode=GameMode(new_entry_db.mode),
        date=new_entry_db.date
    )

# --- Live Games Routes (In-Memory) ---

@app.get("/live-games", response_model=List[LiveGame])
async def get_live_games():
    return list(live_games.values())

@app.get("/live-games/{game_id}", response_model=LiveGame)
async def get_live_game(game_id: str):
    game = live_games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@app.post("/live-games/{game_id}/join")
async def join_as_viewer(game_id: str):
    game = live_games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    game.viewers += 1
    return {"detail": "Joined successfully"}

@app.post("/live-games/{game_id}/leave")
async def leave_as_viewer(game_id: str):
    game = live_games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.viewers > 0:
        game.viewers -= 1
    return {"detail": "Left successfully"}

# --- User Profile Routes ---

@app.patch("/users/profile", response_model=User)
async def update_profile(
    updates: dict, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_db = db.query(sql_models.User).filter(sql_models.User.id == current_user.id).first()
    
    if "username" in updates:
        user_db.username = updates["username"]
    if "avatar" in updates:
        user_db.avatar = updates["avatar"]
    
    db.commit()
    db.refresh(user_db)
    
    return User(
        id=user_db.id,
        username=user_db.username,
        email=user_db.email,
        avatar=user_db.avatar,
        highScore=user_db.highScore,
        gamesPlayed=user_db.gamesPlayed,
        createdAt=user_db.createdAt
    )

@app.get("/users/{user_id}/stats", response_model=UserStats)
async def get_user_stats(user_id: str, db: Session = Depends(get_db)):
    user_db = db.query(sql_models.User).filter(sql_models.User.id == user_id).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate rank based on high score
    # Optimized: count users with higher score + 1
    rank = db.query(sql_models.User).filter(sql_models.User.highScore > user_db.highScore).count() + 1
    
    return UserStats(
        highScore=user_db.highScore,
        gamesPlayed=user_db.gamesPlayed,
        rank=rank
    )
