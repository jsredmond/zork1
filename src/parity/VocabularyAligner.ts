/**
 * VocabularyAligner - Ensures vocabulary recognition matches Z-Machine exactly
 * 
 * This module provides vocabulary validation and synonym handling to ensure
 * the TypeScript implementation recognizes the same words as the original Z-Machine.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { Vocabulary } from '../parser/vocabulary.js';
import { TokenType } from '../parser/lexer.js';
import { ErrorMessageStandardizer } from './ErrorMessageStandardizer.js';

/**
 * Result of vocabulary validation
 */
export interface VocabularyValidationResult {
  isValid: boolean;
  unknownWords: string[];
  recognizedWords: string[];
  synonymMappings: Map<string, string>;
}

/**
 * Result of word check
 */
export interface WordCheckResult {
  isKnown: boolean;
  canonicalForm?: string;
  wordType?: TokenType;
  errorMessage?: string;
}

/**
 * VocabularyAligner ensures vocabulary recognition matches Z-Machine exactly
 * 
 * Key responsibilities:
 * 1. Identify words NOT in Z-Machine vocabulary (Requirement 3.1)
 * 2. Recognize all Z-Machine vocabulary words (Requirement 3.2)
 * 3. Return correct error for unknown words (Requirement 3.3)
 * 4. Handle synonyms identically to Z-Machine (Requirement 3.4)
 */
export class VocabularyAligner {
  private vocabulary: Vocabulary;

  /**
   * Words that are NOT in the Z-Machine vocabulary
   * These should produce "I don't know the word 'X'." errors
   * 
   * Requirement 3.1: THE Parser SHALL NOT recognize these words
   */
  private static readonly UNKNOWN_WORDS: Set<string> = new Set([
    // Location-related words not in Z-Machine vocabulary
    'ROOM',       // "examine room" → "I don't know the word 'room'."
    'AREA',       // Not a Z-Machine word
    'PLACE',      // Not a Z-Machine word (as noun for location)
    'LOCATION',   // Not a Z-Machine word
    'SPOT',       // Not a Z-Machine word
    'ZONE',       // Not a Z-Machine word
    'REGION',     // Not a Z-Machine word
    
    // Other common words not in Z-Machine vocabulary
    'ENVIRONMENT', // Not a Z-Machine word
    'SURROUNDINGS', // Not a Z-Machine word
    'VICINITY',   // Not a Z-Machine word
    'NEIGHBORHOOD', // Not a Z-Machine word
    'SECTOR',     // Not a Z-Machine word
    'TERRITORY',  // Not a Z-Machine word
    'DOMAIN',     // Not a Z-Machine word
  ]);

