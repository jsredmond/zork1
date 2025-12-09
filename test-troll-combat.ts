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

// Setup: go to troll room
state.addToInventory('LAMP');
state.setCurrentRoom('CELLAR');

// Turn on lamp
const tokens1 = lexer.tokenize('turn on lamp');
const processed1 = tokens1.map(t => ({ ...t, word: vocabulary.expandAbbreviation(t.word), type: vocabulary.lookupWord(vocabulary.expandAbbreviation(t.word)) }));
const parsed1 = parser.parse(processed1, []);
executor.execute(parsed1, state);

// Go north to troll room
const tokens2 = lexer.tokenize('n');
const processed2 = tokens2.map(t => ({ ...t, word: vocabulary.expandAbbreviation(t.word), type: vocabulary.lookupWord(vocabulary.expandAbbreviation(t.word)) }));
const parsed2 = parser.parse(processed2, []);
const result2 = executor.execute(parsed2, state);
console.log('Go north result:', result2.message);

console.log('\n=== In Troll Room ===');
console.log('Current room:', state.currentRoom);

const troll = state.getObject('TROLL');
console.log('Troll location:', troll?.location);
console.log('Troll has FIGHTBIT:', troll?.hasFlag('FIGHTBIT'));

// Try an invalid command
console.log('\n=== Trying invalid command ===');
const tokens3 = lexer.tokenize('give lunch to cyclops');
const processed3 = tokens3.map(t => ({ ...t, word: vocabulary.expandAbbreviation(t.word), type: vocabulary.lookupWord(vocabulary.expandAbbreviation(t.word)) }));
const availableObjects = Array.from(state.objects.values()).filter(obj => 
  obj.location === state.currentRoom || state.isInInventory(obj.id)
);
const parsed3 = parser.parse(processed3, availableObjects);
const result3 = executor.execute(parsed3, state);
console.log('Result:', result3.message);

