/**
 * StateSynchronizationManager implementation for Z-Machine compatible state validation
 */

import { GameState } from '../game/state';
import { StateSynchronizationManager, ValidationResult, StateIssue } from './interfaces';

export enum ActionRequirement {
  REQUIRES_POSSESSION = 'requires_possession',    // put, drop, throw, etc.
  REQUIRES_VISIBILITY = 'requires_visibility',    // examine, look at, etc.
  REQUIRES_BOTH = 'requires_both',                // some complex actions
  REQUIRES_NEITHER = 'requires_neither'           // abstract actions
}

export interface ObjectLocationValidation {
  isValid: boolean;
  errorMessage?: string;
  errorType?: 'possession' | 'visibility' | 'invalid_object';
}

export class ZMachineStateSync implements StateSynchronizationManager {
  
  private actionRequirements = new Map<string, ActionRequirement>([
    ['put', ActionRequirement.REQUIRES_POSSESSION],
    ['drop', ActionRequirement.REQUIRES_POSSESSION],
    ['throw', ActionRequirement.REQUIRES_POSSESSION],
    ['give', ActionRequirement.REQUIRES_POSSESSION],
    ['insert', ActionRequirement.REQUIRES_POSSESSION],
    ['examine', ActionRequirement.REQUIRES_VISIBILITY],
    ['look', ActionRequirement.REQUIRES_VISIBILITY],
    ['take', ActionRequirement.REQUIRES_VISIBILITY],
    ['get', ActionRequirement.REQUIRES_VISIBILITY],
    ['touch', ActionRequirement.REQUIRES_VISIBILITY],
    ['move', ActionRequirement.REQUIRES_VISIBILITY],
    ['push', ActionRequirement.REQUIRES_VISIBILITY],
    ['pull', ActionRequirement.REQUIRES_VISIBILITY],
  ]);
  
  /**
   * Validates object action based on Z-Machine logic
   * Checks possession first for manipulation actions, visibility first for examination actions
   */
  validateObjectAction(action: string, objectId: string, gameState: GameState): ObjectLocationValidation {
    const requirement = this.actionRequirements.get(action.toLowerCase()) || ActionRequirement.REQUIRES_VISIBILITY;
    
    // Get the object
    const obj = gameState.getObject(objectId);
    if (!obj) {
      return {
        isValid: false,
        errorMessage: `You can't see any ${objectId} here!`,
        errorType: 'invalid_object'
      };
    }

    switch (requirement) {
      case ActionRequirement.REQUIRES_POSSESSION:
        return this.validatePossessionFirst(objectId, gameState);
        
      case ActionRequirement.REQUIRES_VISIBILITY:
        return this.validateVisibilityFirst(objectId, gameState);
        
      case ActionRequirement.REQUIRES_BOTH:
        const possessionResult = this.validatePossessionFirst(objectId, gameState);
        if (!possessionResult.isValid) return possessionResult;
        return this.validateVisibilityFirst(objectId, gameState);
        
      default:
        return { isValid: true };
    }
  }

