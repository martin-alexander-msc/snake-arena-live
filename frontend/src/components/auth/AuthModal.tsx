import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center neon-text">
            {view === 'login' ? 'Welcome Back' : 'Join the Game'}
          </DialogTitle>
        </DialogHeader>

        {view === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess} 
            onSwitchToSignUp={() => setView('signup')} 
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess} 
            onSwitchToLogin={() => setView('login')} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
