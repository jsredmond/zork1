/**
 * Tests for ObjectTester
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectTester, analyzeObjectAccessibility, findInaccessibleObjects, isObjectAccessible } from './objectTester';
import { GameState } from '../game/state';
import { GameObjectImpl } from '../game/objects';
import { RoomImpl, Direction } from '../game/rooms';
import { ObjectFlag } from '../game/data/flags';
import { TestType } from './types';
import * as fc from 'fast-check';

describe('ObjectTester', () => {
  let state: GameState;
  let tester: ObjectTester;
  
  beforeEach(() => {
    // Create a simple test state
    const objects = new Map();
    const rooms = new Map();
    
    // Create test rooms
    const westOfHouse = new RoomImpl({
      id: 'WEST-OF-HOUSE',
      name: 'West of House',
      description: 'You are standing in an open field west of a white house.',
      exits: new Map([
        [Direction.NORTH, { destination: 'NORTH-OF-HOUSE', condition: null }],
        [Direction.SOUTH, { destination: 'SOUTH-OF-HOUSE', condition: null }]
      ])
    });
    
    const northOfHouse = new RoomImpl({
      id: 'NORTH-OF-HOUSE',
      name: 'North of House',
      description: 'You are facing the north side of a white house.',
      exits: new Map([
        [Direction.SOUTH, { destination: 'WEST-OF-HOUSE', condition: null }]
      ])
    });
    
    const southOfHouse = new RoomImpl({
      id: 'SOUTH-OF-HOUSE',
      name: 'South of House',
      description: 'You are facing the south side of a white house.',
      exits: new Map([
        [Direction.NORTH, { destination: 'WEST-OF-HOUSE', condition: null }]
      ])
    });
    
    rooms.set('WEST-OF-HOUSE', westOfHouse);
    rooms.set('NORTH-OF-HOUSE', northOfHouse);
    rooms.set('SOUTH-OF-HOUSE', southOfHouse);
    
    // Create test objects
    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'brass lantern',
      synonyms: ['LAMP', 'LANTERN'],
      adjectives: ['BRASS'],
      description: 'A brass lantern',
      location: 'WEST-OF-HOUSE',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT]
    });
    
    const mailbox = new GameObjectImpl({
      id: 'MAILBOX',
      name: 'small mailbox',
      synonyms: ['MAILBOX', 'BOX'],
      adjectives: ['SMALL'],
      description: 'A small mailbox',
      location: 'WEST-OF-HOUSE',
      flags: [ObjectFlag.CONTBIT],
      capacity: 10
    });
    
    const leaflet = new GameObjectImpl({
      id: 'LEAFLET',
      name: 'leaflet',
      synonyms: ['LEAFLET'],
      adjectives: [],
      description: 'A leaflet',
      location: 'MAILBOX',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.READBIT]
    });
    leaflet.setProperty('text', 'Welcome to Zork!');
    
    objects.set('LAMP', lamp);
    objects.set('MAILBOX', mailbox);
    objects.set('LEAFLET', leaflet);
    
    state = new GameState({
      currentRoom: 'WEST-OF-HOUSE',
      objects,
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });
    
    tester = new ObjectTester();
  });
  
  describe('testBasicInteractions', () => {
    it('should test examine for all objects', () => {
      const results = tester.testBasicInteractions('LAMP', state);
      
      const examineResult = results.find(r => r.testType === TestType.OBJECT_EXAMINE);
      expect(examineResult).toBeDefined();
      expect(examineResult?.passed).toBe(true);
    });
    
    it('should test take for takeable objects', () => {
      const results = tester.testBasicInteractions('LAMP', state);
      
      const takeResult = results.find(r => r.testType === TestType.OBJECT_TAKE);
      expect(takeResult).toBeDefined();
      expect(takeResult?.passed).toBe(true);
    });
    
    it('should fail if object has no description', () => {
      const badObject = new GameObjectImpl({
        id: 'BAD',
        name: 'bad object',
        synonyms: ['BAD'],
        adjectives: [],
        description: '',
        location: 'WEST-OF-HOUSE',
        flags: []
      });
      state.objects.set('BAD', badObject);
      
      const results = tester.testBasicInteractions('BAD', state);
      const examineResult = results.find(r => r.testType === TestType.OBJECT_EXAMINE);
      
      expect(examineResult?.passed).toBe(false);
    });
  });
  
  describe('testObjectSpecificActions', () => {
    it('should test container actions for containers', () => {
      const results = tester.testObjectSpecificActions('MAILBOX', state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].passed).toBe(true);
    });
    
    it('should test light actions for light objects', () => {
      const results = tester.testObjectSpecificActions('LAMP', state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].passed).toBe(true);
    });
    
    it('should test readable actions for readable objects', () => {
      const results = tester.testObjectSpecificActions('LEAFLET', state);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].passed).toBe(true);
    });
    
    it('should fail if container has no capacity', () => {
      const badContainer = new GameObjectImpl({
        id: 'BAD-CONTAINER',
        name: 'bad container',
        synonyms: ['CONTAINER'],
        adjectives: [],
        description: 'A bad container',
        location: 'WEST-OF-HOUSE',
        flags: [ObjectFlag.CONTBIT]
        // No capacity defined
      });
      state.objects.set('BAD-CONTAINER', badContainer);
      
      const results = tester.testObjectSpecificActions('BAD-CONTAINER', state);
      
      expect(results[0].passed).toBe(false);
      expect(results[0].message).toContain('no capacity');
    });
  });
  
  describe('testObjectFlags', () => {
    it('should pass for valid flag configurations', () => {
      const result = tester.testObjectFlags('LAMP', state);
      
      expect(result.passed).toBe(true);
    });
    
    it('should detect conflicting flags', () => {
      const conflictingObject = new GameObjectImpl({
        id: 'CONFLICT',
        name: 'conflicting object',
        synonyms: ['CONFLICT'],
        adjectives: [],
        description: 'An object with conflicting flags',
        location: 'WEST-OF-HOUSE',
        flags: [ObjectFlag.CONTBIT, ObjectFlag.SURFACEBIT]
      });
      state.objects.set('CONFLICT', conflictingObject);
      
      const result = tester.testObjectFlags('CONFLICT', state);
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('conflicting flags');
    });
  });
  
  describe('Object Accessibility Analysis', () => {
    it('should identify accessible objects in reachable rooms', () => {
      const accessibility = analyzeObjectAccessibility(state, 'WEST-OF-HOUSE');
      
      const lampAccess = accessibility.get('LAMP');
      expect(lampAccess?.isAccessible).toBe(true);
    });
    
    it('should identify accessible objects in containers', () => {
      const accessibility = analyzeObjectAccessibility(state, 'WEST-OF-HOUSE');
      
      const leafletAccess = accessibility.get('LEAFLET');
      expect(leafletAccess?.isAccessible).toBe(true);
      expect(leafletAccess?.reason).toContain('container');
    });
    
    it('should identify inaccessible objects in unreachable rooms', () => {
      // Add an unreachable room
      const unreachableRoom = new RoomImpl({
        id: 'UNREACHABLE',
        name: 'Unreachable Room',
        description: 'You cannot get here.',
        exits: new Map()
      });
      state.rooms.set('UNREACHABLE', unreachableRoom);
      
      // Add an object in the unreachable room
      const unreachableObject = new GameObjectImpl({
        id: 'UNREACHABLE-OBJ',
        name: 'unreachable object',
        synonyms: ['OBJECT'],
        adjectives: [],
        description: 'An unreachable object',
        location: 'UNREACHABLE',
        flags: [ObjectFlag.TAKEBIT]
      });
      state.objects.set('UNREACHABLE-OBJ', unreachableObject);
      
      const inaccessible = findInaccessibleObjects(state, 'WEST-OF-HOUSE');
      
      expect(inaccessible).toContain('UNREACHABLE-OBJ');
    });
    
    it('should correctly identify object accessibility', () => {
      expect(isObjectAccessible('LAMP', state, 'WEST-OF-HOUSE')).toBe(true);
      expect(isObjectAccessible('LEAFLET', state, 'WEST-OF-HOUSE')).toBe(true);
    });
  });
});

/**
 * Property-Based Tests
 */

