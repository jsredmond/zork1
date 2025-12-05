/**
 * Property-Based Test for Test Idempotency
 * Feature: exhaustive-game-testing, Property 4: Test idempotency
 * Validates: Requirements 9.2, 9.5
 * 
 * Property: For any test that passes, running the same test again with the same initial state should also pass
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ScriptRunner, createTestScript, createTestCommand } from './scriptRunner.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';

describe('Test Idempotency Property', () => {
  /**
   * Property 4: Test idempotency
   * For any test that passes, running the same test again with the same initial state should also pass
   */
  it('should produce identical results when run twice with same initial state', () => {
    fc.assert(
      fc.property(
        // Generate random test commands
        fc.array(
          fc.oneof(
            fc.constant('look'),
            fc.constant('inventory'),
            fc.constant('north'),
            fc.constant('south'),
            fc.constant('east'),
            fc.constant('west'),
            fc.constant('open mailbox'),
            fc.constant('take leaflet'),
            fc.constant('examine mailbox')
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (commands) => {
          // Create test script from commands
          const script = createTestScript(
            'idempotency-test',
            'Idempotency Test',
            'Test for idempotency',
            commands.map(cmd => createTestCommand(cmd))
          );

          const runner = new ScriptRunner();

          // Run test first time
          const state1 = createInitialGameState();
          const result1 = runner.executeScript(script, state1);

          // Run test second time with fresh state
          const state2 = createInitialGameState();
          const result2 = runner.executeScript(script, state2);

          // Results should be identical
          expect(result1.passed).toBe(result2.passed);
          expect(result1.totalCommands).toBe(result2.totalCommands);
          expect(result1.passedCommands).toBe(result2.passedCommands);
          expect(result1.failedCommands).toBe(result2.failedCommands);

          // Command results should match
          for (let i = 0; i < result1.commandResults.length; i++) {
            const cmd1 = result1.commandResults[i];
            const cmd2 = result2.commandResults[i];

            expect(cmd1.input).toBe(cmd2.input);
            expect(cmd1.passed).toBe(cmd2.passed);
            expect(cmd1.actualOutput).toBe(cmd2.actualOutput);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Test results should be deterministic
   * Running the same test multiple times should always produce the same output
   */
  it('should produce deterministic output across multiple runs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'look',
          'inventory',
          'examine mailbox',
          'open mailbox',
          'north'
        ),
        (command) => {
          const script = createTestScript(
            'determinism-test',
            'Determinism Test',
            'Test for determinism',
            [createTestCommand(command)]
          );

          const runner = new ScriptRunner();

          // Run test 3 times
          const outputs: string[] = [];
          for (let i = 0; i < 3; i++) {
            const state = createInitialGameState();
            const result = runner.executeScript(script, state);
            outputs.push(result.commandResults[0].actualOutput);
          }

          // All outputs should be identical
          expect(outputs[0]).toBe(outputs[1]);
          expect(outputs[1]).toBe(outputs[2]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Test pass/fail status should be consistent
   * If a test passes once, it should always pass with the same initial state
   */
  it('should maintain consistent pass/fail status', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            'look',
            'inventory',
            'north',
            'south',
            'east',
            'west'
          ),
          { minLength: 1, maxLength: 3 }
        ),
        (commands) => {
          const script = createTestScript(
            'consistency-test',
            'Consistency Test',
            'Test for consistency',
            commands.map(cmd => createTestCommand(cmd))
          );

          const runner = new ScriptRunner();

          // Run test multiple times
          const passStatuses: boolean[] = [];
          for (let i = 0; i < 5; i++) {
            const state = createInitialGameState();
            const result = runner.executeScript(script, state);
            passStatuses.push(result.passed);
          }

          // All pass statuses should be the same
          const firstStatus = passStatuses[0];
          expect(passStatuses.every(status => status === firstStatus)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Command execution order should not affect idempotency
   * The same sequence of commands should produce the same results regardless of when they're run
   */
  it('should produce same results regardless of execution timing', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            'look',
            'inventory',
            'examine mailbox'
          ),
          { minLength: 1, maxLength: 3 }
        ),
        (commands) => {
          const script = createTestScript(
            'timing-test',
            'Timing Test',
            'Test for timing independence',
            commands.map(cmd => createTestCommand(cmd))
          );

          const runner = new ScriptRunner();

          // Run immediately
          const state1 = createInitialGameState();
          const result1 = runner.executeScript(script, state1);

          // Run after a small delay (simulated by just running again)
          const state2 = createInitialGameState();
          const result2 = runner.executeScript(script, state2);

          // Results should be identical
          expect(result1.passed).toBe(result2.passed);
          expect(result1.commandResults.length).toBe(result2.commandResults.length);

          for (let i = 0; i < result1.commandResults.length; i++) {
            expect(result1.commandResults[i].passed).toBe(result2.commandResults[i].passed);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
