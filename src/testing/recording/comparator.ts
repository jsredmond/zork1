/**
 * TranscriptComparator - Compares transcripts and identifies differences
 * 
 * This module provides functionality to compare game transcripts from
 * the TypeScript implementation and the original Z-machine game,
 * identifying differences and calculating parity scores.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3
 */

import {
  Transcript,
  TranscriptEntry,
  ComparisonOptions,
  DiffEntry,
  DiffReport,
  DiffSeverity,
  DiffSummary,
} from './types';

/**
 * Default comparison options
 */
const DEFAULT_OPTIONS: Required<ComparisonOptions> = {
  normalizeWhitespace: true,
  ignoreCaseInMessages: false,
  knownVariations: [],
  toleranceThreshold: 0.95,
};

/**
 * Compares two transcripts and produces diff reports
 */
export class TranscriptComparator {
  private options: Required<ComparisonOptions>;

  constructor(options?: ComparisonOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Compare two transcripts and generate a diff report
   * Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2
   */
  compare(
    transcriptA: Transcript,
    transcriptB: Transcript,
    options?: ComparisonOptions
  ): DiffReport {
    const opts = { ...this.options, ...options };
    const differences: DiffEntry[] = [];
    let exactMatches = 0;
    let closeMatches = 0;

    // Get the maximum length to compare
    const maxLength = Math.max(
      transcriptA.entries.length,
      transcriptB.entries.length
    );

    for (let i = 0; i < maxLength; i++) {
      const entryA = transcriptA.entries[i];
      const entryB = transcriptB.entries[i];

      if (!entryA || !entryB) {
        // One transcript is shorter - this is a critical difference
        differences.push(this.createMissingEntryDiff(i, entryA, entryB));
        continue;
      }

      const outputA = opts.normalizeWhitespace
        ? this.normalizeOutput(entryA.output)
        : entryA.output;
      const outputB = opts.normalizeWhitespace
        ? this.normalizeOutput(entryB.output)
        : entryB.output;

      // Check for exact match
      if (outputA === outputB) {
        exactMatches++;
        continue;
      }

      // Calculate similarity
      const similarity = this.calculateSimilarity(outputA, outputB);

      // Check if it's a close match (above tolerance)
      if (similarity >= opts.toleranceThreshold) {
        closeMatches++;
        // Still record as a minor/formatting difference
        const severity = this.classifySeverity(
          entryA.output,
          entryB.output,
          similarity,
          opts
        );
        if (severity === 'formatting') {
          // Don't add formatting-only differences to the list if above threshold
          continue;
        }
      }

      // Record the difference
      const diff = this.createDiffEntry(
        i,
        entryA.command,
        entryA.output,
        entryB.output,
        similarity,
        opts
      );
      differences.push(diff);
    }

    const totalCommands = maxLength;
    const parityScore = this.calculateParityScore(
      exactMatches,
      closeMatches,
      totalCommands
    );

    return {
      transcriptA: transcriptA.id,
      transcriptB: transcriptB.id,
      totalCommands,
      exactMatches,
      closeMatches,
      differences,
      parityScore,
      summary: this.summarizeDifferences(differences),
    };
  }


  /**
   * Strip Z-Machine status bar lines from output
   * Status bar format: "Room Name                                    Score: X        Moves: Y"
   * Requirements: 5.1
   */
  stripStatusBar(output: string): string {
    const lines = output.split('\n');
    const filtered = lines.filter(line => {
      // Status bar pattern: text followed by Score: and Moves: with spacing
      // Example: "West of House                                    Score: 0        Moves: 1"
      const statusBarPattern = /^\s*\S.*\s+Score:\s*-?\d+\s+Moves:\s*\d+\s*$/i;
      return !statusBarPattern.test(line);
    });
    return filtered.join('\n');
  }

  /**
   * Normalize line wrapping by joining lines that were wrapped mid-sentence
   * Z-Machine wraps at ~80 chars, TypeScript doesn't wrap
   * Requirements: 5.2
   * 
   * Rules:
   * - Empty lines are paragraph breaks and are preserved
   * - Lines ending with sentence-ending punctuation (.!?") start a new logical line
   * - Lines not ending with punctuation are joined with the next line (wrapped text)
   */
  normalizeLineWrapping(output: string): string {
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

      // If previous line ends with punctuation, start new line
      if (endsWithPunctuation) {
        result.push(currentLine);
        currentLine = trimmed;
      } else {
        // Join with space (wrapped line)
        currentLine += ' ' + trimmed;
      }
    }

    // Don't forget the last line
    if (currentLine) {
      result.push(currentLine);
    }

    return result.join('\n');
  }

