import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

from .models import (
    User, GameMode, GameStatus, Position, 
    AuthCredentials, SignUpCredentials, AuthResponse,
    LeaderboardEntry, LiveGame, UserStats, 
    Token, TokenData
)
from .database import db

# Configuration
SECRET_KEY = "super-secret-key-change-me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Snake Arena API")

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

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
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
    
    user = next((u for u in db.users.values() if u.email == email), None)
    if user is None:
        raise credentials_exception
    return user

# --- Auth Routes ---

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(credentials: SignUpCredentials):
    if any(u.email == credentials.email or u.username == credentials.username for u in db.users.values()):
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    user_id = f"user_{int(datetime.utcnow().timestamp())}"
    new_user = User(
        id=user_id,
        username=credentials.username,
        email=credentials.email,
        highScore=0,
        gamesPlayed=0,
        createdAt=datetime.utcnow()
    )
    
    db.users[user_id] = new_user
    db.passwords[credentials.email] = credentials.password # In real app, hash this
    
    token = create_access_token(data={"sub": new_user.email})
    return AuthResponse(user=new_user, token=token)

@app.post("/auth/login", response_model=AuthResponse)
async def login(credentials: AuthCredentials):
    user = next((u for u in db.users.values() if u.email == credentials.email), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    correct_password = db.passwords.get(credentials.email)
    if credentials.password != correct_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user.email})
    return AuthResponse(user=user, token=token)

@app.post("/auth/logout")
async def logout():
    return {"detail": "Successfully logged out"}

@app.get("/auth/me", response_model=User)
async def me(current_user: User = Depends(get_current_user)):
    return current_user

# --- To be continued in next step ---
