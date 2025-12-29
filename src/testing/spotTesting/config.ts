import { GameArea, CommandType } from './types.js';

/**
 * Configuration interface for spot testing system
 */
export interface SpotTestConfig {
  /** Number of random commands to execute */
  commandCount: number;
  
  /** Random seed for reproducible testing */
  seed?: number;
  
  /** Maximum execution time in milliseconds */
  timeoutMs: number;
  
  /** Enable quick mode (fewer commands, faster execution) */
  quickMode: boolean;
  
  /** Focus testing on specific game areas */
  focusAreas?: GameArea[];
  
  /** Limit to specific command types */
  commandTypes?: CommandType[];
  
  /** Avoid commands that would end the game */
  avoidGameEnding: boolean;
  
  /** Strict validation mode */
  strictValidation: boolean;
  
  /** Minimum parity percentage for pass/fail in CI/CD */
  passThreshold: number;
  
  /** Enable verbose output */
  verbose: boolean;
  
  /** Configuration file path */
  configFile?: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: SpotTestConfig = {
  commandCount: 50,
  timeoutMs: 30000,
  quickMode: false,
  avoidGameEnding: true,
  strictValidation: false,
  passThreshold: 95,
  verbose: false
};

/**
 * Quick mode configuration (faster execution)
 */
export const QUICK_MODE_CONFIG: Partial<SpotTestConfig> = {
  commandCount: 25,
  timeoutMs: 15000,
  quickMode: true,
  strictValidation: false
};

/**
 * Thorough mode configuration (comprehensive testing)
 */
export const THOROUGH_MODE_CONFIG: Partial<SpotTestConfig> = {
  commandCount: 200,
  timeoutMs: 60000,
  quickMode: false,
  strictValidation: true
};

/**
 * CI/CD mode configuration (automated testing)
 */
export const CI_MODE_CONFIG: Partial<SpotTestConfig> = {
  commandCount: 100,
  timeoutMs: 45000,
  quickMode: false,
  strictValidation: true,
  verbose: false,
  passThreshold: 98
};

/**
 * Configuration validation errors
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`Configuration validation error: ${message}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Configuration manager for spot testing system
 */
export class SpotTestConfigManager {
  private config: SpotTestConfig;

  constructor(config: Partial<SpotTestConfig> = {}) {
    this.config = this.mergeConfigs(DEFAULT_CONFIG, config);
    this.validateConfig();
  }

  /**
   * Get the current configuration
   */
  getConfig(): SpotTestConfig {
    return { ...this.config };
  }

  /**
   * Update configuration with new values
   */
  updateConfig(updates: Partial<SpotTestConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.validateConfig();
  }

  /**
   * Load configuration from file
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      const fileConfig = JSON.parse(content);
      this.updateConfig(fileConfig);
    } catch (error) {
      throw new ConfigValidationError(`Failed to load config from ${filePath}: ${error}`);
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment(): void {
    const envConfig: Partial<SpotTestConfig> = {};

    if (process.env.SPOT_TEST_COMMAND_COUNT) {
      envConfig.commandCount = parseInt(process.env.SPOT_TEST_COMMAND_COUNT, 10);
    }

    if (process.env.SPOT_TEST_SEED) {
      envConfig.seed = parseInt(process.env.SPOT_TEST_SEED, 10);
    }

    if (process.env.SPOT_TEST_TIMEOUT) {
      envConfig.timeoutMs = parseInt(process.env.SPOT_TEST_TIMEOUT, 10);
    }

    if (process.env.SPOT_TEST_QUICK_MODE) {
      envConfig.quickMode = process.env.SPOT_TEST_QUICK_MODE === 'true';
    }

    if (process.env.SPOT_TEST_AVOID_GAME_ENDING) {
      envConfig.avoidGameEnding = process.env.SPOT_TEST_AVOID_GAME_ENDING === 'true';
    }

    if (process.env.SPOT_TEST_STRICT_VALIDATION) {
      envConfig.strictValidation = process.env.SPOT_TEST_STRICT_VALIDATION === 'true';
    }

    if (process.env.SPOT_TEST_PASS_THRESHOLD) {
      envConfig.passThreshold = parseFloat(process.env.SPOT_TEST_PASS_THRESHOLD);
    }

    if (process.env.SPOT_TEST_VERBOSE) {
      envConfig.verbose = process.env.SPOT_TEST_VERBOSE === 'true';
    }

    if (process.env.SPOT_TEST_FOCUS_AREAS) {
      envConfig.focusAreas = process.env.SPOT_TEST_FOCUS_AREAS.split(',') as GameArea[];
    }

    if (process.env.SPOT_TEST_COMMAND_TYPES) {
      envConfig.commandTypes = process.env.SPOT_TEST_COMMAND_TYPES.split(',') as CommandType[];
    }

    this.updateConfig(envConfig);
  }

  /**
   * Apply preset configuration mode
   */
  applyMode(mode: 'quick' | 'standard' | 'thorough' | 'ci'): void {
    let modeConfig: Partial<SpotTestConfig>;

    switch (mode) {
      case 'quick':
        modeConfig = QUICK_MODE_CONFIG;
        break;
      case 'thorough':
        modeConfig = THOROUGH_MODE_CONFIG;
        break;
      case 'ci':
        modeConfig = CI_MODE_CONFIG;
        break;
      default:
        modeConfig = {};
    }

    this.updateConfig(modeConfig);
  }

  /**
   * Generate reproducible seed if not provided
   */
  ensureSeed(): number {
    if (!this.config.seed) {
      this.config.seed = Math.floor(Math.random() * 1000000);
    }
    return this.config.seed;
  }

