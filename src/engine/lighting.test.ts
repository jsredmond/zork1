/**
 * Lighting System Tests
 * Tests for room darkness detection, light sources, and grue mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isRoomLit, 
  isActiveLightSource,
  getDarknessMessage,
  checkGrueAttack,
  getGrueAttackMessage,
  willRoomBecomeDark,
  canTurnOffLight,
  isPermanentFlame
} from './lighting.js';
import { GameState } from '../game/state.js';
import { RoomImpl } from '../game/rooms.js';
import { GameObjectImpl } from '../game/objects.js';
import { ObjectFlag, RoomFlag } from '../game/data/flags.js';

describe('Lighting System', () => {
  let state: GameState;
  let darkRoom: RoomImpl;
  let litRoom: RoomImpl;
  let lamp: GameObjectImpl;
  let torch: GameObjectImpl;

  beforeEach(() => {
    // Create a dark room
    darkRoom = new RoomImpl({
      id: 'DARK-ROOM',
      name: 'Dark Room',
      description: 'A dark room.',
      flags: []
    });

    // Create a lit room
    litRoom = new RoomImpl({
      id: 'LIT-ROOM',
      name: 'Lit Room',
      description: 'A well-lit room.',
      flags: [RoomFlag.ONBIT]
    });

    // Create a lamp
    lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'brass lantern',
      description: 'A brass lantern.',
      flags: [ObjectFlag.LIGHTBIT, ObjectFlag.TAKEBIT],
      location: 'PLAYER'
    });

    // Create a torch (permanent flame)
    torch = new GameObjectImpl({
      id: 'TORCH',
      name: 'ivory torch',
      description: 'A flaming torch.',
      flags: [ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT, ObjectFlag.FLAMEBIT, ObjectFlag.TAKEBIT],
      location: null
    });

    // Create game state
    const rooms = new Map();
    rooms.set('DARK-ROOM', darkRoom);
    rooms.set('LIT-ROOM', litRoom);

    const objects = new Map();
    objects.set('LAMP', lamp);
    objects.set('TORCH', torch);

    state = new GameState({
      currentRoom: 'DARK-ROOM',
      rooms,
      objects,
      inventory: []
    });
  });

  describe('isRoomLit', () => {
    it('should return true for inherently lit rooms', () => {
      state.setCurrentRoom('LIT-ROOM');
      expect(isRoomLit(state)).toBe(true);
    });

    it('should return false for dark rooms without light sources', () => {
      state.setCurrentRoom('DARK-ROOM');
      expect(isRoomLit(state)).toBe(false);
    });

    it('should return true when player carries active light source', () => {
      state.setCurrentRoom('DARK-ROOM');
      state.addToInventory('LAMP');
      lamp.addFlag(ObjectFlag.ONBIT);
      expect(isRoomLit(state)).toBe(true);
    });

    it('should return false when player carries inactive light source', () => {
      state.setCurrentRoom('DARK-ROOM');
      state.addToInventory('LAMP');
      expect(isRoomLit(state)).toBe(false);
    });

    it('should return true when active light source is in room', () => {
      state.setCurrentRoom('DARK-ROOM');
      lamp.addFlag(ObjectFlag.ONBIT);
      lamp.location = 'DARK-ROOM';
      darkRoom.addObject('LAMP');
      expect(isRoomLit(state)).toBe(true);
    });
  });

  describe('isActiveLightSource', () => {
    it('should return true for objects with LIGHTBIT and ONBIT', () => {
      lamp.addFlag(ObjectFlag.ONBIT);
      expect(isActiveLightSource(lamp)).toBe(true);
    });

    it('should return false for objects with only LIGHTBIT', () => {
      expect(isActiveLightSource(lamp)).toBe(false);
    });

    it('should return false for objects with only ONBIT', () => {
      const obj = new GameObjectImpl({
        id: 'TEST',
        name: 'test',
        description: 'test',
        flags: [ObjectFlag.ONBIT]
      });
      expect(isActiveLightSource(obj)).toBe(false);
    });

    it('should return true for torch (permanent flame)', () => {
      expect(isActiveLightSource(torch)).toBe(true);
    });
  });

  describe('getDarknessMessage', () => {
    it('should return the pitch black message', () => {
      const message = getDarknessMessage();
      expect(message).toContain('pitch black');
      expect(message).toContain('grue');
    });
  });

  describe('checkGrueAttack', () => {
    it('should return true in dark rooms', () => {
      state.setCurrentRoom('DARK-ROOM');
      expect(checkGrueAttack(state)).toBe(true);
    });

    it('should return false in lit rooms', () => {
      state.setCurrentRoom('LIT-ROOM');
      expect(checkGrueAttack(state)).toBe(false);
    });

    it('should return false when player has light', () => {
      state.setCurrentRoom('DARK-ROOM');
      state.addToInventory('LAMP');
      lamp.addFlag(ObjectFlag.ONBIT);
      expect(checkGrueAttack(state)).toBe(false);
    });
  });

  describe('getGrueAttackMessage', () => {
    it('should return the grue attack message', () => {
      const message = getGrueAttackMessage();
      expect(message).toContain('grue');
      expect(message).toContain('slavering fangs');
    });
  });

  describe('willRoomBecomeDark', () => {
    it('should return false for inherently lit rooms', () => {
      state.setCurrentRoom('LIT-ROOM');
      state.addToInventory('LAMP');
      lamp.addFlag(ObjectFlag.ONBIT);
      expect(willRoomBecomeDark(state, 'LAMP')).toBe(false);
    });

    it('should return true when turning off only light source', () => {
      state.setCurrentRoom('DARK-ROOM');
      state.addToInventory('LAMP');
      lamp.addFlag(ObjectFlag.ONBIT);
      expect(willRoomBecomeDark(state, 'LAMP')).toBe(true);
    });

    it('should return false when other light sources remain', () => {
      state.setCurrentRoom('DARK-ROOM');
      state.addToInventory('LAMP');
      lamp.addFlag(ObjectFlag.ONBIT);
      
      // Add torch to room
      torch.location = 'DARK-ROOM';
      darkRoom.addObject('TORCH');
      
      expect(willRoomBecomeDark(state, 'LAMP')).toBe(false);
    });
  });

  describe('isPermanentFlame', () => {
    it('should return true for objects with FLAMEBIT', () => {
      expect(isPermanentFlame(torch)).toBe(true);
    });

    it('should return false for regular light sources', () => {
      expect(isPermanentFlame(lamp)).toBe(false);
    });
  });

  describe('canTurnOffLight', () => {
    it('should return false for permanent flames', () => {
      expect(canTurnOffLight(torch)).toBe(false);
    });

    it('should return true for regular light sources', () => {
      expect(canTurnOffLight(lamp)).toBe(true);
    });

    it('should return true for non-flame light objects', () => {
      const obj = new GameObjectImpl({
        id: 'LAMP',
        name: 'lamp',
        description: 'A lamp.',
        flags: [ObjectFlag.LIGHTBIT]
      });
      expect(canTurnOffLight(obj)).toBe(true);
    });
  });
});
