/**
 * ProgressTrackingSystem Tests
 * 
 * Property 15: Progress Tracking Accuracy
 * Tests that progress tracking accurately records and reports improvements.
 * 
 * Requirements: 5.5, 6.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ProgressTrackingSystem,
  ProgressEntry,
  ProgressReport,
  TrendAnalysis
} from './ProgressTrackingSystem.js';

describe('ProgressTrackingSystem', () => {
  let system: ProgressTrackingSystem;

  beforeEach(() => {
    system = new ProgressTrackingSystem({
      progressFilePath: 'test-progress.json'
    });
    system.clearHistory();
  });

  describe('Property 15: Progress Tracking Accuracy', () => {
    describe('Progress Entry Tracking', () => {
      it('should track a new progress entry', () => {
        const entry = system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        expect(entry.timestamp).toBeDefined();
        expect(entry.parityPercentage).toBe(76.5);
        expect(entry.differenceCount).toBe(47);
      });

      it('should maintain history of entries', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        system.trackProgress({
          parityPercentage: 80,
          differenceCount: 40,
          categoryBreakdown: { timing: 28, objectBehavior: 10, parser: 2, other: 0 },
          seed: 12345
        });

        const history = system.getHistory();
        expect(history.length).toBe(2);
        expect(history[0].parityPercentage).toBe(76.5);
        expect(history[1].parityPercentage).toBe(80);
      });

      it('should include optional description and milestone', () => {
        const entry = system.trackProgress({
          parityPercentage: 80,
          differenceCount: 40,
          categoryBreakdown: { timing: 28, objectBehavior: 10, parser: 2, other: 0 },
          seed: 12345,
          description: 'Fixed timing issues',
          milestone: '80% achieved'
        });

        expect(entry.description).toBe('Fixed timing issues');
        expect(entry.milestone).toBe('80% achieved');
      });
    });

    describe('Progress Report Generation', () => {
      it('should generate empty report when no history', () => {
        const report = system.generateProgressReport();

        expect(report.startingParity).toBe(0);
        expect(report.currentParity).toBe(0);
        expect(report.totalImprovement).toBe(0);
        expect(report.history.length).toBe(0);
      });

      it('should calculate total improvement correctly', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        system.trackProgress({
          parityPercentage: 85,
          differenceCount: 30,
          categoryBreakdown: { timing: 20, objectBehavior: 8, parser: 2, other: 0 },
          seed: 12345
        });

        const report = system.generateProgressReport();

        expect(report.startingParity).toBe(76.5);
        expect(report.currentParity).toBe(85);
        expect(report.totalImprovement).toBe(8.5);
      });

      it('should calculate progress percentage toward target', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        system.trackProgress({
          parityPercentage: 85.75,
          differenceCount: 30,
          categoryBreakdown: { timing: 20, objectBehavior: 8, parser: 2, other: 0 },
          seed: 12345
        });

        const report = system.generateProgressReport();
        
        // Target is 95, started at 76.5, now at 85.75
        // Progress = (85.75 - 76.5) / (95 - 76.5) * 100 = 50%
        expect(report.progressPercentage).toBeCloseTo(50, 0);
      });
    });

    describe('Trend Analysis', () => {
      it('should identify improving trend', () => {
        const entries = [76.5, 78, 80, 82, 84];
        for (const parity of entries) {
          system.trackProgress({
            parityPercentage: parity,
            differenceCount: Math.round(200 - parity * 2),
            categoryBreakdown: { timing: 20, objectBehavior: 10, parser: 2, other: 0 },
            seed: 12345
          });
        }

        const trend = system.analyzeTrends();

        expect(trend.trend).toBe('improving');
        expect(trend.averageChange).toBeGreaterThan(0);
      });

      it('should identify declining trend', () => {
        const entries = [84, 82, 80, 78, 76];
        for (const parity of entries) {
          system.trackProgress({
            parityPercentage: parity,
            differenceCount: Math.round(200 - parity * 2),
            categoryBreakdown: { timing: 20, objectBehavior: 10, parser: 2, other: 0 },
            seed: 12345
          });
        }

        const trend = system.analyzeTrends();

        expect(trend.trend).toBe('declining');
        expect(trend.averageChange).toBeLessThan(0);
      });

      it('should identify stable trend', () => {
        const entries = [80, 80.1, 79.9, 80, 80.2];
        for (const parity of entries) {
          system.trackProgress({
            parityPercentage: parity,
            differenceCount: 40,
            categoryBreakdown: { timing: 20, objectBehavior: 10, parser: 2, other: 0 },
            seed: 12345
          });
        }

        const trend = system.analyzeTrends();

        expect(trend.trend).toBe('stable');
      });

      it('should project future parity when improving', () => {
        const entries = [76, 78, 80, 82, 84];
        for (const parity of entries) {
          system.trackProgress({
            parityPercentage: parity,
            differenceCount: Math.round(200 - parity * 2),
            categoryBreakdown: { timing: 20, objectBehavior: 10, parser: 2, other: 0 },
            seed: 12345
          });
        }

        const trend = system.analyzeTrends();

        expect(trend.projectedParity).toBeDefined();
        expect(trend.projectedParity!).toBeGreaterThan(84);
      });
    });

    describe('Milestone Tracking', () => {
      it('should track milestone achievement', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        let milestones = system.getMilestones();
        const milestone80 = milestones.find(m => m.name === '80% Parity');
        expect(milestone80?.achieved).toBe(false);

        system.trackProgress({
          parityPercentage: 80,
          differenceCount: 40,
          categoryBreakdown: { timing: 28, objectBehavior: 10, parser: 2, other: 0 },
          seed: 12345
        });

        milestones = system.getMilestones();
        const milestone80After = milestones.find(m => m.name === '80% Parity');
        expect(milestone80After?.achieved).toBe(true);
        expect(milestone80After?.achievedAt).toBeDefined();
      });

      it('should track multiple milestones', () => {
        system.trackProgress({
          parityPercentage: 91,
          differenceCount: 18,
          categoryBreakdown: { timing: 10, objectBehavior: 6, parser: 2, other: 0 },
          seed: 12345
        });

        const milestones = system.getMilestones();
        
        expect(milestones.find(m => m.name === '80% Parity')?.achieved).toBe(true);
        expect(milestones.find(m => m.name === '85% Parity')?.achieved).toBe(true);
        expect(milestones.find(m => m.name === '90% Parity')?.achieved).toBe(true);
        expect(milestones.find(m => m.name === '95% Target')?.achieved).toBe(false);
      });
    });

    describe('Category Progress', () => {
      it('should track category-specific progress', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        system.trackProgress({
          parityPercentage: 85,
          differenceCount: 30,
          categoryBreakdown: { timing: 20, objectBehavior: 8, parser: 2, other: 0 },
          seed: 12345
        });

        const report = system.generateProgressReport();

        expect(report.categoryProgress.timing.start).toBe(32);
        expect(report.categoryProgress.timing.current).toBe(20);
        expect(report.categoryProgress.objectBehavior.start).toBe(13);
        expect(report.categoryProgress.objectBehavior.current).toBe(8);
      });

      it('should calculate category progress percentage', () => {
        system.trackProgress({
          parityPercentage: 76.5,
          differenceCount: 47,
          categoryBreakdown: { timing: 32, objectBehavior: 13, parser: 2, other: 0 },
          seed: 12345
        });

        system.trackProgress({
          parityPercentage: 90,
          differenceCount: 20,
          categoryBreakdown: { timing: 10, objectBehavior: 8, parser: 2, other: 0 },
          seed: 12345
        });

        const report = system.generateProgressReport();

        // Timing: started at 32, now at 10, target is 5
        // Progress = (32 - 10) / (32 - 5) * 100 = 81.5%
        expect(report.categoryProgress.timing.progress).toBeGreaterThan(80);
      });
    });

    describe('Target Achievement', () => {
      it('should detect when target is achieved', () => {
        expect(system.isTargetAchieved()).toBe(false);

        system.trackProgress({
          parityPercentage: 95,
          differenceCount: 10,
          categoryBreakdown: { timing: 5, objectBehavior: 3, parser: 0, other: 2 },
          seed: 12345
        });

        expect(system.isTargetAchieved()).toBe(true);
      });

      it('should return current parity', () => {
        expect(system.getCurrentParity()).toBe(0);

        system.trackProgress({
          parityPercentage: 85,
          differenceCount: 30,
          categoryBreakdown: { timing: 20, objectBehavior: 8, parser: 2, other: 0 },
          seed: 12345
        });

        expect(system.getCurrentParity()).toBe(85);
      });
    });

    describe('Configuration', () => {
      it('should allow configuration updates', () => {
        system.updateConfig({ targetParity: 98 });
        
        const config = system.getConfig();
        expect(config.targetParity).toBe(98);
      });

      it('should use custom category targets', () => {
        const customSystem = new ProgressTrackingSystem({
          categoryTargets: { timing: 3, objectBehavior: 2, parser: 0 }
        });

        const config = customSystem.getConfig();
        expect(config.categoryTargets.timing).toBe(3);
        expect(config.categoryTargets.objectBehavior).toBe(2);
      });
    });
  });
});
