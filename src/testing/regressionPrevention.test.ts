/**
 * Unit tests for RegressionPrevention
 * 
 * Tests baseline establishment, regression detection, and CI integration.
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import {
  RegressionPrevention,
  createRegressionPrevention,
  establishBaseline,
  saveBaseline,
  loadBaseline,
  baselineExists,
  detectRegressions,
  validateAgainstBaseline,
  hashDifference,
  createBaselineDifference,
  getExitCode,
  EXIT_CODES,
  ParityBaseline,
  BASELINE_VERSION,
} from './regressionPrevention.js';
import { ClassifiedDifference } from './differenceClassifier.js';
import { ParityResults } from './exhaustiveParityValidator.js';

// Test baseline path to avoid affecting real baseline
const TEST_BASELINE_PATH = 'src/testing/test-parity-baseline.json';

// Helper to create mock parity results
function createMockParityResults(overrides?: Partial<ParityResults>): ParityResults {
  const seedResults = new Map<number, {
    seed: number;
    totalCommands: number;
    matchingResponses: number;
    differences: ClassifiedDifference[];
    parityPercentage: number;
    executionTime: number;
    success: boolean;
    statusBarDifferences: number;
    logicParityPercentage: number;
  }>();

  seedResults.set(12345, {
    seed: 12345,
    totalCommands: 100,
    matchingResponses: 95,
    differences: [],
    parityPercentage: 95,
    executionTime: 1000,
    success: true,
    statusBarDifferences: 0,
    logicParityPercentage: 100,
  });

  return {
    totalTests: 1,
    totalDifferences: 5,
    rngDifferences: 3,
    stateDivergences: 2,
    logicDifferences: 0,
    seedResults,
    overallParityPercentage: 95,
    totalExecutionTime: 1000,
    passed: true,
    summary: 'Test summary',
    statusBarDifferences: 0,
    logicParityPercentage: 100,
    ...overrides,
  };
}

// Helper to create mock classified difference
function createMockDifference(overrides?: Partial<ClassifiedDifference>): ClassifiedDifference {
  return {
    commandIndex: 0,
    command: 'look',
    tsOutput: 'TypeScript output',
    zmOutput: 'Z-Machine output',
    classification: 'RNG_DIFFERENCE',
    reason: 'Test reason',
    ...overrides,
  };
}

describe('RegressionPrevention', () => {
  // Clean up test baseline after each test
  afterEach(() => {
    if (existsSync(TEST_BASELINE_PATH)) {
      unlinkSync(TEST_BASELINE_PATH);
    }
  });

  describe('hashDifference', () => {
    it('should generate consistent hash for same difference', () => {
      const diff = createMockDifference({ command: 'look', classification: 'RNG_DIFFERENCE' });
      const hash1 = hashDifference(diff);
      const hash2 = hashDifference(diff);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different commands', () => {
      const diff1 = createMockDifference({ command: 'look' });
      const diff2 = createMockDifference({ command: 'inventory' });
      expect(hashDifference(diff1)).not.toBe(hashDifference(diff2));
    });

    it('should generate different hash for different classifications', () => {
      const diff1 = createMockDifference({ classification: 'RNG_DIFFERENCE' });
      const diff2 = createMockDifference({ classification: 'LOGIC_DIFFERENCE' });
      expect(hashDifference(diff1)).not.toBe(hashDifference(diff2));
    });
  });

  describe('createBaselineDifference', () => {
    it('should create baseline difference with hash', () => {
      const diff = createMockDifference();
      const baselineDiff = createBaselineDifference(diff);
      
      expect(baselineDiff.command).toBe(diff.command);
      expect(baselineDiff.classification).toBe(diff.classification);
      expect(baselineDiff.reason).toBe(diff.reason);
      expect(baselineDiff.hash).toBeDefined();
    });
  });

  describe('establishBaseline', () => {
    it('should create baseline from parity results', () => {
      const results = createMockParityResults();
      const baseline = establishBaseline(results);
      
      expect(baseline.version).toBe(BASELINE_VERSION);
      expect(baseline.createdAt).toBeDefined();
      expect(baseline.totalDifferences).toBe(results.totalDifferences);
      expect(baseline.classificationCounts['RNG_DIFFERENCE']).toBe(results.rngDifferences);
      expect(baseline.classificationCounts['STATE_DIVERGENCE']).toBe(results.stateDivergences);
      expect(baseline.classificationCounts['LOGIC_DIFFERENCE']).toBe(results.logicDifferences);
    });

    it('should include commit hash if provided', () => {
      const results = createMockParityResults();
      const baseline = establishBaseline(results, 'abc123');
      
      expect(baseline.commitHash).toBe('abc123');
    });

    it('should collect differences from all seeds', () => {
      const diff1 = createMockDifference({ command: 'look' });
      const diff2 = createMockDifference({ command: 'n' });
      
      const seedResults = new Map();
      seedResults.set(12345, {
        seed: 12345,
        totalCommands: 100,
        matchingResponses: 98,
        differences: [diff1],
        parityPercentage: 98,
        executionTime: 1000,
        success: true,
        statusBarDifferences: 0,
        logicParityPercentage: 100,
      });
      seedResults.set(67890, {
        seed: 67890,
        totalCommands: 100,
        matchingResponses: 99,
        differences: [diff2],
        parityPercentage: 99,
        executionTime: 1000,
        success: true,
        statusBarDifferences: 0,
        logicParityPercentage: 100,
      });

      const results = createMockParityResults({
        totalTests: 2,
        totalDifferences: 2,
        seedResults,
      });

      const baseline = establishBaseline(results);
      expect(baseline.differences).toHaveLength(2);
    });
  });

  describe('saveBaseline and loadBaseline', () => {
    it('should save and load baseline correctly', () => {
      const results = createMockParityResults();
      const baseline = establishBaseline(results);
      
      saveBaseline(baseline, TEST_BASELINE_PATH);
      expect(existsSync(TEST_BASELINE_PATH)).toBe(true);
      
      const loaded = loadBaseline(TEST_BASELINE_PATH);
      expect(loaded).not.toBeNull();
      expect(loaded?.version).toBe(baseline.version);
      expect(loaded?.totalDifferences).toBe(baseline.totalDifferences);
    });

    it('should return null for non-existent baseline', () => {
      const loaded = loadBaseline('non-existent-file.json');
      expect(loaded).toBeNull();
    });
  });

  describe('baselineExists', () => {
    it('should return false when baseline does not exist', () => {
      expect(baselineExists(TEST_BASELINE_PATH)).toBe(false);
    });

    it('should return true when baseline exists', () => {
      const results = createMockParityResults();
      const baseline = establishBaseline(results);
      saveBaseline(baseline, TEST_BASELINE_PATH);
      
      expect(baselineExists(TEST_BASELINE_PATH)).toBe(true);
    });
  });

  describe('detectRegressions', () => {
    it('should pass when no new logic differences', () => {
      const results = createMockParityResults({ logicDifferences: 0 });
      const baseline = establishBaseline(results);
      
      const result = detectRegressions(results, baseline);
      
      expect(result.passed).toBe(true);
      expect(result.newLogicDifferences).toHaveLength(0);
    });

    it('should fail when new logic difference detected', () => {
      // Create baseline with no logic differences
      const baselineResults = createMockParityResults({ logicDifferences: 0 });
      const baseline = establishBaseline(baselineResults);
      
      // Create new results with a logic difference
      const logicDiff = createMockDifference({
        command: 'new-command',
        classification: 'LOGIC_DIFFERENCE',
      });
      
      const seedResults = new Map();
      seedResults.set(12345, {
        seed: 12345,
        totalCommands: 100,
        matchingResponses: 99,
        differences: [logicDiff],
        parityPercentage: 99,
        executionTime: 1000,
        success: true,
        statusBarDifferences: 0,
        logicParityPercentage: 99,
      });

      const newResults = createMockParityResults({
        logicDifferences: 1,
        totalDifferences: 1,
        seedResults,
        passed: false,
      });

      const result = detectRegressions(newResults, baseline);
      
      expect(result.passed).toBe(false);
      expect(result.newLogicDifferences).toHaveLength(1);
      expect(result.errorMessage).toBeDefined();
      expect(result.errorMessage).toContain('PARITY REGRESSION DETECTED');
    });

    it('should provide detailed error message with difference details', () => {
      const baselineResults = createMockParityResults({ logicDifferences: 0 });
      const baseline = establishBaseline(baselineResults);
      
      const logicDiff = createMockDifference({
        command: 'test-command',
        classification: 'LOGIC_DIFFERENCE',
        tsOutput: 'TS output here',
        zmOutput: 'ZM output here',
      });
      
      const seedResults = new Map();
      seedResults.set(12345, {
        seed: 12345,
        totalCommands: 100,
        matchingResponses: 99,
        differences: [logicDiff],
        parityPercentage: 99,
        executionTime: 1000,
        success: true,
        statusBarDifferences: 0,
        logicParityPercentage: 99,
      });

      const newResults = createMockParityResults({
        logicDifferences: 1,
        seedResults,
      });

      const result = detectRegressions(newResults, baseline);
      
      expect(result.errorMessage).toContain('test-command');
      expect(result.errorMessage).toContain('LOGIC_DIFFERENCE');
      expect(result.errorMessage).toContain('TypeScript Output');
      expect(result.errorMessage).toContain('Z-Machine Output');
    });

    it('should generate summary with statistics', () => {
      const results = createMockParityResults();
      const baseline = establishBaseline(results);
      
      const result = detectRegressions(results, baseline);
      
      expect(result.summary).toContain('Regression Detection Summary');
      expect(result.summary).toContain('Baseline Statistics');
      expect(result.summary).toContain('Current Run Statistics');
    });
  });

  describe('validateAgainstBaseline', () => {
    it('should handle missing baseline gracefully', () => {
      const results = createMockParityResults({ logicDifferences: 0 });
      
      const result = validateAgainstBaseline(results, 'non-existent.json');
      
      expect(result.passed).toBe(true);
      expect(result.summary).toContain('No baseline exists');
    });

    it('should fail with missing baseline if logic differences exist', () => {
      const logicDiff = createMockDifference({ classification: 'LOGIC_DIFFERENCE' });
      const seedResults = new Map();
      seedResults.set(12345, {
        seed: 12345,
        totalCommands: 100,
        matchingResponses: 99,
        differences: [logicDiff],
        parityPercentage: 99,
        executionTime: 1000,
        success: true,
        statusBarDifferences: 0,
        logicParityPercentage: 99,
      });

      const results = createMockParityResults({
        logicDifferences: 1,
        seedResults,
      });
      
      const result = validateAgainstBaseline(results, 'non-existent.json');
      
      expect(result.passed).toBe(false);
      expect(result.newLogicDifferences).toHaveLength(1);
    });
  });

  describe('getExitCode', () => {
    it('should return SUCCESS when passed', () => {
      const result = {
        passed: true,
        newLogicDifferences: [],
        currentDifferences: 5,
        baselineDifferences: 5,
        summary: 'Test',
      };
      
      expect(getExitCode(result, true)).toBe(EXIT_CODES.SUCCESS);
    });

    it('should return REGRESSION_DETECTED when failed with differences', () => {
      const result = {
        passed: false,
        newLogicDifferences: [createMockDifference({ classification: 'LOGIC_DIFFERENCE' })],
        currentDifferences: 6,
        baselineDifferences: 5,
        summary: 'Test',
      };
      
      expect(getExitCode(result, true)).toBe(EXIT_CODES.REGRESSION_DETECTED);
    });

    it('should return NO_BASELINE when baseline missing and no differences', () => {
      const result = {
        passed: false,
        newLogicDifferences: [],
        currentDifferences: 0,
        baselineDifferences: 0,
        summary: 'Test',
      };
      
      expect(getExitCode(result, false)).toBe(EXIT_CODES.NO_BASELINE);
    });
  });

  describe('RegressionPrevention class', () => {
    let prevention: RegressionPrevention;

    beforeEach(() => {
      prevention = createRegressionPrevention(TEST_BASELINE_PATH);
    });

    it('should create instance with custom path', () => {
      expect(prevention.getBaselinePath()).toBe(TEST_BASELINE_PATH);
    });

    it('should report no baseline initially', () => {
      expect(prevention.hasBaseline()).toBe(false);
    });

    it('should establish and load baseline', () => {
      const results = createMockParityResults();
      
      prevention.establishBaseline(results, 'test-commit');
      
      expect(prevention.hasBaseline()).toBe(true);
      expect(prevention.getBaseline()).not.toBeNull();
      expect(prevention.getBaseline()?.commitHash).toBe('test-commit');
    });

    it('should detect regressions after establishing baseline', () => {
      const results = createMockParityResults({ logicDifferences: 0 });
      prevention.establishBaseline(results);
      
      const regressionResult = prevention.detectRegressions(results);
      
      expect(regressionResult.passed).toBe(true);
    });
  });
});

describe('EXIT_CODES', () => {
  it('should have correct values', () => {
    expect(EXIT_CODES.SUCCESS).toBe(0);
    expect(EXIT_CODES.REGRESSION_DETECTED).toBe(1);
    expect(EXIT_CODES.NO_BASELINE).toBe(2);
    expect(EXIT_CODES.EXECUTION_ERROR).toBe(3);
    expect(EXIT_CODES.TIMEOUT).toBe(4);
  });
});

/**
 * Tests for updated baseline generation with proper classification
 * Requirements: 6.1, 6.2
 */
