/**
 * Tests for StateSynchronizationManager
 * Validates object location tracking and inventory state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ZMachineStateSync, ActionRequirement } from './StateSynchronizationManager';
import { GameState } from '../game/state';
import { GameObject } from '../game/objects';
import { Room } from '../game/rooms';

describe('StateSynchronizationManager', () => {
  let stateSync: ZMachineStateSync;
  let gameState: GameState;
  let objects: Map<string, GameObject>;
  let rooms: Map<string, Room>;

  beforeEach(() => {
    stateSync = new ZMachineStateSync();
    
    // Create test objects
    objects = new Map();
    objects.set('LAMP', {
      id: 'LAMP',
      name: 'brass lantern',
      location: 'PLAYER',
      properties: {}
    } as GameObject);
    
    objects.set('SWORD', {
      id: 'SWORD', 
      name: 'elvish sword',
      location: 'LIVING-ROOM',
      properties: {}
    } as GameObject);

    objects.set('DOOR', {
      id: 'DOOR',
      name: 'wooden door', 
      location: 'VOID',
      properties: {}
    } as GameObject);

    // Create test rooms
    rooms = new Map();
    rooms.set('LIVING-ROOM', {
      id: 'LIVING-ROOM',
      name: 'Living Room',
      objects: ['SWORD']
    } as Room);

    rooms.set('KITCHEN', {
      id: 'KITCHEN', 
      name: 'Kitchen',
      objects: []
    } as Room);

    // Create game state
    gameState = new GameState({
      currentRoom: 'LIVING-ROOM',
      objects,
      rooms,
      inventory: ['LAMP'],
      score: 0,
      moves: 0
    });
  });

  describe('Object Location Tracking', () => {
    it('should validate object action with possession-first logic for manipulation actions', () => {
      // Test "put" command - should check possession first
      const result = stateSync.validateObjectAction('put', 'LAMP', gameState);
      expect(result.isValid).toBe(true);

      // Test with object not in inventory
      const result2 = stateSync.validateObjectAction('put', 'SWORD', gameState);
      expect(result2.isValid).toBe(false);
      expect(result2.errorMessage).toBe("You don't have that!");
      expect(result2.errorType).toBe('possession');
    });

    it('should validate object action with visibility-first logic for examination actions', () => {
      // Test "examine" command - should check visibility first
      const result = stateSync.validateObjectAction('examine', 'SWORD', gameState);
      expect(result.isValid).toBe(true);

      // Test with object not visible
      const result2 = stateSync.validateObjectAction('examine', 'DOOR', gameState);
      expect(result2.isValid).toBe(false);
      expect(result2.errorMessage).toBe("You can't see any DOOR here!");
      expect(result2.errorType).toBe('visibility');
    });

    it('should handle non-existent objects correctly', () => {
      const result = stateSync.validateObjectAction('take', 'NONEXISTENT', gameState);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("You can't see any NONEXISTENT here!");
      expect(result.errorType).toBe('invalid_object');
    });

    it('should synchronize object locations correctly', () => {
      // Add an object with invalid location
      objects.set('BROKEN', {
        id: 'BROKEN',
        name: 'broken item',
        location: 'INVALID-ROOM',
        properties: {}
      } as GameObject);

      stateSync.synchronizeObjectLocations(gameState);

      const brokenObj = objects.get('BROKEN');
      expect(brokenObj?.location).toBe('VOID');
    });

    it('should validate object locations and report issues', () => {
      // Add object with no location
      objects.set('LOCATIONLESS', {
        id: 'LOCATIONLESS',
        name: 'locationless item',
        location: '',
        properties: {}
      } as GameObject);

      const validation = stateSync.validateGameState(gameState);
      expect(validation.isValid).toBe(false);
      
      const locationIssues = validation.issues.filter(issue => 
        issue.type === 'INVALID_LOCATION' && issue.objectId === 'LOCATIONLESS'
      );
      expect(locationIssues).toHaveLength(1);
    });
  });

  describe('Inventory State Management', () => {
    it('should ensure inventory consistency with object locations', () => {
      // Add object at PLAYER location but not in inventory
      objects.set('FORGOTTEN', {
        id: 'FORGOTTEN',
        name: 'forgotten item',
        location: 'PLAYER',
        properties: {}
      } as GameObject);

      stateSync.ensureInventoryConsistency(gameState);

      expect(gameState.inventory).toContain('FORGOTTEN');
    });

    it('should remove objects from inventory if they are not at PLAYER location', () => {
      // Move LAMP away from player but keep in inventory
      const lamp = objects.get('LAMP');
      if (lamp) {
        lamp.location = 'KITCHEN';
      }

      stateSync.ensureInventoryConsistency(gameState);

      expect(gameState.inventory).not.toContain('LAMP');
    });

    it('should validate inventory state and detect mismatches', () => {
      // Create inventory mismatch
      gameState.inventory.push('SWORD'); // SWORD is in LIVING-ROOM, not with player

      const validation = stateSync.validateInventoryState(gameState);
      expect(validation.isValid).toBe(false);
      
      const mismatchIssues = validation.issues.filter(issue => 
        issue.type === 'INVENTORY_LOCATION_MISMATCH'
      );
      expect(mismatchIssues).toHaveLength(1);
    });

    it('should repair inventory state inconsistencies', () => {
      // Create multiple inconsistencies
      gameState.inventory.push('NONEXISTENT'); // Orphaned item
      gameState.inventory.push('SWORD'); // Wrong location
      
      // Add object at PLAYER location not in inventory
      objects.set('MISSING', {
        id: 'MISSING',
        name: 'missing item',
        location: 'PLAYER',
        properties: {}
      } as GameObject);

      const validation = stateSync.repairInventoryState(gameState);
      expect(validation.isValid).toBe(true);
      
      expect(gameState.inventory).not.toContain('NONEXISTENT');
      expect(gameState.inventory).toContain('MISSING');
      
      const sword = objects.get('SWORD');
      expect(sword?.location).toBe('PLAYER'); // Should be moved to PLAYER
    });

    it('should perform atomic inventory operations safely', () => {
      const initialInventory = [...gameState.inventory];
      
      // Test successful add operation
      const addResult = stateSync.atomicInventoryOperation(gameState, 'add', 'SWORD');
      expect(addResult.isValid).toBe(true);
      expect(gameState.inventory).toContain('SWORD');
      
      const sword = objects.get('SWORD');
      expect(sword?.location).toBe('PLAYER');

      // Test successful remove operation
      const removeResult = stateSync.atomicInventoryOperation(gameState, 'remove', 'SWORD', 'KITCHEN');
      expect(removeResult.isValid).toBe(true);
      expect(gameState.inventory).not.toContain('SWORD');
      expect(sword?.location).toBe('KITCHEN');
    });

    it('should rollback atomic operations on validation failure', () => {
      const initialInventory = [...gameState.inventory];
      
      // Try to add non-existent object (should fail and rollback)
      const result = stateSync.atomicInventoryOperation(gameState, 'add', 'NONEXISTENT');
      expect(result.isValid).toBe(false);
      expect(gameState.inventory).toEqual(initialInventory);
    });
  });

  describe('State Validation Framework', () => {
    it('should validate complete game state', () => {
      const validation = stateSync.validateGameState(gameState);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect missing inventory', () => {
      // @ts-ignore - Intentionally break state for testing
      gameState.inventory = null;
      
      const validation = stateSync.validateGameState(gameState);
      expect(validation.isValid).toBe(false);
      
      const inventoryIssues = validation.issues.filter(issue => 
        issue.type === 'MISSING_INVENTORY'
      );
      expect(inventoryIssues).toHaveLength(1);
    });

    it('should detect invalid counters', () => {
      gameState.score = -10;
      gameState.moves = -5;
      
      const validation = stateSync.validateGameState(gameState);
      expect(validation.isValid).toBe(false);
      
      const counterIssues = validation.issues.filter(issue => 
        issue.type === 'INVALID_COUNTER'
      );
      expect(counterIssues.length).toBeGreaterThan(0);
    });

    it('should repair state inconsistencies', () => {
      // Create multiple issues
      gameState.score = -10;
      gameState.inventory.push('NONEXISTENT');
      
      const repairedValidation = stateSync.repairStateInconsistencies(gameState);
      expect(repairedValidation.isValid).toBe(true);
      expect(gameState.score).toBe(0);
      expect(gameState.inventory).not.toContain('NONEXISTENT');
    });

    it('should create and compare state snapshots', () => {
      const snapshot1 = stateSync.createStateSnapshot(gameState);
      
      // Make changes
      gameState.score = 10;
      gameState.moves = 5;
      
      const snapshot2 = stateSync.createStateSnapshot(gameState);
      const differences = stateSync.compareStateSnapshots(snapshot1, snapshot2);
      
      expect(differences).toContain('Score changed: 0 -> 10');
      expect(differences).toContain('Moves changed: 0 -> 5');
    });
  });

  describe('Inventory Monitoring', () => {
    it('should create inventory monitor with snapshot and comparison capabilities', () => {
      const monitor = stateSync.createInventoryMonitor(gameState);
      
      const snapshot1 = monitor.snapshot();
      
      // Add object to inventory
      stateSync.atomicInventoryOperation(gameState, 'add', 'SWORD');
      
      const differences = monitor.compare(snapshot1);
      expect(differences).toContain('Added to inventory: SWORD');
      
      const validation = monitor.validate();
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Action Requirements Classification', () => {
    it('should classify manipulation actions as requiring possession', () => {
      const putResult = stateSync.validateObjectAction('put', 'SWORD', gameState);
      expect(putResult.errorType).toBe('possession');
      
      const dropResult = stateSync.validateObjectAction('drop', 'SWORD', gameState);
      expect(dropResult.errorType).toBe('possession');
    });

    it('should classify examination actions as requiring visibility', () => {
      const examineResult = stateSync.validateObjectAction('examine', 'DOOR', gameState);
      expect(examineResult.errorType).toBe('visibility');
      
      const lookResult = stateSync.validateObjectAction('look', 'DOOR', gameState);
      expect(lookResult.errorType).toBe('visibility');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty game state gracefully', () => {
      const emptyState = new GameState({
        currentRoom: 'VOID',
        objects: new Map(),
        rooms: new Map(),
        inventory: [],
        score: 0,
        moves: 0
      });

      const validation = stateSync.validateGameState(emptyState);
      
      // Empty state should be valid since VOID is a special location
      expect(validation.isValid).toBe(true);
    });

    it('should handle objects in containers correctly', () => {
      // Add container object
      objects.set('BOX', {
        id: 'BOX',
        name: 'wooden box',
        location: 'LIVING-ROOM',
        properties: { isOpen: true }
      } as GameObject);

      // Add object in container
      objects.set('KEY', {
        id: 'KEY',
        name: 'brass key',
        location: 'BOX',
        properties: {}
      } as GameObject);

      // Key should be visible because it's in an open container in current room
      const result = stateSync.validateObjectAction('examine', 'KEY', gameState);
      expect(result.isValid).toBe(true);
    });

    it('should handle closed containers correctly', () => {
      // Add closed container
      objects.set('CHEST', {
        id: 'CHEST',
        name: 'treasure chest',
        location: 'LIVING-ROOM',
        properties: { isOpen: false }
      } as GameObject);

      // Add object in closed container
      objects.set('TREASURE', {
        id: 'TREASURE',
        name: 'gold coin',
        location: 'CHEST',
        properties: {}
      } as GameObject);

      // Treasure should not be visible because container is closed
      const result = stateSync.validateObjectAction('examine', 'TREASURE', gameState);
      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('visibility');
    });
  });
});