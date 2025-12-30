/**
 * Comprehensive Parity Analyzer
 * 
 * Orchestrates the entire parity analysis and improvement process for achieving
 * 95%+ parity between TypeScript and Z-Machine implementations.
 * 
 * Environment Configuration:
 * - dfrotz interpreter path: /opt/homebrew/bin/dfrotz
 * - Z-Machine game file: COMPILED/zork1.z3
 * - Current baseline: 76.5% parity (47 differences out of 200 commands)
 * - Target: 95%+ parity (≤10 differences out of 200 commands)
 */

import { SpotTestRunner } from '../spotTesting/spotTestRunner.js';
import { 
  CommandDifference, 
  DifferenceType,
  SpotTestResult 
} from '../spotTesting/types.js';

/**
 * Configuration for the comprehensive parity analyzer
 */
export interface ParityAnalyzerConfig {
  /** Path to dfrotz interpreter */
  dfrotzPath: string;
  /** Path to Z-Machine game file */
  gameFilePath: string;
  /** Baseline parity percentage (default: 76.5) */
  baselineParity: number;
  /** Target parity percentage (default: 95) */
  targetParity: number;
  /** Number of commands for spot testing */
  commandCount: number;
  /** Seeds for multi-seed validation */
  validationSeeds: number[];
}

/**
 * Result of parity analysis
 */
export interface ParityAnalysisResult {
  /** Current parity percentage */
  currentParity: number;
  /** Total number of differences found */
  totalDifferences: number;
  /** Categorized issues by type */
  categorizedIssues: CategorizedIssues;
  /** Prioritized resolution plan */
  prioritizedPlan: ResolutionPlan;
  /** Baseline comparison result */
  baselineComparison: BaselineComparison;
  /** Timestamp of analysis */
  timestamp: string;
}

/**
 * Issues categorized by type
 */
export interface CategorizedIssues {
  /** Timing-related differences (status bar, daemon, atmospheric) */
  timingDifferences: CategoryDetail;
  /** Object behavior differences (error messages, interactions) */
  objectBehaviorDifferences: CategoryDetail;
  /** Parser differences (vocabulary, syntax) */
  parserDifferences: CategoryDetail;
  /** Summary statistics */
  summary: CategorySummary;
}

/**
 * Detail for a category of issues
 */
export interface CategoryDetail {
  /** Number of issues in this category */
  count: number;
  /** Percentage of total issues */
  percentage: number;
  /** Target count for this category */
  targetCount: number;
  /** Sample differences for analysis */
  samples: CommandDifference[];
  /** Root causes identified */
  rootCauses: string[];
}

/**
 * Summary of categorized issues
 */
export interface CategorySummary {
  /** Total issues across all categories */
  totalIssues: number;
  /** Most impactful category */
  primaryCategory: DifferenceType;
  /** Estimated effort to resolve */
  estimatedEffort: 'low' | 'medium' | 'high';
  /** Recommended resolution order */
  resolutionOrder: DifferenceType[];
}

/**
 * Resolution plan for addressing issues
 */
export interface ResolutionPlan {
  /** Phases of resolution */
  phases: ResolutionPhase[];
  /** Target parity after completion */
  targetParity: number;
  /** Estimated total effort */
  estimatedEffort: EffortEstimate;
  /** Risk assessment */
  riskAssessment: RiskAssessment;
}

/**
 * A phase in the resolution plan
 */
export interface ResolutionPhase {
  /** Phase name */
  name: string;
  /** Category being addressed */
  category: DifferenceType;
  /** Current count */
  currentCount: number;
  /** Target count */
  targetCount: number;
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Specific actions to take */
  actions: string[];
}

/**
 * Effort estimate for resolution
 */
export interface EffortEstimate {
  /** Estimated hours */
  hours: number;
  /** Complexity level */
  complexity: 'low' | 'medium' | 'high';
  /** Risk level */
  risk: 'low' | 'medium' | 'high';
}

/**
 * Risk assessment for resolution plan
 */
export interface RiskAssessment {
  /** Overall risk level */
  overallRisk: 'low' | 'medium' | 'high';
  /** Specific risks identified */
  risks: string[];
  /** Mitigation strategies */
  mitigations: string[];
}

/**
 * Baseline comparison result
 */
export interface BaselineComparison {
  /** Whether current parity meets or exceeds baseline */
  meetsBaseline: boolean;
  /** Difference from baseline (positive = improvement) */
  parityDelta: number;
  /** New issues introduced */
  newIssues: CommandDifference[];
  /** Issues resolved */
  resolvedIssues: CommandDifference[];
  /** Recommendation based on comparison */
  recommendation: 'proceed' | 'investigate' | 'rollback';
}

