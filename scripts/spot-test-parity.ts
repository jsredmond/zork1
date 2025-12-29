#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import { existsSync } from 'node:fs';
import { SpotTestConfigManager, createConfigManager, DEFAULT_CONFIG } from '../src/testing/spotTesting/config.js';
import { SpotTestRunner } from '../src/testing/spotTesting/spotTestRunner.js';
import { GameArea, CommandType } from '../src/testing/spotTesting/types.js';

/**
 * CLI interface for random parity spot testing
 */

const HELP_TEXT = `
Zork I Random Parity Spot Testing

USAGE:
  npx tsx scripts/spot-test-parity.ts [OPTIONS]

MODES:
  --quick              Quick mode (25 commands, ~15s)
  --standard           Standard mode (50 commands, ~30s) [default]
  --thorough           Thorough mode (200 commands, ~60s)
  --ci                 CI/CD mode (100 commands, strict validation)

OPTIONS:
  --commands <n>       Number of commands to execute (1-1000)
  --seed <n>           Random seed for reproducible testing (0-1000000)
  --timeout <ms>       Maximum execution time in milliseconds
  --threshold <n>      Pass/fail threshold percentage (0-100)
  --focus <areas>      Focus on specific areas (comma-separated)
  --types <types>      Limit to command types (comma-separated)
  --config <file>      Load configuration from JSON file
  --verbose            Enable verbose output
  --strict             Enable strict validation mode
  --allow-death        Allow game-ending commands
  --output <format>    Output format: text, json, junit
  --help               Show this help message

FOCUS AREAS:
  house, forest, underground, puzzles, combat, treasure

COMMAND TYPES:
  movement, object_interaction, examination, inventory, puzzle_action, communication

EXAMPLES:
  # Quick spot test
  npx tsx scripts/spot-test-parity.ts --quick

  # Standard test with specific seed
  npx tsx scripts/spot-test-parity.ts --seed 12345

  # Focus on puzzle areas with more commands
  npx tsx scripts/spot-test-parity.ts --focus puzzles --commands 100

  # CI/CD integration
  npx tsx scripts/spot-test-parity.ts --ci --threshold 98 --output json

  # Thorough testing with custom config
  npx tsx scripts/spot-test-parity.ts --thorough --config spot-test.json

EXIT CODES:
  0  All tests passed (parity above threshold)
  1  Tests failed (parity below threshold)
  2  Configuration error
  3  Execution error
`;

interface CLIOptions {
  quick?: boolean;
  standard?: boolean;
  thorough?: boolean;
  ci?: boolean;
  commands?: string;
  seed?: string;
  timeout?: string;
  threshold?: string;
  focus?: string;
  types?: string;
  config?: string;
  verbose?: boolean;
  strict?: boolean;
  'allow-death'?: boolean;
  output?: string;
  help?: boolean;
}

/**
 * Parse and validate CLI arguments
 */
function parseCliArgs(): CLIOptions {
  try {
    const { values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        quick: { type: 'boolean' },
        standard: { type: 'boolean' },
        thorough: { type: 'boolean' },
        ci: { type: 'boolean' },
        commands: { type: 'string' },
        seed: { type: 'string' },
        timeout: { type: 'string' },
        threshold: { type: 'string' },
        focus: { type: 'string' },
        types: { type: 'string' },
        config: { type: 'string' },
        verbose: { type: 'boolean' },
        strict: { type: 'boolean' },
        'allow-death': { type: 'boolean' },
        output: { type: 'string' },
        help: { type: 'boolean' }
      },
      allowPositionals: false
    });

    return values as CLIOptions;
  } catch (error) {
    console.error(`Error parsing arguments: ${error}`);
    process.exit(2);
  }
}

/**
 * Validate CLI options
 */