  /**
   * Synonym mappings matching Z-Machine behavior
   * Maps synonyms to their canonical forms
   * 
   * Requirement 3.4: Handle word synonyms identically to Z-Machine
   */
  private static readonly SYNONYM_MAPPINGS: Map<string, string> = new Map([
    // TAKE synonyms
    ['GET', 'TAKE'],
    ['GRAB', 'TAKE'],
    ['PICK', 'TAKE'],
    ['HOLD', 'TAKE'],
    ['CARRY', 'TAKE'],
    ['CATCH', 'TAKE'],
    
    // EXAMINE synonyms
    ['X', 'EXAMINE'],
    ['LOOK', 'EXAMINE'],  // "look at X" = "examine X"
    ['DESCRIBE', 'EXAMINE'],
    ['READ', 'EXAMINE'],  // For readable objects
    
    // DROP synonyms
    ['RELEASE', 'DROP'],
    ['DISCARD', 'DROP'],
    
    // ATTACK synonyms
    ['KILL', 'ATTACK'],
    ['FIGHT', 'ATTACK'],
    ['HIT', 'ATTACK'],
    ['STRIKE', 'ATTACK'],
    ['HURT', 'ATTACK'],
    ['INJURE', 'ATTACK'],
    ['MURDER', 'ATTACK'],
    ['SLAY', 'ATTACK'],
    
    // OPEN synonyms
    ['UNCOVER', 'OPEN'],
    
    // CLOSE synonyms
    ['SHUT', 'CLOSE'],
    
    // MOVE synonyms
    ['PUSH', 'MOVE'],
    ['PULL', 'MOVE'],
    ['SHIFT', 'MOVE'],
    
    // THROW synonyms
    ['TOSS', 'THROW'],
    ['HURL', 'THROW'],
    ['CHUCK', 'THROW'],
    
    // LIGHT synonyms
    ['IGNITE', 'LIGHT'],
    ['BURN', 'LIGHT'],
    
    // EXTINGUISH synonyms
    ['DOUSE', 'EXTINGUISH'],
    ['BLOW', 'EXTINGUISH'],  // "blow out"
    
    // CLIMB synonyms
    ['SCALE', 'CLIMB'],
    ['ASCEND', 'CLIMB'],
    
    // ENTER synonyms
    ['BOARD', 'ENTER'],
    ['GO', 'ENTER'],  // "go in" = "enter"
    
    // WAIT synonyms
    ['Z', 'WAIT'],
    
    // INVENTORY synonyms
    ['I', 'INVENTORY'],
    
    // AGAIN synonyms
    ['G', 'AGAIN'],
    
    // Direction abbreviations
    ['N', 'NORTH'],
    ['S', 'SOUTH'],
    ['E', 'EAST'],
    ['W', 'WEST'],
    ['U', 'UP'],
    ['D', 'DOWN'],
    ['NE', 'NORTHEAST'],
    ['NW', 'NORTHWEST'],
    ['SE', 'SOUTHEAST'],
    ['SW', 'SOUTHWEST'],
    
    // Object synonyms
    ['LANTERN', 'LAMP'],
    ['BLADE', 'SWORD'],
    ['SCEPTER', 'SCEPTRE'],
    ['CASKET', 'COFFIN'],
    ['FLASK', 'BOTTLE'],
    ['LUNCH', 'FOOD'],
    ['DINNER', 'FOOD'],
    ['CLOVE', 'GARLIC'],
    ['SPADE', 'SHOVEL'],
    ['HATCHET', 'AXE'],
    ['PAIL', 'BUCKET'],
    ['SACK', 'BAG'],
    ['ROBBER', 'THIEF'],
    ['BURGLAR', 'THIEF'],
    ['MONSTER', 'TROLL'],
    ['GIANT', 'CYCLOPS'],
  ]);

  /**
   * Words that ARE in the Z-Machine vocabulary
   * This is a subset for quick validation - full vocabulary is in Vocabulary class
   * 
   * Requirement 3.2: THE Parser SHALL recognize all these words
   */
  private static readonly KNOWN_WORDS: Set<string> = new Set([
    // Common objects
    'HOUSE', 'FOREST', 'TREE', 'DOOR', 'WINDOW', 'MAILBOX',
    'LAMP', 'SWORD', 'KNIFE', 'ROPE', 'BOTTLE', 'WATER',
    'FOOD', 'GARLIC', 'BOOK', 'CANDLE', 'MATCH', 'BELL',
    'SHOVEL', 'COAL', 'DIAMOND', 'EMERALD', 'SKULL', 'CHALICE',
    'TRIDENT', 'FIGURINE', 'SCEPTRE', 'BRACELET', 'NECKLACE',
    'PAINTING', 'COFFIN', 'EGG', 'NEST', 'BIRD', 'THIEF',
    'TROLL', 'CYCLOPS', 'BAG', 'CASE', 'TROPHY', 'BASKET',
    'BUCKET', 'POT', 'MACHINE', 'BOLT', 'MIRROR', 'BOARD',
    'BUOY', 'PUMP', 'SLIDE', 'PILE', 'SAND', 'STONE',
    'LEAFLET', 'MAT', 'TRAP', 'TRAPDOOR', 'GRATING', 'LEAVES',
    'JEWEL', 'COINS', 'TORCH', 'WRENCH', 'SCREWDRIVER',
    
    // Common verbs
    'TAKE', 'GET', 'DROP', 'PUT', 'OPEN', 'CLOSE', 'EXAMINE',
    'LOOK', 'READ', 'ATTACK', 'KILL', 'EAT', 'DRINK', 'GIVE',
    'THROW', 'TURN', 'PUSH', 'PULL', 'MOVE', 'CLIMB', 'LIGHT',
    'EXTINGUISH', 'UNLOCK', 'LOCK', 'TIE', 'UNTIE', 'SEARCH',
    'WAIT', 'QUIT', 'SAVE', 'RESTORE', 'SCORE', 'INVENTORY',
    'DIAGNOSE', 'HELLO', 'JUMP', 'SWIM', 'WAVE', 'PRAY',
    
    // Directions
    'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN',
    'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST',
    'OUT', 'EXIT', 'LEAVE', 'ENTER',
    
    // Prepositions
    'WITH', 'IN', 'ON', 'AT', 'TO', 'FROM', 'INTO', 'ONTO',
    'UNDER', 'BEHIND', 'THROUGH', 'ACROSS', 'AROUND',
    
    // Articles and pronouns
    'THE', 'A', 'AN', 'IT', 'THEM', 'ALL',
  ]);

