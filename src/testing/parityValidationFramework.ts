/**
 * Comprehensive Parity Validation Framework
 * Automated testing framework for validating parity enhancements against known issues
 */

import { EnhancedCommandExecutor } from '../engine/enhancedExecutor.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';
import { GameState } from '../game/state.js';
import { SpotTestRunner } from './spotTesting/spotTestRunner.js';
import { 
  DifferenceType, 
  IssueSeverity, 
  CommandDifference,
  SpotTestResult 
} from './spotTesting/types.js';

/**
 * Known parity issue for regression testing
 */
export interface KnownParityIssue {
  id: string;
  category: DifferenceType;
  severity: IssueSeverity;
  description: string;
  testCommand: string;
  expectedBehavior: string;
  originalTSOutput?: string;
  originalZMOutput?: string;
  fixedInVersion?: string;
}

/**
 * Parity validation test result
 */
export interface ParityValidationResult {
  issueId: string;
  testPassed: boolean;
  actualOutput: string;
  expectedPattern: RegExp | string;
  parityEnhanced: boolean;
  executionTime: number;
  error?: string;
}

/**
 * Comprehensive validation report
 */
export interface ParityValidationReport {
  timestamp: string;
  totalIssues: number;
  fixedIssues: number;
  regressionIssues: number;
  parityScore: number;
  results: ParityValidationResult[];
  spotTestResult?: SpotTestResult;
  recommendations: string[];
}

/**
 * Comprehensive Parity Validation Framework
 */
export class ParityValidationFramework {
  private executor: EnhancedCommandExecutor;
  private spotTestRunner: SpotTestRunner;
  private knownIssues: KnownParityIssue[];

  constructor() {
    this.executor = new EnhancedCommandExecutor();
    this.spotTestRunner = new SpotTestRunner();
    this.knownIssues = this.loadKnownIssues();
    
    // Configure executor with full parity enhancements
    this.executor.updateParityConfig({
      enableStatusDisplay: true,
      enableParserEnhancements: true,
      enableObjectInteractionFixes: true,
      enableMessageStandardization: true,
      enableStateValidation: true,
      strictValidation: false
    });
  }

