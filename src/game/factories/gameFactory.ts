/**
 * Game Factory
 * Main factory for creating complete game state with all rooms and objects
 */

import { GameState } from '../state.js';
import { createAllRooms } from './roomFactory.js';
import { createAllObjects, placeObjectsInRooms } from './objectFactory.js';
import { ALL_ROOMS } from '../data/rooms-complete.js';
import { ALL_OBJECTS } from '../data/objects-complete.js';
import { initializeConditionalMessages } from '../conditionalMessages.js';
import { TrollBehavior } from '../../engine/troll.js';
import { ThiefBehavior } from '../../engine/thief.js';
import { CyclopsBehavior } from '../../engine/cyclops.js';
import { initializeSwordGlow } from '../../engine/weapons.js';
import { combatDaemon } from '../../engine/combat.js';
import { VILLAIN_DATA } from '../../engine/villainData.js';

/**
 * Create a complete initial game state with all rooms and objects
 * This is the main entry point for initializing the game world
 */
export function createInitialGameState(): GameState {
  // Create all objects first
  const objects = createAllObjects(ALL_OBJECTS);
  
  // Create the game state with objects (but no rooms yet)
  const gameState = new GameState();
  for (const [id, obj] of objects.entries()) {
    gameState.objects.set(id, obj);
  }
  
  // Now create all rooms with the actual game state for condition evaluation
  const rooms = createAllRooms(ALL_ROOMS, gameState);
  
  // Add rooms to the game state
  for (const [id, room] of rooms.entries()) {
    gameState.rooms.set(id, room);
  }
  
  // Place objects in their initial rooms
  placeObjectsInRooms(objects, rooms);
  
  // Set initial room
  gameState.currentRoom = 'WEST-OF-HOUSE';
  
  // Initialize conditional messages
  initializeConditionalMessages();
  
  // Register NPC actor behaviors
  const trollBehavior = new TrollBehavior();
  const thiefBehavior = new ThiefBehavior();
  const cyclopsBehavior = new CyclopsBehavior();
  
  gameState.actorManager.registerActor(trollBehavior);
  gameState.actorManager.registerActor(thiefBehavior);
  gameState.actorManager.registerActor(cyclopsBehavior);
  
  // Initialize actors to set initial flags
  trollBehavior.initialize(gameState);
  thiefBehavior.initialize(gameState);
  cyclopsBehavior.initialize(gameState);
  
  // Initialize sword glow daemon
  initializeSwordGlow(gameState);
  
  // Register combat daemon - handles villain attacks each turn
  gameState.eventSystem.registerDaemon('combat', (state) => combatDaemon(state, VILLAIN_DATA));
  
  return gameState;
}

/**
 * Get count of rooms created
 */
export function getRoomCount(): number {
  return Object.keys(ALL_ROOMS).length;
}

/**
 * Get count of objects created
 */
export function getObjectCount(): number {
  return Object.keys(ALL_OBJECTS).length;
}

/**
 * Validate that all rooms are properly connected
 * Returns array of validation errors
 */
export function validateRoomConnections(state: GameState): string[] {
  const errors: string[] = [];
  
  for (const [roomId, room] of state.rooms.entries()) {
    for (const [direction, exit] of room.exits.entries()) {
      if (exit.destination && !state.rooms.has(exit.destination)) {
        errors.push(`Room ${roomId} has exit ${direction} to non-existent room ${exit.destination}`);
      }
    }
  }
  
  return errors;
}

/**
 * Validate that all objects are in valid locations
 * Returns array of validation errors
 */
export function validateObjectLocations(state: GameState): string[] {
  const errors: string[] = [];
  
  for (const [objectId, obj] of state.objects.entries()) {
    if (obj.location) {
      // Check if location is a room
      if (!state.rooms.has(obj.location) && !state.objects.has(obj.location)) {
        errors.push(`Object ${objectId} has invalid location ${obj.location}`);
      }
    }
  }
  
  return errors;
}
