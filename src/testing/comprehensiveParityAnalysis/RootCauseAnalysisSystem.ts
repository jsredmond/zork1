/**
 * RootCauseAnalysisSystem - Analyzes behavioral differences to identify root causes
 * 
 * This system provides deep analysis of parity differences to identify
 * the underlying causes and generate actionable fix recommendations.
 * 
 * Requirements: 1.3, 1.4, 5.4
 */

import { CommandDifference, DifferenceType } from '../spotTesting/types.js';

/**
 * Root cause categories
 */
export enum RootCauseCategory {
  STATUS_BAR_CONTAMINATION = 'status_bar_contamination',
  DAEMON_TIMING = 'daemon_timing',
  ATMOSPHERIC_MESSAGE = 'atmospheric_message',
  ERROR_MESSAGE_FORMAT = 'error_message_format',
  OBJECT_VISIBILITY = 'object_visibility',
  CONTAINER_BEHAVIOR = 'container_behavior',
  INVENTORY_STATE = 'inventory_state',
  VOCABULARY_MISMATCH = 'vocabulary_mismatch',
  SYNTAX_HANDLING = 'syntax_handling',
  AMBIGUITY_RESOLUTION = 'ambiguity_resolution',
  UNKNOWN = 'unknown'
}

/**
 * Root cause analysis result
 */
export interface RootCauseAnalysis {
  difference: CommandDifference;
  category: RootCauseCategory;
  confidence: number; // 0-1
  description: string;
  affectedComponent: string;
  suggestedFix: string;
  relatedFiles: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Analysis report for a set of differences
 */
export interface AnalysisReport {
  timestamp: string;
  totalDifferences: number;
  analyzedDifferences: number;
  categorySummary: Record<RootCauseCategory, number>;
  prioritySummary: Record<string, number>;
  analyses: RootCauseAnalysis[];
  recommendations: FixRecommendation[];
}

/**
 * Fix recommendation
 */
export interface FixRecommendation {
  category: RootCauseCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImpact: number; // Number of differences this could fix
  files: string[];
  steps: string[];
}

/**
 * Pattern for identifying root causes
 */
interface RootCausePattern {
  category: RootCauseCategory;
  patterns: RegExp[];
  component: string;
  files: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}


/**
 * RootCauseAnalysisSystem provides deep analysis of parity differences
 */
export class RootCauseAnalysisSystem {
  private patterns: RootCausePattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize root cause detection patterns
   * Note: Order matters - more specific patterns should come first
   */
  private initializePatterns(): void {
    this.patterns = [
      // Status bar contamination (most specific - check first)
      {
        category: RootCauseCategory.STATUS_BAR_CONTAMINATION,
        patterns: [
          /Score:\s*\d+/i,
          /Moves:\s*\d+/i,
          /\d+\/\d+/,  // Score/Moves format
        ],
        component: 'StatusBarNormalizer',
        files: ['src/parity/StatusBarNormalizer.ts', 'src/io/terminal.ts'],
        priority: 'high'
      },
      // Daemon timing
      {
        category: RootCauseCategory.DAEMON_TIMING,
        patterns: [
          /lamp.*dim/i,
          /candle.*flicker/i,
          /thief.*appears/i,
          /troll.*recovers/i
        ],
        component: 'DaemonManager',
        files: ['src/engine/daemons.ts'],
        priority: 'high'
      },
      // Atmospheric messages
      {
        category: RootCauseCategory.ATMOSPHERIC_MESSAGE,
        patterns: [
          /bird.*sing/i,
          /wind.*blow/i,
          /leaves.*rustle/i,
          /distant.*sound/i
        ],
        component: 'AtmosphericMessageManager',
        files: ['src/game/atmosphericMessages.ts'],
        priority: 'medium'
      },
      // Vocabulary mismatch - check BEFORE error message format (more specific)
      {
        category: RootCauseCategory.VOCABULARY_MISMATCH,
        patterns: [
          /I don't know the word/i,
          /don't understand/i
        ],
        component: 'Vocabulary',
        files: ['src/parser/vocabulary.ts', 'src/parity/ParserConsistencyEngine.ts'],
        priority: 'high'
      },
      // Object visibility - check BEFORE error message format (more specific)
      {
        category: RootCauseCategory.OBJECT_VISIBILITY,
        patterns: [
          /isn't here/i,
          /not here/i
        ],
        component: 'ObjectInteractionHarmonizer',
        files: ['src/parity/ObjectInteractionHarmonizer.ts', 'src/game/objects.ts'],
        priority: 'medium'
      },
      // Error message format (general - check after more specific patterns)
      {
        category: RootCauseCategory.ERROR_MESSAGE_FORMAT,
        patterns: [
          /You can't see any/i,
          /What do you want to/i,
          /There seems to be a noun missing/i
        ],
        component: 'ParserConsistencyEngine',
        files: ['src/parity/ParserConsistencyEngine.ts', 'src/parser/parser.ts'],
        priority: 'medium'
      },
      // Container behavior
      {
        category: RootCauseCategory.CONTAINER_BEHAVIOR,
        patterns: [
          /put.*in/i,
          /won't fit/i,
          /already.*in/i,
          /can't put/i
        ],
        component: 'ContainerManager',
        files: ['src/game/objects.ts', 'src/game/actions.ts'],
        priority: 'medium'
      },
      // Inventory state
      {
        category: RootCauseCategory.INVENTORY_STATE,
        patterns: [
          /don't have/i,
          /not carrying/i,
          /already have/i,
          /hands.*full/i
        ],
        component: 'InventoryManager',
        files: ['src/game/state.ts', 'src/game/actions.ts'],
        priority: 'medium'
      },
      // Vocabulary mismatch
      {
        category: RootCauseCategory.VOCABULARY_MISMATCH,
        patterns: [
          /don't know the word/i,
          /don't understand/i
        ],
        component: 'Vocabulary',
        files: ['src/parser/vocabulary.ts', 'src/parity/ParserConsistencyEngine.ts'],
        priority: 'high'
      },
      // Syntax handling
      {
        category: RootCauseCategory.SYNTAX_HANDLING,
        patterns: [
          /noun missing/i,
          /incomplete sentence/i,
          /don't understand that sentence/i
        ],
        component: 'Parser',
        files: ['src/parser/parser.ts'],
        priority: 'medium'
      },
      // Ambiguity resolution
      {
        category: RootCauseCategory.AMBIGUITY_RESOLUTION,
        patterns: [
          /which.*do you mean/i,
          /be more specific/i
        ],
        component: 'AmbiguityResolver',
        files: ['src/parser/parser.ts', 'src/parity/ParserConsistencyEngine.ts'],
        priority: 'low'
      }
    ];
  }

