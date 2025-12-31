/**
 * Unit tests for CertificationGenerator
 * 
 * Tests markdown output format, required sections, and version information.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CertificationGenerator,
  createCertificationGenerator,
  VersionInfo,
} from './certificationGenerator.js';
import { ParityResults } from './exhaustiveParityValidator.js';
import { ClassifiedDifference } from './differenceClassifier.js';

/**
 * Create mock parity results for testing
 */
function createMockParityResults(options: {
  passed?: boolean;
  logicDifferences?: number;
  rngDifferences?: number;
  stateDivergences?: number;
  totalTests?: number;
}): ParityResults {
  const {
    passed = true,
    logicDifferences = 0,
    rngDifferences = 5,
    stateDivergences = 2,
    totalTests = 3,
  } = options;

  const seedResults = new Map<number, {
    seed: number;
    totalCommands: number;
    matchingResponses: number;
    differences: ClassifiedDifference[];
    parityPercentage: number;
    executionTime: number;
    success: boolean;
    statusBarDifferences: number;
    logicParityPercentage: number;
  }>();

  // Create mock seed results
  const seeds = [12345, 67890, 54321].slice(0, totalTests);
  for (const seed of seeds) {
    const differences: ClassifiedDifference[] = [];
    
    // Add RNG differences
    for (let i = 0; i < Math.ceil(rngDifferences / totalTests); i++) {
      differences.push({
        commandIndex: i,
        command: 'hello',
        tsOutput: 'Hello.',
        zmOutput: 'Good day.',
        classification: 'RNG_DIFFERENCE',
        reason: 'Both outputs are from the HELLOS RNG pool',
      });
    }

    // Add state divergences
    for (let i = 0; i < Math.ceil(stateDivergences / totalTests); i++) {
      differences.push({
        commandIndex: i + 10,
        command: 'north',
        tsOutput: "You can't go that way.",
        zmOutput: 'Kitchen',
        classification: 'STATE_DIVERGENCE',
        reason: 'Game states have diverged due to accumulated RNG effects',
      });
    }

    // Add logic differences
    for (let i = 0; i < Math.ceil(logicDifferences / totalTests); i++) {
      differences.push({
        commandIndex: i + 20,
        command: 'examine sword',
        tsOutput: 'A shiny sword.',
        zmOutput: 'A gleaming sword.',
        classification: 'LOGIC_DIFFERENCE',
        reason: 'Difference cannot be attributed to RNG or state divergence',
      });
    }

    const seedLogicDiffs = Math.ceil(logicDifferences / totalTests);
    seedResults.set(seed, {
      seed,
      totalCommands: 100,
      matchingResponses: 100 - differences.length,
      differences,
      parityPercentage: ((100 - differences.length) / 100) * 100,
      executionTime: 1000,
      success: true,
      statusBarDifferences: 0,
      logicParityPercentage: ((100 - seedLogicDiffs) / 100) * 100,
    });
  }

  return {
    totalTests,
    totalDifferences: rngDifferences + stateDivergences + logicDifferences,
    rngDifferences,
    stateDivergences,
    logicDifferences,
    seedResults,
    overallParityPercentage: 95.5,
    totalExecutionTime: 3000,
    passed,
    summary: passed ? 'All tests passed' : 'Tests failed',
    statusBarDifferences: 0,
    logicParityPercentage: ((100 - logicDifferences) / 100) * 100,
  };
}

