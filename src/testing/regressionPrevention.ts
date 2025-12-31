/**
 * RegressionPrevention - Baseline establishment and regression detection for parity validation
 * 
 * This module provides functionality to:
 * 1. Establish a baseline of expected differences (all RNG-related)
 * 2. Detect new logic differences that indicate regressions
 * 3. Support CI/CD integration with appropriate exit codes
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { ClassifiedDifference, DifferenceType } from './differenceClassifier.js';
import { ParityResults } from './exhaustiveParityValidator.js';

/**
 * Baseline entry for a single difference
 */
export interface BaselineDifference {
  /** Command that produced the difference */
  command: string;
  /** Classification of the difference */
  classification: DifferenceType;
  /** Reason for the classification */
  reason: string;
  /** Hash of the difference for comparison */
  hash: string;
}

/**
 * Baseline data structure stored in JSON
 * Requirements: 4.1
 */
export interface ParityBaseline {
  /** Version of the baseline format */
  version: string;
  /** Timestamp when baseline was created */
  createdAt: string;
  /** Git commit hash if available */
  commitHash?: string;
  /** Total number of differences in baseline */
  totalDifferences: number;
  /** Count by classification type */
  classificationCounts: Record<DifferenceType, number>;
  /** Seeds used to generate baseline */
  seeds: number[];
  /** Commands per seed used */
  commandsPerSeed: number;
  /** Individual baseline differences */
  differences: BaselineDifference[];
  /** Summary statistics */
  summary: {
    rngDifferences: number;
    stateDivergences: number;
    logicDifferences: number;
    overallParityPercentage: number;
  };
}

/**
 * Result of regression detection
 * Requirements: 4.2
 */
export interface RegressionResult {
  /** Whether the test passed (no new logic differences) */
  passed: boolean;
  /** New logic differences detected */
  newLogicDifferences: ClassifiedDifference[];
  /** Total differences in current run */
  currentDifferences: number;
  /** Total differences in baseline */
  baselineDifferences: number;
  /** Detailed error message if failed */
  errorMessage?: string;
  /** Summary of the comparison */
  summary: string;
}

/**
 * Default baseline file path
 */
export const DEFAULT_BASELINE_PATH = 'src/testing/parity-baseline.json';

/**
 * Current baseline format version
 */
export const BASELINE_VERSION = '1.0.0';

/**
 * Generate a hash for a difference to enable comparison
 */
