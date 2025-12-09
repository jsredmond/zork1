/**
 * Error Message Handler
 * Provides context-aware, informative error messages
 */

import { ERROR_MESSAGES, formatMessage, getContextualError, getParserFeedback } from './data/messages.js';
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
 * Safely get object name for error messages
 */
function getObjectName(object?: GameObject): string {
  return object?.name ? object.name.toLowerCase() : 'that';
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
    const objectName = object.name ? object.name.toLowerCase() : 'that';
    
    if (object.hasFlag(ObjectFlag.ACTORBIT)) {
      return formatMessage("The {object} wouldn't appreciate that.", { object: objectName });
    }
    
    if (object.size && object.size > 50) {
      return formatMessage(ERROR_MESSAGES.TOO_HEAVY_LIFT, { object: objectName });
    }
    
    return formatMessage(ERROR_MESSAGES.CANT_TAKE, { object: objectName });
  }
  
  // Check weight
  if (state) {
    const currentWeight = state.getInventoryWeight();
    const objectWeight = object.size || 0;
    const loadAllowed = state.getGlobalVariable('LOAD_ALLOWED') || 100;
    if (currentWeight + objectWeight > loadAllowed) {
      // Check if player is wounded (reduced capacity)
      const loadMax = state.getGlobalVariable('LOAD_MAX') || 100;
      if (loadAllowed < loadMax) {
        return ERROR_MESSAGES.TOO_HEAVY + ', especially in light of your condition.';
      }
      return ERROR_MESSAGES.TOO_HEAVY;
    }
  }
  
  const objectName = object.name ? object.name.toLowerCase() : 'that';
  return formatMessage(ERROR_MESSAGES.CANT_TAKE, { object: objectName });
}

/**
 * Get specific error for DROP action
 */
function getDropError(object?: GameObject, state?: GameState): string {
  if (!object) {
    return ERROR_MESSAGES.DONT_HAVE;
  }
  
  if (state && !state.isInInventory(object.id)) {
    return formatMessage(ERROR_MESSAGES.NOT_HOLDING, { object: getObjectName(object) });
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
    return formatMessage(ERROR_MESSAGES.MUST_TELL_HOW, { object: getObjectName(object) });
  }
  
  // Check if already open
  if (object.hasFlag(ObjectFlag.OPENBIT)) {
    return formatMessage("The {object} is already open.", { object: getObjectName(object) });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_OPEN, { object: getObjectName(object) });
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
    return formatMessage(ERROR_MESSAGES.MUST_TELL_HOW, { object: getObjectName(object) });
  }
  
  // Check if already closed
  if (!object.hasFlag(ObjectFlag.OPENBIT)) {
    return formatMessage("The {object} is already closed.", { object: getObjectName(object) });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_CLOSE, { object: getObjectName(object) });
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
    return formatMessage(ERROR_MESSAGES.NOTHING_TO_READ, { object: getObjectName(object) });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_READ, { object: getObjectName(object) });
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
    return formatMessage(ERROR_MESSAGES.CANT_ATTACK, { object: getObjectName(object) });
  }
  
  // Check weapon
  if (!weapon || weapon.id === 'hands') {
    return formatMessage(ERROR_MESSAGES.ATTACK_WITH_HANDS, { object: getObjectName(object) });
  }
  
  if (!weapon.hasFlag(ObjectFlag.WEAPONBIT)) {
    return formatMessage(ERROR_MESSAGES.ATTACK_WITH_OBJECT, { 
      object: getObjectName(object),
      weapon: getObjectName(weapon)
    });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_ATTACK, { object: getObjectName(object) });
}

/**
 * Get specific error for EAT/DRINK action
 */
function getEatDrinkError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  if (!object.hasFlag(ObjectFlag.FOODBIT) && !object.hasFlag(ObjectFlag.DRINKBIT)) {
    return formatMessage(ERROR_MESSAGES.CANT_EAT, { object: getObjectName(object) });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_EAT, { object: getObjectName(object) });
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
    return formatMessage("Moving the {object} reveals nothing.", { object: getObjectName(object) });
  }
  
  // Check if it's too heavy
  if (object.size && object.size > 50) {
    return formatMessage(ERROR_MESSAGES.CANT_MOVE, { object: getObjectName(object) });
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_MOVE, { object: getObjectName(object) });
}

/**
 * Get specific error for CLIMB action
 */
