#!/usr/bin/env tsx

/**
 * Transcript Comparison Tool
 * 
 * Compares game output against reference transcripts from the original Zork I
 * to verify behavioral parity.
 * 
 * Usage:
 *   npx tsx scripts/compare-transcript.ts <transcript-file>
 *   npx tsx scripts/compare-transcript.ts --interactive
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { CommandExecutor } from '../src/engine/executor.js';
import { Parser } from '../src/parser/parser.js';
import { Lexer } from '../src/parser/lexer.js';
import { Vocabulary } from '../src/parser/vocabulary.js';
import { GameState } from '../src/game/state.js';
import * as fs from 'fs';
import * as path from 'path';

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
}

interface Transcript {
  name: string;
  description: string;
  entries: TranscriptEntry[];
}

interface ComparisonResult {
  passed: boolean;
  totalCommands: number;
  matchedCommands: number;
  differences: Difference[];
}

interface Difference {
  commandIndex: number;
  command: string;
  expected: string;
  actual: string;
  similarity: number;
}

class TranscriptComparator {
  private lexer: Lexer;
  private vocabulary: Vocabulary;
  private parser: Parser;
  private executor: CommandExecutor;

  constructor() {
    this.lexer = new Lexer();
    this.vocabulary = new Vocabulary();
    this.parser = new Parser();
    this.executor = new CommandExecutor();
  }

  /**
   * Execute a command and return the output
   */
  private executeCommand(command: string, state: GameState): string {
    try {
      // Tokenize
      const tokens = this.lexer.tokenize(command);
      
      // Process with vocabulary
      const processedTokens = tokens.map(token => ({
        ...token,
        word: this.vocabulary.expandAbbreviation(token.word),
        type: this.vocabulary.lookupWord(token.word),
      }));

      // Parse
      const availableObjects = state.getObjectsInCurrentRoom();
      const parsedCommand = this.parser.parse(processedTokens, availableObjects);

      // Execute
      const result = this.executor.execute(parsedCommand, state);

      return result.message || '';
    } catch (error) {
      return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Calculate similarity between two strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Normalize strings
    const norm1 = str1.toLowerCase().trim().replace(/\s+/g, ' ');
    const norm2 = str2.toLowerCase().trim().replace(/\s+/g, ' ');

    if (norm1 === norm2) return 1.0;

    // Simple word-based similarity
    const words1 = new Set(norm1.split(' '));
    const words2 = new Set(norm2.split(' '));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Compare game output against a transcript
   */
  public compareTranscript(transcript: Transcript): ComparisonResult {
    const state = createInitialGameState();
    const differences: Difference[] = [];
    let matchedCommands = 0;

    console.log(`\n=== Comparing Transcript: ${transcript.name} ===`);
    console.log(`Description: ${transcript.description}\n`);

    for (let i = 0; i < transcript.entries.length; i++) {
      const entry = transcript.entries[i];
      
      console.log(`[${i + 1}/${transcript.entries.length}] > ${entry.command}`);

      const actualOutput = this.executeCommand(entry.command, state);
      const similarity = this.calculateSimilarity(entry.expectedOutput, actualOutput);

      if (similarity >= 0.9) {
        matchedCommands++;
        console.log(`  ✓ Match (${(similarity * 100).toFixed(1)}%)`);
      } else {
        console.log(`  ✗ Difference (${(similarity * 100).toFixed(1)}% similar)`);
        differences.push({
          commandIndex: i,
          command: entry.command,
          expected: entry.expectedOutput,
          actual: actualOutput,
          similarity
        });
      }

      if (entry.notes) {
        console.log(`  Note: ${entry.notes}`);
      }
    }

    const passed = differences.length === 0;
    
    console.log(`\n=== Results ===`);
    console.log(`Total commands: ${transcript.entries.length}`);
    console.log(`Matched: ${matchedCommands}`);
    console.log(`Differences: ${differences.length}`);
    console.log(`Pass rate: ${((matchedCommands / transcript.entries.length) * 100).toFixed(1)}%`);
    console.log(`Status: ${passed ? '✓ PASSED' : '✗ FAILED'}\n`);

    return {
      passed,
      totalCommands: transcript.entries.length,
      matchedCommands,
      differences
    };
  }

  /**
   * Print detailed differences
   */
  public printDifferences(differences: Difference[]): void {
    if (differences.length === 0) {
      console.log('No differences found!');
      return;
    }

    console.log('\n=== Detailed Differences ===\n');

    for (const diff of differences) {
      console.log(`Command ${diff.commandIndex + 1}: ${diff.command}`);
      console.log(`Similarity: ${(diff.similarity * 100).toFixed(1)}%`);
      console.log(`\nExpected:`);
      console.log(diff.expected);
      console.log(`\nActual:`);
      console.log(diff.actual);
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }

  /**
   * Load transcript from JSON file
   */
  public loadTranscript(filePath: string): Transcript {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Interactive mode - play commands and compare manually
   */
  public async interactiveMode(): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const state = createInitialGameState();

    console.log('\n=== Interactive Transcript Comparison ===');
    console.log('Enter commands to test. Type "quit" to exit.\n');

    const prompt = () => {
      rl.question('> ', (command: string) => {
        if (command.toLowerCase() === 'quit') {
          rl.close();
          return;
        }

        const output = this.executeCommand(command, state);
        console.log(output);
        console.log();

        prompt();
      });
    };

    prompt();
  }
}

// Example transcript for testing
const EXAMPLE_TRANSCRIPT: Transcript = {
  name: 'Opening Sequence',
  description: 'Basic opening commands to verify initial game state',
  entries: [
    {
      command: 'look',
      expectedOutput: 'West of House\nYou are standing in an open field west of a white house, with a boarded front door.\nThere is a small mailbox here.',
      notes: 'Initial room description'
    },
    {
      command: 'examine mailbox',
      expectedOutput: 'The small mailbox is closed.',
      notes: 'Mailbox should be closed initially'
    },
    {
      command: 'open mailbox',
      expectedOutput: 'Opening the small mailbox reveals a leaflet.',
      notes: 'Opening mailbox reveals leaflet'
    },
    {
      command: 'take leaflet',
      expectedOutput: 'Taken.',
      notes: 'Taking leaflet should succeed'
    },
    {
      command: 'inventory',
      expectedOutput: 'You are carrying:\n  A leaflet',
      notes: 'Inventory should show leaflet'
    },
    {
      command: 'read leaflet',
      expectedOutput: 'WELCOME TO ZORK!\n\nZORK is a game of adventure, danger, and low cunning. In it you will explore some of the most amazing territory ever seen by mortals. No computer should be without one!',
      notes: 'Leaflet text'
    }
  ]
};

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const comparator = new TranscriptComparator();

  if (args.includes('--interactive') || args.includes('-i')) {
    await comparator.interactiveMode();
    return;
  }

  if (args.includes('--example')) {
    // Run example transcript
    const result = comparator.compareTranscript(EXAMPLE_TRANSCRIPT);
    
    if (result.differences.length > 0) {
      comparator.printDifferences(result.differences);
    }

    process.exit(result.passed ? 0 : 1);
  }

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/compare-transcript.ts <transcript-file.json>');
    console.log('  npx tsx scripts/compare-transcript.ts --example');
    console.log('  npx tsx scripts/compare-transcript.ts --interactive');
    console.log('\nTranscript file format:');
    console.log(JSON.stringify(EXAMPLE_TRANSCRIPT, null, 2));
    process.exit(1);
  }

  // Load and compare transcript from file
  const transcriptPath = args[0];
  
  if (!fs.existsSync(transcriptPath)) {
    console.error(`Error: Transcript file not found: ${transcriptPath}`);
    process.exit(1);
  }

  const transcript = comparator.loadTranscript(transcriptPath);
  const result = comparator.compareTranscript(transcript);

  if (result.differences.length > 0) {
    comparator.printDifferences(result.differences);
  }

  process.exit(result.passed ? 0 : 1);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
