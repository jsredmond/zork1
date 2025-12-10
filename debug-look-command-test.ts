#!/usr/bin/env npx tsx

/**
 * Debug script to test what the look command actually produces in the verification script
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeCandleTimer } from './src/engine/daemons.js';
import { GameObjectImpl } from './src/game/objects.js';
import { ObjectFlag } from './src/game/data/flags.js';
import { Lexer } from './src/parser/lexer.js';
import { Vocabulary } from './src/parser/vocabulary.js';
import { Parser } from './src/parser/parser.js';
import { CommandExecutor } from './src/engine/executor.js';

async function testLookCommand() {
  console.log('=== LOOK COMMAND TEST ===\n');
  
  const state = createInitialGameState();
  const lexer = new Lexer();
  const vocabulary = new Vocabulary();
  const parser = new Parser();
  const executor = new CommandExecutor();
  
  // Setup: teleport to living room, get candles, light them
  console.log('=== Setup ===');
  state.currentRoom = 'LIVING-ROOM';
  state.moveObject('CANDLES', 'PLAYER');
  const candles = state.getObject('CANDLES') as GameObjectImpl;
  if (candles) {
    candles.addFlag(ObjectFlag.ONBIT);
    initializeCandleTimer(state);
    console.log('Candles lit and in inventory');
  }
  
  // Simulate the candle burning out
  console.log('\n=== Simulate candle burnout ===');
  if (candles) {
    candles.removeFlag(ObjectFlag.ONBIT);
    candles.addFlag('RMUNGBIT' as any);
    console.log('Candles burned out');
  }
  
  // Test look command through the normal game system
  console.log('\n=== Test look command ===');
  const command = 'look';
  
  // Process like the verification script does
  let processedCommand = command;
  if (/^look\s+at\s+/i.test(command)) {
    processedCommand = command.replace(/^look\s+at\s+/i, 'examine ');
  }
  
  // Tokenize
  const tokens = lexer.tokenize(processedCommand);
  
  // Process with vocabulary
  const processedTokens = tokens.map(token => {
    const expandedWord = vocabulary.expandAbbreviation(token.word);
    return {
      ...token,
      word: expandedWord,
      type: vocabulary.lookupWord(expandedWord),
    };
  });
  
  // Get available objects
  const availableObjects = getAvailableObjects(state);
  
  // Parse
  const parsedCommand = parser.parse(processedTokens, availableObjects);
  
  // Execute
  const result = executor.execute(parsedCommand, state);
  
  console.log('Look command result:');
  console.log(result.message || '');
}

function getAvailableObjects(state: any): any[] {
  const objects: any[] = [];
  
  // Add objects in current room
  const currentRoom = state.getRoom(state.currentRoom);
  if (currentRoom?.objects) {
    for (const objId of currentRoom.objects) {
      const obj = state.getObject(objId);
      if (obj) {
        objects.push(obj);
      }
    }
  }
  
  // Add objects in inventory
  const player = state.getObject('PLAYER');
  if (player?.objects) {
    for (const objId of player.objects) {
      const obj = state.getObject(objId);
      if (obj) {
        objects.push(obj);
      }
    }
  }
  
  return objects;
}

testLookCommand().catch(console.error);