/**
 * Puzzle Testing System
 * Tests puzzle solutions and state changes
 */

import { GameState } from '../game/state.js';
import { TestResult, TestType, BugCategory, BugSeverity, BugReport, BugStatus } from './types.js';
import { captureGameState } from './bugTracker.js';
import { generateBugId } from './persistence.js';
import { GameObjectImpl } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';
import {
  DamPuzzle,
  MirrorPuzzle,
  RainbowPuzzle,
  RopeBasketPuzzle,
  TrapDoorPuzzle,
  GratingPuzzle,
  BoatPuzzle,
  CoffinPuzzle,
  MagicWordPuzzle
} from '../game/puzzles.js';

/**
 * Puzzle test case definition
 */
export interface PuzzleTestCase {
  puzzleId: string;
  name: string;
  description: string;
  prerequisites: PuzzlePrerequisite[];
  solutionSteps: PuzzleSolutionStep[];
  expectedStateChanges: ExpectedStateChange[];
}

/**
 * Prerequisite for a puzzle
 */
export interface PuzzlePrerequisite {
  type: 'OBJECT_IN_INVENTORY' | 'OBJECT_IN_ROOM' | 'FLAG_SET' | 'GLOBAL_VARIABLE' | 'ROOM_ACCESSIBLE';
  objectId?: string;
  roomId?: string;
  flagName?: string;
  variableName?: string;
  expectedValue?: any;
}

/**
 * Solution step for a puzzle
 */
export interface PuzzleSolutionStep {
  action: string;
  objectId?: string;
  secondObjectId?: string;
  direction?: string;
  word?: string;
  expectedSuccess: boolean;
  expectedMessageContains?: string;
}

/**
 * Expected state change after puzzle completion
 */
export interface ExpectedStateChange {
  type: 'FLAG' | 'GLOBAL_VARIABLE' | 'OBJECT_LOCATION' | 'OBJECT_FLAG' | 'ROOM_EXIT';
  flagName?: string;
  variableName?: string;
  objectId?: string;
  objectFlag?: ObjectFlag;
  roomId?: string;
  exitDirection?: string;
  expectedValue: any;
}

/**
 * Puzzle Tester
 * Tests puzzle solutions and verifies state changes
 */
export class PuzzleTester {
  constructor() {
  }

  /**
   * Test a puzzle solution
   */
  testPuzzle(state: GameState, testCase: PuzzleTestCase): TestResult {
    const testId = `PUZZLE_${testCase.puzzleId}_${Date.now()}`;

    // Check prerequisites
    const prerequisiteResult = this.checkPrerequisites(state, testCase);
    if (!prerequisiteResult.passed) {
      return {
        testId,
        testType: TestType.PUZZLE_SOLUTION,
        itemId: testCase.puzzleId,
        passed: false,
        message: `Prerequisites not met: ${prerequisiteResult.message}`,
        timestamp: new Date(),
        gameState: captureGameState(state)
      };
    }

    // Execute solution steps
    const executionResult = this.executeSolutionSteps(state, testCase);
    if (!executionResult.passed) {
      const bug: BugReport = {
        id: generateBugId(),
        title: `Puzzle ${testCase.name} solution failed`,
        description: executionResult.message,
        category: BugCategory.INCORRECT_BEHAVIOR,
        severity: BugSeverity.MAJOR,
        status: BugStatus.OPEN,
        reproductionSteps: this.generateReproductionSteps(testCase),
        gameState: captureGameState(state),
        foundDate: new Date()
      };

      return {
        testId,
        testType: TestType.PUZZLE_SOLUTION,
        itemId: testCase.puzzleId,
        passed: false,
        message: executionResult.message,
        timestamp: new Date(),
        gameState: captureGameState(state),
        bug
      };
    }

    // Verify state changes
    const verificationResult = this.verifyStateChanges(state, testCase);
    if (!verificationResult.passed) {
      const bug: BugReport = {
        id: generateBugId(),
        title: `Puzzle ${testCase.name} state changes incorrect`,
        description: verificationResult.message,
        category: BugCategory.INCORRECT_BEHAVIOR,
        severity: BugSeverity.MAJOR,
        status: BugStatus.OPEN,
        reproductionSteps: this.generateReproductionSteps(testCase),
        gameState: captureGameState(state),
        foundDate: new Date()
      };

      return {
        testId,
        testType: TestType.PUZZLE_SOLUTION,
        itemId: testCase.puzzleId,
        passed: false,
        message: verificationResult.message,
        timestamp: new Date(),
        gameState: captureGameState(state),
        bug
      };
    }

    return {
      testId,
      testType: TestType.PUZZLE_SOLUTION,
      itemId: testCase.puzzleId,
      passed: true,
      message: `Puzzle ${testCase.name} solved successfully`,
      timestamp: new Date(),
      gameState: captureGameState(state)
    };
  }

