import React, { useMemo } from 'react';
import { Position, GameMode } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  mode: GameMode;
  isSpectator?: boolean;
  className?: string;
}

const CELL_SIZE = 20;

export function GameCanvas({ 
  snake, 
  food, 
  gridSize, 
  mode, 
  isSpectator = false,
  className 
}: GameCanvasProps) {
  const canvasSize = gridSize * CELL_SIZE;

  const snakeSet = useMemo(() => {
    const set = new Set<string>();
    snake.forEach(pos => set.add(`${pos.x},${pos.y}`));
    return set;
  }, [snake]);

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden crt-effect",
        mode === 'walls' ? "neon-border-pink" : "neon-border",
        isSpectator && "opacity-90",
        className
      )}
      style={{ 
        width: canvasSize, 
        height: canvasSize,
        background: 'hsl(var(--background))',
      }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 game-grid opacity-30"
        style={{
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      />

      {/* Walls indicator for walls mode */}
      {mode === 'walls' && (
        <div className="absolute inset-0 border-2 border-neon-pink/50 pointer-events-none" />
      )}

      {/* Food */}
      <div
        className="absolute rounded-full animate-pulse-neon"
        style={{
          left: food.x * CELL_SIZE + 2,
          top: food.y * CELL_SIZE + 2,
          width: CELL_SIZE - 4,
          height: CELL_SIZE - 4,
          backgroundColor: 'hsl(var(--food))',
          boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food-glow))',
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className={cn(
              "absolute rounded-sm transition-all duration-75",
              isHead && "rounded-md"
            )}
            style={{
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: isHead 
                ? 'hsl(var(--snake-glow))' 
                : 'hsl(var(--snake))',
              boxShadow: isHead 
                ? '0 0 15px hsl(var(--snake)), 0 0 30px hsl(var(--snake-glow))'
                : '0 0 5px hsl(var(--snake))',
              opacity: 1 - (index * 0.02),
            }}
          />
        );
      })}

      {/* Grid overlay for subtle effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.3) 100%)',
        }}
      />
    </div>
  );
}
