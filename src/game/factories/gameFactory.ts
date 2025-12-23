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
import { initializeSwordGlow, swordGlowDaemon } from '../../engine/weapons.js';
import { combatDaemon } from '../../engine/combat.js';
import { VILLAIN_DATA } from '../../engine/villainData.js';
import { lampTimerInterrupt, candleTimerInterrupt, forestRoomDaemon, isForestRoom } from '../../engine/daemons.js';

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
  gameState.setCurrentRoom('WEST-OF-HOUSE');
  
  // Initialize global variables
  gameState.setGlobalVariable('LOAD_MAX', 100);
  gameState.setGlobalVariable('LOAD_ALLOWED', 100);
  gameState.setGlobalVariable('LUCKY', true);  // Player starts with luck
  gameState.setGlobalVariable('DEATHS', 0);    // Death counter
  gameState.setGlobalVariable('LAMP_FUEL', 200); // Initial lamp fuel from ZIL
  gameState.setGlobalVariable('CANDLE_FUEL', 40); // Initial candle fuel from ZIL
  gameState.setGlobalVariable('VERBOSE', false); // Default to brief mode
  gameState.setGlobalVariable('SUPER_BRIEF', false); // Not superbrief by default
  
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
  
  // Register daemons in ZIL order: I-FIGHT, I-SWORD, I-THIEF, I-CANDLES, I-LANTERN
  
  // 1. Register combat daemon (I-FIGHT) - handles villain attacks each turn
  gameState.eventSystem.registerDaemon('combat', (state) => combatDaemon(state, VILLAIN_DATA));
  
  // 2. Register sword glow daemon (I-SWORD) - makes sword glow near enemies
  gameState.eventSystem.registerDaemon('I-SWORD', (state) => {
    return swordGlowDaemon(state);
  }, true);
  
  // 3. Register thief daemon (I-THIEF) - thief movement and behavior
  gameState.eventSystem.registerDaemon('I-THIEF', (state) => {
    return state.actorManager.getActor('THIEF')?.executeTurn(state) || false;
  }, true);
  
  // 4. Register candle timer interrupt (I-CANDLES) - scheduled when candles are lit
  gameState.eventSystem.registerInterrupt('I-CANDLES', (state) => {
    return candleTimerInterrupt(state);
  }, 0); // Will be scheduled when candles are lit
  
  // 5. Register lamp timer interrupt (I-LANTERN) - scheduled when lamp is turned on
  gameState.eventSystem.registerInterrupt('I-LANTERN', (state) => {
    return lampTimerInterrupt(state);
  }, 0); // Will be scheduled when lamp is turned on
  
  // 6. Register forest room daemon (I-FOREST-ROOM) - atmospheric songbird messages
  // Starts enabled if player begins in a forest room (they don't - they start at WEST-OF-HOUSE)
  gameState.eventSystem.registerDaemon('I-FOREST-ROOM', (state) => {
    return forestRoomDaemon(state);
  }, isForestRoom(gameState)); // Enable only if starting in forest room
  
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
