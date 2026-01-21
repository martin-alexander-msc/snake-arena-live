import { 
  User, 
  AuthCredentials, 
  SignUpCredentials, 
  AuthResponse, 
  LeaderboardEntry, 
  LiveGame,
  GameMode 
} from '@/types/game';
import { mockUsers, mockLeaderboard, mockLiveGames } from './mockData';

// Simulated delay to mimic network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data
let currentUser: User | null = null;
let authToken: string | null = null;

const STORAGE_KEY = 'snake_game_auth';

// Initialize from localStorage
const initFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { user, token } = JSON.parse(stored);
      currentUser = user;
      authToken = token;
    }
  } catch {
    // Ignore parsing errors
  }
};

initFromStorage();

/**
 * Centralized API client for all backend calls
 * All methods simulate network requests with delays
 * Replace implementations with real API calls when backend is ready
 */
export const apiClient = {
  // ==================== AUTH ====================
  
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || credentials.password.length < 6) {
      throw new Error('Invalid email or password');
    }
    
    const token = `mock_token_${user.id}_${Date.now()}`;
    currentUser = user;
    authToken = token;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    
    return { user, token };
  },

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    await delay(700);
    
    const existingUser = mockUsers.find(
      u => u.email === credentials.email || u.username === credentials.username
    );
    
    if (existingUser) {
      throw new Error('Email or username already exists');
    }
    
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: credentials.username,
      email: credentials.email,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    currentUser = newUser;
    authToken = token;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, token }));
    
    return { user: newUser, token };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    authToken = null;
    localStorage.removeItem(STORAGE_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    return currentUser;
  },

  isAuthenticated(): boolean {
    return currentUser !== null && authToken !== null;
  },

  // ==================== LEADERBOARD ====================

  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.sort((a, b) => b.score - a.score).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },

  async submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry | null> {
    await delay(400);
    
    if (!currentUser) {
      return null;
    }
    
    const entry: LeaderboardEntry = {
      id: `score_${Date.now()}`,
      rank: 0,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      score,
      mode,
      date: new Date().toISOString(),
    };
    
    mockLeaderboard.push(entry);
    
    // Update user's high score if applicable
    if (score > currentUser.highScore) {
      currentUser.highScore = score;
    }
    currentUser.gamesPlayed++;
    
    return entry;
  },

  // ==================== LIVE GAMES ====================

  async getLiveGames(): Promise<LiveGame[]> {
    await delay(200);
    return [...mockLiveGames];
  },

  async getLiveGame(gameId: string): Promise<LiveGame | null> {
    await delay(100);
    return mockLiveGames.find(g => g.id === gameId) || null;
  },

  async joinAsViewer(gameId: string): Promise<boolean> {
    await delay(100);
    const game = mockLiveGames.find(g => g.id === gameId);
    if (game) {
      game.viewers++;
      return true;
    }
    return false;
  },

  async leaveAsViewer(gameId: string): Promise<void> {
    await delay(100);
    const game = mockLiveGames.find(g => g.id === gameId);
    if (game && game.viewers > 0) {
      game.viewers--;
    }
  },

  // ==================== USER PROFILE ====================

  async updateProfile(updates: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User> {
    await delay(300);
    
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: currentUser, token: authToken }));
    
    return currentUser;
  },

  async getUserStats(userId: string): Promise<{ highScore: number; gamesPlayed: number; rank: number }> {
    await delay(200);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const sortedByScore = [...mockUsers].sort((a, b) => b.highScore - a.highScore);
    const rank = sortedByScore.findIndex(u => u.id === userId) + 1;
    
    return {
      highScore: user.highScore,
      gamesPlayed: user.gamesPlayed,
      rank,
    };
  },
};

export type ApiClient = typeof apiClient;
