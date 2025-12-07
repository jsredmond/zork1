/**
 * Scenery Action Handlers
 * Handles interactions with non-takeable scenery objects
 */

import { GameState } from './state.js';
import { ActionResult } from './actions.js';

/**
 * Handler function for a specific scenery object and verb combination
 */
export type SceneryActionHandler = (state: GameState) => string;

/**
 * SceneryHandler defines all action handlers for a scenery object
 */
export interface SceneryHandler {
  objectId: string;
  actions: Map<string, SceneryActionHandler>;
}

/**
 * Registry of all scenery handlers
 */
const sceneryHandlers: Map<string, SceneryHandler> = new Map();

/**
 * Register a scenery handler for an object
 */
export function registerSceneryHandler(handler: SceneryHandler): void {
  sceneryHandlers.set(handler.objectId, handler);
}

/**
 * Handle a scenery action
 * Returns the message to display, or null if no handler exists
 */
export function handleSceneryAction(
  objectId: string,
  verb: string,
  state: GameState
): string | null {
  const handler = sceneryHandlers.get(objectId);
  
  if (!handler) {
    return null;
  }

  const actionHandler = handler.actions.get(verb);
  
  if (!actionHandler) {
    return null;
  }

  return actionHandler(state);
}

/**
 * Check if an object has a scenery handler
 */
export function hasSceneryHandler(objectId: string): boolean {
  return sceneryHandlers.has(objectId);
}

/**
 * Check if an object has a handler for a specific verb
 */
export function hasSceneryActionHandler(objectId: string, verb: string): boolean {
  const handler = sceneryHandlers.get(objectId);
  return handler ? handler.actions.has(verb) : false;
}

/**
 * Execute a scenery action and return an ActionResult
 */
