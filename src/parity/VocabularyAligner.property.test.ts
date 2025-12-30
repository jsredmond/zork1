/**
 * Property-Based Tests for VocabularyAligner
 * 
 * These tests verify universal properties that should hold for all valid inputs.
 * 
 * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { VocabularyAligner } from './VocabularyAligner';

describe('VocabularyAligner Property Tests', () => {
  const aligner = new VocabularyAligner();

  /**
   * Generator for known Z-Machine words
   */
  const knownWordArb = fc.constantFrom(
    // Common objects
    'HOUSE', 'FOREST', 'TREE', 'DOOR', 'WINDOW', 'MAILBOX',
    'LAMP', 'SWORD', 'KNIFE', 'ROPE', 'BOTTLE', 'WATER',
    'FOOD', 'GARLIC', 'BOOK', 'CANDLE', 'MATCH', 'BELL',
    'SHOVEL', 'COAL', 'DIAMOND', 'EMERALD', 'SKULL', 'CHALICE',
    // Common verbs
    'TAKE', 'GET', 'DROP', 'PUT', 'OPEN', 'CLOSE', 'EXAMINE',
    'LOOK', 'READ', 'ATTACK', 'KILL', 'EAT', 'DRINK', 'GIVE',
    // Directions
    'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN',
    'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST'
  );

  /**
   * Generator for unknown words (not in Z-Machine vocabulary)
   */
  const unknownWordArb = fc.constantFrom(
    'ROOM', 'AREA', 'PLACE', 'LOCATION', 'SPOT', 'ZONE', 'REGION',
    'ENVIRONMENT', 'SURROUNDINGS', 'VICINITY', 'NEIGHBORHOOD',
    'SECTOR', 'TERRITORY', 'DOMAIN'
  );

  /**
   * Generator for synonym pairs (synonym -> canonical)
   */
  const synonymPairArb = fc.constantFrom(
    ['GET', 'TAKE'],
    ['GRAB', 'TAKE'],
    ['X', 'EXAMINE'],
    ['KILL', 'ATTACK'],
    ['HIT', 'ATTACK'],
    ['SHUT', 'CLOSE'],
    ['TOSS', 'THROW'],
    ['Z', 'WAIT'],
    ['I', 'INVENTORY'],
    ['N', 'NORTH'],
    ['S', 'SOUTH'],
    ['E', 'EAST'],
    ['W', 'WEST'],
    ['U', 'UP'],
    ['D', 'DOWN'],
    ['LANTERN', 'LAMP'],
    ['BLADE', 'SWORD']
  );

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * For any word in the Z-Machine vocabulary, the TypeScript parser SHALL recognize it.
   * 
   * **Validates: Requirements 3.2**
   */
  it('Property 5a: Known Z-Machine words are recognized', () => {
    fc.assert(
      fc.property(knownWordArb, (word) => {
        const result = aligner.isZMachineWord(word);
        return result === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * For any word NOT in the Z-Machine vocabulary (including "room", "area", "place", etc.),
   * the parser SHALL return "I don't know the word 'X'."
   * 
   * **Validates: Requirements 3.1, 3.3**
   */
  it('Property 5b: Unknown words are not recognized and produce correct error', () => {
    fc.assert(
      fc.property(unknownWordArb, (word) => {
        // Word should not be recognized
        const isKnown = aligner.isZMachineWord(word);
        if (isKnown) {
          return false;
        }

        // Error message should match Z-Machine format
        const errorMessage = aligner.getUnknownWordError(word);
        const expectedFormat = `I don't know the word "${word.toLowerCase()}".`;
        
        return errorMessage === expectedFormat;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * For any synonym, getCanonicalForm SHALL return the canonical form.
   * 
   * **Validates: Requirements 3.4**
   */
  it('Property 5c: Synonyms map to their canonical forms', () => {
    fc.assert(
      fc.property(synonymPairArb, ([synonym, canonical]) => {
        const result = aligner.getCanonicalForm(synonym);
        return result === canonical;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * For any known word, checkWord SHALL return isKnown: true.
   * 
   * **Validates: Requirements 3.2**
   */
  it('Property 5d: checkWord returns isKnown: true for known words', () => {
    fc.assert(
      fc.property(knownWordArb, (word) => {
        const result = aligner.checkWord(word);
        return result.isKnown === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * For any unknown word, checkWord SHALL return isKnown: false with error message.
   * 
   * **Validates: Requirements 3.1, 3.3**
   */
  it('Property 5e: checkWord returns isKnown: false with error for unknown words', () => {
    fc.assert(
      fc.property(unknownWordArb, (word) => {
        const result = aligner.checkWord(word);
        
        // Should not be known
        if (result.isKnown) {
          return false;
        }
        
        // Should have error message
        if (!result.errorMessage) {
          return false;
        }
        
        // Error message should match format
        const expectedFormat = `I don't know the word "${word.toLowerCase()}".`;
        return result.errorMessage === expectedFormat;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * Case insensitivity: words should be recognized regardless of case.
   * 
   * **Validates: Requirements 3.2**
   */
  it('Property 5f: Word recognition is case-insensitive', () => {
    fc.assert(
      fc.property(knownWordArb, (word) => {
        const upperResult = aligner.isZMachineWord(word.toUpperCase());
        const lowerResult = aligner.isZMachineWord(word.toLowerCase());
        const mixedResult = aligner.isZMachineWord(
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        
        return upperResult === lowerResult && lowerResult === mixedResult;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * Canonical form is idempotent: getting canonical form twice returns same result.
   * 
   * **Validates: Requirements 3.4**
   */
  it('Property 5g: getCanonicalForm is idempotent', () => {
    fc.assert(
      fc.property(knownWordArb, (word) => {
        const firstCanonical = aligner.getCanonicalForm(word);
        const secondCanonical = aligner.getCanonicalForm(firstCanonical);
        
        return firstCanonical === secondCanonical;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * Synonyms are recognized as known words.
   * 
   * **Validates: Requirements 3.2, 3.4**
   */
  it('Property 5h: Synonyms are recognized as known words', () => {
    fc.assert(
      fc.property(synonymPairArb, ([synonym, _canonical]) => {
        return aligner.isZMachineWord(synonym) === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * validateAlignment correctly identifies all unknown words in a list.
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   */
  it('Property 5i: validateAlignment identifies all unknown words', () => {
    // Generate a mix of known and unknown words
    const mixedWordsArb = fc.array(
      fc.oneof(knownWordArb, unknownWordArb),
      { minLength: 1, maxLength: 10 }
    );

    fc.assert(
      fc.property(mixedWordsArb, (words) => {
        const result = aligner.validateAlignment(words);
        
        // Every word should be in either unknownWords or recognizedWords
        for (const word of words) {
          const inUnknown = result.unknownWords.includes(word);
          const inRecognized = result.recognizedWords.includes(word);
          
          // Word should be in exactly one list
          if (inUnknown === inRecognized) {
            return false;
          }
        }
        
        // isValid should be true only if no unknown words
        if (result.isValid !== (result.unknownWords.length === 0)) {
          return false;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 5: Vocabulary Recognition Consistency
   * 
   * getFirstUnknownWord returns the first unknown word in a command.
   * 
   * **Validates: Requirements 3.3**
   */
  it('Property 5j: getFirstUnknownWord finds first unknown word', () => {
    fc.assert(
      fc.property(unknownWordArb, knownWordArb, (unknownWord, knownWord) => {
        // Command with unknown word first
        const command1 = `${unknownWord} ${knownWord}`;
        const result1 = aligner.getFirstUnknownWord(command1);
        
        if (result1 !== unknownWord) {
          return false;
        }
        
        // Command with only known words
        const command2 = `${knownWord} ${knownWord}`;
        const result2 = aligner.getFirstUnknownWord(command2);
        
        if (result2 !== null) {
          return false;
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
