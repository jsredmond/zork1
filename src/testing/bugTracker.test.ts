/**
 * Property-based tests for bug tracking and report generation
 * Feature: exhaustive-game-testing, Property 3: Bug report completeness
 * Validates: Requirements 5.1, 5.3, 5.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createBugReportFromTest,
  captureGameState,
  generateReproductionSteps,
  categorizeBug,
  assignSeverity,
  generateBugTitle,
  markBugFixed,
  markBugVerified,
  markBugInProgress,
  markBugWontFix
} from './bugTracker';
import {
  TestResult,
  TestType,
  BugCategory,
  BugSeverity,
  BugStatus,
  GameStateSnapshot
} from './types';
import { GameState } from '../game/state';

/**
 * Arbitrary generator for TestType
 */
const testTypeArbitrary = fc.constantFrom(
  TestType.ROOM_DESCRIPTION,
  TestType.ROOM_EXITS,
  TestType.OBJECT_EXAMINE,
  TestType.OBJECT_TAKE,
  TestType.OBJECT_ACTION,
  TestType.PUZZLE_SOLUTION,
  TestType.NPC_INTERACTION,
  TestType.EDGE_CASE
);

/**
 * Arbitrary generator for GameStateSnapshot
 */
const gameStateSnapshotArbitrary = fc.record({
  currentRoom: fc.string({ minLength: 1, maxLength: 30 }),
  inventory: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 20 }),
  score: fc.nat({ max: 350 }),
  moves: fc.nat({ max: 1000 }),
  flags: fc.dictionary(fc.string(), fc.boolean(), { maxKeys: 10 })
}) as fc.Arbitrary<GameStateSnapshot>;

/**
 * Arbitrary generator for failed TestResult
 */
const failedTestResultArbitrary = fc.record({
  testId: fc.string({ minLength: 5, maxLength: 30 }),
  testType: testTypeArbitrary,
  itemId: fc.string({ minLength: 1, maxLength: 30 }),
  passed: fc.constant(false), // Always failed for bug reports
  message: fc.string({ minLength: 10, maxLength: 200 }),
  timestamp: fc.date(),
  gameState: fc.option(gameStateSnapshotArbitrary, { nil: undefined })
}) as fc.Arbitrary<TestResult>;

/**
 * Arbitrary generator for GameState
 */
const gameStateArbitrary = fc.record({
  currentRoom: fc.string({ minLength: 1, maxLength: 30 }),
  inventory: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 20 }),
  score: fc.nat({ max: 350 }),
  moves: fc.nat({ max: 1000 }),
  flags: fc.dictionary(fc.string(), fc.boolean(), { maxKeys: 10 })
}).map(data => {
  // Create a minimal GameState for testing
  const state = new GameState({
    currentRoom: data.currentRoom,
    inventory: data.inventory,
    score: data.score,
    moves: data.moves,
    flags: data.flags as any
  });
  return state;
});

