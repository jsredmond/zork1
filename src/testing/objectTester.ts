/**
 * Object testing functionality
 * Tests object interactions, flags, and accessibility
 */

import { GameState } from '../game/state';
import { GameObject } from '../game/objects';
import { ObjectFlag } from '../game/data/flags';
import { TestResult, TestType, GameStateSnapshot } from './types';
import { captureGameState } from './bugTracker';

/**
 * ObjectTester class for testing object functionality
 */
export class ObjectTester {
  /**
   * Test basic interactions with an object (examine, take, drop)
   */
  testBasicInteractions(objectId: string, state: GameState): TestResult[] {
    const results: TestResult[] = [];
    const obj = state.getObject(objectId);
    const timestamp = new Date();
    
    if (!obj) {
      results.push({
        testId: `object-basic-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_EXAMINE,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      });
      return results;
    }
    
    // Test EXAMINE - all objects should have a description
    results.push(this.testExamine(objectId, obj, state));
    
    // Test TAKE - if object is takeable
    if (obj.hasFlag(ObjectFlag.TAKEBIT)) {
      results.push(this.testTake(objectId, obj, state));
    }
    
    // Test DROP - if object can be taken, it can be dropped
    if (obj.hasFlag(ObjectFlag.TAKEBIT)) {
      results.push(this.testDrop(objectId, obj, state));
    }
    
    return results;
  }
  
  /**
   * Test examining an object
   */
  private testExamine(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Check that object has a description
    if (!obj.description || obj.description.trim() === '') {
      return {
        testId: `object-examine-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_EXAMINE,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} has no description`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-examine-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_EXAMINE,
      itemId: objectId,
      passed: true,
      message: `Object ${objectId} has valid description`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test taking an object
   */
  private testTake(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Check that takeable objects have a name
    if (!obj.name || obj.name.trim() === '') {
      return {
        testId: `object-take-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_TAKE,
        itemId: objectId,
        passed: false,
        message: `Takeable object ${objectId} has no name`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check that takeable objects have at least one synonym
    if (!obj.synonyms || obj.synonyms.length === 0) {
      return {
        testId: `object-take-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_TAKE,
        itemId: objectId,
        passed: false,
        message: `Takeable object ${objectId} has no synonyms`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-take-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_TAKE,
      itemId: objectId,
      passed: true,
      message: `Object ${objectId} is properly configured for taking`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test dropping an object
   */
  private testDrop(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // For drop to work, object must be takeable
    if (!obj.hasFlag(ObjectFlag.TAKEBIT)) {
      return {
        testId: `object-drop-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} is not takeable but drop was tested`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-drop-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Object ${objectId} can be dropped (is takeable)`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test object-specific actions based on flags
   */
  testObjectSpecificActions(objectId: string, state: GameState): TestResult[] {
    const results: TestResult[] = [];
    const obj = state.getObject(objectId);
    const timestamp = new Date();
    
    if (!obj) {
      results.push({
        testId: `object-actions-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      });
      return results;
    }
    
    // Test container actions (open/close)
    if (obj.hasFlag(ObjectFlag.CONTBIT)) {
      results.push(this.testContainerActions(objectId, obj, state));
    }
    
    // Test light actions (turn on/off)
    if (obj.hasFlag(ObjectFlag.LIGHTBIT)) {
      results.push(this.testLightActions(objectId, obj, state));
    }
    
    // Test weapon actions
    if (obj.hasFlag(ObjectFlag.WEAPONBIT)) {
      results.push(this.testWeaponActions(objectId, obj, state));
    }
    
    // Test readable items
    if (obj.hasFlag(ObjectFlag.READBIT)) {
      results.push(this.testReadableActions(objectId, obj, state));
    }
    
    // Test food items
    if (obj.hasFlag(ObjectFlag.FOODBIT)) {
      results.push(this.testFoodActions(objectId, obj, state));
    }
    
    // Test drinkable items
    if (obj.hasFlag(ObjectFlag.DRINKBIT)) {
      results.push(this.testDrinkActions(objectId, obj, state));
    }
    
    return results;
  }
  
  /**
   * Test container-specific actions
   */
  private testContainerActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Containers should have a capacity
    if (obj.capacity === undefined || obj.capacity === null) {
      return {
        testId: `object-container-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Container ${objectId} has no capacity defined`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-container-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Container ${objectId} has capacity ${obj.capacity}`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test light-specific actions
   */
  private testLightActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Light objects should have a name
    if (!obj.name || obj.name.trim() === '') {
      return {
        testId: `object-light-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Light object ${objectId} has no name`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-light-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Light object ${objectId} is properly configured`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test weapon-specific actions
   */
  private testWeaponActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Weapons should be takeable
    if (!obj.hasFlag(ObjectFlag.TAKEBIT)) {
      return {
        testId: `object-weapon-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Weapon ${objectId} is not takeable`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-weapon-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Weapon ${objectId} is properly configured`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test readable item actions
   */
  private testReadableActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Readable items should have text property
    const text = obj.getProperty('text');
    if (!text || (typeof text === 'string' && text.trim() === '')) {
      return {
        testId: `object-readable-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Readable object ${objectId} has no text content`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-readable-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Readable object ${objectId} has text content`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test food item actions
   */
  private testFoodActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Food items should be takeable
    if (!obj.hasFlag(ObjectFlag.TAKEBIT)) {
      return {
        testId: `object-food-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Food item ${objectId} is not takeable`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-food-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Food item ${objectId} is properly configured`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test drinkable item actions
   */
  private testDrinkActions(objectId: string, obj: GameObject, state: GameState): TestResult {
    const timestamp = new Date();
    
    // Drinkable items should have a name
    if (!obj.name || obj.name.trim() === '') {
      return {
        testId: `object-drink-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Drinkable item ${objectId} has no name`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-drink-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Drinkable item ${objectId} is properly configured`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Test object flags verification
   */
  testObjectFlags(objectId: string, state: GameState): TestResult {
    const obj = state.getObject(objectId);
    const timestamp = new Date();
    
    if (!obj) {
      return {
        testId: `object-flags-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} not found in game state`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    // Check for conflicting flags
    const conflicts: string[] = [];
    
    // CONTBIT and SURFACEBIT shouldn't both be set (object can't be both)
    if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.SURFACEBIT)) {
      conflicts.push('CONTBIT and SURFACEBIT both set');
    }
    
    // TAKEBIT and NDESCBIT conflict (takeable objects should be described)
    if (obj.hasFlag(ObjectFlag.TAKEBIT) && obj.hasFlag(ObjectFlag.NDESCBIT)) {
      conflicts.push('TAKEBIT and NDESCBIT both set');
    }
    
    // LIGHTBIT without ONBIT or FLAMEBIT is suspicious
    if (obj.hasFlag(ObjectFlag.LIGHTBIT) && 
        !obj.hasFlag(ObjectFlag.ONBIT) && 
        !obj.hasFlag(ObjectFlag.FLAMEBIT)) {
      // This is actually okay - light can be off initially
    }
    
    if (conflicts.length > 0) {
      return {
        testId: `object-flags-${objectId}-${timestamp.getTime()}`,
        testType: TestType.OBJECT_ACTION,
        itemId: objectId,
        passed: false,
        message: `Object ${objectId} has conflicting flags: ${conflicts.join(', ')}`,
        timestamp,
        gameState: captureGameState(state)
      };
    }
    
    return {
      testId: `object-flags-${objectId}-${timestamp.getTime()}`,
      testType: TestType.OBJECT_ACTION,
      itemId: objectId,
      passed: true,
      message: `Object ${objectId} has valid flag configuration`,
      timestamp,
      gameState: captureGameState(state)
    };
  }
  
  /**
   * Run all tests for an object
   */
  testObject(objectId: string, state: GameState): TestResult[] {
    const results: TestResult[] = [];
    
    // Test basic interactions
    results.push(...this.testBasicInteractions(objectId, state));
    
    // Test object-specific actions
    results.push(...this.testObjectSpecificActions(objectId, state));
    
    // Test object flags
    results.push(this.testObjectFlags(objectId, state));
    
    return results;
  }
  
  /**
   * Run tests for multiple objects
   */
  testObjects(objectIds: string[], state: GameState): TestResult[] {
    const results: TestResult[] = [];
    
    for (const objectId of objectIds) {
      results.push(...this.testObject(objectId, state));
    }
    
    return results;
  }
}

/**
 * Object Accessibility Analysis
 * Determines which objects can be reached from the starting state
 */

/**
 * Build a graph of object accessibility
 * Returns a map of object IDs to their accessibility status
 */
export function analyzeObjectAccessibility(
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): Map<string, ObjectAccessibility> {
  const accessibility = new Map<string, ObjectAccessibility>();
  
  // Get all reachable rooms first
  const reachableRooms = findReachableRoomsForObjects(state, startRoom);
  
  // Analyze each object
  for (const [objectId, obj] of state.objects.entries()) {
    const access = determineObjectAccessibility(objectId, obj, state, reachableRooms);
    accessibility.set(objectId, access);
  }
  
  return accessibility;
}

/**
 * Object accessibility information
 */
export interface ObjectAccessibility {
  objectId: string;
  isAccessible: boolean;
  reason: string;
  location: string | null;
  requiresActions: string[];
}

/**
 * Determine if a specific object is accessible from the starting state
 */
function determineObjectAccessibility(
  objectId: string,
  obj: GameObject,
  state: GameState,
  reachableRooms: Set<string>
): ObjectAccessibility {
  const location = obj.location;
  
  // Object with no location is not accessible
  if (!location) {
    return {
      objectId,
      isAccessible: false,
      reason: 'Object has no location',
      location: null,
      requiresActions: []
    };
  }
  
  // Check if object is in a reachable room
  if (reachableRooms.has(location)) {
    return {
      objectId,
      isAccessible: true,
      reason: 'Object is in a reachable room',
      location,
      requiresActions: []
    };
  }
  
  // Check if object is inside another object
  const parentObj = state.getObject(location);
  if (parentObj) {
    // Recursively check if parent is accessible
    const parentAccess = determineObjectAccessibility(
      location,
      parentObj,
      state,
      reachableRooms
    );
    
    if (parentAccess.isAccessible) {
      // Parent is accessible, check if we can access this object
      if (parentObj.hasFlag(ObjectFlag.CONTBIT)) {
        // Object is in a container
        if (parentObj.hasFlag(ObjectFlag.OPENBIT) || !parentObj.hasFlag(ObjectFlag.CONTBIT)) {
          return {
            objectId,
            isAccessible: true,
            reason: 'Object is in an accessible open container',
            location,
            requiresActions: [...parentAccess.requiresActions, `Open ${parentObj.id}`]
          };
        } else {
          return {
            objectId,
            isAccessible: true,
            reason: 'Object is in an accessible container (may need to open)',
            location,
            requiresActions: [...parentAccess.requiresActions, `Open ${parentObj.id}`]
          };
        }
      } else {
        // Object is on a surface or held by parent
        return {
          objectId,
          isAccessible: true,
          reason: 'Object is accessible via parent object',
          location,
          requiresActions: parentAccess.requiresActions
        };
      }
    } else {
      return {
        objectId,
        isAccessible: false,
        reason: `Object is inside inaccessible object ${location}`,
        location,
        requiresActions: []
      };
    }
  }
  
  // Object is in an unreachable room
  return {
    objectId,
    isAccessible: false,
    reason: `Object is in unreachable room ${location}`,
    location,
    requiresActions: []
  };
}

/**
 * Find all reachable rooms from a starting room
 * Similar to room reachability but for object analysis
 */
function findReachableRoomsForObjects(
  state: GameState,
  startRoom: string
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [startRoom];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (reachable.has(current)) {
      continue;
    }
    
    reachable.add(current);
    
    const room = state.getRoom(current);
    if (!room) {
      continue;
    }
    
    // Add all connected rooms
    for (const [direction, exit] of room.exits.entries()) {
      if (exit.destination && exit.destination !== '' && !reachable.has(exit.destination)) {
        queue.push(exit.destination);
      }
    }
  }
  
  return reachable;
}

/**
 * Identify objects that cannot be accessed from the starting game state
 */
export function findInaccessibleObjects(
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): string[] {
  const accessibility = analyzeObjectAccessibility(state, startRoom);
  const inaccessible: string[] = [];
  
  for (const [objectId, access] of accessibility.entries()) {
    if (!access.isAccessible) {
      inaccessible.push(objectId);
    }
  }
  
  return inaccessible;
}

/**
 * Check if a specific object is accessible from the starting location
 */
export function isObjectAccessible(
  objectId: string,
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): boolean {
  const accessibility = analyzeObjectAccessibility(state, startRoom);
  const access = accessibility.get(objectId);
  return access ? access.isAccessible : false;
}

/**
 * Get accessibility information for a specific object
 */
export function getObjectAccessibility(
  objectId: string,
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): ObjectAccessibility | undefined {
  const accessibility = analyzeObjectAccessibility(state, startRoom);
  return accessibility.get(objectId);
}

/**
 * Object Test Execution
 * Execute tests for objects and generate bug reports
 */

import { BugReport } from './types';
import { createBugReportFromTest } from './bugTracker';

/**
 * Result of object test execution
 */
export interface ObjectTestExecutionResult {
  results: TestResult[];
  bugsFound: BugReport[];
  testedObjects: string[];
}

/**
 * Execute tests for all objects in the game
 */
export function executeObjectTests(state: GameState): ObjectTestExecutionResult {
  const tester = new ObjectTester();
  const results: TestResult[] = [];
  const bugsFound: BugReport[] = [];
  const testedObjects: string[] = [];
  
  // Get all object IDs from game state
  const objectIds = Array.from(state.objects.keys());
  
  // Execute tests for each object
  for (const objectId of objectIds) {
    const objectResults = tester.testObject(objectId, state);
    results.push(...objectResults);
    testedObjects.push(objectId);
    
    // Generate bug reports for failed tests
    for (const result of objectResults) {
      if (!result.passed) {
        const bug = createBugReportFromTest(result, state);
        bugsFound.push(bug);
      }
    }
  }
  
  return {
    results,
    bugsFound,
    testedObjects
  };
}

/**
 * Execute tests for a specific subset of objects
 */
export function executeObjectTestsForSubset(
  objectIds: string[],
  state: GameState
): ObjectTestExecutionResult {
  const tester = new ObjectTester();
  const results: TestResult[] = [];
  const bugsFound: BugReport[] = [];
  const testedObjects: string[] = [];
  
  // Execute tests for each object
  for (const objectId of objectIds) {
    // Skip if object doesn't exist
    if (!state.objects.has(objectId)) {
      continue;
    }
    
    const objectResults = tester.testObject(objectId, state);
    results.push(...objectResults);
    testedObjects.push(objectId);
    
    // Generate bug reports for failed tests
    for (const result of objectResults) {
      if (!result.passed) {
        const bug = createBugReportFromTest(result, state);
        bugsFound.push(bug);
      }
    }
  }
  
  return {
    results,
    bugsFound,
    testedObjects
  };
}

/**
 * Execute tests only for accessible objects
 */
export function executeAccessibleObjectTests(
  state: GameState,
  startRoom: string = 'WEST-OF-HOUSE'
): ObjectTestExecutionResult {
  const accessibility = analyzeObjectAccessibility(state, startRoom);
  const accessibleObjectIds: string[] = [];
  
  // Filter for accessible objects
  for (const [objectId, access] of accessibility.entries()) {
    if (access.isAccessible) {
      accessibleObjectIds.push(objectId);
    }
  }
  
  return executeObjectTestsForSubset(accessibleObjectIds, state);
}

/**
 * Execute tests for objects with specific flags
 */
export function executeObjectTestsByFlag(
  flag: ObjectFlag,
  state: GameState
): ObjectTestExecutionResult {
  const objectIds: string[] = [];
  
  // Filter objects by flag
  for (const [objectId, obj] of state.objects.entries()) {
    if (obj.hasFlag(flag)) {
      objectIds.push(objectId);
    }
  }
  
  return executeObjectTestsForSubset(objectIds, state);
}

/**
 * Execute tests for takeable objects only
 */
export function executeTakeableObjectTests(state: GameState): ObjectTestExecutionResult {
  return executeObjectTestsByFlag(ObjectFlag.TAKEBIT, state);
}

/**
 * Execute tests for container objects only
 */
export function executeContainerObjectTests(state: GameState): ObjectTestExecutionResult {
  return executeObjectTestsByFlag(ObjectFlag.CONTBIT, state);
}

/**
 * Execute tests for light objects only
 */
export function executeLightObjectTests(state: GameState): ObjectTestExecutionResult {
  return executeObjectTestsByFlag(ObjectFlag.LIGHTBIT, state);
}
