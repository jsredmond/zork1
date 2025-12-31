/**
 * Unit tests for Configuration Loader
 * 
 * Tests configuration loading, environment variable overrides,
 * and path validation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  loadZMachineConfig, 
  validateConfig, 
  createSampleConfig,
  ENV_INTERPRETER_PATH,
  ENV_GAME_FILE_PATH,
  ENV_DEFAULT_SEED
} from './config.js';
import { ZMachineConfig } from './types.js';

describe('Configuration Loader', () => {
  // Store original env values
  let originalInterpreterPath: string | undefined;
  let originalGameFilePath: string | undefined;
  let originalDefaultSeed: string | undefined;

  beforeEach(() => {
    // Save original env values
    originalInterpreterPath = process.env[ENV_INTERPRETER_PATH];
    originalGameFilePath = process.env[ENV_GAME_FILE_PATH];
    originalDefaultSeed = process.env[ENV_DEFAULT_SEED];
    
    // Clear env vars for clean tests
    delete process.env[ENV_INTERPRETER_PATH];
    delete process.env[ENV_GAME_FILE_PATH];
    delete process.env[ENV_DEFAULT_SEED];
  });

  afterEach(() => {
    // Restore original env values
    if (originalInterpreterPath !== undefined) {
      process.env[ENV_INTERPRETER_PATH] = originalInterpreterPath;
    } else {
      delete process.env[ENV_INTERPRETER_PATH];
    }
    
    if (originalGameFilePath !== undefined) {
      process.env[ENV_GAME_FILE_PATH] = originalGameFilePath;
    } else {
      delete process.env[ENV_GAME_FILE_PATH];
    }
    
    if (originalDefaultSeed !== undefined) {
      process.env[ENV_DEFAULT_SEED] = originalDefaultSeed;
    } else {
      delete process.env[ENV_DEFAULT_SEED];
    }
  });

  describe('loadZMachineConfig', () => {
    it('should return config with default values when no config file', async () => {
      const config = await loadZMachineConfig();
      
      expect(config.interpreterPath).toBeDefined();
      expect(config.gameFilePath).toBeDefined();
      expect(config.timeout).toBe(5000);
    });

    it('should apply environment variable overrides', async () => {
      process.env[ENV_INTERPRETER_PATH] = '/custom/path/dfrotz';
      process.env[ENV_GAME_FILE_PATH] = '/custom/game.z3';
      
      const config = await loadZMachineConfig();
      
      expect(config.interpreterPath).toBe('/custom/path/dfrotz');
      expect(config.gameFilePath).toBe('/custom/game.z3');
    });

    it('should handle missing config file gracefully', async () => {
      const config = await loadZMachineConfig('/nonexistent/config.json');
      
      // Should still return valid config with defaults
      expect(config.interpreterPath).toBeDefined();
      expect(config.gameFilePath).toBeDefined();
    });
  });

  describe('validateConfig', () => {
    it('should return valid for existing paths', () => {
      // Use paths that exist in the project
      const config: ZMachineConfig = {
        interpreterPath: 'dfrotz',  // Will use PATH lookup
        gameFilePath: 'reference/COMPILED/zork1.z3'
      };
      
      const result = validateConfig(config);
      
      // May have warnings about PATH lookup, but should be valid if game file exists
      expect(result.errors.filter(e => !e.includes('Interpreter'))).toHaveLength(0);
    });

    it('should return error for missing interpreter path', () => {
      const config: ZMachineConfig = {
        interpreterPath: '',
        gameFilePath: 'reference/COMPILED/zork1.z3'
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Interpreter'))).toBe(true);
    });

    it('should return error for missing game file path', () => {
      const config: ZMachineConfig = {
        interpreterPath: 'dfrotz',
        gameFilePath: ''
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Game file'))).toBe(true);
    });

    it('should return error for nonexistent game file', () => {
      const config: ZMachineConfig = {
        interpreterPath: 'dfrotz',
        gameFilePath: '/nonexistent/game.z3'
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not found'))).toBe(true);
    });

    it('should return warning for relative interpreter path', () => {
      const config: ZMachineConfig = {
        interpreterPath: 'dfrotz',  // Relative, will use PATH
        gameFilePath: 'reference/COMPILED/zork1.z3'
      };
      
      const result = validateConfig(config);
      
      // Should have warning about PATH lookup
      expect(result.warnings.some(e => e.includes('PATH'))).toBe(true);
    });

    it('should return warning for invalid timeout', () => {
      const config: ZMachineConfig = {
        interpreterPath: 'dfrotz',
        gameFilePath: 'reference/COMPILED/zork1.z3',
        timeout: -1
      };
      
      const result = validateConfig(config);
      
      expect(result.warnings.some(e => e.includes('Timeout'))).toBe(true);
    });
  });

  describe('createSampleConfig', () => {
    it('should return valid JSON', () => {
      const sample = createSampleConfig();
      
      expect(() => JSON.parse(sample)).not.toThrow();
    });

    it('should include all required fields', () => {
      const sample = createSampleConfig();
      const parsed = JSON.parse(sample);
      
      expect(parsed.interpreterPath).toBeDefined();
      expect(parsed.gameFilePath).toBeDefined();
      expect(parsed.defaultSeed).toBeDefined();
      expect(parsed.comparisonOptions).toBeDefined();
      expect(parsed.knownVariations).toBeDefined();
    });

    it('should have reasonable default values', () => {
      const sample = createSampleConfig();
      const parsed = JSON.parse(sample);
      
      expect(parsed.comparisonOptions.normalizeWhitespace).toBe(true);
      expect(parsed.comparisonOptions.toleranceThreshold).toBeGreaterThan(0);
      expect(parsed.comparisonOptions.toleranceThreshold).toBeLessThanOrEqual(1);
    });
  });
});
