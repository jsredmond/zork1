/**
 * Test reporting and visualization
 * Generates coverage reports, bug summaries, and detailed test results
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestProgress, BugReport, BugCategory, BugSeverity, BugStatus, TestResults } from './types';
import { generateCoverageSummary, getUntestedRooms, getUntestedObjects, CoverageSummary } from './coverage';
import { loadBugReports, loadTestProgress } from './persistence';

/**
 * Coverage report data structure
 */
export interface CoverageReport {
  summary: CoverageSummary;
  untestedRooms: string[];
  untestedObjects: string[];
  recentlyTested: {
    rooms: string[];
    objects: string[];
  };
  timestamp: Date;
}

/**
 * Bug summary report data structure
 */
export interface BugSummaryReport {
  totalBugs: number;
  byStatus: Record<BugStatus, number>;
  byCategory: Record<BugCategory, number>;
  bySeverity: Record<BugSeverity, number>;
  recentBugs: BugReport[];
  timestamp: Date;
}

/**
 * Detailed test results report
 */
export interface DetailedTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: CoverageSummary;
  bugSummary: BugSummaryReport;
  timestamp: Date;
}

/**
 * TestReporter class for generating various reports
 */
export class TestReporter {
  /**
   * Generate a coverage report from test progress
   */
  generateCoverageReport(progress: TestProgress): CoverageReport {
    const summary = generateCoverageSummary(progress);
    const untestedRooms = getUntestedRooms(progress);
    const untestedObjects = getUntestedObjects(progress);
    
    // Get recently tested items (last 10)
    const recentRooms = progress.testedRooms.slice(-10);
    const recentObjects = progress.testedObjects.slice(-10);
    
    return {
      summary,
      untestedRooms,
      untestedObjects,
      recentlyTested: {
        rooms: recentRooms,
        objects: recentObjects
      },
      timestamp: new Date()
    };
  }

  /**
   * Generate a bug summary report from bug database
   */
  generateBugSummaryReport(bugs: BugReport[]): BugSummaryReport {
    // Count bugs by status
    const byStatus: Record<BugStatus, number> = {
      [BugStatus.OPEN]: 0,
      [BugStatus.IN_PROGRESS]: 0,
      [BugStatus.FIXED]: 0,
      [BugStatus.VERIFIED]: 0,
      [BugStatus.WONT_FIX]: 0
    };
    
    // Count bugs by category
    const byCategory: Record<BugCategory, number> = {
      [BugCategory.PARSER_ERROR]: 0,
      [BugCategory.ACTION_ERROR]: 0,
      [BugCategory.MISSING_CONTENT]: 0,
      [BugCategory.INCORRECT_BEHAVIOR]: 0,
      [BugCategory.CRASH]: 0,
      [BugCategory.TEXT_ERROR]: 0
    };
    
    // Count bugs by severity
    const bySeverity: Record<BugSeverity, number> = {
      [BugSeverity.CRITICAL]: 0,
      [BugSeverity.MAJOR]: 0,
      [BugSeverity.MINOR]: 0,
      [BugSeverity.TRIVIAL]: 0
    };
    
    // Count bugs
    bugs.forEach(bug => {
      byStatus[bug.status]++;
      byCategory[bug.category]++;
      bySeverity[bug.severity]++;
    });
    
    // Get recent bugs (last 10, sorted by found date)
    const sortedBugs = [...bugs].sort((a, b) => 
      b.foundDate.getTime() - a.foundDate.getTime()
    );
    const recentBugs = sortedBugs.slice(0, 10);
    
    return {
      totalBugs: bugs.length,
      byStatus,
      byCategory,
      bySeverity,
      recentBugs,
      timestamp: new Date()
    };
  }

