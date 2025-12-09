/**
 * Create inventory limits transcript from original game
 * Tests weight-based inventory limits
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes: string;
}

// Commands to test inventory limits
const commands = [
  { input: "open mailbox", location: "West of House", notes: "Open mailbox" },
  { input: "take leaflet", location: "West of House", notes: "Take leaflet (size 2)" },
  { input: "south", location: "South of House", notes: "Go south" },
  { input: "east", location: "Behind House", notes: "Go east to behind house (NOT west!)" },
  { input: "open window", location: "Behind House", notes: "Open window" },
  { input: "west", location: "Kitchen", notes: "Enter kitchen through window" },
  { input: "take sack", location: "Kitchen", notes: "Take sack (size 9 + lunch 5 + garlic 3 = 17 total)" },
  { input: "take bottle", location: "Kitchen", notes: "Take bottle (size 4 + water 2 = 6 total)" },
  { input: "west", location: "Living Room", notes: "Go to living room" },
  { input: "take sword", location: "Living Room", notes: "Take sword (size 10)" },
  { input: "take lamp", location: "Living Room", notes: "Take lamp (size 5)" },
  { input: "inventory", location: "Living Room", notes: "Check inventory - should show all items with nested contents" },
  { input: "move rug", location: "Living Room", notes: "Move rug" },
  { input: "open trap door", location: "Living Room", notes: "Open trap door" },
  { input: "turn on lamp", location: "Living Room", notes: "Turn on lamp" },
  { input: "down", location: "Cellar", notes: "Go down to cellar" },
  { input: "south", location: "East of Chasm", notes: "Go south" },
  { input: "east", location: "Gallery", notes: "Go east to gallery" },
  { input: "take painting", location: "Gallery", notes: "Take painting (size 20) - total weight now ~60" },
  { input: "inventory", location: "Gallery", notes: "Check inventory with painting" },
  { input: "west", location: "East of Chasm", notes: "Go back west" },
  { input: "north", location: "Cellar", notes: "Go north" },
  { input: "east", location: "Troll Room", notes: "Go east to troll room" },
  { input: "south", location: "East-West Passage", notes: "Go south (assuming troll lets us pass or is dead)" },
  { input: "east", location: "Round Room", notes: "Go east" },
  { input: "north", location: "North-South Passage", notes: "Go north" },
  { input: "east", location: "Chasm", notes: "Go east" },
  { input: "northeast", location: "Mirror Room", notes: "Go northeast to mirror room" },
  { input: "take mirror", location: "Mirror Room", notes: "Try to take mirror (size 50) - should fail, too heavy" },
  { input: "inventory", location: "Mirror Room", notes: "Verify inventory unchanged" }
];

async function recordTranscript(): Promise<void> {
  console.log('Recording inventory limits transcript from original game...\n');
  
  const frotz = spawn('frotz', ['COMPILED/zork1.z3']);
  
  let output = '';
  let commandIndex = 0;
  const entries: TranscriptEntry[] = [];
  let currentOutput = '';
  
  frotz.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    currentOutput += text;
    process.stdout.write(text);
    
    // Check if we're at a prompt
    if (text.includes('>') && commandIndex < commands.length) {
      // Wait a bit for any remaining output
      setTimeout(() => {
        const cmd = commands[commandIndex];
        
        // Capture the output for this command
        const lines = currentOutput.split('\n');
        const outputLines: string[] = [];
        let capturing = false;
        
        for (const line of lines) {
          if (line.includes('>')) {
            capturing = true;
            continue;
          }
          if (capturing && line.trim()) {
            outputLines.push(line);
          }
        }
        
        // Store the entry
        if (commandIndex > 0) {
          const prevCmd = commands[commandIndex - 1];
          entries.push({
            command: prevCmd.input,
            expectedOutput: outputLines.join('\n').trim(),
            notes: prevCmd.notes
          });
        }
        
        // Send next command
        console.log(`\n[${commandIndex + 1}/${commands.length}] Sending: ${cmd.input}`);
        frotz.stdin.write(cmd.input + '\n');
        currentOutput = '';
        commandIndex++;
        
        // If this was the last command, wait and then quit
        if (commandIndex === commands.length) {
          setTimeout(() => {
            // Capture last output
            const lines = currentOutput.split('\n');
            const outputLines: string[] = [];
            let capturing = false;
            
            for (const line of lines) {
              if (line.includes('>')) {
                capturing = true;
                continue;
              }
              if (capturing && line.trim()) {
                outputLines.push(line);
              }
            }
            
            entries.push({
              command: cmd.input,
              expectedOutput: outputLines.join('\n').trim(),
              notes: cmd.notes
            });
            
            frotz.stdin.write('quit\n');
            frotz.stdin.write('y\n');
          }, 500);
        }
      }, 100);
    }
  });
  
  frotz.on('close', () => {
    console.log('\n\nGenerating transcript JSON...');
    
    const transcript = {
      id: '41-inventory-limits',
      name: 'Inventory Limits',
      description: 'Testing inventory capacity limits and weight restrictions',
      category: 'edge-case',
      priority: 'medium',
      entries: entries,
      metadata: {
        created: new Date().toISOString(),
        source: 'original-game',
        verified: true
      }
    };
    
    writeFileSync(
      '.kiro/transcripts/medium/41-inventory-limits.json',
      JSON.stringify(transcript, null, 2)
    );
    
    console.log('Transcript saved to .kiro/transcripts/medium/41-inventory-limits.json');
    console.log(`Total commands: ${entries.length}`);
  });
}

recordTranscript().catch(console.error);
