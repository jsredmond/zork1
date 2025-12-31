/**
 * Display Formatting Tests
 * Tests output formatting functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Display } from './display.js';
import { RoomImpl } from '../game/rooms.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomFlag, ObjectFlag } from '../game/data/flags.js';
import { GameState } from '../game/state.js';

describe('Display', () => {
  let display: Display;

  beforeEach(() => {
    display = new Display();
  });

  describe('formatRoom', () => {
    it('should format room with name and description', () => {
      const room = new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'This is a test room.',
        flags: [RoomFlag.ONBIT],
      });

      // Create a minimal game state for the test
      const state = new GameState({
        currentRoom: 'TEST-ROOM',
        rooms: new Map([['TEST-ROOM', room]]),
        objects: new Map()
      });

      const formatted = display.formatRoom(room, state, true);
      
      expect(formatted).toContain('Test Room');
      expect(formatted).toContain('This is a test room.');
    });

    it('should format unvisited room with full description', () => {
      const room = new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'This is a test room.',
        visited: false,
        flags: [RoomFlag.ONBIT],
      });

      // Create a minimal game state for the test
      const state = new GameState({
        currentRoom: 'TEST-ROOM',
        rooms: new Map([['TEST-ROOM', room]]),
        objects: new Map()
      });

      const formatted = display.formatRoom(room, state, false);
      
      expect(formatted).toContain('Test Room');
      expect(formatted).toContain('This is a test room.');
    });
  });

  describe('formatObjectList', () => {
    it('should format list of objects', () => {
      const objects = [
        new GameObjectImpl({
          id: 'OBJ1',
          name: 'sword',
          description: 'A sharp sword',
          flags: [ObjectFlag.TAKEBIT],
        }),
        new GameObjectImpl({
          id: 'OBJ2',
          name: 'lamp',
          description: 'A brass lamp',
          flags: [ObjectFlag.TAKEBIT],
        }),
      ];

      const formatted = display.formatObjectList(objects);
      
      expect(formatted).toContain('sword');
      expect(formatted).toContain('lamp');
    });

    it('should return empty string for empty list', () => {
      const formatted = display.formatObjectList([]);
      expect(formatted).toBe('');
    });
  });

  describe('formatInventory', () => {
    it('should format inventory with objects', () => {
      const objects = [
        new GameObjectImpl({
          id: 'OBJ1',
          name: 'sword',
          description: 'A sharp sword',
          flags: [ObjectFlag.TAKEBIT],
        }),
      ];

      const formatted = display.formatInventory(objects);
      
      expect(formatted).toContain('You are carrying:');
      expect(formatted).toContain('sword');
    });

    it('should show empty-handed message for empty inventory', () => {
      const formatted = display.formatInventory([]);
      expect(formatted).toBe('You are empty-handed.');
    });

    it('should format inventory with nested items in containers', () => {
      const bag = new GameObjectImpl({
        id: 'BAG',
        name: 'leather bag',
        description: 'A leather bag',
        flags: [ObjectFlag.TAKEBIT, ObjectFlag.CONTBIT],
        capacity: 20,
      });

      const coin = new GameObjectImpl({
        id: 'COIN',
        name: 'gold coin',
        description: 'A shiny gold coin',
        flags: [ObjectFlag.TAKEBIT],
        location: 'BAG',
      });

      const allObjects = new Map([
        ['BAG', bag],
        ['COIN', coin],
      ]);

      const formatted = display.formatInventory([bag], allObjects);
      
      expect(formatted).toContain('You are carrying:');
      expect(formatted).toContain('leather bag');
      expect(formatted).toContain('gold coin');
      // Check that nested item has more indentation
      const lines = formatted.split('\n');
      const bagLine = lines.find(l => l.includes('leather bag'));
      const coinLine = lines.find(l => l.includes('gold coin'));
      expect(bagLine).toBeDefined();
      expect(coinLine).toBeDefined();
      // Coin should have more leading spaces than bag
      const bagSpaces = bagLine!.match(/^ */)?.[0].length || 0;
      const coinSpaces = coinLine!.match(/^ */)?.[0].length || 0;
      expect(coinSpaces).toBeGreaterThan(bagSpaces);
    });
  });

  describe('formatMessage', () => {
    it('should format message', () => {
      const message = 'Test message';
      const formatted = display.formatMessage(message);
      expect(formatted).toBe(message);
    });
  });

  describe('formatTitle', () => {
    it('should format game title', () => {
      const formatted = display.formatTitle();
      
      expect(formatted).toContain('ZORK I');
      expect(formatted).toContain('Great Underground Empire');
    });
  });

  describe('formatScore', () => {
    it('should format score with rank', () => {
      const formatted = display.formatScore(100, 50, 350);
      
      expect(formatted).toContain('100');
      expect(formatted).toContain('350');
      expect(formatted).toContain('50');
      expect(formatted).toContain('moves');
    });

    it('should show appropriate rank for score', () => {
      const formatted = display.formatScore(0, 1, 350);
      expect(formatted).toContain('Beginner');
    });
  });

  describe('wrapText', () => {
    it('should wrap long text to specified width', () => {
      const longText = 'This is a very long line of text that should be wrapped to multiple lines when it exceeds the specified width';
      const wrapped = display.wrapText(longText, 40);
      
      const lines = wrapped.split('\n');
      expect(lines.length).toBeGreaterThan(1);
      
      // Check that no line exceeds the width
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(40);
      });
    });

    it('should not wrap short text', () => {
      const shortText = 'Short text';
      const wrapped = display.wrapText(shortText, 80);
      
      expect(wrapped).toBe(shortText);
    });
  });
});


