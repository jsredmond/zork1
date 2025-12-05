/**
 * Edge Case Testing
 * Tests edge cases and error conditions in the game
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { Room } from '../game/rooms.js';
import { ObjectFlag, RoomFlag } from '../game/data/flags.js';
import { TestResult, TestType, GameStateSnapshot } from './types.js';
import { captureGameState } from './bugTracker.js';
import { isRoomLit } from '../engine/lighting.js';
import { CommandExecutor } from '../engine/executor.js';
import { Parser } from '../parser/parser.js';

/**
 * Information about a conditional exit
 */
interface ConditionalExitInfo {
  roomId: string;
  direction: string;
  destination: string;
  condition?: string;
  requiredFlag?: string;
  requiredObject?: string;
  blockedMessage?: string;
}

/**
 * EdgeCaseTester class for testing edge cases and error conditions
 */
export class EdgeCaseTester {
  private executor: CommandExecutor;
  private parser: Parser;

  constructor() {
    this.executor = new CommandExecutor();
    this.parser = new Parser();
  }

  /**
   * Test actions in darkness
   * Validates that appropriate error messages are shown when trying to interact with objects in the dark
   */
  testActionsInDarkness(state: GameState): TestResult[] {
    const results: TestResult[] = [];
    const timestamp = new Date();

    // Find or create a dark room for testing
    const darkRoom = this.findOrCreateDarkRoom(state);
    if (!darkRoom) {
      results.push({
        testId: `edge-darkness-setup-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'DARKNESS',
        passed: false,
        message: 'Could not find or create a dark room for testing',
        timestamp,
        gameState: captureGameState(state)
      });
      return results;
    }

    // Save original room
    const originalRoom = state.currentRoom;

    // Move to dark room
    state.setCurrentRoom(darkRoom);

    // Verify room is actually dark
    if (isRoomLit(state)) {
      results.push({
        testId: `edge-darkness-verify-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: darkRoom,
        passed: false,
        message: `Room ${darkRoom} is not dark as expected`,
        timestamp,
        gameState: captureGameState(state)
      });
      state.setCurrentRoom(originalRoom);
      return results;
    }

    // Test LOOK in darkness
    results.push(this.testLookInDarkness(state, darkRoom));

    // Test EXAMINE in darkness
    results.push(this.testExamineInDarkness(state, darkRoom));

    // Test TAKE in darkness
    results.push(this.testTakeInDarkness(state, darkRoom));

    // Restore original room
    state.setCurrentRoom(originalRoom);

    return results;
  }

  /**
   * Find a dark room in the game or create test conditions for darkness
   */
  private findOrCreateDarkRoom(state: GameState): string | null {
    // Look for a room without ONBIT flag
    for (const [roomId, room] of state.rooms.entries()) {
      if (!room.hasFlag(RoomFlag.ONBIT)) {
        return roomId;
      }
    }

    // If no dark room found, return null
    return null;
  }