export function hashDifference(diff: ClassifiedDifference): string {
  // Create a deterministic hash based on command and classification
  // We don't include outputs as they may vary slightly
  const content = `${diff.command}:${diff.classification}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Create a baseline difference entry from a classified difference
 */
export function createBaselineDifference(diff: ClassifiedDifference): BaselineDifference {
  return {
    command: diff.command,
    classification: diff.classification,
    reason: diff.reason,
    hash: hashDifference(diff),
  };
}

/**
 * Establish a baseline from parity results
 * Requirements: 4.1
 * 
 * @param results - Parity results to create baseline from
 * @param commitHash - Optional git commit hash
 * @returns The created baseline
 */
export function establishBaseline(
  results: ParityResults,
  commitHash?: string
): ParityBaseline {
  const allDifferences: BaselineDifference[] = [];
  
  // Collect all differences from all seeds
  for (const [, seedResult] of results.seedResults) {
    for (const diff of seedResult.differences) {
      allDifferences.push(createBaselineDifference(diff));
    }
  }

  // Get seeds from results
  const seeds = Array.from(results.seedResults.keys());

  return {
    version: BASELINE_VERSION,
    createdAt: new Date().toISOString(),
    commitHash,
    totalDifferences: results.totalDifferences,
    classificationCounts: {
      'RNG_DIFFERENCE': results.rngDifferences,
      'STATE_DIVERGENCE': results.stateDivergences,
      'LOGIC_DIFFERENCE': results.logicDifferences,
    },
    seeds,
    commandsPerSeed: 250, // Default from config
    differences: allDifferences,
    summary: {
      rngDifferences: results.rngDifferences,
      stateDivergences: results.stateDivergences,
      logicDifferences: results.logicDifferences,
      overallParityPercentage: results.overallParityPercentage,
    },
  };
}

/**
 * Save baseline to a JSON file
 * Requirements: 4.1
 * 
 * @param baseline - Baseline to save
 * @param filePath - Path to save to (defaults to DEFAULT_BASELINE_PATH)
 */
export function saveBaseline(
  baseline: ParityBaseline,
  filePath: string = DEFAULT_BASELINE_PATH
): void {
  const json = JSON.stringify(baseline, null, 2);
  writeFileSync(filePath, json, 'utf-8');
}

/**
 * Load baseline from a JSON file
 * Requirements: 4.1
 * 
 * @param filePath - Path to load from (defaults to DEFAULT_BASELINE_PATH)
 * @returns The loaded baseline, or null if file doesn't exist
 */
export function loadBaseline(
  filePath: string = DEFAULT_BASELINE_PATH
): ParityBaseline | null {
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const json = readFileSync(filePath, 'utf-8');
    return JSON.parse(json) as ParityBaseline;
  } catch {
    return null;
  }
}

/**
 * Check if a baseline exists
 * 
 * @param filePath - Path to check (defaults to DEFAULT_BASELINE_PATH)
 * @returns True if baseline file exists
 */
export function baselineExists(filePath: string = DEFAULT_BASELINE_PATH): boolean {
  return existsSync(filePath);
}



/**
 * Detect regressions by comparing current results against baseline
 * Requirements: 4.2
 * 
 * @param results - Current parity results
 * @param baseline - Baseline to compare against
 * @returns Regression detection result
 */
export function detectRegressions(
  results: ParityResults,
  baseline: ParityBaseline
): RegressionResult {
  const newLogicDifferences: ClassifiedDifference[] = [];
  
  // Collect all current logic differences
  for (const [, seedResult] of results.seedResults) {
    for (const diff of seedResult.differences) {
      if (diff.classification === 'LOGIC_DIFFERENCE') {
        // Check if this is a new logic difference not in baseline
        const hash = hashDifference(diff);
        const inBaseline = baseline.differences.some(
          bd => bd.hash === hash && bd.classification === 'LOGIC_DIFFERENCE'
        );
        
        if (!inBaseline) {
          newLogicDifferences.push(diff);
        }
      }
    }
  }

  const passed = newLogicDifferences.length === 0;
  
  let errorMessage: string | undefined;
  if (!passed) {
    errorMessage = formatRegressionError(newLogicDifferences);
  }

  const summary = generateRegressionSummary(
    results,
    baseline,
    newLogicDifferences,
    passed
  );

  return {
    passed,
    newLogicDifferences,
    currentDifferences: results.totalDifferences,
    baselineDifferences: baseline.totalDifferences,
    errorMessage,
    summary,
  };
}

/**
 * Format a clear error message for regression failures
 * Requirements: 4.2
 */
function formatRegressionError(newDifferences: ClassifiedDifference[]): string {
  const lines: string[] = [
    '='.repeat(60),
    'PARITY REGRESSION DETECTED',
    '='.repeat(60),
    '',
    `Found ${newDifferences.length} new logic difference(s) not in baseline:`,
    '',
  ];

  for (let i = 0; i < newDifferences.length; i++) {
    const diff = newDifferences[i];
    lines.push(`--- Difference ${i + 1} ---`);
    lines.push(`Command: ${diff.command}`);
    lines.push(`Command Index: ${diff.commandIndex}`);
    lines.push(`Classification: ${diff.classification}`);
    lines.push(`Reason: ${diff.reason}`);
    lines.push('');
    lines.push('TypeScript Output:');
    lines.push(diff.tsOutput.substring(0, 200) + (diff.tsOutput.length > 200 ? '...' : ''));
    lines.push('');
    lines.push('Z-Machine Output:');
    lines.push(diff.zmOutput.substring(0, 200) + (diff.zmOutput.length > 200 ? '...' : ''));
    lines.push('');
  }

  lines.push('='.repeat(60));
  lines.push('ACTION REQUIRED: Fix the logic differences or update the baseline');
  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Generate a summary of the regression comparison
 */
function generateRegressionSummary(
  results: ParityResults,
  baseline: ParityBaseline,
  newLogicDifferences: ClassifiedDifference[],
  passed: boolean
): string {
  const lines: string[] = [
    'Regression Detection Summary',
    '============================',
    '',
    `Baseline created: ${baseline.createdAt}`,
    `Baseline commit: ${baseline.commitHash || 'N/A'}`,
    '',
    'Baseline Statistics:',
    `  - Total differences: ${baseline.totalDifferences}`,
    `  - RNG differences: ${baseline.summary.rngDifferences}`,
    `  - State divergences: ${baseline.summary.stateDivergences}`,
    `  - Logic differences: ${baseline.summary.logicDifferences}`,
    '',
    'Current Run Statistics:',
    `  - Total differences: ${results.totalDifferences}`,
    `  - RNG differences: ${results.rngDifferences}`,
    `  - State divergences: ${results.stateDivergences}`,
    `  - Logic differences: ${results.logicDifferences}`,
    '',
    `New logic differences: ${newLogicDifferences.length}`,
    '',
    `Status: ${passed ? 'PASSED ✓' : 'FAILED ✗'}`,
  ];

  return lines.join('\n');
}

/**
 * Run parity validation with regression detection
 * Requirements: 4.2, 4.3
 * 
 * @param results - Parity results to validate
 * @param baselinePath - Path to baseline file
 * @returns Regression result
 */
export function validateAgainstBaseline(
  results: ParityResults,
  baselinePath: string = DEFAULT_BASELINE_PATH
): RegressionResult {
  const baseline = loadBaseline(baselinePath);
  
  if (!baseline) {
    // No baseline exists - check if there are any logic differences
    const hasLogicDifferences = results.logicDifferences > 0;
    
    return {
      passed: !hasLogicDifferences,
      newLogicDifferences: hasLogicDifferences 
        ? collectLogicDifferences(results)
        : [],
      currentDifferences: results.totalDifferences,
      baselineDifferences: 0,
      errorMessage: hasLogicDifferences 
        ? 'No baseline exists and logic differences were found'
        : undefined,
      summary: 'No baseline exists. Run with --establish-baseline to create one.',
    };
  }

  return detectRegressions(results, baseline);
}

/**
 * Collect all logic differences from results
 */
function collectLogicDifferences(results: ParityResults): ClassifiedDifference[] {
  const logicDiffs: ClassifiedDifference[] = [];
  
  for (const [, seedResult] of results.seedResults) {
    for (const diff of seedResult.differences) {
      if (diff.classification === 'LOGIC_DIFFERENCE') {
        logicDiffs.push(diff);
      }
    }
  }
  
  return logicDiffs;
}

/**
 * CI/CD exit codes
 * Requirements: 4.3
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  REGRESSION_DETECTED: 1,
  NO_BASELINE: 2,
  EXECUTION_ERROR: 3,
  TIMEOUT: 4,
} as const;

/**
 * Get appropriate exit code for a regression result
 * Requirements: 4.3
 */
export function getExitCode(result: RegressionResult, baselineExists: boolean): number {
  if (result.passed) {
    return EXIT_CODES.SUCCESS;
  }
  
  if (!baselineExists && result.newLogicDifferences.length === 0) {
    return EXIT_CODES.NO_BASELINE;
  }
  
  return EXIT_CODES.REGRESSION_DETECTED;
}

/**
 * RegressionPrevention class for stateful regression detection
 */
export class RegressionPrevention {
  private baselinePath: string;
  private baseline: ParityBaseline | null = null;

  constructor(baselinePath: string = DEFAULT_BASELINE_PATH) {
    this.baselinePath = baselinePath;
  }

  /**
   * Load the baseline from disk
   */
  loadBaseline(): ParityBaseline | null {
    this.baseline = loadBaseline(this.baselinePath);
    return this.baseline;
  }

  /**
   * Check if baseline exists
   */
  hasBaseline(): boolean {
    return baselineExists(this.baselinePath);
  }

  /**
   * Establish a new baseline from results
   * Requirements: 4.1
   */
  establishBaseline(results: ParityResults, commitHash?: string): ParityBaseline {
    this.baseline = establishBaseline(results, commitHash);
    saveBaseline(this.baseline, this.baselinePath);
    return this.baseline;
  }

  /**
   * Detect regressions against the loaded baseline
   * Requirements: 4.2
   */
  detectRegressions(results: ParityResults): RegressionResult {
    if (!this.baseline) {
      this.loadBaseline();
    }
    
    return validateAgainstBaseline(results, this.baselinePath);
  }

  /**
   * Get the current baseline
   */
  getBaseline(): ParityBaseline | null {
    return this.baseline;
  }

  /**
   * Get the baseline path
   */
  getBaselinePath(): string {
    return this.baselinePath;
  }
}

/**
 * Factory function to create a RegressionPrevention instance
 */
export function createRegressionPrevention(
  baselinePath?: string
): RegressionPrevention {
  return new RegressionPrevention(baselinePath);
}
