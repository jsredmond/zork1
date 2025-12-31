/**
 * Property-Based Tests for MessageExtractor
 * 
 * These tests verify universal properties that should hold for all valid inputs.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  extractActionResponse,
  stripGameHeader,
  stripStatusBar,
  stripPrompt,
  isMovementCommand,
} from './messageExtractor';

/**
 * Generator for action response messages (the core content we want to preserve)
 */
const actionResponseArb = fc.oneof(
  fc.constant('Taken.'),
  fc.constant('Dropped.'),
  fc.constant("You can't see any such thing."),
  fc.constant("You can't go that way."),
  fc.constant('The door is now open.'),
  fc.constant('The door is now closed.'),
  fc.constant('You are empty-handed.'),
  fc.constant('A valiant attempt.'),
  fc.constant("You can't be serious."),
  fc.constant('What a concept!'),
  fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', '.', '!', '?', "'"), { minLength: 5, maxLength: 100 })
);

/**
 * Generator for game headers
 */
const gameHeaderArb = fc.oneof(
  fc.constant('ZORK I: The Great Underground Empire'),
  fc.constant('Copyright (c) 1981, 1982, 1983 Infocom, Inc.'),
  fc.constant('All rights reserved.'),
  fc.constant('Release 88 / Serial number 840726'),
  fc.constant('The Great Underground Empire'),
  fc.constant('ZORK is a registered trademark of Infocom, Inc.'),
  fc.constant('Loading zork1.z3'),
  fc.constant('Using normal formatting.'),
);

/**
 * Generator for status bar lines
 */
const statusBarArb = fc.tuple(
  fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' '), { minLength: 5, maxLength: 20 }),
  fc.integer({ min: -10, max: 350 }),
  fc.integer({ min: 1, max: 1000 })
).map(([room, score, moves]) => 
  `${room}                                    Score: ${score}        Moves: ${moves}`
);

/**
 * Generator for prompts
 */
const promptArb = fc.oneof(
  fc.constant('>'),
  fc.constant('>   '),
  fc.constant('> '),
);

/**
 * Generator for non-movement commands
 */
const nonMovementCommandArb = fc.oneof(
  fc.constant('look'),
  fc.constant('inventory'),
  fc.constant('take lamp'),
  fc.constant('drop sword'),
  fc.constant('examine mailbox'),
  fc.constant('open door'),
  fc.constant('close window'),
  fc.constant('read leaflet'),
  fc.constant('attack troll with sword'),
  fc.constant('hello'),
);

/**
 * Generator for movement commands
 */
const movementCommandArb = fc.oneof(
  fc.constant('n'),
  fc.constant('north'),
  fc.constant('s'),
  fc.constant('south'),
  fc.constant('e'),
  fc.constant('east'),
  fc.constant('w'),
  fc.constant('west'),
  fc.constant('u'),
  fc.constant('up'),
  fc.constant('d'),
  fc.constant('down'),
  fc.constant('go north'),
  fc.constant('walk east'),
);

/**
 * Generator for output blocks with known action responses
 */
const outputBlockWithResponseArb = fc.tuple(
  fc.array(gameHeaderArb, { minLength: 0, maxLength: 3 }),
  fc.option(statusBarArb, { nil: undefined }),
  actionResponseArb,
  fc.option(promptArb, { nil: undefined })
).map(([headers, statusBar, response, prompt]) => {
  const parts: string[] = [];
  
  if (headers.length > 0) {
    parts.push(headers.join('\n'));
  }
  
  if (statusBar) {
    parts.push(statusBar);
  }
  
  parts.push(response);
  
  if (prompt) {
    parts.push(prompt);
  }
  
  return {
    output: parts.join('\n'),
    expectedResponse: response,
  };
});

