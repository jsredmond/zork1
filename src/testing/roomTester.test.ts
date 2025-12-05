/**
 * Tests for room testing functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../game/state';
import { RoomImpl, Direction } from '../game/rooms';
import { RoomFlag } from '../game/data/flags';
import {
  RoomTester,
  buildRoomGraph,
  findReachableRooms,
  findUnreachableRooms,
  isRoomReachable,
  executeRoomTests,
  executeRoomTestsForSubset
} from './roomTester';
import { TestType } from './types';
import * as fc from 'fast-check';

describe('RoomTester', () => {
  let state: GameState;
  let tester: RoomTester;

  beforeEach(() => {
    // Create a simple test game state with a few rooms
    const rooms = new Map();
    
    rooms.set('ROOM-A', new RoomImpl({
      id: 'ROOM-A',
      name: 'Room A',
      description: 'This is room A',
      exits: new Map([
        [Direction.NORTH, { destination: 'ROOM-B' }],
        [Direction.EAST, { destination: 'ROOM-C' }]
      ]),
      objects: []
    }));
    
    rooms.set('ROOM-B', new RoomImpl({
      id: 'ROOM-B',
      name: 'Room B',
      description: 'This is room B',
      exits: new Map([
        [Direction.SOUTH, { destination: 'ROOM-A' }]
      ]),
      objects: []
    }));
    
    rooms.set('ROOM-C', new RoomImpl({
      id: 'ROOM-C',
      name: 'Room C',
      description: 'This is room C',
      exits: new Map([
        [Direction.WEST, { destination: 'ROOM-A' }],
        [Direction.NORTH, { destination: 'ROOM-D' }]
      ]),
      objects: []
    }));
    
    rooms.set('ROOM-D', new RoomImpl({
      id: 'ROOM-D',
      name: 'Room D',
      description: 'This is room D',
      exits: new Map([
        [Direction.SOUTH, { destination: 'ROOM-C' }]
      ]),
      objects: []
    }));
    
    // Room E is unreachable
    rooms.set('ROOM-E', new RoomImpl({
      id: 'ROOM-E',
      name: 'Room E',
      description: 'This is room E',
      exits: new Map(),
      objects: []
    }));
    
    state = new GameState({
      currentRoom: 'ROOM-A',
      rooms,
      objects: new Map()
    });
    
    tester = new RoomTester();
  });

  describe('testRoomDescription', () => {
    it('should pass for room with valid name and description', () => {
      const result = tester.testRoomDescription('ROOM-A', state);
      
      expect(result.passed).toBe(true);
      expect(result.testType).toBe(TestType.ROOM_DESCRIPTION);
      expect(result.itemId).toBe('ROOM-A');
    });

    it('should fail for non-existent room', () => {
      const result = tester.testRoomDescription('NON-EXISTENT', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should fail for room with empty name', () => {
      const room = new RoomImpl({
        id: 'BAD-ROOM',
        name: '',
        description: 'Has description'
      });
      state.rooms.set('BAD-ROOM', room);
      
      const result = tester.testRoomDescription('BAD-ROOM', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('no name');
    });

    it('should fail for room with empty description', () => {
      const room = new RoomImpl({
        id: 'BAD-ROOM',
        name: 'Bad Room',
        description: ''
      });
      state.rooms.set('BAD-ROOM', room);
      
      const result = tester.testRoomDescription('BAD-ROOM', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('no description');
    });
  });

  describe('testRoomExits', () => {
    it('should pass for room with valid exits', () => {
      const result = tester.testRoomExits('ROOM-A', state);
      
      expect(result.passed).toBe(true);
      expect(result.testType).toBe(TestType.ROOM_EXITS);
    });

    it('should fail for room with invalid exit destination', () => {
      const room = new RoomImpl({
        id: 'BAD-ROOM',
        name: 'Bad Room',
        description: 'Has bad exit',
        exits: new Map([
          [Direction.NORTH, { destination: 'NON-EXISTENT-ROOM' }]
        ])
      });
      state.rooms.set('BAD-ROOM', room);
      
      const result = tester.testRoomExits('BAD-ROOM', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('invalid exits');
    });

    it('should pass for room with blocked exits (empty destination)', () => {
      const room = new RoomImpl({
        id: 'BLOCKED-ROOM',
        name: 'Blocked Room',
        description: 'Has blocked exit',
        exits: new Map([
          [Direction.NORTH, { destination: '', message: 'The door is locked' }]
        ])
      });
      state.rooms.set('BLOCKED-ROOM', room);
      
      const result = tester.testRoomExits('BLOCKED-ROOM', state);
      
      expect(result.passed).toBe(true);
    });
  });

  describe('testRoomObjects', () => {
    it('should pass for room with no objects', () => {
      const result = tester.testRoomObjects('ROOM-A', state);
      
      expect(result.passed).toBe(true);
    });

    it('should fail for room with invalid object references', () => {
      const room = state.getRoom('ROOM-A');
      if (room) {
        room.objects.push('NON-EXISTENT-OBJECT');
      }
      
      const result = tester.testRoomObjects('ROOM-A', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('invalid objects');
    });
  });

  describe('buildRoomGraph', () => {
    it('should build a graph of room connections', () => {
      const graph = buildRoomGraph(state);
      
      expect(graph.size).toBe(5);
      expect(graph.get('ROOM-A')?.has('ROOM-B')).toBe(true);
      expect(graph.get('ROOM-A')?.has('ROOM-C')).toBe(true);
      expect(graph.get('ROOM-B')?.has('ROOM-A')).toBe(true);
    });

    it('should not include blocked exits in graph', () => {
      const room = new RoomImpl({
        id: 'BLOCKED-ROOM',
        name: 'Blocked Room',
        description: 'Has blocked exit',
        exits: new Map([
          [Direction.NORTH, { destination: '', message: 'Blocked' }],
          [Direction.SOUTH, { destination: 'ROOM-A' }]
        ])
      });
      state.rooms.set('BLOCKED-ROOM', room);
      
      const graph = buildRoomGraph(state);
      const neighbors = graph.get('BLOCKED-ROOM');
      
      expect(neighbors?.has('ROOM-A')).toBe(true);
      expect(neighbors?.size).toBe(1);
    });
  });

  describe('findReachableRooms', () => {
    it('should find all rooms reachable from starting room', () => {
      const graph = buildRoomGraph(state);
      const reachable = findReachableRooms('ROOM-A', graph);
      
      expect(reachable.has('ROOM-A')).toBe(true);
      expect(reachable.has('ROOM-B')).toBe(true);
      expect(reachable.has('ROOM-C')).toBe(true);
      expect(reachable.has('ROOM-D')).toBe(true);
      expect(reachable.has('ROOM-E')).toBe(false);
    });

    it('should handle starting from different rooms', () => {
      const graph = buildRoomGraph(state);
      const reachable = findReachableRooms('ROOM-C', graph);
      
      expect(reachable.has('ROOM-A')).toBe(true);
      expect(reachable.has('ROOM-B')).toBe(true);
      expect(reachable.has('ROOM-C')).toBe(true);
      expect(reachable.has('ROOM-D')).toBe(true);
    });
  });

  describe('findUnreachableRooms', () => {
    it('should identify unreachable rooms', () => {
      const unreachable = findUnreachableRooms(state, 'ROOM-A');
      
      expect(unreachable).toContain('ROOM-E');
      expect(unreachable.length).toBe(1);
    });

    it('should return empty array when all rooms are reachable', () => {
      // Remove unreachable room
      state.rooms.delete('ROOM-E');
      
      const unreachable = findUnreachableRooms(state, 'ROOM-A');
      
      expect(unreachable.length).toBe(0);
    });
  });

  describe('isRoomReachable', () => {
    it('should return true for reachable rooms', () => {
      expect(isRoomReachable('ROOM-A', state, 'ROOM-A')).toBe(true);
      expect(isRoomReachable('ROOM-B', state, 'ROOM-A')).toBe(true);
      expect(isRoomReachable('ROOM-C', state, 'ROOM-A')).toBe(true);
      expect(isRoomReachable('ROOM-D', state, 'ROOM-A')).toBe(true);
    });

    it('should return false for unreachable rooms', () => {
      expect(isRoomReachable('ROOM-E', state, 'ROOM-A')).toBe(false);
    });
  });

  describe('executeRoomTests', () => {
    it('should execute tests for all rooms', () => {
      const result = executeRoomTests(state);
      
      expect(result.testedRooms.length).toBe(5);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should generate bug reports for failed tests', () => {
      // Add a room with invalid exit
      const badRoom = new RoomImpl({
        id: 'BAD-ROOM',
        name: 'Bad Room',
        description: 'Bad',
        exits: new Map([
          [Direction.NORTH, { destination: 'NON-EXISTENT' }]
        ])
      });
      state.rooms.set('BAD-ROOM', badRoom);
      
      const result = executeRoomTests(state);
      
      expect(result.bugsFound.length).toBeGreaterThan(0);
    });
  });

  describe('executeRoomTestsForSubset', () => {
    it('should execute tests for specified rooms only', () => {
      const result = executeRoomTestsForSubset(['ROOM-A', 'ROOM-B'], state);
      
      expect(result.testedRooms.length).toBe(2);
      expect(result.testedRooms).toContain('ROOM-A');
      expect(result.testedRooms).toContain('ROOM-B');
    });

    it('should skip non-existent rooms', () => {
      const result = executeRoomTestsForSubset(['ROOM-A', 'NON-EXISTENT'], state);
      
      expect(result.testedRooms.length).toBe(1);
      expect(result.testedRooms).toContain('ROOM-A');
    });
  });
});

/**
 * Property-Based Tests
 */
