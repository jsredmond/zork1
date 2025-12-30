/**
 * AchievementValidationSystem - Validates parity achievement claims
 * 
 * This system provides comprehensive validation for parity achievement,
 * generating detailed reports with full validation evidence.
 * 
 * Requirements: 6.5
 */

import { ProgressTrackingSystem, ProgressReport } from './ProgressTrackingSystem.js';
import { RegressionPreventionSystem } from './RegressionPreventionSystem.js';

/**
 * Achievement criteria
 */
export interface AchievementCriteria {
  targetParity: number;
  maxDifferences: number;
  categoryTargets: {
    timing: number;
    objectBehavior: number;
    parser: number;
  };
  requiredSeeds: number[];
  minConsistentRuns: number;
}

/**
 * Validation run result
 */
export interface ValidationRun {
  seed: number;
  timestamp: string;
  parityPercentage: number;
  differenceCount: number;
  categoryBreakdown: {
    timing: number;
    objectBehavior: number;
    parser: number;
    other: number;
  };
  passed: boolean;
}

/**
 * Achievement validation result
 */
export interface AchievementValidation {
  isAchieved: boolean;
  timestamp: string;
  criteria: AchievementCriteria;
  validationRuns: ValidationRun[];
  summary: {
    averageParity: number;
    minParity: number;
    maxParity: number;
    consistentRuns: number;
    totalRuns: number;
  };
  categoryValidation: {
    timing: { target: number; actual: number; passed: boolean };
    objectBehavior: { target: number; actual: number; passed: boolean };
    parser: { target: number; actual: number; passed: boolean };
  };
  message: string;
}


/**
 * Achievement report for documentation
 */
export interface AchievementReport {
  title: string;
  timestamp: string;
  validation: AchievementValidation;
  progressHistory: ProgressReport;
  recommendations: string[];
}

/**
 * Default achievement criteria
 */
const DEFAULT_CRITERIA: AchievementCriteria = {
  targetParity: 95,
  maxDifferences: 10,
  categoryTargets: {
    timing: 5,
    objectBehavior: 3,
    parser: 0
  },
  requiredSeeds: [12345, 67890, 54321, 99999, 11111],
  minConsistentRuns: 3
};

/**
 * AchievementValidationSystem validates parity achievement claims
 */
export class AchievementValidationSystem {
  private criteria: AchievementCriteria;
  private progressSystem: ProgressTrackingSystem;
  private regressionSystem: RegressionPreventionSystem;
  private validationHistory: AchievementValidation[] = [];

  constructor(
    criteria?: Partial<AchievementCriteria>,
    progressSystem?: ProgressTrackingSystem,
    regressionSystem?: RegressionPreventionSystem
  ) {
    this.criteria = { ...DEFAULT_CRITERIA, ...criteria };
    this.progressSystem = progressSystem ?? new ProgressTrackingSystem();
    this.regressionSystem = regressionSystem ?? new RegressionPreventionSystem();
  }

  /**
   * Validate achievement based on validation runs
   */
  validateAchievement(runs: ValidationRun[]): AchievementValidation {
    const parities = runs.map(r => r.parityPercentage);
    const averageParity = parities.reduce((a, b) => a + b, 0) / parities.length;
    const minParity = Math.min(...parities);
    const maxParity = Math.max(...parities);
    const consistentRuns = runs.filter(r => r.passed).length;

    // Calculate average category breakdown
    const avgTiming = Math.round(runs.reduce((a, r) => a + r.categoryBreakdown.timing, 0) / runs.length);
    const avgObjectBehavior = Math.round(runs.reduce((a, r) => a + r.categoryBreakdown.objectBehavior, 0) / runs.length);
    const avgParser = Math.round(runs.reduce((a, r) => a + r.categoryBreakdown.parser, 0) / runs.length);

    const categoryValidation = {
      timing: {
        target: this.criteria.categoryTargets.timing,
        actual: avgTiming,
        passed: avgTiming <= this.criteria.categoryTargets.timing
      },
      objectBehavior: {
        target: this.criteria.categoryTargets.objectBehavior,
        actual: avgObjectBehavior,
        passed: avgObjectBehavior <= this.criteria.categoryTargets.objectBehavior
      },
      parser: {
        target: this.criteria.categoryTargets.parser,
        actual: avgParser,
        passed: avgParser <= this.criteria.categoryTargets.parser
      }
    };

    const isAchieved = 
      averageParity >= this.criteria.targetParity &&
      consistentRuns >= this.criteria.minConsistentRuns &&
      categoryValidation.timing.passed &&
      categoryValidation.objectBehavior.passed &&
      categoryValidation.parser.passed;

    let message: string;
    if (isAchieved) {
      message = `Achievement validated: ${averageParity.toFixed(1)}% average parity across ${runs.length} runs`;
    } else {
      const issues: string[] = [];
      if (averageParity < this.criteria.targetParity) {
        issues.push(`parity ${averageParity.toFixed(1)}% < ${this.criteria.targetParity}% target`);
      }
      if (consistentRuns < this.criteria.minConsistentRuns) {
        issues.push(`only ${consistentRuns}/${this.criteria.minConsistentRuns} consistent runs`);
      }
      if (!categoryValidation.timing.passed) {
        issues.push(`timing ${avgTiming} > ${this.criteria.categoryTargets.timing} target`);
      }
      if (!categoryValidation.objectBehavior.passed) {
        issues.push(`object behavior ${avgObjectBehavior} > ${this.criteria.categoryTargets.objectBehavior} target`);
      }
      if (!categoryValidation.parser.passed) {
        issues.push(`parser ${avgParser} > ${this.criteria.categoryTargets.parser} target`);
      }
      message = `Achievement not met: ${issues.join(', ')}`;
    }

    const validation: AchievementValidation = {
      isAchieved,
      timestamp: new Date().toISOString(),
      criteria: this.criteria,
      validationRuns: runs,
      summary: {
        averageParity,
        minParity,
        maxParity,
        consistentRuns,
        totalRuns: runs.length
      },
      categoryValidation,
      message
    };

    this.validationHistory.push(validation);
    return validation;
  }

