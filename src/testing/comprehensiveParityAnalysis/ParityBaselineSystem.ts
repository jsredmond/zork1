/**
 * Parity Baseline System
 * 
 * Manages baseline establishment, comparison, and regression prevention
 * for the comprehensive parity analysis process.
 * 
 * Key Features:
 * - Baseline establishment with full difference catalog
 * - Automatic regression detection
 * - Rollback recommendations when parity decreases
 * - Progress tracking with historical data
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { SpotTestRunner } from '../spotTesting/spotTestRunner.js';
import { 
  CommandDifference, 
  DifferenceType
} from '../spotTesting/types.js';

/**
 * Baseline data structure
 */
export interface ParityBaseline {
  /** Timestamp when baseline was established */
  timestamp: string;
  /** Seed used for baseline test */
  seed: number;
  /** Parity percentage at baseline */
  parityPercentage: number;
  /** Total commands tested */
  totalCommands: number;
  /** Number of differences at baseline */
  differenceCount: number;
  /** Full catalog of differences */
  differences: CommandDifference[];
  /** Category breakdown */
  categoryBreakdown: CategoryBreakdown;
  /** Git commit hash (if available) */
  gitCommit?: string;
}

/**
 * Category breakdown for baseline
 */
export interface CategoryBreakdown {
  timing: number;
  objectBehavior: number;
  parser: number;
  other: number;
}

/**
 * Regression check result
 */
export interface RegressionCheck {
  /** Whether regression was detected */
  hasRegression: boolean;
  /** Current parity percentage */
  currentParity: number;
  /** Baseline parity percentage */
  baselineParity: number;
  /** Change in parity (positive = improvement) */
  parityDelta: number;
  /** New issues introduced since baseline */
  newIssues: CommandDifference[];
  /** Issues resolved since baseline */
  resolvedIssues: CommandDifference[];
  /** Recommendation based on analysis */
  recommendation: 'proceed' | 'investigate' | 'rollback';
  /** Detailed message */
  message: string;
}

/**
 * Progress entry for tracking improvements
 */
export interface ProgressEntry {
  /** Timestamp of measurement */
  timestamp: string;
  /** Parity percentage */
  parityPercentage: number;
  /** Number of differences */
  differenceCount: number;
  /** Category breakdown */
  categoryBreakdown: CategoryBreakdown;
  /** Description of changes made */
  changeDescription?: string;
  /** Seed used for test */
  seed: number;
}

/**
 * Progress report
 */
export interface ProgressReport {
  /** Starting parity */
  startingParity: number;
  /** Current parity */
  currentParity: number;
  /** Total improvement */
  totalImprovement: number;
  /** Target parity */
  targetParity: number;
  /** Progress toward target (percentage) */
  progressTowardTarget: number;
  /** Historical entries */
  history: ProgressEntry[];
  /** Trend analysis */
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Configuration for baseline system
 */
export interface BaselineSystemConfig {
  /** Path to baseline file */
  baselineFilePath: string;
  /** Path to progress file */
  progressFilePath: string;
  /** Target parity percentage */
  targetParity: number;
  /** Minimum acceptable parity (triggers rollback recommendation) */
  minimumParity: number;
  /** Seeds for validation */
  validationSeeds: number[];
  /** Number of commands for testing */
  commandCount: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: BaselineSystemConfig = {
  baselineFilePath: 'baseline-parity-results.json',
  progressFilePath: 'parity-progress.json',
  targetParity: 95,
  minimumParity: 70,
  validationSeeds: [12345, 67890, 54321, 99999, 11111],
  commandCount: 200
};

/**
 * Interface for spot test runner (for dependency injection)
 */
export interface ISpotTestRunner {
  runSpotTest(options: { commandCount: number; seed: number }): Promise<{
    totalCommands: number;
    differences: CommandDifference[];
    parityScore: number;
  }>;
}

/**
 * ParityBaselineSystem manages baseline establishment and regression prevention
 */
export class ParityBaselineSystem {
  private config: BaselineSystemConfig;
  private spotTestRunner: ISpotTestRunner;
  private currentBaseline: ParityBaseline | null = null;
  private progressHistory: ProgressEntry[] = [];

  constructor(config?: Partial<BaselineSystemConfig>, spotTestRunner?: ISpotTestRunner) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.spotTestRunner = spotTestRunner ?? new SpotTestRunner();
    
    // Load existing baseline and progress if available
    this.loadBaseline();
    this.loadProgress();
  }

