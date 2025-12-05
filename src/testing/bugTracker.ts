/**
 * Bug tracking and report generation
 * Handles creating bug reports from test failures and managing bug lifecycle
 */

import { 
  BugReport, 
  BugCategory, 
  BugSeverity, 
  BugStatus,
  GameStateSnapshot,
  TestResult,
  TestType
} from './types';
import { GameState } from '../game/state';
import { generateBugId } from './persistence';

/**
 * Create a game state snapshot from current game state
 */
export function captureGameState(state: GameState): GameStateSnapshot {
  return {
    currentRoom: state.currentRoom,
    inventory: [...state.inventory],
    score: state.score,
    moves: state.moves,
    flags: { ...state.flags }
  };
}

/**
 * Generate reproduction steps from test context
 */
export function generateReproductionSteps(
  testResult: TestResult,
  additionalContext?: string[]
): string[] {
  const steps: string[] = [];
  
  // Add initial state setup
  if (testResult.gameState) {
    steps.push(`Start game (or load state: Room=${testResult.gameState.currentRoom}, Score=${testResult.gameState.score})`);
    
    if (testResult.gameState.inventory.length > 0) {
      steps.push(`Inventory: ${testResult.gameState.inventory.join(', ')}`);
    }
  }
  
  // Add test-specific steps based on test type
  switch (testResult.testType) {
    case TestType.ROOM_DESCRIPTION:
      steps.push(`Navigate to room: ${testResult.itemId}`);
      steps.push('Observe room description');
      break;
      
    case TestType.ROOM_EXITS:
      steps.push(`Navigate to room: ${testResult.itemId}`);
      steps.push('Attempt to use exits');
      break;
      
    case TestType.OBJECT_EXAMINE:
      steps.push(`Type: EXAMINE ${testResult.itemId}`);
      break;
      
    case TestType.OBJECT_TAKE:
      steps.push(`Type: TAKE ${testResult.itemId}`);
      break;
      
    case TestType.OBJECT_ACTION:
      steps.push(`Interact with object: ${testResult.itemId}`);
      break;
      
    case TestType.PUZZLE_SOLUTION:
      steps.push(`Attempt to solve puzzle: ${testResult.itemId}`);
      break;
      
    case TestType.NPC_INTERACTION:
      steps.push(`Interact with NPC: ${testResult.itemId}`);
      break;
      
    case TestType.EDGE_CASE:
      steps.push(`Execute edge case test: ${testResult.itemId}`);
      break;
  }
  
  // Add additional context if provided
  if (additionalContext) {
    steps.push(...additionalContext);
  }
  
  // Add observation step
  steps.push(`Observe: ${testResult.message}`);
  
  return steps;
}

/**
 * Categorize a bug based on test type and error message
 */
export function categorizeBug(testResult: TestResult): BugCategory {
  const message = testResult.message.toLowerCase();
  
  // Check for crashes or exceptions
  if (message.includes('crash') || message.includes('exception') || message.includes('error:')) {
    return BugCategory.CRASH;
  }
  
  // Check for parser errors
  if (message.includes('parse') || message.includes('syntax') || message.includes('command not recognized')) {
    return BugCategory.PARSER_ERROR;
  }
  
  // Check for missing content
  if (message.includes('missing') || message.includes('not found') || message.includes('undefined')) {
    return BugCategory.MISSING_CONTENT;
  }
  
  // Check for text errors
  if (message.includes('typo') || message.includes('spelling') || message.includes('grammar')) {
    return BugCategory.TEXT_ERROR;
  }
  
  // Check test type for categorization
  if (testResult.testType === TestType.ROOM_DESCRIPTION || testResult.testType === TestType.ROOM_EXITS) {
    return BugCategory.MISSING_CONTENT;
  }
  
  // Default to action error or incorrect behavior
  if (testResult.testType === TestType.OBJECT_ACTION || 
      testResult.testType === TestType.PUZZLE_SOLUTION ||
      testResult.testType === TestType.NPC_INTERACTION) {
    return BugCategory.INCORRECT_BEHAVIOR;
  }
  
  return BugCategory.ACTION_ERROR;
}

/**
 * Assign severity to a bug based on category and context
 */
export function assignSeverity(
  category: BugCategory,
  testResult: TestResult
): BugSeverity {
  // Critical: Crashes and game-breaking bugs
  if (category === BugCategory.CRASH) {
    return BugSeverity.CRITICAL;
  }
  
  // Major: Missing content, parser errors, incorrect behavior
  if (category === BugCategory.MISSING_CONTENT || 
      category === BugCategory.PARSER_ERROR ||
      category === BugCategory.INCORRECT_BEHAVIOR) {
    return BugSeverity.MAJOR;
  }
  
  // Minor: Action errors that have workarounds
  if (category === BugCategory.ACTION_ERROR) {
    return BugSeverity.MINOR;
  }
  
  // Trivial: Text errors, typos
  if (category === BugCategory.TEXT_ERROR) {
    return BugSeverity.TRIVIAL;
  }
  
  // Default to minor
  return BugSeverity.MINOR;
}

/**
 * Generate a bug title from test result
 */
export function generateBugTitle(testResult: TestResult): string {
  const testTypeNames: Record<TestType, string> = {
    [TestType.ROOM_DESCRIPTION]: 'Room Description',
    [TestType.ROOM_EXITS]: 'Room Exits',
    [TestType.OBJECT_EXAMINE]: 'Object Examine',
    [TestType.OBJECT_TAKE]: 'Object Take',
    [TestType.OBJECT_ACTION]: 'Object Action',
    [TestType.PUZZLE_SOLUTION]: 'Puzzle Solution',
    [TestType.NPC_INTERACTION]: 'NPC Interaction',
    [TestType.EDGE_CASE]: 'Edge Case'
  };
  
  const testTypeName = testTypeNames[testResult.testType] || 'Test';
  return `${testTypeName} failed for ${testResult.itemId}`;
}

/**
 * Create a bug report from a failed test result
 */
export function createBugReportFromTest(
  testResult: TestResult,
  gameState: GameState,
  additionalContext?: string[]
): BugReport {
  if (testResult.passed) {
    throw new Error('Cannot create bug report from passing test');
  }
  
  const category = categorizeBug(testResult);
  const severity = assignSeverity(category, testResult);
  const snapshot = captureGameState(gameState);
  const reproductionSteps = generateReproductionSteps(testResult, additionalContext);
  const title = generateBugTitle(testResult);
  
  const bugReport: BugReport = {
    id: generateBugId(),
    title,
    description: testResult.message,
    category,
    severity,
    status: BugStatus.OPEN,
    reproductionSteps,
    gameState: snapshot,
    foundDate: new Date()
  };
  
  return bugReport;
}

/**
 * Update bug status when it's fixed
 */
export function markBugFixed(bug: BugReport): BugReport {
  return {
    ...bug,
    status: BugStatus.FIXED,
    fixedDate: new Date()
  };
}

/**
 * Update bug status when fix is verified
 */
export function markBugVerified(bug: BugReport): BugReport {
  return {
    ...bug,
    status: BugStatus.VERIFIED,
    verifiedDate: new Date()
  };
}

/**
 * Update bug status to in progress
 */
export function markBugInProgress(bug: BugReport): BugReport {
  return {
    ...bug,
    status: BugStatus.IN_PROGRESS
  };
}

/**
 * Mark bug as won't fix
 */
export function markBugWontFix(bug: BugReport): BugReport {
  return {
    ...bug,
    status: BugStatus.WONT_FIX
  };
}
