/**
 * Comprehensive Parity Analyzer Tests
 * 
 * Property-based tests for behavioral difference categorization and analysis.
 * Uses fast-check for property-based testing with minimum 100 iterations.
 * 
 * Feature: comprehensive-parity-analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  ComprehensiveParityAnalyzer,
  CategorizedIssues,
  ParityAnalysisResult
} from './ComprehensiveParityAnalyzer.js';
import { 
  CommandDifference, 
  DifferenceType, 
  IssueSeverity 
} from '../spotTesting/types.js';

describe('ComprehensiveParityAnalyzer', () => {
  let analyzer: ComprehensiveParityAnalyzer;

  beforeEach(() => {
    analyzer = new ComprehensiveParityAnalyzer({
      baselineParity: 70.0,
      targetParity: 95
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when none provided', () => {
      const defaultAnalyzer = new ComprehensiveParityAnalyzer();
      const config = defaultAnalyzer.getConfig();
      
      expect(config.dfrotzPath).toBe('/opt/homebrew/bin/dfrotz');
      expect(config.gameFilePath).toBe('COMPILED/zork1.z3');
      expect(config.baselineParity).toBe(70.0);
      expect(config.targetParity).toBe(95);
      expect(config.commandCount).toBe(200);
      expect(config.validationSeeds).toEqual([12345, 67890, 54321, 99999, 11111]);
    });

    it('should allow configuration override', () => {
      const customAnalyzer = new ComprehensiveParityAnalyzer({
        baselineParity: 80,
        targetParity: 99
      });
      const config = customAnalyzer.getConfig();
      
      expect(config.baselineParity).toBe(80);
      expect(config.targetParity).toBe(99);
    });

    it('should update configuration', () => {
      analyzer.updateConfig({ baselineParity: 85 });
      const config = analyzer.getConfig();
      
      expect(config.baselineParity).toBe(85);
    });
  });

  describe('Property 1: Behavioral Difference Categorization', () => {
    /**
     * Property 1: Behavioral Difference Categorization
     * For any set of behavioral differences detected during parity analysis,
     * the system should correctly categorize each difference by type
     * (timing, object behavior, parser) and prioritize them by impact and frequency.
     * 
     * Validates: Requirements 1.1, 5.2, 6.1
     */

    // Generator for CommandDifference objects
    const commandDifferenceArb = (type: DifferenceType): fc.Arbitrary<CommandDifference> => {
      return fc.record({
        commandIndex: fc.nat(199),
        command: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz '.split('')), { minLength: 1, maxLength: 30 }),
        tsOutput: fc.string({ minLength: 1, maxLength: 200 }),
        zmOutput: fc.string({ minLength: 1, maxLength: 200 }),
        differenceType: fc.constant(type),
        severity: fc.constantFrom(IssueSeverity.LOW, IssueSeverity.MEDIUM, IssueSeverity.HIGH, IssueSeverity.CRITICAL)
      });
    };

    it('should categorize timing differences correctly', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.TIMING_DIFFERENCE), { minLength: 1, maxLength: 50 }),
          (timingDiffs) => {
            const result = analyzer.categorizeIssues(timingDiffs);
            
            // All timing differences should be in the timing category
            expect(result.timingDifferences.count).toBe(timingDiffs.length);
            expect(result.objectBehaviorDifferences.count).toBe(0);
            expect(result.parserDifferences.count).toBe(0);
            expect(result.summary.totalIssues).toBe(timingDiffs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should categorize object behavior differences correctly', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.OBJECT_BEHAVIOR), { minLength: 1, maxLength: 50 }),
          (objectDiffs) => {
            const result = analyzer.categorizeIssues(objectDiffs);
            
            // All object behavior differences should be in the object behavior category
            expect(result.objectBehaviorDifferences.count).toBe(objectDiffs.length);
            expect(result.timingDifferences.count).toBe(0);
            expect(result.parserDifferences.count).toBe(0);
            expect(result.summary.totalIssues).toBe(objectDiffs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should categorize parser differences correctly', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.PARSER_DIFFERENCE), { minLength: 1, maxLength: 50 }),
          (parserDiffs) => {
            const result = analyzer.categorizeIssues(parserDiffs);
            
            // All parser differences should be in the parser category
            expect(result.parserDifferences.count).toBe(parserDiffs.length);
            expect(result.timingDifferences.count).toBe(0);
            expect(result.objectBehaviorDifferences.count).toBe(0);
            expect(result.summary.totalIssues).toBe(parserDiffs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly categorize mixed differences', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.TIMING_DIFFERENCE), { minLength: 0, maxLength: 20 }),
          fc.array(commandDifferenceArb(DifferenceType.OBJECT_BEHAVIOR), { minLength: 0, maxLength: 20 }),
          fc.array(commandDifferenceArb(DifferenceType.PARSER_DIFFERENCE), { minLength: 0, maxLength: 20 }),
          (timingDiffs, objectDiffs, parserDiffs) => {
            const allDiffs = [...timingDiffs, ...objectDiffs, ...parserDiffs];
            const result = analyzer.categorizeIssues(allDiffs);
            
            // Total should equal sum of all categories
            expect(result.summary.totalIssues).toBe(allDiffs.length);
            expect(result.timingDifferences.count).toBe(timingDiffs.length);
            expect(result.objectBehaviorDifferences.count).toBe(objectDiffs.length);
            expect(result.parserDifferences.count).toBe(parserDiffs.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate percentages correctly', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.TIMING_DIFFERENCE), { minLength: 1, maxLength: 20 }),
          fc.array(commandDifferenceArb(DifferenceType.OBJECT_BEHAVIOR), { minLength: 1, maxLength: 20 }),
          (timingDiffs, objectDiffs) => {
            const allDiffs = [...timingDiffs, ...objectDiffs];
            const result = analyzer.categorizeIssues(allDiffs);
            
            const total = allDiffs.length;
            const expectedTimingPercentage = (timingDiffs.length / total) * 100;
            const expectedObjectPercentage = (objectDiffs.length / total) * 100;
            
            expect(result.timingDifferences.percentage).toBeCloseTo(expectedTimingPercentage, 5);
            expect(result.objectBehaviorDifferences.percentage).toBeCloseTo(expectedObjectPercentage, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify primary category correctly', () => {
      fc.assert(
        fc.property(
          fc.nat(50),
          fc.nat(50),
          fc.nat(50),
          (timingCount, objectCount, parserCount) => {
            // Ensure at least one category has items
            const adjustedTimingCount = timingCount + 1;
            
            const timingDiffs = Array(adjustedTimingCount).fill(null).map((_, i) => ({
              commandIndex: i,
              command: 'test',
              tsOutput: 'ts output',
              zmOutput: 'zm output',
              differenceType: DifferenceType.TIMING_DIFFERENCE,
              severity: IssueSeverity.MEDIUM
            }));
            
            const objectDiffs = Array(objectCount).fill(null).map((_, i) => ({
              commandIndex: i + adjustedTimingCount,
              command: 'test',
              tsOutput: 'ts output',
              zmOutput: 'zm output',
              differenceType: DifferenceType.OBJECT_BEHAVIOR,
              severity: IssueSeverity.MEDIUM
            }));
            
            const parserDiffs = Array(parserCount).fill(null).map((_, i) => ({
              commandIndex: i + adjustedTimingCount + objectCount,
              command: 'test',
              tsOutput: 'ts output',
              zmOutput: 'zm output',
              differenceType: DifferenceType.PARSER_DIFFERENCE,
              severity: IssueSeverity.MEDIUM
            }));
            
            const allDiffs = [...timingDiffs, ...objectDiffs, ...parserDiffs];
            const result = analyzer.categorizeIssues(allDiffs);
            
            // Primary category should be the one with most issues
            const maxCount = Math.max(adjustedTimingCount, objectCount, parserCount);
            if (adjustedTimingCount === maxCount) {
              expect(result.summary.primaryCategory).toBe(DifferenceType.TIMING_DIFFERENCE);
            } else if (objectCount === maxCount && objectCount > adjustedTimingCount) {
              expect(result.summary.primaryCategory).toBe(DifferenceType.OBJECT_BEHAVIOR);
            } else if (parserCount === maxCount && parserCount > adjustedTimingCount && parserCount > objectCount) {
              expect(result.summary.primaryCategory).toBe(DifferenceType.PARSER_DIFFERENCE);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty difference list', () => {
      const result = analyzer.categorizeIssues([]);
      
      expect(result.timingDifferences.count).toBe(0);
      expect(result.objectBehaviorDifferences.count).toBe(0);
      expect(result.parserDifferences.count).toBe(0);
      expect(result.summary.totalIssues).toBe(0);
    });

    it('should provide samples for each category', () => {
      fc.assert(
        fc.property(
          fc.array(commandDifferenceArb(DifferenceType.TIMING_DIFFERENCE), { minLength: 10, maxLength: 50 }),
          (timingDiffs) => {
            const result = analyzer.categorizeIssues(timingDiffs);
            
            // Should provide up to 5 samples
            expect(result.timingDifferences.samples.length).toBeLessThanOrEqual(5);
            expect(result.timingDifferences.samples.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Resolution Plan Prioritization', () => {
    it('should prioritize timing differences as critical when above target', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 32,
          percentage: 68,
          targetCount: 5,
          samples: [],
          rootCauses: ['Status bar contamination']
        },
        objectBehaviorDifferences: {
          count: 13,
          percentage: 28,
          targetCount: 3,
          samples: [],
          rootCauses: ['Drop command error']
        },
        parserDifferences: {
          count: 2,
          percentage: 4,
          targetCount: 0,
          samples: [],
          rootCauses: ['Vocabulary mismatch']
        },
        summary: {
          totalIssues: 47,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'high',
          resolutionOrder: [
            DifferenceType.TIMING_DIFFERENCE,
            DifferenceType.OBJECT_BEHAVIOR,
            DifferenceType.PARSER_DIFFERENCE
          ]
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.phases.length).toBe(3);
      expect(plan.phases[0].category).toBe(DifferenceType.TIMING_DIFFERENCE);
      expect(plan.phases[0].priority).toBe('critical');
      expect(plan.phases[1].category).toBe(DifferenceType.OBJECT_BEHAVIOR);
      expect(plan.phases[1].priority).toBe('high');
      expect(plan.phases[2].category).toBe(DifferenceType.PARSER_DIFFERENCE);
      expect(plan.phases[2].priority).toBe('medium');
    });

    it('should not include phases for categories at or below target', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 3, // Below target of 5
          percentage: 50,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 2, // Below target of 3
          percentage: 33,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 1, // Above target of 0
          percentage: 17,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 6,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'low',
          resolutionOrder: [
            DifferenceType.TIMING_DIFFERENCE,
            DifferenceType.OBJECT_BEHAVIOR,
            DifferenceType.PARSER_DIFFERENCE
          ]
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      // Only parser should have a phase since it's above target
      expect(plan.phases.length).toBe(1);
      expect(plan.phases[0].category).toBe(DifferenceType.PARSER_DIFFERENCE);
    });
  });

  describe('Effort Estimation', () => {
    it('should estimate high effort for many issues', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 32,
          percentage: 68,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 13,
          percentage: 28,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 2,
          percentage: 4,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 47,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'high',
          resolutionOrder: []
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.estimatedEffort.complexity).toBe('high');
    });

    it('should estimate low effort for few issues', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 6,
          percentage: 60,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 4,
          percentage: 40,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 10,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'low',
          resolutionOrder: []
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.estimatedEffort.complexity).toBe('low');
    });
  });

  describe('Risk Assessment', () => {
    it('should identify timing change risks', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 10,
          percentage: 100,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 10,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'medium',
          resolutionOrder: []
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.riskAssessment.risks).toContain('Timing changes may affect daemon behavior');
      expect(plan.riskAssessment.mitigations).toContain('Test daemon behavior after each timing fix');
    });

    it('should identify parser change risks', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 5,
          percentage: 100,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 5,
          primaryCategory: DifferenceType.PARSER_DIFFERENCE,
          estimatedEffort: 'low',
          resolutionOrder: []
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.riskAssessment.risks).toContain('Parser changes may affect command recognition');
      expect(plan.riskAssessment.mitigations).toContain('Comprehensive parser testing after vocabulary changes');
    });

    it('should always include regression risk', () => {
      const issues: CategorizedIssues = {
        timingDifferences: {
          count: 1,
          percentage: 100,
          targetCount: 5,
          samples: [],
          rootCauses: []
        },
        objectBehaviorDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 3,
          samples: [],
          rootCauses: []
        },
        parserDifferences: {
          count: 0,
          percentage: 0,
          targetCount: 0,
          samples: [],
          rootCauses: []
        },
        summary: {
          totalIssues: 1,
          primaryCategory: DifferenceType.TIMING_DIFFERENCE,
          estimatedEffort: 'low',
          resolutionOrder: []
        }
      };

      const plan = analyzer.prioritizeResolution(issues);
      
      expect(plan.riskAssessment.risks).toContain('Regression risk during multi-phase implementation');
      expect(plan.riskAssessment.mitigations).toContain('Validate parity after each change, rollback if regression detected');
    });
  });
});
