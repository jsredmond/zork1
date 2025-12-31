#!/usr/bin/env tsx
/**
 * CLI for Parity Validation with Regression Prevention
 * 
 * This script provides CI/CD integration for parity validation.
 * It runs exhaustive parity tests and compares against a baseline.
 * 
 * Usage:
 *   npm run parity:validate              # Run validation against baseline
 *   npm run parity:validate -- --establish-baseline  # Create new baseline
 *   npm run parity:validate -- --quick   # Quick validation (fewer seeds)
 * 
 * Exit Codes:
 *   0 - Success (no regressions)
 *   1 - Regression detected
 *   2 - No baseline exists
 *   3 - Execution error
 *   4 - Timeout
 * 
 * Requirements: 4.3, 4.4
 */

import {
  createExhaustiveParityValidator,
  DEFAULT_PARITY_CONFIG,
} from './exhaustiveParityValidator.js';
import {
  createRegressionPrevention,
  EXIT_CODES,
  getExitCode,
  DEFAULT_BASELINE_PATH,
} from './regressionPrevention.js';

interface CLIOptions {
  establishBaseline: boolean;
  quick: boolean;
  seeds?: number[];
  commandsPerSeed?: number;
  baselinePath: string;
  timeout: number;
  verbose: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  
  const options: CLIOptions = {
    establishBaseline: false,
    quick: false,
    baselinePath: DEFAULT_BASELINE_PATH,
    timeout: 300000, // 5 minutes default
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--establish-baseline':
      case '-e':
        options.establishBaseline = true;
        break;
      case '--quick':
      case '-q':
        options.quick = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--baseline-path':
      case '-b':
        options.baselinePath = args[++i] || DEFAULT_BASELINE_PATH;
        break;
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i] || '300000', 10);
        break;
      case '--seeds':
      case '-s':
        const seedsStr = args[++i] || '';
        options.seeds = seedsStr.split(',').map(s => parseInt(s.trim(), 10));
        break;
      case '--commands':
      case '-c':
        options.commandsPerSeed = parseInt(args[++i] || '100', 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Parity Validation CLI
=====================

Usage: npm run parity:validate [options]

Options:
  --establish-baseline, -e   Create a new baseline from current results
  --quick, -q                Quick validation (5 seeds, 100 commands)
  --verbose, -v              Show detailed output
  --baseline-path, -b PATH   Path to baseline file (default: ${DEFAULT_BASELINE_PATH})
  --timeout, -t MS           Timeout in milliseconds (default: 300000)
  --seeds, -s SEEDS          Comma-separated list of seeds
  --commands, -c COUNT       Commands per seed
  --help, -h                 Show this help message

Exit Codes:
  0 - Success (no regressions)
  1 - Regression detected
  2 - No baseline exists (when not establishing)
  3 - Execution error
  4 - Timeout

Examples:
  npm run parity:validate                    # Standard validation
  npm run parity:validate -- --quick         # Quick validation
  npm run parity:validate -- -e              # Establish new baseline
  npm run parity:validate -- -s 12345,67890  # Test specific seeds
`);
}

function log(message: string, verbose: boolean = false): void {
  if (verbose || !process.env.CI) {
    console.log(message);
  }
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const options = parseArgs();

  log('');
  log('='.repeat(60));
  log('Parity Validation');
  log('='.repeat(60));
  log('');

  // Configure validator based on options
  const seeds = options.seeds ?? (options.quick 
    ? [12345, 67890, 54321, 99999, 11111]  // 5 seeds for quick mode
    : DEFAULT_PARITY_CONFIG.seeds);         // 10 seeds for full mode

  const commandsPerSeed = options.commandsPerSeed ?? (options.quick ? 100 : 250);

  log(`Mode: ${options.quick ? 'Quick' : 'Full'}`);
  log(`Seeds: ${seeds.length}`);
  log(`Commands per seed: ${commandsPerSeed}`);
  log(`Timeout: ${options.timeout}ms`);
  log(`Baseline path: ${options.baselinePath}`);
  log('');

  // Create validator
  const validator = createExhaustiveParityValidator({
    seeds,
    commandsPerSeed,
    timeout: options.timeout,
  });

  // Load default sequences
  const sequenceCount = validator.loadDefaultSequences();
  log(`Loaded ${sequenceCount} command sequences`);
  log('');

  // Initialize Z-Machine recorder
  log('Initializing Z-Machine recorder...');
  const zmAvailable = await validator.initialize();
  if (!zmAvailable) {
    log('Warning: Z-Machine not available. Running TypeScript-only validation.');
  }
  log('');

  // Set up timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Validation timed out'));
    }, options.timeout);
  });

  try {
    // Run validation with timeout
    log('Running parity validation...');
    log('');

    const results = await Promise.race([
      validator.runWithSeeds(seeds),
      timeoutPromise,
    ]);

    // Print results summary
    log(results.summary);
    log('');

    // Create regression prevention instance
    const prevention = createRegressionPrevention(options.baselinePath);

    if (options.establishBaseline) {
      // Establish new baseline
      log('Establishing new baseline...');
      
      // Try to get git commit hash
      let commitHash: string | undefined;
      try {
        const { execSync } = await import('child_process');
        commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
      } catch {
        // Git not available or not in a repo
      }

      const baseline = prevention.establishBaseline(results, commitHash);
      
      log(`Baseline established at: ${options.baselinePath}`);
      log(`Total differences: ${baseline.totalDifferences}`);
      log(`  - RNG differences: ${baseline.summary.rngDifferences}`);
      log(`  - State divergences: ${baseline.summary.stateDivergences}`);
      log(`  - Logic differences: ${baseline.summary.logicDifferences}`);
      log('');

      if (baseline.summary.logicDifferences > 0) {
        log('WARNING: Baseline contains logic differences!');
        log('This should be investigated before using as a baseline.');
        process.exit(EXIT_CODES.REGRESSION_DETECTED);
      }

      log('Baseline established successfully.');
      process.exit(EXIT_CODES.SUCCESS);
    }

    // Run regression detection
    log('Checking for regressions...');
    const regressionResult = prevention.detectRegressions(results);

    log('');
    log(regressionResult.summary);
    log('');

    if (!regressionResult.passed) {
      if (regressionResult.errorMessage) {
        console.error(regressionResult.errorMessage);
      }
    }

    const exitCode = getExitCode(regressionResult, prevention.hasBaseline());
    
    const elapsed = Date.now() - startTime;
    log(`Completed in ${(elapsed / 1000).toFixed(2)}s`);
    log('');

    if (exitCode === EXIT_CODES.SUCCESS) {
      log('✓ Parity validation PASSED');
    } else if (exitCode === EXIT_CODES.NO_BASELINE) {
      log('⚠ No baseline exists. Run with --establish-baseline to create one.');
    } else {
      log('✗ Parity validation FAILED');
    }

    process.exit(exitCode);

  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    if (error instanceof Error && error.message === 'Validation timed out') {
      console.error(`\nValidation timed out after ${(elapsed / 1000).toFixed(2)}s`);
      process.exit(EXIT_CODES.TIMEOUT);
    }

    console.error('\nExecution error:', error);
    process.exit(EXIT_CODES.EXECUTION_ERROR);
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(EXIT_CODES.EXECUTION_ERROR);
});
