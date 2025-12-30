/**
 * Behavioral Difference Detector
 * 
 * Identifies and classifies specific types of behavioral differences between
 * TypeScript and Z-Machine implementations.
 * 
 * Difference Types:
 * - Timing: Status bar contamination, daemon timing, atmospheric messages
 * - Object Behavior: Error messages, interaction patterns, state management
 * - Parser: Vocabulary recognition, command syntax, error responses
 */

import { 
  CommandDifference, 
  DifferenceType
} from '../spotTesting/types.js';

/**
 * Timing difference analysis result
 */
export interface TimingDifferenceAnalysis {
  /** Whether this is a status bar contamination issue */
  isStatusBarContamination: boolean;
  /** Whether this is a daemon timing issue */
  isDaemonTiming: boolean;
  /** Whether this is an atmospheric message issue */
  isAtmosphericMessage: boolean;
  /** Whether this is a move counter synchronization issue */
  isMoveCounterSync: boolean;
  /** Specific root cause identified */
  rootCause: string;
  /** Confidence level of the analysis */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Object behavior difference analysis result
 */
export interface ObjectBehaviorAnalysis {
  /** Whether this is an error message inconsistency */
  isErrorMessageInconsistency: boolean;
  /** Whether this is an interaction pattern difference */
  isInteractionPatternDifference: boolean;
  /** Whether this is a state management issue */
  isStateManagementIssue: boolean;
  /** Specific command type affected */
  affectedCommandType: string;
  /** Specific root cause identified */
  rootCause: string;
  /** Confidence level of the analysis */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Parser difference analysis result
 */
export interface ParserDifferenceAnalysis {
  /** Whether this is a vocabulary recognition issue */
  isVocabularyIssue: boolean;
  /** Whether this is a command syntax issue */
  isCommandSyntaxIssue: boolean;
  /** Whether this is an error response inconsistency */
  isErrorResponseInconsistency: boolean;
  /** Specific word or pattern causing the issue */
  problematicElement: string;
  /** Specific root cause identified */
  rootCause: string;
  /** Confidence level of the analysis */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Comprehensive difference analysis result
 */
export interface DifferenceAnalysisResult {
  /** Original difference */
  difference: CommandDifference;
  /** Classified difference type */
  classifiedType: DifferenceType;
  /** Timing analysis (if applicable) */
  timingAnalysis?: TimingDifferenceAnalysis;
  /** Object behavior analysis (if applicable) */
  objectBehaviorAnalysis?: ObjectBehaviorAnalysis;
  /** Parser analysis (if applicable) */
  parserAnalysis?: ParserDifferenceAnalysis;
  /** Overall root cause */
  rootCause: string;
  /** Recommended fix approach */
  recommendedFix: string;
  /** Priority for fixing */
  priority: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * BehavioralDifferenceDetector identifies and classifies behavioral differences
 * between TypeScript and Z-Machine implementations.
 */
export class BehavioralDifferenceDetector {
  
  /**
   * Detect and analyze timing differences
   */
  detectTimingDifferences(tsOutput: string, zmOutput: string): TimingDifferenceAnalysis {
    const isStatusBarContamination = this.detectStatusBarContamination(tsOutput, zmOutput);
    const isDaemonTiming = this.detectDaemonTiming(tsOutput, zmOutput);
    const isAtmosphericMessage = this.detectAtmosphericMessage(tsOutput, zmOutput);
    const isMoveCounterSync = this.detectMoveCounterSync(tsOutput, zmOutput);

    let rootCause = 'Unknown timing issue';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (isStatusBarContamination) {
      rootCause = 'Status bar information contaminating game response';
      confidence = 'high';
    } else if (isDaemonTiming) {
      rootCause = 'Daemon message timing mismatch';
      confidence = 'medium';
    } else if (isAtmosphericMessage) {
      rootCause = 'Atmospheric message randomization difference';
      confidence = 'medium';
    } else if (isMoveCounterSync) {
      rootCause = 'Move counter synchronization issue';
      confidence = 'high';
    }

    return {
      isStatusBarContamination,
      isDaemonTiming,
      isAtmosphericMessage,
      isMoveCounterSync,
      rootCause,
      confidence
    };
  }

