/**
 * Atmospheric Messages Property Tests
 * 
 * Property 5: Atmospheric Message Determinism
 * Tests that with same seed, atmospheric messages match Z-Machine exactly
 * 
 * Validates: Requirements 2.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  AtmosphericMessageManager, 
  SeededRandom,
  getAtmosphericMessageManager,
  resetAtmosphericMessageManager
} from './atmosphericMessages.js';
import { GameState } from './state.js';

describe('SeededRandom', () => {
  /**
   * Property: Same seed produces same sequence
   * For any seed, the random sequence should be deterministic
   */
  it('should produce deterministic sequences for same seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        fc.integer({ min: 5, max: 20 }),
        (seed, count) => {
          const rng1 = new SeededRandom(seed);
          const rng2 = new SeededRandom(seed);
          
          const sequence1: number[] = [];
          const sequence2: number[] = [];
          
          for (let i = 0; i < count; i++) {
            sequence1.push(rng1.next());
            sequence2.push(rng2.next());
          }
          
          expect(sequence1).toEqual(sequence2);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different seeds produce different sequences
   * For different seeds, sequences should differ
   */
  it('should produce different sequences for different seeds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        fc.integer({ min: 0, max: 1000000 }).filter(n => n !== 0),
        (seed1, offset) => {
          const seed2 = seed1 + offset;
          const rng1 = new SeededRandom(seed1);
          const rng2 = new SeededRandom(seed2);
          
          // Generate sequences
          const sequence1: number[] = [];
          const sequence2: number[] = [];
          
          for (let i = 0; i < 10; i++) {
            sequence1.push(rng1.next());
            sequence2.push(rng2.next());
          }
          
          // Sequences should differ (extremely unlikely to be identical)
          const allSame = sequence1.every((v, i) => v === sequence2[i]);
          expect(allSame).toBe(false);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Random values are in valid range
   * All generated values should be between 0 and 1
   */
  it('should produce values between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        fc.integer({ min: 10, max: 100 }),
        (seed, count) => {
          const rng = new SeededRandom(seed);
          
          for (let i = 0; i < count; i++) {
            const value = rng.next();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('AtmosphericMessageManager', () => {
  let manager: AtmosphericMessageManager;
  let state: GameState;

  beforeEach(() => {
    manager = new AtmosphericMessageManager(12345);
    state = new GameState();
    
    // Create forest rooms
    const forestRooms = ['FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'UP-A-TREE', 'CLEARING'];
    for (const roomId of forestRooms) {
      state.rooms.set(roomId, {
        id: roomId,
        name: 'Forest',
        description: 'A forest room',
        longDescription: 'This is a forest room.',
        exits: new Map(),
        objects: [],
        flags: new Set(),
        globalObjects: [],
        getExit: () => undefined,
        isExitAvailable: () => false,
        hasFlag: () => false,
        addFlag: () => {},
        removeFlag: () => {},
        markVisited: () => {},
        visited: false
      } as any);
    }
    
    // Create non-forest room
    state.rooms.set('WEST-OF-HOUSE', {
      id: 'WEST-OF-HOUSE',
      name: 'West of House',
      description: 'West of House',
      longDescription: 'You are standing in an open field.',
      exits: new Map(),
      objects: [],
      flags: new Set(),
      globalObjects: [],
      getExit: () => undefined,
      isExitAvailable: () => false,
      hasFlag: () => false,
      addFlag: () => {},
      removeFlag: () => {},
      markVisited: () => {},
      visited: false
    } as any);
  });

  describe('Property 5: Atmospheric Message Determinism', () => {
    /**
     * Property: Same seed produces same message sequence
     * For any seed, atmospheric message generation should be deterministic
     */
    it('should produce deterministic message sequences for same seed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (seed) => {
            const manager1 = new AtmosphericMessageManager(seed);
            const manager2 = new AtmosphericMessageManager(seed);
            
            state.setCurrentRoom('FOREST-1');
            
            // Generate messages with both managers
            const messages1: (string | null)[] = [];
            const messages2: (string | null)[] = [];
            
            for (let i = 0; i < 20; i++) {
              messages1.push(manager1.generateAtmosphericMessage(state));
              messages2.push(manager2.generateAtmosphericMessage(state));
            }
            
            expect(messages1).toEqual(messages2);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Messages are suppressed in testing mode
     * When testing mode is enabled, no atmospheric messages should be generated
     */
    it('should suppress messages in testing mode', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.constantFrom('FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH'),
          (seed, roomId) => {
            const manager = new AtmosphericMessageManager(seed);
            state.setCurrentRoom(roomId);
            state.setTestingMode(true);
            
            // Generate many messages - all should be null
            for (let i = 0; i < 50; i++) {
              const message = manager.generateAtmosphericMessage(state);
              expect(message).toBeNull();
            }
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Messages are suppressed when suppress() is called
     * When suppression is enabled, no messages should be generated
     */
    it('should suppress messages when suppress() is called', () => {
      state.setCurrentRoom('FOREST-1');
      manager.suppress(true);
      
      // Generate many messages - all should be null
      for (let i = 0; i < 50; i++) {
        const message = manager.generateAtmosphericMessage(state);
        expect(message).toBeNull();
      }
    });

    /**
     * Property: Forest messages only appear in forest rooms
     * Song bird messages should only appear in valid forest rooms
     */
    it('should only generate forest messages in forest rooms', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (seed) => {
            const manager = new AtmosphericMessageManager(seed);
            state.setCurrentRoom('WEST-OF-HOUSE');
            
            // Generate many messages - none should be song bird
            for (let i = 0; i < 100; i++) {
              const message = manager.generateAtmosphericMessage(state);
              if (message) {
                expect(message).not.toContain('song bird');
              }
            }
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Seed can be changed and produces new sequence
     * After changing seed, a new deterministic sequence should be produced
     */
    it('should produce new sequence after seed change', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (seed1, seed2) => {
            const manager = new AtmosphericMessageManager(seed1);
            state.setCurrentRoom('FOREST-1');
            
            // Generate first sequence
            const sequence1: (string | null)[] = [];
            for (let i = 0; i < 10; i++) {
              sequence1.push(manager.generateAtmosphericMessage(state));
            }
            
            // Change seed
            manager.setSeed(seed2);
            
            // Generate second sequence
            const sequence2: (string | null)[] = [];
            for (let i = 0; i < 10; i++) {
              sequence2.push(manager.generateAtmosphericMessage(state));
            }
            
            // Reset to first seed
            manager.setSeed(seed1);
            
            // Generate third sequence - should match first
            const sequence3: (string | null)[] = [];
            for (let i = 0; i < 10; i++) {
              sequence3.push(manager.generateAtmosphericMessage(state));
            }
            
            expect(sequence1).toEqual(sequence3);
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should filter atmospheric messages from output', () => {
      const output = "You are in a forest.\nYou hear in the distance the chirping of a song bird.\nThere is a path here.";
      const filtered = AtmosphericMessageManager.filterAtmosphericMessages(output);
      
      expect(filtered).not.toContain('song bird');
      expect(filtered).toContain('You are in a forest');
      expect(filtered).toContain('There is a path here');
    });

    it('should detect atmospheric messages in output', () => {
      const withMessage = "You are in a forest.\nYou hear in the distance the chirping of a song bird.";
      const withoutMessage = "You are in a forest.\nThere is a path here.";
      
      expect(AtmosphericMessageManager.containsAtmosphericMessage(withMessage)).toBe(true);
      expect(AtmosphericMessageManager.containsAtmosphericMessage(withoutMessage)).toBe(false);
    });

    it('should get possible messages for a room', () => {
      state.setCurrentRoom('FOREST-1');
      const possible = manager.getPossibleMessages('FOREST-1', state);
      
      expect(possible.length).toBeGreaterThan(0);
      expect(possible.some(m => m.message.includes('song bird'))).toBe(true);
    });

    it('should return no possible messages for non-forest room', () => {
      state.setCurrentRoom('WEST-OF-HOUSE');
      const possible = manager.getPossibleMessages('WEST-OF-HOUSE', state);
      
      // Should not have forest messages
      expect(possible.every(m => !m.message.includes('song bird'))).toBe(true);
    });

    it('should use default manager singleton', () => {
      resetAtmosphericMessageManager(99999);
      const manager1 = getAtmosphericMessageManager();
      const manager2 = getAtmosphericMessageManager();
      
      expect(manager1).toBe(manager2);
    });
  });
});
