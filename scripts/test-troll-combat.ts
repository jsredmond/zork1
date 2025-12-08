#!/usr/bin/env tsx
/**
 * Test script for debugging troll combat
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { executeCommand } from '../src/game/actions.js';
import { setSeed } from '../src/testing/seededRandom.js';

// Set deterministic seed
setSeed(12345);

const state = createInitialGameState();

// Execute commands to get to troll room
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
  'north'  // Enter troll room
];

console.log('=== Testing Troll Combat ===\n');

for (const cmd of commands) {
  console.log(`> ${cmd}`);
  const result = executeCommand(state, cmd);
  console.log(result.output);
  console.log('');
}

// Check sword glow
const sword = state.getObject('SWORD');
console.log('Sword glow level:', sword?.getProperty('glowLevel'));

// Check troll
const troll = state.getObject('TROLL');
console.log('Troll location:', troll?.location);
console.log('Troll strength:', troll?.getProperty('strength'));
console.log('Troll flags:', Array.from(troll?.flags || []));

// Now test combat
console.log('\n=== Combat Test ===\n');

for (let i = 1; i <= 3; i++) {
  console.log(`> kill troll with sword (attack ${i})`);
  const result = executeCommand(state, 'kill troll with sword');
  console.log(result.output);
  console.log('');
  
  // Check troll state
  const trollAfter = state.getObject('TROLL');
  console.log(`After attack ${i}:`);
  console.log('  Troll location:', trollAfter?.location);
  console.log('  Troll strength:', trollAfter?.getProperty('strength'));
  console.log('  Troll flags:', Array.from(trollAfter?.flags || []));
  console.log('');
}

// Final look
console.log('> look');
const result = executeCommand(state, 'look');
console.log(result.output);
