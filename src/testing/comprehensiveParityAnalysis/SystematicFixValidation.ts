/**
 * SystematicFixValidation - Validates fix implementations systematically
 * 
 * This system ensures fixes follow a defined approach without introducing
 * new issues, integrating with regression prevention for comprehensive safety.
 * 
 * Requirements: 6.2
 */

import { RegressionPreventionSystem, ValidationResult } from './RegressionPreventionSystem.js';
import { RootCauseAnalysisSystem, RootCauseCategory } from './RootCauseAnalysisSystem.js';
import { CommandDifference } from '../spotTesting/types.js';

/**
 * Fix implementation details
 */
export interface FixImplementation {
  id: string;
  category: RootCauseCategory;
  description: string;
  filesModified: string[];
  timestamp: string;
  author?: string;
}

/**
 * Fix validation result
 */
export interface FixValidationResult {
  fix: FixImplementation;
  isValid: boolean;
  parityBefore: number;
  parityAfter: number;
  parityChange: number;
  newIssuesIntroduced: CommandDifference[];
  issuesResolved: CommandDifference[];
  recommendation: 'accept' | 'review' | 'reject';
  message: string;
}

/**
 * Systematic approach step
 */
export interface ApproachStep {
  step: number;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

/**
 * Fix workflow state
 */
export interface FixWorkflow {
  fix: FixImplementation;
  steps: ApproachStep[];
  currentStep: number;
  status: 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startedAt: string;
  completedAt?: string;
}


/**
 * Configuration for systematic fix validation
 */
export interface SystematicFixConfig {
  maxNewIssues: number;
  minParityImprovement: number;
  requireAllStepsComplete: boolean;
  validationSeeds: number[];
}

const DEFAULT_CONFIG: SystematicFixConfig = {
  maxNewIssues: 2,
  minParityImprovement: -1, // Allow small regression
  requireAllStepsComplete: true,
  validationSeeds: [12345, 67890, 54321]
};

/**
 * Standard approach steps for fix implementation
 */
const STANDARD_APPROACH_STEPS: Omit<ApproachStep, 'completed' | 'completedAt'>[] = [
  { step: 1, name: 'Analyze', description: 'Analyze root cause of the issue' },
  { step: 2, name: 'Plan', description: 'Plan the fix implementation' },
  { step: 3, name: 'Implement', description: 'Implement the fix' },
  { step: 4, name: 'Test', description: 'Test the fix locally' },
  { step: 5, name: 'Validate', description: 'Validate no regression' },
  { step: 6, name: 'Document', description: 'Document the changes' }
];

/**
 * SystematicFixValidation ensures fixes follow a systematic approach
 */
export class SystematicFixValidation {
  private config: SystematicFixConfig;
  private regressionSystem: RegressionPreventionSystem;
  private rootCauseSystem: RootCauseAnalysisSystem;
  private activeWorkflows: Map<string, FixWorkflow> = new Map();
  private completedFixes: FixValidationResult[] = [];

  constructor(
    config?: Partial<SystematicFixConfig>,
    regressionSystem?: RegressionPreventionSystem,
    rootCauseSystem?: RootCauseAnalysisSystem
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.regressionSystem = regressionSystem ?? new RegressionPreventionSystem();
    this.rootCauseSystem = rootCauseSystem ?? new RootCauseAnalysisSystem();
  }

  /**
   * Start a new fix workflow
   */
  startFixWorkflow(fix: FixImplementation): FixWorkflow {
    const workflow: FixWorkflow = {
      fix,
      steps: STANDARD_APPROACH_STEPS.map(s => ({ ...s, completed: false })),
      currentStep: 1,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    };

    this.activeWorkflows.set(fix.id, workflow);
    return workflow;
  }

  /**
   * Complete a step in the workflow
   */
  completeStep(fixId: string, stepNumber: number): FixWorkflow | null {
    const workflow = this.activeWorkflows.get(fixId);
    if (!workflow) return null;

    const step = workflow.steps.find(s => s.step === stepNumber);
    if (step) {
      step.completed = true;
      step.completedAt = new Date().toISOString();
      workflow.currentStep = Math.min(stepNumber + 1, workflow.steps.length);
    }

    return workflow;
  }

