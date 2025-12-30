/**
 * RegressionPreventionSystem Tests
 * 
 * Property 13: Comprehensive Validation Coverage
 * Tests that fixes are validated without regressions across multiple command sequences.
 * 
 * Requirements: 5.3, 6.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  RegressionPreventionSystem, 
  ValidationResult,
  BaselineSnapshot,
  RegressionEvent
} from './RegressionPreventionSystem.js';
import { ParityBaselineSystem, RegressionCheck } from './ParityBaselineSystem.js';
import { DifferenceType } from '../spotTesting/types.js';

// Mock the ParityBaselineSystem
const createMockBaselineSystem = () => {
  return {
    establishBaseline: vi.fn(),
    validateChange: vi.fn(),
    trackProgress: vi.fn(),
    getBaseline: vi.fn(),
    getProgressHistory: vi.fn(),
    runMultiSeedValidation: vi.fn()
  };
};

describe('RegressionPreventionSystem', () => {
  let system: RegressionPreventionSystem;
  let mockBaselineSystem: ReturnType<typeof createMockBaselineSystem>;

  beforeEach(() => {
    mockBaselineSystem = createMockBaselineSystem();
    system = new RegressionPreventionSystem(
      { minimumParity: 76.5 },
      mockBaselineSystem as unknown as ParityBaselineSystem
    );
  });

  describe('Property 13: Comprehensive Validation Coverage', () => {
    describe('Baseline Establishment', () => {
      it('should establish baseline with correct snapshot', async () => {
        const mockBaseline = {
          timestamp: '2024-01-01T00:00:00.000Z',
          seed: 12345,
          parityPercentage: 76.5,
          totalCommands: 200,
          differenceCount: 47,
          differences: [
            { command: 'test', differenceType: DifferenceType.TIMING_DIFFERENCE }
          ],
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 }
        };

        mockBaselineSystem.establishBaseline.mockResolvedValue(mockBaseline);

        const snapshot = await system.establishBaseline(12345);

        expect(snapshot.parityPercentage).toBe(76.5);
        expect(snapshot.differenceCount).toBe(47);
        expect(snapshot.differencesByCategory.timing).toBe(32);
      });

      it('should create command signatures for comparison', async () => {
        const mockBaseline = {
          timestamp: '2024-01-01T00:00:00.000Z',
          seed: 12345,
          parityPercentage: 80,
          totalCommands: 200,
          differenceCount: 2,
          differences: [
            { command: 'take lamp', differenceType: DifferenceType.OBJECT_BEHAVIOR },
            { command: 'go north', differenceType: DifferenceType.TIMING_DIFFERENCE }
          ],
          categoryBreakdown: { timing: 1, objectBehavior: 1, parser: 0, other: 0 }
        };

        mockBaselineSystem.establishBaseline.mockResolvedValue(mockBaseline);

        const snapshot = await system.establishBaseline();

        expect(snapshot.commandSignatures.size).toBe(2);
        expect(snapshot.commandSignatures.has('take lamp:object_behavior')).toBe(true);
        expect(snapshot.commandSignatures.has('go north:timing_difference')).toBe(true);
      });
    });

    describe('Regression Detection', () => {
      it('should detect regression when parity decreases', async () => {
        const mockCheck: RegressionCheck = {
          hasRegression: true,
          currentParity: 70,
          baselineParity: 76.5,
          parityDelta: -6.5,
          newIssues: [{ command: 'new issue', differenceType: DifferenceType.PARSER_DIFFERENCE }],
          resolvedIssues: [],
          recommendation: 'rollback',
          message: 'CRITICAL: Parity dropped'
        };

        mockBaselineSystem.validateChange.mockResolvedValue(mockCheck);

        const result = await system.validateChange(12345);

        expect(result.hasRegression).toBe(true);
        expect(result.isValid).toBe(false);
        expect(result.recommendation).toBe('rollback');
      });

      it('should not detect regression when parity improves', async () => {
        const mockCheck: RegressionCheck = {
          hasRegression: false,
          currentParity: 85,
          baselineParity: 76.5,
          parityDelta: 8.5,
          newIssues: [],
          resolvedIssues: [{ command: 'fixed', differenceType: DifferenceType.TIMING_DIFFERENCE }],
          recommendation: 'proceed',
          message: 'Parity improved'
        };

        mockBaselineSystem.validateChange.mockResolvedValue(mockCheck);

        const result = await system.validateChange(12345);

        expect(result.hasRegression).toBe(false);
        expect(result.isValid).toBe(true);
        expect(result.recommendation).toBe('proceed');
      });

      it('should log regression events when detected', async () => {
        const mockCheck: RegressionCheck = {
          hasRegression: true,
          currentParity: 72,
          baselineParity: 76.5,
          parityDelta: -4.5,
          newIssues: [{ command: 'problem', differenceType: DifferenceType.OBJECT_BEHAVIOR }],
          resolvedIssues: [],
          recommendation: 'investigate',
          message: 'Minor regression'
        };

        mockBaselineSystem.validateChange.mockResolvedValue(mockCheck);

        await system.validateChange(12345, 'Test change');

        const events = system.getRegressionEvents();
        expect(events.length).toBe(1);
        expect(events[0].action).toBe('detected');
        expect(events[0].parityDrop).toBe(4.5);
      });
    });

    describe('Rollback Mechanism', () => {
      it('should recommend rollback for critical regression', async () => {
        const mockCheck: RegressionCheck = {
          hasRegression: true,
          currentParity: 65,
          baselineParity: 76.5,
          parityDelta: -11.5,
          newIssues: [],
          resolvedIssues: [],
          recommendation: 'rollback',
          message: 'CRITICAL'
        };

        const shouldRollback = system.rollbackIfRegression(mockCheck);

        expect(shouldRollback).toBe(true);
      });

      it('should not recommend rollback for minor changes', async () => {
        const mockCheck: RegressionCheck = {
          hasRegression: false,
          currentParity: 76,
          baselineParity: 76.5,
          parityDelta: -0.5,
          newIssues: [],
          resolvedIssues: [],
          recommendation: 'proceed',
          message: 'Minor change'
        };

        const shouldRollback = system.rollbackIfRegression(mockCheck);

        expect(shouldRollback).toBe(false);
      });
    });

    describe('Multi-Seed Validation', () => {
      it('should validate across multiple seeds', async () => {
        const mockChecks = [
          { hasRegression: false, currentParity: 78, baselineParity: 76.5, parityDelta: 1.5, newIssues: [], resolvedIssues: [], recommendation: 'proceed' as const, message: 'OK' },
          { hasRegression: false, currentParity: 77, baselineParity: 76.5, parityDelta: 0.5, newIssues: [], resolvedIssues: [], recommendation: 'proceed' as const, message: 'OK' },
          { hasRegression: false, currentParity: 79, baselineParity: 76.5, parityDelta: 2.5, newIssues: [], resolvedIssues: [], recommendation: 'proceed' as const, message: 'OK' }
        ];

        let callIndex = 0;
        mockBaselineSystem.validateChange.mockImplementation(() => {
          return Promise.resolve(mockChecks[callIndex++]);
        });

        const result = await system.runMultiSeedValidation();

        expect(result.allPassed).toBe(true);
        expect(result.averageParity).toBeCloseTo(78, 1);
        expect(result.worstParity).toBe(77);
      });

      it('should fail if any seed shows regression', async () => {
        const mockChecks = [
          { hasRegression: false, currentParity: 78, baselineParity: 76.5, parityDelta: 1.5, newIssues: [], resolvedIssues: [], recommendation: 'proceed' as const, message: 'OK' },
          { hasRegression: true, currentParity: 70, baselineParity: 76.5, parityDelta: -6.5, newIssues: [], resolvedIssues: [], recommendation: 'rollback' as const, message: 'FAIL' },
          { hasRegression: false, currentParity: 79, baselineParity: 76.5, parityDelta: 2.5, newIssues: [], resolvedIssues: [], recommendation: 'proceed' as const, message: 'OK' }
        ];

        let callIndex = 0;
        mockBaselineSystem.validateChange.mockImplementation(() => {
          return Promise.resolve(mockChecks[callIndex++]);
        });

        const result = await system.runMultiSeedValidation();

        expect(result.allPassed).toBe(false);
        expect(result.worstParity).toBe(70);
      });
    });

    describe('Severity Classification', () => {
      it('should classify no drop as none severity', () => {
        expect(system.getSeverityLevel(0)).toBe('none');
        expect(system.getSeverityLevel(-1)).toBe('none');
      });

      it('should classify small drops as none severity', () => {
        expect(system.getSeverityLevel(1)).toBe('none');
        expect(system.getSeverityLevel(1.9)).toBe('none');
      });

      it('should classify medium drops as warning severity', () => {
        expect(system.getSeverityLevel(2)).toBe('warning');
        expect(system.getSeverityLevel(4)).toBe('warning');
      });

      it('should classify large drops as critical severity', () => {
        expect(system.getSeverityLevel(5)).toBe('critical');
        expect(system.getSeverityLevel(10)).toBe('critical');
      });
    });

    describe('Minimum Parity Check', () => {
      it('should correctly check if parity is above minimum', () => {
        expect(system.isAboveMinimum(76.5)).toBe(true);
        expect(system.isAboveMinimum(80)).toBe(true);
        expect(system.isAboveMinimum(76.4)).toBe(false);
        expect(system.isAboveMinimum(70)).toBe(false);
      });
    });

    describe('Configuration', () => {
      it('should allow configuration updates', () => {
        system.updateConfig({ minimumParity: 80 });
        
        const config = system.getConfig();
        expect(config.minimumParity).toBe(80);
      });

      it('should use default configuration values', () => {
        const config = system.getConfig();
        
        expect(config.warningThreshold).toBe(2);
        expect(config.criticalThreshold).toBe(5);
        expect(config.autoRollback).toBe(false);
      });
    });
  });
});
