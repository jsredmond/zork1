/**
 * DifferenceClassifier - Classifies differences between TypeScript and Z-Machine outputs
 * 
 * This module provides functionality to classify differences found during parity testing
 * into categories: RNG_DIFFERENCE, STATE_DIVERGENCE, or LOGIC_DIFFERENCE.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { ExtractedMessage } from './recording/messageExtractor';

/**
 * Types of differences that can be classified
 */
export type DifferenceType = 'RNG_DIFFERENCE' | 'STATE_DIVERGENCE' | 'LOGIC_DIFFERENCE';

/**
 * Context about the command being compared
 */
export interface CommandContext {
  /** The command that was executed */
  command: string;
  /** Index of the command in the sequence */
  commandIndex: number;
  /** Current room in TypeScript implementation */
  tsRoom?: string;
  /** Current room in Z-Machine implementation */
  zmRoom?: string;
  /** Whether state has diverged due to RNG effects */
  hasStateDiverged?: boolean;
  /** Previous differences that may indicate state divergence */
  previousDifferences?: ClassifiedDifference[];
}

/**
 * A classified difference with metadata
 */
export interface ClassifiedDifference {
  /** Index of the command that produced this difference */
  commandIndex: number;
  /** The command that was executed */
  command: string;
  /** TypeScript implementation output */
  tsOutput: string;
  /** Z-Machine implementation output */
  zmOutput: string;
  /** Classification of the difference */
  classification: DifferenceType;
  /** Reason for the classification */
  reason: string;
}

/**
 * Generic refusal messages (YUKS from gverbs.zil)
 * Used when player attempts impossible or silly actions
 * Requirements: 5.1
 */
export const YUKS_POOL = [
  "A valiant attempt.",
  "You can't be serious.",
  "An interesting idea...",
  "What a concept!"
];

/**
 * Messages for ineffective actions (HO-HUM from gverbs.zil)
 * Used for PUSH, PULL, WAVE, RUB, LOWER, RAISE, etc.
 * Requirements: 5.2
 */
export const HO_HUM_POOL = [
  " doesn't seem to work.",
  " isn't notably helpful.",
  " has no effect."
];

/**
 * Greeting variations (HELLOS from gverbs.zil)
 * Requirements: 5.3
 */
export const HELLOS_POOL = [
  "Hello.",
  "Good day.",
  "Nice weather we've been having lately.",
  "Goodbye."
];

/**
 * Silly action responses (WHEEEEE from gverbs.zil)
 * Used for SKIP, JUMP, and other playful actions
 */
export const WHEEEEE_POOL = [
  "Very good. Now you can go to the second grade.",
  "Are you enjoying yourself?",
  "Wheeeeeeeeee!!!!!",
  "Do you expect me to applaud?"
];

/**
 * Jump failure messages (JUMPLOSS from gverbs.zil)
 */
export const JUMPLOSS_POOL = [
  "You should have looked before you leaped.",
  "In the movies, your life would be passing before your eyes.",
  "Geronimo..."
];

/**
 * Check if a message is from the YUKS pool
 * Requirements: 5.1
 */
export function isYuksPoolMessage(message: string): boolean {
  const normalizedMessage = message.trim();
  return YUKS_POOL.some(yuk => normalizedMessage.includes(yuk));
}

/**
 * Check if a message is from the HO-HUM pool
 * Requirements: 5.2
 */
export function isHoHumPoolMessage(message: string): boolean {
  const normalizedMessage = message.trim();
  return HO_HUM_POOL.some(hoHum => normalizedMessage.includes(hoHum));
}

/**
 * Check if a message is from the HELLOS pool
 * Requirements: 5.3
 */
export function isHellosPoolMessage(message: string): boolean {
  const normalizedMessage = message.trim();
  return HELLOS_POOL.some(hello => normalizedMessage === hello || normalizedMessage.includes(hello));
}

/**
 * Check if a message is from the WHEEEEE pool
 */
