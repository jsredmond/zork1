/**
 * Tests for Major Puzzles
 * Integration tests for the major puzzles in Zork I
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleTester } from './puzzleTester.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ObjectFlag } from '../game/data/flags.js';
import {
  GRATING_PUZZLE,
  TRAP_DOOR_PUZZLE,
  DAM_PUZZLE,
  RAINBOW_PUZZLE,
  BOAT_PUZZLE,
  COFFIN_PUZZLE,
  MAGIC_WORD_PUZZLE,
  getAllPuzzleIds,
  getPuzzleTestCase
} from './majorPuzzles.js';

describe('Major Puzzles', () => {
  let tester: PuzzleTester;

  beforeEach(() => {
    tester = new PuzzleTester();
  });

  describe('Grating Puzzle', () => {
    it('should solve grating puzzle', () => {
      // Set up game state
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const clearing = new RoomImpl({
        id: 'GRATING-CLEARING',
        name: 'Clearing',
        description: 'You are in a clearing.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('GRATING-CLEARING', clearing);

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
      objects.set('GRATE', grating);

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
      objects.set('KEYS', keys);

      const state = new GameState({
        currentRoom: 'GRATING-CLEARING',
        objects,
        rooms,
        inventory: ['KEYS'],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });

      const result = tester.testPuzzle(state, GRATING_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Trap Door Puzzle', () => {
    it('should solve trap door puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const livingRoom = new RoomImpl({
        id: 'LIVING-ROOM',
        name: 'Living Room',
        description: 'You are in the living room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('LIVING-ROOM', livingRoom);

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
      objects.set('TRAP-DOOR', trapDoor);

      const state = new GameState({
        currentRoom: 'LIVING-ROOM',
        objects,
        rooms,
        inventory: [],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });

      const result = tester.testPuzzle(state, TRAP_DOOR_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Dam Puzzle', () => {
    it('should solve dam puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const damRoom = new RoomImpl({
        id: 'DAM-ROOM',
        name: 'Dam',
        description: 'You are at the dam.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('DAM-ROOM', damRoom);

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
      objects.set('BOLT', bolt);

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
      objects.set('WRENCH', wrench);

      const state = new GameState({
        currentRoom: 'DAM-ROOM',
        objects,
        rooms,
        inventory: ['WRENCH'],
        globalVariables: new Map([
          ['GATE_FLAG', false],  // Will be set to true by pushing yellow button
          ['GATES_OPEN', false]
        ]),
        score: 0,
        moves: 0
      });

      const result = tester.testPuzzle(state, DAM_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Rainbow Puzzle', () => {
    it('should solve rainbow puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const aragainFalls = new RoomImpl({
        id: 'ARAGAIN-FALLS',
        name: 'Aragain Falls',
        description: 'You are at the falls.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('ARAGAIN-FALLS', aragainFalls);

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
      objects.set('SCEPTRE', sceptre);

      const state = new GameState({
        currentRoom: 'ARAGAIN-FALLS',
        objects,
        rooms,
        inventory: ['SCEPTRE'],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });
      state.setFlag('RAINBOW_FLAG', false);

      const result = tester.testPuzzle(state, RAINBOW_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Boat Puzzle', () => {
    it('should solve boat puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const boat = new GameObjectImpl({
        id: 'INFLATABLE-BOAT',
        name: 'Boat',
        synonyms: ['boat'],
        adjectives: [],
        description: 'An inflatable boat.',
        location: 'PLAYER',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT])
      });
      objects.set('INFLATABLE-BOAT', boat);

      const inflatedBoat = new GameObjectImpl({
        id: 'INFLATED-BOAT',
        name: 'Boat',
        synonyms: ['boat'],
        adjectives: [],
        description: 'An inflated boat.',
        location: 'NOWHERE',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.VEHBIT])
      });
      objects.set('INFLATED-BOAT', inflatedBoat);

      const pump = new GameObjectImpl({
        id: 'PUMP',
        name: 'Pump',
        synonyms: ['pump'],
        adjectives: [],
        description: 'A pump.',
        location: 'PLAYER',
        properties: new Map(),
        flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.TOOLBIT])
      });
      objects.set('PUMP', pump);

      const state = new GameState({
        currentRoom: 'DAM-BASE',
        objects,
        rooms,
        inventory: ['INFLATABLE-BOAT', 'PUMP'],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });
      state.setFlag('DEFLATE', true);

      const result = tester.testPuzzle(state, BOAT_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Coffin Puzzle', () => {
    it('should solve coffin puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const egyptRoom = new RoomImpl({
        id: 'EGYPT-ROOM',
        name: 'Egypt Room',
        description: 'You are in the egypt room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('EGYPT-ROOM', egyptRoom);

      const state = new GameState({
        currentRoom: 'EGYPT-ROOM',
        objects,
        rooms,
        inventory: [],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });
      state.setFlag('COFFIN_CURE', false);

      const result = tester.testPuzzle(state, COFFIN_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Magic Word Puzzle', () => {
    it('should solve magic word puzzle', () => {
      const objects = new Map<string, GameObjectImpl>();
      const rooms = new Map<string, RoomImpl>();

      const cyclopsRoom = new RoomImpl({
        id: 'CYCLOPS-ROOM',
        name: 'Cyclops Room',
        description: 'You are in the cyclops room.',
        exits: new Map(),
        objects: [],
        visited: false,
        flags: new Set()
      });
      rooms.set('CYCLOPS-ROOM', cyclopsRoom);

      const state = new GameState({
        currentRoom: 'CYCLOPS-ROOM',
        objects,
        rooms,
        inventory: [],
        globalVariables: new Map(),
        score: 0,
        moves: 0
      });
      state.setFlag('MAGIC_FLAG', false);
      state.setFlag('CYCLOPS_FLAG', false);

      const result = tester.testPuzzle(state, MAGIC_WORD_PUZZLE);
      expect(result.passed).toBe(true);
    });
  });

  describe('Puzzle Utilities', () => {
    it('should get all puzzle IDs', () => {
      const ids = getAllPuzzleIds();
      expect(ids).toContain('GRATING');
      expect(ids).toContain('TRAP_DOOR');
      expect(ids).toContain('DAM');
      expect(ids).toContain('RAINBOW');
      expect(ids).toContain('BOAT');
      expect(ids).toContain('COFFIN');
      expect(ids).toContain('MAGIC_WORD');
    });

    it('should get puzzle test case by ID', () => {
      const puzzle = getPuzzleTestCase('GRATING');
      expect(puzzle).toBeDefined();
      expect(puzzle?.name).toBe('Grating Puzzle');
    });

    it('should return undefined for non-existent puzzle', () => {
      const puzzle = getPuzzleTestCase('NON_EXISTENT');
      expect(puzzle).toBeUndefined();
    });
  });
});
