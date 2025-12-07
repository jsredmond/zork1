#!/usr/bin/env node
/**
 * Transcript Creation and Validation Tool
 * 
 * This tool helps create and validate reference transcripts for behavioral parity verification.
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

// JSON Schema for transcripts using Zod
const StateCheckSchema = z.object({
  type: z.enum(['flag', 'object', 'room', 'inventory', 'score']),
  target: z.string(),
  expectedValue: z.any(),
});

const TranscriptEntrySchema = z.object({
  command: z.string(),
  expectedOutput: z.string(),
  notes: z.string().optional(),
  stateChecks: z.array(StateCheckSchema).optional(),
});

const TranscriptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['opening', 'puzzle', 'npc', 'combat', 'edge-case', 'playthrough', 'timing']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  entries: z.array(TranscriptEntrySchema),
  metadata: z.object({
    created: z.string(),
    source: z.enum(['original-game', 'documented']),
    verified: z.boolean(),
  }),
});

export type Transcript = z.infer<typeof TranscriptSchema>;
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;
export type StateCheck = z.infer<typeof StateCheckSchema>;

/**
 * Validate a transcript against the schema
 */
export function validateTranscript(transcript: unknown): { valid: boolean; errors?: string[] } {
  try {
    TranscriptSchema.parse(transcript);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Load and validate a transcript from a file
 */
export function loadTranscript(filePath: string): { transcript?: Transcript; errors?: string[] } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const validation = validateTranscript(data);
    
    if (!validation.valid) {
      return { errors: validation.errors };
    }
    
    return { transcript: data as Transcript };
  } catch (error) {
    if (error instanceof Error) {
      return { errors: [error.message] };
    }
    return { errors: ['Unknown error loading transcript'] };
  }
}

/**
 * Create a new transcript template
 */
export function createTranscriptTemplate(options: {
  id: string;
  name: string;
  description: string;
  category: Transcript['category'];
  priority: Transcript['priority'];
}): Transcript {
  return {
    id: options.id,
    name: options.name,
    description: options.description,
    category: options.category,
    priority: options.priority,
    entries: [],
    metadata: {
      created: new Date().toISOString(),
      source: 'original-game',
      verified: false,
    },
  };
}

/**
 * Save a transcript to a file
 */
export function saveTranscript(transcript: Transcript, outputPath: string): void {
  const validation = validateTranscript(transcript);
  if (!validation.valid) {
    throw new Error(`Invalid transcript: ${validation.errors?.join(', ')}`);
  }
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(transcript, null, 2), 'utf-8');
}

/**
 * Get the appropriate directory for a transcript based on priority
 */
export function getTranscriptDirectory(priority: Transcript['priority']): string {
  const baseDir = '.kiro/transcripts';
  return path.join(baseDir, priority);
}

/**
 * Interactive CLI for creating transcripts
 */
async function interactiveCLI() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('=== Transcript Creation Tool ===\n');

  const id = await question('Transcript ID (e.g., 01-opening-sequence): ');
  const name = await question('Name: ');
  const description = await question('Description: ');
  
  console.log('\nCategories: opening, puzzle, npc, combat, edge-case, playthrough, timing');
  const category = await question('Category: ') as Transcript['category'];
  
  console.log('\nPriorities: critical, high, medium, low');
  const priority = await question('Priority: ') as Transcript['priority'];

  const transcript = createTranscriptTemplate({
    id,
    name,
    description,
    category,
    priority,
  });

  console.log('\n=== Add Commands ===');
  console.log('Enter commands and outputs. Type "done" when finished.\n');

  while (true) {
    const command = await question('Command (or "done"): ');
    if (command.toLowerCase() === 'done') break;

    const output = await question('Expected output: ');
    const notes = await question('Notes (optional): ');

    transcript.entries.push({
      command,
      expectedOutput: output,
      ...(notes && { notes }),
    });

    console.log(`Added entry ${transcript.entries.length}\n`);
  }

  const dir = getTranscriptDirectory(priority);
  const filename = `${id}.json`;
  const outputPath = path.join(dir, filename);

  saveTranscript(transcript, outputPath);
  console.log(`\n✓ Transcript saved to: ${outputPath}`);

  rl.close();
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Interactive mode
    await interactiveCLI();
    return;
  }

  const command = args[0];

  if (command === '--validate') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: Please provide a file path to validate');
      process.exit(1);
    }

    const result = loadTranscript(filePath);
    if (result.errors) {
      console.error('❌ Validation failed:');
      result.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    console.log('✓ Transcript is valid');
    console.log(`  ID: ${result.transcript!.id}`);
    console.log(`  Name: ${result.transcript!.name}`);
    console.log(`  Entries: ${result.transcript!.entries.length}`);
    console.log(`  Priority: ${result.transcript!.priority}`);
    process.exit(0);
  }

  if (command === '--help' || command === '-h') {
    console.log(`
Transcript Creation and Validation Tool

Usage:
  npx tsx scripts/create-transcript.ts                    Interactive mode
  npx tsx scripts/create-transcript.ts --validate <file>  Validate a transcript
  npx tsx scripts/create-transcript.ts --help             Show this help

Examples:
  # Create a new transcript interactively
  npx tsx scripts/create-transcript.ts

  # Validate an existing transcript
  npx tsx scripts/create-transcript.ts --validate .kiro/transcripts/critical/01-opening.json
    `);
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  console.error('Use --help for usage information');
  process.exit(1);
}

// Run CLI if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
