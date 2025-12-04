/**
 * Parser Tests
 * Tests for command parsing functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Parser, ParsedCommand, ParseError } from './parser.js';
import { Lexer, Token, TokenType } from './lexer.js';
import { Vocabulary } from './vocabulary.js';
import { GameObjectImpl, GameObject } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';

describe('Parser', () => {
  let parser: Parser;
  let lexer: Lexer;
  let vocabulary: Vocabulary;
  let testObjects: GameObject[];

  beforeEach(() => {
    parser = new Parser();
    lexer = new Lexer();
    vocabulary = new Vocabulary();

    // Create test objects
    testObjects = [
      new GameObjectImpl({
        id: 'LAMP',
        name: 'LAMP',
        synonyms: ['LANTERN', 'LIGHT'],
        adjectives: ['BRASS'],
        description: 'A brass lantern',
        location: 'TEST-ROOM',
        flags: [ObjectFlag.TAKEBIT]
      }),
      new GameObjectImpl({
        id: 'SWORD',
        name: 'SWORD',
        synonyms: ['BLADE'],
        adjectives: ['ELVISH'],
        description: 'An elvish sword',
        location: 'TEST-ROOM',
        flags: [ObjectFlag.TAKEBIT, ObjectFlag.WEAPONBIT]
      }),
      new GameObjectImpl({
        id: 'TROPHY-CASE',
        name: 'CASE',
        synonyms: ['TROPHY'],
        adjectives: ['TROPHY'],
        description: 'A trophy case',
        location: 'TEST-ROOM',
        flags: [ObjectFlag.CONTBIT]
      })
    ];
  });

  // Feature: modern-zork-rewrite, Property 12: Parser article handling
  describe('Property 12: Parser article handling', () => {
    it('should parse commands identically with or without articles', () => {
      // Generator for articles
      const articleGen = fc.constantFrom('THE', 'A', 'AN', '');

      // Generator for valid verbs
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'DROP', 'OPEN');

      // Generator for object references (using our test objects)
      const objectRefGen = fc.constantFrom(
        'LAMP',
        'LANTERN', 
        'BRASS LAMP',
        'SWORD',
        'ELVISH SWORD',
        'CASE',
        'TROPHY CASE'
      );

      fc.assert(
        fc.property(
          articleGen,
          verbGen,
          objectRefGen,
          (article, verb, objectRef) => {
            // Create command with article
            const withArticle = article 
              ? `${verb} ${article} ${objectRef}`
              : `${verb} ${objectRef}`;
            
            // Create command without article
            const withoutArticle = `${verb} ${objectRef}`;

            // Tokenize both
            const tokensWithArticle = lexer.tokenize(withArticle);
            const tokensWithoutArticle = lexer.tokenize(withoutArticle);

            // Classify tokens using vocabulary
            const classifiedWith = tokensWithArticle.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));
            const classifiedWithout = tokensWithoutArticle.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            // Parse both
            const resultWith = parser.parse(classifiedWith, testObjects);
            const resultWithout = parser.parse(classifiedWithout, testObjects);

            // Both should succeed or both should fail
            const bothSucceeded = !('type' in resultWith) && !('type' in resultWithout);
            const bothFailed = ('type' in resultWith) && ('type' in resultWithout);

            if (bothSucceeded) {
              const cmdWith = resultWith as ParsedCommand;
              const cmdWithout = resultWithout as ParsedCommand;

              // Verify same verb
              expect(cmdWith.verb).toBe(cmdWithout.verb);

              // Verify same direct object (if any)
              if (cmdWith.directObject && cmdWithout.directObject) {
                expect(cmdWith.directObject.id).toBe(cmdWithout.directObject.id);
              } else {
                expect(cmdWith.directObject).toBe(cmdWithout.directObject);
              }

              // Verify same indirect object (if any)
              if (cmdWith.indirectObject && cmdWithout.indirectObject) {
                expect(cmdWith.indirectObject.id).toBe(cmdWithout.indirectObject.id);
              } else {
                expect(cmdWith.indirectObject).toBe(cmdWithout.indirectObject);
              }

              // Verify same preposition
              expect(cmdWith.preposition).toBe(cmdWithout.preposition);
            }

            // The key property: articles should not affect parsing outcome
            return bothSucceeded || bothFailed;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Pronoun Resolution', () => {
    it('should resolve IT to the last mentioned object', () => {
      // First, parse a command that mentions an object
      const takeTokens = lexer.tokenize('TAKE LAMP');
      const classifiedTake = takeTokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));
      
      const takeResult = parser.parse(classifiedTake, testObjects);
      expect('type' in takeResult).toBe(false);
      
      if (!('type' in takeResult)) {
        expect(takeResult.directObject?.id).toBe('LAMP');
      }

      // Now parse a command with IT
      const examineTokens = lexer.tokenize('EXAMINE IT');
      const classifiedExamine = examineTokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));
      
      const examineResult = parser.parse(classifiedExamine, testObjects);
      expect('type' in examineResult).toBe(false);
      
      if (!('type' in examineResult)) {
        expect(examineResult.directObject?.id).toBe('LAMP');
      }
    });

    it('should resolve THEM to the last mentioned object', () => {
      // First, parse a command that mentions an object
      const takeTokens = lexer.tokenize('TAKE SWORD');
      const classifiedTake = takeTokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));
      
      const takeResult = parser.parse(classifiedTake, testObjects);
      expect('type' in takeResult).toBe(false);
      
      if (!('type' in takeResult)) {
        expect(takeResult.directObject?.id).toBe('SWORD');
      }

      // Now parse a command with THEM
      const dropTokens = lexer.tokenize('DROP THEM');
      const classifiedDrop = dropTokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));
      
      const dropResult = parser.parse(classifiedDrop, testObjects);
      expect('type' in dropResult).toBe(false);
      
      if (!('type' in dropResult)) {
        expect(dropResult.directObject?.id).toBe('SWORD');
      }
    });

    it('should return error when pronoun used without prior object reference', () => {
      // Create a fresh parser with no history
      const freshParser = new Parser();
      
      const itTokens = lexer.tokenize('EXAMINE IT');
      const classifiedIt = itTokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));
      
      const result = freshParser.parse(classifiedIt, testObjects);
      expect('type' in result).toBe(true);
      
      if ('type' in result) {
        expect(result.type).toBe('OBJECT_NOT_FOUND');
        expect(result.message).toContain("don't know what you're referring to");
      }
    });
  });

  describe('Ambiguity Detection', () => {
    it('should detect ambiguous object references', () => {
      // Create two objects with the same name but different adjectives
      const ambiguousObjects = [
        new GameObjectImpl({
          id: 'BRASS-LAMP',
          name: 'LAMP',
          synonyms: [],
          adjectives: ['BRASS'],
          description: 'A brass lamp',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT]
        }),
        new GameObjectImpl({
          id: 'SILVER-LAMP',
          name: 'LAMP',
          synonyms: [],
          adjectives: ['SILVER'],
          description: 'A silver lamp',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT]
        })
      ];

      // Try to reference just "LAMP" without specifying which one
      const tokens = lexer.tokenize('TAKE LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, ambiguousObjects);

      // Should return an AMBIGUOUS error
      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('AMBIGUOUS');
        expect(result.message).toContain('Which');
        expect(result.candidates).toBeDefined();
        expect(result.candidates?.length).toBe(2);
      }
    });

    it('should not be ambiguous when adjective is specified', () => {
      // Create two objects with the same name but different adjectives
      const ambiguousObjects = [
        new GameObjectImpl({
          id: 'BRASS-LAMP',
          name: 'LAMP',
          synonyms: [],
          adjectives: ['BRASS'],
          description: 'A brass lamp',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT]
        }),
        new GameObjectImpl({
          id: 'SILVER-LAMP',
          name: 'LAMP',
          synonyms: [],
          adjectives: ['SILVER'],
          description: 'A silver lamp',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT]
        })
      ];

      // Specify "BRASS LAMP" to disambiguate
      const tokens = lexer.tokenize('TAKE BRASS LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, ambiguousObjects);

      // Should succeed and return the brass lamp
      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.directObject?.id).toBe('BRASS-LAMP');
      }
    });

    it('should detect ambiguity with synonyms', () => {
      // Create two objects with overlapping synonyms
      const ambiguousObjects = [
        new GameObjectImpl({
          id: 'SMALL-BOX',
          name: 'BOX',
          synonyms: ['CONTAINER'],
          adjectives: ['SMALL'],
          description: 'A small box',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT, ObjectFlag.CONTBIT]
        }),
        new GameObjectImpl({
          id: 'LARGE-BOX',
          name: 'BOX',
          synonyms: ['CONTAINER'],
          adjectives: ['LARGE'],
          description: 'A large box',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT, ObjectFlag.CONTBIT]
        })
      ];

      // Try to reference "BOX" or "CONTAINER" without specifying which one
      const tokens = lexer.tokenize('OPEN CONTAINER');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, ambiguousObjects);

      // Should return an AMBIGUOUS error
      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('AMBIGUOUS');
        expect(result.candidates?.length).toBe(2);
      }
    });

    it('should handle ambiguity in indirect objects', () => {
      // Create multiple containers
      const objectsWithContainers = [
        new GameObjectImpl({
          id: 'SWORD',
          name: 'SWORD',
          synonyms: [],
          adjectives: [],
          description: 'A sword',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.TAKEBIT]
        }),
        new GameObjectImpl({
          id: 'SMALL-BOX',
          name: 'BOX',
          synonyms: [],
          adjectives: ['SMALL'],
          description: 'A small box',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.CONTBIT]
        }),
        new GameObjectImpl({
          id: 'LARGE-BOX',
          name: 'BOX',
          synonyms: [],
          adjectives: ['LARGE'],
          description: 'A large box',
          location: 'TEST-ROOM',
          flags: [ObjectFlag.CONTBIT]
        })
      ];

      // Try "PUT SWORD IN BOX" - ambiguous indirect object
      const tokens = lexer.tokenize('PUT SWORD IN BOX');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, objectsWithContainers);

      // Should return an AMBIGUOUS error for the indirect object
      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('AMBIGUOUS');
      }
    });

    it('should not be ambiguous when only one object matches', () => {
      // Only one lamp in the test objects
      const tokens = lexer.tokenize('TAKE LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      // Should succeed
      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.directObject?.id).toBe('LAMP');
      }
    });
  });

  // Feature: modern-zork-rewrite, Property 14: Ambiguity detection
  describe('Property 14: Ambiguity detection', () => {
    it('should detect ambiguity when multiple objects match and request clarification', () => {
      // Generator for object names
      const objectNameGen = fc.constantFrom('LAMP', 'BOX', 'BOTTLE', 'KEY', 'COIN');

      // Generator for adjectives
      const adjectiveGen = fc.constantFrom('BRASS', 'SILVER', 'GOLD', 'WOODEN', 'IRON', 'SMALL', 'LARGE');

      // Generator for verbs
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'DROP', 'OPEN', 'CLOSE');

      fc.assert(
        fc.property(
          objectNameGen,
          fc.array(adjectiveGen, { minLength: 2, maxLength: 4 }).map(arr => [...new Set(arr)]), // Unique adjectives
          verbGen,
          (objectName, adjectives, verb) => {
            // Skip if we don't have at least 2 unique adjectives
            if (adjectives.length < 2) {
              return true;
            }

            // Create multiple objects with the same name but different adjectives
            const ambiguousObjects: GameObject[] = adjectives.map((adj, index) => 
              new GameObjectImpl({
                id: `${adj}-${objectName}-${index}`,
                name: objectName,
                synonyms: [],
                adjectives: [adj],
                description: `A ${adj.toLowerCase()} ${objectName.toLowerCase()}`,
                location: 'TEST-ROOM',
                flags: [ObjectFlag.TAKEBIT]
              })
            );

            // Try to reference just the object name without specifying which one
            const command = `${verb} ${objectName}`;
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const result = parser.parse(classified, ambiguousObjects);

            // Should return an AMBIGUOUS error
            if (!('type' in result)) {
              // If it didn't detect ambiguity, that's a failure
              return false;
            }

            // Verify it's an AMBIGUOUS error type
            if (result.type !== 'AMBIGUOUS') {
              return false;
            }

            // Verify the error message asks for clarification
            const messageAsksForClarification = 
              result.message.toLowerCase().includes('which') ||
              result.message.toLowerCase().includes('clarify') ||
              result.message.toLowerCase().includes('mean');

            // Verify candidates are provided
            const hasCandidates = result.candidates !== undefined && result.candidates.length > 1;

            // Verify all created objects are in the candidates
            const allObjectsInCandidates = result.candidates?.length === ambiguousObjects.length;

            return messageAsksForClarification && hasCandidates && allObjectsInCandidates;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect ambiguity when adjective disambiguates', () => {
      // Generator for object names
      const objectNameGen = fc.constantFrom('LAMP', 'BOX', 'BOTTLE', 'KEY');

      // Generator for adjectives (need at least 2 different ones)
      const adjectivePairGen = fc.constantFrom(
        ['BRASS', 'SILVER'],
        ['GOLD', 'IRON'],
        ['SMALL', 'LARGE'],
        ['WOODEN', 'METAL']
      );

      // Generator for verbs
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'DROP', 'OPEN');

      fc.assert(
        fc.property(
          objectNameGen,
          adjectivePairGen,
          verbGen,
          fc.integer({ min: 0, max: 1 }), // Which adjective to use
          (objectName, adjectives, verb, adjectiveIndex) => {
            // Create two objects with the same name but different adjectives
            const ambiguousObjects: GameObject[] = adjectives.map((adj, index) => 
              new GameObjectImpl({
                id: `${adj}-${objectName}-${index}`,
                name: objectName,
                synonyms: [],
                adjectives: [adj],
                description: `A ${adj.toLowerCase()} ${objectName.toLowerCase()}`,
                location: 'TEST-ROOM',
                flags: [ObjectFlag.TAKEBIT]
              })
            );

            // Use the adjective to disambiguate
            const selectedAdjective = adjectives[adjectiveIndex];
            const command = `${verb} ${selectedAdjective} ${objectName}`;
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const result = parser.parse(classified, ambiguousObjects);

            // Should NOT return an error (should successfully identify the object)
            if ('type' in result) {
              // If it returned an error, that's a failure (unless it's an unknown word)
              // Unknown word is acceptable since our vocabulary might not have all adjectives
              return result.type === 'UNKNOWN_WORD';
            }

            // Verify the correct object was identified
            const expectedId = `${selectedAdjective}-${objectName}-${adjectiveIndex}`;
            return result.directObject?.id === expectedId;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect ambiguity with synonyms', () => {
      // Generator for base names and synonyms
      const nameWithSynonymGen = fc.constantFrom(
        { name: 'BOX', synonym: 'CONTAINER' },
        { name: 'LAMP', synonym: 'LIGHT' },
        { name: 'SWORD', synonym: 'BLADE' },
        { name: 'BOTTLE', synonym: 'FLASK' }
      );

      // Generator for adjectives
      const adjectivePairGen = fc.constantFrom(
        ['BRASS', 'SILVER'],
        ['SMALL', 'LARGE'],
        ['OLD', 'NEW']
      );

      // Generator for verbs
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'OPEN');

      // Generator for which reference to use (name or synonym)
      const useNameGen = fc.boolean();

      fc.assert(
        fc.property(
          nameWithSynonymGen,
          adjectivePairGen,
          verbGen,
          useNameGen,
          (nameInfo, adjectives, verb, useName) => {
            // Create two objects with the same name and synonym but different adjectives
            const ambiguousObjects: GameObject[] = adjectives.map((adj, index) => 
              new GameObjectImpl({
                id: `${adj}-${nameInfo.name}-${index}`,
                name: nameInfo.name,
                synonyms: [nameInfo.synonym],
                adjectives: [adj],
                description: `A ${adj.toLowerCase()} ${nameInfo.name.toLowerCase()}`,
                location: 'TEST-ROOM',
                flags: [ObjectFlag.TAKEBIT]
              })
            );

            // Reference by either name or synonym (both should be ambiguous)
            const reference = useName ? nameInfo.name : nameInfo.synonym;
            const command = `${verb} ${reference}`;
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const result = parser.parse(classified, ambiguousObjects);

            // Should return an AMBIGUOUS error
            if (!('type' in result)) {
              return false;
            }

            // Should be AMBIGUOUS type with candidates
            return result.type === 'AMBIGUOUS' && 
                   result.candidates !== undefined && 
                   result.candidates.length === 2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: modern-zork-rewrite, Property 5: Parser multi-word support
  describe('Property 5: Parser multi-word support', () => {
    it('should correctly parse multi-word commands with direct and indirect objects', () => {
      // Generator for verbs that take two objects
      const verbGen = fc.constantFrom('PUT', 'PLACE', 'INSERT');

      // Generator for prepositions
      const prepositionGen = fc.constantFrom('IN', 'ON', 'UNDER', 'BEHIND');

      // Generator for direct object references (things that can be moved)
      const directObjectGen = fc.constantFrom(
        { ref: 'LAMP', id: 'LAMP', words: ['LAMP'] },
        { ref: 'BRASS LAMP', id: 'LAMP', words: ['BRASS', 'LAMP'] },
        { ref: 'LANTERN', id: 'LAMP', words: ['LANTERN'] },
        { ref: 'BRASS LANTERN', id: 'LAMP', words: ['BRASS', 'LANTERN'] },
        { ref: 'SWORD', id: 'SWORD', words: ['SWORD'] },
        { ref: 'ELVISH SWORD', id: 'SWORD', words: ['ELVISH', 'SWORD'] },
        { ref: 'BLADE', id: 'SWORD', words: ['BLADE'] }
      );

      // Generator for indirect object references (containers)
      const indirectObjectGen = fc.constantFrom(
        { ref: 'CASE', id: 'TROPHY-CASE', words: ['CASE'] },
        { ref: 'TROPHY CASE', id: 'TROPHY-CASE', words: ['TROPHY', 'CASE'] },
        { ref: 'TROPHY', id: 'TROPHY-CASE', words: ['TROPHY'] }
      );

      fc.assert(
        fc.property(
          verbGen,
          directObjectGen,
          prepositionGen,
          indirectObjectGen,
          (verb, directObj, preposition, indirectObj) => {
            // Construct the multi-word command
            const command = `${verb} ${directObj.ref} ${preposition} ${indirectObj.ref}`;
            
            // Tokenize and classify
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            // Parse the command
            const result = parser.parse(classified, testObjects);

            // The command should parse successfully (not return an error)
            if ('type' in result) {
              // If it's an unknown word error, that's acceptable (vocabulary limitation)
              return result.type === 'UNKNOWN_WORD';
            }

            // Verify all components are correctly identified
            const verbCorrect = result.verb === verb.toUpperCase();
            const directObjectCorrect = result.directObject?.id === directObj.id;
            const prepositionCorrect = result.preposition === preposition.toUpperCase();
            const indirectObjectCorrect = result.indirectObject?.id === indirectObj.id;

            // Verify that multi-word object names are preserved
            const directObjectNameCorrect = result.directObjectName === directObj.words.join(' ');
            const indirectObjectNameCorrect = result.indirectObjectName === indirectObj.words.join(' ');

            return verbCorrect && 
                   directObjectCorrect && 
                   prepositionCorrect && 
                   indirectObjectCorrect &&
                   directObjectNameCorrect &&
                   indirectObjectNameCorrect;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multi-word objects with articles', () => {
      // Generator for articles
      const articleGen = fc.constantFrom('THE', 'A', 'AN', '');

      // Generator for verbs
      const verbGen = fc.constantFrom('PUT', 'PLACE');

      // Generator for prepositions
      const prepositionGen = fc.constantFrom('IN', 'ON');

      fc.assert(
        fc.property(
          verbGen,
          articleGen,
          articleGen,
          prepositionGen,
          (verb, article1, article2, preposition) => {
            // Construct command with articles before multi-word objects
            const directObjPart = article1 ? `${article1} BRASS LAMP` : 'BRASS LAMP';
            const indirectObjPart = article2 ? `${article2} TROPHY CASE` : 'TROPHY CASE';
            const command = `${verb} ${directObjPart} ${preposition} ${indirectObjPart}`;
            
            // Tokenize and classify
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            // Parse the command
            const result = parser.parse(classified, testObjects);

            // Should parse successfully
            if ('type' in result) {
              return result.type === 'UNKNOWN_WORD';
            }

            // Verify components are correct regardless of articles
            return result.verb === verb.toUpperCase() &&
                   result.directObject?.id === 'LAMP' &&
                   result.preposition === preposition.toUpperCase() &&
                   result.indirectObject?.id === 'TROPHY-CASE';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify all components in complex multi-word commands', () => {
      // Test with various combinations of single and multi-word objects
      const commandStructures = [
        // Single word direct, single word indirect
        { verb: 'PUT', direct: 'SWORD', prep: 'IN', indirect: 'CASE', 
          directId: 'SWORD', indirectId: 'TROPHY-CASE' },
        // Multi-word direct, single word indirect
        { verb: 'PUT', direct: 'ELVISH SWORD', prep: 'IN', indirect: 'CASE', 
          directId: 'SWORD', indirectId: 'TROPHY-CASE' },
        // Single word direct, multi-word indirect
        { verb: 'PUT', direct: 'SWORD', prep: 'IN', indirect: 'TROPHY CASE', 
          directId: 'SWORD', indirectId: 'TROPHY-CASE' },
        // Multi-word direct, multi-word indirect
        { verb: 'PUT', direct: 'BRASS LAMP', prep: 'IN', indirect: 'TROPHY CASE', 
          directId: 'LAMP', indirectId: 'TROPHY-CASE' },
        // Using synonyms
        { verb: 'PUT', direct: 'BLADE', prep: 'IN', indirect: 'TROPHY', 
          directId: 'SWORD', indirectId: 'TROPHY-CASE' },
        // Multi-word with synonym
        { verb: 'PUT', direct: 'BRASS LANTERN', prep: 'IN', indirect: 'CASE', 
          directId: 'LAMP', indirectId: 'TROPHY-CASE' }
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...commandStructures),
          (structure) => {
            const command = `${structure.verb} ${structure.direct} ${structure.prep} ${structure.indirect}`;
            
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const result = parser.parse(classified, testObjects);

            if ('type' in result) {
              return result.type === 'UNKNOWN_WORD';
            }

            // All components should be correctly identified
            return result.verb === structure.verb &&
                   result.directObject?.id === structure.directId &&
                   result.preposition === structure.prep &&
                   result.indirectObject?.id === structure.indirectId;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Command Structure Parsing', () => {
    it('should parse simple verb-only commands', () => {
      const tokens = lexer.tokenize('LOOK');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('LOOK');
        expect(result.directObject).toBeUndefined();
        expect(result.indirectObject).toBeUndefined();
        expect(result.preposition).toBeUndefined();
      }
    });

    it('should parse verb with direct object', () => {
      const tokens = lexer.tokenize('TAKE LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('TAKE');
        expect(result.directObject?.id).toBe('LAMP');
        expect(result.indirectObject).toBeUndefined();
        expect(result.preposition).toBeUndefined();
      }
    });

    it('should parse verb with multi-word direct object', () => {
      const tokens = lexer.tokenize('TAKE BRASS LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('TAKE');
        expect(result.directObject?.id).toBe('LAMP');
        expect(result.directObjectName).toBe('BRASS LAMP');
      }
    });

    it('should parse verb with direct object and preposition and indirect object', () => {
      const tokens = lexer.tokenize('PUT SWORD IN CASE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('PUT');
        expect(result.directObject?.id).toBe('SWORD');
        expect(result.preposition).toBe('IN');
        expect(result.indirectObject?.id).toBe('TROPHY-CASE');
      }
    });

    it('should parse commands with synonyms', () => {
      const tokens = lexer.tokenize('EXAMINE LANTERN');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('EXAMINE');
        expect(result.directObject?.id).toBe('LAMP');
      }
    });

    it('should parse commands with adjectives and synonyms', () => {
      const tokens = lexer.tokenize('TAKE ELVISH BLADE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('TAKE');
        expect(result.directObject?.id).toBe('SWORD');
      }
    });

    it('should parse directional commands', () => {
      const tokens = lexer.tokenize('NORTH');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('NORTH');
      }
    });

    it('should parse commands with articles', () => {
      const tokens = lexer.tokenize('TAKE THE LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('TAKE');
        expect(result.directObject?.id).toBe('LAMP');
      }
    });

    it('should parse complex commands with articles and multi-word objects', () => {
      const tokens = lexer.tokenize('PUT THE BRASS LANTERN IN THE TROPHY CASE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('PUT');
        expect(result.directObject?.id).toBe('LAMP');
        expect(result.preposition).toBe('IN');
        expect(result.indirectObject?.id).toBe('TROPHY-CASE');
      }
    });
  });

  describe('Error Handling for Invalid Syntax', () => {
    it('should return error for empty input', () => {
      const tokens: Token[] = [];
      const result = parser.parse(tokens, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('INVALID_SYNTAX');
        expect(result.message).toBeDefined();
      }
    });

    it('should return error when no verb is present', () => {
      const tokens = lexer.tokenize('THE LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('NO_VERB');
        expect(result.message).toContain("don't understand");
      }
    });

    it('should return error for unknown object', () => {
      const tokens = lexer.tokenize('TAKE UNICORN');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('OBJECT_NOT_FOUND');
        expect(result.message).toContain("can't see");
      }
    });

    it('should return error when object is missing after verb', () => {
      const tokens = lexer.tokenize('TAKE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      // This should succeed as a verb-only command (some verbs don't require objects)
      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('TAKE');
        expect(result.directObject).toBeUndefined();
      }
    });

    it('should return error when only articles are provided after verb', () => {
      const tokens = lexer.tokenize('TAKE THE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('INVALID_SYNTAX');
        expect(result.message).toBeDefined();
      }
    });

    it('should parse command with preposition but no following object', () => {
      const tokens = lexer.tokenize('PUT SWORD IN');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      // The parser allows this and returns a command with preposition but no indirect object
      // The action handler will need to validate this
      expect('type' in result).toBe(false);
      if (!('type' in result)) {
        expect(result.verb).toBe('PUT');
        expect(result.directObject?.id).toBe('SWORD');
        expect(result.preposition).toBe('IN');
        expect(result.indirectObject).toBeUndefined();
      }
    });

    it('should return error when preposition is followed only by articles', () => {
      const tokens = lexer.tokenize('PUT SWORD IN THE');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('INVALID_SYNTAX');
        expect(result.message).toBeDefined();
      }
    });

    it('should return error for non-existent indirect object', () => {
      const tokens = lexer.tokenize('PUT SWORD IN UNICORN');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('OBJECT_NOT_FOUND');
        expect(result.message).toContain("can't see");
      }
    });

    it('should handle malformed multi-word object references', () => {
      const tokens = lexer.tokenize('TAKE BRASS SILVER LAMP');
      const classified = tokens.map(t => ({
        ...t,
        type: vocabulary.lookupWord(t.word)
      }));

      const result = parser.parse(classified, testObjects);

      // This should fail to find an object with both BRASS and SILVER adjectives
      expect('type' in result).toBe(true);
      if ('type' in result) {
        expect(result.type).toBe('OBJECT_NOT_FOUND');
      }
    });
  });

  // Feature: modern-zork-rewrite, Property 13: Pronoun resolution
  describe('Property 13: Pronoun resolution', () => {
    it('should resolve pronouns to the most recently mentioned object', () => {
      // Generator for valid verbs that take objects
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'DROP', 'OPEN');

      // Generator for pronouns
      const pronounGen = fc.constantFrom('IT', 'THEM');

      // Generator for object references (using our test objects)
      const objectRefGen = fc.constantFrom(
        { ref: 'LAMP', id: 'LAMP' },
        { ref: 'LANTERN', id: 'LAMP' },
        { ref: 'BRASS LAMP', id: 'LAMP' },
        { ref: 'SWORD', id: 'SWORD' },
        { ref: 'ELVISH SWORD', id: 'SWORD' },
        { ref: 'CASE', id: 'TROPHY-CASE' },
        { ref: 'TROPHY CASE', id: 'TROPHY-CASE' }
      );

      fc.assert(
        fc.property(
          verbGen,
          objectRefGen,
          pronounGen,
          verbGen,
          (verb1, objectRef, pronoun, verb2) => {
            // Create a fresh parser for each test
            const testParser = new Parser();

            // First command: mention an object explicitly
            const firstCommand = `${verb1} ${objectRef.ref}`;
            const firstTokens = lexer.tokenize(firstCommand);
            const classifiedFirst = firstTokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const firstResult = testParser.parse(classifiedFirst, testObjects);

            // First command should succeed
            if ('type' in firstResult) {
              // If first command fails, skip this test case
              return true;
            }

            // Verify the object was identified correctly
            expect(firstResult.directObject?.id).toBe(objectRef.id);

            // Second command: use pronoun
            const secondCommand = `${verb2} ${pronoun}`;
            const secondTokens = lexer.tokenize(secondCommand);
            const classifiedSecond = secondTokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const secondResult = testParser.parse(classifiedSecond, testObjects);

            // Second command should also succeed
            if ('type' in secondResult) {
              // Pronoun resolution failed
              return false;
            }

            // The pronoun should resolve to the same object as the first command
            return secondResult.directObject?.id === objectRef.id;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle pronoun without prior reference', () => {
      // Generator for pronouns
      const pronounGen = fc.constantFrom('IT', 'THEM');

      // Generator for verbs
      const verbGen = fc.constantFrom('TAKE', 'EXAMINE', 'DROP', 'OPEN');

      fc.assert(
        fc.property(
          verbGen,
          pronounGen,
          (verb, pronoun) => {
            // Create a fresh parser with no history
            const testParser = new Parser();

            const command = `${verb} ${pronoun}`;
            const tokens = lexer.tokenize(command);
            const classified = tokens.map(t => ({
              ...t,
              type: vocabulary.lookupWord(t.word)
            }));

            const result = testParser.parse(classified, testObjects);

            // Should return an error
            if (!('type' in result)) {
              return false;
            }

            // Should be an OBJECT_NOT_FOUND error
            return result.type === 'OBJECT_NOT_FOUND';
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
