from typing import Dict
from models import LiveGame
from db_setup import engine, Base

# Ephemeral store for live games (high frequency updates, no need for persistence)
live_games: Dict[str, LiveGame] = {}

def init_db():
    Base.metadata.create_all(bind=engine)

