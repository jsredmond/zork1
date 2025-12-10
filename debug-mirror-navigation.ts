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

// Simulate the navigation sequence from the transcript
const commands = [
  'n',           // 1: West of House -> North of House
  'e',           // 2: North of House -> Behind House  
  'open window', // 3: Open window
  'w',           // 4: Behind House -> Kitchen
  'w',           // 5: Kitchen -> Living Room
  'take lamp',   // 6: Take lamp
  'move rug',    // 7: Move rug
  'open trap door', // 8: Open trap door
  'turn on lamp',   // 9: Turn on lamp
  'd',           // 10: Living Room -> Cellar
  'n',           // 11: Cellar -> Troll Room
  'e',           // 12: Troll Room -> EW-PASSAGE (if troll is dead)
];

for (let i = 0; i < commands.length; i++) {
  const command = commands[i];
  console.log(`\n=== Command ${i+1}: "${command}" ===`);
  console.log(`Before: Room = ${state.getCurrentRoom()?.id}`);
  
  const tokens = lexer.tokenize(command);
  const processedTokens = tokens.map(token => ({
    ...token,
    word: vocabulary.expandAbbreviation(token.word),
    type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
  }));
  const availableObjects = [
    ...state.getObjectsInCurrentRoom(),
    ...state.getInventoryObjects(),
  ];
  const parsedCommand = parser.parse(processedTokens, availableObjects);
  const result = executor.execute(parsedCommand, state);
  
  console.log(`After: Room = ${state.getCurrentRoom()?.id}`);
  console.log(`Result: ${result.message?.substring(0, 100)}...`);
  
  // Check troll location and state
  const troll = state.getObject('TROLL');
  console.log(`Troll location: ${troll?.location}`);
  console.log(`Troll flags: ${Array.from(troll?.flags || [])}`);
  
  // Stop if we hit an error or death
  if (result.message?.includes('died') || result.message?.includes('grue')) {
    console.log('STOPPING: Player died');
    break;
  }
}

// Try command 13: "n" from current location
console.log(`\n=== Command 13: "n" ===`);
console.log(`Current room: ${state.getCurrentRoom()?.id}`);
const result13 = executor.execute({ verb: 'NORTH' }, state);
console.log(`Result: ${result13.message}`);