  /**
   * Analyze a single difference to identify root cause
   */
  analyzeRootCause(difference: CommandDifference): RootCauseAnalysis {
    const tsOutput = difference.tsOutput || '';
    const zOutput = difference.zMachineOutput || '';
    const combinedOutput = `${tsOutput} ${zOutput}`;

    // Find matching pattern
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(combinedOutput)) {
          return {
            difference,
            category: pattern.category,
            confidence: this.calculateConfidence(difference, pattern),
            description: this.generateDescription(difference, pattern.category),
            affectedComponent: pattern.component,
            suggestedFix: this.generateSuggestedFix(pattern.category, difference),
            relatedFiles: pattern.files,
            priority: pattern.priority
          };
        }
      }
    }

    // Default to unknown
    return {
      difference,
      category: RootCauseCategory.UNKNOWN,
      confidence: 0.3,
      description: `Unknown difference in command: ${difference.command}`,
      affectedComponent: 'Unknown',
      suggestedFix: 'Manual investigation required',
      relatedFiles: [],
      priority: 'low'
    };
  }

  /**
   * Generate analysis report for multiple differences
   */
  generateAnalysisReport(differences: CommandDifference[]): AnalysisReport {
    const analyses = differences.map(d => this.analyzeRootCause(d));
    
    const categorySummary: Record<RootCauseCategory, number> = {} as Record<RootCauseCategory, number>;
    const prioritySummary: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };

    for (const analysis of analyses) {
      categorySummary[analysis.category] = (categorySummary[analysis.category] || 0) + 1;
      prioritySummary[analysis.priority]++;
    }

    const recommendations = this.identifyFixRecommendations(analyses);

    return {
      timestamp: new Date().toISOString(),
      totalDifferences: differences.length,
      analyzedDifferences: analyses.length,
      categorySummary,
      prioritySummary,
      analyses,
      recommendations
    };
  }

  /**
   * Identify fix recommendations based on analyses
   */
  identifyFixRecommendations(analyses: RootCauseAnalysis[]): FixRecommendation[] {
    const recommendations: FixRecommendation[] = [];
    const categoryGroups = new Map<RootCauseCategory, RootCauseAnalysis[]>();

    // Group by category
    for (const analysis of analyses) {
      const group = categoryGroups.get(analysis.category) || [];
      group.push(analysis);
      categoryGroups.set(analysis.category, group);
    }

    // Generate recommendations for each category
    for (const [category, group] of categoryGroups) {
      if (category === RootCauseCategory.UNKNOWN) continue;

      const priority = this.getHighestPriority(group);
      const files = [...new Set(group.flatMap(a => a.relatedFiles))];

      recommendations.push({
        category,
        priority,
        description: this.getRecommendationDescription(category),
        estimatedImpact: group.length,
        files,
        steps: this.getFixSteps(category)
      });
    }

    // Sort by estimated impact (descending)
    return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  /**
   * Calculate confidence score for a pattern match
   */
  private calculateConfidence(difference: CommandDifference, pattern: RootCausePattern): number {
    let confidence = 0.5;

    // Higher confidence if multiple patterns match
    const tsOutput = difference.tsOutput || '';
    const zOutput = difference.zMachineOutput || '';
    const combinedOutput = `${tsOutput} ${zOutput}`;

    let matchCount = 0;
    for (const regex of pattern.patterns) {
      if (regex.test(combinedOutput)) matchCount++;
    }

    confidence += matchCount * 0.1;

    // Higher confidence for timing differences with timing patterns
    if (difference.differenceType === DifferenceType.TIMING_DIFFERENCE &&
        pattern.category === RootCauseCategory.STATUS_BAR_CONTAMINATION) {
      confidence += 0.2;
    }

    return Math.min(1, confidence);
  }

  /**
   * Generate description for a root cause
   */
  private generateDescription(difference: CommandDifference, category: RootCauseCategory): string {
    const descriptions: Record<RootCauseCategory, string> = {
      [RootCauseCategory.STATUS_BAR_CONTAMINATION]: 
        `Status bar content contaminating game output for command: ${difference.command}`,
      [RootCauseCategory.DAEMON_TIMING]: 
        `Daemon timing mismatch affecting output for command: ${difference.command}`,
      [RootCauseCategory.ATMOSPHERIC_MESSAGE]: 
        `Atmospheric message timing/content difference for command: ${difference.command}`,
      [RootCauseCategory.ERROR_MESSAGE_FORMAT]: 
        `Error message format mismatch for command: ${difference.command}`,
      [RootCauseCategory.OBJECT_VISIBILITY]: 
        `Object visibility check difference for command: ${difference.command}`,
      [RootCauseCategory.CONTAINER_BEHAVIOR]: 
        `Container interaction behavior difference for command: ${difference.command}`,
      [RootCauseCategory.INVENTORY_STATE]: 
        `Inventory state management difference for command: ${difference.command}`,
      [RootCauseCategory.VOCABULARY_MISMATCH]: 
        `Vocabulary recognition mismatch for command: ${difference.command}`,
      [RootCauseCategory.SYNTAX_HANDLING]: 
        `Syntax handling difference for command: ${difference.command}`,
      [RootCauseCategory.AMBIGUITY_RESOLUTION]: 
        `Ambiguity resolution difference for command: ${difference.command}`,
      [RootCauseCategory.UNKNOWN]: 
        `Unknown difference type for command: ${difference.command}`
    };

    return descriptions[category];
  }

  /**
   * Generate suggested fix for a category
   */
  private generateSuggestedFix(category: RootCauseCategory, difference: CommandDifference): string {
    const fixes: Record<RootCauseCategory, string> = {
      [RootCauseCategory.STATUS_BAR_CONTAMINATION]: 
        'Apply StatusBarNormalizer to clean output before comparison',
      [RootCauseCategory.DAEMON_TIMING]: 
        'Synchronize daemon timing with Z-Machine implementation',
      [RootCauseCategory.ATMOSPHERIC_MESSAGE]: 
        'Align atmospheric message generation with Z-Machine randomization',
      [RootCauseCategory.ERROR_MESSAGE_FORMAT]: 
        'Update error message format to match Z-Machine exactly',
      [RootCauseCategory.OBJECT_VISIBILITY]: 
        'Fix object visibility checks to match Z-Machine behavior',
      [RootCauseCategory.CONTAINER_BEHAVIOR]: 
        'Align container interaction logic with Z-Machine',
      [RootCauseCategory.INVENTORY_STATE]: 
        'Synchronize inventory state management with Z-Machine',
      [RootCauseCategory.VOCABULARY_MISMATCH]: 
        'Update vocabulary to match Z-Machine word recognition',
      [RootCauseCategory.SYNTAX_HANDLING]: 
        'Fix syntax validation to match Z-Machine parser',
      [RootCauseCategory.AMBIGUITY_RESOLUTION]: 
        'Align ambiguity resolution with Z-Machine behavior',
      [RootCauseCategory.UNKNOWN]: 
        'Manual investigation required to identify root cause'
    };

    return fixes[category];
  }

  /**
   * Get recommendation description for a category
   */
  private getRecommendationDescription(category: RootCauseCategory): string {
    const descriptions: Record<RootCauseCategory, string> = {
      [RootCauseCategory.STATUS_BAR_CONTAMINATION]: 
        'Fix status bar contamination in game output',
      [RootCauseCategory.DAEMON_TIMING]: 
        'Synchronize daemon timing with Z-Machine',
      [RootCauseCategory.ATMOSPHERIC_MESSAGE]: 
        'Align atmospheric message behavior',
      [RootCauseCategory.ERROR_MESSAGE_FORMAT]: 
        'Standardize error message formats',
      [RootCauseCategory.OBJECT_VISIBILITY]: 
        'Fix object visibility error messages',
      [RootCauseCategory.CONTAINER_BEHAVIOR]: 
        'Align container interaction behavior',
      [RootCauseCategory.INVENTORY_STATE]: 
        'Fix inventory state management',
      [RootCauseCategory.VOCABULARY_MISMATCH]: 
        'Update vocabulary recognition',
      [RootCauseCategory.SYNTAX_HANDLING]: 
        'Fix syntax validation handling',
      [RootCauseCategory.AMBIGUITY_RESOLUTION]: 
        'Align ambiguity resolution',
      [RootCauseCategory.UNKNOWN]: 
        'Investigate unknown differences'
    };

    return descriptions[category];
  }

  /**
   * Get fix steps for a category
   */
  private getFixSteps(category: RootCauseCategory): string[] {
    const steps: Record<RootCauseCategory, string[]> = {
      [RootCauseCategory.STATUS_BAR_CONTAMINATION]: [
        '1. Review StatusBarNormalizer implementation',
        '2. Add patterns for detected contamination',
        '3. Test with affected commands',
        '4. Validate no regression'
      ],
      [RootCauseCategory.DAEMON_TIMING]: [
        '1. Compare daemon timing with Z-Machine',
        '2. Adjust timing intervals',
        '3. Test daemon message synchronization',
        '4. Validate with multi-seed testing'
      ],
      [RootCauseCategory.ATMOSPHERIC_MESSAGE]: [
        '1. Review atmospheric message generation',
        '2. Align randomization with Z-Machine',
        '3. Test with fixed seeds',
        '4. Validate deterministic behavior'
      ],
      [RootCauseCategory.ERROR_MESSAGE_FORMAT]: [
        '1. Compare error messages with Z-Machine',
        '2. Update message templates',
        '3. Test all error conditions',
        '4. Validate exact message matching'
      ],
      [RootCauseCategory.OBJECT_VISIBILITY]: [
        '1. Review object visibility logic',
        '2. Compare with Z-Machine behavior',
        '3. Fix visibility checks',
        '4. Test with affected objects'
      ],
      [RootCauseCategory.CONTAINER_BEHAVIOR]: [
        '1. Review container interaction logic',
        '2. Compare with Z-Machine behavior',
        '3. Fix container operations',
        '4. Test all container commands'
      ],
      [RootCauseCategory.INVENTORY_STATE]: [
        '1. Review inventory management',
        '2. Compare state handling with Z-Machine',
        '3. Fix state synchronization',
        '4. Test inventory operations'
      ],
      [RootCauseCategory.VOCABULARY_MISMATCH]: [
        '1. Compare vocabulary with Z-Machine',
        '2. Add/remove words as needed',
        '3. Test word recognition',
        '4. Validate error messages'
      ],
      [RootCauseCategory.SYNTAX_HANDLING]: [
        '1. Review syntax validation',
        '2. Compare with Z-Machine parser',
        '3. Fix syntax handling',
        '4. Test edge cases'
      ],
      [RootCauseCategory.AMBIGUITY_RESOLUTION]: [
        '1. Review ambiguity handling',
        '2. Compare with Z-Machine behavior',
        '3. Fix resolution logic',
        '4. Test ambiguous commands'
      ],
      [RootCauseCategory.UNKNOWN]: [
        '1. Manually investigate difference',
        '2. Identify root cause',
        '3. Implement fix',
        '4. Add to pattern detection'
      ]
    };

    return steps[category];
  }

  /**
   * Get highest priority from a group of analyses
   */
  private getHighestPriority(analyses: RootCauseAnalysis[]): 'low' | 'medium' | 'high' | 'critical' {
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    for (const priority of priorityOrder) {
      if (analyses.some(a => a.priority === priority)) {
        return priority as 'low' | 'medium' | 'high' | 'critical';
      }
    }
    return 'low';
  }

  /**
   * Static factory method
   */
  static create(): RootCauseAnalysisSystem {
    return new RootCauseAnalysisSystem();
  }
}
