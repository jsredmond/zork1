# Design Document

## Overview

This design document outlines the architecture and implementation approach for rewriting Zork I from ZIL (Zork Implementation Language) to a modern, cross-platform application that runs natively on Mac and Windows. The rewrite will preserve all original game content, logic, and behavior while providing a maintainable codebase using modern programming practices.

The implementation will use TypeScript/Node.js for cross-platform compatibility, strong typing, and ease of maintenance. The architecture separates concerns into distinct modules: game state management, parser, command execution, object system, and I/O handling.

## Architecture

### High-Level Architecture

The system follows a layered architecture:

1. **I/O Layer**: Handles user input and output display (terminal interface)
2. **Parser Layer**: Converts natural language input into structured commands
3. **Command Execution Layer**: Processes parsed commands and updates game state
4. **Game State Layer**: Manages all game objects, rooms, and variables
5. **Persistence Layer**: Handles save/restore functionality

### Data Flow

```
User Input → Parser → Command Validator → Command Executor → Game State → Output Generator → Display
                                                    ↓
                                              Persistence (Save/Restore)
```

### Module Structure

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

## Components and Interfaces

### Parser Component

**Lexer Interface**:
```typescript
interface Token {
  word: string;
  type: TokenType;
  position: number;
}

interface Lexer {
  tokenize(input: string): Token[];
}
```

**Parser Interface**:
```typescript
interface ParsedCommand {
  verb: Verb;
  directObject?: GameObject;
  indirectObject?: GameObject;
  preposition?: string;
}

interface Parser {
  parse(tokens: Token[]): ParsedCommand | ParseError;
  resolvePronouns(command: ParsedCommand, context: GameState): ParsedCommand;
}
```

### Game State Component

**GameObject Interface**:
```typescript
interface GameObject {
  id: string;
  name: string;
  synonyms: string[];
  adjectives: string[];
  description: string;
  location: string | null;
  properties: Map<string, any>;
  flags: Set<ObjectFlag>;
  capacity?: number;
  size?: number;
  value?: number;
}

interface GameState {
  currentRoom: string;
  objects: Map<string, GameObject>;
  rooms: Map<string, Room>;
  globalVariables: Map<string, any>;
  inventory: string[];
  score: number;
  moves: number;
  flags: Map<string, boolean>;
}
```

**Room Interface**:
```typescript
interface Room {
  id: string;
  name: string;
  description: string;
  exits: Map<Direction, Exit>;
  objects: string[];
  visited: boolean;
  flags: Set<RoomFlag>;
}

interface Exit {
  destination: string;
  condition?: () => boolean;
  message?: string;
}
```

### Command Execution Component

**Action Handler Interface**:
```typescript
interface ActionResult {
  success: boolean;
  message: string;
  stateChanges: StateChange[];
}

interface ActionHandler {
  execute(command: ParsedCommand, state: GameState): ActionResult;
}
```

### Persistence Component

**Serializer Interface**:
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  state: SerializedGameState;
}

