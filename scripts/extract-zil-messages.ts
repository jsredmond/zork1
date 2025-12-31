#!/usr/bin/env tsx
/**
 * Extract all text messages from ZIL source files
 * This helps validate that our TypeScript implementation has the correct messages
 */

import * as fs from 'fs';
import * as path from 'path';

interface ZilMessage {
  file: string;
  line: number;
  context: string;
  message: string;
  type: 'TELL' | 'JIGS-UP' | 'DESC' | 'LDESC' | 'TEXT' | 'FDESC';
  object?: string;        // Associated object (if any)
  verb?: string;          // Associated verb (if any)
  condition?: string;     // Any conditional logic
}

/**
 * Check if a line is a comment
 */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith(';') || trimmed.startsWith('"');
}

/**
 * Extract messages from a ZIL file
 */
function extractMessagesFromFile(filePath: string): ZilMessage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const messages: ZilMessage[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip comment lines
    if (isCommentLine(line)) {
      continue;
    }
    
    // Extract TELL messages
    if (line.includes('<TELL')) {
      const message = extractTellMessage(lines, i);
      if (message) {
        const contextInfo = getContextWithDetails(lines, i);
        messages.push({
          file: path.basename(filePath),
          line: lineNum,
          context: contextInfo.context,
          message: message,
          type: 'TELL',
          object: contextInfo.object,
          verb: contextInfo.verb,
          condition: contextInfo.condition
        });
      }
    }
    
    // Extract JIGS-UP messages (death messages)
    if (line.includes('<JIGS-UP')) {
      const message = extractJigsUpMessage(lines, i);
      if (message) {
        const contextInfo = getContextWithDetails(lines, i);
        messages.push({
          file: path.basename(filePath),
          line: lineNum,
          context: contextInfo.context,
          message: message,
          type: 'JIGS-UP',
          object: contextInfo.object,
          verb: contextInfo.verb,
          condition: contextInfo.condition
        });
      }
    }
    
    // Extract object/room descriptions
    if (line.includes('(DESC ')) {
      const message = extractQuotedString(line);
      if (message) {
        const contextInfo = getContextWithDetails(lines, i);
        messages.push({
          file: path.basename(filePath),
          line: lineNum,
          context: contextInfo.context,
          message: message,
          type: 'DESC',
          object: contextInfo.object
        });
      }
    }
    
    if (line.includes('(LDESC ')) {
      const message = extractQuotedString(line);
      if (message) {
        const contextInfo = getContextWithDetails(lines, i);
        messages.push({
          file: path.basename(filePath),
          line: lineNum,
          context: contextInfo.context,
          message: message,
          type: 'LDESC',
          object: contextInfo.object
        });
      }
    }
  }
  
  return messages;
}

/**
 * Extract a TELL message that may span multiple lines
 */
function extractTellMessage(lines: string[], startIndex: number): string | null {
  let message = '';
  let inMessage = false;
  let depth = 0;
  
  for (let i = startIndex; i < lines.length && i < startIndex + 30; i++) {
    const line = lines[i];
    
    if (line.includes('<TELL')) {
      inMessage = true;
      depth = 1;
      // Check if message starts on same line
      const match = line.match(/<TELL\s+"([^"]+)"/);
      if (match) {
        message = match[1];
        // Check if TELL ends on same line
        if (line.includes('CR>') && !line.match(/<TELL[^>]*>/g)?.some((_, idx) => idx > 0)) {
          break;
        }
        continue;
      }
    }
    
    if (inMessage) {
      // Track nesting depth
      const opens = (line.match(/<[A-Z-]+/g) || []).length;
      const closes = (line.match(/>/g) || []).length;
      depth += opens - closes;
      
      // Extract all quoted strings on this line
      const matches = line.matchAll(/"([^"]+)"/g);
      for (const match of matches) {
        if (message && !message.endsWith(' ') && !match[1].startsWith(' ')) {
          message += ' ';
        }
        message += match[1];
      }
      
      // Check for end of TELL
      if (depth <= 0 || line.includes('CR>')) {
        break;
      }
    }
  }
  
  return message ? cleanMessage(message) : null;
}

/**
 * Extract JIGS-UP message (death message) that may span multiple lines
 */
function extractJigsUpMessage(lines: string[], startIndex: number): string | null {
  let message = '';
  let inMessage = false;
  
  for (let i = startIndex; i < lines.length && i < startIndex + 20; i++) {
    const line = lines[i];
    
    if (line.includes('<JIGS-UP')) {
      inMessage = true;
      // Check if message starts on same line
      const match = line.match(/<JIGS-UP\s+"([^"]+)"/);
      if (match) {
        message = match[1];
        // Check if it ends on same line
        if (line.includes('>)') || (line.match(/>/g) || []).length >= 2) {
          break;
        }
        continue;
      }
    }
    
    if (inMessage) {
      // Extract quoted strings
      const matches = line.matchAll(/"([^"]+)"/g);
      for (const match of matches) {
        if (message && !message.endsWith(' ')) {
          message += ' ';
        }
        message += match[1];
      }
      
      // Check for end of JIGS-UP
      if (line.includes('>)') || line.match(/>/g)?.length >= 1) {
        break;
      }
    }
  }
  
  return message ? cleanMessage(message) : null;
}

/**
 * Extract a quoted string from a line
 */
