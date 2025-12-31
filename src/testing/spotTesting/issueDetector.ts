/**
 * Issue detection and categorization system for spot testing
 * Analyzes differences to identify patterns and assess severity
 */

import {
  CommandDifference,
  IssuePattern,
  IssueAnalysis,
  PatternType,
  IssueSeverity,
  DifferenceType,
  RecommendationThresholds
} from './types.js';

/**
 * Detects and categorizes issues from spot test differences
 */
export class IssueDetector {
  private readonly thresholds: RecommendationThresholds;

  constructor(thresholds?: Partial<RecommendationThresholds>) {
    this.thresholds = {
      minDifferencesForDeepAnalysis: 3,
      maxParityForConcern: 85,
      criticalIssueThreshold: 1,
      ...thresholds
    };
  }

  /**
   * Analyze differences to identify patterns and assess overall severity
   */
  analyzeIssues(differences: CommandDifference[]): IssueAnalysis {
    const patterns = this.detectPatterns(differences);
    let overallSeverity = this.assessOverallSeverity(patterns);
    
    // If no patterns detected but we have critical individual differences, 
    // elevate overall severity accordingly
    if (patterns.length === 0 && differences.length > 0) {
      let maxIndividualSeverity = IssueSeverity.LOW;
      for (const diff of differences) {
        if (this.compareSeverity(diff.severity, maxIndividualSeverity) > 0) {
          maxIndividualSeverity = diff.severity;
        }
      }
      overallSeverity = maxIndividualSeverity;
    }
    
    const recommendDeepAnalysis = this.shouldRecommendDeepAnalysis(differences, patterns);
    const recommendations = this.generateRecommendations(differences, patterns);

    return {
      patterns,
      overallSeverity,
      recommendDeepAnalysis,
      recommendations
    };
  }

