# Project Structure

## Main Entry Point

**zork1.zil** - The main compilation file that includes all other modules in the correct order

## File Organization

### Core Game Files (Prefixed with 'g' for "generic")
These files contain the game engine and are shared across the Zork trilogy:

- **gmacros.zil** - Macro definitions used throughout the codebase
- **gsyntax.zil** - Syntax definitions for command parsing
- **gglobals.zil** - Global variable declarations
- **gmain.zil** - Main game loop and PERFORM routine
- **gparser.zil** - Natural language parser implementation
- **gverbs.zil** - Generic verb implementations
- **gclock.zil** - Game clock and timing system

### Zork I Specific Files (Prefixed with '1')
Game-specific content for Zork I:

- **1dungeon.zil** - Room definitions, objects, and world layout
- **1actions.zil** - Game-specific action handlers and responses

### Build Artifacts

- **COMPILED/** - Directory containing compiled game files
  - **zork1.z3** - The compiled Z-machine game file
- **zork1.chart** - Compilation statistics
- **zork1.errors** - Compilation error log
- **zork1.record** - Build record
- **zork1.serial** - Serial number for release tracking
- **zork1.zip** - Legacy compiled file (may not be buildable with modern tools)
- **zork1freq.xzap** - Frequency analysis data
- **parser.cmp** - Parser compilation artifact

## Code Conventions

### Naming Patterns

- **Global variables**: Begin with uppercase letters or use SETG
- **Constants**: Defined with CONSTANT, typically all caps
- **Parser globals**: Prefixed with `P-` (e.g., P-LEXV, P-ITBL)
- **Actions**: Prefixed with `ACT?` or `V?` (e.g., V?WALK, ACT?TELL)
- **Object properties**: Prefixed with `P?` (e.g., P?ACTION)
- **Word constants**: Prefixed with `W?` (e.g., W?THEN, W?PERIOD)

### File Inclusion Order

The main file (zork1.zil) includes files in this specific order:
1. GMACROS - Macro definitions first
2. GSYNTAX - Syntax definitions
3. 1DUNGEON - World and object definitions
4. GGLOBALS - Global variables
5. GCLOCK - Clock system
6. GMAIN - Main loop
7. GPARSER - Parser
8. GVERBS - Verb handlers
9. 1ACTIONS - Game-specific actions

This order is critical as later files depend on definitions from earlier ones.

### Code Style

- **S-expressions**: All code uses LISP-style parenthesized expressions
- **Angle brackets**: Used for special forms (e.g., `<ROUTINE>`, `<GLOBAL>`, `<SETG>`)
- **Comments**: Prefixed with semicolon `;` or enclosed in quotes `"comment"`
- **Indentation**: Nested expressions are indented for readability
