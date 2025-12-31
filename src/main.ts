/**
 * Main entry point for Zork I rewrite
 */

import { Terminal } from './io/terminal.js';
import { Display } from './io/display.js';
import { Lexer } from './parser/lexer.js';
import { Vocabulary } from './parser/vocabulary.js';
import { Parser, ParseError } from './parser/parser.js';
import { CommandExecutor } from './engine/executor.js';
import { EnhancedCommandExecutor } from './engine/enhancedExecutor.js';
import { GameState } from './game/state.js';
import { GameObjectImpl } from './game/objects.js';
import { ObjectFlag } from './game/data/flags.js';
import { createInitialGameState, getRoomCount, getObjectCount } from './game/factories/gameFactory.js';
import { ALL_ROOMS } from './game/data/rooms-complete.js';
import { SaveAction, RestoreAction } from './game/actions.js';

/**
 * Get available objects for parsing (in current room and inventory)
 */
function getAvailableObjects(state: GameState): GameObjectImpl[] {
  const available: GameObjectImpl[] = [];
  const addedIds = new Set<string>();

  // Add inventory objects
  for (const objId of state.inventory) {
    if (!addedIds.has(objId)) {
      const obj = state.getObject(objId);
      if (obj) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
        
        // If this is an open container in inventory, add its contents too
        if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.OPENBIT)) {
          const contents = state.getObjectsInContainer(objId);
          for (const contentObj of contents) {
            if (!addedIds.has(contentObj.id)) {
              available.push(contentObj as GameObjectImpl);
              addedIds.add(contentObj.id);
            }
          }
        }
      }
    }
  }

  // Add objects in current room
  const room = state.getCurrentRoom();
  if (room) {
    for (const objId of room.objects) {
      if (!addedIds.has(objId)) {
        const obj = state.getObject(objId);
        if (obj) {
          available.push(obj as GameObjectImpl);
          addedIds.add(objId);
          
          // If this is an open container, add its contents too
          if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.OPENBIT)) {
            const contents = state.getObjectsInContainer(objId);
            for (const contentObj of contents) {
              if (!addedIds.has(contentObj.id)) {
                available.push(contentObj as GameObjectImpl);
                addedIds.add(contentObj.id);
              }
            }
          }
        }
      }
    }
    
    // Add global objects for this room (like TREE, FOREST, etc.)
    const roomData = ALL_ROOMS[room.id];
    if (roomData && roomData.globalObjects) {
      for (const objId of roomData.globalObjects) {
        if (!addedIds.has(objId)) {
          const obj = state.getObject(objId);
          if (obj) {
            available.push(obj as GameObjectImpl);
            addedIds.add(objId);
          }
        }
      }
    }
  }

  // Collect all synonyms from room-specific objects to avoid adding generic duplicates
  const roomSpecificSynonyms = new Set<string>();
  for (const obj of available) {
    for (const synonym of obj.synonyms) {
      roomSpecificSynonyms.add(synonym.toUpperCase());
    }
  }

  // Add all global scenery objects (GLOBAL-OBJECTS with NDESCBIT flag)
  // Skip generic objects if a room-specific object with the same synonym exists
  for (const [objId, obj] of state.objects.entries()) {
    if (!addedIds.has(objId) && obj.location === null && obj.hasFlag(ObjectFlag.NDESCBIT)) {
      // Check if any of this object's synonyms overlap with room-specific objects
      const hasOverlappingSynonym = obj.synonyms.some(syn => 
        roomSpecificSynonyms.has(syn.toUpperCase())
      );
      
      // Only add if no overlapping synonyms (to avoid ambiguity)
      if (!hasOverlappingSynonym) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
      }
    }
  }

  return available;
}

/**
 * Main game loop
 */