export function isWheeeePoolMessage(message: string): boolean {
  const normalizedMessage = message.trim();
  return WHEEEEE_POOL.some(msg => normalizedMessage.includes(msg));
}

/**
 * Check if a message is from the JUMPLOSS pool
 */
export function isJumplossPoolMessage(message: string): boolean {
  const normalizedMessage = message.trim();
  return JUMPLOSS_POOL.some(msg => normalizedMessage.includes(msg));
}

/**
 * Check if a message is from any RNG pool
 */
export function isRngPoolMessage(message: string): boolean {
  return (
    isYuksPoolMessage(message) ||
    isHoHumPoolMessage(message) ||
    isHellosPoolMessage(message) ||
    isWheeeePoolMessage(message) ||
    isJumplossPoolMessage(message)
  );
}

/**
 * Normalize a response for comparison
 * Handles whitespace variations, line breaks, and other formatting differences
 * Requirements: 2.4, 2.5
 * 
 * @param response - The response to normalize
 * @returns Normalized response string
 */
export function normalizeResponse(response: string): string {
  if (!response) return '';
  
  // Trim leading/trailing whitespace
  let normalized = response.trim();
  
  // Normalize line endings to \n
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Collapse multiple spaces into single space
  normalized = normalized.replace(/[ \t]+/g, ' ');
  
  // Collapse multiple newlines into single newline
  normalized = normalized.replace(/\n+/g, '\n');
  
  // Trim whitespace from each line
  normalized = normalized.split('\n').map(line => line.trim()).join('\n');
  
  // Remove empty lines
  normalized = normalized.split('\n').filter(line => line.length > 0).join('\n');
  
  return normalized;
}

/**
 * Check if two responses are semantically equivalent
 * Handles common variations in message formatting
 * Requirements: 2.4, 2.5
 * 
 * @param response1 - First response
 * @param response2 - Second response
 * @returns true if responses are semantically equivalent
 */
export function areSemanticallyEquivalent(response1: string, response2: string): boolean {
  // Normalize both responses
  const norm1 = normalizeResponse(response1);
  const norm2 = normalizeResponse(response2);
  
  // Direct match after normalization
  if (norm1 === norm2) {
    return true;
  }
  
  // Case-insensitive match
  if (norm1.toLowerCase() === norm2.toLowerCase()) {
    return true;
  }
  
  return false;
}

/**
 * Check if both messages are from the same RNG pool (indicating RNG difference)
 */
export function areBothFromSameRngPool(tsOutput: string, zmOutput: string): boolean {
  // Check YUKS pool
  if (isYuksPoolMessage(tsOutput) && isYuksPoolMessage(zmOutput)) {
    return true;
  }
  
  // Check HO-HUM pool
  if (isHoHumPoolMessage(tsOutput) && isHoHumPoolMessage(zmOutput)) {
    return true;
  }
  
  // Check HELLOS pool
  if (isHellosPoolMessage(tsOutput) && isHellosPoolMessage(zmOutput)) {
    return true;
  }
  
  // Check WHEEEEE pool
  if (isWheeeePoolMessage(tsOutput) && isWheeeePoolMessage(zmOutput)) {
    return true;
  }
  
  // Check JUMPLOSS pool
  if (isJumplossPoolMessage(tsOutput) && isJumplossPoolMessage(zmOutput)) {
    return true;
  }
  
  return false;
}

/**
 * Check if the difference is due to state divergence
 * State divergence occurs when RNG effects cause the game states to differ,
 * leading to different valid responses (e.g., blocked exits in different locations)
 * Requirements: 5.4
 */
