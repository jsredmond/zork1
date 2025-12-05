/**
 * Tests for verb-object combination testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  VerbObjectTester,
  generateVerbObjectMatrix,
  generateCompleteVerbObjectMatrix,
  calculateMatrixStats,
  COMMON_VERBS,
  MultiWordCommandTester,
  generateMultiWordCommandTests,
  MultiWordCommandTestCase,
  PronounSynonymTester,
  generatePronounTests,
  generateAbbreviationTests,
  generateSynonymTests,
  PronounTestCase,
  AbbreviationTestCase,
  SynonymTestCase
} from './verbObjectTester';
import { GameState } from '../game/state';
import { GameObjectImpl } from '../game/objects';
import { ObjectFlag } from '../game/data/flags';

describe('VerbObjectTester', () => {
  let state: GameState;
  let tester: VerbObjectTester;
  
  beforeEach(() => {
    state = new GameState();
    tester = new VerbObjectTester();
  });
  
  describe('generateVerbObjectMatrix', () => {
    it('should generate test cases for common verbs', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'brass lantern',
        synonyms: ['LAMP', 'LANTERN'],
        adjectives: ['BRASS'],
        description: 'A brass lantern'
      });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      lamp.addFlag(ObjectFlag.LIGHTBIT);
      
      const testCases = generateVerbObjectMatrix('LAMP', lamp);
      
      // Should include all common verbs
      const verbs = testCases.map(tc => tc.verb);
      for (const verb of COMMON_VERBS) {
        expect(verbs).toContain(verb);
      }
    });
    
    it('should include object-specific verbs for containers', () => {
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'wooden chest',
        synonyms: ['CHEST'],
        adjectives: ['WOODEN'],
        description: 'A wooden chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      const testCases = generateVerbObjectMatrix('CHEST', chest);
      const verbs = testCases.map(tc => tc.verb);
      
      expect(verbs).toContain('OPEN');
      expect(verbs).toContain('CLOSE');
    });
    
    it('should include object-specific verbs for lights', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'brass lantern',
        synonyms: ['LAMP'],
        adjectives: ['BRASS'],
        description: 'A brass lantern'
      });
      lamp.addFlag(ObjectFlag.LIGHTBIT);
      
      const testCases = generateVerbObjectMatrix('LAMP', lamp);
      const verbs = testCases.map(tc => tc.verb);
      
      expect(verbs).toContain('LIGHT');
      expect(verbs).toContain('EXTINGUISH');
      expect(verbs).toContain('TURN');
    });
    
    it('should include object-specific verbs for readable items', () => {
      const book = new GameObjectImpl({
        id: 'BOOK',
        name: 'old book',
        synonyms: ['BOOK'],
        adjectives: ['OLD'],
        description: 'An old book'
      });
      book.addFlag(ObjectFlag.READBIT);
      
      const testCases = generateVerbObjectMatrix('BOOK', book);
      const verbs = testCases.map(tc => tc.verb);
      
      expect(verbs).toContain('READ');
    });
    
    it('should include invalid combinations', () => {
      const rock = new GameObjectImpl({
        id: 'ROCK',
        name: 'large rock',
        synonyms: ['ROCK'],
        adjectives: ['LARGE'],
        description: 'A large rock'
      });
      // Rock has no special flags
      
      const testCases = generateVerbObjectMatrix('ROCK', rock);
      
      // Should have test cases that expect failure
      const invalidCases = testCases.filter(tc => !tc.shouldSucceed);
      expect(invalidCases.length).toBeGreaterThan(0);
      
      // Should include attempts to eat, drink, read non-applicable items
      const invalidVerbs = invalidCases.map(tc => tc.verb);
      expect(invalidVerbs).toContain('EAT');
      expect(invalidVerbs).toContain('DRINK');
      expect(invalidVerbs).toContain('READ');
    });
    
    it('should mark EXAMINE as always succeeding', () => {
      const obj = new GameObjectImpl({
        id: 'TEST',
        name: 'test object',
        synonyms: ['TEST'],
        adjectives: [],
        description: 'A test object'
      });
      
      const testCases = generateVerbObjectMatrix('TEST', obj);
      const examineCase = testCases.find(tc => tc.verb === 'EXAMINE');
      
      expect(examineCase).toBeDefined();
      expect(examineCase?.shouldSucceed).toBe(true);
    });
    
    it('should mark TAKE as succeeding only for takeable objects', () => {
      const takeableObj = new GameObjectImpl({
        id: 'COIN',
        name: 'gold coin',
        synonyms: ['COIN'],
        adjectives: ['GOLD'],
        description: 'A gold coin'
      });
      takeableObj.addFlag(ObjectFlag.TAKEBIT);
      
      const nonTakeableObj = new GameObjectImpl({
        id: 'WALL',
        name: 'stone wall',
        synonyms: ['WALL'],
        adjectives: ['STONE'],
        description: 'A stone wall'
      });
      
      const takeableCases = generateVerbObjectMatrix('COIN', takeableObj);
      const nonTakeableCases = generateVerbObjectMatrix('WALL', nonTakeableObj);
      
      const takeableCase = takeableCases.find(tc => tc.verb === 'TAKE');
      const nonTakeableCase = nonTakeableCases.find(tc => tc.verb === 'TAKE');
      
      expect(takeableCase?.shouldSucceed).toBe(true);
      expect(nonTakeableCase?.shouldSucceed).toBe(false);
    });
  });
  
  describe('VerbObjectTester.testVerbObjectCombination', () => {
    it('should test a valid verb-object combination', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'brass lantern',
        synonyms: ['LAMP'],
        adjectives: ['BRASS'],
        description: 'A brass lantern'
      });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      state.objects.set('LAMP', lamp);
      
      const testCase = {
        verb: 'TAKE',
        objectId: 'LAMP',
        shouldSucceed: true,
        reason: 'Should add LAMP to inventory'
      };
      
      const result = tester.testVerbObjectCombination(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.itemId).toBe('LAMP');
      expect(result.message).toContain('TAKE');
      expect(result.message).toContain('LAMP');
    });
    
    it('should fail for non-existent object', () => {
      const testCase = {
        verb: 'TAKE',
        objectId: 'NONEXISTENT',
        shouldSucceed: true,
        reason: 'Test'
      };
      
      const result = tester.testVerbObjectCombination(testCase, state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
    
    it('should verify test case configuration', () => {
      const rock = new GameObjectImpl({
        id: 'ROCK',
        name: 'large rock',
        synonyms: ['ROCK'],
        adjectives: ['LARGE'],
        description: 'A large rock'
      });
      // Rock is not takeable
      state.objects.set('ROCK', rock);
      
      // Incorrectly configured test case (says TAKE should succeed on non-takeable)
      const badTestCase = {
        verb: 'TAKE',
        objectId: 'ROCK',
        shouldSucceed: true, // Wrong! Rock is not takeable
        reason: 'Test'
      };
      
      const result = tester.testVerbObjectCombination(badTestCase, state);
      
      expect(result.passed).toBe(false);
    });
  });
  
  describe('VerbObjectTester.testObjectVerbCombinations', () => {
    it('should test all verb combinations for an object', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'brass lantern',
        synonyms: ['LAMP'],
        adjectives: ['BRASS'],
        description: 'A brass lantern'
      });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      lamp.addFlag(ObjectFlag.LIGHTBIT);
      state.objects.set('LAMP', lamp);
      
      const results = tester.testObjectVerbCombinations('LAMP', state);
      
      // Should have multiple test results
      expect(results.length).toBeGreaterThan(COMMON_VERBS.length);
      
      // All results should be for LAMP
      for (const result of results) {
        expect(result.itemId).toBe('LAMP');
      }
    });
    
    it('should handle non-existent object', () => {
      const results = tester.testObjectVerbCombinations('NONEXISTENT', state);
      
      expect(results.length).toBe(1);
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toContain('not found');
    });
  });
  
  describe('generateCompleteVerbObjectMatrix', () => {
    it('should generate matrix for all objects in state', () => {
      const lamp = new GameObjectImpl({ id: 'LAMP', name: 'lamp', synonyms: ['LAMP'], adjectives: [], description: 'A lamp' });
      const sword = new GameObjectImpl({ id: 'SWORD', name: 'sword', synonyms: ['SWORD'], adjectives: [], description: 'A sword' });
      
      state.objects.set('LAMP', lamp);
      state.objects.set('SWORD', sword);
      
      const matrix = generateCompleteVerbObjectMatrix(state);
      
      expect(matrix.size).toBe(2);
      expect(matrix.has('LAMP')).toBe(true);
      expect(matrix.has('SWORD')).toBe(true);
    });
    
    it('should generate test cases for each object', () => {
      const lamp = new GameObjectImpl({ id: 'LAMP', name: 'lamp', synonyms: ['LAMP'], adjectives: [], description: 'A lamp' });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      state.objects.set('LAMP', lamp);
      
      const matrix = generateCompleteVerbObjectMatrix(state);
      const lampCases = matrix.get('LAMP');
      
      expect(lampCases).toBeDefined();
      expect(lampCases!.length).toBeGreaterThan(0);
    });
  });
  
  describe('calculateMatrixStats', () => {
    it('should calculate statistics for a matrix', () => {
      const lamp = new GameObjectImpl({ id: 'LAMP', name: 'lamp', synonyms: ['LAMP'], adjectives: [], description: 'A lamp' });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      lamp.addFlag(ObjectFlag.LIGHTBIT);
      
      const sword = new GameObjectImpl({ id: 'SWORD', name: 'sword', synonyms: ['SWORD'], adjectives: [], description: 'A sword' });
      sword.addFlag(ObjectFlag.TAKEBIT);
      sword.addFlag(ObjectFlag.WEAPONBIT);
      
      state.objects.set('LAMP', lamp);
      state.objects.set('SWORD', sword);
      
      const matrix = generateCompleteVerbObjectMatrix(state);
      const stats = calculateMatrixStats(matrix);
      
      expect(stats.totalObjects).toBe(2);
      expect(stats.totalTestCases).toBeGreaterThan(0);
      expect(stats.expectedSuccesses).toBeGreaterThan(0);
      expect(stats.expectedFailures).toBeGreaterThan(0);
      expect(stats.verbCounts.size).toBeGreaterThan(0);
    });
    
    it('should count verb occurrences', () => {
      const obj = new GameObjectImpl({ id: 'TEST', name: 'test', synonyms: ['TEST'], adjectives: [], description: 'Test' });
      state.objects.set('TEST', obj);
      
      const matrix = generateCompleteVerbObjectMatrix(state);
      const stats = calculateMatrixStats(matrix);
      
      // EXAMINE should appear at least once
      expect(stats.verbCounts.get('EXAMINE')).toBeGreaterThan(0);
    });
  });
});


describe('MultiWordCommandTester', () => {
  let state: GameState;
  let tester: MultiWordCommandTester;
  
  beforeEach(() => {
    state = new GameState();
    tester = new MultiWordCommandTester();
  });
  
  describe('generateMultiWordCommandTests', () => {
    it('should generate PUT X IN Y tests for containers', () => {
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'chest',
        synonyms: ['CHEST'],
        adjectives: [],
        description: 'A chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      const coin = new GameObjectImpl({
        id: 'COIN',
        name: 'coin',
        synonyms: ['COIN'],
        adjectives: [],
        description: 'A coin'
      });
      coin.addFlag(ObjectFlag.TAKEBIT);
      
      state.objects.set('CHEST', chest);
      state.objects.set('COIN', coin);
      
      const testCases = generateMultiWordCommandTests(state);
      
      const putInTests = testCases.filter(tc => 
        tc.verb === 'PUT' && tc.preposition === 'IN'
      );
      
      expect(putInTests.length).toBeGreaterThan(0);
      expect(putInTests[0].directObjectId).toBe('COIN');
      expect(putInTests[0].indirectObjectId).toBe('CHEST');
    });
    
    it('should generate PUT X ON Y tests for surfaces', () => {
      const table = new GameObjectImpl({
        id: 'TABLE',
        name: 'table',
        synonyms: ['TABLE'],
        adjectives: [],
        description: 'A table'
      });
      table.addFlag(ObjectFlag.SURFACEBIT);
      
      const book = new GameObjectImpl({
        id: 'BOOK',
        name: 'book',
        synonyms: ['BOOK'],
        adjectives: [],
        description: 'A book'
      });
      book.addFlag(ObjectFlag.TAKEBIT);
      
      state.objects.set('TABLE', table);
      state.objects.set('BOOK', book);
      
      const testCases = generateMultiWordCommandTests(state);
      
      const putOnTests = testCases.filter(tc => 
        tc.verb === 'PUT' && tc.preposition === 'ON'
      );
      
      expect(putOnTests.length).toBeGreaterThan(0);
      expect(putOnTests[0].directObjectId).toBe('BOOK');
      expect(putOnTests[0].indirectObjectId).toBe('TABLE');
    });
    
    it('should generate GIVE X TO Y tests for actors', () => {
      const thief = new GameObjectImpl({
        id: 'THIEF',
        name: 'thief',
        synonyms: ['THIEF'],
        adjectives: [],
        description: 'A thief'
      });
      thief.addFlag(ObjectFlag.ACTORBIT);
      
      const treasure = new GameObjectImpl({
        id: 'TREASURE',
        name: 'treasure',
        synonyms: ['TREASURE'],
        adjectives: [],
        description: 'A treasure'
      });
      treasure.addFlag(ObjectFlag.TAKEBIT);
      
      state.objects.set('THIEF', thief);
      state.objects.set('TREASURE', treasure);
      
      const testCases = generateMultiWordCommandTests(state);
      
      const giveTests = testCases.filter(tc => tc.verb === 'GIVE');
      
      expect(giveTests.length).toBeGreaterThan(0);
      expect(giveTests[0].directObjectId).toBe('TREASURE');
      expect(giveTests[0].indirectObjectId).toBe('THIEF');
    });
    
    it('should generate invalid combination tests', () => {
      const wall = new GameObjectImpl({
        id: 'WALL',
        name: 'wall',
        synonyms: ['WALL'],
        adjectives: [],
        description: 'A wall'
      });
      // Wall is not takeable
      
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'chest',
        synonyms: ['CHEST'],
        adjectives: [],
        description: 'A chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      state.objects.set('WALL', wall);
      state.objects.set('CHEST', chest);
      
      const testCases = generateMultiWordCommandTests(state);
      
      const invalidTests = testCases.filter(tc => !tc.shouldSucceed);
      
      expect(invalidTests.length).toBeGreaterThan(0);
    });
  });
  
  describe('MultiWordCommandTester.testMultiWordCommand', () => {
    it('should test a valid PUT X IN Y command', () => {
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'chest',
        synonyms: ['CHEST'],
        adjectives: [],
        description: 'A chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      const coin = new GameObjectImpl({
        id: 'COIN',
        name: 'coin',
        synonyms: ['COIN'],
        adjectives: [],
        description: 'A coin'
      });
      coin.addFlag(ObjectFlag.TAKEBIT);
      
      state.objects.set('CHEST', chest);
      state.objects.set('COIN', coin);
      
      const testCase: MultiWordCommandTestCase = {
        command: 'PUT COIN IN CHEST',
        verb: 'PUT',
        directObjectId: 'COIN',
        preposition: 'IN',
        indirectObjectId: 'CHEST',
        shouldSucceed: true,
        reason: 'Should place coin in chest'
      };
      
      const result = tester.testMultiWordCommand(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.message).toContain('PUT COIN IN CHEST');
    });
    
    it('should fail for non-existent direct object', () => {
      const testCase: MultiWordCommandTestCase = {
        command: 'PUT NONEXISTENT IN CHEST',
        verb: 'PUT',
        directObjectId: 'NONEXISTENT',
        preposition: 'IN',
        indirectObjectId: 'CHEST',
        shouldSucceed: true,
        reason: 'Test'
      };
      
      const result = tester.testMultiWordCommand(testCase, state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
    
    it('should fail for non-existent indirect object', () => {
      const coin = new GameObjectImpl({
        id: 'COIN',
        name: 'coin',
        synonyms: ['COIN'],
        adjectives: [],
        description: 'A coin'
      });
      state.objects.set('COIN', coin);
      
      const testCase: MultiWordCommandTestCase = {
        command: 'PUT COIN IN NONEXISTENT',
        verb: 'PUT',
        directObjectId: 'COIN',
        preposition: 'IN',
        indirectObjectId: 'NONEXISTENT',
        shouldSucceed: true,
        reason: 'Test'
      };
      
      const result = tester.testMultiWordCommand(testCase, state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
    
    it('should verify test case configuration', () => {
      const wall = new GameObjectImpl({
        id: 'WALL',
        name: 'wall',
        synonyms: ['WALL'],
        adjectives: [],
        description: 'A wall'
      });
      // Wall is not takeable
      
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'chest',
        synonyms: ['CHEST'],
        adjectives: [],
        description: 'A chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      state.objects.set('WALL', wall);
      state.objects.set('CHEST', chest);
      
      // Incorrectly configured test case (says PUT should succeed on non-takeable)
      const badTestCase: MultiWordCommandTestCase = {
        command: 'PUT WALL IN CHEST',
        verb: 'PUT',
        directObjectId: 'WALL',
        preposition: 'IN',
        indirectObjectId: 'CHEST',
        shouldSucceed: true, // Wrong! Wall is not takeable
        reason: 'Test'
      };
      
      const result = tester.testMultiWordCommand(badTestCase, state);
      
      expect(result.passed).toBe(false);
    });
  });
  
  describe('MultiWordCommandTester.testAllMultiWordCommands', () => {
    it('should test all multi-word commands for the game', () => {
      const chest = new GameObjectImpl({
        id: 'CHEST',
        name: 'chest',
        synonyms: ['CHEST'],
        adjectives: [],
        description: 'A chest'
      });
      chest.addFlag(ObjectFlag.CONTBIT);
      
      const coin = new GameObjectImpl({
        id: 'COIN',
        name: 'coin',
        synonyms: ['COIN'],
        adjectives: [],
        description: 'A coin'
      });
      coin.addFlag(ObjectFlag.TAKEBIT);
      
      state.objects.set('CHEST', chest);
      state.objects.set('COIN', coin);
      
      const results = tester.testAllMultiWordCommands(state);
      
      expect(results.length).toBeGreaterThan(0);
    });
  });
});


describe('PronounSynonymTester', () => {
  let state: GameState;
  let tester: PronounSynonymTester;
  
  beforeEach(() => {
    state = new GameState();
    tester = new PronounSynonymTester();
  });
  
  describe('generatePronounTests', () => {
    it('should generate IT pronoun tests', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lamp',
        synonyms: ['LAMP'],
        adjectives: [],
        description: 'A lamp'
      });
      lamp.addFlag(ObjectFlag.TAKEBIT);
      state.objects.set('LAMP', lamp);
      
      const testCases = generatePronounTests(state);
      
      const itTests = testCases.filter(tc => tc.pronoun === 'IT');
      expect(itTests.length).toBeGreaterThan(0);
    });
    
    it('should generate ALL pronoun tests', () => {
      const testCases = generatePronounTests(state);
      
      const allTests = testCases.filter(tc => tc.pronoun === 'ALL');
      expect(allTests.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateAbbreviationTests', () => {
    it('should generate verb abbreviation tests', () => {
      const testCases = generateAbbreviationTests(state);
      
      const xTest = testCases.find(tc => tc.abbreviation === 'X');
      expect(xTest).toBeDefined();
      expect(xTest?.fullForm).toBe('EXAMINE');
      
      const iTest = testCases.find(tc => tc.abbreviation === 'I');
      expect(iTest).toBeDefined();
      expect(iTest?.fullForm).toBe('INVENTORY');
    });
    
    it('should generate direction abbreviation tests', () => {
      const testCases = generateAbbreviationTests(state);
      
      const nTest = testCases.find(tc => tc.abbreviation === 'N');
      expect(nTest).toBeDefined();
      expect(nTest?.fullForm).toBe('NORTH');
      
      const neTest = testCases.find(tc => tc.abbreviation === 'NE');
      expect(neTest).toBeDefined();
      expect(neTest?.fullForm).toBe('NORTHEAST');
    });
    
    it('should generate abbreviation tests with objects', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lamp',
        synonyms: ['LAMP'],
        adjectives: [],
        description: 'A lamp'
      });
      state.objects.set('LAMP', lamp);
      
      const testCases = generateAbbreviationTests(state);
      
      const xLampTests = testCases.filter(tc => 
        tc.abbreviation === 'X' && tc.objectId === 'LAMP'
      );
      expect(xLampTests.length).toBeGreaterThan(0);
    });
  });
  
  describe('generateSynonymTests', () => {
    it('should generate tests for object synonyms', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lantern',
        synonyms: ['LAMP', 'LANTERN', 'LIGHT'],
        adjectives: [],
        description: 'A lantern'
      });
      state.objects.set('LAMP', lamp);
      
      const testCases = generateSynonymTests(state);
      
      const synonymTests = testCases.filter(tc => tc.objectId === 'LAMP');
      expect(synonymTests.length).toBeGreaterThan(0);
      
      // Should have tests for LAMP and LIGHT (not LANTERN since it's the canonical name)
      const lampTest = synonymTests.find(tc => tc.synonym === 'LAMP');
      expect(lampTest).toBeDefined();
    });
    
    it('should generate tests for adjectives', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lantern',
        synonyms: ['LANTERN'],
        adjectives: ['BRASS', 'OLD'],
        description: 'A brass lantern'
      });
      state.objects.set('LAMP', lamp);
      
      const testCases = generateSynonymTests(state);
      
      const adjectiveTests = testCases.filter(tc => 
        tc.objectId === 'LAMP' && tc.synonym.includes('BRASS')
      );
      expect(adjectiveTests.length).toBeGreaterThan(0);
    });
  });
  
  describe('PronounSynonymTester.testPronoun', () => {
    it('should test IT pronoun', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lamp',
        synonyms: ['LAMP'],
        adjectives: [],
        description: 'A lamp'
      });
      state.objects.set('LAMP', lamp);
      
      const testCase: PronounTestCase = {
        pronoun: 'IT',
        referentObjectId: 'LAMP',
        verb: 'EXAMINE',
        shouldSucceed: true,
        reason: 'IT should refer to LAMP'
      };
      
      const result = tester.testPronoun(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.message).toContain('IT');
    });
    
    it('should test ALL pronoun', () => {
      const testCase: PronounTestCase = {
        pronoun: 'ALL',
        referentObjectId: 'ALL',
        verb: 'TAKE',
        shouldSucceed: true,
        reason: 'ALL should refer to all takeable objects'
      };
      
      const result = tester.testPronoun(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.message).toContain('ALL');
    });
    
    it('should fail for non-existent referent', () => {
      const testCase: PronounTestCase = {
        pronoun: 'IT',
        referentObjectId: 'NONEXISTENT',
        verb: 'EXAMINE',
        shouldSucceed: true,
        reason: 'Test'
      };
      
      const result = tester.testPronoun(testCase, state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
  });
  
  describe('PronounSynonymTester.testAbbreviation', () => {
    it('should test verb abbreviation', () => {
      const testCase: AbbreviationTestCase = {
        abbreviation: 'X',
        fullForm: 'EXAMINE',
        shouldSucceed: true,
        reason: 'X should be recognized as EXAMINE'
      };
      
      const result = tester.testAbbreviation(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.message).toContain('X');
      expect(result.message).toContain('EXAMINE');
    });
    
    it('should test abbreviation with object', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lamp',
        synonyms: ['LAMP'],
        adjectives: [],
        description: 'A lamp'
      });
      state.objects.set('LAMP', lamp);
      
      const testCase: AbbreviationTestCase = {
        abbreviation: 'X',
        fullForm: 'EXAMINE',
        objectId: 'LAMP',
        shouldSucceed: true,
        reason: 'X LAMP should work as EXAMINE LAMP'
      };
      
      const result = tester.testAbbreviation(testCase, state);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('PronounSynonymTester.testSynonym', () => {
    it('should test object synonym', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lantern',
        synonyms: ['LAMP', 'LANTERN', 'LIGHT'],
        adjectives: [],
        description: 'A lantern'
      });
      state.objects.set('LAMP', lamp);
      
      const testCase: SynonymTestCase = {
        synonym: 'LAMP',
        canonicalName: 'lantern',
        objectId: 'LAMP',
        verb: 'EXAMINE',
        shouldSucceed: true,
        reason: 'LAMP should be recognized as synonym for lantern'
      };
      
      const result = tester.testSynonym(testCase, state);
      
      expect(result.passed).toBe(true);
      expect(result.message).toContain('LAMP');
    });
    
    it('should test adjective with object name', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lantern',
        synonyms: ['LANTERN'],
        adjectives: ['BRASS'],
        description: 'A brass lantern'
      });
      state.objects.set('LAMP', lamp);
      
      const testCase: SynonymTestCase = {
        synonym: 'BRASS LANTERN',
        canonicalName: 'lantern',
        objectId: 'LAMP',
        verb: 'EXAMINE',
        shouldSucceed: true,
        reason: 'BRASS LANTERN should refer to LAMP'
      };
      
      const result = tester.testSynonym(testCase, state);
      
      expect(result.passed).toBe(true);
    });
    
    it('should fail for invalid synonym', () => {
      const lamp = new GameObjectImpl({
        id: 'LAMP',
        name: 'lantern',
        synonyms: ['LANTERN'],
        adjectives: [],
        description: 'A lantern'
      });
      state.objects.set('LAMP', lamp);
      
      const testCase: SynonymTestCase = {
        synonym: 'INVALID',
        canonicalName: 'lantern',
        objectId: 'LAMP',
        verb: 'EXAMINE',
        shouldSucceed: true,
        reason: 'Test'
      };
      
      const result = tester.testSynonym(testCase, state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('not found');
    });
  });
});
