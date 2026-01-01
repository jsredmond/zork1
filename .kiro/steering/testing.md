# Testing Infrastructure

## Overview

The project has a comprehensive testing system for verifying parity between the TypeScript Zork I implementation and the original Z-Machine. Testing is divided into:

1. **Unit Tests** - Standard Vitest tests for individual components
2. **Property-Based Tests** - fast-check tests for invariants
3. **Exhaustive Testing** - Systematic testing of rooms, objects, and interactions
4. **Parity Validation** - Comparison testing against the original Z-Machine

## Common Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/game/actions.test.ts

# Run exhaustive tests
npm run test:run -- --rooms --objects --max 100

# Check test status and coverage
npm run test:status

# Run parity validation (full - 10 seeds, 250 commands each)
npm run parity:validate

# Run quick parity validation (5 seeds, 100 commands each)
npm run parity:quick

# Establish new parity baseline
npm run parity:baseline
```

## Parity Validation System

The `ExhaustiveParityValidator` compares TypeScript output against Z-Machine output:

### Difference Classifications

- **LOGIC_DIFFERENCE** - Behavioral bug that affects parity (must be fixed)
- **RNG_DIFFERENCE** - Random variation (acceptable, both outputs valid)
- **STATE_DIVERGENCE** - Accumulated RNG effects (acceptable)
- **STATUS_BAR** - Formatting differences (tracked separately, informational)

### Key Metrics

- **Logic Parity %** - Primary metric: `(totalCommands - logicDifferences) / totalCommands * 100`
- **Status Bar Differences** - Tracked separately, don't affect parity percentage
- **Passed** - True when logicDifferences = 0

### Configuration

Default config runs 10 seeds with 250 commands each:
```typescript
seeds: [12345, 67890, 54321, 99999, 11111, 22222, 33333, 44444, 55555, 77777]
commandsPerSeed: 250
timeout: 300000 // 5 minutes
```

## Exhaustive Testing System

### Test Types

| Option | Description |
| ------ | ----------- |
| `--rooms` | Test room descriptions, exits, objects |
| `--objects` | Test object interactions |
| `--puzzles` | Test puzzle solutions |
| `--npcs` | Test NPC behavior |
| `--edge-cases` | Test edge cases and errors |

### Filtering

```bash
# Test specific rooms
npm run test:run -- --room-filter WEST-OF-HOUSE,KITCHEN

# Test specific objects
npm run test:run -- --object-filter MAILBOX,LAMP

# Limit test count
npm run test:run -- --max 50
```

### Bug Management

```bash
# List bugs
npm run test:bugs

# Filter by severity/status
npm run test:bugs -- --severity CRITICAL
npm run test:bugs -- --status OPEN

# Update bug status
npm run test:bug-update BUG-001 FIXED

# Export bug reports
npm run test:bug-export
npm run test:bug-export -- --json
```

## Test Files Location

- **Unit tests**: `src/**/*.test.ts`
- **Property tests**: `src/**/*.property.test.ts`
- **Test infrastructure**: `src/testing/`
- **Test scripts**: `scripts/`
- **Command sequences**: `scripts/sequences/`

## Property-Based Testing

Uses `fast-check` ^4.5.3 for property-based tests. Property tests verify invariants like:
- Monotonic parity improvement (fixes never decrease parity)
- Message equivalence after normalization
- Zero logic differences at 100% parity
- Regression prevention

Run property tests:
```bash
npx vitest run src/**/*.property.test.ts
```

## Transcript Recording

Record and compare game sessions:

```bash
# Record TypeScript session
npm run record:ts

# Record Z-Machine session
npm run record:zm

# Record and compare both
npm run compare
npm run compare:batch
```

## Verification Scripts

```bash
# Verify transcripts
npm run verify:transcripts

# Verify puzzle solutions
npm run verify:puzzles

# Generate verification report
npm run verify:report
```
