import React, { useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameControls } from './GameControls';
import { GameOverlay } from './GameOverlay';
import { MobileControls } from './MobileControls';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export function SnakeGame() {
  const { gameState, startGame, pauseGame, resetGame, setMode, changeDirection, gridSize } = useGameLogic();
  const { isAuthenticated, user } = useAuth();
  const [isShaking, setIsShaking] = React.useState(false);

  // Submit score when game ends and handle shake effect
  useEffect(() => {
    if (gameState.status === 'game-over') {
      // Trigger shake animation
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 1000);

      if (gameState.score > 0) {
        if (isAuthenticated) {
          apiClient.submitScore(gameState.score, gameState.mode).then((entry) => {
            if (entry) {
              toast.success(`Score submitted: ${gameState.score}`, {
                description: 'Check the leaderboard to see your ranking!',
              });
            }
          });
        } else {
          toast.info('Sign in to save your score!', {
            description: `You scored ${gameState.score} points`,
          });
        }
      }

      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.score, gameState.mode, isAuthenticated]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Game Area */}
      <div className={`relative ${isShaking ? 'animate-shake' : ''}`}>
        <GameCanvas
          snake={gameState.snake}
          food={gameState.food}
          gridSize={gridSize}
          mode={gameState.mode}
        />
        <GameOverlay
          status={gameState.status}
          score={gameState.score}
          onStart={startGame}
        />
        <MobileControls onDirectionChange={changeDirection} />
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-48">
        <GameControls
          status={gameState.status}
          mode={gameState.mode}
          score={gameState.score}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
          onModeChange={setMode}
        />
      </div>
    </div>
  );
}
