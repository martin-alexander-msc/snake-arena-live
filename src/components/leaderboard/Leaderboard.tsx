import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.getLeaderboard(modeFilter === 'all' ? undefined : modeFilter);
        setEntries(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [modeFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-neon-pink" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-display">{rank}</span>;
    }
  };

  return (
    <div className={cn("glass-card rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl neon-text-cyan flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </h2>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-display",
              modeFilter === 'all' && "bg-accent/30 text-accent"
            )}
            onClick={() => setModeFilter('all')}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-display",
              modeFilter === 'pass-through' && "bg-primary/30 text-primary"
            )}
            onClick={() => setModeFilter('pass-through')}
          >
            Pass
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs font-display",
              modeFilter === 'walls' && "bg-neon-pink/30 text-neon-pink"
            )}
            onClick={() => setModeFilter('walls')}
          >
            Walls
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                entry.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-muted text-xs font-display">
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-foreground truncate">
                  {entry.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  "font-pixel text-sm",
                  entry.mode === 'walls' ? "text-neon-pink" : "text-primary"
                )}>
                  {entry.score}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {entry.mode.replace('-', ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