describe('LOOK Output Formatting', () => {
  let display: Display;

  beforeEach(() => {
    display = new Display();
  });

  describe('Room Name Prefix', () => {
    it('should include room name on first line of LOOK output', () => {
      const room = new RoomImpl({
        id: 'WEST-OF-HOUSE',
        name: 'West of House',
        description: 'You are standing in an open field west of a white house, with a boarded front door.',
        flags: [RoomFlag.ONBIT],
      });

      const state = new GameState({
        currentRoom: 'WEST-OF-HOUSE',
        rooms: new Map([['WEST-OF-HOUSE', room]]),
        objects: new Map()
      });

      const formatted = display.formatRoom(room, state, true);
      const lines = formatted.split('\n');
      
      // First line should be the room name
      expect(lines[0]).toBe('West of House');
      // Second line should be the description
      expect(lines[1]).toContain('You are standing');
    });

    it('should include room name for all room types', () => {
      const testRooms = [
        { id: 'ROCKY-LEDGE', name: 'Rocky Ledge', description: 'You are on a ledge.' },
        { id: 'FOREST', name: 'Forest', description: 'This is a forest.' },
        { id: 'LIVING-ROOM', name: 'Living Room', description: 'You are in the living room.' },
        { id: 'CELLAR', name: 'Cellar', description: 'You are in a dark cellar.' },
      ];

      for (const roomData of testRooms) {
        const room = new RoomImpl({
          id: roomData.id,
          name: roomData.name,
          description: roomData.description,
          flags: [RoomFlag.ONBIT],
        });

        const state = new GameState({
          currentRoom: roomData.id,
          rooms: new Map([[roomData.id, room]]),
          objects: new Map()
        });

        const formatted = display.formatRoom(room, state, true);
        const lines = formatted.split('\n');
        
        expect(lines[0]).toBe(roomData.name);
      }
    });

    it('should format room name identically for first visit and revisit', () => {
      const room = new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room description.',
        flags: [RoomFlag.ONBIT],
        visited: false,
      });

      const state = new GameState({
        currentRoom: 'TEST-ROOM',
        rooms: new Map([['TEST-ROOM', room]]),
        objects: new Map()
      });

      // First visit
      const firstVisit = display.formatRoom(room, state, true);
      const firstLines = firstVisit.split('\n');
      
      // Mark as visited
      room.markVisited();
      
      // Revisit
      const revisit = display.formatRoom(room, state, true);
      const revisitLines = revisit.split('\n');
      
      // Room name should be the same on both visits
      expect(firstLines[0]).toBe(revisitLines[0]);
      expect(firstLines[0]).toBe('Test Room');
    });
  });
});
