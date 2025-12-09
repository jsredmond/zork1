import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';
import { Parser } from './src/parser/parser.js';

const state = createInitialGameState();
const executor = new CommandExecutor();
const parser = new Parser();

// Set deterministic RNG
state.setGlobalVariable('RNG_SEED', 12345);

// Setup: teleport to living room, give treasures
const setupCommands = [
  'teleport LIVING-ROOM',
  'give EMERALD',
  'give PAINTING',
  'open case',
  'put emerald in case',
  'put painting in case',
  'score'
];

console.log('=== Setup ===');
for (const cmd of setupCommands) {
  const parsed = parser.parse(cmd, state);
  const result = executor.execute(parsed, state);
  console.log(`> ${cmd}`);
  console.log(result.message);
  console.log();
}

// Now test removing a treasure
console.log('=== Test Removing Treasure ===');
const testCommands = [
  'take emerald from case',
  'score'
];

for (const cmd of testCommands) {
  const parsed = parser.parse(cmd, state);
  const result = executor.execute(parsed, state);
  console.log(`> ${cmd}`);
  console.log(result.message);
  console.log();
}
