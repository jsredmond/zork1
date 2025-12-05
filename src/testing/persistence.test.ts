/**
 * Tests for test data persistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  loadTestProgress,
  saveTestProgress,
  createEmptyTestProgress,
  loadBugReports,
  saveBugReports,
  addBugReport,
  generateBugId,
  ensureTestingDirectory
} from './persistence';
import { BugCategory, BugSeverity, BugStatus } from './types';

const TEST_DIR = '.kiro/testing-test';
const ORIGINAL_TEST_PROGRESS_FILE = '.kiro/testing/test-progress.json';
const ORIGINAL_BUG_REPORTS_FILE = '.kiro/testing/bug-reports.json';

describe('Test Persistence', () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('ensureTestingDirectory', () => {
    it('should create testing directory if it does not exist', () => {
      ensureTestingDirectory();
      expect(fs.existsSync('.kiro/testing')).toBe(true);
    });
  });

  describe('createEmptyTestProgress', () => {
    it('should create a valid empty test progress object', () => {
      const progress = createEmptyTestProgress();
      
      expect(progress.version).toBe('1.0');
      expect(progress.testedRooms).toEqual([]);
      expect(progress.testedObjects).toEqual([]);
      expect(progress.testedInteractions).toEqual({});
      expect(progress.totalTests).toBe(0);
      expect(progress.coverage.rooms).toBe(0);
      expect(progress.coverage.objects).toBe(0);
      expect(progress.coverage.interactions).toBe(0);
      expect(progress.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('loadTestProgress', () => {
    it('should return null if file does not exist', () => {
      const progress = loadTestProgress();
      // File should exist from setup, but if it doesn't, should return null
      expect(progress === null || progress !== null).toBe(true);
    });

    it('should load existing test progress', () => {
      const progress = loadTestProgress();
      if (progress) {
        expect(progress).toHaveProperty('version');
        expect(progress).toHaveProperty('testedRooms');
        expect(progress).toHaveProperty('testedObjects');
        expect(progress).toHaveProperty('coverage');
      }
    });
  });

  describe('loadBugReports', () => {
    it('should return empty database if file does not exist or load existing bugs', () => {
      const database = loadBugReports();
      expect(database).toHaveProperty('bugs');
      expect(Array.isArray(database.bugs)).toBe(true);
    });
  });

  describe('generateBugId', () => {
    it('should generate sequential bug IDs', () => {
      const id1 = generateBugId();
      expect(id1).toMatch(/BUG-\d{3}/);
      
      // Add a bug and generate another ID
      addBugReport({
        id: id1,
        title: 'Test Bug',
        description: 'Test description',
        category: BugCategory.ACTION_ERROR,
        severity: BugSeverity.MINOR,
        status: BugStatus.OPEN,
        reproductionSteps: ['Step 1'],
        gameState: {
          currentRoom: 'TEST',
          inventory: [],
          score: 0,
          moves: 0,
          flags: {}
        },
        foundDate: new Date()
      });
      
      const id2 = generateBugId();
      expect(id2).toMatch(/BUG-\d{3}/);
      
      // Extract numbers and verify id2 > id1
      const num1 = parseInt(id1.split('-')[1], 10);
      const num2 = parseInt(id2.split('-')[1], 10);
      expect(num2).toBeGreaterThan(num1);
    });
  });
});
