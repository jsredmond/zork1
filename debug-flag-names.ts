import { createInitialGameState } from './src/game/factories/gameFactory.js';

const state = createInitialGameState();

// Test different flag names
state.setFlag('TROLL-FLAG', true);
state.setFlag('TROLL_FLAG', true);

console.log('TROLL-FLAG:', state.getFlag('TROLL-FLAG'));
console.log('TROLL_FLAG:', state.getFlag('TROLL_FLAG'));

// Check the condition function directly
const roomData = state.getRoom('TROLL-ROOM');
console.log('Troll room exits:', roomData?.exits);