  /**
   * Validate a fix implementation
   */
  async validateFixImplementation(
    fix: FixImplementation,
    parityBefore: number,
    currentDifferences: CommandDifference[],
    previousDifferences: CommandDifference[]
  ): Promise<FixValidationResult> {
    // Calculate parity after
    const parityAfter = 100 - (currentDifferences.length / 200) * 100;
    const parityChange = parityAfter - parityBefore;

    // Identify new and resolved issues
    const previousSignatures = new Set(
      previousDifferences.map(d => `${d.command}:${d.differenceType}`)
    );
    const currentSignatures = new Set(
      currentDifferences.map(d => `${d.command}:${d.differenceType}`)
    );

    const newIssuesIntroduced = currentDifferences.filter(
      d => !previousSignatures.has(`${d.command}:${d.differenceType}`)
    );
    const issuesResolved = previousDifferences.filter(
      d => !currentSignatures.has(`${d.command}:${d.differenceType}`)
    );

    // Determine recommendation
    let recommendation: 'accept' | 'review' | 'reject';
    let message: string;

    if (newIssuesIntroduced.length > this.config.maxNewIssues) {
      recommendation = 'reject';
      message = `Fix introduced ${newIssuesIntroduced.length} new issues (max allowed: ${this.config.maxNewIssues})`;
    } else if (parityChange < this.config.minParityImprovement) {
      recommendation = 'reject';
      message = `Parity decreased by ${Math.abs(parityChange).toFixed(1)}% (min allowed: ${this.config.minParityImprovement}%)`;
    } else if (newIssuesIntroduced.length > 0) {
      recommendation = 'review';
      message = `Fix resolved ${issuesResolved.length} issues but introduced ${newIssuesIntroduced.length} new ones`;
    } else {
      recommendation = 'accept';
      message = `Fix successfully resolved ${issuesResolved.length} issues with no new issues`;
    }

    const result: FixValidationResult = {
      fix,
      isValid: recommendation !== 'reject',
      parityBefore,
      parityAfter,
      parityChange,
      newIssuesIntroduced,
      issuesResolved,
      recommendation,
      message
    };

    this.completedFixes.push(result);
    return result;
  }

  /**
   * Ensure no new issues are introduced
   */
  ensureNoNewIssues(
    currentDifferences: CommandDifference[],
    previousDifferences: CommandDifference[]
  ): { hasNewIssues: boolean; newIssues: CommandDifference[] } {
    const previousSignatures = new Set(
      previousDifferences.map(d => `${d.command}:${d.differenceType}`)
    );

    const newIssues = currentDifferences.filter(
      d => !previousSignatures.has(`${d.command}:${d.differenceType}`)
    );

    return {
      hasNewIssues: newIssues.length > 0,
      newIssues
    };
  }

  /**
   * Check if workflow follows systematic approach
   */
  followSystematicApproach(fixId: string): {
    isFollowing: boolean;
    completedSteps: number;
    totalSteps: number;
    missingSteps: string[];
  } {
    const workflow = this.activeWorkflows.get(fixId);
    
    if (!workflow) {
      return {
        isFollowing: false,
        completedSteps: 0,
        totalSteps: STANDARD_APPROACH_STEPS.length,
        missingSteps: STANDARD_APPROACH_STEPS.map(s => s.name)
      };
    }

    const completedSteps = workflow.steps.filter(s => s.completed).length;
    const missingSteps = workflow.steps
      .filter(s => !s.completed)
      .map(s => s.name);

    const isFollowing = this.config.requireAllStepsComplete
      ? completedSteps === workflow.steps.length
      : completedSteps >= workflow.steps.length - 1;

    return {
      isFollowing,
      completedSteps,
      totalSteps: workflow.steps.length,
      missingSteps
    };
  }

  /**
   * Complete a fix workflow
   */
  completeWorkflow(fixId: string, status: 'completed' | 'failed' | 'rolled_back'): FixWorkflow | null {
    const workflow = this.activeWorkflows.get(fixId);
    if (!workflow) return null;

    workflow.status = status;
    workflow.completedAt = new Date().toISOString();

    return workflow;
  }

  /**
   * Get active workflow
   */
  getWorkflow(fixId: string): FixWorkflow | undefined {
    return this.activeWorkflows.get(fixId);
  }

  /**
   * Get all active workflows
   */
  getActiveWorkflows(): FixWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get completed fixes
   */
  getCompletedFixes(): FixValidationResult[] {
    return [...this.completedFixes];
  }

  /**
   * Get fix validation statistics
   */
  getStatistics(): {
    totalFixes: number;
    acceptedFixes: number;
    rejectedFixes: number;
    reviewFixes: number;
    totalIssuesResolved: number;
    totalNewIssues: number;
  } {
    const stats = {
      totalFixes: this.completedFixes.length,
      acceptedFixes: 0,
      rejectedFixes: 0,
      reviewFixes: 0,
      totalIssuesResolved: 0,
      totalNewIssues: 0
    };

    for (const fix of this.completedFixes) {
      switch (fix.recommendation) {
        case 'accept': stats.acceptedFixes++; break;
        case 'reject': stats.rejectedFixes++; break;
        case 'review': stats.reviewFixes++; break;
      }
      stats.totalIssuesResolved += fix.issuesResolved.length;
      stats.totalNewIssues += fix.newIssuesIntroduced.length;
    }

    return stats;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SystematicFixConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): SystematicFixConfig {
    return { ...this.config };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.activeWorkflows.clear();
    this.completedFixes = [];
  }

  /**
   * Static factory method
   */
  static create(
    config?: Partial<SystematicFixConfig>,
    regressionSystem?: RegressionPreventionSystem,
    rootCauseSystem?: RootCauseAnalysisSystem
  ): SystematicFixValidation {
    return new SystematicFixValidation(config, regressionSystem, rootCauseSystem);
  }
}
