/**
 * Command Execution
 * Routes and executes parsed commands
 */

import { GameState } from '../game/state.js';
import { ParsedCommand, ParseError } from '../parser/parser.js';
import { ObjectFlag } from '../game/data/flags.js';
import { 
  ActionHandler, 
  ActionResult,
  TakeAction,
  DropAction,
  InventoryAction,
  MoveAction,
  ExamineAction,
  OpenAction,
  CloseAction,
  ReadAction,
  LookAction,
  ClimbAction,
  PutAction,
  RemoveAction,
  TurnOnAction,
  TurnOffAction,
  AttackAction,
  KillAction,
  ScoreAction,
  QuitAction,
  RestartAction,
  VerboseAction,
  BriefAction,
  SuperBriefAction,
  WaitAction,
  PushAction,
  PullAction,
  TurnAction,
  ThrowAction,
  TieAction,
  UnlockAction,
  WaveAction,
  RaiseAction,
  LowerAction,
  DrinkAction,
  ExorciseAction
} from '../game/actions.js';
import { handleDeadStateVerb, isPlayerDead } from '../game/deadState.js';
import { handleSelfReferenceVerb, isSelfReference } from '../game/selfReference.js';

/**
 * CommandExecutor routes parsed commands to appropriate action handlers
 * and updates game state based on action results
 */
export class CommandExecutor {
  private actionHandlers: Map<string, ActionHandler>;

  constructor() {
    this.actionHandlers = new Map();
    this.registerDefaultHandlers();
  }

  /**
   * Register default action handlers for common verbs
   */
  private registerDefaultHandlers(): void {
    // Movement verbs
    const moveAction = new MoveAction();
    this.actionHandlers.set('NORTH', moveAction);
    this.actionHandlers.set('SOUTH', moveAction);
    this.actionHandlers.set('EAST', moveAction);
    this.actionHandlers.set('WEST', moveAction);
    this.actionHandlers.set('UP', moveAction);
    this.actionHandlers.set('DOWN', moveAction);
    this.actionHandlers.set('IN', moveAction);
    this.actionHandlers.set('OUT', moveAction);
    this.actionHandlers.set('N', moveAction);
    this.actionHandlers.set('S', moveAction);
    this.actionHandlers.set('E', moveAction);
    this.actionHandlers.set('W', moveAction);
    this.actionHandlers.set('U', moveAction);
    this.actionHandlers.set('D', moveAction);
    this.actionHandlers.set('GO', moveAction);

    // Object manipulation verbs
    this.actionHandlers.set('TAKE', new TakeAction());
    this.actionHandlers.set('GET', new TakeAction());
    this.actionHandlers.set('PICK', new TakeAction());
    this.actionHandlers.set('DROP', new DropAction());
    this.actionHandlers.set('PUT', new DropAction());

    // Examination verbs
    this.actionHandlers.set('EXAMINE', new ExamineAction());
    this.actionHandlers.set('X', new ExamineAction());
    this.actionHandlers.set('LOOK', new LookAction());
    this.actionHandlers.set('L', new LookAction());
    this.actionHandlers.set('READ', new ReadAction());

    // Container verbs
    this.actionHandlers.set('OPEN', new OpenAction());
    this.actionHandlers.set('CLOSE', new CloseAction());
    this.actionHandlers.set('PUT', new PutAction());
    this.actionHandlers.set('PLACE', new PutAction());
    this.actionHandlers.set('INSERT', new PutAction());
    this.actionHandlers.set('REMOVE', new RemoveAction());

    // Inventory verb
    this.actionHandlers.set('INVENTORY', new InventoryAction());
    this.actionHandlers.set('I', new InventoryAction());
    
    // Climbing verb
    this.actionHandlers.set('CLIMB', new ClimbAction());
    
    // Light source verbs
    this.actionHandlers.set('TURN', new TurnAction());
    this.actionHandlers.set('LIGHT', new TurnOnAction());
    this.actionHandlers.set('EXTINGUISH', new TurnOffAction());
    this.actionHandlers.set('DOUSE', new TurnOffAction());
    
    // Combat verbs
    this.actionHandlers.set('ATTACK', new AttackAction());
    this.actionHandlers.set('KILL', new KillAction());
    this.actionHandlers.set('FIGHT', new AttackAction());
    this.actionHandlers.set('HIT', new AttackAction());
    
    // Game control verbs
    this.actionHandlers.set('SCORE', new ScoreAction());
    this.actionHandlers.set('QUIT', new QuitAction());
    this.actionHandlers.set('Q', new QuitAction());
    this.actionHandlers.set('RESTART', new RestartAction());
    this.actionHandlers.set('VERBOSE', new VerboseAction());
    this.actionHandlers.set('BRIEF', new BriefAction());
    this.actionHandlers.set('SUPERBRIEF', new SuperBriefAction());
    this.actionHandlers.set('WAIT', new WaitAction());
    this.actionHandlers.set('Z', new WaitAction());
    
    // Puzzle-related verbs
    this.actionHandlers.set('PUSH', new PushAction());
    this.actionHandlers.set('PRESS', new PushAction());
    this.actionHandlers.set('PULL', new PullAction());
    this.actionHandlers.set('TUG', new PullAction());
    this.actionHandlers.set('THROW', new ThrowAction());
    this.actionHandlers.set('TOSS', new ThrowAction());
    this.actionHandlers.set('TIE', new TieAction());
    this.actionHandlers.set('FASTEN', new TieAction());
    this.actionHandlers.set('UNLOCK', new UnlockAction());
    this.actionHandlers.set('WAVE', new WaveAction());
    this.actionHandlers.set('RAISE', new RaiseAction());
    this.actionHandlers.set('LOWER', new LowerAction());
    this.actionHandlers.set('DRINK', new DrinkAction());
    this.actionHandlers.set('EXORCISE', new ExorciseAction());
  }