describe('CertificationGenerator', () => {
  let generator: CertificationGenerator;
  let mockVersionInfo: VersionInfo;

  beforeEach(() => {
    generator = createCertificationGenerator();
    mockVersionInfo = {
      packageVersion: '1.0.0',
      nodeVersion: 'v20.10.0',
    };
  });

  describe('generate()', () => {
    it('should generate valid markdown output', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Should be a non-empty string
      expect(certification).toBeTruthy();
      expect(typeof certification).toBe('string');
      
      // Should start with a markdown header
      expect(certification).toMatch(/^# /);
    });

    it('should include all required sections for passed certification', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Requirement 6.1: Generate certification document
      expect(certification).toContain('# Zork I TypeScript Implementation - Parity Certification');
      
      // Executive Summary
      expect(certification).toContain('## Executive Summary');
      expect(certification).toContain('CERTIFICATION: 100% LOGIC PARITY ACHIEVED');

      // Requirement 6.2: Test results from all seeds
      expect(certification).toContain('## Test Results by Seed');
      expect(certification).toContain('Total Seeds Tested:');

      // Requirement 6.3: Difference classification breakdown
      expect(certification).toContain('## Difference Classification Breakdown');
      expect(certification).toContain('RNG Differences');
      expect(certification).toContain('State Divergences');
      expect(certification).toContain('Logic Differences');

      // Requirement 6.4: Timestamp and version information
      expect(certification).toContain('## Version Information');
      expect(certification).toContain('Package Version');
      expect(certification).toContain('Certification Date');
      expect(certification).toContain('Certification ID');

      // Requirement 6.5: Zero logic differences confirmation
      expect(certification).toContain('## Logic Difference Confirmation');
      expect(certification).toContain('Zero Logic Differences Confirmed');
    });

    it('should include failed certification message when logic differences exist', () => {
      const results = createMockParityResults({ 
        passed: false, 
        logicDifferences: 3 
      });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('CERTIFICATION FAILED');
      expect(certification).toContain('Logic Differences Detected');
      expect(certification).toContain('3 logic difference(s)');
    });

    it('should include seed results table', () => {
      const results = createMockParityResults({ passed: true, totalTests: 3 });
      const certification = generator.generate(results, mockVersionInfo);

      // Should have table headers
      expect(certification).toContain('| Seed |');
      expect(certification).toContain('| Commands |');
      expect(certification).toContain('| Parity % |');
      
      // Should include seed numbers
      expect(certification).toContain('12345');
      expect(certification).toContain('67890');
      expect(certification).toContain('54321');
    });

    it('should include classification breakdown with counts', () => {
      const results = createMockParityResults({
        passed: true,
        rngDifferences: 10,
        stateDivergences: 5,
        logicDifferences: 0,
      });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('| RNG Differences |');
      expect(certification).toContain('| State Divergences |');
      expect(certification).toContain('| Logic Differences |');
      expect(certification).toContain('**Total Differences:** 15');
    });
  });

  describe('timestamp and version inclusion', () => {
    it('should include timestamp in certification', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Should have Generated timestamp
      expect(certification).toContain('**Generated:**');
      
      // Should have Certification Date in version section
      expect(certification).toContain('Certification Date');
    });

    it('should include version information', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('1.0.0');
      expect(certification).toContain('v20.10.0');
    });

    it('should generate unique certification ID', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Should contain certification ID pattern
      expect(certification).toMatch(/ZORK-PARITY-\d+\.\d+\.\d+-\d{8}-\d{6}/);
    });

    it('should include TypeScript version when provided', () => {
      const versionWithTs: VersionInfo = {
        ...mockVersionInfo,
        typescriptVersion: '5.3.0',
      };
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, versionWithTs);

      expect(certification).toContain('TypeScript Version');
      expect(certification).toContain('5.3.0');
    });
  });

  describe('markdown format validation', () => {
    it('should use proper markdown headers', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Should have h1 header
      expect(certification).toMatch(/^# /m);
      
      // Should have h2 headers for sections
      expect(certification).toMatch(/^## Executive Summary$/m);
      expect(certification).toMatch(/^## Test Results by Seed$/m);
      expect(certification).toMatch(/^## Difference Classification Breakdown$/m);
      expect(certification).toMatch(/^## Logic Difference Confirmation$/m);
      expect(certification).toMatch(/^## Version Information$/m);
    });

    it('should use proper markdown tables', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      // Tables should have header separator row
      expect(certification).toMatch(/\|[-|]+\|/);
    });

    it('should include methodology section', () => {
      const results = createMockParityResults({ passed: true });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('## Methodology');
      expect(certification).toContain('Multi-Seed Testing');
      expect(certification).toContain('Extended Sequences');
      expect(certification).toContain('Difference Classification');
    });
  });

  describe('options handling', () => {
    it('should use custom title when provided', () => {
      const customGenerator = createCertificationGenerator({
        title: 'Custom Certification Title',
      });
      const results = createMockParityResults({ passed: true });
      const certification = customGenerator.generate(results, mockVersionInfo);

      expect(certification).toContain('# Custom Certification Title');
    });

    it('should include notes when provided', () => {
      const customGenerator = createCertificationGenerator({
        notes: ['Note 1', 'Note 2'],
      });
      const results = createMockParityResults({ passed: true });
      const certification = customGenerator.generate(results, mockVersionInfo);

      expect(certification).toContain('## Additional Notes');
      expect(certification).toContain('Note 1');
      expect(certification).toContain('Note 2');
    });

    it('should respect includeDetailedResults option', () => {
      const noDetailsGenerator = createCertificationGenerator({
        includeDetailedResults: false,
      });
      const results = createMockParityResults({ passed: true });
      const certification = noDetailsGenerator.generate(results, mockVersionInfo);

      // Should not have detailed seed results table
      expect(certification).not.toContain('### Detailed Seed Results');
    });
  });

  describe('edge cases', () => {
    it('should handle zero differences', () => {
      const results = createMockParityResults({
        passed: true,
        rngDifferences: 0,
        stateDivergences: 0,
        logicDifferences: 0,
      });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('**Total Differences:** 0');
      expect(certification).toContain('Zero Logic Differences Confirmed');
    });

    it('should handle single seed test', () => {
      const results = createMockParityResults({
        passed: true,
        totalTests: 1,
      });
      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('**Total Seeds Tested:** 1');
    });

    it('should truncate long output strings', () => {
      const results = createMockParityResults({
        passed: false,
        logicDifferences: 1,
      });
      
      // Modify the difference to have long output
      const seedResult = results.seedResults.get(12345);
      if (seedResult) {
        const logicDiff = seedResult.differences.find(
          d => d.classification === 'LOGIC_DIFFERENCE'
        );
        if (logicDiff) {
          logicDiff.tsOutput = 'A'.repeat(200);
          logicDiff.zmOutput = 'B'.repeat(200);
        }
      }

      const certification = generator.generate(results, mockVersionInfo);
      
      // Should contain truncated output with ellipsis
      expect(certification).toContain('...');
    });
  });

  describe('real results integration (Requirements 5.3, 5.4, 5.5)', () => {
    it('should correctly process results with actual command outputs', () => {
      // Create results that simulate real validation output
      const realResults = createMockParityResults({
        passed: true,
        rngDifferences: 15,
        stateDivergences: 5,
        logicDifferences: 0,
        totalTests: 5,
      });

      // Add realistic command outputs to differences
      const seedResult = realResults.seedResults.get(12345);
      if (seedResult && seedResult.differences.length > 0) {
        seedResult.differences[0] = {
          commandIndex: 5,
          command: 'take house',
          tsOutput: 'A valiant attempt.',
          zmOutput: "You can't be serious.",
          classification: 'RNG_DIFFERENCE',
          reason: 'Both outputs are from the YUKS RNG pool',
        };
      }

      const certification = generator.generate(realResults, mockVersionInfo);

      // Should include the actual command in sample differences
      expect(certification).toContain('take house');
      // Should show actual parity percentage
      expect(certification).toContain('Overall Parity');
    });

    it('should report actual parity percentage from results', () => {
      const results = createMockParityResults({
        passed: true,
        totalTests: 10,
      });
      // Set a specific parity percentage
      results.overallParityPercentage = 87.5;

      const certification = generator.generate(results, mockVersionInfo);

      expect(certification).toContain('87.5');
    });

    it('should include real sample differences in output', () => {
      const results = createMockParityResults({
        passed: true,
        rngDifferences: 3,
        stateDivergences: 2,
        logicDifferences: 0,
      });

      // Add specific differences with real-looking outputs
      const seedResult = results.seedResults.get(12345);
      if (seedResult) {
        seedResult.differences = [
          {
            commandIndex: 10,
            command: 'hello troll',
            tsOutput: 'The troll ignores you.',
            zmOutput: 'The troll grunts.',
            classification: 'RNG_DIFFERENCE',
            reason: 'Both outputs are from the HELLOS RNG pool',
          },
          {
            commandIndex: 25,
            command: 'push button',
            tsOutput: 'Click.',
            zmOutput: 'Nothing happens.',
            classification: 'STATE_DIVERGENCE',
            reason: 'Game states have diverged due to accumulated RNG effects',
          },
        ];
      }

      const certification = generator.generate(results, mockVersionInfo);

      // Should include sample differences section
      expect(certification).toContain('### Sample Differences');
      // Should include the actual commands
      expect(certification).toContain('hello troll');
    });

    it('should handle results with high difference counts', () => {
      const results = createMockParityResults({
        passed: true,
        rngDifferences: 100,
        stateDivergences: 50,
        logicDifferences: 0,
        totalTests: 10,
      });

      const certification = generator.generate(results, mockVersionInfo);

      // Should still generate valid certification
      expect(certification).toContain('## Executive Summary');
      expect(certification).toContain('**Total Differences:** 150');
    });

    it('should handle results with failed seeds', () => {
      const results = createMockParityResults({
        passed: false,
        logicDifferences: 5,
        totalTests: 3,
      });

      // Mark one seed as failed
      const seedResult = results.seedResults.get(12345);
      if (seedResult) {
        seedResult.success = false;
        seedResult.error = 'Z-Machine process crashed';
      }

      const certification = generator.generate(results, mockVersionInfo);

      // Should still generate certification (with failure status)
      expect(certification).toContain('CERTIFICATION FAILED');
    });
  });

  describe('Z-Machine unavailability handling (Requirement 5.3)', () => {
    it('should handle empty seed results gracefully', () => {
      // Simulate what happens when Z-Machine is unavailable
      // and no real validation could be performed
      const emptyResults: ParityResults = {
        totalTests: 0,
        totalDifferences: 0,
        rngDifferences: 0,
        stateDivergences: 0,
        logicDifferences: 0,
        seedResults: new Map(),
        overallParityPercentage: 0,
        totalExecutionTime: 0,
        passed: false,
        summary: 'No tests could be run - Z-Machine unavailable',
        statusBarDifferences: 0,
        logicParityPercentage: 0,
      };

      const certification = generator.generate(emptyResults, mockVersionInfo);

      // Should still generate a valid document
      expect(certification).toContain('## Executive Summary');
      expect(certification).toContain('**Total Seeds Tested:** 0');
    });

    it('should indicate when no validation was performed', () => {
      const noValidationResults: ParityResults = {
        totalTests: 0,
        totalDifferences: 0,
        rngDifferences: 0,
        stateDivergences: 0,
        logicDifferences: 0,
        seedResults: new Map(),
        overallParityPercentage: 0,
        totalExecutionTime: 0,
        passed: false,
        summary: 'Validation could not be performed',
        statusBarDifferences: 0,
        logicParityPercentage: 0,
      };

      const certification = generator.generate(noValidationResults, mockVersionInfo);

      // Should show failed status when no tests run
      expect(certification).toContain('CERTIFICATION FAILED');
      // Should show 0 tests
      expect(certification).toContain('**Total Seeds Tested:** 0');
    });
  });
});