  /**
   * Check if all prerequisites are met
   */
  private checkPrerequisites(state: GameState, testCase: PuzzleTestCase): { passed: boolean; message: string } {
    for (const prereq of testCase.prerequisites) {
      switch (prereq.type) {
        case 'OBJECT_IN_INVENTORY':
          if (!prereq.objectId || !state.isInInventory(prereq.objectId)) {
            return {
              passed: false,
              message: `Object ${prereq.objectId} not in inventory`
            };
          }
          break;

        case 'OBJECT_IN_ROOM':
          if (!prereq.objectId || !prereq.roomId) {
            return {
              passed: false,
              message: 'Invalid prerequisite: missing objectId or roomId'
            };
          }
          const obj = state.getObject(prereq.objectId);
          if (!obj || obj.location !== prereq.roomId) {
            return {
              passed: false,
              message: `Object ${prereq.objectId} not in room ${prereq.roomId}`
            };
          }
          break;

        case 'FLAG_SET':
          if (!prereq.flagName) {
            return {
              passed: false,
              message: 'Invalid prerequisite: missing flagName'
            };
          }
          const flagValue = state.getFlag(prereq.flagName as any);
          if (flagValue !== prereq.expectedValue) {
            return {
              passed: false,
              message: `Flag ${prereq.flagName} is ${flagValue}, expected ${prereq.expectedValue}`
            };
          }
          break;

        case 'GLOBAL_VARIABLE':
          if (!prereq.variableName) {
            return {
              passed: false,
              message: 'Invalid prerequisite: missing variableName'
            };
          }
          const varValue = state.getGlobalVariable(prereq.variableName);
          if (varValue !== prereq.expectedValue) {
            return {
              passed: false,
              message: `Variable ${prereq.variableName} is ${varValue}, expected ${prereq.expectedValue}`
            };
          }
          break;

        case 'ROOM_ACCESSIBLE':
          if (!prereq.roomId) {
            return {
              passed: false,
              message: 'Invalid prerequisite: missing roomId'
            };
          }
          // For now, just check if room exists
          const room = state.getRoom(prereq.roomId);
          if (!room) {
            return {
              passed: false,
              message: `Room ${prereq.roomId} not accessible`
            };
          }
          break;
      }
    }

    return { passed: true, message: 'All prerequisites met' };
  }

  /**
   * Execute solution steps
   */
  private executeSolutionSteps(state: GameState, testCase: PuzzleTestCase): { passed: boolean; message: string } {
    for (let i = 0; i < testCase.solutionSteps.length; i++) {
      const step = testCase.solutionSteps[i];
      const result = this.executeStep(state, step);

      if (result.success !== step.expectedSuccess) {
        return {
          passed: false,
          message: `Step ${i + 1} (${step.action}) failed: expected ${step.expectedSuccess ? 'success' : 'failure'}, got ${result.success ? 'success' : 'failure'}. Message: ${result.message}`
        };
      }

      if (step.expectedMessageContains && !result.message.toLowerCase().includes(step.expectedMessageContains.toLowerCase())) {
        return {
          passed: false,
          message: `Step ${i + 1} (${step.action}) message incorrect: expected to contain "${step.expectedMessageContains}", got "${result.message}"`
        };
      }
    }

    return { passed: true, message: 'All steps executed successfully' };
  }