  /**
   * Detect and analyze object behavior differences
   */
  detectObjectBehaviorDifferences(tsOutput: string, zmOutput: string): ObjectBehaviorAnalysis {
    const isErrorMessageInconsistency = this.detectErrorMessageInconsistency(tsOutput, zmOutput);
    const isInteractionPatternDifference = this.detectInteractionPatternDifference(tsOutput, zmOutput);
    const isStateManagementIssue = this.detectStateManagementIssue(tsOutput, zmOutput);
    const affectedCommandType = this.identifyAffectedCommandType(tsOutput, zmOutput);

    let rootCause = 'Unknown object behavior issue';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (isErrorMessageInconsistency) {
      rootCause = this.identifyErrorMessageRootCause(tsOutput, zmOutput);
      confidence = 'high';
    } else if (isInteractionPatternDifference) {
      rootCause = 'Object interaction pattern mismatch';
      confidence = 'medium';
    } else if (isStateManagementIssue) {
      rootCause = 'Object state management inconsistency';
      confidence = 'medium';
    }

    return {
      isErrorMessageInconsistency,
      isInteractionPatternDifference,
      isStateManagementIssue,
      affectedCommandType,
      rootCause,
      confidence
    };
  }

  /**
   * Detect and analyze parser differences
   */
  detectParserDifferences(tsOutput: string, zmOutput: string): ParserDifferenceAnalysis {
    const isVocabularyIssue = this.detectVocabularyIssue(tsOutput, zmOutput);
    const isCommandSyntaxIssue = this.detectCommandSyntaxIssue(tsOutput, zmOutput);
    const isErrorResponseInconsistency = this.detectParserErrorResponseInconsistency(tsOutput, zmOutput);
    const problematicElement = this.identifyProblematicElement(tsOutput, zmOutput);

    let rootCause = 'Unknown parser issue';
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (isVocabularyIssue) {
      rootCause = `Vocabulary recognition issue: "${problematicElement}" not recognized consistently`;
      confidence = 'high';
    } else if (isCommandSyntaxIssue) {
      rootCause = 'Command syntax validation difference';
      confidence = 'medium';
    } else if (isErrorResponseInconsistency) {
      rootCause = 'Parser error response format inconsistency';
      confidence = 'medium';
    }

    return {
      isVocabularyIssue,
      isCommandSyntaxIssue,
      isErrorResponseInconsistency,
      problematicElement,
      rootCause,
      confidence
    };
  }

  /**
   * Classify a difference into the appropriate type
   */
  classifyDifference(difference: CommandDifference): DifferenceAnalysisResult {
    const tsOutput = difference.tsOutput;
    const zmOutput = difference.zmOutput;

    // Analyze all types
    const timingAnalysis = this.detectTimingDifferences(tsOutput, zmOutput);
    const objectBehaviorAnalysis = this.detectObjectBehaviorDifferences(tsOutput, zmOutput);
    const parserAnalysis = this.detectParserDifferences(tsOutput, zmOutput);

    // Determine the most likely classification
    let classifiedType = difference.differenceType;
    let rootCause = 'Unknown';
    let recommendedFix = 'Investigate manually';
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';

    // Check timing first (most common)
    if (timingAnalysis.confidence === 'high' || 
        (timingAnalysis.isStatusBarContamination || timingAnalysis.isMoveCounterSync)) {
      classifiedType = DifferenceType.TIMING_DIFFERENCE;
      rootCause = timingAnalysis.rootCause;
      recommendedFix = this.getTimingFix(timingAnalysis);
      priority = 'critical';
    }
    // Check object behavior
    else if (objectBehaviorAnalysis.confidence === 'high' || 
             objectBehaviorAnalysis.isErrorMessageInconsistency) {
      classifiedType = DifferenceType.OBJECT_BEHAVIOR;
      rootCause = objectBehaviorAnalysis.rootCause;
      recommendedFix = this.getObjectBehaviorFix(objectBehaviorAnalysis);
      priority = 'high';
    }
    // Check parser
    else if (parserAnalysis.confidence === 'high' || parserAnalysis.isVocabularyIssue) {
      classifiedType = DifferenceType.PARSER_DIFFERENCE;
      rootCause = parserAnalysis.rootCause;
      recommendedFix = this.getParserFix(parserAnalysis);
      priority = 'medium';
    }

    const result: DifferenceAnalysisResult = {
      difference,
      classifiedType,
      rootCause,
      recommendedFix,
      priority
    };

    // Add specific analysis based on type
    if (classifiedType === DifferenceType.TIMING_DIFFERENCE) {
      result.timingAnalysis = timingAnalysis;
    } else if (classifiedType === DifferenceType.OBJECT_BEHAVIOR) {
      result.objectBehaviorAnalysis = objectBehaviorAnalysis;
    } else if (classifiedType === DifferenceType.PARSER_DIFFERENCE) {
      result.parserAnalysis = parserAnalysis;
    }

    return result;
  }

