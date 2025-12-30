/**
 * ProgressTrackingSystem - Tracks parity improvements over time
 * 
 * This system provides detailed tracking of parity improvements,
 * historical progress reporting, and trend analysis.
 * 
 * Requirements: 5.5, 6.4
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';

/**
 * Progress entry for a single measurement
 */
export interface ProgressEntry {
  timestamp: string;
  parityPercentage: number;
  differenceCount: number;
  categoryBreakdown: CategoryBreakdown;
  seed: number;
  description?: string;
  milestone?: string;
}

/**
 * Category breakdown
 */
export interface CategoryBreakdown {
  timing: number;
  objectBehavior: number;
  parser: number;
  other: number;
}

/**
 * Milestone definition
 */
export interface Milestone {
  name: string;
  targetParity: number;
  achieved: boolean;
  achievedAt?: string;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  trend: 'improving' | 'stable' | 'declining';
  averageChange: number;
  recentEntries: number;
  projectedParity?: number;
  daysToTarget?: number;
}

/**
 * Progress report
 */
export interface ProgressReport {
  timestamp: string;
  startingParity: number;
  currentParity: number;
  totalImprovement: number;
  targetParity: number;
  progressPercentage: number;
  trend: TrendAnalysis;
  milestones: Milestone[];
  categoryProgress: CategoryProgress;
  history: ProgressEntry[];
}


/**
 * Category-specific progress
 */
export interface CategoryProgress {
  timing: { start: number; current: number; target: number; progress: number };
  objectBehavior: { start: number; current: number; target: number; progress: number };
  parser: { start: number; current: number; target: number; progress: number };
}

/**
 * Configuration for progress tracking
 */
export interface ProgressTrackingConfig {
  progressFilePath: string;
  targetParity: number;
  categoryTargets: {
    timing: number;
    objectBehavior: number;
    parser: number;
  };
  milestones: Array<{ name: string; targetParity: number }>;
}

const DEFAULT_CONFIG: ProgressTrackingConfig = {
  progressFilePath: 'parity-progress-history.json',
  targetParity: 95,
  categoryTargets: {
    timing: 5,
    objectBehavior: 3,
    parser: 0
  },
  milestones: [
    { name: '80% Parity', targetParity: 80 },
    { name: '85% Parity', targetParity: 85 },
    { name: '90% Parity', targetParity: 90 },
    { name: '95% Target', targetParity: 95 }
  ]
};

/**
 * ProgressTrackingSystem tracks parity improvements over time
 */
export class ProgressTrackingSystem {
  private config: ProgressTrackingConfig;
  private history: ProgressEntry[] = [];
  private milestones: Milestone[] = [];

  constructor(config?: Partial<ProgressTrackingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeMilestones();
    this.loadHistory();
  }

  /**
   * Initialize milestones from config
   */
  private initializeMilestones(): void {
    this.milestones = this.config.milestones.map(m => ({
      name: m.name,
      targetParity: m.targetParity,
      achieved: false
    }));
  }

  /**
   * Track a new progress entry
   */
  trackProgress(entry: Omit<ProgressEntry, 'timestamp'>): ProgressEntry {
    const fullEntry: ProgressEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.history.push(fullEntry);
    this.updateMilestones(fullEntry.parityPercentage);
    this.saveHistory();

    return fullEntry;
  }

  /**
   * Generate a comprehensive progress report
   */
  generateProgressReport(): ProgressReport {
    if (this.history.length === 0) {
      return this.getEmptyReport();
    }

    const startEntry = this.history[0];
    const currentEntry = this.history[this.history.length - 1];
    const totalImprovement = currentEntry.parityPercentage - startEntry.parityPercentage;
    
    const targetGap = this.config.targetParity - startEntry.parityPercentage;
    const progressPercentage = targetGap > 0 
      ? Math.min(100, Math.max(0, (totalImprovement / targetGap) * 100))
      : 100;

    return {
      timestamp: new Date().toISOString(),
      startingParity: startEntry.parityPercentage,
      currentParity: currentEntry.parityPercentage,
      totalImprovement,
      targetParity: this.config.targetParity,
      progressPercentage,
      trend: this.analyzeTrends(),
      milestones: this.milestones,
      categoryProgress: this.calculateCategoryProgress(),
      history: this.history
    };
  }

  /**
   * Analyze trends from recent history
   */
  analyzeTrends(): TrendAnalysis {
    if (this.history.length < 2) {
      return {
        trend: 'stable',
        averageChange: 0,
        recentEntries: this.history.length
      };
    }

    // Use last 5 entries for trend analysis
    const recentEntries = this.history.slice(-5);
    const changes: number[] = [];

    for (let i = 1; i < recentEntries.length; i++) {
      changes.push(recentEntries[i].parityPercentage - recentEntries[i - 1].parityPercentage);
    }

    const averageChange = changes.length > 0 
      ? changes.reduce((a, b) => a + b, 0) / changes.length 
      : 0;

    let trend: 'improving' | 'stable' | 'declining';
    if (averageChange > 0.5) {
      trend = 'improving';
    } else if (averageChange < -0.5) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    // Project future parity if improving
    const currentParity = this.history[this.history.length - 1].parityPercentage;
    let projectedParity: number | undefined;
    let daysToTarget: number | undefined;

    if (trend === 'improving' && averageChange > 0) {
      projectedParity = Math.min(100, currentParity + averageChange * 5);
      const remaining = this.config.targetParity - currentParity;
      if (remaining > 0) {
        daysToTarget = Math.ceil(remaining / averageChange);
      }
    }

    return {
      trend,
      averageChange,
      recentEntries: recentEntries.length,
      projectedParity,
      daysToTarget
    };
  }

