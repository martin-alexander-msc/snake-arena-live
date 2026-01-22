import React from 'react';
import { LiveGame } from '@/types/game';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Eye, Gamepad2 } from 'lucide-react';
import { useSpectatorGame } from '@/hooks/useSpectatorGame';
import { cn } from '@/lib/utils';

interface SpectatorViewProps {
  gameId: string;
  onClose: () => void;
}

export function SpectatorView({ gameId, onClose }: SpectatorViewProps) {
  const { game, isLoading } = useSpectatorGame(gameId);

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="glass-card rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Game not found</p>
        <Button onClick={onClose} className="mt-4">Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-accent">
            <AvatarFallback className="bg-accent/20 text-accent font-display">
              {game.playerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-foreground">{game.playerName}</p>
              <span className="flex items-center gap-1 text-xs text-neon-cyan">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={cn(
                "px-2 py-0.5 rounded font-display",
                game.mode === 'walls' 
                  ? "bg-neon-pink/20 text-neon-pink" 
                  : "bg-primary/20 text-primary"
              )}>
                {game.mode === 'walls' ? 'Walls' : 'Pass-Through'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {game.viewers} watching
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Score */}
      <div className="glass-card rounded-lg p-3 mb-4 text-center">
        <p className="text-muted-foreground text-xs mb-1">SCORE</p>
        <p className="font-pixel text-2xl neon-text text-primary">{game.score}</p>
      </div>

      {/* Game View */}
      <div className="flex justify-center">
        <GameCanvas
          snake={game.snake}
          food={game.food}
          gridSize={20}
          mode={game.mode}
          isSpectator
        />
      </div>

      {/* Spectator Notice */}
      <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
        <Gamepad2 className="w-3 h-3" />
        You are watching this game live
      </p>
    </div>
  );
}
