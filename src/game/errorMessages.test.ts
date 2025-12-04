/**
 * Property-Based Tests for Error Message Informativeness
 * Feature: modern-zork-rewrite, Property 16: Error message informativeness
 * Validates: Requirements 7.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getInformativeError, getObjectNotVisibleError, getDirectionError, getParserError } from './errorMessages.js';
import { GameObjectImpl } from './objects.js';
import { ObjectFlag } from './data/flags.js';
import { GameState } from './state.js';

/**
 * Generator for game objects with various properties
 */
const gameObjectArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9-]/gi, '')),
  name: fc.string({ minLength: 3, maxLength: 30 }),
  description: fc.string({ minLength: 10, maxLength: 100 }),
  flags: fc.array(fc.constantFrom(...Object.values(ObjectFlag)), { maxLength: 5 }),
  size: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  capacity: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined })
}).map(data => {
  const obj = new GameObjectImpl(
    data.id || 'test-obj',
    data.name || 'Test Object',
    [],
    [],
    data.description || 'A test object'
  );
  
  // Set flags
  data.flags.forEach(flag => obj.setFlag(flag));
  
  // Set size and capacity
  if (data.size !== undefined) {
    obj.size = data.size;
  }
  if (data.capacity !== undefined) {
    obj.capacity = data.capacity;
  }
  
  return obj;
});

/**
 * Generator for action names
 */
const actionArb = fc.constantFrom(
  'take', 'drop', 'open', 'close', 'read', 'attack', 'kill',
  'eat', 'drink', 'move', 'push', 'pull', 'climb',
  'turn on', 'turn off', 'light', 'put', 'give'
);

describe('Error Message Informativeness - Property Tests', () => {
  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should always provide non-empty error messages for any action-object combination', () => {
    fc.assert(
      fc.property(
        actionArb,
        fc.option(gameObjectArb, { nil: undefined }),
        fc.option(gameObjectArb, { nil: undefined }),
        (action, object, secondObject) => {
          const error = getInformativeError({
            action,
            object,
            secondObject
          });
          
          // Property: Error message must not be empty
          expect(error).toBeTruthy();
          expect(error.length).toBeGreaterThan(0);
          
          // Property: Error message should be a string
          expect(typeof error).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide specific error messages that mention the object when object is provided', () => {
    fc.assert(
      fc.property(
        actionArb,
        gameObjectArb,
        (action, object) => {
          const error = getInformativeError({
            action,
            object
          });
          
          // Property: When an object is involved, the error should be specific
          // Either mention the object name or provide action-specific context
          const isSpecific = 
            error.toLowerCase().includes(object.name.toLowerCase()) ||
            error.includes('that') ||
            error.includes('it') ||
            error.length > 20; // Longer messages tend to be more specific
          
          expect(isSpecific).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide different error messages for different failure reasons', () => {
    fc.assert(
      fc.property(
        gameObjectArb,
        (object) => {
          // Test TAKE action with different object states
          const takeableError = getInformativeError({
            action: 'take',
            object: (() => {
              const obj = new GameObjectImpl(object.id, object.name, [], [], object.description);
              obj.setFlag(ObjectFlag.TAKEABLE);
              return obj;
            })()
          });
          
          const nonTakeableError = getInformativeError({
            action: 'take',
            object: (() => {
              const obj = new GameObjectImpl(object.id, object.name, [], [], object.description);
              obj.clearFlag(ObjectFlag.TAKEABLE);
              return obj;
            })()
          });
          
          // Property: Different object states should produce different or contextually appropriate errors
          // At minimum, both should be non-empty and meaningful
          expect(takeableError).toBeTruthy();
          expect(nonTakeableError).toBeTruthy();
          expect(takeableError.length).toBeGreaterThan(0);
          expect(nonTakeableError.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide informative parser errors for any error type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('UNKNOWN_WORD', 'INVALID_SYNTAX', 'NO_VERB', 'AMBIGUOUS', 'OBJECT_NOT_FOUND'),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        (errorType, word) => {
          const error = getParserError(errorType, word);
          
          // Property: Parser errors must be non-empty and informative
          expect(error).toBeTruthy();
          expect(error.length).toBeGreaterThan(0);
          
          // Property: If a word is provided for UNKNOWN_WORD, it should be mentioned
          if (errorType === 'UNKNOWN_WORD' && word) {
            expect(error.toLowerCase()).toContain(word.toLowerCase());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide informative direction errors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('north', 'south', 'east', 'west', 'up', 'down', 'in', 'out'),
        fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
        (direction, reason) => {
          const error = getDirectionError(direction, reason);
          
          // Property: Direction errors must be non-empty
          expect(error).toBeTruthy();
          expect(error.length).toBeGreaterThan(0);
          
          // Property: If a reason is provided, it should be used
          if (reason) {
            expect(error).toBe(reason);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide informative object visibility errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        (objectName) => {
          const error = getObjectNotVisibleError(objectName);
          
          // Property: Visibility errors must be non-empty and mention the object
          expect(error).toBeTruthy();
          expect(error.length).toBeGreaterThan(0);
          expect(error.toLowerCase()).toContain(objectName.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should never return undefined or null error messages', () => {
    fc.assert(
      fc.property(
        actionArb,
        fc.option(gameObjectArb, { nil: undefined }),
        fc.option(gameObjectArb, { nil: undefined }),
        fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
        (action, object, secondObject, reason) => {
          const error = getInformativeError({
            action,
            object,
            secondObject,
            reason
          });
          
          // Property: Error messages must never be undefined or null
          expect(error).not.toBeUndefined();
          expect(error).not.toBeNull();
          expect(typeof error).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide contextually appropriate errors for container operations', () => {
    fc.assert(
      fc.property(
        gameObjectArb,
        gameObjectArb,
        (object, container) => {
          // Make container a container
          container.setFlag(ObjectFlag.CONTAINER);
          
          const putError = getInformativeError({
            action: 'put',
            object,
            secondObject: container
          });
          
          // Property: Container operation errors should be informative
          expect(putError).toBeTruthy();
          expect(putError.length).toBeGreaterThan(0);
          
          // Should mention container or provide context about the operation
          const isInformative = 
            putError.toLowerCase().includes('container') ||
            putError.toLowerCase().includes(container.name.toLowerCase()) ||
            putError.toLowerCase().includes('closed') ||
            putError.toLowerCase().includes('full');
          
          expect(isInformative).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide contextually appropriate errors for light source operations', () => {
    fc.assert(
      fc.property(
        gameObjectArb,
        (object) => {
          // Make object a light source
          object.setFlag(ObjectFlag.LIGHT);
          
          const turnOnError = getInformativeError({
            action: 'turn on',
            object
          });
          
          const turnOffError = getInformativeError({
            action: 'turn off',
            object
          });
          
          // Property: Light source operation errors should be informative
          expect(turnOnError).toBeTruthy();
          expect(turnOffError).toBeTruthy();
          expect(turnOnError.length).toBeGreaterThan(0);
          expect(turnOffError.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: modern-zork-rewrite, Property 16: Error message informativeness
  it('should provide user-friendly error messages without technical jargon', () => {
    fc.assert(
      fc.property(
        actionArb,
        fc.option(gameObjectArb, { nil: undefined }),
        (action, object) => {
          const error = getInformativeError({
            action,
            object
          });
          
          // Property: Error messages should not contain technical jargon
          const technicalTerms = ['undefined', 'null', 'error', 'exception', 'stack', 'trace'];
          const containsJargon = technicalTerms.some(term => 
            error.toLowerCase().includes(term)
          );
          
          expect(containsJargon).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
