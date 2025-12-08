/**
 * Object Factory
 * Creates all object instances from extracted data
 */

import { GameObjectImpl, LocationRelation } from '../objects.js';
import { ObjectData } from '../data/objects.js';
import { ObjectFlag } from '../data/flags.js';

/**
 * Convert string flag to ObjectFlag enum
 */
function parseObjectFlag(flag: string): ObjectFlag | null {
  const flagMap: Record<string, ObjectFlag> = {
    'TAKEBIT': ObjectFlag.TAKEBIT,
    'CONTBIT': ObjectFlag.CONTBIT,
    'OPENBIT': ObjectFlag.OPENBIT,
    'LIGHTBIT': ObjectFlag.LIGHTBIT,
    'ONBIT': ObjectFlag.ONBIT,
    'WEAPONBIT': ObjectFlag.WEAPONBIT,
    'ACTORBIT': ObjectFlag.ACTORBIT,
    'DOORBIT': ObjectFlag.DOORBIT,
    'BURNBIT': ObjectFlag.BURNBIT,
    'FOODBIT': ObjectFlag.FOODBIT,
    'DRINKBIT': ObjectFlag.DRINKBIT,
    'NDESCBIT': ObjectFlag.NDESCBIT,
    'INVISIBLE': ObjectFlag.INVISIBLE,
    'TRANSBIT': ObjectFlag.TRANSBIT,
    'READBIT': ObjectFlag.READBIT,
    'SURFACEBIT': ObjectFlag.SURFACEBIT,
    'TOOLBIT': ObjectFlag.TOOLBIT,
    'TURNBIT': ObjectFlag.TURNBIT,
    'CLIMBBIT': ObjectFlag.CLIMBBIT,
    'SACREDBIT': ObjectFlag.SACREDBIT,
    'VEHBIT': ObjectFlag.VEHBIT,
    'TRYTAKEBIT': ObjectFlag.TRYTAKEBIT,
    'SEARCHBIT': ObjectFlag.SEARCHBIT,
    'FLAMEBIT': ObjectFlag.FLAMEBIT,
  };
  return flagMap[flag] || null;
}

/**
 * Create a single object instance from object data
 */
export function createObject(objectData: ObjectData): GameObjectImpl {
  // Parse flags
  const flags: ObjectFlag[] = [];
  for (const flagStr of objectData.flags) {
    const flag = parseObjectFlag(flagStr);
    if (flag !== null) {
      flags.push(flag);
    }
  }

  // Determine initial location
  // Handle special locations like LOCAL-GLOBALS, GLOBAL-OBJECTS
  let location: string | null = objectData.initialLocation;
  if (location === 'LOCAL-GLOBALS' || location === 'GLOBAL-OBJECTS') {
    location = null; // These are special pseudo-locations
  }
  if (location === '') {
    location = null;
  }

  // Create properties map
  const properties = new Map<string, any>();
  
  // Add optional properties
  if (objectData.text) {
    properties.set('text', objectData.text);
  }
  if (objectData.treasureValue !== undefined) {
    properties.set('treasureValue', objectData.treasureValue);
  }
  if (objectData.strength !== undefined) {
    properties.set('strength', objectData.strength);
  }
  if (objectData.action) {
    properties.set('action', objectData.action);
  }

  // Create object instance
  return new GameObjectImpl({
    id: objectData.id,
    name: objectData.name,
    synonyms: objectData.synonyms,
    adjectives: objectData.adjectives,
    description: objectData.description,
    firstDescription: objectData.firstDescription,
    longDescription: objectData.longDescription,
    location,
    flags,
    capacity: objectData.capacity,
    size: objectData.size,
    value: objectData.value,
    properties,
  });
}

/**
 * Create all object instances from object data
 */
export function createAllObjects(objectsData: Record<string, ObjectData>): Map<string, GameObjectImpl> {
  const objects = new Map<string, GameObjectImpl>();

  for (const [id, objectData] of Object.entries(objectsData)) {
    const obj = createObject(objectData);
    objects.set(id, obj);
  }

  return objects;
}

/**
 * Place objects in their initial locations
 * This should be called after both rooms and objects are created
 */
export function placeObjectsInRooms(
  objects: Map<string, GameObjectImpl>,
  rooms: Map<string, any>
): void {
  for (const obj of objects.values()) {
    if (obj.location && rooms.has(obj.location)) {
      const room = rooms.get(obj.location);
      if (room) {
        room.addObject(obj.id);
      }
    }
  }
}
