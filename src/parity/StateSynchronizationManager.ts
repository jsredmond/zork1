/**
 * StateSynchronizationManager implementation for Z-Machine compatible state validation
 */

import { GameState } from '../game/state';
import { StateSynchronizationManager, ValidationResult, StateIssue } from './interfaces';

export class ZMachineStateSync implements StateSynchronizationManager {
  
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

    // Create a map of object locations for quick lookup
    const locationMap = new Map<string, string>();

    // First pass: collect all object locations
    for (const obj of state.objects) {
      if (obj.location) {
        locationMap.set(obj.id, obj.location);
      }
    }

    // Second pass: validate and fix inconsistencies
    for (const obj of state.objects) {
      if (!obj.location) {
        // Object has no location - assign default
        obj.location = 'VOID';
        continue;
      }

      // Validate location exists
      if (!this.isValidLocation(obj.location, state)) {
        // Invalid location - move to void
        obj.location = 'VOID';
      }
    }

    // Update inventory to match object locations
    this.synchronizeInventoryWithObjects(state);
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

    // Find all objects that should be in inventory
    const inventoryObjects = state.objects.filter(obj => 
      obj.location === 'PLAYER' || obj.location === 'INVENTORY'
    );

    // Update inventory array
    state.inventory = inventoryObjects;

    // Ensure all inventory objects have correct location
    for (const obj of state.inventory) {
      if (obj.location !== 'PLAYER') {
        obj.location = 'PLAYER';
      }
    }
  }

  /**
   * Validates object locations for consistency
   */
  private validateObjectLocations(state: GameState, issues: StateIssue[]): void {
    if (!state.objects) {
      issues.push({
        type: 'MISSING_OBJECTS',
        description: 'Game state has no objects array'
      });
      return;
    }

    for (const obj of state.objects) {
      // Check if object has a location
      if (!obj.location) {
        issues.push({
          type: 'INVALID_LOCATION',
          objectId: obj.id,
          description: `Object ${obj.id} has no location`
        });
        continue;
      }

      // Check if location is valid
      if (!this.isValidLocation(obj.location, state)) {
        issues.push({
          type: 'INVALID_LOCATION',
          objectId: obj.id,
          description: `Object ${obj.id} has invalid location: ${obj.location}`
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

    // Check that all inventory objects exist in objects array
    for (const invObj of state.inventory) {
      const found = state.objects.find(obj => obj.id === invObj.id);
      if (!found) {
        issues.push({
          type: 'INVENTORY_MISMATCH',
          objectId: invObj.id,
          description: `Inventory contains object ${invObj.id} not found in objects array`
        });
      } else if (found.location !== 'PLAYER' && found.location !== 'INVENTORY') {
        issues.push({
          type: 'INVENTORY_MISMATCH',
          objectId: invObj.id,
          description: `Inventory object ${invObj.id} has location ${found.location} instead of PLAYER`
        });
      }
    }

    // Check that all PLAYER-located objects are in inventory
    const playerObjects = state.objects.filter(obj => 
      obj.location === 'PLAYER' || obj.location === 'INVENTORY'
    );
    
    for (const playerObj of playerObjects) {
      const inInventory = state.inventory.find(obj => obj.id === playerObj.id);
      if (!inInventory) {
        issues.push({
          type: 'INVENTORY_MISMATCH',
          objectId: playerObj.id,
          description: `Object ${playerObj.id} at PLAYER location not in inventory`
        });
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

    // Validate room has required properties
    if (!state.currentRoom.name) {
      issues.push({
        type: 'INVALID_ROOM',
        description: 'Current room has no name'
      });
    }

    if (!state.currentRoom.id) {
      issues.push({
        type: 'INVALID_ROOM',
        description: 'Current room has no ID'
      });
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

    // Special locations
    const specialLocations = ['PLAYER', 'INVENTORY', 'VOID', 'NOWHERE', 'LIMBO'];
    if (specialLocations.includes(location)) {
      return true;
    }

    // Check if it's a valid room ID
    // This would need to be enhanced with actual room validation
    // For now, assume any non-empty string that's not a special location
    // could be a room ID
    return location.length > 0;
  }

  /**
   * Synchronizes inventory array with object locations
   */
  private synchronizeInventoryWithObjects(state: GameState): void {
    if (!state.objects) {
      return;
    }

    // Find all objects at PLAYER location
    const inventoryObjects = state.objects.filter(obj => 
      obj.location === 'PLAYER' || obj.location === 'INVENTORY'
    );

    // Update inventory array
    state.inventory = inventoryObjects;
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
          const obj = state.objects.find(o => o.id === issue.objectId);
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
      currentRoom: state.currentRoom?.id,
      score: state.score,
      moves: state.moves,
      inventoryCount: state.inventory?.length || 0,
      objectLocations: state.objects?.map(obj => ({
        id: obj.id,
        location: obj.location
      })) || []
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
}