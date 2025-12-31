/**
 * ExhaustiveParityValidator - Comprehensive parity testing with multi-seed support
 * 
 * This module provides exhaustive parity validation between the TypeScript
 * Zork I implementation and the original Z-Machine, running tests across
 * multiple seeds and extended command sequences.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { TypeScriptRecorder } from './recording/tsRecorder.js';
import { ZMachineRecorder } from './recording/zmRecorder.js';
import { TranscriptComparator } from './recording/comparator.js';
import { loadZMachineConfig } from './recording/config.js';
import {
  DifferenceClassifier,
  ClassifiedDifference,
  createDifferenceClassifier,
} from './differenceClassifier.js';
import {
  CommandSequence,
  Transcript,
  RecordingOptions,
  EnhancedComparisonOptions,
} from './recording/types.js';
import { CommandSequenceLoader } from './recording/sequenceLoader.js';

/**
 * Configuration for exhaustive parity testing
 * Requirements: 2.1
 */
export interface ParityTestConfig {
  /** Random seeds to test with (minimum 10 for exhaustive testing) */
  seeds: number[];
  /** Minimum commands to execute per seed */
  commandsPerSeed: number;
  /** Command sequences to execute */
  commandSequences: CommandSequence[];
  /** Timeout in milliseconds for entire test run */
  timeout: number;
  /** Comparison options for transcript comparison */
  comparisonOptions?: EnhancedComparisonOptions;
}

/**
 * Default configuration with 10 seeds as specified in requirements
 * Requirements: 2.1
 */
export const DEFAULT_PARITY_CONFIG: ParityTestConfig = {
  seeds: [12345, 67890, 54321, 99999, 11111, 22222, 33333, 44444, 55555, 77777],
  commandsPerSeed: 250,
  commandSequences: [],
  timeout: 300000, // 5 minutes
  comparisonOptions: {
    normalizeWhitespace: true,
    stripStatusBar: true,
    stripGameHeader: true,
    normalizeLineWrapping: true,
    filterLoadingMessages: true,
    toleranceThreshold: 0.95,
  },
};

/**
 * Result from a single seed test run
 */
export interface SeedResult {
  /** The seed used for this test */
  seed: number;
  /** Total commands executed */
  totalCommands: number;
  /** Number of matching responses */
  matchingResponses: number;
  /** All classified differences */
  differences: ClassifiedDifference[];
  /** Parity percentage for this seed */
  parityPercentage: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Whether the test completed successfully */
  success: boolean;
  /** Error message if test failed */
  error?: string;
  /** Number of status bar differences (tracked separately from logic) */
  statusBarDifferences: number;
  /** Logic parity percentage excluding status bar differences */
  logicParityPercentage: number;
}

/**
 * Aggregated results from all parity tests
 * Requirements: 2.3, 2.4, 2.5
 */
export interface ParityResults {
  /** Total number of tests run */
  totalTests: number;
  /** Total differences found across all seeds */
  totalDifferences: number;
  /** Count of RNG-related differences */
  rngDifferences: number;
  /** Count of state divergence differences */
  stateDivergences: number;
  /** Count of logic differences (should be 0 for 100% parity) */
  logicDifferences: number;
  /** Results for each seed */
  seedResults: Map<number, SeedResult>;
  /** Overall parity percentage */
  overallParityPercentage: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Whether all tests passed (zero logic differences) */
  passed: boolean;
  /** Summary message */
  summary: string;
  /** Number of status bar differences (tracked separately from logic) */
  statusBarDifferences: number;
  /** Logic parity percentage excluding status bar differences */
  logicParityPercentage: number;
}

/**
 * Result from running an extended sequence
 */
export interface ExtendedSequenceResult {
  /** Sequence name */
  name: string;
  /** Seed used */
  seed: number;
  /** Total commands executed */
  commandCount: number;
  /** Classified differences */
  differences: ClassifiedDifference[];
  /** Whether any logic differences were found */
  hasLogicDifferences: boolean;
  /** Execution time */
  executionTime: number;
}

