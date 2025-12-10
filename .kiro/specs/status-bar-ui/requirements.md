# Requirements Document

## Introduction

This feature implements a proper terminal UI for the Zork I TypeScript rewrite that matches the original game's display. The original Zork used a fixed status bar at the top of the screen showing the current location, score, and moves count. The game also used a `>` prompt character for player input. This implementation will use ANSI escape codes to create a similar experience in modern terminals.

## Glossary

- **Status Bar**: A fixed line at the top of the terminal displaying game state information
- **Terminal**: The command-line interface where the game runs
- **ANSI Escape Codes**: Special character sequences that control terminal display (cursor position, colors, etc.)
- **Prompt**: The character displayed before user input (originally `>`)

## Requirements

### Requirement 1

**User Story:** As a player, I want to see a fixed status bar at the top of the screen showing my current location, score, and moves, so that I always know my game state without scrolling.

#### Acceptance Criteria

1. WHEN the game starts THEN the Terminal SHALL display a status bar on the first line of the screen
2. WHEN the status bar is displayed THEN the Terminal SHALL show the current room name on the left side
3. WHEN the status bar is displayed THEN the Terminal SHALL show "Score: X" and "Moves: Y" on the right side
4. WHEN the player executes any command THEN the Terminal SHALL update the status bar to reflect current game state
5. WHEN the player moves to a new room THEN the Terminal SHALL update the location in the status bar immediately

### Requirement 2

**User Story:** As a player, I want the status bar to remain fixed at the top while game text scrolls below, so that I can always see my current status.

#### Acceptance Criteria

1. WHEN game output is displayed THEN the Terminal SHALL keep the status bar fixed at line 1
2. WHEN game text exceeds the terminal height THEN the Terminal SHALL scroll only the game content area below the status bar
3. WHEN the terminal is resized THEN the Terminal SHALL maintain the status bar position at the top

### Requirement 3

**User Story:** As a player, I want to see a `>` prompt character before my input, so that the interface matches the original Zork experience.

#### Acceptance Criteria

1. WHEN the game is ready for input THEN the Terminal SHALL display a `>` character followed by a space
2. WHEN the player types a command THEN the Terminal SHALL echo the command after the `>` prompt
3. WHEN a command is executed THEN the Terminal SHALL display the `>` prompt on a new line for the next command

### Requirement 4

**User Story:** As a player, I want to see my previous commands displayed with the `>` prompt in the game history, so that I can review what I typed.

#### Acceptance Criteria

1. WHEN a command is executed THEN the Terminal SHALL preserve the command text with its `>` prompt in the scrollable history
2. WHEN viewing game history THEN the Terminal SHALL show each command prefixed with `>`
3. WHEN the game displays output THEN the Terminal SHALL show the command that triggered it above the output