  /**
   * Analyze a batch of differences
   */
  analyzeBatch(differences: CommandDifference[]): DifferenceAnalysisResult[] {
    return differences.map(diff => this.classifyDifference(diff));
  }

  // ============ Private Detection Methods ============

  /**
   * Detect status bar contamination
   */
  private detectStatusBarContamination(tsOutput: string, zmOutput: string): boolean {
    // Status bar pattern: "Room Name    Score: X    Moves: Y"
    const statusBarPattern = /\s+Score:\s*-?\d+\s+Moves:\s*\d+/i;
    
    const tsHasStatusBar = statusBarPattern.test(tsOutput);
    const zmHasStatusBar = statusBarPattern.test(zmOutput);
    
    // Contamination if TS has status bar but ZM doesn't (or vice versa)
    return tsHasStatusBar !== zmHasStatusBar;
  }

  /**
   * Detect daemon timing issues
   */
  private detectDaemonTiming(tsOutput: string, zmOutput: string): boolean {
    const daemonKeywords = ['lamp', 'lantern', 'thief', 'troll', 'cyclops', 'dim', 'flickering'];
    const tsLower = tsOutput.toLowerCase();
    const zmLower = zmOutput.toLowerCase();
    
    // Check if daemon-related content differs
    for (const keyword of daemonKeywords) {
      const tsHas = tsLower.includes(keyword);
      const zmHas = zmLower.includes(keyword);
      if (tsHas !== zmHas) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect atmospheric message differences
   */
  private detectAtmosphericMessage(tsOutput: string, zmOutput: string): boolean {
    const atmosphericPatterns = [
      /song bird/i,
      /chirping/i,
      /wind/i,
      /breeze/i,
      /grue/i,
      /sound echoes/i
    ];
    
    for (const pattern of atmosphericPatterns) {
      const tsHas = pattern.test(tsOutput);
      const zmHas = pattern.test(zmOutput);
      if (tsHas !== zmHas) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect move counter synchronization issues
   */
  private detectMoveCounterSync(tsOutput: string, zmOutput: string): boolean {
    const movePattern = /Moves:\s*(\d+)/i;
    
    const tsMatch = tsOutput.match(movePattern);
    const zmMatch = zmOutput.match(movePattern);
    
    if (tsMatch && zmMatch) {
      return tsMatch[1] !== zmMatch[1];
    }
    
    return false;
  }

  /**
   * Detect error message inconsistency
   */
  private detectErrorMessageInconsistency(tsOutput: string, zmOutput: string): boolean {
    // Known error message patterns that differ
    const errorPatterns = [
      { ts: /noun missing/i, zm: /what do you want/i },
      { ts: /can't see any/i, zm: /don't have/i },
      { ts: /can't see that/i, zm: /must tell me how/i },
      { ts: /can't open/i, zm: /can't see how to get in/i }
    ];
    
    for (const pattern of errorPatterns) {
      if (pattern.ts.test(tsOutput) && pattern.zm.test(zmOutput)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect interaction pattern differences
   */
  private detectInteractionPatternDifference(tsOutput: string, zmOutput: string): boolean {
    const interactionKeywords = ['take', 'drop', 'put', 'open', 'close', 'examine'];
    const tsLower = tsOutput.toLowerCase();
    const zmLower = zmOutput.toLowerCase();
    
    for (const keyword of interactionKeywords) {
      if (tsLower.includes(keyword) !== zmLower.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect state management issues
   */
  private detectStateManagementIssue(tsOutput: string, zmOutput: string): boolean {
    // Check for state-related keywords that differ
    const stateKeywords = ['already', 'still', 'now', 'no longer'];
    const tsLower = tsOutput.toLowerCase();
    const zmLower = zmOutput.toLowerCase();
    
    for (const keyword of stateKeywords) {
      if (tsLower.includes(keyword) !== zmLower.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Identify affected command type
   */
  private identifyAffectedCommandType(tsOutput: string, zmOutput: string): string {
    const combined = (tsOutput + zmOutput).toLowerCase();
    
    if (combined.includes('drop')) return 'drop';
    if (combined.includes('take') || combined.includes('get')) return 'take';
    if (combined.includes('put')) return 'put';
    if (combined.includes('open')) return 'open';
    if (combined.includes('close')) return 'close';
    if (combined.includes('examine') || combined.includes('look')) return 'examine';
    if (combined.includes('inventory')) return 'inventory';
    
    return 'unknown';
  }

  /**
   * Identify specific error message root cause
   */
  private identifyErrorMessageRootCause(tsOutput: string, zmOutput: string): string {
    if (/noun missing/i.test(tsOutput) && /what do you want/i.test(zmOutput)) {
      return 'Drop command without object: TS uses "noun missing" vs ZM uses "What do you want"';
    }
    if (/can't see any/i.test(tsOutput) && /don't have/i.test(zmOutput)) {
      return 'Object visibility vs possession: TS uses "can\'t see" vs ZM uses "don\'t have"';
    }
    if (/can't open/i.test(tsOutput) && /can't see how/i.test(zmOutput)) {
      return 'Open command error: TS uses "can\'t open" vs ZM uses "can\'t see how to get in"';
    }
    
    return 'Error message format inconsistency';
  }

  /**
   * Detect vocabulary recognition issues
   */
  private detectVocabularyIssue(tsOutput: string, zmOutput: string): boolean {
    // Check for "don't know the word" pattern
    const unknownWordPattern = /don't know the word/i;
    const cantSeePattern = /can't see any/i;
    
    // If ZM says "don't know the word" but TS says "can't see", it's a vocabulary issue
    if (unknownWordPattern.test(zmOutput) && cantSeePattern.test(tsOutput)) {
      return true;
    }
    
    return false;
  }

  /**
   * Detect command syntax issues
   */
  private detectCommandSyntaxIssue(tsOutput: string, zmOutput: string): boolean {
    const syntaxPatterns = [
      /sentence isn't one I recognize/i,
      /don't understand/i,
      /incomplete sentence/i
    ];
    
    for (const pattern of syntaxPatterns) {
      if (pattern.test(tsOutput) !== pattern.test(zmOutput)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect parser error response inconsistency
   */
  private detectParserErrorResponseInconsistency(tsOutput: string, zmOutput: string): boolean {
    // Both are errors but different format
    const tsIsError = /can't|don't|isn't|not/i.test(tsOutput);
    const zmIsError = /can't|don't|isn't|not/i.test(zmOutput);
    
    return tsIsError && zmIsError && tsOutput !== zmOutput;
  }

  /**
   * Identify problematic element (word or pattern)
   */
  private identifyProblematicElement(tsOutput: string, zmOutput: string): string {
    // Extract word from "don't know the word X" pattern
    const wordMatch = zmOutput.match(/don't know the word "([^"]+)"/i);
    if (wordMatch) {
      return wordMatch[1];
    }
    
    // Extract object from "can't see any X" pattern
    const objectMatch = tsOutput.match(/can't see any (\w+)/i);
    if (objectMatch) {
      return objectMatch[1];
    }
    
    return 'unknown';
  }

  // ============ Fix Recommendation Methods ============

  /**
   * Get recommended fix for timing issues
   */
  private getTimingFix(analysis: TimingDifferenceAnalysis): string {
    if (analysis.isStatusBarContamination) {
      return 'Remove status bar from game response output in StatusDisplayManager';
    }
    if (analysis.isDaemonTiming) {
      return 'Synchronize daemon timing in src/engine/daemons.ts';
    }
    if (analysis.isAtmosphericMessage) {
      return 'Align atmospheric message randomization with Z-Machine seed handling';
    }
    if (analysis.isMoveCounterSync) {
      return 'Fix move counter synchronization in game state management';
    }
    return 'Investigate timing difference manually';
  }

  /**
   * Get recommended fix for object behavior issues
   */
  private getObjectBehaviorFix(analysis: ObjectBehaviorAnalysis): string {
    if (analysis.isErrorMessageInconsistency) {
      if (analysis.affectedCommandType === 'drop') {
        return 'Update drop command error message in ParserErrorHandler to match Z-Machine';
      }
      return `Update ${analysis.affectedCommandType} command error messages to match Z-Machine`;
    }
    if (analysis.isInteractionPatternDifference) {
      return 'Align object interaction patterns in src/game/actions.ts';
    }
    if (analysis.isStateManagementIssue) {
      return 'Fix object state management in src/game/objects.ts';
    }
    return 'Investigate object behavior difference manually';
  }

  /**
   * Get recommended fix for parser issues
   */
  private getParserFix(analysis: ParserDifferenceAnalysis): string {
    if (analysis.isVocabularyIssue) {
      return `Remove "${analysis.problematicElement}" from vocabulary if not in Z-Machine, or add if missing`;
    }
    if (analysis.isCommandSyntaxIssue) {
      return 'Align command syntax validation in src/parser/parser.ts';
    }
    if (analysis.isErrorResponseInconsistency) {
      return 'Update parser error response format in ParserErrorHandler';
    }
    return 'Investigate parser difference manually';
  }
}
