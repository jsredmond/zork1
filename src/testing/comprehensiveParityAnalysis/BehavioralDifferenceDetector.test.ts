/**
 * Behavioral Difference Detector Tests
 * 
 * Property-based tests for timing difference classification and analysis.
 * Uses fast-check for property-based testing with minimum 100 iterations.
 * 
 * Feature: comprehensive-parity-analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  BehavioralDifferenceDetector,
  TimingDifferenceAnalysis,
  ObjectBehaviorAnalysis,
  ParserDifferenceAnalysis
} from './BehavioralDifferenceDetector.js';
import { 
  CommandDifference, 
  DifferenceType, 
  IssueSeverity 
} from '../spotTesting/types.js';

describe('BehavioralDifferenceDetector', () => {
  let detector: BehavioralDifferenceDetector;

  beforeEach(() => {
    detector = new BehavioralDifferenceDetector();
  });

  describe('Property 2: Timing Difference Classification', () => {
    /**
     * Property 2: Timing Difference Classification
     * For any timing-related difference detected, the system should correctly
     * identify whether it represents status bar contamination or a legitimate
     * behavioral difference.
     * 
     * Validates: Requirements 1.2
     */

    it('should detect status bar contamination when TS has status bar but ZM does not', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // Room name
          fc.integer({ min: 0, max: 999 }), // Score
          fc.integer({ min: 1, max: 9999 }), // Moves
          fc.string({ minLength: 1, maxLength: 100 }), // Game content
          (roomName, score, moves, content) => {
            const tsOutput = `${roomName}    Score: ${score}    Moves: ${moves}\n\n${content}`;
            const zmOutput = content;
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isStatusBarContamination).toBe(true);
            expect(analysis.confidence).toBe('high');
            expect(analysis.rootCause).toContain('Status bar');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect status bar contamination when both have status bar', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 999 }),
          fc.integer({ min: 1, max: 9999 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (roomName, score, moves, content) => {
            const tsOutput = `${roomName}    Score: ${score}    Moves: ${moves}\n\n${content}`;
            const zmOutput = `${roomName}    Score: ${score}    Moves: ${moves}\n\n${content}`;
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isStatusBarContamination).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not detect status bar contamination when neither has status bar', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          (tsContent, zmContent) => {
            // Ensure no status bar pattern
            const tsOutput = tsContent.replace(/Score:/gi, 'Points:').replace(/Moves:/gi, 'Turns:');
            const zmOutput = zmContent.replace(/Score:/gi, 'Points:').replace(/Moves:/gi, 'Turns:');
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isStatusBarContamination).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect daemon timing issues when daemon keywords differ', () => {
      const daemonKeywords = ['lamp', 'lantern', 'thief', 'troll', 'cyclops'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...daemonKeywords),
          fc.string({ minLength: 1, maxLength: 100 }),
          (keyword, baseContent) => {
            const tsOutput = `${baseContent} The ${keyword} is here.`;
            const zmOutput = baseContent;
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isDaemonTiming).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect atmospheric message differences', () => {
      const atmosphericPhrases = [
        'song bird',
        'chirping',
        'gentle breeze',
        'wind howls'
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...atmosphericPhrases),
          fc.string({ minLength: 1, maxLength: 100 }),
          (phrase, baseContent) => {
            const tsOutput = `${baseContent} You hear a ${phrase}.`;
            const zmOutput = baseContent;
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isAtmosphericMessage).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect move counter synchronization issues', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 9999 }),
          fc.integer({ min: 1, max: 100 }), // Offset
          fc.string({ minLength: 1, maxLength: 50 }),
          (moves, offset, roomName) => {
            const tsOutput = `${roomName}    Score: 0    Moves: ${moves}`;
            const zmOutput = `${roomName}    Score: 0    Moves: ${moves + offset}`;
            
            const analysis = detector.detectTimingDifferences(tsOutput, zmOutput);
            
            expect(analysis.isMoveCounterSync).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Object Behavior Analysis', () => {
    it('should detect drop command error message inconsistency', () => {
      const tsOutput = 'There seems to be a noun missing in that sentence!';
      const zmOutput = 'What do you want to drop?';
      
      const analysis = detector.detectObjectBehaviorDifferences(tsOutput, zmOutput);
      
      expect(analysis.isErrorMessageInconsistency).toBe(true);
      expect(analysis.affectedCommandType).toBe('drop');
      expect(analysis.confidence).toBe('high');
    });

    it('should detect object visibility vs possession error inconsistency', () => {
      const tsOutput = "You can't see any sword here!";
      const zmOutput = "You don't have that!";
      
      const analysis = detector.detectObjectBehaviorDifferences(tsOutput, zmOutput);
      
      expect(analysis.isErrorMessageInconsistency).toBe(true);
      expect(analysis.rootCause).toContain('visibility');
    });

    it('should identify affected command type correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('drop', 'take', 'put', 'open', 'close', 'examine'),
          (commandType) => {
            const tsOutput = `You can't ${commandType} that.`;
            const zmOutput = `You can't ${commandType} that.`;
            
            const analysis = detector.detectObjectBehaviorDifferences(tsOutput, zmOutput);
            
            expect(analysis.affectedCommandType).toBe(commandType);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Parser Difference Analysis', () => {
    it('should detect vocabulary recognition issues', () => {
      const tsOutput = "You can't see any room here!";
      const zmOutput = 'I don\'t know the word "room".';
      
      const analysis = detector.detectParserDifferences(tsOutput, zmOutput);
      
      expect(analysis.isVocabularyIssue).toBe(true);
      expect(analysis.problematicElement).toBe('room');
      expect(analysis.confidence).toBe('high');
    });

    it('should extract problematic word from ZM output', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 3, maxLength: 15 }),
          (word) => {
            const tsOutput = `You can't see any ${word} here!`;
            const zmOutput = `I don't know the word "${word}".`;
            
            const analysis = detector.detectParserDifferences(tsOutput, zmOutput);
            
            expect(analysis.problematicElement).toBe(word);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect command syntax issues', () => {
      const tsOutput = "That sentence isn't one I recognize.";
      const zmOutput = "I don't understand that.";
      
      const analysis = detector.detectParserDifferences(tsOutput, zmOutput);
      
      expect(analysis.isCommandSyntaxIssue).toBe(true);
    });
  });

  describe('Difference Classification', () => {
    it('should classify timing differences correctly', () => {
      const difference: CommandDifference = {
        commandIndex: 0,
        command: 'look',
        tsOutput: 'West of House    Score: 0    Moves: 1\n\nYou are standing...',
        zmOutput: 'You are standing...',
        differenceType: DifferenceType.TIMING_DIFFERENCE,
        severity: IssueSeverity.CRITICAL
      };
      
      const result = detector.classifyDifference(difference);
      
      expect(result.classifiedType).toBe(DifferenceType.TIMING_DIFFERENCE);
      expect(result.timingAnalysis).toBeDefined();
      expect(result.timingAnalysis?.isStatusBarContamination).toBe(true);
      expect(result.priority).toBe('critical');
    });

    it('should classify object behavior differences correctly', () => {
      const difference: CommandDifference = {
        commandIndex: 0,
        command: 'drop',
        tsOutput: 'There seems to be a noun missing in that sentence!',
        zmOutput: 'What do you want to drop?',
        differenceType: DifferenceType.OBJECT_BEHAVIOR,
        severity: IssueSeverity.CRITICAL
      };
      
      const result = detector.classifyDifference(difference);
      
      expect(result.classifiedType).toBe(DifferenceType.OBJECT_BEHAVIOR);
      expect(result.objectBehaviorAnalysis).toBeDefined();
      expect(result.objectBehaviorAnalysis?.isErrorMessageInconsistency).toBe(true);
      expect(result.priority).toBe('high');
    });

    it('should classify parser differences correctly', () => {
      const difference: CommandDifference = {
        commandIndex: 0,
        command: 'examine room',
        tsOutput: "You can't see any room here!",
        zmOutput: 'I don\'t know the word "room".',
        differenceType: DifferenceType.PARSER_DIFFERENCE,
        severity: IssueSeverity.CRITICAL
      };
      
      const result = detector.classifyDifference(difference);
      
      expect(result.classifiedType).toBe(DifferenceType.PARSER_DIFFERENCE);
      expect(result.parserAnalysis).toBeDefined();
      expect(result.parserAnalysis?.isVocabularyIssue).toBe(true);
      expect(result.priority).toBe('medium');
    });

    it('should provide recommended fixes for all difference types', () => {
      const differences: CommandDifference[] = [
        {
          commandIndex: 0,
          command: 'look',
          tsOutput: 'Room    Score: 0    Moves: 1\n\nContent',
          zmOutput: 'Content',
          differenceType: DifferenceType.TIMING_DIFFERENCE,
          severity: IssueSeverity.CRITICAL
        },
        {
          commandIndex: 1,
          command: 'drop',
          tsOutput: 'There seems to be a noun missing in that sentence!',
          zmOutput: 'What do you want to drop?',
          differenceType: DifferenceType.OBJECT_BEHAVIOR,
          severity: IssueSeverity.CRITICAL
        },
        {
          commandIndex: 2,
          command: 'examine room',
          tsOutput: "You can't see any room here!",
          zmOutput: 'I don\'t know the word "room".',
          differenceType: DifferenceType.PARSER_DIFFERENCE,
          severity: IssueSeverity.CRITICAL
        }
      ];
      
      const results = detector.analyzeBatch(differences);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.recommendedFix).toBeDefined();
        expect(result.recommendedFix.length).toBeGreaterThan(0);
        expect(result.recommendedFix).not.toBe('Investigate manually');
      });
    });
  });

  describe('Batch Analysis', () => {
    it('should analyze multiple differences correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              commandIndex: fc.nat(199),
              command: fc.string({ minLength: 1, maxLength: 30 }),
              tsOutput: fc.string({ minLength: 1, maxLength: 200 }),
              zmOutput: fc.string({ minLength: 1, maxLength: 200 }),
              differenceType: fc.constantFrom(
                DifferenceType.TIMING_DIFFERENCE,
                DifferenceType.OBJECT_BEHAVIOR,
                DifferenceType.PARSER_DIFFERENCE
              ),
              severity: fc.constantFrom(
                IssueSeverity.LOW,
                IssueSeverity.MEDIUM,
                IssueSeverity.HIGH,
                IssueSeverity.CRITICAL
              )
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (differences) => {
            const results = detector.analyzeBatch(differences);
            
            expect(results.length).toBe(differences.length);
            results.forEach((result, index) => {
              expect(result.difference).toBe(differences[index]);
              expect(result.rootCause).toBeDefined();
              expect(result.recommendedFix).toBeDefined();
              expect(result.priority).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
