/**
 * TypeScript Game Recorder
 * 
 * Records game sessions from the TypeScript Zork I implementation.
 * Captures all output including room descriptions and messages.
 * Supports deterministic random seeding for reproducible recordings.
 */

import { GameState } from '../../game/state.js';
import { Parser } from '../../parser/parser.js';
import { Vocabulary } from '../../parser/vocabulary.js';
import { CommandExecutor } from '../../engine/executor.js';
import { createInitialGameState } from '../../game/factories/gameFactory.js';
import { 
  Transcript, 
  TranscriptEntry, 
  RecordingOptions 
} from './types.js';

/**
 * Abstract base class for game recorders
 */
export abstract class GameRecorder {
  /**
   * Record a game session with the given commands
   * @param commands - Array of commands to execute
   * @param options - Recording options
   * @returns Promise resolving to a Transcript
   */
  abstract record(commands: string[], options?: RecordingOptions): Promise<Transcript>;

  /**
   * Check if this recorder is available for use
   * @returns Promise resolving to true if available
   */
  abstract isAvailable(): Promise<boolean>;
}

/**
 * TypeScriptRecorder records sessions from the TypeScript game engine.
 * 
 * Features:
 * - Creates fresh game state for each recording
 * - Supports deterministic random seeding
 * - Captures all output including room descriptions
 * - Handles errors gracefully and continues recording
 */
export class TypeScriptRecorder extends GameRecorder {
  private vocabulary: Vocabulary;

  constructor() {
    super();
    this.vocabulary = new Vocabulary();
  }

  /**
   * Record a game session with the given commands
   * 
   * @param commands - Array of commands to execute
   * @param options - Recording options including seed for deterministic behavior
   * @returns Promise resolving to a complete Transcript
   */
  async record(commands: string[], options?: RecordingOptions): Promise<Transcript> {
    const startTime = new Date();
    const entries: TranscriptEntry[] = [];

    // Create fresh game state
    const state = createInitialGameState();
    
    // Set seed on game state if provided for deterministic random
    if (options?.seed !== undefined) {
      state.setSeed(options.seed);
    }

    const parser = new Parser(this.vocabulary);
    const executor = new CommandExecutor();

    // Get initial room description (turn 0)
    const initialOutput = this.getInitialOutput(state);
    entries.push({
      index: 0,
      command: '',  // No command for initial state
      output: initialOutput,
      timestamp: options?.captureTimestamps ? Date.now() : undefined,
      turnNumber: 0
    });

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const turnNumber = state.moves + 1;
      
      let output: string;
      try {
        output = this.executeCommand(command, state, parser, executor);
      } catch (error) {
        // Capture error message and continue recording
        output = this.formatError(error);
      }

      entries.push({
        index: i + 1,  // +1 because index 0 is initial state
        command,
        output: options?.preserveFormatting ? output : output,
        timestamp: options?.captureTimestamps ? Date.now() : undefined,
        turnNumber
      });
    }

    const endTime = new Date();

    // Generate unique ID for this transcript
    const id = this.generateTranscriptId(startTime, options?.seed);

    return {
      id,
      source: 'typescript',
      startTime,
      endTime,
      entries,
      metadata: {
        seed: options?.seed,
        gameVersion: '1.0.0'
      }
    };
  }

  /**
   * TypeScript recorder is always available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Get the initial game output (room description at start)
   */
  private getInitialOutput(state: GameState): string {
    const room = state.getCurrentRoom();
    if (!room) {
      return 'Error: No current room';
    }

    // Build initial output similar to game start
    const lines: string[] = [];
    lines.push('ZORK I: The Great Underground Empire');
    lines.push('Copyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.');
    lines.push('ZORK is a registered trademark of Infocom, Inc.');
    lines.push('Revision 88 / Serial number 840726');
    lines.push('');
    lines.push(room.name);
    lines.push(room.description);

    return lines.join('\n');
  }

  /**
   * Execute a single command and capture output
   */
  private executeCommand(
    command: string,
    state: GameState,
    parser: Parser,
    executor: CommandExecutor
  ): string {
    // Parse the command
    const parsed = parser.parse(command, state, command);

    // Execute the command
    const result = executor.execute(parsed, state);

    return result.message;
  }

  /**
   * Format an error for inclusion in transcript
   */
  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return `[Error: ${error.message}]`;
    }
    return `[Error: ${String(error)}]`;
  }

  /**
   * Generate a unique transcript ID
   */
  private generateTranscriptId(startTime: Date, seed?: number): string {
    const timestamp = startTime.toISOString().replace(/[:.]/g, '-');
    const seedPart = seed !== undefined ? `-seed${seed}` : '';
    return `ts-${timestamp}${seedPart}`;
  }
}
