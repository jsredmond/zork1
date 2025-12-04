/**
 * Action Handlers
 * Implements game action handlers
 */

import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { ObjectFlag } from './data/flags.js';
import { Storage } from '../persistence/storage.js';
import { scoreTreasure, TROPHY_CASE_ID, getRank, MAX_SCORE } from './scoring.js';

export interface StateChange {
  type: string;
  objectId?: string;
  oldValue?: any;
  newValue?: any;
}

export interface ActionResult {
  success: boolean;
  message: string;
  stateChanges: StateChange[];
}

export interface ActionHandler {
  execute(state: GameState, ...args: any[]): ActionResult;
}

/**
 * Maximum inventory weight limit
 */
const MAX_INVENTORY_WEIGHT = 100;

/**
 * TAKE action handler
 * Allows player to pick up objects
 */
export class TakeAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is already in inventory
    if (state.isInInventory(objectId)) {
      return {
        success: false,
        message: "You already have that.",
        stateChanges: []
      };
    }

    // Check if object is takeable
    if (!obj.isTakeable()) {
      return {
        success: false,
        message: `You can't take the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if object is in current room or inventory
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanges: []
      };
    }

    const isInCurrentRoom = obj.location === currentRoom.id;
    const isInContainer = obj.location && state.getObject(obj.location);
    
    if (!isInCurrentRoom && !isInContainer) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check weight constraints
    const currentWeight = state.getInventoryWeight();
    const objectWeight = obj.size || 0;
    
    if (currentWeight + objectWeight > MAX_INVENTORY_WEIGHT) {
      return {
        success: false,
        message: "You're carrying too much already.",
        stateChanges: []
      };
    }

    // Take the object
    const oldLocation = obj.location;
    state.moveObject(objectId, 'PLAYER', 'HELD');

    return {
      success: true,
      message: "Taken.",
      stateChanges: [{
        type: 'OBJECT_MOVED',
        objectId: objectId,
        oldValue: oldLocation,
        newValue: 'PLAYER'
      }]
    };
  }
}

/**
 * DROP action handler
 * Allows player to drop objects from inventory
 */
export class DropAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You don't have that.",
        stateChanges: []
      };
    }

    // Check if object is in inventory
    if (!state.isInInventory(objectId)) {
      return {
        success: false,
        message: "You don't have that.",
        stateChanges: []
      };
    }

    // Get current room
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) {
      return {
        success: false,
        message: "Something went wrong.",
        stateChanges: []
      };
    }

    // Drop the object in current room
    const oldLocation = obj.location;
    state.moveObject(objectId, currentRoom.id);

    return {
      success: true,
      message: "Dropped.",
      stateChanges: [{
        type: 'OBJECT_MOVED',
        objectId: objectId,
        oldValue: oldLocation,
        newValue: currentRoom.id
      }]
    };
  }
}

/**
 * INVENTORY action handler
 * Displays all objects in player's inventory
 */
export class InventoryAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    // Check if inventory is empty
    if (state.isInventoryEmpty()) {
      return {
        success: true,
        message: "You are empty-handed.",
        stateChanges: []
      };
    }

    // Get all inventory objects
    const inventoryObjects = state.getInventoryObjects();
    
    // Build inventory list message
    const objectNames = inventoryObjects.map(obj => obj.name);
    let message = "You are carrying:\n";
    
    for (const name of objectNames) {
      message += `  ${name}\n`;
    }

    return {
      success: true,
      message: message.trim(),
      stateChanges: []
    };
  }
}

/**
 * MOVE action handler
 * Handles directional movement commands (NORTH, SOUTH, EAST, WEST, UP, DOWN, IN, OUT)
 */
export class MoveAction implements ActionHandler {
  execute(state: GameState, direction: string): ActionResult {
    const currentRoom = state.getCurrentRoom();
    
    if (!currentRoom) {
      return {
        success: false,
        message: "You are nowhere!",
        stateChanges: []
      };
    }

    // Normalize direction to uppercase
    const normalizedDirection = direction.toUpperCase();
    
    // Check if exit exists
    const exit = currentRoom.getExit(normalizedDirection as any);
    
    if (!exit) {
      return {
        success: false,
        message: "You can't go that way.",
        stateChanges: []
      };
    }

    // Check if exit is available (condition check)
    if (!currentRoom.isExitAvailable(normalizedDirection as any)) {
      // If there's a custom message for blocked exit, use it
      const message = exit.message || "You can't go that way.";
      return {
        success: false,
        message: message,
        stateChanges: []
      };
    }

    // Check if destination is empty (blocked exit with message)
    if (!exit.destination || exit.destination === '') {
      const message = exit.message || "You can't go that way.";
      return {
        success: false,
        message: message,
        stateChanges: []
      };
    }

    // Move to new room
    const oldRoom = state.currentRoom;
    state.setCurrentRoom(exit.destination);
    state.incrementMoves();

    return {
      success: true,
      message: '', // Room description will be displayed separately
      stateChanges: [{
        type: 'ROOM_CHANGED',
        oldValue: oldRoom,
        newValue: exit.destination
      }]
    };
  }
}

/**
 * EXAMINE action handler
 * Displays detailed description of an object or room
 */
export class ExamineAction implements ActionHandler {
  execute(state: GameState, objectId?: string): ActionResult {
    // If no object specified, examine the current room
    if (!objectId) {
      const currentRoom = state.getCurrentRoom();
      if (!currentRoom) {
        return {
          success: false,
          message: "You are nowhere!",
          stateChanges: []
        };
      }
      
      return {
        success: true,
        message: currentRoom.description,
        stateChanges: []
      };
    }

    // Get the object
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible (in current room or inventory)
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    const isInVisibleContainer = obj.location && state.isInInventory(obj.location);
    
    if (!isInInventory && !isInCurrentRoom && !isInVisibleContainer) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for mirror
    if (objectId === 'MIRROR-1' || objectId === 'MIRROR-2') {
      const { MirrorPuzzle } = require('./puzzles.js');
      return MirrorPuzzle.examineMirror(state);
    }

    // Special handling for control panel
    if (objectId === 'CONTROL-PANEL') {
      const { DamPuzzle } = require('./puzzles.js');
      return {
        success: true,
        message: DamPuzzle.getControlPanelDescription(state),
        stateChanges: []
      };
    }

    // Return the object's description
    const description = obj.description || `You see nothing special about the ${obj.name.toLowerCase()}.`;

    return {
      success: true,
      message: description,
      stateChanges: []
    };
  }
}

/**
 * OPEN action handler
 * Opens containers and doors
 */
export class OpenAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    
    if (!isInInventory && !isInCurrentRoom) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is a container or door
    if (!obj.hasFlag(ObjectFlag.CONTBIT) && !obj.hasFlag(ObjectFlag.DOORBIT)) {
      return {
        success: false,
        message: `You can't open the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if already open
    if (obj.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already open.",
        stateChanges: []
      };
    }

    // Open the object
    obj.addFlag(ObjectFlag.OPENBIT);

    return {
      success: true,
      message: "Opened.",
      stateChanges: [{
        type: 'FLAG_CHANGED',
        objectId: objectId,
        oldValue: false,
        newValue: true
      }]
    };
  }
}

