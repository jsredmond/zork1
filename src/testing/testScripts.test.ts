/**
 * Tests for predefined test scripts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBasicNavigationScript,
  createObjectManipulationScript,
  createGratingPuzzleScript,
  createContainerInteractionScript,
  createLightSourceScript,
  createInvalidCommandScript,
  createInventoryLimitsScript,
  createPronounResolutionScript,
  getAllTestScripts,
  getTestScriptsByCategory
} from './testScripts.js';
import { ScriptRunner } from './scriptRunner.js';
import { createInitialGameState } from '../game/factories/gameFactory.js';
import { GameState } from '../game/state.js';

describe('Test Scripts', () => {
  let runner: ScriptRunner;
  let state: GameState;

  beforeEach(() => {
    runner = new ScriptRunner();
    state = createInitialGameState();
  });

  describe('createBasicNavigationScript', () => {
    it('should create a valid navigation script', () => {
      const script = createBasicNavigationScript();

      expect(script.id).toBe('basic-navigation');
      expect(script.name).toBe('Basic Navigation');
      expect(script.commands.length).toBeGreaterThan(0);
      expect(script.commands[0].input).toBe('look');
    });

    it('should execute without errors', () => {
      const script = createBasicNavigationScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createObjectManipulationScript', () => {
    it('should create a valid object manipulation script', () => {
      const script = createObjectManipulationScript();

      expect(script.id).toBe('object-manipulation');
      expect(script.commands.length).toBeGreaterThan(0);
      expect(script.commands.some(cmd => cmd.input.includes('take'))).toBe(true);
      expect(script.commands.some(cmd => cmd.input.includes('drop'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createObjectManipulationScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createGratingPuzzleScript', () => {
    it('should create a valid grating puzzle script', () => {
      const script = createGratingPuzzleScript();

      expect(script.id).toBe('grating-puzzle');
      expect(script.commands.length).toBeGreaterThan(0);
      expect(script.commands.some(cmd => cmd.input.includes('grating'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createGratingPuzzleScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createContainerInteractionScript', () => {
    it('should create a valid container script', () => {
      const script = createContainerInteractionScript();

      expect(script.id).toBe('container-interaction');
      expect(script.commands.some(cmd => cmd.input.includes('put'))).toBe(true);
      expect(script.commands.some(cmd => cmd.input.includes('in'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createContainerInteractionScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createLightSourceScript', () => {
    it('should create a valid light source script', () => {
      const script = createLightSourceScript();

      expect(script.id).toBe('light-source');
      expect(script.commands.some(cmd => cmd.input.includes('lamp'))).toBe(true);
      expect(script.commands.some(cmd => cmd.input.includes('turn on'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createLightSourceScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createInvalidCommandScript', () => {
    it('should create a valid invalid command script', () => {
      const script = createInvalidCommandScript();

      expect(script.id).toBe('invalid-commands');
      expect(script.commands.length).toBeGreaterThan(0);
      // All commands should expect failure
      expect(script.commands.every(cmd => cmd.expectedSuccess === false)).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createInvalidCommandScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createInventoryLimitsScript', () => {
    it('should create a valid inventory limits script', () => {
      const script = createInventoryLimitsScript();

      expect(script.id).toBe('inventory-limits');
      expect(script.commands.some(cmd => cmd.input === 'inventory')).toBe(true);
      expect(script.commands.some(cmd => cmd.input.includes('take'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createInventoryLimitsScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createPronounResolutionScript', () => {
    it('should create a valid pronoun resolution script', () => {
      const script = createPronounResolutionScript();

      expect(script.id).toBe('pronoun-resolution');
      expect(script.commands.some(cmd => cmd.input.includes('it'))).toBe(true);
      expect(script.commands.some(cmd => cmd.input.includes('all'))).toBe(true);
    });

    it('should execute without errors', () => {
      const script = createPronounResolutionScript();
      const result = runner.executeScript(script, state);

      expect(result.totalCommands).toBe(script.commands.length);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getAllTestScripts', () => {
    it('should return all test scripts', () => {
      const scripts = getAllTestScripts();

      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.every(s => s.id && s.name && s.commands)).toBe(true);
    });

    it('should return unique script IDs', () => {
      const scripts = getAllTestScripts();
      const ids = scripts.map(s => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getTestScriptsByCategory', () => {
    it('should return navigation scripts', () => {
      const scripts = getTestScriptsByCategory('navigation');

      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.some(s => s.id === 'basic-navigation')).toBe(true);
    });

    it('should return object scripts', () => {
      const scripts = getTestScriptsByCategory('objects');

      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.some(s => s.id === 'object-manipulation')).toBe(true);
    });

    it('should return puzzle scripts', () => {
      const scripts = getTestScriptsByCategory('puzzles');

      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.some(s => s.id === 'grating-puzzle')).toBe(true);
    });

    it('should return error scripts', () => {
      const scripts = getTestScriptsByCategory('errors');

      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.some(s => s.id === 'invalid-commands')).toBe(true);
    });
  });
});
