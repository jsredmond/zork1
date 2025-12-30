/**
 * ObjectInteractionHarmonizer Property Tests
 * 
 * Property 4: Object Action Error Messages
 * Tests that for any object and action combination, the error message returned
 * SHALL exactly match the Z-Machine error message for that combination.
 * 
 * Validates: Requirements 2.2, 2.3, 2.6, 10.2, 10.3, 10.4, 10.5
 * 
 * Feature: achieve-99-percent-parity, Property 4: Object Action Error Messages
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ObjectInteractionHarmonizer } from './ObjectInteractionHarmonizer.js';
import { GameState } from '../game/state.js';

describe('Property 4: Object Action Error Messages', () => {
  let harmonizer: ObjectInteractionHarmonizer;
  let state: GameState;

  beforeEach(() => {
    harmonizer = new ObjectInteractionHarmonizer();
    state = new GameState();
  });

  /**
   * Property 4.1: Scenery TAKE errors match Z-Machine
   * For any scenery object (forest, house, sky, etc.), TAKE should return
   * "What a concept!" or "An interesting idea..." matching Z-Machine
   * 
   * Validates: Requirements 2.1, 10.3, 10.4
   */
  describe('Scenery TAKE errors', () => {
    it('should return "What a concept!" for abstract scenery objects', () => {
      const abstractScenery = ['forest', 'tree', 'house', 'white house', 'sky', 'sun', 'moon', 
                               'ground', 'floor', 'wall', 'ceiling', 'air', 'wind', 'clearing', 'path'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...abstractScenery),
          fc.constantFrom('take', 'get', 'pick'),
          (object, verb) => {
            const error = harmonizer.getSceneryError(object, verb);
            
            // Should return a scenery error
            expect(error).not.toBeNull();
            // Should be "What a concept!" for abstract scenery
            expect(error).toBe('What a concept!');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return "An interesting idea..." for large/impossible objects', () => {
      const largeObjects = ['dam', 'reservoir', 'river', 'water', 'mountain', 'cliff', 
                           'canyon', 'machine', 'control panel', 'lake', 'stream'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...largeObjects),
          fc.constantFrom('take', 'get', 'pick'),
          (object, verb) => {
            const error = harmonizer.getSceneryError(object, verb);
            
            // Should return a scenery error
            expect(error).not.toBeNull();
            // Should be "An interesting idea..." for large objects
            expect(error).toBe('An interesting idea...');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.2: TURN errors match Z-Machine
   * For any object requiring tools to turn, should return
   * "Your bare hands don't appear to be enough."
   * 
   * Validates: Requirements 2.2
   */
  describe('TURN errors', () => {
    it('should return "Your bare hands don\'t appear to be enough." for tool-required objects', () => {
      const toolRequiredObjects = ['bolt', 'screw', 'wheel', 'dial', 'knob', 'switch'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...toolRequiredObjects),
          (object) => {
            const error = harmonizer.getTurnError(object);
            
            // Should return the bare hands message
            expect(error).toBe("Your bare hands don't appear to be enough.");
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return scenery error for TURN on scenery objects', () => {
      const sceneryObjects = ['bolt', 'screw', 'wheel', 'dial', 'knob', 'switch'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...sceneryObjects),
          (object) => {
            const error = harmonizer.getSceneryError(object, 'turn');
            
            // Should return the bare hands message
            expect(error).toBe("Your bare hands don't appear to be enough.");
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.3: PUSH errors match Z-Machine
   * For any immovable object, PUSH should return
   * "Pushing the X isn't notably helpful."
   * 
   * Validates: Requirements 2.3
   */
  describe('PUSH errors', () => {
    it('should return "Pushing the X isn\'t notably helpful." for immovable objects', () => {
      const immovableObjects = ['wall', 'tree', 'house', 'dam', 'machine', 'boulder', 'rock'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...immovableObjects),
          (object) => {
            const error = harmonizer.getPushError(object);
            
            // Should contain the object name and the standard message format
            expect(error).toMatch(/^Pushing the .+ isn't notably helpful\.$/);
            expect(error.toLowerCase()).toContain(object.toLowerCase());
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return specific message for white house', () => {
      const error = harmonizer.getSceneryError('white house', 'push');
      expect(error).toBe("Pushing the white house isn't notably helpful.");
    });

    it('should return specific message for forest', () => {
      const error = harmonizer.getSceneryError('forest', 'push');
      expect(error).toBe("Pushing the forest isn't notably helpful.");
    });
  });

  /**
   * Property 4.4: PULL errors match Z-Machine
   * For the board specifically, should return "You can't move the board."
   * For other immovable objects, should return "You can't move the X."
   * 
   * Validates: Requirements 2.4
   */
  describe('PULL errors', () => {
    it('should return "You can\'t move the board." for the board', () => {
      const error = harmonizer.getPullError('board');
      expect(error).toBe("You can't move the board.");
    });

    it('should return "You can\'t move the X." for other immovable objects', () => {
      const immovableObjects = ['wall', 'tree', 'house', 'dam', 'machine', 'boulder', 'rock'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...immovableObjects),
          (object) => {
            const error = harmonizer.getPullError(object);
            
            // Should contain the object name and the standard message format
            expect(error).toMatch(/^You can't move the .+\.$/);
            expect(error.toLowerCase()).toContain(object.toLowerCase());
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.5: PUT possession errors match Z-Machine
   * For any PUT command where player doesn't have the object,
   * should return "You don't have that!" not "You can't see any X here!"
   * 
   * Validates: Requirements 2.6
   */
  describe('PUT possession errors', () => {
    it('should return "You don\'t have that!" for PUT when object not possessed', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z]+$/i.test(s)),
          fc.constantFrom('put', 'place', 'insert'),
          (objectName, verb) => {
            // Test harmonizeObjectVisibility
            const tsMessage = `You can't see any ${objectName} here!`;
            const result = harmonizer.harmonizeObjectVisibility(tsMessage, objectName, false, verb);
            
            // Should return "You don't have that!"
            expect(result).toBe("You don't have that!");
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify PUT possession errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('put', 'place', 'insert'),
          fc.boolean(),
          fc.boolean(),
          (verb, isInInventory, isKnown) => {
            const isPossessionError = harmonizer.isPutPossessionError(verb, isInInventory, isKnown);
            
            // Should be a possession error only if known but not in inventory
            if (isKnown && !isInInventory) {
              expect(isPossessionError).toBe(true);
            } else {
              expect(isPossessionError).toBe(false);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not identify non-PUT verbs as possession errors', () => {
      const nonPutVerbs = ['take', 'get', 'drop', 'examine', 'open', 'close'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...nonPutVerbs),
          (verb) => {
            const isPossessionError = harmonizer.isPutPossessionError(verb, false, true);
            
            // Should not be a possession error for non-PUT verbs
            expect(isPossessionError).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.6: Scenery error lookup is consistent
   * For any scenery object and verb combination, getSceneryError should
   * return consistent results across multiple calls
   * 
   * Validates: Requirements 10.2, 10.5
   */
  describe('Scenery error consistency', () => {
    it('should return consistent results for scenery error lookup', () => {
      const sceneryObjects = ['forest', 'house', 'board', 'bolt', 'wall', 'dam'];
      const verbs = ['take', 'get', 'push', 'pull', 'turn', 'open'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...sceneryObjects),
          fc.constantFrom(...verbs),
          (object, verb) => {
            // Call getSceneryError multiple times
            const result1 = harmonizer.getSceneryError(object, verb);
            const result2 = harmonizer.getSceneryError(object, verb);
            const result3 = harmonizer.getSceneryError(object, verb);
            
            // All results should be identical
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify scenery objects', () => {
      const sceneryObjects = ['forest', 'tree', 'house', 'white house', 'sky', 'ground', 
                              'wall', 'dam', 'river', 'mountain', 'bolt', 'board'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...sceneryObjects),
          (object) => {
            const isScenery = harmonizer.isSceneryObject(object);
            
            // All these should be identified as scenery
            expect(isScenery).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not identify regular objects as scenery', () => {
      const regularObjects = ['lamp', 'sword', 'key', 'coin', 'book', 'rope'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...regularObjects),
          (object) => {
            const isScenery = harmonizer.isSceneryObject(object);
            
            // Regular objects should not be scenery
            expect(isScenery).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.7: Error message format consistency
   * All error messages should be properly formatted (capitalized, punctuated)
   * 
   * Validates: Requirements 10.5
   */
  describe('Error message format consistency', () => {
    it('should produce properly formatted error messages', () => {
      const sceneryObjects = ['forest', 'house', 'board', 'bolt', 'wall', 'dam'];
      const verbs = ['take', 'push', 'pull', 'turn'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...sceneryObjects),
          fc.constantFrom(...verbs),
          (object, verb) => {
            const error = harmonizer.getSceneryError(object, verb);
            
            if (error !== null) {
              // Should start with capital letter
              expect(error.charAt(0)).toBe(error.charAt(0).toUpperCase());
              
              // Should end with punctuation
              expect(error).toMatch(/[.!?]$/);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4.8: OPEN white house error
   * OPEN on white house should return "I can't see how to get in from here."
   * 
   * Validates: Requirements 2.5
   */
  describe('OPEN white house error', () => {
    it('should return "I can\'t see how to get in from here." for OPEN white house', () => {
      const houseVariants = ['house', 'white house', 'white-house'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...houseVariants),
          (object) => {
            const error = harmonizer.getSceneryError(object, 'open');
            
            // Should return the specific message
            expect(error).toBe("I can't see how to get in from here.");
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