  /**
   * Establish a new baseline
   */
  async establishBaseline(seed?: number): Promise<ParityBaseline> {
    const testSeed = seed ?? this.config.validationSeeds[0];
    
    const spotResult = await this.spotTestRunner.runSpotTest({
      commandCount: this.config.commandCount,
      seed: testSeed
    });

    const categoryBreakdown = this.calculateCategoryBreakdown(spotResult.differences);

    const baseline: ParityBaseline = {
      timestamp: new Date().toISOString(),
      seed: testSeed,
      parityPercentage: spotResult.parityScore,
      totalCommands: spotResult.totalCommands,
      differenceCount: spotResult.differences.length,
      differences: spotResult.differences,
      categoryBreakdown,
      gitCommit: this.getGitCommit()
    };

    this.currentBaseline = baseline;
    this.saveBaseline(baseline);

    // Add to progress history
    this.addProgressEntry({
      timestamp: baseline.timestamp,
      parityPercentage: baseline.parityPercentage,
      differenceCount: baseline.differenceCount,
      categoryBreakdown,
      changeDescription: 'Baseline established',
      seed: testSeed
    });

    return baseline;
  }

  /**
   * Validate current state against baseline
   */
  async validateChange(seed?: number, changeDescription?: string): Promise<RegressionCheck> {
    const testSeed = seed ?? this.config.validationSeeds[0];
    
    const spotResult = await this.spotTestRunner.runSpotTest({
      commandCount: this.config.commandCount,
      seed: testSeed
    });

    const baseline = this.currentBaseline;
    if (!baseline) {
      return {
        hasRegression: false,
        currentParity: spotResult.parityScore,
        baselineParity: this.config.minimumParity,
        parityDelta: spotResult.parityScore - this.config.minimumParity,
        newIssues: spotResult.differences,
        resolvedIssues: [],
        recommendation: 'proceed',
        message: 'No baseline established. Using minimum parity as reference.'
      };
    }

    const parityDelta = spotResult.parityScore - baseline.parityPercentage;
    const hasRegression = spotResult.parityScore < baseline.parityPercentage;

    // Identify new and resolved issues
    const { newIssues, resolvedIssues } = this.compareIssues(
      baseline.differences,
      spotResult.differences
    );

    // Determine recommendation
    let recommendation: 'proceed' | 'investigate' | 'rollback';
    let message: string;

    if (parityDelta >= 0) {
      recommendation = 'proceed';
      message = `Parity improved by ${parityDelta.toFixed(1)}% (${baseline.parityPercentage.toFixed(1)}% → ${spotResult.parityScore.toFixed(1)}%)`;
    } else if (parityDelta > -5) {
      recommendation = 'investigate';
      message = `Minor regression of ${Math.abs(parityDelta).toFixed(1)}%. Investigate before proceeding.`;
    } else {
      recommendation = 'rollback';
      message = `CRITICAL: Parity dropped by ${Math.abs(parityDelta).toFixed(1)}%. Rollback recommended.`;
    }

    // Add to progress history
    const categoryBreakdown = this.calculateCategoryBreakdown(spotResult.differences);
    this.addProgressEntry({
      timestamp: new Date().toISOString(),
      parityPercentage: spotResult.parityScore,
      differenceCount: spotResult.differences.length,
      categoryBreakdown,
      changeDescription,
      seed: testSeed
    });

    return {
      hasRegression,
      currentParity: spotResult.parityScore,
      baselineParity: baseline.parityPercentage,
      parityDelta,
      newIssues,
      resolvedIssues,
      recommendation,
      message
    };
  }

  /**
   * Check if rollback is recommended
   */
  rollbackIfRegression(check: RegressionCheck): boolean {
    return check.recommendation === 'rollback';
  }

  /**
   * Track progress over time
   */
  trackProgress(): ProgressReport {
    if (this.progressHistory.length === 0) {
      return {
        startingParity: this.config.minimumParity,
        currentParity: this.config.minimumParity,
        totalImprovement: 0,
        targetParity: this.config.targetParity,
        progressTowardTarget: 0,
        history: [],
        trend: 'stable'
      };
    }

    const startingParity = this.progressHistory[0].parityPercentage;
    const currentParity = this.progressHistory[this.progressHistory.length - 1].parityPercentage;
    const totalImprovement = currentParity - startingParity;
    
    const targetGap = this.config.targetParity - startingParity;
    const progressTowardTarget = targetGap > 0 ? (totalImprovement / targetGap) * 100 : 100;

    // Calculate trend from last 3 entries
    const trend = this.calculateTrend();

    return {
      startingParity,
      currentParity,
      totalImprovement,
      targetParity: this.config.targetParity,
      progressTowardTarget: Math.min(100, Math.max(0, progressTowardTarget)),
      history: this.progressHistory,
      trend
    };
  }

  /**
   * Get current baseline
   */
  getBaseline(): ParityBaseline | null {
    return this.currentBaseline;
  }

