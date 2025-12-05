# Exhaustive Testing System

This directory contains the exhaustive testing system for the Zork I rewrite. The system systematically tests every room, object, and interaction in the game.

## Components

### Core Testing
- **coordinator.ts** - Orchestrates test execution
- **roomTester.ts** - Tests room descriptions, exits, and objects
- **objectTester.ts** - Tests object interactions
- **puzzleTester.ts** - Tests puzzle solutions
- **npcTester.ts** - Tests NPC behavior
- **edgeCaseTester.ts** - Tests edge cases and error conditions

### Test Scripts
- **scriptRunner.ts** - Executes test scripts
- **testScripts.ts** - Predefined test scripts
- **regressionTester.ts** - Regression testing

### Data Management
- **testProgress.ts** - Test progress tracking
- **bugTracker.ts** - Bug report management
- **coverage.ts** - Coverage calculation
- **persistence.ts** - Data persistence utilities

### Reporting
- **reporter.ts** - Test reporting and visualization

## Usage

### Running Tests

```typescript
import { TestCoordinator } from './testing';

const coordinator = new TestCoordinator();

// Run all tests
await coordinator.runTests({
  testRooms: true,
  testObjects: true,
  testPuzzles: true,
  testNPCs: true,
  testEdgeCases: true
});

// Run specific tests
await coordinator.runTests({
  testRooms: true,
  roomFilter: ['WEST-OF-HOUSE', 'NORTH-OF-HOUSE']
});
```

### Generating Reports

```typescript
import { TestReporter } from './testing';

const reporter = new TestReporter();

// Generate and display coverage report
const coverageReport = reporter.loadAndGenerateCoverageReport();
if (coverageReport) {
  console.log(reporter.displayCoverageVisualization(progress));
}

// Generate and save bug summary
const bugReport = reporter.loadAndGenerateBugSummaryReport();
reporter.saveBugSummaryReport(bugReport);

// Generate detailed test report
const detailedReport = reporter.loadAndGenerateDetailedReport();
if (detailedReport) {
  reporter.saveDetailedReport(detailedReport);
}

// Display test dashboard
const progress = loadTestProgress();
const bugs = loadBugReports().bugs;
if (progress) {
  console.log(reporter.displayTestDashboard(progress, bugs));
}
```

### Exporting Reports

Reports can be exported in multiple formats:

```typescript
// Export as Markdown
const markdown = reporter.exportCoverageReportAsMarkdown(coverageReport);
const bugMarkdown = reporter.exportBugSummaryAsMarkdown(bugReport);

// Export as JSON
const json = reporter.exportBugReportsAsJSON(bugs);
const progressJson = reporter.exportTestProgressAsJSON(progress);

// Save to files
reporter.saveCoverageReport(coverageReport, 'my-coverage.md');
reporter.saveBugReportsJSON(bugs, 'my-bugs.json');
```

## Test Progress

Test progress is automatically saved to `.kiro/testing/test-progress.json` and includes:
- List of tested rooms
- List of tested objects
- Tested interactions per object
- Coverage percentages
- Total test count

## Bug Reports

Bug reports are saved to `.kiro/testing/bug-reports.json` and include:
- Bug ID
- Title and description
- Category and severity
- Status tracking
- Reproduction steps
- Game state snapshot

## Coverage Calculation

Coverage is calculated as:
- **Room Coverage**: (tested rooms / total rooms) × 100
- **Object Coverage**: (tested objects / total objects) × 100
- **Interaction Coverage**: (tested interactions / estimated interactions) × 100
- **Overall Coverage**: Average of the three coverage types

## Property-Based Testing

The system includes property-based tests using fast-check to verify:
- Test progress persistence (round-trip)
- Coverage calculation accuracy
- Bug report completeness
- Test idempotency

## Reports Directory

Generated reports are saved to `.kiro/testing/test-reports/`:
- `coverage-YYYY-MM-DD.md` - Coverage reports
- `bugs-YYYY-MM-DD.md` - Bug summaries
- `detailed-YYYY-MM-DD.md` - Detailed test reports
- `bugs-YYYY-MM-DD.json` - Bug reports (JSON)
- `progress-YYYY-MM-DD.json` - Test progress (JSON)
