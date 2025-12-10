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
import { GameObjectImpl } from '../src/game/objects.js';
import { ObjectFlag } from '../src/game/data/flags.js';
import { ALL_ROOMS } from '../src/game/data/rooms-complete.js';
import { enableDeterministicRandom, resetDeterministicRandom } from '../src/testing/seededRandom.js';
import { SaveAction, RestoreAction } from '../src/game/actions.js';
import * as fs from 'fs';
import * as path from 'path';

interface StateCheck {
  type: 'flag' | 'object' | 'room' | 'inventory' | 'score';
  target: string;
  expectedValue: any;
}

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
  stateChecks?: StateCheck[];
}

interface Transcript {
  id?: string;
  name: string;
  description: string;
  category?: string;
  priority?: string;
  setupCommands?: string[];
  entries: TranscriptEntry[];
  metadata?: {
    created?: string;
    source?: string;
    verified?: boolean;
  };
}

interface ComparisonResult {
  transcriptId: string;
  passed: boolean;
  totalCommands: number;
  matchedCommands: number;
  exactMatches: number;
  averageSimilarity: number;
  differences: Difference[];
  stateErrors: StateError[];
  executionTime: number;
}

interface Difference {
  commandIndex: number;
  command: string;
  expected: string;
  actual: string;
  expectedNormalized: string;
  actualNormalized: string;
  similarity: number;
  exactMatch: boolean;
  category: 'text' | 'state' | 'error';
  severity: 'critical' | 'major' | 'minor';
}

interface StateError {
  commandIndex: number;
  command: string;
  check: StateCheck;
  actualValue: any;
  message: string;
}

class TranscriptComparator {
  private lexer: Lexer;
  private vocabulary: Vocabulary;
  private parser: Parser;
  private executor: CommandExecutor;
  private lastCommand: string = '';

  constructor() {
    this.lexer = new Lexer();
    this.vocabulary = new Vocabulary();
    this.parser = new Parser(this.vocabulary);
    this.executor = new CommandExecutor();
  }

