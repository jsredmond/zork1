/**
 * Property-based tests for GameState
 * Tests game initialization and state management
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { RoomImpl, Direction } from './rooms.js';
import { ObjectFlag, RoomFlag, INITIAL_GLOBAL_FLAGS } from './data/flags.js';

/**
 * Generator for creating test game objects
 */
const gameObjectGenerator = (): fc.Arbitrary<GameObjectImpl> => {
  return fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    synonyms: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    adjectives: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    location: fc.oneof(
      fc.constant(null),
      fc.string({ minLength: 1, maxLength: 20 })
    ),
    flags: fc.array(fc.constantFrom(...Object.values(ObjectFlag)), { maxLength: 5 }),
    capacity: fc.option(fc.integer({ min: 0, max: 100 })),
    size: fc.option(fc.integer({ min: 0, max: 100 })),
    value: fc.option(fc.integer({ min: 0, max: 100 }))
  }).map(data => new GameObjectImpl(data));
};

/**
 * Generator for creating test rooms
 */
const roomGenerator = (): fc.Arbitrary<RoomImpl> => {
  return fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    objects: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    visited: fc.boolean(),
    flags: fc.array(fc.constantFrom(...Object.values(RoomFlag)), { maxLength: 3 })
  }).map(data => new RoomImpl(data));
};

describe('GameState Property Tests', () => {
  // Feature: modern-zork-rewrite, Property 1: Game initialization consistency
  it('should always initialize to original Zork I starting conditions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string({ minLength: 1 }), gameObjectGenerator()), { minLength: 0, maxLength: 20 }),
        fc.array(fc.tuple(fc.string({ minLength: 1 }), roomGenerator()), { minLength: 1, maxLength: 20 }),
        (objectEntries, roomEntries) => {
          // Create maps from the generated entries
          const objects = new Map(objectEntries);
          const rooms = new Map(roomEntries);
          
          // Ensure WEST-OF-HOUSE room exists
          if (!rooms.has('WEST-OF-HOUSE')) {
            rooms.set('WEST-OF-HOUSE', new RoomImpl({
              id: 'WEST-OF-HOUSE',
              name: 'West of House',
              description: 'You are standing in an open field west of a white house.'
            }));
          }

          // Create initial state
          const state = GameState.createInitialState(objects, rooms);

          // Verify all initial conditions match original Zork I
          expect(state.currentRoom).toBe('WEST-OF-HOUSE');
          expect(state.score).toBe(0);
          expect(state.moves).toBe(0);
          expect(state.inventory).toEqual([]);
          expect(state.isInventoryEmpty()).toBe(true);
          
          // Verify all global flags are initialized to false
          expect(state.flags.CYCLOPS_FLAG).toBe(false);
          expect(state.flags.DEFLATE).toBe(false);
          expect(state.flags.DOME_FLAG).toBe(false);
          expect(state.flags.EMPTY_HANDED).toBe(false);
          expect(state.flags.LLD_FLAG).toBe(false);
          expect(state.flags.LOW_TIDE).toBe(false);
          expect(state.flags.MAGIC_FLAG).toBe(false);
          expect(state.flags.RAINBOW_FLAG).toBe(false);
          expect(state.flags.TROLL_FLAG).toBe(false);
          expect(state.flags.WON_FLAG).toBe(false);
          expect(state.flags.COFFIN_CURE).toBe(false);

          // Verify objects and rooms are properly stored
          expect(state.objects).toBe(objects);
          expect(state.rooms).toBe(rooms);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent state when creating with explicit parameters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 10000 }),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
        (roomId, score, moves, inventory) => {
          const state = new GameState({
            currentRoom: roomId,
            score,
            moves,
            inventory,
            objects: new Map(),
            rooms: new Map()
          });

          expect(state.currentRoom).toBe(roomId);
          expect(state.score).toBe(score);
          expect(state.moves).toBe(moves);
          expect(state.inventory).toEqual(inventory);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('SeededRandom Tests', () => {
  // Feature: parity-phase-3, Property 1: Seeded RNG Reproducibility
  // For any seed value, running the same command sequence twice with that seed
  // SHALL produce identical combat outcomes.
  
  it('should produce same sequence with same seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 5, max: 20 }),
        (seed, count) => {
          const state1 = new GameState();
          const state2 = new GameState();
          
          state1.setSeed(seed);
          state2.setSeed(seed);
          
          // Generate sequences from both states
          const sequence1: number[] = [];
          const sequence2: number[] = [];
          
          for (let i = 0; i < count; i++) {
            sequence1.push(state1.random());
            sequence2.push(state2.random());
          }
          
          // Sequences should be identical
          expect(sequence1).toEqual(sequence2);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce different sequences with different seeds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 5, max: 20 }),
        (seed1, seed2, count) => {
          // Skip if seeds are the same
          fc.pre(seed1 !== seed2);
          
          const state1 = new GameState();
          const state2 = new GameState();
          
          state1.setSeed(seed1);
          state2.setSeed(seed2);
          
          // Generate sequences from both states
          const sequence1: number[] = [];
          const sequence2: number[] = [];
          
          for (let i = 0; i < count; i++) {
            sequence1.push(state1.random());
            sequence2.push(state2.random());
          }
          
          // Sequences should be different (at least one value differs)
          const allSame = sequence1.every((val, idx) => val === sequence2[idx]);
          expect(allSame).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate values in valid range [0, 1)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 10, max: 100 }),
        (seed, count) => {
          const state = new GameState();
          state.setSeed(seed);
          
          for (let i = 0; i < count; i++) {
            const value = state.random();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate integers in specified range [min, max]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
        fc.integer({ min: 10, max: 50 }),
        (seed, min, max, count) => {
          const state = new GameState();
          state.setSeed(seed);
          
          for (let i = 0; i < count; i++) {
            const value = state.randomInt(min, max);
            expect(value).toBeGreaterThanOrEqual(min);
            expect(value).toBeLessThanOrEqual(max);
            expect(Number.isInteger(value)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use Math.random when no seed is set', () => {
    const state = new GameState();
    
    // Without seed, hasSeed should return false
    expect(state.hasSeed()).toBe(false);
    
    // Should still generate valid random numbers
    const value = state.random();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
    
    const intValue = state.randomInt(1, 10);
    expect(intValue).toBeGreaterThanOrEqual(1);
    expect(intValue).toBeLessThanOrEqual(10);
  });

  it('should allow clearing seed to revert to Math.random', () => {
    const state = new GameState();
    
    // Set seed
    state.setSeed(12345);
    expect(state.hasSeed()).toBe(true);
    
    // Clear seed
    state.clearSeed();
    expect(state.hasSeed()).toBe(false);
    
    // Should still generate valid random numbers
    const value = state.random();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});
