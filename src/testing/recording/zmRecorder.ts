/**
 * Z-Machine Game Recorder
 * 
 * Records game sessions from the original z3 file via external Z-machine interpreter.
 * Supports dfrotz and other Z-machine interpreters.
 * Captures output in the same format as TypeScript recordings for comparison.
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { GameRecorder } from './tsRecorder.js';
import { 
  Transcript, 
  TranscriptEntry, 
  RecordingOptions,
  ZMachineConfig 
} from './types.js';

/** Default timeout for commands in milliseconds */
const DEFAULT_TIMEOUT = 5000;

/** Prompt pattern to detect when interpreter is ready for input */
const PROMPT_PATTERN = />/;

/**
 * ZMachineRecorder records sessions from the original z3 file via external interpreter.
 * 
 * Features:
 * - Spawns dfrotz/frotz as child process
 * - Sends commands via stdin, captures output from stdout
 * - Parses interpreter output to match transcript format
 * - Handles interpreter unavailability gracefully
 */
export class ZMachineRecorder extends GameRecorder {
  private config: ZMachineConfig;
  private process: ChildProcess | null = null;

  constructor(config: ZMachineConfig) {
    super();
    this.config = {
      ...config,
      timeout: config.timeout ?? DEFAULT_TIMEOUT
    };
  }

  /**
   * Check if the Z-machine interpreter is available
   * @returns Promise resolving to true if interpreter and game file exist
   */
  async isAvailable(): Promise<boolean> {
    // Check if interpreter exists
    if (!existsSync(this.config.interpreterPath)) {
      return false;
    }

    // Check if game file exists
    if (!existsSync(this.config.gameFilePath)) {
      return false;
    }

    return true;
  }

  /**
   * Record a game session with the given commands
   * 
   * @param commands - Array of commands to execute
   * @param options - Recording options (seed is not supported for Z-machine)
   * @returns Promise resolving to a complete Transcript
   */
  async record(commands: string[], options?: RecordingOptions): Promise<Transcript> {
    const startTime = new Date();
    const entries: TranscriptEntry[] = [];

    // Check availability first
    const available = await this.isAvailable();
    if (!available) {
      throw new ZMachineError(
        `Z-machine interpreter not available. ` +
        `Interpreter: ${this.config.interpreterPath}, ` +
        `Game file: ${this.config.gameFilePath}`
      );
    }

    try {
      // Spawn the interpreter
      await this.spawnInterpreter();

      // Get initial output (game startup)
      const initialOutput = await this.readUntilPrompt();
      entries.push({
        index: 0,
        command: '',
        output: this.cleanOutput(initialOutput, options?.preserveFormatting),
        timestamp: options?.captureTimestamps ? Date.now() : undefined,
        turnNumber: 0
      });

      // Execute each command
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        let output: string;
        try {
          output = await this.sendCommand(command);
        } catch (error) {
          // Capture error message and continue recording
          output = this.formatError(error);
        }

        entries.push({
          index: i + 1,
          command,
          output: this.cleanOutput(output, options?.preserveFormatting),
          timestamp: options?.captureTimestamps ? Date.now() : undefined,
          turnNumber: i + 1  // Approximate turn number
        });
      }
    } finally {
      // Always clean up the process and wait for termination
      await this.cleanup();
    }

    const endTime = new Date();
    const id = this.generateTranscriptId(startTime);

    return {
      id,
      source: 'z-machine',
      startTime,
      endTime,
      entries,
      metadata: {
        interpreterPath: this.config.interpreterPath,
        gameVersion: 'original-z3'
      }
    };
  }

  /**
   * Spawn the Z-machine interpreter process
   */
  private async spawnInterpreter(): Promise<void> {
    return new Promise((resolve, reject) => {
      // dfrotz flags:
      // -p: plain ASCII output (no formatting codes)
      // -w N: set screen width
      // -h N: set screen height
      const args = [
        '-p',           // Plain ASCII output
        '-w', '80',     // Screen width
        '-h', '24',     // Screen height
        this.config.gameFilePath
      ];

      this.process = spawn(this.config.interpreterPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.on('error', (error) => {
        reject(new ZMachineError(`Failed to spawn interpreter: ${error.message}`));
      });

      this.process.on('close', (code) => {
        if (code !== 0 && code !== null) {
          // Process exited with error, but this might be normal during cleanup
        }
      });

      // Give the process a moment to start
      setTimeout(resolve, 100);
    });
  }

  /**
   * Read output from the interpreter until we see a prompt
   */
  private async readUntilPrompt(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdout) {
        reject(new ZMachineError('Interpreter process not running'));
        return;
      }

      let output = '';
      const timeout = setTimeout(() => {
        resolve(output); // Return what we have on timeout
      }, this.config.timeout);

      const onData = (data: Buffer) => {
        output += data.toString();
        
        // Check if we've received a prompt
        if (PROMPT_PATTERN.test(output)) {
          clearTimeout(timeout);
          this.process?.stdout?.removeListener('data', onData);
          resolve(output);
        }
      };

      this.process.stdout.on('data', onData);
    });
  }

  /**
   * Send a command to the interpreter and capture the response
   */
  private async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin || !this.process.stdout) {
        reject(new ZMachineError('Interpreter process not running'));
        return;
      }

      let output = '';
      const timeout = setTimeout(() => {
        resolve(output); // Return what we have on timeout
      }, this.config.timeout);

      const onData = (data: Buffer) => {
        output += data.toString();
        
        // Check if we've received a prompt (ready for next command)
        if (PROMPT_PATTERN.test(output)) {
          clearTimeout(timeout);
          this.process?.stdout?.removeListener('data', onData);
          resolve(output);
        }
      };

      this.process.stdout.on('data', onData);

      // Send the command
      this.process.stdin.write(command + '\n');
    });
  }

  /**
   * Clean up the interpreter process
   * Waits for process to fully terminate before returning
   */
  private async cleanup(): Promise<void> {
    if (!this.process) return;

    const process = this.process;
    this.process = null;

    return new Promise<void>((resolve) => {
      // Set up timeout for force kill with SIGKILL after 1 second
      const forceKillTimeout = setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 1000);

      // Listen for process exit
      process.once('exit', () => {
        clearTimeout(forceKillTimeout);
        resolve();
      });

      // Handle case where process is already dead
      if (process.exitCode !== null || process.killed) {
        clearTimeout(forceKillTimeout);
        resolve();
        return;
      }

      // Try graceful quit first
      try {
        if (process.stdin && !process.stdin.destroyed) {
          process.stdin.write('quit\n');
          process.stdin.end();
        }
      } catch {
        // Ignore errors, will force kill on timeout
      }

      // Send SIGTERM after brief delay
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGTERM');
        }
      }, 500);
    });
  }

  /**
   * Clean the output by removing interpreter artifacts
   */
  private cleanOutput(output: string, preserveFormatting?: boolean): string {
    let cleaned = output;

    // Remove the command echo (interpreter echoes input)
    // Remove trailing prompt character
    cleaned = cleaned.replace(/>\s*$/, '');

    // Remove ANSI escape codes if any
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '');

    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    if (!preserveFormatting) {
      // Trim leading/trailing whitespace
      cleaned = cleaned.trim();
    }

    return cleaned;
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
  private generateTranscriptId(startTime: Date): string {
    const timestamp = startTime.toISOString().replace(/[:.]/g, '-');
    return `zm-${timestamp}`;
  }
}

/**
 * Custom error class for Z-machine related errors
 */
export class ZMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZMachineError';
  }
}
