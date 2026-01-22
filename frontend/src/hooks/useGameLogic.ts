import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode, GameStatus } from '@/types/game';
import { audioService } from '@/utils/audio';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const createInitialState = (mode: GameMode): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]),
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  status: 'idle',
  mode,
  speed: INITIAL_SPEED,
});

export function generateFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
}

export function moveSnake(
  snake: Position[],
  direction: Direction,
  mode: GameMode,
  food: Position
): { newSnake: Position[]; ate: boolean; collision: boolean } {
  const head = snake[0];
  const vector = DIRECTION_VECTORS[direction];

  let newHead: Position = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  // Handle wall collision based on mode
  if (mode === 'pass-through') {
    newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
    newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
  } else {
    // Walls mode - check for wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      return { newSnake: snake, ate: false, collision: true };
    }
  }

  // Check for self collision (exclude tail as it will move)
  const bodyToCheck = snake.slice(0, -1);
  if (bodyToCheck.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { newSnake: snake, ate: false, collision: true };
  }

  const ate = newHead.x === food.x && newHead.y === food.y;
  const newSnake = ate ? [newHead, ...snake] : [newHead, ...snake.slice(0, -1)];

  return { newSnake, ate, collision: false };
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== OPPOSITE_DIRECTIONS[current];
}

export function useGameLogic(initialMode: GameMode = 'pass-through') {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(prev.mode),
      status: 'playing',
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => createInitialState(prev.mode));
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...createInitialState(mode),
    }));
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      if (!isValidDirectionChange(prev.direction, newDirection)) return prev;
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      if (timestamp - lastUpdateRef.current < prev.speed) {
        return prev;
      }
      lastUpdateRef.current = timestamp;

      const { newSnake, ate, collision } = moveSnake(
        prev.snake,
        prev.nextDirection,
        prev.mode,
        prev.food
      );

      if (collision) {
        audioService.playGameOverSound();
        return { ...prev, status: 'game-over' };
      }

      if (ate) {
        audioService.playEatSound();
      }

      const newScore = ate ? prev.score + 10 : prev.score;
      const newSpeed = ate ? Math.max(MIN_SPEED, prev.speed - SPEED_INCREMENT) : prev.speed;
      const newFood = ate ? generateFood(newSnake) : prev.food;

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        direction: prev.nextDirection,
        score: newScore,
        speed: newSpeed,
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.status === 'idle' || gameState.status === 'game-over') {
            startGame();
          } else {
            pauseGame();
          }
          break;
        case 'Escape':
          e.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, startGame, pauseGame, resetGame, gameState.status]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    changeDirection,
    gridSize: GRID_SIZE,
  };
}
