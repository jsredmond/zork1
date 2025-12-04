/**
 * Combat System Tests
 * Tests for combat mechanics, weapon effectiveness, and actor health
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';
import {
  calculateFightStrength,
  calculateVillainStrength,
  findWeapon,
  executePlayerAttack,
  executeVillainAttack,
  combatDaemon,
  healingDaemon,
  STRENGTH_MIN,
  STRENGTH_MAX
} from './combat.js';
import { VillainData } from './combat.js';

describe('Combat System', () => {
  let state: GameState;
  let troll: GameObjectImpl;
  let sword: GameObjectImpl;

  beforeEach(() => {
    // Create test state
    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms: new Map(),
      globalVariables: new Map(),
      inventory: [],
      score: 0,
      moves: 0
    });

    // Create test room
    const room = {
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    };

    state.rooms.set('TEST-ROOM', room as any);

    // Create troll
    troll = new GameObjectImpl({
      id: 'TROLL',
      name: 'troll',
      synonyms: ['TROLL'],
      adjectives: [],
      description: 'A nasty troll',
      initialLocation: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    troll.setProperty('strength', 2);
    troll.location = 'TEST-ROOM';
    state.objects.set('TROLL', troll);

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
  });

  describe('calculateFightStrength', () => {
    it('should calculate base strength from score', () => {
      state.score = 0;
      const strength = calculateFightStrength(state, false);
      expect(strength).toBe(STRENGTH_MIN);
    });

    it('should increase strength with higher score', () => {
      state.score = 350;
      const strength = calculateFightStrength(state, false);
      expect(strength).toBe(STRENGTH_MAX);
    });

    it('should adjust for wounds', () => {
      state.score = 100;
      state.setGlobalVariable('PLAYER_STRENGTH', -2);
      const strength = calculateFightStrength(state, true);
      const baseStrength = calculateFightStrength(state, false);
      expect(strength).toBe(baseStrength - 2);
    });
  });

  describe('calculateVillainStrength', () => {
    it('should return villain base strength', () => {
      const villainData: VillainData = {
        villainId: 'TROLL',
        bestWeapon: 'SWORD',
        bestWeaponAdvantage: 1,
        probability: 0,
        messages: {
          missed: [], lightWound: [], seriousWound: [],
          stagger: [], loseWeapon: [], unconscious: [],
          killed: [], hesitate: []
        }
      };

      const strength = calculateVillainStrength(state, 'TROLL', villainData);
      expect(strength).toBe(2);
    });

    it('should reduce strength when player has best weapon', () => {
      const villainData: VillainData = {
        villainId: 'TROLL',
        bestWeapon: 'SWORD',
        bestWeaponAdvantage: 1,
        probability: 0,
        messages: {
          missed: [], lightWound: [], seriousWound: [],
          stagger: [], loseWeapon: [], unconscious: [],
          killed: [], hesitate: []
        }
      };

      state.setGlobalVariable('COMBAT_WEAPON', 'SWORD');
      const strength = calculateVillainStrength(state, 'TROLL', villainData);
      expect(strength).toBe(1);
    });
  });

  describe('findWeapon', () => {
    it('should find weapon in player inventory', () => {
      const weapon = findWeapon(state, 'PLAYER');
      expect(weapon).toBe('SWORD');
    });

    it('should return null if no weapon found', () => {
      state.inventory = [];
      const weapon = findWeapon(state, 'PLAYER');
      expect(weapon).toBeNull();
    });

    it('should find weapon held by villain', () => {
      const axe = new GameObjectImpl({
        id: 'AXE',
        name: 'axe',
        synonyms: ['AXE'],
        adjectives: [],
        description: 'A bloody axe',
        initialLocation: 'TROLL',
        flags: [ObjectFlag.WEAPONBIT]
      });
      axe.location = 'TROLL';
      state.objects.set('AXE', axe);

      const weapon = findWeapon(state, 'TROLL');
      expect(weapon).toBe('AXE');
    });
  });

  describe('executePlayerAttack', () => {
    it('should execute player attack on villain', () => {
      const villainData: VillainData = {
        villainId: 'TROLL',
        bestWeapon: 'SWORD',
        bestWeaponAdvantage: 1,
        probability: 0,
        messages: {
          missed: ['You miss.'],
          lightWound: ['Light wound.'],
          seriousWound: ['Serious wound.'],
          stagger: ['Stagger.'],
          loseWeapon: ['Lose weapon.'],
          unconscious: ['Unconscious.'],
          killed: ['Killed.'],
          hesitate: ['Hesitate.']
        }
      };

      const result = executePlayerAttack(state, 'TROLL', 'SWORD', villainData);
      expect(result).toBeDefined();
      expect(troll.flags.has(ObjectFlag.FIGHTBIT)).toBe(true);
    });

    it('should handle attacking unconscious villain', () => {
      troll.setProperty('strength', 0);
      
      const villainData: VillainData = {
        villainId: 'TROLL',
        bestWeapon: 'SWORD',
        bestWeaponAdvantage: 1,
        probability: 0,
        messages: {
          missed: [], lightWound: [], seriousWound: [],
          stagger: [], loseWeapon: [], unconscious: [],
          killed: [], hesitate: []
        }
      };

      const result = executePlayerAttack(state, 'TROLL', 'SWORD', villainData);
      expect(result).toBeDefined();
    });
  });

  describe('healingDaemon', () => {
    it('should heal player wounds over time', () => {
      state.setGlobalVariable('PLAYER_STRENGTH', -3);
      
      healingDaemon(state);
      
      const wounds = state.getGlobalVariable('PLAYER_STRENGTH');
      expect(wounds).toBe(-2);
    });

    it('should not heal beyond zero', () => {
      state.setGlobalVariable('PLAYER_STRENGTH', 0);
      
      healingDaemon(state);
      
      const wounds = state.getGlobalVariable('PLAYER_STRENGTH');
      expect(wounds).toBe(0);
    });

    it('should restore carrying capacity while healing', () => {
      state.setGlobalVariable('PLAYER_STRENGTH', -2);
      state.setGlobalVariable('LOAD_ALLOWED', 80);
      
      healingDaemon(state);
      
      const loadAllowed = state.getGlobalVariable('LOAD_ALLOWED');
      expect(loadAllowed).toBe(90);
    });
  });
});
