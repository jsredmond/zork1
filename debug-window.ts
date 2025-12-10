import { createInitialGameState } from './src/game/factories/gameFactory.js';

const state = createInitialGameState();

// Go to EAST-OF-HOUSE
state.setCurrentRoom('EAST-OF-HOUSE');

console.log('Current room:', state.getCurrentRoom()?.id);
console.log('Room objects:', state.getCurrentRoom()?.objects);
console.log('Room global objects:', state.getCurrentRoom()?.globalObjects);

// Check all objects in room
const roomObjects = state.getObjectsInCurrentRoom();
console.log('Available room objects:');
for (const obj of roomObjects) {
  console.log(`  - ${obj.id}: ${obj.name} (synonyms: ${obj.synonyms})`);
}

// Check if KITCHEN-WINDOW exists
const window = state.getObject('KITCHEN-WINDOW');
console.log('\nKITCHEN-WINDOW object:');
console.log('  Location:', window?.location);
console.log('  Name:', window?.name);
console.log('  Synonyms:', window?.synonyms);
console.log('  Flags:', Array.from(window?.flags || []));
