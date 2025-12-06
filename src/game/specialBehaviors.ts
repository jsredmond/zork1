/**
 * Special Behavior Handlers
 * Handles complex state-dependent behaviors for special objects
 */

import { GameState } from './state.js';
import { ActionResult } from './actions.js';

/**
 * Handler function for a special behavior
 * Returns a message string if the behavior applies, or null if it doesn't
 */
export type SpecialBehaviorHandler = (
  verb: string,
  state: GameState,
  ...args: any[]
) => string | null;

/**
 * Condition function to check if a special behavior should be active
 */
export type SpecialBehaviorCondition = (state: GameState) => boolean;

/**
 * SpecialBehavior defines a complex behavior for an object
 */
export interface SpecialBehavior {
  objectId: string;
  condition: SpecialBehaviorCondition;
  handler: SpecialBehaviorHandler;
}

/**
 * Registry of all special behaviors
 */
const specialBehaviors: Map<string, SpecialBehavior[]> = new Map();

/**
 * Register a special behavior for an object
 * Multiple behaviors can be registered for the same object
 */
export function registerSpecialBehavior(behavior: SpecialBehavior): void {
  const existing = specialBehaviors.get(behavior.objectId) || [];
  existing.push(behavior);
  specialBehaviors.set(behavior.objectId, existing);
}

/**
 * Apply special behavior for an object and verb
 * Returns the message to display, or null if no behavior applies
 */