/**
 * CLOSE action handler
 * Closes containers and doors
 */
export class CloseAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    
    if (!isInInventory && !isInCurrentRoom) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is a container or door
    if (!obj.hasFlag(ObjectFlag.CONTBIT) && !obj.hasFlag(ObjectFlag.DOORBIT)) {
      return {
        success: false,
        message: `You can't close the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if already closed
    if (!obj.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: "It's already closed.",
        stateChanges: []
      };
    }

    // Close the object
    obj.removeFlag(ObjectFlag.OPENBIT);

    return {
      success: true,
      message: "Closed.",
      stateChanges: [{
        type: 'FLAG_CHANGED',
        objectId: objectId,
        oldValue: true,
        newValue: false
      }]
    };
  }
}

/**
 * READ action handler
 * Displays text property of readable objects
 */
export class ReadAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    const isInVisibleContainer = obj.location && state.isInInventory(obj.location);
    
    if (!isInInventory && !isInCurrentRoom && !isInVisibleContainer) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is readable
    if (!obj.hasFlag(ObjectFlag.READBIT)) {
      return {
        success: false,
        message: `You can't read the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Get the text property
    const text = obj.getProperty('text');
    
    if (!text) {
      return {
        success: false,
        message: `There is nothing written on the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    return {
      success: true,
      message: text,
      stateChanges: []
    };
  }
}

/**
 * LOOK action handler
 * Displays the current room description with objects
 */
export class LookAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    const currentRoom = state.getCurrentRoom();
    
    if (!currentRoom) {
      return {
        success: false,
        message: "You are nowhere!",
        stateChanges: []
      };
    }

    const description = formatRoomDescription(currentRoom, state);

    return {
      success: true,
      message: description,
      stateChanges: []
    };
  }
}

/**
 * Format room description including name, description, and visible objects
 * Handles visited/unvisited room descriptions
 */
export function formatRoomDescription(room: any, state: GameState): string {
  let output = '';

  // Room name
  output += room.name + '\n';

  // Room description (full description for unvisited or LOOK command)
  output += room.description;

  // List visible objects in room
  const objectsInRoom = state.getObjectsInCurrentRoom();
  
  if (objectsInRoom.length > 0) {
    output += '\n';
    for (const obj of objectsInRoom) {
      // Only show visible objects (not hidden or inside closed containers)
      output += `\nThere is a ${obj.name.toLowerCase()} here.`;
    }
  }

  return output;
}

/**
 * Get room description for display after movement
 * Shows brief description for visited rooms, full for unvisited
 */
export function getRoomDescriptionAfterMovement(room: any, state: GameState, verbose: boolean = false): string {
  let output = '';

  // Room name
  output += room.name + '\n';

  // Show full description if unvisited or verbose mode
  if (!room.visited || verbose) {
    output += room.description;
  } else {
    // Brief description for visited rooms
    output += room.description;
  }

  // List visible objects in room
  const objectsInRoom = state.getObjectsInCurrentRoom();
  
  if (objectsInRoom.length > 0) {
    output += '\n';
    for (const obj of objectsInRoom) {
      output += `\nThere is a ${obj.name.toLowerCase()} here.`;
    }
  }

  return output;
}

/**
 * SAVE action handler
 * Saves the current game state to a file
 */
export class SaveAction implements ActionHandler {
  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage || new Storage();
  }

  execute(state: GameState, filename?: string): ActionResult {
    // If no filename provided, use default
    if (!filename) {
      filename = 'savegame';
    }

    try {
      const message = this.storage.save(state, filename);
      
      return {
        success: true,
        message: message,
        stateChanges: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        message: errorMessage,
        stateChanges: []
      };
    }
  }
}

/**
 * RESTORE action handler
 * Restores game state from a save file
 */
export class RestoreAction implements ActionHandler {
  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage || new Storage();
  }

  execute(state: GameState, filename?: string): ActionResult {
    // If no filename provided, use default
    if (!filename) {
      filename = 'savegame';
    }

    try {
      const restoredState = this.storage.restore(filename);
      
      // Copy all properties from restored state to current state
      state.currentRoom = restoredState.currentRoom;
      state.objects = restoredState.objects;
      state.rooms = restoredState.rooms;
      state.globalVariables = restoredState.globalVariables;
      state.inventory = restoredState.inventory;
      state.score = restoredState.score;
      state.moves = restoredState.moves;
      state.flags = restoredState.flags;
      
      return {
        success: true,
        message: `Game restored from ${filename}`,
        stateChanges: [{
          type: 'STATE_RESTORED',
          oldValue: null,
          newValue: filename
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        message: errorMessage,
        stateChanges: []
      };
    }
  }
}

/**
 * PUT action handler
 * Puts an object into a container or onto a surface
 */
export class PutAction implements ActionHandler {
  execute(state: GameState, objectId: string, containerId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    const container = state.getObject(containerId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (!container) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for putty on leak (dam puzzle)
    if (objectId === 'PUTTY' && containerId === 'LEAK') {
      const { DamPuzzle } = require('./puzzles.js');
      return DamPuzzle.fixLeak(state, objectId);
    }

    // Check if trying to put object into itself
    if (objectId === containerId) {
      return {
        success: false,
        message: "How can you do that?",
        stateChanges: []
      };
    }

    // Check if object is already in the container
    if (obj.location === containerId) {
      return {
        success: false,
        message: `The ${obj.name.toLowerCase()} is already in the ${container.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if container is a container or surface
    if (!container.hasFlag(ObjectFlag.CONTBIT) && !container.hasFlag(ObjectFlag.SURFACEBIT)) {
      return {
        success: false,
        message: "You can't do that.",
        stateChanges: []
      };
    }

    // Check if container is open (if it's a container, not a surface)
    if (container.hasFlag(ObjectFlag.CONTBIT) && !container.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: `The ${container.name.toLowerCase()} isn't open.`,
        stateChanges: []
      };
    }

    // Check if player is holding the object
    if (!state.isInInventory(objectId)) {
      return {
        success: false,
        message: `You don't have the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check capacity constraints
    const containerCapacity = container.capacity || 0;
    const containerCurrentWeight = getContainerWeight(container, state);
    const objectWeight = obj.size || 0;
    
    if (containerCurrentWeight + objectWeight > containerCapacity) {
      return {
        success: false,
        message: "There's no room.",
        stateChanges: []
      };
    }

    // Put the object in the container
    const oldLocation = obj.location;
    state.moveObject(objectId, containerId);

    // Check if placing treasure in trophy case - award points
    let scoreMessage = '';
    if (containerId === TROPHY_CASE_ID) {
      const points = scoreTreasure(state, objectId);
      if (points > 0) {
        scoreMessage = ` [Your score has just gone up by ${points} point${points === 1 ? '' : 's'}.]`;
      }
    }

    return {
      success: true,
      message: "Done." + scoreMessage,
      stateChanges: [{
        type: 'OBJECT_MOVED',
        objectId: objectId,
        oldValue: oldLocation,
        newValue: containerId
      }]
    };
  }
}

/**
 * Helper function to calculate total weight of objects in a container
 */
function getContainerWeight(container: GameObjectImpl, state: GameState): number {
  let totalWeight = 0;
  
  // Iterate through all objects to find those in this container
  for (const [objId, obj] of state.objects.entries()) {
    if (obj.location === container.id) {
      totalWeight += (obj as GameObjectImpl).size || 0;
    }
  }
  
  return totalWeight;
}

/**
 * REMOVE action handler
 * Removes an object from a container (synonym for TAKE FROM)
 */
export class RemoveAction implements ActionHandler {
  execute(state: GameState, objectId: string, containerId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    const container = state.getObject(containerId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (!container) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is in the container
    if (obj.location !== containerId) {
      return {
        success: false,
        message: `The ${obj.name.toLowerCase()} isn't in the ${container.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if container is open (if it's a container)
    if (container.hasFlag(ObjectFlag.CONTBIT) && !container.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: `The ${container.name.toLowerCase()} isn't open.`,
        stateChanges: []
      };
    }

    // Check if object is takeable
    if (!obj.isTakeable()) {
      return {
        success: false,
        message: `You can't take the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check weight constraints
    const currentWeight = state.getInventoryWeight();
    const objectWeight = obj.size || 0;
    
    if (currentWeight + objectWeight > MAX_INVENTORY_WEIGHT) {
      return {
        success: false,
        message: "You're carrying too much already.",
        stateChanges: []
      };
    }

    // Remove the object from container and add to inventory
    const oldLocation = obj.location;
    state.moveObject(objectId, 'PLAYER', 'HELD');

    return {
      success: true,
      message: "Taken.",
      stateChanges: [{
        type: 'OBJECT_MOVED',
        objectId: objectId,
        oldValue: oldLocation,
        newValue: 'PLAYER'
      }]
    };
  }
}

/**
 * TURN ON action handler
 * Turns on light sources
 */
export class TurnOnAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    
    if (!isInInventory && !isInCurrentRoom) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is a light source
    if (!obj.hasFlag(ObjectFlag.LIGHTBIT)) {
      return {
        success: false,
        message: "You can't turn that on.",
        stateChanges: []
      };
    }

    // Check if already on
    if (obj.hasFlag(ObjectFlag.ONBIT)) {
      return {
        success: false,
        message: "It is already on.",
        stateChanges: []
      };
    }

    // Turn on the light source
    obj.addFlag(ObjectFlag.ONBIT);

    return {
      success: true,
      message: `The ${obj.name.toLowerCase()} is now on.`,
      stateChanges: [{
        type: 'FLAG_CHANGED',
        objectId: objectId,
        oldValue: false,
        newValue: true
      }]
    };
  }
}

/**
 * TURN OFF action handler
 * Turns off light sources
 */
export class TurnOffAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is visible
    const currentRoom = state.getCurrentRoom();
    const isInInventory = state.isInInventory(objectId);
    const isInCurrentRoom = currentRoom && obj.location === currentRoom.id;
    
    if (!isInInventory && !isInCurrentRoom) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is a light source
    if (!obj.hasFlag(ObjectFlag.LIGHTBIT)) {
      return {
        success: false,
        message: "You can't turn that off.",
        stateChanges: []
      };
    }

    // Check if already off
    if (!obj.hasFlag(ObjectFlag.ONBIT)) {
      return {
        success: false,
        message: "It is already off.",
        stateChanges: []
      };
    }

    // Turn off the light source
    obj.removeFlag(ObjectFlag.ONBIT);

    return {
      success: true,
      message: `The ${obj.name.toLowerCase()} is now off.`,
      stateChanges: [{
        type: 'FLAG_CHANGED',
        objectId: objectId,
        oldValue: true,
        newValue: false
      }]
    };
  }
}

/**
 * ATTACK action handler
 * Handles combat with NPCs and objects
 */
export class AttackAction implements ActionHandler {
  execute(state: GameState, targetId: string, weaponId?: string): ActionResult {
    const target = state.getObject(targetId) as GameObjectImpl;
    
    if (!target) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for mirror
    if (targetId === 'MIRROR-1' || targetId === 'MIRROR-2') {
      const { MirrorPuzzle } = require('./puzzles.js');
      return MirrorPuzzle.breakMirror(state);
    }

    // Check if target is an actor
    if (!target.hasFlag(ObjectFlag.ACTORBIT)) {
      return {
        success: false,
        message: `I've known strange people, but fighting a ${target.name.toLowerCase()}?`,
        stateChanges: []
      };
    }

    // Check if weapon is specified
    if (!weaponId) {
      return {
        success: false,
        message: `Trying to attack a ${target.name.toLowerCase()} with your bare hands is suicidal.`,
        stateChanges: []
      };
    }

    const weapon = state.getObject(weaponId) as GameObjectImpl;
    
    if (!weapon) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if player is holding the weapon
    if (!state.isInInventory(weaponId)) {
      return {
        success: false,
        message: `You aren't even holding the ${weapon.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if weapon is actually a weapon
    if (!weapon.hasFlag(ObjectFlag.WEAPONBIT)) {
      return {
        success: false,
        message: `Trying to attack the ${target.name.toLowerCase()} with a ${weapon.name.toLowerCase()} is suicidal.`,
        stateChanges: []
      };
    }

    // Use combat system for actual combat
    const { executePlayerAttack } = require('../engine/combat.js');
    const { getVillainData } = require('../engine/villainData.js');
    
    const villainData = getVillainData(targetId);
    if (villainData) {
      const result = executePlayerAttack(state, targetId, weaponId, villainData);
      
      return {
        success: true,
        message: '', // Combat system handles messages
        stateChanges: [{
          type: 'COMBAT',
          objectId: targetId,
          oldValue: null,
          newValue: result
        }]
      };
    }

    // Fallback for non-villain actors
    return {
      success: true,
      message: `You attack the ${target.name.toLowerCase()} with the ${weapon.name.toLowerCase()}.`,
      stateChanges: []
    };
  }
}

/**
 * KILL action handler
 * Synonym for ATTACK
 */
export class KillAction implements ActionHandler {
  private attackAction: AttackAction;

  constructor() {
    this.attackAction = new AttackAction();
  }

  execute(state: GameState, targetId: string, weaponId?: string): ActionResult {
    return this.attackAction.execute(state, targetId, weaponId);
  }
}

/**
 * SCORE action handler
 * Displays the player's current score
 */
export class ScoreAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    const score = state.score;
    const moves = state.moves;
    
    // Get rank from scoring module
    const rank = getRank(score);
    
    // Format move count message
    const moveText = moves === 1 ? 'move' : 'moves';
    
    const message = `Your score is ${score} (total of ${MAX_SCORE} points), in ${moves} ${moveText}.\nThis gives you the rank of ${rank}.`;
    
    return {
      success: true,
      message: message,
      stateChanges: []
    };
  }
}

/**
 * QUIT action handler
 * Exits the game
 */
export class QuitAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    return {
      success: true,
      message: "Do you wish to leave the game? (Y is affirmative): ",
      stateChanges: [{
        type: 'QUIT_REQUESTED',
        oldValue: null,
        newValue: true
      }]
    };
  }
}

/**
 * RESTART action handler
 * Restarts the game from the beginning
 */
export class RestartAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    return {
      success: true,
      message: "Do you wish to restart? (Y is affirmative): ",
      stateChanges: [{
        type: 'RESTART_REQUESTED',
        oldValue: null,
        newValue: true
      }]
    };
  }
}

/**
 * VERBOSE action handler
 * Sets verbose mode (always show full room descriptions)
 */
export class VerboseAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    state.setGlobalVariable('VERBOSE', true);
    state.setGlobalVariable('SUPER_BRIEF', false);
    
    return {
      success: true,
      message: "Maximum verbosity.",
      stateChanges: [{
        type: 'VERBOSITY_CHANGED',
        oldValue: null,
        newValue: 'VERBOSE'
      }]
    };
  }
}

/**
 * BRIEF action handler
 * Sets brief mode (show full descriptions only on first visit)
 */
export class BriefAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    state.setGlobalVariable('VERBOSE', false);
    state.setGlobalVariable('SUPER_BRIEF', false);
    
    return {
      success: true,
      message: "Brief descriptions.",
      stateChanges: [{
        type: 'VERBOSITY_CHANGED',
        oldValue: null,
        newValue: 'BRIEF'
      }]
    };
  }
}

/**
 * SUPERBRIEF action handler
 * Sets superbrief mode (never show full descriptions)
 */
export class SuperBriefAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    state.setGlobalVariable('SUPER_BRIEF', true);
    state.setGlobalVariable('VERBOSE', false);
    
    return {
      success: true,
      message: "Superbrief descriptions.",
      stateChanges: [{
        type: 'VERBOSITY_CHANGED',
        oldValue: null,
        newValue: 'SUPERBRIEF'
      }]
    };
  }
}

/**
 * WAIT action handler
 * Passes time in the game
 */
export class WaitAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    // Increment moves counter
    state.incrementMoves();
    
    return {
      success: true,
      message: "Time passes...",
      stateChanges: [{
        type: 'TIME_PASSED',
        oldValue: null,
        newValue: 1
      }]
    };
  }
}

/**
 * YELL action handler
 * Player yells
 */
export class YellAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    return {
      success: true,
      message: "Aaaarrrrgggghhhh!",
      stateChanges: []
    };
  }
}

/**
 * JUMP action handler
 * Player jumps
 */
export class JumpAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    return {
      success: true,
      message: "Wheeeeeeeeee!!!!",
      stateChanges: []
    };
  }
}

/**
 * PRAY action handler
 * Player prays
 */
export class PrayAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    return {
      success: true,
      message: "If you pray enough, your prayers may be answered.",
      stateChanges: []
    };
  }
}

/**
 * HELLO action handler
 * Player says hello
 */
export class HelloAction implements ActionHandler {
  execute(state: GameState): ActionResult {
    const greetings = [
      "Hello.",
      "Good day.",
      "Nice weather we've been having lately.",
      "Goodbye."
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      success: true,
      message: greeting,
      stateChanges: []
    };
  }
}

/**
 * CLIMB action handler
 * Player attempts to climb something
 */
export class ClimbAction implements ActionHandler {
  execute(state: GameState, objectId?: string): ActionResult {
    if (!objectId) {
      return {
        success: false,
        message: "You can't go that way.",
        stateChanges: []
      };
    }

    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for rainbow
    if (objectId === 'RAINBOW') {
      const { RainbowPuzzle } = require('./puzzles.js');
      return RainbowPuzzle.climbRainbow(state);
    }

    // Special handling for rope
    if (objectId === 'ROPE') {
      const { RopeBasketPuzzle } = require('./puzzles.js');
      return RopeBasketPuzzle.climbRope(state);
    }

    // Check if object has CLIMBBIT flag
    if (!obj.hasFlag(ObjectFlag.CLIMBBIT)) {
      return {
        success: false,
        message: "You can't climb that!",
        stateChanges: []
      };
    }

    return {
      success: false,
      message: "You can't do that!",
      stateChanges: []
    };
  }
}

/**
 * PUSH action handler
 * Player pushes something
 */
export class PushAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for coffin
    if (objectId === 'COFFIN') {
      const { CoffinPuzzle } = require('./puzzles.js');
      return CoffinPuzzle.pushCoffin(state);
    }

    return {
      success: false,
      message: `Pushing the ${obj.name.toLowerCase()} has no effect.`,
      stateChanges: []
    };
  }
}

/**
 * PULL action handler
 * Player pulls something
 */
export class PullAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    return {
      success: false,
      message: `Pulling the ${obj.name.toLowerCase()} has no effect.`,
      stateChanges: []
    };
  }
}

/**
 * TURN action handler
 * Player turns something
 */
export class TurnAction implements ActionHandler {
  execute(state: GameState, objectId: string, toolId?: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object has TURNBIT flag
    if (!obj.hasFlag(ObjectFlag.TURNBIT)) {
      return {
        success: false,
        message: "This has no effect.",
        stateChanges: []
      };
    }

    // Special handling for bolt (dam puzzle)
    if (objectId === 'BOLT') {
      const { DamPuzzle } = require('./puzzles.js');
      return DamPuzzle.turnBolt(state, toolId || '');
    }

    return {
      success: false,
      message: "This has no effect.",
      stateChanges: []
    };
  }
}

/**
 * SHAKE action handler
 * Player shakes something
 */
export class ShakeAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if object is takeable
    if (!obj.hasFlag(ObjectFlag.TAKEBIT)) {
      return {
        success: false,
        message: "You can't take it; thus, you can't shake it!",
        stateChanges: []
      };
    }

    // Check if it's a container
    if (obj.hasFlag(ObjectFlag.CONTBIT)) {
      // Check if it's open
      if (obj.hasFlag(ObjectFlag.OPENBIT)) {
        // Check if it has contents
        const hasContents = Array.from(state.objects.values()).some(
          o => o.location === objectId
        );
        
        if (hasContents) {
          return {
            success: true,
            message: `The contents of the ${obj.name.toLowerCase()} spill to the ground.`,
            stateChanges: []
          };
        }
      } else {
        // Closed container
        const hasContents = Array.from(state.objects.values()).some(
          o => o.location === objectId
        );
        
        if (hasContents) {
          return {
            success: true,
            message: `It sounds like there is something inside the ${obj.name.toLowerCase()}.`,
            stateChanges: []
          };
        } else {
          return {
            success: true,
            message: `The ${obj.name.toLowerCase()} sounds empty.`,
            stateChanges: []
          };
        }
      }
    }

    return {
      success: true,
      message: "Shaken.",
      stateChanges: []
    };
  }
}

/**
 * THROW action handler
 * Player throws something
 */
export class ThrowAction implements ActionHandler {
  execute(state: GameState, objectId: string, targetId?: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if player is holding the object
    if (!state.isInInventory(objectId)) {
      return {
        success: false,
        message: `You're not carrying the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Drop the object in the current room
    const currentRoom = state.getCurrentRoom();
    if (currentRoom) {
      state.moveObject(objectId, currentRoom.id);
    }

    return {
      success: true,
      message: "Thrown.",
      stateChanges: [{
        type: 'OBJECT_MOVED',
        objectId: objectId,
        oldValue: 'PLAYER',
        newValue: currentRoom?.id || ''
      }]
    };
  }
}

/**
 * LISTEN action handler
 * Player listens
 */
export class ListenAction implements ActionHandler {
  execute(state: GameState, objectId?: string): ActionResult {
    if (objectId) {
      const obj = state.getObject(objectId);
      if (!obj) {
        return {
          success: false,
          message: "You can't see that here.",
          stateChanges: []
        };
      }
      return {
        success: true,
        message: `The ${obj.name.toLowerCase()} makes no sound.`,
        stateChanges: []
      };
    }

    return {
      success: true,
      message: "You hear nothing unusual.",
      stateChanges: []
    };
  }
}

/**
 * SMELL action handler
 * Player smells something
 */
export class SmellAction implements ActionHandler {
  execute(state: GameState, objectId?: string): ActionResult {
    if (objectId) {
      const obj = state.getObject(objectId);
      if (!obj) {
        return {
          success: false,
          message: "You can't see that here.",
          stateChanges: []
        };
      }
      return {
        success: true,
        message: `It smells like a ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    return {
      success: true,
      message: "You smell nothing unusual.",
      stateChanges: []
    };
  }
}

/**
 * TOUCH action handler
 * Player touches something
 */
export class TouchAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    return {
      success: true,
      message: `You feel nothing unexpected.`,
      stateChanges: []
    };
  }
}

/**
 * RUB action handler
 * Player rubs something
 */
export class RubAction implements ActionHandler {
  execute(state: GameState, objectId: string, toolId?: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for mirror
    if (objectId === 'MIRROR-1' || objectId === 'MIRROR-2') {
      const { MirrorPuzzle } = require('./puzzles.js');
      return MirrorPuzzle.rubMirror(state, objectId, toolId);
    }

    return {
      success: false,
      message: `Fiddling with the ${obj.name.toLowerCase()} has no effect.`,
      stateChanges: []
    };
  }
}

/**
 * WAVE action handler
 * Player waves something (used for sceptre/rainbow puzzle)
 */
export class WaveAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if player is holding the object
    if (!state.isInInventory(objectId)) {
      return {
        success: false,
        message: `You're not carrying the ${obj.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Special handling for sceptre (rainbow puzzle)
    if (objectId === 'SCEPTRE') {
      const { RainbowPuzzle } = require('./puzzles.js');
      return RainbowPuzzle.waveSceptre(state, objectId);
    }

    return {
      success: true,
      message: `Waving the ${obj.name.toLowerCase()} has no effect.`,
      stateChanges: []
    };
  }
}

/**
 * TIE action handler
 * Player ties something (used for rope puzzle)
 */
export class TieAction implements ActionHandler {
  execute(state: GameState, objectId: string, targetId?: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (!targetId) {
      return {
        success: false,
        message: "What do you want to tie it to?",
        stateChanges: []
      };
    }

    // Special handling for rope
    if (objectId === 'ROPE') {
      const { RopeBasketPuzzle } = require('./puzzles.js');
      return RopeBasketPuzzle.tieRope(state, objectId, targetId);
    }

    return {
      success: false,
      message: "You can't tie that.",
      stateChanges: []
    };
  }
}

/**
 * RAISE action handler
 * Player raises something (used for basket puzzle)
 */
export class RaiseAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for basket
    if (objectId === 'BASKET' || objectId === 'RAISED-BASKET' || objectId === 'LOWERED-BASKET') {
      const { RopeBasketPuzzle } = require('./puzzles.js');
      return RopeBasketPuzzle.raiseBasket(state);
    }

    return {
      success: false,
      message: `Playing in this way with the ${obj.name.toLowerCase()} is unlikely to have any effect.`,
      stateChanges: []
    };
  }
}

/**
 * LOWER action handler
 * Player lowers something (used for basket puzzle)
 */
export class LowerAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for basket
    if (objectId === 'BASKET' || objectId === 'RAISED-BASKET' || objectId === 'LOWERED-BASKET') {
      const { RopeBasketPuzzle } = require('./puzzles.js');
      return RopeBasketPuzzle.lowerBasket(state);
    }

    return {
      success: false,
      message: `Playing in this way with the ${obj.name.toLowerCase()} is unlikely to have any effect.`,
      stateChanges: []
    };
  }
}

/**
 * PUSH action handler (enhanced for buttons)
 * Player pushes something
 */
export class PushButtonAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for maintenance room buttons
    if (objectId === 'BLUE-BUTTON' || objectId === 'BROWN-BUTTON' || objectId === 'YELLOW-BUTTON') {
      const { DamPuzzle } = require('./puzzles.js');
      return DamPuzzle.pushButton(state, objectId);
    }

    return {
      success: false,
      message: `Pushing the ${obj.name.toLowerCase()} has no effect.`,
      stateChanges: []
    };
  }
}

