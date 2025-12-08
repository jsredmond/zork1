#!/usr/bin/env tsx

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';
import { Vocabulary } from '../src/parser/vocabulary.js';
import { GameObjectImpl } from '../src/game/objects.js';
import { ALL_ROOMS } from '../src/game/data/rooms-complete.js';
import { enableDeterministicRandom } from '../src/testing/seededRandom.js';

enableDeterministicRandom(12345);

const state = createInitialGameState();
const lexer = new Lexer();
const vocabulary = new Vocabulary();
const parser = new Parser();
const executor = new CommandExecutor();

function getAvailableObjects(state: any): GameObjectImpl[] {
  const available: GameObjectImpl[] = [];
  const addedIds = new Set<string>();

  for (const objId of state.inventory) {
    if (!addedIds.has(objId)) {
      const obj = state.getObject(objId);
      if (obj) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
      }
    }
  }

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

const commands = [
  'north', 'east', 'open window', 'enter', 'west',
  'take lamp', 'take sword', 'turn on lamp', 'move rug', 'open trap door', 'down',
  'north',
  'kill troll with sword', 'kill troll with sword', 'kill troll with sword', 'kill troll with sword',
  'east', 'east',
  'north', 'north', 'take wrench', 'push yellow button',
  'south', 'south', 'turn bolt with wrench', 'look'
];

for (const cmd of commands) {
  console.log(`> ${cmd}`);
  const output = executeCommand(cmd);
  console.log(output);
  console.log();
}


console.log('\n=== Exploring from Round Room ===');
const directions = ['north', 'south', 'east', 'west', 'up', 'down', 'go northeast', 'go northwest', 'go southeast', 'go southwest'];
for (const dir of directions) {
  console.log(`\nTrying: ${dir}`);
  const output = executeCommand(dir);
  console.log(output.substring(0, 200));
}