  /**
   * Generate detailed test results report
   */
  generateDetailedTestReport(
    progress: TestProgress,
    bugs: BugReport[]
  ): DetailedTestReport {
    const summary = generateCoverageSummary(progress);
    const bugSummary = this.generateBugSummaryReport(bugs);
    
    // Calculate passed/failed tests from bug count
    const failedTests = bugs.length;
    const passedTests = progress.totalTests - failedTests;
    
    return {
      totalTests: progress.totalTests,
      passedTests,
      failedTests,
      coverage: summary,
      bugSummary,
      timestamp: new Date()
    };
  }

  /**
   * Load current test progress and generate coverage report
   */
  loadAndGenerateCoverageReport(): CoverageReport | null {
    const progress = loadTestProgress();
    if (!progress) {
      return null;
    }
    return this.generateCoverageReport(progress);
  }

  /**
   * Load current bugs and generate bug summary report
   */
  loadAndGenerateBugSummaryReport(): BugSummaryReport {
    const database = loadBugReports();
    return this.generateBugSummaryReport(database.bugs);
  }

  /**
   * Load all data and generate detailed test report
   */
  loadAndGenerateDetailedReport(): DetailedTestReport | null {
    const progress = loadTestProgress();
    if (!progress) {
      return null;
    }
    
    const database = loadBugReports();
    return this.generateDetailedTestReport(progress, database.bugs);
  }

