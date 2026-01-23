import {
  User,
  AuthCredentials,
  SignUpCredentials,
  AuthResponse,
  LeaderboardEntry,
  LiveGame,
  GameMode
} from '@/types/game';

const API_BASE_URL = 'http://localhost:8081';
const STORAGE_KEY = 'snake_game_auth';

// In-memory state
let currentUser: User | null = null;
let authToken: string | null = null;

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
    localStorage.removeItem(STORAGE_KEY);
  }
};

initFromStorage();

/**
 * Helper to handle fetch responses and errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    // Handle Pydantic validation errors (array format)
    if (Array.isArray(data.detail)) {
      const errorMessages = data.detail.map((err: any) => err.msg).join(', ');
      throw new Error(errorMessages);
    }
    // Handle standard FastAPI errors (string format)
    throw new Error(data.detail || 'An unexpected error occurred');
  }

  return data;
}

/**
 * Centralized API client for all backend calls
 * Communicates with the FastAPI backend at http://localhost:8081
 */
export const apiClient = {
  // ==================== AUTH ====================

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse<AuthResponse>(response);

    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));

    return data;
  },

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse<AuthResponse>(response);

    currentUser = data.user;
    authToken = data.token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token: data.token }));

    return data;
  },

  async logout(): Promise<void> {
    if (authToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
    }

    currentUser = null;
    authToken = null;
    localStorage.removeItem(STORAGE_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    if (!authToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        await this.logout();
        return null;
      }

      currentUser = await handleResponse<User>(response);
      return currentUser;
    } catch {
      return currentUser; // Fallback to memory if offline/error but was previously authenticated
    }
  },

  isAuthenticated(): boolean {
    return currentUser !== null && authToken !== null;
  },

  // ==================== LEADERBOARD ====================

  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    const url = new URL(`${API_BASE_URL}/leaderboard`);
    if (mode) {
      url.searchParams.append('mode', mode);
    }

    const response = await fetch(url.toString());
    return handleResponse<LeaderboardEntry[]>(response);
  },

  async submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry | null> {
    if (!authToken) return null;

    const response = await fetch(`${API_BASE_URL}/leaderboard/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ score, mode }),
    });

    return handleResponse<LeaderboardEntry>(response);
  },

  // ==================== LIVE GAMES ====================

  async getLiveGames(): Promise<LiveGame[]> {
    const response = await fetch(`${API_BASE_URL}/live-games`);
    return handleResponse<LiveGame[]>(response);
  },

  async getLiveGame(gameId: string): Promise<LiveGame | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/live-games/${gameId}`);
      if (response.status === 404) return null;
      return handleResponse<LiveGame>(response);
    } catch {
      return null;
    }
  },

  async joinAsViewer(gameId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/live-games/${gameId}/join`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async leaveAsViewer(gameId: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/live-games/${gameId}/leave`, {
        method: 'POST',
      });
    } catch {
      // Ignore errors on leave
    }
  },

  // ==================== USER PROFILE ====================

  async updateProfile(updates: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User> {
    if (!authToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updates),
    });

    currentUser = await handleResponse<User>(response);

    // Update storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { token } = JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: currentUser, token }));
    }

    return currentUser;
  },

  async getUserStats(userId: string): Promise<{ highScore: number; gamesPlayed: number; rank: number }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
    return handleResponse<{ highScore: number; gamesPlayed: number; rank: number }>(response);
  },
};

export type ApiClient = typeof apiClient;
