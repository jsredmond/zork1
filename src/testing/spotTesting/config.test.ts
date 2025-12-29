import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  SpotTestConfigManager, 
  DEFAULT_CONFIG, 
  QUICK_MODE_CONFIG,
  THOROUGH_MODE_CONFIG,
  CI_MODE_CONFIG,
  ConfigValidationError,
  createConfigManager
} from './config.js';
import { GameArea, CommandType } from './types.js';

describe('SpotTestConfigManager', () => {
  let configManager: SpotTestConfigManager;

  beforeEach(() => {
    configManager = new SpotTestConfigManager();
  });

  describe('Basic Configuration Management', () => {
    it('should create with default configuration', () => {
      const config = configManager.getConfig();
      expect(config.commandCount).toBe(DEFAULT_CONFIG.commandCount);
      expect(config.timeoutMs).toBe(DEFAULT_CONFIG.timeoutMs);
      expect(config.passThreshold).toBe(DEFAULT_CONFIG.passThreshold);
    });

    it('should merge configurations correctly', () => {
      const customConfig = { commandCount: 100, verbose: true };
      const manager = new SpotTestConfigManager(customConfig);
      const config = manager.getConfig();
      
      expect(config.commandCount).toBe(100);
      expect(config.verbose).toBe(true);
      expect(config.timeoutMs).toBe(DEFAULT_CONFIG.timeoutMs); // Should keep default
    });

    it('should update configuration', () => {
      configManager.updateConfig({ commandCount: 75, strictValidation: true });
      const config = configManager.getConfig();
      
      expect(config.commandCount).toBe(75);
      expect(config.strictValidation).toBe(true);
    });
  });

  describe('Mode Application', () => {
    it('should apply quick mode correctly', () => {
      configManager.applyMode('quick');
      const config = configManager.getConfig();
      
      expect(config.commandCount).toBe(QUICK_MODE_CONFIG.commandCount);
      expect(config.timeoutMs).toBe(QUICK_MODE_CONFIG.timeoutMs);
      expect(config.quickMode).toBe(true);
    });

    it('should apply thorough mode correctly', () => {
      configManager.applyMode('thorough');
      const config = configManager.getConfig();
      
      expect(config.commandCount).toBe(THOROUGH_MODE_CONFIG.commandCount);
      expect(config.timeoutMs).toBe(THOROUGH_MODE_CONFIG.timeoutMs);
      expect(config.strictValidation).toBe(true);
    });

    it('should apply CI mode correctly', () => {
      configManager.applyMode('ci');
      const config = configManager.getConfig();
      
      expect(config.commandCount).toBe(CI_MODE_CONFIG.commandCount);
      expect(config.passThreshold).toBe(CI_MODE_CONFIG.passThreshold);
      expect(config.strictValidation).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should reject invalid command count', () => {
      expect(() => {
        new SpotTestConfigManager({ commandCount: 0 });
      }).toThrow(ConfigValidationError);

      expect(() => {
        new SpotTestConfigManager({ commandCount: 1001 });
      }).toThrow(ConfigValidationError);
    });

    it('should reject invalid timeout', () => {
      expect(() => {
        new SpotTestConfigManager({ timeoutMs: 0 });
      }).toThrow(ConfigValidationError);

      expect(() => {
        new SpotTestConfigManager({ timeoutMs: 400000 });
      }).toThrow(ConfigValidationError);
    });

    it('should reject invalid pass threshold', () => {
      expect(() => {
        new SpotTestConfigManager({ passThreshold: -1 });
      }).toThrow(ConfigValidationError);

      expect(() => {
        new SpotTestConfigManager({ passThreshold: 101 });
      }).toThrow(ConfigValidationError);
    });

    it('should reject invalid seed', () => {
      expect(() => {
        new SpotTestConfigManager({ seed: -1 });
      }).toThrow(ConfigValidationError);

      expect(() => {
        new SpotTestConfigManager({ seed: 1000001 });
      }).toThrow(ConfigValidationError);
    });

    it('should reject invalid focus areas', () => {
      expect(() => {
        new SpotTestConfigManager({ focusAreas: ['invalid_area' as GameArea] });
      }).toThrow(ConfigValidationError);
    });

    it('should reject invalid command types', () => {
      expect(() => {
        new SpotTestConfigManager({ commandTypes: ['invalid_type' as CommandType] });
      }).toThrow(ConfigValidationError);
    });
  });

  describe('Seed Management', () => {
    it('should generate seed when not provided', () => {
      const seed1 = configManager.ensureSeed();
      const seed2 = configManager.ensureSeed();
      
      expect(seed1).toBe(seed2); // Should be same after first generation
      expect(seed1).toBeGreaterThanOrEqual(0);
      expect(seed1).toBeLessThanOrEqual(1000000);
    });

    it('should use provided seed', () => {
      const manager = new SpotTestConfigManager({ seed: 12345 });
      const seed = manager.ensureSeed();
      
      expect(seed).toBe(12345);
    });

    it('should generate deterministic seed from string', () => {
      const seed1 = SpotTestConfigManager.generateSeedFromString('test');
      const seed2 = SpotTestConfigManager.generateSeedFromString('test');
      const seed3 = SpotTestConfigManager.generateSeedFromString('different');
      
      expect(seed1).toBe(seed2);
      expect(seed1).not.toBe(seed3);
    });

    it('should set seed from string', () => {
      configManager.setSeedFromString('test-scenario');
      const config = configManager.getConfig();
      
      expect(config.seed).toBeDefined();
      expect(config.seed).toBe(SpotTestConfigManager.generateSeedFromString('test-scenario'));
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const originalConfig = { commandCount: 100, seed: 12345, verbose: true };
      const manager = new SpotTestConfigManager(originalConfig);
      
      const json = manager.toJSON();
      const newManager = SpotTestConfigManager.fromJSON(json);
      
      expect(newManager.getConfig()).toEqual(manager.getConfig());
    });

    it('should handle invalid JSON', () => {
      expect(() => {
        SpotTestConfigManager.fromJSON('invalid json');
      }).toThrow(ConfigValidationError);
    });
  });

  describe('Environment Variable Loading', () => {
    it('should load from environment variables', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SPOT_TEST_COMMAND_COUNT: '75',
        SPOT_TEST_SEED: '54321',
        SPOT_TEST_VERBOSE: 'true',
        SPOT_TEST_QUICK_MODE: 'true'
      };

      configManager.loadFromEnvironment();
      const config = configManager.getConfig();

      expect(config.commandCount).toBe(75);
      expect(config.seed).toBe(54321);
      expect(config.verbose).toBe(true);
      expect(config.quickMode).toBe(true);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Configuration Summary', () => {
    it('should generate informative summary', () => {
      configManager.updateConfig({ 
        commandCount: 100, 
        seed: 12345, 
        focusAreas: [GameArea.UNDERGROUND],
        passThreshold: 98
      });
      
      const summary = configManager.getSummary();
      
      expect(summary).toContain('Commands: 100');
      expect(summary).toContain('Seed: 12345 (reproducible)');
      expect(summary).toContain('Focus: underground');
      expect(summary).toContain('Pass Threshold: 98%');
    });

    it('should indicate when seed will be generated', () => {
      const summary = configManager.getSummary();
      expect(summary).toContain('Seed: will be generated');
    });
  });
});