  /**
   * Register a custom action handler for a verb
   */
  registerHandler(verb: string, handler: ActionHandler): void {
    this.actionHandlers.set(verb.toUpperCase(), handler);
  }

  /**
   * Execute a parsed command and update game state
   * @param command - The parsed command or parse error
   * @param state - The current game state
   * @returns ActionResult with success status and message
   */
  execute(command: ParsedCommand | ParseError, state: GameState): ActionResult {
    try {
      // Handle parse errors
      if ('type' in command && 'message' in command && !('verb' in command)) {
        return {
          success: false,
          message: command.message,
          stateChanges: []
        };
      }

      const parsedCommand = command as ParsedCommand;
      
      // Validate command has a verb
      if (!parsedCommand.verb) {
        return {
          success: false,
          message: "I don't understand that command.",
          stateChanges: []
        };
      }

      const verb = parsedCommand.verb.toUpperCase();

      // Check if player is dead and handle death state restrictions
      if (isPlayerDead(state)) {
        const deadMessage = handleDeadStateVerb(verb, state);
        if (deadMessage) {
          return {
            success: false,
            message: deadMessage,
            stateChanges: []
          };
        }
      }

      // Check if action is directed at self (ME/MYSELF/SELF/CRETIN)
      const directObjectId = parsedCommand.directObject?.name?.toUpperCase();
      const indirectObjectId = parsedCommand.indirectObject?.name?.toUpperCase();
      
      if (directObjectId && isSelfReference(directObjectId)) {
        const selfMessage = handleSelfReferenceVerb(verb, state, directObjectId, indirectObjectId);
        if (selfMessage) {
          return {
            success: false,
            message: selfMessage,
            stateChanges: []
          };
        }
      }
      
      if (indirectObjectId && isSelfReference(indirectObjectId)) {
        const selfMessage = handleSelfReferenceVerb(verb, state, directObjectId, indirectObjectId);
        if (selfMessage) {
          return {
            success: false,
            message: selfMessage,
            stateChanges: []
          };
        }
      }

      // Get the appropriate action handler
      const handler = this.actionHandlers.get(verb);

      if (!handler) {
        return {
          success: false,
          message: `I don't know how to ${verb.toLowerCase()}.`,
          stateChanges: []
        };
      }

      // Execute the action with appropriate arguments
      try {
        const result = this.executeHandler(handler, parsedCommand, state);
        
        // Apply state changes if action was successful
        if (result.success) {
          this.applyStateChanges(result.stateChanges, state);
        }

        return result;
      } catch (handlerError) {
        // Handle errors from action handlers gracefully
        console.error('Error in action handler:', handlerError);
        return {
          success: false,
          message: 'Something went wrong with that action.',
          stateChanges: []
        };
      }
    } catch (error) {
      // Catch-all for any unexpected errors
      // Log the error for debugging but don't crash
      console.error('Unexpected error in command execution:', error);
      return {
        success: false,
        message: 'Something unexpected happened. The game is still running.',
        stateChanges: []
      };
    }
  }

