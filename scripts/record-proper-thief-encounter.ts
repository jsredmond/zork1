#!/usr/bin/env tsx

/**
 * Record Proper Thief Encounter Transcript with Deterministic RNG
 * 
 * Navigates to the Treasure Room (thief's lair) to encounter the thief.
 * Path: Kill troll, then navigate through maze to Cyclops Room, then up to Treasure Room.
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

    return result.message || '';
  } catch (error) {
    return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Create transcript
const transcript = createTranscriptTemplate({
  id: '36-thief-encounter-proper',
  name: 'Thief Encounter (Proper)',
  description: 'Encountering the thief in his lair (Treasure Room) with deterministic RNG (seed 12345)',
  category: 'npc',
  priority: 'high',
});

// Commands to navigate to Treasure Room
const commands = [
  // Setup: Get to house and get equipment
  { cmd: 'n', notes: 'Go north' },
  { cmd: 'e', notes: 'Go east to behind house' },
  { cmd: 'open window', notes: 'Open window' },
  { cmd: 'w', notes: 'Enter kitchen' },
  { cmd: 'w', notes: 'Go to living room' },
  { cmd: 'take lamp', notes: 'Take brass lantern' },
  { cmd: 'take sword', notes: 'Take elvish sword' },
  { cmd: 'move rug', notes: 'Move rug' },
  { cmd: 'open trap door', notes: 'Open trap door' },
  { cmd: 'turn on lamp', notes: 'Turn on lamp' },
  { cmd: 'd', notes: 'Descend to cellar' },
  
  // Kill troll to open west passage
  { cmd: 'n', notes: 'Go to troll room' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 1' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 2' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 3' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 4' },
  
  // Navigate through maze to Cyclops Room
  // Path from Troll Room: w → s → e → u → sw → e → s → se → u
  { cmd: 'w', notes: 'Go west into maze (now open after troll death)' },
  { cmd: 's', notes: 'Go south in maze' },
  { cmd: 'e', notes: 'Go east in maze' },
  { cmd: 'u', notes: 'Go up in maze' },
  { cmd: 'sw', notes: 'Go southwest in maze' },
  { cmd: 'e', notes: 'Go east in maze' },
  { cmd: 's', notes: 'Go south in maze' },
  { cmd: 'se', notes: 'Go southeast - should reach Cyclops Room' },
  
  // Now we need to deal with cyclops to go up
  { cmd: 'look', notes: 'Look at Cyclops Room' },
  
  // Try to go up (cyclops will block us)
  { cmd: 'u', notes: 'Try to go up (cyclops blocks)' },
  
  // We need to feed the cyclops or kill him
  // For now, let's try to kill him
  { cmd: 'kill cyclops with sword', notes: 'Attack cyclops - round 1' },
  { cmd: 'kill cyclops with sword', notes: 'Attack cyclops - round 2' },
  { cmd: 'kill cyclops with sword', notes: 'Attack cyclops - round 3' },
  { cmd: 'kill cyclops with sword', notes: 'Attack cyclops - round 4' },
  { cmd: 'kill cyclops with sword', notes: 'Attack cyclops - round 5' },
  
  // Go up to Treasure Room
  { cmd: 'u', notes: 'Go up to Treasure Room' },
  { cmd: 'look', notes: 'Look at Treasure Room (should see thief)' },
  
  // Encounter thief
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 1' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 2' },
  { cmd: 'kill thief with sword', notes: 'Attack thief - round 3' },
];

console.log('=== Recording Proper Thief Encounter with Deterministic RNG (seed 12345) ===\n');

const entries: TranscriptEntry[] = [];

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
console.log(`  RNG Seed: 12345`);