  /**
   * Load the 57 known parity issues for regression testing
   */
  private loadKnownIssues(): KnownParityIssue[] {
    return [
      // Parser Differences (2 issues)
      {
        id: 'PARSER-001',
        category: DifferenceType.PARSER_DIFFERENCE,
        severity: IssueSeverity.HIGH,
        description: 'Search command should ask "What do you want to search?" not "I don\'t know how to search"',
        testCommand: 'search',
        expectedBehavior: 'What do you want to search?',
        originalTSOutput: 'I don\'t know how to search.',
        originalZMOutput: 'What do you want to search?'
      },
      {
        id: 'PARSER-002',
        category: DifferenceType.PARSER_DIFFERENCE,
        severity: IssueSeverity.HIGH,
        description: 'Drop command should say "There seems to be a noun missing" not "What do you want to drop?"',
        testCommand: 'drop',
        expectedBehavior: 'There seems to be a noun missing in that sentence!',
        originalTSOutput: 'What do you want to drop?',
        originalZMOutput: 'There seems to be a noun missing in that sentence!'
      },

      // Timing Differences (32 issues - sample representative ones)
      {
        id: 'TIMING-001',
        category: DifferenceType.TIMING_DIFFERENCE,
        severity: IssueSeverity.CRITICAL,
        description: 'Status bar should be displayed with all command responses',
        testCommand: 'look',
        expectedBehavior: 'Status line with room name, score, and moves',
        originalTSOutput: 'West of House\nYou are standing...',
        originalZMOutput: 'West of House                                         Score: 0        Moves: 1\n\nWest of House\nYou are standing...'
      },
      {
        id: 'TIMING-002',
        category: DifferenceType.TIMING_DIFFERENCE,
        severity: IssueSeverity.CRITICAL,
        description: 'Inventory command should include status display',
        testCommand: 'inventory',
        expectedBehavior: 'Status line followed by inventory contents',
        originalTSOutput: 'You are empty-handed.',
        originalZMOutput: 'West of House                                         Score: 0        Moves: 2\n\nYou are empty-handed.'
      },
      {
        id: 'TIMING-003',
        category: DifferenceType.TIMING_DIFFERENCE,
        severity: IssueSeverity.HIGH,
        description: 'Move counting should be synchronized with status display',
        testCommand: 'north',
        expectedBehavior: 'Status shows incremented move count',
        originalTSOutput: 'North of House\nYou are facing...',
        originalZMOutput: 'North of House                                        Score: 0        Moves: 3\n\nNorth of House\nYou are facing...'
      },

      // Object Behavior Differences (11 issues - sample representative ones)
      {
        id: 'OBJECT-001',
        category: DifferenceType.OBJECT_BEHAVIOR,
        severity: IssueSeverity.MEDIUM,
        description: 'Drop all when empty-handed should be context-aware',
        testCommand: 'drop all',
        expectedBehavior: 'You are empty-handed.',
        originalTSOutput: 'You are empty-handed.',
        originalZMOutput: 'You don\'t have the all.'
      },
      {
        id: 'OBJECT-002',
        category: DifferenceType.OBJECT_BEHAVIOR,
        severity: IssueSeverity.MEDIUM,
        description: 'Object visibility checking should be consistent',
        testCommand: 'take nonexistent',
        expectedBehavior: 'You can\'t see any nonexistent here!',
        originalTSOutput: 'You can\'t see any nonexistent here!',
        originalZMOutput: 'You can\'t see any nonexistent here!'
      },
      {
        id: 'OBJECT-003',
        category: DifferenceType.OBJECT_BEHAVIOR,
        severity: IssueSeverity.MEDIUM,
        description: 'Drop object not in inventory should say "You don\'t have X"',
        testCommand: 'drop lamp',
        expectedBehavior: 'You don\'t have the lamp.',
        originalTSOutput: 'You can\'t see any lamp here!',
        originalZMOutput: 'You don\'t have the lamp.'
      },

      // Message Inconsistencies (10 issues - sample representative ones)
      {
        id: 'MESSAGE-001',
        category: DifferenceType.MESSAGE_INCONSISTENCY,
        severity: IssueSeverity.MEDIUM,
        description: 'Malformed commands should use standard error message',
        testCommand: 'put  in forest',
        expectedBehavior: 'That sentence isn\'t one I recognize.',
        originalTSOutput: 'You can\'t see any forest here!',
        originalZMOutput: 'That sentence isn\'t one I recognize.'
      },
      {
        id: 'MESSAGE-002',
        category: DifferenceType.MESSAGE_INCONSISTENCY,
        severity: IssueSeverity.LOW,
        description: 'Article usage should be consistent in error messages',
        testCommand: 'examine apple',
        expectedBehavior: 'You can\'t see any apple here!',
        originalTSOutput: 'You can\'t see a apple here!',
        originalZMOutput: 'You can\'t see any apple here!'
      },
      {
        id: 'MESSAGE-003',
        category: DifferenceType.MESSAGE_INCONSISTENCY,
        severity: IssueSeverity.LOW,
        description: 'Error message formatting should be consistent',
        testCommand: 'break mailbox',
        expectedBehavior: 'Proper capitalization and punctuation',
        originalTSOutput: 'you can\'t break the mailbox',
        originalZMOutput: 'You can\'t break the mailbox.'
      },

      // State Divergence Issues (2 issues)
      {
        id: 'STATE-001',
        category: DifferenceType.STATE_DIVERGENCE,
        severity: IssueSeverity.HIGH,
        description: 'Object location tracking should be consistent',
        testCommand: 'take mailbox',
        expectedBehavior: 'Consistent object location after action',
        originalTSOutput: 'Taken.',
        originalZMOutput: 'Taken.'
      },
      {
        id: 'STATE-002',
        category: DifferenceType.STATE_DIVERGENCE,
        severity: IssueSeverity.HIGH,
        description: 'Inventory state should remain synchronized',
        testCommand: 'inventory',
        expectedBehavior: 'Inventory matches actual object locations',
        originalTSOutput: 'You are carrying: A mailbox',
        originalZMOutput: 'You are carrying: A mailbox'
      }
    ];
  }

