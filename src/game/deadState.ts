/**
 * Death State Message Handler
 * 
 * Handles all messages and verb restrictions when the player is dead.
 * Based on DEAD-FUNCTION from 1actions.zil (lines 3113-3180)
 */

import { GameState } from './state.js';
import { ObjectFlag, RoomFlag } from './data/flags.js';

/**
 * Check if the player is currently dead
 */
export function isPlayerDead(state: GameState): boolean {
  return state.getGlobalVariable('DEAD') === true;
}

/**
 * Set the player's death state
 */
export function setPlayerDead(state: GameState, isDead: boolean): void {
  state.setGlobalVariable('DEAD', isDead);
  
  if (isDead) {
    // When dead, set ALWAYS_LIT flag (can see in dark)
    state.setGlobalVariable('ALWAYS_LIT', true);
  } else {
    // When resurrected, clear ALWAYS_LIT
    state.setGlobalVariable('ALWAYS_LIT', false);
  }
}

/**
 * Handle verb when player is dead
 * Returns message if verb is restricted, null if verb should proceed normally
 */
export function handleDeadStateVerb(verb: string, state: GameState): string | null {
  if (!isPlayerDead(state)) {
    return null;
  }

  // Verbs that work normally when dead (return null to allow)
  const allowedVerbs = [
    'BRIEF', 'VERBOSE', 'SUPERB', 'SUPER-BRIEF',
    'VERSION', 'SAVE', 'RESTORE', 'QUIT', 'RESTART'
  ];
  
  if (allowedVerbs.includes(verb)) {
    return null;
  }

  // Special case: WALK to TIMBER-ROOM from west is blocked
  if (verb === 'WALK') {
    if (state.currentRoom === 'TIMBER-ROOM') {
      // Check if trying to go west
      // This would need direction info from the action context
      // For now, return generic message
      return "You cannot enter in your condition.";
    }
    return null; // Allow other movement
  }

  // Attack verbs
  if (['ATTACK', 'MUNG', 'ALARM', 'SWING'].includes(verb)) {
    return "All such attacks are vain in your condition.";
  }

  // Physical manipulation verbs
  if (['OPEN', 'CLOSE', 'EAT', 'DRINK', 'INFLATE', 'DEFLATE', 
       'TURN', 'BURN', 'TIE', 'UNTIE', 'RUB'].includes(verb)) {
    return "Even such an action is beyond your capabilities.";
  }

  // Wait
  if (verb === 'WAIT') {
    return "Might as well. You've got an eternity.";
  }

  // Light control
  if (verb === 'LAMP-ON' || verb === 'LIGHT') {
    return "You need no light to guide you.";
  }

  // Score
  if (verb === 'SCORE') {
    return "You're dead! How can you think of your score?";
  }

  // Take/Rub
  if (verb === 'TAKE' || verb === 'RUB') {
    return "Your hand passes through its object.";
  }

  // Drop/Throw/Inventory
  if (['DROP', 'THROW', 'INVENTORY'].includes(verb)) {
    return "You have no possessions.";
  }

  // Diagnose
  if (verb === 'DIAGNOSE') {
    return "You are dead.";
  }

  // Look - special handling with detailed description
  if (verb === 'LOOK') {
    return getDeadStateLookMessage(state);
  }

  // Pray - special resurrection handling
  if (verb === 'PRAY') {
    return handleDeadStatePrayer(state);
  }

  // Default: can't do anything else
  return "You can't even do that.";
}

/**
 * Get the special LOOK message when dead
 */
function getDeadStateLookMessage(state: GameState): string {
  const room = state.getCurrentRoom();
  if (!room) {
    return "The room looks strange and unearthly.";
  }

  let message = "The room looks strange and unearthly";
  
  // Check if room has objects
  const objectsInRoom = state.getObjectsInCurrentRoom();
  if (objectsInRoom.length === 0) {
    message += ".";
  } else {
    message += " and objects appear indistinct.";
  }
  
  message += "\n";

  // Check if room is lit
  const roomFlags = room.flags || new Set();
  if (!roomFlags.has(RoomFlag.ONBIT)) {
    message += "Although there is no light, the room seems dimly illuminated.\n";
  }

  return message;
}

/**
 * Handle PRAY verb when dead
 * Can resurrect player if in SOUTH-TEMPLE
 */
function handleDeadStatePrayer(state: GameState): string {
  if (state.currentRoom === 'SOUTH-TEMPLE') {
    // Resurrect the player
    setPlayerDead(state, false);
    
    // Clear TROLL_FLAG if troll is in troll room
    const troll = state.getObject('TROLL');
    if (troll && troll.location === 'TROLL-ROOM') {
      state.setFlag('TROLL_FLAG', false);
    }
    
    // Make lamp visible again
    const lamp = state.getObject('LAMP');
    if (lamp) {
      lamp.flags.delete(ObjectFlag.INVISIBLE);
    }
    
    // Move player to FOREST-1
    state.setCurrentRoom('FOREST-1');
    
    return `From the distance the sound of a lone trumpet is heard. The room becomes very bright and you feel disembodied. In a moment, the brightness fades and you find yourself rising as if from a long sleep, deep in the woods. In the distance you can faintly hear a songbird and the sounds of the forest.

`;
  } else {
    return "Your prayers are not heard.";
  }
}

/**
 * Messages for death state
 */
export const DEAD_STATE_MESSAGES = {
  CANNOT_ENTER: "You cannot enter in your condition.",
  ATTACKS_VAIN: "All such attacks are vain in your condition.",
  BEYOND_CAPABILITIES: "Even such an action is beyond your capabilities.",
  WAIT: "Might as well. You've got an eternity.",
  NO_LIGHT_NEEDED: "You need no light to guide you.",
  SCORE_WHEN_DEAD: "You're dead! How can you think of your score?",
  HAND_PASSES_THROUGH: "Your hand passes through its object.",
  NO_POSSESSIONS: "You have no possessions.",
  YOU_ARE_DEAD: "You are dead.",
  CANT_DO_THAT: "You can't even do that.",
  PRAYERS_NOT_HEARD: "Your prayers are not heard.",
  RESURRECTION: `From the distance the sound of a lone trumpet is heard. The room becomes very bright and you feel disembodied. In a moment, the brightness fades and you find yourself rising as if from a long sleep, deep in the woods. In the distance you can faintly hear a songbird and the sounds of the forest.`
};