/**
 * UNLOCK action handler
 * Player unlocks something with a key
 */
export class UnlockAction implements ActionHandler {
  execute(state: GameState, objectId: string, keyId?: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    if (!keyId) {
      return {
        success: false,
        message: "What do you want to unlock it with?",
        stateChanges: []
      };
    }

    // Special handling for grating
    if (objectId === 'GRATE' || objectId === 'GRATING') {
      const { GratingPuzzle } = require('./puzzles.js');
      return GratingPuzzle.unlockGrating(state, keyId);
    }

    // Check if object is a door or container
    if (!obj.hasFlag(ObjectFlag.DOORBIT) && !obj.hasFlag(ObjectFlag.CONTBIT)) {
      return {
        success: false,
        message: "You can't unlock that.",
        stateChanges: []
      };
    }

    return {
      success: false,
      message: "You don't have the right key.",
      stateChanges: []
    };
  }
}

/**
 * MOVE action handler (for objects, not directions)
 * Player moves something
 */
export class MoveObjectAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for rug (trap door puzzle)
    if (objectId === 'RUG' || objectId === 'CARPET') {
      const { TrapDoorPuzzle } = require('./puzzles.js');
      return TrapDoorPuzzle.moveRug(state);
    }

    // Special handling for leaves (grating puzzle)
    if (objectId === 'LEAVES' || objectId === 'PILE') {
      const { GratingPuzzle } = require('./puzzles.js');
      return GratingPuzzle.revealGrating(state);
    }

    // Special handling for coffin
    if (objectId === 'COFFIN') {
      const { CoffinPuzzle } = require('./puzzles.js');
      return CoffinPuzzle.pushCoffin(state);
    }

    return {
      success: false,
      message: `You can't move the ${obj.name.toLowerCase()}.`,
      stateChanges: []
    };
  }
}