  /**
   * Validates possession first (for manipulation actions like "put")
   */
  private validatePossessionFirst(objectId: string, gameState: GameState): ObjectLocationValidation {
    // Check if player has the object first
    if (!gameState.isInInventory(objectId)) {
      return {
        isValid: false,
        errorMessage: "You don't have that!",
        errorType: 'possession'
      };
    }

    // If possessed, check if it's a valid object for the action
    const obj = gameState.getObject(objectId);
    if (!obj) {
      return {
        isValid: false,
        errorMessage: "You don't have that!",
        errorType: 'possession'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates visibility first (for examination actions like "look")
   */
  private validateVisibilityFirst(objectId: string, gameState: GameState): ObjectLocationValidation {
    // Check if object is visible in current room first
    if (!this.isObjectVisibleInRoom(objectId, gameState)) {
      return {
        isValid: false,
        errorMessage: `You can't see any ${objectId} here!`,
        errorType: 'visibility'
      };
    }

    return { isValid: true };
  }

  /**
   * Checks if an object is visible in the current room
   */
  private isObjectVisibleInRoom(objectId: string, gameState: GameState): boolean {
    const obj = gameState.getObject(objectId);
    if (!obj) {
      return false;
    }

    // Object is visible if:
    // 1. It's in the current room
    // 2. It's in the player's inventory
    // 3. It's in a container that's open and in the current room
    
    if (obj.location === gameState.currentRoom) {
      return true;
    }

    if (obj.location === 'PLAYER' || gameState.isInInventory(objectId)) {
      return true;
    }

    // Check if it's in an open container in the current room
    if (obj.location) {
      const container = gameState.getObject(obj.location);
      if (container && container.location === gameState.currentRoom) {
        // Check if container is open (if it has an open property)
        if (container.properties && 'isOpen' in container.properties) {
          return container.properties.isOpen as boolean;
        }
        // If no open property, assume it's accessible
        return true;
      }
    }

    return false;
  }

  /**
   * Validates the entire game state for consistency
   */
  validateGameState(state: GameState): ValidationResult {
    const issues: StateIssue[] = [];

    // Validate object locations
    this.validateObjectLocations(state, issues);

    // Validate inventory consistency
    this.validateInventoryConsistency(state, issues);

    // Validate room state
    this.validateRoomState(state, issues);

    // Validate game counters
    this.validateGameCounters(state, issues);

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Synchronizes object locations to ensure consistency
   */
  synchronizeObjectLocations(state: GameState): void {
    if (!state.objects) {
      return;
    }

    // Create a transaction-like approach for atomic updates
    const locationUpdates: Array<{ objectId: string; newLocation: string }> = [];
    const validationIssues: StateIssue[] = [];

    // First pass: validate all object locations
    for (const [objectId, obj] of state.objects) {
      if (!obj.location) {
        // Object has no location - assign default
        locationUpdates.push({ objectId, newLocation: 'VOID' });
        continue;
      }

      // Validate location exists and is valid
      if (!this.isValidLocation(obj.location, state)) {
        // Invalid location - move to void
        locationUpdates.push({ objectId, newLocation: 'VOID' });
        validationIssues.push({
          type: 'INVALID_LOCATION',
          objectId: objectId,
          description: `Object ${objectId} had invalid location: ${obj.location}`
        });
      }
    }

    // Apply location updates atomically
    for (const update of locationUpdates) {
      const obj = state.objects.get(update.objectId);
      if (obj) {
        obj.location = update.newLocation;
      }
    }

    // Synchronize inventory with updated object locations
    this.synchronizeInventoryWithObjects(state);

    // Log any issues that were fixed
    if (validationIssues.length > 0) {
      console.warn('Fixed object location issues:', validationIssues);
    }
  }

  /**
   * Ensures inventory state matches object locations
   */
  ensureInventoryConsistency(state: GameState): void {
    if (!state.inventory) {
      state.inventory = [];
    }

    if (!state.objects) {
      return;
    }

    // Find all objects that should be in inventory (at PLAYER location)
    const shouldBeInInventory = new Set<string>();
    for (const [objectId, obj] of state.objects) {
      if (obj.location === 'PLAYER') {
        shouldBeInInventory.add(objectId);
      }
    }

    // Find objects currently in inventory
    const currentlyInInventory = new Set(state.inventory);

    // Objects that need to be added to inventory
    const toAdd = Array.from(shouldBeInInventory).filter(id => !currentlyInInventory.has(id));
    
    // Objects that need to be removed from inventory
    const toRemove = state.inventory.filter(id => !shouldBeInInventory.has(id));

    // Apply changes atomically
    for (const objectId of toAdd) {
      state.addToInventory(objectId);
    }

    for (const objectId of toRemove) {
      state.removeFromInventory(objectId);
    }

    // Ensure all inventory objects have correct location
    for (const objectId of state.inventory) {
      const obj = state.objects.get(objectId);
      if (obj && obj.location !== 'PLAYER') {
        obj.location = 'PLAYER';
      }
    }

    // Log any corrections made
    if (toAdd.length > 0 || toRemove.length > 0) {
      console.debug('Inventory consistency corrections:', {
        added: toAdd,
        removed: toRemove
      });
    }
  }

  /**
   * Validates object locations for consistency
   */
  private validateObjectLocations(state: GameState, issues: StateIssue[]): void {
    if (!state.objects) {
      issues.push({
        type: 'MISSING_OBJECTS',
        description: 'Game state has no objects map'
      });
      return;
    }

    for (const [objectId, obj] of state.objects) {
      // Check if object has a location
      if (!obj.location) {
        issues.push({
          type: 'INVALID_LOCATION',
          objectId: objectId,
          description: `Object ${objectId} has no location`
        });
        continue;
      }

      // Check if location is valid
      if (!this.isValidLocation(obj.location, state)) {
        issues.push({
          type: 'INVALID_LOCATION',
          objectId: objectId,
          description: `Object ${objectId} has invalid location: ${obj.location}`
        });
      }
    }
  }

  /**
   * Validates inventory consistency
   */
  private validateInventoryConsistency(state: GameState, issues: StateIssue[]): void {
    if (!state.inventory) {
      issues.push({
        type: 'MISSING_INVENTORY',
        description: 'Game state has no inventory array'
      });
      return;
    }

    if (!state.objects) {
      return;
    }

    // Check that all inventory objects exist in objects map
    for (const objectId of state.inventory) {
      const obj = state.objects.get(objectId);
      if (!obj) {
        issues.push({
          type: 'INVENTORY_MISMATCH',
          objectId: objectId,
          description: `Inventory contains object ${objectId} not found in objects map`
        });
      } else if (obj.location !== 'PLAYER') {
        issues.push({
          type: 'INVENTORY_MISMATCH',
          objectId: objectId,
          description: `Inventory object ${objectId} has location ${obj.location} instead of PLAYER`
        });
      }
    }

    // Check that all PLAYER-located objects are in inventory
    for (const [objectId, obj] of state.objects) {
      if (obj.location === 'PLAYER') {
        if (!state.inventory.includes(objectId)) {
          issues.push({
            type: 'INVENTORY_MISMATCH',
            objectId: objectId,
            description: `Object ${objectId} at PLAYER location not in inventory`
          });
        }
      }
    }
  }

  /**
   * Validates room state consistency
   */
  private validateRoomState(state: GameState, issues: StateIssue[]): void {
    if (!state.currentRoom) {
      issues.push({
        type: 'MISSING_ROOM',
        description: 'Game state has no current room'
      });
      return;
    }

    // Special locations are always valid, even if not in rooms map
    const specialLocations = ['PLAYER', 'INVENTORY', 'VOID', 'NOWHERE', 'LIMBO'];
    if (specialLocations.includes(state.currentRoom)) {
      return; // Special locations are always valid
    }

    // Check if current room exists in rooms map
    if (state.rooms && !state.rooms.has(state.currentRoom)) {
      issues.push({
        type: 'INVALID_ROOM',
        description: `Current room ${state.currentRoom} not found in rooms map`
      });
      return;
    }

    // If rooms map exists, validate the current room object
    if (state.rooms) {
      const currentRoomObj = state.rooms.get(state.currentRoom);
      if (currentRoomObj) {
        if (!currentRoomObj.name) {
          issues.push({
            type: 'INVALID_ROOM',
            description: 'Current room has no name'
          });
        }

        if (!currentRoomObj.id) {
          issues.push({
            type: 'INVALID_ROOM',
            description: 'Current room has no ID'
          });
        }
      }
    }
  }

  /**
   * Validates game counters (score, moves, etc.)
   */
  private validateGameCounters(state: GameState, issues: StateIssue[]): void {
    // Validate score
    if (typeof state.score !== 'number' || state.score < 0) {
      issues.push({
        type: 'INVALID_COUNTER',
        description: `Invalid score: ${state.score}`
      });
    }

    // Validate moves
    if (typeof state.moves !== 'number' || state.moves < 0) {
      issues.push({
        type: 'INVALID_COUNTER',
        description: `Invalid moves: ${state.moves}`
      });
    }

    // Validate turn counter if present
    if (state.turn !== undefined && (typeof state.turn !== 'number' || state.turn < 0)) {
      issues.push({
        type: 'INVALID_COUNTER',
        description: `Invalid turn: ${state.turn}`
      });
    }
  }

  /**
   * Checks if a location is valid
   */
  private isValidLocation(location: string, state: GameState): boolean {
    if (!location) {
      return false;
    }

    // Special locations are always valid
    const specialLocations = ['PLAYER', 'INVENTORY', 'VOID', 'NOWHERE', 'LIMBO'];
    if (specialLocations.includes(location)) {
      return true;
    }

    // Check if it's a valid room ID
    if (state.rooms && state.rooms.has(location)) {
      return true;
    }

    // Check if it's a valid object ID (for containers)
    if (state.objects && state.objects.has(location)) {
      return true;
    }

    // Invalid location
    return false;
  }

  /**
   * Synchronizes inventory array with object locations
   */
  private synchronizeInventoryWithObjects(state: GameState): void {
    if (!state.objects) {
      return;
    }

    // Find all objects at PLAYER location
    const inventoryObjectIds: string[] = [];
    for (const [objectId, obj] of state.objects) {
      if (obj.location === 'PLAYER') {
        inventoryObjectIds.push(objectId);
      }
    }

    // Update inventory array to match object locations
    state.inventory = inventoryObjectIds;
  }

  /**
   * Repairs common state inconsistencies
   */
  repairStateInconsistencies(state: GameState): ValidationResult {
    const initialValidation = this.validateGameState(state);
    
    if (initialValidation.isValid) {
      return initialValidation;
    }

    // Attempt to repair issues
    for (const issue of initialValidation.issues) {
      this.repairStateIssue(state, issue);
    }

    // Re-validate after repairs
    return this.validateGameState(state);
  }

  /**
   * Attempts to repair a specific state issue
   */
  private repairStateIssue(state: GameState, issue: StateIssue): void {
    switch (issue.type) {
      case 'INVALID_LOCATION':
        if (issue.objectId && state.objects) {
          const obj = state.objects.get(issue.objectId);
          if (obj) {
            obj.location = 'VOID';
          }
        }
        break;

      case 'INVENTORY_MISMATCH':
        this.ensureInventoryConsistency(state);
        break;

      case 'MISSING_INVENTORY':
        state.inventory = [];
        this.ensureInventoryConsistency(state);
        break;

      case 'INVALID_COUNTER':
        if (issue.description.includes('score')) {
          state.score = Math.max(0, state.score || 0);
        }
        if (issue.description.includes('moves')) {
          state.moves = Math.max(0, state.moves || 0);
        }
        break;
    }
  }

  /**
   * Creates a state snapshot for comparison
   */
  createStateSnapshot(state: GameState): any {
    return {
      currentRoom: state.currentRoom,
      score: state.score,
      moves: state.moves,
      inventoryCount: state.inventory?.length || 0,
      objectLocations: Array.from(state.objects?.entries() || []).map(([id, obj]) => ({
        id: id,
        location: obj.location
      }))
    };
  }

  /**
   * Compares two state snapshots
   */
  compareStateSnapshots(snapshot1: any, snapshot2: any): string[] {
    const differences: string[] = [];

    if (snapshot1.currentRoom !== snapshot2.currentRoom) {
      differences.push(`Room changed: ${snapshot1.currentRoom} -> ${snapshot2.currentRoom}`);
    }

    if (snapshot1.score !== snapshot2.score) {
      differences.push(`Score changed: ${snapshot1.score} -> ${snapshot2.score}`);
    }

    if (snapshot1.moves !== snapshot2.moves) {
      differences.push(`Moves changed: ${snapshot1.moves} -> ${snapshot2.moves}`);
    }

    if (snapshot1.inventoryCount !== snapshot2.inventoryCount) {
      differences.push(`Inventory count changed: ${snapshot1.inventoryCount} -> ${snapshot2.inventoryCount}`);
    }

    return differences;
  }

  /**
   * Validates inventory state and provides detailed error handling
   */
  validateInventoryState(state: GameState): ValidationResult {
    const issues: StateIssue[] = [];

    if (!state.inventory) {
      issues.push({
        type: 'MISSING_INVENTORY',
        description: 'Game state has no inventory array'
      });
      return { isValid: false, issues };
    }

    if (!state.objects) {
      issues.push({
        type: 'MISSING_OBJECTS',
        description: 'Game state has no objects map'
      });
      return { isValid: false, issues };
    }

    // Validate each inventory item
    for (const objectId of state.inventory) {
      const obj = state.objects.get(objectId);
      
      if (!obj) {
        issues.push({
          type: 'INVENTORY_ORPHAN',
          objectId: objectId,
          description: `Inventory contains non-existent object: ${objectId}`
        });
        continue;
      }

      if (obj.location !== 'PLAYER') {
        issues.push({
          type: 'INVENTORY_LOCATION_MISMATCH',
          objectId: objectId,
          description: `Inventory object ${objectId} has location '${obj.location}' instead of 'PLAYER'`
        });
      }
    }

    // Check for objects at PLAYER location not in inventory
    for (const [objectId, obj] of state.objects) {
      if (obj.location === 'PLAYER' && !state.inventory.includes(objectId)) {
        issues.push({
          type: 'LOCATION_INVENTORY_MISMATCH',
          objectId: objectId,
          description: `Object ${objectId} at PLAYER location but not in inventory`
        });
      }
    }

    return { isValid: issues.length === 0, issues };
  }

  /**
   * Repairs inventory state inconsistencies with detailed logging
   */
  repairInventoryState(state: GameState): ValidationResult {
    const initialValidation = this.validateInventoryState(state);
    
    if (initialValidation.isValid) {
      return initialValidation;
    }

    const repairActions: string[] = [];

    // Initialize inventory if missing
    if (!state.inventory) {
      state.inventory = [];
      repairActions.push('Initialized missing inventory array');
    }

    if (!state.objects) {
      console.error('Cannot repair inventory: objects map is missing');
      return initialValidation;
    }

    // Remove orphaned inventory items
    const validInventory: string[] = [];
    for (const objectId of state.inventory) {
      if (state.objects.has(objectId)) {
        validInventory.push(objectId);
      } else {
        repairActions.push(`Removed orphaned inventory item: ${objectId}`);
      }
    }
    state.inventory = validInventory;

    // Add missing inventory items and fix locations
    for (const [objectId, obj] of state.objects) {
      if (obj.location === 'PLAYER') {
        if (!state.inventory.includes(objectId)) {
          state.inventory.push(objectId);
          repairActions.push(`Added missing inventory item: ${objectId}`);
        }
      } else if (state.inventory.includes(objectId)) {
        // Object in inventory but not at PLAYER location - fix location
        obj.location = 'PLAYER';
        repairActions.push(`Fixed location for inventory object ${objectId}: set to PLAYER`);
      }
    }

    // Log repair actions
    if (repairActions.length > 0) {
      console.info('Inventory state repairs performed:', repairActions);
    }

    // Re-validate after repairs
    return this.validateInventoryState(state);
  }

  /**
   * Performs atomic inventory operations to maintain consistency
   */
  atomicInventoryOperation(
    state: GameState, 
    operation: 'add' | 'remove' | 'move', 
    objectId: string, 
    targetLocation?: string
  ): ValidationResult {
    // Check if object exists first
    const obj = state.objects?.get(objectId);
    if (!obj) {
      return {
        isValid: false,
        issues: [{
          type: 'OBJECT_NOT_FOUND',
          objectId: objectId,
          description: `Object ${objectId} not found`
        }]
      };
    }

    // Create backup of current state
    const backupInventory = [...state.inventory];
    const backupLocation = obj.location;

    try {
      switch (operation) {
        case 'add':
          obj.location = 'PLAYER';
          if (!state.inventory.includes(objectId)) {
            state.inventory.push(objectId);
          }
          break;

        case 'remove':
          obj.location = targetLocation || 'VOID';
          const index = state.inventory.indexOf(objectId);
          if (index !== -1) {
            state.inventory.splice(index, 1);
          }
          break;

        case 'move':
          if (targetLocation) {
            const wasInInventory = state.inventory.includes(objectId);
            obj.location = targetLocation;
            
            if (targetLocation === 'PLAYER' && !wasInInventory) {
              state.inventory.push(objectId);
            } else if (targetLocation !== 'PLAYER' && wasInInventory) {
              const index = state.inventory.indexOf(objectId);
              if (index !== -1) {
                state.inventory.splice(index, 1);
              }
            }
          }
          break;
      }

      // Validate the operation result
      const validation = this.validateInventoryState(state);
      
      if (!validation.isValid) {
        // Rollback on validation failure
        state.inventory = backupInventory;
        if (backupLocation !== undefined) {
          obj.location = backupLocation;
        }
        
        console.error(`Atomic inventory operation failed, rolled back:`, {
          operation,
          objectId,
          targetLocation,
          issues: validation.issues
        });
      }

      return validation;

    } catch (error) {
      // Rollback on exception
      state.inventory = backupInventory;
      if (backupLocation !== undefined) {
        obj.location = backupLocation;
      }
      
      console.error(`Atomic inventory operation exception, rolled back:`, error);
      return {
        isValid: false,
        issues: [{
          type: 'OPERATION_FAILED',
          objectId: objectId,
          description: `Atomic operation failed: ${error}`
        }]
      };
    }
  }

  /**
   * Monitors inventory state changes for debugging
   */
  createInventoryMonitor(state: GameState): {
    snapshot: () => any;
    compare: (previous: any) => string[];
    validate: () => ValidationResult;
  } {
    const self = this;
    
    return {
      snapshot: () => ({
        inventory: [...state.inventory],
        playerObjects: Array.from(state.objects?.entries() || [])
          .filter(([_, obj]) => obj.location === 'PLAYER')
          .map(([id, _]) => id),
        timestamp: Date.now()
      }),

      compare: (previous: any) => {
        const current = {
          inventory: [...state.inventory],
          playerObjects: Array.from(state.objects?.entries() || [])
            .filter(([_, obj]) => obj.location === 'PLAYER')
            .map(([id, _]) => id),
          timestamp: Date.now()
        };
        
        const differences: string[] = [];

        const prevInventory = new Set(previous.inventory);
        const currInventory = new Set(current.inventory);
        
        const added = Array.from(currInventory).filter(id => !prevInventory.has(id));
        const removed = Array.from(prevInventory).filter(id => !currInventory.has(id));

        if (added.length > 0) {
          differences.push(`Added to inventory: ${added.join(', ')}`);
        }
        if (removed.length > 0) {
          differences.push(`Removed from inventory: ${removed.join(', ')}`);
        }

        return differences;
      },

      validate: () => self.validateInventoryState(state)
    };
  }
}