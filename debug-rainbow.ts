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

// Setup
state.setCurrentRoom('END-OF-RAINBOW');
state.addToInventory('SCEPTRE');

console.log('=== BEFORE WAVE ===');
const pot = state.getObject('POT-OF-GOLD');
console.log('Pot location:', pot?.location);
console.log('Pot flags:', Array.from(pot?.flags || []));
console.log('Room objects:', state.getCurrentRoom()?.objects);

// Wave sceptre
const tokens1 = lexer.tokenize('wave sceptre');
const processedTokens1 = tokens1.map(token => ({
  ...token,
  word: vocabulary.expandAbbreviation(token.word),
  type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
}));
const availableObjects1 = [
  ...state.getObjectsInCurrentRoom(),
  ...state.getInventoryObjects(),
];
const command1 = parser.parse(processedTokens1, availableObjects1);
const result1 = executor.execute(command1, state);
console.log('Wave result:', result1.message);

console.log('\n=== AFTER WAVE ===');
console.log('Pot location:', pot?.location);
console.log('Pot flags:', Array.from(pot?.flags || []));
console.log('Room objects:', state.getCurrentRoom()?.objects);
console.log('Rainbow flag:', state.getFlag('RAINBOW_FLAG'));

// Try to get pot
const tokens2 = lexer.tokenize('get pot');
const processedTokens2 = tokens2.map(token => ({
  ...token,
  word: vocabulary.expandAbbreviation(token.word),
  type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
}));
const availableObjects2 = [
  ...state.getObjectsInCurrentRoom(),
  ...state.getInventoryObjects(),
];
console.log('Available objects:', availableObjects2.map(o => o.name));
const command2 = parser.parse(processedTokens2, availableObjects2);
console.log('Parsed command:', command2);
const result2 = executor.execute(command2, state);
console.log('Get result:', result2.message);
