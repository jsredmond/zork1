/**
 * Command Executor Tests
 * Property-based and unit tests for command execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { CommandExecutor } from './executor.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ParsedCommand, ParseError } from '../parser/parser.js';
import { ObjectFlag, RoomFlag } from '../game/data/flags.js';

/**
 * Create a minimal test game state
 */
function createTestState(): GameState {
  const objects = new Map();
  const rooms = new Map();

  // Create a simple room with ONBIT flag so it's lit (prevents grue death)
  const room = new RoomImpl({
    id: 'TEST-ROOM',
    name: 'Test Room',
    description: 'A test room.',
    exits: new Map(),
    objects: [],
    visited: false,
    flags: [RoomFlag.ONBIT]
  });
  rooms.set('TEST-ROOM', room);

  // Create a takeable object
  const obj = new GameObjectImpl({
    id: 'TEST-OBJECT',
    name: 'Test Object',
    synonyms: ['object'],
    adjectives: ['test'],
    description: 'A test object.',
    location: 'TEST-ROOM',
    properties: new Map(),
    flags: [ObjectFlag.TAKEBIT],
    size: 5
  });
  objects.set('TEST-OBJECT', obj);
  room.addObject('TEST-OBJECT');

  return new GameState({
    currentRoom: 'TEST-ROOM',
    objects,
    rooms,
    globalVariables: new Map(),
    inventory: [],
    score: 0,
    moves: 0
  });
}

/**
 * Generator for valid verb strings
 */
const validVerbGen = fc.constantFrom(
  'TAKE', 'DROP', 'EXAMINE', 'LOOK', 'INVENTORY',
  'OPEN', 'CLOSE', 'READ', 'NORTH', 'SOUTH', 'EAST', 'WEST'
);

/**
 * Generator for invalid verb strings
 */
const invalidVerbGen = fc.string().filter(s => 
  s.length > 0 && 
  !['TAKE', 'DROP', 'EXAMINE', 'LOOK', 'INVENTORY', 'OPEN', 'CLOSE', 'READ',
    'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 'IN', 'OUT',
    'N', 'S', 'E', 'W', 'U', 'D', 'GO', 'GET', 'PICK', 'PUT', 'X', 'L', 'I',
    'Y', 'YES', 'NO', 'WAIT', 'Z', 'AGAIN', 'G', 'QUIT', 'Q', 'SAVE', 'RESTORE',
    'RESTART', 'SCORE', 'VERSION', 'VERBOSE', 'BRIEF', 'SUPERBRIEF', 'DIAGNOSE',
    'HELLO', 'HI', 'PRAY', 'JUMP', 'SWIM', 'CLIMB', 'ATTACK', 'KILL', 'FIGHT',
    'WAVE', 'THROW', 'GIVE', 'SHOW', 'TELL', 'ASK', 'SAY', 'ANSWER', 'YELL',
    'SHOUT', 'SCREAM', 'SING', 'LISTEN', 'SMELL', 'TASTE', 'TOUCH', 'FEEL',
    'RUB', 'PUSH', 'PULL', 'TURN', 'MOVE', 'LIFT', 'LOWER', 'RAISE', 'LIGHT',
    'EXTINGUISH', 'BURN', 'POUR', 'FILL', 'EMPTY', 'EAT', 'DRINK', 'WEAR',
    'REMOVE', 'TIE', 'UNTIE', 'BREAK', 'CUT', 'DIG', 'ENTER', 'EXIT', 'LEAVE',
    'BOARD', 'DISEMBARK', 'LAUNCH', 'LAND', 'CROSS', 'FOLLOW', 'FIND', 'SEARCH',
    'UNLOCK', 'LOCK', 'KNOCK', 'RING', 'WIND', 'SET', 'INFLATE', 'DEFLATE',
    'PLUG', 'ODYSSEUS', 'ULYSSES', 'ECHO', 'EXORCISE', 'PRAY'].includes(s.toUpperCase())
);

/**
 * Generator for ParseError objects
 */
const parseErrorGen = fc.record({
  type: fc.constantFrom('UNKNOWN_WORD', 'INVALID_SYNTAX', 'AMBIGUOUS', 'NO_VERB', 'OBJECT_NOT_FOUND'),
  message: fc.string({ minLength: 1 })
}) as fc.Arbitrary<ParseError>;

