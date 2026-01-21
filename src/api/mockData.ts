import { User, LeaderboardEntry, LiveGame, GameMode, Position } from '@/types/game';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'SnakeMaster',
    email: 'snakemaster@game.com',
    avatar: undefined,
    highScore: 2450,
    gamesPlayed: 342,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    username: 'NeonViper',
    email: 'neonviper@game.com',
    avatar: undefined,
    highScore: 2100,
    gamesPlayed: 256,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    username: 'PixelPython',
    email: 'pixelpython@game.com',
    avatar: undefined,
    highScore: 1980,
    gamesPlayed: 189,
    createdAt: '2024-03-05T09:15:00Z',
  },
  {
    id: '4',
    username: 'ArcadeAce',
    email: 'arcadeace@game.com',
    avatar: undefined,
    highScore: 1875,
    gamesPlayed: 421,
    createdAt: '2024-01-08T16:45:00Z',
  },
  {
    id: '5',
    username: 'RetroRacer',
    email: 'retroracer@game.com',
    avatar: undefined,
    highScore: 1650,
    gamesPlayed: 167,
    createdAt: '2024-04-12T11:20:00Z',
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, userId: '1', username: 'SnakeMaster', score: 2450, mode: 'walls', date: '2024-12-20T15:30:00Z' },
  { id: '2', rank: 2, userId: '2', username: 'NeonViper', score: 2100, mode: 'walls', date: '2024-12-19T12:00:00Z' },
  { id: '3', rank: 3, userId: '3', username: 'PixelPython', score: 1980, mode: 'pass-through', date: '2024-12-21T09:45:00Z' },
  { id: '4', rank: 4, userId: '4', username: 'ArcadeAce', score: 1875, mode: 'walls', date: '2024-12-18T20:15:00Z' },
  { id: '5', rank: 5, userId: '5', username: 'RetroRacer', score: 1650, mode: 'pass-through', date: '2024-12-17T14:30:00Z' },
  { id: '6', rank: 6, userId: '6', username: 'CyberSlither', score: 1520, mode: 'walls', date: '2024-12-16T18:00:00Z' },
  { id: '7', rank: 7, userId: '7', username: 'NightCrawler', score: 1480, mode: 'pass-through', date: '2024-12-15T22:45:00Z' },
  { id: '8', rank: 8, userId: '8', username: 'GlowWorm', score: 1350, mode: 'walls', date: '2024-12-14T10:30:00Z' },
  { id: '9', rank: 9, userId: '9', username: 'NeonNinja', score: 1290, mode: 'pass-through', date: '2024-12-13T16:15:00Z' },
  { id: '10', rank: 10, userId: '10', username: 'PixelProwler', score: 1180, mode: 'walls', date: '2024-12-12T11:00:00Z' },
];

const generateRandomSnake = (): Position[] => {
  const startX = Math.floor(Math.random() * 10) + 5;
  const startY = Math.floor(Math.random() * 10) + 5;
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
    { x: startX - 3, y: startY },
  ];
};

const generateRandomFood = (): Position => ({
  x: Math.floor(Math.random() * 20),
  y: Math.floor(Math.random() * 20),
});

export const mockLiveGames: LiveGame[] = [
  {
    id: 'live-1',
    playerId: '2',
    playerName: 'NeonViper',
    score: 340,
    mode: 'walls',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    status: 'playing',
    viewers: 12,
    startedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'live-2',
    playerId: '3',
    playerName: 'PixelPython',
    score: 580,
    mode: 'pass-through',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    status: 'playing',
    viewers: 8,
    startedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'live-3',
    playerId: '4',
    playerName: 'ArcadeAce',
    score: 220,
    mode: 'walls',
    snake: generateRandomSnake(),
    food: generateRandomFood(),
    status: 'playing',
    viewers: 5,
    startedAt: new Date(Date.now() - 180000).toISOString(),
  },
];

export const getRandomMode = (): GameMode => 
  Math.random() > 0.5 ? 'walls' : 'pass-through';