  /**
   * Verify consistency across multiple seeds
   */
  verifyConsistency(runs: ValidationRun[]): {
    isConsistent: boolean;
    variance: number;
    outliers: ValidationRun[];
  } {
    if (runs.length < 2) {
      return { isConsistent: true, variance: 0, outliers: [] };
    }

    const parities = runs.map(r => r.parityPercentage);
    const mean = parities.reduce((a, b) => a + b, 0) / parities.length;
    const variance = parities.reduce((a, p) => a + Math.pow(p - mean, 2), 0) / parities.length;
    const stdDev = Math.sqrt(variance);

    // Outliers are more than 2 standard deviations from mean
    const outliers = runs.filter(r => Math.abs(r.parityPercentage - mean) > 2 * stdDev);

    // Consistent if variance is low and no outliers
    const isConsistent = variance < 25 && outliers.length === 0;

    return { isConsistent, variance, outliers };
  }

  /**
   * Validate category targets
   */
  validateCategoryTargets(runs: ValidationRun[]): {
    allMet: boolean;
    results: Record<string, { target: number; actual: number; met: boolean }>;
  } {
    const avgTiming = runs.reduce((a, r) => a + r.categoryBreakdown.timing, 0) / runs.length;
    const avgObjectBehavior = runs.reduce((a, r) => a + r.categoryBreakdown.objectBehavior, 0) / runs.length;
    const avgParser = runs.reduce((a, r) => a + r.categoryBreakdown.parser, 0) / runs.length;

    const results = {
      timing: {
        target: this.criteria.categoryTargets.timing,
        actual: Math.round(avgTiming),
        met: avgTiming <= this.criteria.categoryTargets.timing
      },
      objectBehavior: {
        target: this.criteria.categoryTargets.objectBehavior,
        actual: Math.round(avgObjectBehavior),
        met: avgObjectBehavior <= this.criteria.categoryTargets.objectBehavior
      },
      parser: {
        target: this.criteria.categoryTargets.parser,
        actual: Math.round(avgParser),
        met: avgParser <= this.criteria.categoryTargets.parser
      }
    };

    const allMet = results.timing.met && results.objectBehavior.met && results.parser.met;

    return { allMet, results };
  }

  /**
   * Generate achievement report
   */
  generateAchievementReport(validation: AchievementValidation): AchievementReport {
    const progressReport = this.progressSystem.generateProgressReport();
    
    const recommendations: string[] = [];
    
    if (!validation.isAchieved) {
      if (validation.summary.averageParity < this.criteria.targetParity) {
        recommendations.push(`Improve parity from ${validation.summary.averageParity.toFixed(1)}% to ${this.criteria.targetParity}%`);
      }
      if (!validation.categoryValidation.timing.passed) {
        recommendations.push(`Reduce timing differences from ${validation.categoryValidation.timing.actual} to ≤${validation.categoryValidation.timing.target}`);
      }
      if (!validation.categoryValidation.objectBehavior.passed) {
        recommendations.push(`Reduce object behavior differences from ${validation.categoryValidation.objectBehavior.actual} to ≤${validation.categoryValidation.objectBehavior.target}`);
      }
      if (!validation.categoryValidation.parser.passed) {
        recommendations.push(`Eliminate parser differences (currently ${validation.categoryValidation.parser.actual})`);
      }
    } else {
      recommendations.push('Maintain current parity level');
      recommendations.push('Continue regression testing with each change');
    }

    return {
      title: validation.isAchieved 
        ? 'Parity Achievement Certification' 
        : 'Parity Progress Report',
      timestamp: new Date().toISOString(),
      validation,
      progressHistory: progressReport,
      recommendations
    };
  }

  /**
   * Get validation history
   */
  getValidationHistory(): AchievementValidation[] {
    return [...this.validationHistory];
  }

  /**
   * Get current criteria
   */
  getCriteria(): AchievementCriteria {
    return { ...this.criteria };
  }

  /**
   * Update criteria
   */
  updateCriteria(criteria: Partial<AchievementCriteria>): void {
    this.criteria = { ...this.criteria, ...criteria };
  }

  /**
   * Clear history (for testing)
   */
  clearHistory(): void {
    this.validationHistory = [];
  }

  /**
   * Static factory method
   */
  static create(
    criteria?: Partial<AchievementCriteria>,
    progressSystem?: ProgressTrackingSystem,
    regressionSystem?: RegressionPreventionSystem
  ): AchievementValidationSystem {
    return new AchievementValidationSystem(criteria, progressSystem, regressionSystem);
  }
}