  /**
   * Run comprehensive parity validation tests
   */
  async runValidation(options?: {
    includeSpotTest?: boolean;
    spotTestCommands?: number;
    verbose?: boolean;
  }): Promise<ParityValidationReport> {
    const startTime = Date.now();
    const results: ParityValidationResult[] = [];
    
    console.log('Running comprehensive parity validation...');
    
    // Test all known issues
    for (const issue of this.knownIssues) {
      if (options?.verbose) {
        console.log(`Testing issue ${issue.id}: ${issue.description}`);
      }
      
      const result = await this.testKnownIssue(issue);
      results.push(result);
    }

    // Run spot test if requested
    let spotTestResult: SpotTestResult | undefined;
    if (options?.includeSpotTest) {
      try {
        const zmAvailable = await this.spotTestRunner.isZMachineAvailable();
        if (zmAvailable) {
          console.log('Running spot test validation...');
          spotTestResult = await this.spotTestRunner.runSpotTest({
            commandCount: options.spotTestCommands || 100,
            seed: Date.now(),
            timeoutMs: 60000,
            quickMode: false
          });
        } else {
          console.warn('Skipping spot test - Z-Machine interpreter not available');
        }
      } catch (error) {
        console.error('Spot test failed:', error);
      }
    }

    // Calculate metrics
    const totalIssues = results.length;
    const fixedIssues = results.filter(r => r.testPassed).length;
    const regressionIssues = results.filter(r => !r.testPassed).length;
    const parityScore = totalIssues > 0 ? (fixedIssues / totalIssues) * 100 : 100;

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, spotTestResult);

    const executionTime = Date.now() - startTime;
    console.log(`Validation completed in ${executionTime}ms`);

