# Requirements Document

## Introduction

This specification defines the requirements for achieving 99%+ behavioral parity between the TypeScript Zork I implementation and the original Z-Machine implementation. The current parity is ~70% with approximately 46-61 differences per 200 commands across test seeds. This spec targets the specific remaining differences identified through comprehensive analysis.

## Glossary

- **TypeScript_Implementation**: The modern TypeScript rewrite of Zork I located in `src/`
- **Z_Machine**: The original Infocom Z-Machine interpreter running `COMPILED/zork1.z3` via dfrotz
- **Parity_Score**: Percentage of commands producing identical output between implementations
- **Scenery_Object**: Non-takeable environmental objects (forest, house, board, window)
- **Object_Handler**: Per-object logic that produces specific error messages
- **Visibility_Rule**: Logic determining if an object can be referenced from a location
- **globalObjects**: Array of objects accessible from multiple locations

## Requirements

### Requirement 1: White House Object Handlers

**User Story:** As a player, I want white house interactions to match the original game exactly, so that the experience feels authentic.

#### Acceptance Criteria

1. WHEN a player tries to OPEN the white house, THE TypeScript_Implementation SHALL respond with "I can't see how to get in from here."
2. WHEN a player tries to TAKE the white house, THE TypeScript_Implementation SHALL respond with "An interesting idea..."
3. WHEN a player tries to PUSH the white house, THE TypeScript_Implementation SHALL respond with "You can't move the white house."
4. WHEN a player tries to PULL the white house, THE TypeScript_Implementation SHALL respond with "You can't move the white house."

### Requirement 2: Forest Object Handlers

**User Story:** As a player, I want forest interactions to match the original game exactly, so that error messages are consistent.

#### Acceptance Criteria

1. WHEN a player tries to TAKE the forest, THE TypeScript_Implementation SHALL respond with "What a concept!"
2. WHEN a player tries to PUSH the forest, THE TypeScript_Implementation SHALL respond with "Pushing the forest has no effect."
3. WHEN a player tries to PULL the forest, THE TypeScript_Implementation SHALL respond with "You can't move the forest."
4. WHEN a player tries to CLOSE the forest, THE TypeScript_Implementation SHALL respond with "You must tell me how to do that to a forest."

### Requirement 3: Board Object Handlers

**User Story:** As a player, I want board interactions to match the original game exactly.

#### Acceptance Criteria

1. WHEN a player tries to PULL the board, THE TypeScript_Implementation SHALL respond with "You can't move the board."
2. WHEN a player tries to PUSH the board, THE TypeScript_Implementation SHALL respond with "You can't move the board."

### Requirement 4: Boarded Window Visibility Rules

**User Story:** As a player, I want the boarded window to have correct visibility rules matching the original game.

#### Acceptance Criteria

1. WHEN a player references "boarded window" from WEST-OF-HOUSE, THE TypeScript_Implementation SHALL respond with "You can't see any boarded window here!"
2. THE boarded window SHALL only be visible from rooms where Z-Machine makes it visible
3. WHEN a player tries to TAKE the boarded window (when visible), THE TypeScript_Implementation SHALL respond with "You can't be serious."

### Requirement 5: Greeting Response Alignment

**User Story:** As a player, I want HELLO responses to match the original game's random selection.

#### Acceptance Criteria

1. WHEN a player types HELLO, THE TypeScript_Implementation SHALL randomly select from: "Hello.", "Good day.", "Nice weather we've been having lately."
2. WHEN using a fixed random seed, THE greeting selection SHALL match Z-Machine's selection for that seed

### Requirement 6: Parser Verb-Type Error Messages

**User Story:** As a player, I want parser errors to use the correct verb-type-specific format.

#### Acceptance Criteria

1. WHEN a player tries an invalid action on a scenery object, THE Parser SHALL respond with "You must tell me how to do that to a [object]." for applicable verbs
2. THE Parser SHALL use verb-specific error formats matching Z-Machine exactly

### Requirement 7: Object-Specific Handler Registry

**User Story:** As a developer, I want a centralized registry of object-specific handlers, so that parity fixes are maintainable.

#### Acceptance Criteria

1. THE TypeScript_Implementation SHALL maintain a registry mapping (object, verb) pairs to specific error messages
2. THE registry SHALL be checked BEFORE generic action handlers
3. THE registry SHALL be easily extensible for additional object/verb combinations

### Requirement 8: Visibility Check Priority

**User Story:** As a developer, I want visibility checks to occur in the correct order, so that error messages match Z-Machine.

#### Acceptance Criteria

1. THE action handlers SHALL check object visibility BEFORE checking scenery handlers
2. IF an object is not visible, THE handler SHALL return "You can't see any [object] here!" before any other error
3. THE visibility check SHALL respect room-specific visibility rules for globalObjects

### Requirement 9: Parity Validation

**User Story:** As a developer, I want automated validation confirming 99%+ parity across all test seeds.

#### Acceptance Criteria

1. THE Parity_Test_System SHALL achieve ≥99% parity on seed 12345
2. THE Parity_Test_System SHALL achieve ≥99% parity on seed 67890
3. THE Parity_Test_System SHALL achieve ≥99% parity on seed 54321
4. THE Parity_Test_System SHALL achieve ≥99% parity on seed 99999
5. THE Parity_Test_System SHALL achieve ≥99% parity on seed 11111
6. THE Parity_Test_System SHALL report specific differences for any failures

