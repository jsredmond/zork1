/**
 * Tests for Puzzle Tester
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleTester, PuzzleTestCase } from './puzzleTester.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ObjectFlag } from '../game/data/flags.js';

describe('PuzzleTester', () => {
  let tester: PuzzleTester;
  let state: GameState;

  beforeEach(() => {
    tester = new PuzzleTester();

    // Create basic test state
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    // Create test room
    const testRoom = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('TEST-ROOM', testRoom);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects,
      rooms,
      inventory: [],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
  });

  describe('Grating Puzzle', () => {
    beforeEach(() => {
      // Set up grating puzzle
      const clearing = new RoomImpl({
        id: 'GRATING-CLEARING',
        name: 'Clearing',
        description: 'You are in a clearing.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('GRATING-CLEARING', clearing);

      const grating = new GameObjectImpl({
        id: 'GRATE',
        name: 'Grating',
        synonyms: ['grate', 'grating'],
        adjectives: [],
        description: 'A grating.',
        location: 'GRATING-CLEARING',
        properties: new Map(),
        flags: new Set([ObjectFlag.DOORBIT, ObjectFlag.INVISIBLE])
      });
      state.objects.set('GRATE', grating);

      const keys = new GameObjectImpl({
        id: 'KEYS',
        name: 'Keys',
        synonyms: ['keys'],
        adjectives: [],
        description: 'A set of keys.',
        location: 'PLAYER',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT])
      });
      state.objects.set('KEYS', keys);

      state.setCurrentRoom('GRATING-CLEARING');
      state.inventory.push('KEYS');
    });

    it('should test grating puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'GRATING',
        name: 'Grating Puzzle',
        description: 'Open the grating with keys',
        prerequisites: [
          {
            type: 'OBJECT_IN_INVENTORY',
            objectId: 'KEYS'
          }
        ],
        solutionSteps: [
          {
            action: 'REVEAL_GRATING',
            expectedSuccess: true,
            expectedMessageContains: 'grating is revealed'
          },
          {
            action: 'UNLOCK_GRATING',
            objectId: 'KEYS',
            expectedSuccess: true,
            expectedMessageContains: 'unlocked'
          }
        ],
        expectedStateChanges: [
          {
            type: 'OBJECT_FLAG',
            objectId: 'GRATE',
            objectFlag: ObjectFlag.OPENBIT,
            expectedValue: true
          },
          {
            type: 'OBJECT_FLAG',
            objectId: 'GRATE',
            objectFlag: ObjectFlag.INVISIBLE,
            expectedValue: false
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });

    it('should fail if prerequisites not met', () => {
      // Remove keys from inventory
      state.inventory = [];
      state.moveObject('KEYS', 'TEST-ROOM');

      const testCase: PuzzleTestCase = {
        puzzleId: 'GRATING',
        name: 'Grating Puzzle',
        description: 'Open the grating with keys',
        prerequisites: [
          {
            type: 'OBJECT_IN_INVENTORY',
            objectId: 'KEYS'
          }
        ],
        solutionSteps: [],
        expectedStateChanges: []
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Prerequisites not met');
    });
  });

  describe('Trap Door Puzzle', () => {
    beforeEach(() => {
      // Set up trap door puzzle
      const livingRoom = new RoomImpl({
        id: 'LIVING-ROOM',
        name: 'Living Room',
        description: 'You are in the living room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('LIVING-ROOM', livingRoom);

      const trapDoor = new GameObjectImpl({
        id: 'TRAP-DOOR',
        name: 'Trap Door',
        synonyms: ['door', 'trapdoor'],
        adjectives: ['trap'],
        description: 'A trap door.',
        location: 'LIVING-ROOM',
        properties: new Map(),
        flags: new Set([ObjectFlag.DOORBIT, ObjectFlag.INVISIBLE])
      });
      state.objects.set('TRAP-DOOR', trapDoor);

      state.setCurrentRoom('LIVING-ROOM');
    });

    it('should test trap door puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'TRAP_DOOR',
        name: 'Trap Door Puzzle',
        description: 'Move rug and open trap door',
        prerequisites: [],
        solutionSteps: [
          {
            action: 'MOVE_RUG',
            expectedSuccess: true,
            expectedMessageContains: 'trap door'
          },
          {
            action: 'OPEN_TRAP_DOOR',
            expectedSuccess: true,
            expectedMessageContains: 'staircase'
          }
        ],
        expectedStateChanges: [
          {
            type: 'OBJECT_FLAG',
            objectId: 'TRAP-DOOR',
            objectFlag: ObjectFlag.INVISIBLE,
            expectedValue: false
          },
          {
            type: 'OBJECT_FLAG',
            objectId: 'TRAP-DOOR',
            objectFlag: ObjectFlag.OPENBIT,
            expectedValue: true
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });
  });

  describe('Dam Puzzle', () => {
    beforeEach(() => {
      // Set up dam puzzle
      const damRoom = new RoomImpl({
        id: 'DAM-ROOM',
        name: 'Dam',
        description: 'You are at the dam.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('DAM-ROOM', damRoom);

      const bolt = new GameObjectImpl({
        id: 'BOLT',
        name: 'Bolt',
        synonyms: ['bolt', 'nut'],
        adjectives: ['metal', 'large'],
        description: 'A large metal bolt.',
        location: 'DAM-ROOM',
        properties: new Map(),
        flags: new Set([ObjectFlag.TURNBIT, ObjectFlag.NDESCBIT])
      });
      state.objects.set('BOLT', bolt);

      const wrench = new GameObjectImpl({
        id: 'WRENCH',
        name: 'Wrench',
        synonyms: ['wrench'],
        adjectives: [],
        description: 'A wrench.',
        location: 'PLAYER',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.TOOLBIT])
      });
      state.objects.set('WRENCH', wrench);

      state.setCurrentRoom('DAM-ROOM');
      state.inventory.push('WRENCH');
      state.setGlobalVariable('GATE_FLAG', true);
      state.setGlobalVariable('GATES_OPEN', false);
    });

    it('should test dam puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'DAM',
        name: 'Dam Puzzle',
        description: 'Turn bolt with wrench to open gates',
        prerequisites: [
          {
            type: 'OBJECT_IN_INVENTORY',
            objectId: 'WRENCH'
          },
          {
            type: 'GLOBAL_VARIABLE',
            variableName: 'GATE_FLAG',
            expectedValue: true
          }
        ],
        solutionSteps: [
          {
            action: 'TURN_BOLT',
            objectId: 'WRENCH',
            expectedSuccess: true,
            expectedMessageContains: 'gates open'
          }
        ],
        expectedStateChanges: [
          {
            type: 'GLOBAL_VARIABLE',
            variableName: 'GATES_OPEN',
            expectedValue: true
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });
  });

  describe('Rainbow Puzzle', () => {
    beforeEach(() => {
      // Set up rainbow puzzle
      const aragainFalls = new RoomImpl({
        id: 'ARAGAIN-FALLS',
        name: 'Aragain Falls',
        description: 'You are at the falls.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('ARAGAIN-FALLS', aragainFalls);

      const sceptre = new GameObjectImpl({
        id: 'SCEPTRE',
        name: 'Sceptre',
        synonyms: ['sceptre', 'scepter'],
        adjectives: [],
        description: 'A sceptre.',
        location: 'PLAYER',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT])
      });
      state.objects.set('SCEPTRE', sceptre);

      state.setCurrentRoom('ARAGAIN-FALLS');
      state.inventory.push('SCEPTRE');
      state.setFlag('RAINBOW_FLAG', false);
    });

    it('should test rainbow puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'RAINBOW',
        name: 'Rainbow Puzzle',
        description: 'Wave sceptre to make rainbow appear',
        prerequisites: [
          {
            type: 'OBJECT_IN_INVENTORY',
            objectId: 'SCEPTRE'
          }
        ],
        solutionSteps: [
          {
            action: 'WAVE_SCEPTRE',
            objectId: 'SCEPTRE',
            expectedSuccess: true,
            expectedMessageContains: 'rainbow'
          }
        ],
        expectedStateChanges: [
          {
            type: 'FLAG',
            flagName: 'RAINBOW_FLAG',
            expectedValue: true
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });
  });

  describe('Coffin Puzzle', () => {
    beforeEach(() => {
      // Set up coffin puzzle
      const egyptRoom = new RoomImpl({
        id: 'EGYPT-ROOM',
        name: 'Egypt Room',
        description: 'You are in the egypt room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('EGYPT-ROOM', egyptRoom);

      state.setCurrentRoom('EGYPT-ROOM');
      state.setFlag('COFFIN_CURE', false);
    });

    it('should test coffin puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'COFFIN',
        name: 'Coffin Puzzle',
        description: 'Push coffin to reveal passage',
        prerequisites: [],
        solutionSteps: [
          {
            action: 'PUSH_COFFIN',
            expectedSuccess: true,
            expectedMessageContains: 'passage'
          }
        ],
        expectedStateChanges: [
          {
            type: 'FLAG',
            flagName: 'COFFIN_CURE',
            expectedValue: true
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });
  });

  describe('Magic Word Puzzle', () => {
    beforeEach(() => {
      // Set up magic word puzzle
      const cyclopsRoom = new RoomImpl({
        id: 'CYCLOPS-ROOM',
        name: 'Cyclops Room',
        description: 'You are in the cyclops room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      state.rooms.set('CYCLOPS-ROOM', cyclopsRoom);

      state.setCurrentRoom('CYCLOPS-ROOM');
      state.setFlag('MAGIC_FLAG', false);
      state.setFlag('CYCLOPS_FLAG', false);
    });

    it('should test magic word puzzle solution', () => {
      const testCase: PuzzleTestCase = {
        puzzleId: 'MAGIC_WORD',
        name: 'Magic Word Puzzle',
        description: 'Say ULYSSES to scare cyclops',
        prerequisites: [],
        solutionSteps: [
          {
            action: 'SAY_MAGIC_WORD',
            word: 'ULYSSES',
            expectedSuccess: true,
            expectedMessageContains: 'cyclops'
          }
        ],
        expectedStateChanges: [
          {
            type: 'FLAG',
            flagName: 'MAGIC_FLAG',
            expectedValue: true
          },
          {
            type: 'FLAG',
            flagName: 'CYCLOPS_FLAG',
            expectedValue: true
          }
        ]
      };

      const result = tester.testPuzzle(state, testCase);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('solved successfully');
    });
  });
});


describe('PuzzleDependencyTracker', () => {
  let tracker: import('./puzzleTester.js').PuzzleDependencyTracker;

  beforeEach(async () => {
    const module = await import('./puzzleTester.js');
    tracker = new module.PuzzleDependencyTracker();
  });

  it('should add and retrieve dependencies', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B', 'PUZZLE_C']);
    
    const deps = tracker.getDependencies('PUZZLE_A');
    expect(deps).toEqual(['PUZZLE_B', 'PUZZLE_C']);
  });

  it('should return empty array for puzzle with no dependencies', () => {
    const deps = tracker.getDependencies('PUZZLE_A');
    expect(deps).toEqual([]);
  });

  it('should determine correct solving order', () => {
    // PUZZLE_C depends on nothing
    // PUZZLE_B depends on PUZZLE_C
    // PUZZLE_A depends on PUZZLE_B
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B']);
    tracker.addDependency('PUZZLE_B', ['PUZZLE_C']);
    tracker.addDependency('PUZZLE_C', []);

    const order = tracker.getSolvingOrder();
    
    // PUZZLE_C should come before PUZZLE_B, which should come before PUZZLE_A
    const indexA = order.indexOf('PUZZLE_A');
    const indexB = order.indexOf('PUZZLE_B');
    const indexC = order.indexOf('PUZZLE_C');
    
    expect(indexC).toBeLessThan(indexB);
    expect(indexB).toBeLessThan(indexA);
  });

  it('should detect circular dependencies', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B']);
    tracker.addDependency('PUZZLE_B', ['PUZZLE_A']);

    expect(() => tracker.getSolvingOrder()).toThrow('Circular dependency');
  });

  it('should check if puzzle can be solved', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B', 'PUZZLE_C']);
    
    const completed = new Set(['PUZZLE_B', 'PUZZLE_C']);
    expect(tracker.canSolvePuzzle('PUZZLE_A', completed)).toBe(true);
    
    const incomplete = new Set(['PUZZLE_B']);
    expect(tracker.canSolvePuzzle('PUZZLE_A', incomplete)).toBe(false);
  });

  it('should get available puzzles', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B']);
    tracker.addDependency('PUZZLE_B', []);
    tracker.addDependency('PUZZLE_C', []);

    const completed = new Set<string>();
    let available = tracker.getAvailablePuzzles(completed);
    
    // PUZZLE_B and PUZZLE_C should be available (no dependencies)
    expect(available).toContain('PUZZLE_B');
    expect(available).toContain('PUZZLE_C');
    expect(available).not.toContain('PUZZLE_A');

    // After completing PUZZLE_B, PUZZLE_A should become available
    completed.add('PUZZLE_B');
    available = tracker.getAvailablePuzzles(completed);
    expect(available).toContain('PUZZLE_A');
  });

  it('should validate dependencies', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B']);
    tracker.addDependency('PUZZLE_B', []);

    const result = tracker.validateDependencies();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid dependencies', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B', 'PUZZLE_X']);
    tracker.addDependency('PUZZLE_B', []);

    const result = tracker.validateDependencies();
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('PUZZLE_X');
  });

  it('should calculate dependency depth', () => {
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B']);
    tracker.addDependency('PUZZLE_B', ['PUZZLE_C']);
    tracker.addDependency('PUZZLE_C', []);

    expect(tracker.getDependencyDepth('PUZZLE_C')).toBe(0);
    expect(tracker.getDependencyDepth('PUZZLE_B')).toBe(1);
    expect(tracker.getDependencyDepth('PUZZLE_A')).toBe(2);
  });

  it('should handle complex dependency graph', () => {
    // PUZZLE_D depends on nothing
    // PUZZLE_C depends on PUZZLE_D
    // PUZZLE_B depends on PUZZLE_D
    // PUZZLE_A depends on PUZZLE_B and PUZZLE_C
    tracker.addDependency('PUZZLE_A', ['PUZZLE_B', 'PUZZLE_C']);
    tracker.addDependency('PUZZLE_B', ['PUZZLE_D']);
    tracker.addDependency('PUZZLE_C', ['PUZZLE_D']);
    tracker.addDependency('PUZZLE_D', []);

    const order = tracker.getSolvingOrder();
    
    // PUZZLE_D should come first
    expect(order[0]).toBe('PUZZLE_D');
    
    // PUZZLE_A should come last
    expect(order[order.length - 1]).toBe('PUZZLE_A');
    
    // PUZZLE_B and PUZZLE_C should come after PUZZLE_D but before PUZZLE_A
    const indexA = order.indexOf('PUZZLE_A');
    const indexB = order.indexOf('PUZZLE_B');
    const indexC = order.indexOf('PUZZLE_C');
    const indexD = order.indexOf('PUZZLE_D');
    
    expect(indexD).toBeLessThan(indexB);
    expect(indexD).toBeLessThan(indexC);
    expect(indexB).toBeLessThan(indexA);
    expect(indexC).toBeLessThan(indexA);
  });
});
