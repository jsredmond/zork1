/**
 * Room testing functionality
 * Tests room descriptions, exits, and objects
 */

import { GameState } from '../game/state';
import { Room, Direction } from '../game/rooms';
import { TestResult, TestType, GameStateSnapshot } from './types';
import { captureGameState } from './bugTracker';

/**
 * RoomTester class for testing room functionality
 */
export class RoomTester {
  /**
   * Test that a room displays its description correctly
   */
  testRoomDescription(roomId: string, state: GameState): TestResult {
    const room = state.getRoom(roomId);
    const timestamp = new Date();
    
    if (!room) {
      return {
        testId: `room-desc-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_DESCRIPTION,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check that room has a name
    if (!room.name || room.name.trim() === '') {
      return {
        testId: `room-desc-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_DESCRIPTION,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} has no name`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check that room has a description
    if (!room.description || room.description.trim() === '') {
      return {
        testId: `room-desc-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_DESCRIPTION,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} has no description`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `room-desc-${roomId}-${timestamp.getTime()}`,
      testType: TestType.ROOM_DESCRIPTION,
      itemId: roomId,
      passed: true,
      message: `Room ${roomId} has valid name and description`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test that all exits from a room work as expected
   */
  testRoomExits(roomId: string, state: GameState): TestResult {
    const room = state.getRoom(roomId);
    const timestamp = new Date();
    
    if (!room) {
      return {
        testId: `room-exits-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_EXITS,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check that exits point to valid rooms
    const invalidExits: string[] = [];
    
    for (const [direction, exit] of room.exits.entries()) {
      // Skip exits with empty destinations (blocked exits)
      if (!exit.destination || exit.destination === '') {
        continue;
      }
      
      const destinationRoom = state.getRoom(exit.destination);
      if (!destinationRoom) {
        invalidExits.push(`${direction} -> ${exit.destination}`);
      }
    }
    
    if (invalidExits.length > 0) {
      return {
        testId: `room-exits-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_EXITS,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} has invalid exits: ${invalidExits.join(', ')}`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `room-exits-${roomId}-${timestamp.getTime()}`,
      testType: TestType.ROOM_EXITS,
      itemId: roomId,
      passed: true,
      message: `Room ${roomId} has ${room.exits.size} valid exits`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test that objects in a room are valid
   */
  testRoomObjects(roomId: string, state: GameState): TestResult {
    const room = state.getRoom(roomId);
    const timestamp = new Date();
    
    if (!room) {
      return {
        testId: `room-objects-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_DESCRIPTION,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check that all objects in the room exist
    const invalidObjects: string[] = [];
    
    for (const objectId of room.objects) {
      const obj = state.getObject(objectId);
      if (!obj) {
        invalidObjects.push(objectId);
      }
    }
    
    if (invalidObjects.length > 0) {
      return {
        testId: `room-objects-${roomId}-${timestamp.getTime()}`,
        testType: TestType.ROOM_DESCRIPTION,
        itemId: roomId,
        passed: false,
        message: `Room ${roomId} references invalid objects: ${invalidObjects.join(', ')}`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `room-objects-${roomId}-${timestamp.getTime()}`,
      testType: TestType.ROOM_DESCRIPTION,
      itemId: roomId,
      passed: true,
      message: `Room ${roomId} has ${room.objects.length} valid objects`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Run all tests for a room
   */
  testRoom(roomId: string, state: GameState): TestResult[] {
    return [
      this.testRoomDescription(roomId, state),
      this.testRoomExits(roomId, state),
      this.testRoomObjects(roomId, state)
    ];
  }
  
  /**
   * Run tests for multiple rooms
   */
  testRooms(roomIds: string[], state: GameState): TestResult[] {
    const results: TestResult[] = [];
    
    for (const roomId of roomIds) {
      results.push(...this.testRoom(roomId, state));
    }
    
    return results;
  }
}

/**
 * Build a graph of room connections from game state
 */
export function buildRoomGraph(state: GameState): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  
  // Initialize graph with all rooms
  for (const [roomId, room] of state.rooms.entries()) {
    if (!graph.has(roomId)) {
      graph.set(roomId, new Set());
    }
    
    // Add edges for each exit
    for (const [direction, exit] of room.exits.entries()) {
      // Skip exits with no destination (blocked exits)
      if (!exit.destination || exit.destination === '') {
        continue;
      }
      
      // Add edge from this room to destination
      const neighbors = graph.get(roomId);
      if (neighbors) {
        neighbors.add(exit.destination);
      }
    }
  }
  
  return graph;
}

/**
 * Perform breadth-first search to find all reachable rooms from a starting room
 */
export function findReachableRooms(
  startRoom: string,
  graph: Map<string, Set<string>>
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [startRoom];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Skip if already visited
    if (reachable.has(current)) {
      continue;
    }
    
    // Mark as reachable
    reachable.add(current);
    
    // Add neighbors to queue
    const neighbors = graph.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!reachable.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
  
  return reachable;
}

/**
 * Identify rooms that cannot be reached from the starting location
 */
export function findUnreachableRooms(state: GameState, startRoom: string = 'WEST-OF-HOUSE'): string[] {
  const graph = buildRoomGraph(state);
  const reachable = findReachableRooms(startRoom, graph);
  
  const unreachable: string[] = [];
  
  for (const roomId of state.rooms.keys()) {
    if (!reachable.has(roomId)) {
      unreachable.push(roomId);
    }
  }
  
  return unreachable;
}

/**
 * Check if a specific room is reachable from the starting location
 */
export function isRoomReachable(
  roomId: string,
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): boolean {
  const graph = buildRoomGraph(state);
  const reachable = findReachableRooms(startRoom, graph);
  return reachable.has(roomId);
}

/**
 * Execute room tests and generate bug reports for failures
 */
export interface RoomTestExecutionResult {
  results: TestResult[];
  bugsFound: BugReport[];
  testedRooms: string[];
}

import { BugReport } from './types';
import { createBugReportFromTest } from './bugTracker';

/**
 * Execute tests for all rooms in the game
 */
export function executeRoomTests(state: GameState): RoomTestExecutionResult {
  const tester = new RoomTester();
  const results: TestResult[] = [];
  const bugsFound: BugReport[] = [];
  const testedRooms: string[] = [];
  
  // Get all room IDs from game state
  const roomIds = Array.from(state.rooms.keys());
  
  // Execute tests for each room
  for (const roomId of roomIds) {
    const roomResults = tester.testRoom(roomId, state);
    results.push(...roomResults);
    testedRooms.push(roomId);
    
    // Generate bug reports for failed tests
    for (const result of roomResults) {
      if (!result.passed) {
        const bug = createBugReportFromTest(result, state);
        bugsFound.push(bug);
      }
    }
  }
  
  return {
    results,
    bugsFound,
    testedRooms
  };
}

/**
 * Execute tests for a specific subset of rooms
 */
export function executeRoomTestsForSubset(
  roomIds: string[],
  state: GameState
): RoomTestExecutionResult {
  const tester = new RoomTester();
  const results: TestResult[] = [];
  const bugsFound: BugReport[] = [];
  const testedRooms: string[] = [];
  
  // Execute tests for each room
  for (const roomId of roomIds) {
    // Skip if room doesn't exist
    if (!state.rooms.has(roomId)) {
      continue;
    }
    
    const roomResults = tester.testRoom(roomId, state);
    results.push(...roomResults);
    testedRooms.push(roomId);
    
    // Generate bug reports for failed tests
    for (const result of roomResults) {
      if (!result.passed) {
        const bug = createBugReportFromTest(result, state);
        bugsFound.push(bug);
      }
    }
  }
  
  return {
    results,
    bugsFound,
    testedRooms
  };
}
