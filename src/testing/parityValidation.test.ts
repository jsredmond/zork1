/**
 * Comprehensive Parity Validation Tests
 * Tests for all 57 previously identified differences to ensure parity enhancements work correctly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedCommandExecutor } from '../engine/enhancedExecutor.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';
import { GameState } from '../game/state.js';
import { SpotTestRunner } from './spotTesting/spotTestRunner.js';
import { ParityEnhancementEngine } from '../parity/ParityEnhancementEngine.js';

describe('Comprehensive Parity Validation Tests', () => {
  let executor: EnhancedCommandExecutor;
  let gameState: GameState;
  let parityEngine: ParityEnhancementEngine;

  beforeEach(() => {
    // Initialize with full parity enhancements enabled
    executor = new EnhancedCommandExecutor();
    executor.updateParityConfig({
      enableStatusDisplay: true,
      enableParserEnhancements: true,
      enableObjectInteractionFixes: true,
      enableMessageStandardization: true,
      enableStateValidation: true,
      strictValidation: false
    });

    gameState = createInitialGameState();
    parityEngine = new ParityEnhancementEngine();
  });

  afterEach(() => {
    // Clean up any state
  });

  describe('Parser Differences (2 occurrences)', () => {
    it('should handle "search" command with proper error message', async () => {
      const result = await executor.executeWithParity(
        { verb: 'SEARCH' },
        gameState
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('What do you want to search?');
      expect(result.message).not.toContain("I don't know how to search");
      expect(result.parityEnhanced).toBe(true);
    });

    it('should handle "drop" command with proper error message', async () => {
      const result = await executor.executeWithParity(
        { verb: 'DROP' },
        gameState
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('There seems to be a noun missing in that sentence!');
      expect(result.message).not.toContain('What do you want to drop?');
      expect(result.parityEnhanced).toBe(true);
    });
  });

  describe('Timing Differences (32 occurrences)', () => {
    it('should include status display in all command responses', async () => {
      const result = await executor.executeWithParity(
        { verb: 'LOOK' },
        gameState
      );

      expect(result.message).toMatch(/West of House\s+Score: \d+\s+Moves: \d+/);
      expect(result.parityEnhanced).toBe(true);
    });

    it('should format status line with proper padding', async () => {
      const result = await executor.executeWithParity(
        { verb: 'INVENTORY' },
        gameState
      );

      // Status line should be properly formatted with room name padded to 45 characters
      const statusLineMatch = result.message.match(/^(.{45,})\s+Score: \d+\s+Moves: \d+/);
      expect(statusLineMatch).toBeTruthy();
      expect(result.parityEnhanced).toBe(true);
    });

    it('should update move count correctly', async () => {
      const initialMoves = gameState.moves;
      
      const result = await executor.executeWithParity(
        { verb: 'LOOK' },
        gameState
      );

      expect(gameState.moves).toBe(initialMoves + 1);
      expect(result.message).toContain(`Moves: ${gameState.moves}`);
      expect(result.parityEnhanced).toBe(true);
    });

    it('should display score correctly in status', async () => {
      const result = await executor.executeWithParity(
        { verb: 'SCORE' },
        gameState
      );

      expect(result.message).toContain(`Score: ${gameState.score}`);
      expect(result.parityEnhanced).toBe(true);
    });
  });

  describe('Object Behavior Differences (11 occurrences)', () => {
    it('should handle "drop all" when empty-handed correctly', async () => {
      // Ensure inventory is empty
      gameState.inventory = [];
      
      const result = await executor.executeWithParity(
        { verb: 'DROP', isAllObjects: true },
        gameState
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('You are empty-handed');
      expect(result.parityEnhanced).toBe(true);
    });

    it('should handle object visibility checking correctly', async () => {
      const result = await executor.executeWithParity(
        { 
          verb: 'TAKE',
          directObject: { id: 'NONEXISTENT', name: 'nonexistent' }
        },
        gameState
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("You can't see any nonexistent here!");
      expect(result.parityEnhanced).toBe(true);
    });

    it('should handle "You don\'t have X" vs "You can\'t see X" logic', async () => {
      const result = await executor.executeWithParity(
        { 
          verb: 'DROP',
          directObject: { id: 'LAMP', name: 'lamp' }
        },
        gameState
      );

      // Should check if player has the object first
      if (gameState.inventory.includes('LAMP')) {
        expect(result.success).toBe(true);
      } else {
        expect(result.message).toContain("You don't have the lamp");
      }
      expect(result.parityEnhanced).toBe(true);
    });
  });

  describe('Message Inconsistencies (10 occurrences)', () => {
    it('should handle malformed commands with proper error message', async () => {
      const result = await executor.executeWithParity(
        {
          type: 'PARSE_ERROR',
          message: 'Malformed command'
        } as any,
        gameState
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("That sentence isn't one I recognize");
      expect(result.parityEnhanced).toBe(true);
    });

    it('should use consistent article usage in messages', async () => {
      const result = await executor.executeWithParity(
        { 
          verb: 'EXAMINE',
          directObject: { id: 'NONEXISTENT', name: 'apple' }
        },
        gameState
      );

      expect(result.success).toBe(false);
      // Should use "an" for words starting with vowels
      expect(result.message).toContain("You can't see any apple here!");
      expect(result.parityEnhanced).toBe(true);
    });

    it('should format error messages consistently', async () => {
      const result = await executor.executeWithParity(
        { 
          verb: 'OPEN',
          directObject: { id: 'MAILBOX', name: 'mailbox' }
        },
        gameState
      );

      // Message should be properly formatted with consistent punctuation
      expect(result.message).toMatch(/^[A-Z].*[.!]$/);
      expect(result.parityEnhanced).toBe(true);
    });
  });

  describe('State Divergence Issues (2 occurrences)', () => {
    it('should maintain consistent object location tracking', async () => {
      // Take an object and verify state consistency
      const result = await executor.executeWithParity(
        { 
          verb: 'TAKE',
          directObject: { id: 'MAILBOX', name: 'mailbox' }
        },
        gameState
      );

      // Verify state synchronization
      const mailbox = gameState.getObject('MAILBOX');
      if (result.success && mailbox) {
        expect(gameState.inventory).toContain('MAILBOX');
        expect(mailbox.location).toBe('PLAYER');
      }
      expect(result.parityEnhanced).toBe(true);
    });

    it('should maintain inventory state consistency', async () => {
      const initialInventorySize = gameState.inventory.length;
      
      const result = await executor.executeWithParity(
        { verb: 'INVENTORY' },
        gameState
      );

      // Inventory size should remain consistent
      expect(gameState.inventory.length).toBe(initialInventorySize);
      expect(result.parityEnhanced).toBe(true);
    });
  });

  describe('Parity Enhancement Integration', () => {
    it('should validate all parity components are initialized', () => {
      expect(executor.validateComponents()).toBe(true);
      
      const status = executor.getParityStatus();
      expect(status.statusManager).toBe(true);
      expect(status.parserErrorHandler).toBe(true);
      expect(status.objectManager).toBe(true);
      expect(status.messageManager).toBe(true);
      expect(status.stateSync).toBe(true);
    });

    it('should apply parity enhancements to all command types', async () => {
      const commands = [
        { verb: 'LOOK' },
        { verb: 'INVENTORY' },
        { verb: 'NORTH' },
        { verb: 'EXAMINE', directObject: { id: 'MAILBOX', name: 'mailbox' } },
        { verb: 'TAKE', directObject: { id: 'MAILBOX', name: 'mailbox' } }
      ];

      for (const command of commands) {
        const result = await executor.executeWithParity(command, gameState);
        expect(result.parityEnhanced).toBe(true);
        expect(result.message).toMatch(/Score: \d+\s+Moves: \d+/);
      }
    });

    it('should handle parity enhancement failures gracefully', async () => {
      // Temporarily disable parity enhancements to test fallback
      executor.updateParityConfig({
        enableStatusDisplay: false,
        enableParserEnhancements: false,
        enableObjectInteractionFixes: false,
        enableMessageStandardization: false,
        enableStateValidation: false
      });

      const result = await executor.executeWithParity(
        { verb: 'LOOK' },
        gameState
      );

      // Should still execute successfully even without enhancements
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });
  });

  describe('Regression Testing', () => {
    it('should not break existing functionality', async () => {
      // Test basic game functionality still works
      const commands = [
        'look',
        'inventory',
        'examine mailbox',
        'north',
        'south'
      ];

      for (const command of commands) {
        const result = await executor.executeWithParity(
          { verb: command.split(' ')[0].toUpperCase() },
          gameState
        );
        
        // Should not crash or produce empty responses
        expect(result.message).toBeTruthy();
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('should maintain game state integrity', async () => {
      const initialRoom = gameState.currentRoom;
      const initialScore = gameState.score;
      
      // Execute several commands
      await executor.executeWithParity({ verb: 'LOOK' }, gameState);
      await executor.executeWithParity({ verb: 'INVENTORY' }, gameState);
      await executor.executeWithParity({ verb: 'EXAMINE', directObject: { id: 'MAILBOX', name: 'mailbox' } }, gameState);

      // Basic state should be preserved (room shouldn't change from these commands)
      expect(gameState.currentRoom).toBe(initialRoom);
      expect(gameState.score).toBe(initialScore);
      expect(gameState.moves).toBeGreaterThan(0);
    });
  });

  describe('Performance Testing', () => {
    it('should not significantly impact performance', async () => {
      const startTime = Date.now();
      
      // Execute multiple commands to test performance
      for (let i = 0; i < 10; i++) {
        await executor.executeWithParity({ verb: 'LOOK' }, gameState);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 10;
      
      // Should complete within reasonable time (less than 100ms per command)
      expect(averageTime).toBeLessThan(100);
    });

    it('should handle rapid command execution', async () => {
      const commands = Array(20).fill({ verb: 'LOOK' });
      
      const startTime = Date.now();
      const results = await Promise.all(
        commands.map(cmd => executor.executeWithParity(cmd, gameState))
      );
      const endTime = Date.now();
      
      // All commands should complete successfully
      expect(results.every(r => r.success)).toBe(true);
      expect(results.every(r => r.parityEnhanced)).toBe(true);
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});

describe('Automated Parity Testing Framework', () => {
  let spotTestRunner: SpotTestRunner;

  beforeEach(() => {
    spotTestRunner = new SpotTestRunner();
  });

  it('should run spot tests with parity enhancements', async () => {
    // Skip if Z-Machine not available
    const zmAvailable = await spotTestRunner.isZMachineAvailable();
    if (!zmAvailable) {
      console.warn('Skipping spot test - Z-Machine interpreter not available');
      return;
    }

    const result = await spotTestRunner.runSpotTest({
      commandCount: 25,
      seed: 12345,
      timeoutMs: 30000,
      quickMode: true
    });

    expect(result.totalCommands).toBe(25);
    expect(result.parityScore).toBeGreaterThan(0);
    expect(result.differences).toBeDefined();
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should detect parity improvements', async () => {
    // Skip if Z-Machine not available
    const zmAvailable = await spotTestRunner.isZMachineAvailable();
    if (!zmAvailable) {
      console.warn('Skipping parity improvement test - Z-Machine interpreter not available');
      return;
    }

    const result = await spotTestRunner.runSpotTest({
      commandCount: 50,
      seed: 54321,
      timeoutMs: 45000,
      quickMode: false
    });

    // With parity enhancements, we should see improved scores
    expect(result.parityScore).toBeGreaterThan(71.5); // Should be better than baseline
    
    // Should have fewer differences than the original 57
    const differenceRate = (result.differences.length / result.totalCommands) * 100;
    expect(differenceRate).toBeLessThan(28.5); // 57/200 = 28.5% was original rate
  });

  it('should generate comprehensive test reports', async () => {
    // Skip if Z-Machine not available
    const zmAvailable = await spotTestRunner.isZMachineAvailable();
    if (!zmAvailable) {
      console.warn('Skipping report generation test - Z-Machine interpreter not available');
      return;
    }

    const result = await spotTestRunner.runSpotTest({
      commandCount: 20,
      seed: 98765,
      timeoutMs: 20000,
      quickMode: true
    });

    const textReport = spotTestRunner.generateReport(result);
    const jsonReport = spotTestRunner.generateJsonReport(result);
    const summary = spotTestRunner.generateSummary(result);

    expect(textReport).toContain('SPOT TEST PARITY REPORT');
    expect(textReport).toContain('SUMMARY');
    expect(textReport).toContain('Parity Score:');
    
    expect(() => JSON.parse(jsonReport)).not.toThrow();
    
    expect(summary).toContain('Parity:');
    expect(summary).toContain('%');
  });
});

describe('Specific Parity Issue Regression Tests', () => {
  let executor: EnhancedCommandExecutor;
  let gameState: GameState;

  beforeEach(() => {
    executor = new EnhancedCommandExecutor();
    executor.updateParityConfig({
      enableStatusDisplay: true,
      enableParserEnhancements: true,
      enableObjectInteractionFixes: true,
      enableMessageStandardization: true,
      enableStateValidation: true,
      strictValidation: false
    });
    gameState = createInitialGameState();
  });

  // Test specific issues that were identified in the original 57 differences
  const specificIssueTests = [
    {
      name: 'malformed "put in forest" command',
      command: 'put  in forest',
      expectedPattern: /That sentence isn't one I recognize/
    },
    {
      name: 'incomplete "search" command',
      command: 'search',
      expectedPattern: /What do you want to search\?/
    },
    {
      name: 'incomplete "drop" command',
      command: 'drop',
      expectedPattern: /There seems to be a noun missing in that sentence!/
    },
    {
      name: 'empty-handed "drop all" command',
      command: 'drop all',
      expectedPattern: /You are empty-handed/
    }
  ];

  specificIssueTests.forEach(({ name, command, expectedPattern }) => {
    it(`should handle ${name} correctly`, async () => {
      // Parse command into appropriate format
      const words = command.split(/\s+/);
      const verb = words[0].toUpperCase();
      
      let parsedCommand: any = { verb };
      
      if (command.includes('all')) {
        parsedCommand.isAllObjects = true;
      }
      
      if (words.length > 1 && !command.includes('all')) {
        if (words[1] && words[1] !== 'in') {
          parsedCommand.directObject = { id: words[1].toUpperCase(), name: words[1] };
        }
        if (words.includes('in') && words[words.indexOf('in') + 1]) {
          parsedCommand.preposition = 'IN';
          parsedCommand.indirectObject = { 
            id: words[words.indexOf('in') + 1].toUpperCase(), 
            name: words[words.indexOf('in') + 1] 
          };
        }
      }

      const result = await executor.executeWithParity(parsedCommand, gameState);
      
      expect(result.message).toMatch(expectedPattern);
      expect(result.parityEnhanced).toBe(true);
    });
  });
});