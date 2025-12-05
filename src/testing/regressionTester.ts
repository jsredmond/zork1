/**
 * Regression Testing
 * Runs test scripts and compares results to baseline to detect regressions
 */

import { GameState } from '../game/state.js';
import { ScriptRunner, TestScript, ScriptExecutionResult } from './scriptRunner.js';
import { getAllTestScripts } from './testScripts.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Baseline test results for comparison
 */
export interface BaselineResults {
  version: string;
  timestamp: Date;
  results: Record<string, ScriptExecutionResult>;
}

/**
 * Regression test result comparing current run to baseline
 */
export interface RegressionTestResult {
  scriptId: string;
  scriptName: string;
  status: 'passed' | 'regressed' | 'improved' | 'new';
  baselinePassed?: boolean;
  currentPassed: boolean;
  baselinePassedCommands?: number;
  currentPassedCommands: number;
  baselineFailedCommands?: number;
  currentFailedCommands: number;
  differences: string[];
}

/**
 * Summary of regression test run
 */
export interface RegressionTestSummary {
  totalScripts: number;
  passed: number;
  regressed: number;
  improved: number;
  new: number;
  results: RegressionTestResult[];
  timestamp: Date;
}

/**
 * RegressionTester runs test scripts and compares to baseline
 */
export class RegressionTester {
  private runner: ScriptRunner;
  private baselineDir: string;

  constructor(baselineDir: string = '.kiro/testing/baselines') {
    this.runner = new ScriptRunner();
    this.baselineDir = baselineDir;
    this.ensureBaselineDir();
  }

  /**
   * Ensure baseline directory exists
   */
  private ensureBaselineDir(): void {
    if (!fs.existsSync(this.baselineDir)) {
      fs.mkdirSync(this.baselineDir, { recursive: true });
    }
  }

  /**
   * Get path to baseline file
   */
  private getBaselinePath(): string {
    return path.join(this.baselineDir, 'baseline.json');
  }