  /**
   * Get progress history
   */
  getProgressHistory(): ProgressEntry[] {
    return [...this.progressHistory];
  }

  /**
   * Run multi-seed validation
   */
  async runMultiSeedValidation(): Promise<{
    allPassed: boolean;
    averageParity: number;
    results: Array<{ seed: number; parity: number; passed: boolean }>;
  }> {
    const results: Array<{ seed: number; parity: number; passed: boolean }> = [];
    const baseline = this.currentBaseline;
    const minimumParity = baseline?.parityPercentage ?? this.config.minimumParity;

    for (const seed of this.config.validationSeeds) {
      const spotResult = await this.spotTestRunner.runSpotTest({
        commandCount: this.config.commandCount,
        seed
      });

      results.push({
        seed,
        parity: spotResult.parityScore,
        passed: spotResult.parityScore >= minimumParity
      });
    }

    const allPassed = results.every(r => r.passed);
    const averageParity = results.reduce((sum, r) => sum + r.parity, 0) / results.length;

    return { allPassed, averageParity, results };
  }

  // ============ Private Methods ============

  /**
   * Calculate category breakdown from differences
   */
  private calculateCategoryBreakdown(differences: CommandDifference[]): CategoryBreakdown {
    const breakdown: CategoryBreakdown = {
      timing: 0,
      objectBehavior: 0,
      parser: 0,
      other: 0
    };

    for (const diff of differences) {
      switch (diff.differenceType) {
        case DifferenceType.TIMING_DIFFERENCE:
          breakdown.timing++;
          break;
        case DifferenceType.OBJECT_BEHAVIOR:
          breakdown.objectBehavior++;
          break;
        case DifferenceType.PARSER_DIFFERENCE:
          breakdown.parser++;
          break;
        default:
          breakdown.other++;
      }
    }

    return breakdown;
  }

  /**
   * Compare issues between baseline and current
   */
  private compareIssues(
    baselineIssues: CommandDifference[],
    currentIssues: CommandDifference[]
  ): { newIssues: CommandDifference[]; resolvedIssues: CommandDifference[] } {
    // Create sets of command signatures for comparison
    const baselineSignatures = new Set(
      baselineIssues.map(d => `${d.command}:${d.differenceType}`)
    );
    const currentSignatures = new Set(
      currentIssues.map(d => `${d.command}:${d.differenceType}`)
    );

    const newIssues = currentIssues.filter(
      d => !baselineSignatures.has(`${d.command}:${d.differenceType}`)
    );
    const resolvedIssues = baselineIssues.filter(
      d => !currentSignatures.has(`${d.command}:${d.differenceType}`)
    );

    return { newIssues, resolvedIssues };
  }

  /**
   * Calculate trend from recent history
   */
  private calculateTrend(): 'improving' | 'stable' | 'declining' {
    if (this.progressHistory.length < 2) {
      return 'stable';
    }

    const recentEntries = this.progressHistory.slice(-3);
    if (recentEntries.length < 2) {
      return 'stable';
    }

    const changes: number[] = [];
    for (let i = 1; i < recentEntries.length; i++) {
      changes.push(recentEntries[i].parityPercentage - recentEntries[i - 1].parityPercentage);
    }

    const averageChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

    if (averageChange > 1) {
      return 'improving';
    } else if (averageChange < -1) {
      return 'declining';
    }
    return 'stable';
  }

  /**
   * Get current Git commit hash
   */
  private getGitCommit(): string | undefined {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return undefined;
    }
  }

  /**
   * Save baseline to file
   */
  private saveBaseline(baseline: ParityBaseline): void {
    try {
      writeFileSync(
        this.config.baselineFilePath,
        JSON.stringify(baseline, null, 2)
      );
    } catch (error) {
      console.warn('Failed to save baseline:', error);
    }
  }

  /**
   * Load baseline from file
   */
  private loadBaseline(): void {
    try {
      if (existsSync(this.config.baselineFilePath)) {
        const data = readFileSync(this.config.baselineFilePath, 'utf-8');
        this.currentBaseline = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load baseline:', error);
    }
  }

  /**
   * Add progress entry
   */
  private addProgressEntry(entry: ProgressEntry): void {
    this.progressHistory.push(entry);
    this.saveProgress();
  }

  /**
   * Save progress to file
   */
  private saveProgress(): void {
    try {
      writeFileSync(
        this.config.progressFilePath,
        JSON.stringify(this.progressHistory, null, 2)
      );
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }

  /**
   * Load progress from file
   */
  private loadProgress(): void {
    try {
      if (existsSync(this.config.progressFilePath)) {
        const data = readFileSync(this.config.progressFilePath, 'utf-8');
        this.progressHistory = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load progress:', error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BaselineSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): BaselineSystemConfig {
    return { ...this.config };
  }
}
