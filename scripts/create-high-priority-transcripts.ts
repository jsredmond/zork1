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

interface CommandSpec {
  cmd: string;
  notes?: string;
}

interface TranscriptSpec {
  id: string;
  filename: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  commands: CommandSpec[];
}

/**
 * Clean dfrotz output by removing special characters and formatting
 */
function cleanOutput(text: string): string {
  return text
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI codes
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/Using normal formatting\./g, '') // Remove dfrotz message
    .replace(/Loading .*\.z3\./g, '') // Remove loading message
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Generate transcript by running commands through frotz
 */
function generateTranscript(spec: TranscriptSpec): Transcript {
  console.log(`Generating transcript: ${spec.name}...`);
  
  // Create temp commands file
  const tempFile = `/tmp/zork-${spec.id}.txt`;
  const commandText = spec.commands.map(c => c.cmd).join('\n') + '\nquit\ny\n';
  fs.writeFileSync(tempFile, commandText);

  try {
    // Run dfrotz (dumb frotz - non-interactive)
    const rawOutput = execSync(`dfrotz COMPILED/zork1.z3 < ${tempFile}`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000 // 30 second timeout
    });

    // Parse into entries
    const entries = parseGameOutput(rawOutput, spec.commands);

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
  } finally {
    // Cleanup
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Parse game output into transcript entries
 */
function parseGameOutput(rawOutput: string, commands: CommandSpec[]): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  
  // Split by prompt markers
  const lines = rawOutput.split('\n');
  
  let currentOutput: string[] = [];
  let commandIdx = 0;
  let skipHeader = true;
  let inOutput = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip initial header
    if (skipHeader) {
      if (line.includes('West of House') && line.includes('Score:')) {
        skipHeader = false;
        continue;
      }
      if (line.includes('ZORK I:') || 
          line.includes('Infocom') || 
          line.includes('Copyright') ||
          line.includes('Release') ||
          line.includes('Serial number') ||
          line.includes('Using normal') ||
          line.includes('Loading')) {
        continue;
      }
    }
    
    // Look for prompt with command
    if (line.startsWith('>') && commandIdx < commands.length) {
      // Save previous command's output
      if (inOutput && currentOutput.length > 0) {
        const outputText = currentOutput
          .join('\n')
          .replace(/Score:.*Moves:.*$/gm, '') // Remove score lines
          .trim();
        
        if (outputText) {
          entries.push({
            command: commands[commandIdx - 1].cmd,
            expectedOutput: outputText,
            notes: commands[commandIdx - 1].notes
          });
        }
      }
      
      currentOutput = [];
      commandIdx++;
      inOutput = true;
      continue;
    }
    
    // Skip quit-related messages
    if (line.startsWith('Your score is') ||
        line.includes('Do you wish to leave') ||
        line.includes('rank of')) {
      break;
    }
    
    // Skip empty lines and score lines
    if (!line || line.includes('Score:') && line.includes('Moves:')) {
      continue;
    }
    
    // Accumulate output
    if (inOutput && !skipHeader) {
      currentOutput.push(line);
    }
  }
  
  // Add final command output
  if (inOutput && currentOutput.length > 0) {
    const outputText = currentOutput
      .join('\n')
      .replace(/Score:.*Moves:.*$/gm, '')
      .trim();
    
    if (outputText) {
      entries.push({
        command: commands[commandIdx - 1].cmd,
        expectedOutput: outputText,
        notes: commands[commandIdx - 1].notes
      });
    }
  }
  
  return entries;
}

/**
 * Save transcript to JSON file
 */
function saveTranscript(transcript: Transcript, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(transcript, null, 2) + '\n');
  console.log(`✓ Saved: ${outputPath}`);
}

// Common command sequences
const enterHouse: CommandSpec[] = [
  { cmd: 'n', notes: 'Go north' },
  { cmd: 'e', notes: 'Go east to behind house' },
  { cmd: 'open window', notes: 'Open window' },
  { cmd: 'w', notes: 'Enter kitchen' },
  { cmd: 'w', notes: 'Go to living room' }
];

const getLampAndSword: CommandSpec[] = [
  { cmd: 'take lamp', notes: 'Take brass lantern' },
  { cmd: 'take sword', notes: 'Take elvish sword' }
];

const openTrapDoor: CommandSpec[] = [
  { cmd: 'move rug', notes: 'Move rug' },
  { cmd: 'open trap door', notes: 'Open trap door' },
  { cmd: 'turn on lamp', notes: 'Turn on lamp' },
  { cmd: 'd', notes: 'Descend to cellar' }
];

