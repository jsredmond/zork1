# Contributing to Zork-TS

Thank you for your interest in contributing to the Zork I TypeScript implementation!

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/zork-ts/zork-ts.git
cd zork-ts

# Install dependencies
npm install

# Run the game in development mode
npm run dev

# Run tests
npm test
```

## Project Structure

```
src/
├── engine/          # Game engine (combat, daemons, NPCs)
├── game/            # Game content (actions, rooms, objects, state)
│   ├── data/        # Room and object definitions
│   └── factories/   # Game initialization
├── io/              # Terminal I/O and display
├── parser/          # Natural language command parsing
├── persistence/     # Save/restore functionality
├── parity/          # Parity validation tools (dev only)
└── testing/         # Test infrastructure (dev only)

scripts/             # Development and testing scripts
reference/           # ZIL source files (local only, gitignored)
dev-artifacts/       # Development outputs (local only, gitignored)
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run src/game/actions.test.ts

# Run tests in watch mode
npm run test:watch
```

### Exhaustive Testing

The project includes comprehensive testing tools:

```bash
# Run exhaustive tests
npm run test:run -- --rooms --objects --max 100

# Check test status
npm run test:status
```

### Parity Validation

Parity validation compares the TypeScript implementation against the original Z-Machine:

```bash
# Full parity validation (10 seeds, 250 commands each)
npm run parity:validate

# Quick validation (5 seeds, 100 commands each)
npm run parity:quick

# Establish new baseline
npm run parity:baseline
```

#### Difference Classifications

- **LOGIC_DIFFERENCE** - Behavioral bug (must be fixed)
- **RNG_DIFFERENCE** - Random variation (acceptable)
- **STATE_DIVERGENCE** - Accumulated RNG effects (acceptable)
- **STATUS_BAR** - Formatting differences (informational)

## Code Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing Requirements

- Write unit tests for new functionality
- Ensure parity validation passes before submitting PRs
- Property-based tests use `fast-check` library

### Commit Messages

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Reference Materials

### ZIL Source Files

Original ZIL source files are available locally in `reference/zil/` (gitignored). These are useful for understanding original game behavior:

- `zork1.zil` - Main game file
- `1dungeon.zil` - Room definitions
- `1actions.zil` - Action handlers
- `gparser.zil` - Parser implementation

### Development Artifacts

Development outputs are stored in `dev-artifacts/` (gitignored):

- `parity-reports/` - Parity analysis results
- `test-outputs/` - Test output files

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run parity validation (`npm run parity:quick`)
6. Commit with a descriptive message
7. Push to your fork
8. Open a Pull Request

## Reporting Issues

When reporting bugs, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Node.js version
- Operating system

For parity issues (differences from original game), include:

- The command sequence that reveals the difference
- Expected output (from original Z-Machine)
- Actual output (from TypeScript version)

## Questions?

Open an issue for questions about the codebase or contribution process.
