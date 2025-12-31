#!/usr/bin/env npx tsx
/**
 * Create rainbow puzzle transcript by playing original Zork I
 * This script automates the creation of transcript 30-rainbow-puzzle.json
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

// Commands to complete rainbow puzzle
// Strategy: Get past troll by giving treasures, get sceptre, go to rainbow
const commands = `
n
e
open window
enter
w
take lamp
take sword
e
take sack
w
move rug
open trap door
turn on lamp
d
s
e
take painting
w
n
n
give painting to troll
e
open coffin
take sceptre
w
s
e
s
w
w
s
w
wave sceptre
on rainbow
take pot
look
i
score
quit
y
`.trim();

async function playGame(): Promise<string> {
  const { stdout } = await execAsync(
    `echo "${commands.replace(/\n/g, '\\n')}" | dfrotz -m -p reference/COMPILED/zork1.z3 2>&1`
  );
  return stdout;
}

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
}

function parseGameOutput(output: string): TranscriptEntry[] {
  const lines = output.split('\n');
  const entries: TranscriptEntry[] = [];
  
  let currentCommand = '';
  let currentOutput: string[] = [];
  let inOutput = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for command prompts (lines starting with >)
    if (line.trim().startsWith('>') && line.trim().length > 1) {
      // Save previous entry if exists
      if (currentCommand && currentOutput.length > 0) {
        entries.push({
          command: currentCommand,
          expectedOutput: currentOutput.join('\n').trim()
        });
      }
      
      // Start new entry
      currentCommand = line.substring(line.indexOf('>') + 1).trim();
      currentOutput = [];
      inOutput = true;
    } else if (inOutput && line.trim()) {
      currentOutput.push(line);
    }
  }
  
  // Add last entry
  if (currentCommand && currentOutput.length > 0) {
    entries.push({
      command: currentCommand,
      expectedOutput: currentOutput.join('\n').trim()
    });
  }
  
  return entries;
}

async function main() {
  console.log('Playing original Zork I to record rainbow puzzle...');
  
  const output = await playGame();
  
  // Save raw output for debugging
  await fs.writeFile('/tmp/rainbow-raw-output.txt', output);
  console.log('Raw output saved to /tmp/rainbow-raw-output.txt');
  
  // Parse into transcript entries
  const entries = parseGameOutput(output);
  
  // Filter to just the rainbow-related commands
  const rainbowStart = entries.findIndex(e => e.command.includes('wave sceptre'));
  const rainbowEntries = rainbowStart >= 0 ? entries.slice(rainbowStart) : [];
  
  if (rainbowEntries.length === 0) {
    console.error('Could not find rainbow puzzle commands in output!');
    console.log('Check /tmp/rainbow-raw-output.txt for details');
    process.exit(1);
  }
  
  const transcript = {
    id: '30-rainbow-puzzle',
    name: 'Rainbow Puzzle',
    description: 'Wave sceptre at Aragain Falls to solidify rainbow and get pot of gold',
    category: 'puzzle',
    priority: 'high',
    entries: rainbowEntries,
    metadata: {
      created: new Date().toISOString(),
      source: 'original-game',
      verified: true
    }
  };
  
  const outputPath = '.kiro/transcripts/high/30-rainbow-puzzle.json';
  await fs.writeFile(outputPath, JSON.stringify(transcript, null, 2));
  
  console.log(`\nTranscript created: ${outputPath}`);
  console.log(`Entries: ${rainbowEntries.length}`);
  console.log('\nFirst few commands:');
  rainbowEntries.slice(0, 5).forEach(e => {
    console.log(`  > ${e.command}`);
  });
}

main().catch(console.error);