// Define all high-priority transcripts
const transcriptSpecs: TranscriptSpec[] = [
  {
    id: '20-thief-encounter',
    filename: '20-thief-encounter.json',
    name: 'Thief Encounter',
    description: 'Encountering the thief, observing stealing behavior, combat attempts, and thief fleeing',
    category: 'npc',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      ...getLampAndSword,
      ...openTrapDoor,
      { cmd: 'n', notes: 'Go to troll room' },
      { cmd: 'kill troll with sword', notes: 'Attack troll' },
      { cmd: 'kill troll with sword', notes: 'Attack troll again' },
      { cmd: 'e', notes: 'Go east from troll room' },
      { cmd: 'n', notes: 'Continue exploring' }
    ]
  },
  {
    id: '21-thief-defeat',
    filename: '21-thief-defeat.json',
    name: 'Thief Defeat',
    description: 'Defeating thief and recovering items',
    category: 'npc',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      ...getLampAndSword,
      ...openTrapDoor,
      { cmd: 'n', notes: 'Go to troll room' },
      { cmd: 'kill troll with sword', notes: 'Kill troll' },
      { cmd: 'kill troll with sword', notes: 'Kill troll again' },
      { cmd: 'kill troll with sword', notes: 'Kill troll third time' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'n', notes: 'Go north' }
    ]
  },
  {
    id: '22-troll-combat',
    filename: '22-troll-combat.json',
    name: 'Troll Combat',
    description: 'Detailed troll combat sequence',
    category: 'combat',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      ...getLampAndSword,
      ...openTrapDoor,
      { cmd: 'n', notes: 'Enter troll room' },
      { cmd: 'attack troll with sword', notes: 'Attack troll' },
      { cmd: 'attack troll with sword', notes: 'Attack again' },
      { cmd: 'attack troll with sword', notes: 'Attack again' },
      { cmd: 'attack troll with sword', notes: 'Attack again' }
    ]
  },
  {
    id: '23-cyclops-feeding',
    filename: '23-cyclops-feeding.json',
    name: 'Cyclops Feeding',
    description: 'Feeding cyclops alternative solution',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'e', notes: 'Go to kitchen' },
      { cmd: 'take sack', notes: 'Take lunch sack' },
      { cmd: 'open sack', notes: 'Open sack' },
      { cmd: 'take lunch', notes: 'Take lunch' },
      { cmd: 'w', notes: 'Return to living room' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'u', notes: 'Go up to cyclops room' },
      { cmd: 'give lunch to cyclops', notes: 'Give lunch to cyclops' }
    ]
  },
  {
    id: '24-bat-encounter',
    filename: '24-bat-encounter.json',
    name: 'Bat Encounter',
    description: 'Bat carrying player',
    category: 'npc',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'ne', notes: 'Go northeast' },
      { cmd: 'e', notes: 'Go east to bat room' },
      { cmd: 'look', notes: 'Look at bat' }
    ]
  },
  {
    id: '25-maze-navigation',
    filename: '25-maze-navigation.json',
    name: 'Maze Navigation',
    description: 'Navigating through maze',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 's', notes: 'Go south' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'e', notes: 'Go east to maze' },
      { cmd: 'n', notes: 'Navigate maze' },
      { cmd: 'e', notes: 'Navigate maze' },
      { cmd: 'se', notes: 'Navigate maze' }
    ]
  },
  {
    id: '26-mirror-room',
    filename: '26-mirror-room.json',
    name: 'Mirror Room',
    description: 'Mirror room puzzle',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'n', notes: 'Go north to mirror room' },
      { cmd: 'look', notes: 'Examine mirror room' },
      { cmd: 'touch mirror', notes: 'Touch mirror' },
      { cmd: 'rub mirror', notes: 'Rub mirror' }
    ]
  },
  {
    id: '27-coffin-puzzle',
    filename: '27-coffin-puzzle.json',
    name: 'Coffin Puzzle',
    description: 'Opening coffin and getting sceptre',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'se', notes: 'Go southeast to egypt room' },
      { cmd: 'look', notes: 'Look at egypt room' },
      { cmd: 'open coffin', notes: 'Open coffin' },
      { cmd: 'take sceptre', notes: 'Take sceptre' }
    ]
  },
  {
    id: '28-egg-nest',
    filename: '28-egg-nest.json',
    name: 'Egg and Nest Puzzle',
    description: 'Egg and nest puzzle solution',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'w', notes: 'Go west' },
      { cmd: 'climb', notes: 'Climb up' },
      { cmd: 'n', notes: 'Go to birds nest' },
      { cmd: 'look', notes: 'Look at nest' },
      { cmd: 'take egg', notes: 'Take egg' }
    ]
  },
  {
    id: '29-rainbow',
    filename: '29-rainbow.json',
    name: 'Rainbow Puzzle',
    description: 'Rainbow and pot of gold',
    category: 'puzzle',
    priority: 'high',
    commands: [
      { cmd: 'verbose', notes: 'Set verbose mode' },
      ...enterHouse,
      { cmd: 'take lamp', notes: 'Take lamp' },
      { cmd: 'move rug', notes: 'Move rug' },
      { cmd: 'open trap door', notes: 'Open trap door' },
      { cmd: 'turn on lamp', notes: 'Turn on lamp' },
      { cmd: 'd', notes: 'Go down' },
      { cmd: 'n', notes: 'Go north' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'ne', notes: 'Go northeast' },
      { cmd: 'e', notes: 'Go east' },
      { cmd: 'look', notes: 'Look at rainbow' }
    ]
  }
];

// Main execution
function main() {
  console.log('Generating high-priority transcripts...\n');
  
  for (const spec of transcriptSpecs) {
    try {
      const transcript = generateTranscript(spec);
      const outputPath = `.kiro/transcripts/high/${spec.filename}`;
      saveTranscript(transcript, outputPath);
    } catch (error) {
      console.error(`✗ Failed to generate ${spec.name}:`, error);
    }
  }
  
  console.log('\n✓ All high-priority transcripts generated!');
}

// Run if executed directly
main();
