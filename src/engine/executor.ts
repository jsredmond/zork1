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
  TakeAllAction,
  DropAllAction,
  InventoryAction,
  MoveAction,
  MoveObjectAction,
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
  ExorciseAction,
  UlyssesAction,
  RingAction,
  JumpAction,
  PrayAction,
  CurseAction,
  SingAction,
  AdventAction,
  ListenAction,
  SmellAction,
  BreakAction,
  EatAction,
  VersionAction,
  AgainAction,
  SaveAction,
  RestoreAction,
  TouchAction,
  RubAction,
  ShakeAction,
  KnockAction,
  SayAction,
  EchoAction,
  DanceAction,
  SwimAction,
  DigAction,
  SleepAction,
  WakeAction,
  YellAction,
  FindAction,
  HelloAction,
  GoodbyeAction,
  ThankAction,
  YesAction,
  NoAction,
  DiagnoseAction
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
    this.actionHandlers.set('NORTHEAST', moveAction);
    this.actionHandlers.set('NORTHWEST', moveAction);
    this.actionHandlers.set('SOUTHEAST', moveAction);
    this.actionHandlers.set('SOUTHWEST', moveAction);
    this.actionHandlers.set('UP', moveAction);
    this.actionHandlers.set('DOWN', moveAction);
    this.actionHandlers.set('IN', moveAction);
    this.actionHandlers.set('OUT', moveAction);
    this.actionHandlers.set('EXIT', moveAction);  // Synonym for OUT
    this.actionHandlers.set('LEAVE', moveAction);  // Synonym for OUT
    this.actionHandlers.set('ENTER', moveAction);
    this.actionHandlers.set('N', moveAction);
    this.actionHandlers.set('S', moveAction);
    this.actionHandlers.set('E', moveAction);
    this.actionHandlers.set('W', moveAction);
    this.actionHandlers.set('NE', moveAction);
    this.actionHandlers.set('NW', moveAction);
    this.actionHandlers.set('SE', moveAction);
    this.actionHandlers.set('SW', moveAction);
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
    this.actionHandlers.set('VERSION', new VersionAction());
    this.actionHandlers.set('AGAIN', new AgainAction());
    this.actionHandlers.set('G', new AgainAction());
    
    // Save/restore verbs
    this.actionHandlers.set('SAVE', new SaveAction());
    this.actionHandlers.set('RESTORE', new RestoreAction());
    
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
    this.actionHandlers.set('RING', new RingAction());
    this.actionHandlers.set('LOWER', new LowerAction());
    this.actionHandlers.set('DRINK', new DrinkAction());
    this.actionHandlers.set('MOVE', new MoveObjectAction());
    this.actionHandlers.set('EXORCISE', new ExorciseAction());
    
    // Magic words
    this.actionHandlers.set('ULYSSES', new UlyssesAction());
    this.actionHandlers.set('XYZZY', new AdventAction());
    this.actionHandlers.set('PLUGH', new AdventAction());
    this.actionHandlers.set('PLOVER', new AdventAction());
    
    // Silly/humorous actions
    this.actionHandlers.set('JUMP', new JumpAction());
    this.actionHandlers.set('LEAP', new JumpAction());
    this.actionHandlers.set('PRAY', new PrayAction());
    this.actionHandlers.set('CURSE', new CurseAction());
    this.actionHandlers.set('SING', new SingAction());
    this.actionHandlers.set('LISTEN', new ListenAction());
    this.actionHandlers.set('SMELL', new SmellAction());
    this.actionHandlers.set('SNIFF', new SmellAction());
    this.actionHandlers.set('SAY', new SayAction());
    this.actionHandlers.set('ECHO', new EchoAction());
    this.actionHandlers.set('DANCE', new DanceAction());
    this.actionHandlers.set('SWIM', new SwimAction());
    this.actionHandlers.set('DIG', new DigAction());
    this.actionHandlers.set('SLEEP', new SleepAction());
    this.actionHandlers.set('WAKE', new WakeAction());
    this.actionHandlers.set('YELL', new YellAction());
    this.actionHandlers.set('SCREAM', new YellAction());
    this.actionHandlers.set('FIND', new FindAction());
    
    // Destructive actions
    this.actionHandlers.set('BREAK', new BreakAction());
    this.actionHandlers.set('SMASH', new BreakAction());
    this.actionHandlers.set('DESTROY', new BreakAction());
    
    // Consumption actions
    this.actionHandlers.set('EAT', new EatAction());
    this.actionHandlers.set('CONSUME', new EatAction());
    
    // Touch/feel actions
    this.actionHandlers.set('TOUCH', new TouchAction());
    this.actionHandlers.set('FEEL', new TouchAction());
    this.actionHandlers.set('RUB', new RubAction());
    this.actionHandlers.set('SHAKE', new ShakeAction());
    this.actionHandlers.set('KNOCK', new KnockAction());
    this.actionHandlers.set('RAP', new KnockAction());
    
    // Social actions
    this.actionHandlers.set('HELLO', new HelloAction());
    this.actionHandlers.set('HI', new HelloAction());
    this.actionHandlers.set('GOODBYE', new GoodbyeAction());
    this.actionHandlers.set('THANK', new ThankAction());
    this.actionHandlers.set('YES', new YesAction());
    this.actionHandlers.set('Y', new YesAction());
    this.actionHandlers.set('NO', new NoAction());
    this.actionHandlers.set('DIAGNOSE', new DiagnoseAction());
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
   * @param skipDaemons - If true, skip daemon processing (for multi-command sequences)
   * @returns ActionResult with success status and message
   */
  execute(command: ParsedCommand | ParseError, state: GameState, skipDaemons: boolean = false): ActionResult {
    let result: ActionResult;
    
    try {
      // Handle parse errors
      if ('type' in command && 'message' in command && !('verb' in command)) {
        result = {
          success: false,
          message: command.message,
          stateChanges: []
        };
        // Still need to run daemons even on parse error (unless skipped)
        return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
      }

      const parsedCommand = command as ParsedCommand;
      
      // Validate command has a verb
      if (!parsedCommand.verb) {
        result = {
          success: false,
          message: "I don't understand that command.",
          stateChanges: []
        };
        // Still need to run daemons even on invalid command (unless skipped)
        return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
      }

      const verb = parsedCommand.verb.toUpperCase();

      // Special handling for SAY and ECHO commands that can take any text
      if (verb === 'SAY' || verb === 'ECHO') {
        const handler = this.actionHandlers.get(verb);
        if (handler) {
          result = handler.execute(state, undefined, undefined, undefined, parsedCommand.rawInput);
          return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
        }
      }

      // Special handling for "all" commands (take all, drop all)
      if (parsedCommand.isAllObjects) {
        if (verb === 'TAKE' || verb === 'GET' || verb === 'PICK') {
          const takeAllHandler = new TakeAllAction();
          result = takeAllHandler.execute(state);
          return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
        }
        if (verb === 'DROP') {
          const dropAllHandler = new DropAllAction();
          result = dropAllHandler.execute(state);
          return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
        }
        // For other verbs with "all", return an error
        result = {
          success: false,
          message: `I don't know how to ${verb.toLowerCase()} all.`,
          stateChanges: []
        };
        return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
      }

      // Commands that don't consume a turn (don't run daemons/increment moves)
      // Note: VERBOSE, BRIEF, SUPERBRIEF do increment moves but don't trigger daemons
      // QUIT, RESTART, SAVE, RESTORE are special and handled separately
      const nonTurnCommands = ['SCORE', 'VERSION'];
      const isNonTurnCommand = nonTurnCommands.includes(verb);

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

      // Handle multi-word verbs (TURN ON, TURN OFF)
      let effectiveVerb = verb;
      if (verb === 'TURN' && parsedCommand.preposition) {
        const prep = parsedCommand.preposition.toUpperCase();
        if (prep === 'ON') {
          effectiveVerb = 'LIGHT';  // Map to LIGHT action
          // Move indirect object to direct object for "turn on lamp"
          if (parsedCommand.indirectObject && !parsedCommand.directObject) {
            parsedCommand.directObject = parsedCommand.indirectObject;
            parsedCommand.indirectObject = undefined;
            parsedCommand.preposition = undefined;
          }
        } else if (prep === 'OFF') {
          effectiveVerb = 'EXTINGUISH';  // Map to EXTINGUISH action
          // Move indirect object to direct object for "turn off lamp"
          if (parsedCommand.indirectObject && !parsedCommand.directObject) {
            parsedCommand.directObject = parsedCommand.indirectObject;
            parsedCommand.indirectObject = undefined;
            parsedCommand.preposition = undefined;
          }
        }
      }

      // Get the appropriate action handler
      const handler = this.actionHandlers.get(effectiveVerb);

      if (!handler) {
        result = {
          success: false,
          message: `I don't know how to ${verb.toLowerCase()}.`,
          stateChanges: []
        };
        // Still need to run daemons even when verb is not recognized (unless skipped)
        return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
      }

      // Execute the action with appropriate arguments
      try {
        result = this.executeHandler(handler, parsedCommand, state);
        
        // Apply state changes if action was successful
        if (result.success) {
          this.applyStateChanges(result.stateChanges, state);
        }

        // Run daemons and return result (unless skipped or non-turn command)
        return (skipDaemons || isNonTurnCommand) ? result : this.runDaemonsAndReturn(result, state);
      } catch (handlerError) {
        // Handle errors from action handlers gracefully
        console.error('Error in action handler:', handlerError);
        result = {
          success: false,
          message: 'Something went wrong with that action.',
          stateChanges: []
        };
        // Still need to run daemons even on handler error (unless skipped)
        return skipDaemons ? result : this.runDaemonsAndReturn(result, state);
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

    // Magic word commands (no arguments)
    if (verb === 'ULYSSES') {
      return handler.execute(state);
    }

    // Game control commands (no arguments)
    if (['SCORE', 'QUIT', 'Q', 'RESTART', 'SAVE', 'RESTORE', 'VERBOSE', 'BRIEF', 'SUPERBRIEF', 'DIAGNOSE', 'VERSION', 'AGAIN', 'G'].includes(verb)) {
      return handler.execute(state);
    }

    // SAY command needs raw input
    if (verb === 'SAY') {
      return handler.execute(state, command.directObject?.id, command.indirectObject?.id, command.preposition, parsedCommand.rawInput);
    }

    // Intransitive verbs (no object required)
    if (['XYZZY', 'PLUGH', 'PLOVER', 'JUMP', 'LEAP', 'PRAY', 'CURSE', 'SING', 'LISTEN', 'SMELL', 'SNIFF', 'WAIT', 'Z', 'CLIMB', 'ECHO', 'DANCE', 'SWIM', 'DIG', 'SLEEP', 'WAKE', 'YELL', 'SCREAM', 'HELLO', 'HI', 'GOODBYE', 'THANK', 'YES', 'Y', 'NO'].includes(verb)) {
      return handler.execute(state, command.directObject?.id);
    }

    // Special case for KNOCK - can work with indirect object only
    if (verb === 'KNOCK' && !command.directObject && command.indirectObject) {
      return handler.execute(state, undefined, command.indirectObject.id, command.preposition);
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

    // Single object commands (TAKE, DROP, OPEN, CLOSE, READ, RING)
    if (['TAKE', 'GET', 'PICK', 'DROP', 'OPEN', 'CLOSE', 'READ', 'RING'].includes(verb)) {
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
      'NORTH', 'SOUTH', 'EAST', 'WEST', 
      'NORTHEAST', 'NORTHWEST', 'SOUTHEAST', 'SOUTHWEST',
      'UP', 'DOWN', 'IN', 'OUT', 'ENTER', 'EXIT', 'LEAVE',
      'N', 'S', 'E', 'W', 
      'NE', 'NW', 'SE', 'SW',
      'U', 'D', 'GO'
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

  /**
   * Run daemons and append their output to the result message
   * This ensures daemons run even when commands fail
   */
  private runDaemonsAndReturn(result: ActionResult, state: GameState): ActionResult {
    // Capture console output from daemons
    const originalLog = console.log;
    let daemonOutput = '';
    console.log = (...args: any[]) => {
      daemonOutput += args.join(' ') + '\n';
    };

    try {
      // Process turn events (daemons, interrupts, etc.) after command execution
      // This runs sword glow, combat, lamp fuel, and other time-based events
      state.eventSystem.processTurn(state);
    } finally {
      console.log = originalLog;
    }

    // Append daemon output to result message
    if (daemonOutput) {
      result.message = result.message + '\n' + daemonOutput.trim();
    }

    return result;
  }
}
