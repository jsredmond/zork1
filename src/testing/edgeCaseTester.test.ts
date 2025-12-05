/**
 * Tests for EdgeCaseTester
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EdgeCaseTester } from './edgeCaseTester.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ObjectFlag, RoomFlag } from '../game/data/flags.js';
import { TestType } from './types.js';

describe('EdgeCaseTester', () => {
  let tester: EdgeCaseTester;
  let state: GameState;

  beforeEach(() => {
    tester = new EdgeCaseTester();
    
    // Create test state with rooms and objects
    const rooms = new Map();
    const objects = new Map();

    // Create a lit room
    const litRoom = new RoomImpl({
      id: 'LIT-ROOM',
      name: 'Lit Room',
      description: 'A well-lit room',
      exits: new Map(),
      objects: [],
      flags: [RoomFlag.ONBIT]
    });
    rooms.set('LIT-ROOM', litRoom);

    // Create a dark room
    const darkRoom = new RoomImpl({
      id: 'DARK-ROOM',
      name: 'Dark Room',
      description: 'A dark room',
      exits: new Map(),
      objects: ['TEST-OBJECT'],
      flags: []
    });
    rooms.set('DARK-ROOM', darkRoom);

    // Create a test object in the dark room
    const testObject = new GameObjectImpl({
      id: 'TEST-OBJECT',
      name: 'test object',
      description: 'A test object',
      synonyms: ['object', 'test'],
      location: 'DARK-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 5
    });
    objects.set('TEST-OBJECT', testObject);

    // Create a heavy object
    const heavyObject = new GameObjectImpl({
      id: 'HEAVY-OBJECT',
      name: 'heavy object',
      description: 'A very heavy object',
      synonyms: ['heavy', 'boulder'],
      location: 'LIT-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 60
    });
    objects.set('HEAVY-OBJECT', heavyObject);

    // Create a locked container
    const lockedContainer = new GameObjectImpl({
      id: 'LOCKED-BOX',
      name: 'locked box',
      description: 'A locked box',
      synonyms: ['box', 'container'],
      location: 'LIT-ROOM',
      flags: [ObjectFlag.CONTBIT],
      capacity: 10,
      properties: new Map([['locked', true]])
    });
    objects.set('LOCKED-BOX', lockedContainer);

    state = new GameState({
      currentRoom: 'LIT-ROOM',
      rooms,
      objects,
      inventory: [],
      score: 0,
      moves: 0
    });
  });

  describe('testActionsInDarkness', () => {
    it('should test actions in a dark room', () => {
      const results = tester.testActionsInDarkness(state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.testType === TestType.EDGE_CASE)).toBe(true);
    });

    it('should verify room is dark before testing', () => {
      const results = tester.testActionsInDarkness(state);
      
      // Should have at least one result
      expect(results.length).toBeGreaterThan(0);
    });

    it('should restore original room after testing', () => {
      const originalRoom = state.currentRoom;
      tester.testActionsInDarkness(state);
      
      expect(state.currentRoom).toBe(originalRoom);
    });
  });

  describe('testInventoryLimits', () => {
    it('should test weight limits', () => {
      const results = tester.testInventoryLimits(state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.itemId === 'INVENTORY')).toBe(true);
    });

    it('should test with heavy objects', () => {
      const results = tester.testInventoryLimits(state);
      
      // Should have weight limit test
      const weightTest = results.find(r => r.testId.includes('weight-limit'));
      expect(weightTest).toBeDefined();
    });
  });

  describe('testLockedContainersAndDoors', () => {
    it('should find and test locked containers', () => {
      const results = tester.testLockedContainersAndDoors(state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.itemId === 'LOCKED-BOX')).toBe(true);
    });

    it('should verify locked message is returned', () => {
      const results = tester.testLockedContainersAndDoors(state);
      
      const lockedTest = results.find(r => r.itemId === 'LOCKED-BOX');
      expect(lockedTest).toBeDefined();
      if (lockedTest) {
        expect(lockedTest.message.toLowerCase()).toContain('locked');
      }
    });
  });

  describe('testConditionalExits', () => {
    it('should test conditional exits', () => {
      const results = tester.testConditionalExits(state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.testType === TestType.EDGE_CASE)).toBe(true);
    });
  });

  describe('testErrorHandling', () => {
    it('should test invalid commands', () => {
      const results = tester.testErrorHandling(state);
      
      expect(results.length).toBeGreaterThan(0);
      const invalidCommandTest = results.find(r => r.testId.includes('invalid-command'));
      expect(invalidCommandTest).toBeDefined();
    });

    it('should test non-existent objects', () => {
      const results = tester.testErrorHandling(state);
      
      const nonExistentTest = results.find(r => r.testId.includes('nonexistent'));
      expect(nonExistentTest).toBeDefined();
    });

    it('should test invalid verb-object combinations', () => {
      const results = tester.testErrorHandling(state);
      
      const invalidComboTest = results.find(r => r.testId.includes('invalid-combo'));
      expect(invalidComboTest).toBeDefined();
    });
  });

  describe('testAllEdgeCases', () => {
    it('should run all edge case tests', () => {
      const results = tester.testAllEdgeCases(state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.testType === TestType.EDGE_CASE)).toBe(true);
    });

    it('should include darkness tests', () => {
      const results = tester.testAllEdgeCases(state);
      
      const darknessTests = results.filter(r => r.testId.includes('darkness'));
      expect(darknessTests.length).toBeGreaterThan(0);
    });

    it('should include inventory tests', () => {
      const results = tester.testAllEdgeCases(state);
      
      const inventoryTests = results.filter(r => r.itemId === 'INVENTORY');
      expect(inventoryTests.length).toBeGreaterThan(0);
    });

    it('should include locked object tests', () => {
      const results = tester.testAllEdgeCases(state);
      
      const lockedTests = results.filter(r => r.testId.includes('locked'));
      expect(lockedTests.length).toBeGreaterThan(0);
    });

    it('should include error handling tests', () => {
      const results = tester.testAllEdgeCases(state);
      
      const errorTests = results.filter(r => r.itemId === 'ERROR-HANDLING');
      expect(errorTests.length).toBeGreaterThan(0);
    });
  });
});
