#!/usr/bin/env npx tsx
/**
 * CLI Tool for Game Recording and Comparison
 * 
 * Records game sessions from the TypeScript Zork I implementation and/or
 * the original z3 file via Z-machine interpreter, then compares outputs
 * to verify behavioral parity.
 * 
 * Usage:
 *   npx tsx scripts/record-and-compare.ts [options] <sequence-file-or-directory>
 * 
 * Options:
 *   --mode <ts|zm|both>     Recording mode (default: both)
 *   --format <text|json|md|html>  Output format (default: text)
 *   --output <file>         Output file (default: stdout)
 *   --seed <number>         Random seed for deterministic behavior
 *   --batch                 Run in batch mode (directory input)
 *   --parallel              Run batch sequences in parallel
 *   --help                  Show help message
 * 
 * Requirements: 1.1, 2.1
 */

import { parseArgs } from 'util';
import { existsSync, statSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';

import { TypeScriptRecorder } from '../src/testing/recording/tsRecorder.js';
import { ZMachineRecorder } from '../src/testing/recording/zmRecorder.js';
import { TranscriptComparator } from '../src/testing/recording/comparator.js';
import { CommandSequenceLoader } from '../src/testing/recording/sequenceLoader.js';
import { BatchRunner, createBatchRunner } from '../src/testing/recording/batchRunner.js';
import { ReportGenerator } from '../src/testing/recording/reportGenerator.js';
import { loadZMachineConfig, validateConfig } from '../src/testing/recording/config.js';
import { 
  ReportFormat, 
  RecordingOptions,
  CommandSequence,
  Transcript,
  ComparisonOptions
} from '../src/testing/recording/types.js';

// ============================================================================
// Types
// ============================================================================

type RecordingMode = 'ts' | 'zm' | 'both';

interface CLIOptions {
  mode: RecordingMode;
  format: ReportFormat;
  output?: string;
  seed?: number;
  batch: boolean;
  parallel: boolean;
  normalize: boolean;
  help: boolean;
  input?: string;
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArguments(): CLIOptions {
  const { values, positionals } = parseArgs({
    options: {
      mode: {
        type: 'string',
        short: 'm',
        default: 'both'
      },
      format: {
        type: 'string',
        short: 'f',
        default: 'text'
      },
      output: {
        type: 'string',
        short: 'o'
      },
      seed: {
        type: 'string',
        short: 's'
      },
      batch: {
        type: 'boolean',
        short: 'b',
        default: false
      },
      parallel: {
        type: 'boolean',
        short: 'p',
        default: false
      },
      normalize: {
        type: 'boolean',
        short: 'n',
        default: false
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false
      }
    },
    allowPositionals: true
  });

  // Validate mode
  const mode = values.mode as string;
  if (!['ts', 'zm', 'both'].includes(mode)) {
    console.error(`Invalid mode: ${mode}. Must be 'ts', 'zm', or 'both'.`);
    process.exit(1);
  }

  // Validate format
  const format = values.format as string;
  if (!['text', 'json', 'markdown', 'md', 'html'].includes(format)) {
    console.error(`Invalid format: ${format}. Must be 'text', 'json', 'markdown', 'md', or 'html'.`);
    process.exit(1);
  }

  // Parse seed
  let seed: number | undefined;
  if (values.seed) {
    seed = parseInt(values.seed as string, 10);
    if (isNaN(seed)) {
      console.error(`Invalid seed: ${values.seed}. Must be a number.`);
      process.exit(1);
    }
  }

  return {
    mode: mode as RecordingMode,
    format: (format === 'md' ? 'markdown' : format) as ReportFormat,
    output: values.output as string | undefined,
    seed,
    batch: values.batch as boolean,
    parallel: values.parallel as boolean,
    normalize: values.normalize as boolean,
    help: values.help as boolean,
    input: positionals[0]
  };
}

function showHelp(): void {
  console.log(`
Game Recording and Comparison CLI

Usage:
  npx tsx scripts/record-and-compare.ts [options] <sequence-file-or-directory>

Options:
  -m, --mode <ts|zm|both>     Recording mode (default: both)
                              ts   - Record from TypeScript engine only
                              zm   - Record from Z-Machine interpreter only
                              both - Record from both and compare

  -f, --format <format>       Output format (default: text)
                              text     - Plain text report
                              json     - JSON format
                              markdown - Markdown format
                              html     - HTML format

  -o, --output <file>         Output file (default: stdout)

  -s, --seed <number>         Random seed for deterministic behavior

  -b, --batch                 Run in batch mode (input is a directory)

  -p, --parallel              Run batch sequences in parallel

  -n, --normalize             Enable content-focused comparison
                              Strips status bar lines, game headers (version/copyright),
                              and normalizes line wrapping for more accurate
                              content parity measurement

  -h, --help                  Show this help message

Examples:
  # Record and compare a single sequence
  npx tsx scripts/record-and-compare.ts scripts/sequences/basic-exploration.txt

  # Record TypeScript only with seed
  npx tsx scripts/record-and-compare.ts --mode ts --seed 12345 sequence.txt

  # Batch compare all sequences in a directory
  npx tsx scripts/record-and-compare.ts --batch --format markdown scripts/sequences/

  # Generate HTML report to file
  npx tsx scripts/record-and-compare.ts --format html --output report.html sequence.txt

  # Compare with content normalization (ignores status bar and line wrapping)
  npx tsx scripts/record-and-compare.ts --normalize scripts/sequences/basic-exploration.txt

  # Batch compare with normalization
  npx tsx scripts/record-and-compare.ts --batch --normalize --format text scripts/sequences/

Environment Variables:
  ZORK_INTERPRETER_PATH   Path to dfrotz/frotz executable
  ZORK_GAME_FILE_PATH     Path to zork1.z3 game file
  ZORK_DEFAULT_SEED       Default random seed
`);
}

// ============================================================================
// Main Recording Functions
// ============================================================================

async function recordTypeScriptOnly(
  sequence: CommandSequence,
  options: RecordingOptions
): Promise<Transcript> {
  const recorder = new TypeScriptRecorder();
  console.error(`Recording TypeScript: ${sequence.name}...`);
  return recorder.record(sequence.commands, options);
}

async function recordZMachineOnly(
  sequence: CommandSequence,
  options: RecordingOptions
): Promise<Transcript> {
  const config = await loadZMachineConfig();
  const validation = validateConfig(config);
  
  if (!validation.valid) {
    throw new Error(`Z-Machine configuration invalid:\n${validation.errors.join('\n')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.error(`Warnings:\n${validation.warnings.join('\n')}`);
  }

  const recorder = new ZMachineRecorder(config);
  
  if (!await recorder.isAvailable()) {
    throw new Error(
      'Z-Machine interpreter not available.\n' +
      'Install dfrotz or set ZORK_INTERPRETER_PATH environment variable.'
    );
  }

  console.error(`Recording Z-Machine: ${sequence.name}...`);
  return recorder.record(sequence.commands, options);
}

async function recordAndCompare(
  sequence: CommandSequence,
  options: RecordingOptions,
  reportFormat: ReportFormat,
  normalize: boolean = false
): Promise<string> {
  const config = await loadZMachineConfig();
  const validation = validateConfig(config);
  
  // Create recorders
  const tsRecorder = new TypeScriptRecorder();
  let zmRecorder: ZMachineRecorder | null = null;
  
  if (validation.valid) {
    zmRecorder = new ZMachineRecorder(config);
    if (!await zmRecorder.isAvailable()) {
      console.error('Warning: Z-Machine interpreter not available. Recording TypeScript only.');
      zmRecorder = null;
    }
  } else {
    console.error(`Warning: Z-Machine config invalid. Recording TypeScript only.`);
    console.error(validation.errors.join('\n'));
  }

  // Record from TypeScript
  console.error(`Recording TypeScript: ${sequence.name}...`);
  const tsTranscript = await tsRecorder.record(sequence.commands, options);

  // If no Z-Machine, return TypeScript transcript as JSON
  if (!zmRecorder) {
    return JSON.stringify({
      mode: 'typescript-only',
      sequence: sequence.name,
      transcript: tsTranscript
    }, null, 2);
  }

  // Record from Z-Machine
  console.error(`Recording Z-Machine: ${sequence.name}...`);
  const zmTranscript = await zmRecorder.record(sequence.commands, options);

  // Compare with normalization options if enabled
  console.error('Comparing transcripts...');
  const comparisonOptions: ComparisonOptions = normalize
    ? {
        stripStatusBar: true,
        normalizeLineWrapping: true,
        normalizeWhitespace: true,
        stripGameHeader: true
      }
    : {};
  const comparator = new TranscriptComparator(comparisonOptions);
  const diffReport = comparator.compare(zmTranscript, tsTranscript);

  // Generate report
  const reportGenerator = new ReportGenerator();
  return reportGenerator.generate(diffReport, reportFormat);
}

async function runBatch(
  sequences: CommandSequence[],
  cliOptions: CLIOptions,
  recordingOptions: RecordingOptions
): Promise<string> {
  const config = await loadZMachineConfig();
  const validation = validateConfig(config);
  
  let zmRecorder: ZMachineRecorder | null = null;
  
  if (validation.valid) {
    zmRecorder = new ZMachineRecorder(config);
    if (!await zmRecorder.isAvailable()) {
      console.error('Warning: Z-Machine interpreter not available. Recording TypeScript only.');
      zmRecorder = null;
    }
  }

  // Set up comparison options with normalization if enabled
  const comparisonOptions: ComparisonOptions = cliOptions.normalize
    ? {
        stripStatusBar: true,
        normalizeLineWrapping: true,
        normalizeWhitespace: true,
        stripGameHeader: true
      }
    : {};

  const batchRunner = createBatchRunner(zmRecorder, comparisonOptions);
  
  console.error(`Running batch with ${sequences.length} sequences...`);
  if (cliOptions.normalize) {
    console.error('Content normalization enabled (stripping status bar, normalizing line wrapping)');
  }
  
  const result = await batchRunner.run(
    sequences,
    { parallel: cliOptions.parallel },
    recordingOptions
  );

  const reportGenerator = new ReportGenerator();
  return reportGenerator.generateBatchReport(result, cliOptions.format);
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.input) {
    console.error('Error: No input file or directory specified.');
    console.error('Use --help for usage information.');
    process.exit(1);
  }

  const inputPath = resolve(options.input);
  
  if (!existsSync(inputPath)) {
    console.error(`Error: Input not found: ${inputPath}`);
    process.exit(1);
  }

  const loader = new CommandSequenceLoader();
  const recordingOptions: RecordingOptions = {
    seed: options.seed,
    captureTimestamps: true,
    preserveFormatting: false
  };

  let output: string;

  try {
    if (options.batch || statSync(inputPath).isDirectory()) {
      // Batch mode - load all sequences from directory
      const sequences = loader.loadDirectory(inputPath);
      
      if (sequences.length === 0) {
        console.error('Error: No sequence files found in directory.');
        process.exit(1);
      }

      output = await runBatch(sequences, options, recordingOptions);
    } else {
      // Single sequence mode
      const sequence = loader.load(inputPath);

      switch (options.mode) {
        case 'ts': {
          const transcript = await recordTypeScriptOnly(sequence, recordingOptions);
          output = JSON.stringify(transcript, null, 2);
          break;
        }
        case 'zm': {
          const transcript = await recordZMachineOnly(sequence, recordingOptions);
          output = JSON.stringify(transcript, null, 2);
          break;
        }
        case 'both':
        default:
          output = await recordAndCompare(sequence, recordingOptions, options.format, options.normalize);
          break;
      }
    }

    // Output result
    if (options.output) {
      writeFileSync(options.output, output);
      console.error(`Report written to: ${options.output}`);
    } else {
      console.log(output);
    }

  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run main
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