describe('Baseline Generation with Proper Classification', () => {
  it('should include usesExtractedMessages flag', () => {
    const results = createMockParityResults();
    const baseline = establishBaseline(results, undefined, true);
    
    expect(baseline.usesExtractedMessages).toBe(true);
  });

  it('should default usesExtractedMessages to true', () => {
    const results = createMockParityResults();
    const baseline = establishBaseline(results);
    
    expect(baseline.usesExtractedMessages).toBe(true);
  });

  it('should include differenceBreakdown with separate counts', () => {
    const rngDiff = createMockDifference({ classification: 'RNG_DIFFERENCE' });
    const stateDiff = createMockDifference({ classification: 'STATE_DIVERGENCE' });
    const logicDiff = createMockDifference({ classification: 'LOGIC_DIFFERENCE' });
    
    const seedResults = new Map();
    seedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 97,
      differences: [rngDiff, stateDiff, logicDiff],
      parityPercentage: 97,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 99,
    });

    const results = createMockParityResults({
      totalDifferences: 3,
      rngDifferences: 1,
      stateDivergences: 1,
      logicDifferences: 1,
      seedResults,
    });

    const baseline = establishBaseline(results);
    
    expect(baseline.differenceBreakdown).toBeDefined();
    expect(baseline.differenceBreakdown?.rng).toBe(1);
    expect(baseline.differenceBreakdown?.state).toBe(1);
    expect(baseline.differenceBreakdown?.logic).toBe(1);
    expect(baseline.differenceBreakdown?.structural).toBe(0);
  });

  it('should use version 2.0.0 for new baselines', () => {
    const results = createMockParityResults();
    const baseline = establishBaseline(results);
    
    expect(baseline.version).toBe('2.0.0');
  });
});