describe('ObjectTester Property Tests', () => {
  /**
   * Feature: exhaustive-game-testing, Property 6: Object accessibility
   * Validates: Requirements 2.5
   * 
   * For any object marked as tested, the object should be reachable from the starting game state
   */
  it('Property 6: Object accessibility - tested objects must be accessible', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary game states with objects
        fc.record({
          numRooms: fc.integer({ min: 2, max: 10 }),
          numObjects: fc.integer({ min: 1, max: 20 }),
          startRoom: fc.constant('WEST-OF-HOUSE')
        }),
        (config) => {
          // Create a game state with connected rooms
          const rooms = new Map<string, RoomImpl>();
          const objects = new Map<string, GameObjectImpl>();
          
          // Create rooms in a chain (all reachable)
          const roomIds: string[] = ['WEST-OF-HOUSE'];
          for (let i = 1; i < config.numRooms; i++) {
            roomIds.push(`ROOM-${i}`);
          }
          
          // Connect rooms in a chain
          for (let i = 0; i < roomIds.length; i++) {
            const exits = new Map();
            if (i > 0) {
              exits.set('WEST', { destination: roomIds[i - 1], condition: null });
            }
            if (i < roomIds.length - 1) {
              exits.set('EAST', { destination: roomIds[i + 1], condition: null });
            }
            
            const room = new RoomImpl({
              id: roomIds[i],
              name: `Room ${i}`,
              description: `Description for room ${i}`,
              exits
            });
            rooms.set(roomIds[i], room);
          }
          
          // Create objects in reachable rooms
          for (let i = 0; i < config.numObjects; i++) {
            const roomIndex = i % roomIds.length;
            const obj = new GameObjectImpl({
              id: `OBJ-${i}`,
              name: `object ${i}`,
              synonyms: [`OBJ${i}`],
              adjectives: [],
              description: `Description for object ${i}`,
              location: roomIds[roomIndex],
              flags: [ObjectFlag.TAKEBIT]
            });
            objects.set(`OBJ-${i}`, obj);
          }
          
          const state = new GameState({
            currentRoom: config.startRoom,
            objects,
            rooms,
            inventory: [],
            score: 0,
            moves: 0
          });
          
          // Test: All objects should be accessible since all rooms are connected
          const inaccessible = findInaccessibleObjects(state, config.startRoom);
          
          // Property: No objects should be inaccessible in a fully connected graph
          return inaccessible.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Additional property test: Objects in containers are accessible if container is accessible
   */
  it('Property: Objects in accessible containers are accessible', () => {
    fc.assert(
      fc.property(
        fc.record({
          numContainers: fc.integer({ min: 1, max: 5 }),
          objectsPerContainer: fc.integer({ min: 1, max: 3 })
        }),
        (config) => {
          const rooms = new Map<string, RoomImpl>();
          const objects = new Map<string, GameObjectImpl>();
          
          // Create a simple room
          const room = new RoomImpl({
            id: 'WEST-OF-HOUSE',
            name: 'West of House',
            description: 'A room',
            exits: new Map()
          });
          rooms.set('WEST-OF-HOUSE', room);
          
          // Create containers in the room
          for (let i = 0; i < config.numContainers; i++) {
            const container = new GameObjectImpl({
              id: `CONTAINER-${i}`,
              name: `container ${i}`,
              synonyms: [`CONT${i}`],
              adjectives: [],
              description: `A container`,
              location: 'WEST-OF-HOUSE',
              flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
              capacity: 100
            });
            objects.set(`CONTAINER-${i}`, container);
            
            // Create objects in the container
            for (let j = 0; j < config.objectsPerContainer; j++) {
              const obj = new GameObjectImpl({
                id: `OBJ-${i}-${j}`,
                name: `object ${i}-${j}`,
                synonyms: [`OBJ${i}${j}`],
                adjectives: [],
                description: `An object`,
                location: `CONTAINER-${i}`,
                flags: [ObjectFlag.TAKEBIT]
              });
              objects.set(`OBJ-${i}-${j}`, obj);
            }
          }
          
          const state = new GameState({
            currentRoom: 'WEST-OF-HOUSE',
            objects,
            rooms,
            inventory: [],
            score: 0,
            moves: 0
          });
          
          // Test: All objects should be accessible
          const inaccessible = findInaccessibleObjects(state, 'WEST-OF-HOUSE');
          
          // Property: All objects in accessible open containers should be accessible
          return inaccessible.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
