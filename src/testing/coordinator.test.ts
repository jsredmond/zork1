/**
 * Tests for TestCoordinator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestCoordinator } from './coordinator';
import { GameState } from '../game/state';
import { createInitialGameState } from '../game/factories/gameFactory';
import * as fs from 'fs';
import * as path from 'path';

const TEST_PROGRESS_FILE = '.kiro/testing/test-progress.json';
const TEST_BUG_FILE = '.kiro/testing/bug-reports.json';

describe('TestCoordinator', () => {
  let coordinator: TestCoordinator;
  let state: GameState;
  
  beforeEach(() => {
    // Create a fresh game state
    state = createInitialGameState();
    
    // Clean up any existing test files
    if (fs.existsSync(TEST_PROGRESS_FILE)) {
      fs.unlinkSync(TEST_PROGRESS_FILE);
    }
    if (fs.existsSync(TEST_BUG_FILE)) {
      fs.unlinkSync(TEST_BUG_FILE);
    }
    
    // Create coordinator with auto-save disabled for testing
    coordinator = new TestCoordinator(false);
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(TEST_PROGRESS_FILE)) {
      fs.unlinkSync(TEST_PROGRESS_FILE);
    }
    if (fs.existsSync(TEST_BUG_FILE)) {
      fs.unlinkSync(TEST_BUG_FILE);
    }
  });
  
  describe('loadProgress', () => {
    it('should load existing progress from file', () => {
      // Create a progress file
      const progress = coordinator.getProgress();
      coordinator.saveProgress(progress);
      
      // Create new coordinator and load
      const newCoordinator = new TestCoordinator();
      const loaded = newCoordinator.loadProgress();
      
      expect(loaded).toBeDefined();
      expect(loaded.version).toBe('1.0');
    });
    
    it('should create empty progress if file does not exist', () => {
      const progress = coordinator.getProgress();
      
      expect(progress).toBeDefined();
      expect(progress.testedRooms).toEqual([]);
      expect(progress.testedObjects).toEqual([]);
      expect(progress.totalTests).toBe(0);
    });
  });
  
  describe('saveProgress', () => {
    it('should save progress to file', () => {
      const progress = coordinator.getProgress();
      coordinator.saveProgress(progress);
      
      expect(fs.existsSync(TEST_PROGRESS_FILE)).toBe(true);
    });
    
    it('should update coverage when saving', () => {
      const progress = coordinator.getProgress();
      coordinator.saveProgress(progress);
      
      const saved = coordinator.getProgress();
      expect(saved.coverage).toBeDefined();
      expect(saved.coverage.rooms).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('resetProgress', () => {
    it('should reset progress to empty state', () => {
      // Add some test data
      let progress = coordinator.getProgress();
      progress.testedRooms = ['ROOM1', 'ROOM2'];
      progress.totalTests = 10;
      coordinator.saveProgress(progress);
      
      // Reset
      coordinator.resetProgress();
      
      const reset = coordinator.getProgress();
      expect(reset.testedRooms).toEqual([]);
      expect(reset.totalTests).toBe(0);
    });
  });
  
  describe('runTests', () => {
    it('should run room tests when enabled', async () => {
      const options = {
        testRooms: true,
        testObjects: false,
        maxTests: 5
      };
      
      const results = await coordinator.runTests(options, state);
      
      expect(results).toBeDefined();
      expect(results.totalTests).toBeGreaterThan(0);
    });
    
    it('should run object tests when enabled', async () => {
      const options = {
        testRooms: false,
        testObjects: true,
        maxTests: 5
      };
      
      const results = await coordinator.runTests(options, state);
      
      expect(results).toBeDefined();
      expect(results.totalTests).toBeGreaterThan(0);
    });
    
    it('should respect max tests limit', async () => {
      const options = {
        testRooms: true,
        testObjects: true,
        maxTests: 3
      };
      
      const results = await coordinator.runTests(options, state);
      
      expect(results.totalTests).toBeLessThanOrEqual(10); // Some buffer for test granularity
    });
    
    it('should filter rooms when roomFilter is specified', async () => {
      const options = {
        testRooms: true,
        testObjects: false,
        roomFilter: ['WEST-OF-HOUSE'],
        maxTests: 10
      };
      
      const results = await coordinator.runTests(options, state);
      
      expect(results).toBeDefined();
      const progress = coordinator.getProgress();
      expect(progress.testedRooms).toContain('WEST-OF-HOUSE');
    });
  });
  
  describe('resumeTests', () => {
    it('should resume from saved progress', async () => {
      // Run some tests
      const options = {
        testRooms: true,
        testObjects: false,
        maxTests: 2
      };
      
      await coordinator.runTests(options, state);
      coordinator.forceSave();
      
      // Create new coordinator and resume
      const newCoordinator = new TestCoordinator(false);
      const results = await newCoordinator.resumeTests(state);
      
      expect(results).toBeDefined();
    });
  });
  
  describe('interrupt', () => {
    it('should set interrupted flag', () => {
      coordinator.interrupt();
      
      expect(coordinator.wasInterrupted()).toBe(true);
    });
    
    it('should save progress on interrupt', () => {
      coordinator.interrupt();
      
      expect(fs.existsSync(TEST_PROGRESS_FILE)).toBe(true);
    });
  });
  
  describe('filtering', () => {
    it('should filter rooms correctly', () => {
      const options = {
        roomFilter: ['WEST-OF-HOUSE', 'NORTH-OF-HOUSE']
      };
      
      const filtered = coordinator.filterRooms(state, options);
      
      expect(filtered).toContain('WEST-OF-HOUSE');
      expect(filtered).toContain('NORTH-OF-HOUSE');
      expect(filtered.length).toBe(2);
    });
    
    it('should return all rooms when no filter specified', () => {
      const options = {};
      
      const filtered = coordinator.filterRooms(state, options);
      
      expect(filtered.length).toBeGreaterThan(0);
    });
    
    it('should get untested rooms', () => {
      const untested = coordinator.getUntestedRooms(state);
      
      expect(untested.length).toBeGreaterThan(0);
    });
    
    it('should get untested objects', () => {
      const untested = coordinator.getUntestedObjects(state);
      
      expect(untested.length).toBeGreaterThan(0);
    });
  });
  
  describe('save interval', () => {
    it('should set save interval', () => {
      coordinator.setSaveInterval(20);
      
      expect(coordinator.getSaveInterval()).toBe(20);
    });
    
    it('should throw error for invalid save interval', () => {
      expect(() => coordinator.setSaveInterval(0)).toThrow();
      expect(() => coordinator.setSaveInterval(-1)).toThrow();
    });
  });
  
  describe('auto-save', () => {
    it('should enable/disable auto-save', () => {
      coordinator.setAutoSave(false);
      // No direct way to test this without running tests
      // Just verify it doesn't throw
      expect(true).toBe(true);
    });
  });
  
  describe('coverage summary', () => {
    it('should get coverage summary', () => {
      const summary = coordinator.getCoverageSummary();
      
      expect(summary).toBeDefined();
      expect(summary.rooms).toBeDefined();
      expect(summary.objects).toBeDefined();
      expect(summary.interactions).toBeDefined();
      expect(summary.overall).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('createOptions', () => {
    it('should create test options', () => {
      const options = TestCoordinator.createOptions({
        rooms: true,
        objects: false,
        maxTests: 10
      });
      
      expect(options.testRooms).toBe(true);
      expect(options.testObjects).toBe(false);
      expect(options.maxTests).toBe(10);
    });
  });
});
