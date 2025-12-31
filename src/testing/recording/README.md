# Game Recording and Comparison System

A testing utility for recording game sessions from both the TypeScript Zork I implementation and the original z3 file, then comparing outputs to verify behavioral parity.

## Overview

This system enables automated testing of the TypeScript Zork I rewrite by:

1. Recording gameplay sessions from the TypeScript engine
2. Recording the same sessions from the original game via a Z-machine interpreter
3. Comparing the outputs to identify differences
4. Generating reports in multiple formats

## Installation Requirements

### TypeScript Engine

The TypeScript recorder is always available as part of this project. No additional installation required.

### Z-Machine Interpreter (Optional)

To compare against the original game, you need a Z-machine interpreter installed:

#### macOS (Homebrew)

```bash
brew install frotz
```

#### Ubuntu/Debian

```bash
sudo apt-get install frotz
```

#### Windows

Download dfrotz from [Frotz releases](https://gitlab.com/DavidGriffith/frotz/-/releases) or use WSL with the Linux instructions above.

#### Verify Installation

```bash
dfrotz --version
```

### Game File

The original compiled game file should be at `reference/COMPILED/zork1.z3` in the project root.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZORK_INTERPRETER_PATH` | Path to dfrotz/frotz executable | Auto-detected |
| `ZORK_GAME_FILE_PATH` | Path to zork1.z3 file | `reference/COMPILED/zork1.z3` |
| `ZORK_DEFAULT_SEED` | Default random seed | `12345` |

### Configuration File

Create a JSON configuration file:

```json
{
  "interpreterPath": "/usr/local/bin/dfrotz",
  "gameFilePath": "reference/COMPILED/zork1.z3",
  "defaultSeed": 12345,
  "comparisonOptions": {
    "normalizeWhitespace": true,
    "ignoreCaseInMessages": false,
    "toleranceThreshold": 0.95
  },
  "knownVariations": [
    "combat outcome",
    "thief movement",
    "random encounter"
  ]
}
```

## Usage

### Quick Start

```typescript
import { createRecordingSystem, quickCompare } from './index.js';

// Quick comparison of a command sequence
const result = await quickCompare(
  ['look', 'inventory', 'go north'],
  12345  // Optional seed for deterministic behavior
);

if (result.success && result.report) {
  console.log(`Parity Score: ${result.report.parityScore}%`);
}
```

### Full System Usage

```typescript
import {
  createRecordingSystem,
  CommandSequenceLoader,
  ReportGenerator
} from './index.js';

// Create the full system
const system = await createRecordingSystem();

// Load command sequences from files
const loader = new CommandSequenceLoader();
const sequences = loader.loadDirectory('scripts/sequences');

// Run batch comparison
const results = await system.batchRunner.run(sequences, {
  parallel: false,
  stopOnFailure: false
});

// Generate report
const generator = new ReportGenerator();
const report = generator.generateBatchReport(results, 'markdown');
console.log(report);
```

### Recording TypeScript Only

```typescript
import { TypeScriptRecorder } from './index.js';

const recorder = new TypeScriptRecorder();
const transcript = await recorder.record(
  ['look', 'take mailbox', 'inventory'],
  { seed: 12345, captureTimestamps: true }
);

console.log(`Recorded ${transcript.entries.length} entries`);
```

### Recording from Z-Machine

```typescript
import { ZMachineRecorder, loadZMachineConfig } from './index.js';

const config = await loadZMachineConfig();
const recorder = new ZMachineRecorder(config);

if (await recorder.isAvailable()) {
  const transcript = await recorder.record(['look', 'go north']);
  console.log(transcript.entries[0].output);
}
```

### Comparing Transcripts

```typescript
import { TranscriptComparator } from './index.js';

const comparator = new TranscriptComparator({
  normalizeWhitespace: true,
  toleranceThreshold: 0.95
});

const report = comparator.compare(originalTranscript, tsTranscript);

console.log(`Parity: ${report.parityScore}%`);
console.log(`Differences: ${report.differences.length}`);
console.log(`Critical: ${report.summary.critical}`);
```

### Loading Command Sequences

```typescript
import { CommandSequenceLoader } from './index.js';

const loader = new CommandSequenceLoader();

// Load single file
const sequence = loader.load('scripts/sequences/basic-exploration.txt');

// Load all sequences from directory
const sequences = loader.loadDirectory('scripts/sequences');

// Parse from string
const inline = loader.parseString(`
# Test sequence
look
inventory
go north
`, 'test-sequence');
```

### Command Sequence File Format

```text
# Comments start with #
#!name: Basic Exploration
#!description: Tests basic room navigation

# Commands (one per line)
look
inventory
open mailbox
read leaflet
go north

# Include other files
@include common/setup.txt
```

### Generating Reports

```typescript
import { ReportGenerator } from './index.js';

const generator = new ReportGenerator();

// Single comparison report
const textReport = generator.generate(diffReport, 'text');
const jsonReport = generator.generate(diffReport, 'json');
const mdReport = generator.generate(diffReport, 'markdown');
const htmlReport = generator.generate(diffReport, 'html');

// Batch report
const batchReport = generator.generateBatchReport(batchResult, 'markdown');
```

## NPM Scripts

```bash
# Record from TypeScript engine
npm run record:ts

# Record from Z-Machine (requires dfrotz)
npm run record:zm

# Compare TypeScript vs Z-Machine
npm run compare
```

## API Reference

### Classes

| Class | Description |
|-------|-------------|
| `TypeScriptRecorder` | Records sessions from TypeScript engine |
| `ZMachineRecorder` | Records sessions from Z-machine interpreter |
| `CommandSequenceLoader` | Loads command sequences from files |
| `TranscriptComparator` | Compares transcripts and generates diff reports |
| `BatchRunner` | Executes multiple sequences and aggregates results |
| `ReportGenerator` | Generates reports in multiple formats |

### Factory Functions

| Function | Description |
|----------|-------------|
| `createRecordingSystem()` | Creates complete system with all components |
| `quickCompare()` | Quick comparison of a command sequence |
| `createComparator()` | Creates a TranscriptComparator |
| `createBatchRunner()` | Creates a BatchRunner |
| `createReportGenerator()` | Creates a ReportGenerator |

### Configuration Functions

| Function | Description |
|----------|-------------|
| `loadZMachineConfig()` | Loads Z-machine configuration |
| `loadRecordingConfig()` | Loads full recording configuration |
| `validateConfig()` | Validates configuration |
| `createSampleConfig()` | Creates sample configuration JSON |

## Difference Severity Levels

| Severity | Description |
|----------|-------------|
| `critical` | Completely different content (similarity < 70%) |
| `major` | Significant word differences (similarity 70-90%) |
| `minor` | Small differences, known variations (similarity > 90%) |
| `formatting` | Whitespace/formatting only differences |

## Deterministic Testing

For reproducible comparisons, use the `seed` option:

```typescript
const transcript = await recorder.record(commands, { seed: 12345 });
```

This ensures random elements (combat outcomes, NPC behavior) are consistent across runs.

**Note:** The Z-machine interpreter does not support seeding, so some differences in non-deterministic behaviors are expected.

## Known Limitations

1. **Z-Machine Seeding**: The original game cannot be seeded, so combat and NPC behaviors may differ
2. **Timing**: Some timing-dependent behaviors may vary between implementations
3. **Interpreter Variations**: Different Z-machine interpreters may produce slightly different output formatting

## Troubleshooting

### "Z-machine interpreter not available"

1. Install dfrotz (see Installation Requirements)
2. Set `ZORK_INTERPRETER_PATH` environment variable
3. Verify the game file exists at `reference/COMPILED/zork1.z3`

### "Game file not found"

1. Ensure `reference/COMPILED/zork1.z3` exists
2. Set `ZORK_GAME_FILE_PATH` to the correct path

### High number of formatting differences

1. Enable `normalizeWhitespace: true` in comparison options
2. Increase `toleranceThreshold` for more lenient matching

## Contributing

When adding new test sequences:

1. Create a `.txt` file in `scripts/sequences/`
2. Add descriptive comments
3. Test with both TypeScript and Z-machine recorders
4. Document any expected differences
