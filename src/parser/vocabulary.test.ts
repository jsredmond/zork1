/**
 * Unit tests for Vocabulary class
 * Tests word lookup, abbreviation expansion, and unknown word handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Vocabulary } from './vocabulary';
import { TokenType } from './lexer';

describe('Vocabulary', () => {
  let vocabulary: Vocabulary;

  beforeEach(() => {
    vocabulary = new Vocabulary();
  });

  describe('Word Lookup', () => {
    describe('Verbs', () => {
      it('should recognize common verbs', () => {
        expect(vocabulary.lookupWord('take')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('drop')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('examine')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('open')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('close')).toBe(TokenType.VERB);
      });

      it('should recognize verb synonyms', () => {
        expect(vocabulary.lookupWord('get')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('grab')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('hold')).toBe(TokenType.VERB);
      });

      it('should be case-insensitive', () => {
        expect(vocabulary.lookupWord('TAKE')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('Take')).toBe(TokenType.VERB);
        expect(vocabulary.lookupWord('take')).toBe(TokenType.VERB);
      });
    });

    describe('Nouns', () => {
      it('should recognize common nouns', () => {
        expect(vocabulary.lookupWord('lamp')).toBe(TokenType.NOUN);
        expect(vocabulary.lookupWord('sword')).toBe(TokenType.NOUN);
        expect(vocabulary.lookupWord('door')).toBe(TokenType.NOUN);
        expect(vocabulary.lookupWord('mailbox')).toBe(TokenType.NOUN);
      });

      it('should recognize treasure nouns', () => {
        expect(vocabulary.lookupWord('skull')).toBe(TokenType.NOUN);
        expect(vocabulary.lookupWord('chalice')).toBe(TokenType.NOUN);
        expect(vocabulary.lookupWord('trident')).toBe(TokenType.NOUN);
      });
    });

    describe('Adjectives', () => {
      it('should recognize common adjectives', () => {
        expect(vocabulary.lookupWord('crystal')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('silver')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('golden')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('rusty')).toBe(TokenType.ADJECTIVE);
      });

      it('should recognize size adjectives', () => {
        expect(vocabulary.lookupWord('small')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('large')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('huge')).toBe(TokenType.ADJECTIVE);
      });
      
      /**
       * Z-Machine Parity Fix: WHITE adjective
       * WHITE should be recognized as an adjective for "white house"
       */
      it('should recognize WHITE as an adjective (Z-Machine parity)', () => {
        expect(vocabulary.lookupWord('white')).toBe(TokenType.ADJECTIVE);
        expect(vocabulary.lookupWord('WHITE')).toBe(TokenType.ADJECTIVE);
      });
    });

    describe('Prepositions', () => {
      it('should recognize common prepositions', () => {
        expect(vocabulary.lookupWord('with')).toBe(TokenType.PREPOSITION);
        expect(vocabulary.lookupWord('in')).toBe(TokenType.PREPOSITION);
        expect(vocabulary.lookupWord('on')).toBe(TokenType.PREPOSITION);
        expect(vocabulary.lookupWord('under')).toBe(TokenType.PREPOSITION);
      });

      it('should recognize preposition synonyms', () => {
        expect(vocabulary.lookupWord('inside')).toBe(TokenType.PREPOSITION);
        expect(vocabulary.lookupWord('into')).toBe(TokenType.PREPOSITION);
        expect(vocabulary.lookupWord('onto')).toBe(TokenType.PREPOSITION);
      });
    });

    describe('Directions', () => {
      it('should recognize cardinal directions', () => {
        expect(vocabulary.lookupWord('north')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('south')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('east')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('west')).toBe(TokenType.DIRECTION);
      });

      it('should recognize up and down', () => {
        expect(vocabulary.lookupWord('up')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('down')).toBe(TokenType.DIRECTION);
      });

      it('should recognize diagonal directions', () => {
        expect(vocabulary.lookupWord('northeast')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('northwest')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('southeast')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('southwest')).toBe(TokenType.DIRECTION);
      });

      it('should recognize in/out directions', () => {
        // Note: 'in' and 'enter' are handled as verbs, not directions
        // This allows "put X in Y" to work with 'in' as a preposition
        expect(vocabulary.lookupWord('out')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('exit')).toBe(TokenType.DIRECTION);
        expect(vocabulary.lookupWord('leave')).toBe(TokenType.DIRECTION);
      });
    });

    describe('Articles', () => {
      it('should recognize articles', () => {
        expect(vocabulary.lookupWord('the')).toBe(TokenType.ARTICLE);
        expect(vocabulary.lookupWord('a')).toBe(TokenType.ARTICLE);
        expect(vocabulary.lookupWord('an')).toBe(TokenType.ARTICLE);
      });
    });

    describe('Pronouns', () => {
      it('should recognize pronouns', () => {
        expect(vocabulary.lookupWord('it')).toBe(TokenType.PRONOUN);
        expect(vocabulary.lookupWord('them')).toBe(TokenType.PRONOUN);
        expect(vocabulary.lookupWord('all')).toBe(TokenType.PRONOUN);
      });
    });

    describe('Conjunctions', () => {
      it('should recognize conjunctions', () => {
        expect(vocabulary.lookupWord('and')).toBe(TokenType.CONJUNCTION);
        expect(vocabulary.lookupWord('then')).toBe(TokenType.CONJUNCTION);
      });
    });
  });

  describe('Abbreviation Expansion', () => {
    it('should expand direction abbreviations', () => {
      expect(vocabulary.expandAbbreviation('n')).toBe('north');
      expect(vocabulary.expandAbbreviation('s')).toBe('south');
      expect(vocabulary.expandAbbreviation('e')).toBe('east');
      expect(vocabulary.expandAbbreviation('w')).toBe('west');
      expect(vocabulary.expandAbbreviation('u')).toBe('up');
      expect(vocabulary.expandAbbreviation('d')).toBe('down');
    });

    it('should expand diagonal direction abbreviations', () => {
      expect(vocabulary.expandAbbreviation('ne')).toBe('northeast');
      expect(vocabulary.expandAbbreviation('nw')).toBe('northwest');
      expect(vocabulary.expandAbbreviation('se')).toBe('southeast');
      expect(vocabulary.expandAbbreviation('sw')).toBe('southwest');
    });

    it('should expand command abbreviations', () => {
      expect(vocabulary.expandAbbreviation('i')).toBe('inventory');
      expect(vocabulary.expandAbbreviation('x')).toBe('examine');
      expect(vocabulary.expandAbbreviation('l')).toBe('look');
      expect(vocabulary.expandAbbreviation('z')).toBe('wait');
      expect(vocabulary.expandAbbreviation('q')).toBe('quit');
    });

    it('should be case-insensitive', () => {
      expect(vocabulary.expandAbbreviation('N')).toBe('north');
      expect(vocabulary.expandAbbreviation('I')).toBe('inventory');
      expect(vocabulary.expandAbbreviation('X')).toBe('examine');
    });

    it('should return original word if not an abbreviation', () => {
      expect(vocabulary.expandAbbreviation('take')).toBe('take');
      expect(vocabulary.expandAbbreviation('lamp')).toBe('lamp');
      expect(vocabulary.expandAbbreviation('xyz')).toBe('xyz');
    });

    it('should identify abbreviations correctly', () => {
      expect(vocabulary.isAbbreviation('n')).toBe(true);
      expect(vocabulary.isAbbreviation('i')).toBe(true);
      expect(vocabulary.isAbbreviation('x')).toBe(true);
      expect(vocabulary.isAbbreviation('take')).toBe(false);
      expect(vocabulary.isAbbreviation('lamp')).toBe(false);
    });
  });

  describe('Unknown Word Handling', () => {
    it('should return UNKNOWN for unrecognized words', () => {
      expect(vocabulary.lookupWord('frobozz')).toBe(TokenType.UNKNOWN);
      expect(vocabulary.lookupWord('foobar')).toBe(TokenType.UNKNOWN);
      expect(vocabulary.lookupWord('asdfgh')).toBe(TokenType.UNKNOWN);
    });

    it('should return false for hasWord on unknown words', () => {
      expect(vocabulary.hasWord('frobozz')).toBe(false);
      expect(vocabulary.hasWord('foobar')).toBe(false);
    });

    it('should recognize easter egg commands', () => {
      // xyzzy and plugh are valid easter egg commands
      expect(vocabulary.lookupWord('xyzzy')).toBe(TokenType.VERB);
      expect(vocabulary.lookupWord('plugh')).toBe(TokenType.VERB);
      expect(vocabulary.hasWord('xyzzy')).toBe(true);
      expect(vocabulary.hasWord('plugh')).toBe(true);
    });

    it('should return true for hasWord on known words', () => {
      expect(vocabulary.hasWord('take')).toBe(true);
      expect(vocabulary.hasWord('lamp')).toBe(true);
      expect(vocabulary.hasWord('north')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle a complete command vocabulary', () => {
      // "take the lamp"
      expect(vocabulary.lookupWord('take')).toBe(TokenType.VERB);
      expect(vocabulary.lookupWord('the')).toBe(TokenType.ARTICLE);
      expect(vocabulary.lookupWord('lamp')).toBe(TokenType.NOUN);
    });

    it('should handle commands with prepositions', () => {
      // "put sword in case"
      expect(vocabulary.lookupWord('put')).toBe(TokenType.VERB);
      expect(vocabulary.lookupWord('sword')).toBe(TokenType.NOUN);
      expect(vocabulary.lookupWord('in')).toBe(TokenType.PREPOSITION);
      expect(vocabulary.lookupWord('case')).toBe(TokenType.NOUN);
    });

    it('should handle commands with adjectives', () => {
      // "examine crystal skull"
      expect(vocabulary.lookupWord('examine')).toBe(TokenType.VERB);
      expect(vocabulary.lookupWord('crystal')).toBe(TokenType.ADJECTIVE);
      expect(vocabulary.lookupWord('skull')).toBe(TokenType.NOUN);
    });

    it('should handle abbreviated commands', () => {
      // "x" -> "examine"
      const expanded = vocabulary.expandAbbreviation('x');
      expect(vocabulary.lookupWord(expanded)).toBe(TokenType.VERB);
    });
  });
});