  constructor(vocabulary?: Vocabulary) {
    this.vocabulary = vocabulary || new Vocabulary();
  }

  /**
   * Check if a word is in the Z-Machine vocabulary
   * 
   * Requirement 3.1, 3.2: Correctly identify known vs unknown words
   * 
   * @param word - The word to check
   * @returns true if the word is recognized by Z-Machine
   */
  isZMachineWord(word: string): boolean {
    const upperWord = word.toUpperCase().trim();
    
    // Check if explicitly unknown
    if (VocabularyAligner.UNKNOWN_WORDS.has(upperWord)) {
      return false;
    }
    
    // Check if explicitly known
    if (VocabularyAligner.KNOWN_WORDS.has(upperWord)) {
      return true;
    }
    
    // Check if it's a synonym
    if (VocabularyAligner.SYNONYM_MAPPINGS.has(upperWord)) {
      return true;
    }
    
    // Check the full vocabulary
    const wordType = this.vocabulary.lookupWord(word);
    return wordType !== TokenType.UNKNOWN;
  }

  /**
   * Get the error message for an unknown word
   * 
   * Requirement 3.3: Return "I don't know the word 'X'." for unknown words
   * 
   * @param word - The unknown word
   * @returns The Z-Machine error message
   */
  getUnknownWordError(word: string): string {
    return ErrorMessageStandardizer.unknownWord(word.toLowerCase());
  }

  /**
   * Get the canonical form of a word (for synonyms)
   * 
   * Requirement 3.4: Handle word synonyms identically to Z-Machine
   * 
   * @param word - The word to look up
   * @returns The canonical form, or the word itself if not a synonym
   */
  getCanonicalForm(word: string): string {
    const upperWord = word.toUpperCase().trim();
    
    // Check synonym mappings
    const canonical = VocabularyAligner.SYNONYM_MAPPINGS.get(upperWord);
    if (canonical) {
      return canonical;
    }
    
    // Check vocabulary's canonical form
    const vocabCanonical = this.vocabulary.getCanonicalForm(word);
    if (vocabCanonical !== word) {
      return vocabCanonical.toUpperCase();
    }
    
    // Return the word itself (normalized to uppercase)
    return upperWord;
  }

  /**
   * Check a word and return detailed result
   * 
   * @param word - The word to check
   * @returns Detailed result including canonical form and error message if unknown
   */
  checkWord(word: string): WordCheckResult {
    const upperWord = word.toUpperCase().trim();
    
    // Check if explicitly unknown
    if (VocabularyAligner.UNKNOWN_WORDS.has(upperWord)) {
      return {
        isKnown: false,
        errorMessage: this.getUnknownWordError(word)
      };
    }
    
    // Check vocabulary
    const wordType = this.vocabulary.lookupWord(word);
    
    if (wordType === TokenType.UNKNOWN) {
      // Check if it's a known synonym
      if (VocabularyAligner.SYNONYM_MAPPINGS.has(upperWord)) {
        const canonical = VocabularyAligner.SYNONYM_MAPPINGS.get(upperWord)!;
        return {
          isKnown: true,
          canonicalForm: canonical,
          wordType: this.vocabulary.lookupWord(canonical)
        };
      }
      
      return {
        isKnown: false,
        errorMessage: this.getUnknownWordError(word)
      };
    }
    
    // Word is known
    const canonical = this.getCanonicalForm(word);
    return {
      isKnown: true,
      canonicalForm: canonical,
      wordType
    };
  }

