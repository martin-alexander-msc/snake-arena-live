import React from 'react';
import { GameStatus } from '@/types/game';
import { cn } from '@/lib/utils';
import { Skull, Pause, Play } from 'lucide-react';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
}

export function GameOverlay({ status, score }: GameOverlayProps) {
  if (status === 'playing') return null;

  return (
    <div 
      className={cn(
        "absolute inset-0 flex items-center justify-center z-10",
        "bg-background/80 backdrop-blur-sm rounded-lg"
      )}
    >
      <div className="text-center space-y-4">
        {status === 'idle' && (
          <>
            <div className="animate-float">
              <Play className="w-16 h-16 mx-auto text-primary neon-text" />
            </div>
            <p className="font-pixel text-lg text-foreground">Press SPACE to Start</p>
            <p className="text-muted-foreground text-sm">or use the controls</p>
          </>
        )}

        {status === 'paused' && (
          <>
            <Pause className="w-16 h-16 mx-auto text-accent animate-pulse-neon" />
            <p className="font-pixel text-lg text-foreground">PAUSED</p>
            <p className="text-muted-foreground text-sm">Press SPACE to resume</p>
          </>
        )}

        {status === 'game-over' && (
          <>
            <Skull className="w-16 h-16 mx-auto text-destructive animate-pulse" />
            <p className="font-pixel text-xl text-destructive neon-text-pink">GAME OVER</p>
            <div className="glass-card rounded-lg px-6 py-3 inline-block">
              <p className="text-muted-foreground text-sm">Final Score</p>
              <p className="font-pixel text-2xl text-primary neon-text">{score}</p>
            </div>
            <p className="text-muted-foreground text-sm">Press SPACE to play again</p>
          </>
        )}
      </div>
    </div>
  );
}
