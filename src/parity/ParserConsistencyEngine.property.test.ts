/**
 * ParserConsistencyEngine Property Tests
 * 
 * Property 1: Error Message Priority
 * Property 2: Verb Object Requirement Messages
 * Property 3: Whitespace and Malformed Input Handling
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 1.6, 3.3**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  ParserConsistencyEngine, 
  ParserErrorPriority 
} from './ParserConsistencyEngine.js';
import { ErrorMessageStandardizer } from './ErrorMessageStandardizer.js';

describe('ParserConsistencyEngine Property Tests', () => {
  let engine: ParserConsistencyEngine;

  beforeEach(() => {
    engine = new ParserConsistencyEngine();
  });

  // ============================================
  // Feature: achieve-99-percent-parity
  // Property 1: Error Message Priority
  // **Validates: Requirements 1.1, 1.2, 3.3**
  // ============================================
  describe('Property 1: Error Message Priority', () => {
    /**
     * Property: For any command containing an unknown word, the parser SHALL return
     * "I don't know the word 'X'." before checking object visibility or action validity.
     */
    it('should prioritize unknown word errors over object visibility errors', () => {
      // Generator for unknown words
      const unknownWordGen = fc.constantFrom(
        'room', 'area', 'place', 'location', 'spot', 'zone', 'region'
      );

      // Generator for visibility status
      const visibilityGen = fc.boolean();

      fc.assert(
        fc.property(unknownWordGen, visibilityGen, (word, isVisible) => {
          const result = engine.getParserErrorWithPriority(word, isVisible);
          
          // Unknown word should always return UNKNOWN_WORD error regardless of visibility
          expect(result).not.toBeNull();
          expect(result!.errorType).toBe('UNKNOWN_WORD');
          expect(result!.priority).toBe(ParserErrorPriority.UNKNOWN_WORD);
          expect(result!.message).toContain("don't know the word");
          expect(result!.message.toLowerCase()).toContain(word.toLowerCase());
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return object visibility error for known words when not visible', () => {
      // Generator for known words (verified to be in KNOWN_WORDS set)
      const knownWordGen = fc.constantFrom(
        'lamp', 'sword', 'bottle', 'door', 'window', 'mailbox', 'house', 'forest'
      );

      fc.assert(
        fc.property(knownWordGen, (word) => {
          const result = engine.getParserErrorWithPriority(word, false);
          
          // Known word, not visible should return OBJECT_NOT_VISIBLE error
          expect(result).not.toBeNull();
          expect(result!.errorType).toBe('OBJECT_NOT_VISIBLE');
          expect(result!.priority).toBe(ParserErrorPriority.OBJECT_NOT_VISIBLE);
          expect(result!.message).toContain("can't see");
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for known words when visible', () => {
      // Generator for known words (verified to be in KNOWN_WORDS set)
      const knownWordGen = fc.constantFrom(
        'lamp', 'sword', 'bottle', 'door', 'window', 'mailbox', 'house', 'forest'
      );

      fc.assert(
        fc.property(knownWordGen, (word) => {
          const result = engine.getParserErrorWithPriority(word, true);
          
          // Known word, visible should return null (no error)
          expect(result).toBeNull();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should check unknown words first in multi-word commands', () => {
      // Generator for commands with unknown words
      const commandWithUnknownGen = fc.constantFrom(
        ['take', 'room'],      // unknown word second
        ['examine', 'area'],   // unknown word second
        ['room', 'lamp'],      // unknown word first
        ['area', 'sword']      // unknown word first
      );

      // Visibility checker that always returns true for known words
      const visibilityChecker = (word: string) => engine.isKnownWord(word);

      fc.assert(
        fc.property(commandWithUnknownGen, (words) => {
          const result = engine.getHighestPriorityError(words, visibilityChecker);
          
          // Should find the unknown word regardless of position
          expect(result).not.toBeNull();
          expect(result!.errorType).toBe('UNKNOWN_WORD');
          expect(result!.priority).toBe(ParserErrorPriority.UNKNOWN_WORD);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain priority order: UNKNOWN_WORD > OBJECT_NOT_VISIBLE > ACTION_NOT_POSSIBLE', () => {
      // Test that priority values are correctly ordered
      expect(ParserErrorPriority.UNKNOWN_WORD).toBeLessThan(ParserErrorPriority.OBJECT_NOT_VISIBLE);
      expect(ParserErrorPriority.OBJECT_NOT_VISIBLE).toBeLessThan(ParserErrorPriority.ACTION_NOT_POSSIBLE);
    });
  });

  // ============================================
  // Feature: achieve-99-percent-parity
  // Property 2: Verb Object Requirement Messages
  // **Validates: Requirements 1.3**
  // ============================================
  describe('Property 2: Verb Object Requirement Messages', () => {
    /**
     * Property: For any verb that requires a direct object, when invoked without one,
     * the parser SHALL return "What do you want to [verb]?" with exact Z-Machine phrasing.
     */
    it('should return correct verb-specific error messages', () => {
      // Generator for verb/expected message pairs
      const verbMessageGen = fc.constantFrom(
        { verb: 'drop', expected: 'What do you want to drop?' },
        { verb: 'take', expected: 'What do you want to take?' },
        { verb: 'get', expected: 'What do you want to take?' },
        { verb: 'examine', expected: 'What do you want to examine?' },
        { verb: 'open', expected: 'What do you want to open?' },
        { verb: 'close', expected: 'What do you want to close?' },
        { verb: 'read', expected: 'What do you want to read?' },
        { verb: 'attack', expected: 'What do you want to attack?' },
        { verb: 'kill', expected: 'What do you want to attack?' },
        { verb: 'give', expected: 'What do you want to give?' },
        { verb: 'throw', expected: 'What do you want to throw?' },
        { verb: 'push', expected: 'What do you want to push?' },
        { verb: 'pull', expected: 'What do you want to pull?' }
      );

      fc.assert(
        fc.property(verbMessageGen, ({ verb, expected }) => {
          const message = engine.getVerbObjectRequirementError(verb);
          
          // Message should match expected Z-Machine phrasing
          expect(message).toBe(expected);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return error when verb requires object but none provided', () => {
      // Generator for verbs requiring objects
      const verbGen = fc.constantFrom(
        'take', 'drop', 'examine', 'open', 'close', 'read', 'attack', 'give'
      );

      fc.assert(
        fc.property(verbGen, (verb) => {
          const error = engine.checkVerbObjectRequirement(verb, false);
          
          // Should return error message
          expect(error).not.toBeNull();
          expect(error).toContain('What do you want to');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return null when verb has object provided', () => {
      // Generator for verbs requiring objects
      const verbGen = fc.constantFrom(
        'take', 'drop', 'examine', 'open', 'close', 'read', 'attack', 'give'
      );

      fc.assert(
        fc.property(verbGen, (verb) => {
          const error = engine.checkVerbObjectRequirement(verb, true);
          
          // Should return null (no error)
          expect(error).toBeNull();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle case-insensitive verb matching', () => {
      // Generator for case variations
      const caseVariationGen = fc.constantFrom(
        { verb: 'DROP', expected: 'What do you want to drop?' },
        { verb: 'drop', expected: 'What do you want to drop?' },
        { verb: 'Drop', expected: 'What do you want to drop?' },
        { verb: 'TAKE', expected: 'What do you want to take?' },
        { verb: 'take', expected: 'What do you want to take?' },
        { verb: 'Take', expected: 'What do you want to take?' }
      );

      fc.assert(
        fc.property(caseVariationGen, ({ verb, expected }) => {
          const message = engine.getVerbObjectRequirementError(verb);
          
          // Should match regardless of case
          expect(message).toBe(expected);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================
  // Feature: achieve-99-percent-parity
  // Property 3: Whitespace and Malformed Input Handling
  // **Validates: Requirements 1.5, 1.6**
  // ============================================
  describe('Property 3: Whitespace and Malformed Input Handling', () => {
    /**
     * Property: For any input consisting entirely of whitespace, the parser SHALL
     * return "I beg your pardon?". For any input with excessive repetition or
     * invalid special characters, the parser SHALL return "I don't understand that sentence."
     */
    it('should return "I beg your pardon?" for whitespace-only input', () => {
      // Generator for whitespace-only strings
      const whitespaceGen = fc.constantFrom(
        '',
        ' ',
        '  ',
        '   ',
        '\t',
        '\n',
        '  \t  ',
        '\t\n\t',
        '     '
      );

      fc.assert(
        fc.property(whitespaceGen, (input) => {
          const error = engine.handleWhitespaceInput(input);
          
          // Should return "I beg your pardon?"
          expect(error).toBe("I beg your pardon?");
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for non-whitespace input', () => {
      // Generator for valid input strings
      const validInputGen = fc.constantFrom(
        'take lamp',
        'look',
        'north',
        'examine sword',
        'drop bottle'
      );

      fc.assert(
        fc.property(validInputGen, (input) => {
          const error = engine.handleWhitespaceInput(input);
          
          // Should return null (no error)
          expect(error).toBeNull();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return "I don\'t understand that sentence." for malformed input', () => {
      // Generator for malformed input strings
      const malformedGen = fc.constantFrom(
        '12345',                           // Numeric only
        'take @lamp',                      // Special characters
        'drop #sword',                     // Special characters
        'look $here',                      // Special characters
        'take take take take lamp',        // Excessive repetition
        'drop drop drop drop sword'        // Excessive repetition
      );

      fc.assert(
        fc.property(malformedGen, (input) => {
          const error = engine.handleMalformedInput(input);
          
          // Should return "I don't understand that sentence."
          expect(error).toBe("I don't understand that sentence.");
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for well-formed input', () => {
      // Generator for well-formed input strings
      const wellFormedGen = fc.constantFrom(
        'take lamp',
        'look',
        'north',
        'examine sword',
        'drop bottle',
        'put lamp in case',
        'give sword to troll'
      );

      fc.assert(
        fc.property(wellFormedGen, (input) => {
          const error = engine.handleMalformedInput(input);
          
          // Should return null (no error)
          expect(error).toBeNull();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle excessive length as malformed', () => {
      // Generator for excessively long commands (>20 words)
      const longCommandGen = fc.array(
        fc.constantFrom('take', 'drop', 'look', 'examine', 'open', 'close'),
        { minLength: 21, maxLength: 30 }
      ).map(words => words.join(' '));

      fc.assert(
        fc.property(longCommandGen, (input) => {
          const error = engine.handleMalformedInput(input);
          
          // Should return "I don't understand that sentence."
          expect(error).toBe("I don't understand that sentence.");
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should validate input with priority correctly', () => {
      // Generator for various input types
      const inputGen = fc.constantFrom(
        { input: '', expectedType: 'WHITESPACE_INPUT' },
        { input: '   ', expectedType: 'WHITESPACE_INPUT' },
        { input: '12345', expectedType: 'MALFORMED_INPUT' },
        { input: 'take @lamp', expectedType: 'MALFORMED_INPUT' },
        { input: 'examine room', expectedType: 'UNKNOWN_WORD' }
      );

      fc.assert(
        fc.property(inputGen, ({ input, expectedType }) => {
          const result = engine.validateInputWithPriority(input);
          
          // Should return correct error type
          expect(result).not.toBeNull();
          expect(result!.errorType).toBe(expectedType);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return null for valid input with all known words', () => {
      // Generator for valid commands with known words
      const validCommandGen = fc.constantFrom(
        'take lamp',
        'look',
        'north',
        'examine sword'
      );

      fc.assert(
        fc.property(validCommandGen, (input) => {
          const result = engine.validateInputWithPriority(input);
          
          // Should return null (no error) for valid input
          expect(result).toBeNull();
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
