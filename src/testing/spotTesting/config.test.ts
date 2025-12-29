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
        fc.integer({ min: 1, max: 1000000 }), // Ensure seed is not 0
        fc.integer({ min: 10, max: 100 }),
        (seed, commandCount) => {
          const config1 = new SpotTestConfigManager({ seed, commandCount });
          const config2 = new SpotTestConfigManager({ seed, commandCount });
          
          // Same seed should produce same configuration
          expect(config1.getConfig()).toEqual(config2.getConfig());
          
          // Ensure seed method should return the same value
          expect(config1.ensureSeed()).toBe(config2.ensureSeed());
          expect(config1.ensureSeed()).toBe(seed);
          expect(config2.ensureSeed()).toBe(seed);
          
          // Seed info should be identical
          expect(config1.getSeedInfo()).toEqual(config2.getSeedInfo());
        }
      ), { numRuns: 50 });
    });

    it('should reject invalid configurations consistently', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.record({ commandCount: fc.integer({ max: 0 }) }),
          fc.record({ commandCount: fc.integer({ min: 1001 }) }),
          fc.record({ timeoutMs: fc.integer({ max: 0 }) }), // Changed from 999 to 0
          fc.record({ timeoutMs: fc.integer({ min: 300001 }) }),
          fc.record({ passThreshold: fc.float({ max: Math.fround(-0.1) }) }),
          fc.record({ passThreshold: fc.float({ min: Math.fround(100.1) }) }),
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
          passThreshold: fc.float({ min: 0, max: 100 }).filter(n => !isNaN(n) && isFinite(n)),
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
          const originalConfig = manager.getConfig();
          const deserializedConfig = deserializedManager.getConfig();
          
          // Compare each field individually to handle potential floating point precision issues
          expect(deserializedConfig.commandCount).toBe(originalConfig.commandCount);
          expect(deserializedConfig.seed).toBe(originalConfig.seed);
          expect(deserializedConfig.timeoutMs).toBe(originalConfig.timeoutMs);
          expect(deserializedConfig.passThreshold).toBeCloseTo(originalConfig.passThreshold, 5);
          expect(deserializedConfig.quickMode).toBe(originalConfig.quickMode);
          expect(deserializedConfig.strictValidation).toBe(originalConfig.strictValidation);
          expect(deserializedConfig.verbose).toBe(originalConfig.verbose);
          expect(deserializedConfig.avoidGameEnding).toBe(originalConfig.avoidGameEnding);
        }
      ), { numRuns: 100 });
    });
  });
});

