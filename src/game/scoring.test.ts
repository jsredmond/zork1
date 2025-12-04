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
  MAX_SCORE
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
  });
});
