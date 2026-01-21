import { test, expect } from "../playwright-fixture";

test.describe("Snake Game", () => {
  test("should display game UI elements", async ({ page }) => {
    await page.goto("/");

    // Verify header elements
    await expect(page.getByText("NEON SNAKE")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // Verify navigation tabs
    await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /leaderboard/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /live games/i })).toBeVisible();

    // Verify game controls
    await expect(page.getByText("SCORE")).toBeVisible();
    await expect(page.getByText("GAME MODE")).toBeVisible();
    await expect(page.getByRole("button", { name: /start game/i })).toBeVisible();
  });

  test("should start and play the game", async ({ page }) => {
    await page.goto("/");

    // Start the game
    await page.getByRole("button", { name: /start game/i }).click();

    // Verify game is playing (overlay should be hidden)
    await expect(page.getByText("Press SPACE to Start")).not.toBeVisible();

    // Pause the game
    await page.keyboard.press("Space");
    await expect(page.getByText("PAUSED")).toBeVisible();

    // Resume the game
    await page.keyboard.press("Space");
    await expect(page.getByText("PAUSED")).not.toBeVisible();
  });

  test("should switch game modes", async ({ page }) => {
    await page.goto("/");

    // Check initial mode (pass-through)
    const passButton = page.getByRole("button", { name: /pass-through/i });
    const wallsButton = page.getByRole("button", { name: /walls/i });

    // Switch to walls mode
    await wallsButton.click();
    
    // Start and verify mode change affects gameplay visuals
    await expect(wallsButton).toHaveClass(/bg-neon-pink/);
  });

  test("should navigate between tabs", async ({ page }) => {
    await page.goto("/");

    // Click Leaderboard tab
    await page.getByRole("button", { name: /leaderboard/i }).click();
    await expect(page.getByText("SnakeMaster")).toBeVisible();

    // Click Live Games tab
    await page.getByRole("button", { name: /live games/i }).click();
    await expect(page.getByText("NeonViper")).toBeVisible();

    // Click back to Play tab
    await page.getByRole("button", { name: /play/i }).click();
    await expect(page.getByRole("button", { name: /start game/i })).toBeVisible();
  });
});

test.describe("Leaderboard", () => {
  test("should display leaderboard entries", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /leaderboard/i }).click();

    // Check for ranked players
    await expect(page.getByText("SnakeMaster")).toBeVisible();
    await expect(page.getByText("NeonViper")).toBeVisible();
    await expect(page.getByText("PixelPython")).toBeVisible();
  });

  test("should filter by game mode", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /leaderboard/i }).click();

    // Filter by Walls mode
    await page.getByRole("button", { name: /walls/i }).click();

    // Entries should show "Walls" mode
    const entries = page.locator("text=Walls").first();
    await expect(entries).toBeVisible();
  });
});

test.describe("Live Games", () => {
  test("should display live games", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /live games/i }).click();

    // Check for live games
    await expect(page.getByText("NeonViper")).toBeVisible();
    await expect(page.getByText("PixelPython")).toBeVisible();
  });

  test("should open spectator view", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /live games/i }).click();

    // Click watch on first game
    await page.getByRole("button", { name: /watch/i }).first().click();

    // Verify spectator view is shown
    await expect(page.getByText("LIVE")).toBeVisible();
    await expect(page.getByText("You are watching this game live")).toBeVisible();

    // Close spectator view
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-x") }).click();

    // Back to live games list
    await expect(page.getByText("active")).toBeVisible();
  });
});

test.describe("Authentication", () => {
  test("should open auth modal on sign in click", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("should switch between login and signup forms", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Welcome Back")).toBeVisible();

    // Switch to signup
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page.getByText("Join the Game")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();

    // Switch back to login
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Welcome Back")).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /sign in/i }).click();

    await page.getByLabel("Email").fill("snakemaster@game.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Should see username in header after login
    await expect(page.getByText("SnakeMaster")).toBeVisible({ timeout: 5000 });
  });

  test("should sign up new user", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByRole("button", { name: /sign up/i }).click();

    const uniqueId = Date.now();
    await page.getByLabel("Username").fill(`TestPlayer${uniqueId}`);
    await page.getByLabel("Email").fill(`test${uniqueId}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    // Should see username in header after signup
    await expect(page.getByText(`TestPlayer${uniqueId}`)).toBeVisible({ timeout: 5000 });
  });
});
