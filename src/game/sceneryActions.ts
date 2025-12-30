/**
 * Scenery Action Handlers
 * Handles interactions with non-takeable scenery objects
 */

import { GameState } from './state.js';
import { ActionResult } from './actions.js';
import { ObjectFlag } from './data/flags.js';

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

  // Scenery actions that indicate failure should return success: false
  // Messages like "won't budge", "can't", "don't" indicate failure
  const isFailureMessage = message.toLowerCase().includes("won't") ||
                          message.toLowerCase().includes("can't") ||
                          message.toLowerCase().includes("don't") ||
                          message.toLowerCase().includes("securely fastened") ||
                          message.toLowerCase().includes("isn't");

  return {
    success: !isFailureMessage,
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
 * Z-Machine parity: Only handles verbs that have specific messages in BOARD-F
 * PUSH, PULL fall through to default random message handlers
 */
const boardHandler: SceneryHandler = {
  objectId: 'BOARD',
  actions: new Map([
    // Z-Machine BOARD-F: TAKE/EXAMINE -> "The boards are securely fastened."
    ['TAKE', () => 'The boards are securely fastened.'],
    ['EXAMINE', () => 'The boards are securely fastened.'],
    ['REMOVE', () => 'The boards are securely fastened.']
    // Note: PUSH, PULL, MOVE intentionally NOT handled - fall through to default random HO-HUM messages
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
 * Z-Machine parity: Only handles verbs that have specific messages in WHITE-HOUSE-F
 * TAKE, PUSH, PULL fall through to default random message handlers
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
    // Z-Machine WHITE-HOUSE-F: THROUGH/OPEN -> "I can't see how to get in from here."
    ['OPEN', (state) => {
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      if (insideRooms.includes(state.currentRoom)) {
        return 'Why not find your brains?';
      }
      return "I can't see how to get in from here.";
    }],
    ['THROUGH', (state) => {
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      if (insideRooms.includes(state.currentRoom)) {
        return 'Why not find your brains?';
      }
      return "I can't see how to get in from here.";
    }],
    // Note: TAKE, PUSH, PULL intentionally NOT handled - fall through to default random messages
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
    }],
    ['BURN', () => "You must be joking."]
  ])
};

/**
 * FOREST scenery handler
 * Handles interactions with the forest
 * Z-Machine parity: Only handles verbs that have specific messages in FOREST-F
 * TAKE, PUSH, PULL, CLOSE, OPEN fall through to default random message handlers
 */
const forestHandler: SceneryHandler = {
  objectId: 'FOREST',
  actions: new Map([
    // Note: TAKE intentionally NOT handled - falls through to default random YUKS message
    ['EXAMINE', () => 'The forest is a deep, dark, and foreboding place. You can see trees in all directions.'],
    ['CLIMB', () => "You can't climb that!"],
    ['ENTER', () => 'You would need to specify a direction to go.'],
    // Z-Machine FOREST-F: LISTEN -> "The pines and the hemlocks seem to be murmuring."
    ['LISTEN', () => 'The pines and the hemlocks seem to be murmuring.'],
    // Z-Machine FOREST-F: FIND -> "You cannot see the forest for the trees."
    ['FIND', () => 'You cannot see the forest for the trees.'],
    // Z-Machine FOREST-F: DISEMBARK -> "You will have to specify a direction."
    ['DISEMBARK', () => 'You will have to specify a direction.']
    // Note: PUSH, PULL, CLOSE, OPEN intentionally NOT handled - fall through to default handlers
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
    ['EXAMINE', () => 'The walls are made of stone and are quite solid.'],
    ['TAKE', () => "You can't be serious."],
    ['CLIMB', () => "You can't climb that!"]
  ])
};

/**
 * WALLS scenery handler
 * Handles interactions with walls (plural)
 */
const wallsHandler: SceneryHandler = {
  objectId: 'WALLS',
  actions: new Map([
    ['EXAMINE', () => 'The walls are made of stone and are quite solid.'],
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
    ['EXAMINE', () => 'The trees are tall and imposing.'],
    ['TAKE', () => "You can't be serious."],
    ['CLIMB', () => 'You cannot climb the trees here.']
  ])
};

/**
 * TREES scenery handler
 * Handles interactions with trees (plural)
 */
