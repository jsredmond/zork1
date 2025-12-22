/**
 * Serializer Tests
 * Tests for serialization and deserialization of game state
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Serializer } from './serializer.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl, Direction } from '../game/rooms.js';
import { ObjectFlag, RoomFlag, INITIAL_GLOBAL_FLAGS } from '../game/data/flags.js';
import { scoreAction } from '../game/scoring.js';

/**
 * Generator for ObjectFlag values
 */
const objectFlagArbitrary = fc.constantFrom(
  ObjectFlag.TAKEBIT,
  ObjectFlag.CONTBIT,
  ObjectFlag.OPENBIT,
  ObjectFlag.LIGHTBIT,
  ObjectFlag.ONBIT,
  ObjectFlag.WEAPONBIT,
  ObjectFlag.DOORBIT,
  ObjectFlag.READBIT
);

/**
 * Generator for RoomFlag values
 */
const roomFlagArbitrary = fc.constantFrom(
  RoomFlag.RLANDBIT,
  RoomFlag.ONBIT,
  RoomFlag.SACREDBIT,
  RoomFlag.MAZEBIT
);

/**
 * Generator for Direction values
 */
const directionArbitrary = fc.constantFrom(
  Direction.NORTH,
  Direction.SOUTH,
  Direction.EAST,
  Direction.WEST,
  Direction.UP,
  Direction.DOWN
);

/**
 * Generator for GameObject
 */
const gameObjectArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  synonyms: fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 3 }),
  adjectives: fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 3 }),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  location: fc.oneof(
    fc.constant(null),
    fc.constant('PLAYER'),
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z0-9-]+$/.test(s))
  ),
  flags: fc.array(objectFlagArbitrary, { maxLength: 5 }),
  capacity: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  size: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined }),
  value: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined })
}).map(data => new GameObjectImpl(data));

/**
 * Generator for Room
 */
const roomArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  objects: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  visited: fc.boolean(),
  flags: fc.array(roomFlagArbitrary, { maxLength: 3 })
}).chain(data => {
  // Generate exits
  return fc.array(
    fc.record({
      direction: directionArbitrary,
      destination: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
      message: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
    }),
    { maxLength: 4 }
  ).map(exits => {
    const exitMap = new Map();
    for (const exit of exits) {
      exitMap.set(exit.direction, {
        destination: exit.destination,
        message: exit.message
      });
    }
    return new RoomImpl({
      ...data,
      exits: exitMap
    });
  });
});

/**
 * Generator for GlobalFlags
 */
const globalFlagsArbitrary = fc.record({
  CYCLOPS_FLAG: fc.boolean(),
  DEFLATE: fc.boolean(),
  DOME_FLAG: fc.boolean(),
  EMPTY_HANDED: fc.boolean(),
  LLD_FLAG: fc.boolean(),
  LOW_TIDE: fc.boolean(),
  MAGIC_FLAG: fc.boolean(),
  RAINBOW_FLAG: fc.boolean(),
  TROLL_FLAG: fc.boolean(),
  WON_FLAG: fc.boolean(),
  COFFIN_CURE: fc.boolean()
});

/**
 * Generator for GameState
 */
const gameStateArbitrary = fc.record({
  currentRoom: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z0-9-]+$/.test(s)),
  objects: fc.array(gameObjectArbitrary, { minLength: 1, maxLength: 10 }),
  rooms: fc.array(roomArbitrary, { minLength: 1, maxLength: 10 }),
  inventory: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  score: fc.integer({ min: 0, max: 350 }),
  moves: fc.integer({ min: 0, max: 1000 }),
  flags: globalFlagsArbitrary
}).map(data => {
  const objectsMap = new Map();
  for (const obj of data.objects) {
    objectsMap.set(obj.id, obj);
  }
  
  const roomsMap = new Map();
  for (const room of data.rooms) {
    roomsMap.set(room.id, room);
  }
  
  return new GameState({
    currentRoom: data.currentRoom,
    objects: objectsMap,
    rooms: roomsMap,
    globalVariables: new Map(),
    inventory: data.inventory,
    score: data.score,
    moves: data.moves,
    flags: data.flags
  });
});