function extractQuotedString(line: string): string | null {
  const match = line.match(/"([^"]+)"/);
  return match ? cleanMessage(match[1]) : null;
}

/**
 * Get context (function/object name) for a message
 */
function getContext(lines: string[], index: number): string {
  // Look backwards for ROUTINE, OBJECT, or ROOM definition
  for (let i = index; i >= Math.max(0, index - 50); i--) {
    const line = lines[i];
    
    const routineMatch = line.match(/<ROUTINE\s+([A-Z0-9-]+)/);
    if (routineMatch) return `ROUTINE ${routineMatch[1]}`;
    
    const objectMatch = line.match(/<OBJECT\s+([A-Z0-9-]+)/);
    if (objectMatch) return `OBJECT ${objectMatch[1]}`;
    
    const roomMatch = line.match(/<ROOM\s+([A-Z0-9-]+)/);
    if (roomMatch) return `ROOM ${roomMatch[1]}`;
  }
  
  return 'UNKNOWN';
}

/**
 * Get detailed context including object, verb, and conditions
 */
function getContextWithDetails(lines: string[], index: number): {
  context: string;
  object?: string;
  verb?: string;
  condition?: string;
} {
  const context = getContext(lines, index);
  let object: string | undefined;
  let verb: string | undefined;
  let condition: string | undefined;
  
  // Extract object from context
  if (context.startsWith('OBJECT ')) {
    object = context.substring(7);
  } else if (context.startsWith('ROOM ')) {
    object = context.substring(5);
  } else if (context.startsWith('ROUTINE ')) {
    const routineName = context.substring(8);
    // Extract object from routine name (e.g., BOARD-F -> BOARD)
    if (routineName.endsWith('-F')) {
      object = routineName.substring(0, routineName.length - 2);
    } else if (routineName.includes('-')) {
      // Try to extract object from compound names
      const parts = routineName.split('-');
      if (parts.length >= 2) {
        object = parts[0];
      }
    }
  }
  
  // Extract verb from nearby VERB? checks
  for (let i = Math.max(0, index - 10); i <= Math.min(lines.length - 1, index + 5); i++) {
    const line = lines[i];
    const verbMatch = line.match(/<VERB\?\s+([A-Z0-9-]+)/);
    if (verbMatch) {
      verb = verbMatch[1];
      break;
    }
  }
  
  // Extract conditions from nearby COND, EQUAL?, FSET? statements
  const conditions: string[] = [];
  for (let i = Math.max(0, index - 15); i <= index; i++) {
    const line = lines[i];
    
    // Check for EQUAL? conditions
    const equalMatch = line.match(/<EQUAL\?\s+([^>]+)>/);
    if (equalMatch) {
      conditions.push(`EQUAL? ${equalMatch[1].trim()}`);
    }
    
    // Check for FSET? conditions
    const fsetMatch = line.match(/<FSET\?\s+([^>]+)>/);
    if (fsetMatch) {
      conditions.push(`FSET? ${fsetMatch[1].trim()}`);
    }
    
    // Check for FCLEAR? conditions
    const fclearMatch = line.match(/<FCLEAR\?\s+([^>]+)>/);
    if (fclearMatch) {
      conditions.push(`FCLEAR? ${fclearMatch[1].trim()}`);
    }
    
    // Check for IN? conditions
    const inMatch = line.match(/<IN\?\s+([^>]+)>/);
    if (inMatch) {
      conditions.push(`IN? ${inMatch[1].trim()}`);
    }
  }
  
  if (conditions.length > 0) {
    condition = conditions.join(' AND ');
  }
  
  return { context, object, verb, condition };
}

/**
 * Clean up message text
 */
function cleanMessage(msg: string): string {
  return msg
    .replace(/\|/g, '\n')  // ZIL uses | for newlines
    .replace(/\\"/g, '"')   // Unescape quotes
    .trim();
}

/**
 * Main extraction function
 */
function main() {
  const zilFiles = [
    '1dungeon.zil',
    '1actions.zil',
    'gglobals.zil',
    'gmain.zil',
    'gverbs.zil',
    'gparser.zil'
  ];
  
  const allMessages: ZilMessage[] = [];
  
  // ZIL files are in reference/zil/ directory
  const zilDir = path.join(process.cwd(), 'reference', 'zil');
  
  for (const file of zilFiles) {
    const filePath = path.join(zilDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Extracting messages from ${file}...`);
      const messages = extractMessagesFromFile(filePath);
      allMessages.push(...messages);
      console.log(`  Found ${messages.length} messages`);
    } else {
      console.log(`  Skipping ${file} (not found)`);
    }
  }
  
  console.log(`\nTotal messages extracted: ${allMessages.length}`);
  
  // Group by type
  const byType = allMessages.reduce((acc, msg) => {
    acc[msg.type] = (acc[msg.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nMessages by type:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }
  
  // Save to JSON for analysis
  const outputPath = path.join(process.cwd(), '.kiro/testing/zil-messages.json');
  fs.writeFileSync(outputPath, JSON.stringify(allMessages, null, 2));
  console.log(`\nMessages saved to: ${outputPath}`);
  
  // Generate a sample report
  console.log('\n=== Sample Messages ===\n');
  allMessages.slice(0, 10).forEach(msg => {
    console.log(`[${msg.type}] ${msg.context} (${msg.file}:${msg.line})`);
    console.log(`  "${msg.message}"`);
    console.log();
  });
}

main();
