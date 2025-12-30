/**
 * ParserConsistencyEngine - Aligns parser behavior with Z-Machine
 * 
 * This module ensures command parsing matches the original Z-Machine exactly,
 * including vocabulary recognition and error message consistency.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { Vocabulary } from '../parser/vocabulary.js';
import { TokenType } from '../parser/lexer.js';

/**
 * Result of vocabulary alignment check
 */
export interface VocabularyCheckResult {
  isKnown: boolean;
  wordType?: TokenType;
  errorMessage?: string;
}

/**
 * Result of command recognition check
 */
export interface CommandRecognitionResult {
  isValid: boolean;
  errorMessage?: string;
  suggestion?: string;
}

/**
 * Result of syntax validation
 */
export interface SyntaxValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorType?: 'MISSING_NOUN' | 'INVALID_STRUCTURE' | 'INCOMPLETE_COMMAND';
}

/**
 * Result of ambiguity resolution
 */
export interface AmbiguityResolutionResult {
  isAmbiguous: boolean;
  clarificationMessage?: string;
  candidates?: string[];
}

/**
 * Result of edge case handling
 */
export interface EdgeCaseResult {
  isEdgeCase: boolean;
  edgeCaseType?: 'EMPTY_INPUT' | 'REPEATED_WORDS' | 'EXCESSIVE_LENGTH' | 'SPECIAL_CHARACTERS' | 'NUMERIC_INPUT';
  errorMessage?: string;
  shouldContinueParsing: boolean;
}

/**
 * ParserConsistencyEngine ensures parser behavior matches Z-Machine exactly
 */
export class ParserConsistencyEngine {
  private vocabulary: Vocabulary;
  
  /**
   * Words that are NOT in the Z-Machine vocabulary
   * These should produce "I don't know the word 'X'." errors
   */
  private static readonly UNKNOWN_WORDS: Set<string> = new Set([
    'ROOM',      // "examine room" → "I don't know the word 'room'."
    'AREA',      // Not a Z-Machine word
    'PLACE',     // Not a Z-Machine word (as noun)
    'LOCATION',  // Not a Z-Machine word
    'SPOT',      // Not a Z-Machine word
    'ZONE',      // Not a Z-Machine word
    'REGION',    // Not a Z-Machine word
  ]);

  /**
   * Words that ARE in the Z-Machine vocabulary but might be confused
   */
  private static readonly KNOWN_WORDS: Set<string> = new Set([
    'HOUSE',
    'FOREST',
    'TREE',
    'DOOR',
    'WINDOW',
    'MAILBOX',
    'LAMP',
    'SWORD',
    'KNIFE',
    'ROPE',
    'BOTTLE',
    'WATER',
    'FOOD',
    'GARLIC',
    'BOOK',
    'CANDLE',
    'MATCH',
    'BELL',
    'SHOVEL',
    'COAL',
    'DIAMOND',
    'EMERALD',
    'SKULL',
    'CHALICE',
    'TRIDENT',
    'FIGURINE',
    'SCEPTRE',
    'BRACELET',
    'NECKLACE',
    'PAINTING',
    'COFFIN',
    'EGG',
    'NEST',
    'BIRD',
    'THIEF',
    'TROLL',
    'CYCLOPS',
  ]);

  /**
   * Verbs that require a direct object in Z-Machine
   */
  private static readonly VERBS_REQUIRING_OBJECT: Set<string> = new Set([
    'TAKE', 'GET', 'PICK',
    'DROP', 'PUT', 'PLACE', 'INSERT',
    'GIVE', 'SHOW',
    'ATTACK', 'KILL', 'HIT', 'STRIKE',
    'OPEN', 'CLOSE', 'UNLOCK', 'LOCK',
    'READ', 'EXAMINE', 'LOOK',
    'EAT', 'DRINK',
    'LIGHT', 'EXTINGUISH', 'TURN',
    'MOVE', 'PUSH', 'PULL',
    'CLIMB', 'ENTER',
    'THROW', 'TIE', 'UNTIE',
    'POUR', 'FILL', 'EMPTY',
    'WAVE', 'RING', 'RUB', 'TOUCH',
    'BREAK', 'CUT', 'DIG',
    'INFLATE', 'DEFLATE',
    'RAISE', 'LOWER',
    'WIND', 'LAUNCH',
  ]);

