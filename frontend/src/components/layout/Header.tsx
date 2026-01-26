import React from 'react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Gamepad2 } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

export function Header({ onOpenAuth }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 neon-border">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold neon-text text-primary">
              THE NEON SNAKE
            </h1>
            <p className="text-xs text-muted-foreground">Arcade Edition</p>
          </div>
        </div>

        <UserMenu onOpenAuth={onOpenAuth} />
      </div>
    </header>
  );
}
