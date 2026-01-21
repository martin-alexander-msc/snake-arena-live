import React, { useEffect, useState } from 'react';
import { LiveGame } from '@/types/game';
import { apiClient } from '@/api/client';
import { LiveGameCard } from './LiveGameCard';
import { SpectatorView } from './SpectatorView';
import { Radio, Loader2 } from 'lucide-react';

interface LiveGamesProps {
  className?: string;
}

export function LiveGames({ className }: LiveGamesProps) {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchingGameId, setWatchingGameId] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.getLiveGames();
        setGames(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();

    // Refresh live games periodically
    const interval = setInterval(loadGames, 10000);
    return () => clearInterval(interval);
  }, []);

  if (watchingGameId) {
    return (
      <div className={className}>
        <SpectatorView 
          gameId={watchingGameId} 
          onClose={() => setWatchingGameId(null)} 
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-neon-cyan animate-pulse" />
        <h2 className="font-display text-xl neon-text-cyan">Live Games</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {games.length} active
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : games.length === 0 ? (
        <div className="glass-card rounded-lg p-8 text-center">
          <Radio className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No live games right now</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start playing to appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map(game => (
            <LiveGameCard
              key={game.id}
              game={game}
              onWatch={setWatchingGameId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
