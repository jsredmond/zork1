#!/usr/bin/env tsx

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';
import { Parser } from './src/parser/parser.js';
import { Lexer } from './src/parser/lexer.js';
import { Vocabulary } from './src/parser/vocabulary.js';
import { ObjectFlag } from './src/game/data/flags.js';
import { initializeLampTimer } from './src/engine/daemons.js';

const state = createInitialGameState();
const lexer = new Lexer();
const vocabulary = new Vocabulary();
const parser = new Parser();
const executor = new CommandExecutor();

console.log('Initial turn:', state.moves);

// Give player the lamp (debug command - doesn't advance turn)
state.moveObject('LAMP', 'PLAYER');
console.log('After give LAMP:', state.moves);

const lamp = state.getObject('LAMP');
if (lamp) {
  lamp.addFlag(ObjectFlag.ONBIT);
  initializeLampTimer(state);
  console.log('After turnon LAMP:', state.moves);
  
  // Advance 97 turns with wait commands
  for (let i = 0; i < 97; i++) {
    const tokens = lexer.tokenize('wait');
    const processedTokens = tokens.map(token => ({
      ...token,
      word: vocabulary.expandAbbreviation(token.word),
      type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
    }));
    
    const parsedCommand = parser.parse(processedTokens, []);
    executor.execute(parsedCommand, state);
  }
  console.log('After 97 wait commands:', state.moves);
  
  // Execute wait command (should trigger warning on turn 100)
  const tokens = lexer.tokenize('wait');
  const processedTokens = tokens.map(token => ({
    ...token,
    word: vocabulary.expandAbbreviation(token.word),
    type: vocabulary.lookupWord(vocabulary.expandAbbreviation(token.word)),
  }));
  
  const parsedCommand = parser.parse(processedTokens, []);
  const result = executor.execute(parsedCommand, state);
  
  console.log('Wait command result:');
  console.log('Message:', JSON.stringify(result.message));
  console.log('Success:', result.success);
}