/**
 * Unit tests for Lexer
 */

import { describe, it, expect } from 'vitest';
import { Lexer, TokenType } from './lexer';

describe('Lexer', () => {
  const lexer = new Lexer();

  describe('tokenization of simple commands', () => {
    it('should tokenize a single word', () => {
      const tokens = lexer.tokenize('north');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].word).toBe('north');
      expect(tokens[0].position).toBe(0);
    });

    it('should tokenize a two-word command', () => {
      const tokens = lexer.tokenize('take lamp');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should tokenize a multi-word command', () => {
      const tokens = lexer.tokenize('put sword in case');
      expect(tokens).toHaveLength(4);
      expect(tokens[0].word).toBe('put');
      expect(tokens[1].word).toBe('sword');
      expect(tokens[2].word).toBe('in');
      expect(tokens[3].word).toBe('case');
    });

    it('should handle multiple spaces between words', () => {
      const tokens = lexer.tokenize('take    lamp');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should handle leading and trailing whitespace', () => {
      const tokens = lexer.tokenize('  take lamp  ');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should return empty array for empty input', () => {
      const tokens = lexer.tokenize('');
      expect(tokens).toHaveLength(0);
    });

    it('should return empty array for whitespace-only input', () => {
      const tokens = lexer.tokenize('   ');
      expect(tokens).toHaveLength(0);
    });
  });

  describe('handling of punctuation and special characters', () => {
    it('should remove periods from input', () => {
      const tokens = lexer.tokenize('take lamp.');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should remove commas from input', () => {
      const tokens = lexer.tokenize('take lamp, sword');
      expect(tokens).toHaveLength(3);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
      expect(tokens[2].word).toBe('sword');
    });

    it('should remove question marks from input', () => {
      const tokens = lexer.tokenize('what is this?');
      expect(tokens).toHaveLength(3);
      expect(tokens[0].word).toBe('what');
      expect(tokens[1].word).toBe('is');
      expect(tokens[2].word).toBe('this');
    });

    it('should remove exclamation marks from input', () => {
      const tokens = lexer.tokenize('help!');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].word).toBe('help');
    });

    it('should handle multiple punctuation marks', () => {
      const tokens = lexer.tokenize('take lamp, sword, and rope.');
      expect(tokens).toHaveLength(5);
      expect(tokens.map(t => t.word)).toEqual(['take', 'lamp', 'sword', 'and', 'rope']);
    });

    it('should remove quotes from input', () => {
      const tokens = lexer.tokenize('say "hello"');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('say');
      expect(tokens[1].word).toBe('hello');
    });

    it('should handle parentheses', () => {
      const tokens = lexer.tokenize('take (lamp)');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });
  });

  describe('case insensitivity', () => {
    it('should convert uppercase to lowercase', () => {
      const tokens = lexer.tokenize('TAKE LAMP');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should convert mixed case to lowercase', () => {
      const tokens = lexer.tokenize('TaKe LaMp');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });

    it('should handle all lowercase input', () => {
      const tokens = lexer.tokenize('take lamp');
      expect(tokens).toHaveLength(2);
      expect(tokens[0].word).toBe('take');
      expect(tokens[1].word).toBe('lamp');
    });
  });

  describe('position tracking', () => {
    it('should track correct positions for simple input', () => {
      const tokens = lexer.tokenize('take lamp');
      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(5);
    });

    it('should track correct positions with multiple spaces', () => {
      const tokens = lexer.tokenize('take   lamp');
      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(7);
    });

    it('should track correct positions with punctuation', () => {
      const tokens = lexer.tokenize('take, lamp.');
      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(6);
    });
  });
});
