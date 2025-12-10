/**
 * Terminal I/O handling
 * Manages user input and output display
 */

import * as readline from 'readline';

/**
 * ANSI escape code constants for terminal control
 */
export const ANSI = {
  // Cursor movement
  HOME: '\x1b[H',                    // Move cursor to home (1,1)
  SAVE_CURSOR: '\x1b[s',             // Save cursor position
  RESTORE_CURSOR: '\x1b[u',          // Restore cursor position
  
  // Line operations
  CLEAR_LINE: '\x1b[K',              // Clear line from cursor to end
  CLEAR_SCREEN: '\x1b[2J',           // Clear entire screen
  
  // Text attributes
  REVERSE_VIDEO: '\x1b[7m',          // Reverse video (for status bar)
  RESET: '\x1b[0m',                  // Reset all attributes
  
  // Helper functions
  moveTo: (row: number, col: number): string => `\x1b[${row};${col}H`,
  setScrollRegion: (top: number, bottom: number): string => `\x1b[${top};${bottom}r`,
};

/**
 * Check if the terminal supports ANSI escape codes
 * @returns true if ANSI codes are likely supported
 */
export function supportsAnsi(): boolean {
  // Check if stdout is a TTY (terminal)
  if (!process.stdout.isTTY) {
    return false;
  }
  
  // Check for common environment indicators
  const term = process.env.TERM || '';
  const colorTerm = process.env.COLORTERM || '';
  
  // Most modern terminals support ANSI
  if (colorTerm === 'truecolor' || colorTerm === '24bit') {
    return true;
  }
  
  // Check for common terminal types that support ANSI
  const ansiTerms = ['xterm', 'screen', 'vt100', 'linux', 'ansi', 'cygwin', 'rxvt'];
  return ansiTerms.some(t => term.toLowerCase().includes(t));
}

/**
 * Terminal class handles user input and output for the game
 * Uses readline for input and provides formatted output methods
 */
export class Terminal {
  private rl: readline.Interface | null = null;
  private isRunning: boolean = false;
  private ansiEnabled: boolean = false;
  private terminalWidth: number = 80;
  private terminalHeight: number = 24;

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
    
    // Check for ANSI support and get terminal dimensions
    this.ansiEnabled = supportsAnsi();
    if (process.stdout.columns) {
      this.terminalWidth = process.stdout.columns;
    }
    if (process.stdout.rows) {
      this.terminalHeight = process.stdout.rows;
    }
  }

  /**
   * Initialize the screen with a fixed status bar at the top
   * Sets up scroll region so game content scrolls below the status bar
   * @param location - Initial location name
   * @param score - Initial score
   * @param moves - Initial move count
   */
  initializeScreen(location: string = '', score: number = 0, moves: number = 0): void {
    if (!this.ansiEnabled) {
      // Fall back to inline status display if ANSI not supported
      return;
    }

    // Clear screen and move to home
    this.write(ANSI.CLEAR_SCREEN + ANSI.HOME);
    
    // Draw initial status bar on line 1
    this.drawStatusBar(location, score, moves);
    
    // Set scroll region from line 2 to bottom of terminal
    this.write(ANSI.setScrollRegion(2, this.terminalHeight));
    
    // Position cursor in content area (line 2)
    this.write(ANSI.moveTo(2, 1));
  }

  /**
   * Draw the status bar on line 1 (internal helper)
   * @param location - Location name for left side
   * @param score - Score value
   * @param moves - Moves count
   */
  private drawStatusBar(location: string, score: number, moves: number): void {
    const scoreMovesText = `Score: ${score}  Moves: ${moves}`;
    const availableWidth = this.terminalWidth - scoreMovesText.length - 2;
    
    // Truncate location if too long
    let displayLocation = location;
    if (displayLocation.length > availableWidth) {
      displayLocation = displayLocation.substring(0, availableWidth - 3) + '...';
    }
    
    // Calculate padding between location and score/moves
    const padding = Math.max(this.terminalWidth - displayLocation.length - scoreMovesText.length, 1);
    
    // Build status bar with reverse video
    const statusBar = ANSI.REVERSE_VIDEO + 
      displayLocation + 
      ' '.repeat(padding) + 
      scoreMovesText + 
      ANSI.RESET;
    
    this.write(statusBar);
  }

  /**
   * Update the status bar in place without disrupting content area
   * @param location - Current room name
   * @param score - Current score
   * @param moves - Current move count
   */
  updateStatusBar(location: string, score: number, moves: number): void {
    if (!this.ansiEnabled) {
      // Fall back to inline status display if ANSI not supported
      this.showStatusBar(score, moves, location);
      return;
    }

    // Save cursor position
    this.write(ANSI.SAVE_CURSOR);
    
    // Move to line 1 and clear it
    this.write(ANSI.moveTo(1, 1) + ANSI.CLEAR_LINE);
    
    // Draw the updated status bar
    this.drawStatusBar(location, score, moves);
    
    // Restore cursor position
    this.write(ANSI.RESTORE_CURSOR);
  }

  /**
   * Format status bar content for testing/verification
   * Returns the text that would appear in the status bar
   * @param location - Room name
   * @param score - Score value
   * @param moves - Move count
   * @returns Formatted status bar string (without ANSI codes)
   */
  formatStatusBar(location: string, score: number, moves: number): string {
    const scoreMovesText = `Score: ${score}  Moves: ${moves}`;
    const availableWidth = this.terminalWidth - scoreMovesText.length - 2;
    
    let displayLocation = location;
    if (displayLocation.length > availableWidth) {
      displayLocation = displayLocation.substring(0, availableWidth - 3) + '...';
    }
    
    const padding = Math.max(this.terminalWidth - displayLocation.length - scoreMovesText.length, 1);
    return displayLocation + ' '.repeat(padding) + scoreMovesText;
  }

  /**
   * Check if ANSI escape codes are enabled
   * @returns true if ANSI mode is active
   */
  isAnsiEnabled(): boolean {
    return this.ansiEnabled;
  }

  /**
   * Get current terminal width
   * @returns Terminal width in columns
   */
  getTerminalWidth(): number {
    return this.terminalWidth;
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
