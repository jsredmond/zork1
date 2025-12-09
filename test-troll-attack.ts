import { createInitialGameState } from './src/game/factories/gameFactory.js';

const state = createInitialGameState();

// Setup: give lamp, turn it on, go to troll room
state.addToInventory('LAMP');
state.executeCommand('turn on lamp');
state.setCurrentRoom('CELLAR');
state.executeCommand('n'); // Go to troll room

console.log('\n=== In Troll Room ===');
console.log('Current room:', state.currentRoom);

const troll = state.getObject('TROLL');
console.log('Troll location:', troll?.location);
console.log('Troll has FIGHTBIT:', troll?.hasFlag('FIGHTBIT'));

// Try an invalid command
console.log('\n=== Trying invalid command ===');
const result = state.executeCommand('give lunch to cyclops');
console.log('Result:', result);

