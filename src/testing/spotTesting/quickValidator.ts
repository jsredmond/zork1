/**
 * Quick Validator
 * Fast parity validation system for spot testing
 * Uses same normalization as comprehensive tests for consistency
 */

import { 
  ValidationConfig, 
  ValidationResult, 
  DifferenceType, 
  IssueSeverity,
  ValidationResultType
} from './types.js';

/**
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  strictMode: false,
  normalizeOutput: true,
  ignoreMinorDifferences: true
};

/**
 * QuickValidator provides fast comparison logic for spot testing
 * Uses the same normalization techniques as comprehensive tests
 */
export class QuickValidator {
  private config: ValidationConfig;

  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate TypeScript output against Z-Machine output
   */
  validateResponse(
    tsOutput: string, 
    zmOutput: string, 
    config?: Partial<ValidationConfig>
  ): ValidationResult {
    const validationConfig = { ...this.config, ...config };

    // Handle empty outputs
    if (!tsOutput && !zmOutput) {
      return {
        isMatch: true,
        severity: IssueSeverity.LOW,
        details: 'Both outputs are empty'
      };
    }

    if (!tsOutput || !zmOutput) {
      return {
        isMatch: false,
        differenceType: DifferenceType.STATE_DIVERGENCE,
        severity: IssueSeverity.CRITICAL,
        details: 'One output is missing'
      };
    }

    // Apply normalization if enabled
    let normalizedTs = tsOutput;
    let normalizedZm = zmOutput;

    if (validationConfig.normalizeOutput) {
      normalizedTs = this.normalizeForComparison(tsOutput);
      normalizedZm = this.normalizeForComparison(zmOutput);
    }

    // Check for exact match after normalization
    if (normalizedTs === normalizedZm) {
      return {
        isMatch: true,
        severity: IssueSeverity.LOW
      };
    }

    // Calculate similarity for further analysis
    const similarity = this.calculateSimilarity(normalizedTs, normalizedZm);

    // Classify the difference
    const differenceType = this.classifyDifference(tsOutput, zmOutput);
    const severity = this.assessSeverity(similarity, differenceType, validationConfig);

    // Check if we should ignore minor differences
    if (validationConfig.ignoreMinorDifferences && severity === IssueSeverity.LOW) {
      return {
        isMatch: true,
        differenceType,
        severity,
        details: 'Minor difference ignored'
      };
    }

    return {
      isMatch: false,
      differenceType,
      severity,
      details: `Similarity: ${(similarity * 100).toFixed(1)}%`
    };
  }

  /**
   * Normalize output for comparison using same techniques as comprehensive tests
   * Made public for use in reporting
   */
  normalizeForComparison(output: string): string {
    let normalized = output;

    // Step 1: Basic normalization (always safe)
    normalized = this.basicNormalization(normalized);

    // Step 2: Only apply game-specific normalization if it looks like game output
    if (this.looksLikeGameOutput(normalized)) {
      // Step 2a: Remove game header/intro text
      normalized = this.stripGameHeader(normalized);

      // Step 2b: Remove status bar lines
      normalized = this.stripStatusBar(normalized);

      // Step 2c: Normalize line wrapping
      normalized = this.normalizeLineWrapping(normalized);

      // Step 2d: Filter atmospheric messages
      normalized = this.filterAtmosphericMessages(normalized);

      // Step 2e: Normalize error messages
      normalized = this.normalizeErrorMessages(normalized);
    }

    // Step 3: Final cleanup
    normalized = this.finalCleanup(normalized);

    return normalized;
  }

  /**
   * Check if the output looks like game output (vs test strings)
   */
  private looksLikeGameOutput(output: string): boolean {
    // If it's very short, probably not game output
    if (output.length < 20) {
      return false;
    }

    // Check for game-like patterns
    const gamePatterns = [
      /ZORK/i,
      /Score:\s*\d+/,
      /Moves:\s*\d+/,
      /You are in/i,
      /You can see/i,
      /There is/i,
      /You can't/i,
      /I don't understand/i,
      /West of House/i,
      /Living Room/i
    ];

    return gamePatterns.some(pattern => pattern.test(output));
  }