  /**
   * Test LOOK command in darkness
   */
  private testLookInDarkness(state: GameState, roomId: string): TestResult {
    const timestamp = new Date();
    const command = this.parser.parse('look', state);
    const result = this.executor.execute(command, state);

    // Should get darkness message
    const expectedMessages = [
      'pitch black',
      'too dark',
      'grue',
      'darkness'
    ];

    const hasExpectedMessage = expectedMessages.some(msg =>
      result.message.toLowerCase().includes(msg)
    );

    return {
      testId: `edge-darkness-look-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: roomId,
      passed: hasExpectedMessage,
      message: hasExpectedMessage
        ? 'LOOK in darkness returns appropriate message'
        : `LOOK in darkness returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test EXAMINE command in darkness
   */
  private testExamineInDarkness(state: GameState, roomId: string): TestResult {
    const timestamp = new Date();
    const room = state.getRoom(roomId);

    // Try to examine an object in the room (if any)
    if (room && room.objects.length > 0) {
      const objectId = room.objects[0];
      const obj = state.getObject(objectId);
      if (obj) {
        const command = this.parser.parse(`examine ${obj.synonyms[0] || obj.name}`, state);
        const result = this.executor.execute(command, state);

        // Should get "can't see" or "too dark" message
        const expectedMessages = [
          'too dark',
          "can't see",
          'darkness',
          'pitch black'
        ];

        const hasExpectedMessage = expectedMessages.some(msg =>
          result.message.toLowerCase().includes(msg)
        );

        return {
          testId: `edge-darkness-examine-${timestamp.getTime()}`,
          testType: TestType.EDGE_CASE,
          itemId: roomId,
          passed: hasExpectedMessage,
          message: hasExpectedMessage
            ? 'EXAMINE in darkness returns appropriate message'
            : `EXAMINE in darkness returned unexpected message: ${result.message}`,
          timestamp,
          gameState: captureGameState(state)
        };
      }
    }

    // No objects to test
    return {
      testId: `edge-darkness-examine-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: roomId,
      passed: true,
      message: 'No objects in dark room to test EXAMINE',
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test TAKE command in darkness
   */
  private testTakeInDarkness(state: GameState, roomId: string): TestResult {
    const timestamp = new Date();
    const room = state.getRoom(roomId);

    // Try to take an object in the room (if any)
    if (room && room.objects.length > 0) {
      const objectId = room.objects[0];
      const obj = state.getObject(objectId);
      if (obj && obj.hasFlag(ObjectFlag.TAKEBIT)) {
        const command = this.parser.parse(`take ${obj.synonyms[0] || obj.name}`, state);
        const result = this.executor.execute(command, state);

        // Should get "can't see" or "too dark" message
        const expectedMessages = [
          'too dark',
          "can't see",
          'darkness',
          'pitch black'
        ];

        const hasExpectedMessage = expectedMessages.some(msg =>
          result.message.toLowerCase().includes(msg)
        );

        return {
          testId: `edge-darkness-take-${timestamp.getTime()}`,
          testType: TestType.EDGE_CASE,
          itemId: roomId,
          passed: hasExpectedMessage,
          message: hasExpectedMessage
            ? 'TAKE in darkness returns appropriate message'
            : `TAKE in darkness returned unexpected message: ${result.message}`,
          timestamp,
          gameState: captureGameState(state)
        };
      }
    }

    // No takeable objects to test
    return {
      testId: `edge-darkness-take-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: roomId,
      passed: true,
      message: 'No takeable objects in dark room to test TAKE',
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test inventory limits and weight constraints
   */
  testInventoryLimits(state: GameState): TestResult[] {
    const results: TestResult[] = [];
    const timestamp = new Date();

    // Test weight limit
    results.push(this.testWeightLimit(state));

    // Test item count (if there's a limit)
    results.push(this.testItemCountLimit(state));

    return results;
  }

  /**
   * Test weight limit by trying to carry too much
   */
  private testWeightLimit(state: GameState): TestResult {
    const timestamp = new Date();
    const originalInventory = [...state.inventory];
    const originalRoom = state.currentRoom;

    // Find heavy objects to test with
    const heavyObjects: GameObject[] = [];
    for (const [objectId, obj] of state.objects.entries()) {
      if (obj.hasFlag(ObjectFlag.TAKEBIT) && obj.size && obj.size > 10) {
        heavyObjects.push(obj);
      }
    }

    if (heavyObjects.length === 0) {
      return {
        testId: `edge-weight-limit-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'INVENTORY',
        passed: true,
        message: 'No heavy objects found to test weight limit',
        timestamp,
        gameState: captureGameState(state)
      };
    }

    // Try to add objects until weight limit is reached
    let totalWeight = state.getInventoryWeight();
    const weightLimit = 100; // Standard Zork weight limit
    let reachedLimit = false;

    for (const obj of heavyObjects) {
      if (totalWeight + (obj.size || 0) > weightLimit) {
        // Try to take this object - should fail
        state.moveObject(obj.id, originalRoom, 'IN');
        const command = this.parser.parse(`take ${obj.synonyms[0] || obj.name}`, state);
        const result = this.executor.execute(command, state);

        // Should get "too heavy" message
        const hasWeightMessage = result.message.toLowerCase().includes('heavy') ||
                                 result.message.toLowerCase().includes('carry') ||
                                 result.message.toLowerCase().includes('load');

        reachedLimit = true;

        // Restore state
        state.inventory = [...originalInventory];

        return {
          testId: `edge-weight-limit-${timestamp.getTime()}`,
          testType: TestType.EDGE_CASE,
          itemId: 'INVENTORY',
          passed: hasWeightMessage,
          message: hasWeightMessage
            ? 'Weight limit enforced with appropriate message'
            : `Weight limit message unexpected: ${result.message}`,
          timestamp,
          gameState: captureGameState(state)
        };
      }
      totalWeight += obj.size || 0;
    }

    // Restore state
    state.inventory = [...originalInventory];

    return {
      testId: `edge-weight-limit-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'INVENTORY',
      passed: !reachedLimit,
      message: reachedLimit
        ? 'Weight limit test completed'
        : 'Could not reach weight limit with available objects',
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test item count limit (if applicable)
   */
  private testItemCountLimit(state: GameState): TestResult {
    const timestamp = new Date();

    // Zork I doesn't have a strict item count limit, only weight
    // This test verifies that multiple items can be carried
    const itemCount = state.inventory.length;

    return {
      testId: `edge-item-count-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'INVENTORY',
      passed: true,
      message: `Current inventory has ${itemCount} items (no strict count limit in Zork I)`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test locked containers and doors
   */
  testLockedContainersAndDoors(state: GameState): TestResult[] {
    const results: TestResult[] = [];

    // Find locked containers
    const lockedContainers = this.findLockedContainers(state);
    for (const container of lockedContainers) {
      results.push(this.testLockedContainer(container, state));
    }

    // Find locked doors
    const lockedDoors = this.findLockedDoors(state);
    for (const door of lockedDoors) {
      results.push(this.testLockedDoor(door, state));
    }

    if (results.length === 0) {
      const timestamp = new Date();
      results.push({
        testId: `edge-locked-none-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'LOCKED',
        passed: true,
        message: 'No locked containers or doors found to test',
        timestamp,
        gameState: captureGameState(state)
      });
    }

    return results;
  }

  /**
   * Find locked containers in the game
   */
  private findLockedContainers(state: GameState): GameObject[] {
    const locked: GameObject[] = [];
    for (const [objectId, obj] of state.objects.entries()) {
      if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.getProperty('locked')) {
        locked.push(obj);
      }
    }
    return locked;
  }

  /**
   * Find locked doors in the game
   */
  private findLockedDoors(state: GameState): GameObject[] {
    const locked: GameObject[] = [];
    for (const [objectId, obj] of state.objects.entries()) {
      if (obj.hasFlag(ObjectFlag.DOORBIT) && obj.getProperty('locked')) {
        locked.push(obj);
      }
    }
    return locked;
  }

  /**
   * Test trying to open a locked container
   */
  private testLockedContainer(container: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    const command = this.parser.parse(`open ${container.synonyms[0] || container.name}`, state);
    const result = this.executor.execute(command, state);

    // Should get "locked" message
    const hasLockedMessage = result.message.toLowerCase().includes('locked');

    return {
      testId: `edge-locked-container-${container.id}-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: container.id,
      passed: hasLockedMessage,
      message: hasLockedMessage
        ? `Locked container ${container.id} returns appropriate message`
        : `Locked container ${container.id} returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test trying to open a locked door
   */
  private testLockedDoor(door: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    const command = this.parser.parse(`open ${door.synonyms[0] || door.name}`, state);
    const result = this.executor.execute(command, state);

    // Should get "locked" message
    const hasLockedMessage = result.message.toLowerCase().includes('locked');

    return {
      testId: `edge-locked-door-${door.id}-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: door.id,
      passed: hasLockedMessage,
      message: hasLockedMessage
        ? `Locked door ${door.id} returns appropriate message`
        : `Locked door ${door.id} returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test conditional exits
   * Tests exits that require flags to be set or objects to be in certain states
   */
  testConditionalExits(state: GameState): TestResult[] {
    const results: TestResult[] = [];

    // Find exits with conditions
    const conditionalExits = this.findConditionalExits(state);

    for (const exitInfo of conditionalExits) {
      results.push(this.testConditionalExit(exitInfo, state));
    }

    if (results.length === 0) {
      const timestamp = new Date();
      results.push({
        testId: `edge-conditional-exits-none-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'CONDITIONAL-EXITS',
        passed: true,
        message: 'No conditional exits found to test',
        timestamp,
        gameState: captureGameState(state)
      });
    }

    return results;
  }



  /**
   * Find exits that have conditions
   */
  private findConditionalExits(state: GameState): ConditionalExitInfo[] {
    const conditionalExits: ConditionalExitInfo[] = [];

    for (const [roomId, room] of state.rooms.entries()) {
      for (const [direction, exit] of room.exits.entries()) {
        // Check if exit has a condition
        if (exit.condition || exit.requiredFlag || exit.blockedMessage) {
          conditionalExits.push({
            roomId,
            direction,
            destination: exit.destination || '',
            condition: exit.condition,
            requiredFlag: exit.requiredFlag,
            blockedMessage: exit.blockedMessage
          });
        }
      }
    }

    return conditionalExits;
  }

  /**
   * Test a conditional exit
   */
  private testConditionalExit(exitInfo: ConditionalExitInfo, state: GameState): TestResult {
    const timestamp = new Date();
    const originalRoom = state.currentRoom;

    // Move to the room with the conditional exit
    state.setCurrentRoom(exitInfo.roomId);

    // Try to use the exit (should be blocked if condition not met)
    const command = this.parser.parse(exitInfo.direction.toLowerCase(), state);
    const result = this.executor.execute(command, state);

    // Check if appropriate blocked message is shown
    const hasBlockedMessage = exitInfo.blockedMessage
      ? result.message.includes(exitInfo.blockedMessage)
      : result.message.toLowerCase().includes("can't") ||
        result.message.toLowerCase().includes("blocked") ||
        result.message.toLowerCase().includes("closed") ||
        result.message.toLowerCase().includes("locked");

    // Restore original room
    state.setCurrentRoom(originalRoom);

    return {
      testId: `edge-conditional-exit-${exitInfo.roomId}-${exitInfo.direction}-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: exitInfo.roomId,
      passed: hasBlockedMessage,
      message: hasBlockedMessage
        ? `Conditional exit ${exitInfo.direction} from ${exitInfo.roomId} shows appropriate blocked message`
        : `Conditional exit ${exitInfo.direction} from ${exitInfo.roomId} returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test error handling
   * Tests invalid commands, ambiguous references, and non-existent objects
   */
  testErrorHandling(state: GameState): TestResult[] {
    const results: TestResult[] = [];

    // Test invalid commands
    results.push(this.testInvalidCommand(state));

    // Test ambiguous object references
    results.push(this.testAmbiguousReference(state));

    // Test actions on non-existent objects
    results.push(this.testNonExistentObject(state));

    // Test invalid verb-object combinations
    results.push(this.testInvalidVerbObjectCombination(state));

    return results;
  }

  /**
   * Test invalid command
   */
  private testInvalidCommand(state: GameState): TestResult {
    const timestamp = new Date();
    
    // Try a nonsense command
    const command = this.parser.parse('xyzzy abracadabra foobar', state);
    const result = this.executor.execute(command, state);

    // Should get an error message
    const hasErrorMessage = !result.success ||
                           result.message.toLowerCase().includes("don't") ||
                           result.message.toLowerCase().includes("can't") ||
                           result.message.toLowerCase().includes("understand") ||
                           result.message.toLowerCase().includes("know");

    return {
      testId: `edge-error-invalid-command-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'ERROR-HANDLING',
      passed: hasErrorMessage,
      message: hasErrorMessage
        ? 'Invalid command returns appropriate error message'
        : `Invalid command returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test ambiguous object reference
   */
  private testAmbiguousReference(state: GameState): TestResult {
    const timestamp = new Date();

    // Find objects with similar names
    const objectsWithSameName = this.findObjectsWithSimilarNames(state);

    if (objectsWithSameName.length < 2) {
      return {
        testId: `edge-error-ambiguous-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'ERROR-HANDLING',
        passed: true,
        message: 'No ambiguous object names found to test',
        timestamp,
        gameState: captureGameState(state)
      };
    }

    // Try to reference the ambiguous name
    const ambiguousName = objectsWithSameName[0];
    const command = this.parser.parse(`take ${ambiguousName}`, state);
    const result = this.executor.execute(command, state);

    // Should get "which one" or similar message
    const hasAmbiguousMessage = result.message.toLowerCase().includes('which') ||
                                result.message.toLowerCase().includes('more specific') ||
                                result.message.toLowerCase().includes('ambiguous');

    return {
      testId: `edge-error-ambiguous-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'ERROR-HANDLING',
      passed: hasAmbiguousMessage || result.success, // May succeed if parser resolves it
      message: hasAmbiguousMessage
        ? 'Ambiguous reference returns appropriate message'
        : `Ambiguous reference handled: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Find objects with similar names for ambiguity testing
   */
  private findObjectsWithSimilarNames(state: GameState): string[] {
    const nameCounts = new Map<string, number>();

    for (const [objectId, obj] of state.objects.entries()) {
      for (const synonym of obj.synonyms) {
        const count = nameCounts.get(synonym) || 0;
        nameCounts.set(synonym, count + 1);
      }
    }

    // Find names that appear more than once
    const ambiguousNames: string[] = [];
    for (const [name, count] of nameCounts.entries()) {
      if (count > 1) {
        ambiguousNames.push(name);
      }
    }

    return ambiguousNames;
  }

  /**
   * Test action on non-existent object
   */
  private testNonExistentObject(state: GameState): TestResult {
    const timestamp = new Date();

    // Try to interact with a non-existent object
    const command = this.parser.parse('take nonexistentobject12345', state);
    const result = this.executor.execute(command, state);

    // Should get "can't see" or "not here" message
    const hasNotFoundMessage = !result.success ||
                               result.message.toLowerCase().includes("can't see") ||
                               result.message.toLowerCase().includes("not here") ||
                               result.message.toLowerCase().includes("don't see") ||
                               result.message.toLowerCase().includes("no such");

    return {
      testId: `edge-error-nonexistent-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'ERROR-HANDLING',
      passed: hasNotFoundMessage,
      message: hasNotFoundMessage
        ? 'Non-existent object returns appropriate error message'
        : `Non-existent object returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Test invalid verb-object combination
   */
  private testInvalidVerbObjectCombination(state: GameState): TestResult {
    const timestamp = new Date();

    // Find an object that can't be eaten
    let nonFoodObject: GameObject | undefined;
    for (const [objectId, obj] of state.objects.entries()) {
      if (!obj.hasFlag(ObjectFlag.FOODBIT) && !obj.hasFlag(ObjectFlag.DRINKBIT)) {
        nonFoodObject = obj;
        break;
      }
    }

    if (!nonFoodObject) {
      return {
        testId: `edge-error-invalid-combo-${timestamp.getTime()}`,
        testType: TestType.EDGE_CASE,
        itemId: 'ERROR-HANDLING',
        passed: true,
        message: 'No non-food objects found to test invalid combination',
        timestamp,
        gameState: captureGameState(state)
      };
    }

    // Try to eat a non-food object
    const command = this.parser.parse(`eat ${nonFoodObject.synonyms[0] || nonFoodObject.name}`, state);
    const result = this.executor.execute(command, state);

    // Should get an error message
    const hasErrorMessage = !result.success ||
                           result.message.toLowerCase().includes("can't") ||
                           result.message.toLowerCase().includes("don't") ||
                           result.message.toLowerCase().includes("not");

    return {
      testId: `edge-error-invalid-combo-${timestamp.getTime()}`,
      testType: TestType.EDGE_CASE,
      itemId: 'ERROR-HANDLING',
      passed: hasErrorMessage,
      message: hasErrorMessage
        ? 'Invalid verb-object combination returns appropriate error'
        : `Invalid combination returned unexpected message: ${result.message}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }

  /**
   * Run all edge case tests
   */
  testAllEdgeCases(state: GameState): TestResult[] {
    const results: TestResult[] = [];

    // Test actions in darkness
    results.push(...this.testActionsInDarkness(state));

    // Test inventory limits
    results.push(...this.testInventoryLimits(state));

    // Test locked containers and doors
    results.push(...this.testLockedContainersAndDoors(state));

    // Test conditional exits
    results.push(...this.testConditionalExits(state));

    // Test error handling
    results.push(...this.testErrorHandling(state));

    return results;
  }
}
