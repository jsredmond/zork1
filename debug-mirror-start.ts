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

console.log('Starting room:', state.getCurrentRoom()?.id);
console.log('Starting room name:', state.getCurrentRoom()?.name);

// Try north
const tokens = lexer.tokenize('n');
const processedTokens = tokens.map(token => ({
  ...token,
  word: vocabulary.expandAbbreviation(token.word),
  type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
}));
const availableObjects = [
  ...state.getObjectsInCurrentRoom(),
  ...state.getInventoryObjects(),
];
const command = parser.parse(processedTokens, availableObjects);
console.log('Parsed command:', command);
const result = executor.execute(command, state);
console.log('Result:', result.message);
console.log('New room:', state.getCurrentRoom()?.id);
