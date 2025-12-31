/**
 * Property-Based Tests for RegressionPrevention
 * 
 * These tests verify universal properties that should hold for all valid inputs.
 * 
 * Feature: final-100-percent-parity
 * 
 * **Validates: Requirements 4.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  establishBaseline,
  detectRegressions,
  hashDifference,
  createBaselineDifference,
  getExitCode,
  EXIT_CODES,
  ParityBaseline,
  RegressionResult,
} from './regressionPrevention.js';
import { ClassifiedDifference, DifferenceType } from './differenceClassifier.js';
import { ParityResults } from './exhaustiveParityValidator.js';

describe('RegressionPrevention Property Tests', () => {
  /**
   * Generator for difference types
   */
  const differenceTypeArb = fc.constantFrom<DifferenceType>(
    'RNG_DIFFERENCE',
    'STATE_DIVERGENCE',
    'LOGIC_DIFFERENCE'
  );

  /**
   * Generator for commands
   */
  const commandArb = fc.constantFrom(
    'look', 'inventory', 'north', 'south', 'east', 'west',
    'take lamp', 'drop sword', 'open door', 'examine mailbox',
    'hello', 'jump', 'wait', 'push rock', 'pull lever'
  );

  /**
   * Generator for game output messages
   */
  const outputArb = fc.constantFrom(
    'Taken.',
    'Dropped.',
    'West of House',
    "You can't go that way.",
    'The lamp is now on.',
    'Hello.',
    'A valiant attempt.',
    'You are in a dark room.',
    'There is a small mailbox here.'
  );

  /**
   * Generator for classified differences
   */
  const classifiedDifferenceArb = fc.record({
    commandIndex: fc.integer({ min: 0, max: 500 }),
    command: commandArb,
    tsOutput: outputArb,
    zmOutput: outputArb,
    classification: differenceTypeArb,
    reason: fc.constantFrom(
      'Both outputs are from the YUKS RNG pool',
      'Game states have diverged due to accumulated RNG effects',
      'Difference cannot be attributed to RNG or state divergence'
    ),
  });

  /**
   * Generator for seed results
   */
  const seedResultArb = (differences: ClassifiedDifference[]) => fc.record({
    seed: fc.integer({ min: 1, max: 99999 }),
    totalCommands: fc.integer({ min: 50, max: 300 }),
    matchingResponses: fc.integer({ min: 40, max: 290 }),
    differences: fc.constant(differences),
    parityPercentage: fc.double({ min: 80, max: 100 }),
    executionTime: fc.integer({ min: 100, max: 10000 }),
    success: fc.constant(true),
  });

  /**
   * Generator for parity results with specific difference counts
   */
  const parityResultsArb = (
    rngCount: number,
    stateCount: number,
    logicCount: number
  ): fc.Arbitrary<ParityResults> => {
    // Create differences based on counts
    const differences: ClassifiedDifference[] = [];
    
    for (let i = 0; i < rngCount; i++) {
      differences.push({
        commandIndex: i,
        command: 'look',
        tsOutput: 'Hello.',
        zmOutput: 'Good day.',
        classification: 'RNG_DIFFERENCE',
        reason: 'RNG pool difference',
      });
    }
    
    for (let i = 0; i < stateCount; i++) {
      differences.push({
        commandIndex: rngCount + i,
        command: 'north',
        tsOutput: 'Forest',
        zmOutput: 'Clearing',
        classification: 'STATE_DIVERGENCE',
        reason: 'State divergence',
      });
    }
    
    for (let i = 0; i < logicCount; i++) {
      differences.push({
        commandIndex: rngCount + stateCount + i,
        command: `test-${i}`,
        tsOutput: 'TS output',
        zmOutput: 'ZM output',
        classification: 'LOGIC_DIFFERENCE',
        reason: 'Logic difference',
      });
    }

    const seedResults = new Map();
    seedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 100 - differences.length,
      differences,
      parityPercentage: ((100 - differences.length) / 100) * 100,
      executionTime: 1000,
      success: true,
    });

    return fc.constant({
      totalTests: 1,
      totalDifferences: differences.length,
      rngDifferences: rngCount,
      stateDivergences: stateCount,
      logicDifferences: logicCount,
      seedResults,
      overallParityPercentage: ((100 - differences.length) / 100) * 100,
      totalExecutionTime: 1000,
      passed: logicCount === 0,
      summary: 'Test summary',
    });
  };

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * For any baseline with zero logic differences, when a new logic difference
   * is injected, the regression detection SHALL fail.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4a: Injected logic difference causes test failure', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }), // RNG differences
        fc.integer({ min: 0, max: 5 }),  // State divergences
        (rngCount, stateCount) => {
          // Create baseline with no logic differences
          const baselineResultsArb = parityResultsArb(rngCount, stateCount, 0);
          const baselineResults = fc.sample(baselineResultsArb, 1)[0];
          const baseline = establishBaseline(baselineResults);

          // Create new results with an injected logic difference
          const newResultsArb = parityResultsArb(rngCount, stateCount, 1);
          const newResults = fc.sample(newResultsArb, 1)[0];

          // Detect regressions
          const result = detectRegressions(newResults, baseline);

          // Should fail because of the new logic difference
          return result.passed === false && result.newLogicDifferences.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * For any baseline, when results have no new logic differences,
   * the regression detection SHALL pass.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4b: No new logic differences means test passes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }), // RNG differences
        fc.integer({ min: 0, max: 5 }),  // State divergences
        (rngCount, stateCount) => {
          // Create baseline with no logic differences
          const resultsArb = parityResultsArb(rngCount, stateCount, 0);
          const results = fc.sample(resultsArb, 1)[0];
          const baseline = establishBaseline(results);

          // Run same results against baseline (no new differences)
          const regressionResult = detectRegressions(results, baseline);

          // Should pass because no new logic differences
          return regressionResult.passed === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * For any number of injected logic differences, the regression detection
   * SHALL report all of them.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4c: All injected logic differences are reported', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Number of logic differences to inject
        (logicCount) => {
          // Create baseline with no logic differences
          const baselineResultsArb = parityResultsArb(2, 1, 0);
          const baselineResults = fc.sample(baselineResultsArb, 1)[0];
          const baseline = establishBaseline(baselineResults);

          // Create new results with injected logic differences
          const newResultsArb = parityResultsArb(2, 1, logicCount);
          const newResults = fc.sample(newResultsArb, 1)[0];

          // Detect regressions
          const result = detectRegressions(newResults, baseline);

          // Should report all logic differences
          return result.newLogicDifferences.length === logicCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * The error message SHALL contain details about the failing difference.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4d: Error message contains difference details', () => {
    fc.assert(
      fc.property(
        commandArb,
        (command) => {
          // Create baseline with no logic differences
          const baselineResultsArb = parityResultsArb(1, 0, 0);
          const baselineResults = fc.sample(baselineResultsArb, 1)[0];
          const baseline = establishBaseline(baselineResults);

          // Create new results with a specific logic difference
          const logicDiff: ClassifiedDifference = {
            commandIndex: 50,
            command,
            tsOutput: 'TS specific output',
            zmOutput: 'ZM specific output',
            classification: 'LOGIC_DIFFERENCE',
            reason: 'Test logic difference',
          };

          const seedResults = new Map();
          seedResults.set(12345, {
            seed: 12345,
            totalCommands: 100,
            matchingResponses: 99,
            differences: [logicDiff],
            parityPercentage: 99,
            executionTime: 1000,
            success: true,
          });

          const newResults: ParityResults = {
            totalTests: 1,
            totalDifferences: 1,
            rngDifferences: 0,
            stateDivergences: 0,
            logicDifferences: 1,
            seedResults,
            overallParityPercentage: 99,
            totalExecutionTime: 1000,
            passed: false,
            summary: 'Test',
          };

          const result = detectRegressions(newResults, baseline);

          // Error message should contain the command
          return (
            result.errorMessage !== undefined &&
            result.errorMessage.includes(command) &&
            result.errorMessage.includes('LOGIC_DIFFERENCE')
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * Hash function is deterministic - same input always produces same hash.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4e: Hash function is deterministic', () => {
    fc.assert(
      fc.property(
        classifiedDifferenceArb,
        (diff) => {
          const hash1 = hashDifference(diff);
          const hash2 = hashDifference(diff);
          return hash1 === hash2;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * Exit code is SUCCESS (0) when regression detection passes.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4f: Exit code is SUCCESS when passed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // Current differences
        fc.integer({ min: 0, max: 20 }), // Baseline differences
        (currentDiffs, baselineDiffs) => {
          const result: RegressionResult = {
            passed: true,
            newLogicDifferences: [],
            currentDifferences: currentDiffs,
            baselineDifferences: baselineDiffs,
            summary: 'Test passed',
          };

          return getExitCode(result, true) === EXIT_CODES.SUCCESS;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * Exit code is REGRESSION_DETECTED (1) when regression detection fails.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4g: Exit code is REGRESSION_DETECTED when failed', () => {
    fc.assert(
      fc.property(
        classifiedDifferenceArb.filter(d => d.classification === 'LOGIC_DIFFERENCE'),
        (logicDiff) => {
          const result: RegressionResult = {
            passed: false,
            newLogicDifferences: [logicDiff],
            currentDifferences: 5,
            baselineDifferences: 4,
            summary: 'Test failed',
          };

          return getExitCode(result, true) === EXIT_CODES.REGRESSION_DETECTED;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: final-100-percent-parity, Property 4: Regression Detection Works
   * 
   * Baseline differences are preserved correctly through establish/detect cycle.
   * 
   * **Validates: Requirements 4.2**
   */
  it('Property 4h: Baseline preserves difference counts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 3 }),
        (rngCount, stateCount, logicCount) => {
          const resultsArb = parityResultsArb(rngCount, stateCount, logicCount);
          const results = fc.sample(resultsArb, 1)[0];
          const baseline = establishBaseline(results);

          return (
            baseline.classificationCounts['RNG_DIFFERENCE'] === rngCount &&
            baseline.classificationCounts['STATE_DIVERGENCE'] === stateCount &&
            baseline.classificationCounts['LOGIC_DIFFERENCE'] === logicCount
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
