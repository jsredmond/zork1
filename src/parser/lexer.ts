/**
 * Lexer - Tokenization
 * Converts input strings into tokens
 */

/**
 * Token types for parsed words
 */
export enum TokenType {
  VERB = 'VERB',
  NOUN = 'NOUN',
  ADJECTIVE = 'ADJECTIVE',
  PREPOSITION = 'PREPOSITION',
  ARTICLE = 'ARTICLE',
  CONJUNCTION = 'CONJUNCTION',
  PRONOUN = 'PRONOUN',
  DIRECTION = 'DIRECTION',
  NUMBER = 'NUMBER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Represents a single token from the input
 */
export interface Token {
  word: string;        // The original word (lowercase)
  type: TokenType;     // The type of token
  position: number;    // Position in the original input
}

/**
 * Lexer class for tokenizing user input
 */
export class Lexer {
  /**
   * Tokenize an input string into an array of tokens
   * @param input - The user input string
   * @returns Array of tokens
   */
  tokenize(input: string): Token[] {
    if (!input || input.trim().length === 0) {
      return [];
    }

    // Convert to lowercase for case-insensitive matching
    const normalized = input.toLowerCase().trim();

    // Split on whitespace and punctuation, keeping track of positions
    const tokens: Token[] = [];
    let currentWord = '';
    let wordStartPosition = 0;

    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];

      // Check if character is whitespace or punctuation
      if (this.isWhitespaceOrPunctuation(char)) {
        // If we have accumulated a word, create a token
        if (currentWord.length > 0) {
          tokens.push({
            word: currentWord,
            type: TokenType.UNKNOWN, // Type will be determined by vocabulary lookup
            position: wordStartPosition,
          });
          currentWord = '';
        }
        // Skip whitespace and punctuation (don't create tokens for them)
      } else {
        // Start or continue building a word
        if (currentWord.length === 0) {
          wordStartPosition = i;
        }
        currentWord += char;
      }
    }

    // Don't forget the last word if input doesn't end with whitespace/punctuation
    if (currentWord.length > 0) {
      tokens.push({
        word: currentWord,
        type: TokenType.UNKNOWN,
        position: wordStartPosition,
      });
    }

    return tokens;
  }

  /**
   * Check if a character is whitespace or punctuation
   * @param char - Character to check
   * @returns true if whitespace or punctuation
   */
  private isWhitespaceOrPunctuation(char: string): boolean {
    // Whitespace characters
    if (/\s/.test(char)) {
      return true;
    }

    // Common punctuation marks
    const punctuation = '.,;:!?"\'-()[]{}';
    return punctuation.includes(char);
  }
}
