/**
 * Self-Reference (CRETIN) Message Handler
 * 
 * Handles all messages when the player tries to interact with themselves.
 * Based on CRETIN-FCN from gglobals.zil (lines 221-265)
 */

import { GameState } from './state.js';

/**
 * Handle verb directed at the player themselves (ME/MYSELF/SELF/CRETIN)
 * Returns message for self-directed action, or null if action should proceed normally
 */
export function handleSelfReference(verb: string, state: GameState, directObject?: string, indirectObject?: string): string | null {
  // TELL - talking to yourself
  if (verb === 'TELL') {
    return "Talking to yourself is said to be a sign of impending mental collapse.";
  }

  // GIVE to ME - convert to TAKE
  if (verb === 'GIVE' && indirectObject === 'ME') {
    // This should trigger a TAKE action instead
    // Return null to allow the action system to handle it
    return null;
  }

  // MAKE
  if (verb === 'MAKE') {
    return "Only you can do that.";
  }

  // DISEMBARK
  if (verb === 'DISEMBARK') {
    return "You'll have to do that on your own.";
  }

  // EAT
  if (verb === 'EAT') {
    return "Auto-cannibalism is not the answer.";
  }

  // ATTACK/MUNG with weapon
  if (verb === 'ATTACK' || verb === 'MUNG') {
    // Check if using a weapon (PRSI would be the weapon)
    if (indirectObject) {
      const weapon = state.getObject(indirectObject);
      if (weapon && weapon.flags.has('WEAPONBIT')) {
        // This should trigger death
        return "If you insist.... Poof, you're dead!";
      }
    }
    // Without weapon
    return "Suicide is not the answer.";
  }

  // THROW ME
  if (verb === 'THROW' && directObject === 'ME') {
    return "Why don't you just walk like normal people?";
  }

  // TAKE ME
  if (verb === 'TAKE') {
    return "How romantic!";
  }

  // EXAMINE ME
  if (verb === 'EXAMINE') {
    // Check if in mirror room
    const mirror1 = state.getObject('MIRROR-1');
    const mirror2 = state.getObject('MIRROR-2');
    
    if (mirror1 && mirror1.location === state.currentRoom) {
      return "Your image in the mirror looks tired.";
    }
    if (mirror2 && mirror2.location === state.currentRoom) {
      return "Your image in the mirror looks tired.";
    }
    
    // Default examine self message
    return "That's difficult unless your eyes are prehensile.";
  }

  // Default: no special handling
  return null;
}

/**
 * Check if an object reference is a self-reference
 */
export function isSelfReference(objectId: string): boolean {
  const selfReferences = ['ME', 'MYSELF', 'SELF', 'CRETIN', 'ADVENTURER'];
  return selfReferences.includes(objectId.toUpperCase());
}

/**
 * Messages for self-reference actions
 */
export const SELF_REFERENCE_MESSAGES = {
  TALKING_TO_SELF: "Talking to yourself is said to be a sign of impending mental collapse.",
  ONLY_YOU: "Only you can do that.",
  DO_IT_YOURSELF: "You'll have to do that on your own.",
  AUTO_CANNIBALISM: "Auto-cannibalism is not the answer.",
  SUICIDE_WITH_WEAPON: "If you insist.... Poof, you're dead!",
  SUICIDE_NO_WEAPON: "Suicide is not the answer.",
  THROW_SELF: "Why don't you just walk like normal people?",
  TAKE_SELF: "How romantic!",
  EXAMINE_IN_MIRROR: "Your image in the mirror looks tired.",
  EXAMINE_SELF: "That's difficult unless your eyes are prehensile."
};
