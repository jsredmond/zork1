/**
 * ObjectInteractionManager implementation for Z-Machine compatible object interactions
 */

import { GameState } from '../game/state';
import { ObjectInteractionManager, ObjectErrorType, ObjectContext, ActionResult } from './interfaces';

export class ZMachineObjectInteraction implements ObjectInteractionManager {
  
  /**
   * Validates an object action and returns appropriate result
   * Follows Z-Machine error checking order: possession first, then visibility
   */
  validateObjectAction(action: string, object: string, gameState: GameState): ActionResult {
    const context = this.analyzeObjectContext(object, gameState);
    
    // Z-Machine checks possession FIRST for actions that require it
    if (this.actionRequiresPossession(action) && !context.isPossessed) {
      return {
        success: false,
        message: "You don't have that!",
        errorType: ObjectErrorType.NOT_POSSESSED
      };
    }
    
    // Then check visibility for actions that need visible objects
    if (!context.isVisible && !this.actionRequiresPossession(action)) {
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.NOT_VISIBLE, context),
        errorType: ObjectErrorType.NOT_VISIBLE
      };
    }
    
    // Action is valid
    return {
      success: true,
      message: ''
    };
  }

  /**
   * Generates context-appropriate error messages
   * Follows Z-Machine error message patterns with proper article usage
   */
  generateErrorMessage(errorType: ObjectErrorType, context: ObjectContext): string {
    switch (errorType) {
      case ObjectErrorType.NOT_POSSESSED:
        // Handle special case for "drop all" when empty-handed
        if (context.impliedObject) {
          return `You don't have the ${context.impliedObject}.`;
        }
        // If no implied object, use generic empty-handed message
        return "You are empty-handed.";
      
      case ObjectErrorType.NOT_VISIBLE:
        if (context.object) {
          // Use proper article for visibility errors
          return `You can't see any ${context.object} here!`;
        }
        return "You can't see that here!";
      
      case ObjectErrorType.CANNOT_MANIPULATE:
        if (context.object) {
          // Use "the" for manipulation errors (object is known to exist)
          return `You can't do that to the ${context.object}.`;
        }
        return "You can't do that.";
      
      case ObjectErrorType.INVALID_OBJECT:
        if (context.object) {
          // Use "any" for invalid object errors (object doesn't exist)
          return `I don't see any ${context.object} here.`;
        }
        return "I don't understand that.";
      
      default:
        return "You can't do that.";
    }
  }

  /**
   * Checks if an object is visible to the player
   */
  checkObjectVisibility(object: string, gameState: GameState): boolean {
    if (!object || !gameState) {
      return false;
    }

    // Check if object is in current room
    const currentRoom = gameState.currentRoom;
    if (currentRoom?.objects?.some(obj => 
      obj.name.toLowerCase() === object.toLowerCase() || 
      obj.synonyms?.some(syn => syn.toLowerCase() === object.toLowerCase())
    )) {
      return true;
    }

    // Check if object is in inventory
    if (gameState.inventory?.some(obj => 
      obj.name.toLowerCase() === object.toLowerCase() ||
      obj.synonyms?.some(syn => syn.toLowerCase() === object.toLowerCase())
    )) {
      return true;
    }

    // Check if it's a room feature or scenery
    if (currentRoom?.scenery?.some(scenery => 
      scenery.toLowerCase() === object.toLowerCase()
    )) {
      return true;
    }

    return false;
  }

  /**
   * Analyzes object context for error message generation
   */
  private analyzeObjectContext(object: string, gameState: GameState): ObjectContext {
    const context: ObjectContext = {
      object: object,
      isVisible: false,
      isPossessed: false
    };

    if (!object || !gameState) {
      return context;
    }

    // Check visibility
    context.isVisible = this.checkObjectVisibility(object, gameState);

    // Check possession
    context.isPossessed = gameState.inventory?.some(obj => 
      obj.name.toLowerCase() === object.toLowerCase() ||
      obj.synonyms?.some(syn => syn.toLowerCase() === object.toLowerCase())
    ) || false;

    // Set location context
    if (context.isPossessed) {
      context.location = 'inventory';
    } else if (context.isVisible) {
      context.location = gameState.currentRoom?.name || 'unknown';
    } else {
      context.location = 'unknown';
    }

    return context;
  }

  /**
   * Determines if an action requires the object to be possessed
   */
  private actionRequiresPossession(action: string): boolean {
    const possessionActions = [
      'drop', 'throw', 'give', 'put', 'wear', 'wield', 
      'eat', 'drink', 'read', 'turn', 'wave'
    ];
    
    return possessionActions.includes(action.toLowerCase());
  }

  /**
   * Handles special case for "drop all" command
   */
  handleDropAllCommand(gameState: GameState): ActionResult {
    if (!gameState.inventory || gameState.inventory.length === 0) {
      // When empty-handed, Z-Machine behavior varies by context
      // If there was an implied object in the command, use specific message
      const context: ObjectContext = {
        isVisible: false,
        isPossessed: false,
        impliedObject: this.getImpliedObjectFromContext(gameState)
      };
      
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.NOT_POSSESSED, context),
        errorType: ObjectErrorType.NOT_POSSESSED
      };
    }

    return {
      success: true,
      message: ''
    };
  }

  /**
   * Determines implied object from game context for enhanced error messages
   * Based on Z-Machine behavior for "drop all" when empty-handed
   */
  private getImpliedObjectFromContext(gameState: GameState): string | undefined {
    const currentRoom = gameState.getCurrentRoom();
    if (!currentRoom || !currentRoom.globalObjects) {
      return undefined;
    }

    // Priority order for prominent objects based on Z-Machine behavior
    const prominentObjectPriority = [
      'FOREST',      // Forest areas - highest priority
      'WHITE-HOUSE', // House areas - second priority
      'TREE',        // Tree areas - third priority
      'BOARD',       // Boarded areas
      'BOARDED-WINDOW' // Window areas
    ];

    // Find the first prominent object that exists in this room
    for (const objectName of prominentObjectPriority) {
      if (currentRoom.globalObjects.includes(objectName)) {
        // Convert object ID to display name
        return this.getObjectDisplayName(objectName);
      }
    }

    return undefined;
  }

  /**
   * Converts object ID to display name for error messages
   * Handles proper article usage and formatting
   */
  private getObjectDisplayName(objectId: string): string {
    const displayNames: Record<string, string> = {
      'FOREST': 'forest',
      'WHITE-HOUSE': 'white house',
      'TREE': 'tree',
      'BOARD': 'board',
      'BOARDED-WINDOW': 'window',
      'KITCHEN-WINDOW': 'window',
      'SONGBIRD': 'songbird'
    };

    return displayNames[objectId] || objectId.toLowerCase().replace('-', ' ');
  }

  /**
   * Gets the appropriate article for an object name
   */
  private getArticle(objectName: string): string {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = objectName.charAt(0).toLowerCase();
    
    // Special cases for specific objects
    const specialArticles: Record<string, string> = {
      'white house': 'the',
      'forest': 'the',
      'tree': 'the',
      'window': 'the',
      'board': 'the'
    };

    if (specialArticles[objectName]) {
      return specialArticles[objectName];
    }

    // Default article rules
    return vowels.includes(firstLetter) ? 'an' : 'a';
  }

  /**
   * Formats object name with appropriate article for error messages
   */
  private formatObjectWithArticle(objectName: string): string {
    const article = this.getArticle(objectName);
    return `${article} ${objectName}`;
  }

  /**
   * Validates object manipulation based on object properties
   * Uses proper Z-Machine error checking order
   */
  validateObjectManipulation(object: string, action: string, gameState: GameState): ActionResult {
    const context = this.analyzeObjectContext(object, gameState);
    
    // Z-Machine order: Check possession first for possession-requiring actions
    if (this.actionRequiresPossession(action) && !context.isPossessed) {
      return {
        success: false,
        message: "You don't have that!",
        errorType: ObjectErrorType.NOT_POSSESSED
      };
    }

    // Then check visibility for non-possession actions
    if (!context.isVisible && !this.actionRequiresPossession(action)) {
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.NOT_VISIBLE, context),
        errorType: ObjectErrorType.NOT_VISIBLE
      };
    }

    // Check if object can be manipulated in the requested way
    if (!this.canManipulateObject(object, action, gameState)) {
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.CANNOT_MANIPULATE, context),
        errorType: ObjectErrorType.CANNOT_MANIPULATE
      };
    }

    return {
      success: true,
      message: ''
    };
  }

  /**
   * Determines if an object can be manipulated in a specific way
   */
  private canManipulateObject(object: string, action: string, gameState: GameState): boolean {
    // This would need to check object properties from the game data
    // For now, assume most objects can be manipulated unless they're scenery
    const currentRoom = gameState.getCurrentRoom();
    
    // Check if it's scenery (usually can't be manipulated)
    if (currentRoom?.scenery?.some(scenery => 
      scenery.toLowerCase() === object.toLowerCase()
    )) {
      return false;
    }

    return true;
  }

  /**
   * Generates context-sensitive success messages for object interactions
   */
  generateSuccessMessage(action: string, object: string, context: ObjectContext): string {
    const actionMessages: Record<string, string> = {
      'take': `Taken.`,
      'drop': `Dropped.`,
      'examine': `You see nothing special about the ${object}.`,
      'look': `You see nothing special about the ${object}.`,
      'touch': `You feel nothing unexpected.`,
      'move': `Moving the ${object} reveals nothing.`,
      'push': `Nothing happens.`,
      'pull': `Nothing happens.`
    };

    return actionMessages[action.toLowerCase()] || `You ${action} the ${object}.`;
  }
}