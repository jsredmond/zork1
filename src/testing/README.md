# Exhaustive Testing System

This directory contains the infrastructure for systematically testing every room, object, and interaction in the Zork I rewrite.

## Structure

### Core Infrastructure

- **types.ts** - TypeScript type definitions for the test system
- **persistence.ts** - Utilities for reading/writing test data to JSON files
- **testProgress.ts** - Test progress tracking and management
- **coverage.ts** - Coverage calculation and reporting
- **bugTracker.ts** - Bug report management
- **coordinator.ts** - Test orchestration and execution

### Test Runners

- **roomTester.ts** - Tests room descriptions, exits, and objects
- **objectTester.ts** - Tests object interactions
- **puzzleTester.ts** - Tests puzzle solutions
- **npcTester.ts** - Tests NPC interactions
- **edgeCaseTester.ts** - Tests edge cases and error conditions
- **verbObjectTester.ts** - Tests verb-object combinations

### Automated Test Scripts

- **scriptRunner.ts** - Executes test scripts (sequences of commands) and validates output
- **testScripts.ts** - Pre-defined test scripts for common scenarios
- **regressionTester.ts** - Compares test results to baseline to detect regressions

### Property-Based Tests

- **idempotency.test.ts** - Property test for test idempotency

## Data Files

Test data is persisted in `.kiro/testing/`:

- **test-progress.json** - Tracks which rooms, objects, and interactions have been tested
- **bug-reports.json** - Database of bugs found during testing
- **baselines/baseline.json** - Baseline test results for regression testing

## Usage Examples

### Basic Test Coordination

```typescript
import { TestCoordinator } from './testing';
import { createInitialGameState } from '../game/factories/gameFactory';

const coordinator = new TestCoordinator();
const state = createInitialGameState();

const results = await coordinator.runTests({
  testRooms: true,
  testObjects: true,
  maxTests: 100
}, state);

console.log(`Passed: ${results.passedTests}/${results.totalTests}`);
console.log(`Coverage: ${results.coverage.rooms * 100}%`);
```

### Running Test Scripts

```typescript
import { ScriptRunner, getAllTestScripts } from './testing';
import { createInitialGameState } from '../game/factories/gameFactory';

const runner = new ScriptRunner();
const state = createInitialGameState();

// Run all predefined test scripts
const scripts = getAllTestScripts();
const results = runner.executeScripts(scripts, state);

for (const result of results) {
  console.log(`${result.scriptName}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`  ${result.passedCommands}/${result.totalCommands} commands passed`);
}
```

### Regression Testing

```typescript
import { RegressionTester } from './testing';
import { createInitialGameState } from '../game/factories/gameFactory';

const tester = new RegressionTester();
const state = createInitialGameState();

// Create baseline (first time)
if (!tester.hasBaseline()) {
  tester.createBaseline(state, '1.0.0');
}

// Run regression tests
const summary = tester.runAllRegressionTests(state);
console.log(tester.formatSummary(summary));

if (summary.regressed > 0) {
  console.error('REGRESSIONS DETECTED!');
}
```

### Creating Custom Test Scripts

```typescript
import { createTestScript, createTestCommand, ScriptRunner } from './testing';

const myScript = createTestScript(
  'my-test',
  'My Custom Test',
  'Tests a specific scenario',
  [
    createTestCommand('look', /house/i, true, 'Check starting location'),
    createTestCommand('north', undefined, true, 'Move north'),
    createTestCommand('inventory', 'empty', true, 'Check inventory')
  ]
);

const runner = new ScriptRunner();
const state = createInitialGameState();
const result = runner.executeScript(myScript, state);
```

### Managing Test Progress

```typescript
import { 
  loadTestProgress, 
  saveTestProgress, 
  createEmptyTestProgress,
  addTestedRoom,
  addTestedObject
} from './testing';

// Load existing progress or create new
let progress = loadTestProgress() || createEmptyTestProgress();

// Update progress
progress = addTestedRoom(progress, 'WEST-OF-HOUSE');
progress = addTestedObject(progress, 'MAILBOX');
saveTestProgress(progress);
```

### Reporting Bugs

```typescript
import { addBugReport, generateBugId, BugCategory, BugSeverity, BugStatus } from './testing';

const bugId = generateBugId();
addBugReport({
  id: bugId,
  title: 'Cannot open mailbox',
  description: 'OPEN MAILBOX command fails',
  category: BugCategory.ACTION_ERROR,
  severity: BugSeverity.MAJOR,
  status: BugStatus.OPEN,
  reproductionSteps: ['Go to WEST-OF-HOUSE', 'Type OPEN MAILBOX'],
  gameState: {
    currentRoom: 'WEST-OF-HOUSE',
    inventory: [],
    score: 0,
    moves: 1,
    flags: {}
  },
  foundDate: new Date()
});
```

## Pre-defined Test Scripts

The system includes several pre-defined test scripts:

- **Basic Navigation** - Tests movement between rooms
- **Object Manipulation** - Tests taking, dropping, examining objects
- **Container Interaction** - Tests putting objects in containers
- **Light Source** - Tests lamp mechanics and darkness
- **Grating Puzzle** - Tests opening the grating and entering dungeon
- **Invalid Commands** - Tests error handling
- **Inventory Limits** - Tests inventory capacity
- **Pronoun Resolution** - Tests IT, THEM, ALL pronouns

## Requirements Coverage

This infrastructure satisfies:

- **Requirement 4.1**: Persist test progress to a file
- **Requirement 4.2**: Load previous test progress on startup
- **Requirement 4.3**: Display test coverage summary
- **Requirement 9.1**: Provide automated test scripts
- **Requirement 9.2**: Execute test scripts and compare output
- **Requirement 9.5**: Support regression testing after bug fixes

## Property-Based Testing

The system includes property-based tests using fast-check:

- **Test Idempotency** - Tests produce consistent results when run multiple times
- **Test Progress Persistence** - Save/load preserves all data
- **Bug Report Completeness** - All required fields are present
- **Room Reachability** - All tested rooms are accessible
- **Object Accessibility** - All tested objects are reachable
