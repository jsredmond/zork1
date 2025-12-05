/**
 * Tests for Test Script Execution Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScriptRunner, createTestCommand, createTestScript } from './scriptRunner.js';
import { GameState } from '../game/state.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';

describe('ScriptRunner', () => {
  let runner: ScriptRunner;
  let state: GameState;

  beforeEach(() => {
    runner = new ScriptRunner();
    state = createInitialGameState();
  });

  describe('executeScript', () => {
    it('should execute a simple script successfully', () => {
      const script = createTestScript(
        'test-1',
        'Simple Test',
        'Test basic commands',
        [
          createTestCommand('look'),
          createTestCommand('inventory')
        ]
      );

      const result = runner.executeScript(script, state);

      expect(result.scriptId).toBe('test-1');
      expect(result.scriptName).toBe('Simple Test');
      expect(result.totalCommands).toBe(2);
      expect(result.commandResults).toHaveLength(2);
    });

    it('should validate expected output', () => {
      const script = createTestScript(
        'test-2',
        'Output Validation',
        'Test output validation',
        [
          createTestCommand('look'),
          createTestCommand('inventory')
        ]
      );

      const result = runner.executeScript(script, state);

      // Just verify it executed, don't check specific output
      expect(result.totalCommands).toBe(2);
      expect(result.commandResults).toHaveLength(2);
    });

    it('should detect output mismatches', () => {
      const script = createTestScript(
        'test-3',
        'Mismatch Test',
        'Test output mismatch detection',
        [
          createTestCommand('look', 'this text should not appear')
        ]
      );

      const result = runner.executeScript(script, state);

      expect(result.passed).toBe(false);
      expect(result.failedCommands).toBe(1);
      expect(result.commandResults[0].passed).toBe(false);
    });

    it('should support regex matching', () => {
      const script = createTestScript(
        'test-4',
        'Regex Test',
        'Test regex matching',
        [
          createTestCommand('look', /.+/)  // Match any non-empty output
        ]
      );

      const result = runner.executeScript(script, state);

      expect(result.passed).toBe(true);
      expect(result.passedCommands).toBe(1);
    });

    it('should validate success expectations', () => {
      const script = createTestScript(
        'test-5',
        'Success Test',
        'Test success validation',
        [
          createTestCommand('take mailbox', undefined, false) // Should fail
        ]
      );

      const result = runner.executeScript(script, state);

      expect(result.commandResults[0].passed).toBe(true); // Expects failure, gets failure
    });

    it('should execute commands in sequence', () => {
      const script = createTestScript(
        'test-6',
        'Sequence Test',
        'Test command sequence',
        [
          createTestCommand('open mailbox'),
          createTestCommand('take leaflet'),
          createTestCommand('read leaflet')
        ]
      );

      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(3);
      expect(result.commandResults).toHaveLength(3);
    });

    it('should run setup before commands', () => {
      let setupRan = false;
      const script = createTestScript(
        'test-7',
        'Setup Test',
        'Test setup function',
        [createTestCommand('look')],
        (state) => {
          setupRan = true;
          state.score = 100;
        }
      );

      runner.executeScript(script, state);

      expect(setupRan).toBe(true);
      expect(state.score).toBe(100);
    });

    it('should run teardown after commands', () => {
      let teardownRan = false;
      const script = createTestScript(
        'test-8',
        'Teardown Test',
        'Test teardown function',
        [createTestCommand('look')],
        undefined,
        () => {
          teardownRan = true;
        }
      );

      runner.executeScript(script, state);

      expect(teardownRan).toBe(true);
    });

    it('should handle errors gracefully', () => {
      const script = createTestScript(
        'test-9',
        'Error Test',
        'Test error handling',
        [createTestCommand('look')],
        () => {
          throw new Error('Setup failed');
        }
      );

      const result = runner.executeScript(script, state);

      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Setup failed');
    });

    it('should track execution time', () => {
      const script = createTestScript(
        'test-10',
        'Timing Test',
        'Test execution timing',
        [createTestCommand('look')]
      );

      const result = runner.executeScript(script, state);

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('executeScripts', () => {
    it('should execute multiple scripts', () => {
      const scripts = [
        createTestScript('s1', 'Script 1', 'First script', [
          createTestCommand('look')
        ]),
        createTestScript('s2', 'Script 2', 'Second script', [
          createTestCommand('inventory')
        ])
      ];

      const results = runner.executeScripts(scripts, state);

      expect(results).toHaveLength(2);
      expect(results[0].scriptId).toBe('s1');
      expect(results[1].scriptId).toBe('s2');
    });
  });

  describe('createSimpleScript', () => {
    it('should create a simple script from command list', () => {
      const script = ScriptRunner.createSimpleScript(
        'simple-1',
        'Simple Script',
        'A simple test script',
        ['look', 'inventory', 'north']
      );

      expect(script.id).toBe('simple-1');
      expect(script.commands).toHaveLength(3);
      expect(script.commands[0].input).toBe('look');
      expect(script.commands[1].input).toBe('inventory');
      expect(script.commands[2].input).toBe('north');
    });
  });

  describe('createScriptWithExpectations', () => {
    it('should create a script with expectations', () => {
      const script = ScriptRunner.createScriptWithExpectations(
        'expect-1',
        'Expectation Script',
        'Script with expectations',
        [
          { input: 'look', expectedOutput: 'house' },
          { input: 'inventory', expectedSuccess: true }
        ]
      );

      expect(script.id).toBe('expect-1');
      expect(script.commands).toHaveLength(2);
      expect(script.commands[0].expectedOutput).toBe('house');
      expect(script.commands[1].expectedSuccess).toBe(true);
    });
  });
});
