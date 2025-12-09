/**
 * Test window entry
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';

const state = createInitialGameState();
const executor = new CommandExecutor();

console.log('=== Testing Window Entry ===\n');

console.log('1. south');
let result = executor.execute(state, 'south');
console.log('Room:', state.currentRoom);

console.log('\n2. east');
result = executor.execute(state, 'east');
console.log('Room:', state.currentRoom);

console.log('\n3. open window');
result = executor.execute(state, 'open window');
console.log('Result:', result.message);

// Check window state
const window = state.getObject('KITCHEN-WINDOW');
console.log('Window has OPENBIT:', window?.hasFlag('OPENBIT' as any));
console.log('Window isOpen():', window?.isOpen());

console.log('\n4. in');
result = executor.execute(state, 'in');
console.log('Result:', result.message);
console.log('Room:', state.currentRoom);

console.log('\n5. west');
result = executor.execute(state, 'west');
console.log('Result:', result.message);
console.log('Room:', state.currentRoom);
