/**
 * Unit tests for TestReporter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestReporter } from './reporter';
import { TestProgress, BugReport, BugStatus, BugCategory, BugSeverity } from './types';
import { ROOMS } from '../game/data/rooms';
import { OBJECTS } from '../game/data/objects';
import * as fs from 'fs';
import * as path from 'path';
import * as fc from 'fast-check';

describe('TestReporter', () => {
  let reporter: TestReporter;
  const testReportsDir = '.kiro/testing/test-reports';

  beforeEach(() => {
    reporter = new TestReporter();
  });

  afterEach(() => {
    // Clean up test report files
    if (fs.existsSync(testReportsDir)) {
      const files = fs.readdirSync(testReportsDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testReportsDir, file));
      });
    }
  });

  describe('generateCoverageReport', () => {
    it('should generate coverage report from test progress', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: ['WEST-OF-HOUSE', 'NORTH-OF-HOUSE'],
        testedObjects: ['MAILBOX', 'LEAFLET'],
        testedInteractions: {
          'MAILBOX': ['EXAMINE', 'OPEN'],
          'LEAFLET': ['EXAMINE', 'TAKE']
        },
        totalTests: 10,
        coverage: {
          rooms: 10,
          objects: 5,
          interactions: 3
        }
      };

      const report = reporter.generateCoverageReport(progress);

      expect(report.summary).toBeDefined();
      expect(report.untestedRooms).toBeDefined();
      expect(report.untestedObjects).toBeDefined();
      expect(report.recentlyTested).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
    });

    it('should include recently tested items', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: ['ROOM1', 'ROOM2', 'ROOM3'],
        testedObjects: ['OBJ1', 'OBJ2'],
        testedInteractions: {},
        totalTests: 5,
        coverage: { rooms: 0, objects: 0, interactions: 0 }
      };

      const report = reporter.generateCoverageReport(progress);

      expect(report.recentlyTested.rooms).toEqual(['ROOM1', 'ROOM2', 'ROOM3']);
      expect(report.recentlyTested.objects).toEqual(['OBJ1', 'OBJ2']);
    });
  });

  describe('generateBugSummaryReport', () => {
    it('should generate bug summary from bug list', () => {
      const bugs: BugReport[] = [
        {
          id: 'BUG-001',
          title: 'Test Bug 1',
          description: 'Description 1',
          category: BugCategory.PARSER_ERROR,
          severity: BugSeverity.MAJOR,
          status: BugStatus.OPEN,
          reproductionSteps: [],
          gameState: {
            currentRoom: 'TEST',
            inventory: [],
            score: 0,
            moves: 0,
            flags: {}
          },
          foundDate: new Date()
        },
        {
          id: 'BUG-002',
          title: 'Test Bug 2',
          description: 'Description 2',
          category: BugCategory.CRASH,
          severity: BugSeverity.CRITICAL,
          status: BugStatus.FIXED,
          reproductionSteps: [],
          gameState: {
            currentRoom: 'TEST',
            inventory: [],
            score: 0,
            moves: 0,
            flags: {}
          },
          foundDate: new Date(),
          fixedDate: new Date()
        }
      ];

      const report = reporter.generateBugSummaryReport(bugs);

      expect(report.totalBugs).toBe(2);
      expect(report.byStatus[BugStatus.OPEN]).toBe(1);
      expect(report.byStatus[BugStatus.FIXED]).toBe(1);
      expect(report.byCategory[BugCategory.PARSER_ERROR]).toBe(1);
      expect(report.byCategory[BugCategory.CRASH]).toBe(1);
      expect(report.bySeverity[BugSeverity.MAJOR]).toBe(1);
      expect(report.bySeverity[BugSeverity.CRITICAL]).toBe(1);
    });

    it('should include recent bugs', () => {
      const bugs: BugReport[] = [
        {
          id: 'BUG-001',
          title: 'Bug 1',
          description: 'Desc',
          category: BugCategory.ACTION_ERROR,
          severity: BugSeverity.MINOR,
          status: BugStatus.OPEN,
          reproductionSteps: [],
          gameState: {
            currentRoom: 'TEST',
            inventory: [],
            score: 0,
            moves: 0,
            flags: {}
          },
          foundDate: new Date('2024-01-01')
        },
        {
          id: 'BUG-002',
          title: 'Bug 2',
          description: 'Desc',
          category: BugCategory.ACTION_ERROR,
          severity: BugSeverity.MINOR,
          status: BugStatus.OPEN,
          reproductionSteps: [],
          gameState: {
            currentRoom: 'TEST',
            inventory: [],
            score: 0,
            moves: 0,
            flags: {}
          },
          foundDate: new Date('2024-01-02')
        }
      ];

      const report = reporter.generateBugSummaryReport(bugs);

      expect(report.recentBugs).toHaveLength(2);
      expect(report.recentBugs[0].id).toBe('BUG-002'); // Most recent first
    });
  });

  describe('exportCoverageReportAsMarkdown', () => {
    it('should export coverage report as markdown', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: ['ROOM1'],
        testedObjects: ['OBJ1'],
        testedInteractions: {},
        totalTests: 1,
        coverage: { rooms: 50, objects: 25, interactions: 10 }
      };

      const report = reporter.generateCoverageReport(progress);
      const markdown = reporter.exportCoverageReportAsMarkdown(report);

      expect(markdown).toContain('# Test Coverage Report');
      expect(markdown).toContain('## Overall Coverage');
      expect(markdown).toContain('### Rooms');
      expect(markdown).toContain('### Objects');
    });
  });

  describe('exportBugSummaryAsMarkdown', () => {
    it('should export bug summary as markdown', () => {
      const bugs: BugReport[] = [{
        id: 'BUG-001',
        title: 'Test Bug',
        description: 'Test Description',
        category: BugCategory.PARSER_ERROR,
        severity: BugSeverity.MAJOR,
        status: BugStatus.OPEN,
        reproductionSteps: ['Step 1', 'Step 2'],
        gameState: {
          currentRoom: 'TEST',
          inventory: [],
          score: 0,
          moves: 0,
          flags: {}
        },
        foundDate: new Date()
      }];

      const report = reporter.generateBugSummaryReport(bugs);
      const markdown = reporter.exportBugSummaryAsMarkdown(report);

      expect(markdown).toContain('# Bug Summary Report');
      expect(markdown).toContain('## Bugs by Status');
      expect(markdown).toContain('## Bugs by Severity');
      expect(markdown).toContain('BUG-001');
    });
  });

  describe('saveCoverageReport', () => {
    it('should save coverage report to file', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: [],
        testedObjects: [],
        testedInteractions: {},
        totalTests: 0,
        coverage: { rooms: 0, objects: 0, interactions: 0 }
      };

      const report = reporter.generateCoverageReport(progress);
      const filepath = reporter.saveCoverageReport(report, 'test-coverage.md');

      expect(fs.existsSync(filepath)).toBe(true);
      const content = fs.readFileSync(filepath, 'utf-8');
      expect(content).toContain('# Test Coverage Report');
    });
  });

  describe('displayCoveragePercentage', () => {
    it('should display coverage percentage', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: [],
        testedObjects: [],
        testedInteractions: {},
        totalTests: 0,
        coverage: { rooms: 50, objects: 25, interactions: 10 }
      };

      const display = reporter.displayCoveragePercentage(progress);

      expect(display).toContain('TEST COVERAGE SUMMARY');
      expect(display).toContain('Overall Coverage:');
      expect(display).toContain('Rooms:');
      expect(display).toContain('Objects:');
    });
  });

  describe('displayUntestedItems', () => {
    it('should display untested items', () => {
      const progress: TestProgress = {
        version: '1.0',
        lastUpdated: new Date(),
        testedRooms: [],
        testedObjects: [],
        testedInteractions: {},
        totalTests: 0,
        coverage: { rooms: 0, objects: 0, interactions: 0 }
      };

      const display = reporter.displayUntestedItems(progress);

      expect(display).toContain('UNTESTED ITEMS');
    });
  });

  describe('Property Tests', () => {
    /**
     * Feature: exhaustive-game-testing, Property 2: Coverage calculation accuracy
     * Validates: Requirements 4.3
     * 
     * For any set of tested items, the coverage percentage should equal 
     * (tested items / total items) * 100
     */
    it('should calculate coverage percentage accurately', () => {
      const allRoomIds = Object.keys(ROOMS);
      const allObjectIds = Object.keys(OBJECTS);

      // Generator for a subset of room IDs
      const roomSubsetArb = fc.array(
        fc.constantFrom(...allRoomIds),
        { minLength: 0, maxLength: allRoomIds.length }
      ).map(arr => [...new Set(arr)]); // Remove duplicates

      // Generator for a subset of object IDs
      const objectSubsetArb = fc.array(
        fc.constantFrom(...allObjectIds),
        { minLength: 0, maxLength: allObjectIds.length }
      ).map(arr => [...new Set(arr)]); // Remove duplicates

      fc.assert(
        fc.property(
          roomSubsetArb,
          objectSubsetArb,
          (testedRooms, testedObjects) => {
            // Create test progress with the tested items
            const progress: TestProgress = {
              version: '1.0',
              lastUpdated: new Date(),
              testedRooms,
              testedObjects,
              testedInteractions: {},
              totalTests: testedRooms.length + testedObjects.length,
              coverage: { rooms: 0, objects: 0, interactions: 0 }
            };

            // Generate coverage report
            const report = reporter.generateCoverageReport(progress);

            // Calculate expected coverage percentages
            const totalRooms = allRoomIds.length;
            const totalObjects = allObjectIds.length;

            const expectedRoomCoverage = totalRooms > 0 
              ? (testedRooms.length / totalRooms) * 100 
              : 0;
            const expectedObjectCoverage = totalObjects > 0 
              ? (testedObjects.length / totalObjects) * 100 
              : 0;

            // Verify coverage calculations are accurate
            expect(report.summary.rooms.tested).toBe(testedRooms.length);
            expect(report.summary.rooms.total).toBe(totalRooms);
            expect(report.summary.rooms.percentage).toBeCloseTo(expectedRoomCoverage, 2);

            expect(report.summary.objects.tested).toBe(testedObjects.length);
            expect(report.summary.objects.total).toBe(totalObjects);
            expect(report.summary.objects.percentage).toBeCloseTo(expectedObjectCoverage, 2);

            // Verify overall coverage is the average of the three coverage types
            const expectedOverall = (
              report.summary.rooms.percentage +
              report.summary.objects.percentage +
              report.summary.interactions.percentage
            ) / 3;
            expect(report.summary.overall).toBeCloseTo(expectedOverall, 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
