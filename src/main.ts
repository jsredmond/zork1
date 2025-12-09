/**
 * Main entry point for Zork I rewrite
 */

import { Terminal } from './io/terminal.js';
import { Display } from './io/display.js';
import { Lexer } from './parser/lexer.js';
import { Vocabulary } from './parser/vocabulary.js';
import { Parser, ParseError } from './parser/parser.js';
import { CommandExecutor } from './engine/executor.js';
import { GameState } from './game/state.js';
import { GameObjectImpl } from './game/objects.js';
import { ObjectFlag } from './game/data/flags.js';
import { createInitialGameState, getRoomCount, getObjectCount } from './game/factories/gameFactory.js';
import { ALL_ROOMS } from './game/data/rooms-complete.js';

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
  const executor = new CommandExecutor();

  // Initialize game
  terminal.initialize();
  
  // Display title
  terminal.writeLine(display.formatTitle());

  // Initialize game world using factory
  const state = createInitialGameState();
  
  // Log initialization info
  console.log(`Initialized ${getRoomCount()} rooms and ${getObjectCount()} objects`);

  // Display initial room
  const startRoom = state.getCurrentRoom();
  if (startRoom) {
    terminal.writeLine(display.formatRoom(startRoom, state, true));
    
    // Show objects in room
    const roomObjects = state.getObjectsInCurrentRoom();
    if (roomObjects.length > 0) {
      terminal.writeLine(display.formatObjectList(roomObjects));
    }
  }

  terminal.writeLine('');

  // Track last command for 'again' functionality
  let lastCommand = '';

  // Game loop
  const processCommand = (input: string) => {
    if (!input || input.trim().length === 0) {
      terminal.showPrompt();
      return;
    }

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
      processSingleCommand(commands[i].trim(), isLastCommand);
    }
    
    terminal.writeLine('');
    
    // Update status bar after all commands
    terminal.showStatusBar(state.score, state.moves);
    
    terminal.showPrompt();
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
  function processSingleCommand(input: string, isLastCommand: boolean = true) {
    if (!input || input.trim().length === 0) {
      return;
    }

    // Handle 'again' command - repeat last command
    const normalizedInput = input.trim().toLowerCase();
    if (normalizedInput === 'again' || normalizedInput === 'g') {
      if (!lastCommand) {
        terminal.writeLine(display.formatMessage("There is no command to repeat."));
        return;
      }
      // Recursively process the last command
      processSingleCommand(lastCommand, isLastCommand);
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

    // Check for unknown words before parsing
    const unknownToken = processedTokens.find(token => token.type === 'UNKNOWN');
    if (unknownToken) {
      const command: ParseError = {
        type: 'UNKNOWN_WORD',
        message: `I don't know the word "${unknownToken.word}".`,
        word: unknownToken.word
      };
      // Skip daemons for all but the last command in a multi-command sequence
      const result = executor.execute(command, state, !isLastCommand);
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
    const result = executor.execute(command, state, skipDaemons);

    // Save this command as last command if it was successful and not 'again'
    if (result.success && normalizedInput !== 'again' && normalizedInput !== 'g') {
      lastCommand = input;
    }

    // Display result message if there is one
    if (result.message) {
      terminal.writeLine(display.formatMessage(result.message));
    }

    // If room changed (movement occurred), show new room
    if (result.success && state.currentRoom !== roomBeforeCommand) {
      const currentRoom = state.getCurrentRoom();
      if (currentRoom) {
        terminal.writeLine('');
        terminal.writeLine(display.formatRoom(currentRoom, state, true));
        
        // Show objects in room
        const roomObjects = state.getObjectsInCurrentRoom();
        if (roomObjects.length > 0) {
          terminal.writeLine(display.formatObjectList(roomObjects));
        }
      }
    }
    
    // If LOOK command, show room (even if room didn't change)
    if (result.success && 'verb' in command) {
      const verb = command.verb?.toUpperCase();
      if (verb === 'LOOK' || verb === 'L') {
        const currentRoom = state.getCurrentRoom();
        if (currentRoom) {
          terminal.writeLine('');
          terminal.writeLine(display.formatRoom(currentRoom, state, true));
          
          // Show objects in room
          const roomObjects = state.getObjectsInCurrentRoom();
          if (roomObjects.length > 0) {
            terminal.writeLine(display.formatObjectList(roomObjects));
          }
        }
      }
    }
  }

  // Start the game loop
  const readInput = () => {
    if (!terminal.isActive()) {
      return;
    }

    terminal.readLine((input) => {
      processCommand(input);
      
      // Continue reading input
      if (terminal.isActive()) {
        readInput();
      }
    });
  };

  terminal.showPrompt();
  readInput();
}

// Start the game
gameLoop().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
