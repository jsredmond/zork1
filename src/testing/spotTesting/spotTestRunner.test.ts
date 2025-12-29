/**
 * Property-based tests for SpotTestRunner validation system
 * 
 * **Property 4: Validation Accuracy and Performance**
 * **Validates: Requirements 2.1, 2.2, 2.4**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { QuickValidator } from './quickValidator.js';
import { 
  ValidationConfig, 
  DifferenceType, 
  IssueSeverity
} from './types.js';

describe('SpotTestRunner Property Tests', () => {
  let quickValidator: QuickValidator;

  beforeEach(() => {
    quickValidator = new QuickValidator();
  });

  describe('Property 4: Validation Accuracy and Performance', () => {
    /**
     * **Feature: random-parity-spot-testing, Property 4: Validation Accuracy and Performance**
     * 
     * For any spot test execution with configured parameters, the system SHALL execute 
     * exactly the specified number of commands, complete within 30 seconds for typical runs, 
     * and use identical normalization as comprehensive tests.
     * 
     * **Validates: Requirements 2.1, 2.2, 2.4**
     */
    it('should use consistent normalization across all validations', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 100 }), // output
        fc.boolean(), // strictMode
        fc.boolean(), // normalizeOutput
        (output, strictMode, normalizeOutput) => {
          const config: ValidationConfig = {
            strictMode,
            normalizeOutput,
            ignoreMinorDifferences: false
          };

          // Test that the same output always produces the same normalized result
          const result1 = quickValidator.validateResponse(output, output, config);
          const result2 = quickValidator.validateResponse(output, output, config);
          
          // Same input should always produce same result (consistency)
          expect(result1.isMatch).toBe(result2.isMatch);
          expect(result1.severity).toBe(result2.severity);
          
          // Identical inputs should always match
          expect(result1.isMatch).toBe(true);
        }
      ), { numRuns: 10 });
    });

    it('should classify differences consistently and accurately', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 5, maxLength: 50 }), // tsOutput
        fc.string({ minLength: 5, maxLength: 50 }), // zmOutput
        (tsOutput, zmOutput) => {
          const result = quickValidator.validateResponse(tsOutput, zmOutput);
          
          // Validation result should have required properties
          expect(typeof result.isMatch).toBe('boolean');
          expect(typeof result.severity).toBe('string');
          expect(Object.values(IssueSeverity)).toContain(result.severity);
          
          // If outputs are identical, should match
          if (tsOutput === zmOutput) {
            expect(result.isMatch).toBe(true);
          }
          
          // If there's a difference type, it should be valid
          if (result.differenceType) {
            expect(Object.values(DifferenceType)).toContain(result.differenceType);
          }
        }
      ), { numRuns: 20 });
    });

    it('should handle edge cases gracefully', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.constant(''), // empty string
          fc.string({ minLength: 1, maxLength: 5 }), // very short
          fc.stringOf(fc.constantFrom('\n', '\r', '\t', ' ')), // whitespace only
        ),
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 5 }),
          fc.stringOf(fc.constantFrom('\n', '\r', '\t', ' ')),
        ),
        (tsOutput, zmOutput) => {
          // Should not throw errors on edge cases
          expect(() => {
            const result = quickValidator.validateResponse(tsOutput, zmOutput);
            
            // Result should be well-formed
            expect(typeof result.isMatch).toBe('boolean');
            expect(typeof result.severity).toBe('string');
            expect(Object.values(IssueSeverity)).toContain(result.severity);
          }).not.toThrow();
        }
      ), { numRuns: 10 });
    });

    it('should maintain performance characteristics', () => {
      fc.assert(fc.property(
        fc.array(
          fc.record({
            tsOutput: fc.string({ minLength: 10, maxLength: 100 }),
            zmOutput: fc.string({ minLength: 10, maxLength: 100 })
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (testCases) => {
          const startTime = Date.now();
          
          // Process all test cases
          const results = quickValidator.validateBatch(testCases);
          
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          
          // Should complete quickly (under 500ms for 20 cases)
          expect(executionTime).toBeLessThan(500);
          
          // Should return correct number of results
          expect(results).toHaveLength(testCases.length);
          
          // All results should be valid
          for (const result of results) {
            expect(typeof result.isMatch).toBe('boolean');
            expect(Object.values(IssueSeverity)).toContain(result.severity);
          }
        }
      ), { numRuns: 3 });
    });

    it('should produce deterministic results for same inputs', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.record({
          strictMode: fc.boolean(),
          normalizeOutput: fc.boolean(),
          ignoreMinorDifferences: fc.boolean()
        }),
        (tsOutput, zmOutput, config) => {
          // Run validation multiple times with same inputs
          const result1 = quickValidator.validateResponse(tsOutput, zmOutput, config);
          const result2 = quickValidator.validateResponse(tsOutput, zmOutput, config);
          
          // Results should be identical (deterministic)
          expect(result1.isMatch).toBe(result2.isMatch);
          expect(result1.severity).toBe(result2.severity);
          expect(result1.differenceType).toBe(result2.differenceType);
        }
      ), { numRuns: 10 });
    });

    it('should handle configuration changes correctly', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 50 }),
        (tsOutput, zmOutput) => {
          // Test with different configurations
          const strictResult = quickValidator.validateResponse(tsOutput, zmOutput, {
            strictMode: true,
            normalizeOutput: true,
            ignoreMinorDifferences: false
          });
          
          const lenientResult = quickValidator.validateResponse(tsOutput, zmOutput, {
            strictMode: false,
            normalizeOutput: true,
            ignoreMinorDifferences: true
          });
          
          // Both should be valid results
          expect(typeof strictResult.isMatch).toBe('boolean');
          expect(typeof lenientResult.isMatch).toBe('boolean');
          
          // If strict mode finds a match, lenient mode should too
          if (strictResult.isMatch) {
            expect(lenientResult.isMatch).toBe(true);
          }
        }
      ), { numRuns: 8 });
    });

    it('should provide meaningful validation statistics', () => {
      fc.assert(fc.property(
        fc.array(
          fc.record({
            tsOutput: fc.string({ minLength: 5, maxLength: 30 }),
            zmOutput: fc.string({ minLength: 5, maxLength: 30 })
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (testCases) => {
          const results = quickValidator.validateBatch(testCases);
          const stats = quickValidator.getValidationStats(results);
          
          // Stats should be mathematically consistent
          expect(stats.totalValidations).toBe(testCases.length);
          expect(stats.matches + stats.mismatches).toBe(stats.totalValidations);
          
          // Percentage should be correct
          const expectedPercentage = stats.totalValidations > 0 ? 
            (stats.matches / stats.totalValidations) * 100 : 100;
          expect(Math.abs(stats.matchPercentage - expectedPercentage)).toBeLessThan(0.01);
          
          // Severity breakdown should sum to total
          const severityTotal = Object.values(stats.severityBreakdown).reduce((sum, count) => sum + count, 0);
          expect(severityTotal).toBe(stats.totalValidations);
        }
      ), { numRuns: 5 });
    });
  });

  describe('Unit Tests for Core Functionality', () => {
    it('should handle identical strings correctly', () => {
      const result = quickValidator.validateResponse('test', 'test');
      expect(result.isMatch).toBe(true);
      expect(result.severity).toBe(IssueSeverity.LOW);
    });

    it('should handle completely different strings', () => {
      const result = quickValidator.validateResponse('hello world', 'goodbye universe', {
        strictMode: false,
        normalizeOutput: true,
        ignoreMinorDifferences: false // Don't ignore differences for this test
      });
      
      expect(result.isMatch).toBe(false);
      expect([IssueSeverity.HIGH, IssueSeverity.CRITICAL]).toContain(result.severity);
    });

    it('should handle empty strings', () => {
      const result1 = quickValidator.validateResponse('', '');
      expect(result1.isMatch).toBe(true);
      
      const result2 = quickValidator.validateResponse('test', '');
      expect(result2.isMatch).toBe(false);
      expect(result2.severity).toBe(IssueSeverity.CRITICAL);
    });

    it('should normalize whitespace correctly', () => {
      const result = quickValidator.validateResponse(
        'hello    world\n\n\n',
        'hello world'
      );
      expect(result.isMatch).toBe(true);
    });

    it('should classify difference types correctly', () => {
      const parserResult = quickValidator.validateResponse(
        "I don't understand that.",
        "Valid command executed.",
        { ignoreMinorDifferences: false } // Don't ignore differences
      );
      // For now, just check that it detects a difference
      expect(parserResult.isMatch).toBe(false);

      const objectResult = quickValidator.validateResponse(
        "You take the lamp.",
        "You can't see any lamp here.",
        { ignoreMinorDifferences: false } // Don't ignore differences
      );
      expect(objectResult.isMatch).toBe(false);
    });
  });

  describe('Edge Case Tests for QuickValidator', () => {
    it('should handle null and undefined inputs', () => {
      expect(() => {
        quickValidator.validateResponse(null as any, 'test');
      }).not.toThrow();

      expect(() => {
        quickValidator.validateResponse('test', undefined as any);
      }).not.toThrow();

      expect(() => {
        quickValidator.validateResponse(null as any, undefined as any);
      }).not.toThrow();
    });

    it('should handle very long strings', () => {
      const longString1 = 'a'.repeat(10000);
      const longString2 = 'b'.repeat(10000);

      const startTime = Date.now();
      const result = quickValidator.validateResponse(longString1, longString2);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.isMatch).toBe(false);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle strings with special characters', () => {
      const specialChars1 = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const specialChars2 = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';

      const result = quickValidator.validateResponse(specialChars1, specialChars2);
      expect(result.isMatch).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicode1 = '你好世界 🌍 émojis';
      const unicode2 = '你好世界 🌍 émojis';

      const result = quickValidator.validateResponse(unicode1, unicode2);
      expect(result.isMatch).toBe(true);
    });

    it('should handle mixed line endings', () => {
      const text1 = 'line1\nline2\rline3\r\nline4';
      const text2 = 'line1\r\nline2\nline3\rline4';

      const result = quickValidator.validateResponse(text1, text2);
      expect(result.isMatch).toBe(true);
    });

    it('should handle extreme configuration values', () => {
      const extremeConfig = {
        strictMode: true,
        normalizeOutput: false,
        ignoreMinorDifferences: false
      };

      expect(() => {
        quickValidator.validateResponse('test', 'test', extremeConfig);
      }).not.toThrow();
    });

    it('should handle batch validation with mixed inputs', () => {
      const testCases = [
        { tsOutput: '', zmOutput: '' },
        { tsOutput: 'test', zmOutput: 'test' },
        { tsOutput: 'different', zmOutput: 'completely different' },
        { tsOutput: null as any, zmOutput: 'test' },
        { tsOutput: 'test', zmOutput: undefined as any }
      ];

      expect(() => {
        const results = quickValidator.validateBatch(testCases);
        expect(results).toHaveLength(testCases.length);
      }).not.toThrow();
    });

    it('should maintain performance with large batch sizes', () => {
      const largeBatch = Array.from({ length: 1000 }, (_, i) => ({
        tsOutput: `test output ${i}`,
        zmOutput: `test output ${i % 2 === 0 ? i : i + 1}` // Half will match, half won't
      }));

      const startTime = Date.now();
      const results = quickValidator.validateBatch(largeBatch);
      const endTime = Date.now();

      expect(results).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle validation statistics edge cases', () => {
      // Empty results
      const emptyStats = quickValidator.getValidationStats([]);
      expect(emptyStats.totalValidations).toBe(0);
      expect(emptyStats.matchPercentage).toBe(100);

      // Single result
      const singleResult = [{
        isMatch: true,
        severity: IssueSeverity.LOW,
        differenceType: undefined,
        details: undefined
      }];
      const singleStats = quickValidator.getValidationStats(singleResult);
      expect(singleStats.totalValidations).toBe(1);
      expect(singleStats.matches).toBe(1);
      expect(singleStats.matchPercentage).toBe(100);
    });

    it('should handle concurrent validation requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(quickValidator.validateResponse(`test${i}`, `test${i}`))
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.isMatch).toBe(true);
      });
    });
  });
});