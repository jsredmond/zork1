/**
 * Test Script Execution Engine
 * Executes test scripts (sequences of commands) and compares output to expected results
 */

import { GameState } from '../game/state.js';
import { Parser } from '../parser/parser.js';
import { CommandExecutor } from '../engine/executor.js';
import { ActionResult } from '../game/actions.js';

/**
 * A test script is a sequence of commands with optional expected outputs
 */
export interface TestScript {
  id: string;
  name: string;
  description: string;
  commands: TestCommand[];
  setup?: (state: GameState) => void;
  teardown?: (state: GameState) => void;
}

/**
 * A single command in a test script
 */
export interface TestCommand {
  input: string;
  expectedOutput?: string | RegExp;
  expectedSuccess?: boolean;
  description?: string;
}

/**
 * Result of executing a test script
 */
export interface ScriptExecutionResult {
  scriptId: string;
  scriptName: string;
  passed: boolean;
  totalCommands: number;
  passedCommands: number;
  failedCommands: number;
  commandResults: CommandExecutionResult[];
  executionTime: number;
  error?: string;
}

/**
 * Result of executing a single command in a script
 */
export interface CommandExecutionResult {
  commandIndex: number;
  input: string;
  actualOutput: string;
  expectedOutput?: string | RegExp;
  passed: boolean;
  reason?: string;
  description?: string;
}

/**
 * ScriptRunner executes test scripts and validates results
 */
export class ScriptRunner {
  private parser: Parser;
  private executor: CommandExecutor;

  constructor() {
    this.parser = new Parser();
    this.executor = new CommandExecutor();
  }

  /**
   * Execute a test script and return results
   */
  executeScript(script: TestScript, state: GameState): ScriptExecutionResult {
    const startTime = Date.now();
    const commandResults: CommandExecutionResult[] = [];
    let passedCommands = 0;
    let failedCommands = 0;

    try {
      // Run setup if provided
      if (script.setup) {
        script.setup(state);
      }

      // Execute each command in sequence
      for (let i = 0; i < script.commands.length; i++) {
        const command = script.commands[i];
        const result = this.executeCommand(command, i, state);
        commandResults.push(result);

        if (result.passed) {
          passedCommands++;
        } else {
          failedCommands++;
        }
      }

      // Run teardown if provided
      if (script.teardown) {
        script.teardown(state);
      }

      const executionTime = Date.now() - startTime;
      const passed = failedCommands === 0;

      return {
        scriptId: script.id,
        scriptName: script.name,
        passed,
        totalCommands: script.commands.length,
        passedCommands,
        failedCommands,
        commandResults,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        scriptId: script.id,
        scriptName: script.name,
        passed: false,
        totalCommands: script.commands.length,
        passedCommands,
        failedCommands: script.commands.length - passedCommands,
        commandResults,
        executionTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute a single command and validate result
   */
  private executeCommand(
    command: TestCommand,
    index: number,
    state: GameState
  ): CommandExecutionResult {
    // Parse the command
    const parsed = this.parser.parse(command.input);

    // Execute the command
    const actionResult: ActionResult = this.executor.execute(parsed, state);

    // Get the actual output
    const actualOutput = actionResult.message;

    // Validate the result
    const validation = this.validateCommandResult(
      command,
      actionResult,
      actualOutput
    );

    return {
      commandIndex: index,
      input: command.input,
      actualOutput,
      expectedOutput: command.expectedOutput,
      passed: validation.passed,
      reason: validation.reason,
      description: command.description
    };
  }

  /**
   * Validate command result against expectations
   */
  private validateCommandResult(
    command: TestCommand,
    actionResult: ActionResult,
    actualOutput: string
  ): { passed: boolean; reason?: string } {
    // Check success expectation if specified
    if (command.expectedSuccess !== undefined) {
      if (actionResult.success !== command.expectedSuccess) {
        return {
          passed: false,
          reason: `Expected success=${command.expectedSuccess}, got success=${actionResult.success}`
        };
      }
    }

    // Check output expectation if specified
    if (command.expectedOutput !== undefined) {
      if (typeof command.expectedOutput === 'string') {
        // Exact string match (case-insensitive, trimmed)
        const expected = command.expectedOutput.trim().toLowerCase();
        const actual = actualOutput.trim().toLowerCase();
        if (!actual.includes(expected)) {
          return {
            passed: false,
            reason: `Expected output to contain "${command.expectedOutput}", got "${actualOutput}"`
          };
        }
      } else if (command.expectedOutput instanceof RegExp) {
        // Regex match
        if (!command.expectedOutput.test(actualOutput)) {
          return {
            passed: false,
            reason: `Expected output to match ${command.expectedOutput}, got "${actualOutput}"`
          };
        }
      }
    }

    // All validations passed
    return { passed: true };
  }

  /**
   * Execute multiple scripts and return aggregated results
   */
  executeScripts(
    scripts: TestScript[],
    state: GameState
  ): ScriptExecutionResult[] {
    return scripts.map(script => this.executeScript(script, state));
  }

  /**
   * Create a simple test script from command list
   */
  static createSimpleScript(
    id: string,
    name: string,
    description: string,
    commands: string[]
  ): TestScript {
    return {
      id,
      name,
      description,
      commands: commands.map(input => ({ input }))
    };
  }

  /**
   * Create a test script with expected outputs
   */
  static createScriptWithExpectations(
    id: string,
    name: string,
    description: string,
    commands: Array<{ input: string; expectedOutput?: string | RegExp; expectedSuccess?: boolean }>
  ): TestScript {
    return {
      id,
      name,
      description,
      commands
    };
  }
}

/**
 * Helper function to create a test command
 */
export function createTestCommand(
  input: string,
  expectedOutput?: string | RegExp,
  expectedSuccess?: boolean,
  description?: string
): TestCommand {
  return {
    input,
    expectedOutput,
    expectedSuccess,
    description
  };
}

/**
 * Helper function to create a test script
 */
export function createTestScript(
  id: string,
  name: string,
  description: string,
  commands: TestCommand[],
  setup?: (state: GameState) => void,
  teardown?: (state: GameState) => void
): TestScript {
  return {
    id,
    name,
    description,
    commands,
    setup,
    teardown
  };
}
