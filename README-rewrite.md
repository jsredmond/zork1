# Zork I - Modern Rewrite

A modern TypeScript rewrite of the classic Zork I interactive fiction game.

## Project Structure

```
src/
├── main.ts                 # Entry point
├── io/
│   ├── terminal.ts        # Terminal I/O handling
│   └── display.ts         # Output formatting
├── parser/
│   ├── lexer.ts           # Tokenization
│   ├── parser.ts          # Command parsing
│   ├── vocabulary.ts      # Word definitions
│   └── syntax.ts          # Syntax patterns
├── game/
│   ├── state.ts           # Game state management
│   ├── objects.ts         # Object system
│   ├── rooms.ts           # Room definitions
│   ├── actions.ts         # Action handlers
│   └── verbs.ts           # Verb implementations
├── engine/
│   ├── executor.ts        # Command execution
│   ├── rules.ts           # Game rules engine
│   └── events.ts          # Event system
└── persistence/
    ├── serializer.ts      # State serialization
    └── storage.ts         # File I/O
```

## Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Requirements

- Node.js 20+
- TypeScript 5.3+

## Testing

This project uses:
- **Vitest** for unit and integration testing
- **fast-check** for property-based testing

## Development Status

This is a work in progress. See `.kiro/specs/modern-zork-rewrite/tasks.md` for implementation plan.