/**
 * Validation result for improvements
 */
export interface ValidationResult {
  /** Whether validation passed */
  passed: boolean;
  /** Current parity percentage */
  currentParity: number;
  /** Baseline parity percentage */
  baselineParity: number;
  /** Whether regression occurred */
  hasRegression: boolean;
  /** Details of any issues */
  details: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ParityAnalyzerConfig = {
  dfrotzPath: '/opt/homebrew/bin/dfrotz',
  gameFilePath: 'COMPILED/zork1.z3',
  baselineParity: 70.0, // Average across multiple seeds (59.5%, 78%, 73%)
  targetParity: 95,
  commandCount: 200,
  validationSeeds: [12345, 67890, 54321, 99999, 11111]
};

/**
 * ComprehensiveParityAnalyzer orchestrates the entire parity analysis
 * and improvement process.
 */
export class ComprehensiveParityAnalyzer {
  private config: ParityAnalyzerConfig;
  private spotTestRunner: SpotTestRunner;
  private baselineResults: SpotTestResult | null = null;

  constructor(config?: Partial<ParityAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.spotTestRunner = new SpotTestRunner();
    
    // Configure Z-Machine path
    this.spotTestRunner.setZMachineConfig(
      this.config.dfrotzPath,
      this.config.gameFilePath
    );
  }

