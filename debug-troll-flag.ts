import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';

const state = createInitialGameState();
const executor = new CommandExecutor();

// Set TROLL-FLAG
state.setFlag('TROLL-FLAG', true);
console.log('TROLL-FLAG set to:', state.getFlag('TROLL-FLAG'));

// Navigate to troll room
state.setCurrentRoom('TROLL-ROOM');
console.log('Current room:', state.getCurrentRoom()?.id);

// Try to go east
const result = executor.execute({ verb: 'EAST' }, state);
console.log('East result:', result.message);
console.log('New room:', state.getCurrentRoom()?.id);
