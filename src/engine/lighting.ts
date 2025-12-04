/**
 * Lighting System
 * Handles room darkness detection, light sources, and grue encounters
 * Ported from ZIL LIT? routine in gparser.zil
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { Room } from '../game/rooms.js';
import { ObjectFlag, RoomFlag } from '../game/data/flags.js';

/**
 * Check if a room is lit
 * Based on ZIL LIT? routine from gparser.zil
 * 
 * A room is lit if:
 * 1. The room has the ONBIT flag (inherently lit)
 * 2. There is a light source with LIGHTBIT and ONBIT in the room
 * 3. The player is carrying a light source with LIGHTBIT and ONBIT
 * 
 * @param state - Current game state
 * @param roomId - Room to check (defaults to current room)
 * @returns true if the room is lit, false if dark
 */
export function isRoomLit(state: GameState, roomId?: string): boolean {
  const room = roomId ? state.getRoom(roomId) : state.getCurrentRoom();
  if (!room) {
    return false;
  }

  // Check if room is inherently lit (has ONBIT flag)
  if (room.hasFlag(RoomFlag.ONBIT)) {
    return true;
  }

  // Check for light sources in the room or carried by player
  return hasLightSource(state, room);
}

/**
 * Check if there are any active light sources in the room or inventory
 * 
 * @param state - Current game state
 * @param room - Room to check
 * @returns true if there is an active light source
 */
function hasLightSource(state: GameState, room: Room): boolean {
  // Check player inventory for light sources
  const inventoryObjects = state.getInventoryObjects();
  for (const obj of inventoryObjects) {
    if (isActiveLightSource(obj)) {
      return true;
    }
  }

  // Check objects in the room for light sources
  const roomObjects = room.objects
    .map(id => state.getObject(id))
    .filter((obj): obj is GameObject => obj !== undefined);
  
  for (const obj of roomObjects) {
    if (isActiveLightSource(obj)) {
      return true;
    }
  }

  // Check objects inside containers in the room (if container is open and transparent)
  for (const obj of roomObjects) {
    if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.OPENBIT)) {
      const contents = state.getObjectsInContainer(obj.id);
      for (const contentObj of contents) {
        if (isActiveLightSource(contentObj)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if an object is an active light source
 * An object is an active light source if it has both LIGHTBIT and ONBIT flags
 * 
 * @param obj - Object to check
 * @returns true if object is an active light source
 */
export function isActiveLightSource(obj: GameObject): boolean {
  return obj.hasFlag(ObjectFlag.LIGHTBIT) && obj.hasFlag(ObjectFlag.ONBIT);
}

/**
 * Get the "pitch black" message for dark rooms
 * Based on ZIL V-LOOK routine in gverbs.zil
 * 
 * @returns The darkness message
 */
export function getDarknessMessage(): string {
  return "It is pitch black. You are likely to be eaten by a grue.";
}

/**
 * Check if the player should be eaten by a grue
 * This happens when the player tries to move in the dark
 * Based on ZIL GOTO routine in gverbs.zil
 * 
 * @param state - Current game state
 * @returns true if player is eaten by grue
 */
export function checkGrueAttack(state: GameState): boolean {
  const currentRoom = state.getCurrentRoom();
  if (!currentRoom) {
    return false;
  }

  // Grue only attacks in dark rooms
  if (isRoomLit(state)) {
    return false;
  }

  // Grue attack happens (this is called when player moves in darkness)
  return true;
}

/**
 * Get the grue attack message
 * Based on ZIL JIGS-UP messages in gverbs.zil
 * 
 * @returns The grue attack message
 */
export function getGrueAttackMessage(): string {
  return "Oh, no! You have walked into the slavering fangs of a lurking grue!";
}

/**
 * Get the message for entering a dark room
 * Based on ZIL GOTO routine in gverbs.zil
 * 
 * @returns The dark room entry message
 */
export function getDarkRoomEntryMessage(): string {
  return "You have moved into a dark place.";
}

/**
 * Get the message for trying to examine something in the dark
 * Based on ZIL V-LOOK routine in gverbs.zil
 * 
 * @returns The message for examining in darkness
 */
export function getCannotSeeInDarkMessage(): string {
  return "It's too dark to see!";
}

/**
 * Get the message for trying to read in the dark
 * Based on ZIL PRE-READ routine in gverbs.zil
 * 
 * @returns The message for reading in darkness
 */
export function getCannotReadInDarkMessage(): string {
  return "It is impossible to read in the dark.";
}

/**
 * Get the message when a light goes out
 * Based on ZIL V-LAMP-OFF and other routines in gverbs.zil
 * 
 * @returns The message when entering darkness
 */
export function getLightWentOutMessage(): string {
  return "You are left in the dark...";
}

/**
 * Get the message when turning off a light makes the room dark
 * Based on ZIL V-LAMP-OFF routine in gverbs.zil
 * 
 * @returns The pitch black message
 */
export function getNowPitchBlackMessage(): string {
  return "It is now pitch black.";
}

/**
 * Check if turning off a light source will make the room dark
 * 
 * @param state - Current game state
 * @param lightSourceId - ID of the light source being turned off
 * @returns true if room will become dark
 */
export function willRoomBecomeDark(state: GameState, lightSourceId: string): boolean {
  const currentRoom = state.getCurrentRoom();
  if (!currentRoom) {
    return false;
  }

  // If room is inherently lit, it won't become dark
  if (currentRoom.hasFlag(RoomFlag.ONBIT)) {
    return false;
  }

  // Check if there are other light sources
  const inventoryObjects = state.getInventoryObjects();
  for (const obj of inventoryObjects) {
    if (obj.id !== lightSourceId && isActiveLightSource(obj)) {
      return false;
    }
  }

  const roomObjects = currentRoom.objects
    .map(id => state.getObject(id))
    .filter((obj): obj is GameObject => obj !== undefined);
  
  for (const obj of roomObjects) {
    if (obj.id !== lightSourceId && isActiveLightSource(obj)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an object is a permanent flame (like the torch)
 * These objects cannot be turned off
 * 
 * @param obj - Object to check
 * @returns true if object is a permanent flame
 */
export function isPermanentFlame(obj: GameObject): boolean {
  return obj.hasFlag(ObjectFlag.FLAMEBIT);
}

/**
 * Check if light source can be turned off
 * Only permanent flames (with FLAMEBIT) cannot be turned off
 * 
 * @param obj - Object to check
 * @returns true if light source can be turned off
 */
export function canTurnOffLight(obj: GameObject): boolean {
  // Can't turn off permanent flames (torch)
  if (isPermanentFlame(obj)) {
    return false;
  }
  
  return true;
}
