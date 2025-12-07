/**
 * Parser Feedback System
 * Handles OOPS, AGAIN/G commands and parser-specific messages
 * Based on gparser.zil OOPS and AGAIN handling
 */

/**
 * Parser state for OOPS/AGAIN command handling
 */
export interface ParserState {
  lastInput: string;           // Last complete input for AGAIN
  lastCommand: string;         // Last successful command
  lastUnknownWord: string;     // Last unknown word for OOPS
  lastUnknownWordIndex: number; // Position of unknown word
  canRepeat: boolean;          // Whether AGAIN is valid
  hasUnknownWord: boolean;     // Whether OOPS is valid
}

/**
 * Parser feedback messages
 * These match the original ZIL parser messages
 */
export class ParserFeedback {
  private state: ParserState = {
    lastInput: '',
    lastCommand: '',
    lastUnknownWord: '',
    lastUnknownWordIndex: -1,
    canRepeat: false,
    hasUnknownWord: false
  };

  /**
   * Get current parser state
   */
  getState(): ParserState {
    return { ...this.state };
  }

  /**
   * Update parser state after successful command
   */
  recordSuccessfulCommand(input: string): void {
    this.state.lastInput = input;
    this.state.lastCommand = input;
    this.state.canRepeat = true;
    this.state.hasUnknownWord = false;
  }

  /**
   * Update parser state after failed command
   */
  recordFailedCommand(input: string): void {
    this.state.lastInput = input;
    this.state.canRepeat = false;
  }

  /**
   * Record an unknown word for OOPS handling
   */
  recordUnknownWord(word: string, index: number): void {
    this.state.lastUnknownWord = word;
    this.state.lastUnknownWordIndex = index;
    this.state.hasUnknownWord = true;
  }

  /**
   * Clear unknown word state
   */
  clearUnknownWord(): void {
    this.state.hasUnknownWord = false;
    this.state.lastUnknownWord = '';
    this.state.lastUnknownWordIndex = -1;
  }

  /**
   * Handle OOPS command
   * Returns the corrected input or an error message
   */
  handleOops(correctionWord: string): { success: boolean; message?: string; correctedInput?: string } {
    // Check if there was a word to replace
    if (!this.state.hasUnknownWord || !this.state.lastUnknownWord) {
      return {
        success: false,
        message: "There was no word to replace!"
      };
    }

    // Replace the unknown word with the correction
    const words = this.state.lastInput.split(/\s+/);
    if (this.state.lastUnknownWordIndex >= 0 && this.state.lastUnknownWordIndex < words.length) {
      words[this.state.lastUnknownWordIndex] = correctionWord;
      const correctedInput = words.join(' ');
      
      // Clear the unknown word state
      this.clearUnknownWord();
      
      return {
        success: true,
        correctedInput
      };
    }

    return {
      success: false,
      message: "There was no word to replace!"
    };
  }

  /**
   * Handle AGAIN/G command
   * Returns the last command or an error message
   */
  handleAgain(): { success: boolean; message?: string; repeatedInput?: string } {
    // Check if there's a command to repeat
    if (!this.state.lastInput || this.state.lastInput.trim() === '') {
      return {
        success: false,
        message: "Beg pardon?"
      };
    }

    // Check if the last command was successful
    if (!this.state.canRepeat) {
      return {
        success: false,
        message: "That would just repeat a mistake."
      };
    }

    return {
      success: true,
      repeatedInput: this.state.lastCommand
    };
  }

  /**
   * Get warning message for OOPS with multiple words
   */
  getOopsMultiWordWarning(): string {
    return "Warning: only the first word after OOPS is used.";
  }

  /**
   * Get message for AGAIN with fragments
   */
  getAgainFragmentError(): string {
    return "It's difficult to repeat fragments.";
  }

  /**
   * Get message for unparseable AGAIN syntax
   */
  getAgainSyntaxError(): string {
    return "I couldn't understand that sentence.";
  }

  /**
   * Reset parser state (e.g., on game restart)
   */
  reset(): void {
    this.state = {
      lastInput: '',
      lastCommand: '',
      lastUnknownWord: '',
      lastUnknownWordIndex: -1,
      canRepeat: false,
      hasUnknownWord: false
    };
  }

  /**
   * Get unknown word error message
   * Based on gparser.zil UNKNOWN-WORD routine
   */
  getUnknownWordError(word: string): string {
    return `I don't know the word "${word}".`;
  }

  /**
   * Get ambiguity error message (WHICH-PRINT)
   * Based on gparser.zil WHICH-PRINT routine
   */
  getAmbiguityError(objectType: string, candidates: string[]): string {
    if (candidates.length === 0) {
      return `Which ${objectType} do you mean?`;
    }
    
    if (candidates.length === 1) {
      return `Which ${objectType} do you mean, the ${candidates[0]}?`;
    }
    
    if (candidates.length === 2) {
      return `Which ${objectType} do you mean, the ${candidates[0]} or the ${candidates[1]}?`;
    }
    
    // More than 2 candidates
    const allButLast = candidates.slice(0, -1).map(c => `the ${c}`).join(', ');
    const last = candidates[candidates.length - 1];
    return `Which ${objectType} do you mean, ${allButLast}, or the ${last}?`;
  }

  /**
   * Get "can't use that word" error
   * Based on gparser.zil CANT-USE routine
   */
  getCantUseWordError(word: string): string {
    return `You can't use the word "${word}" here.`;
  }

  /**
   * Get "nothing happens" for SAY verb with unknown word
   * Special case from gparser.zil
   */
  getSayNothingHappens(): string {
    return "Nothing happens.";
  }

  /**
   * Get generic parse error message
   */
  getParseError(): string {
    return "I don't understand that.";
  }
}

/**
 * Global parser feedback instance
 */
export const parserFeedback = new ParserFeedback();
