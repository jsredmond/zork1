/**
 * Room Factory
 * Creates all room instances from extracted data
 */

import { RoomImpl, Direction, Exit } from '../rooms.js';
import { RoomData } from '../data/rooms.js';
import { RoomFlag } from '../data/flags.js';
import { GameState } from '../state.js';

/**
 * Convert string direction to Direction enum
 */
function parseDirection(dir: string): Direction | null {
  const dirMap: Record<string, Direction> = {
    'NORTH': Direction.NORTH,
    'SOUTH': Direction.SOUTH,
    'EAST': Direction.EAST,
    'WEST': Direction.WEST,
    'NE': Direction.NE,
    'NW': Direction.NW,
    'SE': Direction.SE,
    'SW': Direction.SW,
    'UP': Direction.UP,
    'DOWN': Direction.DOWN,
    'IN': Direction.IN,
    'OUT': Direction.OUT,
  };
  return dirMap[dir] || null;
}

/**
 * Convert string flag to RoomFlag enum
 */
function parseRoomFlag(flag: string): RoomFlag | null {
  const flagMap: Record<string, RoomFlag> = {
    'RLANDBIT': RoomFlag.RLANDBIT,
    'ONBIT': RoomFlag.ONBIT,
    'SACREDBIT': RoomFlag.SACREDBIT,
    'MAZEBIT': RoomFlag.MAZEBIT,
    'NONLANDBIT': RoomFlag.NONLANDBIT,
  };
  return flagMap[flag] || null;
}

/**
 * Create a condition function from a condition string
 */
function createConditionFunction(condition: string, state: GameState): (() => boolean) | undefined {
  if (!condition) {
    return undefined;
  }

  // Parse common condition patterns from ZIL
  // Examples: "WON-FLAG", "KITCHEN-WINDOW IS OPEN", "TROLL-FLAG"
  
  return () => {
    // Handle flag conditions
    if (condition === 'WON-FLAG') {
      return state.getFlag('WON_FLAG');
    }
    if (condition === 'TROLL-FLAG') {
      return state.getFlag('TROLL_FLAG');
    }
    if (condition === 'CYCLOPS-FLAG') {
      return state.getFlag('CYCLOPS_FLAG');
    }
    if (condition === 'LOW-TIDE') {
      return state.getFlag('LOW_TIDE');
    }
    if (condition === 'MAGIC-FLAG') {
      return state.getFlag('MAGIC_FLAG');
    }
    if (condition === 'RAINBOW-FLAG') {
      return state.getFlag('RAINBOW_FLAG');
    }
    if (condition === 'LLD-FLAG') {
      return state.getFlag('LLD_FLAG');
    }
    if (condition === 'DOME-FLAG') {
      return state.getFlag('DOME_FLAG');
    }
    
    // Handle object state conditions (e.g., "KITCHEN-WINDOW IS OPEN", "TRAP-DOOR IS OPEN")
    if (condition.includes(' IS OPEN')) {
      const objectId = condition.replace(' IS OPEN', '').replace(/-/g, '-');
      const obj = state.getObject(objectId);
      return obj ? obj.isOpen() : false;
    }
    
    // Default to false for unknown conditions
    return false;
  };
}

/**
 * Create a single room instance from room data
 */
export function createRoom(roomData: RoomData, state: GameState): RoomImpl {
  // Parse exits
  const exits = new Map<Direction, Exit>();
  for (const exitData of roomData.exits) {
    const direction = parseDirection(exitData.direction);
    if (!direction) {
      continue;
    }

    const exit: Exit = {
      destination: exitData.destination,
      message: exitData.message,
    };

    // Add condition function if specified
    if (exitData.condition) {
      exit.condition = createConditionFunction(exitData.condition, state);
    }

    exits.set(direction, exit);
  }

  // Parse flags
  const flags: RoomFlag[] = [];
  for (const flagStr of roomData.flags) {
    const flag = parseRoomFlag(flagStr);
    if (flag !== null) {
      flags.push(flag);
    }
  }

  // Use long description if available, otherwise use description
  const description = roomData.longDescription || roomData.description;

  // Create room instance
  return new RoomImpl({
    id: roomData.id,
    name: roomData.name,
    description,
    exits,
    objects: [], // Objects will be added during object initialization
    visited: false,
    flags,
  });
}

/**
 * Create all room instances from room data
 */
export function createAllRooms(roomsData: Record<string, RoomData>, state: GameState): Map<string, RoomImpl> {
  const rooms = new Map<string, RoomImpl>();

  for (const [id, roomData] of Object.entries(roomsData)) {
    const room = createRoom(roomData, state);
    rooms.set(id, room);
  }

  return rooms;
}
