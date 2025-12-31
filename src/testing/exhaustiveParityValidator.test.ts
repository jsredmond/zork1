/**
 * Unit tests for ExhaustiveParityValidator
 * 
 * Tests multi-seed execution, command count verification, and result aggregation.
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ExhaustiveParityValidator,
  createExhaustiveParityValidator,
  DEFAULT_PARITY_CONFIG,
  ParityTestConfig,
  ParityResults,
  SeedResult,
} from './exhaustiveParityValidator.js';

describe('ExhaustiveParityValidator', () => {
  let validator: ExhaustiveParityValidator;

  beforeEach(() => {
    validator = createExhaustiveParityValidator();
  });

  describe('Configuration', () => {
    it('should use default configuration with 10 seeds', () => {
      const config = validator.getConfig();
      expect(config.seeds).toHaveLength(10);
      expect(config.seeds).toEqual([12345, 67890, 54321, 99999, 11111, 22222, 33333, 44444, 55555, 77777]);
    });

    it('should have default commandsPerSeed of 250', () => {
      const config = validator.getConfig();
      expect(config.commandsPerSeed).toBe(250);
    });

    it('should have default timeout of 5 minutes', () => {
      const config = validator.getConfig();
      expect(config.timeout).toBe(300000);
    });

    it('should allow custom configuration', () => {
      const customValidator = createExhaustiveParityValidator({
        seeds: [111, 222, 333],
        commandsPerSeed: 100,
        timeout: 60000,
      });
      
      const config = customValidator.getConfig();
      expect(config.seeds).toEqual([111, 222, 333]);
      expect(config.commandsPerSeed).toBe(100);
      expect(config.timeout).toBe(60000);
    });

    it('should allow updating configuration', () => {
      validator.setConfig({ commandsPerSeed: 150 });
      const config = validator.getConfig();
      expect(config.commandsPerSeed).toBe(150);
      // Other config should remain unchanged
      expect(config.seeds).toHaveLength(10);
    });
  });

  describe('Command Sequences', () => {
    it('should start with empty command sequences', () => {
      const config = validator.getConfig();
      expect(config.commandSequences).toEqual([]);
    });

    it('should allow adding command sequences', () => {
      validator.addCommandSequences([
        { id: 'test1', name: 'Test 1', commands: ['look', 'n', 's'] },
        { id: 'test2', name: 'Test 2', commands: ['inventory', 'wait'] },
      ]);
      
      const config = validator.getConfig();
      expect(config.commandSequences).toHaveLength(2);
      expect(config.commandSequences[0].id).toBe('test1');
      expect(config.commandSequences[1].id).toBe('test2');
    });

    it('should load sequences from directory', () => {
      const count = validator.loadDefaultSequences();
      expect(count).toBeGreaterThan(0);
      
      const config = validator.getConfig();
      // The config should have sequences loaded
      expect(config.commandSequences.length).toBeGreaterThan(0);
    });
  });

  describe('Single Seed Execution', () => {
    it('should run with a single seed and return result', async () => {
      // Use minimal config for fast test
      validator.setConfig({ commandsPerSeed: 10 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'inventory', 'n', 's', 'e', 'w'] },
      ]);

      const result = await validator.runWithSeed(12345);
      
      expect(result).toBeDefined();
      expect(result.seed).toBe(12345);
      expect(result.totalCommands).toBeGreaterThan(0);
      expect(result.success).toBe(true);
      expect(result.parityPercentage).toBeGreaterThanOrEqual(0);
      expect(result.parityPercentage).toBeLessThanOrEqual(100);
    });

    it('should track execution time', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'quick', name: 'Quick', commands: ['look', 'inventory'] },
      ]);

      const result = await validator.runWithSeed(12345);
      
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should classify differences correctly', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'test', name: 'Test', commands: ['look', 'n', 's'] },
      ]);

      const result = await validator.runWithSeed(12345);
      
      // All differences should be classified
      for (const diff of result.differences) {
        expect(['RNG_DIFFERENCE', 'STATE_DIVERGENCE', 'LOGIC_DIFFERENCE']).toContain(
          diff.classification
        );
      }
    });
  });

  describe('Multi-Seed Execution', () => {
    it('should run with multiple seeds', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'inventory'] },
      ]);

      const results = await validator.runWithSeeds([12345, 67890]);
      
      expect(results.totalTests).toBe(2);
      expect(results.seedResults.size).toBe(2);
      expect(results.seedResults.has(12345)).toBe(true);
      expect(results.seedResults.has(67890)).toBe(true);
    });

    it('should aggregate results correctly', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'inventory', 'n'] },
      ]);

      const results = await validator.runWithSeeds([12345, 67890, 54321]);
      
      expect(results.totalTests).toBe(3);
      expect(results.totalDifferences).toBeGreaterThanOrEqual(0);
      expect(results.rngDifferences).toBeGreaterThanOrEqual(0);
      expect(results.stateDivergences).toBeGreaterThanOrEqual(0);
      expect(results.logicDifferences).toBeGreaterThanOrEqual(0);
      
      // Sum of difference types should equal total
      expect(
        results.rngDifferences + results.stateDivergences + results.logicDifferences
      ).toBe(results.totalDifferences);
    });

    it('should calculate overall parity percentage', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'inventory'] },
      ]);

      const results = await validator.runWithSeeds([12345]);
      
      expect(results.overallParityPercentage).toBeGreaterThanOrEqual(0);
      expect(results.overallParityPercentage).toBeLessThanOrEqual(100);
    });

    it('should generate summary message', async () => {
      validator.setConfig({ commandsPerSeed: 5 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look'] },
      ]);

      const results = await validator.runWithSeeds([12345]);
      
      expect(results.summary).toBeDefined();
      expect(results.summary).toContain('Exhaustive Parity Validation Results');
      expect(results.summary).toContain('Seeds tested:');
      // Updated format: now shows Logic Parity as primary metric
      expect(results.summary).toContain('Logic Parity:');
      expect(results.summary).toContain('Overall Parity:');
      // Difference breakdown section
      expect(results.summary).toContain('Difference Breakdown:');
      expect(results.summary).toContain('Total classified:');
      // Status bar section (informational)
      expect(results.summary).toContain('Status Bar (informational):');
      expect(results.summary).toContain('Status bar differences:');
    });

    it('should use default seeds when none provided', async () => {
      validator.setConfig({ 
        commandsPerSeed: 3,
        seeds: [111, 222] // Override default seeds for faster test
      });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look'] },
      ]);

      const results = await validator.runWithSeeds();
      
      expect(results.totalTests).toBe(2);
    });
  });

  describe('Extended Sequence Execution', () => {
    it('should run extended sequence with specified command count', async () => {
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'inventory', 'n', 's'] },
      ]);

      const result = await validator.runExtendedSequence(12345, 20);
      
      expect(result.commandCount).toBeGreaterThanOrEqual(20);
      expect(result.seed).toBe(12345);
      expect(result.name).toBe('extended-sequence');
    });

    it('should detect logic differences in extended sequences', async () => {
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look', 'n', 's', 'e', 'w'] },
      ]);

      const result = await validator.runExtendedSequence(12345, 10);
      
      expect(typeof result.hasLogicDifferences).toBe('boolean');
    });

    it('should track execution time for extended sequences', async () => {
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look'] },
      ]);

      const result = await validator.runExtendedSequence(12345, 5);
      
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Difference Classification', () => {
    it('should classify individual differences', () => {
      const classified = validator.classifyDifference(
        'Hello.',
        'Good day.',
        'hello',
        1
      );
      
      expect(classified).toBeDefined();
      expect(classified.command).toBe('hello');
      expect(classified.commandIndex).toBe(1);
      expect(['RNG_DIFFERENCE', 'STATE_DIVERGENCE', 'LOGIC_DIFFERENCE']).toContain(
        classified.classification
      );
    });

    it('should provide reason for classification', () => {
      const classified = validator.classifyDifference(
        'A valiant attempt.',
        'What a concept!',
        'xyzzy',
        0
      );
      
      expect(classified.reason).toBeDefined();
      expect(classified.reason.length).toBeGreaterThan(0);
    });
  });

  describe('Result Validation', () => {
    it('should pass when no logic differences', async () => {
      validator.setConfig({ commandsPerSeed: 3 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look'] },
      ]);

      const results = await validator.runWithSeeds([12345]);
      
      // Without Z-Machine, should pass (TS-only mode)
      expect(results.passed).toBe(true);
    });

    it('should track total execution time', async () => {
      validator.setConfig({ commandsPerSeed: 3 });
      validator.addCommandSequences([
        { id: 'basic', name: 'Basic', commands: ['look'] },
      ]);

      const results = await validator.runWithSeeds([12345, 67890]);
      
      expect(results.totalExecutionTime).toBeGreaterThan(0);
    });
  });
});

describe('DEFAULT_PARITY_CONFIG', () => {
  it('should have 10 seeds as required', () => {
    expect(DEFAULT_PARITY_CONFIG.seeds).toHaveLength(10);
  });

  it('should have commandsPerSeed of 250', () => {
    expect(DEFAULT_PARITY_CONFIG.commandsPerSeed).toBe(250);
  });

  it('should have timeout of 5 minutes', () => {
    expect(DEFAULT_PARITY_CONFIG.timeout).toBe(300000);
  });

  it('should have comparison options configured', () => {
    expect(DEFAULT_PARITY_CONFIG.comparisonOptions).toBeDefined();
    expect(DEFAULT_PARITY_CONFIG.comparisonOptions?.normalizeWhitespace).toBe(true);
    expect(DEFAULT_PARITY_CONFIG.comparisonOptions?.stripStatusBar).toBe(true);
    expect(DEFAULT_PARITY_CONFIG.comparisonOptions?.stripGameHeader).toBe(true);
  });
});
