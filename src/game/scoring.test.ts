/**
 * Property-Based Tests for Scoring System
 * Tests scoring correctness and action sequence equivalence
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { ObjectFlag } from './data/flags.js';
import { RoomImpl } from './rooms.js';
import { PutAction } from './actions.js';
import {
  scoreTreasure,
  getTreasureValue,
  isTreasure,
  getRank,
  TREASURE_VALUES,
  TROPHY_CASE_ID,
  MAX_SCORE,
  scoreAction,
  ACTION_VALUES,
  applyDeathPenalty,
  DEATH_PENALTY,
  calculateTotalScore,
  calculateTreasureScore,
  isActionScored
} from './scoring.js';

describe('Scoring System', () => {
  describe('Unit Tests', () => {
    let state: GameState;
    let putAction: PutAction;

    beforeEach(() => {
      // Create a minimal game state
      const rooms = new Map<string, RoomImpl>();
      const testRoom = new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      });
      rooms.set('TEST-ROOM', testRoom);

      const objects = new Map<string, GameObjectImpl>();
      
      // Create trophy case
      const trophyCase = new GameObjectImpl({
        id: TROPHY_CASE_ID,
        name: 'trophy case',
        description: 'A trophy case',
        location: 'TEST-ROOM',
        flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
        capacity: 10000
      });
      objects.set(TROPHY_CASE_ID, trophyCase);

      // Create a treasure
      const skull = new GameObjectImpl({
        id: 'SKULL',
        name: 'crystal skull',
        description: 'A crystal skull',
        location: 'PLAYER',
        flags: [ObjectFlag.TAKEBIT],
        size: 10
      });
      objects.set('SKULL', skull);

      state = new GameState({
        currentRoom: 'TEST-ROOM',
        objects,
        rooms,
        inventory: ['SKULL'],
        score: 0,
        moves: 0
      });

      putAction = new PutAction();
    });

    it('should award points when treasure is placed in trophy case', () => {
      const result = putAction.execute(state, 'SKULL', TROPHY_CASE_ID);
      
      expect(result.success).toBe(true);
      expect(state.score).toBe(getTreasureValue('SKULL'));
      expect(result.message).toContain('Your score has just gone up');
    });

    it('should not award points twice for the same treasure', () => {
      // Place treasure first time
      putAction.execute(state, 'SKULL', TROPHY_CASE_ID);
      const firstScore = state.score;
      
      // Remove and place again
      state.moveObject('SKULL', 'PLAYER');
      putAction.execute(state, 'SKULL', TROPHY_CASE_ID);
      
      // Score should not increase again
      expect(state.score).toBe(firstScore);
    });

    it('should correctly identify treasures', () => {
      expect(isTreasure('SKULL')).toBe(true);
      expect(isTreasure('LAMP')).toBe(false);
      expect(isTreasure('NONEXISTENT')).toBe(false);
    });

    it('should return correct treasure values', () => {
      expect(getTreasureValue('SKULL')).toBe(10);
      expect(getTreasureValue('CHALICE')).toBe(5);
      expect(getTreasureValue('LAMP')).toBe(0);
    });

    it('should calculate correct ranks', () => {
      expect(getRank(0)).toBe('Beginner');
      expect(getRank(25)).toBe('Beginner');
      expect(getRank(26)).toBe('Amateur Adventurer');
      expect(getRank(50)).toBe('Amateur Adventurer');
      expect(getRank(51)).toBe('Novice Adventurer');
      expect(getRank(100)).toBe('Junior Adventurer');
      expect(getRank(101)).toBe('Junior Adventurer');
      expect(getRank(200)).toBe('Junior Adventurer');
      expect(getRank(201)).toBe('Adventurer');
      expect(getRank(300)).toBe('Adventurer');
      expect(getRank(301)).toBe('Master');
      expect(getRank(330)).toBe('Master');
      expect(getRank(331)).toBe('Wizard');
      expect(getRank(350)).toBe('Master Adventurer');
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: modern-zork-rewrite, Property 11: Action sequence equivalence
    it('should maintain scoring consistency across action sequences', () => {
      fc.assert(
        fc.property(
          // Generate a list of treasure IDs to place in trophy case
          fc.array(
            fc.constantFrom(...Object.keys(TREASURE_VALUES)),
            { minLength: 1, maxLength: 5 }
          ),
          (treasureIds) => {
            // Create game state
            const rooms = new Map<string, RoomImpl>();
            const testRoom = new RoomImpl({
              id: 'TEST-ROOM',
              name: 'Test Room',
              description: 'A test room',
              exits: new Map()
            });
            rooms.set('TEST-ROOM', testRoom);

            const objects = new Map<string, GameObjectImpl>();
            
            // Create trophy case
            const trophyCase = new GameObjectImpl({
              id: TROPHY_CASE_ID,
              name: 'trophy case',
              description: 'A trophy case',
              location: 'TEST-ROOM',
              flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
              capacity: 10000
            });
            objects.set(TROPHY_CASE_ID, trophyCase);

            // Create treasures
            const inventory: string[] = [];
            for (const treasureId of treasureIds) {
              const treasure = new GameObjectImpl({
                id: treasureId,
                name: treasureId.toLowerCase(),
                description: `A ${treasureId.toLowerCase()}`,
                location: 'PLAYER',
                flags: [ObjectFlag.TAKEBIT],
                size: 10
              });
              objects.set(treasureId, treasure);
              inventory.push(treasureId);
            }

            const state = new GameState({
              currentRoom: 'TEST-ROOM',
              objects,
              rooms,
              inventory,
              score: 0,
              moves: 0
            });

            const putAction = new PutAction();

            // Calculate expected score (sum of unique treasure values)
            const uniqueTreasures = [...new Set(treasureIds)];
            const expectedScore = uniqueTreasures.reduce(
              (sum, id) => sum + getTreasureValue(id),
              0
            );

            // Place all treasures in trophy case
            for (const treasureId of treasureIds) {
              putAction.execute(state, treasureId, TROPHY_CASE_ID);
            }

            // Property: Final score should equal sum of unique treasure values
            expect(state.score).toBe(expectedScore);

            // Property: Score should never exceed MAX_SCORE
            expect(state.score).toBeLessThanOrEqual(MAX_SCORE);

            // Property: Each treasure should only be scored once
            for (const treasureId of uniqueTreasures) {
              const obj = state.getObject(treasureId) as GameObjectImpl;
              expect(obj.getProperty('scored')).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: modern-zork-rewrite, Property 11: Action sequence equivalence
    it('should produce same score regardless of treasure placement order', () => {
      fc.assert(
        fc.property(
          // Generate a list of unique treasure IDs
          fc.uniqueArray(
            fc.constantFrom(...Object.keys(TREASURE_VALUES)),
            { minLength: 2, maxLength: 5 }
          ),
          (treasureIds) => {
            // Helper function to place treasures and get final score
            const placeAndScore = (order: string[]): number => {
              const rooms = new Map<string, RoomImpl>();
              const testRoom = new RoomImpl({
                id: 'TEST-ROOM',
                name: 'Test Room',
                description: 'A test room',
                exits: new Map()
              });
              rooms.set('TEST-ROOM', testRoom);

              const objects = new Map<string, GameObjectImpl>();
              
              const trophyCase = new GameObjectImpl({
                id: TROPHY_CASE_ID,
                name: 'trophy case',
                description: 'A trophy case',
                location: 'TEST-ROOM',
                flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
                capacity: 10000
              });
              objects.set(TROPHY_CASE_ID, trophyCase);

              const inventory: string[] = [];
              for (const treasureId of order) {
                const treasure = new GameObjectImpl({
                  id: treasureId,
                  name: treasureId.toLowerCase(),
                  description: `A ${treasureId.toLowerCase()}`,
                  location: 'PLAYER',
                  flags: [ObjectFlag.TAKEBIT],
                  size: 10
                });
                objects.set(treasureId, treasure);
                inventory.push(treasureId);
              }

              const state = new GameState({
                currentRoom: 'TEST-ROOM',
                objects,
                rooms,
                inventory,
                score: 0,
                moves: 0
              });

              const putAction = new PutAction();

              for (const treasureId of order) {
                putAction.execute(state, treasureId, TROPHY_CASE_ID);
              }

              return state.score;
            };

            // Place treasures in original order
            const score1 = placeAndScore(treasureIds);

            // Place treasures in reverse order
            const score2 = placeAndScore([...treasureIds].reverse());

            // Property: Order should not affect final score
            expect(score1).toBe(score2);

            // Property: Score should equal sum of all treasure values
            const expectedScore = treasureIds.reduce(
              (sum, id) => sum + getTreasureValue(id),
              0
            );
            expect(score1).toBe(expectedScore);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: modern-zork-rewrite, Property 11: Action sequence equivalence
    it('should not award points for non-treasures in trophy case', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          (objectId) => {
            // Skip if it's actually a treasure
            fc.pre(!isTreasure(objectId));

            const rooms = new Map<string, RoomImpl>();
            const testRoom = new RoomImpl({
              id: 'TEST-ROOM',
              name: 'Test Room',
              description: 'A test room',
              exits: new Map()
            });
            rooms.set('TEST-ROOM', testRoom);

            const objects = new Map<string, GameObjectImpl>();
            
            const trophyCase = new GameObjectImpl({
              id: TROPHY_CASE_ID,
              name: 'trophy case',
              description: 'A trophy case',
              location: 'TEST-ROOM',
              flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
              capacity: 10000
            });
            objects.set(TROPHY_CASE_ID, trophyCase);

            const obj = new GameObjectImpl({
              id: objectId,
              name: objectId.toLowerCase(),
              description: `A ${objectId.toLowerCase()}`,
              location: 'PLAYER',
              flags: [ObjectFlag.TAKEBIT],
              size: 10
            });
            objects.set(objectId, obj);

            const state = new GameState({
              currentRoom: 'TEST-ROOM',
              objects,
              rooms,
              inventory: [objectId],
              score: 0,
              moves: 0
            });

            const putAction = new PutAction();
            putAction.execute(state, objectId, TROPHY_CASE_ID);

            // Property: Score should remain 0 for non-treasures
            expect(state.score).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: scoring-system-fix, Property 1: Treasure scoring idempotence
     * For any treasure and any sequence of put/take operations on the trophy case,
     * the treasure's contribution to the score should be exactly its TVALUE when
     * in the case and 0 when not in the case, regardless of how many times it has
     * been placed or removed.
     * 
     * Validates: Requirements 1.2, 1.3
     */
    it('Property 1: Treasure scoring idempotence - put/take operations should not affect final score', () => {
      fc.assert(
        fc.property(
          // Generate a treasure ID and a sequence of put/take operations
          fc.constantFrom(...Object.keys(TREASURE_VALUES)),
          // Ensure at least one "put" operation (true) in the sequence
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }).filter(ops => ops.some(op => op)),
          (treasureId, operations) => {
            // Create game state
            const rooms = new Map<string, RoomImpl>();
            const testRoom = new RoomImpl({
              id: 'TEST-ROOM',
              name: 'Test Room',
              description: 'A test room',
              exits: new Map()
            });
            rooms.set('TEST-ROOM', testRoom);

            const objects = new Map<string, GameObjectImpl>();
            
            const trophyCase = new GameObjectImpl({
              id: TROPHY_CASE_ID,
              name: 'trophy case',
              description: 'A trophy case',
              location: 'TEST-ROOM',
              flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
              capacity: 10000
            });
            objects.set(TROPHY_CASE_ID, trophyCase);

            const treasure = new GameObjectImpl({
              id: treasureId,
              name: treasureId.toLowerCase(),
              description: `A ${treasureId.toLowerCase()}`,
              location: 'PLAYER',
              flags: [ObjectFlag.TAKEBIT],
              size: 10
            });
            objects.set(treasureId, treasure);

            const state = new GameState({
              currentRoom: 'TEST-ROOM',
              objects,
              rooms,
              inventory: [treasureId],
              score: 0,
              moves: 0
            });

            const putAction = new PutAction();

            // Execute the sequence of operations
            for (const isPut of operations) {
              if (isPut) {
                // Put in trophy case
                if (treasure.location !== TROPHY_CASE_ID) {
                  state.moveObject(treasureId, 'PLAYER');
                  state.addToInventory(treasureId);
                  putAction.execute(state, treasureId, TROPHY_CASE_ID);
                }
              } else {
                // Take from trophy case
                if (treasure.location === TROPHY_CASE_ID) {
                  state.moveObject(treasureId, 'PLAYER');
                }
              }
            }

            // Property: Score should be exactly the treasure value (scored once)
            // regardless of how many put/take operations were performed
            // Since we ensured at least one put operation, the treasure should be scored
            const expectedScore = getTreasureValue(treasureId);
            expect(state.score).toBe(expectedScore);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: scoring-system-fix, Property 2: Rank calculation correctness
     * For any score value from 0 to 350, the getRank function should return
     * the correct rank according to the defined thresholds.
     * 
     * Validates: Requirements 4.3
     */
    it('Property 2: Rank calculation correctness - ranks should match thresholds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 350 }),
          (score) => {
            const rank = getRank(score);
            
            // Verify rank matches the correct threshold
            if (score === 350) {
              expect(rank).toBe('Master Adventurer');
            } else if (score > 330) {
              expect(rank).toBe('Wizard');
            } else if (score > 300) {
              expect(rank).toBe('Master');
            } else if (score > 200) {
              expect(rank).toBe('Adventurer');
            } else if (score >= 100) {
              expect(rank).toBe('Junior Adventurer');
            } else if (score > 50) {
              expect(rank).toBe('Novice Adventurer');
            } else if (score > 25) {
              expect(rank).toBe('Amateur Adventurer');
            } else {
              expect(rank).toBe('Beginner');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: scoring-system-fix, Property 3: Death penalty application
     * For any game state with a positive score, applying the death penalty
     * should reduce the score by exactly 10 points, and for scores less than 10,
     * the result should be 0 (never negative).
     * 
     * Validates: Requirements 3.1, 3.2
     */
    it('Property 3: Death penalty application - should reduce by 10 or clamp to 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }),
          (initialBaseScore) => {
            const state = new GameState({
              score: 0,
              moves: 0
            });
            
            // Set the base score
            state.setBaseScore(initialBaseScore);
            
            // Apply death penalty
            applyDeathPenalty(state);
            
            // Property: Score should be reduced by DEATH_PENALTY or clamped to 0
            const expectedScore = Math.max(0, initialBaseScore - DEATH_PENALTY);
            expect(state.getBaseScore()).toBe(expectedScore);
            
            // Property: Score should never be negative
            expect(state.getBaseScore()).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: scoring-system-fix, Property 5: Action scoring idempotence
     * For any action that awards points, triggering that action multiple times
     * should only award points once, and the BASE_SCORE should reflect exactly
     * the sum of unique action values.
     * 
     * Validates: Requirements 7.1, 7.2, 7.3
     */
    it('Property 5: Action scoring idempotence - actions should only score once', () => {
      fc.assert(
        fc.property(
          // Generate a list of action IDs (with possible duplicates)
          fc.array(
            fc.constantFrom(...Object.keys(ACTION_VALUES)),
            { minLength: 1, maxLength: 10 }
          ),
          (actionIds) => {
            const state = new GameState({
              score: 0,
              moves: 0
            });

            // Execute all actions
            for (const actionId of actionIds) {
              scoreAction(state, actionId);
            }

            // Calculate expected score (sum of unique action values)
            const uniqueActions = [...new Set(actionIds)];
            const expectedScore = uniqueActions.reduce(
              (sum, id) => sum + (ACTION_VALUES[id] || 0),
              0
            );

            // Property: Base score should equal sum of unique action values
            expect(state.getBaseScore()).toBe(expectedScore);

            // Property: Each action should be marked as scored
            for (const actionId of uniqueActions) {
              expect(isActionScored(state, actionId)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: scoring-system-fix, Property 6: Max score invariant
     * For any sequence of game actions (scoring treasures, completing puzzles, dying),
     * the total score should never exceed 350 points.
     * 
     * Note: This property tests that the scoring system has a theoretical maximum.
     * In practice, the max is enforced by the limited number of treasures and actions.
     * 
     * Validates: Requirements 7.4
     */
    it('Property 6: Max score invariant - total possible score should not exceed MAX_SCORE', () => {
      // Calculate the theoretical maximum score
      const totalTreasureValue = Object.values(TREASURE_VALUES).reduce((sum, val) => sum + val, 0);
      const totalActionValue = Object.values(ACTION_VALUES).reduce((sum, val) => sum + val, 0);
      const theoreticalMax = totalTreasureValue + totalActionValue;

      // Property: The theoretical maximum should not exceed MAX_SCORE
      // Note: This is a design constraint - the game is designed so that
      // all treasures + all actions = exactly MAX_SCORE
      expect(theoreticalMax).toBeLessThanOrEqual(MAX_SCORE);
      
      // Also verify that MAX_SCORE is 350 as per requirements
      expect(MAX_SCORE).toBe(350);
    });
  });
});