/**
 * Tests for regression detection with RNG variance allowed
 * Requirements: 6.3, 6.4
 */
describe('Regression Detection with RNG Variance', () => {
  it('should pass when RNG differences vary from baseline', () => {
    // Create baseline with 3 RNG differences
    const rngDiffs = [
      createMockDifference({ command: 'hello', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'jump', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'wave', classification: 'RNG_DIFFERENCE' }),
    ];
    
    const baselineSeedResults = new Map();
    baselineSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 97,
      differences: rngDiffs,
      parityPercentage: 97,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 100,
    });

    const baselineResults = createMockParityResults({
      totalDifferences: 3,
      rngDifferences: 3,
      stateDivergences: 0,
      logicDifferences: 0,
      seedResults: baselineSeedResults,
    });
    const baseline = establishBaseline(baselineResults);

    // Create new results with 5 RNG differences (variance of +2)
    const newRngDiffs = [
      createMockDifference({ command: 'hello', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'jump', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'wave', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'push', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'pull', classification: 'RNG_DIFFERENCE' }),
    ];
    
    const newSeedResults = new Map();
    newSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 95,
      differences: newRngDiffs,
      parityPercentage: 95,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 100,
    });

    const newResults = createMockParityResults({
      totalDifferences: 5,
      rngDifferences: 5,
      stateDivergences: 0,
      logicDifferences: 0,
      seedResults: newSeedResults,
    });

    const result = detectRegressions(newResults, baseline);
    
    // Should pass because RNG variance is allowed
    expect(result.passed).toBe(true);
    expect(result.newLogicDifferences).toHaveLength(0);
  });

  it('should pass when state divergences vary from baseline', () => {
    // Create baseline with 2 state divergences
    const stateDiffs = [
      createMockDifference({ command: 'north', classification: 'STATE_DIVERGENCE' }),
      createMockDifference({ command: 'south', classification: 'STATE_DIVERGENCE' }),
    ];
    
    const baselineSeedResults = new Map();
    baselineSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 98,
      differences: stateDiffs,
      parityPercentage: 98,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 100,
    });

    const baselineResults = createMockParityResults({
      totalDifferences: 2,
      rngDifferences: 0,
      stateDivergences: 2,
      logicDifferences: 0,
      seedResults: baselineSeedResults,
    });
    const baseline = establishBaseline(baselineResults);

    // Create new results with 4 state divergences (variance of +2)
    const newStateDiffs = [
      createMockDifference({ command: 'north', classification: 'STATE_DIVERGENCE' }),
      createMockDifference({ command: 'south', classification: 'STATE_DIVERGENCE' }),
      createMockDifference({ command: 'east', classification: 'STATE_DIVERGENCE' }),
      createMockDifference({ command: 'west', classification: 'STATE_DIVERGENCE' }),
    ];
    
    const newSeedResults = new Map();
    newSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 96,
      differences: newStateDiffs,
      parityPercentage: 96,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 100,
    });

    const newResults = createMockParityResults({
      totalDifferences: 4,
      rngDifferences: 0,
      stateDivergences: 4,
      logicDifferences: 0,
      seedResults: newSeedResults,
    });

    const result = detectRegressions(newResults, baseline);
    
    // Should pass because state divergence variance is allowed
    expect(result.passed).toBe(true);
    expect(result.newLogicDifferences).toHaveLength(0);
  });

  it('should fail only on new logic differences', () => {
    // Create baseline with RNG differences but no logic differences
    const baselineDiffs = [
      createMockDifference({ command: 'hello', classification: 'RNG_DIFFERENCE' }),
    ];
    
    const baselineSeedResults = new Map();
    baselineSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 99,
      differences: baselineDiffs,
      parityPercentage: 99,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 100,
    });

    const baselineResults = createMockParityResults({
      totalDifferences: 1,
      rngDifferences: 1,
      stateDivergences: 0,
      logicDifferences: 0,
      seedResults: baselineSeedResults,
    });
    const baseline = establishBaseline(baselineResults);

    // Create new results with a new logic difference
    const newDiffs = [
      createMockDifference({ command: 'hello', classification: 'RNG_DIFFERENCE' }),
      createMockDifference({ command: 'new-cmd', classification: 'LOGIC_DIFFERENCE' }),
    ];
    
    const newSeedResults = new Map();
    newSeedResults.set(12345, {
      seed: 12345,
      totalCommands: 100,
      matchingResponses: 98,
      differences: newDiffs,
      parityPercentage: 98,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: 99,
    });

    const newResults = createMockParityResults({
      totalDifferences: 2,
      rngDifferences: 1,
      stateDivergences: 0,
      logicDifferences: 1,
      seedResults: newSeedResults,
    });

    const result = detectRegressions(newResults, baseline);
    
    // Should fail because of the new logic difference
    expect(result.passed).toBe(false);
    expect(result.newLogicDifferences).toHaveLength(1);
    expect(result.newLogicDifferences[0].command).toBe('new-cmd');
  });

  it('should include variance analysis in summary', () => {
    const baselineResults = createMockParityResults({
      rngDifferences: 3,
      stateDivergences: 2,
      logicDifferences: 0,
    });
    const baseline = establishBaseline(baselineResults);

    const newResults = createMockParityResults({
      rngDifferences: 5,
      stateDivergences: 1,
      logicDifferences: 0,
    });

    const result = detectRegressions(newResults, baseline);
    
    expect(result.summary).toContain('Variance Analysis');
    expect(result.summary).toContain('RNG variance');
    expect(result.summary).toContain('allowed');
    expect(result.summary).toContain('State variance');
  });

  it('should include note about RNG variance being allowed when passed', () => {
    const results = createMockParityResults({ logicDifferences: 0 });
    const baseline = establishBaseline(results);
    
    const result = detectRegressions(results, baseline);
    
    expect(result.summary).toContain('RNG and state divergence variance is expected and allowed');
  });
});