  /**
   * Get available objects for parsing (in current room, inventory, and open containers)
   */
  private getAvailableObjects(state: GameState): GameObjectImpl[] {
    const available: GameObjectImpl[] = [];
    const addedIds = new Set<string>();

    // Add inventory objects
    for (const objId of state.inventory) {
      if (!addedIds.has(objId)) {
        const obj = state.getObject(objId);
        if (obj) {
          available.push(obj as GameObjectImpl);
          addedIds.add(objId);
          
          // If this is an open container in inventory, add its contents too
          if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.OPENBIT)) {
            const contents = state.getObjectsInContainer(objId);
            for (const contentObj of contents) {
              if (!addedIds.has(contentObj.id)) {
                available.push(contentObj as GameObjectImpl);
                addedIds.add(contentObj.id);
              }
            }
          }
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
            
            // If this is an open container, add its contents too
            if (obj.hasFlag(ObjectFlag.CONTBIT) && obj.hasFlag(ObjectFlag.OPENBIT)) {
              const contents = state.getObjectsInContainer(objId);
              for (const contentObj of contents) {
                if (!addedIds.has(contentObj.id)) {
                  available.push(contentObj as GameObjectImpl);
                  addedIds.add(contentObj.id);
                }
              }
            }
          }
        }
      }
      
      // Add global objects for this room (like TREE, FOREST, etc.)
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

    // Add all global scenery objects (GLOBAL-OBJECTS with NDESCBIT flag)
    for (const [objId, obj] of state.objects.entries()) {
      if (!addedIds.has(objId) && obj.location === null && obj.hasFlag(ObjectFlag.NDESCBIT)) {
        available.push(obj as GameObjectImpl);
        addedIds.add(objId);
      }
    }

    return available;
  }

  /**
   * Execute a command and return the output
   */
  private executeCommand(command: string, state: GameState): string {
    try {
      // Handle debug commands for setup
      if (command.startsWith('teleport ')) {
        const roomId = command.substring(9).trim();
        state.currentRoom = roomId;
        return `[DEBUG: Teleported to ${roomId}]`;
      }
      
      if (command.startsWith('give ') && !command.includes(' to ')) {
        // Debug command: "give OBJECTID" (not "give X to Y")
        const objectId = command.substring(5).trim();
        const obj = state.getObject(objectId);
        if (obj) {
          state.moveObject(objectId, 'PLAYER');
          return `[DEBUG: Given ${objectId}]`;
        }
        return `[DEBUG: Object ${objectId} not found]`;
      }
      
      if (command.startsWith('turnoff ')) {
        const objectId = command.substring(8).trim();
        const obj = state.getObject(objectId) as GameObjectImpl;
        if (obj) {
          obj.removeFlag(ObjectFlag.ONBIT);
          return `[DEBUG: Turned off ${objectId}]`;
        }
        return `[DEBUG: Object ${objectId} not found]`;
      }
      
      if (command.startsWith('turnon ')) {
        const objectId = command.substring(7).trim();
        const obj = state.getObject(objectId) as GameObjectImpl;
        if (obj) {
          obj.addFlag(ObjectFlag.ONBIT);
          return `[DEBUG: Turned on ${objectId}]`;
        }
        return `[DEBUG: Object ${objectId} not found]`;
      }
      
      if (command.startsWith('set ')) {
        const parts = command.substring(4).trim().split(' ');
        if (parts.length === 2) {
          const flagName = parts[0];
          const value = parts[1] === 'true';
          state.setFlag(flagName, value);
          return `[DEBUG: Set ${flagName} to ${value}]`;
        }
        return `[DEBUG: Invalid set command format. Use: set FLAG_NAME true/false]`;
      }
      
      // Split input into multiple commands (separated by periods or 'then')
      const commands = this.splitMultipleCommands(command);
      
      // Process each command sequentially and accumulate output
      const outputs: string[] = [];
      for (let i = 0; i < commands.length; i++) {
        const isLastCommand = i === commands.length - 1;
        const output = this.executeSingleCommand(commands[i].trim(), state, isLastCommand);
        if (output) {
          outputs.push(output);
        }
      }
      
      return outputs.join('\n');
    } catch (error) {
      return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Split input into multiple commands based on periods and 'then'
   */
  private splitMultipleCommands(input: string): string[] {
    // First, split on periods (but not periods within quotes)
    const commands: string[] = [];
    let currentCommand = '';
    let inQuotes = false;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
        currentCommand += char;
      } else if (char === '.' && !inQuotes) {
        // Period found outside quotes - split here
        if (currentCommand.trim().length > 0) {
          commands.push(currentCommand.trim());
        }
        currentCommand = '';
      } else {
        currentCommand += char;
      }
    }
    
    // Add the last command if any
    if (currentCommand.trim().length > 0) {
      commands.push(currentCommand.trim());
    }
    
    // Now split each command on 'then' (case-insensitive)
    const finalCommands: string[] = [];
    for (const cmd of commands) {
      // Split on 'then' as a separate word
      const thenSplit = cmd.split(/\s+then\s+/i);
      for (const part of thenSplit) {
        if (part.trim().length > 0) {
          finalCommands.push(part.trim());
        }
      }
    }
    
    return finalCommands.length > 0 ? finalCommands : [input];
  }

  /**
   * Execute a single command (after splitting multi-commands)
   * @param command - The command to execute
   * @param state - The game state
   * @param isLastCommand - Whether this is the last command in a multi-command sequence
   */
  private executeSingleCommand(command: string, state: GameState, isLastCommand: boolean = true): string {
    // Handle 'again' command - repeat last command
    const normalizedCommand = command.trim().toLowerCase();
    if (normalizedCommand === 'again' || normalizedCommand === 'g') {
      if (!this.lastCommand) {
        return "There is no command to repeat.";
      }
      // Recursively execute the last command
      return this.executeSingleCommand(this.lastCommand, state, isLastCommand);
    }

    // Handle pending actions (SAVE/RESTORE waiting for filename)
    if (state.pendingAction) {
      const pendingType = state.pendingAction.type;
      const handler = pendingType === 'SAVE' ? new SaveAction() : new RestoreAction();
      
      // Treat the entire input as the filename
      const result = handler.execute(state, command.trim());
      
      return result.message || '';
    }

    // Handle "look at X" as "examine X"
    let processedCommand = command;
    if (/^look\s+at\s+/i.test(command)) {
      processedCommand = command.replace(/^look\s+at\s+/i, 'examine ');
    }

    // Tokenize
    const tokens = this.lexer.tokenize(processedCommand);
    
    // Process with vocabulary
    const processedTokens = tokens.map(token => {
      const expandedWord = this.vocabulary.expandAbbreviation(token.word);
      return {
        ...token,
        word: expandedWord,
        type: this.vocabulary.lookupWord(expandedWord),
      };
    });

    // Special handling for SAY and ECHO commands that can take any text
    const firstToken = processedTokens[0];
    if (firstToken && (firstToken.word.toUpperCase() === 'SAY' || firstToken.word.toUpperCase() === 'ECHO')) {
      // Create a special command for SAY/ECHO with raw input
      const specialCommand = {
        verb: firstToken.word.toUpperCase(),
        rawInput: processedCommand
      };
      
      // Skip daemons for all but the last command in a multi-command sequence
      const skipDaemons = !isLastCommand;
      const result = this.executor.execute(specialCommand, state, skipDaemons);
      
      // Save this command as last command if it was successful
      if (result.success && normalizedCommand !== 'again' && normalizedCommand !== 'g') {
        this.lastCommand = command;
      }
      
      return result.message || '';
    }

    // Special handling for "wake up" command
    if (processedCommand.toLowerCase().trim() === 'wake up') {
      const specialCommand = {
        verb: 'WAKE'
      };
      
      // Skip daemons for all but the last command in a multi-command sequence
      const skipDaemons = !isLastCommand;
      const result = this.executor.execute(specialCommand, state, skipDaemons);
      
      // Save this command as last command if it was successful
      if (result.success && normalizedCommand !== 'again' && normalizedCommand !== 'g') {
        this.lastCommand = command;
      }
      
      return result.message || '';
    }

    // Parse - use getAvailableObjects to include open container contents
    const availableObjects = this.getAvailableObjects(state);
    const parsedCommand = this.parser.parse(processedTokens, availableObjects);

    // Execute - skip daemons for all but the last command in a multi-command sequence
    const skipDaemons = !isLastCommand;
    const result = this.executor.execute(parsedCommand, state, skipDaemons);

    // Save this command as last command if it was successful and not 'again'
    if (result.success && normalizedCommand !== 'again' && normalizedCommand !== 'g') {
      this.lastCommand = command;
    }

    return result.message || '';
  }

  /**
   * Normalize whitespace in a string for comparison
   * Only normalizes whitespace - no other variations allowed
   */
  private normalizeWhitespace(str: string): string {
    return str
      .trim()
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')     // Normalize line endings
      .replace(/[ \t]+/g, ' ')  // Normalize spaces and tabs to single space
      .replace(/\n +/g, '\n')   // Remove leading spaces on lines
      .replace(/ +\n/g, '\n')   // Remove trailing spaces on lines
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple blank lines to max 2
  }

  /**
   * Check if two strings match exactly after whitespace normalization
   */
  private exactMatch(str1: string, str2: string): boolean {
    const norm1 = this.normalizeWhitespace(str1);
    const norm2 = this.normalizeWhitespace(str2);
    return norm1 === norm2;
  }

  /**
   * Calculate similarity between two strings (0-1)
   * Character-by-character comparison after normalization
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const norm1 = this.normalizeWhitespace(str1);
    const norm2 = this.normalizeWhitespace(str2);

    if (norm1 === norm2) return 1.0;

    // Character-level similarity
    const maxLen = Math.max(norm1.length, norm2.length);
    if (maxLen === 0) return 1.0;

    let matches = 0;
    const minLen = Math.min(norm1.length, norm2.length);
    
    for (let i = 0; i < minLen; i++) {
      if (norm1[i] === norm2[i]) matches++;
    }

    return matches / maxLen;
  }

  /**
   * Verify game state matches expected state
   */
  private verifyState(state: GameState, checks: StateCheck[]): StateError[] {
    const errors: StateError[] = [];

    for (const check of checks) {
      let actualValue: any;
      let matches = false;

      switch (check.type) {
        case 'flag':
          actualValue = state.getFlag(check.target);
          matches = actualValue === check.expectedValue;
          break;
        
        case 'object':
          // Check object property or location
          const obj = state.getObject(check.target);
          if (obj) {
            actualValue = obj;
            matches = JSON.stringify(obj) === JSON.stringify(check.expectedValue);
          }
          break;
        
        case 'room':
          actualValue = state.currentRoom;
          matches = actualValue === check.expectedValue;
          break;
        
        case 'inventory':
          actualValue = state.inventory;
          matches = JSON.stringify(actualValue) === JSON.stringify(check.expectedValue);
          break;
        
        case 'score':
          actualValue = state.score;
          matches = actualValue === check.expectedValue;
          break;
      }

      if (!matches) {
        errors.push({
          commandIndex: -1, // Will be set by caller
          command: '',      // Will be set by caller
          check,
          actualValue,
          message: `State mismatch: ${check.type} '${check.target}' expected ${JSON.stringify(check.expectedValue)}, got ${JSON.stringify(actualValue)}`
        });
      }
    }

    return errors;
  }

  /**
   * Compare game output against a transcript
   */
  public compareTranscript(transcript: Transcript): ComparisonResult {
    const startTime = Date.now();
    
    // Enable deterministic random for consistent combat outcomes
    enableDeterministicRandom(12345);
    
    const state = createInitialGameState();
    const differences: Difference[] = [];
    const stateErrors: StateError[] = [];
    let matchedCommands = 0;
    let exactMatches = 0;
    let totalSimilarity = 0;

    console.log(`\n=== Comparing Transcript: ${transcript.name} ===`);
    console.log(`Description: ${transcript.description}`);
    console.log(`Deterministic Mode: ENABLED (seed: 12345)\n`);

    // Execute setup commands if provided
    if (transcript.setupCommands && transcript.setupCommands.length > 0) {
      console.log(`=== Running Setup Commands ===`);
      for (const setupCmd of transcript.setupCommands) {
        console.log(`  > ${setupCmd}`);
        this.executeCommand(setupCmd, state);
      }
      console.log();
    }

    for (let i = 0; i < transcript.entries.length; i++) {
      const entry = transcript.entries[i];
      
      console.log(`[${i + 1}/${transcript.entries.length}] > ${entry.command}`);

      const actualOutput = this.executeCommand(entry.command, state);
      const isExactMatch = this.exactMatch(entry.expectedOutput, actualOutput);
      const similarity = this.calculateSimilarity(entry.expectedOutput, actualOutput);
      totalSimilarity += similarity;

      if (isExactMatch) {
        exactMatches++;
        matchedCommands++;
        console.log(`  ✓ Exact Match (100%)`);
      } else if (similarity >= 0.98) {
        matchedCommands++;
        console.log(`  ✓ Match (${(similarity * 100).toFixed(1)}% - whitespace only)`);
      } else {
        const severity = similarity < 0.5 ? 'critical' : similarity < 0.8 ? 'major' : 'minor';
        console.log(`  ✗ Difference (${(similarity * 100).toFixed(1)}% similar) [${severity}]`);
        
        differences.push({
          commandIndex: i,
          command: entry.command,
          expected: entry.expectedOutput,
          actual: actualOutput,
          expectedNormalized: this.normalizeWhitespace(entry.expectedOutput),
          actualNormalized: this.normalizeWhitespace(actualOutput),
          similarity,
          exactMatch: isExactMatch,
          category: 'text',
          severity
        });
      }

      // Verify state if checks are provided
      if (entry.stateChecks && entry.stateChecks.length > 0) {
        const errors = this.verifyState(state, entry.stateChecks);
        for (const error of errors) {
          error.commandIndex = i;
          error.command = entry.command;
          stateErrors.push(error);
          console.log(`  ⚠ State Error: ${error.message}`);
        }
      }

      if (entry.notes) {
        console.log(`  Note: ${entry.notes}`);
      }
    }

    const executionTime = Date.now() - startTime;
    const averageSimilarity = transcript.entries.length > 0 
      ? totalSimilarity / transcript.entries.length 
      : 0;
    const passed = differences.length === 0 && stateErrors.length === 0;
    
    console.log(`\n=== Results ===`);
    console.log(`Total commands: ${transcript.entries.length}`);
    console.log(`Exact matches: ${exactMatches} (${((exactMatches / transcript.entries.length) * 100).toFixed(1)}%)`);
    console.log(`Matched (≥98%): ${matchedCommands} (${((matchedCommands / transcript.entries.length) * 100).toFixed(1)}%)`);
    console.log(`Average similarity: ${(averageSimilarity * 100).toFixed(1)}%`);
    console.log(`Text differences: ${differences.length}`);
    console.log(`State errors: ${stateErrors.length}`);
    console.log(`Execution time: ${executionTime}ms`);
    console.log(`Status: ${passed ? '✓ PASSED' : '✗ FAILED'}\n`);

    return {
      transcriptId: transcript.id || transcript.name,
      passed,
      totalCommands: transcript.entries.length,
      matchedCommands,
      exactMatches,
      averageSimilarity,
      differences,
      stateErrors,
      executionTime
    };
  }

  /**
   * Generate side-by-side comparison of two strings
   */
  private generateSideBySide(expected: string, actual: string, width: number = 40): string[] {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const maxLines = Math.max(expectedLines.length, actualLines.length);
    const result: string[] = [];

    for (let i = 0; i < maxLines; i++) {
      const expLine = (expectedLines[i] || '').padEnd(width).substring(0, width);
      const actLine = (actualLines[i] || '').padEnd(width).substring(0, width);
      const marker = expLine.trim() === actLine.trim() ? ' ' : '│';
      result.push(`${expLine} ${marker} ${actLine}`);
    }

    return result;
  }

  /**
   * Highlight character differences between two strings
   */
  private highlightDifferences(str1: string, str2: string): string {
    const norm1 = this.normalizeWhitespace(str1);
    const norm2 = this.normalizeWhitespace(str2);
    
    const maxLen = Math.max(norm1.length, norm2.length);
    let result = '';
    
    for (let i = 0; i < maxLen; i++) {
      const c1 = norm1[i] || '';
      const c2 = norm2[i] || '';
      
      if (c1 === c2) {
        result += c1;
      } else {
        result += `[${c1 || '∅'}→${c2 || '∅'}]`;
      }
    }
    
    return result;
  }

  /**
   * Categorize difference type
   */
  private categorizeDifference(diff: Difference): string {
    const norm1 = this.normalizeWhitespace(diff.expected);
    const norm2 = this.normalizeWhitespace(diff.actual);

    if (norm1 === norm2) {
      return 'Whitespace only';
    }

    if (norm1.toLowerCase() === norm2.toLowerCase()) {
      return 'Case difference';
    }

    if (norm1.replace(/[.,!?;:]/g, '') === norm2.replace(/[.,!?;:]/g, '')) {
      return 'Punctuation difference';
    }

    const words1 = norm1.split(/\s+/);
    const words2 = norm2.split(/\s+/);
    
    if (words1.length !== words2.length) {
      return `Word count difference (${words1.length} vs ${words2.length})`;
    }

    const commonWords = words1.filter((w, i) => w === words2[i]).length;
    const wordSimilarity = commonWords / words1.length;

    if (wordSimilarity > 0.8) {
      return 'Minor word differences';
    } else if (wordSimilarity > 0.5) {
      return 'Moderate word differences';
    } else {
      return 'Major content difference';
    }
  }

  /**
   * Print detailed differences with side-by-side comparison
   */
  public printDifferences(differences: Difference[], stateErrors?: StateError[]): void {
    if (differences.length === 0 && (!stateErrors || stateErrors.length === 0)) {
      console.log('No differences found!');
      return;
    }

    console.log('\n' + '='.repeat(80));
    console.log('DETAILED DIFFERENCE REPORT');
    console.log('='.repeat(80) + '\n');

    // Print text differences
    if (differences.length > 0) {
      console.log(`Found ${differences.length} text difference(s):\n`);

      for (const diff of differences) {
        console.log('─'.repeat(80));
        console.log(`Command ${diff.commandIndex + 1}: "${diff.command}"`);
        console.log(`Severity: ${diff.severity.toUpperCase()}`);
        console.log(`Similarity: ${(diff.similarity * 100).toFixed(1)}%`);
        console.log(`Exact Match: ${diff.exactMatch ? 'Yes' : 'No'}`);
        console.log(`Category: ${this.categorizeDifference(diff)}`);
        console.log();

        // Side-by-side comparison
        console.log('Side-by-Side Comparison:');
        console.log('Expected'.padEnd(40) + ' │ ' + 'Actual');
        console.log('─'.repeat(40) + '─┼─' + '─'.repeat(40));
        
        const sideBySide = this.generateSideBySide(diff.expected, diff.actual);
        for (const line of sideBySide) {
          console.log(line);
        }
        console.log();

        // Show normalized versions
        console.log('Normalized Expected:');
        console.log(diff.expectedNormalized);
        console.log();
        console.log('Normalized Actual:');
        console.log(diff.actualNormalized);
        console.log();

        // Character-level differences (for short strings)
        if (diff.expectedNormalized.length < 200 && diff.actualNormalized.length < 200) {
          console.log('Character Differences:');
          console.log(this.highlightDifferences(diff.expected, diff.actual));
          console.log();
        }
      }
    }

    // Print state errors
    if (stateErrors && stateErrors.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log(`Found ${stateErrors.length} state error(s):\n`);

      for (const error of stateErrors) {
        console.log('─'.repeat(80));
        console.log(`Command ${error.commandIndex + 1}: "${error.command}"`);
        console.log(`Check Type: ${error.check.type}`);
        console.log(`Target: ${error.check.target}`);
        console.log(`Expected: ${JSON.stringify(error.check.expectedValue, null, 2)}`);
        console.log(`Actual: ${JSON.stringify(error.actualValue, null, 2)}`);
        console.log(`Message: ${error.message}`);
        console.log();
      }
    }

    console.log('='.repeat(80) + '\n');
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
    
    if (result.differences.length > 0 || result.stateErrors.length > 0) {
      comparator.printDifferences(result.differences, result.stateErrors);
    }

    process.exit(result.passed ? 0 : 1);
  }

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  npx tsx scripts/compare-transcript.ts <transcript-file.json>');
    console.log('  npx tsx scripts/compare-transcript.ts --example');
    console.log('  npx tsx scripts/compare-transcript.ts --interactive');
    console.log('\nTranscript file format:');
    console.log(JSON.stringify(EXAMPLE_TRANSCRIPT, null, 2));
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  // Load and compare transcript from file
  const transcriptPath = args[0];
  
  if (!fs.existsSync(transcriptPath)) {
    console.error(`Error: Transcript file not found: ${transcriptPath}`);
    process.exit(1);
  }

  const transcript = comparator.loadTranscript(transcriptPath);
  const result = comparator.compareTranscript(transcript);

  if (result.differences.length > 0 || result.stateErrors.length > 0) {
    comparator.printDifferences(result.differences, result.stateErrors);
  }

  process.exit(result.passed ? 0 : 1);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