interface Serializer {
  serialize(state: GameState): string;
  deserialize(data: string): GameState;
  validate(data: string): boolean;
}
```

## Data Models

### Core Data Structures

**Object Flags** (from original ZIL):
- TAKEBIT: Object can be picked up
- CONTBIT: Object is a container
- OPENBIT: Container is open
- LIGHTBIT: Object provides light
- ONBIT: Light source is on
- WEAPONBIT: Object is a weapon
- ACTORBIT: Object is an actor/NPC
- DOORBIT: Object is a door
- BURNBIT: Object can burn
- FOODBIT: Object can be eaten
- DRINKBIT: Object can be drunk

**Room Flags**:
- RLANDBIT: Room is on land (vs water)
- ONBIT: Room is lit
- SACREDBIT: Room is sacred/special
- VEHBIT: Room is a vehicle

**Game Constants**:
- MAX_SCORE: 350
- MAX_INVENTORY_WEIGHT: 100
- LAMP_LIFETIME: Configurable

### Object Relationships

Objects maintain parent-child relationships through location:
- Objects can be IN rooms
- Objects can be IN other objects (containers)
- Objects can be ON surfaces
- Objects can be HELD by actors

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Game initialization consistency
*For any* fresh game start, the initial game state should match the original Zork I starting conditions (player in West of House, specific objects in specific locations, score at 0, moves at 0)
**Validates: Requirements 1.5**

### Property 2: Command execution completeness
*For any* valid command input, the system should parse the input and execute the corresponding game action without crashing
**Validates: Requirements 2.1**

### Property 3: Output correctness
*For any* command that produces output, the response text should match the original Zork I behavior for equivalent game states
**Validates: Requirements 2.2**

### Property 4: Invalid command handling
*For any* invalid or unrecognized command input, the system should display an appropriate error message rather than crashing or producing no output
**Validates: Requirements 2.3**

### Property 5: Parser multi-word support
*For any* valid multi-word command structure (verb + direct object + preposition + indirect object), the parser should correctly identify all components
**Validates: Requirements 2.5**

### Property 6: State transition consistency
*For any* action that modifies game state, all affected state components (object locations, flags, variables) should be updated consistently
**Validates: Requirements 3.1, 3.5**

### Property 7: Movement state updates
*For any* valid movement command, the player location should update and the new room description should be displayed
**Validates: Requirements 3.2**

### Property 8: Object location round-trip
*For any* takeable object, taking it then dropping it should result in the object being in the current room (not necessarily the original room)
**Validates: Requirements 3.3, 3.4**

### Property 9: Save/restore round-trip
*For any* game state, saving then immediately restoring should produce an equivalent game state with all objects, flags, and variables preserved
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 10: Save file validation
*For any* save file with invalid format or corrupted data, the restore operation should reject it with an error message and preserve the current game state
**Validates: Requirements 4.4**

### Property 11: Action sequence equivalence
*For any* sequence of valid commands, the resulting game state and output should match what the original Zork I would produce for the same sequence
**Validates: Requirements 5.4, 5.5**

### Property 12: Parser article handling
*For any* command containing articles (THE, A, AN), removing the articles should produce the same parse result
**Validates: Requirements 6.1**

### Property 13: Pronoun resolution
*For any* pronoun (IT, THEM) used in a command, the pronoun should resolve to the most recently mentioned applicable object(s)
**Validates: Requirements 6.3**

### Property 14: Ambiguity detection
*For any* command with ambiguous object references, the system should request clarification rather than guessing
**Validates: Requirements 6.4**

### Property 15: Display consistency
*For any* game object or room, examining or entering it should display its associated description text
**Validates: Requirements 7.1, 7.2**

### Property 16: Error message informativeness
*For any* impossible or invalid action, the system should provide a specific error message explaining why the action cannot be performed
**Validates: Requirements 7.3**

### Property 17: Error resilience
*For any* unexpected state or error condition (including file I/O failures), the system should handle it gracefully without crashing and maintain game stability
**Validates: Requirements 10.3, 10.4, 10.5**

## Error Handling

### Error Categories

1. **Parse Errors**: Unknown words, invalid syntax, ambiguous references
2. **Action Errors**: Impossible actions, missing objects, locked containers
3. **State Errors**: Invalid state transitions, constraint violations
4. **I/O Errors**: File read/write failures, invalid save files
5. **System Errors**: Out of memory, unexpected exceptions

### Error Handling Strategy

- All errors should be caught and handled gracefully
- User-facing errors should provide clear, helpful messages
- System errors should be logged for debugging
- The game should never crash; it should always return to the command prompt
- Invalid save files should not corrupt the current game state

### Error Messages

Error messages should follow the original Zork I style:
- Conversational and sometimes humorous
- Informative about what went wrong
- Consistent with the game's tone

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Individual parser functions (tokenization, word lookup, syntax matching)
- Object manipulation functions (take, drop, move)
- State serialization/deserialization
- Room navigation logic
- Specific verb implementations

Unit tests should cover:
- Normal cases with valid inputs
- Edge cases (empty inventory, full containers, locked doors)
- Error conditions (invalid objects, impossible actions)

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using a property-based testing library (fast-check for TypeScript).

**Testing Framework**: fast-check (https://github.com/dubzzz/fast-check)

**Configuration**: Each property-based test should run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Tagging**: Each property-based test must include a comment tag in this exact format:
```typescript
// Feature: modern-zork-rewrite, Property N: [property text]
```

**Property Implementation**: Each correctness property listed above must be implemented by a single property-based test. Multiple properties should not be combined into one test, and one property should not be split across multiple tests.

**Generators**: Custom generators will be needed for:
- Valid command strings
- Game states
- Object configurations
- Room layouts
- Command sequences

**Example Property Test Structure**:
```typescript
// Feature: modern-zork-rewrite, Property 9: Save/restore round-trip
it('should preserve game state through save/restore cycle', () => {
  fc.assert(
    fc.property(gameStateGenerator(), (state) => {
      const saved = serializer.serialize(state);
      const restored = serializer.deserialize(saved);
      expect(restored).toEqual(state);
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- Complete command execution flow (input → parse → execute → output)
- Multi-step puzzle solutions
- Save/restore functionality
- Cross-module interactions

### Regression Testing

A suite of regression tests will verify that the rewrite produces identical behavior to the original Zork I:
- Transcript comparison: Run identical command sequences and compare outputs
- State comparison: Verify game state matches at checkpoints
- Puzzle verification: Ensure all puzzles can be solved with original solutions

## Implementation Notes

### Porting Strategy

1. **Content First**: Port all static content (room descriptions, object descriptions, text)
2. **Core Systems**: Implement parser, game state, and basic verbs
3. **Object System**: Implement object properties, flags, and relationships
4. **Verbs and Actions**: Port all verb implementations
5. **Special Cases**: Handle special rooms, puzzles, and NPCs
6. **Polish**: Add save/restore, scoring, and final touches

### ZIL to TypeScript Mapping

- ZIL objects → TypeScript classes/interfaces
- ZIL properties → TypeScript object properties
- ZIL flags → TypeScript Set<Flag>
- ZIL routines → TypeScript functions
- ZIL global variables → TypeScript module-level variables or state properties

### Preserving Original Behavior

To ensure the rewrite matches the original:
- Extract all text strings from ZIL source
- Document all object properties and initial states
- Map all room connections and conditional exits
- Catalog all verb behaviors and special cases
- Test against known game transcripts

### Cross-Platform Considerations

- Use Node.js for cross-platform compatibility
- Use platform-agnostic file paths (path module)
- Handle line endings consistently (CRLF vs LF)
- Test on both Mac and Windows
- Package as standalone executables using pkg or similar

### Performance Considerations

- Parser should handle input in < 100ms
- State updates should be immediate
- Save/restore should complete in < 1 second
- Memory usage should remain under 100MB

## Future Enhancements

Potential enhancements beyond the initial rewrite:
- Graphical interface option
- Hint system
- Undo/redo functionality
- Transcript recording
- Multiple save slots
- Accessibility features (screen reader support)

These enhancements are out of scope for the initial rewrite but should be considered in the architecture design.
