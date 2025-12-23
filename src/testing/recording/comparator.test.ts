/**
 * Unit tests for TranscriptComparator
 * 
 * Tests normalization, similarity calculation, severity classification,
 * and parity score calculation.
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

import { describe, it, expect } from 'vitest';
import { TranscriptComparator, createComparator } from './comparator';
import { Transcript, TranscriptEntry } from './types';

// Helper to create a transcript entry
function createEntry(
  index: number,
  command: string,
  output: string,
  turnNumber?: number
): TranscriptEntry {
  return {
    index,
    command,
    output,
    turnNumber: turnNumber ?? index,
  };
}

// Helper to create a transcript
function createTranscript(
  id: string,
  source: 'typescript' | 'z-machine',
  entries: TranscriptEntry[]
): Transcript {
  return {
    id,
    source,
    startTime: new Date(),
    endTime: new Date(),
    entries,
    metadata: {},
  };
}

describe('TranscriptComparator', () => {
  describe('stripStatusBar', () => {
    it('should remove status bar lines from output', () => {
      const comparator = new TranscriptComparator();
      
      const input = `West of House                                    Score: 0        Moves: 1
You are standing in an open field west of a white house.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe('You are standing in an open field west of a white house.');
    });

    it('should handle negative scores', () => {
      const comparator = new TranscriptComparator();
      
      const input = `Cellar                                           Score: -10      Moves: 25
It is pitch black.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe('It is pitch black.');
    });

    it('should preserve non-status-bar lines', () => {
      const comparator = new TranscriptComparator();
      
      const input = `You are in a forest.
There is a path to the north.
You can see a lamp here.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe(input);
    });

    it('should handle multiple status bar lines', () => {
      const comparator = new TranscriptComparator();
      
      const input = `West of House                                    Score: 0        Moves: 1
You are standing in an open field.
North of House                                   Score: 0        Moves: 2
You are facing the north side of a white house.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe(`You are standing in an open field.
You are facing the north side of a white house.`);
    });

    it('should handle empty input', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.stripStatusBar('')).toBe('');
    });

    it('should not remove lines that mention Score or Moves in normal text', () => {
      const comparator = new TranscriptComparator();
      
      const input = `Your score is 10 points.
You have made 5 moves.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe(input);
    });

    it('should handle status bar with varying whitespace', () => {
      const comparator = new TranscriptComparator();
      
      const input = `Living Room                    Score: 25   Moves: 100
There is a trophy case here.`;
      
      const result = comparator.stripStatusBar(input);
      
      expect(result).toBe('There is a trophy case here.');
    });
  });

  describe('normalizeLineWrapping', () => {
    it('should join lines that were wrapped mid-sentence', () => {
      const comparator = new TranscriptComparator();
      
      // Simulates Z-Machine wrapping at ~80 chars
      const input = `You are standing in an open field west of a white house, with a boarded front
door.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe('You are standing in an open field west of a white house, with a boarded front door.');
    });

    it('should preserve paragraph breaks (empty lines)', () => {
      const comparator = new TranscriptComparator();
      
      const input = `This is the first paragraph.

This is the second paragraph.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`This is the first paragraph.

This is the second paragraph.`);
    });

    it('should not join lines that end with sentence-ending punctuation', () => {
      const comparator = new TranscriptComparator();
      
      const input = `You are in a forest.
There is a path to the north.
You can see a lamp here.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`You are in a forest.
There is a path to the north.
You can see a lamp here.`);
    });

    it('should handle lines ending with exclamation marks', () => {
      const comparator = new TranscriptComparator();
      
      const input = `You win!
Congratulations!`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`You win!
Congratulations!`);
    });

    it('should handle lines ending with question marks', () => {
      const comparator = new TranscriptComparator();
      
      const input = `Do you want to continue?
Press any key.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`Do you want to continue?
Press any key.`);
    });

    it('should handle lines ending with quotes', () => {
      const comparator = new TranscriptComparator();
      
      const input = `The sign says "Welcome"
You read it carefully.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`The sign says "Welcome"
You read it carefully.`);
    });

    it('should handle multiple wrapped lines in sequence', () => {
      const comparator = new TranscriptComparator();
      
      const input = `This is a very long sentence that has been wrapped across
multiple lines because the Z-Machine has a limited
display width.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe('This is a very long sentence that has been wrapped across multiple lines because the Z-Machine has a limited display width.');
    });

    it('should handle empty input', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeLineWrapping('')).toBe('');
    });

    it('should handle single line input', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeLineWrapping('Hello world.')).toBe('Hello world.');
    });

    it('should handle multiple paragraph breaks', () => {
      const comparator = new TranscriptComparator();
      
      const input = `First paragraph.

Second paragraph.

Third paragraph.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe(`First paragraph.

Second paragraph.

Third paragraph.`);
    });

    it('should handle mixed wrapped and non-wrapped content', () => {
      const comparator = new TranscriptComparator();
      
      const input = `West of House
You are standing in an open field west of a white house, with a boarded
front door.
There is a small mailbox here.`;
      
      const result = comparator.normalizeLineWrapping(input);
      
      // "West of House" doesn't end with punctuation, so it joins with next line
      // But the next line ends with "boarded" which doesn't end with punctuation
      // So it continues joining until we hit a period
      expect(result).toBe(`West of House You are standing in an open field west of a white house, with a boarded front door.
There is a small mailbox here.`);
    });

    it('should trim whitespace from lines before processing', () => {
      const comparator = new TranscriptComparator();
      
      const input = `  This is a line with leading spaces  
  and this continues the sentence.  `;
      
      const result = comparator.normalizeLineWrapping(input);
      
      expect(result).toBe('This is a line with leading spaces and this continues the sentence.');
    });
  });

  describe('normalizeOutput', () => {
    it('should normalize line endings', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeOutput('hello\r\nworld')).toBe('hello\nworld');
      expect(comparator.normalizeOutput('hello\rworld')).toBe('hello\nworld');
      expect(comparator.normalizeOutput('hello\nworld')).toBe('hello\nworld');
    });

    it('should collapse multiple spaces', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeOutput('hello   world')).toBe('hello world');
      expect(comparator.normalizeOutput('hello\t\tworld')).toBe('hello world');
    });

    it('should collapse multiple newlines', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeOutput('hello\n\n\nworld')).toBe('hello\nworld');
    });


    it('should trim leading/trailing whitespace from lines', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeOutput('  hello  \n  world  ')).toBe('hello\nworld');
    });

    it('should handle empty strings', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.normalizeOutput('')).toBe('');
      expect(comparator.normalizeOutput('   ')).toBe('');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.calculateSimilarity('hello', 'hello')).toBe(1);
      expect(comparator.calculateSimilarity('', '')).toBe(1);
    });

    it('should return 0 when one string is empty', () => {
      const comparator = new TranscriptComparator();
      
      expect(comparator.calculateSimilarity('hello', '')).toBe(0);
      expect(comparator.calculateSimilarity('', 'hello')).toBe(0);
    });

    it('should return high similarity for similar strings', () => {
      const comparator = new TranscriptComparator();
      
      // "hello" vs "hallo" - 1 character difference out of 5
      const similarity = comparator.calculateSimilarity('hello', 'hallo');
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThan(1);
    });

    it('should return low similarity for very different strings', () => {
      const comparator = new TranscriptComparator();
      
      const similarity = comparator.calculateSimilarity('hello', 'xyz');
      expect(similarity).toBeLessThan(0.5);
    });
  });

  describe('classifySeverity', () => {
    it('should classify formatting-only differences', () => {
      const comparator = new TranscriptComparator();
      
      const severity = comparator.classifySeverity(
        'hello  world',
        'hello world',
        0.95,
        comparator.getOptions()
      );
      expect(severity).toBe('formatting');
    });

    it('should classify minor differences for high similarity', () => {
      const comparator = new TranscriptComparator();
      
      const severity = comparator.classifySeverity(
        'You see a lamp here.',
        'You see a lantern here.',
        0.9,
        comparator.getOptions()
      );
      expect(severity).toBe('minor');
    });

    it('should classify major differences for medium similarity', () => {
      const comparator = new TranscriptComparator();
      
      const severity = comparator.classifySeverity(
        'You are in a forest.',
        'You are in a cave.',
        0.75,
        comparator.getOptions()
      );
      expect(severity).toBe('major');
    });

    it('should classify critical differences for low similarity', () => {
      const comparator = new TranscriptComparator();
      
      const severity = comparator.classifySeverity(
        'You win!',
        'Game over.',
        0.3,
        comparator.getOptions()
      );
      expect(severity).toBe('critical');
    });

    it('should classify known variations as minor', () => {
      const comparator = new TranscriptComparator({
        knownVariations: ['combat outcome'],
      });
      
      const severity = comparator.classifySeverity(
        'The troll hits you. combat outcome varies.',
        'The troll misses.',
        0.3,
        comparator.getOptions()
      );
      expect(severity).toBe('minor');
    });
  });


  describe('compare', () => {
    it('should identify exact matches', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'West of House'),
        createEntry(1, 'inventory', 'You are empty-handed.'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'West of House'),
        createEntry(1, 'inventory', 'You are empty-handed.'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      expect(report.exactMatches).toBe(2);
      expect(report.differences).toHaveLength(0);
      expect(report.parityScore).toBe(100);
    });

    it('should identify differences', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'West of House'),
        createEntry(1, 'north', 'North of House'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'West of House'),
        createEntry(1, 'north', 'You are north of the house.'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      expect(report.exactMatches).toBe(1);
      expect(report.differences.length).toBeGreaterThan(0);
      expect(report.differences[0].command).toBe('north');
    });

    it('should handle transcripts of different lengths', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'West of House'),
        createEntry(1, 'north', 'North of House'),
        createEntry(2, 'south', 'West of House'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'West of House'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      expect(report.totalCommands).toBe(3);
      expect(report.differences.length).toBe(2);
      expect(report.differences[0].severity).toBe('critical');
    });

    it('should calculate parity score correctly', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'Room A'),
        createEntry(1, 'north', 'Room B'),
        createEntry(2, 'south', 'Room A'),
        createEntry(3, 'east', 'Room C'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'Room A'),
        createEntry(1, 'north', 'Room B'),
        createEntry(2, 'south', 'Different Room'),
        createEntry(3, 'east', 'Room C'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      // 3 exact matches out of 4 commands = 75%
      expect(report.exactMatches).toBe(3);
      expect(report.parityScore).toBe(75);
    });

    it('should respect tolerance threshold for close matches', () => {
      const comparator = new TranscriptComparator({
        toleranceThreshold: 0.8,
      });
      
      // Use strings with very high similarity (only 1 char difference)
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'You are in a small room here.'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'You are in a small room here!'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      // High similarity should count as close match (above 0.8 threshold)
      expect(report.closeMatches + report.exactMatches).toBeGreaterThan(0);
    });

    it('should include command in diff entries', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'examine lamp', 'A brass lamp.'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'examine lamp', 'A brass lantern.'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      expect(report.differences[0].command).toBe('examine lamp');
      expect(report.differences[0].expected).toBe('A brass lamp.');
      expect(report.differences[0].actual).toBe('A brass lantern.');
    });

    it('should summarize differences by severity', () => {
      const comparator = new TranscriptComparator();
      
      const transcriptA = createTranscript('ts', 'typescript', [
        createEntry(0, 'look', 'Room  A'),  // formatting diff
        createEntry(1, 'north', 'Completely different output'),
      ]);
      
      const transcriptB = createTranscript('zm', 'z-machine', [
        createEntry(0, 'look', 'Room A'),
        createEntry(1, 'north', 'Something else entirely'),
      ]);
      
      const report = comparator.compare(transcriptA, transcriptB);
      
      expect(report.summary).toBeDefined();
      expect(typeof report.summary.critical).toBe('number');
      expect(typeof report.summary.major).toBe('number');
      expect(typeof report.summary.minor).toBe('number');
      expect(typeof report.summary.formatting).toBe('number');
    });
  });

  describe('createComparator factory', () => {
    it('should create a comparator with default options', () => {
      const comparator = createComparator();
      
      expect(comparator).toBeInstanceOf(TranscriptComparator);
      expect(comparator.getOptions().normalizeWhitespace).toBe(true);
    });

    it('should create a comparator with custom options', () => {
      const comparator = createComparator({
        toleranceThreshold: 0.8,
        ignoreCaseInMessages: true,
      });
      
      expect(comparator.getOptions().toleranceThreshold).toBe(0.8);
      expect(comparator.getOptions().ignoreCaseInMessages).toBe(true);
    });
  });
});