  /**
   * Basic text normalization
   */
  private basicNormalization(output: string): string {
    return output
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse multiple spaces to single space
      .replace(/[ \t]+/g, ' ')
      // Collapse multiple newlines to double newline (preserve paragraph breaks)
      .replace(/\n{3,}/g, '\n\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Trim overall
      .trim();
  }

  /**
   * Strip game header/intro text (same as comprehensive tests)
   */
  private stripGameHeader(output: string): string {
    const lines = output.split('\n');
    const filtered: string[] = [];
    let inHeader = true;

    for (const line of lines) {
      if (inHeader) {
        const trimmedLine = line.trim();
        
        // Header patterns to skip
        if (
          trimmedLine.includes('ZORK I:') ||
          trimmedLine.includes('Copyright') ||
          trimmedLine.includes('Infocom') ||
          /^Release\s+\d+/.test(trimmedLine) ||
          /^Serial number/.test(trimmedLine) ||
          /^Revision\s+\d+/.test(trimmedLine) ||
          trimmedLine.includes('interactive fiction') ||
          trimmedLine.includes('Loading') ||
          trimmedLine.includes('formatting') ||
          /^The Great Underground Empire/.test(trimmedLine) ||
          /^All rights reserved/.test(trimmedLine) ||
          trimmedLine.includes('registered trademark') ||
          trimmedLine.includes('ZORK is a registered') ||
          trimmedLine.includes('fantasy story') ||
          /^\s*$/.test(trimmedLine) // Skip empty lines in header
        ) {
          continue;
        }
        
        // First non-header, non-empty line ends header section
        // Look for actual game content (not just capital letters and spaces)
        if (trimmedLine !== '' && !this.isHeaderLine(trimmedLine)) {
          inHeader = false;
        }
      }
      
      if (!inHeader) {
        filtered.push(line);
      }
    }

    return filtered.join('\n');
  }

  /**
   * Check if a line looks like header content
   */
  private isHeaderLine(line: string): boolean {
    const trimmed = line.trim();
    
    // Known header patterns
    if (
      trimmed.includes('ZORK I:') ||
      trimmed.includes('Copyright') ||
      trimmed.includes('Infocom') ||
      /^Release\s+\d+/.test(trimmed) ||
      /^Serial number/.test(trimmed) ||
      /^Revision\s+\d+/.test(trimmed) ||
      trimmed.includes('interactive fiction') ||
      trimmed.includes('Loading') ||
      trimmed.includes('formatting') ||
      /^The Great Underground Empire/.test(trimmed) ||
      /^All rights reserved/.test(trimmed) ||
      trimmed.includes('registered trademark') ||
      trimmed.includes('ZORK is a registered') ||
      trimmed.includes('fantasy story')
    ) {
      return true;
    }
    
    // Comprehensive list of room names - these are game content, not headers
    // This list includes all rooms from the game to prevent false positives
    const roomNames = [
      // House exterior
      'West of House', 'East of House', 'North of House', 'South of House',
      'Behind House',
      // House interior
      'Living Room', 'Kitchen', 'Attic', 'Cellar',
      // Forest areas
      'Forest', 'Clearing', 'Forest Path', 'Up a Tree',
      // Underground areas
      'Troll Room', 'East-West Passage', 'Round Room', 'Narrow Passage',
      'Mirror Room', 'Cave', 'Twisty Passage', 'Maze', 'Dead End',
      'Grating Room', 'Cyclops Room', 'Treasure Room', 'Strange Passage',
      'Engravings Cave', 'Dome Room', 'Torch Room',
      // Dam and reservoir
      'Dam', 'Dam Base', 'Dam Lobby', 'Maintenance Room', 'Reservoir',
      'Reservoir South', 'Reservoir North', 'Stream', 'Stream View',
      // Canyon and falls
      'Canyon View', 'Rocky Ledge', 'Canyon Bottom', 'End of Rainbow',
      'On the Rainbow', 'Aragain Falls', 'Rocky Shore',
      // Coal mine
      'Coal Mine', 'Shaft Room', 'Machine Room', 'Drafty Room',
      'Smelly Room', 'Gas Room', 'Ladder Top', 'Ladder Bottom',
      'Timber Room', 'Slide Room',
      // Temple and altar
      'Temple', 'Altar', 'Egyptian Room', 'Tomb', 'Entrance to Hades',
      // Misc underground
      'Studio', 'Gallery', 'Loud Room', 'Deep Canyon',
      'Land of the Dead', 'Grail Room', 'Riddle Room',
      // Other
      'Stone Barrow', 'Inside the Barrow'
    ];
    
    if (roomNames.some(room => trimmed === room || trimmed.startsWith(room + ' '))) {
      return false; // This is game content, not header
    }
    
    // Don't strip short lines that could be room names
    // Room names are typically 2-4 words, all capitalized first letters
    // Only strip if it matches known header patterns above
    return false; // Assume it's game content by default
  }

  /**
   * Strip status bar lines (same as comprehensive tests)
   */
  private stripStatusBar(output: string): string {
    const lines = output.split('\n');
    const filtered = lines.filter(line => {
      // Status bar pattern: text followed by Score: and Moves: with spacing
      const statusBarPattern = /^\s*\S.*\s+Score:\s*-?\d+\s+Moves:\s*\d+\s*$/i;
      return !statusBarPattern.test(line);
    });
    return filtered.join('\n');
  }

  /**
   * Normalize line wrapping (same as comprehensive tests)
   */
  private normalizeLineWrapping(output: string): string {
    const lines = output.split('\n');
    const result: string[] = [];
    let currentLine = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Empty line = paragraph break
      if (trimmed === '') {
        if (currentLine) {
          result.push(currentLine);
          currentLine = '';
        }
        result.push('');
        continue;
      }

      // If current line is empty, start new line
      if (!currentLine) {
        currentLine = trimmed;
        continue;
      }

      // Check if previous line ends with sentence-ending punctuation
      const endsWithPunctuation = /[.!?"]$/.test(currentLine);

      if (endsWithPunctuation) {
        result.push(currentLine);
        currentLine = trimmed;
      } else {
        // Join with space (wrapped line)
        currentLine += ' ' + trimmed;
      }
    }

    if (currentLine) {
      result.push(currentLine);
    }

    return result.join('\n');
  }

  /**
   * Filter atmospheric messages (same as comprehensive tests)
   */
  private filterAtmosphericMessages(output: string): string {
    return output
      // Remove song bird messages
      .replace(/You hear in the distance the chirping of a song bird\.\s*/g, '')
      // Remove other atmospheric sounds
      .replace(/You hear.*?\.\s*/g, '')
      .replace(/A grue sound echoes.*?\.\s*/g, '')
      .replace(/You can hear.*?\.\s*/g, '')
      // Remove wind/weather messages
      .replace(/The wind.*?\.\s*/g, '')
      .replace(/A gentle breeze.*?\.\s*/g, '');
  }

  /**
   * Normalize error message variations (same as comprehensive tests)
   */
  private normalizeErrorMessages(output: string): string {
    return output
      // Normalize "You can't see" variations
      .replace(/You can't see any \w+ here!/g, 'OBJECT_NOT_VISIBLE')
      .replace(/I don't see any \w+ here\./g, 'OBJECT_NOT_VISIBLE')
      .replace(/There is no \w+ here\./g, 'OBJECT_NOT_VISIBLE')
      // Normalize "You can't go" variations
      .replace(/You can't go that way\.?/g, 'INVALID_DIRECTION')
      .replace(/You can't go \w+\.?/g, 'INVALID_DIRECTION')
      // Normalize "I don't understand" variations
      .replace(/I don't understand that\./g, 'PARSE_ERROR')
      .replace(/I don't know the word ".*?"\./g, 'PARSE_ERROR');
  }

  /**
   * Final cleanup after all normalization
   */
  private finalCleanup(output: string): string {
    return output
      // Remove any remaining multiple spaces
      .replace(/\s+/g, ' ')
      // Remove multiple newlines (preserve single newlines for structure)
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim();
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1.0;
    if (a.length === 0 && b.length === 0) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const maxLength = Math.max(a.length, b.length);
    const distance = this.levenshteinDistance(a, b);
    return Math.max(0, 1 - (distance / maxLength));
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Uses optimized algorithm for very long strings
   */
  private levenshteinDistance(a: string, b: string): number {
    // For very long strings, use a faster approximation
    // to avoid O(n*m) complexity that causes performance issues
    const MAX_LENGTH_FOR_FULL_CALC = 1000;
    
    if (a.length > MAX_LENGTH_FOR_FULL_CALC || b.length > MAX_LENGTH_FOR_FULL_CALC) {
      return this.approximateLevenshteinDistance(a, b);
    }

    // Standard Levenshtein for shorter strings
    const matrix: number[][] = [];

    // Initialize first column
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }

    // Initialize first row
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  /**
   * Approximate Levenshtein distance for very long strings
   * Uses sampling to estimate distance in O(n) time
   */
  private approximateLevenshteinDistance(a: string, b: string): number {
    // If strings are identical, distance is 0
    if (a === b) return 0;
    
    // If one is empty, distance is the length of the other
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    // Sample-based approximation
    const sampleSize = 100;
    const maxLength = Math.max(a.length, b.length);
    const minLength = Math.min(a.length, b.length);
    
    // Count character differences at sampled positions
    let differences = 0;
    const step = Math.max(1, Math.floor(minLength / sampleSize));
    
    for (let i = 0; i < minLength; i += step) {
      if (a[i] !== b[i]) {
        differences++;
      }
    }
    
    // Estimate total differences based on sample
    const sampledPositions = Math.ceil(minLength / step);
    const estimatedDifferenceRate = sampledPositions > 0 ? differences / sampledPositions : 1;
    
    // Add length difference to estimated character differences
    const lengthDifference = Math.abs(a.length - b.length);
    const estimatedCharDifferences = Math.round(estimatedDifferenceRate * minLength);
    
    return estimatedCharDifferences + lengthDifference;
  }

  /**
   * Classify the type of difference based on content analysis
   */
  private classifyDifference(tsOutput: string, zmOutput: string): DifferenceType {
    const tsLower = tsOutput.toLowerCase();
    const zmLower = zmOutput.toLowerCase();

    // Check for parser differences
    if ((tsLower.includes("don't understand") || tsLower.includes("don't know")) !==
        (zmLower.includes("don't understand") || zmLower.includes("don't know"))) {
      return DifferenceType.PARSER_DIFFERENCE;
    }

    // Check for object behavior differences
    if (this.hasObjectInteractionKeywords(tsOutput) || this.hasObjectInteractionKeywords(zmOutput)) {
      return DifferenceType.OBJECT_BEHAVIOR;
    }

    // Check for timing differences (daemon-related messages)
    if (this.hasTimingKeywords(tsOutput) || this.hasTimingKeywords(zmOutput)) {
      return DifferenceType.TIMING_DIFFERENCE;
    }

    // Check for state divergence (different game states)
    if (this.hasStateKeywords(tsOutput) || this.hasStateKeywords(zmOutput)) {
      return DifferenceType.STATE_DIVERGENCE;
    }

    // Default to message inconsistency
    return DifferenceType.MESSAGE_INCONSISTENCY;
  }

  /**
   * Check if output contains object interaction keywords
   */
  private hasObjectInteractionKeywords(output: string): boolean {
    const keywords = [
      'take', 'drop', 'get', 'put', 'open', 'close', 'examine', 'look at',
      'container', 'object', 'item', 'carrying', 'inventory'
    ];
    const lowerOutput = output.toLowerCase();
    return keywords.some(keyword => lowerOutput.includes(keyword));
  }

  /**
   * Check if output contains timing-related keywords
   */
  private hasTimingKeywords(output: string): boolean {
    const keywords = [
      'lamp', 'lantern', 'light', 'candle', 'flame', 'burning', 'dim',
      'thief', 'troll', 'cyclops', 'moves', 'daemon'
    ];
    const lowerOutput = output.toLowerCase();
    return keywords.some(keyword => lowerOutput.includes(keyword));
  }

  /**
   * Check if output contains state-related keywords
   */
  private hasStateKeywords(output: string): boolean {
    const keywords = [
      'room', 'location', 'door', 'passage', 'exit', 'entrance',
      'north', 'south', 'east', 'west', 'up', 'down'
    ];
    const lowerOutput = output.toLowerCase();
    return keywords.some(keyword => lowerOutput.includes(keyword));
  }

  /**
   * Assess severity based on similarity and difference type
   */
  private assessSeverity(
    similarity: number, 
    differenceType: DifferenceType, 
    config: ValidationConfig
  ): IssueSeverity {
    // In strict mode, be more sensitive to differences
    const thresholds = config.strictMode ? {
      critical: 0.3,
      high: 0.6,
      medium: 0.8,
      low: 0.95
    } : {
      critical: 0.5,
      high: 0.7,
      medium: 0.85,
      low: 0.95
    };

    // Adjust severity based on difference type
    let adjustedSimilarity = similarity;
    
    switch (differenceType) {
      case DifferenceType.STATE_DIVERGENCE:
        // State divergence is more serious
        adjustedSimilarity *= 0.8;
        break;
      case DifferenceType.PARSER_DIFFERENCE:
        // Parser differences are serious
        adjustedSimilarity *= 0.85;
        break;
      case DifferenceType.OBJECT_BEHAVIOR:
        // Object behavior differences are moderately serious
        adjustedSimilarity *= 0.9;
        break;
      case DifferenceType.TIMING_DIFFERENCE:
        // Timing differences are less serious (often expected)
        adjustedSimilarity *= 1.1;
        break;
      case DifferenceType.MESSAGE_INCONSISTENCY:
        // Message inconsistencies are least serious
        adjustedSimilarity *= 1.05;
        break;
    }

    // Clamp to [0, 1] range
    adjustedSimilarity = Math.max(0, Math.min(1, adjustedSimilarity));

    // Determine severity based on adjusted similarity
    if (adjustedSimilarity < thresholds.critical) {
      return IssueSeverity.CRITICAL;
    } else if (adjustedSimilarity < thresholds.high) {
      return IssueSeverity.HIGH;
    } else if (adjustedSimilarity < thresholds.medium) {
      return IssueSeverity.MEDIUM;
    } else {
      return IssueSeverity.LOW;
    }
  }

  /**
   * Update validation configuration
   */
  setConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current validation configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Batch validate multiple command results
   */
  validateBatch(
    results: Array<{ tsOutput: string; zmOutput: string; command?: string }>,
    config?: Partial<ValidationConfig>
  ): ValidationResult[] {
    return results.map(result => 
      this.validateResponse(result.tsOutput, result.zmOutput, config)
    );
  }

  /**
   * Get validation statistics for a batch of results
   */
  getValidationStats(results: ValidationResult[]): {
    totalValidations: number;
    matches: number;
    mismatches: number;
    matchPercentage: number;
    severityBreakdown: Record<IssueSeverity, number>;
    typeBreakdown: Record<DifferenceType, number>;
  } {
    const stats = {
      totalValidations: results.length,
      matches: 0,
      mismatches: 0,
      matchPercentage: 0,
      severityBreakdown: {
        [IssueSeverity.LOW]: 0,
        [IssueSeverity.MEDIUM]: 0,
        [IssueSeverity.HIGH]: 0,
        [IssueSeverity.CRITICAL]: 0
      },
      typeBreakdown: {
        [DifferenceType.MESSAGE_INCONSISTENCY]: 0,
        [DifferenceType.STATE_DIVERGENCE]: 0,
        [DifferenceType.PARSER_DIFFERENCE]: 0,
        [DifferenceType.OBJECT_BEHAVIOR]: 0,
        [DifferenceType.TIMING_DIFFERENCE]: 0
      }
    };

    for (const result of results) {
      if (result.isMatch) {
        stats.matches++;
      } else {
        stats.mismatches++;
      }

      stats.severityBreakdown[result.severity]++;
      
      if (result.differenceType) {
        stats.typeBreakdown[result.differenceType]++;
      }
    }

    stats.matchPercentage = stats.totalValidations > 0 ? 
      (stats.matches / stats.totalValidations) * 100 : 100;

    return stats;
  }
}