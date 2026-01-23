import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

describe('API Client', () => {
  beforeEach(async () => {
    // Logout before each test to reset state
    await apiClient.logout();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const result = await apiClient.login({
        email: 'snakemaster@game.com',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('snakemaster@game.com');
      expect(result.token).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      await expect(
        apiClient.login({
          email: 'snakemaster@game.com',
          password: 'short',
        })
      ).rejects.toThrow('String should have at least 6 characters');
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        apiClient.login({
          email: 'nonexistent@game.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should sign up with new credentials', async () => {
      const timestamp = Date.now();
      const result = await apiClient.signUp({
        username: `NewPlayer${timestamp}`,
        email: `newplayer${timestamp}@game.com`,
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe(`NewPlayer${timestamp}`);
      expect(result.user.email).toBe(`newplayer${timestamp}@game.com`);
      expect(result.user.highScore).toBe(0);
    });

    it('should reject signup with existing email', async () => {
      await expect(
        apiClient.signUp({
          username: 'NewPlayer',
          email: 'snakemaster@game.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email or username already exists');
    });

    it('should reject signup with short password', async () => {
      await expect(
        apiClient.signUp({
          username: 'InvalidPlayer',
          email: 'unique@game.com',
          password: 'short',
        })
      ).rejects.toThrow('String should have at least 6 characters');
    });

    it('should logout successfully', async () => {
      await apiClient.login({
        email: 'snakemaster@game.com',
        password: 'password123',
      });

      expect(apiClient.isAuthenticated()).toBe(true);

      await apiClient.logout();

      expect(apiClient.isAuthenticated()).toBe(false);
    });

    it('should get current user after login', async () => {
      await apiClient.login({
        email: 'snakemaster@game.com',
        password: 'password123',
      });

      const user = await apiClient.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('snakemaster@game.com');
    });

    it('should return null for current user when not logged in', async () => {
      const user = await apiClient.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('Leaderboard', () => {
    it('should get all leaderboard entries', async () => {
      const entries = await apiClient.getLeaderboard();

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].rank).toBe(1);
      expect(entries[0].score).toBeGreaterThanOrEqual(entries[1].score);
    });

    it('should filter by game mode', async () => {
      const wallsEntries = await apiClient.getLeaderboard('walls');
      const passEntries = await apiClient.getLeaderboard('pass-through');

      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);
      expect(passEntries.every(e => e.mode === 'pass-through')).toBe(true);
    });

    it('should submit score when authenticated', async () => {
      await apiClient.login({
        email: 'snakemaster@game.com',
        password: 'password123',
      });

      const entry = await apiClient.submitScore(500, 'pass-through');

      expect(entry).toBeDefined();
      expect(entry?.score).toBe(500);
      expect(entry?.mode).toBe('pass-through');
    });

    it('should not submit score when not authenticated', async () => {
      const entry = await apiClient.submitScore(500, 'pass-through');
      expect(entry).toBeNull();
    });
  });

  describe('Live Games', () => {
    it('should get live games', async () => {
      const games = await apiClient.getLiveGames();

      expect(games.length).toBeGreaterThan(0);
      expect(games[0].status).toBe('playing');
    });

    it('should get a specific live game', async () => {
      const games = await apiClient.getLiveGames();
      const game = await apiClient.getLiveGame(games[0].id);

      expect(game).toBeDefined();
      expect(game?.id).toBe(games[0].id);
    });

    it('should return null for non-existent game', async () => {
      const game = await apiClient.getLiveGame('non-existent-id');
      expect(game).toBeNull();
    });

    it('should join as viewer', async () => {
      const games = await apiClient.getLiveGames();
      const initialViewers = games[0].viewers;

      const success = await apiClient.joinAsViewer(games[0].id);

      expect(success).toBe(true);

      const updatedGame = await apiClient.getLiveGame(games[0].id);
      expect(updatedGame?.viewers).toBe(initialViewers + 1);
    });

    it('should leave as viewer', async () => {
      const games = await apiClient.getLiveGames();
      await apiClient.joinAsViewer(games[0].id);
      const viewersAfterJoin = (await apiClient.getLiveGame(games[0].id))?.viewers ?? 0;

      await apiClient.leaveAsViewer(games[0].id);

      const updatedGame = await apiClient.getLiveGame(games[0].id);
      expect(updatedGame?.viewers).toBe(viewersAfterJoin - 1);
    });
  });

  describe('User Profile', () => {
    it('should update profile when authenticated', async () => {
      await apiClient.login({
        email: 'snakemaster@game.com',
        password: 'password123',
      });

      const updatedUser = await apiClient.updateProfile({
        username: 'UpdatedMaster',
      });

      expect(updatedUser.username).toBe('UpdatedMaster');
    });

    it('should reject profile update when not authenticated', async () => {
      await expect(
        apiClient.updateProfile({ username: 'NewName' })
      ).rejects.toThrow('Not authenticated');
    });

    it('should get user stats', async () => {
      const stats = await apiClient.getUserStats('1');

      expect(stats.highScore).toBeDefined();
      expect(stats.gamesPlayed).toBeDefined();
      expect(stats.rank).toBeGreaterThan(0);
    });

    it('should reject stats for non-existent user', async () => {
      await expect(
        apiClient.getUserStats('non-existent')
      ).rejects.toThrow('User not found');
    });
  });
});
