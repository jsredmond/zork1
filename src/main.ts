/**
 * Main entry point for Zork I rewrite
 */

import { Terminal } from './io/terminal.js';
import { Display } from './io/display.js';
import { Lexer } from './parser/lexer.js';
import { Vocabulary } from './parser/vocabulary.js';
import { Parser } from './parser/parser.js';
import { CommandExecutor } from './engine/executor.js';
import { GameState } from './game/state.js';
import { GameObjectImpl } from './game/objects.js';
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

    // Tokenize input
    const tokens = lexer.tokenize(input);

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

    // Parse command
    const availableObjects = getAvailableObjects(state);
    const command = parser.parse(processedTokens, availableObjects);

    // Track current room before executing command
    const roomBeforeCommand = state.currentRoom;
    
    // Execute command
    const result = executor.execute(command, state);

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

    terminal.writeLine('');
    terminal.showPrompt();
  };

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
