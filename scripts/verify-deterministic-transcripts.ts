#!/usr/bin/env tsx

/**
 * Verify Deterministic Combat Transcripts
 * 
 * Verifies that the re-recorded combat transcripts with deterministic RNG
 * achieve 95%+ similarity when replayed.
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';
import { Vocabulary } from '../src/parser/vocabulary.js';
import { GameObjectImpl } from '../src/game/objects.js';
import { ALL_ROOMS } from '../src/game/data/rooms-complete.js';
import { enableDeterministicRandom } from '../src/testing/seededRandom.js';
import * as fs from 'fs';

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
}

interface Transcript {
  id: string;
  name: string;
  description: string;
  entries: TranscriptEntry[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function calculateSimilarity(expected: string, actual: string): number {
  const exp = normalizeText(expected);
  const act = normalizeText(actual);
  
  if (exp === act) return 100;
  
  const expWords = exp.split(' ');
  const actWords = act.split(' ');
  
  const expSet = new Set(expWords);
  const actSet = new Set(actWords);
  
  const intersection = new Set([...expSet].filter(x => actSet.has(x)));
  const union = new Set([...expSet, ...actSet]);
  
  return (intersection.size / union.size) * 100;
}

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

function verifyTranscript(transcriptPath: string): {
  passed: boolean;
  similarity: number;
  exactMatches: number;
  total: number;
} {
  // Enable deterministic random with seed 12345
  enableDeterministicRandom(12345);
  
  const state = createInitialGameState();
  const lexer = new Lexer();
  const vocabulary = new Vocabulary();
  const parser = new Parser();
  const executor = new CommandExecutor();

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

  const transcriptData = fs.readFileSync(transcriptPath, 'utf-8');
  const transcript: Transcript = JSON.parse(transcriptData);

  console.log(`\n=== Verifying: ${transcript.name} ===`);
  console.log(`Description: ${transcript.description}`);
  console.log(`Total commands: ${transcript.entries.length}\n`);

  let totalSimilarity = 0;
  let exactMatches = 0;
  const differences: Array<{ command: string; similarity: number }> = [];

  for (let i = 0; i < transcript.entries.length; i++) {
    const entry = transcript.entries[i];
    const actual = executeCommand(entry.command);
    const similarity = calculateSimilarity(entry.expectedOutput, actual);
    
    totalSimilarity += similarity;
    
    if (similarity === 100) {
      exactMatches++;
    } else if (similarity < 95) {
      differences.push({
        command: entry.command,
        similarity: similarity,
      });
    }
  }

  const averageSimilarity = totalSimilarity / transcript.entries.length;
  const passed = averageSimilarity >= 95;

  console.log(`Average Similarity: ${averageSimilarity.toFixed(2)}%`);
  console.log(`Exact Matches: ${exactMatches}/${transcript.entries.length}`);
  console.log(`Status: ${passed ? '✓ PASSED' : '✗ FAILED'}`);

  if (differences.length > 0) {
    console.log(`\nCommands with <95% similarity:`);
    for (const diff of differences) {
      console.log(`  - "${diff.command}": ${diff.similarity.toFixed(2)}%`);
    }
  }

  return {
    passed,
    similarity: averageSimilarity,
    exactMatches,
    total: transcript.entries.length,
  };
}

// Verify all three transcripts
const transcripts = [
  '.kiro/transcripts/high/20-thief-encounter-deterministic.json',
  '.kiro/transcripts/high/21-thief-defeat-deterministic.json',
  '.kiro/transcripts/high/22-troll-combat-deterministic.json',
];

console.log('=== Verifying Deterministic Combat Transcripts ===');
console.log('RNG Seed: 12345\n');

const results: Array<{ name: string; passed: boolean; similarity: number }> = [];

for (const transcriptPath of transcripts) {
  const result = verifyTranscript(transcriptPath);
  results.push({
    name: transcriptPath.split('/').pop() || transcriptPath,
    passed: result.passed,
    similarity: result.similarity,
  });
}

console.log('\n=== Summary ===');
console.log(`Total transcripts: ${results.length}`);
console.log(`Passed (≥95%): ${results.filter(r => r.passed).length}`);
console.log(`Failed (<95%): ${results.filter(r => !r.passed).length}`);

console.log('\nResults:');
for (const result of results) {
  const status = result.passed ? '✓' : '✗';
  console.log(`  ${status} ${result.name}: ${result.similarity.toFixed(2)}%`);
}

const allPassed = results.every(r => r.passed);
console.log(`\nOverall: ${allPassed ? '✓ ALL PASSED' : '✗ SOME FAILED'}`);

process.exit(allPassed ? 0 : 1);