  /**
   * Verbs that can be used without an object
   */
  private static readonly VERBS_NO_OBJECT: Set<string> = new Set([
    'LOOK', 'L', 'INVENTORY', 'I',
    'WAIT', 'Z', 'AGAIN', 'G',
    'NORTH', 'N', 'SOUTH', 'S', 'EAST', 'E', 'WEST', 'W',
    'NORTHEAST', 'NE', 'NORTHWEST', 'NW', 'SOUTHEAST', 'SE', 'SOUTHWEST', 'SW',
    'UP', 'U', 'DOWN', 'D',
    'QUIT', 'Q', 'RESTART', 'RESTORE', 'SAVE',
    'SCORE', 'VERSION', 'VERBOSE', 'BRIEF', 'SUPERBRIEF',
    'DIAGNOSE', 'PRAY', 'JUMP', 'SWIM', 'YELL', 'SCREAM',
    'SLEEP', 'WAKE', 'LISTEN', 'SMELL', 'THINK',
  ]);

  constructor(vocabulary?: Vocabulary) {
    this.vocabulary = vocabulary || new Vocabulary();
  }

  /**
   * Align vocabulary recognition with Z-Machine
   * Returns the appropriate error message for unknown words
   * 
   * Requirements: 4.2
   */
  alignVocabulary(word: string): VocabularyCheckResult {
    const upperWord = word.toUpperCase();
    
    // Check if word is explicitly unknown in Z-Machine
    if (ParserConsistencyEngine.UNKNOWN_WORDS.has(upperWord)) {
      return {
        isKnown: false,
        errorMessage: `I don't know the word "${word.toLowerCase()}".`
      };
    }
    
    // Check vocabulary
    const wordType = this.vocabulary.lookupWord(word);
    
    if (wordType === TokenType.UNKNOWN) {
      // Word is not in vocabulary - Z-Machine says "I don't know the word"
      return {
        isKnown: false,
        errorMessage: `I don't know the word "${word.toLowerCase()}".`
      };
    }
    
    return {
      isKnown: true,
      wordType
    };
  }

  /**
   * Validate command recognition against Z-Machine behavior
   * 
   * Requirements: 4.3
   */
  validateCommandRecognition(command: string): CommandRecognitionResult {
    const trimmed = command.trim();
    
    if (trimmed.length === 0) {
      return {
        isValid: false,
        errorMessage: "I beg your pardon?"
      };
    }
    
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) {
      return {
        isValid: false,
        errorMessage: "I beg your pardon?"
      };
    }
    
    // Check each word for vocabulary recognition
    for (const word of words) {
      const result = this.alignVocabulary(word);
      if (!result.isKnown) {
        return {
          isValid: false,
          errorMessage: result.errorMessage
        };
      }
    }
    
