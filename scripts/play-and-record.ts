#!/usr/bin/env tsx

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
}

interface Transcript {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  entries: TranscriptEntry[];
  metadata: {
    created: string;
    source: string;
    verified: boolean;
  };
}

/**
 * Play Zork I and record a transcript
 */
async function playAndRecord(
  commands: string[],
  transcriptId: string,
  name: string,
  description: string,
  category: string,
  priority: string,
  notes: string[] = []
): Promise<Transcript> {
  return new Promise((resolve, reject) => {
    const frotz = spawn('frotz', ['-p', 'COMPILED/zork1.z3'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let currentCommandIndex = 0;
    const entries: TranscriptEntry[] = [];
    let buffer = '';

    frotz.stdout.on('data', (data) => {
      const text = data.toString();
      buffer += text;
      output += text;

      // Wait for prompt (>) to know command completed
      if (buffer.includes('>') && currentCommandIndex < commands.length) {
        // Extract the output for this command
        const lines = buffer.split('\n');
        
        // Send next command
        const command = commands[currentCommandIndex];
        frotz.stdin.write(command + '\n');
        currentCommandIndex++;
      }
    });

    frotz.stderr.on('data', (data) => {
      console.error('Frotz error:', data.toString());
    });

    frotz.on('close', (code) => {
      // Parse the output into entries
      const outputLines = output.split('\n');
      let currentOutput = '';
      let commandIdx = 0;

      for (let i = 0; i < outputLines.length; i++) {
        const line = outputLines[i];
        
        if (line.includes('>') && commandIdx < commands.length) {
          // Found a prompt, save previous command's output
          if (commandIdx > 0) {
            entries.push({
              command: commands[commandIdx - 1],
              expectedOutput: currentOutput.trim(),
              notes: notes[commandIdx - 1] || undefined
            });
          }
          currentOutput = '';
          commandIdx++;
        } else {
          currentOutput += line + '\n';
        }
      }

      // Add last command
      if (commandIdx > 0 && commandIdx <= commands.length) {
        entries.push({
          command: commands[commandIdx - 1],
          expectedOutput: currentOutput.trim(),
          notes: notes[commandIdx - 1] || undefined
        });
      }

      const transcript: Transcript = {
        id: transcriptId,
        name,
        description,
        category,
        priority,
        entries,
        metadata: {
          created: new Date().toISOString(),
          source: 'original-game',
          verified: false
        }
      };

      resolve(transcript);
    });

    // Start by waiting for initial output, then send first command
    setTimeout(() => {
      if (commands.length > 0) {
        frotz.stdin.write(commands[0] + '\n');
        currentCommandIndex = 1;
      }
    }, 1000);

    // Quit after all commands
    setTimeout(() => {
      frotz.stdin.write('quit\n');
      frotz.stdin.write('y\n');
    }, 2000 + commands.length * 500);
  });
}

/**
 * Save transcript to file
 */
function saveTranscript(transcript: Transcript, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(transcript, null, 2));
  console.log(`Saved transcript: ${outputPath}`);
}

// Main execution
async function main() {
  // Example: Create thief encounter transcript
  const thiefEncounter = await playAndRecord(
    [
      'n',
      'take lamp',
      'take sword', 
      'open case',
      'move rug',
      'open trap door',
      'turn on lamp',
      'd',
      'n'
    ],
    '20-thief-encounter',
    'Thief Encounter',
    'Encountering the thief, observing stealing behavior, combat attempts, and thief fleeing',
    'npc',
    'high',
    [
      'Entering living room from west of house',
      'Taking the brass lantern',
      'Taking the elvish sword',
      'Opening the trophy case',
      'Moving the rug to reveal trap door',
      'Opening the trap door',
      'Turning on the lamp before descending',
      'Descending into the cellar',
      'Encountering the troll - thief may appear after troll is dealt with'
    ]
  );

  saveTranscript(thiefEncounter, '.kiro/transcripts/high/20-thief-encounter.json');
}

if (require.main === module) {
  main().catch(console.error);
}

export { playAndRecord, saveTranscript };