  /**
   * Execute a single solution step
   */
  private executeStep(state: GameState, step: PuzzleSolutionStep): { success: boolean; message: string } {
    switch (step.action) {
      case 'UNLOCK_GRATING':
        return GratingPuzzle.unlockGrating(state, step.objectId || 'KEYS');

      case 'REVEAL_GRATING':
        return GratingPuzzle.revealGrating(state);

      case 'MOVE_RUG':
        return TrapDoorPuzzle.moveRug(state);

      case 'OPEN_TRAP_DOOR':
        return TrapDoorPuzzle.openTrapDoor(state);

      case 'TURN_BOLT':
        return DamPuzzle.turnBolt(state, step.objectId || 'WRENCH');

      case 'PUSH_BUTTON':
        return DamPuzzle.pushButton(state, step.objectId || '');

      case 'FIX_LEAK':
        return DamPuzzle.fixLeak(state, step.objectId || 'PUTTY');

      case 'WAVE_SCEPTRE':
        return RainbowPuzzle.waveSceptre(state, step.objectId || 'SCEPTRE');

      case 'CLIMB_RAINBOW':
        return RainbowPuzzle.climbRainbow(state);

      case 'INFLATE_BOAT':
        return BoatPuzzle.inflateBoat(state, step.objectId || 'INFLATABLE-BOAT', step.secondObjectId || 'PUMP');

      case 'DEFLATE_BOAT':
        return BoatPuzzle.deflateBoat(state);

      case 'TIE_ROPE':
        return RopeBasketPuzzle.tieRope(state, step.objectId || 'ROPE', step.secondObjectId || 'RAILING');

      case 'CLIMB_ROPE':
        return RopeBasketPuzzle.climbRope(state);

      case 'RAISE_BASKET':
        return RopeBasketPuzzle.raiseBasket(state);

      case 'LOWER_BASKET':
        return RopeBasketPuzzle.lowerBasket(state);

      case 'PUSH_COFFIN':
        return CoffinPuzzle.pushCoffin(state);

      case 'SAY_MAGIC_WORD':
        return MagicWordPuzzle.sayMagicWord(state, step.word || 'ULYSSES');

      case 'BREAK_MIRROR':
        return MirrorPuzzle.breakMirror(state);

      case 'RUB_MIRROR':
        return MirrorPuzzle.rubMirror(state, step.objectId || 'MIRROR-1');

      case 'EXAMINE_MIRROR':
        return MirrorPuzzle.examineMirror(state);

      default:
        return {
          success: false,
          message: `Unknown action: ${step.action}`
        };
    }
  }

  /**
   * Verify expected state changes
   */
  private verifyStateChanges(state: GameState, testCase: PuzzleTestCase): { passed: boolean; message: string } {
    for (const change of testCase.expectedStateChanges) {
      switch (change.type) {
        case 'FLAG':
          if (!change.flagName) {
            return {
              passed: false,
              message: 'Invalid state change: missing flagName'
            };
          }
          const flagValue = state.getFlag(change.flagName as any);
          if (flagValue !== change.expectedValue) {
            return {
              passed: false,
              message: `Flag ${change.flagName} is ${flagValue}, expected ${change.expectedValue}`
            };
          }
          break;

        case 'GLOBAL_VARIABLE':
          if (!change.variableName) {
            return {
              passed: false,
              message: 'Invalid state change: missing variableName'
            };
          }
          const varValue = state.getGlobalVariable(change.variableName);
          if (varValue !== change.expectedValue) {
            return {
              passed: false,
              message: `Variable ${change.variableName} is ${varValue}, expected ${change.expectedValue}`
            };
          }
          break;

        case 'OBJECT_LOCATION':
          if (!change.objectId) {
            return {
              passed: false,
              message: 'Invalid state change: missing objectId'
            };
          }
          const obj = state.getObject(change.objectId);
          if (!obj || obj.location !== change.expectedValue) {
            return {
              passed: false,
              message: `Object ${change.objectId} location is ${obj?.location}, expected ${change.expectedValue}`
            };
          }
          break;

        case 'OBJECT_FLAG':
          if (!change.objectId || !change.objectFlag) {
            return {
              passed: false,
              message: 'Invalid state change: missing objectId or objectFlag'
            };
          }
          const objWithFlag = state.getObject(change.objectId) as GameObjectImpl;
          if (!objWithFlag) {
            return {
              passed: false,
              message: `Object ${change.objectId} not found`
            };
          }
          const hasFlag = objWithFlag.hasFlag(change.objectFlag);
          if (hasFlag !== change.expectedValue) {
            return {
              passed: false,
              message: `Object ${change.objectId} flag ${change.objectFlag} is ${hasFlag}, expected ${change.expectedValue}`
            };
          }
          break;

        case 'ROOM_EXIT':
          if (!change.roomId || !change.exitDirection) {
            return {
              passed: false,
              message: 'Invalid state change: missing roomId or exitDirection'
            };
          }
          const room = state.getRoom(change.roomId);
          if (!room) {
            return {
              passed: false,
              message: `Room ${change.roomId} not found`
            };
          }
          const exit = room.getExit(change.exitDirection as any);
          const exitAvailable = exit && room.isExitAvailable(change.exitDirection as any);
          if (exitAvailable !== change.expectedValue) {
            return {
              passed: false,
              message: `Room ${change.roomId} exit ${change.exitDirection} availability is ${exitAvailable}, expected ${change.expectedValue}`
            };
          }
          break;
      }
    }

    return { passed: true, message: 'All state changes verified' };
  }

