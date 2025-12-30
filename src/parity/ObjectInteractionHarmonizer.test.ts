/**
 * ObjectInteractionHarmonizer Tests
 * 
 * Property 7: Error Message Consistency
 * Tests that for any error condition, TypeScript produces identical messages to Z-Machine
 * 
 * Validates: Requirements 3.1, 3.2, 4.1, 4.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ObjectInteractionHarmonizer } from './ObjectInteractionHarmonizer.js';
import { GameState } from '../game/state.js';

describe('ObjectInteractionHarmonizer', () => {
  let harmonizer: ObjectInteractionHarmonizer;
  let state: GameState;

  beforeEach(() => {
    harmonizer = new ObjectInteractionHarmonizer();
    state = new GameState();
  });

  describe('Unit Tests - Drop Command', () => {
    it('should harmonize "drop" without object to Z-Machine format', () => {
      const tsMessage = "There seems to be a noun missing in that sentence!";
      const result = harmonizer.harmonizeDropCommand(tsMessage, false);
      
      expect(result).toBe("What do you want to drop?");
    });

    it('should not change "drop" message when object is provided', () => {
      const tsMessage = "Dropped.";
      const result = harmonizer.harmonizeDropCommand(tsMessage, true);
      
      expect(result).toBe("Dropped.");
    });
  });

  describe('Unit Tests - Object Visibility', () => {
    it('should harmonize "put" visibility error to possession error', () => {
      const tsMessage = "You can't see any box here!";
      const result = harmonizer.harmonizeObjectVisibility(tsMessage, 'box', false, 'put');
      
      expect(result).toBe("You don't have that!");
    });

    it('should not change visibility error for non-put commands', () => {
      const tsMessage = "You can't see any box here!";
      const result = harmonizer.harmonizeObjectVisibility(tsMessage, 'box', false, 'examine');
      
      expect(result).toBe("You can't see any box here!");
    });
  });

  describe('Unit Tests - Verb Without Object Errors', () => {
    it('should return correct error for "drop" without object', () => {
      const error = harmonizer.getVerbWithoutObjectError('drop');
      expect(error).toBe("What do you want to drop?");
    });

    it('should return correct error for "take" without object', () => {
      const error = harmonizer.getVerbWithoutObjectError('take');
      expect(error).toBe("What do you want to take?");
    });

    it('should return correct error for "get" without object', () => {
      const error = harmonizer.getVerbWithoutObjectError('get');
      expect(error).toBe("What do you want to take?");
    });

    it('should return correct error for "put" without object', () => {
      const error = harmonizer.getVerbWithoutObjectError('put');
      expect(error).toBe("What do you want to put?");
    });

    it('should return default error for unknown verb', () => {
      const error = harmonizer.getVerbWithoutObjectError('xyzzy');
      expect(error).toBe("There seems to be a noun missing in that sentence!");
    });
  });

  describe('Unit Tests - Error Detection', () => {
    it('should detect object visibility errors', () => {
      expect(harmonizer.isObjectVisibilityError("You can't see any lamp here!")).toBe(true);
      expect(harmonizer.isObjectVisibilityError("I don't see any lamp here.")).toBe(true);
      expect(harmonizer.isObjectVisibilityError("There is no lamp here.")).toBe(true);
      expect(harmonizer.isObjectVisibilityError("Taken.")).toBe(false);
    });

    it('should detect possession errors', () => {
      expect(harmonizer.isPossessionError("You don't have that!")).toBe(true);
      expect(harmonizer.isPossessionError("You aren't holding that.")).toBe(true);
      expect(harmonizer.isPossessionError("Taken.")).toBe(false);
    });
  });

  describe('Unit Tests - Error Format Normalization', () => {
    it('should capitalize first letter', () => {
      const result = harmonizer.normalizeErrorFormat("you can't do that");
      expect(result.charAt(0)).toBe('Y');
    });

    it('should add period if missing', () => {
      const result = harmonizer.normalizeErrorFormat("You can't do that");
      expect(result).toBe("You can't do that.");
    });

    it('should not add period if already present', () => {
      const result = harmonizer.normalizeErrorFormat("You can't do that.");
      expect(result).toBe("You can't do that.");
    });

    it('should not add period if ends with question mark', () => {
      const result = harmonizer.normalizeErrorFormat("What do you want to drop?");
      expect(result).toBe("What do you want to drop?");
    });
  });

  describe('Property 7: Error Message Consistency', () => {
    /**
     * Property: Drop without object produces consistent error
     * For any "drop" command without object, error should match Z-Machine
     */
    it('should produce consistent "drop" without object errors', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (hasObject) => {
            const tsMessage = hasObject 
              ? "Dropped." 
              : "There seems to be a noun missing in that sentence!";
            
            const result = harmonizer.harmonizeDropCommand(tsMessage, hasObject);
            
            if (!hasObject) {
              expect(result).toBe("What do you want to drop?");
            } else {
              expect(result).toBe("Dropped.");
            }
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Verb without object errors are consistent
     * For any verb that requires an object, error format should be consistent
     */
    it('should produce consistent verb-without-object errors', () => {
      const verbs = ['drop', 'take', 'get', 'put', 'examine', 'open', 'close', 'read'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...verbs),
          (verb) => {
            const error = harmonizer.getVerbWithoutObjectError(verb);
            
            // All errors should be questions
            expect(error).toMatch(/\?$/);
            // All errors should start with "What do you want to"
            expect(error).toMatch(/^What do you want to/);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property: Object visibility errors are properly formatted
     * For any object name, visibility error should follow Z-Machine format
     */
    it('should format object visibility errors consistently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z]+$/i.test(s)),
          (objectName) => {
            const tsMessage = `You can't see any ${objectName} here!`;
            
            // For non-put commands, message should stay the same
            const result = harmonizer.harmonizeObjectVisibility(tsMessage, objectName, false, 'examine');
            expect(result).toBe(tsMessage);
            
            // For put commands without possession, should change to "You don't have that!"
            const putResult = harmonizer.harmonizeObjectVisibility(tsMessage, objectName, false, 'put');
            expect(putResult).toBe("You don't have that!");
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Harmonization is idempotent
     * Harmonizing an already-harmonized message should not change it
     */
    it('should be idempotent - harmonizing twice produces same result', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            "What do you want to drop?",
            "You don't have that!",
            "Taken.",
            "Dropped."
          ),
          fc.constantFrom('drop', 'take', 'put', 'examine'),
          (message, verb) => {
            const command = `${verb} something`;
            
            const result1 = harmonizer.harmonizeResponse(message, command, state);
            const result2 = harmonizer.harmonizeResponse(result1.message, command, state);
            
            expect(result1.message).toBe(result2.message);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Property: Error detection is accurate
     * Visibility and possession errors should be correctly identified
     */
    it('should accurately detect error types', () => {
      const visibilityErrors = [
        "You can't see any lamp here!",
        "I don't see any sword here.",
        "There is no key here."
      ];
      
      const possessionErrors = [
        "You don't have that!",
        "You aren't holding that.",
        "You're not carrying that."
      ];
      
      const nonErrors = [
        "Taken.",
        "Dropped.",
        "OK.",
        "You are in a forest."
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...visibilityErrors),
          (error) => {
            expect(harmonizer.isObjectVisibilityError(error)).toBe(true);
            return true;
          }
        ),
        { numRuns: 10 }
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...possessionErrors),
          (error) => {
            expect(harmonizer.isPossessionError(error)).toBe(true);
            return true;
          }
        ),
        { numRuns: 10 }
      );
      
      fc.assert(
        fc.property(
          fc.constantFrom(...nonErrors),
          (message) => {
            expect(harmonizer.isObjectVisibilityError(message)).toBe(false);
            expect(harmonizer.isPossessionError(message)).toBe(false);
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Integration Tests', () => {
    it('should harmonize full response for drop command', () => {
      const result = harmonizer.harmonizeResponse(
        "There seems to be a noun missing in that sentence!",
        "drop",
        state
      );
      
      expect(result.wasHarmonized).toBe(true);
      expect(result.message).toBe("What do you want to drop?");
    });

    it('should not harmonize successful commands', () => {
      const result = harmonizer.harmonizeResponse(
        "Dropped.",
        "drop lamp",
        state
      );
      
      expect(result.wasHarmonized).toBe(false);
      expect(result.message).toBe("Dropped.");
    });
  });
});
