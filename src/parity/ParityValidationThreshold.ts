/**
 * ParityValidationThreshold - Enforces parity threshold requirements
 * 
 * This module provides validation functions to ensure the TypeScript
 * implementation maintains the required parity level with Z-Machine.
 * 
 * Requirements: 9.4, 9.5
 */

/**
 * Default parity threshold (99%)
 * The TypeScript implementation must achieve at least this parity level
 */
export const DEFAULT_PARITY_THRESHOLD = 99;

/**
 * Minimum acceptable parity threshold (95%)
 * Below this level, the implementation is considered significantly broken
 */
export const MINIMUM_PARITY_THRESHOLD = 95;

/**
 * Result of parity validation
 */
export interface ParityValidationResult {
  /** Whether the parity threshold was met */
  passed: boolean;
  /** The actual parity percentage achieved */
  actualParity: number;
  /** The required parity threshold */
  requiredThreshold: number;
  /** Difference between actual and required */
  parityGap: number;
  /** Human-readable message */
  message: string;
  /** Severity level */
  severity: 'pass' | 'warning' | 'fail' | 'critical';
}

/**
 * Result of regression detection
 */
export interface RegressionDetectionResult {
  /** Whether a regression was detected */
  hasRegression: boolean;
  /** The previous parity percentage */
  previousParity: number;
  /** The current parity percentage */
  currentParity: number;
  /** The change in parity (negative = regression) */
  parityChange: number;
  /** Human-readable message */
  message: string;
  /** Severity of the regression */
  severity: 'none' | 'minor' | 'major' | 'critical';
}

/**
 * Parity history entry for tracking changes over time
 */
export interface ParityHistoryEntry {
  /** Timestamp of the measurement */
  timestamp: Date;
  /** Parity percentage achieved */
  parity: number;
  /** Seed used for the test */
  seed: number;
  /** Number of commands tested */
  commandCount: number;
  /** Git commit hash (if available) */
  commitHash?: string;
}

/**
 * Validate that parity meets the required threshold
 * 
 * Requirement 9.5: Fail tests if parity < 99% on any seed
 * 
 * @param actualParity - The actual parity percentage achieved
 * @param threshold - The required threshold (default: 99%)
 * @returns Validation result
 */
export function validateParityThreshold(
  actualParity: number,
  threshold: number = DEFAULT_PARITY_THRESHOLD
): ParityValidationResult {
  const passed = actualParity >= threshold;
  const parityGap = threshold - actualParity;
  
  let severity: ParityValidationResult['severity'];
  let message: string;
  
  if (passed) {
    severity = 'pass';
    message = `Parity threshold met: ${actualParity.toFixed(1)}% >= ${threshold}%`;
  } else if (actualParity >= MINIMUM_PARITY_THRESHOLD) {
    severity = 'warning';
    message = `Parity below threshold: ${actualParity.toFixed(1)}% < ${threshold}% (gap: ${parityGap.toFixed(1)}%)`;
  } else if (actualParity >= 80) {
    severity = 'fail';
    message = `Parity significantly below threshold: ${actualParity.toFixed(1)}% < ${threshold}% (gap: ${parityGap.toFixed(1)}%)`;
  } else {
    severity = 'critical';
    message = `Critical parity failure: ${actualParity.toFixed(1)}% < ${threshold}% (gap: ${parityGap.toFixed(1)}%)`;
  }
  
  return {
    passed,
    actualParity,
    requiredThreshold: threshold,
    parityGap: passed ? 0 : parityGap,
    message,
    severity
  };
}

/**
 * Detect regression in parity between two measurements
 * 
 * Requirement 9.4: Compare before/after parity for changes
 * 
 * @param previousParity - The previous parity percentage
 * @param currentParity - The current parity percentage
 * @returns Regression detection result
 */
export function detectRegression(
  previousParity: number,
  currentParity: number
): RegressionDetectionResult {
  const parityChange = currentParity - previousParity;
  const hasRegression = parityChange < 0;
  
  let severity: RegressionDetectionResult['severity'];
  let message: string;
  
  if (!hasRegression) {
    severity = 'none';
    if (parityChange > 0) {
      message = `Parity improved: ${previousParity.toFixed(1)}% -> ${currentParity.toFixed(1)}% (+${parityChange.toFixed(1)}%)`;
    } else {
      message = `Parity unchanged: ${currentParity.toFixed(1)}%`;
    }
  } else if (Math.abs(parityChange) < 1) {
    severity = 'minor';
    message = `Minor parity regression: ${previousParity.toFixed(1)}% -> ${currentParity.toFixed(1)}% (${parityChange.toFixed(1)}%)`;
  } else if (Math.abs(parityChange) < 5) {
    severity = 'major';
    message = `Major parity regression: ${previousParity.toFixed(1)}% -> ${currentParity.toFixed(1)}% (${parityChange.toFixed(1)}%)`;
  } else {
    severity = 'critical';
    message = `Critical parity regression: ${previousParity.toFixed(1)}% -> ${currentParity.toFixed(1)}% (${parityChange.toFixed(1)}%)`;
  }
  
  return {
    hasRegression,
    previousParity,
    currentParity,
    parityChange,
    message,
    severity
  };
}