  /**
   * Analyze the current parity state comprehensively
   */
  async analyzeCurrentState(seed?: number): Promise<ParityAnalysisResult> {
    const testSeed = seed ?? this.config.validationSeeds[0];
    
    // Run spot test to get current state
    const spotResult = await this.spotTestRunner.runSpotTest({
      commandCount: this.config.commandCount,
      seed: testSeed
    });

    // Categorize the issues
    const categorizedIssues = this.categorizeIssues(spotResult.differences);

    // Create prioritized resolution plan
    const prioritizedPlan = this.prioritizeResolution(categorizedIssues);

    // Compare against baseline
    const baselineComparison = this.compareToBaseline(spotResult);

    return {
      currentParity: spotResult.parityScore,
      totalDifferences: spotResult.differences.length,
      categorizedIssues,
      prioritizedPlan,
      baselineComparison,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Categorize issues by type for systematic resolution
   */
  categorizeIssues(differences: CommandDifference[]): CategorizedIssues {
    const timing: CommandDifference[] = [];
    const objectBehavior: CommandDifference[] = [];
    const parser: CommandDifference[] = [];

    for (const diff of differences) {
      switch (diff.differenceType) {
        case DifferenceType.TIMING_DIFFERENCE:
          timing.push(diff);
          break;
        case DifferenceType.OBJECT_BEHAVIOR:
          objectBehavior.push(diff);
          break;
        case DifferenceType.PARSER_DIFFERENCE:
          parser.push(diff);
          break;
        default:
          // Classify based on content analysis
          if (this.isTimingRelated(diff)) {
            timing.push(diff);
          } else if (this.isObjectBehaviorRelated(diff)) {
            objectBehavior.push(diff);
          } else {
            parser.push(diff);
          }
      }
    }

    const total = differences.length;

    return {
      timingDifferences: {
        count: timing.length,
        percentage: total > 0 ? (timing.length / total) * 100 : 0,
        targetCount: 5, // Target: ≤5 timing differences
        samples: timing.slice(0, 5),
        rootCauses: this.identifyTimingRootCauses(timing)
      },
      objectBehaviorDifferences: {
        count: objectBehavior.length,
        percentage: total > 0 ? (objectBehavior.length / total) * 100 : 0,
        targetCount: 3, // Target: ≤3 object behavior differences
        samples: objectBehavior.slice(0, 5),
        rootCauses: this.identifyObjectBehaviorRootCauses(objectBehavior)
      },
      parserDifferences: {
        count: parser.length,
        percentage: total > 0 ? (parser.length / total) * 100 : 0,
        targetCount: 0, // Target: 0 parser differences
        samples: parser.slice(0, 5),
        rootCauses: this.identifyParserRootCauses(parser)
      },
      summary: this.createCategorySummary(timing, objectBehavior, parser)
    };
  }

  /**
   * Create a prioritized resolution plan
   */
  prioritizeResolution(issues: CategorizedIssues): ResolutionPlan {
    const phases: ResolutionPhase[] = [];

    // Phase 1: Timing differences (highest impact - 68% of issues typically)
    if (issues.timingDifferences.count > issues.timingDifferences.targetCount) {
      phases.push({
        name: 'Timing Difference Resolution',
        category: DifferenceType.TIMING_DIFFERENCE,
        currentCount: issues.timingDifferences.count,
        targetCount: issues.timingDifferences.targetCount,
        priority: 'critical',
        actions: [
          'Fix status bar contamination in game responses',
          'Synchronize daemon message timing with Z-Machine',
          'Align atmospheric message handling',
          'Ensure move counter synchronization'
        ]
      });
    }

    // Phase 2: Object behavior differences (28% of issues typically)
    if (issues.objectBehaviorDifferences.count > issues.objectBehaviorDifferences.targetCount) {
      phases.push({
        name: 'Object Behavior Alignment',
        category: DifferenceType.OBJECT_BEHAVIOR,
        currentCount: issues.objectBehaviorDifferences.count,
        targetCount: issues.objectBehaviorDifferences.targetCount,
        priority: 'high',
        actions: [
          'Standardize "drop" command error messages',
          'Align object visibility error patterns',
          'Fix container interaction handling',
          'Synchronize inventory state management'
        ]
      });
    }

    // Phase 3: Parser differences (4% of issues typically)
    if (issues.parserDifferences.count > issues.parserDifferences.targetCount) {
      phases.push({
        name: 'Parser Consistency Enhancement',
        category: DifferenceType.PARSER_DIFFERENCE,
        currentCount: issues.parserDifferences.count,
        targetCount: issues.parserDifferences.targetCount,
        priority: 'medium',
        actions: [
          'Remove "room" from vocabulary if not in Z-Machine',
          'Align unknown word error messages',
          'Fix command syntax validation',
          'Ensure ambiguity resolution consistency'
        ]
      });
    }

    return {
      phases,
      targetParity: this.config.targetParity,
      estimatedEffort: this.estimateEffort(phases),
      riskAssessment: this.assessRisks(phases)
    };
  }

  /**
   * Validate an improvement against the baseline
   */
  async validateImprovement(seed?: number): Promise<ValidationResult> {
    const testSeed = seed ?? this.config.validationSeeds[0];
    
    const spotResult = await this.spotTestRunner.runSpotTest({
      commandCount: this.config.commandCount,
      seed: testSeed
    });

    const hasRegression = spotResult.parityScore < this.config.baselineParity;

    return {
      passed: !hasRegression && spotResult.parityScore >= this.config.baselineParity,
      currentParity: spotResult.parityScore,
      baselineParity: this.config.baselineParity,
      hasRegression,
      details: hasRegression 
        ? `REGRESSION DETECTED: Parity dropped from ${this.config.baselineParity}% to ${spotResult.parityScore}%`
        : `Parity maintained at ${spotResult.parityScore}% (baseline: ${this.config.baselineParity}%)`
    };
  }

  /**
   * Run multi-seed validation for consistency
   */
  async runMultiSeedValidation(): Promise<{
    allPassed: boolean;
    results: Array<{ seed: number; parity: number; passed: boolean }>;
    averageParity: number;
  }> {
    const results: Array<{ seed: number; parity: number; passed: boolean }> = [];

    for (const seed of this.config.validationSeeds) {
      const validation = await this.validateImprovement(seed);
      results.push({
        seed,
        parity: validation.currentParity,
        passed: validation.passed
      });
    }

    const allPassed = results.every(r => r.passed);
    const averageParity = results.reduce((sum, r) => sum + r.parity, 0) / results.length;

    return { allPassed, results, averageParity };
  }

  /**
   * Establish baseline for regression prevention
   */
  async establishBaseline(seed?: number): Promise<SpotTestResult> {
    const testSeed = seed ?? this.config.validationSeeds[0];
    
    this.baselineResults = await this.spotTestRunner.runSpotTest({
      commandCount: this.config.commandCount,
      seed: testSeed
    });

    return this.baselineResults;
  }

  /**
   * Compare current results to baseline
   */
  private compareToBaseline(current: SpotTestResult): BaselineComparison {
    const baselineParity = this.config.baselineParity;
    const meetsBaseline = current.parityScore >= baselineParity;
    const parityDelta = current.parityScore - baselineParity;

    let recommendation: 'proceed' | 'investigate' | 'rollback';
    if (parityDelta >= 0) {
      recommendation = 'proceed';
    } else if (parityDelta > -5) {
      recommendation = 'investigate';
    } else {
      recommendation = 'rollback';
    }

    return {
      meetsBaseline,
      parityDelta,
      newIssues: [], // Would need baseline comparison for this
      resolvedIssues: [],
      recommendation
    };
  }

  /**
   * Check if a difference is timing-related
   */
  private isTimingRelated(diff: CommandDifference): boolean {
    const output = (diff.tsOutput + diff.zmOutput).toLowerCase();
    const timingKeywords = ['score:', 'moves:', 'lamp', 'lantern', 'thief', 'troll'];
    return timingKeywords.some(kw => output.includes(kw));
  }

  /**
   * Check if a difference is object behavior related
   */
  private isObjectBehaviorRelated(diff: CommandDifference): boolean {
    const output = (diff.tsOutput + diff.zmOutput).toLowerCase();
    const objectKeywords = ['drop', 'take', 'get', 'put', 'inventory', 'carrying'];
    return objectKeywords.some(kw => output.includes(kw));
  }

  /**
   * Identify root causes for timing differences
   */
  private identifyTimingRootCauses(diffs: CommandDifference[]): string[] {
    const causes: Set<string> = new Set();
    
    for (const diff of diffs) {
      if (diff.tsOutput.includes('Score:') && !diff.zmOutput.includes('Score:')) {
        causes.add('Status bar contamination in TypeScript output');
      }
      if (diff.tsOutput.includes('Moves:') !== diff.zmOutput.includes('Moves:')) {
        causes.add('Move counter synchronization issue');
      }
    }

    return Array.from(causes);
  }

  /**
   * Identify root causes for object behavior differences
   */
  private identifyObjectBehaviorRootCauses(diffs: CommandDifference[]): string[] {
    const causes: Set<string> = new Set();
    
    for (const diff of diffs) {
      if (diff.tsOutput.includes('noun missing') && diff.zmOutput.includes('What do you want')) {
        causes.add('Drop command error message inconsistency');
      }
      if (diff.tsOutput.includes("can't see") && diff.zmOutput.includes("don't have")) {
        causes.add('Object visibility vs possession error message mismatch');
      }
    }

    return Array.from(causes);
  }

  /**
   * Identify root causes for parser differences
   */
  private identifyParserRootCauses(diffs: CommandDifference[]): string[] {
    const causes: Set<string> = new Set();
    
    for (const diff of diffs) {
      if (diff.zmOutput.includes("don't know the word")) {
        causes.add('Vocabulary recognition inconsistency');
      }
    }

    return Array.from(causes);
  }

  /**
   * Create category summary
   */
  private createCategorySummary(
    timing: CommandDifference[],
    objectBehavior: CommandDifference[],
    parser: CommandDifference[]
  ): CategorySummary {
    const total = timing.length + objectBehavior.length + parser.length;
    
    let primaryCategory: DifferenceType;
    if (timing.length >= objectBehavior.length && timing.length >= parser.length) {
      primaryCategory = DifferenceType.TIMING_DIFFERENCE;
    } else if (objectBehavior.length >= parser.length) {
      primaryCategory = DifferenceType.OBJECT_BEHAVIOR;
    } else {
      primaryCategory = DifferenceType.PARSER_DIFFERENCE;
    }

    return {
      totalIssues: total,
      primaryCategory,
      estimatedEffort: total > 30 ? 'high' : total > 15 ? 'medium' : 'low',
      resolutionOrder: [
        DifferenceType.TIMING_DIFFERENCE,
        DifferenceType.OBJECT_BEHAVIOR,
        DifferenceType.PARSER_DIFFERENCE
      ]
    };
  }

  /**
   * Estimate effort for resolution phases
   */
  private estimateEffort(phases: ResolutionPhase[]): EffortEstimate {
    const totalIssues = phases.reduce((sum, p) => sum + (p.currentCount - p.targetCount), 0);
    
    return {
      hours: totalIssues * 2, // Rough estimate: 2 hours per issue
      complexity: totalIssues > 30 ? 'high' : totalIssues > 15 ? 'medium' : 'low',
      risk: phases.some(p => p.priority === 'critical') ? 'medium' : 'low'
    };
  }

  /**
   * Assess risks for resolution plan
   */
  private assessRisks(phases: ResolutionPhase[]): RiskAssessment {
    const risks: string[] = [];
    const mitigations: string[] = [];

    if (phases.some(p => p.category === DifferenceType.TIMING_DIFFERENCE)) {
      risks.push('Timing changes may affect daemon behavior');
      mitigations.push('Test daemon behavior after each timing fix');
    }

    if (phases.some(p => p.category === DifferenceType.PARSER_DIFFERENCE)) {
      risks.push('Parser changes may affect command recognition');
      mitigations.push('Comprehensive parser testing after vocabulary changes');
    }

    risks.push('Regression risk during multi-phase implementation');
    mitigations.push('Validate parity after each change, rollback if regression detected');

    return {
      overallRisk: risks.length > 2 ? 'medium' : 'low',
      risks,
      mitigations
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): ParityAnalyzerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ParityAnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update Z-Machine config if paths changed
    if (config.dfrotzPath || config.gameFilePath) {
      this.spotTestRunner.setZMachineConfig(
        this.config.dfrotzPath,
        this.config.gameFilePath
      );
    }
  }
}
