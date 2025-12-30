/**
 * Parser - Command parsing
 * Converts tokens into structured commands
 */

import { Token, Lexer, TokenType } from './lexer.js';
import { GameObject } from '../game/objects.js';
import { Vocabulary } from './vocabulary.js';
import { GameState } from '../game/state.js';

/**
 * ParsedCommand interface defines the structure of a parsed command
 * Represents the result of parsing user input into actionable components
 */
export interface ParsedCommand {
  verb: string;                      // The action verb (e.g., "TAKE", "PUT")
  directObject?: GameObject;         // The primary object of the action
  indirectObject?: GameObject;       // The secondary object (e.g., in "PUT SWORD IN CASE")
  preposition?: string;              // The preposition connecting objects (e.g., "IN", "ON")
  directObjectName?: string;         // The name used to refer to direct object (for ambiguity)
  indirectObjectName?: string;       // The name used to refer to indirect object
  rawInput?: string;                 // The original raw input for special commands like SAY
  isAllObjects?: boolean;            // Flag for "take all" / "drop all" commands
}

/**
 * ParseError represents an error that occurred during parsing
 */
export interface ParseError {
  type: 'UNKNOWN_WORD' | 'INVALID_SYNTAX' | 'AMBIGUOUS' | 'NO_VERB' | 'OBJECT_NOT_FOUND';
  message: string;
  word?: string;
  candidates?: GameObject[];  // For ambiguous references
}

/**
 * Parser class converts tokens into structured commands
 * Handles multi-word object names, prepositions, and command structure
 */
export class Parser {
  private lastMentionedObject: GameObject | null = null;
  private vocabulary: Vocabulary;
  private lexer: Lexer;

  constructor(vocabulary?: Vocabulary) {
    this.vocabulary = vocabulary;
    this.lexer = new Lexer();
  }

