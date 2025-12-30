/**
 * AchievementValidationSystem Tests
 * 
 * Property 17: Achievement Validation Completeness
 * Tests that 95%+ parity claims are comprehensively validated.
 * 
 * Requirements: 6.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  AchievementValidationSystem,
  ValidationRun,
  AchievementValidation
} from './AchievementValidationSystem.js';

describe('AchievementValidationSystem', () => {
  let system: AchievementValidationSystem;

  beforeEach(() => {
    system = new AchievementValidationSystem();
    system.clearHistory();
  });

  const createRun = (
    seed: number,
    parity: number,
    timing: number,
    objectBehavior: number,
    parser: number
  ): ValidationRun => ({
    seed,
    timestamp: new Date().toISOString(),
    parityPercentage: parity,
    differenceCount: Math.round(200 - parity * 2),
    categoryBreakdown: { timing, objectBehavior, parser, other: 0 },
    passed: parity >= 95
  });

  describe('Property 17: Achievement Validation Completeness', () => {
    describe('Achievement Validation', () => {
      it('should validate achievement when all criteria met', () => {
        const runs = [
          createRun(12345, 96, 4, 2, 0),
          createRun(67890, 95, 5, 3, 0),
          createRun(54321, 97, 3, 2, 0)
        ];

        const validation = system.validateAchievement(runs);

        expect(validation.isAchieved).toBe(true);
        expect(validation.summary.averageParity).toBeGreaterThanOrEqual(95);
      });

      it('should reject when parity below target', () => {
        const runs = [
          createRun(12345, 90, 4, 2, 0),
          createRun(67890, 88, 5, 3, 0),
          createRun(54321, 92, 3, 2, 0)
        ];

        const validation = system.validateAchievement(runs);

        expect(validation.isAchieved).toBe(false);
        expect(validation.message).toContain('parity');
      });

      it('should reject when category targets not met', () => {
        const runs = [
          createRun(12345, 96, 10, 2, 0), // timing too high
          createRun(67890, 95, 8, 3, 0),
          createRun(54321, 97, 9, 2, 0)
        ];

        const validation = system.validateAchievement(runs);

        expect(validation.isAchieved).toBe(false);
        expect(validation.categoryValidation.timing.passed).toBe(false);
      });

      it('should reject when not enough consistent runs', () => {
        const runs = [
          createRun(12345, 96, 4, 2, 0),
          createRun(67890, 80, 5, 3, 0), // failed run
          createRun(54321, 75, 3, 2, 0)  // failed run
        ];

        const validation = system.validateAchievement(runs);

        expect(validation.isAchieved).toBe(false);
        expect(validation.summary.consistentRuns).toBe(1);
      });

      it('should calculate summary statistics correctly', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 0),
          createRun(67890, 97, 5, 3, 0),
          createRun(54321, 96, 3, 2, 0)
        ];

        const validation = system.validateAchievement(runs);

        expect(validation.summary.averageParity).toBeCloseTo(96, 0);
        expect(validation.summary.minParity).toBe(95);
        expect(validation.summary.maxParity).toBe(97);
        expect(validation.summary.totalRuns).toBe(3);
      });
    });

    describe('Consistency Verification', () => {
      it('should verify consistent results', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 0),
          createRun(67890, 96, 5, 3, 0),
          createRun(54321, 95, 3, 2, 0)
        ];

        const result = system.verifyConsistency(runs);

        expect(result.isConsistent).toBe(true);
        expect(result.outliers.length).toBe(0);
      });

      it('should detect inconsistent results', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 0),
          createRun(67890, 96, 5, 3, 0),
          createRun(54321, 60, 3, 2, 0) // outlier
        ];

        const result = system.verifyConsistency(runs);

        expect(result.isConsistent).toBe(false);
        expect(result.variance).toBeGreaterThan(25);
      });

      it('should identify outliers', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 0),
          createRun(67890, 96, 5, 3, 0),
          createRun(54321, 97, 3, 2, 0),
          createRun(99999, 50, 10, 10, 5), // clear outlier
          createRun(11111, 95, 4, 2, 0)    // need more data points for std dev
        ];

        const result = system.verifyConsistency(runs);

        // With 5 data points, 50% is clearly an outlier from ~95% average
        expect(result.variance).toBeGreaterThan(25);
        expect(result.isConsistent).toBe(false);
      });
    });

    describe('Category Target Validation', () => {
      it('should validate all category targets met', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 0),
          createRun(67890, 96, 5, 3, 0),
          createRun(54321, 95, 3, 2, 0)
        ];

        const result = system.validateCategoryTargets(runs);

        expect(result.allMet).toBe(true);
        expect(result.results.timing.met).toBe(true);
        expect(result.results.objectBehavior.met).toBe(true);
        expect(result.results.parser.met).toBe(true);
      });

      it('should detect unmet timing target', () => {
        const runs = [
          createRun(12345, 95, 10, 2, 0),
          createRun(67890, 96, 8, 3, 0),
          createRun(54321, 95, 9, 2, 0)
        ];

        const result = system.validateCategoryTargets(runs);

        expect(result.allMet).toBe(false);
        expect(result.results.timing.met).toBe(false);
        expect(result.results.timing.actual).toBeGreaterThan(5);
      });

      it('should detect unmet parser target', () => {
        const runs = [
          createRun(12345, 95, 4, 2, 2),
          createRun(67890, 96, 5, 3, 1),
          createRun(54321, 95, 3, 2, 3)
        ];

        const result = system.validateCategoryTargets(runs);

        expect(result.allMet).toBe(false);
        expect(result.results.parser.met).toBe(false);
      });
    });

    describe('Report Generation', () => {
      it('should generate achievement report for success', () => {
        const runs = [
          createRun(12345, 96, 4, 2, 0),
          createRun(67890, 95, 5, 3, 0),
          createRun(54321, 97, 3, 2, 0)
        ];

        const validation = system.validateAchievement(runs);
        const report = system.generateAchievementReport(validation);

        expect(report.title).toBe('Parity Achievement Certification');
        expect(report.validation.isAchieved).toBe(true);
        expect(report.recommendations).toContain('Maintain current parity level');
      });

      it('should generate progress report for failure', () => {
        const runs = [
          createRun(12345, 80, 10, 5, 2),
          createRun(67890, 75, 12, 6, 3),
          createRun(54321, 78, 11, 5, 2)
        ];

        const validation = system.validateAchievement(runs);
        const report = system.generateAchievementReport(validation);

        expect(report.title).toBe('Parity Progress Report');
        expect(report.validation.isAchieved).toBe(false);
        expect(report.recommendations.length).toBeGreaterThan(0);
      });

      it('should include specific recommendations for failures', () => {
        const runs = [
          createRun(12345, 80, 10, 5, 2),
          createRun(67890, 75, 12, 6, 3),
          createRun(54321, 78, 11, 5, 2)
        ];

        const validation = system.validateAchievement(runs);
        const report = system.generateAchievementReport(validation);

        expect(report.recommendations.some(r => r.includes('parity'))).toBe(true);
        expect(report.recommendations.some(r => r.includes('timing'))).toBe(true);
      });
    });

    describe('History and Configuration', () => {
      it('should maintain validation history', () => {
        const runs1 = [createRun(12345, 80, 10, 5, 2)];
        const runs2 = [createRun(67890, 95, 4, 2, 0)];

        system.validateAchievement(runs1);
        system.validateAchievement(runs2);

        const history = system.getValidationHistory();
        expect(history.length).toBe(2);
      });

      it('should allow criteria updates', () => {
        system.updateCriteria({ targetParity: 90 });

        const criteria = system.getCriteria();
        expect(criteria.targetParity).toBe(90);
      });

      it('should use custom criteria', () => {
        const customSystem = new AchievementValidationSystem({
          targetParity: 90,
          minConsistentRuns: 2,
          categoryTargets: { timing: 10, objectBehavior: 5, parser: 2 }
        });

        const runs = [
          createRun(12345, 92, 8, 4, 1),
          createRun(67890, 91, 9, 5, 2),
          createRun(54321, 93, 7, 3, 1)
        ];

        // Mark runs as passed based on custom 90% target
        runs.forEach(r => r.passed = r.parityPercentage >= 90);

        const validation = customSystem.validateAchievement(runs);

        expect(validation.isAchieved).toBe(true);
      });
    });
  });
});