  /**
   * Normalize output for comparison
   * Requirements: 3.2
   */
  normalizeOutput(output: string): string {
    return output
      // Normalize line endings to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse multiple spaces to single space
      .replace(/[ \t]+/g, ' ')
      // Collapse multiple newlines to single newline
      .replace(/\n+/g, '\n')
      // Trim leading/trailing whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Trim overall
      .trim();
  }

  /**
   * Calculate character-level similarity between two strings
   * Uses Levenshtein distance normalized to 0-1 range
   */
  calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein edit distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
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
   * Classify the severity of a difference
   * Requirements: 3.5, 4.1
   */
  classifySeverity(
    expected: string,
    actual: string,
    similarity: number,
    opts: Required<ComparisonOptions>
  ): DiffSeverity {
    // Check if this is a known variation
    for (const pattern of opts.knownVariations) {
      if (expected.includes(pattern) || actual.includes(pattern)) {
        return 'minor';
      }
    }

    // Normalize both for comparison
    const normalizedExpected = this.normalizeOutput(expected);
    const normalizedActual = this.normalizeOutput(actual);

    // If normalized versions are identical, it's just formatting
    if (normalizedExpected === normalizedActual) {
      return 'formatting';
    }

    // Check case-insensitive match
    if (opts.ignoreCaseInMessages) {
      if (normalizedExpected.toLowerCase() === normalizedActual.toLowerCase()) {
        return 'formatting';
      }
    }

    // Classify based on similarity
    if (similarity >= 0.9) {
      return 'minor';
    } else if (similarity >= 0.7) {
      return 'major';
    } else {
      return 'critical';
    }
  }

  /**
   * Categorize the type of difference
   */
  private categorize(command: string, _expected: string, _actual: string): string {
    const cmd = command.toLowerCase();
    
    if (cmd === 'look' || cmd === 'l') {
      return 'room description';
    }
    if (cmd === 'inventory' || cmd === 'i') {
      return 'inventory';
    }
    if (cmd.startsWith('examine') || cmd.startsWith('x ')) {
      return 'object examination';
    }
    if (cmd.startsWith('take') || cmd.startsWith('get')) {
      return 'object manipulation';
    }
    if (cmd.startsWith('drop') || cmd.startsWith('put')) {
      return 'object manipulation';
    }
    if (['north', 'south', 'east', 'west', 'up', 'down', 'n', 's', 'e', 'w', 'u', 'd'].includes(cmd)) {
      return 'navigation';
    }
    if (cmd.startsWith('attack') || cmd.startsWith('kill')) {
      return 'combat';
    }
    if (cmd.startsWith('open') || cmd.startsWith('close')) {
      return 'container interaction';
    }
    
    return 'general';
  }


  /**
   * Create a DiffEntry for a difference
   */
  private createDiffEntry(
    index: number,
    command: string,
    expected: string,
    actual: string,
    similarity: number,
    opts: Required<ComparisonOptions>
  ): DiffEntry {
    return {
      index,
      command,
      expected,
      actual,
      similarity,
      severity: this.classifySeverity(expected, actual, similarity, opts),
      category: this.categorize(command, expected, actual),
    };
  }

  /**
   * Create a DiffEntry for a missing entry (transcript length mismatch)
   */
  private createMissingEntryDiff(
    index: number,
    entryA?: TranscriptEntry,
    entryB?: TranscriptEntry
  ): DiffEntry {
    return {
      index,
      command: entryA?.command || entryB?.command || '<missing>',
      expected: entryA?.output || '<missing entry>',
      actual: entryB?.output || '<missing entry>',
      similarity: 0,
      severity: 'critical',
      category: 'transcript structure',
    };
  }

  /**
   * Calculate parity score as percentage
   * Requirements: 3.4
   */
  calculateParityScore(
    exactMatches: number,
    closeMatches: number,
    totalCommands: number
  ): number {
    if (totalCommands === 0) return 100;
    const matchingOutputs = exactMatches + closeMatches;
    return (matchingOutputs / totalCommands) * 100;
  }

  /**
   * Summarize differences by severity
   * Requirements: 4.3
   */
  private summarizeDifferences(differences: DiffEntry[]): DiffSummary {
    const summary: DiffSummary = {
      critical: 0,
      major: 0,
      minor: 0,
      formatting: 0,
    };

    for (const diff of differences) {
      summary[diff.severity]++;
    }

    return summary;
  }

  /**
   * Get the current options
   */
  getOptions(): Required<ComparisonOptions> {
    return { ...this.options };
  }

  /**
   * Update options
   */
  setOptions(options: ComparisonOptions): void {
    this.options = { ...this.options, ...options };
  }
}

/**
 * Factory function to create a comparator with default options
 */
export function createComparator(options?: ComparisonOptions): TranscriptComparator {
  return new TranscriptComparator(options);
}