  /**
   * Calculate accurate percentage of commands with mismatches
   */
  calculateParityPercentage(totalCommands: number, differences: CommandDifference[]): number {
    if (totalCommands === 0) return 100;
    const matchingCommands = totalCommands - differences.length;
    return Math.round((matchingCommands / totalCommands) * 100 * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate summary report for quick overview
   */
  generateSummaryReport(
    totalCommands: number,
    differences: CommandDifference[],
    analysis: IssueAnalysis
  ): string {
    const parityPercentage = this.calculateParityPercentage(totalCommands, differences);
    
    let report = `Spot Test Results: ${differences.length}/${totalCommands} differences (${parityPercentage}% parity)\n`;
    report += `Overall Severity: ${analysis.overallSeverity.toUpperCase()}\n`;
    report += `Deep Analysis Recommended: ${analysis.recommendDeepAnalysis ? 'YES' : 'NO'}\n`;
    
    if (analysis.patterns.length > 0) {
      report += `\nIssue Patterns:\n`;
      for (const pattern of analysis.patterns) {
        report += `- ${pattern.type.replace(/_/g, ' ')}: ${pattern.frequency} occurrences (${pattern.severity})\n`;
      }
    }
    
    return report;
  }

  /**
   * Generate detailed report with sample commands for manual verification
   */
  generateDetailedReport(
    totalCommands: number,
    differences: CommandDifference[],
    analysis: IssueAnalysis
  ): string {
    const parityPercentage = this.calculateParityPercentage(totalCommands, differences);
    
    let report = `# Spot Test Analysis Report\n\n`;
    report += `## Summary\n`;
    report += `- **Total Commands:** ${totalCommands}\n`;
    report += `- **Differences Found:** ${differences.length}\n`;
    report += `- **Parity Score:** ${parityPercentage}%\n`;
    report += `- **Overall Severity:** ${analysis.overallSeverity.toUpperCase()}\n`;
    report += `- **Deep Analysis Recommended:** ${analysis.recommendDeepAnalysis ? 'YES' : 'NO'}\n\n`;

    if (analysis.patterns.length > 0) {
      report += `## Issue Patterns\n\n`;
      for (const pattern of analysis.patterns) {
        report += `### ${pattern.type.replace(/_/g, ' ').toUpperCase()}\n`;
        report += `- **Frequency:** ${pattern.frequency} occurrences\n`;
        report += `- **Severity:** ${pattern.severity.toUpperCase()}\n`;
        report += `- **Description:** ${pattern.description}\n`;
        
        if (pattern.sampleCommands.length > 0) {
          report += `- **Sample Commands:**\n`;
          for (const cmd of pattern.sampleCommands.slice(0, 3)) { // Show max 3 samples
            report += `  - \`${cmd}\`\n`;
          }
        }
        report += `\n`;
      }
    }

    if (differences.length > 0) {
      report += `## Sample Differences for Manual Verification\n\n`;
      const sampleDifferences = differences.slice(0, 5); // Show max 5 samples
      
      for (let i = 0; i < sampleDifferences.length; i++) {
        const diff = sampleDifferences[i];
        report += `### Difference ${i + 1}\n`;
        report += `- **Command:** \`${diff.command}\`\n`;
        report += `- **Type:** ${diff.differenceType.replace(/_/g, ' ')}\n`;
        report += `- **Severity:** ${diff.severity.toUpperCase()}\n`;
        report += `- **TypeScript Output:** \`${diff.tsOutput.substring(0, 100)}${diff.tsOutput.length > 100 ? '...' : ''}\`\n`;
        report += `- **Z-Machine Output:** \`${diff.zmOutput.substring(0, 100)}${diff.zmOutput.length > 100 ? '...' : ''}\`\n\n`;
      }
    }

    if (analysis.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      for (const recommendation of analysis.recommendations) {
        report += `- ${recommendation}\n`;
      }
      report += `\n`;
    }

    return report;
  }

  /**
   * Generate JSON report for programmatic consumption
   */
  generateJsonReport(
    totalCommands: number,
    differences: CommandDifference[],
    analysis: IssueAnalysis
  ): object {
    const parityPercentage = this.calculateParityPercentage(totalCommands, differences);
    
    return {
      summary: {
        totalCommands,
        differencesFound: differences.length,
        parityPercentage,
        overallSeverity: analysis.overallSeverity,
        recommendDeepAnalysis: analysis.recommendDeepAnalysis
      },
      patterns: analysis.patterns.map(pattern => ({
        type: pattern.type,
        frequency: pattern.frequency,
        severity: pattern.severity,
        description: pattern.description,
        sampleCommands: pattern.sampleCommands
      })),
      recommendations: analysis.recommendations,
      sampleDifferences: differences.slice(0, 10).map(diff => ({
        command: diff.command,
        type: diff.differenceType,
        severity: diff.severity,
        tsOutput: diff.tsOutput.substring(0, 200),
        zmOutput: diff.zmOutput.substring(0, 200)
      }))
    };
  }

  /**
   * Generate CSV report for spreadsheet analysis
   */
  generateCsvReport(differences: CommandDifference[]): string {
    let csv = 'Command Index,Command,Difference Type,Severity,TS Output,ZM Output\n';
    
    for (const diff of differences) {
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
      csv += `${diff.commandIndex},${escapeCsv(diff.command)},${diff.differenceType},${diff.severity},`;
      csv += `${escapeCsv(diff.tsOutput.substring(0, 100))},${escapeCsv(diff.zmOutput.substring(0, 100))}\n`;
    }
    
    return csv;
  }

  /**
   * Detect patterns in the differences
   */
  private detectPatterns(differences: CommandDifference[]): IssuePattern[] {
    const patterns: IssuePattern[] = [];
    
    // Group differences by type
    const differencesByType = new Map<DifferenceType, CommandDifference[]>();
    for (const diff of differences) {
      // Handle invalid/unknown difference types gracefully
      const diffType = Object.values(DifferenceType).includes(diff.differenceType) 
        ? diff.differenceType 
        : DifferenceType.MESSAGE_INCONSISTENCY;
      
      if (!differencesByType.has(diffType)) {
        differencesByType.set(diffType, []);
      }
      differencesByType.get(diffType)!.push(diff);
    }

    // Create patterns for each type - threshold of 1 for single occurrences
    // This ensures we detect patterns even with mixed severity differences
    for (const [type, diffs] of differencesByType) {
      if (diffs.length >= 1) { // Pattern threshold: at least 1 occurrence
        const pattern = this.createPattern(type, diffs);
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Create an issue pattern from a group of similar differences
   */
  private createPattern(type: DifferenceType, differences: CommandDifference[]): IssuePattern {
    const frequency = differences.length;
    const severity = this.assessPatternSeverity(type, frequency);
    const sampleCommands = differences.slice(0, 5).map(d => d.command);
    
    const patternType = this.mapDifferenceTypeToPatternType(type);
    const description = this.generatePatternDescription(type, frequency);

    return {
      type: patternType,
      frequency,
      severity,
      description,
      sampleCommands
    };
  }

  /**
   * Map DifferenceType to PatternType
   */
  private mapDifferenceTypeToPatternType(type: DifferenceType): PatternType {
    switch (type) {
      case DifferenceType.MESSAGE_INCONSISTENCY:
        return PatternType.MESSAGE_INCONSISTENCY;
      case DifferenceType.STATE_DIVERGENCE:
        return PatternType.STATE_DIVERGENCE;
      case DifferenceType.PARSER_DIFFERENCE:
        return PatternType.PARSER_DIFFERENCE;
      case DifferenceType.OBJECT_BEHAVIOR:
        return PatternType.OBJECT_BEHAVIOR;
      case DifferenceType.TIMING_DIFFERENCE:
        return PatternType.MESSAGE_INCONSISTENCY; // Map timing to message for now
      default:
        return PatternType.MESSAGE_INCONSISTENCY;
    }
  }

  /**
   * Generate description for a pattern
   */
  private generatePatternDescription(type: DifferenceType, frequency: number): string {
    const descriptions = {
      [DifferenceType.MESSAGE_INCONSISTENCY]: `Inconsistent messages between implementations (${frequency} cases)`,
      [DifferenceType.STATE_DIVERGENCE]: `Game state differences detected (${frequency} cases)`,
      [DifferenceType.PARSER_DIFFERENCE]: `Command parsing differences (${frequency} cases)`,
      [DifferenceType.OBJECT_BEHAVIOR]: `Object behavior inconsistencies (${frequency} cases)`,
      [DifferenceType.TIMING_DIFFERENCE]: `Timing-related differences (${frequency} cases)`
    };

    return descriptions[type] || `Unknown difference type (${frequency} cases)`;
  }

  /**
   * Assess severity of a pattern based on type and frequency
   */
  private assessPatternSeverity(type: DifferenceType, frequency: number): IssueSeverity {
    // Critical issues - STATE_DIVERGENCE is always critical
    if (type === DifferenceType.STATE_DIVERGENCE) {
      return IssueSeverity.CRITICAL;
    }
    
    if (type === DifferenceType.PARSER_DIFFERENCE && frequency >= 5) {
      return IssueSeverity.CRITICAL;
    }

    // High severity issues
    if (frequency >= 5) {
      return IssueSeverity.HIGH;
    }

    if (type === DifferenceType.OBJECT_BEHAVIOR) {
      return IssueSeverity.HIGH;
    }

    // Medium severity issues
    if (frequency >= 3) {
      return IssueSeverity.MEDIUM;
    }

    // Low severity by default
    return IssueSeverity.LOW;
  }

  /**
   * Assess overall severity from all patterns and individual differences
   */
  private assessOverallSeverity(patterns: IssuePattern[]): IssueSeverity {
    if (patterns.length === 0) {
      return IssueSeverity.LOW;
    }

    // Find highest severity from patterns
    let maxSeverity = IssueSeverity.LOW;
    for (const pattern of patterns) {
      if (this.compareSeverity(pattern.severity, maxSeverity) > 0) {
        maxSeverity = pattern.severity;
      }
    }

    return maxSeverity;
  }

  /**
   * Compare two severity levels (-1: a < b, 0: a = b, 1: a > b)
   */
  private compareSeverity(a: IssueSeverity, b: IssueSeverity): number {
    const severityOrder = {
      [IssueSeverity.LOW]: 0,
      [IssueSeverity.MEDIUM]: 1,
      [IssueSeverity.HIGH]: 2,
      [IssueSeverity.CRITICAL]: 3
    };

    return severityOrder[a] - severityOrder[b];
  }

  /**
   * Determine if deeper investigation is recommended
   */
  shouldRecommendDeepAnalysis(differences: CommandDifference[], patterns: IssuePattern[]): boolean {
    // Recommend if we have enough differences
    if (differences.length >= this.thresholds.minDifferencesForDeepAnalysis) {
      return true;
    }

    // Recommend if we have any critical issues (even individual ones)
    const criticalDifferences = differences.filter(d => d.severity === IssueSeverity.CRITICAL);
    if (criticalDifferences.length >= this.thresholds.criticalIssueThreshold) {
      return true;
    }

    // Recommend if we have any critical patterns
    const criticalPatterns = patterns.filter(p => p.severity === IssueSeverity.CRITICAL);
    if (criticalPatterns.length >= this.thresholds.criticalIssueThreshold) {
      return true;
    }

    // Recommend if we have multiple high-severity patterns
    const highSeverityPatterns = patterns.filter(p => 
      p.severity === IssueSeverity.HIGH || p.severity === IssueSeverity.CRITICAL
    );
    if (highSeverityPatterns.length >= 2) {
      return true;
    }

    return false;
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private generateRecommendations(differences: CommandDifference[], patterns: IssuePattern[]): string[] {
    const recommendations: string[] = [];

    if (differences.length === 0) {
      recommendations.push('No differences detected - parity appears good for tested commands');
      return recommendations;
    }

    // General recommendations based on difference count
    if (differences.length >= this.thresholds.minDifferencesForDeepAnalysis) {
      recommendations.push('Run comprehensive parity tests to investigate all differences thoroughly');
    }

    // Pattern-specific recommendations
    for (const pattern of patterns) {
      switch (pattern.type) {
        case PatternType.MESSAGE_INCONSISTENCY:
          if (pattern.severity === IssueSeverity.HIGH || pattern.severity === IssueSeverity.CRITICAL) {
            recommendations.push('Review message formatting and content generation logic');
          }
          break;

        case PatternType.STATE_DIVERGENCE:
          recommendations.push('Investigate game state management - this could indicate serious parity issues');
          break;

        case PatternType.PARSER_DIFFERENCE:
          recommendations.push('Review command parsing logic and vocabulary handling');
          break;

        case PatternType.OBJECT_BEHAVIOR:
          recommendations.push('Check object interaction and behavior implementation');
          break;
      }
    }

    // Severity-based recommendations
    const criticalPatterns = patterns.filter(p => p.severity === IssueSeverity.CRITICAL);
    if (criticalPatterns.length > 0) {
      recommendations.push('URGENT: Critical issues detected - immediate investigation required');
    }

    // If no specific recommendations, provide general guidance
    if (recommendations.length === 0) {
      recommendations.push('Review the sample differences and consider targeted testing of affected areas');
    }

    return recommendations;
  }
}