  /**
   * Validate that the same seed produces identical command sequences
   */
  async validateReproducibility(testRuns: number = 3): Promise<boolean> {
    if (!this.config.seed) {
      throw new ConfigValidationError('Seed must be set for reproducibility validation');
    }

    const { RandomCommandGenerator } = await import('./randomCommandGenerator.js');
    const generator = new RandomCommandGenerator();
    
    // Generate command sequences with the same seed multiple times
    const sequences: string[][] = [];
    
    for (let i = 0; i < testRuns; i++) {
      // Create a test game state for command generation
      const testGameState = {
        currentLocation: 'West of House',
        visibleObjects: ['mailbox', 'leaflet'],
        inventory: [],
        availableDirections: ['north', 'south', 'east'],
        gameFlags: new Map()
      };

      const commands = generator.generateCommands({
        commandCount: 10,
        seed: this.config.seed,
        avoidGameEnding: true
      }, testGameState);

      sequences.push(commands.map(cmd => cmd.command));
    }

    // Verify all sequences are identical
    const firstSequence = sequences[0];
    for (let i = 1; i < sequences.length; i++) {
      if (sequences[i].length !== firstSequence.length) {
        return false;
      }
      
      for (let j = 0; j < firstSequence.length; j++) {
        if (sequences[i][j] !== firstSequence[j]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Generate a deterministic seed from a string
   */
  static generateSeedFromString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000000;
  }

  /**
   * Set seed from string input (useful for named test scenarios)
   */
  setSeedFromString(input: string): void {
    this.config.seed = SpotTestConfigManager.generateSeedFromString(input);
  }

  /**
   * Get seed information for reporting
   */
  getSeedInfo(): { seed: number; isGenerated: boolean; reproducible: boolean } {
    return {
      seed: this.config.seed || 0,
      isGenerated: this.config.seed === undefined,
      reproducible: this.config.seed !== undefined
    };
  }

  /**
   * Validate configuration values
   */
  private validateConfig(): void {
    const { commandCount, timeoutMs, passThreshold } = this.config;

    if (commandCount <= 0) {
      throw new ConfigValidationError('commandCount must be greater than 0');
    }

    if (commandCount > 1000) {
      throw new ConfigValidationError('commandCount cannot exceed 1000 for performance reasons');
    }

    if (timeoutMs <= 0) {
      throw new ConfigValidationError('timeoutMs must be greater than 0');
    }

    if (timeoutMs > 300000) { // 5 minutes
      throw new ConfigValidationError('timeoutMs cannot exceed 300000ms (5 minutes)');
    }

    if (passThreshold < 0 || passThreshold > 100) {
      throw new ConfigValidationError('passThreshold must be between 0 and 100');
    }

    if (this.config.seed !== undefined && (this.config.seed < 0 || this.config.seed > 1000000)) {
      throw new ConfigValidationError('seed must be between 0 and 1000000');
    }

    // Validate focus areas if provided
    if (this.config.focusAreas) {
      const validAreas = Object.values(GameArea);
      for (const area of this.config.focusAreas) {
        if (!validAreas.includes(area)) {
          throw new ConfigValidationError(`Invalid focus area: ${area}`);
        }
      }
    }

    // Validate command types if provided
    if (this.config.commandTypes) {
      const validTypes = Object.values(CommandType);
      for (const type of this.config.commandTypes) {
        if (!validTypes.includes(type)) {
          throw new ConfigValidationError(`Invalid command type: ${type}`);
        }
      }
    }
  }

  /**
   * Merge configuration objects with proper precedence
   */
  private mergeConfigs(base: SpotTestConfig, override: Partial<SpotTestConfig>): SpotTestConfig {
    return {
      ...base,
      ...override,
      // Handle array merging properly
      focusAreas: override.focusAreas || base.focusAreas,
      commandTypes: override.commandTypes || base.commandTypes
    };
  }

  /**
   * Export configuration to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Create configuration from JSON string
   */
  static fromJSON(json: string): SpotTestConfigManager {
    try {
      const config = JSON.parse(json);
      return new SpotTestConfigManager(config);
    } catch (error) {
      throw new ConfigValidationError(`Invalid JSON configuration: ${error}`);
    }
  }

  /**
   * Get configuration summary for logging
   */
  getSummary(): string {
    const { commandCount, seed, timeoutMs, quickMode, focusAreas, commandTypes, passThreshold } = this.config;
    
    let summary = `Commands: ${commandCount}, Timeout: ${timeoutMs}ms, Mode: ${quickMode ? 'Quick' : 'Standard'}`;
    
    if (seed !== undefined) {
      summary += `, Seed: ${seed} (reproducible)`;
    } else {
      summary += `, Seed: will be generated`;
    }
    
    if (focusAreas && focusAreas.length > 0) {
      summary += `, Focus: ${focusAreas.join(', ')}`;
    }
    
    if (commandTypes && commandTypes.length > 0) {
      summary += `, Types: ${commandTypes.join(', ')}`;
    }
    
    summary += `, Pass Threshold: ${passThreshold}%`;
    
    return summary;
  }

  /**
   * Create a reproducible test configuration for debugging
   */
  createReproducibleConfig(testName: string): SpotTestConfig {
    const config = { ...this.config };
    config.seed = SpotTestConfigManager.generateSeedFromString(testName);
    return config;
  }
}

/**
 * Create configuration manager with environment and file overrides
 */
export async function createConfigManager(
  baseConfig: Partial<SpotTestConfig> = {},
  configFile?: string
): Promise<SpotTestConfigManager> {
  const manager = new SpotTestConfigManager(baseConfig);
  
  // Load from environment variables
  manager.loadFromEnvironment();
  
  // Load from config file if provided
  if (configFile) {
    await manager.loadFromFile(configFile);
  }
  
  return manager;
}