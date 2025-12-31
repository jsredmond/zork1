/**
 * Unit tests for MessageExtractor
 * 
 * Tests header stripping, status bar stripping, prompt stripping,
 * room description handling, and action response extraction.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import {
  MessageExtractor,
  createMessageExtractor,
  extractActionResponse,
  stripGameHeader,
  stripStatusBar,
  stripPrompt,
  stripRoomDescription,
  isMovementCommand,
} from './messageExtractor';

describe('MessageExtractor', () => {
  describe('isMovementCommand', () => {
    it('should recognize cardinal directions', () => {
      expect(isMovementCommand('n')).toBe(true);
      expect(isMovementCommand('north')).toBe(true);
      expect(isMovementCommand('s')).toBe(true);
      expect(isMovementCommand('south')).toBe(true);
      expect(isMovementCommand('e')).toBe(true);
      expect(isMovementCommand('east')).toBe(true);
      expect(isMovementCommand('w')).toBe(true);
      expect(isMovementCommand('west')).toBe(true);
    });

    it('should recognize vertical directions', () => {
      expect(isMovementCommand('u')).toBe(true);
      expect(isMovementCommand('up')).toBe(true);
      expect(isMovementCommand('d')).toBe(true);
      expect(isMovementCommand('down')).toBe(true);
    });

    it('should recognize diagonal directions', () => {
      expect(isMovementCommand('ne')).toBe(true);
      expect(isMovementCommand('northeast')).toBe(true);
      expect(isMovementCommand('nw')).toBe(true);
      expect(isMovementCommand('northwest')).toBe(true);
      expect(isMovementCommand('se')).toBe(true);
      expect(isMovementCommand('southeast')).toBe(true);
      expect(isMovementCommand('sw')).toBe(true);
      expect(isMovementCommand('southwest')).toBe(true);
    });

    it('should recognize in/out commands', () => {
      expect(isMovementCommand('in')).toBe(true);
      expect(isMovementCommand('enter')).toBe(true);
      expect(isMovementCommand('out')).toBe(true);
      expect(isMovementCommand('exit')).toBe(true);
    });

    it('should recognize special movement commands', () => {
      expect(isMovementCommand('land')).toBe(true);
      expect(isMovementCommand('climb')).toBe(true);
      expect(isMovementCommand('cross')).toBe(true);
      expect(isMovementCommand('launch')).toBe(true);
    });

    it('should recognize "go <direction>" format', () => {
      expect(isMovementCommand('go north')).toBe(true);
      expect(isMovementCommand('go south')).toBe(true);
      expect(isMovementCommand('go up')).toBe(true);
      expect(isMovementCommand('go down')).toBe(true);
    });

    it('should recognize "walk <direction>" format', () => {
      expect(isMovementCommand('walk north')).toBe(true);
      expect(isMovementCommand('walk east')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isMovementCommand('NORTH')).toBe(true);
      expect(isMovementCommand('North')).toBe(true);
      expect(isMovementCommand('GO NORTH')).toBe(true);
    });

    it('should not recognize non-movement commands', () => {
      expect(isMovementCommand('look')).toBe(false);
      expect(isMovementCommand('take lamp')).toBe(false);
      expect(isMovementCommand('inventory')).toBe(false);
      expect(isMovementCommand('examine sword')).toBe(false);
      expect(isMovementCommand('open door')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isMovementCommand('  north  ')).toBe(true);
      expect(isMovementCommand('  go north  ')).toBe(true);
    });
  });

  describe('stripGameHeader', () => {
    it('should remove ZORK I title line', () => {
      const input = `ZORK I: The Great Underground Empire
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });

    it('should remove copyright lines', () => {
      const input = `Copyright (c) 1981, 1982, 1983 Infocom, Inc.
All rights reserved.
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });

    it('should remove Release and Serial number lines', () => {
      const input = `Release 88 / Serial number 840726
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });

    it('should remove The Great Underground Empire line', () => {
      const input = `The Great Underground Empire
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });

    it('should remove Loading messages', () => {
      const input = `Loading zork1.z3
Using normal formatting.
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });

    it('should preserve gameplay content after header', () => {
      const input = `ZORK I: The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc.
Release 88 / Serial number 840726

West of House
You are standing in an open field west of a white house.
There is a small mailbox here.`;
      
      const result = stripGameHeader(input);
      
      expect(result).toContain('West of House');
      expect(result).toContain('You are standing in an open field');
      expect(result).toContain('There is a small mailbox here.');
    });

    it('should handle empty input', () => {
      expect(stripGameHeader('')).toBe('');
    });

    it('should handle input with no header', () => {
      const input = `West of House
You are standing in an open field.`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe(input);
    });

    it('should remove multiple header patterns', () => {
      const input = `ZORK I: The Great Underground Empire
The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc.
All rights reserved.
ZORK is a registered trademark of Infocom, Inc.
Release 88 / Serial number 840726
West of House`;
      
      const result = stripGameHeader(input);
      
      expect(result).toBe('West of House');
    });
  });

  describe('stripStatusBar', () => {
    it('should remove status bar lines from output', () => {
      const input = `West of House                                    Score: 0        Moves: 1
You are standing in an open field west of a white house.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe('You are standing in an open field west of a white house.');
    });

    it('should handle negative scores', () => {
      const input = `Cellar                                           Score: -10      Moves: 25
It is pitch black.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe('It is pitch black.');
    });

    it('should preserve non-status-bar lines', () => {
      const input = `You are in a forest.
There is a path to the north.
You can see a lamp here.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe(input);
    });

    it('should handle multiple status bar lines', () => {
      const input = `West of House                                    Score: 0        Moves: 1
You are standing in an open field.
North of House                                   Score: 0        Moves: 2
You are facing the north side of a white house.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe(`You are standing in an open field.
You are facing the north side of a white house.`);
    });

    it('should handle empty input', () => {
      expect(stripStatusBar('')).toBe('');
    });

    it('should not remove lines that mention Score or Moves in normal text', () => {
      const input = `Your score is 10 points.
You have made 5 moves.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe(input);
    });

    it('should handle status bar with varying whitespace', () => {
      const input = `Living Room                    Score: 25   Moves: 100
There is a trophy case here.`;
      
      const result = stripStatusBar(input);
      
      expect(result).toBe('There is a trophy case here.');
    });
  });

  describe('stripPrompt', () => {
    it('should remove ">" prompts', () => {
      const input = `You are in a forest.
>`;
      
      const result = stripPrompt(input);
      
      expect(result).toBe('You are in a forest.');
    });

    it('should remove multiple prompts', () => {
      const input = `>
You are in a forest.
>
>`;
      
      const result = stripPrompt(input);
      
      expect(result).toBe('You are in a forest.');
    });

    it('should handle prompts with whitespace', () => {
      const input = `You are in a forest.
>   `;
      
      const result = stripPrompt(input);
      
      expect(result).toBe('You are in a forest.');
    });

    it('should preserve ">" in normal text', () => {
      const input = `The sign says "Go > that way"`;
      
      const result = stripPrompt(input);
      
      expect(result).toBe(input);
    });

    it('should handle empty input', () => {
      expect(stripPrompt('')).toBe('');
    });
  });

  describe('stripRoomDescription', () => {
    it('should preserve room description for movement commands', () => {
      const input = `West of House
You are standing in an open field west of a white house.
There is a small mailbox here.`;
      
      const result = stripRoomDescription(input, 'north');
      
      expect(result).toBe(input);
    });

    it('should strip room description for action commands', () => {
      const input = `West of House
You are standing in an open field west of a white house.

Taken.`;
      
      const result = stripRoomDescription(input, 'take mailbox');
      
      expect(result).toBe('Taken.');
    });

    it('should handle action response without room description', () => {
      const input = `Taken.`;
      
      const result = stripRoomDescription(input, 'take lamp');
      
      expect(result).toBe('Taken.');
    });

    it('should handle look command as non-movement', () => {
      const input = `West of House
You are standing in an open field west of a white house.`;
      
      // Look is not a movement command, so stripRoomDescription tries to strip the room
      // But since there's no separate action response after the room description,
      // the function returns empty (the room description was all there was)
      const result = stripRoomDescription(input, 'look');
      
      // For look, extractActionResponse handles this case specially
      // stripRoomDescription alone returns empty when there's only room description
      expect(result).toBe('');
    });
  });

  describe('extractActionResponse', () => {
    it('should extract action response from full output', () => {
      const output = `ZORK I: The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc.
West of House                                    Score: 0        Moves: 1
You are standing in an open field.
>`;
      
      const result = extractActionResponse(output, 'look');
      
      expect(result.response).toContain('You are standing in an open field');
      expect(result.isMovement).toBe(false);
      expect(result.originalOutput).toBe(output);
    });

    it('should identify movement commands', () => {
      const output = `North of House
You are facing the north side of a white house.`;
      
      const result = extractActionResponse(output, 'north');
      
      expect(result.isMovement).toBe(true);
      expect(result.response).toContain('North of House');
    });

    it('should preserve action response content', () => {
      const output = `Taken.`;
      
      const result = extractActionResponse(output, 'take lamp');
      
      expect(result.response).toBe('Taken.');
      expect(result.isMovement).toBe(false);
    });

    it('should handle complex output with all elements', () => {
      const output = `ZORK I: The Great Underground Empire
Copyright (c) 1981, 1982, 1983 Infocom, Inc.
Release 88 / Serial number 840726
West of House                                    Score: 0        Moves: 1
You are standing in an open field west of a white house.
There is a small mailbox here.
>`;
      
      const result = extractActionResponse(output, 'look');
      
      // Should have stripped header, status bar, and prompt
      expect(result.response).not.toContain('ZORK I');
      expect(result.response).not.toContain('Copyright');
      expect(result.response).not.toContain('Score:');
      expect(result.response).not.toContain('>');
      
      // Should preserve the actual content
      expect(result.response).toContain('You are standing');
      expect(result.response).toContain('mailbox');
    });

    it('should handle empty output', () => {
      const result = extractActionResponse('', 'look');
      
      expect(result.response).toBe('');
      expect(result.isMovement).toBe(false);
    });

    it('should handle output with only whitespace', () => {
      const result = extractActionResponse('   \n\n   ', 'look');
      
      // Should return trimmed original if nothing left
      expect(result.response).toBe('');
    });

    it('should extract room description for movement commands', () => {
      const output = `Living Room
You are in the living room. There is a doorway to the east.
A trophy case is here.`;
      
      const result = extractActionResponse(output, 'west');
      
      expect(result.isMovement).toBe(true);
      expect(result.response).toContain('Living Room');
      expect(result.response).toContain('trophy case');
    });

    it('should separate room description from action response', () => {
      const output = `West of House
You are standing in an open field.

The mailbox is now open.`;
      
      const result = extractActionResponse(output, 'open mailbox');
      
      expect(result.isMovement).toBe(false);
      // The action response should be the "mailbox is now open" part
      expect(result.response).toContain('mailbox is now open');
    });
  });

  describe('MessageExtractor class', () => {
    it('should create instance via factory function', () => {
      const extractor = createMessageExtractor();
      
      expect(extractor).toBeInstanceOf(MessageExtractor);
    });

    it('should expose all extraction methods', () => {
      const extractor = new MessageExtractor();
      
      expect(typeof extractor.extractActionResponse).toBe('function');
      expect(typeof extractor.stripGameHeader).toBe('function');
      expect(typeof extractor.stripStatusBar).toBe('function');
      expect(typeof extractor.stripPrompt).toBe('function');
      expect(typeof extractor.stripRoomDescription).toBe('function');
      expect(typeof extractor.isMovementCommand).toBe('function');
    });

    it('should work the same as standalone functions', () => {
      const extractor = new MessageExtractor();
      
      const output = `ZORK I: The Great Underground Empire
West of House                                    Score: 0        Moves: 1
You are in a field.
>`;
      
      const classResult = extractor.extractActionResponse(output, 'look');
      const funcResult = extractActionResponse(output, 'look');
      
      expect(classResult.response).toBe(funcResult.response);
      expect(classResult.isMovement).toBe(funcResult.isMovement);
    });
  });
});
