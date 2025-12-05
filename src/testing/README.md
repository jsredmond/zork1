# Exhaustive Testing System

This directory contains the infrastructure for systematically testing every room, object, and interaction in the Zork I rewrite.

## Structure

- **types.ts** - TypeScript type definitions for the test system
- **persistence.ts** - Utilities for reading/writing test data to JSON files
- **index.ts** - Main exports for the testing module

## Data Files

Test data is persisted in `.kiro/testing/`:

- **test-progress.json** - Tracks which rooms, objects, and interactions have been tested
- **bug-reports.json** - Database of bugs found during testing

## Usage

```typescript
import { 
  loadTestProgress, 
  saveTestProgress, 
  createEmptyTestProgress,
  addBugReport,
  generateBugId
} from './testing';

// Load existing progress or create new
const progress = loadTestProgress() || createEmptyTestProgress();

// Update progress
progress.testedRooms.push('WEST-OF-HOUSE');
progress.totalTests++;
saveTestProgress(progress);

// Report a bug
const bugId = generateBugId();
addBugReport({
  id: bugId,
  title: 'Cannot open mailbox',
  description: 'OPEN MAILBOX command fails',
  category: BugCategory.ACTION_ERROR,
  severity: BugSeverity.MAJOR,
  status: BugStatus.OPEN,
  reproductionSteps: ['Go to WEST-OF-HOUSE', 'Type OPEN MAILBOX'],
  gameState: { /* ... */ },
  foundDate: new Date()
});
```

## Requirements

This infrastructure satisfies:
- Requirement 4.1: Persist test progress to a file
- Requirement 4.2: Load previous test progress on startup
