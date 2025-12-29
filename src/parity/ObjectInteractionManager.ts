/**
 * ObjectInteractionManager implementation for Z-Machine compatible object interactions
 */

import { GameState } from '../game/state';
import { ObjectInteractionManager, ObjectErrorType, ObjectContext, ActionResult } from './interfaces';

export class ZMachineObjectInteraction implements ObjectInteractionManager {
  
  /**
   * Validates an object action and returns appropriate result
   */
  validateObjectAction(action: string, object: string, gameState: GameState): ActionResult {
    const context = this.analyzeObjectContext(object, gameState);
    
    // Check visibility first
    if (!context.isVisible) {
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.NOT_VISIBLE, context),
        errorType: ObjectErrorType.NOT_VISIBLE
      };
    }
    
    // Check possession for actions that require it
    if (this.actionRequiresPossession(action) && !context.isPossessed) {
      return {
        success: false,
        message: this.generateErrorMessage(ObjectErrorType.NOT_POSSESSED, context),
        errorType: ObjectErrorType.NOT_POSSESSED
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
   */
  generateErrorMessage(errorType: ObjectErrorType, context: ObjectContext): string {
    switch (errorType) {
      case ObjectErrorType.NOT_POSSESSED:
        // Handle special case for "drop all" when empty-handed
        if (context.impliedObject) {
          return `You don't have the ${context.impliedObject}.`;
        }
        return "You are empty-handed.";
      
      case ObjectErrorType.NOT_VISIBLE:
        if (context.object) {
          return `You can't see any ${context.object} here!`;
        }
        return "You can't see that here!";
      
      case ObjectErrorType.CANNOT_MANIPULATE:
        if (context.object) {
          return `You can't do that to the ${context.object}.`;
        }
        return "You can't do that.";
      
      case ObjectErrorType.INVALID_OBJECT:
        if (context.object) {
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
   * Attempts to determine implied object from game context
   */
  private getImpliedObjectFromContext(gameState: GameState): string | undefined {
    // This would need to be enhanced based on parser context
    // For now, return undefined to use generic message
    return undefined;
  }

  /**
   * Validates object manipulation based on object properties
   */
  validateObjectManipulation(object: string, action: string, gameState: GameState): ActionResult {
    const context = this.analyzeObjectContext(object, gameState);
    
    if (!context.isVisible) {
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
    const currentRoom = gameState.currentRoom;
    
    // Check if it's scenery (usually can't be manipulated)
    if (currentRoom?.scenery?.some(scenery => 
      scenery.toLowerCase() === object.toLowerCase()
    )) {
      return false;
    }

    return true;
  }
}