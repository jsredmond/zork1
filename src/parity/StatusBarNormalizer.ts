/**
 * StatusBarNormalizer - Handles status bar formatting and normalization for parity testing
 * 
 * This module ensures TypeScript output matches Z-Machine output by:
 * 1. Removing status bar contamination from game responses
 * 2. Providing exact Z-Machine status bar formatting when needed
 * 3. Detecting and classifying status bar patterns
 * 
 * Requirements: 2.1, 2.4
 */

/**
 * Status bar detection result
 */
export interface StatusBarDetection {
  hasStatusBar: boolean;
  roomName?: string;
  score?: number;
  moves?: number;
  lineIndex?: number;
}

/**
 * Normalization result
 */
export interface NormalizationResult {
  normalizedOutput: string;
  statusBarRemoved: boolean;
  detectedStatusBars: StatusBarDetection[];
}

/**
 * StatusBarNormalizer provides comprehensive status bar handling for parity testing
 */
export class StatusBarNormalizer {
  // Z-Machine standard formatting constants
  private static readonly STATUS_LINE_WIDTH = 80;
  private static readonly ROOM_NAME_WIDTH = 49;
  private static readonly SCORE_MOVES_SPACING = 8; // Spaces between Score and Moves

  /**
   * Primary status bar pattern matching Z-Machine format
   * Format: "Room Name (padded)    Score: X        Moves: Y"
   */
  private static readonly STATUS_BAR_PATTERN = /^\s*\S.*\s+Score:\s*-?\d+\s+Moves:\s*\d+\s*$/i;

  /**
   * Pattern to extract status bar components
   */
  private static readonly STATUS_BAR_EXTRACT_PATTERN = /^(.+?)\s+Score:\s*(-?\d+)\s+Moves:\s*(\d+)\s*$/i;

  /**
   * Normalize output by removing status bar contamination
   * This is the primary method for parity testing normalization
   */
  normalizeStatusBarOutput(output: string): NormalizationResult {
    const lines = output.split('\n');
    const detectedStatusBars: StatusBarDetection[] = [];
    const filteredLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const detection = this.detectStatusBar(line);

      if (detection.hasStatusBar) {
        detectedStatusBars.push({
          ...detection,
          lineIndex: i
        });
        // Skip this line (remove status bar)
        continue;
      }

      filteredLines.push(line);
    }

    // Clean up leading empty lines that may result from status bar removal
    let normalizedOutput = filteredLines.join('\n');
    normalizedOutput = normalizedOutput.replace(/^\n+/, '');

    return {
      normalizedOutput,
      statusBarRemoved: detectedStatusBars.length > 0,
      detectedStatusBars
    };
  }

  /**
   * Detect if a line contains a status bar
   */
  detectStatusBar(line: string): StatusBarDetection {
    if (!StatusBarNormalizer.STATUS_BAR_PATTERN.test(line)) {
      return { hasStatusBar: false };
    }

    const match = line.match(StatusBarNormalizer.STATUS_BAR_EXTRACT_PATTERN);
    if (!match) {
      return { hasStatusBar: true };
    }

    return {
      hasStatusBar: true,
      roomName: match[1].trim(),
      score: parseInt(match[2], 10),
      moves: parseInt(match[3], 10)
    };
  }

  /**
   * Format a status bar line to match Z-Machine format exactly
   * This is used when we need to ADD a status bar (not for parity testing)
   */
  formatStatusBarExactly(room: string, score: number, moves: number): string {
    // Pad room name to exactly 49 characters
    const paddedRoom = this.padRoomName(room);
    
    // Format score and moves sections with fixed spacing
    const scoreSection = `Score: ${score}`;
    const movesSection = `Moves: ${moves}`;
    
    // Use exactly 8 spaces between Score and Moves (Z-Machine standard)
    const fixedSpacing = ' '.repeat(StatusBarNormalizer.SCORE_MOVES_SPACING);
    
    return `${paddedRoom}${scoreSection}${fixedSpacing}${movesSection}`;
  }

  /**
   * Pad room name to the standard width (49 characters)
   */
  private padRoomName(room: string): string {
    if (room.length >= StatusBarNormalizer.ROOM_NAME_WIDTH) {
      return room.substring(0, StatusBarNormalizer.ROOM_NAME_WIDTH);
    }
    return room.padEnd(StatusBarNormalizer.ROOM_NAME_WIDTH);
  }

  /**
   * Check if output contains any status bar contamination
   */
  hasStatusBarContamination(output: string): boolean {
    const lines = output.split('\n');
    return lines.some(line => StatusBarNormalizer.STATUS_BAR_PATTERN.test(line));
  }

  /**
   * Get all status bar detections from output
   */
  getAllStatusBars(output: string): StatusBarDetection[] {
    const lines = output.split('\n');
    const detections: StatusBarDetection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const detection = this.detectStatusBar(lines[i]);
      if (detection.hasStatusBar) {
        detections.push({
          ...detection,
          lineIndex: i
        });
      }
    }

    return detections;
  }

  /**
   * Compare two outputs after status bar normalization
   * Returns true if they match after removing status bars
   */
  compareNormalized(tsOutput: string, zmOutput: string): boolean {
    const normalizedTs = this.normalizeStatusBarOutput(tsOutput).normalizedOutput;
    const normalizedZm = this.normalizeStatusBarOutput(zmOutput).normalizedOutput;
    return normalizedTs === normalizedZm;
  }

  /**
   * Get detailed comparison result
   */
  getComparisonDetails(tsOutput: string, zmOutput: string): {
    match: boolean;
    tsNormalized: string;
    zmNormalized: string;
    tsStatusBarsRemoved: number;
    zmStatusBarsRemoved: number;
  } {
    const tsResult = this.normalizeStatusBarOutput(tsOutput);
    const zmResult = this.normalizeStatusBarOutput(zmOutput);

    return {
      match: tsResult.normalizedOutput === zmResult.normalizedOutput,
      tsNormalized: tsResult.normalizedOutput,
      zmNormalized: zmResult.normalizedOutput,
      tsStatusBarsRemoved: tsResult.detectedStatusBars.length,
      zmStatusBarsRemoved: zmResult.detectedStatusBars.length
    };
  }

  /**
   * Validate that a status bar is correctly formatted
   */
  validateStatusBarFormat(statusBar: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!StatusBarNormalizer.STATUS_BAR_PATTERN.test(statusBar)) {
      issues.push('Does not match Z-Machine status bar pattern');
      return { isValid: false, issues };
    }

    const detection = this.detectStatusBar(statusBar);
    
    if (detection.roomName && detection.roomName.length > StatusBarNormalizer.ROOM_NAME_WIDTH) {
      issues.push(`Room name exceeds ${StatusBarNormalizer.ROOM_NAME_WIDTH} characters`);
    }

    if (detection.score !== undefined && detection.score < -999) {
      issues.push('Score is below minimum displayable value');
    }

    if (detection.moves !== undefined && detection.moves < 0) {
      issues.push('Moves count cannot be negative');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Static factory method for creating a normalizer instance
   */
  static create(): StatusBarNormalizer {
    return new StatusBarNormalizer();
  }

  /**
   * Static method for quick normalization without creating an instance
   */
  static normalize(output: string): string {
    const normalizer = new StatusBarNormalizer();
    return normalizer.normalizeStatusBarOutput(output).normalizedOutput;
  }
}
