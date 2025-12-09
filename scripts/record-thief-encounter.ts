#!/usr/bin/env tsx

/**
 * Record Thief Encounter Transcript with Deterministic RNG
 * 
 * Plays the TypeScript game with seed 12345 and records the actual
 * combat sequence for the thief encounter.
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

  // Add inventory objects
  for (const objId of state.inventory) {
    if (!addedIds.has(objId)) {
      const obj = state.getObject(objId);
      if (obj) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
      }
    }
  }

  // Add objects in current room
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
  id: '20-thief-encounter-deterministic',
  name: 'Troll Combat Sequence 1 (Deterministic)',
  description: 'Troll combat with deterministic RNG (seed 12345) - originally mislabeled as thief encounter',
  category: 'combat',
  priority: 'high',
});

// Commands to execute - this tests troll combat, not thief
const commands = [
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
  { cmd: 'n', notes: 'Go to troll room' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 1' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 2' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 3' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 4' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 5' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 6' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 7' },
  { cmd: 'kill troll with sword', notes: 'Attack troll - round 8' },
  { cmd: 'e', notes: 'Go east from troll room' },
];

console.log('=== Recording Troll Combat with Deterministic RNG (seed 12345) ===\n');

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
}

// Add entries to transcript
transcript.entries = entries;

// Save transcript
const outputPath = '.kiro/transcripts/high/20-thief-encounter-deterministic.json';
saveTranscript(transcript, outputPath);

console.log(`\n✓ Transcript saved to: ${outputPath}`);
console.log(`  Total entries: ${entries.length}`);
console.log(`  RNG Seed: 12345`);
