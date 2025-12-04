/**
 * Lexer - Tokenization
 * Converts input strings into tokens
 */

export enum TokenType {
  VERB = 'VERB',
  NOUN = 'NOUN',
  ADJECTIVE = 'ADJECTIVE',
  PREPOSITION = 'PREPOSITION',
  ARTICLE = 'ARTICLE',
  UNKNOWN = 'UNKNOWN',
}

export interface Token {
  word: string;
  type: TokenType;
  position: number;
}

export class Lexer {
  // TODO: Implement tokenization
}
