/**
 * RegressionPreventionSystem - Prevents parity regressions during development
 * 
 * This system ensures that changes don't decrease parity below the baseline.
 * It provides automatic baseline comparison, regression detection, and
 * rollback recommendations.
 * 
 * Requirements: 5.3, 6.2
 */

import { ParityBaselineSystem, ParityBaseline, RegressionCheck, ProgressEntry } from './ParityBaselineSystem.js';
import { CommandDifference, DifferenceType } from '../spotTesting/types.js';

/**
 * Regression event for logging and tracking
 */
export interface RegressionEvent {
  timestamp: string;
  previousParity: number;
  currentParity: number;
  parityDrop: number;
  newIssues: CommandDifference[];
  action: 'detected' | 'prevented' | 'rolled_back';
  gitCommit?: string;
  changeDescription?: string;
}

/**
 * Baseline snapshot for comparison
 */
export interface BaselineSnapshot {
  timestamp: string;
  parityPercentage: number;
  differenceCount: number;
  differencesByCategory: {
    timing: number;
    objectBehavior: number;
    parser: number;
    other: number;
  };
  commandSignatures: Set<string>;
}

/**
 * Validation result from regression check
 */
export interface ValidationResult {
  isValid: boolean;
  hasRegression: boolean;
  parityChange: number;
  message: string;
  recommendation: 'proceed' | 'investigate' | 'rollback';
  details: {
    baselineParity: number;
    currentParity: number;
    newIssuesCount: number;
    resolvedIssuesCount: number;
  };
}

/**
 * Configuration for regression prevention
 */
export interface RegressionPreventionConfig {
  /** Minimum acceptable parity percentage */
  minimumParity: number;
  /** Threshold for warning (percentage drop) */
  warningThreshold: number;
  /** Threshold for critical alert (percentage drop) */
  criticalThreshold: number;
  /** Whether to auto-rollback on critical regression */
  autoRollback: boolean;
  /** Seeds for multi-seed validation */
  validationSeeds: number[];
}

const DEFAULT_CONFIG: RegressionPreventionConfig = {
  minimumParity: 76.5,
  warningThreshold: 2,
  criticalThreshold: 5,
  autoRollback: false,
  validationSeeds: [12345, 67890, 54321]
};

/**
 * RegressionPreventionSystem prevents parity decreases during development
 */
export class RegressionPreventionSystem {
  private config: RegressionPreventionConfig;
  private baselineSystem: ParityBaselineSystem;
  private regressionEvents: RegressionEvent[] = [];
  private currentSnapshot: BaselineSnapshot | null = null;

  constructor(
    config?: Partial<RegressionPreventionConfig>,
    baselineSystem?: ParityBaselineSystem
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baselineSystem = baselineSystem ?? new ParityBaselineSystem();
  }

  /**
   * Establish a baseline for regression prevention
   */
  async establishBaseline(seed?: number): Promise<BaselineSnapshot> {
    const baseline = await this.baselineSystem.establishBaseline(seed);
    
    this.currentSnapshot = this.createSnapshot(baseline);
    
    return this.currentSnapshot;
  }


  /**
   * Validate a change against the baseline
   */
  async validateChange(seed?: number, changeDescription?: string): Promise<ValidationResult> {
    const check = await this.baselineSystem.validateChange(seed, changeDescription);
    
    const result: ValidationResult = {
      isValid: !check.hasRegression,
      hasRegression: check.hasRegression,
      parityChange: check.parityDelta,
      message: check.message,
      recommendation: check.recommendation,
      details: {
        baselineParity: check.baselineParity,
        currentParity: check.currentParity,
        newIssuesCount: check.newIssues.length,
        resolvedIssuesCount: check.resolvedIssues.length
      }
    };

    // Log regression event if detected
    if (check.hasRegression) {
      this.logRegressionEvent({
        timestamp: new Date().toISOString(),
        previousParity: check.baselineParity,
        currentParity: check.currentParity,
        parityDrop: Math.abs(check.parityDelta),
        newIssues: check.newIssues,
        action: 'detected',
        changeDescription
      });
    }

    return result;
  }

  /**
   * Check if rollback is recommended based on regression check
   */
  rollbackIfRegression(check: RegressionCheck): boolean {
    if (check.recommendation === 'rollback') {
      this.logRegressionEvent({
        timestamp: new Date().toISOString(),
        previousParity: check.baselineParity,
        currentParity: check.currentParity,
        parityDrop: Math.abs(check.parityDelta),
        newIssues: check.newIssues,
        action: 'rolled_back'
      });
      return true;
    }
    return false;
  }

  /**
   * Validate change doesn't introduce regression
   * Returns true if change is safe to proceed
   */
  async validateNoRegression(seed?: number): Promise<boolean> {
    const result = await this.validateChange(seed);
    return !result.hasRegression;
  }

  /**
   * Run multi-seed validation to ensure consistency
   */
  async runMultiSeedValidation(): Promise<{
    allPassed: boolean;
    results: ValidationResult[];
    averageParity: number;
    worstParity: number;
  }> {
    const results: ValidationResult[] = [];
    
    for (const seed of this.config.validationSeeds) {
      const result = await this.validateChange(seed);
      results.push(result);
    }

    const parities = results.map(r => r.details.currentParity);
    const allPassed = results.every(r => !r.hasRegression);
    const averageParity = parities.reduce((a, b) => a + b, 0) / parities.length;
    const worstParity = Math.min(...parities);

    return { allPassed, results, averageParity, worstParity };
  }

  /**
   * Get regression events history
   */
  getRegressionEvents(): RegressionEvent[] {
    return [...this.regressionEvents];
  }

  /**
   * Get current baseline snapshot
   */
  getCurrentSnapshot(): BaselineSnapshot | null {
    return this.currentSnapshot;
  }

  /**
   * Check if parity is above minimum threshold
   */
  isAboveMinimum(parity: number): boolean {
    return parity >= this.config.minimumParity;
  }

  /**
   * Get severity level of parity drop
   */
  getSeverityLevel(parityDrop: number): 'none' | 'warning' | 'critical' {
    if (parityDrop <= 0) return 'none';
    if (parityDrop < this.config.warningThreshold) return 'none';
    if (parityDrop < this.config.criticalThreshold) return 'warning';
    return 'critical';
  }

  /**
   * Create a snapshot from baseline
   */
  private createSnapshot(baseline: ParityBaseline): BaselineSnapshot {
    const commandSignatures = new Set(
      baseline.differences.map(d => `${d.command}:${d.differenceType}`)
    );

    return {
      timestamp: baseline.timestamp,
      parityPercentage: baseline.parityPercentage,
      differenceCount: baseline.differenceCount,
      differencesByCategory: {
        timing: baseline.categoryBreakdown.timing,
        objectBehavior: baseline.categoryBreakdown.objectBehavior,
        parser: baseline.categoryBreakdown.parser,
        other: baseline.categoryBreakdown.other
      },
      commandSignatures
    };
  }

  /**
   * Log a regression event
   */
  private logRegressionEvent(event: RegressionEvent): void {
    this.regressionEvents.push(event);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RegressionPreventionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): RegressionPreventionConfig {
    return { ...this.config };
  }

  /**
   * Get the underlying baseline system
   */
  getBaselineSystem(): ParityBaselineSystem {
    return this.baselineSystem;
  }

  /**
   * Static factory method
   */
  static create(
    config?: Partial<RegressionPreventionConfig>,
    baselineSystem?: ParityBaselineSystem
  ): RegressionPreventionSystem {
    return new RegressionPreventionSystem(config, baselineSystem);
  }
}