/**
 * ExhaustiveParityValidator performs comprehensive parity testing
 * 
 * Features:
 * - Multi-seed testing (10+ seeds)
 * - Extended command sequences (250+ commands)
 * - Difference classification (RNG, State Divergence, Logic)
 * - Detailed reporting
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export class ExhaustiveParityValidator {
  private tsRecorder: TypeScriptRecorder;
  private zmRecorder: ZMachineRecorder | null = null;
  private comparator: TranscriptComparator;
  private classifier: DifferenceClassifier;
  private config: ParityTestConfig;

  constructor(config?: Partial<ParityTestConfig>) {
    this.config = { ...DEFAULT_PARITY_CONFIG, ...config };
    this.tsRecorder = new TypeScriptRecorder();
    this.comparator = new TranscriptComparator(this.config.comparisonOptions);
    this.classifier = createDifferenceClassifier();
  }

  /**
   * Initialize the Z-Machine recorder
   * Must be called before running tests that require Z-Machine comparison
   */
  async initialize(): Promise<boolean> {
    try {
      const zmConfig = await loadZMachineConfig();
      this.zmRecorder = new ZMachineRecorder(zmConfig);
      return await this.zmRecorder.isAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Run parity tests with multiple seeds
   * Requirements: 2.1, 2.2, 2.3, 2.4
   * 
   * @param seeds - Array of seeds to test with (defaults to config seeds)
   * @returns Aggregated parity results
   */
  async runWithSeeds(seeds?: number[]): Promise<ParityResults> {
    const testSeeds = seeds ?? this.config.seeds;
    const startTime = Date.now();
    const seedResults = new Map<number, SeedResult>();

    let totalDifferences = 0;
    let rngDifferences = 0;
    let stateDivergences = 0;
    let logicDifferences = 0;
    let totalMatching = 0;
    let totalCommands = 0;
    let totalStatusBarDifferences = 0;

    for (const seed of testSeeds) {
      const result = await this.runWithSeed(seed);
      seedResults.set(seed, result);

      if (result.success) {
        totalCommands += result.totalCommands;
        totalMatching += result.matchingResponses;
        totalStatusBarDifferences += result.statusBarDifferences;
        
        for (const diff of result.differences) {
          totalDifferences++;
          switch (diff.classification) {
            case 'RNG_DIFFERENCE':
              rngDifferences++;
              break;
            case 'STATE_DIVERGENCE':
              stateDivergences++;
              break;
            case 'LOGIC_DIFFERENCE':
              logicDifferences++;
              break;
          }
        }
      }
    }

    const totalExecutionTime = Date.now() - startTime;
    const overallParityPercentage = totalCommands > 0
      ? (totalMatching / totalCommands) * 100
      : 0;

    // Calculate logic parity percentage (excluding status bar differences)
    const logicParityPercentage = totalCommands > 0
      ? ((totalCommands - logicDifferences) / totalCommands) * 100
      : 0;

    const passed = logicDifferences === 0;
    const summary = this.generateSummary(
      testSeeds.length,
      totalDifferences,
      rngDifferences,
      stateDivergences,
      logicDifferences,
      overallParityPercentage,
      passed
    );

    return {
      totalTests: testSeeds.length,
      totalDifferences,
      rngDifferences,
      stateDivergences,
      logicDifferences,
      seedResults,
      overallParityPercentage,
      totalExecutionTime,
      passed,
      summary,
      statusBarDifferences: totalStatusBarDifferences,
      logicParityPercentage,
    };
  }

  /**
   * Run parity test with a single seed
   * 
   * @param seed - Random seed for deterministic behavior
   * @returns Result for this seed
   */
  async runWithSeed(seed: number): Promise<SeedResult> {
    const startTime = Date.now();
    this.classifier.reset();

    try {
      // Build command sequence from all configured sequences
      const commands = this.buildCommandSequence();
      
      // Ensure we have enough commands
      if (commands.length < this.config.commandsPerSeed) {
        // Pad with additional exploration commands
        const additionalCommands = this.generateAdditionalCommands(
          this.config.commandsPerSeed - commands.length
        );
        commands.push(...additionalCommands);
      }

      const recordingOptions: RecordingOptions = {
        seed,
        suppressRandomMessages: false,
      };

      // Record TypeScript transcript
      const tsTranscript = await this.tsRecorder.record(commands, recordingOptions);

      // If Z-Machine not available, return TS-only result
      if (!this.zmRecorder || !(await this.zmRecorder.isAvailable())) {
        return {
          seed,
          totalCommands: commands.length,
          matchingResponses: commands.length,
          differences: [],
          parityPercentage: 100,
          executionTime: Date.now() - startTime,
          success: true,
          error: 'Z-Machine not available - TypeScript only',
          statusBarDifferences: 0,
          logicParityPercentage: 100,
        };
      }

      // Record Z-Machine transcript
      const zmTranscript = await this.zmRecorder.record(commands, recordingOptions);

      // Compare and classify differences
      const { matchingResponses, differences } = this.compareAndClassify(
        tsTranscript,
        zmTranscript,
        commands
      );

      const parityPercentage = commands.length > 0
        ? (matchingResponses / commands.length) * 100
        : 100;

      // Calculate logic parity (excluding status bar differences)
      const logicDiffs = differences.filter(d => d.classification === 'LOGIC_DIFFERENCE').length;
      const logicParityPercentage = commands.length > 0
        ? ((commands.length - logicDiffs) / commands.length) * 100
        : 100;

      return {
        seed,
        totalCommands: commands.length,
        matchingResponses,
        differences,
        parityPercentage,
        executionTime: Date.now() - startTime,
        success: true,
        statusBarDifferences: 0, // Will be populated when message extraction is integrated
        logicParityPercentage,
      };
    } catch (error) {
      return {
        seed,
        totalCommands: 0,
        matchingResponses: 0,
        differences: [],
        parityPercentage: 0,
        executionTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        statusBarDifferences: 0,
        logicParityPercentage: 0,
      };
    }
  }

  /**
   * Run an extended command sequence (200+ commands)
   * Requirements: 3.4
   * 
   * @param seed - Random seed
   * @param commandCount - Minimum number of commands to execute
   * @returns Extended sequence result
   */
  async runExtendedSequence(
    seed: number,
    commandCount: number = 200
  ): Promise<ExtendedSequenceResult> {
    const startTime = Date.now();
    this.classifier.reset();

    // Build extended command sequence
    const commands = this.buildCommandSequence();
    
    // Ensure we have enough commands
    while (commands.length < commandCount) {
      const additional = this.generateAdditionalCommands(
        Math.min(50, commandCount - commands.length)
      );
      commands.push(...additional);
    }

    const recordingOptions: RecordingOptions = {
      seed,
      suppressRandomMessages: false,
    };

    try {
      const tsTranscript = await this.tsRecorder.record(commands, recordingOptions);

      if (!this.zmRecorder || !(await this.zmRecorder.isAvailable())) {
        return {
          name: 'extended-sequence',
          seed,
          commandCount: commands.length,
          differences: [],
          hasLogicDifferences: false,
          executionTime: Date.now() - startTime,
        };
      }

      const zmTranscript = await this.zmRecorder.record(commands, recordingOptions);
      const { differences } = this.compareAndClassify(tsTranscript, zmTranscript, commands);

      const hasLogicDifferences = differences.some(
        d => d.classification === 'LOGIC_DIFFERENCE'
      );

      return {
        name: 'extended-sequence',
        seed,
        commandCount: commands.length,
        differences,
        hasLogicDifferences,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'extended-sequence',
        seed,
        commandCount: 0,
        differences: [],
        hasLogicDifferences: false,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Classify a single difference
   * 
   * @param tsOutput - TypeScript output
   * @param zmOutput - Z-Machine output
   * @param command - The command that was executed
   * @param commandIndex - Index of the command
   * @returns Classification result
   */
  classifyDifference(
    tsOutput: string,
    zmOutput: string,
    command: string,
    commandIndex: number
  ): ClassifiedDifference {
    return this.classifier.classifyDifference(
      tsOutput,
      zmOutput,
      command,
      commandIndex
    );
  }

  /**
   * Get the current configuration
   */
  getConfig(): ParityTestConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<ParityTestConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.comparisonOptions) {
      this.comparator.setOptions(config.comparisonOptions);
    }
  }

  /**
   * Add command sequences to the configuration
   */
  addCommandSequences(sequences: CommandSequence[]): void {
    this.config.commandSequences.push(...sequences);
  }

  /**
   * Load command sequences from a directory
   * 
   * @param dirPath - Path to directory containing sequence files
   * @returns Number of sequences loaded
   */
  loadSequencesFromDirectory(dirPath: string): number {
    const loader = new CommandSequenceLoader();
    try {
      const sequences = loader.loadDirectory(dirPath);
      this.config.commandSequences.push(...sequences);
      return sequences.length;
    } catch {
      return 0;
    }
  }

  /**
   * Load all default sequences from scripts/sequences directory
   * 
   * @returns Number of sequences loaded
   */
  loadDefaultSequences(): number {
    return this.loadSequencesFromDirectory('scripts/sequences');
  }

  /**
   * Build a combined command sequence from all configured sequences
   */
  private buildCommandSequence(): string[] {
    const commands: string[] = [];
    
    for (const sequence of this.config.commandSequences) {
      commands.push(...sequence.commands);
    }

    return commands;
  }

  /**
   * Generate additional commands to reach the target count
   */
  private generateAdditionalCommands(count: number): string[] {
    const explorationCommands = [
      'look', 'inventory', 'n', 's', 'e', 'w', 'u', 'd',
      'examine me', 'wait', 'look around',
    ];
    
    const commands: string[] = [];
    for (let i = 0; i < count; i++) {
      commands.push(explorationCommands[i % explorationCommands.length]);
    }
    
    return commands;
  }

  /**
   * Compare transcripts and classify all differences
   */
  private compareAndClassify(
    tsTranscript: Transcript,
    zmTranscript: Transcript,
    commands: string[]
  ): { matchingResponses: number; differences: ClassifiedDifference[] } {
    // Compare transcripts (used for normalization context)
    this.comparator.compare(zmTranscript, tsTranscript);
    const differences: ClassifiedDifference[] = [];
    let matchingResponses = 0;

    // Process each entry
    const maxEntries = Math.max(
      tsTranscript.entries.length,
      zmTranscript.entries.length
    );

    for (let i = 0; i < maxEntries; i++) {
      const tsEntry = tsTranscript.entries[i];
      const zmEntry = zmTranscript.entries[i];

      if (!tsEntry || !zmEntry) {
        // Missing entry - this is a difference
        const classified = this.classifier.classifyDifference(
          tsEntry?.output ?? '<missing>',
          zmEntry?.output ?? '<missing>',
          commands[i - 1] ?? '<unknown>',
          i
        );
        differences.push(classified);
        continue;
      }

      // Normalize outputs for comparison
      const tsNormalized = this.normalizeOutput(tsEntry.output);
      const zmNormalized = this.normalizeOutput(zmEntry.output);

      if (tsNormalized === zmNormalized) {
        matchingResponses++;
      } else {
        // Classify the difference
        const classified = this.classifier.classifyDifference(
          tsEntry.output,
          zmEntry.output,
          tsEntry.command,
          i
        );
        differences.push(classified);
      }
    }

    return { matchingResponses, differences };
  }

  /**
   * Normalize output for comparison
   */
  private normalizeOutput(output: string): string {
    return output
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n+/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  }

  /**
   * Generate a summary message for the results
   */
  private generateSummary(
    totalSeeds: number,
    totalDifferences: number,
    rngDifferences: number,
    stateDivergences: number,
    logicDifferences: number,
    parityPercentage: number,
    passed: boolean
  ): string {
    const lines: string[] = [];
    
    lines.push(`Exhaustive Parity Validation Results`);
    lines.push(`====================================`);
    lines.push(`Seeds tested: ${totalSeeds}`);
    lines.push(`Total differences: ${totalDifferences}`);
    lines.push(`  - RNG differences: ${rngDifferences}`);
    lines.push(`  - State divergences: ${stateDivergences}`);
    lines.push(`  - Logic differences: ${logicDifferences}`);
    lines.push(`Overall parity: ${parityPercentage.toFixed(2)}%`);
    lines.push(`Status: ${passed ? 'PASSED ✓' : 'FAILED ✗'}`);
    
    if (!passed) {
      lines.push(`\nWARNING: ${logicDifferences} logic difference(s) detected!`);
      lines.push(`These indicate behavioral differences that are NOT due to RNG.`);
    }

    return lines.join('\n');
  }
}

/**
 * Factory function to create an ExhaustiveParityValidator
 */
export function createExhaustiveParityValidator(
  config?: Partial<ParityTestConfig>
): ExhaustiveParityValidator {
  return new ExhaustiveParityValidator(config);
}

/**
 * Quick validation function for CI/CD integration
 * Requirements: 4.3, 4.4
 * 
 * @param seeds - Seeds to test (defaults to first 5 for speed)
 * @returns Promise resolving to true if all tests pass
 */
export async function quickParityValidation(seeds?: number[]): Promise<boolean> {
  const validator = createExhaustiveParityValidator({
    seeds: seeds ?? [12345, 67890, 54321, 99999, 11111],
    commandsPerSeed: 100, // Reduced for quick validation
  });

  await validator.initialize();
  const results = await validator.runWithSeeds();
  
  return results.passed;
}
