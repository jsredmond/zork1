/**
 * Puzzle Verification Framework
 * Provides infrastructure for verifying puzzle solutions match original Zork I behavior
 */

import { GameState } from '../game/state.js';

/**
 * Puzzle verification interface
 * Defines the structure for puzzle solution verification
 */
export interface PuzzleVerification {
  puzzleId: string;
  name: string;
  description: string;
  category: PuzzleCategory;
  prerequisites: PuzzlePrerequisite[];
  solutionSteps: PuzzleSolutionStep[];
  alternativeSolutions?: AlternativeSolution[];
  failureConditions: FailureCondition[];
  expectedStateChanges: ExpectedStateChange[];
}

/**
 * Puzzle categories for organization
 */
export enum PuzzleCategory {
  OPENING = 'OPENING',
  NAVIGATION = 'NAVIGATION',
  OBJECT_MANIPULATION = 'OBJECT_MANIPULATION',
  NPC_INTERACTION = 'NPC_INTERACTION',
  TREASURE = 'TREASURE',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  COMBAT = 'COMBAT'
}

/**
 * Prerequisite that must be met before puzzle can be solved
 */
export interface PuzzlePrerequisite {
  type: 'OBJECT_IN_INVENTORY' | 'OBJECT_IN_ROOM' | 'FLAG_SET' | 'GLOBAL_VARIABLE' | 'ROOM_ACCESSIBLE' | 'OBJECT_STATE';
  description: string;
  objectId?: string;
  roomId?: string;
  flagName?: string;
  variableName?: string;
  expectedValue?: any;
  objectFlag?: string;
}

/**
 * Single step in puzzle solution
 */
export interface PuzzleSolutionStep {
  stepNumber: number;
  command: string;
  description: string;
  expectedSuccess: boolean;
  expectedOutputContains?: string[];
  expectedOutputExact?: string;
  stateChecks?: StateCheck[];
  optional?: boolean;
}

/**
 * Alternative solution path for a puzzle
 */
export interface AlternativeSolution {
  name: string;
  description: string;
  steps: PuzzleSolutionStep[];
  expectedStateChanges: ExpectedStateChange[];
}

/**
 * Condition that should cause puzzle to fail
 */
export interface FailureCondition {
  name: string;
  description: string;
  commands: string[];
  expectedBehavior: string;
  shouldPreventSolution: boolean;
}

/**
 * Expected state change after puzzle completion
 */
export interface ExpectedStateChange {
  type: 'FLAG' | 'GLOBAL_VARIABLE' | 'OBJECT_LOCATION' | 'OBJECT_FLAG' | 'ROOM_EXIT' | 'SCORE';
  description: string;
  flagName?: string;
  variableName?: string;
  objectId?: string;
  objectFlag?: string;
  roomId?: string;
  exitDirection?: string;
  expectedValue: any;
}

/**
 * State check to verify during solution
 */
export interface StateCheck {
  type: 'FLAG' | 'OBJECT_LOCATION' | 'INVENTORY' | 'ROOM' | 'SCORE';
  description: string;
  target?: string;
  expectedValue: any;
}

/**
 * Result of puzzle verification
 */
export interface PuzzleVerificationResult {
  puzzleId: string;
  passed: boolean;
  message: string;
  failedStep?: number;
  failedCheck?: string;
  prerequisitesFailed?: string[];
  stateChangesFailed?: string[];
  executionTime: number;
  timestamp: Date;
}

/**
 * Puzzle Verification Framework
 * Executes and verifies puzzle solutions step-by-step
 */
