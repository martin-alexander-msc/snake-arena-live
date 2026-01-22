import { describe, it, expect } from 'vitest';
import { 
  createInitialState, 
  generateFood, 
  moveSnake, 
  isValidDirectionChange 
} from '@/hooks/useGameLogic';
import { Position, Direction, GameMode } from '@/types/game';

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('should create initial state for pass-through mode', () => {
      const state = createInitialState('pass-through');
      
      expect(state.mode).toBe('pass-through');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
      expect(state.food).toBeDefined();
    });

    it('should create initial state for walls mode', () => {
      const state = createInitialState('walls');
      
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
    });

    it('should position snake in the center', () => {
      const state = createInitialState('pass-through');
      const head = state.snake[0];
      
      expect(head.x).toBe(10);
      expect(head.y).toBe(10);
    });
  });

  describe('generateFood', () => {
    it('should generate food position not on snake', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(isOnSnake).toBe(false);
      }
    });

    it('should generate food within grid bounds', () => {
      const snake: Position[] = [{ x: 0, y: 0 }];
      
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        expect(food.x).toBeGreaterThanOrEqual(0);
        expect(food.x).toBeLessThan(20);
        expect(food.y).toBeGreaterThanOrEqual(0);
        expect(food.y).toBeLessThan(20);
      }
    });
  });

  describe('moveSnake', () => {
    describe('pass-through mode', () => {
      const mode: GameMode = 'pass-through';

      it('should move snake in the given direction', () => {
        const snake: Position[] = [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'RIGHT', mode, food);
        
        expect(result.newSnake[0]).toEqual({ x: 11, y: 10 });
        expect(result.collision).toBe(false);
        expect(result.ate).toBe(false);
      });

      it('should wrap around when hitting wall', () => {
        const snake: Position[] = [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'RIGHT', mode, food);
        
        expect(result.newSnake[0]).toEqual({ x: 0, y: 10 });
        expect(result.collision).toBe(false);
      });

      it('should wrap around for all directions', () => {
        // Test UP wrap
        let result = moveSnake([{ x: 10, y: 0 }, { x: 10, y: 1 }], 'UP', mode, { x: 0, y: 0 });
        expect(result.newSnake[0].y).toBe(19);

        // Test DOWN wrap
        result = moveSnake([{ x: 10, y: 19 }, { x: 10, y: 18 }], 'DOWN', mode, { x: 0, y: 0 });
        expect(result.newSnake[0].y).toBe(0);

        // Test LEFT wrap
        result = moveSnake([{ x: 0, y: 10 }, { x: 1, y: 10 }], 'LEFT', mode, { x: 5, y: 5 });
        expect(result.newSnake[0].x).toBe(19);
      });

      it('should grow snake when eating food', () => {
        const snake: Position[] = [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ];
        const food: Position = { x: 11, y: 10 };
        
        const result = moveSnake(snake, 'RIGHT', mode, food);
        
        expect(result.ate).toBe(true);
        expect(result.newSnake.length).toBe(3);
      });

      it('should detect self collision', () => {
        const snake: Position[] = [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'DOWN', mode, food);
        
        expect(result.collision).toBe(true);
      });
    });

    describe('walls mode', () => {
      const mode: GameMode = 'walls';

      it('should detect wall collision on right', () => {
        const snake: Position[] = [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'RIGHT', mode, food);
        
        expect(result.collision).toBe(true);
      });

      it('should detect wall collision on left', () => {
        const snake: Position[] = [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
        ];
        const food: Position = { x: 5, y: 5 };
        
        const result = moveSnake(snake, 'LEFT', mode, food);
        
        expect(result.collision).toBe(true);
      });

      it('should detect wall collision on top', () => {
        const snake: Position[] = [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'UP', mode, food);
        
        expect(result.collision).toBe(true);
      });

      it('should detect wall collision on bottom', () => {
        const snake: Position[] = [
          { x: 10, y: 19 },
          { x: 10, y: 18 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'DOWN', mode, food);
        
        expect(result.collision).toBe(true);
      });

      it('should allow normal movement within bounds', () => {
        const snake: Position[] = [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ];
        const food: Position = { x: 0, y: 0 };
        
        const result = moveSnake(snake, 'RIGHT', mode, food);
        
        expect(result.collision).toBe(false);
        expect(result.newSnake[0]).toEqual({ x: 11, y: 10 });
      });
    });
  });

  describe('isValidDirectionChange', () => {
    it('should allow perpendicular direction changes', () => {
      expect(isValidDirectionChange('RIGHT', 'UP')).toBe(true);
      expect(isValidDirectionChange('RIGHT', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'RIGHT')).toBe(true);
    });

    it('should disallow opposite direction changes', () => {
      expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
      expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
      expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
      expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    });

    it('should allow same direction', () => {
      expect(isValidDirectionChange('RIGHT', 'RIGHT')).toBe(true);
      expect(isValidDirectionChange('UP', 'UP')).toBe(true);
      expect(isValidDirectionChange('LEFT', 'LEFT')).toBe(true);
      expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
    });
  });
});