  /**
   * Save baseline results
   */
  saveBaseline(results: ScriptExecutionResult[], version: string = '1.0.0'): void {
    const baseline: BaselineResults = {
      version,
      timestamp: new Date(),
      results: {}
    };

    for (const result of results) {
      baseline.results[result.scriptId] = result;
    }

    const baselinePath = this.getBaselinePath();
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), 'utf-8');
  }

  /**
   * Load baseline results
   */
  loadBaseline(): BaselineResults | null {
    const baselinePath = this.getBaselinePath();
    
    if (!fs.existsSync(baselinePath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(baselinePath, 'utf-8');
      const baseline = JSON.parse(data);
      
      // Convert timestamp string back to Date
      baseline.timestamp = new Date(baseline.timestamp);
      
      return baseline;
    } catch (error) {
      console.error('Error loading baseline:', error);
      return null;
    }
  }

  /**
   * Run regression tests against baseline
   */
  runRegressionTests(
    scripts: TestScript[],
    state: GameState
  ): RegressionTestSummary {
    // Load baseline
    const baseline = this.loadBaseline();

    // Execute all scripts
    const currentResults = this.runner.executeScripts(scripts, state);

    // Compare results
    const regressionResults: RegressionTestResult[] = [];
    let passed = 0;
    let regressed = 0;
    let improved = 0;
    let newTests = 0;

    for (const currentResult of currentResults) {
      const baselineResult = baseline?.results[currentResult.scriptId];
      const comparison = this.compareResults(baselineResult, currentResult);
      
      regressionResults.push(comparison);

      switch (comparison.status) {
        case 'passed':
          passed++;
          break;
        case 'regressed':
          regressed++;
          break;
        case 'improved':
          improved++;
          break;
        case 'new':
          newTests++;
          break;
      }
    }

    return {
      totalScripts: scripts.length,
      passed,
      regressed,
      improved,
      new: newTests,
      results: regressionResults,
      timestamp: new Date()
    };
  }

  /**
   * Compare current result to baseline
   */
  private compareResults(
    baseline: ScriptExecutionResult | undefined,
    current: ScriptExecutionResult
  ): RegressionTestResult {
    // New test (no baseline)
    if (!baseline) {
      return {
        scriptId: current.scriptId,
        scriptName: current.scriptName,
        status: 'new',
        currentPassed: current.passed,
        currentPassedCommands: current.passedCommands,
        currentFailedCommands: current.failedCommands,
        differences: ['New test - no baseline to compare']
      };
    }

    const differences: string[] = [];

    // Check if pass/fail status changed
    if (baseline.passed !== current.passed) {
      if (baseline.passed && !current.passed) {
        differences.push('Test now fails (was passing)');
      } else {
        differences.push('Test now passes (was failing)');
      }
    }

    // Check if number of passed commands changed
    if (baseline.passedCommands !== current.passedCommands) {
      differences.push(
        `Passed commands changed: ${baseline.passedCommands} → ${current.passedCommands}`
      );
    }

    // Check if number of failed commands changed
    if (baseline.failedCommands !== current.failedCommands) {
      differences.push(
        `Failed commands changed: ${baseline.failedCommands} → ${current.failedCommands}`
      );
    }

    // Determine status
    let status: 'passed' | 'regressed' | 'improved';
    if (differences.length === 0) {
      status = 'passed';
    } else if (baseline.passed && !current.passed) {
      status = 'regressed';
    } else if (!baseline.passed && current.passed) {
      status = 'improved';
    } else if (current.passedCommands < baseline.passedCommands) {
      status = 'regressed';
    } else if (current.passedCommands > baseline.passedCommands) {
      status = 'improved';
    } else {
      status = 'passed';
    }

    return {
      scriptId: current.scriptId,
      scriptName: current.scriptName,
      status,
      baselinePassed: baseline.passed,
      currentPassed: current.passed,
      baselinePassedCommands: baseline.passedCommands,
      currentPassedCommands: current.passedCommands,
      baselineFailedCommands: baseline.failedCommands,
      currentFailedCommands: current.failedCommands,
      differences
    };
  }

  /**
   * Run all predefined test scripts as regression tests
   */
  runAllRegressionTests(state: GameState): RegressionTestSummary {
    const scripts = getAllTestScripts();
    return this.runRegressionTests(scripts, state);
  }

  /**
   * Create baseline from current test run
   */
  createBaseline(state: GameState, version: string = '1.0.0'): void {
    const scripts = getAllTestScripts();
    const results = this.runner.executeScripts(scripts, state);
    this.saveBaseline(results, version);
  }

  /**
   * Check if baseline exists
   */
  hasBaseline(): boolean {
    return fs.existsSync(this.getBaselinePath());
  }

  /**
   * Delete baseline
   */
  deleteBaseline(): void {
    const baselinePath = this.getBaselinePath();
    if (fs.existsSync(baselinePath)) {
      fs.unlinkSync(baselinePath);
    }
  }

  /**
   * Format regression test summary as string
   */
  formatSummary(summary: RegressionTestSummary): string {
    const lines: string[] = [];
    
    lines.push('=== Regression Test Summary ===');
    lines.push(`Timestamp: ${summary.timestamp.toISOString()}`);
    lines.push(`Total Scripts: ${summary.totalScripts}`);
    lines.push(`Passed: ${summary.passed}`);
    lines.push(`Regressed: ${summary.regressed}`);
    lines.push(`Improved: ${summary.improved}`);
    lines.push(`New: ${summary.new}`);
    lines.push('');

    if (summary.regressed > 0) {
      lines.push('=== REGRESSIONS ===');
      for (const result of summary.results) {
        if (result.status === 'regressed') {
          lines.push(`❌ ${result.scriptName} (${result.scriptId})`);
          for (const diff of result.differences) {
            lines.push(`   - ${diff}`);
          }
        }
      }
      lines.push('');
    }

    if (summary.improved > 0) {
      lines.push('=== IMPROVEMENTS ===');
      for (const result of summary.results) {
        if (result.status === 'improved') {
          lines.push(`✅ ${result.scriptName} (${result.scriptId})`);
          for (const diff of result.differences) {
            lines.push(`   - ${diff}`);
          }
        }
      }
      lines.push('');
    }

    if (summary.new > 0) {
      lines.push('=== NEW TESTS ===');
      for (const result of summary.results) {
        if (result.status === 'new') {
          lines.push(`🆕 ${result.scriptName} (${result.scriptId})`);
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Save regression test summary to file
   */
  saveSummary(summary: RegressionTestSummary, filename?: string): void {
    const summaryPath = filename || path.join(
      this.baselineDir,
      `regression-${Date.now()}.json`
    );
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  }
}
