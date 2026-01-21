import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { SnakeGame } from '@/components/game/SnakeGame';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { LiveGames } from '@/components/spectator/LiveGames';
import { AuthModal } from '@/components/auth/AuthModal';

type Tab = 'play' | 'leaderboard' | 'live';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('play');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenAuth={() => setIsAuthOpen(true)} />
      
      <main className="container mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-6">
          {activeTab === 'play' && (
            <div className="flex flex-col items-center">
              <SnakeGame />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="max-w-2xl mx-auto">
              <Leaderboard />
            </div>
          )}
          
          {activeTab === 'live' && (
            <div className="max-w-2xl mx-auto">
              <LiveGames />
            </div>
          )}
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
};

export default Index;
