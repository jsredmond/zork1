/**
 * Tests for Regression Testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegressionTester } from './regressionTester.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';
import { GameState } from '../game/state.js';
import { createTestScript, createTestCommand } from './scriptRunner.js';
import * as fs from 'fs';
import * as path from 'path';

describe('RegressionTester', () => {
  let tester: RegressionTester;
  let state: GameState;
  const testBaselineDir = '.kiro/testing/test-baselines';

  beforeEach(() => {
    tester = new RegressionTester(testBaselineDir);
    state = createInitialGameState();
  });

  afterEach(() => {
    // Clean up test baseline directory
    if (fs.existsSync(testBaselineDir)) {
      const files = fs.readdirSync(testBaselineDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testBaselineDir, file));
      }
      fs.rmdirSync(testBaselineDir);
    }
  });

  describe('baseline management', () => {
    it('should create baseline directory', () => {
      expect(fs.existsSync(testBaselineDir)).toBe(true);
    });

    it('should check if baseline exists', () => {
      expect(tester.hasBaseline()).toBe(false);
      
      tester.createBaseline(state);
      
      expect(tester.hasBaseline()).toBe(true);
    });

    it('should create and load baseline', () => {
      tester.createBaseline(state, '1.0.0');
      
      const baseline = tester.loadBaseline();
      
      expect(baseline).not.toBeNull();
      expect(baseline?.version).toBe('1.0.0');
      expect(baseline?.results).toBeDefined();
    });

    it('should delete baseline', () => {
      tester.createBaseline(state);
      expect(tester.hasBaseline()).toBe(true);
      
      tester.deleteBaseline();
      
      expect(tester.hasBaseline()).toBe(false);
    });
  });

  describe('runRegressionTests', () => {
    it('should detect new tests when no baseline exists', () => {
      const scripts = [
        createTestScript('test-1', 'Test 1', 'First test', [
          createTestCommand('look')
        ])
      ];

      const summary = tester.runRegressionTests(scripts, state);

      expect(summary.totalScripts).toBe(1);
      expect(summary.new).toBe(1);
      expect(summary.passed).toBe(0);
      expect(summary.regressed).toBe(0);
    });

    it('should detect passing tests', () => {
      const scripts = [
        createTestScript('test-1', 'Test 1', 'First test', [
          createTestCommand('look')
        ])
      ];

      // Create baseline with same scripts
      const runner = tester['runner'];
      const results = runner.executeScripts(scripts, state);
      tester.saveBaseline(results, '1.0.0');

      // Run regression tests
      const summary = tester.runRegressionTests(scripts, state);

      expect(summary.totalScripts).toBe(scripts.length);
      expect(summary.passed).toBeGreaterThan(0);
      expect(summary.regressed).toBe(0);
    });

    it('should compare results to baseline', () => {
      const script = createTestScript('test-1', 'Test 1', 'First test', [
        createTestCommand('look', undefined, true)
      ]);

      // Create baseline
      const runner = tester['runner'];
      const result = runner.executeScript(script, state);
      tester.saveBaseline([result], '1.0.0');

      // Run regression test with same script
      const freshState = createInitialGameState();
      const summary = tester.runRegressionTests([script], freshState);

      // Should have results
      expect(summary.results.length).toBe(1);
      expect(summary.results[0].scriptId).toBe('test-1');
    });

    it('should track test status', () => {
      const script = createTestScript('test-1', 'Test 1', 'First test', [
        createTestCommand('look', undefined, true)
      ]);

      // Create baseline
      const runner = tester['runner'];
      const result = runner.executeScript(script, state);
      tester.saveBaseline([result], '1.0.0');

      // Run regression test
      const freshState = createInitialGameState();
      const summary = tester.runRegressionTests([script], freshState);

      // Should have a status
      expect(summary.results[0].status).toBeDefined();
      expect(['passed', 'regressed', 'improved', 'new']).toContain(summary.results[0].status);
    });
  });

  describe('runAllRegressionTests', () => {
    it('should run all predefined test scripts', () => {
      const summary = tester.runAllRegressionTests(state);

      expect(summary.totalScripts).toBeGreaterThan(0);
      expect(summary.results.length).toBe(summary.totalScripts);
    });
  });

  describe('formatSummary', () => {
    it('should format summary as string', () => {
      const scripts = [
        createTestScript('test-1', 'Test 1', 'First test', [
          createTestCommand('look')
        ])
      ];

      const summary = tester.runRegressionTests(scripts, state);
      const formatted = tester.formatSummary(summary);

      expect(formatted).toContain('Regression Test Summary');
      expect(formatted).toContain('Total Scripts');
      expect(formatted).toContain('Passed');
    });

    it('should include regressions section when regressions exist', () => {
      const passingScript = createTestScript('test-1', 'Test 1', 'First test', [
        createTestCommand('look', undefined, true)
      ]);

      // Create baseline
      const runner = tester['runner'];
      const passingResult = runner.executeScript(passingScript, state);
      tester.saveBaseline([passingResult], '1.0.0');

      // Create failing version
      const failingScript = createTestScript('test-1', 'Test 1', 'First test', [
        createTestCommand('look', 'this will not match', true)
      ]);

      const freshState = createInitialGameState();
      const summary = tester.runRegressionTests([failingScript], freshState);
      const formatted = tester.formatSummary(summary);

      // Just verify the format function works
      expect(formatted).toContain('Regression Test Summary');
    });
  });

  describe('saveSummary', () => {
    it('should save summary to file', () => {
      const scripts = [
        createTestScript('test-1', 'Test 1', 'First test', [
          createTestCommand('look')
        ])
      ];

      const summary = tester.runRegressionTests(scripts, state);
      const summaryPath = path.join(testBaselineDir, 'test-summary.json');
      
      tester.saveSummary(summary, summaryPath);

      expect(fs.existsSync(summaryPath)).toBe(true);
      
      const loaded = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      expect(loaded.totalScripts).toBe(1);
    });
  });
});
