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
      const objectId = condition.replace(' IS OPEN', '');
      // Get the object each time the condition is checked, not just once
      const obj = state.getObject(objectId);
      if (obj) {
        return obj.isOpen();
      }
      // Fallback: check for a flag with the same name
      const flagName = objectId.replace(/-/g, '_') + '_OPEN';
      return state.getFlag(flagName);
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
  // Note: When there are multiple exits in the same direction with different conditions,
  // we need to check them in order and use the first one whose condition is met.
  // To handle this, we'll create a composite condition that checks all exits for that direction.
  const exitsByDirection = new Map<Direction, Array<{exit: Exit, condition?: () => boolean}>>();
  
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
    const condition = exitData.condition ? createConditionFunction(exitData.condition, state) : undefined;

    // Group exits by direction
    if (!exitsByDirection.has(direction)) {
      exitsByDirection.set(direction, []);
    }
    exitsByDirection.get(direction)!.push({ exit, condition });
  }
  
  // Now create the final exits map, handling multiple exits per direction
  const exits = new Map<Direction, Exit>();
  for (const [direction, exitList] of exitsByDirection.entries()) {
    if (exitList.length === 1) {
      // Simple case: only one exit for this direction
      const { exit, condition } = exitList[0];
      if (condition) {
        exit.condition = condition;
      }
      exits.set(direction, exit);
    } else {
      // Multiple exits for this direction - create a composite exit
      // The condition checks all exits in order and uses the first available one
      const compositeExit: Exit = {
        destination: '',
        message: '',
        condition: () => {
          // Find the first exit whose condition is met (or has no condition)
          for (const { exit, condition } of exitList) {
            if (!condition || condition()) {
              // Update the composite exit's destination and message
              compositeExit.destination = exit.destination;
              compositeExit.message = exit.message;
              return true;
            }
          }
          return false;
        }
      };
      exits.set(direction, compositeExit);
    }
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
    globalObjects: roomData.globalObjects,
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
