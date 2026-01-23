from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from db_setup import Base
import models # Pydantic models for Enum reference

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String, nullable=True)
    highScore = Column(Integer, default=0)
    gamesPlayed = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, index=True)
    rank = Column(Integer) # We might calculate this dynamically, but storing for now based on legacy mock
    userId = Column(String, index=True)
    username = Column(String)
    avatar = Column(String, nullable=True)
    score = Column(Integer)
    mode = Column(String) # Storing Enum as string
    date = Column(DateTime, default=datetime.utcnow)
