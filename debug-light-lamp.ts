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
let result = executor.execute({ verb: 'MOVE', directObject: state.getObject('RUG') }, state);
result = executor.execute({ verb: 'OPEN', directObject: state.getObject('TRAP-DOOR') }, state);

console.log('=== Trying "light lamp" ===');
const tokens = lexer.tokenize('light lamp');
const processedTokens = tokens.map(token => ({
  ...token,
  word: vocabulary.expandAbbreviation(token.word),
  type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
}));
console.log('Processed tokens:', processedTokens);
const availableObjects = [
  ...state.getObjectsInCurrentRoom(),
  ...state.getInventoryObjects(),
];
const command = parser.parse(processedTokens, availableObjects);
console.log('Parsed command:', command);
result = executor.execute(command, state);
console.log('Light result:', result.message);

console.log('\n=== Going down ===');
result = executor.execute({ verb: 'DOWN' }, state);
console.log('Down result:', result.message);
console.log('Current room:', state.getCurrentRoom()?.id);