export function applySpecialBehavior(
  objectId: string,
  verb: string,
  state: GameState,
  ...args: any[]
): string | null {
  const behaviors = specialBehaviors.get(objectId);
  
  if (!behaviors) {
    return null;
  }

  // Check each behavior in order until one applies
  for (const behavior of behaviors) {
    // Check if the condition is met
    if (behavior.condition(state)) {
      // Try to handle the action
      const result = behavior.handler(verb, state, ...args);
      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}

/**
 * Check if an object has any special behaviors
 */
export function hasSpecialBehavior(objectId: string): boolean {
  return specialBehaviors.has(objectId);
}

/**
 * Execute a special behavior and return an ActionResult
 */
export function executeSpecialBehavior(
  objectId: string,
  verb: string,
  state: GameState,
  ...args: any[]
): ActionResult | null {
  const message = applySpecialBehavior(objectId, verb, state, ...args);
  
  if (message === null) {
    return null;
  }

  return {
    success: true,
    message: message,
    stateChanges: []
  };
}

// ============================================================================
// Special Behavior Implementations
// ============================================================================

/**
 * WATER special behavior
 * Handles drinking water and taking water with/without containers
 */
const waterBehavior: SpecialBehavior = {
  objectId: 'WATER',
  condition: () => true, // Always active
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    if (verb === 'DRINK') {
      return 'The water is cool and refreshing.';
    }
    
    if (verb === 'TAKE' || verb === 'PUT') {
      const water = state.getObject('WATER');
      
      // Check if player is in a vehicle
      const currentRoom = state.getCurrentRoom();
      if (currentRoom) {
        const objectsInRoom = state.getObjectsInCurrentRoom();
        const vehicle = objectsInRoom.find(obj => obj.hasFlag('VEHBIT'));
        
        // If in a vehicle and trying to take/put water
        if (vehicle && verb === 'TAKE' && !indirectObject) {
          // Create puddle in vehicle
          if (water) {
            state.moveObject('WATER', vehicle.id);
          }
          return 'There is now a puddle in the bottom of the ' + vehicle.name.toLowerCase() + '.';
        }
        
        if (vehicle && verb === 'PUT' && indirectObject === vehicle.id) {
          // Putting water in vehicle
          if (water) {
            state.moveObject('WATER', vehicle.id);
          }
          return 'There is now a puddle in the bottom of the ' + vehicle.name.toLowerCase() + '.';
        }
      }
      
      if (verb === 'TAKE') {
        // Check if water is already in bottle and player is trying to take it
        if (water && water.location === 'BOTTLE' && !indirectObject) {
          return "It's in the bottle. Perhaps you should take that instead.";
        }
        
        // Check if trying to put water in a container
        if (indirectObject) {
          const container = state.getObject(indirectObject);
          
          // Water leaks out of non-bottle containers
          if (container && indirectObject !== 'BOTTLE') {
            state.removeObject('WATER');
            return 'The water leaks out of the ' + container.name.toLowerCase() + ' and evaporates immediately.';
          }
        }
        
        // Check if player has bottle
        const hasBottle = state.isInInventory('BOTTLE');
        
        if (!hasBottle) {
          return 'The water slips through your fingers.';
        }
        
        // Check if bottle is open
        const bottle = state.getObject('BOTTLE');
        if (bottle && !bottle.hasFlag('OPENBIT')) {
          return 'The bottle is closed.';
        }
        
        // Check if bottle is empty
        const bottleContents = state.getObjectsInContainer('BOTTLE');
        if (bottleContents.length > 0) {
          return 'The water slips through your fingers.';
        }
        
        // Fill the bottle
        state.moveObject('WATER', 'BOTTLE');
        return 'The bottle is now full of water.';
      }
    }
    
    if (verb === 'DROP') {
      const water = state.getObject('WATER');
      
      // Check if water is in bottle and bottle is closed
      if (water && water.location === 'BOTTLE') {
        const bottle = state.getObject('BOTTLE');
        if (bottle && !bottle.hasFlag('OPENBIT')) {
          return 'The bottle is closed.';
        }
      }
      
      // Water evaporates when dropped
      state.removeObject('WATER');
      return 'The water spills to the floor and evaporates.';
    }
    
    if (verb === 'PUT' && indirectObject) {
      // Handle putting water into containers
      if (indirectObject !== 'BOTTLE') {
        state.removeObject('WATER');
        const container = state.getObject(indirectObject);
        if (container) {
          return 'The water leaks out of the ' + container.name.toLowerCase() + ' and evaporates immediately.';
        }
      }
    }
    
    if (verb === 'POUR-ON') {
      // Pouring water on torch
      if (indirectObject === 'TORCH') {
        state.removeObject('WATER');
        return 'The water evaporates before it gets close.';
      }
    }
    
    if (verb === 'THROW') {
      // Throwing water
      state.removeObject('WATER');
      return 'The water splashes on the walls and evaporates immediately.';
    }
    
    return null;
  }
};

/**
 * GLOBAL-WATER special behavior
 * Handles interactions with water in streams/reservoirs
 */
const globalWaterBehavior: SpecialBehavior = {
  objectId: 'GLOBAL-WATER',
  condition: (state: GameState) => {
    // Active when in rooms with water sources
    const waterRooms = ['STREAM', 'RESERVOIR', 'RESERVOIR-NORTH', 'RESERVOIR-SOUTH', 'STREAM-VIEW'];
    return waterRooms.includes(state.currentRoom);
  },
  handler: (verb: string, state: GameState) => {
    if (verb === 'DRINK') {
      return 'The water is cool and refreshing.';
    }
    
    if (verb === 'TAKE') {
      // Check if player has bottle
      const hasBottle = state.isInInventory('BOTTLE');
      
      if (!hasBottle) {
        return 'The water slips through your fingers.';
      }
      
      // Check if bottle is open
      const bottle = state.getObject('BOTTLE');
      if (bottle && !bottle.hasFlag('OPENBIT')) {
        return 'The bottle is closed.';
      }
      
      // Check if bottle is empty
      const bottleContents = state.getObjectsInContainer('BOTTLE');
      if (bottleContents.length > 0) {
        return 'The water slips through your fingers.';
      }
      
      // Fill the bottle with water from the source
      state.moveObject('WATER', 'BOTTLE');
      return 'The bottle is now full of water.';
    }
    
    return null;
  }
};

/**
 * GHOSTS special behavior
 * Handles interactions with spirits in the temple
 */
const ghostsBehavior: SpecialBehavior = {
  objectId: 'GHOSTS',
  condition: () => true, // Always active when ghosts are present
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    if (verb === 'EXORCISE') {
      return 'Only the ceremony itself has any effect.';
    }
    
    if (verb === 'ATTACK' || verb === 'KILL') {
      // Check if in kitchen and attacking with material objects
      if (state.currentRoom === 'KITCHEN' && indirectObject) {
        return 'How can you attack a spirit with material objects?';
      }
      return 'The ghosts do not seem to fear you.';
    }
    
    if (verb === 'TELL') {
      return 'The spirits jeer loudly and ignore you.';
    }
    
    // Generic ghostly response for other interactions
    return 'You seem unable to interact with these spirits.';
  }
};

/**
 * BASKET special behaviors
 * Handles interactions with basket when it's at the wrong end
 */
const basketBehavior: SpecialBehavior = {
  objectId: 'LOWERED-BASKET',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE' || verb === 'EXAMINE') {
      return 'The basket is at the other end of the chain.';
    }
    return null;
  }
};

const raisedBasketBehavior: SpecialBehavior = {
  objectId: 'RAISED-BASKET',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE') {
      return 'The cage is securely fastened to the iron chain.';
    }
    return null;
  }
};

/**
 * CANDLES special behavior
 * Handles lighting and extinguishing candles
 */
