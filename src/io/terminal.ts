/**
 * Terminal I/O handling
 * Manages user input and output display
 */

import * as readline from 'readline';

/**
 * Terminal class handles user input and output for the game
 * Uses readline for input and provides formatted output methods
 */
export class Terminal {
  private rl: readline.Interface | null = null;
  private isRunning: boolean = false;

  /**
   * Initialize the terminal interface
   */
  initialize(): void {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    // Handle CTRL+C gracefully
    this.rl.on('SIGINT', () => {
      this.handleInterrupt();
    });

    this.isRunning = true;
  }

  /**
   * Handle CTRL+C interrupt gracefully
   */
  private handleInterrupt(): void {
    this.writeLine('\n\nDo you really want to quit? (yes/no)');
    if (this.rl) {
      this.rl.question('> ', (answer) => {
        const response = answer.trim().toLowerCase();
        if (response === 'yes' || response === 'y') {
          this.writeLine('Thanks for playing!');
          this.close();
          process.exit(0);
        } else {
          this.writeLine('Continuing game...');
          if (this.rl) {
            this.rl.prompt();
          }
        }
      });
    }
  }

  /**
   * Read a line of input from the user
   * @param callback - Function to call with the input line
   */
  readLine(callback: (input: string) => void): void {
    if (!this.rl) {
      throw new Error('Terminal not initialized');
    }

    this.rl.question('', (answer) => {
      callback(answer);
    });
  }

  /**
   * Write text to the terminal
   * @param text - Text to write
   */
  write(text: string): void {
    if (process.stdout.writable) {
      process.stdout.write(text);
    }
  }

  /**
   * Write a line of text to the terminal (with newline)
   * @param text - Text to write
   */
  writeLine(text: string): void {
    this.write(text + '\n');
  }

  /**
   * Write multiple lines of text
   * @param lines - Array of text lines to write
   */
  writeLines(lines: string[]): void {
    lines.forEach(line => this.writeLine(line));
  }

  /**
   * Display the command prompt
   */
  showPrompt(): void {
    if (this.rl) {
      this.rl.prompt();
    }
  }

  /**
   * Display status bar with location, score and moves
   * Shows status inline before the prompt for readline compatibility
   * @param score - Current score
   * @param moves - Number of moves
   * @param location - Optional location name to display
   */
  showStatusBar(score: number, moves: number, location?: string): void {
    // For readline-based terminals, we show status inline
    // A true fixed status bar would require a full TUI library
    // Format: "Location                    Score: X  Moves: Y"
    if (location) {
      const scoreMovesText = `Score: ${score}  Moves: ${moves}`;
      // Pad location to create spacing similar to original
      const padding = Math.max(40 - location.length, 4);
      const statusText = `${location}${' '.repeat(padding)}${scoreMovesText}`;
      this.writeLine(statusText);
    } else {
      const statusText = `[Score: ${score}  Moves: ${moves}]`;
      this.writeLine(statusText);
    }
  }

  /**
   * Clear the terminal screen
   */
  clear(): void {
    // ANSI escape code to clear screen
    this.write('\x1b[2J\x1b[0f');
  }

  /**
   * Check if terminal is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Close the terminal interface
   */
  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    this.isRunning = false;
  }
}
