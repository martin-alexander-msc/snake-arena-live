from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class GameMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class GameStatus(str, Enum):
    IDLE = "idle"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game-over"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    avatar: Optional[str] = None
    highScore: int = 0
    gamesPlayed: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class SignUpCredentials(AuthCredentials):
    username: str

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    userId: str
    username: str
    avatar: Optional[str] = None
    score: int
    mode: GameMode
    date: datetime = Field(default_factory=datetime.utcnow)

class LiveGame(BaseModel):
    id: str
    playerId: str
    playerName: str
    playerAvatar: Optional[str] = None
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    status: GameStatus
    viewers: int = 0
    startedAt: datetime = Field(default_factory=datetime.utcnow)

class UserStats(BaseModel):
    highScore: int
    gamesPlayed: int
    rank: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