describe('Room Reachability Properties', () => {
  /**
   * Feature: exhaustive-game-testing, Property 5: Room reachability
   * Validates: Requirements 1.5
   * 
   * For any room in the game, the reachability analysis should correctly identify
   * whether it can be reached from the starting room
   */
  it('property: reachability analysis correctly identifies reachable rooms', () => {
    fc.assert(
      fc.property(
        // Generate a random room graph structure
        fc.array(
          fc.record({
            id: fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F'), { minLength: 1, maxLength: 3 }),
            exits: fc.array(
              fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F'), { minLength: 1, maxLength: 3 }),
              { maxLength: 4 }
            )
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (roomDefs) => {
          // Build game state from generated room definitions
          const rooms = new Map();
          const startRoomId = roomDefs.length > 0 ? roomDefs[0].id : 'START';
          
          for (const roomDef of roomDefs) {
            const exits = new Map();
            for (let i = 0; i < roomDef.exits.length; i++) {
              const direction = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST][i % 4];
              exits.set(direction, { destination: roomDef.exits[i] });
            }
            
            rooms.set(roomDef.id, new RoomImpl({
              id: roomDef.id,
              name: `Room ${roomDef.id}`,
              description: `This is room ${roomDef.id}`,
              exits,
              objects: []
            }));
          }
          
          const state = new GameState({
            currentRoom: startRoomId,
            rooms,
            objects: new Map()
          });
          
          // Property: The reachability analysis should correctly partition rooms
          // into reachable and unreachable sets
          const unreachableRooms = findUnreachableRooms(state, startRoomId);
          const unreachableSet = new Set(unreachableRooms);
          
          // For each room in the game
          for (const roomId of state.rooms.keys()) {
            const isReachable = isRoomReachable(roomId, state, startRoomId);
            const markedUnreachable = unreachableSet.has(roomId);
            
            // Property: A room should be marked unreachable if and only if it's not reachable
            expect(markedUnreachable).toBe(!isReachable);
          }
          
          // Additional property: The starting room should always be reachable
          expect(isRoomReachable(startRoomId, state, startRoomId)).toBe(true);
          expect(unreachableSet.has(startRoomId)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