  /**
   * Export coverage report as Markdown
   */
  exportCoverageReportAsMarkdown(report: CoverageReport): string {
    const lines: string[] = [];
    
    lines.push('# Test Coverage Report');
    lines.push('');
    lines.push(`Generated: ${report.timestamp.toISOString()}`);
    lines.push('');
    
    // Overall summary
    lines.push('## Overall Coverage');
    lines.push('');
    lines.push(`**Overall: ${report.summary.overall.toFixed(2)}%**`);
    lines.push('');
    
    // Room coverage
    lines.push('### Rooms');
    lines.push(`- Tested: ${report.summary.rooms.tested} / ${report.summary.rooms.total}`);
    lines.push(`- Coverage: ${report.summary.rooms.percentage.toFixed(2)}%`);
    lines.push('');
    
    // Object coverage
    lines.push('### Objects');
    lines.push(`- Tested: ${report.summary.objects.tested} / ${report.summary.objects.total}`);
    lines.push(`- Coverage: ${report.summary.objects.percentage.toFixed(2)}%`);
    lines.push('');
    
    // Interaction coverage
    lines.push('### Interactions');
    lines.push(`- Tested: ${report.summary.interactions.tested} / ${report.summary.interactions.estimated} (estimated)`);
    lines.push(`- Coverage: ${report.summary.interactions.percentage.toFixed(2)}%`);
    lines.push('');
    
    // Untested rooms
    if (report.untestedRooms.length > 0) {
      lines.push('## Untested Rooms');
      lines.push('');
      report.untestedRooms.forEach(room => {
        lines.push(`- ${room}`);
      });
      lines.push('');
    }
    
    // Untested objects
    if (report.untestedObjects.length > 0) {
      lines.push('## Untested Objects');
      lines.push('');
      report.untestedObjects.forEach(obj => {
        lines.push(`- ${obj}`);
      });
      lines.push('');
    }
    
    // Recently tested
    lines.push('## Recently Tested');
    lines.push('');
    
    if (report.recentlyTested.rooms.length > 0) {
      lines.push('### Rooms');
      report.recentlyTested.rooms.forEach(room => {
        lines.push(`- ${room}`);
      });
      lines.push('');
    }
    
    if (report.recentlyTested.objects.length > 0) {
      lines.push('### Objects');
      report.recentlyTested.objects.forEach(obj => {
        lines.push(`- ${obj}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Export bug summary report as Markdown
   */
  exportBugSummaryAsMarkdown(report: BugSummaryReport): string {
    const lines: string[] = [];
    
    lines.push('# Bug Summary Report');
    lines.push('');
    lines.push(`Generated: ${report.timestamp.toISOString()}`);
    lines.push('');
    
    lines.push(`**Total Bugs: ${report.totalBugs}**`);
    lines.push('');
    
    // By status
    lines.push('## Bugs by Status');
    lines.push('');
    Object.entries(report.byStatus).forEach(([status, count]) => {
      lines.push(`- ${status}: ${count}`);
    });
    lines.push('');
    
    // By severity
    lines.push('## Bugs by Severity');
    lines.push('');
    Object.entries(report.bySeverity).forEach(([severity, count]) => {
      lines.push(`- ${severity}: ${count}`);
    });
    lines.push('');
    
    // By category
    lines.push('## Bugs by Category');
    lines.push('');
    Object.entries(report.byCategory).forEach(([category, count]) => {
      lines.push(`- ${category}: ${count}`);
    });
    lines.push('');
    
    // Recent bugs
    if (report.recentBugs.length > 0) {
      lines.push('## Recent Bugs');
      lines.push('');
      report.recentBugs.forEach(bug => {
        lines.push(`### ${bug.id}: ${bug.title}`);
        lines.push('');
        lines.push(`- **Status**: ${bug.status}`);
        lines.push(`- **Severity**: ${bug.severity}`);
        lines.push(`- **Category**: ${bug.category}`);
        lines.push(`- **Found**: ${bug.foundDate.toISOString()}`);
        lines.push('');
        lines.push(`**Description**: ${bug.description}`);
        lines.push('');
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Export detailed test report as Markdown
   */
  exportDetailedReportAsMarkdown(report: DetailedTestReport): string {
    const lines: string[] = [];
    
    lines.push('# Detailed Test Report');
    lines.push('');
    lines.push(`Generated: ${report.timestamp.toISOString()}`);
    lines.push('');
    
    // Test summary
    lines.push('## Test Summary');
    lines.push('');
    lines.push(`- Total Tests: ${report.totalTests}`);
    lines.push(`- Passed: ${report.passedTests}`);
    lines.push(`- Failed: ${report.failedTests}`);
    lines.push(`- Pass Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(2)}%`);
    lines.push('');
    
    // Coverage summary
    lines.push('## Coverage Summary');
    lines.push('');
    lines.push(`**Overall: ${report.coverage.overall.toFixed(2)}%**`);
    lines.push('');
    lines.push(`- Rooms: ${report.coverage.rooms.percentage.toFixed(2)}% (${report.coverage.rooms.tested}/${report.coverage.rooms.total})`);
    lines.push(`- Objects: ${report.coverage.objects.percentage.toFixed(2)}% (${report.coverage.objects.tested}/${report.coverage.objects.total})`);
    lines.push(`- Interactions: ${report.coverage.interactions.percentage.toFixed(2)}% (${report.coverage.interactions.tested}/${report.coverage.interactions.estimated})`);
    lines.push('');
    
    // Bug summary
    lines.push('## Bug Summary');
    lines.push('');
    lines.push(`**Total Bugs: ${report.bugSummary.totalBugs}**`);
    lines.push('');
    
    lines.push('### By Severity');
    Object.entries(report.bugSummary.bySeverity).forEach(([severity, count]) => {
      lines.push(`- ${severity}: ${count}`);
    });
    lines.push('');
    
    lines.push('### By Status');
    Object.entries(report.bugSummary.byStatus).forEach(([status, count]) => {
      lines.push(`- ${status}: ${count}`);
    });
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Export bug reports as JSON
   */
  exportBugReportsAsJSON(bugs: BugReport[]): string {
    return JSON.stringify({ bugs }, null, 2);
  }

  /**
   * Export test progress as JSON
   */
  exportTestProgressAsJSON(progress: TestProgress): string {
    return JSON.stringify(progress, null, 2);
  }

  /**
   * Save coverage report to file
   */
  saveCoverageReport(report: CoverageReport, filename?: string): string {
    const reportsDir = '.kiro/testing/test-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filepath = path.join(reportsDir, filename || `coverage-${date}.md`);
    const markdown = this.exportCoverageReportAsMarkdown(report);
    
    fs.writeFileSync(filepath, markdown, 'utf-8');
    return filepath;
  }

  /**
   * Save bug summary report to file
   */
  saveBugSummaryReport(report: BugSummaryReport, filename?: string): string {
    const reportsDir = '.kiro/testing/test-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filepath = path.join(reportsDir, filename || `bugs-${date}.md`);
    const markdown = this.exportBugSummaryAsMarkdown(report);
    
    fs.writeFileSync(filepath, markdown, 'utf-8');
    return filepath;
  }

  /**
   * Save detailed test report to file
   */
  saveDetailedReport(report: DetailedTestReport, filename?: string): string {
    const reportsDir = '.kiro/testing/test-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filepath = path.join(reportsDir, filename || `detailed-${date}.md`);
    const markdown = this.exportDetailedReportAsMarkdown(report);
    
    fs.writeFileSync(filepath, markdown, 'utf-8');
    return filepath;
  }

  /**
   * Save bug reports as JSON file
   */
  saveBugReportsJSON(bugs: BugReport[], filename?: string): string {
    const reportsDir = '.kiro/testing/test-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filepath = path.join(reportsDir, filename || `bugs-${date}.json`);
    const json = this.exportBugReportsAsJSON(bugs);
    
    fs.writeFileSync(filepath, json, 'utf-8');
    return filepath;
  }

  /**
   * Save test progress as JSON file
   */
  saveTestProgressJSON(progress: TestProgress, filename?: string): string {
    const reportsDir = '.kiro/testing/test-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filepath = path.join(reportsDir, filename || `progress-${date}.json`);
    const json = this.exportTestProgressAsJSON(progress);
    
    fs.writeFileSync(filepath, json, 'utf-8');
    return filepath;
  }

  /**
   * Display overall coverage percentage
   */
  displayCoveragePercentage(progress: TestProgress): string {
    const summary = generateCoverageSummary(progress);
    
    const lines: string[] = [];
    lines.push('='.repeat(50));
    lines.push('TEST COVERAGE SUMMARY');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push(`Overall Coverage: ${summary.overall.toFixed(2)}%`);
    lines.push('');
    lines.push(`Rooms:        ${summary.rooms.percentage.toFixed(2)}% (${summary.rooms.tested}/${summary.rooms.total})`);
    lines.push(`Objects:      ${summary.objects.percentage.toFixed(2)}% (${summary.objects.tested}/${summary.objects.total})`);
    lines.push(`Interactions: ${summary.interactions.percentage.toFixed(2)}% (${summary.interactions.tested}/${summary.interactions.estimated})`);
    lines.push('');
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  }

  /**
   * Display list of untested rooms and objects
   */
  displayUntestedItems(progress: TestProgress): string {
    const untestedRooms = getUntestedRooms(progress);
    const untestedObjects = getUntestedObjects(progress);
    
    const lines: string[] = [];
    lines.push('='.repeat(50));
    lines.push('UNTESTED ITEMS');
    lines.push('='.repeat(50));
    lines.push('');
    
    if (untestedRooms.length > 0) {
      lines.push(`Untested Rooms (${untestedRooms.length}):`);
      untestedRooms.slice(0, 20).forEach(room => {
        lines.push(`  - ${room}`);
      });
      if (untestedRooms.length > 20) {
        lines.push(`  ... and ${untestedRooms.length - 20} more`);
      }
      lines.push('');
    } else {
      lines.push('All rooms have been tested!');
      lines.push('');
    }
    
    if (untestedObjects.length > 0) {
      lines.push(`Untested Objects (${untestedObjects.length}):`);
      untestedObjects.slice(0, 20).forEach(obj => {
        lines.push(`  - ${obj}`);
      });
      if (untestedObjects.length > 20) {
        lines.push(`  ... and ${untestedObjects.length - 20} more`);
      }
      lines.push('');
    } else {
      lines.push('All objects have been tested!');
      lines.push('');
    }
    
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  }

  /**
   * Display recently tested items
   */
  displayRecentlyTested(progress: TestProgress): string {
    const recentRooms = progress.testedRooms.slice(-10).reverse();
    const recentObjects = progress.testedObjects.slice(-10).reverse();
    
    const lines: string[] = [];
    lines.push('='.repeat(50));
    lines.push('RECENTLY TESTED ITEMS');
    lines.push('='.repeat(50));
    lines.push('');
    
    if (recentRooms.length > 0) {
      lines.push('Recent Rooms:');
      recentRooms.forEach((room, index) => {
        lines.push(`  ${index + 1}. ${room}`);
      });
      lines.push('');
    }
    
    if (recentObjects.length > 0) {
      lines.push('Recent Objects:');
      recentObjects.forEach((obj, index) => {
        lines.push(`  ${index + 1}. ${obj}`);
      });
      lines.push('');
    }
    
    if (recentRooms.length === 0 && recentObjects.length === 0) {
      lines.push('No items tested yet.');
      lines.push('');
    }
    
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  }

  /**
   * Display comprehensive coverage visualization
   */
  displayCoverageVisualization(progress: TestProgress): string {
    const lines: string[] = [];
    
    lines.push(this.displayCoveragePercentage(progress));
    lines.push('');
    lines.push(this.displayUntestedItems(progress));
    lines.push('');
    lines.push(this.displayRecentlyTested(progress));
    
    return lines.join('\n');
  }

  /**
   * Display bug summary visualization
   */
  displayBugSummary(bugs: BugReport[]): string {
    const report = this.generateBugSummaryReport(bugs);
    
    const lines: string[] = [];
    lines.push('='.repeat(50));
    lines.push('BUG SUMMARY');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push(`Total Bugs: ${report.totalBugs}`);
    lines.push('');
    
    lines.push('By Status:');
    Object.entries(report.byStatus).forEach(([status, count]) => {
      if (count > 0) {
        lines.push(`  ${status}: ${count}`);
      }
    });
    lines.push('');
    
    lines.push('By Severity:');
    Object.entries(report.bySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        lines.push(`  ${severity}: ${count}`);
      }
    });
    lines.push('');
    
    lines.push('By Category:');
    Object.entries(report.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        lines.push(`  ${category}: ${count}`);
      }
    });
    lines.push('');
    
    if (report.recentBugs.length > 0) {
      lines.push('Recent Bugs:');
      report.recentBugs.slice(0, 5).forEach(bug => {
        lines.push(`  ${bug.id}: ${bug.title} [${bug.severity}]`);
      });
      lines.push('');
    }
    
    lines.push('='.repeat(50));
    
    return lines.join('\n');
  }

  /**
   * Display complete test status dashboard
   */
  displayTestDashboard(progress: TestProgress, bugs: BugReport[]): string {
    const lines: string[] = [];
    
    lines.push('');
    lines.push('╔' + '═'.repeat(48) + '╗');
    lines.push('║' + ' '.repeat(10) + 'ZORK TEST DASHBOARD' + ' '.repeat(19) + '║');
    lines.push('╚' + '═'.repeat(48) + '╝');
    lines.push('');
    
    lines.push(this.displayCoveragePercentage(progress));
    lines.push('');
    lines.push(this.displayBugSummary(bugs));
    lines.push('');
    
    const summary = generateCoverageSummary(progress);
    const untestedRooms = getUntestedRooms(progress);
    const untestedObjects = getUntestedObjects(progress);
    
    lines.push('Quick Stats:');
    lines.push(`  Total Tests Run: ${progress.totalTests}`);
    lines.push(`  Bugs Found: ${bugs.length}`);
    lines.push(`  Untested Rooms: ${untestedRooms.length}`);
    lines.push(`  Untested Objects: ${untestedObjects.length}`);
    lines.push(`  Last Updated: ${progress.lastUpdated.toISOString()}`);
    lines.push('');
    
    return lines.join('\n');
  }
}
