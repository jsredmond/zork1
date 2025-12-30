/**
 * RootCauseAnalysisSystem Tests
 * 
 * Property 14: Root Cause Analysis Completeness
 * Tests that root cause analysis provides accurate and complete analysis.
 * 
 * Requirements: 1.3, 1.4, 5.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  RootCauseAnalysisSystem, 
  RootCauseCategory,
  RootCauseAnalysis,
  AnalysisReport
} from './RootCauseAnalysisSystem.js';
import { CommandDifference, DifferenceType } from '../spotTesting/types.js';

describe('RootCauseAnalysisSystem', () => {
  let system: RootCauseAnalysisSystem;

  beforeEach(() => {
    system = new RootCauseAnalysisSystem();
  });

  describe('Property 14: Root Cause Analysis Completeness', () => {
    describe('Single Difference Analysis', () => {
      it('should identify status bar contamination', () => {
        const difference: CommandDifference = {
          command: 'look',
          tsOutput: 'West of House Score: 0 Moves: 1',
          zMachineOutput: 'West of House',
          differenceType: DifferenceType.TIMING_DIFFERENCE
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.STATUS_BAR_CONTAMINATION);
        expect(analysis.confidence).toBeGreaterThan(0.5);
        expect(analysis.relatedFiles).toContain('src/parity/StatusBarNormalizer.ts');
      });

      it('should identify daemon timing issues', () => {
        const difference: CommandDifference = {
          command: 'wait',
          tsOutput: 'Time passes. Your lamp is getting dim.',
          zMachineOutput: 'Time passes.',
          differenceType: DifferenceType.TIMING_DIFFERENCE
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.DAEMON_TIMING);
        expect(analysis.affectedComponent).toBe('DaemonManager');
      });

      it('should identify vocabulary mismatch', () => {
        const difference: CommandDifference = {
          command: 'examine room',
          tsOutput: "You can't see any room here!",
          zMachineOutput: "I don't know the word \"room\".",
          differenceType: DifferenceType.PARSER_DIFFERENCE
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.VOCABULARY_MISMATCH);
        expect(analysis.relatedFiles).toContain('src/parser/vocabulary.ts');
      });

      it('should identify error message format issues', () => {
        const difference: CommandDifference = {
          command: 'drop',
          tsOutput: 'There seems to be a noun missing in that sentence!',
          zMachineOutput: 'What do you want to drop?',
          differenceType: DifferenceType.PARSER_DIFFERENCE
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.ERROR_MESSAGE_FORMAT);
      });

      it('should identify object visibility issues', () => {
        const difference: CommandDifference = {
          command: 'take sword',
          tsOutput: "The sword isn't here.",
          zMachineOutput: "You can't see any sword here!",
          differenceType: DifferenceType.OBJECT_BEHAVIOR
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.OBJECT_VISIBILITY);
      });

      it('should identify container behavior issues', () => {
        const difference: CommandDifference = {
          command: 'put lamp in case',
          tsOutput: "You can't put that in the case.",
          zMachineOutput: "It won't fit.",
          differenceType: DifferenceType.OBJECT_BEHAVIOR
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.CONTAINER_BEHAVIOR);
      });

      it('should return unknown for unrecognized patterns', () => {
        const difference: CommandDifference = {
          command: 'xyzzy',
          tsOutput: 'Nothing happens.',
          zMachineOutput: 'A hollow voice says "Fool."',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.category).toBe(RootCauseCategory.UNKNOWN);
        expect(analysis.confidence).toBeLessThan(0.5);
      });
    });

    describe('Report Generation', () => {
      it('should generate complete analysis report', () => {
        const differences: CommandDifference[] = [
          {
            command: 'look',
            tsOutput: 'West of House Score: 0',
            zMachineOutput: 'West of House',
            differenceType: DifferenceType.TIMING_DIFFERENCE
          },
          {
            command: 'examine room',
            tsOutput: "You can't see any room here!",
            zMachineOutput: "I don't know the word \"room\".",
            differenceType: DifferenceType.PARSER_DIFFERENCE
          }
        ];

        const report = system.generateAnalysisReport(differences);

        expect(report.totalDifferences).toBe(2);
        expect(report.analyzedDifferences).toBe(2);
        expect(report.analyses.length).toBe(2);
        expect(report.timestamp).toBeDefined();
      });

      it('should summarize categories correctly', () => {
        const differences: CommandDifference[] = [
          { command: 'look', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'wait', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'drop', tsOutput: "I don't know the word", zMachineOutput: '', differenceType: DifferenceType.PARSER_DIFFERENCE }
        ];

        const report = system.generateAnalysisReport(differences);

        expect(report.categorySummary[RootCauseCategory.STATUS_BAR_CONTAMINATION]).toBe(2);
      });

      it('should summarize priorities correctly', () => {
        const differences: CommandDifference[] = [
          { command: 'look', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'unknown', tsOutput: 'xyz', zMachineOutput: 'abc', differenceType: DifferenceType.MESSAGE_INCONSISTENCY }
        ];

        const report = system.generateAnalysisReport(differences);

        expect(report.prioritySummary.high).toBeGreaterThanOrEqual(1);
        expect(report.prioritySummary.low).toBeGreaterThanOrEqual(1);
      });
    });

    describe('Fix Recommendations', () => {
      it('should generate fix recommendations', () => {
        const differences: CommandDifference[] = [
          { command: 'look', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'wait', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE }
        ];

        const report = system.generateAnalysisReport(differences);

        expect(report.recommendations.length).toBeGreaterThan(0);
        expect(report.recommendations[0].estimatedImpact).toBe(2);
      });

      it('should sort recommendations by impact', () => {
        const differences: CommandDifference[] = [
          { command: 'look', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'wait', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE },
          { command: 'drop', tsOutput: "I don't know the word", zMachineOutput: '', differenceType: DifferenceType.PARSER_DIFFERENCE }
        ];

        const report = system.generateAnalysisReport(differences);

        // First recommendation should have highest impact
        for (let i = 1; i < report.recommendations.length; i++) {
          expect(report.recommendations[i - 1].estimatedImpact)
            .toBeGreaterThanOrEqual(report.recommendations[i].estimatedImpact);
        }
      });

      it('should include fix steps in recommendations', () => {
        const differences: CommandDifference[] = [
          { command: 'look', tsOutput: 'Score: 0', zMachineOutput: '', differenceType: DifferenceType.TIMING_DIFFERENCE }
        ];

        const report = system.generateAnalysisReport(differences);

        expect(report.recommendations[0].steps.length).toBeGreaterThan(0);
        expect(report.recommendations[0].files.length).toBeGreaterThan(0);
      });

      it('should not include unknown category in recommendations', () => {
        const differences: CommandDifference[] = [
          { command: 'xyzzy', tsOutput: 'abc', zMachineOutput: 'def', differenceType: DifferenceType.MESSAGE_INCONSISTENCY }
        ];

        const report = system.generateAnalysisReport(differences);

        const unknownRec = report.recommendations.find(r => r.category === RootCauseCategory.UNKNOWN);
        expect(unknownRec).toBeUndefined();
      });
    });

    describe('Analysis Quality', () => {
      it('should provide suggested fixes for all categories', () => {
        const categories = [
          RootCauseCategory.STATUS_BAR_CONTAMINATION,
          RootCauseCategory.DAEMON_TIMING,
          RootCauseCategory.ERROR_MESSAGE_FORMAT,
          RootCauseCategory.OBJECT_VISIBILITY,
          RootCauseCategory.VOCABULARY_MISMATCH
        ];

        for (const category of categories) {
          const difference: CommandDifference = {
            command: 'test',
            tsOutput: getCategoryTestOutput(category),
            zMachineOutput: '',
            differenceType: DifferenceType.MESSAGE_INCONSISTENCY
          };

          const analysis = system.analyzeRootCause(difference);
          expect(analysis.suggestedFix).toBeDefined();
          expect(analysis.suggestedFix.length).toBeGreaterThan(0);
        }
      });

      it('should provide related files for identified issues', () => {
        const difference: CommandDifference = {
          command: 'look',
          tsOutput: 'Score: 0 Moves: 1',
          zMachineOutput: '',
          differenceType: DifferenceType.TIMING_DIFFERENCE
        };

        const analysis = system.analyzeRootCause(difference);

        expect(analysis.relatedFiles.length).toBeGreaterThan(0);
        expect(analysis.relatedFiles.every(f => f.endsWith('.ts'))).toBe(true);
      });

      it('should assign appropriate priorities', () => {
        // Status bar contamination should be high priority
        const statusBarDiff: CommandDifference = {
          command: 'look',
          tsOutput: 'Score: 0',
          zMachineOutput: '',
          differenceType: DifferenceType.TIMING_DIFFERENCE
        };

        const statusBarAnalysis = system.analyzeRootCause(statusBarDiff);
        expect(statusBarAnalysis.priority).toBe('high');

        // Unknown should be low priority
        const unknownDiff: CommandDifference = {
          command: 'xyz',
          tsOutput: 'abc',
          zMachineOutput: 'def',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY
        };

        const unknownAnalysis = system.analyzeRootCause(unknownDiff);
        expect(unknownAnalysis.priority).toBe('low');
      });
    });
  });
});

// Helper function to get test output for a category
function getCategoryTestOutput(category: RootCauseCategory): string {
  const outputs: Record<RootCauseCategory, string> = {
    [RootCauseCategory.STATUS_BAR_CONTAMINATION]: 'Score: 0 Moves: 1',
    [RootCauseCategory.DAEMON_TIMING]: 'Your lamp is getting dim.',
    [RootCauseCategory.ATMOSPHERIC_MESSAGE]: 'A bird sings in the distance.',
    [RootCauseCategory.ERROR_MESSAGE_FORMAT]: "I don't know the word \"test\".",
    [RootCauseCategory.OBJECT_VISIBILITY]: "You can't see any lamp here!",
    [RootCauseCategory.CONTAINER_BEHAVIOR]: "You can't put that in the box.",
    [RootCauseCategory.INVENTORY_STATE]: "You don't have that.",
    [RootCauseCategory.VOCABULARY_MISMATCH]: "I don't know the word \"xyz\".",
    [RootCauseCategory.SYNTAX_HANDLING]: 'There seems to be a noun missing.',
    [RootCauseCategory.AMBIGUITY_RESOLUTION]: 'Which lamp do you mean?',
    [RootCauseCategory.UNKNOWN]: 'Unknown output'
  };
  return outputs[category];
}
