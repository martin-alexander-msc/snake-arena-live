from datetime import datetime, timedelta
from typing import List, Dict, Optional
from models import User, LeaderboardEntry, LiveGame, GameMode, GameStatus, Position

# Mock Database
class MockDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {
            "1": User(
                id="1",
                username="SnakeMaster",
                email="snakemaster@game.com",
                highScore=2500,
                gamesPlayed=150,
                createdAt=datetime.utcnow() - timedelta(days=30)
            ),
            "2": User(
                id="2",
                username="NeonViper",
                email="neonviper@game.com",
                highScore=1800,
                gamesPlayed=85,
                createdAt=datetime.utcnow() - timedelta(days=20)
            ),
            "3": User(
                id="3",
                username="PixelPython",
                email="pixelpython@game.com",
                highScore=1200,
                gamesPlayed=45,
                createdAt=datetime.utcnow() - timedelta(days=10)
            )
        }
        
        # password hashing mock (just storing plain passwords for simplicity in mock db)
        self.passwords: Dict[str, str] = {
            "snakemaster@game.com": "password123", # in real app this would be hashed
            "neonviper@game.com": "password123",
            "pixelpython@game.com": "password123"
        }

        self.leaderboard: List[LeaderboardEntry] = [
            LeaderboardEntry(id="l1", rank=1, userId="1", username="SnakeMaster", score=2500, mode=GameMode.PASS_THROUGH),
            LeaderboardEntry(id="l2", rank=2, userId="2", username="NeonViper", score=1800, mode=GameMode.WALLS),
            LeaderboardEntry(id="l3", rank=3, userId="1", username="SnakeMaster", score=1500, mode=GameMode.WALLS),
            LeaderboardEntry(id="l4", rank=4, userId="3", username="PixelPython", score=1200, mode=GameMode.PASS_THROUGH),
        ]

        self.live_games: Dict[str, LiveGame] = {
            "g1": LiveGame(
                id="g1",
                playerId="2",
                playerName="NeonViper",
                score=450,
                mode=GameMode.PASS_THROUGH,
                snake=[Position(x=10, y=10), Position(x=10, y=11), Position(x=10, y=12)],
                food=Position(x=15, y=15),
                status=GameStatus.PLAYING,
                viewers=12,
                startedAt=datetime.utcnow() - timedelta(minutes=5)
            ),
            "g2": LiveGame(
                id="g2",
                playerId="3",
                playerName="PixelPython",
                score=120,
                mode=GameMode.WALLS,
                snake=[Position(x=5, y=5), Position(x=4, y=5)],
                food=Position(x=5, y=10),
                status=GameStatus.PLAYING,
                viewers=5,
                startedAt=datetime.utcnow() - timedelta(minutes=2)
            )
        }

db = MockDatabase()
