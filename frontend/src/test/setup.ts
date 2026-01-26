import "@testing-library/jest-dom";
import { vi } from 'vitest';

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch state
const liveGameState = { id: 'game-1', hostId: '1', hostName: 'SnakeMaster', status: 'playing', viewers: 5, mode: 'walls' };

const fetchMock = vi.fn((url: string | URL, options: any) => {
  const urlObj = typeof url === 'string' ? new URL(url, 'http://localhost') : url;
  const path = urlObj.pathname;

  // Basic mock responses based on URL paths
  if (path.includes('/auth/login')) {
    const body = JSON.parse(options.body);
    if (body.password === 'short') {
      return Promise.resolve({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ detail: [{ msg: 'String should have at least 6 characters' }] }),
      });
    }
    if (body.email === 'nonexistent@game.com') {
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Invalid email or password' }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        user: { id: '1', username: 'SnakeMaster', email: body.email, highScore: 1000, gamesPlayed: 50, createdAt: new Date().toISOString() },
        token: 'mock-token'
      }),
    });
  }

  if (path.includes('/auth/signup')) {
    const body = JSON.parse(options.body);
    if (body.password === 'short') {
      return Promise.resolve({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ detail: [{ msg: 'String should have at least 6 characters' }] }),
      });
    }
    if (body.email === 'snakemaster@game.com') {
      return Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Email or username already exists' }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        user: { id: '2', username: body.username, email: body.email, highScore: 0, gamesPlayed: 0, createdAt: new Date().toISOString() },
        token: 'mock-token'
      }),
    });
  }

  if (path.includes('/auth/me')) {
    if (options.headers?.Authorization?.includes('mock-token')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '1', username: 'SnakeMaster', email: 'snakemaster@game.com', highScore: 1000, gamesPlayed: 50, createdAt: new Date().toISOString() }),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Not authenticated' }),
    });
  }

  if (path.includes('/leaderboard')) {
    if (options?.method === 'POST') {
      if (!options.headers?.Authorization) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: 'Not authenticated' }),
        });
      }
      const body = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'entry-1', rank: 1, userId: '1', username: 'SnakeMaster', score: body.score, mode: body.mode, date: new Date().toISOString() }),
      });
    }

    // Handle filtering by mode in leaderboard
    const modeFilter = urlObj.searchParams.get('mode');
    const entries = [
      { id: '1', rank: 1, userId: '1', username: 'SnakeMaster', score: 1000, mode: 'walls', date: new Date().toISOString() },
      { id: '2', rank: 2, userId: '2', username: 'Player2', score: 800, mode: 'pass-through', date: new Date().toISOString() }
    ];
    const filteredEntries = modeFilter ? entries.filter(e => e.mode === modeFilter) : entries;

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(filteredEntries),
    });
  }

  if (path.includes('/live-games')) {
    if (path.includes('non-existent-id')) {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ detail: 'Game not found' }) });
    }

    if (path.endsWith('/join')) {
      liveGameState.viewers++;
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ detail: 'Success' }) });
    }
    if (path.endsWith('/leave')) {
      liveGameState.viewers--;
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ detail: 'Success' }) });
    }
    if (path.includes('game-1')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ...liveGameState }) });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ ...liveGameState }]),
    });
  }

  if (path.includes('/users/profile')) {
    const body = JSON.parse(options.body);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1', username: body.username || 'SnakeMaster', email: 'snakemaster@game.com', highScore: 1000, gamesPlayed: 50, createdAt: new Date().toISOString() }),
    });
  }

  if (path.includes('/users/') && path.includes('/stats')) {
    if (path.includes('non-existent')) {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ detail: 'User not found' }) });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ highScore: 1000, gamesPlayed: 50, rank: 1 }),
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ detail: 'Not found' }),
  });
});

global.fetch = fetchMock as any;
(global as any).vi = vi;
