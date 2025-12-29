/**
 * Property-based tests for issue detection and categorization system
 * **Property 5: Issue Detection and Categorization**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { IssueDetector } from './issueDetector.js';
import { RecommendationEngine } from './recommendationEngine.js';
import {
  CommandDifference,
  DifferenceType,
  IssueSeverity,
  PatternType
} from './types.js';

describe('Issue Detection and Categorization Properties', () => {
  const detector = new IssueDetector();
  const recommendationEngine = new RecommendationEngine();

  // Generators for test data
  const commandDifferenceGen = fc.record({
    commandIndex: fc.integer({ min: 0, max: 1000 }),
    command: fc.string({ minLength: 1, maxLength: 50 }),
    tsOutput: fc.string({ minLength: 0, maxLength: 200 }),
    zmOutput: fc.string({ minLength: 0, maxLength: 200 }),
    differenceType: fc.constantFrom(...Object.values(DifferenceType)),
    severity: fc.constantFrom(...Object.values(IssueSeverity))
  });

  const differenceListGen = fc.array(commandDifferenceGen, { minLength: 0, maxLength: 100 });

  /**
   * Property 5: Issue Detection and Categorization
   * For any set of command differences, the issue detection system SHALL:
   * - Accurately calculate mismatch percentages
   * - Categorize issues by type with appropriate severity
   * - Provide clear recommendations for deeper investigation
   * - Flag patterns consistently across multiple runs
   */
  describe('Property 5: Issue Detection and Categorization', () => {
    it('should accurately calculate parity percentages for any command set', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 1000 }),
        differenceListGen,
        (totalCommands, differences) => {
          // Ensure differences don't exceed total commands
          const validDifferences = differences.slice(0, totalCommands);
          
          const percentage = detector.calculateParityPercentage(totalCommands, validDifferences);
          
          // Percentage should be between 0 and 100
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
          
          // Should be accurate calculation
          const expectedMatches = totalCommands - validDifferences.length;
          const expectedPercentage = Math.round((expectedMatches / totalCommands) * 100 * 100) / 100;
          expect(percentage).toBe(expectedPercentage);
          
          // Edge cases
          if (validDifferences.length === 0) {
            expect(percentage).toBe(100);
          }
          if (validDifferences.length === totalCommands) {
            expect(percentage).toBe(0);
          }
        }
      ), { numRuns: 100 });
    });

    it('should categorize issues by type with consistent pattern detection', () => {
      fc.assert(fc.property(
        differenceListGen,
        (differences) => {
          const analysis = detector.analyzeIssues(differences);
          
          // Analysis should always be valid
          expect(analysis).toBeDefined();
          expect(analysis.patterns).toBeDefined();
          expect(analysis.overallSeverity).toBeDefined();
          expect(analysis.recommendations).toBeDefined();
          
          // Patterns should be consistent with input differences
          const differenceTypes = new Set(differences.map(d => d.differenceType));
          
          // Each pattern should correspond to differences that exist
          for (const pattern of analysis.patterns) {
            expect(Object.values(PatternType)).toContain(pattern.type);
            expect(pattern.frequency).toBeGreaterThan(0);
            expect(Object.values(IssueSeverity)).toContain(pattern.severity);
            expect(pattern.sampleCommands).toBeDefined();
            expect(Array.isArray(pattern.sampleCommands)).toBe(true);
          }
          
          // Overall severity should be at least as high as the highest pattern severity
          if (analysis.patterns.length > 0) {
            const severityOrder = {
              [IssueSeverity.LOW]: 0,
              [IssueSeverity.MEDIUM]: 1,
              [IssueSeverity.HIGH]: 2,
              [IssueSeverity.CRITICAL]: 3
            };
            
            const maxPatternSeverity = Math.max(
              ...analysis.patterns.map(p => severityOrder[p.severity])
            );
            const overallSeverityValue = severityOrder[analysis.overallSeverity];
            
            expect(overallSeverityValue).toBeGreaterThanOrEqual(maxPatternSeverity);
          }
        }
      ), { numRuns: 100 });
    });

    it('should provide appropriate recommendations based on issue severity and patterns', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 200 }),
        differenceListGen,
        (totalCommands, differences) => {
          const validDifferences = differences.slice(0, totalCommands);
          const analysis = detector.analyzeIssues(validDifferences);
          const recommendations = recommendationEngine.generateRecommendations(
            totalCommands,
            validDifferences,
            analysis
          );
          
          // Should always provide some recommendations
          expect(Array.isArray(recommendations)).toBe(true);
          
          // Each recommendation should be well-formed
          for (const rec of recommendations) {
            expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);
            expect(['investigation', 'testing', 'development', 'monitoring']).toContain(rec.category);
            expect(rec.action).toBeDefined();
            expect(typeof rec.action).toBe('string');
            expect(rec.action.length).toBeGreaterThan(0);
            expect(rec.reasoning).toBeDefined();
            expect(typeof rec.reasoning).toBe('string');
            expect(['quick', 'moderate', 'extensive']).toContain(rec.estimatedEffort);
          }
          
          // Critical patterns should generate high-priority recommendations
          const criticalPatterns = analysis.patterns.filter(p => p.severity === IssueSeverity.CRITICAL);
          if (criticalPatterns.length > 0) {
            const highPriorityRecs = recommendations.filter(r => 
              r.priority === 'critical' || r.priority === 'high'
            );
            expect(highPriorityRecs.length).toBeGreaterThan(0);
          }
          
          // Recommendations should be sorted by priority
          const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
          for (let i = 1; i < recommendations.length; i++) {
            const prevPriority = priorityOrder[recommendations[i-1].priority];
            const currPriority = priorityOrder[recommendations[i].priority];
            expect(currPriority).toBeGreaterThanOrEqual(prevPriority);
          }
        }
      ), { numRuns: 100 });
    });

    it('should generate consistent deep analysis recommendations based on thresholds', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 100 }),
        differenceListGen,
        (totalCommands, differences) => {
          const validDifferences = differences.slice(0, totalCommands);
          const analysis = detector.analyzeIssues(validDifferences);
          
          const deepAnalysisResult = recommendationEngine.shouldRecommendDeepAnalysis(
            validDifferences,
            analysis.patterns
          );
          
          // Result should be well-formed
          expect(typeof deepAnalysisResult.recommend).toBe('boolean');
          expect(Array.isArray(deepAnalysisResult.reasons)).toBe(true);
          
          // If recommending deep analysis, should have reasons
          if (deepAnalysisResult.recommend) {
            expect(deepAnalysisResult.reasons.length).toBeGreaterThan(0);
            for (const reason of deepAnalysisResult.reasons) {
              expect(typeof reason).toBe('string');
              expect(reason.length).toBeGreaterThan(0);
            }
          }
          
          // Should recommend deep analysis for critical patterns
          const criticalPatterns = analysis.patterns.filter(p => p.severity === IssueSeverity.CRITICAL);
          if (criticalPatterns.length > 0) {
            expect(deepAnalysisResult.recommend).toBe(true);
          }
          
          // Should recommend deep analysis for many differences
          if (validDifferences.length >= 3) {
            expect(deepAnalysisResult.recommend).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });

    it('should generate well-formed reports in all formats', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 100 }),
        differenceListGen,
        (totalCommands, differences) => {
          const validDifferences = differences.slice(0, totalCommands);
          const analysis = detector.analyzeIssues(validDifferences);
          
          // Test summary report
          const summaryReport = detector.generateSummaryReport(totalCommands, validDifferences, analysis);
          expect(typeof summaryReport).toBe('string');
          expect(summaryReport.length).toBeGreaterThan(0);
          expect(summaryReport).toContain('Spot Test Results');
          
          // Test detailed report
          const detailedReport = detector.generateDetailedReport(totalCommands, validDifferences, analysis);
          expect(typeof detailedReport).toBe('string');
          expect(detailedReport.length).toBeGreaterThan(0);
          expect(detailedReport).toContain('# Spot Test Analysis Report');
          
          // Test JSON report
          const jsonReport = detector.generateJsonReport(totalCommands, validDifferences, analysis);
          expect(typeof jsonReport).toBe('object');
          expect(jsonReport).toHaveProperty('summary');
          expect(jsonReport).toHaveProperty('patterns');
          expect(jsonReport).toHaveProperty('recommendations');
          
          // Test CSV report
          const csvReport = detector.generateCsvReport(validDifferences);
          expect(typeof csvReport).toBe('string');
          expect(csvReport).toContain('Command Index,Command,Difference Type');
          
          // CSV should have header + data rows
          const lines = csvReport.split('\n').filter(line => line.trim().length > 0);
          expect(lines.length).toBe(validDifferences.length + 1); // header + data rows
        }
      ), { numRuns: 100 });
    });

    it('should handle edge cases gracefully', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 10 }),
        (totalCommands) => {
          // Test with empty differences
          const emptyAnalysis = detector.analyzeIssues([]);
          expect(emptyAnalysis.patterns).toHaveLength(0);
          expect(emptyAnalysis.overallSeverity).toBe(IssueSeverity.LOW);
          expect(emptyAnalysis.recommendDeepAnalysis).toBe(false);
          
          // Test with zero total commands
          if (totalCommands === 0) {
            const percentage = detector.calculateParityPercentage(0, []);
            expect(percentage).toBe(100);
          }
          
          // Test reports with empty data
          const summaryReport = detector.generateSummaryReport(totalCommands, [], emptyAnalysis);
          expect(summaryReport).toContain('0/' + totalCommands);
          
          const jsonReport = detector.generateJsonReport(totalCommands, [], emptyAnalysis);
          expect(jsonReport).toHaveProperty('summary');
          expect((jsonReport as any).summary.differencesFound).toBe(0);
        }
      ), { numRuns: 50 });
    });
  });

  // Additional unit tests for specific scenarios
  describe('Specific Issue Detection Scenarios', () => {
    it('should detect message inconsistency patterns', () => {
      const differences: CommandDifference[] = [
        {
          commandIndex: 1,
          command: 'look',
          tsOutput: 'You see a lamp.',
          zmOutput: 'You see a brass lamp.',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.MEDIUM
        },
        {
          commandIndex: 2,
          command: 'examine lamp',
          tsOutput: 'It is a lamp.',
          zmOutput: 'It is a brass lamp.',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.MEDIUM
        }
      ];

      const analysis = detector.analyzeIssues(differences);
      expect(analysis.patterns).toHaveLength(1);
      expect(analysis.patterns[0].type).toBe(PatternType.MESSAGE_INCONSISTENCY);
      expect(analysis.patterns[0].frequency).toBe(2);
    });

    it('should prioritize critical state divergence issues', () => {
      const differences: CommandDifference[] = [
        {
          commandIndex: 1,
          command: 'take lamp',
          tsOutput: 'Taken.',
          zmOutput: 'You cannot take the lamp.',
          differenceType: DifferenceType.STATE_DIVERGENCE,
          severity: IssueSeverity.CRITICAL
        }
      ];

      const analysis = detector.analyzeIssues(differences);
      expect(analysis.overallSeverity).toBe(IssueSeverity.CRITICAL);
      expect(analysis.recommendDeepAnalysis).toBe(true);
    });

    it('should generate appropriate recommendations for parser differences', () => {
      const differences: CommandDifference[] = Array.from({ length: 5 }, (_, i) => ({
        commandIndex: i,
        command: `command ${i}`,
        tsOutput: 'I do not understand.',
        zmOutput: 'I don\'t understand that.',
        differenceType: DifferenceType.PARSER_DIFFERENCE,
        severity: IssueSeverity.HIGH
      }));

      const analysis = detector.analyzeIssues(differences);
      const recommendations = recommendationEngine.generateRecommendations(10, differences, analysis);
      
      const parserRecommendations = recommendations.filter(r => 
        r.action.toLowerCase().includes('parser') || r.action.toLowerCase().includes('parsing')
      );
      expect(parserRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases for Issue Detection', () => {
    it('should handle malformed command differences', () => {
      const malformedDifferences: CommandDifference[] = [
        {
          commandIndex: -1,
          command: '',
          tsOutput: null as any,
          zmOutput: undefined as any,
          differenceType: 'invalid' as any,
          severity: 'unknown' as any
        }
      ];

      expect(() => {
        detector.analyzeIssues(malformedDifferences);
      }).not.toThrow();
    });

    it('should handle extremely large difference sets', () => {
      const largeDifferences: CommandDifference[] = Array.from({ length: 10000 }, (_, i) => ({
        commandIndex: i,
        command: `command ${i}`,
        tsOutput: `output ${i}`,
        zmOutput: `different output ${i}`,
        differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
        severity: IssueSeverity.LOW
      }));

      const startTime = Date.now();
      const analysis = detector.analyzeIssues(largeDifferences);
      const endTime = Date.now();

      expect(analysis).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle duplicate command indices', () => {
      const duplicateDifferences: CommandDifference[] = [
        {
          commandIndex: 1,
          command: 'look',
          tsOutput: 'output1',
          zmOutput: 'output2',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.LOW
        },
        {
          commandIndex: 1, // Duplicate index
          command: 'examine',
          tsOutput: 'output3',
          zmOutput: 'output4',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.MEDIUM
        }
      ];

      const analysis = detector.analyzeIssues(duplicateDifferences);
      expect(analysis.patterns).toBeDefined();
      expect(analysis.patterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle mixed severity levels correctly', () => {
      const mixedSeverityDifferences: CommandDifference[] = [
        {
          commandIndex: 1,
          command: 'test1',
          tsOutput: 'a',
          zmOutput: 'b',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.LOW
        },
        {
          commandIndex: 2,
          command: 'test2',
          tsOutput: 'c',
          zmOutput: 'd',
          differenceType: DifferenceType.STATE_DIVERGENCE,
          severity: IssueSeverity.CRITICAL
        },
        {
          commandIndex: 3,
          command: 'test3',
          tsOutput: 'e',
          zmOutput: 'f',
          differenceType: DifferenceType.PARSER_DIFFERENCE,
          severity: IssueSeverity.MEDIUM
        }
      ];

      const analysis = detector.analyzeIssues(mixedSeverityDifferences);
      expect(analysis.overallSeverity).toBe(IssueSeverity.CRITICAL);
      expect(analysis.patterns.length).toBeGreaterThan(0);
    });

    it('should handle percentage calculations with edge values', () => {
      // Test with zero differences
      const percentage1 = detector.calculateParityPercentage(100, []);
      expect(percentage1).toBe(100);

      // Test with all differences
      const allDifferences = Array.from({ length: 50 }, (_, i) => ({
        commandIndex: i,
        command: `cmd${i}`,
        tsOutput: 'a',
        zmOutput: 'b',
        differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
        severity: IssueSeverity.LOW
      }));
      const percentage2 = detector.calculateParityPercentage(50, allDifferences);
      expect(percentage2).toBe(0);

      // Test with single command
      const percentage3 = detector.calculateParityPercentage(1, []);
      expect(percentage3).toBe(100);

      const percentage4 = detector.calculateParityPercentage(1, [allDifferences[0]]);
      expect(percentage4).toBe(0);
    });

    it('should handle report generation with extreme data', () => {
      const extremeDifferences: CommandDifference[] = [
        {
          commandIndex: 0,
          command: 'a'.repeat(1000), // Very long command
          tsOutput: 'b'.repeat(5000), // Very long output
          zmOutput: 'c'.repeat(5000),
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.HIGH
        }
      ];

      const analysis = detector.analyzeIssues(extremeDifferences);

      expect(() => {
        detector.generateSummaryReport(1, extremeDifferences, analysis);
      }).not.toThrow();

      expect(() => {
        detector.generateDetailedReport(1, extremeDifferences, analysis);
      }).not.toThrow();

      expect(() => {
        detector.generateJsonReport(1, extremeDifferences, analysis);
      }).not.toThrow();

      expect(() => {
        detector.generateCsvReport(extremeDifferences);
      }).not.toThrow();
    });

    it('should handle concurrent analysis requests', async () => {
      const testDifferences: CommandDifference[] = [
        {
          commandIndex: 1,
          command: 'test',
          tsOutput: 'output1',
          zmOutput: 'output2',
          differenceType: DifferenceType.MESSAGE_INCONSISTENCY,
          severity: IssueSeverity.MEDIUM
        }
      ];

      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(detector.analyzeIssues(testDifferences))
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.patterns).toBeDefined();
      });
    });

    it('should validate recommendation engine edge cases', () => {
      const emptyAnalysis = {
        patterns: [],
        overallSeverity: IssueSeverity.LOW,
        recommendDeepAnalysis: false,
        typeDistribution: new Map(),
        severityDistribution: new Map()
      };

      const recommendations = recommendationEngine.generateRecommendations(0, [], emptyAnalysis);
      expect(Array.isArray(recommendations)).toBe(true);

      const deepAnalysisResult = recommendationEngine.shouldRecommendDeepAnalysis([], []);
      expect(typeof deepAnalysisResult.recommend).toBe('boolean');
      expect(Array.isArray(deepAnalysisResult.reasons)).toBe(true);
    });
  });
});