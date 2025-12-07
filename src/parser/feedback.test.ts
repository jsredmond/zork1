/**
 * Tests for Parser Feedback System
 * Validates OOPS, AGAIN/G command handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParserFeedback } from './feedback.js';

describe('ParserFeedback - OOPS Command', () => {
  let feedback: ParserFeedback;

  beforeEach(() => {
    feedback = new ParserFeedback();
  });

  it('should handle OOPS with valid unknown word', () => {
    // Simulate unknown word scenario
    feedback.recordFailedCommand('take the xyzzy');
    feedback.recordUnknownWord('xyzzy', 2);

    const result = feedback.handleOops('sword');
    
    expect(result.success).toBe(true);
    expect(result.correctedInput).toBe('take the sword');
  });

  it('should return error when no word to replace', () => {
    // No unknown word recorded
    const result = feedback.handleOops('sword');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('There was no word to replace!');
  });

  it('should clear unknown word state after successful OOPS', () => {
    feedback.recordFailedCommand('take xyzzy');
    feedback.recordUnknownWord('xyzzy', 1);

    feedback.handleOops('sword');
    
    // Second OOPS should fail
    const result = feedback.handleOops('lamp');
    expect(result.success).toBe(false);
    expect(result.message).toBe('There was no word to replace!');
  });

  it('should provide warning for multi-word OOPS', () => {
    const warning = feedback.getOopsMultiWordWarning();
    expect(warning).toBe('Warning: only the first word after OOPS is used.');
  });

  it('should handle OOPS at different word positions', () => {
    feedback.recordFailedCommand('put the xyzzy in the case');
    feedback.recordUnknownWord('xyzzy', 2);

    const result = feedback.handleOops('sword');
    
    expect(result.success).toBe(true);
    expect(result.correctedInput).toBe('put the sword in the case');
  });
});

describe('ParserFeedback - AGAIN/G Command', () => {
  let feedback: ParserFeedback;

  beforeEach(() => {
    feedback = new ParserFeedback();
  });

  it('should repeat last successful command', () => {
    feedback.recordSuccessfulCommand('take sword');

    const result = feedback.handleAgain();
    
    expect(result.success).toBe(true);
    expect(result.repeatedInput).toBe('take sword');
  });

  it('should return error when no previous command', () => {
    const result = feedback.handleAgain();
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Beg pardon?');
  });

  it('should not repeat failed commands', () => {
    feedback.recordFailedCommand('take xyzzy');

    const result = feedback.handleAgain();
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('That would just repeat a mistake.');
  });

  it('should repeat after successful command following failed one', () => {
    feedback.recordFailedCommand('take xyzzy');
    feedback.recordSuccessfulCommand('take sword');

    const result = feedback.handleAgain();
    
    expect(result.success).toBe(true);
    expect(result.repeatedInput).toBe('take sword');
  });

  it('should provide error message for fragments', () => {
    const error = feedback.getAgainFragmentError();
    expect(error).toBe("It's difficult to repeat fragments.");
  });

  it('should provide error message for syntax errors', () => {
    const error = feedback.getAgainSyntaxError();
    expect(error).toBe("I couldn't understand that sentence.");
  });
});

describe('ParserFeedback - State Management', () => {
  let feedback: ParserFeedback;

  beforeEach(() => {
    feedback = new ParserFeedback();
  });

  it('should track parser state correctly', () => {
    feedback.recordSuccessfulCommand('take sword');
    
    const state = feedback.getState();
    expect(state.lastCommand).toBe('take sword');
    expect(state.canRepeat).toBe(true);
    expect(state.hasUnknownWord).toBe(false);
  });

  it('should reset state completely', () => {
    feedback.recordSuccessfulCommand('take sword');
    feedback.recordUnknownWord('xyzzy', 1);
    
    feedback.reset();
    
    const state = feedback.getState();
    expect(state.lastCommand).toBe('');
    expect(state.canRepeat).toBe(false);
    expect(state.hasUnknownWord).toBe(false);
  });

  it('should clear unknown word independently', () => {
    feedback.recordSuccessfulCommand('take sword');
    feedback.recordUnknownWord('xyzzy', 1);
    
    feedback.clearUnknownWord();
    
    const state = feedback.getState();
    expect(state.hasUnknownWord).toBe(false);
    expect(state.canRepeat).toBe(true); // Should not affect repeat state
  });
});

describe('ParserFeedback - Parser Error Messages', () => {
  let feedback: ParserFeedback;

  beforeEach(() => {
    feedback = new ParserFeedback();
  });

  it('should format unknown word error correctly', () => {
    const error = feedback.getUnknownWordError('xyzzy');
    expect(error).toBe('I don\'t know the word "xyzzy".');
  });

  it('should format ambiguity error with no candidates', () => {
    const error = feedback.getAmbiguityError('one', []);
    expect(error).toBe('Which one do you mean?');
  });

  it('should format ambiguity error with one candidate', () => {
    const error = feedback.getAmbiguityError('sword', ['rusty sword']);
    expect(error).toBe('Which sword do you mean, the rusty sword?');
  });

  it('should format ambiguity error with two candidates', () => {
    const error = feedback.getAmbiguityError('sword', ['rusty sword', 'elvish sword']);
    expect(error).toBe('Which sword do you mean, the rusty sword or the elvish sword?');
  });

  it('should format ambiguity error with multiple candidates', () => {
    const error = feedback.getAmbiguityError('sword', ['rusty sword', 'elvish sword', 'wooden sword']);
    expect(error).toBe('Which sword do you mean, the rusty sword, the elvish sword, or the wooden sword?');
  });

  it('should format cant use word error', () => {
    const error = feedback.getCantUseWordError('the');
    expect(error).toBe('You can\'t use the word "the" here.');
  });

  it('should provide SAY nothing happens message', () => {
    const message = feedback.getSayNothingHappens();
    expect(message).toBe('Nothing happens.');
  });

  it('should provide generic parse error', () => {
    const error = feedback.getParseError();
    expect(error).toBe('I don\'t understand that.');
  });
});
