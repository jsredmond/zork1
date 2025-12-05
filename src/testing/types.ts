/**
 * Type definitions for the exhaustive testing system
 */

import { GameState } from '../game/state';

/**
 * Types of tests that can be executed
 */
export enum TestType {
  ROOM_DESCRIPTION = 'ROOM_DESCRIPTION',
  ROOM_EXITS = 'ROOM_EXITS',
  OBJECT_EXAMINE = 'OBJECT_EXAMINE',
  OBJECT_TAKE = 'OBJECT_TAKE',
  OBJECT_ACTION = 'OBJECT_ACTION',
  PUZZLE_SOLUTION = 'PUZZLE_SOLUTION',
  NPC_INTERACTION = 'NPC_INTERACTION',
  EDGE_CASE = 'EDGE_CASE'
}

/**
 * Bug categories for classification
 */
export enum BugCategory {
  PARSER_ERROR = 'PARSER_ERROR',
  ACTION_ERROR = 'ACTION_ERROR',
  MISSING_CONTENT = 'MISSING_CONTENT',
  INCORRECT_BEHAVIOR = 'INCORRECT_BEHAVIOR',
  CRASH = 'CRASH',
  TEXT_ERROR = 'TEXT_ERROR'
}

/**
 * Bug severity levels
 */
export enum BugSeverity {
  CRITICAL = 'CRITICAL',    // Game-breaking, crashes
  MAJOR = 'MAJOR',          // Feature doesn't work
  MINOR = 'MINOR',          // Small issue, workaround exists
  TRIVIAL = 'TRIVIAL'       // Cosmetic, typos
}

/**
 * Bug status tracking
 */
export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FIXED = 'FIXED',
  VERIFIED = 'VERIFIED',
  WONT_FIX = 'WONT_FIX'
}

/**
 * Snapshot of game state at a specific point in time
 */
export interface GameStateSnapshot {
  currentRoom: string;
  inventory: string[];
  score: number;
  moves: number;
  flags: Record<string, boolean>;
}

/**
 * Result of a single test execution
 */
export interface TestResult {
  testId: string;
  testType: TestType;
  itemId: string;
  passed: boolean;
  message: string;
  timestamp: Date;
  gameState?: GameStateSnapshot;
  bug?: BugReport;
}

/**
 * Bug report with all necessary information
 */
export interface BugReport {
  id: string;
  title: string;
  description: string;
  category: BugCategory;
  severity: BugSeverity;
  status: BugStatus;
  reproductionSteps: string[];
  gameState: GameStateSnapshot;
  foundDate: Date;
  fixedDate?: Date;
  verifiedDate?: Date;
}

/**
 * Test progress tracking
 */
export interface TestProgress {
  version: string;
  lastUpdated: Date;
  testedRooms: string[];
  testedObjects: string[];
  testedInteractions: Record<string, string[]>;
  totalTests: number;
  coverage: {
    rooms: number;
    objects: number;
    interactions: number;
  };
}

/**
 * Options for test execution
 */
export interface TestOptions {
  testRooms?: boolean;
  testObjects?: boolean;
  testPuzzles?: boolean;
  testNPCs?: boolean;
  testEdgeCases?: boolean;
  roomFilter?: string[];
  objectFilter?: string[];
  maxTests?: number;
}

/**
 * Collection of test results
 */
export interface TestResults {
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  bugsFound: number;
  coverage: {
    rooms: number;
    objects: number;
    interactions: number;
  };
}

/**
 * Bug database structure
 */
export interface BugDatabase {
  bugs: BugReport[];
}