/**
 * INFLATE action handler
 * Player inflates something
 */
export class InflateAction implements ActionHandler {
  execute(state: GameState, objectId: string, toolId?: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for boat
    if (objectId === 'BOAT' || objectId === 'INFLATABLE-BOAT') {
      const { BoatPuzzle } = require('./puzzles.js');
      return BoatPuzzle.inflateBoat(state, objectId, toolId || '');
    }

    return {
      success: false,
      message: "How can you inflate that?",
      stateChanges: []
    };
  }
}

/**
 * DEFLATE action handler
 * Player deflates something
 */
export class DeflateAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId);
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Special handling for boat
    if (objectId === 'BOAT' || objectId === 'INFLATED-BOAT') {
      const { BoatPuzzle } = require('./puzzles.js');
      return BoatPuzzle.deflateBoat(state);
    }

    return {
      success: false,
      message: "Come on, now!",
      stateChanges: []
    };
  }
}

/**
 * SAY action handler
 * Player says a word or phrase
 */
export class SayAction implements ActionHandler {
  execute(state: GameState, word: string): ActionResult {
    if (!word) {
      return {
        success: false,
        message: "What do you want to say?",
        stateChanges: []
      };
    }

    // Special handling for magic word
    const { MagicWordPuzzle } = require('./puzzles.js');
    return MagicWordPuzzle.sayMagicWord(state, word);
  }
}
