import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveGame, Position, Direction } from '@/types/game';
import { apiClient } from '@/api/client';
import { generateFood } from './useGameLogic';

const GRID_SIZE = 20;
const AI_MOVE_INTERVAL = 120;

const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function getNextAIMove(snake: Position[], food: Position, currentDirection: Direction): Direction {
  const head = snake[0];
  
  // Simple AI: try to move towards food, avoiding immediate collisions
  const possibleMoves: Direction[] = DIRECTIONS.filter(dir => {
    // Don't go backwards
    if (
      (currentDirection === 'UP' && dir === 'DOWN') ||
      (currentDirection === 'DOWN' && dir === 'UP') ||
      (currentDirection === 'LEFT' && dir === 'RIGHT') ||
      (currentDirection === 'RIGHT' && dir === 'LEFT')
    ) {
      return false;
    }

    const vector = DIRECTION_VECTORS[dir];
    const newHead = {
      x: (head.x + vector.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + vector.y + GRID_SIZE) % GRID_SIZE,
    };

    // Check self collision
    return !snake.some(seg => seg.x === newHead.x && seg.y === newHead.y);
  });

  if (possibleMoves.length === 0) {
    return currentDirection;
  }

  // Prioritize moves towards food
  const movesWithDistances = possibleMoves.map(dir => {
    const vector = DIRECTION_VECTORS[dir];
    const newHead = {
      x: (head.x + vector.x + GRID_SIZE) % GRID_SIZE,
      y: (head.y + vector.y + GRID_SIZE) % GRID_SIZE,
    };
    const distance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
    return { dir, distance };
  });

  movesWithDistances.sort((a, b) => a.distance - b.distance);
  
  // Add some randomness to make it more interesting
  if (Math.random() < 0.2 && movesWithDistances.length > 1) {
    return movesWithDistances[1].dir;
  }

  return movesWithDistances[0].dir;
}

export function useSpectatorGame(gameId: string | null) {
  const [game, setGame] = useState<LiveGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<Direction>('RIGHT');
  const animationRef = useRef<number | null>(null);
  const lastMoveRef = useRef<number>(0);

  const loadGame = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const liveGame = await apiClient.getLiveGame(id);
      if (liveGame) {
        setGame(liveGame);
        await apiClient.joinAsViewer(id);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }

    return () => {
      if (gameId) {
        apiClient.leaveAsViewer(gameId);
      }
    };
  }, [gameId, loadGame]);

  // AI game loop for spectator mode
  useEffect(() => {
    if (!game || game.status !== 'playing') return;

    const animate = (timestamp: number) => {
      if (timestamp - lastMoveRef.current >= AI_MOVE_INTERVAL) {
        lastMoveRef.current = timestamp;

        setGame(prev => {
          if (!prev) return prev;

          const newDirection = getNextAIMove(prev.snake, prev.food, currentDirection);
          setCurrentDirection(newDirection);

          const head = prev.snake[0];
          const vector = DIRECTION_VECTORS[newDirection];
          
          const newHead = {
            x: (head.x + vector.x + GRID_SIZE) % GRID_SIZE,
            y: (head.y + vector.y + GRID_SIZE) % GRID_SIZE,
          };

          // Check self collision
          if (prev.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            // Reset game state for continuous demo
            return {
              ...prev,
              snake: [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 },
              ],
              food: generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]),
              score: 0,
            };
          }

          const ate = newHead.x === prev.food.x && newHead.y === prev.food.y;
          const newSnake = ate ? [newHead, ...prev.snake] : [newHead, ...prev.snake.slice(0, -1)];
          const newScore = ate ? prev.score + 10 : prev.score;
          const newFood = ate ? generateFood(newSnake) : prev.food;

          return {
            ...prev,
            snake: newSnake,
            food: newFood,
            score: newScore,
          };
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [game?.status, currentDirection]);

  return { game, isLoading };
}
