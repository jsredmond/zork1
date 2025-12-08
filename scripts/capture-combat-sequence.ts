#!/usr/bin/env tsx

/**
 * Capture Combat Sequence
 * 
 * Runs combat with deterministic random to capture the exact sequence
 * of messages for transcript creation.
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';
import { Vocabulary } from '../src/parser/vocabulary.js';
import { GameObjectImpl } from '../src/game/objects.js';
import { ObjectFlag } from '../src/game/data/flags.js';
import { ALL_ROOMS } from '../src/game/data/rooms-complete.js';
import { enableDeterministicRandom } from '../src/testing/seededRandom.js';

// Enable deterministic random
enableDeterministicRandom(12345);

const state = createInitialGameState();
const lexer = new Lexer();
const vocabulary = new Vocabulary();
const parser = new Parser();
const executor = new CommandExecutor();

function getAvailableObjects(state: any): GameObjectImpl[] {
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

function executeCommand(command: string): string {
  try {
    const tokens = lexer.tokenize(command);
    const processedTokens = tokens.map(token => ({
      ...token,
      word: vocabulary.expandAbbreviation(token.word),
      type: vocabulary.lookupWord(token.word),
    }));

    const availableObjects = getAvailableObjects(state);
    const parsedCommand = parser.parse(processedTokens, availableObjects);
    const result = executor.execute(parsedCommand, state);

    return result.message || '';
  } catch (error) {
    return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Setup sequence
const commands = [
  'north',
  'east',
  'open window',
  'enter',
  'west',
  'take lamp',
  'take sword',
  'turn on lamp',
  'move rug',
  'open trap door',
  'down',
  'north'
];

console.log('=== Setting up game state ===\n');

for (const cmd of commands) {
  console.log(`> ${cmd}`);
  const output = executeCommand(cmd);
  console.log(output);
  console.log();
}

console.log('=== Combat sequence (deterministic) ===\n');

// Now do combat
let combatRound = 1;
let trollDefeated = false;

while (!trollDefeated && combatRound <= 10) {
  console.log(`--- Combat Round ${combatRound} ---`);
  console.log(`> kill troll with sword`);
  const output = executeCommand('kill troll with sword');
  console.log(output);
  console.log();
  
  // Check if troll is defeated
  if (output.includes('dies') || output.includes('dead')) {
    trollDefeated = true;
    console.log('✓ Troll defeated!');
  }
  
  combatRound++;
}

if (!trollDefeated) {
  console.log('⚠ Troll not defeated after 10 rounds');
}

// Try to move east
console.log('\n=== Testing movement ===');
console.log('> east');
const moveOutput = executeCommand('east');
console.log(moveOutput);
