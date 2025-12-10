/**
 * Terminal I/O Integration Tests
 * Tests the complete input/output cycle
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { Terminal, ANSI, supportsAnsi } from './terminal.js';

describe('Terminal', () => {
  let terminal: Terminal;

  beforeEach(() => {
    terminal = new Terminal();
  });

  afterEach(() => {
    if (terminal.isActive()) {
      terminal.close();
    }
  });

  describe('initialization', () => {
    it('should initialize terminal interface', () => {
      terminal.initialize();
      expect(terminal.isActive()).toBe(true);
    });

    it('should not be active before initialization', () => {
      expect(terminal.isActive()).toBe(false);
    });
  });

  describe('output methods', () => {
    beforeEach(() => {
      terminal.initialize();
    });

    it('should write text without newline', () => {
      // This test verifies the method exists and doesn't throw
      expect(() => terminal.write('test')).not.toThrow();
    });

    it('should write line with newline', () => {
      expect(() => terminal.writeLine('test line')).not.toThrow();
    });

    it('should write multiple lines', () => {
      const lines = ['line 1', 'line 2', 'line 3'];
      expect(() => terminal.writeLines(lines)).not.toThrow();
    });

    it('should clear screen', () => {
      expect(() => terminal.clear()).not.toThrow();
    });

    it('should show prompt', () => {
      expect(() => terminal.showPrompt()).not.toThrow();
    });

    it('should show status bar', () => {
      expect(() => terminal.showStatusBar(10, 5)).not.toThrow();
    });

    it('should show status bar with different values', () => {
      expect(() => terminal.showStatusBar(350, 1000)).not.toThrow();
    });
  });

  describe('lifecycle', () => {
    it('should close terminal', () => {
      terminal.initialize();
      expect(terminal.isActive()).toBe(true);
      
      terminal.close();
      expect(terminal.isActive()).toBe(false);
    });

    it('should handle multiple close calls', () => {
      terminal.initialize();
      terminal.close();
      
      expect(() => terminal.close()).not.toThrow();
      expect(terminal.isActive()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw error when reading without initialization', () => {
      expect(() => {
        terminal.readLine(() => {});
      }).toThrow('Terminal not initialized');
    });
  });

  describe('ANSI escape codes', () => {
    it('should export ANSI constants', () => {
      expect(ANSI.HOME).toBe('\x1b[H');
      expect(ANSI.CLEAR_LINE).toBe('\x1b[K');
      expect(ANSI.SAVE_CURSOR).toBe('\x1b[s');
      expect(ANSI.RESTORE_CURSOR).toBe('\x1b[u');
    });

    it('should generate moveTo escape sequence', () => {
      expect(ANSI.moveTo(1, 1)).toBe('\x1b[1;1H');
      expect(ANSI.moveTo(5, 10)).toBe('\x1b[5;10H');
    });

    it('should generate scroll region escape sequence', () => {
      expect(ANSI.setScrollRegion(2, 24)).toBe('\x1b[2;24r');
    });

    it('should have supportsAnsi function', () => {
      expect(typeof supportsAnsi).toBe('function');
    });
  });

  describe('status bar formatting', () => {
    beforeEach(() => {
      terminal.initialize();
    });

    it('should format status bar correctly', () => {
      const formatted = terminal.formatStatusBar('West of House', 0, 0);
      expect(formatted).toContain('West of House');
      expect(formatted).toContain('Score: 0');
      expect(formatted).toContain('Moves: 0');
    });

    it('should have initializeScreen method', () => {
      expect(typeof terminal.initializeScreen).toBe('function');
    });

    it('should have updateStatusBar method', () => {
      expect(typeof terminal.updateStatusBar).toBe('function');
    });
  });

  /**
   * Property-Based Tests for Status Bar
   * **Feature: status-bar-ui, Property 1: Status bar contains current room name**
   * **Feature: status-bar-ui, Property 2: Status bar contains score and moves**
   * **Validates: Requirements 1.2, 1.3, 1.5**
   */
  describe('status bar property tests', () => {
    beforeEach(() => {
      terminal.initialize();
    });

    /**
     * **Feature: status-bar-ui, Property 1: Status bar contains current room name**
     * *For any* game state with a current room, the status bar output SHALL contain the room's name string.
     * **Validates: Requirements 1.2, 1.5**
     */
    it('Property 1: status bar contains current room name', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (roomName) => {
            const formatted = terminal.formatStatusBar(roomName, 0, 0);
            // Room name should appear in the status bar (possibly truncated)
            const truncatedName = roomName.length > 60 ? roomName.substring(0, 57) + '...' : roomName;
            return formatted.includes(truncatedName) || formatted.includes(roomName.substring(0, 10));
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Feature: status-bar-ui, Property 2: Status bar contains score and moves**
     * *For any* game state, the status bar output SHALL contain "Score: {score}" and "Moves: {moves}" matching the current state values.
     * **Validates: Requirements 1.3, 1.4**
     */
    it('Property 2: status bar contains score and moves', () => {
      fc.assert(
        fc.property(
          fc.nat(1000),  // score 0-1000
          fc.nat(10000), // moves 0-10000
          (score, moves) => {
            const formatted = terminal.formatStatusBar('Test Room', score, moves);
            return formatted.includes(`Score: ${score}`) && formatted.includes(`Moves: ${moves}`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