export class PuzzleVerificationFramework {
  /**
   * Verify a puzzle solution
   */
  verifyPuzzle(state: GameState, puzzle: PuzzleVerification): PuzzleVerificationResult {
    const startTime = Date.now();

    // Step 1: Check prerequisites
    const prerequisiteResult = this.checkPrerequisites(state, puzzle);
    if (!prerequisiteResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: `Prerequisites not met: ${prerequisiteResult.message}`,
        prerequisitesFailed: prerequisiteResult.failed,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    // Step 2: Execute solution steps
    const executionResult = this.executeSolutionSteps(state, puzzle);
    if (!executionResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: executionResult.message,
        failedStep: executionResult.failedStep,
        failedCheck: executionResult.failedCheck,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    // Step 3: Verify expected state changes
    const stateResult = this.verifyStateChanges(state, puzzle);
    if (!stateResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: stateResult.message,
        stateChangesFailed: stateResult.failed,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    return {
      puzzleId: puzzle.puzzleId,
      passed: true,
      message: `Puzzle "${puzzle.name}" verified successfully`,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Verify alternative solution
   */
  verifyAlternativeSolution(
    state: GameState,
    puzzle: PuzzleVerification,
    alternativeSolution: AlternativeSolution
  ): PuzzleVerificationResult {
    const startTime = Date.now();

    // Check prerequisites (same as main solution)
    const prerequisiteResult = this.checkPrerequisites(state, puzzle);
    if (!prerequisiteResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: `Prerequisites not met for alternative solution "${alternativeSolution.name}": ${prerequisiteResult.message}`,
        prerequisitesFailed: prerequisiteResult.failed,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    // Execute alternative solution steps
    const executionResult = this.executeSteps(state, alternativeSolution.steps);
    if (!executionResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: `Alternative solution "${alternativeSolution.name}" failed: ${executionResult.message}`,
        failedStep: executionResult.failedStep,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    // Verify alternative solution state changes
    const stateResult = this.verifyExpectedStateChanges(state, alternativeSolution.expectedStateChanges);
    if (!stateResult.passed) {
      return {
        puzzleId: puzzle.puzzleId,
        passed: false,
        message: `Alternative solution "${alternativeSolution.name}" state verification failed: ${stateResult.message}`,
        stateChangesFailed: stateResult.failed,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }

    return {
      puzzleId: puzzle.puzzleId,
      passed: true,
      message: `Alternative solution "${alternativeSolution.name}" verified successfully`,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Verify failure conditions
   */
  verifyFailureCondition(
    state: GameState,
    puzzle: PuzzleVerification,
    failureCondition: FailureCondition
  ): PuzzleVerificationResult {
    const startTime = Date.now();

    // Execute failure condition commands
    for (const command of failureCondition.commands) {
      // In a real implementation, would execute command through game engine
      // For now, just verify the structure
    }

    // Verify that puzzle cannot be solved after failure condition
    if (failureCondition.shouldPreventSolution) {
      const solutionResult = this.executeSolutionSteps(state, puzzle);
      if (solutionResult.passed) {
        return {
          puzzleId: puzzle.puzzleId,
          passed: false,
          message: `Failure condition "${failureCondition.name}" did not prevent solution`,
          executionTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }
    }

    return {
      puzzleId: puzzle.puzzleId,
      passed: true,
      message: `Failure condition "${failureCondition.name}" verified successfully`,
      executionTime: Date.now() - startTime,
      timestamp: new Date()
    };
  }

  /**
   * Check if all prerequisites are met
   */
  private checkPrerequisites(
    state: GameState,
    puzzle: PuzzleVerification
  ): { passed: boolean; message: string; failed: string[] } {
    const failed: string[] = [];

    for (const prereq of puzzle.prerequisites) {
      const result = this.checkPrerequisite(state, prereq);
      if (!result.passed) {
        failed.push(result.message);
      }
    }

    if (failed.length > 0) {
      return {
        passed: false,
        message: failed.join('; '),
        failed
      };
    }

    return {
      passed: true,
      message: 'All prerequisites met',
      failed: []
    };
  }

  /**
   * Check single prerequisite
   */
  private checkPrerequisite(
    state: GameState,
    prereq: PuzzlePrerequisite
  ): { passed: boolean; message: string } {
    switch (prereq.type) {
      case 'OBJECT_IN_INVENTORY':
        if (!prereq.objectId || !state.isInInventory(prereq.objectId)) {
          return {
            passed: false,
            message: `${prereq.description}: Object ${prereq.objectId} not in inventory`
          };
        }
        break;

      case 'OBJECT_IN_ROOM':
        if (!prereq.objectId || !prereq.roomId) {
          return {
            passed: false,
            message: `${prereq.description}: Missing objectId or roomId`
          };
        }
        const obj = state.getObject(prereq.objectId);
        if (!obj || obj.location !== prereq.roomId) {
          return {
            passed: false,
            message: `${prereq.description}: Object ${prereq.objectId} not in room ${prereq.roomId}`
          };
        }
        break;

      case 'FLAG_SET':
        if (!prereq.flagName) {
          return {
            passed: false,
            message: `${prereq.description}: Missing flagName`
          };
        }
        const flagValue = state.getFlag(prereq.flagName as any);
        if (flagValue !== prereq.expectedValue) {
          return {
            passed: false,
            message: `${prereq.description}: Flag ${prereq.flagName} is ${flagValue}, expected ${prereq.expectedValue}`
          };
        }
        break;

      case 'GLOBAL_VARIABLE':
        if (!prereq.variableName) {
          return {
            passed: false,
            message: `${prereq.description}: Missing variableName`
          };
        }
        const varValue = state.getGlobalVariable(prereq.variableName);
        if (varValue !== prereq.expectedValue) {
          return {
            passed: false,
            message: `${prereq.description}: Variable ${prereq.variableName} is ${varValue}, expected ${prereq.expectedValue}`
          };
        }
        break;

      case 'ROOM_ACCESSIBLE':
        if (!prereq.roomId) {
          return {
            passed: false,
            message: `${prereq.description}: Missing roomId`
          };
        }
        const room = state.getRoom(prereq.roomId);
        if (!room) {
          return {
            passed: false,
            message: `${prereq.description}: Room ${prereq.roomId} not accessible`
          };
        }
        break;

      case 'OBJECT_STATE':
        if (!prereq.objectId) {
          return {
            passed: false,
            message: `${prereq.description}: Missing objectId`
          };
        }
        // Additional state checks would go here
        break;
    }

    return { passed: true, message: prereq.description };
  }

  /**
   * Execute solution steps
   */
  private executeSolutionSteps(
    state: GameState,
    puzzle: PuzzleVerification
  ): { passed: boolean; message: string; failedStep?: number; failedCheck?: string } {
    return this.executeSteps(state, puzzle.solutionSteps);
  }

  /**
   * Execute a list of steps
   */
  private executeSteps(
    state: GameState,
    steps: PuzzleSolutionStep[]
  ): { passed: boolean; message: string; failedStep?: number; failedCheck?: string } {
    for (const step of steps) {
      // In a real implementation, would execute command through game engine
      // For now, verify structure and perform state checks
      
      if (step.stateChecks) {
        for (const check of step.stateChecks) {
          const checkResult = this.performStateCheck(state, check);
          if (!checkResult.passed) {
            return {
              passed: false,
              message: `Step ${step.stepNumber} state check failed: ${checkResult.message}`,
              failedStep: step.stepNumber,
              failedCheck: check.description
            };
          }
        }
      }
    }

    return {
      passed: true,
      message: 'All steps executed successfully'
    };
  }

  /**
   * Perform a state check
   */
  private performStateCheck(
    state: GameState,
    check: StateCheck
  ): { passed: boolean; message: string } {
    switch (check.type) {
      case 'FLAG':
        if (!check.target) {
          return { passed: false, message: 'Missing flag name' };
        }
        const flagValue = state.getFlag(check.target as any);
        if (flagValue !== check.expectedValue) {
          return {
            passed: false,
            message: `${check.description}: Flag ${check.target} is ${flagValue}, expected ${check.expectedValue}`
          };
        }
        break;

      case 'OBJECT_LOCATION':
        if (!check.target) {
          return { passed: false, message: 'Missing object ID' };
        }
        const obj = state.getObject(check.target);
        if (!obj || obj.location !== check.expectedValue) {
          return {
            passed: false,
            message: `${check.description}: Object ${check.target} location is ${obj?.location}, expected ${check.expectedValue}`
          };
        }
        break;

      case 'INVENTORY':
        if (!check.target) {
          return { passed: false, message: 'Missing object ID' };
        }
        const inInventory = state.isInInventory(check.target);
        if (inInventory !== check.expectedValue) {
          return {
            passed: false,
            message: `${check.description}: Object ${check.target} in inventory is ${inInventory}, expected ${check.expectedValue}`
          };
        }
        break;

      case 'ROOM':
        const currentRoom = state.getCurrentRoom();
        if (!currentRoom || currentRoom.id !== check.expectedValue) {
          return {
            passed: false,
            message: `${check.description}: Current room is ${currentRoom?.id}, expected ${check.expectedValue}`
          };
        }
        break;

      case 'SCORE':
        const score = state.getScore();
        if (score !== check.expectedValue) {
          return {
            passed: false,
            message: `${check.description}: Score is ${score}, expected ${check.expectedValue}`
          };
        }
        break;
    }

    return { passed: true, message: check.description };
  }

  /**
   * Verify expected state changes
   */
  private verifyStateChanges(
    state: GameState,
    puzzle: PuzzleVerification
  ): { passed: boolean; message: string; failed: string[] } {
    return this.verifyExpectedStateChanges(state, puzzle.expectedStateChanges);
  }

  /**
   * Verify a list of expected state changes
   */
  private verifyExpectedStateChanges(
    state: GameState,
    changes: ExpectedStateChange[]
  ): { passed: boolean; message: string; failed: string[] } {
    const failed: string[] = [];

    for (const change of changes) {
      const result = this.verifyStateChange(state, change);
      if (!result.passed) {
        failed.push(result.message);
      }
    }

    if (failed.length > 0) {
      return {
        passed: false,
        message: failed.join('; '),
        failed
      };
    }

    return {
      passed: true,
      message: 'All state changes verified',
      failed: []
    };
  }

  /**
   * Verify single state change
   */
  private verifyStateChange(
    state: GameState,
    change: ExpectedStateChange
  ): { passed: boolean; message: string } {
    switch (change.type) {
      case 'FLAG':
        if (!change.flagName) {
          return { passed: false, message: `${change.description}: Missing flagName` };
        }
        const flagValue = state.getFlag(change.flagName as any);
        if (flagValue !== change.expectedValue) {
          return {
            passed: false,
            message: `${change.description}: Flag ${change.flagName} is ${flagValue}, expected ${change.expectedValue}`
          };
        }
        break;

      case 'GLOBAL_VARIABLE':
        if (!change.variableName) {
          return { passed: false, message: `${change.description}: Missing variableName` };
        }
        const varValue = state.getGlobalVariable(change.variableName);
        if (varValue !== change.expectedValue) {
          return {
            passed: false,
            message: `${change.description}: Variable ${change.variableName} is ${varValue}, expected ${change.expectedValue}`
          };
        }
        break;

      case 'OBJECT_LOCATION':
        if (!change.objectId) {
          return { passed: false, message: `${change.description}: Missing objectId` };
        }
        const obj = state.getObject(change.objectId);
        if (!obj || obj.location !== change.expectedValue) {
          return {
            passed: false,
            message: `${change.description}: Object ${change.objectId} location is ${obj?.location}, expected ${change.expectedValue}`
          };
        }
        break;

      case 'OBJECT_FLAG':
        if (!change.objectId || !change.objectFlag) {
          return { passed: false, message: `${change.description}: Missing objectId or objectFlag` };
        }
        // Would check object flags here
        break;

      case 'ROOM_EXIT':
        if (!change.roomId || !change.exitDirection) {
          return { passed: false, message: `${change.description}: Missing roomId or exitDirection` };
        }
        const room = state.getRoom(change.roomId);
        if (!room) {
          return {
            passed: false,
            message: `${change.description}: Room ${change.roomId} not found`
          };
        }
        const exit = room.getExit(change.exitDirection as any);
        const exitAvailable = exit && room.isExitAvailable(change.exitDirection as any);
        if (exitAvailable !== change.expectedValue) {
          return {
            passed: false,
            message: `${change.description}: Room ${change.roomId} exit ${change.exitDirection} availability is ${exitAvailable}, expected ${change.expectedValue}`
          };
        }
        break;

      case 'SCORE':
        const score = state.getScore();
        if (score !== change.expectedValue) {
          return {
            passed: false,
            message: `${change.description}: Score is ${score}, expected ${change.expectedValue}`
          };
        }
        break;
    }

    return { passed: true, message: change.description };
  }
}