    return {
      isValid: true
    };
  }

  /**
   * Check if a word is known in the Z-Machine vocabulary
   */
  isKnownWord(word: string): boolean {
    const upperWord = word.toUpperCase();
    
    // Check explicit unknown words first
    if (ParserConsistencyEngine.UNKNOWN_WORDS.has(upperWord)) {
      return false;
    }
    
    // Check explicit known words
    if (ParserConsistencyEngine.KNOWN_WORDS.has(upperWord)) {
      return true;
    }
    
    // Check vocabulary
    const wordType = this.vocabulary.lookupWord(word);
    return wordType !== TokenType.UNKNOWN;
  }

  /**
   * Get the appropriate error message for an unknown word
   */
  getUnknownWordError(word: string): string {
    return `I don't know the word "${word.toLowerCase()}".`;
  }

  /**
   * Get the appropriate error message for an object not found
   * Only use this for KNOWN words that refer to objects not present
   */
  getObjectNotFoundError(objectName: string): string {
    return `You can't see any ${objectName.toLowerCase()} here!`;
  }

  /**
   * Determine the correct error message based on word knowledge
   * 
   * This is the key method for Z-Machine parity:
   * - Unknown word → "I don't know the word 'X'."
   * - Known word, object not present → "You can't see any X here!"
   */
  getAppropriateError(word: string, isObjectPresent: boolean): string {
    if (!this.isKnownWord(word)) {
      return this.getUnknownWordError(word);
    }
    
    if (!isObjectPresent) {
      return this.getObjectNotFoundError(word);
    }
    
    return ""; // No error - object is present
  }

  /**
   * Add a word to the unknown words list
   */
  addUnknownWord(word: string): void {
    ParserConsistencyEngine.UNKNOWN_WORDS.add(word.toUpperCase());
  }

  /**
   * Remove a word from the unknown words list
   */
  removeUnknownWord(word: string): void {
    ParserConsistencyEngine.UNKNOWN_WORDS.delete(word.toUpperCase());
  }

  /**
   * Check if a word is in the unknown words list
   */
  isExplicitlyUnknown(word: string): boolean {
    return ParserConsistencyEngine.UNKNOWN_WORDS.has(word.toUpperCase());
  }

  /**
   * Get all explicitly unknown words
   */
  getUnknownWords(): string[] {
    return Array.from(ParserConsistencyEngine.UNKNOWN_WORDS);
  }

  /**
   * Align syntax validation with Z-Machine behavior
   * 
   * Requirements: 4.3
   */
  alignSyntaxValidation(verb: string, hasDirectObject: boolean, hasIndirectObject: boolean): SyntaxValidationResult {
    const upperVerb = verb.toUpperCase();
    
    // Check if verb requires an object
    if (ParserConsistencyEngine.VERBS_REQUIRING_OBJECT.has(upperVerb) && !hasDirectObject) {
      // Z-Machine asks "What do you want to [verb]?"
      return {
        isValid: false,
        errorMessage: this.getMissingNounError(upperVerb),
        errorType: 'MISSING_NOUN'
      };
    }
    
    // Check for incomplete PUT/PLACE/INSERT commands
    if (['PUT', 'PLACE', 'INSERT'].includes(upperVerb) && hasDirectObject && !hasIndirectObject) {
      return {
        isValid: false,
        errorMessage: this.getIncompleteCommandError(upperVerb),
        errorType: 'INCOMPLETE_COMMAND'
      };
    }
    
    return {
      isValid: true
    };
  }

  /**
   * Get the Z-Machine error message for missing noun
   */
  getMissingNounError(verb: string): string {
    const lowerVerb = verb.toLowerCase();
    
    // Z-Machine uses specific phrasing for different verbs
    switch (verb.toUpperCase()) {
      case 'DROP':
        return "What do you want to drop?";
      case 'TAKE':
      case 'GET':
      case 'PICK':
        return "What do you want to take?";
      case 'PUT':
      case 'PLACE':
      case 'INSERT':
        return "What do you want to put?";
      case 'EXAMINE':
      case 'LOOK':
        return "What do you want to examine?";
      case 'OPEN':
        return "What do you want to open?";
      case 'CLOSE':
        return "What do you want to close?";
      case 'READ':
        return "What do you want to read?";
      case 'ATTACK':
      case 'KILL':
      case 'HIT':
        return "What do you want to attack?";
      case 'GIVE':
        return "What do you want to give?";
      case 'THROW':
        return "What do you want to throw?";
      default:
        return `What do you want to ${lowerVerb}?`;
    }
  }

  /**
   * Get the Z-Machine error message for incomplete command
   */
  getIncompleteCommandError(verb: string): string {
    switch (verb.toUpperCase()) {
      case 'PUT':
      case 'PLACE':
        return "Where do you want to put it?";
      case 'INSERT':
        return "Where do you want to insert it?";
      case 'GIVE':
        return "To whom do you want to give it?";
      case 'THROW':
        return "At what do you want to throw it?";
      default:
        return "There seems to be a noun missing in that sentence!";
    }
  }

  /**
   * Resolve ambiguity exactly as Z-Machine does
   * 
   * Requirements: 4.5
   */
  resolveAmbiguityExactly(objectName: string, candidates: string[]): AmbiguityResolutionResult {
    if (candidates.length <= 1) {
      return {
        isAmbiguous: false
      };
    }
    
    // Z-Machine format: "Which [object] do you mean, the [adj1] one or the [adj2] one?"
    // Or for more than 2: "Which [object] do you mean?"
    if (candidates.length === 2) {
      return {
        isAmbiguous: true,
        clarificationMessage: `Which ${objectName.toLowerCase()} do you mean, the ${candidates[0].toLowerCase()} or the ${candidates[1].toLowerCase()}?`,
        candidates
      };
    }
    
    // For more than 2 candidates
    return {
      isAmbiguous: true,
      clarificationMessage: `Which ${objectName.toLowerCase()} do you mean?`,
      candidates
    };
  }

  /**
   * Check if a verb requires a direct object
   */
  verbRequiresObject(verb: string): boolean {
    return ParserConsistencyEngine.VERBS_REQUIRING_OBJECT.has(verb.toUpperCase());
  }

  /**
   * Check if a verb can be used without an object
   */
  verbAllowsNoObject(verb: string): boolean {
    return ParserConsistencyEngine.VERBS_NO_OBJECT.has(verb.toUpperCase());
  }

  /**
   * Get the list of verbs that require objects
   */
  getVerbsRequiringObject(): string[] {
    return Array.from(ParserConsistencyEngine.VERBS_REQUIRING_OBJECT);
  }

  /**
   * Get the list of verbs that don't require objects
   */
  getVerbsNoObject(): string[] {
    return Array.from(ParserConsistencyEngine.VERBS_NO_OBJECT);
  }

  /**
   * Handle parser edge cases identically to Z-Machine
   * 
   * Requirements: 4.4
   */
  handleParserEdgeCases(input: string): EdgeCaseResult {
    // Empty input
    if (!input || input.trim().length === 0) {
      return {
        isEdgeCase: true,
        edgeCaseType: 'EMPTY_INPUT',
        errorMessage: "I beg your pardon?",
        shouldContinueParsing: false
      };
    }

    const trimmed = input.trim();
    const words = trimmed.split(/\s+/);

    // Excessive length (Z-Machine has a limit)
    if (words.length > 20) {
      return {
        isEdgeCase: true,
        edgeCaseType: 'EXCESSIVE_LENGTH',
        errorMessage: "I don't understand that sentence.",
        shouldContinueParsing: false
      };
    }

    // Check for repeated words (e.g., "take take take")
    if (this.hasExcessiveRepetition(words)) {
      return {
        isEdgeCase: true,
        edgeCaseType: 'REPEATED_WORDS',
        errorMessage: "I don't understand that sentence.",
        shouldContinueParsing: false
      };
    }

    // Check for purely numeric input
    if (/^\d+$/.test(trimmed)) {
      return {
        isEdgeCase: true,
        edgeCaseType: 'NUMERIC_INPUT',
        errorMessage: "I don't understand that sentence.",
        shouldContinueParsing: false
      };
    }

    // Check for special characters that Z-Machine doesn't handle
    if (this.hasInvalidSpecialCharacters(trimmed)) {
      return {
        isEdgeCase: true,
        edgeCaseType: 'SPECIAL_CHARACTERS',
        errorMessage: "I don't understand that sentence.",
        shouldContinueParsing: false
      };
    }

    // Not an edge case - continue parsing
    return {
      isEdgeCase: false,
      shouldContinueParsing: true
    };
  }

  /**
   * Check if input has excessive word repetition
   */
  private hasExcessiveRepetition(words: string[]): boolean {
    if (words.length < 3) return false;
    
    // Check if the same word appears more than 3 times consecutively
    let consecutiveCount = 1;
    for (let i = 1; i < words.length; i++) {
      if (words[i].toUpperCase() === words[i - 1].toUpperCase()) {
        consecutiveCount++;
        if (consecutiveCount > 3) return true;
      } else {
        consecutiveCount = 1;
      }
    }
    
    return false;
  }

  /**
   * Check if input has invalid special characters
   */
  private hasInvalidSpecialCharacters(input: string): boolean {
    // Z-Machine allows: letters, numbers, spaces, periods, commas, quotes, apostrophes
    // Reject: @, #, $, %, ^, &, *, etc.
    const invalidChars = /[@#$%^&*()+=\[\]{}|\\<>~`]/;
    return invalidChars.test(input);
  }

  /**
   * Get the appropriate error message for a parser edge case
   */
  getEdgeCaseError(edgeCaseType: string): string {
    switch (edgeCaseType) {
      case 'EMPTY_INPUT':
        return "I beg your pardon?";
      case 'REPEATED_WORDS':
      case 'EXCESSIVE_LENGTH':
      case 'NUMERIC_INPUT':
      case 'SPECIAL_CHARACTERS':
        return "I don't understand that sentence.";
      default:
        return "I don't understand that sentence.";
    }
  }

  /**
   * Validate and normalize input before parsing
   * Returns normalized input or error message
   */
  normalizeInput(input: string): { normalized: string; error?: string } {
    // Handle edge cases first
    const edgeCaseResult = this.handleParserEdgeCases(input);
    if (edgeCaseResult.isEdgeCase) {
      return { normalized: '', error: edgeCaseResult.errorMessage };
    }

    // Normalize whitespace
    let normalized = input.trim().replace(/\s+/g, ' ');

    // Convert to uppercase for parsing
    normalized = normalized.toUpperCase();

    // Remove trailing punctuation (Z-Machine ignores it)
    normalized = normalized.replace(/[.!?]+$/, '');

    return { normalized };
  }

  /**
   * Check if a command is a valid Z-Machine command structure
   */
  isValidCommandStructure(words: string[]): boolean {
    if (words.length === 0) return false;
    
    // First word should be a verb or direction
    const firstWord = words[0].toUpperCase();
    const wordType = this.vocabulary.lookupWord(firstWord);
    
    return wordType === TokenType.VERB || wordType === TokenType.DIRECTION;
  }

  /**
   * Static factory method
   */
  static create(vocabulary?: Vocabulary): ParserConsistencyEngine {
    return new ParserConsistencyEngine(vocabulary);
  }
}
