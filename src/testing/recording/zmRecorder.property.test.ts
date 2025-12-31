/**
 * Property-Based Tests for Z-Machine Game Recorder
 * 
 * These tests verify universal properties that should hold for all valid inputs.
 * Property 4: Cross-Platform Recording Consistency
 * 
 * **Validates: Requirements 2.1, 2.2**
 */

import { describe, it, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { existsSync } from 'fs';
import { TypeScriptRecorder } from './tsRecorder.js';
import { ZMachineRecorder } from './zmRecorder.js';
import { ZMachineConfig } from './types.js';

// Longer timeout for Z-machine tests (each iteration spawns a process)
const ZM_TEST_TIMEOUT = 120000;  // 2 minutes

// Fewer iterations for Z-machine tests due to process overhead
const ZM_NUM_RUNS = 10;

/**
 * Generator for valid game commands that work in both implementations
 * These are deterministic commands that don't involve combat or random events
 */
const deterministicCommandArb = fc.oneof(
  // Movement commands
  fc.constantFrom('north', 'south', 'east', 'west', 'n', 's', 'e', 'w'),
  // Basic verbs that produce consistent output
  fc.constantFrom('look', 'inventory', 'score'),
  // Object interactions at game start
  fc.constantFrom('open mailbox', 'take leaflet', 'read leaflet', 'examine mailbox')
);

/**
 * Generator for short command sequences (to keep tests fast)
 */
const shortCommandSequenceArb = fc.array(deterministicCommandArb, { minLength: 1, maxLength: 5 });

/**
 * Find the dfrotz interpreter if available
 */
function findDfrotz(): string | null {
  const paths = [
    '/usr/local/bin/dfrotz',
    '/usr/bin/dfrotz',
    '/opt/homebrew/bin/dfrotz'
  ];
  
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

describe('ZMachineRecorder Property Tests', () => {
  let interpreterPath: string | null = null;
  let zmAvailable = false;

  beforeAll(async () => {
    interpreterPath = findDfrotz();
    const gameFileExists = existsSync('reference/COMPILED/zork1.z3');
    
    if (interpreterPath && gameFileExists) {
      const config: ZMachineConfig = {
        interpreterPath,
        gameFilePath: 'reference/COMPILED/zork1.z3',
        timeout: 5000
      };
      const testRecorder = new ZMachineRecorder(config);
      zmAvailable = await testRecorder.isAvailable();
    }
  });

  /**
   * Create fresh recorder instances for each property test iteration
   * This ensures no state pollution between tests
   */
  function createRecorders(): { tsRecorder: TypeScriptRecorder; zmRecorder: ZMachineRecorder } {
    const tsRecorder = new TypeScriptRecorder();
    const zmRecorder = new ZMachineRecorder({
      interpreterPath: interpreterPath!,
      gameFilePath: 'reference/COMPILED/zork1.z3',
      timeout: 5000
    });
    return { tsRecorder, zmRecorder };
  }

  /**
   * Feature: game-recording-comparison, Property 4: Cross-Platform Recording Consistency
   * 
   * For any command sequence executed against both the TypeScript engine and Z-Machine
   * interpreter, both resulting transcripts SHALL have the same structure (same number
   * of entries, same command ordering) regardless of output content differences.
   * 
   * **Validates: Requirements 2.1, 2.2**
   */
  it('Property 4: Cross-Platform Recording Consistency - transcripts have same structure', { timeout: ZM_TEST_TIMEOUT }, async () => {
    // Skip if Z-machine interpreter not available
    if (!zmAvailable || !interpreterPath) {
      console.log('Skipping Property 4 test: Z-machine interpreter not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(shortCommandSequenceArb, async (commands) => {
        // Create fresh recorders for each iteration
        const { tsRecorder, zmRecorder } = createRecorders();
        
        // Record with TypeScript engine
        const tsTranscript = await tsRecorder.record(commands);
        
        // Record with Z-machine interpreter
        const zmTranscript = await zmRecorder.record(commands);

        // Both transcripts should have the same number of entries
        // (initial state + one per command)
        if (tsTranscript.entries.length !== zmTranscript.entries.length) {
          return false;
        }

        // Both should have commands.length + 1 entries
        if (tsTranscript.entries.length !== commands.length + 1) {
          return false;
        }

        // Entry indices should match
        for (let i = 0; i < tsTranscript.entries.length; i++) {
          if (tsTranscript.entries[i].index !== zmTranscript.entries[i].index) {
            return false;
          }
        }

        // Commands should match (except for initial state which has empty command)
        for (let i = 1; i < tsTranscript.entries.length; i++) {
          if (tsTranscript.entries[i].command !== zmTranscript.entries[i].command) {
            return false;
          }
        }

        // Both should have the correct source type
        if (tsTranscript.source !== 'typescript') {
          return false;
        }
        if (zmTranscript.source !== 'z-machine') {
          return false;
        }

        return true;
      }),
      { numRuns: ZM_NUM_RUNS }
    );
  });

  /**
   * Feature: game-recording-comparison, Property 4 (continued): Entry Structure Consistency
   * 
   * For any command, both recorders SHALL produce entries with the same required fields
   * (index, command, output, turnNumber).
   * 
   * **Validates: Requirements 2.1, 2.2**
   */
  it('Property 4 (continued): Both recorders produce entries with required fields', { timeout: ZM_TEST_TIMEOUT }, async () => {
    // Skip if Z-machine interpreter not available
    if (!zmAvailable || !interpreterPath) {
      console.log('Skipping Property 4 continued test: Z-machine interpreter not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(deterministicCommandArb, async (command) => {
        // Create fresh recorders for each iteration
        const { tsRecorder, zmRecorder } = createRecorders();
        
        // Record single command with both recorders
        const tsTranscript = await tsRecorder.record([command]);
        const zmTranscript = await zmRecorder.record([command]);

        // Check TypeScript entry structure
        const tsEntry = tsTranscript.entries[1];
        if (typeof tsEntry.index !== 'number') return false;
        if (typeof tsEntry.command !== 'string') return false;
        if (typeof tsEntry.output !== 'string') return false;
        if (typeof tsEntry.turnNumber !== 'number') return false;

        // Check Z-machine entry structure
        const zmEntry = zmTranscript.entries[1];
        if (typeof zmEntry.index !== 'number') return false;
        if (typeof zmEntry.command !== 'string') return false;
        if (typeof zmEntry.output !== 'string') return false;
        if (typeof zmEntry.turnNumber !== 'number') return false;

        // Both should have non-empty output
        if (tsEntry.output.length === 0) return false;
        if (zmEntry.output.length === 0) return false;

        return true;
      }),
      { numRuns: ZM_NUM_RUNS }
    );
  });

  /**
   * Feature: game-recording-comparison, Property 4 (continued): Metadata Consistency
   * 
   * Both recorders SHALL produce transcripts with valid metadata including source
   * identification and timing information.
   * 
   * **Validates: Requirements 2.1, 2.2**
   */
  it('Property 4 (continued): Both recorders produce valid metadata', { timeout: ZM_TEST_TIMEOUT }, async () => {
    // Skip if Z-machine interpreter not available
    if (!zmAvailable || !interpreterPath) {
      console.log('Skipping Property 4 metadata test: Z-machine interpreter not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(shortCommandSequenceArb, async (commands) => {
        // Create fresh recorders for each iteration
        const { tsRecorder, zmRecorder } = createRecorders();
        
        const tsTranscript = await tsRecorder.record(commands);
        const zmTranscript = await zmRecorder.record(commands);

        // Both should have valid IDs
        if (!tsTranscript.id || tsTranscript.id.length === 0) return false;
        if (!zmTranscript.id || zmTranscript.id.length === 0) return false;

        // IDs should be different (different sources)
        if (tsTranscript.id === zmTranscript.id) return false;

        // Both should have valid timestamps
        if (!(tsTranscript.startTime instanceof Date)) return false;
        if (!(tsTranscript.endTime instanceof Date)) return false;
        if (!(zmTranscript.startTime instanceof Date)) return false;
        if (!(zmTranscript.endTime instanceof Date)) return false;

        // End time should be >= start time
        if (tsTranscript.endTime < tsTranscript.startTime) return false;
        if (zmTranscript.endTime < zmTranscript.startTime) return false;

        return true;
      }),
      { numRuns: ZM_NUM_RUNS }
    );
  });
});