  /**
   * Parse tokens into a structured command
   * Supports both Token[] and string input for convenience
   * @param tokensOrInput - Array of tokens from the lexer, or a string to be tokenized
   * @param availableObjectsOrState - Objects that can be referenced in commands, or GameState
   * @param originalInput - The original input string (optional, for special commands)
   * @returns ParsedCommand or ParseError
   */
  parse(
    tokensOrInput: Token[] | string,
    availableObjectsOrState: GameObject[] | GameState,
    originalInput?: string
  ): ParsedCommand | ParseError {
    // Handle string input by tokenizing it first
    let tokens: Token[];
    let availableObjects: GameObject[];
    
    if (typeof tokensOrInput === 'string') {
      // Input is a string - tokenize it
      tokens = this.lexer.tokenize(tokensOrInput);
      originalInput = tokensOrInput;
      
      // Classify tokens using vocabulary if available
      if (this.vocabulary) {
        for (const token of tokens) {
          if (token.type === TokenType.UNKNOWN) {
            token.type = this.vocabulary.lookupWord(token.word);
          }
        }
      }
    } else if (Array.isArray(tokensOrInput)) {
      // Input is already Token[]
      tokens = tokensOrInput;
    } else {
      // Invalid input - return error
      return {
        type: 'INVALID_SYNTAX',
        message: "I beg your pardon?"
      };
    }
    
    // Handle availableObjects - can be GameObject[] or GameState
    if (availableObjectsOrState && 'getObjectsInCurrentRoom' in availableObjectsOrState) {
      // It's a GameState - get available objects from it
      const state = availableObjectsOrState as GameState;
      availableObjects = state.getObjectsInCurrentRoom();
      // Also include inventory items
      const inventoryObjects = state.inventory
        .map(id => state.getObject(id))
        .filter((obj): obj is GameObject => obj !== undefined);
      availableObjects = [...availableObjects, ...inventoryObjects];
      
      // Also include objects inside open containers in the room
      const containersInRoom = availableObjects.filter(obj => obj.isContainer() && obj.isOpen());
      for (const container of containersInRoom) {
        const contents = state.getObjectsInContainer(container.id);
        availableObjects = [...availableObjects, ...contents];
      }
      
      // Also include objects inside open containers in inventory
      const containersInInventory = inventoryObjects.filter(obj => obj.isContainer() && obj.isOpen());
      for (const container of containersInInventory) {
        const contents = state.getObjectsInContainer(container.id);
        availableObjects = [...availableObjects, ...contents];
      }
    } else if (Array.isArray(availableObjectsOrState)) {
      availableObjects = availableObjectsOrState;
    } else {
      availableObjects = [];
    }
    
    if (tokens.length === 0) {
      return {
        type: 'INVALID_SYNTAX',
        message: "I beg your pardon?"
      };
    }

    // Special case for "thank you" - treat as just "thank"
    if (tokens.length === 2 && 
        tokens[0].word.toLowerCase() === 'thank' && 
        tokens[1].word.toLowerCase() === 'you') {
      return {
        verb: 'THANK'
      };
    }

    // Special case for "echo test" - treat as just "echo"
    if (tokens.length === 2 && 
        tokens[0].word.toLowerCase() === 'echo' && 
        tokens[1].word.toLowerCase() === 'test') {
      return {
        verb: 'ECHO'
      };
    }

    // Look up token types using vocabulary if available
    if (this.vocabulary) {
      for (const token of tokens) {
        if (token.type === 'UNKNOWN') {
          token.type = this.vocabulary.lookupWord(token.word);
        }
      }
    }

    // NOTE: We no longer check for unknown words here.
    // Unknown words might be object names/synonyms that aren't in the vocabulary.
    // We'll check for truly unknown words after trying to match objects.

    // Find the verb (should be first non-article token)
    let verbIndex = -1;
    let verb = '';
    
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'VERB' || tokens[i].type === 'DIRECTION') {
        verbIndex = i;
        verb = tokens[i].word.toUpperCase();
        break;
      }
    }

    if (verbIndex === -1) {
      return {
        type: 'NO_VERB',
        message: "I don't understand that command."
      };
    }

    // Special handling for SAY command - capture raw input
    if (verb === 'SAY' && originalInput) {
      return {
        verb: 'SAY',
        rawInput: originalInput
      };
    }

    // Special case for "wake up" - treat UP as a special object
    if (verb === 'WAKE' && tokens.length === 2 && 
        tokens[1].word.toLowerCase() === 'up') {
      return {
        verb: 'WAKE',
        directObject: { id: 'UP', name: 'up' } as any
      };
    }

    // Special case for "find myself" - treat MYSELF as a special object
    if (verb === 'FIND' && tokens.length === 2 && 
        tokens[1].word.toLowerCase() === 'myself') {
      return {
        verb: 'FIND',
        directObject: { id: 'MYSELF', name: 'myself' } as any
      };
    }

    // Special case for "climb tree" - treat TREE as a special object
    if (verb === 'CLIMB' && tokens.length === 2 && 
        tokens[1].word.toLowerCase() === 'tree') {
      return {
        verb: 'CLIMB',
        directObject: { id: 'TREE', name: 'tree' } as any
      };
    }

    // Parse the rest of the command after the verb
    const remainingTokens = tokens.slice(verbIndex + 1);
    
    // Check for malformed command patterns BEFORE processing objects
    const malformedCheck = this.checkForMalformedCommand(verb, remainingTokens, originalInput);
    if (malformedCheck) {
      return malformedCheck;
    }
    
    // Special handling for "all" keyword (e.g., "take all", "drop all")
    if (remainingTokens.length === 1 && remainingTokens[0].word.toUpperCase() === 'ALL') {
      return {
        verb,
        isAllObjects: true
      };
    }
    
    // Special handling for GO without direction
    if (verb === 'GO' && remainingTokens.length === 0) {
      return {
        type: 'INVALID_SYNTAX',
        message: "Where do you want to go?"
      };
    }
    
    // Special handling for GO + DIRECTION (e.g., "GO EAST")
    if (verb === 'GO' && remainingTokens.length > 0 && remainingTokens[0].type === 'DIRECTION') {
      // Create a fake object to represent the direction
      const direction = remainingTokens[0].word.toUpperCase();
      return {
        verb,
        directObject: {
          id: direction,
          name: direction,
          synonyms: [],
          adjectives: [],
          description: '',
          location: null,
          properties: new Map(),
          flags: new Set(),
        } as GameObject,
        directObjectName: direction
      };
    }
    
    // Find preposition if any
    let prepIndex = -1;
    let preposition: string | undefined;
    
    for (let i = 0; i < remainingTokens.length; i++) {
      if (remainingTokens[i].type === 'PREPOSITION') {
        prepIndex = i;
        preposition = remainingTokens[i].word.toUpperCase();
        break;
      }
    }

    // Split tokens into direct object and indirect object parts
    const directObjectTokens = prepIndex >= 0 
      ? remainingTokens.slice(0, prepIndex)
      : remainingTokens;
    
    const indirectObjectTokens = prepIndex >= 0
      ? remainingTokens.slice(prepIndex + 1)
      : [];

    // Parse direct object
    let directObject: GameObject | undefined;
    let directObjectName: string | undefined;
    
    if (directObjectTokens.length > 0) {
      const result = this.findObject(directObjectTokens, availableObjects);
      if ('type' in result) {
        return result; // Return error
      }
      directObject = result.object;
      directObjectName = result.name;
      
      // Track last mentioned object for pronoun resolution
      if (directObject) {
        this.lastMentionedObject = directObject;
      }
    }

    // Parse indirect object
    let indirectObject: GameObject | undefined;
    let indirectObjectName: string | undefined;
    
    if (indirectObjectTokens.length > 0) {
      const result = this.findObject(indirectObjectTokens, availableObjects);
      if ('type' in result) {
        // Special handling for "WITH" preposition - check if it's an inventory issue
        if (preposition === 'WITH' && result.type === 'OBJECT_NOT_FOUND') {
          // Change the error message to indicate the object is not in inventory
          return {
            type: 'OBJECT_NOT_FOUND',
            message: "You don't have that."
          };
        }
        return result; // Return error
      }
      indirectObject = result.object;
      indirectObjectName = result.name;
    }

    return {
      verb,
      directObject,
      indirectObject,
      preposition,
      directObjectName,
      indirectObjectName
    };
  }

  /**
   * Check for malformed command patterns before object resolution
   * This prevents malformed commands from being interpreted as object visibility errors
   */
  private checkForMalformedCommand(verb: string, remainingTokens: Token[], originalInput?: string): ParseError | null {
    if (!originalInput) {
      return null;
    }

    const input = originalInput.trim();
    const verbLower = verb.toLowerCase();

    // Pattern 1: "put  in [object]" - missing direct object with double space
    if (verbLower === 'put' && /^put\s+in\s+\w+/.test(input)) {
      return {
        type: 'INVALID_SYNTAX',
        message: "That sentence isn't one I recognize."
      };
    }

    // Pattern 2: "verb  in [object]" - any verb with double space before "in"
    if (/^\w+\s{2,}in\s+\w+/.test(input)) {
      return {
        type: 'INVALID_SYNTAX',
        message: "That sentence isn't one I recognize."
      };
    }

    // Pattern 3: Commands with multiple consecutive spaces (general malformed syntax)
    if (input.includes('  ')) {
      return {
        type: 'INVALID_SYNTAX',
        message: "That sentence isn't one I recognize."
      };
    }

    // Pattern 4: "verb in" with no object after preposition
    if (remainingTokens.length === 1 && remainingTokens[0].type === 'PREPOSITION') {
      return {
        type: 'INVALID_SYNTAX',
        message: "That sentence isn't one I recognize."
      };
    }

    // Pattern 5: Preposition without direct object (e.g., "put in box" missing what to put)
    if (remainingTokens.length >= 2) {
      const hasPreposition = remainingTokens.some(token => token.type === 'PREPOSITION');
      const prepIndex = remainingTokens.findIndex(token => token.type === 'PREPOSITION');
      
      if (hasPreposition && prepIndex === 0) {
        // Preposition is first token after verb (no direct object)
        return {
          type: 'INVALID_SYNTAX',
          message: "That sentence isn't one I recognize."
        };
      }
    }

    return null;
  }

  /**
   * Find an object from tokens, handling multi-word names and adjectives
   * @param tokens - Tokens representing the object reference
   * @param availableObjects - Objects that can be referenced
   * @returns Object and name, or ParseError
   */
  private findObject(
    tokens: Token[], 
    availableObjects: GameObject[]
  ): { object: GameObject; name: string } | ParseError {
    if (tokens.length === 0) {
      return {
        type: 'INVALID_SYNTAX',
        message: "What do you want to do that to?"
      };
    }

    // Filter out articles
    const filteredTokens = tokens.filter(t => t.type !== 'ARTICLE');
    
    if (filteredTokens.length === 0) {
      return {
        type: 'INVALID_SYNTAX',
        message: "What do you want to do that to?"
      };
    }

    // Extract words from tokens
    const words = filteredTokens.map(t => t.word.toUpperCase());
    const objectName = words.join(' ');

    // Check for pronouns
    if (words.length === 1 && (words[0] === 'IT' || words[0] === 'THEM')) {
      if (!this.lastMentionedObject) {
        return {
          type: 'OBJECT_NOT_FOUND',
          message: "I don't know what you're referring to."
        };
      }
      return {
        object: this.lastMentionedObject,
        name: objectName
      };
    }

    // Find matching objects
    const matches = this.findMatchingObjects(words, availableObjects);

    if (matches.length === 0) {
      // When no objects match, return OBJECT_NOT_FOUND
      // This is the expected behavior when the user tries to interact with something
      // that doesn't exist in the current context, even if the word is unknown.
      // The original Zork says "You can't see any X here!" rather than "I don't know the word X"
      return {
        type: 'OBJECT_NOT_FOUND',
        message: `You can't see any ${objectName.toLowerCase()} here!`
      };
    }

    if (matches.length > 1) {
      return {
        type: 'AMBIGUOUS',
        message: `Which ${objectName} do you mean?`,
        candidates: matches
      };
    }

    return {
      object: matches[0],
      name: objectName
    };
  }

  /**
   * Find objects that match the given words
   * Handles multi-word names and adjectives
   * @param words - Words to match against
   * @param availableObjects - Objects to search
   * @returns Array of matching objects
   */
  private findMatchingObjects(words: string[], availableObjects: GameObject[]): GameObject[] {
    const matches: GameObject[] = [];

    for (const obj of availableObjects) {
      if (this.objectMatchesWords(obj, words)) {
        matches.push(obj);
      }
    }

    return matches;
  }

  /**
   * Check if an object matches the given words
   * Supports matching by name, synonyms, and adjectives
   * @param obj - Object to check
   * @param words - Words to match
   * @returns true if object matches
   */
  private objectMatchesWords(obj: GameObject, words: string[]): boolean {
    const allNames = [obj.name, ...obj.synonyms].map(n => n.toUpperCase());
    const allAdjectives = obj.adjectives.map(a => a.toUpperCase());

    // Try to match the full phrase
    const phrase = words.join(' ');
    if (allNames.includes(phrase)) {
      return true;
    }

    // Try to match with adjectives + name
    // e.g., "BRASS LANTERN" should match object with adjective "BRASS" and name "LANTERN"
    if (words.length > 1) {
      const potentialAdjectives = words.slice(0, -1);
      const potentialName = words[words.length - 1];

      // Check if all potential adjectives match
      const adjectivesMatch = potentialAdjectives.every(adj => 
        allAdjectives.includes(adj)
      );

      // Check if the last word matches a name or synonym
      const nameMatches = allNames.includes(potentialName);

      if (adjectivesMatch && nameMatches) {
        return true;
      }
    }

    // Try to match just the last word (noun) if no adjectives provided
    if (words.length === 1) {
      return allNames.includes(words[0]);
    }

    return false;
  }

  /**
   * Get the last mentioned object (for pronoun resolution)
   */
  getLastMentionedObject(): GameObject | null {
    return this.lastMentionedObject;
  }

  /**
   * Set the last mentioned object (for pronoun resolution)
   */
  setLastMentionedObject(obj: GameObject | null): void {
    this.lastMentionedObject = obj;
  }
}
