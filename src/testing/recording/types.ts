/**
 * Type definitions for the Game Recording and Comparison System
 * 
 * This module defines interfaces for recording game sessions from both
 * the TypeScript Zork I implementation and the original z3 file,
 * then comparing outputs to verify behavioral parity.
 */

// ============================================================================
// Recording Types
// ============================================================================

/**
 * Options for recording a game session
 */
export interface RecordingOptions {
  /** Random seed for deterministic behavior */
  seed?: number;
  /** Include timestamps in transcript entries */
  captureTimestamps?: boolean;
  /** Preserve exact whitespace and formatting */
  preserveFormatting?: boolean;
}

/**
 * A single entry in a game transcript
 */
export interface TranscriptEntry {
  /** Zero-based index of this entry in the transcript */
  index: number;
  /** The command that was executed */
  command: string;
  /** The game's output in response to the command */
  output: string;
  /** Unix timestamp when the command was executed (optional) */
  timestamp?: number;
  /** The game's turn number after this command */
  turnNumber: number;
}

/**
 * Metadata about a transcript recording
 */
export interface TranscriptMetadata {
  /** Random seed used for deterministic behavior */
  seed?: number;
  /** Path to the Z-machine interpreter (for z-machine recordings) */
  interpreterPath?: string;
  /** Version of the game being recorded */
  gameVersion?: string;
}

/**
 * A complete transcript of a game session
 */
export interface Transcript {
  /** Unique identifier for this transcript */
  id: string;
  /** Source of the recording */
  source: 'typescript' | 'z-machine';
  /** When the recording started */
  startTime: Date;
  /** When the recording ended */
  endTime: Date;
  /** All command/output entries */
  entries: TranscriptEntry[];
  /** Additional metadata about the recording */
  metadata: TranscriptMetadata;
}

// ============================================================================
// Z-Machine Configuration Types
// ============================================================================

/**
 * Configuration for the Z-Machine recorder
 */
export interface ZMachineConfig {
  /** Path to dfrotz/frotz executable */
  interpreterPath: string;
  /** Path to zork1.z3 game file */
  gameFilePath: string;
  /** Command timeout in milliseconds */
  timeout?: number;
}

// ============================================================================
// Comparison Types
// ============================================================================

/**
 * Severity levels for differences between transcripts
 */
export type DiffSeverity = 'critical' | 'major' | 'minor' | 'formatting';

/**
 * Options for comparing transcripts
 */
export interface ComparisonOptions {
  /** Normalize whitespace before comparison */
  normalizeWhitespace?: boolean;
  /** Ignore case differences in messages */
  ignoreCaseInMessages?: boolean;
  /** Patterns for expected/known differences */
  knownVariations?: string[];
  /** Similarity threshold (0-1) for considering outputs as "matching" */
  toleranceThreshold?: number;
  /** Strip Z-Machine status bar lines before comparison */
  stripStatusBar?: boolean;
  /** Normalize line wrapping differences before comparison */
  normalizeLineWrapping?: boolean;
  /** Strip game header/intro text (version, copyright) before comparison */
  stripGameHeader?: boolean;
}

/**
 * A single difference found between two transcripts
 */
export interface DiffEntry {
  /** Index of the command that produced this difference */
  index: number;
  /** The command that was executed */
  command: string;
  /** Expected output (from transcript A) */
  expected: string;
  /** Actual output (from transcript B) */
  actual: string;
  /** Similarity score (0-1) between expected and actual */
  similarity: number;
  /** Severity classification of this difference */
  severity: DiffSeverity;
  /** Category of the difference (e.g., "room description", "object interaction") */
  category: string;
}

/**
 * Summary of differences by severity
 */
export interface DiffSummary {
  /** Number of critical differences */
  critical: number;
  /** Number of major differences */
  major: number;
  /** Number of minor differences */
  minor: number;
  /** Number of formatting-only differences */
  formatting: number;
}

/**
 * Complete report of differences between two transcripts
 */
export interface DiffReport {
  /** ID of the first transcript (expected/baseline) */
  transcriptA: string;
  /** ID of the second transcript (actual/comparison) */
  transcriptB: string;
  /** Total number of commands compared */
  totalCommands: number;
  /** Number of exact matches */
  exactMatches: number;
  /** Number of close matches (above tolerance threshold) */
  closeMatches: number;
  /** All differences found */
  differences: DiffEntry[];
  /** Parity score (0-100 percentage) */
  parityScore: number;
  /** Summary counts by severity */
  summary: DiffSummary;
}

// ============================================================================
// Command Sequence Types
// ============================================================================

/**
 * A sequence of commands to execute against the game
 */
export interface CommandSequence {
  /** Unique identifier for this sequence */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description of what this sequence tests */
  description?: string;
  /** The commands to execute */
  commands: string[];
  /** Additional metadata */
  metadata?: Record<string, string>;
}

// ============================================================================
// Batch Execution Types
// ============================================================================

/**
 * Options for batch execution of multiple sequences
 */
export interface BatchOptions {
  /** Execute sequences in parallel */
  parallel?: boolean;
  /** Maximum concurrent executions (when parallel is true) */
  maxConcurrency?: number;
  /** Stop execution on first failure */
  stopOnFailure?: boolean;
}

/**
 * Result of executing a single sequence in a batch
 */
export interface SequenceResult {
  /** ID of the sequence */
  id: string;
  /** Name of the sequence */
  name: string;
  /** Parity score for this sequence */
  parityScore: number;
  /** Number of differences found */
  diffCount: number;
  /** Time taken to execute (milliseconds) */
  executionTime: number;
}

/**
 * Aggregated results from a batch execution
 */
export interface BatchResult {
  /** Results for each sequence */
  sequences: SequenceResult[];
  /** Aggregate parity score across all sequences */
  aggregateParityScore: number;
  /** Total number of differences across all sequences */
  totalDifferences: number;
  /** IDs of sequences with the most differences */
  worstSequences: string[];
}

// ============================================================================
// Report Generation Types
// ============================================================================

/**
 * Supported output formats for reports
 */
export type ReportFormat = 'text' | 'json' | 'markdown' | 'html';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Complete configuration for the recording and comparison system
 */
export interface RecordingComparisonConfig {
  /** Path to the Z-machine interpreter */
  interpreterPath: string;
  /** Path to the z3 game file */
  gameFilePath: string;
  /** Default random seed for deterministic behavior */
  defaultSeed?: number;
  /** Default comparison options */
  comparisonOptions?: ComparisonOptions;
  /** Known non-deterministic behaviors to ignore */
  knownVariations?: string[];
}
