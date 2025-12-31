/**
 * Configuration Loader for Game Recording System
 * 
 * Loads interpreter path and game file path from configuration.
 * Supports environment variable overrides.
 * Validates paths exist before recording.
 */

import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { 
  ZMachineConfig, 
  RecordingComparisonConfig,
  ComparisonOptions 
} from './types.js';

/** Environment variable names for configuration overrides */
export const ENV_INTERPRETER_PATH = 'ZORK_INTERPRETER_PATH';
export const ENV_GAME_FILE_PATH = 'ZORK_GAME_FILE_PATH';
export const ENV_DEFAULT_SEED = 'ZORK_DEFAULT_SEED';

/** Default paths relative to project root */
const DEFAULT_INTERPRETER_PATHS = [
  '/usr/local/bin/dfrotz',
  '/usr/bin/dfrotz',
  '/opt/homebrew/bin/dfrotz',
  'dfrotz'  // Rely on PATH
];

const DEFAULT_GAME_FILE_PATH = 'reference/COMPILED/zork1.z3';

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Load Z-Machine configuration from various sources
 * 
 * Priority order:
 * 1. Environment variables (highest)
 * 2. Configuration file
 * 3. Default values (lowest)
 * 
 * @param configPath - Optional path to configuration file
 * @returns ZMachineConfig with resolved paths
 */
export async function loadZMachineConfig(configPath?: string): Promise<ZMachineConfig> {
  // Start with defaults
  let config: ZMachineConfig = {
    interpreterPath: findDefaultInterpreter(),
    gameFilePath: resolveProjectPath(DEFAULT_GAME_FILE_PATH),
    timeout: 5000
  };

  // Try to load from config file
  if (configPath) {
    const fileConfig = await loadConfigFile(configPath);
    if (fileConfig) {
      config = {
        ...config,
        interpreterPath: fileConfig.interpreterPath || config.interpreterPath,
        gameFilePath: fileConfig.gameFilePath || config.gameFilePath
      };
    }
  }

  // Apply environment variable overrides
  config = applyEnvironmentOverrides(config);

  return config;
}

/**
 * Load full recording comparison configuration
 * 
 * @param configPath - Optional path to configuration file
 * @returns Complete RecordingComparisonConfig
 */
export async function loadRecordingConfig(configPath?: string): Promise<RecordingComparisonConfig> {
  const zmConfig = await loadZMachineConfig(configPath);
  
  // Load additional config from file if available
  let fullConfig: RecordingComparisonConfig = {
    interpreterPath: zmConfig.interpreterPath,
    gameFilePath: zmConfig.gameFilePath,
    defaultSeed: getDefaultSeed(),
    comparisonOptions: getDefaultComparisonOptions(),
    knownVariations: getDefaultKnownVariations()
  };

  if (configPath) {
    const fileConfig = await loadConfigFile(configPath);
    if (fileConfig) {
      fullConfig = {
        ...fullConfig,
        defaultSeed: fileConfig.defaultSeed ?? fullConfig.defaultSeed,
        comparisonOptions: fileConfig.comparisonOptions ?? fullConfig.comparisonOptions,
        knownVariations: fileConfig.knownVariations ?? fullConfig.knownVariations
      };
    }
  }

  return fullConfig;
}

/**
 * Validate a configuration
 * 
 * @param config - Configuration to validate
 * @returns Validation result with errors and warnings
 */
export function validateConfig(config: ZMachineConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check interpreter path
  if (!config.interpreterPath) {
    errors.push('Interpreter path is not specified');
  } else if (!existsSync(config.interpreterPath)) {
    // Check if it might be in PATH
    if (!config.interpreterPath.includes('/')) {
      warnings.push(
        `Interpreter '${config.interpreterPath}' not found as absolute path. ` +
        `Will attempt to use from system PATH.`
      );
    } else {
      errors.push(`Interpreter not found at: ${config.interpreterPath}`);
    }
  }

  // Check game file path
  if (!config.gameFilePath) {
    errors.push('Game file path is not specified');
  } else if (!existsSync(config.gameFilePath)) {
    errors.push(`Game file not found at: ${config.gameFilePath}`);
  }

  // Check timeout
  if (config.timeout !== undefined && config.timeout <= 0) {
    warnings.push('Timeout should be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Find the first available default interpreter
 */
function findDefaultInterpreter(): string {
  for (const path of DEFAULT_INTERPRETER_PATHS) {
    if (path.includes('/')) {
      // Absolute path - check if exists
      if (existsSync(path)) {
        return path;
      }
    } else {
      // Relative name - return as-is (will use PATH)
      return path;
    }
  }
  return 'dfrotz';  // Fallback to PATH lookup
}

/**
 * Resolve a path relative to the project root
 */
function resolveProjectPath(relativePath: string): string {
  // Get the directory of this module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Navigate up to project root (src/testing/recording -> project root)
  const projectRoot = resolve(__dirname, '..', '..', '..');
  
  return resolve(projectRoot, relativePath);
}

/**
 * Load configuration from a JSON file
 */
async function loadConfigFile(configPath: string): Promise<Partial<RecordingComparisonConfig> | null> {
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as Partial<RecordingComparisonConfig>;
  } catch {
    // File doesn't exist or is invalid - return null
    return null;
  }
}

/**
 * Apply environment variable overrides to configuration
 */
function applyEnvironmentOverrides(config: ZMachineConfig): ZMachineConfig {
  const result = { ...config };

  // Override interpreter path
  const envInterpreter = process.env[ENV_INTERPRETER_PATH];
  if (envInterpreter) {
    result.interpreterPath = envInterpreter;
  }

  // Override game file path
  const envGameFile = process.env[ENV_GAME_FILE_PATH];
  if (envGameFile) {
    result.gameFilePath = envGameFile;
  }

  return result;
}

/**
 * Get default seed from environment or use default
 */
function getDefaultSeed(): number {
  const envSeed = process.env[ENV_DEFAULT_SEED];
  if (envSeed) {
    const parsed = parseInt(envSeed, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return 12345;  // Default seed
}

/**
 * Get default comparison options
 */
function getDefaultComparisonOptions(): ComparisonOptions {
  return {
    normalizeWhitespace: true,
    ignoreCaseInMessages: false,
    toleranceThreshold: 0.95
  };
}

/**
 * Get default known variations (non-deterministic behaviors)
 */
function getDefaultKnownVariations(): string[] {
  return [
    'combat outcome',
    'thief movement',
    'random encounter'
  ];
}

/**
 * Create a sample configuration file content
 */
export function createSampleConfig(): string {
  const sample: RecordingComparisonConfig = {
    interpreterPath: '/usr/local/bin/dfrotz',
    gameFilePath: 'reference/COMPILED/zork1.z3',
    defaultSeed: 12345,
    comparisonOptions: {
      normalizeWhitespace: true,
      ignoreCaseInMessages: false,
      toleranceThreshold: 0.95
    },
    knownVariations: [
      'combat outcome',
      'thief movement',
      'random encounter'
    ]
  };

  return JSON.stringify(sample, null, 2);
}
