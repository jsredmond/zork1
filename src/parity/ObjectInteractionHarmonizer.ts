/**
 * ObjectInteractionHarmonizer - Aligns object interaction behavior with Z-Machine
 * 
 * This module standardizes error messages and object interaction patterns
 * to match the original Z-Machine implementation exactly.
 * 
 * Requirements: 3.1, 3.2
 */

import { GameState } from '../game/state.js';

/**
 * Error message mappings from TypeScript to Z-Machine format
 */
export interface ErrorMessageMapping {
  tsPattern: RegExp;
  zmMessage: string;
  context?: string;
}

/**
 * Object interaction result
 */
export interface HarmonizedResult {
  message: string;
  wasHarmonized: boolean;
  originalMessage?: string;
  harmonizationType?: string;
}

/**
 * ObjectInteractionHarmonizer ensures object interactions match Z-Machine behavior
 */
export class ObjectInteractionHarmonizer {
  /**
   * Error message mappings for harmonization
   * Maps TypeScript error patterns to Z-Machine equivalents
   */
  private static readonly ERROR_MAPPINGS: ErrorMessageMapping[] = [
    // Drop command without object
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to drop?",
      context: "drop"
    },
    // Take command without object  
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to take?",
      context: "take"
    },
    // Put command without object
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to put?",
      context: "put"
    },
    // Object not visible - "You can't see any X here!"
    {
      tsPattern: /^You can't see any (.+) here!$/i,
      zmMessage: "You can't see any $1 here!",
      context: "visibility"
    },
    // Object not in possession for put
    {
      tsPattern: /^You can't see any (.+) here!$/i,
      zmMessage: "You don't have that!",
      context: "put_possession"
    },
    // Push doesn't work
    {
      tsPattern: /^Pushing the (.+) doesn't seem to work\.$/i,
      zmMessage: "Pushing the $1 isn't notably helpful.",
      context: "push"
    },
    // Turn has no effect
    {
      tsPattern: /^This has no effect\.$/i,
      zmMessage: "Your bare hands don't appear to be enough.",
      context: "turn"
    },
    // Can't take scenery
    {
      tsPattern: /^You can't take the (.+)\.$/i,
      zmMessage: "What a concept!",
      context: "take_scenery"
    },
    // Can't be serious (take large objects)
    {
      tsPattern: /^You can't be serious\.$/i,
      zmMessage: "An interesting idea...",
      context: "take_large"
    }
  ];

  /**
   * Harmonize a command result to match Z-Machine behavior
   */
  harmonizeResponse(
    message: string, 
    command: string, 
    state: GameState
  ): HarmonizedResult {
    const verb = this.extractVerb(command);
    
    // Try to find a matching error pattern
    for (const mapping of ObjectInteractionHarmonizer.ERROR_MAPPINGS) {
      if (mapping.tsPattern.test(message)) {
        // Check if context matches
        if (mapping.context && !this.contextMatches(mapping.context, verb, command)) {
          continue;
        }
        
        // Apply the mapping
        const harmonizedMessage = message.replace(mapping.tsPattern, mapping.zmMessage);
        
        return {
          message: harmonizedMessage,
          wasHarmonized: true,
          originalMessage: message,
          harmonizationType: mapping.context || 'general'
        };
      }
    }
    
    // No harmonization needed
    return {
      message,
      wasHarmonized: false
    };
  }

  /**
   * Harmonize "drop" command error messages specifically
   */
  harmonizeDropCommand(message: string, hasObject: boolean): string {
    if (!hasObject && message.includes("noun missing")) {
      return "What do you want to drop?";
    }
    return message;
  }

  /**
   * Harmonize object visibility errors
   */
  harmonizeObjectVisibility(
    message: string, 
    objectName: string, 
    isInPossession: boolean,
    verb: string
  ): string {
    // For "put" commands, if object isn't possessed, use "You don't have that!"
    if (verb === 'put' && !isInPossession) {
      if (message.includes("can't see any")) {
        return "You don't have that!";
      }
    }
    
    return message;
  }

  /**
   * Extract the verb from a command
   */
  private extractVerb(command: string): string {
    const words = command.trim().toLowerCase().split(/\s+/);
    return words[0] || '';
  }

  /**
   * Check if the context matches the command
   */
  private contextMatches(context: string, verb: string, command: string): boolean {
    switch (context) {
      case 'drop':
        return verb === 'drop';
      case 'take':
        return verb === 'take' || verb === 'get';
      case 'put':
        return verb === 'put';
      case 'push':
        return verb === 'push';
      case 'turn':
        return verb === 'turn';
      case 'take_scenery':
        return (verb === 'take' || verb === 'get');
      case 'take_large':
        return (verb === 'take' || verb === 'get');
      case 'put_possession':
        return verb === 'put';
      case 'visibility':
        return true; // Applies to any verb
      default:
        return true;
    }
  }

  /**
   * Get the Z-Machine equivalent error message for a verb without object
   */
  getVerbWithoutObjectError(verb: string): string {
    const verbErrors: Record<string, string> = {
      'drop': "What do you want to drop?",
      'take': "What do you want to take?",
      'get': "What do you want to take?",
      'put': "What do you want to put?",
      'examine': "What do you want to examine?",
      'open': "What do you want to open?",
      'close': "What do you want to close?",
      'read': "What do you want to read?",
      'attack': "What do you want to attack?",
      'kill': "What do you want to attack?"
    };
    
    return verbErrors[verb.toLowerCase()] || "There seems to be a noun missing in that sentence!";
  }

  /**
   * Check if a message indicates an object visibility error
   */
  isObjectVisibilityError(message: string): boolean {
    return /can't see any|don't see any|no .+ here/i.test(message);
  }

  /**
   * Check if a message indicates a possession error
   */
  isPossessionError(message: string): boolean {
    return /don't have|not carrying|aren't holding/i.test(message);
  }

  /**
   * Normalize error message format to match Z-Machine style
   */
  normalizeErrorFormat(message: string): string {
    // Ensure proper capitalization
    if (message.length > 0) {
      message = message.charAt(0).toUpperCase() + message.slice(1);
    }
    
    // Ensure proper punctuation
    if (!/[.!?]$/.test(message)) {
      message += '.';
    }
    
    return message;
  }

  /**
   * Static factory method
   */
  static create(): ObjectInteractionHarmonizer {
    return new ObjectInteractionHarmonizer();
  }
}