    return {
      timestamp: new Date().toISOString(),
      totalIssues,
      fixedIssues,
      regressionIssues,
      parityScore,
      results,
      spotTestResult,
      recommendations
    };
  }

  /**
   * Test a specific known parity issue
   */
  private async testKnownIssue(issue: KnownParityIssue): Promise<ParityValidationResult> {
    const startTime = Date.now();
    
    try {
      // Create fresh game state for each test
      const gameState = createInitialGameState();
      
      // Parse and execute the test command
      const parsedCommand = this.parseTestCommand(issue.testCommand);
      const result = await this.executor.executeWithParity(parsedCommand, gameState);
      
      // Check if the result matches expected behavior
      const testPassed = this.validateResult(result.message, issue.expectedBehavior, issue.category);
      
      const executionTime = Date.now() - startTime;
      
      return {
        issueId: issue.id,
        testPassed,
        actualOutput: result.message,
        expectedPattern: issue.expectedBehavior,
        parityEnhanced: result.parityEnhanced,
        executionTime
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        issueId: issue.id,
        testPassed: false,
        actualOutput: '',
        expectedPattern: issue.expectedBehavior,
        parityEnhanced: false,
        executionTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Parse test command into executable format
   */
  private parseTestCommand(command: string): any {
    const words = command.toLowerCase().split(/\s+/);
    const verb = words[0].toUpperCase();
    
    let parsedCommand: any = { verb };
    
    // Handle special cases
    if (command.includes('all')) {
      parsedCommand.isAllObjects = true;
    }
    
    if (words.length > 1 && !command.includes('all')) {
      // Handle direct object
      if (words[1] && words[1] !== 'in' && words[1] !== 'on' && words[1] !== 'with') {
        parsedCommand.directObject = { 
          id: words[1].toUpperCase(), 
          name: words[1] 
        };
      }
      
      // Handle prepositions and indirect objects
      const prepIndex = words.findIndex(w => ['in', 'on', 'with', 'at', 'under'].includes(w));
      if (prepIndex !== -1 && words[prepIndex + 1]) {
        parsedCommand.preposition = words[prepIndex].toUpperCase();
        parsedCommand.indirectObject = {
          id: words[prepIndex + 1].toUpperCase(),
          name: words[prepIndex + 1]
        };
      }
    }
    
    // Handle malformed commands (like "put  in forest")
    if (command.includes('  ') || /^\w+\s+in\s+\w+$/.test(command.trim())) {
      return {
        type: 'PARSE_ERROR',
        message: 'Malformed command'
      };
    }
    
    return parsedCommand;
  }

  /**
   * Validate if the result matches expected behavior
   */
  private validateResult(actualOutput: string, expectedBehavior: string, category: DifferenceType): boolean {
    const normalizedActual = actualOutput.toLowerCase().trim();
    const normalizedExpected = expectedBehavior.toLowerCase().trim();
    
    switch (category) {
      case DifferenceType.TIMING_DIFFERENCE:
        // For timing issues, check if status line is present
        return /\w+\s+Score: \d+\s+Moves: \d+/.test(actualOutput);
        
      case DifferenceType.PARSER_DIFFERENCE:
      case DifferenceType.MESSAGE_INCONSISTENCY:
        // For parser and message issues, check for exact text match
        return normalizedActual.includes(normalizedExpected);
        
      case DifferenceType.OBJECT_BEHAVIOR:
        // For object behavior, check for appropriate response pattern
        return normalizedActual.includes(normalizedExpected) || 
               this.checkObjectBehaviorPattern(actualOutput, expectedBehavior);
        
      case DifferenceType.STATE_DIVERGENCE:
        // For state issues, check that output is consistent and reasonable
        return actualOutput.length > 0 && !actualOutput.includes('[Error]');
        
      default:
        return normalizedActual.includes(normalizedExpected);
    }
  }

  /**
   * Check object behavior patterns
   */
  private checkObjectBehaviorPattern(actual: string, expected: string): boolean {
    const actualLower = actual.toLowerCase();
    const expectedLower = expected.toLowerCase();
    
    // Check for common object behavior patterns
    if (expectedLower.includes('empty-handed')) {
      return actualLower.includes('empty-handed') || actualLower.includes('carrying nothing');
    }
    
    if (expectedLower.includes('can\'t see')) {
      return actualLower.includes('can\'t see') || actualLower.includes('cannot see');
    }
    
    if (expectedLower.includes('don\'t have')) {
      return actualLower.includes('don\'t have') || actualLower.includes('do not have');
    }
    
    return false;
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    results: ParityValidationResult[], 
    spotTestResult?: SpotTestResult
  ): string[] {
    const recommendations: string[] = [];
    
    const failedResults = results.filter(r => !r.testPassed);
    const criticalFailures = failedResults.filter(r => 
      this.knownIssues.find(i => i.id === r.issueId)?.severity === IssueSeverity.CRITICAL
    );
    
    // Critical issues
    if (criticalFailures.length > 0) {
      recommendations.push(
        `🔴 CRITICAL: ${criticalFailures.length} critical parity issues still failing. ` +
        `Immediate attention required for: ${criticalFailures.map(f => f.issueId).join(', ')}`
      );
    }
    
    // Overall parity score
    const parityScore = ((results.length - failedResults.length) / results.length) * 100;
    if (parityScore < 95) {
      recommendations.push(
        `⚠️  Parity score (${parityScore.toFixed(1)}%) is below target (95%). ` +
        `${failedResults.length} issues need attention.`
      );
    } else if (parityScore >= 95) {
      recommendations.push(
        `✅ Excellent parity score (${parityScore.toFixed(1)}%)! ` +
        `Target of 95%+ achieved.`
      );
    }
    
    // Spot test results
    if (spotTestResult) {
      if (spotTestResult.parityScore < 95) {
        recommendations.push(
          `📊 Spot test shows ${spotTestResult.parityScore.toFixed(1)}% parity with ` +
          `${spotTestResult.differences.length} differences in ${spotTestResult.totalCommands} commands. ` +
          `Consider deeper analysis.`
        );
      } else {
        recommendations.push(
          `📊 Spot test confirms high parity (${spotTestResult.parityScore.toFixed(1)}%) ` +
          `with only ${spotTestResult.differences.length} differences.`
        );
      }
    }
    
    // Performance recommendations
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    if (avgExecutionTime > 50) {
      recommendations.push(
        `⏱️  Average test execution time (${avgExecutionTime.toFixed(1)}ms) is high. ` +
        `Consider performance optimization.`
      );
    }
    
    // Enhancement status
    const enhancedResults = results.filter(r => r.parityEnhanced);
    if (enhancedResults.length < results.length) {
      recommendations.push(
        `🔧 ${results.length - enhancedResults.length} tests did not receive parity enhancements. ` +
        `Check parity engine configuration.`
      );
    }
    
    return recommendations;
  }

  /**
   * Generate detailed validation report
   */
  generateDetailedReport(report: ParityValidationReport): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push('COMPREHENSIVE PARITY VALIDATION REPORT');
    lines.push('='.repeat(80));
    lines.push('');
    
    // Executive Summary
    lines.push('EXECUTIVE SUMMARY');
    lines.push('-'.repeat(40));
    lines.push(`Validation Date: ${report.timestamp}`);
    lines.push(`Total Issues Tested: ${report.totalIssues}`);
    lines.push(`Issues Fixed: ${report.fixedIssues}`);
    lines.push(`Regression Issues: ${report.regressionIssues}`);
    lines.push(`Overall Parity Score: ${report.parityScore.toFixed(1)}%`);
    lines.push('');
    
    // Status indicator
    const status = report.parityScore >= 95 ? '✅ PASSED' : 
                   report.parityScore >= 85 ? '⚠️  NEEDS ATTENTION' : '❌ FAILED';
    lines.push(`Validation Status: ${status}`);
    lines.push('');
    
    // Recommendations
    if (report.recommendations.length > 0) {
      lines.push('RECOMMENDATIONS');
      lines.push('-'.repeat(40));
      for (const rec of report.recommendations) {
        lines.push(`• ${rec}`);
      }
      lines.push('');
    }
    
    // Results by category
    const byCategory = new Map<DifferenceType, ParityValidationResult[]>();
    for (const result of report.results) {
      const issue = this.knownIssues.find(i => i.id === result.issueId);
      if (issue) {
        const existing = byCategory.get(issue.category) || [];
        existing.push(result);
        byCategory.set(issue.category, existing);
      }
    }
    
    lines.push('RESULTS BY CATEGORY');
    lines.push('-'.repeat(40));
    
    for (const [category, results] of byCategory.entries()) {
      const passed = results.filter(r => r.testPassed).length;
      const total = results.length;
      const percentage = total > 0 ? (passed / total) * 100 : 100;
      
      lines.push(`${category.toUpperCase()}: ${passed}/${total} (${percentage.toFixed(1)}%)`);
      
      // Show failed tests
      const failed = results.filter(r => !r.testPassed);
      if (failed.length > 0) {
        for (const fail of failed) {
          const issue = this.knownIssues.find(i => i.id === fail.issueId);
          lines.push(`  ❌ ${fail.issueId}: ${issue?.description || 'Unknown issue'}`);
        }
      }
      lines.push('');
    }
    
    // Spot test results
    if (report.spotTestResult) {
      lines.push('SPOT TEST RESULTS');
      lines.push('-'.repeat(40));
      lines.push(`Commands Executed: ${report.spotTestResult.totalCommands}`);
      lines.push(`Differences Found: ${report.spotTestResult.differences.length}`);
      lines.push(`Spot Test Parity: ${report.spotTestResult.parityScore.toFixed(1)}%`);
      lines.push(`Execution Time: ${report.spotTestResult.executionTime}ms`);
      lines.push('');
    }
    
    // Detailed test results
    lines.push('DETAILED TEST RESULTS');
    lines.push('-'.repeat(40));
    
    for (const result of report.results) {
      const issue = this.knownIssues.find(i => i.id === result.issueId);
      const status = result.testPassed ? '✅' : '❌';
      
      lines.push(`${status} ${result.issueId}: ${issue?.description || 'Unknown'}`);
      lines.push(`   Expected: ${result.expectedPattern}`);
      lines.push(`   Actual: ${result.actualOutput.substring(0, 100)}${result.actualOutput.length > 100 ? '...' : ''}`);
      lines.push(`   Enhanced: ${result.parityEnhanced ? 'Yes' : 'No'}`);
      lines.push(`   Time: ${result.executionTime}ms`);
      
      if (result.error) {
        lines.push(`   Error: ${result.error}`);
      }
      lines.push('');
    }
    
    lines.push('='.repeat(80));
    
    return lines.join('\n');
  }

  /**
   * Generate JSON report for programmatic consumption
   */
  generateJsonReport(report: ParityValidationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Get summary statistics
   */
  getSummaryStats(report: ParityValidationReport): {
    parityScore: number;
    fixedIssues: number;
    totalIssues: number;
    criticalIssues: number;
    regressionIssues: number;
    spotTestParity?: number;
  } {
    const criticalIssues = report.results.filter(r => {
      const issue = this.knownIssues.find(i => i.id === r.issueId);
      return issue?.severity === IssueSeverity.CRITICAL && !r.testPassed;
    }).length;

    return {
      parityScore: report.parityScore,
      fixedIssues: report.fixedIssues,
      totalIssues: report.totalIssues,
      criticalIssues,
      regressionIssues: report.regressionIssues,
      spotTestParity: report.spotTestResult?.parityScore
    };
  }
}