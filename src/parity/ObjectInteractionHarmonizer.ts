/**
 * ObjectInteractionHarmonizer - Aligns object interaction behavior with Z-Machine
 * 
 * This module standardizes error messages and object interaction patterns
 * to match the original Z-Machine implementation exactly.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3
 */

import { GameState } from '../game/state.js';

// Note: ErrorMessageStandardizer is available for additional message standardization if needed
// import { ErrorMessageStandardizer } from './ErrorMessageStandardizer.js';

// Note: GameObject type is used in interface definitions and method signatures

/**
 * Error message mappings from TypeScript to Z-Machine format
 */
export interface ErrorMessageMapping {
  tsPattern: RegExp;
  zmMessage: string;
  context?: string;
}

/**
 * Object interaction result
 */
export interface HarmonizedResult {
  message: string;
  wasHarmonized: boolean;
  originalMessage?: string;
  harmonizationType?: string;
}

/**
 * Container interaction context for alignment
 */
export interface ContainerInteractionContext {
  verb: string;
  directObjectName?: string;
  indirectObjectName?: string;
  isDirectObjectInInventory: boolean;
  isDirectObjectVisible: boolean;
  isDirectObjectKnown: boolean;
  isIndirectObjectContainer: boolean;
  isIndirectObjectOpen: boolean;
}

/**
 * Scenery error mapping interface
 * Maps object/verb combinations to Z-Machine error messages
 * Requirements: 2.1, 2.4, 2.5
 */
export interface SceneryErrorMapping {
  objectPattern: RegExp | string;
  verb: string | string[];
  message: string;
  interpolate?: boolean;  // If true, {object} in message will be replaced
}

/**
 * Scenery error mappings for objects that can't be manipulated
 * Maps object/verb combinations to exact Z-Machine messages
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 10.4
 */
