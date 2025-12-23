/**
 * Conditional Messages Tests
 * Tests for conditional message system including property-based tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  registerConditionalMessage,
  getConditionalMessage,
  getConditionalRoomDescription,
  clearConditionalMessages,
  initializeConditionalMessages,
  ConditionalMessage
} from './conditionalMessages.js';
import { GameState } from './state.js';
import { createInitialGameState } from './factories/gameFactory.js';
import { ObjectFlag } from './data/flags.js';

describe('Conditional Messages', () => {
  beforeEach(() => {
    clearConditionalMessages();
  });

  describe('Basic Functionality', () => {
    it('should register and retrieve conditional messages', () => {
      const message: ConditionalMessage = {
        messageId: 'TEST-MESSAGE',
        variants: [
          {
            condition: (state) => state.getFlag('WON_FLAG'),
            message: 'You won!'
          }
        ],
        defaultMessage: 'Keep trying.'
      };

      registerConditionalMessage(message);

      const state = new GameState();
      state.setFlag('WON_FLAG', false);
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('Keep trying.');

      state.setFlag('WON_FLAG', true);
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('You won!');
    });

    it('should return default message when no variant matches', () => {
      const message: ConditionalMessage = {
        messageId: 'TEST-MESSAGE',
        variants: [
          {
            condition: (state) => state.getFlag('WON_FLAG'),
            message: 'Variant message'
          }
        ],
        defaultMessage: 'Default message'
      };

      registerConditionalMessage(message);

      const state = new GameState();
      state.setFlag('WON_FLAG', false);
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('Default message');
    });

    it('should return first matching variant', () => {
      const message: ConditionalMessage = {
        messageId: 'TEST-MESSAGE',
        variants: [
          {
            condition: (state) => state.score > 100,
            message: 'High score!'
          },
          {
            condition: (state) => state.score > 50,
            message: 'Medium score'
          }
        ],
        defaultMessage: 'Low score'
      };

      registerConditionalMessage(message);

      const state = new GameState();
      state.score = 150;
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('High score!');

      state.score = 75;
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('Medium score');

      state.score = 25;
      expect(getConditionalMessage('TEST-MESSAGE', state)).toBe('Low score');
    });
  });

  describe('WEST-OF-HOUSE Conditional Description', () => {
    it('should show secret path when WON_FLAG is set', () => {
      initializeConditionalMessages();
      const state = createInitialGameState();

      // Default message without WON_FLAG
      state.setFlag('WON_FLAG', false);
      const defaultDesc = getConditionalRoomDescription('WEST-OF-HOUSE', state);
      expect(defaultDesc).toContain('white house');
      expect(defaultDesc).toContain('boarded front');
      expect(defaultDesc).toContain('door');
      expect(defaultDesc).not.toContain('secret path');

      // Message with WON_FLAG
      state.setFlag('WON_FLAG', true);
      const wonDesc = getConditionalRoomDescription('WEST-OF-HOUSE', state);
      expect(wonDesc).toContain('white house');
      expect(wonDesc).toContain('boarded front');
      expect(wonDesc).toContain('door');
      expect(wonDesc).toContain('secret path leads southwest');
    });
  });

  describe('EAST-OF-HOUSE Conditional Description', () => {
    it('should show window state correctly', () => {
      initializeConditionalMessages();
      const state = createInitialGameState();

      const window = state.getObject('KITCHEN-WINDOW');
      if (!window) {
        throw new Error('KITCHEN-WINDOW not found');
      }

      // Window slightly ajar (default)
      window.flags.delete(ObjectFlag.OPENBIT);
      const ajarDesc = getConditionalRoomDescription('EAST-OF-HOUSE', state);
      expect(ajarDesc).toContain('slightly ajar');
      expect(ajarDesc).not.toContain('which is open');

      // Window open
      window.flags.add(ObjectFlag.OPENBIT);
      const openDesc = getConditionalRoomDescription('EAST-OF-HOUSE', state);
      expect(openDesc).toContain('which is open');
      expect(openDesc).not.toContain('slightly ajar');
    });
  });

  describe('LIVING-ROOM Conditional Description', () => {
    it('should handle multiple state combinations', () => {
      initializeConditionalMessages();
      const state = createInitialGameState();

      const trapDoor = state.getObject('TRAP-DOOR');
      if (!trapDoor) {
        throw new Error('TRAP-DOOR not found');
      }

      // Test various combinations
      state.setFlag('MAGIC_FLAG', false);
      state.setGlobalVariable('RUG_MOVED', false);
      trapDoor.flags.delete(ObjectFlag.OPENBIT);
      const desc1 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc1).toContain('large oriental rug');
      expect(desc1).toContain('nailed shut');

      // Magic flag set
      state.setFlag('MAGIC_FLAG', true);
      const desc2 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc2).toContain('cyclops-shaped opening');
      expect(desc2).not.toContain('nailed shut');

      // Trap door open
      trapDoor.flags.add(ObjectFlag.OPENBIT);
      const desc3 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc3).toContain('open trap door');
    });

    /**
     * Test exact living room description text for rug/trap door states
     * Validates: Requirements 4.1, 4.2, 4.3
     */
    it('should show correct description for rug and trap door states', () => {
      initializeConditionalMessages();
      const state = createInitialGameState();

      const trapDoor = state.getObject('TRAP-DOOR');
      if (!trapDoor) {
        throw new Error('TRAP-DOOR not found');
      }

      // Reset to default state
      state.setFlag('MAGIC_FLAG', false);
      state.setGlobalVariable('RUG_MOVED', false);
      trapDoor.flags.delete(ObjectFlag.OPENBIT);

      // Test 1: Rug not moved - should show "a large oriental rug in the center of the room"
      const desc1 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc1).toContain('a large oriental rug in the center of the room');

      // Test 2: Rug moved, door closed - should show "a closed trap door at your feet"
      state.setGlobalVariable('RUG_MOVED', true);
      const desc2 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc2).toContain('a closed trap door at your feet');
      expect(desc2).not.toContain('large oriental rug');

      // Test 3: Rug moved, door open - should show "a rug lying beside an open trap door"
      trapDoor.flags.add(ObjectFlag.OPENBIT);
      const desc3 = getConditionalRoomDescription('LIVING-ROOM', state);
      expect(desc3).toContain('a rug lying beside an open trap door');
    });
  });

  /**
   * Feature: complete-text-accuracy, Property 1: Message text exactness (conditional subset)
   * Validates: Requirements 3.5
   * 
   * For any implemented conditional message, the text should match the original ZIL
   * message exactly (with normalized whitespace)
   */
  describe('Property: Message text exactness (conditional subset)', () => {
    it('should match original ZIL text exactly', () => {
      initializeConditionalMessages();

      // Expected messages from ZIL source (1actions.zil)
      // Note: Line breaks (\n) match the original ZIL formatting
      const expectedMessages = {
        'WEST-OF-HOUSE-DEFAULT': 'You are standing in an open field west of a white house, with a boarded front\ndoor.',
        'WEST-OF-HOUSE-WON': 'You are standing in an open field west of a white house, with a boarded front\ndoor. A secret path leads southwest into the forest.',
        'EAST-OF-HOUSE-OPEN': 'You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is open.',
        'EAST-OF-HOUSE-AJAR': 'You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is slightly ajar.'
      };

      const state = createInitialGameState();

      // Test WEST-OF-HOUSE default
      state.setFlag('WON_FLAG', false);
      const westDefault = getConditionalRoomDescription('WEST-OF-HOUSE', state);
      expect(westDefault).toBe(expectedMessages['WEST-OF-HOUSE-DEFAULT']);

      // Test WEST-OF-HOUSE with WON_FLAG
      state.setFlag('WON_FLAG', true);
      const westWon = getConditionalRoomDescription('WEST-OF-HOUSE', state);
      expect(westWon).toBe(expectedMessages['WEST-OF-HOUSE-WON']);

      // Test EAST-OF-HOUSE with window open
      const window = state.getObject('KITCHEN-WINDOW');
      if (window) {
        window.flags.add(ObjectFlag.OPENBIT);
        const eastOpen = getConditionalRoomDescription('EAST-OF-HOUSE', state);
        expect(eastOpen).toBe(expectedMessages['EAST-OF-HOUSE-OPEN']);

        // Test EAST-OF-HOUSE with window ajar
        window.flags.delete(ObjectFlag.OPENBIT);
        const eastAjar = getConditionalRoomDescription('EAST-OF-HOUSE', state);
        expect(eastAjar).toBe(expectedMessages['EAST-OF-HOUSE-AJAR']);
      }
    });
  });

  /**
   * Feature: complete-text-accuracy, Property 3: Conditional message correctness
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4
   * 
   * For any conditional message, the variant displayed should match the game state
   * conditions exactly as specified in the original ZIL
   */
  describe('Property: Conditional message correctness', () => {
    it('should always select correct variant based on state', () => {
      initializeConditionalMessages();

      fc.assert(
        fc.property(
          // Generate random game states
          fc.record({
            wonFlag: fc.boolean(),
            magicFlag: fc.boolean(),
            rugMoved: fc.boolean(),
            trapDoorOpen: fc.boolean(),
            windowOpen: fc.boolean()
          }),
          (stateConfig) => {
            const state = createInitialGameState();

            // Apply state configuration
            state.setFlag('WON_FLAG', stateConfig.wonFlag);
            state.setFlag('MAGIC_FLAG', stateConfig.magicFlag);
            state.setGlobalVariable('RUG_MOVED', stateConfig.rugMoved);

            const trapDoor = state.getObject('TRAP-DOOR');
            if (trapDoor) {
              if (stateConfig.trapDoorOpen) {
                trapDoor.flags.add(ObjectFlag.OPENBIT);
              } else {
                trapDoor.flags.delete(ObjectFlag.OPENBIT);
              }
            }

            const window = state.getObject('KITCHEN-WINDOW');
            if (window) {
              if (stateConfig.windowOpen) {
                window.flags.add(ObjectFlag.OPENBIT);
              } else {
                window.flags.delete(ObjectFlag.OPENBIT);
              }
            }

            // Test WEST-OF-HOUSE
            const westDesc = getConditionalRoomDescription('WEST-OF-HOUSE', state);
            if (westDesc) {
              if (stateConfig.wonFlag) {
                // Should mention secret path
                if (!westDesc.includes('secret path')) {
                  return false;
                }
              } else {
                // Should not mention secret path
                if (westDesc.includes('secret path')) {
                  return false;
                }
              }
            }

            // Test EAST-OF-HOUSE
            const eastDesc = getConditionalRoomDescription('EAST-OF-HOUSE', state);
            if (eastDesc) {
              if (stateConfig.windowOpen) {
                // Should say "open"
                if (!eastDesc.includes('which is open')) {
                  return false;
                }
              } else {
                // Should say "slightly ajar"
                if (!eastDesc.includes('slightly ajar')) {
                  return false;
                }
              }
            }

            // Test LIVING-ROOM
            const livingDesc = getConditionalRoomDescription('LIVING-ROOM', state);
            if (livingDesc) {
              // Check magic flag consistency
              if (stateConfig.magicFlag) {
                if (!livingDesc.includes('cyclops-shaped opening')) {
                  return false;
                }
                if (livingDesc.includes('nailed shut')) {
                  return false;
                }
              } else {
                if (livingDesc.includes('cyclops-shaped opening')) {
                  return false;
                }
                if (!livingDesc.includes('nailed shut')) {
                  return false;
                }
              }

              // Check trap door state
              if (stateConfig.trapDoorOpen) {
                if (!livingDesc.includes('open trap door')) {
                  return false;
                }
              }

              // Check rug state
              if (stateConfig.rugMoved) {
                if (livingDesc.includes('large oriental rug in the center')) {
                  return false;
                }
              } else if (!stateConfig.trapDoorOpen) {
                if (!livingDesc.includes('large oriental rug')) {
                  return false;
                }
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