async function gameLoop(): Promise<void> {
  const terminal = new Terminal();
  const display = new Display();
  const lexer = new Lexer();
  const vocabulary = new Vocabulary();
  const parser = new Parser();
  const executor = new EnhancedCommandExecutor();

  // Configure parity enhancements for full integration
  executor.updateParityConfig({
    enableStatusDisplay: true,
    enableParserEnhancements: true,
    enableObjectInteractionFixes: true,
    enableMessageStandardization: true,
    enableStateValidation: true,
    strictValidation: false
  });

  // Initialize game state outside try block so it's accessible throughout
  let state: GameState;
  
  // Track last command for 'again' functionality
  let lastCommand = '';

  // Initialize game
  try {
    terminal.initialize();
    
    // Initialize game world using factory
    state = createInitialGameState();

    // Validate parity system components
    if (!executor.validateComponents()) {
      console.error('Parity enhancement system validation failed');
      throw new Error('Failed to initialize parity enhancement system');
    }

    // Get starting room for initial status bar
    const startRoom = state.getCurrentRoom();
    
    // Initialize screen with scroll region and status bar
    // This sets up the fixed status bar at the top before any content is displayed
    terminal.initializeScreen(startRoom?.name || '', state.score, state.moves);
    
    // Display title
    terminal.writeLine(display.formatTitle());

    // Display initial room using the proper LOOK logic
    if (startRoom) {
      const { formatRoomDescription } = await import('./game/actions.js');
      const roomDescription = formatRoomDescription(startRoom, state);
      terminal.writeLine(roomDescription);
    }

    terminal.writeLine('');
    
  } catch (error) {
    console.error('Fatal error during game initialization:', error);
    console.error('Initialization error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      parityStatus: executor.getParityStatus()
    });
    
    // Try to provide a user-friendly error message
    if (terminal) {
      terminal.writeLine('Failed to initialize the game. Please check the console for details.');
    }
    
    process.exit(1);
  }

  // Game loop
  const processCommand = async (input: string) => {
    if (!input || input.trim().length === 0) {
      terminal.showPrompt();
      return;
    }

    try {
      // Handle QUIT command
      if (input.trim().toLowerCase() === 'quit' || input.trim().toLowerCase() === 'q') {
        terminal.writeLine('Thanks for playing!');
        terminal.close();
        process.exit(0);
        return;
      }

      // Split input into multiple commands (separated by periods or 'then')
      const commands = splitMultipleCommands(input);
      
      // Process each command sequentially
      for (let i = 0; i < commands.length; i++) {
        const isLastCommand = i === commands.length - 1;
        await processSingleCommand(commands[i].trim(), isLastCommand);
      }
      
      terminal.writeLine('');
      
      // Update status bar after all commands with current room name
      const currentRoom = state.getCurrentRoom();
      terminal.updateStatusBar(currentRoom?.name || '', state.score, state.moves);
      
      terminal.showPrompt();
      
    } catch (error) {
      // Comprehensive error handling for the main command processing loop
      console.error('Fatal error in command processing:', error);
      
      // Provide user-friendly error message
      terminal.writeLine('A serious error occurred. The game is attempting to recover...');
      
      // Log detailed error information
      console.error('Main command processing error details:', {
        input,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        parityStatus: executor.getParityStatus(),
        gameState: {
          currentRoom: state.currentRoom,
          moves: state.moves,
          score: state.score,
          isValid: !!state.getCurrentRoom()
        }
      });
      
      // Attempt to recover by showing the prompt again
      terminal.writeLine('');
      terminal.showPrompt();
    }
  };

  /**
   * Split input into multiple commands based on periods and 'then'
   */
  function splitMultipleCommands(input: string): string[] {
    // First, split on periods (but not periods within quotes)
    const commands: string[] = [];
    let currentCommand = '';
    let inQuotes = false;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        currentCommand += char;
      } else if (char === '.' && !inQuotes) {
        // Period found outside quotes - split here
        if (currentCommand.trim().length > 0) {
          commands.push(currentCommand.trim());
        }
        currentCommand = '';
      } else {
        currentCommand += char;
      }
    }
    
    // Add the last command if any
    if (currentCommand.trim().length > 0) {
      commands.push(currentCommand.trim());
    }
    
    // Now split each command on 'then' (case-insensitive)
    const finalCommands: string[] = [];
    for (const cmd of commands) {
      // Split on 'then' as a separate word
      const thenSplit = cmd.split(/\s+then\s+/i);
      for (const part of thenSplit) {
        if (part.trim().length > 0) {
          finalCommands.push(part.trim());
        }
      }
    }
    
    return finalCommands.length > 0 ? finalCommands : [input];
  }

  /**
   * Process a single command
   * @param input - The command to process
   * @param isLastCommand - Whether this is the last command in a multi-command sequence
   */
  async function processSingleCommand(input: string, isLastCommand: boolean = true) {
    if (!input || input.trim().length === 0) {
      return;
    }

    try {
      // Handle 'again' command - repeat last command
      const normalizedInput = input.trim().toLowerCase();
      if (normalizedInput === 'again' || normalizedInput === 'g') {
        if (!lastCommand) {
          terminal.writeLine(display.formatMessage("There is no command to repeat."));
          return;
        }
        // Recursively process the last command
        await processSingleCommand(lastCommand, isLastCommand);
        return;
      }

      // Handle pending actions (SAVE/RESTORE waiting for filename)
      if (state.pendingAction) {
        const pendingType = state.pendingAction.type;
        const handler = pendingType === 'SAVE' ? new SaveAction() : new RestoreAction();
        
        // Treat the entire input as the filename
        const result = handler.execute(state, input.trim());
        
        if (result.message) {
          terminal.writeLine(display.formatMessage(result.message));
        }
        return;
      }

      // Handle "look at X" as "examine X"
      let processedInput = input;
      if (/^look\s+at\s+/i.test(input)) {
        processedInput = input.replace(/^look\s+at\s+/i, 'examine ');
      }

      // Tokenize input
      const tokens = lexer.tokenize(processedInput);

      // Expand abbreviations and assign token types
      const processedTokens = tokens.map(token => {
        const expanded = vocabulary.expandAbbreviation(token.word);
        const type = vocabulary.lookupWord(expanded);
        return {
          ...token,
          word: expanded,
          type,
        };
      });

      // Special handling for SAY and ECHO commands that can take any text
      const firstToken = processedTokens[0];
      if (firstToken && (firstToken.word.toUpperCase() === 'SAY' || firstToken.word.toUpperCase() === 'ECHO')) {
        // Create a special command for SAY/ECHO with raw input
        const specialCommand = {
          verb: firstToken.word.toUpperCase(),
          rawInput: processedInput
        };
        
        // Skip daemons for all but the last command in a multi-command sequence
        const result = await executor.executeWithParity(specialCommand, state, !isLastCommand);
        
        // Save this command as last command if it was successful
        if (result.success && normalizedInput !== 'again' && normalizedInput !== 'g') {
          lastCommand = input;
        }
        
        if (result.message) {
          terminal.writeLine(display.formatMessage(result.message));
        }
        return;
      }

      // Special handling for "wake up" command
      if (processedInput.toLowerCase().trim() === 'wake up') {
        const specialCommand = {
          verb: 'WAKE'
        };
        
        // Skip daemons for all but the last command in a multi-command sequence
        const result = await executor.executeWithParity(specialCommand, state, !isLastCommand);
        
        // Save this command as last command if it was successful
        if (result.success && normalizedInput !== 'again' && normalizedInput !== 'g') {
          lastCommand = input;
        }
        
        if (result.message) {
          terminal.writeLine(display.formatMessage(result.message));
        }
        return;
      }

      // Check for unknown words before parsing
      const unknownToken = processedTokens.find(token => token.type === 'UNKNOWN');
      if (unknownToken) {
        const command: ParseError = {
          type: 'UNKNOWN_WORD',
          message: `I don't know the word "${unknownToken.word}".`,
          word: unknownToken.word
        };
        // Skip daemons for all but the last command in a multi-command sequence
        const result = await executor.executeWithParity(command, state, !isLastCommand);
        
        if (result.message) {
          terminal.writeLine(display.formatMessage(result.message));
        }
        return;
      }

      // Parse command
      const availableObjects = getAvailableObjects(state);
      const command = parser.parse(processedTokens, availableObjects);

      // Track current room before executing command
      const roomBeforeCommand = state.currentRoom;
      
      // Execute command - skip daemons for all but the last command in a multi-command sequence
      const skipDaemons = !isLastCommand;
      const result = await executor.executeWithParity(command, state, skipDaemons);

      // Save this command as last command if it was successful and not 'again'
      if (result.success && normalizedInput !== 'again' && normalizedInput !== 'g') {
        lastCommand = input;
      }

      // Display result message if there is one
      if (result.message) {
        terminal.writeLine(display.formatMessage(result.message));
      }

      // If room changed (movement occurred), show new room
      // The movement action returns the room description, so we don't need to display it again here
      // Room display is handled by the movement action's result.message
      
    } catch (error) {
      // Comprehensive error handling for command processing
      console.error('Error processing command:', input, error);
      
      // Provide user-friendly error message
      terminal.writeLine(display.formatMessage('Something went wrong processing that command. The game is still running.'));
      
      // Log detailed error information for debugging
      console.error('Command processing error details:', {
        input,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        gameState: {
          currentRoom: state.currentRoom,
          moves: state.moves,
          score: state.score
        }
      });
    }
  }

  // Start the game loop
  const readInput = () => {
    if (!terminal.isActive()) {
      return;
    }

    try {
      terminal.readLine(async (input) => {
        try {
          await processCommand(input);
          
          // Continue reading input
          if (terminal.isActive()) {
            readInput();
          }
        } catch (error) {
          console.error('Error in input processing callback:', error);
          
          // Log detailed error information
          console.error('Input callback error details:', {
            input,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            terminalActive: terminal.isActive()
          });
          
          // Try to recover by continuing to read input
          if (terminal.isActive()) {
            terminal.writeLine('An error occurred processing your input. Please try again.');
            terminal.showPrompt();
            readInput();
          }
        }
      });
    } catch (error) {
      console.error('Error setting up input reading:', error);
      
      // Log detailed error information
      console.error('Input setup error details:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        terminalActive: terminal.isActive()
      });
      
      // Fatal error - cannot continue
      terminal.writeLine('Fatal error: Unable to read input. The game must exit.');
      process.exit(1);
    }
  };

  try {
    terminal.showPrompt();
    readInput();
  } catch (error) {
    console.error('Error starting game loop:', error);
    
    // Log detailed error information
    console.error('Game loop startup error details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    process.exit(1);
  }
}

// Start the game
gameLoop().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
