/**
 * Error Message Handler
 * Provides context-aware, informative error messages
 */

import { ERROR_MESSAGES, formatMessage, getContextualError } from './data/messages.js';
import { GameState } from './state.js';
import { GameObject } from './objects.js';
import { ObjectFlag } from './data/flags.js';

/**
 * Error context for generating informative messages
 */
export interface ErrorContext {
  action: string;
  object?: GameObject;
  secondObject?: GameObject;
  state?: GameState;
  reason?: string;
}

/**
 * Generate an informative error message based on context
 * Provides specific reasons for action failures
 */
export function getInformativeError(context: ErrorContext): string {
  const { action, object, secondObject, state, reason } = context;
  
  // If a specific reason is provided, use it
  if (reason) {
    return reason;
  }
  
  // Handle specific action-object combinations
  switch (action.toLowerCase()) {
    case 'take':
      return getTakeError(object, state);
    
    case 'drop':
      return getDropError(object, state);
    
    case 'open':
      return getOpenError(object);
    
    case 'close':
      return getCloseError(object);
    
    case 'read':
      return getReadError(object);
    
    case 'attack':
    case 'kill':
      return getAttackError(object, secondObject);
    
    case 'eat':
    case 'drink':
      return getEatDrinkError(object);
    
    case 'move':
    case 'push':
    case 'pull':
      return getMoveError(object);
    
    case 'climb':
      return getClimbError(object);
    
    case 'turn on':
    case 'light':
      return getTurnOnError(object);
    
    case 'turn off':
      return getTurnOffError(object);
    
    case 'put':
      return getPutError(object, secondObject);
    
    case 'give':
      return getGiveError(object, secondObject);
    
    default:
      return getDefaultError(action, object);
  }
}

/**
 * Get specific error for TAKE action
 */