const treesHandler: SceneryHandler = {
  objectId: 'TREES',
  actions: new Map([
    ['EXAMINE', () => 'The trees are tall and imposing.'],
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
 * GLOBAL-LEAVES scenery handler
 * Handles interactions with leaves (generic scenery)
 */
const globalLeavesHandler: SceneryHandler = {
  objectId: 'GLOBAL-LEAVES',
  actions: new Map([
    ['EXAMINE', () => 'The leaves are a beautiful color.'],
    ['TAKE', () => 'You can gather up a pile of leaves, but they slip through your fingers.']
  ])
};

/**
 * LEAVES scenery handler
 * Handles interactions with leaves (alias for GLOBAL-LEAVES)
 */
const leavesHandler: SceneryHandler = {
  objectId: 'LEAVES',
  actions: new Map([
    ['EXAMINE', () => 'The leaves are a beautiful color.'],
    ['TAKE', () => 'You can gather up a pile of leaves, but they slip through your fingers.']
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
 * Z-Machine parity: Uses exact Z-Machine messages for each verb
 */
const boardedWindowHandler: SceneryHandler = {
  objectId: 'BOARDED-WINDOW',
  actions: new Map([
    ['OPEN', () => "The window is slightly ajar, but not enough to allow entry."],
    ['EXAMINE', () => "The window is slightly ajar, but not enough to allow entry."],
    ['BREAK', () => "Vandalism is not usually tolerated."],
    ['SMASH', () => "Vandalism is not usually tolerated."],
    ['DESTROY', () => "Vandalism is not usually tolerated."],
    ['MUNG', () => "You can't break the windows open."],
    // Z-Machine: "You can't be serious." (Requirement 4.3)
    ['TAKE', () => "You can't be serious."],
    ['GET', () => "You can't be serious."]
  ])
};

/**
 * WINDOW scenery handler
 * Handles interactions with generic windows
 */
const windowHandler: SceneryHandler = {
  objectId: 'WINDOW',
  actions: new Map([
    ['EXAMINE', () => "The window is slightly ajar, but not enough to allow entry."],
    ['OPEN', () => "The window is slightly ajar, but not enough to allow entry."]
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
    ['OPEN', (state) => {
      const window = state.getObject('KITCHEN-WINDOW');
      if (!window) {
        return "You can't see that here.";
      }
      
      // Check if already open
      if (window.hasFlag(ObjectFlag.OPENBIT)) {
        return "It's already open.";
      }
      
      // Open the window (cast to GameObjectImpl to access addFlag)
      const windowImpl = window as any;
      windowImpl.addFlag(ObjectFlag.OPENBIT);
      windowImpl.addFlag(ObjectFlag.TOUCHBIT);
      
      // Also set a flag for the condition check
      state.setFlag('KITCHEN_WINDOW_OPEN' as any, true);
      
      return 'With great effort, you open the window far enough to allow entry.';
    }],
    ['EXAMINE', (state) => {
      const windowOpen = state.getFlag('KITCHEN_WINDOW_OPEN' as any);
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
    ['OPEN', () => "The door won't budge."],
    ['EXAMINE', () => "The door is boarded and you can't remove the boards."]
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

/**
 * SKY scenery handler
 * Handles interactions with the sky
 */
const skyHandler: SceneryHandler = {
  objectId: 'SKY',
  actions: new Map([
    ['EXAMINE', () => 'The sky is clear and blue.'],
    ['TAKE', () => "You can't be serious."]
  ])
};

/**
 * GROUND scenery handler
 * Handles interactions with the ground
 */
const groundHandler: SceneryHandler = {
  objectId: 'GROUND',
  actions: new Map([
    ['EXAMINE', () => "There's nothing special about the ground here."],
    ['TAKE', () => "You can't be serious."],
    ['DIG', () => 'Digging here reveals nothing.']
  ])
};

/**
 * CEILING scenery handler
 * Handles interactions with the ceiling
 */
const ceilingHandler: SceneryHandler = {
  objectId: 'CEILING',
  actions: new Map([
    ['EXAMINE', () => 'The ceiling is high above you.'],
    ['TAKE', () => "You can't be serious."],
    ['TOUCH', () => "You can't reach the ceiling."]
  ])
};

/**
 * FLOOR scenery handler
 * Handles interactions with the floor
 */
const floorHandler: SceneryHandler = {
  objectId: 'FLOOR',
  actions: new Map([
    ['EXAMINE', () => 'The floor is made of stone.'],
    ['TAKE', () => "You can't be serious."]
  ])
};

/**
 * SELF scenery handler
 * Handles interactions with self/me
 */
const selfHandler: SceneryHandler = {
  objectId: 'SELF',
  actions: new Map([
    ['EXAMINE', () => 'You look much the same as always.'],
    ['TAKE', () => "You can't be serious."]
  ])
};

/**
 * ME scenery handler
 * Handles interactions with me (synonym for self)
 */
const meHandler: SceneryHandler = {
  objectId: 'ME',
  actions: new Map([
    ['EXAMINE', () => 'You look much the same as always.'],
    ['TAKE', () => "You can't be serious."]
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
registerSceneryHandler(wallsHandler);
registerSceneryHandler(treeHandler);
registerSceneryHandler(treesHandler);
registerSceneryHandler(mountainRangeHandler);
registerSceneryHandler(globalLeavesHandler);
registerSceneryHandler(leavesHandler);
registerSceneryHandler(sandHandler);
registerSceneryHandler(boardedWindowHandler);
registerSceneryHandler(windowHandler);
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
registerSceneryHandler(skyHandler);
registerSceneryHandler(groundHandler);
registerSceneryHandler(ceilingHandler);
registerSceneryHandler(floorHandler);
registerSceneryHandler(selfHandler);
registerSceneryHandler(meHandler);