export function executeSceneryAction(
  objectId: string,
  verb: string,
  state: GameState
): ActionResult | null {
  const message = handleSceneryAction(objectId, verb, state);
  
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
// Scenery Handler Implementations
// ============================================================================

/**
 * BOARD scenery handler
 * Handles interactions with the boards on the front door
 */
const boardHandler: SceneryHandler = {
  objectId: 'BOARD',
  actions: new Map([
    ['TAKE', () => 'The boards are securely fastened.'],
    ['EXAMINE', () => 'The boards are securely fastened.'],
    ['REMOVE', () => 'The boards are securely fastened.']
  ])
};

/**
 * GRANITE-WALL scenery handler
 * Handles interactions with the granite wall (conditional based on room)
 */
const graniteWallHandler: SceneryHandler = {
  objectId: 'GRANITE-WALL',
  actions: new Map([
    ['TAKE', (state) => {
      if (state.currentRoom === 'SLIDE-ROOM') {
        return "The wall isn't granite.";
      }
      return "It's solid granite.";
    }],
    ['EXAMINE', (state) => {
      if (state.currentRoom === 'SLIDE-ROOM') {
        return "The wall isn't granite.";
      }
      return "It's solid granite.";
    }],
    ['FIND', (state) => {
      if (state.currentRoom === 'NORTH-TEMPLE') {
        return 'The west wall is solid granite here.';
      }
      if (state.currentRoom === 'TREASURE-ROOM') {
        return 'The east wall is solid granite here.';
      }
      if (state.currentRoom === 'SLIDE-ROOM') {
        return 'It only SAYS "Granite Wall".';
      }
      return 'There is no granite wall here.';
    }]
  ])
};

/**
 * WHITE-HOUSE scenery handler
 * Handles interactions with the white house (conditional based on room)
 */
const whiteHouseHandler: SceneryHandler = {
  objectId: 'WHITE-HOUSE',
  actions: new Map([
    ['EXAMINE', (state) => {
      // Check if player is inside the house
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      if (insideRooms.includes(state.currentRoom)) {
        return 'Why not find your brains?';
      }
      // Outside the house - provide directional message
      return 'The house is a beautiful colonial house which is painted white. It is clear that the owners must have been extremely wealthy.';
    }],
    ['TAKE', (state) => {
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      if (insideRooms.includes(state.currentRoom)) {
        return 'Why not find your brains?';
      }
      return "You can't be serious.";
    }],
    ['FIND', (state) => {
      // Inside the house
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      if (insideRooms.includes(state.currentRoom)) {
        return 'Why not find your brains?';
      }
      
      // At the house (NORTH/SOUTH/EAST/WEST-OF-HOUSE)
      const atHouseRooms = ['NORTH-OF-HOUSE', 'SOUTH-OF-HOUSE', 'EAST-OF-HOUSE', 'WEST-OF-HOUSE'];
      if (atHouseRooms.includes(state.currentRoom)) {
        return "It's right here! Are you blind or something?";
      }
      
      // Not at the house
      return "You're not at the house.";
    }]
  ])
};

/**
 * FOREST scenery handler
 * Handles interactions with the forest
 */
const forestHandler: SceneryHandler = {
  objectId: 'FOREST',
  actions: new Map([
    ['TAKE', () => "You can't be serious."],
    ['EXAMINE', () => 'The forest is a deep, dark, and foreboding place.'],
    ['CLIMB', () => "You can't climb that!"],
    ['ENTER', () => 'You would need to specify a direction to go.'],
    ['LISTEN', () => 'The pines and the hemlocks seem to be murmuring.'],
    ['FIND', () => 'You cannot see the forest for the trees.'],
    ['DISEMBARK', () => 'You will have to specify a direction.']
  ])
};

/**
 * SONGBIRD scenery handler
 * Handles interactions with the songbird
 */
const songbirdHandler: SceneryHandler = {
  objectId: 'SONGBIRD',
  actions: new Map([
    ['FIND', () => 'The songbird is not here but is probably nearby.'],
    ['TAKE', () => 'The songbird is not here but is probably nearby.'],
    ['LISTEN', () => "You can't hear the songbird now."],
    ['FOLLOW', () => "It can't be followed."],
    ['EXAMINE', () => "You can't see any songbird here."]
  ])
};

/**
 * TEETH scenery handler
 * Handles interactions with teeth (including dangerous BRUSH action)
 */
const teethHandler: SceneryHandler = {
  objectId: 'TEETH',
  actions: new Map([
    ['BRUSH', (state) => {
      // Check if player has putty - this is fatal!
      if (state.isInInventory('PUTTY')) {
        // This should trigger a death message (JIGS-UP)
        // For now, return the death message directly
        return "Oh, no! You have been devoured by a grue!";
      }
      // Check if player has any object to brush with
      const inventoryObjects = state.getInventoryObjects();
      if (inventoryObjects.length === 0) {
        return "Dental hygiene is highly recommended, but I'm not sure what you want to brush them with.";
      }
      // Player has something but not putty
      const firstObject = inventoryObjects[0];
      return `A nice idea, but with a ${firstObject.name.toLowerCase()}?`;
    }],
    ['EXAMINE', () => 'They look like teeth to me.'],
    ['TAKE', () => "You can't be serious."]
  ])
};

/**
 * WALL scenery handler
 * Handles interactions with generic walls
 */
const wallHandler: SceneryHandler = {
  objectId: 'WALL',
  actions: new Map([
    ['EXAMINE', () => 'It looks like a wall to me.'],
    ['TAKE', () => "You can't be serious."],
    ['CLIMB', () => "You can't climb that!"]
  ])
};

/**
 * TREE scenery handler
 * Handles interactions with trees
 */
const treeHandler: SceneryHandler = {
  objectId: 'TREE',
  actions: new Map([
    ['EXAMINE', () => 'They look like trees to me.'],
    ['TAKE', () => "You can't be serious."],
    ['CLIMB', () => 'You cannot climb the trees here.']
  ])
};

/**
 * MOUNTAIN-RANGE scenery handler
 * Handles interactions with mountains
 */
const mountainRangeHandler: SceneryHandler = {
  objectId: 'MOUNTAIN-RANGE',
  actions: new Map([
    ['EXAMINE', () => 'The mountains are in the distance and look very impressive.'],
    ['TAKE', () => "You can't be serious."],
    ['CLIMB', () => 'The mountains are too far away.'],
    ['CLIMB-UP', () => "Don't you believe me? The mountains are impassable!"],
    ['CLIMB-DOWN', () => "Don't you believe me? The mountains are impassable!"],
    ['CLIMB-FOO', () => "Don't you believe me? The mountains are impassable!"]
  ])
};

/**
 * LEAVES scenery handler
 * Handles interactions with pile of leaves (grating puzzle)
 */
const leavesHandler: SceneryHandler = {
  objectId: 'LEAVES',
  actions: new Map([
    ['EXAMINE', () => 'There is a pile of leaves here.'],
    ['TAKE', () => 'You can gather up a pile of leaves, but they slip through your fingers.'],
    ['MOVE', (state) => {
      // Check if grating is already revealed
      const grate = state.getObject('GRATE');
      if (grate && grate.location === state.currentRoom) {
        return 'The grating is already visible.';
      }
      // This should reveal the grating - handled by puzzle logic
      return 'Done. In disturbing the pile of leaves, a grating is revealed.';
    }]
  ])
};

/**
 * SAND scenery handler
 * Handles interactions with sand
 */
const sandHandler: SceneryHandler = {
  objectId: 'SAND',
  actions: new Map([
    ['EXAMINE', () => 'It looks like sand to me.'],
    ['TAKE', () => 'The sand slips through your fingers.'],
    ['DIG', () => 'Digging in the sand is futile.']
  ])
};

/**
 * BOARDED-WINDOW scenery handler
 * Handles interactions with the boarded window
 */
const boardedWindowHandler: SceneryHandler = {
  objectId: 'BOARDED-WINDOW',
  actions: new Map([
    ['OPEN', () => "The windows are boarded and can't be opened."],
    ['EXAMINE', () => "The windows are boarded and can't be opened."],
    ['MUNG', () => "You can't break the windows open."]
  ])
};

/**
 * NAILS scenery handler
 * Handles interactions with nails (pseudo-object)
 */
const nailsHandler: SceneryHandler = {
  objectId: 'NAILS',
  actions: new Map([
    ['TAKE', () => 'The nails, deeply imbedded in the door, cannot be removed.'],
    ['REMOVE', () => 'The nails, deeply imbedded in the door, cannot be removed.'],
    ['EXAMINE', () => 'The nails, deeply imbedded in the door, cannot be removed.']
  ])
};

/**
 * CHIMNEY scenery handler
 * Handles interactions with the chimney (location-dependent)
 */
const chimneyHandler: SceneryHandler = {
  objectId: 'CHIMNEY',
  actions: new Map([
    ['EXAMINE', (state) => {
      if (state.currentRoom === 'KITCHEN') {
        return 'The chimney leads downward, and looks climbable.';
      }
      return 'The chimney leads upward, and looks climbable.';
    }]
  ])
};

/**
 * STAIRS scenery handler
 * Handles interactions with stairs
 */
const stairsHandler: SceneryHandler = {
  objectId: 'STAIRS',
  actions: new Map([
    ['THROUGH', () => 'You should say whether you want to go up or down.']
  ])
};

/**
 * RAINBOW scenery handler
 * Handles interactions with the rainbow
 */
const rainbowHandler: SceneryHandler = {
  objectId: 'RAINBOW',
  actions: new Map([
    ['CROSS', (state) => {
      if (state.currentRoom === 'CANYON-VIEW') {
        return 'From here?!?';
      }
      // Check if rainbow is solid (RAINBOW-FLAG)
      const rainbowSolid = state.getFlag('RAINBOW-FLAG');
      if (rainbowSolid) {
        // This would trigger movement logic
        return "You'll have to say which way...";
      }
      return 'Can you walk on water vapor?';
    }],
    ['THROUGH', (state) => {
      if (state.currentRoom === 'CANYON-VIEW') {
        return 'From here?!?';
      }
      const rainbowSolid = state.getFlag('RAINBOW-FLAG');
      if (rainbowSolid) {
        return "You'll have to say which way...";
      }
      return 'Can you walk on water vapor?';
    }],
    ['LOOK-UNDER', () => 'The Frigid River flows under the rainbow.']
  ])
};

/**
 * RIVER scenery handler
 * Handles interactions with the Frigid River
 */
const riverHandler: SceneryHandler = {
  objectId: 'RIVER',
  actions: new Map([
    ['LEAP', () => 'A look before leaping reveals that the river is wide and dangerous, with swift currents and large, half-hidden rocks. You decide to forgo your swim.'],
    ['THROUGH', () => 'A look before leaping reveals that the river is wide and dangerous, with swift currents and large, half-hidden rocks. You decide to forgo your swim.']
  ])
};

/**
 * GHOSTS scenery handler
 * Handles interactions with the spirits/ghosts
 */
const ghostsHandler: SceneryHandler = {
  objectId: 'GHOSTS',
  actions: new Map([
    ['TELL', () => 'The spirits jeer loudly and ignore you.'],
    ['EXORCISE', () => 'Only the ceremony itself has any effect.'],
    ['ATTACK', () => 'How can you attack a spirit with material objects?'],
    ['MUNG', () => 'How can you attack a spirit with material objects?']
  ])
};

/**
 * PATH scenery handler
 * Handles interactions with paths/passages
 */
const pathHandler: SceneryHandler = {
  objectId: 'PATH',
  actions: new Map([
    ['TAKE', () => 'You must specify a direction to go.'],
    ['FOLLOW', () => 'You must specify a direction to go.'],
    ['FIND', () => "I can't help you there...."],
    ['DIG', () => 'Not a chance.']
  ])
};

/**
 * KITCHEN-WINDOW scenery handler
 * Handles interactions with the kitchen window
 */
const kitchenWindowHandler: SceneryHandler = {
  objectId: 'KITCHEN-WINDOW',
  actions: new Map([
    ['EXAMINE', (state) => {
      const windowOpen = state.getFlag('KITCHEN-WINDOW-FLAG');
      if (!windowOpen) {
        return 'The window is slightly ajar, but not enough to allow entry.';
      }
      return 'The window is open.';
    }],
    ['LOOK-INSIDE', (state) => {
      if (state.currentRoom === 'KITCHEN') {
        return 'You can see a clear area leading towards a forest.';
      }
      return 'You can see what appears to be a kitchen.';
    }]
  ])
};

/**
 * CRACK scenery handler
 * Handles interactions with the crack
 */
const crackHandler: SceneryHandler = {
  objectId: 'CRACK',
  actions: new Map([
    ['THROUGH', () => "You can't fit through the crack."]
  ])
};

/**
 * LAKE scenery handler
 * Handles interactions with the lake
 */
const lakeHandler: SceneryHandler = {
  objectId: 'LAKE',
  actions: new Map([
    ['CROSS', () => "There's not much lake left...."],
    ['SWIM', () => "There's not much lake left...."]
  ])
};

/**
 * DOOR scenery handler
 * Handles interactions with the door
 */
const doorHandler: SceneryHandler = {
  objectId: 'DOOR',
  actions: new Map([
    ['THROUGH', () => "The door won't budge."],
    ['OPEN', () => "The door won't budge."]
  ])
};

/**
 * PAINT scenery handler
 * Handles interactions with paint
 */
const paintHandler: SceneryHandler = {
  objectId: 'PAINT',
  actions: new Map([
    ['OPEN', () => 'Some paint chips away, revealing more paint.'],
    ['TAKE', () => 'Some paint chips away, revealing more paint.']
  ])
};

/**
 * GAS scenery handler
 * Handles interactions with gas
 */
const gasHandler: SceneryHandler = {
  objectId: 'GAS',
  actions: new Map([
    ['THROUGH', () => 'There is too much gas to blow away.'],
    ['BLOW', () => 'There is too much gas to blow away.']
  ])
};

/**
 * CHASM scenery handler
 * Handles interactions with the chasm
 */
const chasmHandler: SceneryHandler = {
  objectId: 'CHASM',
  actions: new Map([
    ['SWIM', () => 'You look before leaping, and realize that you would never survive.'],
    ['CROSS', () => "It's too far to jump, and there's no bridge."],
    ['LEAP', () => 'You look before leaping, and realize that you would never survive.'],
    ['JUMP', () => "It's too far to jump, and there's no bridge."],
    ['THROW', (state) => {
      // When throwing an object into the chasm
      const prso = state.getGlobalVariable('PRSO');
      if (prso) {
        const obj = state.getObject(prso);
        if (obj) {
          state.removeObject(prso);
          return `The ${obj.name.toLowerCase()} drops out of sight into the chasm.`;
        }
      }
      return 'It drops out of sight into the chasm.';
    }]
  ])
};

// Register all scenery handlers
registerSceneryHandler(boardHandler);
registerSceneryHandler(graniteWallHandler);
registerSceneryHandler(whiteHouseHandler);
registerSceneryHandler(forestHandler);
registerSceneryHandler(songbirdHandler);
registerSceneryHandler(teethHandler);
registerSceneryHandler(wallHandler);
registerSceneryHandler(treeHandler);
registerSceneryHandler(mountainRangeHandler);
registerSceneryHandler(leavesHandler);
registerSceneryHandler(sandHandler);
registerSceneryHandler(boardedWindowHandler);
registerSceneryHandler(nailsHandler);
registerSceneryHandler(chimneyHandler);
registerSceneryHandler(stairsHandler);
registerSceneryHandler(rainbowHandler);
registerSceneryHandler(riverHandler);
registerSceneryHandler(ghostsHandler);
registerSceneryHandler(pathHandler);
registerSceneryHandler(kitchenWindowHandler);
registerSceneryHandler(crackHandler);
registerSceneryHandler(lakeHandler);
registerSceneryHandler(doorHandler);
registerSceneryHandler(paintHandler);
registerSceneryHandler(gasHandler);
registerSceneryHandler(chasmHandler);
