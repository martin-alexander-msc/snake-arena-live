import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode, GameStatus } from '@/types/game';
import { Play, Pause, RotateCcw, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export function GameControls({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Score Display */}
      <div className="glass-card rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm font-medium mb-1">SCORE</p>
        <p className="font-pixel text-3xl neon-text text-primary">{score}</p>
      </div>

      {/* Mode Selector */}
      <div className="glass-card rounded-lg p-4">
        <p className="text-muted-foreground text-sm font-medium mb-3 text-center">GAME MODE</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 text-xs font-display transition-all",
              mode === 'pass-through' && "bg-primary/20 border-primary text-primary neon-border"
            )}
            onClick={() => onModeChange('pass-through')}
            disabled={status === 'playing'}
          >
            Pass-Through
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 text-xs font-display transition-all",
              mode === 'walls' && "bg-neon-pink/20 border-neon-pink text-neon-pink neon-border-pink"
            )}
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
          >
            Walls
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="glass-card rounded-lg p-4 flex flex-col gap-2">
        {status === 'idle' || status === 'game-over' ? (
          <Button 
            onClick={onStart}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display gap-2"
          >
            <Play className="w-4 h-4" />
            {status === 'game-over' ? 'Play Again' : 'Start Game'}
          </Button>
        ) : (
          <Button 
            onClick={onPause}
            variant="outline"
            className="w-full font-display gap-2 border-accent text-accent hover:bg-accent/20"
          >
            {status === 'paused' ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>
        )}
        
        <Button 
          onClick={onReset}
          variant="ghost"
          className="w-full font-display gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Controls Help */}
      <div className="glass-card rounded-lg p-4">
        <p className="text-muted-foreground text-xs font-medium mb-2 flex items-center gap-2">
          <Gamepad2 className="w-3 h-3" />
          CONTROLS
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>↑ ↓ ← → or WASD to move</p>
          <p>SPACE to start/pause</p>
          <p>ESC to reset</p>
        </div>
      </div>
    </div>
  );
}