function getClimbError(object?: GameObject): string {
  if (!object) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  
  return formatMessage(ERROR_MESSAGES.CANT_CLIMB, { object: getObjectName(object) });
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
    return `You can't turn on the ${object.name}.`;
  }
  
  // Check if already on
  if (object.hasFlag(ObjectFlag.ONBIT)) {
    return `The ${object.name} is already on.`;
  }
  
  return `You can't turn on the ${object.name}.`;
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
    return `You can't turn off the ${object.name}.`;
  }
  
  // Check if already off
  if (!object.hasFlag(ObjectFlag.ONBIT)) {
    return `The ${object.name} is already off.`;
  }
  
  return `You can't turn off the ${object.name}.`;
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
      object: getObjectName(object),
      target: getObjectName(recipient)
    });
  }
  
  return formatMessage(ERROR_MESSAGES.REFUSES_POLITELY, { object: getObjectName(recipient) });
}

/**
 * Get default error for unknown action
 */
function getDefaultError(action: string, object?: GameObject): string {
  if (object) {
    return formatMessage(ERROR_MESSAGES.CANT_DO_THAT_TO, { object: getObjectName(object) });
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
 * Get parser error message with variation
 */
export function getParserError(errorType: string, word?: string, objectName?: string): string {
  switch (errorType) {
    case 'UNKNOWN_WORD':
      return word ? getParserFeedback('UNKNOWN_WORD', { word }) : getParserFeedback('DONT_UNDERSTAND');
    
    case 'INVALID_SYNTAX':
      return getParserFeedback('DONT_UNDERSTAND');
    
    case 'NO_VERB':
      return getParserFeedback('NO_VERB');
    
    case 'AMBIGUOUS':
      return objectName ? getParserFeedback('AMBIGUOUS', { object: objectName }) : ERROR_MESSAGES.WHICH_ONE;
    
    case 'OBJECT_NOT_FOUND':
      return objectName ? getParserFeedback('NOT_HERE', { object: objectName }) : getParserFeedback('CANT_SEE');
    
    default:
      return getParserFeedback('DONT_UNDERSTAND');
  }
}

/**
 * Get humorous response for silly actions
 */
export function getSillyResponse(action: string): string {
  switch (action.toLowerCase()) {
    case 'jigs':
      return 'Bad luck, huh?';
    case 'fweep':
      return 'Fweep!';
    default:
      return ERROR_MESSAGES.CANT_DO_THAT;
  }
}

/**
 * Get a random generic refusal message
 * Used for impossible or silly actions (YUKS from gverbs.zil)
 */
export function getGenericRefusal(): string {
  const messages = [
    ERROR_MESSAGES.VALIANT_ATTEMPT,
    ERROR_MESSAGES.CANT_BE_SERIOUS,
    ERROR_MESSAGES.INTERESTING_IDEA,
    ERROR_MESSAGES.WHAT_A_CONCEPT
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get contextual refusal based on action type
 */
export function getContextualRefusal(action: string, object?: GameObject): string {
  const actionLower = action.toLowerCase();
  
  // Specific contextual refusals
  switch (actionLower) {
    case 'launch':
      return object?.hasFlag(ObjectFlag.VEHBIT) 
        ? "You can't launch that by saying \"launch\"!"
        : ERROR_MESSAGES.PRETTY_WEIRD;
    
    case 'drink-from':
      return ERROR_MESSAGES.PECULIAR;
    
    case 'bug':
      return ERROR_MESSAGES.ONLY_YOUR_OPINION;
    
    default:
      // Return a random generic refusal for other cases
      return getGenericRefusal();
  }
}

/**
 * Get error for object in closed container
 */
export function getClosedContainerError(): string {
  return ERROR_MESSAGES.CANT_REACH_CLOSED;
}

/**
 * Get error for floating object
 */
export function getFloatingObjectError(): string {
  return ERROR_MESSAGES.CANT_REACH_FLOATING;
}

/**
 * Get error for object on ceiling
 */
export function getCeilingError(): string {
  return ERROR_MESSAGES.CANT_REACH_CEILING;
}

/**
 * Get error for trying to fit through something
 */
export function getCantFitError(): string {
  return ERROR_MESSAGES.CANT_FIT_CRACK;
}

/**
 * Get error for climbing with too much weight
 */
export function getCarryingTooMuchError(): string {
  return ERROR_MESSAGES.CANT_GET_UP_CARRYING;
}

/**
 * Get error for boarded windows
 */
export function getBoardedWindowError(): string {
  return ERROR_MESSAGES.BOARDED_CANT_OPEN;
}

/**
 * Get error for boarded door
 */
export function getBoardedDoorError(): string {
  return ERROR_MESSAGES.DOOR_BOARDED;
}
