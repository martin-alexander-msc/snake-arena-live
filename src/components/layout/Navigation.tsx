import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'play' | 'leaderboard' | 'live';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'play' as const, label: 'Play', icon: Gamepad2 },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { id: 'live' as const, label: 'Live Games', icon: Radio },
  ];

  return (
    <nav className="flex justify-center gap-2 py-4">
      {tabs.map(tab => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "font-display gap-2 transition-all",
            activeTab === tab.id 
              ? "bg-primary/20 text-primary neon-border" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </nav>
  );
}
