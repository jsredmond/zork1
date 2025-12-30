/**
 * Property-based tests for ParityValidationThreshold
 * 
 * Property 10: Parity Validation Threshold
 * Validates: Requirements 9.4, 9.5
 */

import { describe, it, expect } from 'vitest';
import {
  validateParityThreshold,
  detectRegression,
  DEFAULT_PARITY_THRESHOLD,
  MINIMUM_PARITY_THRESHOLD
} from './ParityValidationThreshold';

describe('ParityValidationThreshold Property Tests', () => {
  /**
   * Property 10.1: Threshold validation is deterministic
   * For any given parity value and threshold, the result should always be the same
   */
  describe('Property 10.1: Deterministic threshold validation', () => {
    it('should produce consistent results for the same inputs', () => {
      const testCases = [0, 25, 50, 75, 80, 90, 95, 99, 100];
      
      for (const parity of testCases) {
        const result1 = validateParityThreshold(parity);
        const result2 = validateParityThreshold(parity);
        
        expect(result1.passed).toBe(result2.passed);
        expect(result1.actualParity).toBe(result2.actualParity);
        expect(result1.severity).toBe(result2.severity);
      }
    });
  });

  /**
   * Property 10.2: Parity >= threshold always passes
   * Requirement 9.5: Fail tests if parity < 99% on any seed
   */
  describe('Property 10.2: Threshold boundary behavior', () => {
    it('should pass when parity equals threshold', () => {
      const result = validateParityThreshold(99, 99);
      expect(result.passed).toBe(true);
      expect(result.severity).toBe('pass');
    });

    it('should pass when parity exceeds threshold', () => {
      const result = validateParityThreshold(100, 99);
      expect(result.passed).toBe(true);
      expect(result.severity).toBe('pass');
    });

    it('should fail when parity is below threshold', () => {
      const result = validateParityThreshold(98.9, 99);
      expect(result.passed).toBe(false);
      expect(result.severity).not.toBe('pass');
    });
  });

  /**
   * Property 10.3: Severity levels are correctly assigned
   */
  describe('Property 10.3: Severity level assignment', () => {
    it('should assign "pass" for parity >= threshold', () => {
      expect(validateParityThreshold(99, 99).severity).toBe('pass');
      expect(validateParityThreshold(100, 99).severity).toBe('pass');
    });

    it('should assign "warning" for parity >= MINIMUM but < threshold', () => {
      const result = validateParityThreshold(96, 99);
      expect(result.severity).toBe('warning');
    });

    it('should assign "fail" for parity >= 80 but < MINIMUM', () => {
      const result = validateParityThreshold(85, 99);
      expect(result.severity).toBe('fail');
    });

    it('should assign "critical" for parity < 80', () => {
      const result = validateParityThreshold(70, 99);
      expect(result.severity).toBe('critical');
    });
  });

  /**
   * Property 10.4: Parity gap is correctly calculated
   */
  describe('Property 10.4: Parity gap calculation', () => {
    it('should have zero gap when passed', () => {
      const result = validateParityThreshold(100, 99);
      expect(result.parityGap).toBe(0);
    });

    it('should correctly calculate gap when failed', () => {
      const result = validateParityThreshold(90, 99);
      expect(result.parityGap).toBeCloseTo(9, 1);
    });
  });

  /**
   * Property 10.5: Regression detection is deterministic
   * Requirement 9.4: Compare before/after parity for changes
   */
  describe('Property 10.5: Deterministic regression detection', () => {
    it('should produce consistent results for the same inputs', () => {
      const testCases = [
        { prev: 95, curr: 90 },
        { prev: 90, curr: 95 },
        { prev: 95, curr: 95 }
      ];
      
      for (const { prev, curr } of testCases) {
        const result1 = detectRegression(prev, curr);
        const result2 = detectRegression(prev, curr);
        
        expect(result1.hasRegression).toBe(result2.hasRegression);
        expect(result1.parityChange).toBe(result2.parityChange);
        expect(result1.severity).toBe(result2.severity);
      }
    });
  });

  /**
   * Property 10.6: Regression detection correctly identifies direction
   */
  describe('Property 10.6: Regression direction detection', () => {
    it('should detect regression when parity decreases', () => {
      const result = detectRegression(95, 90);
      expect(result.hasRegression).toBe(true);
      expect(result.parityChange).toBe(-5);
    });

    it('should not detect regression when parity increases', () => {
      const result = detectRegression(90, 95);
      expect(result.hasRegression).toBe(false);
      expect(result.parityChange).toBe(5);
    });

    it('should not detect regression when parity unchanged', () => {
      const result = detectRegression(95, 95);
      expect(result.hasRegression).toBe(false);
      expect(result.parityChange).toBe(0);
    });
  });

  /**
   * Property 10.7: Regression severity levels are correctly assigned
   */
  describe('Property 10.7: Regression severity levels', () => {
    it('should assign "none" for no regression', () => {
      expect(detectRegression(90, 95).severity).toBe('none');
      expect(detectRegression(95, 95).severity).toBe('none');
    });

    it('should assign "minor" for regression < 1%', () => {
      const result = detectRegression(95, 94.5);
      expect(result.severity).toBe('minor');
    });

    it('should assign "major" for regression 1-5%', () => {
      const result = detectRegression(95, 92);
      expect(result.severity).toBe('major');
    });

    it('should assign "critical" for regression >= 5%', () => {
      const result = detectRegression(95, 85);
      expect(result.severity).toBe('critical');
    });
  });

  /**
   * Property 10.8: Constants are correctly defined
   */
  describe('Property 10.8: Constant values', () => {
    it('should have DEFAULT_PARITY_THRESHOLD of 99', () => {
      expect(DEFAULT_PARITY_THRESHOLD).toBe(99);
    });

    it('should have MINIMUM_PARITY_THRESHOLD of 95', () => {
      expect(MINIMUM_PARITY_THRESHOLD).toBe(95);
    });

    it('should have MINIMUM < DEFAULT', () => {
      expect(MINIMUM_PARITY_THRESHOLD).toBeLessThan(DEFAULT_PARITY_THRESHOLD);
    });
  });
});