  /**
   * Execute a specific handler with the appropriate arguments
   */
  private executeHandler(
    handler: ActionHandler,
    command: ParsedCommand,
    state: GameState
  ): ActionResult {
    // Validate state is not null/undefined
    if (!state) {
      throw new Error('Game state is invalid');
    }

    const verb = command.verb.toUpperCase();

    // Movement commands
    if (this.isMovementVerb(verb)) {
      // For GO command, use direct object as direction
      if (verb === 'GO' && command.directObject) {
        const direction = command.directObject.name.toUpperCase();
        return handler.execute(state, direction);
      }
      // For direct movement commands, use the verb as direction
      return handler.execute(state, verb);
    }

    // Inventory command (no arguments)
    if (verb === 'INVENTORY' || verb === 'I') {
      return handler.execute(state);
    }

    // Look command (no arguments or LOOK IN container)
    if (verb === 'LOOK' || verb === 'L') {
      // Handle "LOOK IN container" - show container contents
      if (command.preposition === 'IN' && command.indirectObject) {
        return this.handleLookIn(state, command.indirectObject.id);
      }
      return handler.execute(state);
    }

    // Examine command (optional object)
    if (verb === 'EXAMINE' || verb === 'X') {
      if (command.directObject) {
        return handler.execute(state, command.directObject.id);
      }
      return handler.execute(state);
    }

    // Commands that require a direct object
    if (!command.directObject) {
      return {
        success: false,
        message: `What do you want to ${verb.toLowerCase()}?`,
        stateChanges: []
      };
    }

    // Commands with indirect objects (PUT X IN Y, PLACE X ON Y, etc.)
    if (command.indirectObject) {
      return handler.execute(
        state,
        command.directObject.id,
        command.indirectObject.id,
        command.preposition
      );
    }

    // Single object commands (TAKE, DROP, OPEN, CLOSE, READ)
    if (['TAKE', 'GET', 'PICK', 'DROP', 'OPEN', 'CLOSE', 'READ'].includes(verb)) {
      return handler.execute(state, command.directObject.id);
    }

    // Default: execute with direct object
    return handler.execute(state, command.directObject.id);
  }

  /**
   * Handle "LOOK IN container" command
   * Shows the contents of a container
   */
  private handleLookIn(state: GameState, containerId: string): ActionResult {
    const container = state.getObject(containerId);
    
    if (!container) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // Check if it's a container
    if (!container.hasFlag(ObjectFlag.CONTBIT)) {
      return {
        success: false,
        message: `You can't look inside the ${container.name.toLowerCase()}.`,
        stateChanges: []
      };
    }

    // Check if container is open
    if (!container.hasFlag(ObjectFlag.OPENBIT)) {
      return {
        success: false,
        message: `The ${container.name.toLowerCase()} is closed.`,
        stateChanges: []
      };
    }

    // Get contents
    const contents = state.getObjectsInContainer(containerId);
    
    if (contents.length === 0) {
      return {
        success: true,
        message: `The ${container.name.toLowerCase()} is empty.`,
        stateChanges: []
      };
    }

    // Format contents list
    let message = `The ${container.name.toLowerCase()} contains:\n`;
    for (const item of contents) {
      // Add article and capitalize first letter
      const firstChar = item.name.charAt(0).toLowerCase();
      const article = ['a', 'e', 'i', 'o', 'u'].includes(firstChar) ? 'An' : 'A';
      const itemName = item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
      message += `  ${article} ${itemName.toLowerCase()}\n`;
    }

    return {
      success: true,
      message: message.trim(),
      stateChanges: []
    };
  }

  /**
   * Check if a verb is a movement verb
   */
  private isMovementVerb(verb: string): boolean {
    const movementVerbs = [
      'NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN', 'IN', 'OUT',
      'N', 'S', 'E', 'W', 'U', 'D', 'GO'
    ];
    return movementVerbs.includes(verb);
  }

  /**
   * Apply state changes from an action result
   * This is a placeholder for future state change tracking
   */
  private applyStateChanges(_stateChanges: any[], _state: GameState): void {
    // State changes are already applied by the action handlers
    // This method is here for future enhancements like undo/redo
    // or state change logging
  }
}
