#!/usr/bin/env tsx

/**
 * Record Thief Encounter by Wandering with Treasures
 * 
 * Carries treasures and wanders the underground to attract the thief.
 * The thief is drawn to valuables and will appear within 15-30 moves.
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';
import { Vocabulary } from '../src/parser/vocabulary.js';
import { GameObjectImpl } from '../src/game/objects.js';
import { ALL_ROOMS } from '../src/game/data/rooms-complete.js';
import { enableDeterministicRandom } from '../src/testing/seededRandom.js';
import { createTranscriptTemplate, saveTranscript } from './create-transcript.js';
import type { TranscriptEntry } from './create-transcript.js';

// Enable deterministic random with seed 12345
enableDeterministicRandom(12345);

const state = createInitialGameState();
const lexer = new Lexer();
const vocabulary = new Vocabulary();
const parser = new Parser();
const executor = new CommandExecutor();

function getAvailableObjects(state: any): GameObjectImpl[] {
  const available: GameObjectImpl[] = [];
  const addedIds = new Set<string>();

  for (const objId of state.inventory) {
    if (!addedIds.has(objId)) {
      const obj = state.getObject(objId);
      if (obj) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
      }
    }
  }

  const room = state.getCurrentRoom();
  if (room) {
    for (const objId of room.objects) {
      if (!addedIds.has(objId)) {
        const obj = state.getObject(objId);
        if (obj) {
          available.push(obj as GameObjectImpl);
          addedIds.add(objId);
        }
      }
    }
    
    const roomData = ALL_ROOMS[room.id];
    if (roomData && roomData.globalObjects) {
      for (const objId of roomData.globalObjects) {
        if (!addedIds.has(objId)) {
          const obj = state.getObject(objId);
          if (obj) {
            available.push(obj as GameObjectImpl);
            addedIds.add(objId);
          }
        }
      }
    }
  }

  return available;
}

function executeCommand(command: string): string {
  try {
    const tokens = lexer.tokenize(command);
    const processedTokens = tokens.map(token => {
      const expandedWord = vocabulary.expandAbbreviation(token.word);
      return {
        ...token,
        word: expandedWord,
        type: vocabulary.lookupWord(expandedWord),
      };
    });

    const availableObjects = getAvailableObjects(state);
    const parsedCommand = parser.parse(processedTokens, availableObjects);
    const result = executor.execute(parsedCommand, state);

    // Run actor daemons (thief, troll, cyclops, etc.)
    state.actorManager.executeTurn(state);

    return result.message || '';
  } catch (error) {
    return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Create transcript
const transcript = createTranscriptTemplate({
  id: '36-thief-encounter-proper',
  name: 'Thief Encounter (Proper)',
  description: 'Encountering the thief by wandering with treasures - deterministic RNG (seed 12345)',
  category: 'npc',
  priority: 'high',
});

// Commands to get treasures and wander
const commands = [
  // Setup: Get to house and get equipment
  { cmd: 'n', notes: 'Go north' },
  { cmd: 'e', notes: 'Go east to behind house' },
  { cmd: 'open window', notes: 'Open window' },
  { cmd: 'w', notes: 'Enter kitchen' },
  { cmd: 'take sack', notes: 'Take lunch sack (treasure bait)' },
  { cmd: 'w', notes: 'Go to living room' },
  { cmd: 'take lamp', notes: 'Take brass lantern' },
  { cmd: 'take sword', notes: 'Take elvish sword' },
  { cmd: 'move rug', notes: 'Move rug' },
  { cmd: 'open trap door', notes: 'Open trap door' },
  { cmd: 'turn on lamp', notes: 'Turn on lamp' },
  { cmd: 'd', notes: 'Descend to cellar' },
  
  // Kill troll to open passages
  { cmd: 'n', notes: 'Go to troll room' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 1' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 2' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 3' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 4' },
  
  // Wander around with treasures to attract thief
  { cmd: 'e', notes: 'Go east' },
  { cmd: 'n', notes: 'Go north' },
  { cmd: 'wait', notes: 'Wait for thief (turn 1)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 2)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 3)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 4)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 5)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 6)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 7)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 8)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 9)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 10)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 11)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 12)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 13)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 14)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 15)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 16)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 17)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 18)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 19)' },
  { cmd: 'wait', notes: 'Wait for thief (turn 20)' },
  { cmd: 'look', notes: 'Look around (check if thief appeared)' },
  
  // If thief appeared, fight him
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 1' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 2' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 3' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 4' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 5' },
];

console.log('=== Recording Thief Encounter by Wandering with Treasures (seed 12345) ===\n');

const entries: TranscriptEntry[] = [];
let thiefFound = false;

for (const { cmd, notes } of commands) {
  console.log(`> ${cmd}`);
  const output = executeCommand(cmd);
  console.log(output);
  console.log();

  entries.push({
    command: cmd,
    expectedOutput: output,
    notes,
  });
  
  // Check if thief appeared
  if (output.toLowerCase().includes('thief') || output.toLowerCase().includes('robber') || output.toLowerCase().includes('stiletto')) {
    console.log('✓ Thief detected!');
    thiefFound = true;
  }
  
  // Check if we've reached an error state
  if (output.includes('ERROR')) {
    console.log('⚠ Encountered error, stopping recording');
    break;
  }
}

// Add entries to transcript
transcript.entries = entries;

// Save transcript
const outputPath = '.kiro/transcripts/high/36-thief-encounter-proper.json';
saveTranscript(transcript, outputPath);

console.log(`\n✓ Transcript saved to: ${outputPath}`);
console.log(`  Total entries: ${entries.length}`);
console.log(`  Thief found: ${thiefFound ? 'YES' : 'NO'}`);
console.log(`  RNG Seed: 12345`);
