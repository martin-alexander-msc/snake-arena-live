export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'pass-through' | 'walls';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  mode: GameMode;
  date: string;
}

export interface LiveGame {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  score: number;
  mode: GameMode;
  snake: Position[];
  food: Position;
  status: GameStatus;
  viewers: number;
  startedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