const SCENERY_ERROR_MAPPINGS: SceneryErrorMapping[] = [
  // TAKE scenery - "What a concept!" (Requirement 2.1, 10.3)
  { objectPattern: /^(forest|trees?)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(white[\s-]?house|house)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(sky|sun|moon|stars?)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(ground|floor|earth)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(wall|walls|ceiling)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(air|wind|breeze)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  { objectPattern: /^(clearing|path|road)$/i, verb: ['take', 'get', 'pick'], message: 'What a concept!' },
  
  // TAKE large/impossible objects - "An interesting idea..." (Requirement 2.1, 10.4)
  { objectPattern: /^(dam|reservoir|river|water)$/i, verb: ['take', 'get', 'pick'], message: 'An interesting idea...' },
  { objectPattern: /^(mountain|cliff|canyon)$/i, verb: ['take', 'get', 'pick'], message: 'An interesting idea...' },
  { objectPattern: /^(machine|control[\s-]?panel)$/i, verb: ['take', 'get', 'pick'], message: 'An interesting idea...' },
  { objectPattern: /^(lake|stream|brook)$/i, verb: ['take', 'get', 'pick'], message: 'An interesting idea...' },
  
  // TURN without tools - "Your bare hands don't appear to be enough." (Requirement 2.2)
  { objectPattern: /^(bolt|screw|wheel|dial|knob|switch)$/i, verb: 'turn', message: "Your bare hands don't appear to be enough." },
  
  // PUSH immovable - "Pushing the X isn't notably helpful." (Requirement 2.3)
  { objectPattern: /^(wall|tree|house|dam|machine|boulder|rock)$/i, verb: 'push', message: "Pushing the {object} isn't notably helpful.", interpolate: true },
  { objectPattern: /^(white[\s-]?house)$/i, verb: 'push', message: "Pushing the white house isn't notably helpful." },
  { objectPattern: /^(forest)$/i, verb: 'push', message: "Pushing the forest isn't notably helpful." },
  
  // PULL board - "You can't move the board." (Requirement 2.4)
  { objectPattern: /^board$/i, verb: 'pull', message: "You can't move the board." },
  
  // PULL other immovable objects
  { objectPattern: /^(wall|tree|house|dam|machine|boulder|rock)$/i, verb: 'pull', message: "You can't move the {object}.", interpolate: true },
  
  // OPEN white house - "I can't see how to get in from here." (Requirement 2.5)
  { objectPattern: /^(white[\s-]?house|house)$/i, verb: 'open', message: "I can't see how to get in from here." }
];

/**
 * ObjectInteractionHarmonizer ensures object interactions match Z-Machine behavior
 */
export class ObjectInteractionHarmonizer {
  /**
   * Error message mappings for harmonization
   * Maps TypeScript error patterns to Z-Machine equivalents
   * 
   * Requirements: 2.2, 2.3, 2.4
   */
  private static readonly ERROR_MAPPINGS: ErrorMessageMapping[] = [
    // Drop command without object
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to drop?",
      context: "drop"
    },
    // Take command without object  
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to take?",
      context: "take"
    },
    // Put command without object
    {
      tsPattern: /^There seems to be a noun missing in that sentence!$/i,
      zmMessage: "What do you want to put?",
      context: "put"
    },
    // Object not visible - "You can't see any X here!"
    {
      tsPattern: /^You can't see any (.+) here!$/i,
      zmMessage: "You can't see any $1 here!",
      context: "visibility"
    },
    // Object not in possession for put
    {
      tsPattern: /^You can't see any (.+) here!$/i,
      zmMessage: "You don't have that!",
      context: "put_possession"
    },
    // Push doesn't work - "Pushing the X isn't notably helpful." (Requirement 2.3)
    {
      tsPattern: /^Pushing the (.+) doesn't seem to work\.$/i,
      zmMessage: "Pushing the $1 isn't notably helpful.",
      context: "push"
    },
    // Push has no effect - alternate pattern
    {
      tsPattern: /^Pushing the (.+) has no effect\.$/i,
      zmMessage: "Pushing the $1 isn't notably helpful.",
      context: "push"
    },
    // Turn has no effect - "Your bare hands don't appear to be enough." (Requirement 2.2)
    {
      tsPattern: /^This has no effect\.$/i,
      zmMessage: "Your bare hands don't appear to be enough.",
      context: "turn"
    },
    // Turn doesn't work - alternate pattern
    {
      tsPattern: /^Turning the (.+) has no effect\.$/i,
      zmMessage: "Your bare hands don't appear to be enough.",
      context: "turn"
    },
    // Turn without tools - alternate pattern
    {
      tsPattern: /^You can't turn that\.$/i,
      zmMessage: "Your bare hands don't appear to be enough.",
      context: "turn"
    },
    // Pull board - "You can't move the board." (Requirement 2.4)
    {
      tsPattern: /^Pulling the board isn't notably helpful\.$/i,
      zmMessage: "You can't move the board.",
      context: "pull_board"
    },
    // Pull doesn't work - generic
    {
      tsPattern: /^Pulling the (.+) doesn't seem to work\.$/i,
      zmMessage: "You can't move the $1.",
      context: "pull"
    },
    // Pull has no effect - alternate pattern
    {
      tsPattern: /^Pulling the (.+) has no effect\.$/i,
      zmMessage: "You can't move the $1.",
      context: "pull"
    },
    // Can't take scenery
    {
      tsPattern: /^You can't take the (.+)\.$/i,
      zmMessage: "What a concept!",
      context: "take_scenery"
    },
    // Can't be serious (take large objects)
    {
      tsPattern: /^You can't be serious\.$/i,
      zmMessage: "An interesting idea...",
      context: "take_large"
    }
  ];

  /**
   * Harmonize a command result to match Z-Machine behavior
   */
  harmonizeResponse(
    message: string, 
    command: string, 
    _state: GameState
  ): HarmonizedResult {
    const verb = this.extractVerb(command);
    
    // Try to find a matching error pattern
    for (const mapping of ObjectInteractionHarmonizer.ERROR_MAPPINGS) {
      if (mapping.tsPattern.test(message)) {
        // Check if context matches
        if (mapping.context && !this.contextMatches(mapping.context, verb, command)) {
          continue;
        }
        
        // Apply the mapping
        const harmonizedMessage = message.replace(mapping.tsPattern, mapping.zmMessage);
        
        return {
          message: harmonizedMessage,
          wasHarmonized: true,
          originalMessage: message,
          harmonizationType: mapping.context || 'general'
        };
      }
    }
    
    // No harmonization needed
    return {
      message,
      wasHarmonized: false
    };
  }

  /**
   * Harmonize "drop" command error messages specifically
   */
  harmonizeDropCommand(message: string, hasObject: boolean): string {
    if (!hasObject && message.includes("noun missing")) {
      return "What do you want to drop?";
    }
    return message;
  }

  /**
   * Harmonize object visibility errors
   * 
   * For PUT commands, if object isn't possessed, use "You don't have that!"
   * instead of "You can't see any X here!"
   * 
   * Requirement 2.6
   */
  harmonizeObjectVisibility(
    message: string, 
    _objectName: string, 
    isInPossession: boolean,
    verb: string
  ): string {
    // For "put" commands, if object isn't possessed, use "You don't have that!"
    if ((verb === 'put' || verb === 'place' || verb === 'insert') && !isInPossession) {
      if (message.includes("can't see any")) {
        return "You don't have that!";
      }
    }
    
    return message;
  }

  /**
   * Check if a PUT command should return a possession error
   * Returns true if the player is trying to PUT an object they don't have
   * 
   * Requirement 2.6
   */
  isPutPossessionError(
    verb: string,
    isObjectInInventory: boolean,
    isObjectKnown: boolean
  ): boolean {
    // Only applies to PUT/PLACE/INSERT commands
    const isPutVerb = ['put', 'place', 'insert'].includes(verb.toLowerCase());
    
    if (!isPutVerb) {
      return false;
    }
    
    // If the object is known but not in inventory, it's a possession error
    return isObjectKnown && !isObjectInInventory;
  }

  /**
   * Get the appropriate error message for PUT when player doesn't have the object
   * 
   * Requirement 2.6
   */
  getPutPossessionError(): string {
    return "You don't have that!";
  }

  /**
   * Extract the verb from a command
   */
  private extractVerb(command: string): string {
    const words = command.trim().toLowerCase().split(/\s+/);
    return words[0] || '';
  }

  /**
   * Check if the context matches the command
   */
  private contextMatches(context: string, verb: string, command: string): boolean {
    switch (context) {
      case 'drop':
        return verb === 'drop';
      case 'take':
        return verb === 'take' || verb === 'get';
      case 'put':
        return verb === 'put';
      case 'push':
        return verb === 'push';
      case 'turn':
        return verb === 'turn';
      case 'pull':
        return verb === 'pull';
      case 'pull_board':
        // Specifically for pulling the board
        return verb === 'pull' && /\bboard\b/i.test(command);
      case 'take_scenery':
        return (verb === 'take' || verb === 'get');
      case 'take_large':
        return (verb === 'take' || verb === 'get');
      case 'put_possession':
        return verb === 'put';
      case 'visibility':
        return true; // Applies to any verb
      default:
        return true;
    }
  }

  /**
   * Get the Z-Machine equivalent error message for a verb without object
   */
  getVerbWithoutObjectError(verb: string): string {
    const verbErrors: Record<string, string> = {
      'drop': "What do you want to drop?",
      'take': "What do you want to take?",
      'get': "What do you want to take?",
      'put': "What do you want to put?",
      'examine': "What do you want to examine?",
      'open': "What do you want to open?",
      'close': "What do you want to close?",
      'read': "What do you want to read?",
      'attack': "What do you want to attack?",
      'kill': "What do you want to attack?"
    };
    
    return verbErrors[verb.toLowerCase()] || "There seems to be a noun missing in that sentence!";
  }

  /**
   * Get the Z-Machine error message for TURN command
   * Returns "Your bare hands don't appear to be enough." for objects requiring tools
   * 
   * Requirement 2.2
   */
  getTurnError(objectName: string): string {
    // Check if this is an object that requires tools to turn
    const requiresTools = /^(bolt|screw|wheel|dial|knob|switch)$/i.test(objectName);
    
    if (requiresTools) {
      return "Your bare hands don't appear to be enough.";
    }
    
    // For other objects, use the scenery error if available
    const sceneryError = this.getSceneryError(objectName, 'turn');
    if (sceneryError) {
      return sceneryError;
    }
    
    // Default turn error
    return "Your bare hands don't appear to be enough.";
  }

  /**
   * Get the Z-Machine error message for PUSH command
   * Returns "Pushing the X isn't notably helpful." for immovable objects
   * 
   * Requirement 2.3
   */
  getPushError(objectName: string): string {
    // Check for scenery-specific error first
    const sceneryError = this.getSceneryError(objectName, 'push');
    if (sceneryError) {
      return sceneryError;
    }
    
    // Default push error with object name
    const cleanName = objectName.toLowerCase().trim();
    return `Pushing the ${cleanName} isn't notably helpful.`;
  }

  /**
   * Get the Z-Machine error message for PULL command
   * Returns "You can't move the board." for the board specifically
   * Returns "You can't move the X." for other immovable objects
   * 
   * Requirement 2.4
   */
  getPullError(objectName: string): string {
    // Check for scenery-specific error first (handles board specifically)
    const sceneryError = this.getSceneryError(objectName, 'pull');
    if (sceneryError) {
      return sceneryError;
    }
    
    // Default pull error with object name
    const cleanName = objectName.toLowerCase().trim();
    return `You can't move the ${cleanName}.`;
  }

  /**
   * Check if a message indicates an object visibility error
   */
  isObjectVisibilityError(message: string): boolean {
    return /can't see any|don't see any|no .+ here/i.test(message);
  }

  /**
   * Check if a message indicates a possession error
   */
  isPossessionError(message: string): boolean {
    return /don't have|not carrying|aren't holding/i.test(message);
  }

  /**
   * Normalize error message format to match Z-Machine style
   */
  normalizeErrorFormat(message: string): string {
    // Ensure proper capitalization
    if (message.length > 0) {
      message = message.charAt(0).toUpperCase() + message.slice(1);
    }
    
    // Ensure proper punctuation
    if (!/[.!?]$/.test(message)) {
      message += '.';
    }
    
    return message;
  }

  /**
   * Get scenery-specific error message for object/verb combination
   * Returns null if no specific message exists
   * 
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 10.4
   */
  getSceneryError(object: string, verb: string): string | null {
    const normalizedVerb = verb.toLowerCase().trim();
    const normalizedObject = object.toLowerCase().trim();
    
    for (const mapping of SCENERY_ERROR_MAPPINGS) {
      // Check if verb matches (can be string or array of strings)
      const verbMatches = Array.isArray(mapping.verb)
        ? mapping.verb.includes(normalizedVerb)
        : mapping.verb === normalizedVerb;
      
      if (!verbMatches) {
        continue;
      }
      
      // Check if object matches pattern
      const pattern = mapping.objectPattern;
      const objectMatches = typeof pattern === 'string'
        ? pattern.toLowerCase() === normalizedObject
        : pattern.test(normalizedObject);
      
      if (objectMatches) {
        // Handle message interpolation if needed
        if (mapping.interpolate) {
          return mapping.message.replace('{object}', normalizedObject);
        }
        return mapping.message;
      }
    }
    
    return null;
  }

  /**
   * Check if an object is scenery (can't be taken/manipulated)
   * 
   * Requirements: 2.1
   */
  isSceneryObject(object: string): boolean {
    const normalizedObject = object.toLowerCase().trim();
    
    // Check against all scenery patterns
    for (const mapping of SCENERY_ERROR_MAPPINGS) {
      const pattern = mapping.objectPattern;
      const matches = typeof pattern === 'string'
        ? pattern.toLowerCase() === normalizedObject
        : pattern.test(normalizedObject);
      
      if (matches) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all scenery error mappings (for testing)
   */
  static getSceneryErrorMappings(): SceneryErrorMapping[] {
    return [...SCENERY_ERROR_MAPPINGS];
  }

  /**
   * Align container interaction error messages with Z-Machine behavior
   * 
   * Key difference: Z-Machine says "You don't have that!" when trying to PUT
   * an object the player doesn't possess, while TypeScript says "You can't see any X here!"
   * 
   * Requirements: 3.3
   */
  alignContainerInteractions(
    message: string,
    context: ContainerInteractionContext
  ): HarmonizedResult {
    const verb = context.verb.toLowerCase();
    
    // Handle PUT/PLACE/INSERT commands
    if (verb === 'put' || verb === 'place' || verb === 'insert') {
      return this.alignPutCommandError(message, context);
    }
    
    // Handle REMOVE/TAKE FROM commands
    if (verb === 'remove' || (verb === 'take' && context.indirectObjectName)) {
      return this.alignRemoveCommandError(message, context);
    }
    
    return {
      message,
      wasHarmonized: false
    };
  }

  /**
   * Align PUT command error messages with Z-Machine behavior
   * 
   * Z-Machine behavior for PUT X IN Y:
   * - If X is not a known word: "I don't know the word 'X'."
   * - If X is known but player doesn't have it: "You don't have that!"
   * - If X is visible but not in inventory: "You don't have the X."
   * - If Y is not a container: "You can't do that."
   * - If Y is closed: "The Y isn't open."
   */
  private alignPutCommandError(
    message: string,
    context: ContainerInteractionContext
  ): HarmonizedResult {
    // Case 1: Direct object not visible but is a known object type
    // Z-Machine says "You don't have that!" not "You can't see any X here!"
    if (message.includes("can't see any") && context.isDirectObjectKnown && !context.isDirectObjectInInventory) {
      return {
        message: "You don't have that!",
        wasHarmonized: true,
        originalMessage: message,
        harmonizationType: 'put_possession'
      };
    }
    
    // Case 2: Direct object visible but not in inventory
    // Z-Machine says "You don't have the X."
    if (context.isDirectObjectVisible && !context.isDirectObjectInInventory) {
      const objectName = context.directObjectName?.toLowerCase() || 'that';
      return {
        message: `You don't have the ${objectName}.`,
        wasHarmonized: true,
        originalMessage: message,
        harmonizationType: 'put_not_holding'
      };
    }
    
    return {
      message,
      wasHarmonized: false
    };
  }

  /**
   * Align REMOVE/TAKE FROM command error messages with Z-Machine behavior
   */
  private alignRemoveCommandError(
    message: string,
    context: ContainerInteractionContext
  ): HarmonizedResult {
    // If container is closed, Z-Machine says "The X is closed."
    if (!context.isIndirectObjectOpen && context.isIndirectObjectContainer) {
      const containerName = context.indirectObjectName?.toLowerCase() || 'container';
      return {
        message: `The ${containerName} is closed.`,
        wasHarmonized: true,
        originalMessage: message,
        harmonizationType: 'container_closed'
      };
    }
    
    return {
      message,
      wasHarmonized: false
    };
  }

  /**
   * Check if an object name is a known game object
   * This helps distinguish between "unknown word" and "object not possessed" errors
   */
  isKnownObjectName(objectName: string, state: GameState): boolean {
    const normalizedName = objectName.toLowerCase();
    
    // Check all objects in the game
    for (const [_id, obj] of state.objects.entries()) {
      // Check main name
      if (obj.name.toLowerCase() === normalizedName) {
        return true;
      }
      
      // Check synonyms
      if (obj.synonyms.some(syn => syn.toLowerCase() === normalizedName)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get the appropriate error message for a PUT command based on context
   */
  getPutCommandError(
    directObjectName: string | undefined,
    _indirectObjectName: string | undefined,
    state: GameState
  ): string {
    if (!directObjectName) {
      return "What do you want to put?";
    }
    
    // Check if the direct object is a known game object
    const isKnown = directObjectName ? this.isKnownObjectName(directObjectName, state) : false;
    
    if (isKnown) {
      // Object is known but player doesn't have it
      return "You don't have that!";
    }
    
    // Object is not known - use visibility error
    return `You can't see any ${directObjectName.toLowerCase()} here!`;
  }

  /**
   * Synchronize inventory state with Z-Machine behavior
   * Ensures inventory operations produce identical results
   * 
   * Requirements: 3.4
   */
  synchronizeInventoryState(
    state: GameState,
    operation: 'add' | 'remove' | 'check',
    objectId: string
  ): { success: boolean; message: string } {
    switch (operation) {
      case 'add':
        if (state.isInInventory(objectId)) {
          return {
            success: false,
            message: "You're already carrying that!"
          };
        }
        state.addToInventory(objectId);
        return {
          success: true,
          message: "Taken."
        };
        
      case 'remove':
        if (!state.isInInventory(objectId)) {
          return {
            success: false,
            message: "You're not carrying that!"
          };
        }
        state.removeFromInventory(objectId);
        return {
          success: true,
          message: "Dropped."
        };
        
      case 'check':
        return {
          success: state.isInInventory(objectId),
          message: state.isInInventory(objectId) 
            ? "You have it." 
            : "You don't have that!"
        };
        
      default:
        return {
          success: false,
          message: "Invalid operation."
        };
    }
  }

  /**
   * Get the Z-Machine error message for inventory operations
   * 
   * Requirements: 3.4
   */
  getInventoryOperationError(
    operation: string,
    objectName?: string,
    state?: GameState
  ): string {
    const operationLower = operation.toLowerCase();
    
    // Check if inventory is empty for drop operations
    if ((operationLower === 'drop' || operationLower === 'drop all') && state?.isInventoryEmpty()) {
      // Z-Machine uses context-aware message based on prominent objects in room
      const currentRoom = state.getCurrentRoom();
      if (currentRoom?.globalObjects?.includes('FOREST')) {
        return "You don't have the forest.";
      }
      if (currentRoom?.globalObjects?.includes('WHITE-HOUSE')) {
        return "You don't have the white house.";
      }
      return "You are empty-handed.";
    }
    
    // Standard inventory error messages
    const inventoryErrors: Record<string, string> = {
      'take': objectName 
        ? `You can't see any ${objectName.toLowerCase()} here!`
        : "What do you want to take?",
      'drop': objectName
        ? `You don't have the ${objectName.toLowerCase()}.`
        : "What do you want to drop?",
      'put': objectName
        ? "You don't have that!"
        : "What do you want to put?",
      'give': objectName
        ? `You don't have the ${objectName.toLowerCase()}.`
        : "What do you want to give?"
    };
    
    return inventoryErrors[operationLower] || "You can't do that.";
  }

  /**
   * Validate inventory state against Z-Machine expectations
   * 
   * Requirements: 3.4
   */
  validateInventoryState(state: GameState): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for orphaned inventory items (items in inventory but not in objects map)
    for (const itemId of state.inventory) {
      const obj = state.getObject(itemId);
      if (!obj) {
        issues.push(`Orphaned inventory item: ${itemId}`);
      }
    }
    
    // Check for items with PLAYER location but not in inventory array
    for (const [objId, obj] of state.objects.entries()) {
      if (obj.location === 'PLAYER' && !state.isInInventory(objId)) {
        issues.push(`Item has PLAYER location but not in inventory: ${objId}`);
      }
    }
    
    // Check for items in inventory array but with wrong location
    for (const itemId of state.inventory) {
      const obj = state.getObject(itemId);
      if (obj && obj.location !== 'PLAYER') {
        issues.push(`Item in inventory but location is ${obj.location}: ${itemId}`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Static factory method
   */
  static create(): ObjectInteractionHarmonizer {
    return new ObjectInteractionHarmonizer();
  }
}
