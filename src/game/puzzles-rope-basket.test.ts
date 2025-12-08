/**
 * Rope and Basket Puzzle Tests
 * Tests the rope tying and basket mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialGameState } from './factories/gameFactory.js';
import { RopeBasketPuzzle } from './puzzles.js';
import { GameState } from './state.js';

describe('Rope and Basket Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState();
    // Set up: player in DOME-ROOM with rope
    state.currentRoom = 'DOME-ROOM';
    state.moveObject('ROPE', 'PLAYER');
  });

  describe('Tying the rope', () => {
    it('should tie rope to railing successfully', () => {
      const result = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('The rope drops over the side and comes within ten feet of the floor.');
      expect(state.getGlobalVariable('ROPE_TIED')).toBe(true);
      expect(state.getFlag('DOME_FLAG')).toBe(true);
    });

    it('should fail if rope is not in inventory', () => {
      state.moveObject('ROPE', 'ATTIC');
      
      const result = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("You don't have the rope.");
    });

    it('should fail if rope is already tied', () => {
      // Tie rope first time
      RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      // Move rope back to player inventory for second attempt
      state.moveObject('ROPE', 'PLAYER');
      
      // Try to tie again
      const result = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('The rope is already tied to it.');
    });

    it('should fail if trying to tie to wrong object', () => {
      const result = RopeBasketPuzzle.tieRope(state, 'ROPE', 'MAILBOX');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("You can't tie the rope to that.");
    });

    it('should move rope to room when tied', () => {
      RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      const rope = state.getObject('ROPE');
      expect(rope?.location).toBe('DOME-ROOM');
    });
  });

  describe('Taking the rope', () => {
    it('should prevent taking rope when tied', () => {
      // Tie the rope
      RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      // Try to take it
      const result = RopeBasketPuzzle.takeRope(state);
      
      expect(result).not.toBeNull();
      expect(result?.success).toBe(false);
      expect(result?.message).toBe('The rope is tied to the railing.');
    });

    it('should return null if rope is not tied', () => {
      const result = RopeBasketPuzzle.takeRope(state);
      
      expect(result).toBeNull();
    });
  });

  describe('Climbing the rope', () => {
    it('should allow climbing when rope is tied', () => {
      // Tie the rope
      RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      // Climb it
      const result = RopeBasketPuzzle.climbRope(state);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('You climb down the rope.');
    });

    it('should fail if rope is not tied', () => {
      const result = RopeBasketPuzzle.climbRope(state);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("The rope isn't tied to anything.");
    });
  });

  describe('Untying the rope', () => {
    it('should untie rope successfully', () => {
      // Tie the rope first
      RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      
      // Untie it
      const result = RopeBasketPuzzle.untieRope(state);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('The rope is now untied.');
      expect(state.getGlobalVariable('ROPE_TIED')).toBe(false);
      expect(state.getFlag('DOME_FLAG')).toBe(false);
    });

    it('should fail if rope is not tied', () => {
      const result = RopeBasketPuzzle.untieRope(state);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("It is not tied to anything.");
    });
  });

  describe('Integration test', () => {
    it('should complete full rope puzzle sequence', () => {
      // 1. Tie rope
      const tieResult = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      expect(tieResult.success).toBe(true);
      expect(tieResult.message).toBe('The rope drops over the side and comes within ten feet of the floor.');
      
      // 2. Try to tie again (should fail)
      state.moveObject('ROPE', 'PLAYER'); // Move back to inventory
      const tieAgainResult = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
      expect(tieAgainResult.success).toBe(false);
      expect(tieAgainResult.message).toBe('The rope is already tied to it.');
      
      // 3. Try to take rope (should fail)
      const takeResult = RopeBasketPuzzle.takeRope(state);
      expect(takeResult?.success).toBe(false);
      expect(takeResult?.message).toBe('The rope is tied to the railing.');
      
      // 4. Climb rope
      const climbResult = RopeBasketPuzzle.climbRope(state);
      expect(climbResult.success).toBe(true);
      
      // 5. Untie rope
      const untieResult = RopeBasketPuzzle.untieRope(state);
      expect(untieResult.success).toBe(true);
      expect(state.getGlobalVariable('ROPE_TIED')).toBe(false);
    });
  });
});