  /**
   * Calculate category-specific progress
   */
  private calculateCategoryProgress(): CategoryProgress {
    if (this.history.length === 0) {
      return {
        timing: { start: 0, current: 0, target: this.config.categoryTargets.timing, progress: 0 },
        objectBehavior: { start: 0, current: 0, target: this.config.categoryTargets.objectBehavior, progress: 0 },
        parser: { start: 0, current: 0, target: this.config.categoryTargets.parser, progress: 0 }
      };
    }

    const startEntry = this.history[0];
    const currentEntry = this.history[this.history.length - 1];

    const calculateProgress = (start: number, current: number, target: number): number => {
      if (start <= target) return 100;
      const improvement = start - current;
      const needed = start - target;
      return Math.min(100, Math.max(0, (improvement / needed) * 100));
    };

    return {
      timing: {
        start: startEntry.categoryBreakdown.timing,
        current: currentEntry.categoryBreakdown.timing,
        target: this.config.categoryTargets.timing,
        progress: calculateProgress(
          startEntry.categoryBreakdown.timing,
          currentEntry.categoryBreakdown.timing,
          this.config.categoryTargets.timing
        )
      },
      objectBehavior: {
        start: startEntry.categoryBreakdown.objectBehavior,
        current: currentEntry.categoryBreakdown.objectBehavior,
        target: this.config.categoryTargets.objectBehavior,
        progress: calculateProgress(
          startEntry.categoryBreakdown.objectBehavior,
          currentEntry.categoryBreakdown.objectBehavior,
          this.config.categoryTargets.objectBehavior
        )
      },
      parser: {
        start: startEntry.categoryBreakdown.parser,
        current: currentEntry.categoryBreakdown.parser,
        target: this.config.categoryTargets.parser,
        progress: calculateProgress(
          startEntry.categoryBreakdown.parser,
          currentEntry.categoryBreakdown.parser,
          this.config.categoryTargets.parser
        )
      }
    };
  }

  /**
   * Update milestones based on current parity
   */
  private updateMilestones(currentParity: number): void {
    for (const milestone of this.milestones) {
      if (!milestone.achieved && currentParity >= milestone.targetParity) {
        milestone.achieved = true;
        milestone.achievedAt = new Date().toISOString();
      }
    }
  }

  /**
   * Get empty report for when no history exists
   */
  private getEmptyReport(): ProgressReport {
    return {
      timestamp: new Date().toISOString(),
      startingParity: 0,
      currentParity: 0,
      totalImprovement: 0,
      targetParity: this.config.targetParity,
      progressPercentage: 0,
      trend: { trend: 'stable', averageChange: 0, recentEntries: 0 },
      milestones: this.milestones,
      categoryProgress: this.calculateCategoryProgress(),
      history: []
    };
  }

  /**
   * Get progress history
   */
  getHistory(): ProgressEntry[] {
    return [...this.history];
  }

  /**
   * Get milestones
   */
  getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  /**
   * Check if target is achieved
   */
  isTargetAchieved(): boolean {
    if (this.history.length === 0) return false;
    return this.history[this.history.length - 1].parityPercentage >= this.config.targetParity;
  }

  /**
   * Get current parity
   */
  getCurrentParity(): number {
    if (this.history.length === 0) return 0;
    return this.history[this.history.length - 1].parityPercentage;
  }

  /**
   * Save history to file
   */
  private saveHistory(): void {
    try {
      const data = {
        history: this.history,
        milestones: this.milestones
      };
      writeFileSync(this.config.progressFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save progress history:', error);
    }
  }

  /**
   * Load history from file
   */
  private loadHistory(): void {
    try {
      if (existsSync(this.config.progressFilePath)) {
        const data = JSON.parse(readFileSync(this.config.progressFilePath, 'utf-8'));
        this.history = data.history || [];
        if (data.milestones) {
          this.milestones = data.milestones;
        }
      }
    } catch (error) {
      console.warn('Failed to load progress history:', error);
    }
  }

  /**
   * Clear history (for testing)
   */
  clearHistory(): void {
    this.history = [];
    this.initializeMilestones();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProgressTrackingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressTrackingConfig {
    return { ...this.config };
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<ProgressTrackingConfig>): ProgressTrackingSystem {
    return new ProgressTrackingSystem(config);
  }
}
