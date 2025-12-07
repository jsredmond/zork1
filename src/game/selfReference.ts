/**
 * Self-Reference (CRETIN) Message Handler
 * 
 * Handles all messages when the player tries to interact with themselves.
 * Based on CRETIN-OBJECT from gglobals.zil (lines 220-270)
 */

import { GameState } from './state.js';

/**
 * Check if action is self-referential
 */
export function isSelfReference(objectId: string): boolean {
  return objectId === 'ME' || objectId === 'CRETIN' || objectId === 'SELF' || objectId === 'MYSELF';
}

/**
 * Handle self-referential verb
 * Returns message for self-directed action, null if not applicable
 */
export function handleSelfReferenceVerb(
  verb: string, 
  state: GameState,
  directObject?: string,
  indirectObject?: string
): string | null {
  // Check if this is a self-reference
  if (!directObject || !isSelfReference(directObject)) {
    // Check indirect object
    if (!indirectObject || !isSelfReference(indirectObject)) {
      return null;
    }
  }

  // TELL verb - talking to yourself
  if (verb === 'TELL') {
    return 'Talking to yourself is said to be a sign of impending mental collapse.';
  }

  // GIVE verb - giving to yourself
  if (verb === 'GIVE' && indirectObject && isSelfReference(indirectObject)) {
    return 'Auto-cannibalism is not the answer.';
  }

  // ATTACK/KILL with weapon - suicide
  if ((verb === 'ATTACK' || verb === 'KILL' || verb === 'MUNG') && 
      indirectObject && isSelfReference(indirectObject)) {
    // Check if using a weapon
    const weapon = state.getObject(directObject || '');
    if (weapon && weapon.hasFlag('WEAPONBIT')) {
      return 'Suicide is not the answer.';
    }
  }

  // MAKE verb - crafting yourself?
  if (verb === 'MAKE' && indirectObject && isSelfReference(indirectObject)) {
    const tool = state.getObject(directObject || '');
    if (tool && tool.hasFlag('WEAPONBIT')) {
      return 'Suicide is not the answer.';
    }
  }

  // EAT verb - eating yourself
  if (verb === 'EAT' && isSelfReference(directObject)) {
    return 'Auto-cannibalism is not the answer.';
  }

  // WALK/CLIMB - walking on yourself
  if ((verb === 'WALK' || verb === 'CLIMB') && isSelfReference(directObject)) {
    return "Why don't you just walk like normal people?";
  }

  // ATTACK without weapon
  if ((verb === 'ATTACK' || verb === 'KILL') && isSelfReference(directObject)) {
    return 'How romantic!';
  }

  // THROW - throwing yourself
  if (verb === 'THROW' && isSelfReference(directObject)) {
    // Check if in mirror room
    const currentRoom = state.currentRoom;
    const mirror1 = state.getObject('MIRROR-1');
    const mirror2 = state.getObject('MIRROR-2');
    
    if (currentRoom && 
        ((mirror1 && mirror1.location === currentRoom) || 
         (mirror2 && mirror2.location === currentRoom))) {
      return 'Your image in the mirror looks tired.';
    }
    
    return 'How romantic!';
  }

  // TAKE - taking yourself
  if (verb === 'TAKE' && isSelfReference(directObject)) {
    // Check if in mirror room
    const currentRoom = state.currentRoom;
    const mirror1 = state.getObject('MIRROR-1');
    const mirror2 = state.getObject('MIRROR-2');
    
    if (currentRoom && 
        ((mirror1 && mirror1.location === currentRoom) || 
         (mirror2 && mirror2.location === currentRoom))) {
      // Check if invisible
      const invisible = state.getGlobalVariable('INVISIBLE');
      if (invisible) {
        return 'A good trick, as you are currently invisible.';
      }
      return 'Your image in the mirror looks tired.';
    }
    
    return "You're always self-possessed.";
  }

  // EXAMINE - examining yourself
  if (verb === 'EXAMINE' && isSelfReference(directObject)) {
    // Check if in mirror room
    const currentRoom = state.currentRoom;
    const mirror1 = state.getObject('MIRROR-1');
    const mirror2 = state.getObject('MIRROR-2');
    
    if (currentRoom && 
        ((mirror1 && mirror1.location === currentRoom) || 
         (mirror2 && mirror2.location === currentRoom))) {
      return 'What you can see looks pretty much as usual, sorry to say.';
    }
    
    return 'That would require a mirror.';
  }

  // FIND - finding yourself
  if (verb === 'FIND' && isSelfReference(directObject)) {
    return "You're around here somewhere...";
  }

  // RUB - rubbing yourself
  if (verb === 'RUB' && isSelfReference(directObject)) {
    return 'That would be a good trick.';
  }

  // SMELL - smelling yourself
  if (verb === 'SMELL' && isSelfReference(directObject)) {
    return 'You smell nothing unusual.';
  }

  // LISTEN - listening to yourself
  if (verb === 'LISTEN' && isSelfReference(directObject)) {
    return 'You hear nothing unusual.';
  }

  // Default self-reference message
  return "That's difficult unless your eyes are prehensile.";
}

/**
 * Messages for self-reference actions
 */
export const SELF_REFERENCE_MESSAGES = {
  TALKING_TO_SELF: 'Talking to yourself is said to be a sign of impending mental collapse.',
  AUTO_CANNIBALISM: 'Auto-cannibalism is not the answer.',
  SUICIDE: 'Suicide is not the answer.',
  WALK_NORMAL: "Why don't you just walk like normal people?",
  ROMANTIC: 'How romantic!',
  MIRROR_TIRED: 'Your image in the mirror looks tired.',
  INVISIBLE_TRICK: 'A good trick, as you are currently invisible.',
  SELF_POSSESSED: "You're always self-possessed.",
  MIRROR_USUAL: 'What you can see looks pretty much as usual, sorry to say.',
  NEED_MIRROR: 'That would require a mirror.',
  AROUND_HERE: "You're around here somewhere...",
  GOOD_TRICK: 'That would be a good trick.',
  SMELL_NOTHING: 'You smell nothing unusual.',
  HEAR_NOTHING: 'You hear nothing unusual.',
  PREHENSILE_EYES: "That's difficult unless your eyes are prehensile."
};

