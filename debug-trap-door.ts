import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';
import { Parser } from './src/parser/parser.js';
import { Lexer } from './src/parser/lexer.js';
import { Vocabulary } from './src/parser/vocabulary.js';

const state = createInitialGameState();
const lexer = new Lexer();
const vocabulary = new Vocabulary();
const parser = new Parser();
const executor = new CommandExecutor();

// Navigate to living room and set up trap door
state.setCurrentRoom('LIVING-ROOM');
state.addToInventory('LAMP');

// Move rug and open trap door
console.log('=== Moving rug ===');
let result = executor.execute({ verb: 'MOVE', directObject: state.getObject('RUG') }, state);
console.log(result.message);

console.log('\n=== Opening trap door ===');
result = executor.execute({ verb: 'OPEN', directObject: state.getObject('TRAP-DOOR') }, state);
console.log(result.message);

console.log('\n=== Turning on lamp ===');
result = executor.execute({ verb: 'TURN-ON', directObject: state.getObject('LAMP') }, state);
console.log(result.message);

console.log('\n=== Going down ===');
result = executor.execute({ verb: 'DOWN' }, state);
console.log('Result message:', result.message);
console.log('Current room:', state.getCurrentRoom()?.id);
