/**
 * Game Recording and Comparison System
 * 
 * A testing utility for recording game sessions from both the TypeScript
 * Zork I implementation and the original z3 file, then comparing outputs
 * to verify behavioral parity.
 * 
 * @module testing/recording
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Recording types
  RecordingOptions,
  TranscriptEntry,
  TranscriptMetadata,
  Transcript,
  
  // Z-Machine configuration
  ZMachineConfig,
  
  // Comparison types
  DiffSeverity,
  ComparisonOptions,
  DiffEntry,
  DiffSummary,
  DiffReport,
  
  // Command sequence types
  CommandSequence,
  
  // Batch execution types
  BatchOptions,
  SequenceResult,
  BatchResult,
  
  // Report types
  ReportFormat,
  
  // Configuration types
  RecordingComparisonConfig,
} from './types.js';

// ============================================================================
// Class Exports
// ============================================================================

// Recorders
export { GameRecorder, TypeScriptRecorder } from './tsRecorder.js';
export { ZMachineRecorder, ZMachineError } from './zmRecorder.js';

// Sequence loading
export { 
  CommandSequenceLoader, 
  SequenceParseError,
  type LoadOptions 
} from './sequenceLoader.js';

// Comparison
export { 
  TranscriptComparator, 
  createComparator 
} from './comparator.js';

// Message extraction
export {
  MessageExtractor,
  createMessageExtractor,
  extractActionResponse,
  stripGameHeader,
  stripStatusBar,
  stripPrompt,
  stripRoomDescription,
  isMovementCommand,
  type ExtractedMessage
} from './messageExtractor.js';

// Batch execution
export { 
  BatchRunner, 
  createBatchRunner,
  type DetailedSequenceResult,
  type DetailedBatchResult 
} from './batchRunner.js';

// Report generation
export { 
  ReportGenerator, 
  createReportGenerator 
} from './reportGenerator.js';

// Configuration
export {
  loadZMachineConfig,
  loadRecordingConfig,
  validateConfig,
  createSampleConfig,
  ENV_INTERPRETER_PATH,
  ENV_GAME_FILE_PATH,
  ENV_DEFAULT_SEED,
  type ConfigValidationResult
} from './config.js';

// ============================================================================
// Convenience Factory Functions
// ============================================================================

import { TypeScriptRecorder } from './tsRecorder.js';
import { ZMachineRecorder } from './zmRecorder.js';
import { CommandSequenceLoader } from './sequenceLoader.js';
import { TranscriptComparator } from './comparator.js';
import { BatchRunner } from './batchRunner.js';
import { ReportGenerator } from './reportGenerator.js';
import { loadZMachineConfig, validateConfig } from './config.js';
import type { ComparisonOptions, ZMachineConfig } from './types.js';

/**
 * Create a complete recording and comparison system with all components
 * 
 * @param zmConfig - Optional Z-Machine configuration (will auto-detect if not provided)
 * @param comparisonOptions - Optional comparison options
 * @returns Object containing all system components
 */
export async function createRecordingSystem(
  zmConfig?: ZMachineConfig,
  comparisonOptions?: ComparisonOptions
): Promise<{
  tsRecorder: TypeScriptRecorder;
  zmRecorder: ZMachineRecorder | null;
  sequenceLoader: CommandSequenceLoader;
  comparator: TranscriptComparator;
  batchRunner: BatchRunner;
  reportGenerator: ReportGenerator;
  zmAvailable: boolean;
}> {
  // Create TypeScript recorder (always available)
  const tsRecorder = new TypeScriptRecorder();
  
  // Create sequence loader
  const sequenceLoader = new CommandSequenceLoader();
  
  // Create comparator
  const comparator = new TranscriptComparator(comparisonOptions);
  
  // Create report generator
  const reportGenerator = new ReportGenerator();
  
  // Try to create Z-Machine recorder
  let zmRecorder: ZMachineRecorder | null = null;
  let zmAvailable = false;
  
  try {
    const config = zmConfig ?? await loadZMachineConfig();
    const validation = validateConfig(config);
    
    if (validation.valid) {
      zmRecorder = new ZMachineRecorder(config);
      zmAvailable = await zmRecorder.isAvailable();
    }
  } catch {
    // Z-Machine not available - continue without it
  }
  
  // Create batch runner
  const batchRunner = new BatchRunner(tsRecorder, zmRecorder, comparator);
  
  return {
    tsRecorder,
    zmRecorder,
    sequenceLoader,
    comparator,
    batchRunner,
    reportGenerator,
    zmAvailable
  };
}

/**
 * Quick comparison of two command sequences
 * 
 * Records both sequences and compares the outputs.
 * 
 * @param commands - Commands to execute
 * @param seed - Optional random seed for deterministic behavior
 * @param comparisonOptions - Optional comparison options
 * @returns Diff report comparing TypeScript and Z-Machine outputs
 */
export async function quickCompare(
  commands: string[],
  seed?: number,
  comparisonOptions?: ComparisonOptions
): Promise<{
  success: boolean;
  report?: import('./types.js').DiffReport;
  error?: string;
  zmAvailable: boolean;
}> {
  const system = await createRecordingSystem(undefined, comparisonOptions);
  
  if (!system.zmAvailable || !system.zmRecorder) {
    // TypeScript-only recording
    try {
      await system.tsRecorder.record(commands, { seed });
      return {
        success: true,
        zmAvailable: false,
        error: 'Z-Machine interpreter not available - TypeScript recording only'
      };
    } catch (error) {
      return {
        success: false,
        zmAvailable: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  try {
    // Record from both engines
    const [tsTranscript, zmTranscript] = await Promise.all([
      system.tsRecorder.record(commands, { seed }),
      system.zmRecorder.record(commands)
    ]);
    
    // Compare
    const report = system.comparator.compare(zmTranscript, tsTranscript);
    
    return {
      success: true,
      report,
      zmAvailable: true
    };
  } catch (error) {
    return {
      success: false,
      zmAvailable: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