  /**
   * Generate reproduction steps for bug report
   */
  private generateReproductionSteps(testCase: PuzzleTestCase): string[] {
    const steps: string[] = [];
    steps.push(`Test puzzle: ${testCase.name}`);
    steps.push(`Description: ${testCase.description}`);
    steps.push('Prerequisites:');
    for (const prereq of testCase.prerequisites) {
      steps.push(`  - ${prereq.type}: ${JSON.stringify(prereq)}`);
    }
    steps.push('Solution steps:');
    for (let i = 0; i < testCase.solutionSteps.length; i++) {
      const step = testCase.solutionSteps[i];
      steps.push(`  ${i + 1}. ${step.action} ${step.objectId || ''} ${step.secondObjectId || ''}`);
    }
    return steps;
  }

}


/**
 * Puzzle dependency graph node
 */
export interface PuzzleDependency {
  puzzleId: string;
  dependsOn: string[];
}

/**
 * Puzzle Dependency Tracker
 * Builds and manages puzzle dependency graph
 */
export class PuzzleDependencyTracker {
  private dependencies: Map<string, string[]>;

  constructor() {
    this.dependencies = new Map();
  }

  /**
   * Add a puzzle dependency
   */
  addDependency(puzzleId: string, dependsOn: string[]): void {
    this.dependencies.set(puzzleId, dependsOn);
  }

  /**
   * Get dependencies for a puzzle
   */
  getDependencies(puzzleId: string): string[] {
    return this.dependencies.get(puzzleId) || [];
  }

  /**
   * Build dependency graph from test cases
   */
  buildDependencyGraph(testCases: PuzzleTestCase[]): void {
    for (const testCase of testCases) {
      const dependencies: string[] = [];

      // Extract dependencies from prerequisites
      for (const prereq of testCase.prerequisites) {
        // If prerequisite requires an object, check if that object comes from another puzzle
        if (prereq.type === 'OBJECT_IN_INVENTORY' || prereq.type === 'OBJECT_IN_ROOM') {
          // This is a simplified approach - in a real implementation,
          // we'd need to track which puzzles provide which objects
          // For now, we'll just track explicit dependencies
        }

        // If prerequisite requires a flag or variable, that might come from another puzzle
        if (prereq.type === 'FLAG_SET' || prereq.type === 'GLOBAL_VARIABLE') {
          // Check if this flag/variable is set by another puzzle
          // This would require analyzing all test cases to see which ones set this flag
        }
      }

      this.dependencies.set(testCase.puzzleId, dependencies);
    }
  }

  /**
   * Get puzzle solving order using topological sort
   * Returns puzzles in order they should be solved
   */
  getSolvingOrder(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const visiting = new Set<string>();

    const visit = (puzzleId: string): void => {
      if (visited.has(puzzleId)) {
        return;
      }

      if (visiting.has(puzzleId)) {
        throw new Error(`Circular dependency detected involving puzzle: ${puzzleId}`);
      }

      visiting.add(puzzleId);

      const deps = this.dependencies.get(puzzleId) || [];
      for (const dep of deps) {
        visit(dep);
      }

      visiting.delete(puzzleId);
      visited.add(puzzleId);
      result.push(puzzleId);
    };

    // Visit all puzzles
    for (const puzzleId of this.dependencies.keys()) {
      visit(puzzleId);
    }

    return result;
  }

  /**
   * Check if a puzzle can be solved given completed puzzles
   */
  canSolvePuzzle(puzzleId: string, completedPuzzles: Set<string>): boolean {
    const deps = this.dependencies.get(puzzleId) || [];
    return deps.every(dep => completedPuzzles.has(dep));
  }

  /**
   * Get all puzzles that can be solved next
   */
  getAvailablePuzzles(completedPuzzles: Set<string>): string[] {
    const available: string[] = [];

    for (const puzzleId of this.dependencies.keys()) {
      if (!completedPuzzles.has(puzzleId) && this.canSolvePuzzle(puzzleId, completedPuzzles)) {
        available.push(puzzleId);
      }
    }

    return available;
  }

  /**
   * Validate that all dependencies exist
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allPuzzles = new Set(this.dependencies.keys());

    for (const [puzzleId, deps] of this.dependencies.entries()) {
      for (const dep of deps) {
        if (!allPuzzles.has(dep)) {
          errors.push(`Puzzle ${puzzleId} depends on non-existent puzzle: ${dep}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get dependency depth (how many puzzles must be solved before this one)
   */
  getDependencyDepth(puzzleId: string): number {
    const visited = new Set<string>();

    const getDepth = (id: string): number => {
      if (visited.has(id)) {
        return 0; // Avoid infinite loops
      }

      visited.add(id);
      const deps = this.dependencies.get(id) || [];

      if (deps.length === 0) {
        return 0;
      }

      return 1 + Math.max(...deps.map(dep => getDepth(dep)));
    };

    return getDepth(puzzleId);
  }

  /**
   * Clear all dependencies
   */
  clear(): void {
    this.dependencies.clear();
  }
}
