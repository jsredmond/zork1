#!/usr/bin/env tsx
/**
 * Test script to verify troll death sequence
 */

import { GameState } from '../src/game/state.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';

const state = createInitialGameState();
const executor = new CommandExecutor();
const parser = new Parser();
const lexer = new Lexer();

// Execute the sequence from the transcript
const commands = [
  'open trap door',
  'turn on lamp',
  'down',
  'west',
  'take sword',
  'east',
  'down',
  'south',
  'east',
  'take matchbook',
  'west',
  'down',
  'east',
  'kill troll with sword',
  'kill troll with sword',
  'kill troll with sword',
  'look'
];

console.log('Executing troll combat sequence...\n');

for (let i = 0; i < commands.length; i++) {
  const cmd = commands[i];
  const tokens = lexer.tokenize(cmd);
  const parsed = parser.parse(tokens, state);
  
  if ('error' in parsed) {
    console.log(`Error: ${parsed.error}`);
    continue;
  }
  
  const result = executor.execute(parsed, state);
  
  if (i >= commands.length - 4) {
    console.log(`\n[${i + 1}] > ${cmd}`);
    console.log(result.message);
  }
}

// Check troll state
const troll = state.getObject('TROLL');
console.log('\n=== TROLL STATE ===');
console.log('Location:', troll?.location);
console.log('Flags:', Array.from(troll?.flags || []));
console.log('Long Description:', troll?.getProperty('longDescription'));

// Check if troll is in room
const room = state.getRoom(state.currentRoom);
const objectsInRoom = state.getObjectsInRoom(state.currentRoom);
console.log('\n=== OBJECTS IN ROOM ===');
objectsInRoom.forEach(obj => {
  console.log(`- ${obj.id}: ${obj.name}`);
});
