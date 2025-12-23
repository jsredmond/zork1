/**
 * Weapon System Tests
 * Tests for sword glow daemon and weapon interactions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ObjectFlag } from '../game/data/flags.js';
import { swordGlowDaemon, checkSwordGlow, isRoomInfested } from './weapons.js';

describe('Sword Glow System', () => {
  let state: GameState;
  let sword: GameObjectImpl;
  let troll: GameObjectImpl;

  beforeEach(() => {
    // Create test state
    state = new GameState({
      currentRoom: 'CELLAR',
      objects: new Map(),
      rooms: new Map(),
      globalVariables: new Map(),
      inventory: [],
      score: 0,
      moves: 0
    });

    // Create rooms with proper exits
    const cellar = new RoomImpl({
      id: 'CELLAR',
      name: 'Cellar',
      description: 'A dark cellar',
      exits: new Map([['NORTH', { direction: 'NORTH', destination: 'TROLL-ROOM' }]]),
      objects: [],
      visited: false,
      flags: []
    });
    state.rooms.set('CELLAR', cellar);

    const trollRoom = new RoomImpl({
      id: 'TROLL-ROOM',
      name: 'Troll Room',
      description: 'A room with a troll',
      exits: new Map([['SOUTH', { direction: 'SOUTH', destination: 'CELLAR' }]]),
      objects: ['TROLL'],
      visited: false,
      flags: []
    });
    state.rooms.set('TROLL-ROOM', trollRoom);

    const safeRoom = new RoomImpl({
      id: 'SAFE-ROOM',
      name: 'Safe Room',
      description: 'A safe room',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: []
    });
    state.rooms.set('SAFE-ROOM', safeRoom);

    // Create sword
    sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'sword',
      synonyms: ['SWORD'],
      adjectives: [],
      description: 'An elvish sword',
      initialLocation: 'PLAYER',
      flags: [ObjectFlag.WEAPONBIT, ObjectFlag.TAKEBIT]
    });
    sword.location = 'PLAYER';
    state.objects.set('SWORD', sword);
    state.inventory.push('SWORD');

    // Create troll
    troll = new GameObjectImpl({
      id: 'TROLL',
      name: 'troll',
      synonyms: ['TROLL'],
      adjectives: [],
      description: 'A nasty troll',
      initialLocation: 'TROLL-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    troll.location = 'TROLL-ROOM';
    state.objects.set('TROLL', troll);
  });

  describe('isRoomInfested', () => {
    it('should return true when room contains an actor', () => {
      expect(isRoomInfested(state, 'TROLL-ROOM')).toBe(true);
    });

    it('should return false when room has no actors', () => {
      expect(isRoomInfested(state, 'CELLAR')).toBe(false);
    });

    it('should return false for invisible actors', () => {
      troll.addFlag('INVISIBLE' as any);
      expect(isRoomInfested(state, 'TROLL-ROOM')).toBe(false);
    });
  });

  describe('checkSwordGlow', () => {
    it('should return bright glow message when in same room as enemy', () => {
      state.currentRoom = 'TROLL-ROOM';
      const message = checkSwordGlow(state);
      expect(message).toBe('Your sword has begun to glow very brightly.');
    });

    it('should return faint glow message when adjacent to enemy', () => {
      state.currentRoom = 'CELLAR';
      const message = checkSwordGlow(state);
      expect(message).toBe('Your sword is glowing with a faint blue glow.');
    });

    it('should return no longer glowing message when moving away from enemy', () => {
      // First, set glow level to 2 (bright)
      state.currentRoom = 'TROLL-ROOM';
      checkSwordGlow(state);
      
      // Then move to safe room
      state.currentRoom = 'SAFE-ROOM';
      const message = checkSwordGlow(state);
      expect(message).toBe('Your sword is no longer glowing.');
    });

    it('should return null when player does not have sword', () => {
      state.removeFromInventory('SWORD');
      sword.location = 'CELLAR';
      state.currentRoom = 'TROLL-ROOM';
      const message = checkSwordGlow(state);
      expect(message).toBeNull();
    });

    it('should return null when glow level has not changed', () => {
      state.currentRoom = 'TROLL-ROOM';
      checkSwordGlow(state); // First call sets glow level
      const message = checkSwordGlow(state); // Second call should return null
      expect(message).toBeNull();
    });
  });

  describe('swordGlowDaemon', () => {
    it('should output bright glow message when entering room with enemy', () => {
      state.currentRoom = 'TROLL-ROOM';
      
      // Capture console output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => logs.push(args.join(' '));
      
      try {
        const result = swordGlowDaemon(state);
        expect(result).toBe(true);
        expect(logs).toContain('Your sword has begun to glow very brightly.');
      } finally {
        console.log = originalLog;
      }
    });

    it('should output faint glow message when adjacent to enemy', () => {
      state.currentRoom = 'CELLAR';
      
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => logs.push(args.join(' '));
      
      try {
        const result = swordGlowDaemon(state);
        expect(result).toBe(true);
        expect(logs).toContain('Your sword is glowing with a faint blue glow.');
      } finally {
        console.log = originalLog;
      }
    });

    it('should output no longer glowing when enemy is removed', () => {
      // First, enter troll room to set glow level
      state.currentRoom = 'TROLL-ROOM';
      swordGlowDaemon(state);
      
      // Remove troll (simulating death)
      state.moveObject('TROLL', null);
      const trollRoom = state.getRoom('TROLL-ROOM');
      if (trollRoom) {
        trollRoom.removeObject('TROLL');
      }
      
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => logs.push(args.join(' '));
      
      try {
        const result = swordGlowDaemon(state);
        expect(result).toBe(true);
        expect(logs).toContain('Your sword is no longer glowing.');
      } finally {
        console.log = originalLog;
      }
    });

    it('should not run when player does not have sword', () => {
      state.removeFromInventory('SWORD');
      sword.location = 'CELLAR';
      state.currentRoom = 'TROLL-ROOM';
      
      const result = swordGlowDaemon(state);
      expect(result).toBe(false);
    });
  });
});