describe('BugTracker - Property-Based Tests', () => {
  /**
   * Feature: exhaustive-game-testing, Property 3: Bug report completeness
   * For any detected bug, the bug report should include reproduction steps, game state, and categorization
   * Validates: Requirements 5.1, 5.3, 5.4
   */
  it('Property 3: all bug reports contain required fields', () => {
    fc.assert(
      fc.property(
        failedTestResultArbitrary,
        gameStateArbitrary,
        (testResult, gameState) => {
          const bugReport = createBugReportFromTest(testResult, gameState);

          // Requirement 5.1: Bug report must have all required fields
          expect(bugReport.id).toBeDefined();
          expect(bugReport.id).toMatch(/^BUG-\d{3}$/);
          expect(bugReport.title).toBeDefined();
          expect(bugReport.title.length).toBeGreaterThan(0);
          expect(bugReport.description).toBeDefined();
          expect(bugReport.description.length).toBeGreaterThan(0);
          
          // Requirement 5.2: Bug must be categorized
          expect(Object.values(BugCategory)).toContain(bugReport.category);
          
          // Requirement 5.4: Bug must have severity level
          expect(Object.values(BugSeverity)).toContain(bugReport.severity);
          
          // Bug must have status
          expect(bugReport.status).toBe(BugStatus.OPEN);
          
          // Requirement 5.3: Bug must include game state snapshot
          expect(bugReport.gameState).toBeDefined();
          expect(bugReport.gameState.currentRoom).toBeDefined();
          expect(bugReport.gameState.inventory).toBeDefined();
          expect(Array.isArray(bugReport.gameState.inventory)).toBe(true);
          expect(bugReport.gameState.score).toBeDefined();
          expect(typeof bugReport.gameState.score).toBe('number');
          expect(bugReport.gameState.moves).toBeDefined();
          expect(typeof bugReport.gameState.moves).toBe('number');
          expect(bugReport.gameState.flags).toBeDefined();
          
          // Requirement 5.1: Bug must include reproduction steps
          expect(bugReport.reproductionSteps).toBeDefined();
          expect(Array.isArray(bugReport.reproductionSteps)).toBe(true);
          expect(bugReport.reproductionSteps.length).toBeGreaterThan(0);
          
          // Bug must have foundDate
          expect(bugReport.foundDate).toBeInstanceOf(Date);
          
          // Optional fields should be undefined initially
          expect(bugReport.fixedDate).toBeUndefined();
          expect(bugReport.verifiedDate).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('captureGameState preserves all game state fields', () => {
    fc.assert(
      fc.property(gameStateArbitrary, (gameState) => {
        const snapshot = captureGameState(gameState);

        expect(snapshot.currentRoom).toBe(gameState.currentRoom);
        expect(snapshot.inventory).toEqual(gameState.inventory);
        expect(snapshot.score).toBe(gameState.score);
        expect(snapshot.moves).toBe(gameState.moves);
        expect(snapshot.flags).toEqual(gameState.flags);
      }),
      { numRuns: 100 }
    );
  });

  it('generateReproductionSteps always produces non-empty array', () => {
    fc.assert(
      fc.property(failedTestResultArbitrary, (testResult) => {
        const steps = generateReproductionSteps(testResult);

        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(0);
        
        // Each step should be a non-empty string
        steps.forEach(step => {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(0);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('categorizeBug always returns a valid BugCategory', () => {
    fc.assert(
      fc.property(failedTestResultArbitrary, (testResult) => {
        const category = categorizeBug(testResult);

        expect(Object.values(BugCategory)).toContain(category);
      }),
      { numRuns: 100 }
    );
  });

  it('assignSeverity always returns a valid BugSeverity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(BugCategory)),
        failedTestResultArbitrary,
        (category, testResult) => {
          const severity = assignSeverity(category, testResult);

          expect(Object.values(BugSeverity)).toContain(severity);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateBugTitle produces non-empty title', () => {
    fc.assert(
      fc.property(failedTestResultArbitrary, (testResult) => {
        const title = generateBugTitle(testResult);

        expect(typeof title).toBe('string');
        expect(title.length).toBeGreaterThan(0);
        expect(title).toContain(testResult.itemId);
      }),
      { numRuns: 100 }
    );
  });

  it('markBugFixed sets status to FIXED and adds fixedDate', () => {
    fc.assert(
      fc.property(
        failedTestResultArbitrary,
        gameStateArbitrary,
        (testResult, gameState) => {
          const bugReport = createBugReportFromTest(testResult, gameState);
          const fixedBug = markBugFixed(bugReport);

          expect(fixedBug.status).toBe(BugStatus.FIXED);
          expect(fixedBug.fixedDate).toBeInstanceOf(Date);
          expect(fixedBug.id).toBe(bugReport.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('markBugVerified sets status to VERIFIED and adds verifiedDate', () => {
    fc.assert(
      fc.property(
        failedTestResultArbitrary,
        gameStateArbitrary,
        (testResult, gameState) => {
          const bugReport = createBugReportFromTest(testResult, gameState);
          const verifiedBug = markBugVerified(bugReport);

          expect(verifiedBug.status).toBe(BugStatus.VERIFIED);
          expect(verifiedBug.verifiedDate).toBeInstanceOf(Date);
          expect(verifiedBug.id).toBe(bugReport.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('markBugInProgress sets status to IN_PROGRESS', () => {
    fc.assert(
      fc.property(
        failedTestResultArbitrary,
        gameStateArbitrary,
        (testResult, gameState) => {
          const bugReport = createBugReportFromTest(testResult, gameState);
          const inProgressBug = markBugInProgress(bugReport);

          expect(inProgressBug.status).toBe(BugStatus.IN_PROGRESS);
          expect(inProgressBug.id).toBe(bugReport.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('markBugWontFix sets status to WONT_FIX', () => {
    fc.assert(
      fc.property(
        failedTestResultArbitrary,
        gameStateArbitrary,
        (testResult, gameState) => {
          const bugReport = createBugReportFromTest(testResult, gameState);
          const wontFixBug = markBugWontFix(bugReport);

          expect(wontFixBug.status).toBe(BugStatus.WONT_FIX);
          expect(wontFixBug.id).toBe(bugReport.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('createBugReportFromTest throws error for passing tests', () => {
    fc.assert(
      fc.property(
        gameStateArbitrary,
        testTypeArbitrary,
        fc.string({ minLength: 1, maxLength: 30 }),
        (gameState, testType, itemId) => {
          const passingTest: TestResult = {
            testId: 'test-123',
            testType,
            itemId,
            passed: true,
            message: 'Test passed',
            timestamp: new Date()
          };

          expect(() => createBugReportFromTest(passingTest, gameState)).toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('crash category always gets CRITICAL severity', () => {
    fc.assert(
      fc.property(failedTestResultArbitrary, (testResult) => {
        const severity = assignSeverity(BugCategory.CRASH, testResult);
        expect(severity).toBe(BugSeverity.CRITICAL);
      }),
      { numRuns: 100 }
    );
  });

  it('text error category always gets TRIVIAL severity', () => {
    fc.assert(
      fc.property(failedTestResultArbitrary, (testResult) => {
        const severity = assignSeverity(BugCategory.TEXT_ERROR, testResult);
        expect(severity).toBe(BugSeverity.TRIVIAL);
      }),
      { numRuns: 100 }
    );
  });
});