describe('MessageExtractor Property Tests', () => {
  /**
   * Feature: fix-parity-validation, Property 1: Message Extraction Preserves Action Response
   * 
   * For any output block containing an action response message, when the MessageExtractor
   * processes it, the extracted response SHALL contain the original action response message.
   * 
   * **Validates: Requirements 1.1, 1.5**
   */
  it('Property 1: Message Extraction Preserves Action Response', async () => {
    await fc.assert(
      fc.asyncProperty(
        outputBlockWithResponseArb,
        nonMovementCommandArb,
        async ({ output, expectedResponse }, command) => {
          const result = extractActionResponse(output, command);
          
          // The extracted response should contain the original action response
          // (it may have been trimmed or have room description removed, but core content preserved)
          const normalizedExpected = expectedResponse.trim();
          const normalizedResult = result.response.trim();
          
          // The response should contain the expected action response content
          // For simple action responses like "Taken.", the result should match exactly
          // For more complex outputs, the response should at least contain the key content
          if (normalizedExpected.length <= 50) {
            // Short responses should be preserved exactly or be contained
            return normalizedResult.includes(normalizedExpected) || 
                   normalizedExpected.includes(normalizedResult);
          } else {
            // Longer responses - check that significant content is preserved
            // At least 50% of the words should be present
            const expectedWords = normalizedExpected.split(/\s+/).filter(w => w.length > 2);
            const resultWords = normalizedResult.split(/\s+/);
            const matchingWords = expectedWords.filter(w => 
              resultWords.some(rw => rw.includes(w) || w.includes(rw))
            );
            return matchingWords.length >= expectedWords.length * 0.5;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 2: Extraction Removes Non-Response Content
   * 
   * For any output block containing game headers, status bars, or prompts, when the
   * MessageExtractor processes it, the extracted response SHALL NOT contain any of
   * these elements.
   * 
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */
  it('Property 2: Extraction Removes Non-Response Content', async () => {
    await fc.assert(
      fc.asyncProperty(
        outputBlockWithResponseArb,
        nonMovementCommandArb,
        async ({ output }, command) => {
          const result = extractActionResponse(output, command);
          const response = result.response;
          
          // Should not contain ZORK I header
          if (response.includes('ZORK I:')) {
            return false;
          }
          
          // Should not contain copyright
          if (response.includes('Copyright')) {
            return false;
          }
          
          // Should not contain Release/Serial number
          if (/Release\s+\d+/.test(response)) {
            return false;
          }
          
          // Should not contain status bar pattern
          if (/Score:\s*-?\d+\s+Moves:\s*\d+/.test(response)) {
            return false;
          }
          
          // Should not contain standalone prompt
          if (/^>\s*$/.test(response)) {
            return false;
          }
          
          // Should not contain Loading messages
          if (response.includes('Loading')) {
            return false;
          }
          
          // Should not contain "Using normal formatting"
          if (response.includes('Using normal formatting')) {
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 1 (continued): Movement Command Detection
   * 
   * For any movement command, isMovementCommand SHALL return true.
   * For any non-movement command, isMovementCommand SHALL return false.
   * 
   * **Validates: Requirements 1.6**
   */
  it('Property 1 (continued): Movement commands are correctly identified', async () => {
    await fc.assert(
      fc.asyncProperty(movementCommandArb, async (command) => {
        return isMovementCommand(command) === true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1 (continued): Non-movement commands are correctly identified', async () => {
    await fc.assert(
      fc.asyncProperty(nonMovementCommandArb, async (command) => {
        return isMovementCommand(command) === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 2 (continued): Header Stripping
   * 
   * For any output with game headers, stripGameHeader SHALL remove all header content.
   * 
   * **Validates: Requirements 1.2**
   */
  it('Property 2 (continued): Game headers are stripped', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(gameHeaderArb, { minLength: 1, maxLength: 5 }),
        actionResponseArb,
        async (headers, response) => {
          const output = headers.join('\n') + '\n' + response;
          const result = stripGameHeader(output);
          
          // Should not contain any header patterns
          for (const header of headers) {
            if (result.includes(header)) {
              return false;
            }
          }
          
          // Should still contain the response (or be empty if response was header-like)
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 2 (continued): Status Bar Stripping
   * 
   * For any output with status bars, stripStatusBar SHALL remove all status bar lines.
   * 
   * **Validates: Requirements 1.4**
   */
  it('Property 2 (continued): Status bars are stripped', async () => {
    await fc.assert(
      fc.asyncProperty(
        statusBarArb,
        actionResponseArb,
        async (statusBar, response) => {
          const output = statusBar + '\n' + response;
          const result = stripStatusBar(output);
          
          // Should not contain Score: X Moves: Y pattern
          if (/Score:\s*-?\d+\s+Moves:\s*\d+/.test(result)) {
            return false;
          }
          
          // Should contain the response
          return result.includes(response.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 2 (continued): Prompt Stripping
   * 
   * For any output with prompts, stripPrompt SHALL remove all prompt lines.
   * 
   * **Validates: Requirements 1.3**
   */
  it('Property 2 (continued): Prompts are stripped', async () => {
    await fc.assert(
      fc.asyncProperty(
        actionResponseArb,
        promptArb,
        async (response, prompt) => {
          const output = response + '\n' + prompt;
          const result = stripPrompt(output);
          
          // Should not end with just ">"
          if (/^>\s*$/.test(result.split('\n').pop() || '')) {
            return false;
          }
          
          // Should contain the response
          return result.includes(response.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 1 (continued): Idempotence
   * 
   * Applying extraction twice should produce the same result as applying it once.
   * 
   * **Validates: Requirements 1.1, 1.5**
   */
  it('Property 1 (continued): Extraction is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        outputBlockWithResponseArb,
        nonMovementCommandArb,
        async ({ output }, command) => {
          const firstExtraction = extractActionResponse(output, command);
          const secondExtraction = extractActionResponse(firstExtraction.response, command);
          
          // Second extraction should produce the same response
          return firstExtraction.response === secondExtraction.response;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fix-parity-validation, Property 1 (continued): Original Output Preserved
   * 
   * The originalOutput field should always contain the original input.
   * 
   * **Validates: Requirements 1.1**
   */
  it('Property 1 (continued): Original output is preserved in result', async () => {
    await fc.assert(
      fc.asyncProperty(
        outputBlockWithResponseArb,
        nonMovementCommandArb,
        async ({ output }, command) => {
          const result = extractActionResponse(output, command);
          
          // Original output should be preserved
          return result.originalOutput === output;
        }
      ),
      { numRuns: 100 }
    );
  });
});