describe('Serializer', () => {
  describe('Unit Tests', () => {
    describe('Serialization', () => {
      it('should serialize a minimal game state', () => {
        const serializer = new Serializer();
        const state = new GameState({
          currentRoom: 'WEST-OF-HOUSE',
          objects: new Map(),
          rooms: new Map(),
          globalVariables: new Map(),
          inventory: [],
          score: 0,
          moves: 0,
          flags: INITIAL_GLOBAL_FLAGS
        });

        const serialized = serializer.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed.version).toBe('1.0.0');
        expect(parsed.timestamp).toBeGreaterThan(0);
        expect(parsed.state.currentRoom).toBe('WEST-OF-HOUSE');
        expect(parsed.state.score).toBe(0);
        expect(parsed.state.moves).toBe(0);
        expect(parsed.state.inventory).toEqual([]);
      });

      it('should serialize game state with objects', () => {
        const serializer = new Serializer();
        const obj = new GameObjectImpl({
          id: 'SWORD',
          name: 'sword',
          synonyms: ['blade'],
          adjectives: ['elvish'],
          description: 'A gleaming elvish sword',
          location: 'PLAYER',
          flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.WEAPONBIT]),
          size: 10,
          value: 50
        });

        const state = new GameState({
          currentRoom: 'LIVING-ROOM',
          objects: new Map([['SWORD', obj]]),
          rooms: new Map(),
          globalVariables: new Map(),
          inventory: ['SWORD'],
          score: 10,
          moves: 5,
          flags: INITIAL_GLOBAL_FLAGS
        });

        const serialized = serializer.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed.state.objects).toHaveLength(1);
        expect(parsed.state.objects[0].id).toBe('SWORD');
        expect(parsed.state.objects[0].name).toBe('sword');
        expect(parsed.state.objects[0].location).toBe('PLAYER');
        expect(parsed.state.objects[0].flags).toContain(ObjectFlag.TAKEBIT);
        expect(parsed.state.objects[0].flags).toContain(ObjectFlag.WEAPONBIT);
        expect(parsed.state.inventory).toEqual(['SWORD']);
      });

      it('should serialize game state with rooms', () => {
        const serializer = new Serializer();
        const room = new RoomImpl({
          id: 'LIVING-ROOM',
          name: 'Living Room',
          description: 'You are in the living room.',
          exits: new Map([[Direction.NORTH, { destination: 'KITCHEN' }]]),
          objects: ['LAMP'],
          visited: true,
          flags: new Set([RoomFlag.ONBIT])
        });

        const state = new GameState({
          currentRoom: 'LIVING-ROOM',
          objects: new Map(),
          rooms: new Map([['LIVING-ROOM', room]]),
          globalVariables: new Map(),
          inventory: [],
          score: 0,
          moves: 10,
          flags: INITIAL_GLOBAL_FLAGS
        });

        const serialized = serializer.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed.state.rooms).toHaveLength(1);
        expect(parsed.state.rooms[0].id).toBe('LIVING-ROOM');
        expect(parsed.state.rooms[0].name).toBe('Living Room');
        expect(parsed.state.rooms[0].visited).toBe(true);
        expect(parsed.state.rooms[0].flags).toContain(RoomFlag.ONBIT);
        expect(parsed.state.rooms[0].exits).toHaveLength(1);
        expect(parsed.state.rooms[0].exits[0].direction).toBe(Direction.NORTH);
        expect(parsed.state.rooms[0].exits[0].destination).toBe('KITCHEN');
      });

      it('should serialize game state with global variables', () => {
        const serializer = new Serializer();
        const globalVars = new Map([
          ['LAMP_TURNS', 100],
          ['THIEF_ACTIVE', true],
          ['TROLL_DEFEATED', false]
        ]);

        const state = new GameState({
          currentRoom: 'MAZE',
          objects: new Map(),
          rooms: new Map(),
          globalVariables: globalVars,
          inventory: [],
          score: 25,
          moves: 50,
          flags: { ...INITIAL_GLOBAL_FLAGS, TROLL_FLAG: true }
        });

        const serialized = serializer.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed.state.globalVariables).toHaveLength(3);
        expect(parsed.state.globalVariables).toContainEqual(['LAMP_TURNS', 100]);
        expect(parsed.state.globalVariables).toContainEqual(['THIEF_ACTIVE', true]);
        expect(parsed.state.globalVariables).toContainEqual(['TROLL_DEFEATED', false]);
        expect(parsed.state.flags.TROLL_FLAG).toBe(true);
      });

      it('should serialize VALUE_SCORED_TREASURES state', () => {
        const serializer = new Serializer();
        const globalVars = new Map<string, any>();
        globalVars.set('VALUE_SCORED_TREASURES', new Set(['EGG', 'SWORD', 'DIAMOND']));

        const state = new GameState({
          currentRoom: 'LIVING-ROOM',
          objects: new Map(),
          rooms: new Map(),
          globalVariables: globalVars,
          inventory: [],
          score: 15,
          moves: 10,
          flags: INITIAL_GLOBAL_FLAGS,
          baseScore: 15
        });

        const serialized = serializer.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed.state.valueScoredTreasures).toBeDefined();
        expect(parsed.state.valueScoredTreasures).toHaveLength(3);
        expect(parsed.state.valueScoredTreasures).toContain('EGG');
        expect(parsed.state.valueScoredTreasures).toContain('SWORD');
        expect(parsed.state.valueScoredTreasures).toContain('DIAMOND');
        // VALUE_SCORED_TREASURES should not be in globalVariables (handled separately)
        expect(parsed.state.globalVariables.find((e: [string, any]) => e[0] === 'VALUE_SCORED_TREASURES')).toBeUndefined();
      });
    });

    describe('Deserialization', () => {
      it('should deserialize a minimal game state', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'WEST-OF-HOUSE',
            objects: [],
            rooms: [],
            globalVariables: [],
            inventory: [],
            score: 0,
            moves: 0,
            flags: INITIAL_GLOBAL_FLAGS
          }
        });

        const state = serializer.deserialize(saveData);

        expect(state.currentRoom).toBe('WEST-OF-HOUSE');
        expect(state.score).toBe(0);
        expect(state.moves).toBe(0);
        expect(state.inventory).toEqual([]);
        expect(state.objects.size).toBe(0);
        expect(state.rooms.size).toBe(0);
      });

      it('should deserialize game state with objects', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'LIVING-ROOM',
            objects: [{
              id: 'LAMP',
              name: 'brass lantern',
              synonyms: ['lamp', 'lantern'],
              adjectives: ['brass'],
              description: 'A brass lantern',
              location: 'PLAYER',
              properties: [],
              flags: [ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT],
              size: 5
            }],
            rooms: [],
            globalVariables: [],
            inventory: ['LAMP'],
            score: 5,
            moves: 3,
            flags: INITIAL_GLOBAL_FLAGS
          }
        });

        const state = serializer.deserialize(saveData);

        expect(state.objects.size).toBe(1);
        const lamp = state.objects.get('LAMP');
        expect(lamp).toBeDefined();
        expect(lamp?.name).toBe('brass lantern');
        expect(lamp?.location).toBe('PLAYER');
        expect(lamp?.flags.has(ObjectFlag.TAKEBIT)).toBe(true);
        expect(lamp?.flags.has(ObjectFlag.LIGHTBIT)).toBe(true);
        expect(state.inventory).toEqual(['LAMP']);
      });

      it('should deserialize game state with rooms', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'KITCHEN',
            objects: [],
            rooms: [{
              id: 'KITCHEN',
              name: 'Kitchen',
              description: 'You are in a kitchen.',
              exits: [
                { direction: Direction.SOUTH, destination: 'LIVING-ROOM' },
                { direction: Direction.EAST, destination: 'PANTRY', message: 'The door is locked.' }
              ],
              objects: ['TABLE'],
              visited: true,
              flags: [RoomFlag.ONBIT, RoomFlag.RLANDBIT]
            }],
            globalVariables: [],
            inventory: [],
            score: 0,
            moves: 15,
            flags: INITIAL_GLOBAL_FLAGS
          }
        });

        const state = serializer.deserialize(saveData);

        expect(state.rooms.size).toBe(1);
        const kitchen = state.rooms.get('KITCHEN');
        expect(kitchen).toBeDefined();
        expect(kitchen?.name).toBe('Kitchen');
        expect(kitchen?.visited).toBe(true);
        expect(kitchen?.flags.has(RoomFlag.ONBIT)).toBe(true);
        expect(kitchen?.exits.size).toBe(2);
        expect(kitchen?.exits.get(Direction.SOUTH)?.destination).toBe('LIVING-ROOM');
        expect(kitchen?.exits.get(Direction.EAST)?.destination).toBe('PANTRY');
      });

      it('should deserialize game state with global variables', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'TREASURE-ROOM',
            objects: [],
            rooms: [],
            globalVariables: [
              ['TREASURES_FOUND', 5],
              ['CYCLOPS_DEFEATED', true]
            ],
            inventory: [],
            score: 100,
            moves: 200,
            flags: { ...INITIAL_GLOBAL_FLAGS, CYCLOPS_FLAG: true, WON_FLAG: false }
          }
        });

        const state = serializer.deserialize(saveData);

        expect(state.globalVariables.get('TREASURES_FOUND')).toBe(5);
        expect(state.globalVariables.get('CYCLOPS_DEFEATED')).toBe(true);
        expect(state.flags.CYCLOPS_FLAG).toBe(true);
        expect(state.flags.WON_FLAG).toBe(false);
      });

      it('should deserialize VALUE_SCORED_TREASURES state', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'LIVING-ROOM',
            objects: [],
            rooms: [],
            globalVariables: [],
            inventory: [],
            score: 15,
            moves: 10,
            flags: INITIAL_GLOBAL_FLAGS,
            baseScore: 15,
            valueScoredTreasures: ['EGG', 'DIAMOND', 'TORCH']
          }
        });

        const state = serializer.deserialize(saveData);

        const valueScoredTreasures = state.getGlobalVariable('VALUE_SCORED_TREASURES');
        expect(valueScoredTreasures).toBeInstanceOf(Set);
        expect(valueScoredTreasures.size).toBe(3);
        expect(valueScoredTreasures.has('EGG')).toBe(true);
        expect(valueScoredTreasures.has('DIAMOND')).toBe(true);
        expect(valueScoredTreasures.has('TORCH')).toBe(true);
        expect(state.getBaseScore()).toBe(15);
      });

      it('should handle missing VALUE_SCORED_TREASURES for backward compatibility', () => {
        const serializer = new Serializer();
        // Old save file format without valueScoredTreasures field
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'WEST-OF-HOUSE',
            objects: [],
            rooms: [],
            globalVariables: [],
            inventory: [],
            score: 0,
            moves: 0,
            flags: INITIAL_GLOBAL_FLAGS
          }
        });

        const state = serializer.deserialize(saveData);

        // Should not throw and VALUE_SCORED_TREASURES should not be set
        const valueScoredTreasures = state.getGlobalVariable('VALUE_SCORED_TREASURES');
        expect(valueScoredTreasures).toBeUndefined();
      });
    });

    describe('Error Handling', () => {
      it('should reject invalid JSON', () => {
        const serializer = new Serializer();
        const invalidJson = '{ this is not valid json }';

        expect(serializer.validate(invalidJson)).toBe(false);
        expect(() => serializer.deserialize(invalidJson)).toThrow();
      });

      it('should reject save data with missing version', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          timestamp: Date.now(),
          state: {
            currentRoom: 'ROOM',
            objects: [],
            rooms: [],
            inventory: []
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with missing timestamp', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          state: {
            currentRoom: 'ROOM',
            objects: [],
            rooms: [],
            inventory: []
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with missing state', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now()
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with incompatible version', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '2.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'ROOM',
            objects: [],
            rooms: [],
            globalVariables: [],
            inventory: [],
            score: 0,
            moves: 0,
            flags: INITIAL_GLOBAL_FLAGS
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
        expect(() => serializer.deserialize(saveData)).toThrow(/Incompatible save file version/);
      });

      it('should reject save data with missing currentRoom', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            objects: [],
            rooms: [],
            inventory: []
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with non-array objects', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'ROOM',
            objects: 'not an array',
            rooms: [],
            inventory: []
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with non-array rooms', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'ROOM',
            objects: [],
            rooms: { not: 'an array' },
            inventory: []
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should reject save data with non-array inventory', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: {
            currentRoom: 'ROOM',
            objects: [],
            rooms: [],
            inventory: 'not an array'
          }
        });

        expect(serializer.validate(saveData)).toBe(false);
      });

      it('should handle empty string gracefully', () => {
        const serializer = new Serializer();
        
        expect(serializer.validate('')).toBe(false);
        expect(() => serializer.deserialize('')).toThrow();
      });

      it('should handle null values gracefully', () => {
        const serializer = new Serializer();
        const saveData = JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          state: null
        });

        expect(serializer.validate(saveData)).toBe(false);
      });
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: modern-zork-rewrite, Property 9: Save/restore round-trip
    it('should preserve game state through save/restore cycle', () => {
    const serializer = new Serializer();
    
    fc.assert(
      fc.property(gameStateArbitrary, (state) => {
        // Serialize the state
        const serialized = serializer.serialize(state);
        
        // Deserialize it back
        const restored = serializer.deserialize(serialized);
        
        // Compare key properties
        expect(restored.currentRoom).toBe(state.currentRoom);
        expect(restored.score).toBe(state.score);
        expect(restored.moves).toBe(state.moves);
        expect(restored.inventory).toEqual(state.inventory);
        
        // Compare flags
        expect(restored.flags).toEqual(state.flags);
        
        // Compare objects
        expect(restored.objects.size).toBe(state.objects.size);
        for (const [id, obj] of state.objects) {
          const restoredObj = restored.objects.get(id);
          expect(restoredObj).toBeDefined();
          if (restoredObj) {
            expect(restoredObj.id).toBe(obj.id);
            expect(restoredObj.name).toBe(obj.name);
            expect(restoredObj.location).toBe(obj.location);
            expect(restoredObj.description).toBe(obj.description);
            expect(Array.from(restoredObj.flags)).toEqual(Array.from(obj.flags));
          }
        }
        
        // Compare rooms
        expect(restored.rooms.size).toBe(state.rooms.size);
        for (const [id, room] of state.rooms) {
          const restoredRoom = restored.rooms.get(id);
          expect(restoredRoom).toBeDefined();
          if (restoredRoom) {
            expect(restoredRoom.id).toBe(room.id);
            expect(restoredRoom.name).toBe(room.name);
            expect(restoredRoom.description).toBe(room.description);
            expect(restoredRoom.visited).toBe(room.visited);
            expect(Array.from(restoredRoom.flags)).toEqual(Array.from(room.flags));
          }
        }
      }),
      { numRuns: 100 }
    );
  });

    /**
     * Feature: scoring-system-fix, Property 4: Save/restore round-trip
     * For any game state with scored actions and treasures, saving and then restoring
     * should produce an equivalent scoring state where the same actions cannot be
     * re-scored and the total score is identical.
     * **Validates: Requirements 5.1, 5.2, 5.3**
     */
    it('should preserve scoring state through save/restore cycle', () => {
      const serializer = new Serializer();
      
      // Generator for scored action IDs (OPEN_EGG removed - player cannot open the egg)
      const scoredActionArbitrary = fc.constantFrom(
        'ENTER_KITCHEN',
        'ENTER_CELLAR',
        'ENTER_TREASURE_ROOM',
        'ENTER_HADES',
        'ENTER_LOWER_SHAFT_LIT',
        'DEFEAT_TROLL',
        'DEFEAT_THIEF',
        'DEFEAT_CYCLOPS',
        'INFLATE_BOAT',
        'RAISE_DAM',
        'LOWER_DAM',
        'PUT_COAL_IN_MACHINE',
        'TURN_ON_MACHINE',
        'WAVE_SCEPTRE',
        'COMPLETE_EXORCISM'
      );
      
      // Generator for scoring state
      const scoringStateArbitrary = fc.record({
        baseScore: fc.integer({ min: 0, max: 350 }),
        scoredActions: fc.array(scoredActionArbitrary, { maxLength: 10 }),
        wonFlag: fc.boolean()
      });
      
      fc.assert(
        fc.property(scoringStateArbitrary, (scoringState) => {
          // Create a game state with scoring data
          const scoredActionsSet = new Set(scoringState.scoredActions);
          const globalVariables = new Map<string, any>();
          globalVariables.set('SCORED_ACTIONS', scoredActionsSet);
          
          const state = new GameState({
            currentRoom: 'WEST-OF-HOUSE',
            objects: new Map(),
            rooms: new Map(),
            globalVariables,
            inventory: [],
            score: 0,
            moves: 0,
            flags: { ...INITIAL_GLOBAL_FLAGS, WON_FLAG: scoringState.wonFlag },
            baseScore: scoringState.baseScore
          });
          
          // Serialize the state
          const serialized = serializer.serialize(state);
          
          // Deserialize it back
          const restored = serializer.deserialize(serialized);
          
          // Verify baseScore is preserved
          expect(restored.getBaseScore()).toBe(scoringState.baseScore);
          
          // Verify wonFlag is preserved
          expect(restored.flags.WON_FLAG).toBe(scoringState.wonFlag);
          
          // Verify scoredActions is preserved
          const restoredScoredActions = restored.getGlobalVariable('SCORED_ACTIONS');
          if (scoredActionsSet.size > 0) {
            expect(restoredScoredActions).toBeInstanceOf(Set);
            expect(restoredScoredActions.size).toBe(scoredActionsSet.size);
            for (const action of scoredActionsSet) {
              expect(restoredScoredActions.has(action)).toBe(true);
            }
          }
          
          // Verify that re-scoring the same actions returns 0 (already scored)
          // This tests Requirement 5.3: SHALL NOT allow re-scoring of already-scored actions
          for (const action of scoringState.scoredActions) {
            const points = scoreAction(restored, action);
            expect(points).toBe(0); // Should return 0 because already scored
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: treasure-take-scoring, Property: VALUE_SCORED_TREASURES round-trip
     * For any game state with VALUE-scored treasures, saving and then restoring
     * should preserve which treasures have had their VALUE points awarded.
     * **Validates: Requirements 1.4**
     */
    it('should preserve VALUE_SCORED_TREASURES through save/restore cycle', () => {
      const serializer = new Serializer();
      
      // Generator for treasure IDs that can have VALUE points
      const treasureIdArbitrary = fc.constantFrom(
        'SKULL', 'SCEPTRE', 'COFFIN', 'TRIDENT', 'CHALICE',
        'DIAMOND', 'JADE', 'BAG-OF-COINS', 'EMERALD', 'PAINTING',
        'BAR', 'POT-OF-GOLD', 'BRACELET', 'SCARAB', 'TORCH',
        'TRUNK', 'EGG', 'BAUBLE', 'CANARY'
      );
      
      // Generator for VALUE scoring state
      const valueScoringStateArbitrary = fc.record({
        baseScore: fc.integer({ min: 0, max: 350 }),
        valueScoredTreasures: fc.array(treasureIdArbitrary, { maxLength: 15 })
      });
      
      fc.assert(
        fc.property(valueScoringStateArbitrary, (scoringState) => {
          // Create a game state with VALUE scoring data
          const valueScoredTreasuresSet = new Set(scoringState.valueScoredTreasures);
          const globalVariables = new Map<string, any>();
          globalVariables.set('VALUE_SCORED_TREASURES', valueScoredTreasuresSet);
          
          const state = new GameState({
            currentRoom: 'WEST-OF-HOUSE',
            objects: new Map(),
            rooms: new Map(),
            globalVariables,
            inventory: [],
            score: 0,
            moves: 0,
            flags: INITIAL_GLOBAL_FLAGS,
            baseScore: scoringState.baseScore
          });
          
          // Serialize the state
          const serialized = serializer.serialize(state);
          
          // Deserialize it back
          const restored = serializer.deserialize(serialized);
          
          // Verify baseScore is preserved
          expect(restored.getBaseScore()).toBe(scoringState.baseScore);
          
          // Verify valueScoredTreasures is preserved
          const restoredValueScoredTreasures = restored.getGlobalVariable('VALUE_SCORED_TREASURES');
          if (valueScoredTreasuresSet.size > 0) {
            expect(restoredValueScoredTreasures).toBeInstanceOf(Set);
            expect(restoredValueScoredTreasures.size).toBe(valueScoredTreasuresSet.size);
            for (const treasure of valueScoredTreasuresSet) {
              expect(restoredValueScoredTreasures.has(treasure)).toBe(true);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

  // Feature: modern-zork-rewrite, Property 10: Save file validation
  it('should reject invalid or corrupted save files', () => {
    const serializer = new Serializer();
    
    // Generator for corrupted save data
    const corruptedSaveDataArbitrary = fc.oneof(
      // Invalid JSON
      fc.string().filter(s => {
        try {
          JSON.parse(s);
          return false;
        } catch {
          return true;
        }
      }),
      
      // Missing required fields
      fc.record({
        version: fc.option(fc.string(), { nil: undefined }),
        timestamp: fc.option(fc.integer(), { nil: undefined }),
        state: fc.option(fc.record({
          currentRoom: fc.option(fc.string(), { nil: undefined }),
          objects: fc.option(fc.array(fc.anything()), { nil: undefined }),
          rooms: fc.option(fc.array(fc.anything()), { nil: undefined }),
          inventory: fc.option(fc.array(fc.string()), { nil: undefined })
        }), { nil: undefined })
      }).map(data => JSON.stringify(data)),
      
      // Wrong version
      fc.record({
        version: fc.string().filter(v => v !== '1.0.0'),
        timestamp: fc.integer(),
        state: fc.record({
          currentRoom: fc.string(),
          objects: fc.array(fc.anything()),
          rooms: fc.array(fc.anything()),
          inventory: fc.array(fc.string())
        })
      }).map(data => JSON.stringify(data)),
      
      // Invalid state structure
      fc.record({
        version: fc.constant('1.0.0'),
        timestamp: fc.integer(),
        state: fc.oneof(
          fc.constant(null),
          fc.constant({}),
          fc.string(),
          fc.integer(),
          fc.array(fc.anything())
        )
      }).map(data => JSON.stringify(data))
    );
    
    fc.assert(
      fc.property(corruptedSaveDataArbitrary, (corruptedData) => {
        // Validation should return false for corrupted data
        const isValid = serializer.validate(corruptedData);
        expect(isValid).toBe(false);
        
        // Deserialization should throw an error for corrupted data
        expect(() => {
          serializer.deserialize(corruptedData);
        }).toThrow();
      }),
      { numRuns: 100 }
    );
  });
  });
});
