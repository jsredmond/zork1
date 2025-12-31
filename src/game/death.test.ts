/**
 * Death and Resurrection Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { triggerDeath, triggerGrueDeath, getDeathCount, isGameOver } from './death.js';
import { GameState } from './state.js';
import { createInitialGameState } from './factories/gameFactory.js';
import { ObjectFlag } from './data/flags.js';

describe('Death and Resurrection', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState();
  });

  describe('triggerDeath', () => {
    it('should display death message and banner', () => {
      const message = triggerDeath(state, 'You fell into a pit.');
      
      expect(message).toContain('You fell into a pit.');
      expect(message).toContain('****  You have died  ****');
    });

    it('should decrement base score by 10', () => {
      state.setBaseScore(50);
      triggerDeath(state, 'Test death');
      
      expect(state.getBaseScore()).toBe(40);
    });

    it('should increment death counter', () => {
      expect(getDeathCount(state)).toBe(0);
      
      triggerDeath(state, 'First death');
      expect(getDeathCount(state)).toBe(1);
      
      triggerDeath(state, 'Second death');
      expect(getDeathCount(state)).toBe(2);
    });

    it('should resurrect player in FOREST-1 on first death', () => {
      state.setCurrentRoom('CELLAR');
      
      const message = triggerDeath(state, 'Test death');
      
      expect(message).toContain('deserve another chance');
      expect(state.currentRoom).toBe('FOREST-1');
    });

    it('should clear inventory on resurrection', () => {
      state.addToInventory('LAMP');
      state.addToInventory('SWORD');
      
      triggerDeath(state, 'Test death');
      
      expect(state.inventory.length).toBe(0);
    });

    it('should trigger game over on third death', () => {
      triggerDeath(state, 'First death');
      triggerDeath(state, 'Second death');
      
      const message = triggerDeath(state, 'Third death');
      
      expect(message).toContain('suicidal maniac');
      expect(isGameOver(state)).toBe(true);
    });

    it('should trigger game over if already dead', () => {
      state.setGlobalVariable('DEAD', true);
      
      const message = triggerDeath(state, 'Double death');
      
      expect(message).toContain('killed while already dead');
      expect(isGameOver(state)).toBe(true);
    });

    it('should show bad luck message if not lucky', () => {
      state.setGlobalVariable('LUCKY', false);
      
      const message = triggerDeath(state, 'Test death');
      
      expect(message).toContain('Bad luck');
    });

    it('should not show bad luck message if lucky', () => {
      state.setGlobalVariable('LUCKY', true);
      
      const message = triggerDeath(state, 'Test death');
      
      expect(message).not.toContain('Bad luck');
    });
  });

  describe('triggerGrueDeath', () => {
    it('should trigger death with grue message', () => {
      const message = triggerGrueDeath(state);
      
      expect(message).toContain('slavering fangs');
      expect(message).toContain('grue');
      expect(message).toContain('****  You have died  ****');
    });

    it('should resurrect player after grue attack', () => {
      state.setCurrentRoom('CELLAR');
      
      triggerGrueDeath(state);
      
      expect(state.currentRoom).toBe('FOREST-1');
    });
  });

  describe('getDeathCount', () => {
    it('should return 0 initially', () => {
      expect(getDeathCount(state)).toBe(0);
    });

    it('should return correct count after deaths', () => {
      triggerDeath(state, 'Death 1');
      expect(getDeathCount(state)).toBe(1);
      
      triggerDeath(state, 'Death 2');
      expect(getDeathCount(state)).toBe(2);
    });
  });

  describe('isGameOver', () => {
    it('should return false initially', () => {
      expect(isGameOver(state)).toBe(false);
    });

    it('should return true after game over', () => {
      // Trigger 3 deaths
      triggerDeath(state, 'Death 1');
      triggerDeath(state, 'Death 2');
      triggerDeath(state, 'Death 3');
      
      expect(isGameOver(state)).toBe(true);
    });
  });

  describe('Death Penalty', () => {
    it('should reduce base score by exactly 10 points', () => {
      state.setBaseScore(100);
      triggerDeath(state, 'Test death');
      
      expect(state.getBaseScore()).toBe(90);
    });

    it('should not allow score to go below 0', () => {
      state.setBaseScore(5);
      triggerDeath(state, 'Test death');
      
      expect(state.getBaseScore()).toBe(0);
    });

    it('should set score to 0 when starting at 0', () => {
      state.setBaseScore(0);
      triggerDeath(state, 'Test death');
      
      expect(state.getBaseScore()).toBe(0);
    });

    it('should not restore points after resurrection', () => {
      state.setBaseScore(50);
      
      // First death - score goes to 40
      triggerDeath(state, 'First death');
      expect(state.getBaseScore()).toBe(40);
      
      // Player is resurrected in FOREST-1, but score stays at 40
      expect(state.currentRoom).toBe('FOREST-1');
      expect(state.getBaseScore()).toBe(40);
    });

    it('should apply penalty cumulatively on multiple deaths', () => {
      state.setBaseScore(100);
      
      // First death - score goes to 90
      triggerDeath(state, 'First death');
      expect(state.getBaseScore()).toBe(90);
      
      // Second death - score goes to 80
      triggerDeath(state, 'Second death');
      expect(state.getBaseScore()).toBe(80);
    });
  });

  describe('Resurrection State Handling', () => {
    it('should move lamp to LIVING-ROOM when in inventory', () => {
      // Add lamp to inventory
      const lamp = state.getObject('LAMP');
      if (lamp) {
        lamp.location = 'PLAYER';
        state.addToInventory('LAMP');
      }
      
      triggerDeath(state, 'Test death');
      
      // Lamp should be in LIVING-ROOM
      expect(lamp?.location).toBe('LIVING-ROOM');
      expect(state.isInInventory('LAMP')).toBe(false);
    });

    it('should turn off lamp if lit when dying', () => {
      // Add lit lamp to inventory
      const lamp = state.getObject('LAMP');
      if (lamp) {
        lamp.location = 'PLAYER';
        lamp.flags.add(ObjectFlag.ONBIT); // Turn on lamp
        state.addToInventory('LAMP');
      }
      
      triggerDeath(state, 'Test death');
      
      // Lamp should be off after death
      expect(lamp?.flags.has(ObjectFlag.ONBIT)).toBe(false);
      // And in LIVING-ROOM
      expect(lamp?.location).toBe('LIVING-ROOM');
    });

    it('should move coffin to EGYPT-ROOM when in inventory', () => {
      // Add coffin to inventory
      const coffin = state.getObject('COFFIN');
      if (coffin) {
        coffin.location = 'PLAYER';
        state.addToInventory('COFFIN');
      }
      
      triggerDeath(state, 'Test death');
      
      // Coffin should be in EGYPT-ROOM
      expect(coffin?.location).toBe('EGYPT-ROOM');
      expect(state.isInInventory('COFFIN')).toBe(false);
    });

    it('should reset sword treasure value to 0', () => {
      const sword = state.getObject('SWORD');
      if (sword) {
        sword.value = 10;
      }
      
      triggerDeath(state, 'Test death');
      
      expect(sword?.value).toBe(0);
    });

    it('should clear trap door TOUCHBIT flag', () => {
      const trapDoor = state.getObject('TRAP-DOOR');
      if (trapDoor) {
        trapDoor.flags.add(ObjectFlag.TOUCHBIT);
      }
      
      triggerDeath(state, 'Test death');
      
      expect(trapDoor?.flags.has(ObjectFlag.TOUCHBIT)).toBe(false);
    });

    it('should preserve trap door OPENBIT flag (open/closed state)', () => {
      const trapDoor = state.getObject('TRAP-DOOR');
      if (trapDoor) {
        trapDoor.flags.add(ObjectFlag.OPENBIT); // Open the trap door
      }
      
      triggerDeath(state, 'Test death');
      
      // OPENBIT should be preserved (trap door stays open)
      expect(trapDoor?.flags.has(ObjectFlag.OPENBIT)).toBe(true);
    });

    it('should preserve rug state after death', () => {
      // Set rug as moved
      state.setGlobalVariable('RUG_MOVED', true);
      
      triggerDeath(state, 'Test death');
      
      // Rug state should be preserved
      expect(state.getGlobalVariable('RUG_MOVED')).toBe(true);
    });

    it('should preserve defeated enemy states after death', () => {
      // Set troll as defeated (different from TROLL_FLAG which is for death state)
      state.setGlobalVariable('TROLL_DEAD', true);
      
      triggerDeath(state, 'Test death');
      
      // Troll dead state should be preserved
      expect(state.getGlobalVariable('TROLL_DEAD')).toBe(true);
    });

    it('should preserve treasures in trophy case after death', () => {
      // Put a treasure in the trophy case
      const egg = state.getObject('EGG');
      if (egg) {
        egg.location = 'TROPHY-CASE';
      }
      
      triggerDeath(state, 'Test death');
      
      // Treasure should still be in trophy case
      expect(egg?.location).toBe('TROPHY-CASE');
    });

    it('should not set DEAD flag on automatic resurrection', () => {
      triggerDeath(state, 'Test death');
      
      // DEAD flag should not be set for automatic resurrection
      expect(state.getGlobalVariable('DEAD')).toBeFalsy();
    });

    it('should allow game to continue after resurrection', () => {
      // Die once
      triggerDeath(state, 'First death');
      
      // Player should be in FOREST-1 and game should not be over
      expect(state.currentRoom).toBe('FOREST-1');
      expect(isGameOver(state)).toBe(false);
      
      // Player should be able to move (game continues)
      const forestRoom = state.getCurrentRoom();
      expect(forestRoom).toBeDefined();
      expect(forestRoom?.name).toBeDefined();
    });

    it('should scatter non-treasure items to above-ground rooms', () => {
      // Add a non-treasure item to inventory
      const sword = state.getObject('SWORD');
      if (sword) {
        sword.location = 'PLAYER';
        sword.value = 0; // Make it non-treasure
        state.addToInventory('SWORD');
      }
      
      triggerDeath(state, 'Test death');
      
      // Sword should be in an above-ground room
      const aboveGroundRooms = [
        'WEST-OF-HOUSE', 'NORTH-OF-HOUSE', 'EAST-OF-HOUSE', 'SOUTH-OF-HOUSE',
        'FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'CLEARING',
        'GRATING-CLEARING', 'CANYON-VIEW'
      ];
      expect(aboveGroundRooms).toContain(sword?.location);
      expect(state.isInInventory('SWORD')).toBe(false);
    });

    it('should empty inventory completely after resurrection', () => {
      // Add multiple items to inventory
      const lamp = state.getObject('LAMP');
      const sword = state.getObject('SWORD');
      if (lamp) {
        lamp.location = 'PLAYER';
        state.addToInventory('LAMP');
      }
      if (sword) {
        sword.location = 'PLAYER';
        state.addToInventory('SWORD');
      }
      
      triggerDeath(state, 'Test death');
      
      // Inventory should be empty
      expect(state.inventory.length).toBe(0);
    });
  });
});
