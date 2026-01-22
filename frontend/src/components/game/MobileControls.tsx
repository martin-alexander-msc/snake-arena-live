import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Direction } from '@/types/game';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
}

export function MobileControls({ onDirectionChange }: MobileControlsProps) {
  return (
    <div className="md:hidden glass-card rounded-lg p-4 mt-4">
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 border-primary/50 hover:bg-primary/20"
          onClick={() => onDirectionChange('UP')}
        >
          <ChevronUp className="h-8 w-8 text-primary" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 border-primary/50 hover:bg-primary/20"
          onClick={() => onDirectionChange('LEFT')}
        >
          <ChevronLeft className="h-8 w-8 text-primary" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 border-primary/50 hover:bg-primary/20"
          onClick={() => onDirectionChange('RIGHT')}
        >
          <ChevronRight className="h-8 w-8 text-primary" />
        </Button>
        <div />
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 border-primary/50 hover:bg-primary/20"
          onClick={() => onDirectionChange('DOWN')}
        >
          <ChevronDown className="h-8 w-8 text-primary" />
        </Button>
        <div />
      </div>
    </div>
  );
}
