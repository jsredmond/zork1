/**
 * SystematicFixValidation Tests
 * 
 * Property 16: Systematic Fix Implementation
 * Tests that fix implementation follows systematic approach without introducing issues.
 * 
 * Requirements: 6.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  SystematicFixValidation,
  FixImplementation,
  FixValidationResult,
  FixWorkflow
} from './SystematicFixValidation.js';
import { RootCauseCategory } from './RootCauseAnalysisSystem.js';
import { DifferenceType } from '../spotTesting/types.js';

describe('SystematicFixValidation', () => {
  let system: SystematicFixValidation;

  beforeEach(() => {
    system = new SystematicFixValidation();
    system.clear();
  });

  const createFix = (id: string): FixImplementation => ({
    id,
    category: RootCauseCategory.STATUS_BAR_CONTAMINATION,
    description: 'Fix status bar contamination',
    filesModified: ['src/parity/StatusBarNormalizer.ts'],
    timestamp: new Date().toISOString()
  });

  describe('Property 16: Systematic Fix Implementation', () => {
    describe('Fix Workflow Management', () => {
      it('should start a new fix workflow', () => {
        const fix = createFix('fix-001');
        const workflow = system.startFixWorkflow(fix);

        expect(workflow.fix.id).toBe('fix-001');
        expect(workflow.status).toBe('in_progress');
        expect(workflow.steps.length).toBe(6);
        expect(workflow.currentStep).toBe(1);
      });

      it('should complete workflow steps', () => {
        const fix = createFix('fix-002');
        system.startFixWorkflow(fix);

        system.completeStep('fix-002', 1);
        system.completeStep('fix-002', 2);

        const workflow = system.getWorkflow('fix-002');
        expect(workflow?.steps[0].completed).toBe(true);
        expect(workflow?.steps[1].completed).toBe(true);
        expect(workflow?.currentStep).toBe(3);
      });

      it('should track step completion timestamps', () => {
        const fix = createFix('fix-003');
        system.startFixWorkflow(fix);

        system.completeStep('fix-003', 1);

        const workflow = system.getWorkflow('fix-003');
        expect(workflow?.steps[0].completedAt).toBeDefined();
      });

      it('should complete workflow with status', () => {
        const fix = createFix('fix-004');
        system.startFixWorkflow(fix);

        const workflow = system.completeWorkflow('fix-004', 'completed');

        expect(workflow?.status).toBe('completed');
        expect(workflow?.completedAt).toBeDefined();
      });
    });

    describe('Fix Validation', () => {
      it('should accept fix that resolves issues without new ones', async () => {
        const fix = createFix('fix-005');
        const previousDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];
        const currentDiffs: any[] = [];

        const result = await system.validateFixImplementation(fix, 76.5, currentDiffs, previousDiffs);

        expect(result.isValid).toBe(true);
        expect(result.recommendation).toBe('accept');
        expect(result.issuesResolved.length).toBe(1);
        expect(result.newIssuesIntroduced.length).toBe(0);
      });

      it('should reject fix that introduces too many new issues', async () => {
        const fix = createFix('fix-006');
        const previousDiffs: any[] = [];
        const currentDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'wait', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'north', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];

        const result = await system.validateFixImplementation(fix, 76.5, currentDiffs, previousDiffs);

        expect(result.isValid).toBe(false);
        expect(result.recommendation).toBe('reject');
        expect(result.newIssuesIntroduced.length).toBe(3);
      });

      it('should flag fix for review when it introduces some new issues', async () => {
        const fix = createFix('fix-007');
        const previousDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'wait', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];
        const currentDiffs = [
          { command: 'north', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];

        const result = await system.validateFixImplementation(fix, 76.5, currentDiffs, previousDiffs);

        expect(result.recommendation).toBe('review');
        expect(result.issuesResolved.length).toBe(2);
        expect(result.newIssuesIntroduced.length).toBe(1);
      });

      it('should calculate parity change correctly', async () => {
        const fix = createFix('fix-008');
        const previousDiffs = Array(47).fill(null).map((_, i) => ({
          command: `cmd-${i}`,
          differenceType: DifferenceType.TIMING_DIFFERENCE,
          tsOutput: '',
          zMachineOutput: ''
        }));
        const currentDiffs = Array(40).fill(null).map((_, i) => ({
          command: `cmd-${i}`,
          differenceType: DifferenceType.TIMING_DIFFERENCE,
          tsOutput: '',
          zMachineOutput: ''
        }));

        const result = await system.validateFixImplementation(fix, 76.5, currentDiffs, previousDiffs);

        expect(result.parityBefore).toBe(76.5);
        expect(result.parityAfter).toBe(80); // 200 - 40 = 160, 160/200 = 80%
        expect(result.parityChange).toBe(3.5);
      });
    });

    describe('New Issue Prevention', () => {
      it('should detect new issues', () => {
        const previousDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];
        const currentDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'wait', differenceType: DifferenceType.PARSER_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];

        const result = system.ensureNoNewIssues(currentDiffs, previousDiffs);

        expect(result.hasNewIssues).toBe(true);
        expect(result.newIssues.length).toBe(1);
        expect(result.newIssues[0].command).toBe('wait');
      });

      it('should not flag existing issues as new', () => {
        const previousDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'wait', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];
        const currentDiffs = [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ];

        const result = system.ensureNoNewIssues(currentDiffs, previousDiffs);

        expect(result.hasNewIssues).toBe(false);
        expect(result.newIssues.length).toBe(0);
      });
    });

    describe('Systematic Approach Compliance', () => {
      it('should track systematic approach compliance', () => {
        const fix = createFix('fix-009');
        system.startFixWorkflow(fix);

        // Complete all steps
        for (let i = 1; i <= 6; i++) {
          system.completeStep('fix-009', i);
        }

        const compliance = system.followSystematicApproach('fix-009');

        expect(compliance.isFollowing).toBe(true);
        expect(compliance.completedSteps).toBe(6);
        expect(compliance.missingSteps.length).toBe(0);
      });

      it('should identify missing steps', () => {
        const fix = createFix('fix-010');
        system.startFixWorkflow(fix);

        system.completeStep('fix-010', 1);
        system.completeStep('fix-010', 2);

        const compliance = system.followSystematicApproach('fix-010');

        expect(compliance.isFollowing).toBe(false);
        expect(compliance.completedSteps).toBe(2);
        expect(compliance.missingSteps.length).toBe(4);
      });

      it('should return non-compliant for unknown workflow', () => {
        const compliance = system.followSystematicApproach('unknown-fix');

        expect(compliance.isFollowing).toBe(false);
        expect(compliance.completedSteps).toBe(0);
      });
    });

    describe('Statistics', () => {
      it('should track fix statistics', async () => {
        const fix1 = createFix('fix-011');
        const fix2 = createFix('fix-012');

        await system.validateFixImplementation(fix1, 76.5, [], [
          { command: 'look', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ]);

        await system.validateFixImplementation(fix2, 76.5, [
          { command: 'new1', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'new2', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' },
          { command: 'new3', differenceType: DifferenceType.TIMING_DIFFERENCE, tsOutput: '', zMachineOutput: '' }
        ], []);

        const stats = system.getStatistics();

        expect(stats.totalFixes).toBe(2);
        expect(stats.acceptedFixes).toBe(1);
        expect(stats.rejectedFixes).toBe(1);
        expect(stats.totalIssuesResolved).toBe(1);
        expect(stats.totalNewIssues).toBe(3);
      });
    });

    describe('Configuration', () => {
      it('should allow custom max new issues', async () => {
        system.updateConfig({ maxNewIssues: 5 });

        const fix = createFix('fix-013');
        const currentDiffs = Array(4).fill(null).map((_, i) => ({
          command: `new-${i}`,
          differenceType: DifferenceType.TIMING_DIFFERENCE,
          tsOutput: '',
          zMachineOutput: ''
        }));

        const result = await system.validateFixImplementation(fix, 76.5, currentDiffs, []);

        // 4 new issues is under the limit of 5
        expect(result.recommendation).not.toBe('reject');
      });

      it('should get current configuration', () => {
        const config = system.getConfig();

        expect(config.maxNewIssues).toBe(2);
        expect(config.requireAllStepsComplete).toBe(true);
      });
    });
  });
});