const candlesBehavior: SpecialBehavior = {
  objectId: 'CANDLES',
  condition: () => true,
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    const candles = state.getObject('CANDLES');
    if (!candles) return null;
    
    const isLit = candles.hasFlag('ONBIT');
    const isRmung = candles.hasFlag('RMUNGBIT');
    
    if (verb === 'LIGHT' || verb === 'BURN') {
      // Check what we're lighting with
      if (indirectObject === 'MATCH') {
        const match = state.getObject('MATCH');
        const matchLit = match && match.hasFlag('ONBIT');
        
        if (matchLit && isLit) {
          return 'The candles are already lit.';
        }
        
        if (matchLit && isRmung) {
          return 'The candles are already lit.';
        }
      }
      
      if (indirectObject === 'TORCH') {
        if (isLit) {
          return 'You realize, just in time, that the candles are already lighted.';
        }
        return 'The heat from the torch is so intense that the candles are vaporized.';
      }
      
      // Generic response for trying to light without proper tool
      if (!indirectObject || (indirectObject !== 'MATCH' && indirectObject !== 'TORCH')) {
        return 'You have to light them with something that\'s burning, you know.';
      }
    }
    
    if (verb === 'EXTINGUISH' || verb === 'TURN-OFF') {
      if (!isLit) {
        return 'The candles are not lighted.';
      }
    }
    
    return null;
  }
};

// Register water behaviors
registerSpecialBehavior(waterBehavior);
registerSpecialBehavior(globalWaterBehavior);

// Register ghost behavior
registerSpecialBehavior(ghostsBehavior);

// Register basket behaviors
registerSpecialBehavior(basketBehavior);
registerSpecialBehavior(raisedBasketBehavior);

// Register candles behavior
registerSpecialBehavior(candlesBehavior);

/**
 * BOTTLE special behavior
 * Handles bottle breaking and water spillage
 */
const bottleBehavior: SpecialBehavior = {
  objectId: 'BOTTLE',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    const bottle = state.getObject('BOTTLE');
    if (!bottle) return null;

    // Check if water is in the bottle
    const water = state.getObject('WATER');
    const hasWater = water && water.location === 'BOTTLE';

    if (verb === 'THROW') {
      // Remove the bottle
      state.removeObject('BOTTLE');
      
      // If water was in bottle, remove it too
      if (hasWater) {
        state.removeObject('WATER');
        return 'The bottle hits the far wall and shatters.\nThe water spills to the floor and evaporates.';
      }
      
      return 'The bottle hits the far wall and shatters.';
    }

    if (verb === 'MUNG' || verb === 'BREAK' || verb === 'ATTACK') {
      // Remove the bottle
      state.removeObject('BOTTLE');
      
      // If water was in bottle, remove it too
      if (hasWater) {
        state.removeObject('WATER');
        return 'A brilliant maneuver destroys the bottle.\nThe water spills to the floor and evaporates.';
      }
      
      return 'A brilliant maneuver destroys the bottle.';
    }
    
    if (verb === 'SHAKE') {
      // Check if bottle is open and has water
      if (bottle.hasFlag('OPENBIT') && hasWater) {
        state.removeObject('WATER');
        return 'The water spills to the floor and evaporates.';
      }
    }

    return null;
  }
};

// Register bottle behavior
registerSpecialBehavior(bottleBehavior);

/**
 * HOT-BELL special behavior
 * Handles interactions with the hot bell
 */
const hotBellBehavior: SpecialBehavior = {
  objectId: 'HOT-BELL',
  condition: () => true,
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    if (verb === 'TAKE') {
      return 'The bell is very hot and cannot be taken.';
    }
    
    if (verb === 'RUB' || (verb === 'RING' && indirectObject)) {
      // Check what we're using
      if (indirectObject) {
        const tool = state.getObject(indirectObject);
        
        // If using something burnable, it gets consumed
        if (tool && tool.hasFlag('BURNBIT')) {
          state.removeObject(indirectObject);
          return `The ${tool.name} burns and is consumed.`;
        }
        
        // If using hands
        if (indirectObject === 'HANDS') {
          return 'The bell is too hot to touch.';
        }
        
        // Using something else
        return 'The heat from the bell is too intense.';
      }
    }
    
    if (verb === 'POUR-ON') {
      // Pouring water on the hot bell
      if (directObject === 'WATER') {
        state.removeObject('WATER');
        // This should trigger the bell cooling transformation
        return 'The water cools the bell and is evaporated.';
      }
    }
    
    if (verb === 'RING') {
      return 'The bell is too hot to reach.';
    }
    
    return null;
  }
};

// Register hot bell behavior
registerSpecialBehavior(hotBellBehavior);

/**
 * TROPHY-CASE special behavior
 * Handles attempts to take the trophy case
 */
const trophyCaseBehavior: SpecialBehavior = {
  objectId: 'TROPHY-CASE',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE' || verb === 'MOVE') {
      return 'The trophy case is securely fastened to the wall.';
    }
    return null;
  }
};

// Register trophy case behavior
registerSpecialBehavior(trophyCaseBehavior);

/**
 * TRAP-DOOR special behavior
 * Handles interactions with the trap door
 */