/**
 * Property-based tests for configuration system
 * **Property 6: Configuration Flexibility and Reproducibility**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */
describe('Configuration System Properties', () => {
  describe('Property 6: Configuration Flexibility and Reproducibility', () => {
    it('should handle any valid configuration values', () => {
      fc.assert(fc.property(
        fc.record({
          commandCount: fc.integer({ min: 1, max: 1000 }),
          timeoutMs: fc.integer({ min: 1000, max: 300000 }),
          passThreshold: fc.float({ min: 0, max: 100 }),
          seed: fc.option(fc.integer({ min: 0, max: 1000000 })),
          quickMode: fc.boolean(),
          strictValidation: fc.boolean(),
          avoidGameEnding: fc.boolean(),
          verbose: fc.boolean()
        }),
        (config) => {
          // Should not throw for valid configurations
          expect(() => {
            const manager = new SpotTestConfigManager(config);
            const retrievedConfig = manager.getConfig();
            
            // All values should be preserved
            expect(retrievedConfig.commandCount).toBe(config.commandCount);
            expect(retrievedConfig.timeoutMs).toBe(config.timeoutMs);
            expect(retrievedConfig.passThreshold).toBe(config.passThreshold);
            expect(retrievedConfig.quickMode).toBe(config.quickMode);
            expect(retrievedConfig.strictValidation).toBe(config.strictValidation);
            expect(retrievedConfig.avoidGameEnding).toBe(config.avoidGameEnding);
            expect(retrievedConfig.verbose).toBe(config.verbose);
            
            if (config.seed !== null) {
              expect(retrievedConfig.seed).toBe(config.seed);
            }
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    it('should produce identical results for same seed', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        fc.integer({ min: 10, max: 100 }),
        async (seed, commandCount) => {
          const config1 = new SpotTestConfigManager({ seed, commandCount });
          const config2 = new SpotTestConfigManager({ seed, commandCount });
          
          // Same seed should produce same configuration
          expect(config1.getConfig()).toEqual(config2.getConfig());
          
          // Reproducibility validation should pass
          const isReproducible1 = await config1.validateReproducibility(2);
          const isReproducible2 = await config2.validateReproducibility(2);
          
          expect(isReproducible1).toBe(true);
          expect(isReproducible2).toBe(true);
        }
      ), { numRuns: 50 });
    });

    it('should reject invalid configurations consistently', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.record({ commandCount: fc.integer({ max: 0 }) }),
          fc.record({ commandCount: fc.integer({ min: 1001 }) }),
          fc.record({ timeoutMs: fc.integer({ max: 999 }) }),
          fc.record({ timeoutMs: fc.integer({ min: 300001 }) }),
          fc.record({ passThreshold: fc.float({ max: -0.1 }) }),
          fc.record({ passThreshold: fc.float({ min: 100.1 }) }),
          fc.record({ seed: fc.integer({ max: -1 }) }),
          fc.record({ seed: fc.integer({ min: 1000001 }) })
        ),
        (invalidConfig) => {
          expect(() => {
            new SpotTestConfigManager(invalidConfig);
          }).toThrow(ConfigValidationError);
        }
      ), { numRuns: 100 });
    });

    it('should maintain configuration integrity through updates', () => {
      fc.assert(fc.property(
        fc.record({
          commandCount: fc.integer({ min: 1, max: 1000 }),
          timeoutMs: fc.integer({ min: 1000, max: 300000 }),
          passThreshold: fc.float({ min: 0, max: 100 })
        }),
        fc.record({
          commandCount: fc.integer({ min: 1, max: 1000 }),
          verbose: fc.boolean(),
          strictValidation: fc.boolean()
        }),
        (initialConfig, updateConfig) => {
          const manager = new SpotTestConfigManager(initialConfig);
          manager.updateConfig(updateConfig);
          
          const finalConfig = manager.getConfig();
          
          // Updated values should be present
          expect(finalConfig.commandCount).toBe(updateConfig.commandCount);
          expect(finalConfig.verbose).toBe(updateConfig.verbose);
          expect(finalConfig.strictValidation).toBe(updateConfig.strictValidation);
          
          // Non-updated values should remain from initial or default
          expect(finalConfig.timeoutMs).toBe(initialConfig.timeoutMs);
          expect(finalConfig.passThreshold).toBe(initialConfig.passThreshold);
        }
      ), { numRuns: 100 });
    });

    it('should generate deterministic seeds from strings', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (testString) => {
          const seed1 = SpotTestConfigManager.generateSeedFromString(testString);
          const seed2 = SpotTestConfigManager.generateSeedFromString(testString);
          
          // Same string should always produce same seed
          expect(seed1).toBe(seed2);
          expect(seed1).toBeGreaterThanOrEqual(0);
          expect(seed1).toBeLessThanOrEqual(1000000);
        }
      ), { numRuns: 100 });
    });

    it('should support all valid focus areas and command types', () => {
      fc.assert(fc.property(
        fc.array(fc.constantFrom(...Object.values(GameArea)), { minLength: 1, maxLength: 3 }),
        fc.array(fc.constantFrom(...Object.values(CommandType)), { minLength: 1, maxLength: 3 }),
        (focusAreas, commandTypes) => {
          expect(() => {
            const manager = new SpotTestConfigManager({ focusAreas, commandTypes });
            const config = manager.getConfig();
            
            expect(config.focusAreas).toEqual(focusAreas);
            expect(config.commandTypes).toEqual(commandTypes);
          }).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    it('should apply mode configurations correctly', () => {
      fc.assert(fc.property(
        fc.constantFrom('quick', 'standard', 'thorough', 'ci'),
        (mode) => {
          const manager = new SpotTestConfigManager();
          manager.applyMode(mode as any);
          
          const config = manager.getConfig();
          
          // Mode-specific validations
          switch (mode) {
            case 'quick':
              expect(config.commandCount).toBe(QUICK_MODE_CONFIG.commandCount);
              expect(config.quickMode).toBe(true);
              break;
            case 'thorough':
              expect(config.commandCount).toBe(THOROUGH_MODE_CONFIG.commandCount);
              expect(config.strictValidation).toBe(true);
              break;
            case 'ci':
              expect(config.commandCount).toBe(CI_MODE_CONFIG.commandCount);
              expect(config.strictValidation).toBe(true);
              expect(config.passThreshold).toBe(CI_MODE_CONFIG.passThreshold);
              break;
          }
        }
      ), { numRuns: 50 });
    });

    it('should serialize and deserialize without data loss', () => {
      fc.assert(fc.property(
        fc.record({
          commandCount: fc.integer({ min: 1, max: 1000 }),
          seed: fc.integer({ min: 0, max: 1000000 }),
          timeoutMs: fc.integer({ min: 1000, max: 300000 }),
          passThreshold: fc.float({ min: 0, max: 100 }),
          quickMode: fc.boolean(),
          strictValidation: fc.boolean(),
          verbose: fc.boolean(),
          avoidGameEnding: fc.boolean()
        }),
        (config) => {
          const manager = new SpotTestConfigManager(config);
          const json = manager.toJSON();
          const deserializedManager = SpotTestConfigManager.fromJSON(json);
          
          // All configuration should be preserved
          expect(deserializedManager.getConfig()).toEqual(manager.getConfig());
        }
      ), { numRuns: 100 });
    });
  });
});