function validateOptions(options: CLIOptions): void {
  // Check for conflicting mode options
  const modes = [options.quick, options.standard, options.thorough, options.ci].filter(Boolean);
  if (modes.length > 1) {
    console.error('Error: Only one mode can be specified (--quick, --standard, --thorough, --ci)');
    process.exit(2);
  }

  // Validate numeric options
  if (options.commands) {
    const commands = parseInt(options.commands, 10);
    if (isNaN(commands) || commands < 1 || commands > 1000) {
      console.error('Error: --commands must be a number between 1 and 1000');
      process.exit(2);
    }
  }

  if (options.seed) {
    const seed = parseInt(options.seed, 10);
    if (isNaN(seed) || seed < 0 || seed > 1000000) {
      console.error('Error: --seed must be a number between 0 and 1000000');
      process.exit(2);
    }
  }

  if (options.timeout) {
    const timeout = parseInt(options.timeout, 10);
    if (isNaN(timeout) || timeout < 1000 || timeout > 300000) {
      console.error('Error: --timeout must be between 1000ms and 300000ms');
      process.exit(2);
    }
  }

  if (options.threshold) {
    const threshold = parseFloat(options.threshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      console.error('Error: --threshold must be a number between 0 and 100');
      process.exit(2);
    }
  }

  // Validate focus areas
  if (options.focus) {
    const areas = options.focus.split(',').map(a => a.trim());
    const validAreas = Object.values(GameArea);
    for (const area of areas) {
      if (!validAreas.includes(area as GameArea)) {
        console.error(`Error: Invalid focus area '${area}'. Valid areas: ${validAreas.join(', ')}`);
        process.exit(2);
      }
    }
  }

  // Validate command types
  if (options.types) {
    const types = options.types.split(',').map(t => t.trim());
    const validTypes = Object.values(CommandType);
    for (const type of types) {
      if (!validTypes.includes(type as CommandType)) {
        console.error(`Error: Invalid command type '${type}'. Valid types: ${validTypes.join(', ')}`);
        process.exit(2);
      }
    }
  }

  // Validate config file exists
  if (options.config && !existsSync(options.config)) {
    console.error(`Error: Configuration file '${options.config}' not found`);
    process.exit(2);
  }

  // Validate output format
  if (options.output && !['text', 'json', 'junit'].includes(options.output)) {
    console.error('Error: --output must be one of: text, json, junit');
    process.exit(2);
  }
}

/**
 * Convert CLI options to configuration
 */
function optionsToConfig(options: CLIOptions) {
  const config: any = {};

  // Apply mode configurations
  let mode: 'quick' | 'standard' | 'thorough' | 'ci' = 'standard';
  if (options.quick) mode = 'quick';
  else if (options.thorough) mode = 'thorough';
  else if (options.ci) mode = 'ci';

  // Override with specific options
  if (options.commands) {
    config.commandCount = parseInt(options.commands, 10);
  }

  if (options.seed) {
    config.seed = parseInt(options.seed, 10);
  }

  if (options.timeout) {
    config.timeoutMs = parseInt(options.timeout, 10);
  }

  if (options.threshold) {
    config.passThreshold = parseFloat(options.threshold);
  }

  if (options.focus) {
    config.focusAreas = options.focus.split(',').map(a => a.trim() as GameArea);
  }

  if (options.types) {
    config.commandTypes = options.types.split(',').map(t => t.trim() as CommandType);
  }

  if (options.verbose) {
    config.verbose = true;
  }

  if (options.strict) {
    config.strictValidation = true;
  }

  if (options['allow-death']) {
    config.avoidGameEnding = false;
  }

  return { config, mode, configFile: options.config };
}

/**
 * Format test results for output
 */
