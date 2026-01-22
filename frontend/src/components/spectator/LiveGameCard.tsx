import React from 'react';
import { LiveGame } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Clock, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveGameCardProps {
  game: LiveGame;
  onWatch: (gameId: string) => void;
}

export function LiveGameCard({ game, onWatch }: LiveGameCardProps) {
  const playTime = Math.floor((Date.now() - new Date(game.startedAt).getTime()) / 60000);

  return (
    <div className="glass-card rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarFallback className="bg-primary/20 text-primary font-display text-sm">
            {game.playerName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm text-foreground truncate">
              {game.playerName}
            </p>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-display",
              game.mode === 'walls' 
                ? "bg-neon-pink/20 text-neon-pink" 
                : "bg-primary/20 text-primary"
            )}>
              {game.mode === 'walls' ? 'Walls' : 'Pass'}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              {game.score} pts
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {game.viewers}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {playTime}m
            </span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="border-accent text-accent hover:bg-accent/20 font-display text-xs"
          onClick={() => onWatch(game.id)}
        >
          <Eye className="w-3 h-3 mr-1" />
          Watch
        </Button>
      </div>
      
      {/* Mini preview */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary animate-pulse-neon"
          style={{ width: `${Math.min(game.score / 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
