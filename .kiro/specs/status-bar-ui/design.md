# Design Document: Status Bar UI

## Overview

This design implements a proper terminal UI for the Zork I TypeScript rewrite that matches the original game's display. The implementation uses ANSI escape codes to create a fixed status bar at the top of the terminal, with scrollable game content below and a `>` prompt for input.

## Architecture

The implementation modifies the existing `Terminal` class in `src/io/terminal.ts` to support:
1. ANSI escape code output for cursor positioning and screen regions
2. A fixed status bar that updates in place
3. A scrollable content region below the status bar
4. The `>` prompt character for input

```
┌─────────────────────────────────────────────────────────┐
│ West of House                    Score: 0    Moves: 0   │  ← Status Bar (Line 1, fixed)
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ZORK I: The Great Underground Empire                    │
│ Copyright (c) 1981, 1982, 1983 Infocom, Inc.           │
│                                                         │  ← Scrollable Content
│ West of House                                           │
│ You are standing in an open field...                    │
│ There is a small mailbox here.                          │
│                                                         │
│ >north                                                  │  ← Command with prompt
│ North of House                                          │
│ You are facing the north side...                        │
│                                                         │
│ >_                                                      │  ← Input prompt
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Terminal Class Updates

```typescript
class Terminal {
  // New methods
  initializeScreen(): void;           // Set up scroll region and status bar
  updateStatusBar(location: string, score: number, moves: number): void;
  writeToContentArea(text: string): void;
  
  // Updated methods
  showPrompt(): void;                 // Use '> ' prompt
  writeLine(text: string): void;      // Write to content area only
}
```

### ANSI Escape Codes Used

| Code | Purpose |
|------|---------|
| `\x1b[H` | Move cursor to home (1,1) |
| `\x1b[K` | Clear line from cursor |
| `\x1b[{n};{m}r` | Set scroll region (lines n to m) |
| `\x1b[{n};{m}H` | Move cursor to row n, column m |
| `\x1b[7m` | Reverse video (for status bar) |
| `\x1b[0m` | Reset attributes |
| `\x1b[s` | Save cursor position |
| `\x1b[u` | Restore cursor position |

### Main Loop Updates

The main game loop in `src/main.ts` will be updated to:
1. Call `initializeScreen()` on startup
2. Call `updateStatusBar()` after each command
3. Remove inline status bar display (now handled by fixed bar)

## Data Models

No new data models required. The existing `GameState` provides all necessary data:
- `state.currentRoom` - Current location name
- `state.score` - Current score
- `state.moves` - Move count

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status bar contains current room name
*For any* game state with a current room, the status bar output SHALL contain the room's name string.
**Validates: Requirements 1.2, 1.5**

### Property 2: Status bar contains score and moves
*For any* game state, the status bar output SHALL contain "Score: {score}" and "Moves: {moves}" matching the current state values.
**Validates: Requirements 1.3, 1.4**

### Property 3: Commands are prefixed with prompt
*For any* command entered by the player, the displayed output SHALL show the command prefixed with "> ".
**Validates: Requirements 4.1, 4.2, 4.3**

## Error Handling

- If terminal doesn't support ANSI codes, fall back to inline status display (current behavior)
- If terminal size is too small, truncate status bar content gracefully
- Handle missing room name by displaying "Unknown" in status bar

## Testing Strategy

### Unit Tests
- Test `formatStatusBar()` produces correct string format
- Test ANSI escape sequence generation
- Test prompt string is "> "

### Property-Based Tests
Using Vitest with fast-check:

1. **Property 1**: Generate random room names and verify status bar contains them
2. **Property 2**: Generate random score/moves values and verify status bar contains correct values
3. **Property 3**: Generate random command strings and verify output includes "> {command}"

### Integration Tests
- Test full game startup displays status bar
- Test command execution updates status bar
- Test room movement updates location in status bar