function formatResults(result: any, format: string = 'text'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    
    case 'junit':
      const passed = result.parityScore >= result.passThreshold;
      const testCase = `
    <testcase name="spot-parity-test" classname="SpotTesting" time="${result.executionTime / 1000}">
      ${passed ? '' : `<failure message="Parity below threshold: ${result.parityScore}% < ${result.passThreshold}%">${result.differences.length} differences found</failure>`}
    </testcase>`;
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="SpotParityTesting" tests="1" failures="${passed ? 0 : 1}" time="${result.executionTime / 1000}">
${testCase}
</testsuite>`;
    
    default: // text
      return formatTextResults(result);
  }
}

/**
 * Format results as human-readable text
 */
function formatTextResults(result: any): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('ZORK I RANDOM PARITY SPOT TEST RESULTS');
  lines.push('='.repeat(60));
  lines.push('');
  
  // Summary
  lines.push(`Commands Executed: ${result.totalCommands}`);
  lines.push(`Execution Time: ${(result.executionTime / 1000).toFixed(2)}s`);
  lines.push(`Differences Found: ${result.differences.length}`);
  lines.push(`Parity Score: ${result.parityScore.toFixed(1)}%`);
  lines.push(`Pass Threshold: ${result.passThreshold}%`);
  lines.push('');
  
  // Pass/Fail status
  const passed = result.parityScore >= result.passThreshold;
  lines.push(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push('');
  
  // Recommendations
  if (result.recommendDeepAnalysis) {
    lines.push('⚠️  RECOMMENDATION: Deep analysis recommended');
    lines.push('   Consider running comprehensive parity tests');
    lines.push('');
  }
  
  // Issue patterns
  if (result.issuePatterns && result.issuePatterns.length > 0) {
    lines.push('Issue Patterns Detected:');
    for (const pattern of result.issuePatterns) {
      lines.push(`  • ${pattern.type}: ${pattern.description} (${pattern.frequency} occurrences)`);
    }
    lines.push('');
  }
  
  // Sample differences (first 3)
  if (result.differences.length > 0) {
    lines.push('Sample Differences:');
    const sampleCount = Math.min(3, result.differences.length);
    for (let i = 0; i < sampleCount; i++) {
      const diff = result.differences[i];
      lines.push(`  ${i + 1}. Command: "${diff.command}"`);
      lines.push(`     Type: ${diff.differenceType}, Severity: ${diff.severity}`);
      lines.push(`     TS:  ${diff.tsOutput.substring(0, 80)}${diff.tsOutput.length > 80 ? '...' : ''}`);
      lines.push(`     ZM:  ${diff.zmOutput.substring(0, 80)}${diff.zmOutput.length > 80 ? '...' : ''}`);
      lines.push('');
    }
    
    if (result.differences.length > sampleCount) {
      lines.push(`  ... and ${result.differences.length - sampleCount} more differences`);
      lines.push('');
    }
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

/**
 * Main CLI execution
 */
async function main(): Promise<void> {
  const options = parseCliArgs();
  
  // Show help
  if (options.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }
  
  // Validate options
  validateOptions(options);
  
  try {
    // Create configuration
    const { config, mode, configFile } = optionsToConfig(options);
    const configManager = await createConfigManager(config, configFile);
    configManager.applyMode(mode);
    
    // Ensure seed for reproducibility
    const seed = configManager.ensureSeed();
    
    // Show configuration summary if verbose
    if (options.verbose || config.verbose) {
      console.log('Configuration:', configManager.getSummary());
      console.log(`Using seed: ${seed}`);
      console.log('');
    }
    
    // Run spot test
    console.log('Running random parity spot test...');
    const runner = new SpotTestRunner();
    const result = await runner.runSpotTest(configManager.getConfig());
    
    // Format and display results
    const outputFormat = options.output || 'text';
    const formattedResults = formatResults(result, outputFormat);
    console.log(formattedResults);
    
    // Exit with appropriate code
    const passed = result.parityScore >= configManager.getConfig().passThreshold;
    process.exit(passed ? 0 : 1);
    
  } catch (error) {
    console.error('Error running spot test:', error);
    process.exit(3);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(3);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(3);
});

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(3);
  });
}