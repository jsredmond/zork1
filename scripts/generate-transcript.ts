#!/usr/bin/env tsx

import { execSync } from 'child_process';
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

interface TranscriptSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  commands: Array<{ cmd: string; notes?: string }>;
}

/**
 * Generate a transcript by playing the game with specified commands
 */
function generateTranscript(spec: TranscriptSpec): Transcript {
  // Create commands file
  const commandsFile = `/tmp/zork-commands-${spec.id}.txt`;
  const commands = spec.commands.map(c => c.cmd).join('\n') + '\nquit\ny\n';
  fs.writeFileSync(commandsFile, commands);

  // Run frotz with commands
  const output = execSync(`frotz -p COMPILED/zork1.z3 < ${commandsFile}`, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  });

  // Clean up
  fs.unlinkSync(commandsFile);

  // Parse output into entries
  const entries = parseOutput(output, spec.commands);

  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    category: spec.category,
    priority: spec.priority,
    entries,
    metadata: {
      created: new Date().toISOString(),
      source: 'original-game',
      verified: false
    }
  };
}

/**
 * Parse frotz output into transcript entries
 */
function parseOutput(
  output: string,
  commands: Array<{ cmd: string; notes?: string }>
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  
  // Split by command prompts
  const lines = output.split('\n');
  let currentOutput: string[] = [];
  let commandIndex = 0;
  let skipInitial = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line contains our command (echoed back)
    if (commandIndex < commands.length) {
      const cmd = commands[commandIndex].cmd;
      
      // Look for the command in the output
      if (line.trim() === `>${cmd}` || line.trim() === cmd) {
        // Save previous command's output
        if (!skipInitial && commandIndex > 0) {
          const outputText = currentOutput.join('\n').trim();
          if (outputText) {
            entries.push({
              command: commands[commandIndex - 1].cmd,
              expectedOutput: outputText,
              notes: commands[commandIndex - 1].notes
            });
          }
        }
        skipInitial = false;
        currentOutput = [];
        commandIndex++;
        continue;
      }
    }
    
    // Skip prompt lines
    if (line.trim() === '>' || line.trim().startsWith('>')) {
      continue;
    }
    
    // Accumulate output
    if (!skipInitial) {
      currentOutput.push(line);
    }
  }

  // Add last command's output
  if (commandIndex > 0 && commandIndex <= commands.length) {
    const outputText = currentOutput.join('\n').trim();
    if (outputText && !outputText.includes('quit')) {
      entries.push({
        command: commands[commandIndex - 1].cmd,
        expectedOutput: outputText,
        notes: commands[commandIndex - 1].notes
      });
    }
  }

  return entries;
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
  console.log(`✓ Saved transcript: ${outputPath}`);
}

// Export for use in other scripts
export { generateTranscript, saveTranscript, TranscriptSpec };

// CLI usage
if (require.main === module) {
  const specs: TranscriptSpec[] = [
    {
      id: '20-thief-encounter',
      name: 'Thief Encounter',
      description: 'Encountering the thief, observing stealing behavior, combat attempts, and thief fleeing',
      category: 'npc',
      priority: 'high',
      commands: [
        { cmd: 'n', notes: 'Entering living room from west of house' },
        { cmd: 'take lamp', notes: 'Taking the brass lantern' },
        { cmd: 'take sword', notes: 'Taking the elvish sword' }
      ]
    }
  ];

  for (const spec of specs) {
    const transcript = generateTranscript(spec);
    saveTranscript(transcript, `.kiro/transcripts/high/${spec.id}.json`);
  }
}