  /**
   * Validate vocabulary alignment for a list of words
   * 
   * @param words - Array of words to validate
   * @returns Validation result with unknown words and synonym mappings
   */
  validateAlignment(words: string[]): VocabularyValidationResult {
    const unknownWords: string[] = [];
    const recognizedWords: string[] = [];
    const synonymMappings = new Map<string, string>();
    
    for (const word of words) {
      const result = this.checkWord(word);
      
      if (result.isKnown) {
        recognizedWords.push(word);
        if (result.canonicalForm && result.canonicalForm !== word.toUpperCase()) {
          synonymMappings.set(word.toUpperCase(), result.canonicalForm);
        }
      } else {
        unknownWords.push(word);
      }
    }
    
    return {
      isValid: unknownWords.length === 0,
      unknownWords,
      recognizedWords,
      synonymMappings
    };
  }

  /**
   * Get the first unknown word in a command
   * Returns null if all words are known
   * 
   * Requirement 3.3: Check unknown word FIRST before object visibility
   * 
   * @param command - The command string to check
   * @returns The first unknown word, or null if all words are known
   */
  getFirstUnknownWord(command: string): string | null {
    const words = command.trim().split(/\s+/).filter(w => w.length > 0);
    
    for (const word of words) {
      // Skip articles and common words
      const upperWord = word.toUpperCase();
      if (['THE', 'A', 'AN', 'TO', 'AT', 'IN', 'ON'].includes(upperWord)) {
        continue;
      }
      
      if (!this.isZMachineWord(word)) {
        return word;
      }
    }
    
    return null;
  }

  /**
   * Add a word to the unknown words set
   * 
   * @param word - The word to add
   */
  addUnknownWord(word: string): void {
    VocabularyAligner.UNKNOWN_WORDS.add(word.toUpperCase().trim());
  }

  /**
   * Remove a word from the unknown words set
   * 
   * @param word - The word to remove
   */
  removeUnknownWord(word: string): void {
    VocabularyAligner.UNKNOWN_WORDS.delete(word.toUpperCase().trim());
  }

  /**
   * Add a synonym mapping
   * 
   * @param synonym - The synonym word
   * @param canonical - The canonical form
   */
  addSynonym(synonym: string, canonical: string): void {
    VocabularyAligner.SYNONYM_MAPPINGS.set(
      synonym.toUpperCase().trim(),
      canonical.toUpperCase().trim()
    );
  }

  /**
   * Remove a synonym mapping
   * 
   * @param synonym - The synonym to remove
   */
  removeSynonym(synonym: string): void {
    VocabularyAligner.SYNONYM_MAPPINGS.delete(synonym.toUpperCase().trim());
  }

  /**
   * Get all unknown words
   * 
   * @returns Array of all unknown words
   */
  getUnknownWords(): string[] {
    return Array.from(VocabularyAligner.UNKNOWN_WORDS);
  }

  /**
   * Get all synonym mappings
   * 
   * @returns Map of synonym to canonical form
   */
  getSynonymMappings(): Map<string, string> {
    return new Map(VocabularyAligner.SYNONYM_MAPPINGS);
  }

  /**
   * Check if a word is explicitly marked as unknown
   * 
   * @param word - The word to check
   * @returns true if the word is in the UNKNOWN_WORDS set
   */
  isExplicitlyUnknown(word: string): boolean {
    return VocabularyAligner.UNKNOWN_WORDS.has(word.toUpperCase().trim());
  }

  /**
   * Check if a word has a synonym mapping
   * 
   * @param word - The word to check
   * @returns true if the word has a synonym mapping
   */
  hasSynonym(word: string): boolean {
    return VocabularyAligner.SYNONYM_MAPPINGS.has(word.toUpperCase().trim());
  }

  /**
   * Static factory method
   */
  static create(vocabulary?: Vocabulary): VocabularyAligner {
    return new VocabularyAligner(vocabulary);
  }
}

// Export convenience functions
export const isZMachineWord = (word: string): boolean => {
  const aligner = new VocabularyAligner();
  return aligner.isZMachineWord(word);
};

export const getUnknownWordError = (word: string): string => {
  const aligner = new VocabularyAligner();
  return aligner.getUnknownWordError(word);
};

export const getCanonicalForm = (word: string): string => {
  const aligner = new VocabularyAligner();
  return aligner.getCanonicalForm(word);
};
