import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Trophy, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface UserMenuProps {
  onOpenAuth: () => void;
}

export function UserMenu({ onOpenAuth }: UserMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
  };

  if (!isAuthenticated || !user) {
    return (
      <Button 
        onClick={onOpenAuth}
        variant="outline"
        className="border-primary text-primary hover:bg-primary/20 font-display"
      >
        <User className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <Avatar className="h-8 w-8 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary font-display text-sm">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-display text-sm text-foreground hidden sm:inline">
            {user.username}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-display text-foreground">{user.username}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer">
          <Trophy className="w-4 h-4 mr-2" />
          High Score: {user.highScore}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive hover:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
