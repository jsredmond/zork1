/**
 * ParserErrorHandler implementation for Z-Machine compatible parser errors
 */

import { ParserErrorHandler, ParseContext } from './interfaces';

interface VerbRequirement {
  requiresObject: boolean;
  message: string;
  alternateMessage?: string;
}

export class ZMachineParserErrors implements ParserErrorHandler {
  private verbRequirements = new Map<string, VerbRequirement>([
    // Based on analysis of parser differences
    ['search', { 
      requiresObject: true, 
      message: 'What do you want to search?' 
    }],
    ['drop', { 
      requiresObject: true, 
      message: 'There seems to be a noun missing in that sentence!' 
    }],
    ['take', { 
      requiresObject: true, 
      message: 'What do you want to take?' 
    }],
    ['get', { 
      requiresObject: true, 
      message: 'What do you want to take?' 
    }],
    ['put', { 
      requiresObject: true, 
      message: 'What do you want to put?' 
    }],
    ['give', { 
      requiresObject: true, 
      message: 'What do you want to give?' 
    }],
    ['throw', { 
      requiresObject: true, 
      message: 'What do you want to throw?' 
    }],
    ['open', { 
      requiresObject: true, 
      message: 'What do you want to open?' 
    }],
    ['close', { 
      requiresObject: true, 
      message: 'What do you want to close?' 
    }],
    ['read', { 
      requiresObject: true, 
      message: 'What do you want to read?' 
    }],
    ['examine', { 
      requiresObject: true, 
      message: 'What do you want to examine?' 
    }],
    ['look', { 
      requiresObject: false, 
      message: '' // Look without object is valid
    }],
    ['move', { 
      requiresObject: true, 
      message: 'What do you want to move?' 
    }],
    ['push', { 
      requiresObject: true, 
      message: 'What do you want to push?' 
    }],
    ['pull', { 
      requiresObject: true, 
      message: 'What do you want to pull?' 
    }],
    ['turn', { 
      requiresObject: true, 
      message: 'What do you want to turn?' 
    }],
    ['eat', { 
      requiresObject: true, 
      message: 'What do you want to eat?' 
    }],
    ['drink', { 
      requiresObject: true, 
      message: 'What do you want to drink?' 
    }],
    ['kill', { 
      requiresObject: true, 
      message: 'What do you want to attack?' 
    }],
    ['attack', { 
      requiresObject: true, 
      message: 'What do you want to attack?' 
    }]
  ]);

  /**
   * Handles incomplete commands (verb without required object)
   */
  handleIncompleteCommand(verb: string, context: ParseContext): string {
    const requirement = this.verbRequirements.get(verb.toLowerCase());
    
    if (requirement?.requiresObject && !context.hasDirectObject) {
      return requirement.message;
    }
    
    // If verb doesn't require object or object is present, this isn't an incomplete command
    return this.getGenericError(verb);
  }

  /**
   * Handles completely unknown verbs
   */
  handleUnknownVerb(input: string): string {
    // Check if this looks like a malformed command vs unknown verb
    if (this.isMalformedCommand(input)) {
      return this.handleMalformedCommand(input);
    }
    
    return `I don't know the word "${this.extractFirstWord(input)}".`;
  }

  /**
   * Handles malformed commands (syntax errors)
   */
  handleMalformedCommand(input: string): string {
    // Standard Z-Machine response for malformed syntax
    return "That sentence isn't one I recognize.";
  }

  /**
   * Gets generic error for unrecognized situations
   */
  private getGenericError(verb: string): string {
    return `I don't know how to ${verb}.`;
  }

  /**
   * Determines if input is malformed vs just unknown
   */
  private isMalformedCommand(input: string): boolean {
    const trimmed = input.trim();
    
    // Check for common malformed patterns
    if (trimmed.includes('  ')) return true; // Multiple spaces
    if (trimmed.startsWith(' ')) return true; // Leading space
    if (trimmed.endsWith(' ')) return true; // Trailing space
    if (/^\w+\s+in\s*$/.test(trimmed)) return true; // "verb in" with no object
    if (/^put\s+in\s+\w+$/.test(trimmed)) return true; // "put in object" missing first object
    
    return false;
  }

  /**
   * Extracts first word from input for error messages
   */
  private extractFirstWord(input: string): string {
    const words = input.trim().split(/\s+/);
    return words[0] || input;
  }

  /**
   * Adds or updates verb requirement mapping
   */
  addVerbRequirement(verb: string, requirement: VerbRequirement): void {
    this.verbRequirements.set(verb.toLowerCase(), requirement);
  }

  /**
   * Gets all configured verb requirements
   */
  getVerbRequirements(): Map<string, VerbRequirement> {
    return new Map(this.verbRequirements);
  }

  /**
   * Checks if a verb requires an object
   */
  verbRequiresObject(verb: string): boolean {
    const requirement = this.verbRequirements.get(verb.toLowerCase());
    return requirement?.requiresObject || false;
  }
}