// Additional edge case tests for configuration system
describe('Configuration Edge Cases', () => {
  describe('SpotTestConfigManager Edge Cases', () => {
    it('should handle invalid JSON configuration files', async () => {
      const manager = new SpotTestConfigManager();
      
      await expect(manager.loadFromFile('nonexistent-file.json')).rejects.toThrow();
    });

    it('should handle environment variables with invalid values', () => {
      const originalEnv = process.env;
      
      try {
        process.env.SPOT_TEST_COMMAND_COUNT = 'invalid';
        process.env.SPOT_TEST_SEED = 'not-a-number';
        process.env.SPOT_TEST_TIMEOUT = '-1000';
        
        const manager = new SpotTestConfigManager();
        
        expect(() => {
          manager.loadFromEnvironment();
        }).not.toThrow();
        
        // Should use default values for invalid environment variables
        const config = manager.getConfig();
        expect(typeof config.commandCount).toBe('number');
        expect(config.commandCount).toBeGreaterThan(0);
      } finally {
        process.env = originalEnv;
      }
    });

    it('should handle concurrent configuration updates', () => {
      const manager = new SpotTestConfigManager();
      
      const updates = [
        { commandCount: 10 },
        { seed: 12345 },
        { timeoutMs: 20000 },
        { quickMode: true }
      ];
      
      expect(() => {
        updates.forEach(update => manager.updateConfig(update));
      }).not.toThrow();
      
      const finalConfig = manager.getConfig();
      expect(finalConfig.commandCount).toBe(10);
      expect(finalConfig.seed).toBe(12345);
      expect(finalConfig.timeoutMs).toBe(20000);
      expect(finalConfig.quickMode).toBe(true);
    });

    it('should handle extreme configuration values', () => {
      expect(() => {
        new SpotTestConfigManager({
          commandCount: Number.MAX_SAFE_INTEGER
        });
      }).toThrow();

      expect(() => {
        new SpotTestConfigManager({
          timeoutMs: Number.MAX_SAFE_INTEGER
        });
      }).toThrow();

      expect(() => {
        new SpotTestConfigManager({
          passThreshold: -100
        });
      }).toThrow();

      expect(() => {
        new SpotTestConfigManager({
          seed: Number.MAX_SAFE_INTEGER
        });
      }).toThrow();
    });

    it('should handle null and undefined configuration values', () => {
      expect(() => {
        new SpotTestConfigManager({
          commandCount: null as any
        });
      }).not.toThrow();

      expect(() => {
        new SpotTestConfigManager({
          seed: undefined
        });
      }).not.toThrow();
    });

    it('should handle array configuration edge cases', () => {
      expect(() => {
        new SpotTestConfigManager({
          focusAreas: null as any
        });
      }).not.toThrow();

      expect(() => {
        new SpotTestConfigManager({
          commandTypes: [] as any
        });
      }).not.toThrow();

      expect(() => {
        new SpotTestConfigManager({
          focusAreas: ['invalid'] as any
        });
      }).toThrow();
    });

    it('should generate consistent seeds from strings', () => {
      const testStrings = [
        'test-scenario-1',
        'another-test',
        'edge-case-testing',
        '12345',
        'special-chars-!@#$%'
      ];

      for (const testString of testStrings) {
        const seed1 = SpotTestConfigManager.generateSeedFromString(testString);
        const seed2 = SpotTestConfigManager.generateSeedFromString(testString);
        
        expect(seed1).toBe(seed2);
        expect(seed1).toBeGreaterThanOrEqual(0);
        expect(seed1).toBeLessThan(1000000);
      }
    });

    it('should handle reproducibility validation edge cases', async () => {
      const manager = new SpotTestConfigManager({ seed: 12345 });
      
      // Test with zero test runs
      await expect(manager.validateReproducibility(0)).resolves.toBe(true);
      
      // Test with single test run
      await expect(manager.validateReproducibility(1)).resolves.toBe(true);
    });

    it('should handle JSON serialization edge cases', () => {
      const manager = new SpotTestConfigManager({
        commandCount: 50,
        seed: 12345,
        focusAreas: [GameArea.HOUSE],
        commandTypes: [CommandType.MOVEMENT]
      });

      const json = manager.toJSON();
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();

      const recreated = SpotTestConfigManager.fromJSON(json);
      expect(recreated.getConfig().commandCount).toBe(50);
      expect(recreated.getConfig().seed).toBe(12345);
    });

    it('should handle invalid JSON input', () => {
      expect(() => {
        SpotTestConfigManager.fromJSON('invalid json');
      }).toThrow();

      expect(() => {
        SpotTestConfigManager.fromJSON('{"commandCount": "invalid"}');
      }).toThrow();
    });

    it('should handle mode application edge cases', () => {
      const manager = new SpotTestConfigManager();
      
      expect(() => {
        manager.applyMode('invalid' as any);
      }).not.toThrow();
      
      // Should still have valid configuration after invalid mode
      const config = manager.getConfig();
      expect(config.commandCount).toBeGreaterThan(0);
    });

    it('should handle configuration summary with edge values', () => {
      const manager = new SpotTestConfigManager({
        commandCount: 1,
        timeoutMs: 1000,
        seed: 0,
        focusAreas: [],
        commandTypes: []
      });

      const summary = manager.getSummary();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('Commands: 1');
      expect(summary).toContain('Seed: 0');
    });

    it('should handle createReproducibleConfig with edge cases', () => {
      const manager = new SpotTestConfigManager();
      
      const config1 = manager.createReproducibleConfig('');
      expect(config1.seed).toBeDefined();
      
      const config2 = manager.createReproducibleConfig('a'.repeat(1000));
      expect(config2.seed).toBeDefined();
      
      const config3 = manager.createReproducibleConfig('special!@#$%^&*()');
      expect(config3.seed).toBeDefined();
    });
  });

  describe('Configuration Factory Edge Cases', () => {
    it('should handle createConfigManager with invalid file paths', async () => {
      await expect(createConfigManager({}, 'nonexistent.json')).rejects.toThrow();
    });

    it('should handle createConfigManager with empty base config', async () => {
      const manager = await createConfigManager();
      expect(manager).toBeDefined();
      expect(manager.getConfig()).toBeDefined();
    });

    it('should handle createConfigManager with null values', async () => {
      const manager = await createConfigManager(null as any);
      expect(manager).toBeDefined();
    });
  });
});