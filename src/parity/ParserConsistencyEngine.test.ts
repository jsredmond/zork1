/**
 * ParserConsistencyEngine Tests
 * 
 * Property 9: Vocabulary Recognition Consistency
 * Tests that TypeScript recognizes exactly the same words as Z-Machine
 * 
 * Requirements: 4.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ParserConsistencyEngine, VocabularyCheckResult } from './ParserConsistencyEngine.js';
import { Vocabulary } from '../parser/vocabulary.js';

describe('ParserConsistencyEngine', () => {
  let engine: ParserConsistencyEngine;
  let vocabulary: Vocabulary;

  beforeEach(() => {
    vocabulary = new Vocabulary();
    engine = new ParserConsistencyEngine(vocabulary);
  });

  describe('Basic Functionality', () => {
    it('should create engine with default vocabulary', () => {
      const defaultEngine = ParserConsistencyEngine.create();
      expect(defaultEngine).toBeDefined();
    });

    it('should identify explicitly unknown words', () => {
      const result = engine.alignVocabulary('ROOM');
      expect(result.isKnown).toBe(false);
      expect(result.errorMessage).toContain("don't know the word");
      expect(result.errorMessage).toContain('room');
    });

    it('should identify known words', () => {
      const result = engine.alignVocabulary('LAMP');
      expect(result.isKnown).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return correct error for unknown words', () => {
      const error = engine.getUnknownWordError('unicorn');
      expect(error).toBe('I don\'t know the word "unicorn".');
    });

    it('should return correct error for object not found', () => {
      const error = engine.getObjectNotFoundError('lamp');
      expect(error).toBe("You can't see any lamp here!");
    });
  });

  describe('Unknown Words List', () => {
    it('should correctly identify all explicitly unknown words', () => {
      const unknownWords = ['ROOM', 'AREA', 'PLACE', 'LOCATION', 'SPOT', 'ZONE', 'REGION'];
      
      for (const word of unknownWords) {
        expect(engine.isExplicitlyUnknown(word)).toBe(true);
        expect(engine.isKnownWord(word)).toBe(false);
      }
    });

    it('should allow adding new unknown words', () => {
      expect(engine.isExplicitlyUnknown('FOOBAR')).toBe(false);
      engine.addUnknownWord('FOOBAR');
      expect(engine.isExplicitlyUnknown('FOOBAR')).toBe(true);
    });

    it('should allow removing unknown words', () => {
      expect(engine.isExplicitlyUnknown('ROOM')).toBe(true);
      engine.removeUnknownWord('ROOM');
      expect(engine.isExplicitlyUnknown('ROOM')).toBe(false);
      // Restore for other tests
      engine.addUnknownWord('ROOM');
    });

    it('should return list of unknown words', () => {
      const unknownWords = engine.getUnknownWords();
      expect(unknownWords).toContain('ROOM');
      expect(unknownWords).toContain('AREA');
      expect(Array.isArray(unknownWords)).toBe(true);
    });
  });

  describe('Command Recognition', () => {
    it('should validate commands with all known words', () => {
      const result = engine.validateCommandRecognition('TAKE LAMP');
      expect(result.isValid).toBe(true);
    });

    it('should reject commands with unknown words', () => {
      const result = engine.validateCommandRecognition('EXAMINE ROOM');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("don't know the word");
    });

    it('should handle empty commands', () => {
      const result = engine.validateCommandRecognition('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("I beg your pardon?");
    });

    it('should handle whitespace-only commands', () => {
      const result = engine.validateCommandRecognition('   ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Appropriate Error Selection', () => {
    it('should return unknown word error for unknown words', () => {
      const error = engine.getAppropriateError('ROOM', false);
      expect(error).toContain("don't know the word");
    });

    it('should return object not found error for known words', () => {
      const error = engine.getAppropriateError('LAMP', false);
      expect(error).toContain("can't see");
    });

    it('should return empty string when object is present', () => {
      const error = engine.getAppropriateError('LAMP', true);
      expect(error).toBe('');
    });
  });

  // Feature: comprehensive-parity-analysis, Property 9: Vocabulary Recognition Consistency
  // **Validates: Requirements 4.2**
  describe('Property 9: Vocabulary Recognition Consistency', () => {
    it('should consistently classify known Z-Machine words as known', () => {
      // Generator for known Z-Machine words
      const knownWordGen = fc.constantFrom(
        'LAMP', 'SWORD', 'KNIFE', 'ROPE', 'BOTTLE', 'WATER',
        'FOOD', 'GARLIC', 'BOOK', 'CANDLE', 'MATCH', 'BELL',
        'SHOVEL', 'COAL', 'DIAMOND', 'EMERALD', 'SKULL',
        'CHALICE', 'TRIDENT', 'FIGURINE', 'SCEPTRE', 'BRACELET',
        'NECKLACE', 'PAINTING', 'COFFIN', 'EGG', 'NEST', 'BIRD',
        'THIEF', 'TROLL', 'CYCLOPS', 'HOUSE', 'FOREST', 'TREE',
        'DOOR', 'WINDOW', 'MAILBOX'
      );

      fc.assert(
        fc.property(knownWordGen, (word) => {
          const result = engine.alignVocabulary(word);
          
          // Known words should be recognized
          expect(result.isKnown).toBe(true);
          expect(result.errorMessage).toBeUndefined();
          
          // isKnownWord should also return true
          expect(engine.isKnownWord(word)).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should consistently classify unknown Z-Machine words as unknown', () => {
      // Generator for words NOT in Z-Machine vocabulary
      const unknownWordGen = fc.constantFrom(
        'ROOM', 'AREA', 'PLACE', 'LOCATION', 'SPOT', 'ZONE', 'REGION'
      );

      fc.assert(
        fc.property(unknownWordGen, (word) => {
          const result = engine.alignVocabulary(word);
          
          // Unknown words should not be recognized
          expect(result.isKnown).toBe(false);
          expect(result.errorMessage).toBeDefined();
          expect(result.errorMessage).toContain("don't know the word");
          
          // isKnownWord should return false
          expect(engine.isKnownWord(word)).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should produce correct error message format for unknown words', () => {
      // Generator for various unknown words
      const unknownWordGen = fc.constantFrom(
        'ROOM', 'AREA', 'UNICORN', 'DRAGON', 'WIZARD'
      );

      fc.assert(
        fc.property(unknownWordGen, (word) => {
          const errorMessage = engine.getUnknownWordError(word);
          
          // Error message should follow Z-Machine format
          expect(errorMessage).toMatch(/I don't know the word "[a-z]+"\./);
          expect(errorMessage.toLowerCase()).toContain(word.toLowerCase());
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should produce correct error message format for object not found', () => {
      // Generator for known words
      const knownWordGen = fc.constantFrom(
        'LAMP', 'SWORD', 'BOTTLE', 'KEY', 'COIN'
      );

      fc.assert(
        fc.property(knownWordGen, (word) => {
          const errorMessage = engine.getObjectNotFoundError(word);
          
          // Error message should follow Z-Machine format
          expect(errorMessage).toMatch(/You can't see any [a-z]+ here!/);
          expect(errorMessage.toLowerCase()).toContain(word.toLowerCase());
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should select appropriate error based on word knowledge and object presence', () => {
      // Generator for word/presence combinations
      const wordGen = fc.constantFrom('LAMP', 'ROOM', 'SWORD', 'AREA');
      const presenceGen = fc.boolean();

      fc.assert(
        fc.property(wordGen, presenceGen, (word, isPresent) => {
          const error = engine.getAppropriateError(word, isPresent);
          const isKnown = engine.isKnownWord(word);
          
          if (!isKnown) {
            // Unknown word should always get "don't know" error
            expect(error).toContain("don't know the word");
          } else if (!isPresent) {
            // Known word, not present should get "can't see" error
            expect(error).toContain("can't see");
          } else {
            // Known word, present should get no error
            expect(error).toBe('');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle case-insensitive word recognition', () => {
      // Generator for case variations
      const caseVariationGen = fc.constantFrom(
        'lamp', 'LAMP', 'Lamp', 'LaMp',
        'room', 'ROOM', 'Room', 'RoOm'
      );

      fc.assert(
        fc.property(caseVariationGen, (word) => {
          const upperWord = word.toUpperCase();
          const result = engine.alignVocabulary(word);
          
          // Case should not affect recognition
          if (upperWord === 'LAMP') {
            expect(result.isKnown).toBe(true);
          } else if (upperWord === 'ROOM') {
            expect(result.isKnown).toBe(false);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should validate multi-word commands consistently', () => {
      // Generator for valid commands
      const validCommandGen = fc.constantFrom(
        'TAKE LAMP',
        'EXAMINE SWORD',
        'DROP BOTTLE',
        'OPEN DOOR',
        'CLOSE WINDOW'
      );

      // Generator for invalid commands (containing unknown words)
      const invalidCommandGen = fc.constantFrom(
        'EXAMINE ROOM',
        'GO TO AREA',
        'LOOK AT LOCATION'
      );

      fc.assert(
        fc.property(validCommandGen, (command) => {
          const result = engine.validateCommandRecognition(command);
          expect(result.isValid).toBe(true);
          return true;
        }),
        { numRuns: 100 }
      );

      fc.assert(
        fc.property(invalidCommandGen, (command) => {
          const result = engine.validateCommandRecognition(command);
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toContain("don't know the word");
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: comprehensive-parity-analysis, Property 10: Ambiguity Resolution Alignment
  // **Validates: Requirements 4.5**
  describe('Property 10: Ambiguity Resolution Alignment', () => {
    it('should not detect ambiguity for single candidate', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('LAMP', 'SWORD', 'BOTTLE', 'KEY'),
          (objectName) => {
            const result = engine.resolveAmbiguityExactly(objectName, ['BRASS']);
            expect(result.isAmbiguous).toBe(false);
            expect(result.clarificationMessage).toBeUndefined();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect ambiguity for two candidates with proper Z-Machine format', () => {
      // Generator for object names
      const objectNameGen = fc.constantFrom('LAMP', 'BOX', 'BOTTLE', 'KEY');
      
      // Generator for adjective pairs
      const adjectivePairGen = fc.constantFrom(
        ['BRASS', 'SILVER'],
        ['SMALL', 'LARGE'],
        ['OLD', 'NEW'],
        ['WOODEN', 'METAL']
      );

      fc.assert(
        fc.property(objectNameGen, adjectivePairGen, (objectName, adjectives) => {
          const result = engine.resolveAmbiguityExactly(objectName, adjectives);
          
          // Should detect ambiguity
          expect(result.isAmbiguous).toBe(true);
          
          // Should have clarification message
          expect(result.clarificationMessage).toBeDefined();
          
          // Message should follow Z-Machine format for 2 candidates
          // "Which [object] do you mean, the [adj1] or the [adj2]?"
          expect(result.clarificationMessage).toContain('Which');
          expect(result.clarificationMessage?.toLowerCase()).toContain(objectName.toLowerCase());
          expect(result.clarificationMessage?.toLowerCase()).toContain(adjectives[0].toLowerCase());
          expect(result.clarificationMessage?.toLowerCase()).toContain(adjectives[1].toLowerCase());
          expect(result.clarificationMessage).toContain(' or ');
          
          // Should have candidates
          expect(result.candidates).toEqual(adjectives);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should detect ambiguity for more than two candidates', () => {
      // Generator for object names
      const objectNameGen = fc.constantFrom('LAMP', 'BOX', 'BOTTLE');
      
      // Generator for multiple adjectives
      const multiAdjectiveGen = fc.constantFrom(
        ['BRASS', 'SILVER', 'GOLD'],
        ['SMALL', 'MEDIUM', 'LARGE'],
        ['RED', 'GREEN', 'BLUE', 'YELLOW']
      );

      fc.assert(
        fc.property(objectNameGen, multiAdjectiveGen, (objectName, adjectives) => {
          const result = engine.resolveAmbiguityExactly(objectName, adjectives);
          
          // Should detect ambiguity
          expect(result.isAmbiguous).toBe(true);
          
          // Should have clarification message
          expect(result.clarificationMessage).toBeDefined();
          
          // Message should follow Z-Machine format for 3+ candidates
          // "Which [object] do you mean?"
          expect(result.clarificationMessage).toContain('Which');
          expect(result.clarificationMessage?.toLowerCase()).toContain(objectName.toLowerCase());
          
          // Should have all candidates
          expect(result.candidates).toEqual(adjectives);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty candidates list', () => {
      const result = engine.resolveAmbiguityExactly('LAMP', []);
      expect(result.isAmbiguous).toBe(false);
    });
  });

  // Feature: comprehensive-parity-analysis, Property 10 (continued): Syntax Validation Alignment
  describe('Syntax Validation Alignment', () => {
    it('should validate verbs that require objects', () => {
      // Generator for verbs that require objects
      const verbRequiringObjectGen = fc.constantFrom(
        'TAKE', 'DROP', 'PUT', 'EXAMINE', 'OPEN', 'CLOSE', 'READ', 'ATTACK', 'GIVE'
      );

      fc.assert(
        fc.property(verbRequiringObjectGen, (verb) => {
          // Without object should be invalid
          const resultNoObject = engine.alignSyntaxValidation(verb, false, false);
          expect(resultNoObject.isValid).toBe(false);
          expect(resultNoObject.errorType).toBe('MISSING_NOUN');
          expect(resultNoObject.errorMessage).toContain('What do you want to');
          
          // With object should be valid (for most verbs)
          if (!['PUT', 'PLACE', 'INSERT'].includes(verb.toUpperCase())) {
            const resultWithObject = engine.alignSyntaxValidation(verb, true, false);
            expect(resultWithObject.isValid).toBe(true);
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should validate PUT/PLACE/INSERT require indirect object', () => {
      const putVerbGen = fc.constantFrom('PUT', 'PLACE', 'INSERT');

      fc.assert(
        fc.property(putVerbGen, (verb) => {
          // With direct object but no indirect object should be invalid
          const result = engine.alignSyntaxValidation(verb, true, false);
          expect(result.isValid).toBe(false);
          expect(result.errorType).toBe('INCOMPLETE_COMMAND');
          expect(result.errorMessage).toContain('Where');
          
          // With both objects should be valid
          const resultComplete = engine.alignSyntaxValidation(verb, true, true);
          expect(resultComplete.isValid).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should produce correct missing noun error messages', () => {
      // Generator for verb/expected message pairs
      const verbMessageGen = fc.constantFrom(
        { verb: 'DROP', expected: 'drop' },
        { verb: 'TAKE', expected: 'take' },
        { verb: 'EXAMINE', expected: 'examine' },
        { verb: 'OPEN', expected: 'open' },
        { verb: 'CLOSE', expected: 'close' },
        { verb: 'READ', expected: 'read' },
        { verb: 'ATTACK', expected: 'attack' },
        { verb: 'GIVE', expected: 'give' }
      );

      fc.assert(
        fc.property(verbMessageGen, ({ verb, expected }) => {
          const errorMessage = engine.getMissingNounError(verb);
          
          // Should follow Z-Machine format
          expect(errorMessage).toMatch(/What do you want to \w+\?/);
          expect(errorMessage.toLowerCase()).toContain(expected);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify verbs requiring objects', () => {
      const verbsRequiringObject = [
        'TAKE', 'DROP', 'PUT', 'EXAMINE', 'OPEN', 'CLOSE', 'READ', 'ATTACK'
      ];
      
      const verbsNoObject = [
        'LOOK', 'INVENTORY', 'WAIT', 'NORTH', 'SOUTH', 'QUIT', 'SCORE'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...verbsRequiringObject), (verb) => {
          expect(engine.verbRequiresObject(verb)).toBe(true);
          return true;
        }),
        { numRuns: 100 }
      );

      fc.assert(
        fc.property(fc.constantFrom(...verbsNoObject), (verb) => {
          expect(engine.verbAllowsNoObject(verb)).toBe(true);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle case-insensitive verb checking', () => {
      const caseVariationGen = fc.constantFrom(
        'take', 'TAKE', 'Take', 'TaKe',
        'drop', 'DROP', 'Drop', 'DrOp'
      );

      fc.assert(
        fc.property(caseVariationGen, (verb) => {
          // All case variations should be recognized as requiring object
          expect(engine.verbRequiresObject(verb)).toBe(true);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: comprehensive-parity-analysis, Property 11: Edge Case Handling Uniformity
  // **Validates: Requirements 3.5, 4.4**
  describe('Property 11: Edge Case Handling Uniformity', () => {
    it('should handle empty input consistently', () => {
      const emptyInputGen = fc.constantFrom('', '   ', '\t', '\n', '  \t  ');

      fc.assert(
        fc.property(emptyInputGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(true);
          expect(result.edgeCaseType).toBe('EMPTY_INPUT');
          expect(result.errorMessage).toBe("I beg your pardon?");
          expect(result.shouldContinueParsing).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle excessive length consistently', () => {
      // Generate commands with more than 20 words
      const longCommandGen = fc.array(
        fc.constantFrom('TAKE', 'DROP', 'LOOK', 'EXAMINE', 'OPEN', 'CLOSE'),
        { minLength: 21, maxLength: 30 }
      ).map(words => words.join(' '));

      fc.assert(
        fc.property(longCommandGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(true);
          expect(result.edgeCaseType).toBe('EXCESSIVE_LENGTH');
          expect(result.errorMessage).toBe("I don't understand that sentence.");
          expect(result.shouldContinueParsing).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle repeated words consistently', () => {
      // Generate commands with excessive repetition
      const repeatedWordGen = fc.constantFrom(
        'TAKE TAKE TAKE TAKE LAMP',
        'DROP DROP DROP DROP SWORD',
        'LOOK LOOK LOOK LOOK LOOK'
      );

      fc.assert(
        fc.property(repeatedWordGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(true);
          expect(result.edgeCaseType).toBe('REPEATED_WORDS');
          expect(result.errorMessage).toBe("I don't understand that sentence.");
          expect(result.shouldContinueParsing).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle numeric input consistently', () => {
      const numericInputGen = fc.integer({ min: 0, max: 999999 }).map(n => n.toString());

      fc.assert(
        fc.property(numericInputGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(true);
          expect(result.edgeCaseType).toBe('NUMERIC_INPUT');
          expect(result.errorMessage).toBe("I don't understand that sentence.");
          expect(result.shouldContinueParsing).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle special characters consistently', () => {
      const specialCharGen = fc.constantFrom(
        'TAKE @LAMP',
        'DROP #SWORD',
        'LOOK $HERE',
        'EXAMINE %ROOM',
        'OPEN ^DOOR',
        'CLOSE &WINDOW',
        'READ *BOOK'
      );

      fc.assert(
        fc.property(specialCharGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(true);
          expect(result.edgeCaseType).toBe('SPECIAL_CHARACTERS');
          expect(result.errorMessage).toBe("I don't understand that sentence.");
          expect(result.shouldContinueParsing).toBe(false);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should allow valid commands to continue parsing', () => {
      const validCommandGen = fc.constantFrom(
        'TAKE LAMP',
        'DROP SWORD',
        'LOOK',
        'EXAMINE MAILBOX',
        'OPEN DOOR',
        'CLOSE WINDOW',
        'GO NORTH',
        'PUT LAMP IN CASE'
      );

      fc.assert(
        fc.property(validCommandGen, (input) => {
          const result = engine.handleParserEdgeCases(input);
          
          expect(result.isEdgeCase).toBe(false);
          expect(result.shouldContinueParsing).toBe(true);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should normalize input consistently', () => {
      const inputVariationGen = fc.constantFrom(
        { input: '  TAKE LAMP  ', expected: 'TAKE LAMP' },
        { input: 'take lamp', expected: 'TAKE LAMP' },
        { input: 'TAKE  LAMP', expected: 'TAKE LAMP' },
        { input: 'TAKE LAMP.', expected: 'TAKE LAMP' },
        { input: 'TAKE LAMP!', expected: 'TAKE LAMP' },
        { input: 'TAKE LAMP?', expected: 'TAKE LAMP' }
      );

      fc.assert(
        fc.property(inputVariationGen, ({ input, expected }) => {
          const result = engine.normalizeInput(input);
          
          expect(result.error).toBeUndefined();
          expect(result.normalized).toBe(expected);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should return error for edge case inputs during normalization', () => {
      const edgeCaseInputGen = fc.constantFrom(
        '',
        '   ',
        '12345',
        'TAKE @LAMP'
      );

      fc.assert(
        fc.property(edgeCaseInputGen, (input) => {
          const result = engine.normalizeInput(input);
          
          expect(result.error).toBeDefined();
          expect(result.normalized).toBe('');
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should get correct edge case error messages', () => {
      const edgeCaseTypeGen = fc.constantFrom(
        { type: 'EMPTY_INPUT', expected: "I beg your pardon?" },
        { type: 'REPEATED_WORDS', expected: "I don't understand that sentence." },
        { type: 'EXCESSIVE_LENGTH', expected: "I don't understand that sentence." },
        { type: 'NUMERIC_INPUT', expected: "I don't understand that sentence." },
        { type: 'SPECIAL_CHARACTERS', expected: "I don't understand that sentence." }
      );

      fc.assert(
        fc.property(edgeCaseTypeGen, ({ type, expected }) => {
          const error = engine.getEdgeCaseError(type);
          expect(error).toBe(expected);
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});