export function isStateDivergence(context: CommandContext): boolean {
  // If rooms are different, state has diverged
  if (context.tsRoom && context.zmRoom && context.tsRoom !== context.zmRoom) {
    return true;
  }
  
  // If explicitly marked as diverged
  if (context.hasStateDiverged) {
    return true;
  }
  
  // Check if previous differences indicate state divergence
  if (context.previousDifferences && context.previousDifferences.length > 0) {
    // If there are multiple RNG differences, state may have diverged
    const rngDiffCount = context.previousDifferences.filter(
      d => d.classification === 'RNG_DIFFERENCE'
    ).length;
    
    // Threshold: if more than 3 RNG differences, likely state divergence
    if (rngDiffCount > 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if the difference is a blocked exit message during state divergence
 * Requirements: 5.4
 */
export function isBlockedExitDuringDivergence(
  tsOutput: string,
  zmOutput: string,
  context: CommandContext
): boolean {
  const blockedExitPatterns = [
    /You can't go that way/i,
    /There is no way to go/i,
    /The door is closed/i,
    /The door is locked/i,
    /You can't fit through/i,
    /blocked/i
  ];
  
  const isBlockedExit = (output: string) =>
    blockedExitPatterns.some(pattern => pattern.test(output));
  
  // If one output is a blocked exit and state has diverged, it's acceptable
  if (isStateDivergence(context)) {
    if (isBlockedExit(tsOutput) || isBlockedExit(zmOutput)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get the RNG pool name for a message (for reporting)
 */
export function getRngPoolName(message: string): string | null {
  if (isYuksPoolMessage(message)) return 'YUKS';
  if (isHoHumPoolMessage(message)) return 'HO_HUM';
  if (isHellosPoolMessage(message)) return 'HELLOS';
  if (isWheeeePoolMessage(message)) return 'WHEEEEE';
  if (isJumplossPoolMessage(message)) return 'JUMPLOSS';
  return null;
}

/**
 * Classify a difference between TypeScript and Z-Machine outputs
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * @param tsOutput - Output from TypeScript implementation
 * @param zmOutput - Output from Z-Machine implementation
 * @param context - Context about the command being compared
 * @returns Classification result with type and reason
 */
export function classify(
  tsOutput: string,
  zmOutput: string,
  context: CommandContext
): ClassifiedDifference {
  const baseResult = {
    commandIndex: context.commandIndex,
    command: context.command,
    tsOutput,
    zmOutput
  };
  
  // Check if both outputs are from the same RNG pool
  // Requirements: 5.1, 5.2, 5.3
  if (areBothFromSameRngPool(tsOutput, zmOutput)) {
    const poolName = getRngPoolName(tsOutput) || getRngPoolName(zmOutput);
    return {
      ...baseResult,
      classification: 'RNG_DIFFERENCE',
      reason: `Both outputs are from the ${poolName} RNG pool`
    };
  }
  
  // Check for state divergence
  // Requirements: 5.4
  if (isStateDivergence(context)) {
    // Check if this is a blocked exit during divergence
    if (isBlockedExitDuringDivergence(tsOutput, zmOutput, context)) {
      return {
        ...baseResult,
        classification: 'STATE_DIVERGENCE',
        reason: 'Blocked exit message during state divergence'
      };
    }
    
    // General state divergence
    return {
      ...baseResult,
      classification: 'STATE_DIVERGENCE',
      reason: 'Game states have diverged due to accumulated RNG effects'
    };
  }
  
  // Check if one output is from an RNG pool but the other isn't
  // This could indicate a logic difference or state divergence
  if (isRngPoolMessage(tsOutput) !== isRngPoolMessage(zmOutput)) {
    // One is RNG, one isn't - this might be state divergence
    if (context.previousDifferences && context.previousDifferences.length > 0) {
      return {
        ...baseResult,
        classification: 'STATE_DIVERGENCE',
        reason: 'Mismatched RNG pool usage indicates state divergence'
      };
    }
  }
  
  // If we can't classify it as RNG or state divergence, it's a logic difference
  // Requirements: 5.5
  return {
    ...baseResult,
    classification: 'LOGIC_DIFFERENCE',
    reason: 'Difference cannot be attributed to RNG or state divergence'
  };
}

/**
 * Classify a difference using extracted messages
 * This method works with ExtractedMessage objects from the MessageExtractor,
 * enabling more accurate classification by focusing on action responses
 * rather than full output blocks.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * @param tsExtracted - Extracted message from TypeScript implementation
 * @param zmExtracted - Extracted message from Z-Machine implementation
 * @param context - Context about the command being compared
 * @returns Classification result with type and reason
 */
export function classifyExtracted(
  tsExtracted: ExtractedMessage,
  zmExtracted: ExtractedMessage,
  context: CommandContext
): ClassifiedDifference {
  // Normalize the responses for comparison
  const tsNormalized = normalizeResponse(tsExtracted.response);
  const zmNormalized = normalizeResponse(zmExtracted.response);
  
  const baseResult = {
    commandIndex: context.commandIndex,
    command: context.command,
    tsOutput: tsExtracted.response,
    zmOutput: zmExtracted.response
  };
  
  // If normalized responses are identical, no difference
  if (tsNormalized === zmNormalized) {
    return {
      ...baseResult,
      classification: 'RNG_DIFFERENCE', // Treat as non-issue
      reason: 'Responses are identical after normalization'
    };
  }
  
  // Check if both normalized responses are from the same RNG pool
  // Requirements: 2.1, 2.2, 2.3
  if (areBothFromSameRngPool(tsNormalized, zmNormalized)) {
    const poolName = getRngPoolName(tsNormalized) || getRngPoolName(zmNormalized);
    return {
      ...baseResult,
      classification: 'RNG_DIFFERENCE',
      reason: `Both extracted responses are from the ${poolName} RNG pool`
    };
  }
  
  // Also check the original (non-normalized) responses for RNG pool membership
  // This handles cases where normalization might affect detection
  if (areBothFromSameRngPool(tsExtracted.response, zmExtracted.response)) {
    const poolName = getRngPoolName(tsExtracted.response) || getRngPoolName(zmExtracted.response);
    return {
      ...baseResult,
      classification: 'RNG_DIFFERENCE',
      reason: `Both extracted responses are from the ${poolName} RNG pool`
    };
  }
  
  // Check for semantic equivalence
  // Requirements: 2.4, 2.5
  if (areSemanticallyEquivalent(tsExtracted.response, zmExtracted.response)) {
    return {
      ...baseResult,
      classification: 'RNG_DIFFERENCE', // Treat as non-issue
      reason: 'Responses are semantically equivalent'
    };
  }
  
  // Check for state divergence
  // Requirements: 5.4
  if (isStateDivergence(context)) {
    // Check if this is a blocked exit during divergence
    if (isBlockedExitDuringDivergence(tsNormalized, zmNormalized, context)) {
      return {
        ...baseResult,
        classification: 'STATE_DIVERGENCE',
        reason: 'Blocked exit message during state divergence'
      };
    }
    
    // General state divergence
    return {
      ...baseResult,
      classification: 'STATE_DIVERGENCE',
      reason: 'Game states have diverged due to accumulated RNG effects'
    };
  }
  
  // Check if one output is from an RNG pool but the other isn't
  if (isRngPoolMessage(tsNormalized) !== isRngPoolMessage(zmNormalized)) {
    if (context.previousDifferences && context.previousDifferences.length > 0) {
      return {
        ...baseResult,
        classification: 'STATE_DIVERGENCE',
        reason: 'Mismatched RNG pool usage indicates state divergence'
      };
    }
  }
  
  // If we can't classify it as RNG or state divergence, it's a logic difference
  // Requirements: 5.5
  return {
    ...baseResult,
    classification: 'LOGIC_DIFFERENCE',
    reason: 'Difference in extracted responses cannot be attributed to RNG or state divergence'
  };
}

/**
 * DifferenceClassifier class for stateful classification
 */
export class DifferenceClassifier {
  private previousDifferences: ClassifiedDifference[] = [];
  private hasStateDiverged = false;
  
  /**
   * Reset the classifier state
   */
  reset(): void {
    this.previousDifferences = [];
    this.hasStateDiverged = false;
  }
  
  /**
   * Classify a difference and track state
   */
  classifyDifference(
    tsOutput: string,
    zmOutput: string,
    command: string,
    commandIndex: number,
    tsRoom?: string,
    zmRoom?: string
  ): ClassifiedDifference {
    const context: CommandContext = {
      command,
      commandIndex,
      tsRoom,
      zmRoom,
      hasStateDiverged: this.hasStateDiverged,
      previousDifferences: this.previousDifferences
    };
    
    const result = classify(tsOutput, zmOutput, context);
    
    // Track state divergence
    if (result.classification === 'STATE_DIVERGENCE') {
      this.hasStateDiverged = true;
    }
    
    // Track this difference for future context
    this.previousDifferences.push(result);
    
    return result;
  }
  
  /**
   * Classify a difference using extracted messages
   * This method works with ExtractedMessage objects from the MessageExtractor,
   * enabling more accurate classification by focusing on action responses.
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   * 
   * @param tsExtracted - Extracted message from TypeScript implementation
   * @param zmExtracted - Extracted message from Z-Machine implementation
   * @param command - The command that was executed
   * @param commandIndex - Index of the command in the sequence
   * @param tsRoom - Current room in TypeScript implementation
   * @param zmRoom - Current room in Z-Machine implementation
   * @returns Classification result with type and reason
   */
  classifyExtracted(
    tsExtracted: ExtractedMessage,
    zmExtracted: ExtractedMessage,
    command: string,
    commandIndex: number,
    tsRoom?: string,
    zmRoom?: string
  ): ClassifiedDifference {
    const context: CommandContext = {
      command,
      commandIndex,
      tsRoom,
      zmRoom,
      hasStateDiverged: this.hasStateDiverged,
      previousDifferences: this.previousDifferences
    };
    
    const result = classifyExtracted(tsExtracted, zmExtracted, context);
    
    // Track state divergence
    if (result.classification === 'STATE_DIVERGENCE') {
      this.hasStateDiverged = true;
    }
    
    // Track this difference for future context
    this.previousDifferences.push(result);
    
    return result;
  }
  
  /**
   * Normalize a response for comparison
   * Requirements: 2.4, 2.5
   */
  normalizeResponse(response: string): string {
    return normalizeResponse(response);
  }
  
  /**
   * Check if two responses are semantically equivalent
   * Requirements: 2.4, 2.5
   */
  areSemanticallyEquivalent(response1: string, response2: string): boolean {
    return areSemanticallyEquivalent(response1, response2);
  }
  
  /**
   * Check if a message is from the YUKS pool
   */
  isYuksPoolMessage(message: string): boolean {
    return isYuksPoolMessage(message);
  }
  
  /**
   * Check if a message is from the HO-HUM pool
   */
  isHoHumPoolMessage(message: string): boolean {
    return isHoHumPoolMessage(message);
  }
  
  /**
   * Check if a message is from the HELLOS pool
   */
  isHellosPoolMessage(message: string): boolean {
    return isHellosPoolMessage(message);
  }
  
  /**
   * Check if state has diverged
   */
  isStateDivergence(context: CommandContext): boolean {
    return isStateDivergence(context);
  }
  
  /**
   * Get all tracked differences
   */
  getDifferences(): ClassifiedDifference[] {
    return [...this.previousDifferences];
  }
  
  /**
   * Get count of differences by type
   */
  getDifferenceCounts(): Record<DifferenceType, number> {
    const counts: Record<DifferenceType, number> = {
      'RNG_DIFFERENCE': 0,
      'STATE_DIVERGENCE': 0,
      'LOGIC_DIFFERENCE': 0
    };
    
    for (const diff of this.previousDifferences) {
      counts[diff.classification]++;
    }
    
    return counts;
  }
}

/**
 * Factory function to create a new DifferenceClassifier
 */
export function createDifferenceClassifier(): DifferenceClassifier {
  return new DifferenceClassifier();
}