const trapDoorBehavior: SpecialBehavior = {
  objectId: 'TRAP-DOOR',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    const trapDoor = state.getObject('TRAP-DOOR');
    const currentRoom = state.currentRoom;
    
    if (verb === 'LOOK-UNDER' && currentRoom === 'LIVING-ROOM') {
      if (trapDoor && trapDoor.hasFlag('OPENBIT')) {
        return 'You see a rickety staircase descending into darkness.';
      }
      return "It's closed.";
    }

    // Handle opening/unlocking from cellar
    if (currentRoom === 'CELLAR') {
      if ((verb === 'OPEN' || verb === 'UNLOCK') && trapDoor && !trapDoor.hasFlag('OPENBIT')) {
        return 'The door is locked from above.';
      }
    }
    
    return null;
  }
};

// Register trap door behavior
registerSpecialBehavior(trapDoorBehavior);

/**
 * BODY special behavior
 * Handles interactions with bodies in temple
 */
const bodyBehavior: SpecialBehavior = {
  objectId: 'BODY',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE') {
      return 'A force keeps you from taking the bodies.';
    }
    return null;
  }
};

// Register body behavior
registerSpecialBehavior(bodyBehavior);

/**
 * MAILBOX special behavior
 * Handles attempts to take the mailbox
 */
const mailboxBehavior: SpecialBehavior = {
  objectId: 'MAILBOX',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE') {
      return 'It is securely anchored.';
    }
    return null;
  }
};

// Register mailbox behavior
registerSpecialBehavior(mailboxBehavior);

/**
 * GRUE special behavior
 * Handles interactions with the grue
 */
const grueBehavior: SpecialBehavior = {
  objectId: 'GRUE',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'FIND' || verb === 'EXAMINE') {
      return 'It makes no sound but is always lurking in the darkness nearby.';
    }
    return null;
  }
};

// Register grue behavior
registerSpecialBehavior(grueBehavior);

/**
 * ZORKMID special behavior
 * Handles interactions with zorkmids
 */
const zorkmidBehavior: SpecialBehavior = {
  objectId: 'ZORKMID',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'EXAMINE' || verb === 'FIND') {
      return 'The best way to find zorkmids is to go out and look for them.';
    }
    return null;
  }
};

// Register zorkmid behavior
registerSpecialBehavior(zorkmidBehavior);

/**
 * MIRROR special behavior
 * Handles rubbing the mirror
 */
const mirrorBehavior: SpecialBehavior = {
  objectId: 'MIRROR-1',
  condition: () => true,
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    if (verb === 'RUB' && indirectObject === 'HANDS') {
      return 'You feel a faint tingling transmitted through the mirror.';
    }
    return null;
  }
};

const mirror2Behavior: SpecialBehavior = {
  objectId: 'MIRROR-2',
  condition: () => true,
  handler: (verb: string, state: GameState, directObject?: string, indirectObject?: string) => {
    if (verb === 'RUB' && indirectObject === 'HANDS') {
      return 'You feel a faint tingling transmitted through the mirror.';
    }
    return null;
  }
};

// Register mirror behaviors
registerSpecialBehavior(mirrorBehavior);
registerSpecialBehavior(mirror2Behavior);

/**
 * CHAIN special behavior
 * Handles interactions with the chain
 */
const chainBehavior: SpecialBehavior = {
  objectId: 'CHAIN',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'TAKE') {
      return 'The chain secures a basket within the shaft.';
    }
    return null;
  }
};

// Register chain behavior
registerSpecialBehavior(chainBehavior);

/**
 * LANTERN special behavior
 * Handles lamp being thrown and breaking
 */
const lanternBehavior: SpecialBehavior = {
  objectId: 'LAMP',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'THROW') {
      const lamp = state.getObject('LAMP');
      if (lamp) {
        lamp.addFlag('RMUNGBIT');
        lamp.removeFlag('ONBIT');
        lamp.removeFlag('LIGHTBIT');
        return 'The lamp has smashed into the floor, and the light has gone out.';
      }
    }
    return null;
  }
};

// Register lantern behavior
registerSpecialBehavior(lanternBehavior);

/**
 * THIEF special behavior
 * Handles interactions with the thief
 */
const thiefBehavior: SpecialBehavior = {
  objectId: 'THIEF',
  condition: () => true,
  handler: (verb: string, state: GameState) => {
    if (verb === 'GIVE' || verb === 'THROW') {
      // Generic thief response for giving items
      return 'The thief is not interested in your possession. "Doing unto others before..."';
    }
    if (verb === 'TELL') {
      return 'The thief says nothing, as you have not been formally introduced.';
    }
    if (verb === 'TAKE') {
      return 'Once you got him, what would you do with him?';
    }
    return null;
  }
};

// Register thief behavior
registerSpecialBehavior(thiefBehavior);