describe('CommandExecutor', () => {
  let executor: CommandExecutor;
  let state: GameState;

  beforeEach(() => {
    executor = new CommandExecutor();
    state = createTestState();
  });

  describe('Unit Tests', () => {
    it('should execute INVENTORY command', () => {
      const command: ParsedCommand = {
        verb: 'INVENTORY'
      };

      const result = executor.execute(command, state);
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should execute LOOK command', () => {
      const command: ParsedCommand = {
        verb: 'LOOK'
      };

      const result = executor.execute(command, state);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle unknown verbs', () => {
      const command: ParsedCommand = {
        verb: 'FROBULATE'
      };

      const result = executor.execute(command, state);
      expect(result.success).toBe(false);
      expect(result.message).toContain("don't know");
    });

    it('should handle parse errors', () => {
      const parseError: ParseError = {
        type: 'UNKNOWN_WORD',
        message: 'Unknown word: xyz'
      };

      const result = executor.execute(parseError, state);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown word: xyz');
    });

    it('should execute TAKE command with object', () => {
      const obj = state.getObject('TEST-OBJECT');
      const command: ParsedCommand = {
        verb: 'TAKE',
        directObject: obj
      };

      const result = executor.execute(command, state);
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('Property Tests', () => {
    // Feature: modern-zork-rewrite, Property 2: Command execution completeness
    it('should handle all valid commands without crashing', () => {
      fc.assert(
        fc.property(validVerbGen, (verb) => {
          const command: ParsedCommand = {
            verb: verb
          };

          // Execute should not throw
          const result = executor.execute(command, state);
          
          // Should always return a result
          expect(result).toBeDefined();
          expect(result.message).toBeDefined();
          expect(typeof result.success).toBe('boolean');
          expect(Array.isArray(result.stateChanges)).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    // Feature: modern-zork-rewrite, Property 4: Invalid command handling
    it('should display error messages for invalid commands without crashing', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid verbs
            invalidVerbGen.map(verb => ({ verb } as ParsedCommand)),
            // Parse errors
            parseErrorGen
          ),
          (command) => {
            // Execute should not throw
            const result = executor.execute(command, state);
            
            // Should always return a result
            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.message).toBeDefined();
            expect(result.message.length).toBeGreaterThan(0);
            expect(Array.isArray(result.stateChanges)).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: modern-zork-rewrite, Property 6: State transition consistency
    it('should maintain consistent state after actions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('TAKE', 'DROP', 'OPEN', 'CLOSE'),
          (verb) => {
            // Create a fresh state for each test
            const testState = createTestState();
            const obj = testState.getObject('TEST-OBJECT');
            
            if (!obj) {
              return true; // Skip if object not found
            }

            // Capture initial state
            const initialLocation = obj.location;
            const initialInventorySize = testState.inventory.length;
            const initialScore = testState.score;
            const initialMoves = testState.moves;

            // Execute command
            const command: ParsedCommand = {
              verb: verb,
              directObject: obj
            };
            
            const result = executor.execute(command, testState);

            // Verify state consistency
            // 1. Object should still exist
            expect(testState.getObject('TEST-OBJECT')).toBeDefined();
            
            // 2. If action succeeded, state should have changed appropriately
            if (result.success) {
              if (verb === 'TAKE') {
                // Object should be in inventory
                expect(testState.isInInventory('TEST-OBJECT')).toBe(true);
                expect(testState.inventory.length).toBe(initialInventorySize + 1);
              } else if (verb === 'DROP') {
                // Object should not be in inventory (if it was taken first)
                if (initialLocation === 'PLAYER') {
                  expect(testState.isInInventory('TEST-OBJECT')).toBe(false);
                  expect(testState.inventory.length).toBe(initialInventorySize - 1);
                }
              }
            }
            
            // 3. Score should not change for basic actions
            expect(testState.score).toBe(initialScore);
            
            // 4. All state properties should be valid
            expect(testState.currentRoom).toBeDefined();
            expect(testState.objects).toBeDefined();
            expect(testState.rooms).toBeDefined();
            expect(Array.isArray(testState.inventory)).toBe(true);
            expect(typeof testState.score).toBe('number');
            expect(typeof testState.moves).toBe('number');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: modern-zork-rewrite, Property 17: Error resilience
    it('should handle unexpected states and errors gracefully', () => {
      fc.assert(
        fc.property(
          fc.record({
            verb: fc.oneof(validVerbGen, invalidVerbGen),
            hasDirectObject: fc.boolean(),
            hasIndirectObject: fc.boolean()
          }),
          (config) => {
            // Create a fresh state for each test
            const testState = createTestState();
            const obj = testState.getObject('TEST-OBJECT');

            // Build command with potentially problematic configurations
            const command: ParsedCommand = {
              verb: config.verb,
              directObject: config.hasDirectObject ? obj : undefined,
              indirectObject: config.hasIndirectObject ? obj : undefined
            };

            // Capture initial state to verify it's preserved on error
            const initialCurrentRoom = testState.currentRoom;
            const initialInventorySize = testState.inventory.length;
            const initialObjectsSize = testState.objects.size;
            const initialRoomsSize = testState.rooms.size;

            // Execute should never throw, even with weird configurations
            let result;
            let threwError = false;
            
            try {
              result = executor.execute(command, testState);
            } catch (error) {
              threwError = true;
              // If it throws, that's a failure
              expect(threwError).toBe(false);
              return false;
            }

            // Should always return a valid result
            expect(result).toBeDefined();
            expect(result.message).toBeDefined();
            expect(typeof result.success).toBe('boolean');
            expect(Array.isArray(result.stateChanges)).toBe(true);

            // On error, state should be preserved
            if (!result.success) {
              // Core state structures should remain intact
              expect(testState.currentRoom).toBe(initialCurrentRoom);
              expect(testState.objects.size).toBe(initialObjectsSize);
              expect(testState.rooms.size).toBe(initialRoomsSize);
              
              // State should still be valid
              expect(testState.getCurrentRoom()).toBeDefined();
              expect(Array.isArray(testState.inventory)).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
