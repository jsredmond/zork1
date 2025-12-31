/**
 * Spot Test Runner
 * Coordinates execution of random commands on both TypeScript and Z-Machine implementations
 * for quick parity validation
 */

import { RandomCommandGenerator } from './randomCommandGenerator.js';
import { TypeScriptRecorder } from '../recording/tsRecorder.js';
import { ZMachineRecorder } from '../recording/zmRecorder.js';
import { QuickValidator } from './quickValidator.js';
import { existsSync } from 'fs';
import { 
  SpotTestConfig, 
  SpotTestResult, 
  CommandResult, 
  CommandDifference,
  IssuePattern,
  SpotTestMetrics,
  DifferenceType,
  IssueSeverity,
  ValidationConfig
} from './types.js';
import { createInitialGameState } from '../../game/factories/gameFactory.js';

/**
 * Default configuration for spot testing
 */
const DEFAULT_CONFIG: SpotTestConfig = {
  commandCount: 50,
  seed: Date.now(),
  timeoutMs: 30000,
  quickMode: false,
  focusAreas: undefined
};

/**
 * SpotTestRunner coordinates the execution of random commands
 * on both TypeScript and Z-Machine implementations for quick parity validation
 */
export class SpotTestRunner {
  private commandGenerator: RandomCommandGenerator;
  private tsRecorder: TypeScriptRecorder;
  private zmRecorder: ZMachineRecorder | null = null;
  private validator: QuickValidator;

  constructor() {
    this.commandGenerator = new RandomCommandGenerator();
    this.tsRecorder = new TypeScriptRecorder();
    this.validator = new QuickValidator();
    
    // Try to initialize Z-Machine recorder with common interpreter paths
    this.zmRecorder = this.initializeZMachineRecorder();
  }