function getTakeError(object?: GameObject, state?: GameState): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_SEE_THAT;
  }
  
  // Check if already in inventory
  if (state && state.isInInventory(object.id)) {
    return ERROR_MESSAGES.ALREADY_HAVE;
  }
  
  // Check if takeable
  if (!object.hasFlag(ObjectFlag.TAKEBIT)) {
    // Provide specific reasons for common non-takeable objects
    if (object.hasFlag(ObjectFlag.ACTORBIT)) {
      return formatMessage("The {object} wouldn't appreciate that.", { object: object.name.toLowerCase() });
    }
    
    if (object.size && object.size > 50) {
      return formatMessage(ERROR_MESSAGES.TOO_HEAVY_LIFT, { object: object.name.toLowerCase() });
    }
    
    return formatMessage(ERROR_MESSAGES.CANT_TAKE, { object: object.name.toLowerCase() });
  }
  
  // Check weight
  if (state) {
    const currentWeight = state.getInventoryWeight();
    const objectWeight = object.size || 0;
    if (currentWeight + objectWeight > 100) {
      return ERROR_MESSAGES.TOO_HEAVY;
    }
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_TAKE, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for DROP action
 */
function getDropError(object?: GameObject, state?: GameState): string {
  if (!object) {
    return ERROR_MESSAGES.DONT_HAVE;
  }
  
  if (state && !state.isInInventory(object.id)) {
    return formatMessage(ERROR_MESSAGES.NOT_HOLDING, { object: object.name.toLowerCase() });
  }
  
  return ERROR_MESSAGES.DONT_HAVE;
}

/**
 * Get specific error for OPEN action
 */
function getOpenError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if it's a container or door
  if (!object.hasFlag(ObjectFlag.CONTBIT) && !object.hasFlag(ObjectFlag.DOORBIT)) {
    return formatMessage(ERROR_MESSAGES.MUST_TELL_HOW, { object: object.name.toLowerCase() });
  }
  
  // Check if already open
  if (object.hasFlag(ObjectFlag.OPENBIT)) {
    return ERROR_MESSAGES.ALREADY_OPEN;
  }
  
  // Check if locked (stored as a property, not a flag)
  if (object.getProperty && object.getProperty('locked')) {
    return formatMessage(ERROR_MESSAGES.LOCKED, { object: object.name.toLowerCase() });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_OPEN, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for CLOSE action
 */
function getCloseError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if it's a container or door
  if (!object.hasFlag(ObjectFlag.CONTBIT) && !object.hasFlag(ObjectFlag.DOORBIT)) {
    return formatMessage(ERROR_MESSAGES.MUST_TELL_HOW, { object: object.name.toLowerCase() });
  }
  
  // Check if already closed
  if (!object.hasFlag(ObjectFlag.OPENBIT)) {
    return ERROR_MESSAGES.ALREADY_CLOSED;
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_CLOSE, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for READ action
 */
function getReadError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if object has readable text
  if (!object.hasFlag(ObjectFlag.READBIT)) {
    return formatMessage(ERROR_MESSAGES.NOTHING_TO_READ, { object: object.name.toLowerCase() });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_READ, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for ATTACK action
 */
function getAttackError(object?: GameObject, weapon?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if attacking an actor
  if (!object.hasFlag(ObjectFlag.ACTORBIT)) {
    return formatMessage(ERROR_MESSAGES.CANT_ATTACK, { object: object.name.toLowerCase() });
  }
  
  // Check weapon
  if (!weapon || weapon.id === 'hands') {
    return formatMessage(ERROR_MESSAGES.ATTACK_WITH_HANDS, { object: object.name.toLowerCase() });
  }
  
  if (!weapon.hasFlag(ObjectFlag.WEAPONBIT)) {
    return formatMessage(ERROR_MESSAGES.ATTACK_WITH_OBJECT, { 
      object: object.name.toLowerCase(),
      weapon: weapon.name.toLowerCase()
    });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_ATTACK, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for EAT/DRINK action
 */
function getEatDrinkError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  if (!object.hasFlag(ObjectFlag.FOODBIT) && !object.hasFlag(ObjectFlag.DRINKBIT)) {
    return formatMessage(ERROR_MESSAGES.CANT_EAT, { object: object.name.toLowerCase() });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_EAT, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for MOVE/PUSH/PULL action
 */
function getMoveError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if takeable (moveable objects are usually takeable)
  if (object.hasFlag(ObjectFlag.TAKEBIT)) {
    return formatMessage("Moving the {object} reveals nothing.", { object: object.name.toLowerCase() });
  }
  
  // Check if it's too heavy
  if (object.size && object.size > 50) {
    return formatMessage(ERROR_MESSAGES.CANT_MOVE, { object: object.name.toLowerCase() });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_MOVE, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for CLIMB action
 */
function getClimbError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_CLIMB, { object: object.name.toLowerCase() });
}

/**
 * Get specific error for TURN ON action
 */
function getTurnOnError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if it's a light source
  if (!object.hasFlag(ObjectFlag.LIGHTBIT)) {
    return ERROR_MESSAGES.CANT_TURN_ON;
  }
  
  // Check if already on
  if (object.hasFlag(ObjectFlag.ONBIT)) {
    return ERROR_MESSAGES.ALREADY_ON;
  }
  
  return ERROR_MESSAGES.CANT_TURN_ON;
}

/**
 * Get specific error for TURN OFF action
 */
function getTurnOffError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if it's a light source
  if (!object.hasFlag(ObjectFlag.LIGHTBIT)) {
    return ERROR_MESSAGES.CANT_TURN_OFF;
  }
  
  // Check if already off
  if (!object.hasFlag(ObjectFlag.ONBIT)) {
    return ERROR_MESSAGES.ALREADY_OFF;
  }
  
  return ERROR_MESSAGES.CANT_TURN_OFF;
}

/**
 * Get specific error for PUT action
 */
function getPutError(object?: GameObject, container?: GameObject): string {
  if (!object || !container) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if container is actually a container
  if (!container.hasFlag(ObjectFlag.CONTBIT)) {
    return formatMessage("The {object} isn't a container.", { object: container.name.toLowerCase() });
  }
  
  // Check if container is open
  if (!container.hasFlag(ObjectFlag.OPENBIT)) {
    return formatMessage(ERROR_MESSAGES.CLOSED, { object: container.name.toLowerCase() });
  }
  
  // Check capacity
  if (container.capacity !== undefined) {
    // Would need to check current contents
    return formatMessage("The {object} is full.", { object: container.name.toLowerCase() });
  }
  
  return ERROR_MESSAGES.CANT_DO_THAT;
}

/**
 * Get specific error for GIVE action
 */
function getGiveError(object?: GameObject, recipient?: GameObject): string {
  if (!object || !recipient) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  // Check if recipient is an actor
  if (!recipient.hasFlag(ObjectFlag.ACTORBIT)) {
    return formatMessage(ERROR_MESSAGES.CANT_GIVE_TO, { 
      object: object.name.toLowerCase(),
      target: recipient.name.toLowerCase()
    });
  }
  
  return formatMessage(ERROR_MESSAGES.REFUSES_POLITELY, { object: recipient.name.toLowerCase() });
}

/**
 * Get default error for unknown action
 */
function getDefaultError(action: string, object?: GameObject): string {
  if (object) {
    return formatMessage(ERROR_MESSAGES.CANT_DO_THAT_TO, { object: object.name.toLowerCase() });
  }
  
  return ERROR_MESSAGES.CANT_DO_THAT;
}

/**
 * Get error for object not visible
 */
export function getObjectNotVisibleError(objectName: string): string {
  return formatMessage(ERROR_MESSAGES.NOT_HERE, { object: objectName });
}

/**
 * Get error for direction not available
 */
export function getDirectionError(direction: string, reason?: string): string {
  if (reason) {
    return reason;
  }
  return ERROR_MESSAGES.CANT_GO_THAT_WAY;
}

/**
 * Get parser error message
 */
export function getParserError(errorType: string, word?: string): string {
  switch (errorType) {
    case 'UNKNOWN_WORD':
      return word ? formatMessage(ERROR_MESSAGES.UNKNOWN_WORD, { word }) : ERROR_MESSAGES.BEG_PARDON;
    
    case 'INVALID_SYNTAX':
      return ERROR_MESSAGES.COULDNT_UNDERSTAND;
    
    case 'NO_VERB':
      return ERROR_MESSAGES.NO_VERB;
    
    case 'AMBIGUOUS':
      return ERROR_MESSAGES.WHICH_ONE;
    
    case 'OBJECT_NOT_FOUND':
      return ERROR_MESSAGES.CANT_SEE_THAT;
    
    default:
      return ERROR_MESSAGES.DONT_UNDERSTAND;
  }
}