  /**
   * Initialize Z-Machine recorder with common interpreter paths
   */
  private initializeZMachineRecorder(): ZMachineRecorder | null {
    const commonPaths = [
      '/opt/homebrew/bin/dfrotz',  // macOS Homebrew
      '/usr/local/bin/dfrotz',     // macOS/Linux local install
      '/usr/bin/dfrotz',           // Linux system install
      'dfrotz'                     // In PATH
    ];

    for (const interpreterPath of commonPaths) {
      try {
        const recorder = new ZMachineRecorder({
          interpreterPath,
          gameFilePath: 'reference/COMPILED/zork1.z3'
        });
        
        // Test if this path works (synchronous check)
        if (this.testInterpreterPath(interpreterPath)) {
          return recorder;
        }
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    console.warn('Z-Machine recorder not available: no working interpreter found');
    return null;
  }

  /**
   * Test if an interpreter path exists (synchronous check)
   */
  private testInterpreterPath(interpreterPath: string): boolean {
    try {
      // For full paths, check if file exists
      if (interpreterPath.startsWith('/')) {
        return existsSync(interpreterPath);
      }
      
      // For command names, assume they're in PATH (will be tested during actual execution)
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run a spot test with the given configuration
   */
  async runSpotTest(config?: Partial<SpotTestConfig>): Promise<SpotTestResult> {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    // Check if Z-Machine is available
    const zmAvailable = this.zmRecorder ? await this.zmRecorder.isAvailable() : false;
    if (!zmAvailable) {
      throw new Error('Z-Machine interpreter not available for spot testing');
    }

    // Generate random commands
    const gameState = createInitialGameState();
    if (fullConfig.seed !== undefined) {
      gameState.setSeed(fullConfig.seed);
    }

    // Create seeded command generator
    const seededGenerator = new RandomCommandGenerator(fullConfig.seed);
    const generatedCommands = seededGenerator.generateCommands({
      commandCount: fullConfig.commandCount,
      seed: fullConfig.seed,
      focusAreas: fullConfig.focusAreas,
      avoidGameEnding: true // Always avoid game-ending commands in spot tests
    }, gameState);

    const commands = generatedCommands.map(gc => gc.command);

    // Execute commands on both implementations in parallel
    const [tsResults, zmResults] = await Promise.all([
      this.executeCommandsOnTypeScript(commands, fullConfig),
      this.executeCommandsOnZMachine(commands, fullConfig)
    ]);

    // Compare results and identify differences
    const differences = this.compareResults(tsResults, zmResults);

    // Calculate metrics
    const metrics = this.calculateMetrics(tsResults, zmResults, differences);

    // Analyze patterns and generate recommendations
    const issuePatterns = this.analyzeIssuePatterns(differences);
    const recommendDeepAnalysis = this.shouldRecommendDeepAnalysis(differences, metrics);

    const executionTime = Date.now() - startTime;

    return {
      totalCommands: commands.length,
      differences,
      parityScore: metrics.parityPercentage,
      executionTime,
      recommendDeepAnalysis,
      issuePatterns
    };
  }

  /**
   * Execute commands on TypeScript implementation
   */
  private async executeCommandsOnTypeScript(
    commands: string[], 
    config: SpotTestConfig
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    try {
      const transcript = await this.tsRecorder.record(commands, {
        seed: config.seed,
        suppressRandomMessages: true,
        captureTimestamps: true
      });

      // Convert transcript entries to CommandResults
      for (let i = 0; i < commands.length; i++) {
        const entry = transcript.entries[i + 1]; // +1 because entry 0 is initial state
        if (entry) {
          results.push({
            command: entry.command,
            tsOutput: entry.output,
            zmOutput: '', // Will be filled by Z-Machine execution
            executionTime: 0, // Individual timing not tracked in transcript
            success: true
          });
        }
      }
    } catch (error) {
      // If TypeScript execution fails, create error results
      for (const command of commands) {
        results.push({
          command,
          tsOutput: `[TypeScript Error: ${error instanceof Error ? error.message : String(error)}]`,
          zmOutput: '',
          executionTime: 0,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Execute commands on Z-Machine implementation
   */
  private async executeCommandsOnZMachine(
    commands: string[], 
    config: SpotTestConfig
  ): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    if (!this.zmRecorder) {
      // Create error results if Z-Machine not available
      for (const command of commands) {
        results.push({
          command,
          tsOutput: '',
          zmOutput: '[Z-Machine Error: Interpreter not available]',
          executionTime: 0,
          success: false
        });
      }
      return results;
    }

    try {
      const transcript = await this.zmRecorder.record(commands, {
        captureTimestamps: true
      });

      // Convert transcript entries to CommandResults
      for (let i = 0; i < commands.length; i++) {
        const entry = transcript.entries[i + 1]; // +1 because entry 0 is initial state
        if (entry) {
          results.push({
            command: entry.command,
            tsOutput: '', // Will be filled by TypeScript execution
            zmOutput: entry.output,
            executionTime: 0, // Individual timing not tracked in transcript
            success: true
          });
        }
      }
    } catch (error) {
      // If Z-Machine execution fails, create error results
      for (const command of commands) {
        results.push({
          command,
          tsOutput: '',
          zmOutput: `[Z-Machine Error: ${error instanceof Error ? error.message : String(error)}]`,
          executionTime: 0,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Compare TypeScript and Z-Machine results to identify differences
   */
  private compareResults(
    tsResults: CommandResult[], 
    zmResults: CommandResult[]
  ): CommandDifference[] {
    const differences: CommandDifference[] = [];
    const maxLength = Math.max(tsResults.length, zmResults.length);

    for (let i = 0; i < maxLength; i++) {
      const tsResult = tsResults[i];
      const zmResult = zmResults[i];

      // Handle missing results
      if (!tsResult || !zmResult) {
        differences.push({
          commandIndex: i,
          command: tsResult?.command || zmResult?.command || '<missing>',
          tsOutput: tsResult?.tsOutput || '[Missing TypeScript result]',
          zmOutput: zmResult?.zmOutput || '[Missing Z-Machine result]',
          differenceType: DifferenceType.STATE_DIVERGENCE,
          severity: IssueSeverity.CRITICAL
        });
        continue;
      }

      // Merge results (TypeScript results have tsOutput, Z-Machine results have zmOutput)
      const mergedResult: CommandResult = {
        command: tsResult.command,
        tsOutput: tsResult.tsOutput,
        zmOutput: zmResult.zmOutput,
        executionTime: Math.max(tsResult.executionTime, zmResult.executionTime),
        success: tsResult.success && zmResult.success
      };

      // Check for execution failures
      if (!mergedResult.success) {
        differences.push({
          commandIndex: i,
          command: mergedResult.command,
          tsOutput: mergedResult.tsOutput,
          zmOutput: mergedResult.zmOutput,
          differenceType: DifferenceType.STATE_DIVERGENCE,
          severity: IssueSeverity.CRITICAL
        });
        continue;
      }

      // Use QuickValidator for comparison
      const validationResult = this.validator.validateResponse(
        mergedResult.tsOutput, 
        mergedResult.zmOutput,
        { strictMode: false, normalizeOutput: true, ignoreMinorDifferences: false }
      );

      // If validation shows a mismatch, record the difference
      if (!validationResult.isMatch) {
        // Get normalized outputs for cleaner difference reporting
        const normalizedTs = this.validator.normalizeForComparison(mergedResult.tsOutput);
        const normalizedZm = this.validator.normalizeForComparison(mergedResult.zmOutput);
        
        differences.push({
          commandIndex: i,
          command: mergedResult.command,
          tsOutput: normalizedTs,
          zmOutput: normalizedZm,
          differenceType: validationResult.differenceType || DifferenceType.MESSAGE_INCONSISTENCY,
          severity: validationResult.severity
        });
      }
    }

    return differences;
  }

  /**
   * Normalize output for comparison (basic normalization)
   */
  private normalizeForComparison(output: string): string {
    return output
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  /**
   * Calculate similarity between two strings (simple implementation)
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1.0;
    if (a.length === 0 && b.length === 0) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const maxLength = Math.max(a.length, b.length);
    const distance = this.levenshteinDistance(a, b);
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }

  /**
   * Calculate spot test metrics
   */
  private calculateMetrics(
    tsResults: CommandResult[], 
    zmResults: CommandResult[], 
    differences: CommandDifference[]
  ): SpotTestMetrics {
    const totalCommands = Math.max(tsResults.length, zmResults.length);
    const differencesFound = differences.length;
    const parityPercentage = totalCommands > 0 ? 
      ((totalCommands - differencesFound) / totalCommands) * 100 : 100;

    // Calculate average response time (if available)
    const allResults = [...tsResults, ...zmResults];
    const totalTime = allResults.reduce((sum, result) => sum + result.executionTime, 0);
    const averageResponseTime = allResults.length > 0 ? totalTime / allResults.length : 0;

    // Count issues by type
    const issuesByType = new Map<DifferenceType, number>();
    for (const diff of differences) {
      const current = issuesByType.get(diff.differenceType) || 0;
      issuesByType.set(diff.differenceType, current + 1);
    }

    return {
      commandsExecuted: totalCommands,
      differencesFound,
      parityPercentage,
      averageResponseTime,
      issuesByType
    };
  }

  /**
   * Analyze differences to identify patterns
   */
  private analyzeIssuePatterns(differences: CommandDifference[]): IssuePattern[] {
    const patterns: IssuePattern[] = [];

    // Group differences by type
    const byType = new Map<DifferenceType, CommandDifference[]>();
    for (const diff of differences) {
      const existing = byType.get(diff.differenceType) || [];
      existing.push(diff);
      byType.set(diff.differenceType, existing);
    }

    // Create patterns for each type with multiple occurrences
    for (const [type, diffs] of byType.entries()) {
      if (diffs.length >= 2) { // Only create patterns for recurring issues
        const severity = this.getOverallSeverity(diffs.map(d => d.severity));
        const sampleCommands = diffs.slice(0, 3).map(d => d.command); // First 3 as samples

        patterns.push({
          type: type as any, // Convert DifferenceType to PatternType
          frequency: diffs.length,
          severity,
          description: this.getPatternDescription(type, diffs.length),
          sampleCommands
        });
      }
    }

    return patterns;
  }

  /**
   * Get overall severity from a list of severities
   */
  private getOverallSeverity(severities: IssueSeverity[]): IssueSeverity {
    if (severities.includes(IssueSeverity.CRITICAL)) return IssueSeverity.CRITICAL;
    if (severities.includes(IssueSeverity.HIGH)) return IssueSeverity.HIGH;
    if (severities.includes(IssueSeverity.MEDIUM)) return IssueSeverity.MEDIUM;
    return IssueSeverity.LOW;
  }

  /**
   * Get description for a pattern type
   */
  private getPatternDescription(type: DifferenceType, frequency: number): string {
    switch (type) {
      case DifferenceType.MESSAGE_INCONSISTENCY:
        return `Message text differs in ${frequency} commands`;
      case DifferenceType.STATE_DIVERGENCE:
        return `Game state diverges in ${frequency} commands`;
      case DifferenceType.PARSER_DIFFERENCE:
        return `Parser behavior differs in ${frequency} commands`;
      case DifferenceType.OBJECT_BEHAVIOR:
        return `Object interaction differs in ${frequency} commands`;
      case DifferenceType.TIMING_DIFFERENCE:
        return `Timing-related differences in ${frequency} commands`;
      default:
        return `Unknown pattern type in ${frequency} commands`;
    }
  }

  /**
   * Determine if deeper analysis is recommended
   */
  private shouldRecommendDeepAnalysis(
    differences: CommandDifference[], 
    metrics: SpotTestMetrics
  ): boolean {
    // Recommend deeper analysis if:
    // 1. Parity score is below 90%
    // 2. There are any critical issues
    // 3. There are multiple high-severity issues
    // 4. There are consistent patterns across multiple issue types

    if (metrics.parityPercentage < 90) {
      return true;
    }

    const criticalIssues = differences.filter(d => d.severity === IssueSeverity.CRITICAL);
    if (criticalIssues.length > 0) {
      return true;
    }

    const highSeverityIssues = differences.filter(d => d.severity === IssueSeverity.HIGH);
    if (highSeverityIssues.length >= 3) {
      return true;
    }

    // Check for multiple issue types (indicates systemic problems)
    const uniqueTypes = new Set(differences.map(d => d.differenceType));
    if (uniqueTypes.size >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Set Z-Machine recorder configuration
   */
  setZMachineConfig(interpreterPath: string, gameFilePath: string): void {
    this.zmRecorder = new ZMachineRecorder({
      interpreterPath,
      gameFilePath
    });
  }

  /**
   * Check if Z-Machine is available for testing
   */
  async isZMachineAvailable(): Promise<boolean> {
    return this.zmRecorder ? await this.zmRecorder.isAvailable() : false;
  }

  /**
   * Generate a detailed report of the spot test results
   */
  generateReport(result: SpotTestResult): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push('SPOT TEST PARITY REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    
    // Summary section
    lines.push('SUMMARY');
    lines.push('-'.repeat(20));
    lines.push(`Total Commands Executed: ${result.totalCommands}`);
    lines.push(`Parity Score: ${result.parityScore.toFixed(1)}%`);
    lines.push(`Execution Time: ${result.executionTime}ms`);
    lines.push(`Differences Found: ${result.differences.length}`);
    lines.push('');
    
    // Recommendation section
    lines.push('RECOMMENDATION');
    lines.push('-'.repeat(20));
    if (result.recommendDeepAnalysis) {
      lines.push('⚠️  DEEPER ANALYSIS RECOMMENDED');
      lines.push('   Issues detected that warrant comprehensive testing.');
    } else {
      lines.push('✅ SPOT TEST PASSED');
      lines.push('   No significant issues detected in this sample.');
    }
    lines.push('');
    
    // Issue patterns section
    if (result.issuePatterns.length > 0) {
      lines.push('ISSUE PATTERNS');
      lines.push('-'.repeat(20));
      for (const pattern of result.issuePatterns) {
        const severityIcon = this.getSeverityIcon(pattern.severity);
        lines.push(`${severityIcon} ${pattern.description}`);
        lines.push(`   Frequency: ${pattern.frequency} occurrences`);
        lines.push(`   Sample commands: ${pattern.sampleCommands.slice(0, 2).join(', ')}`);
        lines.push('');
      }
    }
    
    // Detailed differences section (if any)
    if (result.differences.length > 0) {
      lines.push('DETAILED DIFFERENCES');
      lines.push('-'.repeat(20));
      
      // Group by severity
      const bySeverity = this.groupDifferencesBySeverity(result.differences);
      
      for (const severity of [IssueSeverity.CRITICAL, IssueSeverity.HIGH, IssueSeverity.MEDIUM, IssueSeverity.LOW]) {
        const diffs = bySeverity.get(severity) || [];
        if (diffs.length === 0) continue;
        
        const severityIcon = this.getSeverityIcon(severity);
        lines.push(`${severityIcon} ${severity.toUpperCase()} ISSUES (${diffs.length})`);
        
        // Show first few examples
        for (const diff of diffs.slice(0, 3)) {
          lines.push(`   Command ${diff.commandIndex + 1}: ${diff.command}`);
          lines.push(`   Type: ${diff.differenceType}`);
          if (diff.tsOutput.length < 100 && diff.zmOutput.length < 100) {
            lines.push(`   TS: ${diff.tsOutput.replace(/\n/g, ' ')}`);
            lines.push(`   ZM: ${diff.zmOutput.replace(/\n/g, ' ')}`);
          } else {
            lines.push(`   Outputs differ (too long to display)`);
          }
          lines.push('');
        }
        
        if (diffs.length > 3) {
          lines.push(`   ... and ${diffs.length - 3} more ${severity} issues`);
          lines.push('');
        }
      }
    }
    
    // Performance metrics section
    lines.push('PERFORMANCE METRICS');
    lines.push('-'.repeat(20));
    lines.push(`Commands per second: ${(result.totalCommands / (result.executionTime / 1000)).toFixed(1)}`);
    lines.push(`Average time per command: ${(result.executionTime / result.totalCommands).toFixed(1)}ms`);
    lines.push('');
    
    // Footer
    lines.push('='.repeat(60));
    lines.push(`Generated at: ${new Date().toISOString()}`);
    
    return lines.join('\n');
  }

  /**
   * Generate a concise summary for quick feedback
   */
  generateSummary(result: SpotTestResult): string {
    const status = result.recommendDeepAnalysis ? '⚠️  ISSUES DETECTED' : '✅ PASSED';
    const parity = result.parityScore.toFixed(1);
    const time = result.executionTime;
    const issues = result.differences.length;
    
    return `${status} | Parity: ${parity}% | Time: ${time}ms | Issues: ${issues}/${result.totalCommands}`;
  }

  /**
   * Generate JSON report for programmatic consumption
   */
  generateJsonReport(result: SpotTestResult): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCommands: result.totalCommands,
        parityScore: result.parityScore,
        executionTime: result.executionTime,
        differencesFound: result.differences.length,
        recommendDeepAnalysis: result.recommendDeepAnalysis
      },
      issuePatterns: result.issuePatterns.map(pattern => ({
        type: pattern.type,
        frequency: pattern.frequency,
        severity: pattern.severity,
        description: pattern.description,
        sampleCommands: pattern.sampleCommands
      })),
      differences: result.differences.map(diff => ({
        commandIndex: diff.commandIndex,
        command: diff.command,
        differenceType: diff.differenceType,
        severity: diff.severity,
        tsOutputLength: diff.tsOutput.length,
        zmOutputLength: diff.zmOutput.length
      })),
      performance: {
        commandsPerSecond: result.totalCommands / (result.executionTime / 1000),
        averageTimePerCommand: result.executionTime / result.totalCommands
      }
    };
    
    return JSON.stringify(report, null, 2);
  }

  /**
   * Get severity icon for display
   */
  private getSeverityIcon(severity: IssueSeverity): string {
    switch (severity) {
      case IssueSeverity.CRITICAL: return '🔴';
      case IssueSeverity.HIGH: return '🟠';
      case IssueSeverity.MEDIUM: return '🟡';
      case IssueSeverity.LOW: return '🟢';
      default: return '⚪';
    }
  }

  /**
   * Group differences by severity for reporting
   */
  private groupDifferencesBySeverity(differences: CommandDifference[]): Map<IssueSeverity, CommandDifference[]> {
    const grouped = new Map<IssueSeverity, CommandDifference[]>();
    
    for (const diff of differences) {
      const existing = grouped.get(diff.severity) || [];
      existing.push(diff);
      grouped.set(diff.severity, existing);
    }
    
    return grouped;
  }

  /**
   * Calculate comprehensive metrics for the spot test
   */
  private calculateDetailedMetrics(
    tsResults: CommandResult[], 
    zmResults: CommandResult[], 
    differences: CommandDifference[]
  ): {
    basic: SpotTestMetrics;
    detailed: {
      successRate: number;
      averageSimilarity: number;
      typeDistribution: Record<DifferenceType, number>;
      severityDistribution: Record<IssueSeverity, number>;
      commandTypeAnalysis: Record<string, { total: number; issues: number }>;
    };
  } {
    const basic = this.calculateMetrics(tsResults, zmResults, differences);
    
    // Calculate success rate
    const successfulCommands = Math.max(tsResults.length, zmResults.length) - differences.length;
    const successRate = basic.commandsExecuted > 0 ? 
      (successfulCommands / basic.commandsExecuted) * 100 : 100;
    
    // Calculate average similarity for differences
    let totalSimilarity = 0;
    let similarityCount = 0;
    
    for (const diff of differences) {
      const similarity = this.calculateSimilarity(diff.tsOutput, diff.zmOutput);
      totalSimilarity += similarity;
      similarityCount++;
    }
    
    const averageSimilarity = similarityCount > 0 ? totalSimilarity / similarityCount : 1.0;
    
    // Type distribution
    const typeDistribution: Record<DifferenceType, number> = {
      [DifferenceType.MESSAGE_INCONSISTENCY]: 0,
      [DifferenceType.STATE_DIVERGENCE]: 0,
      [DifferenceType.PARSER_DIFFERENCE]: 0,
      [DifferenceType.OBJECT_BEHAVIOR]: 0,
      [DifferenceType.TIMING_DIFFERENCE]: 0
    };
    
    // Severity distribution
    const severityDistribution: Record<IssueSeverity, number> = {
      [IssueSeverity.LOW]: 0,
      [IssueSeverity.MEDIUM]: 0,
      [IssueSeverity.HIGH]: 0,
      [IssueSeverity.CRITICAL]: 0
    };
    
    // Command type analysis
    const commandTypeAnalysis: Record<string, { total: number; issues: number }> = {};
    
    // Count distributions
    for (const diff of differences) {
      typeDistribution[diff.differenceType]++;
      severityDistribution[diff.severity]++;
      
      // Analyze command types
      const commandType = this.categorizeCommand(diff.command);
      if (!commandTypeAnalysis[commandType]) {
        commandTypeAnalysis[commandType] = { total: 0, issues: 0 };
      }
      commandTypeAnalysis[commandType].issues++;
    }
    
    // Count total commands by type
    const allCommands = [...tsResults, ...zmResults];
    for (const result of allCommands) {
      if (result.command) {
        const commandType = this.categorizeCommand(result.command);
        if (!commandTypeAnalysis[commandType]) {
          commandTypeAnalysis[commandType] = { total: 0, issues: 0 };
        }
        commandTypeAnalysis[commandType].total++;
      }
    }
    
    return {
      basic,
      detailed: {
        successRate,
        averageSimilarity,
        typeDistribution,
        severityDistribution,
        commandTypeAnalysis
      }
    };
  }

  /**
   * Categorize command for analysis
   */
  private categorizeCommand(command: string): string {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'look' || cmd === 'l') return 'examination';
    if (cmd === 'inventory' || cmd === 'i') return 'inventory';
    if (cmd.startsWith('examine') || cmd.startsWith('x ')) return 'examination';
    if (cmd.startsWith('take') || cmd.startsWith('get')) return 'object_manipulation';
    if (cmd.startsWith('drop') || cmd.startsWith('put')) return 'object_manipulation';
    if (['north', 'south', 'east', 'west', 'up', 'down', 'n', 's', 'e', 'w', 'u', 'd'].includes(cmd)) return 'movement';
    if (cmd.startsWith('open') || cmd.startsWith('close')) return 'container_interaction';
    if (cmd.startsWith('push') || cmd.startsWith('pull') || cmd.startsWith('turn')) return 'puzzle_action';
    if (cmd.startsWith('attack') || cmd.startsWith('kill')) return 'combat';
    if (cmd.startsWith('say') || cmd.startsWith('hello') || cmd.startsWith('yell')) return 'communication';
    
    return 'other';
  }
}