# Requirements Document

## Introduction

This document specifies the requirements for an exhaustive testing system for the Zork I rewrite. The system will systematically visit every room, interact with every object, and test all game mechanics to identify bugs and ensure completeness. The testing will be automated where possible and will maintain a comprehensive log of what has been tested and what issues were found.

## Glossary

- **Test Coverage**: The percentage of rooms, objects, and interactions that have been tested
- **Test Session**: A single run through a portion of the game testing
- **Bug Report**: A documented issue found during testing with reproduction steps
- **Test Log**: A persistent record of what has been tested and the results
- **Interaction Test**: Testing a specific action with a specific object (e.g., "take lamp", "open door")
- **Room Test**: Testing all aspects of a room including description, exits, and objects
- **Automated Test**: A test that runs without human intervention
- **Manual Test**: A test that requires human observation or judgment

## Requirements

### Requirement 1

**User Story:** As a developer, I want to systematically test every room in the game, so that I can ensure all rooms are accessible and properly implemented.

#### Acceptance Criteria

1. THE system SHALL maintain a list of all rooms in the game extracted from the room data
2. WHEN a room is tested THEN the system SHALL record the room ID, timestamp, and test results
3. THE system SHALL test that each room displays its description correctly
4. THE system SHALL test that all exits from each room work as expected
5. THE system SHALL identify rooms that cannot be reached from the starting location

### Requirement 2

**User Story:** As a developer, I want to test every object in the game, so that I can ensure all objects are properly implemented and accessible.

#### Acceptance Criteria

1. THE system SHALL maintain a list of all objects in the game extracted from the object data
2. WHEN an object is tested THEN the system SHALL record the object ID, location, and test results
3. THE system SHALL test basic interactions with each object (examine, take, drop)
4. THE system SHALL test object-specific actions based on object flags (open/close for containers, turn on/off for lights)
5. THE system SHALL identify objects that cannot be accessed or interacted with
6. WHEN an object has READBIT flag THEN the system SHALL verify the object has a text property with content
7. WHEN an object has CONTBIT flag THEN the system SHALL verify the object has a capacity property
8. THE system SHALL verify that opening containers reveals their contents
9. THE system SHALL verify that objects in open containers are accessible for interaction
10. THE system SHALL compare object text length against ZIL source to detect truncated content

### Requirement 3

**User Story:** As a developer, I want to test all verb-object combinations, so that I can ensure the parser and action handlers work correctly.

#### Acceptance Criteria

1. THE system SHALL test common verbs with each applicable object
2. WHEN an invalid verb-object combination is tested THEN the system SHALL verify an appropriate error message is displayed
3. THE system SHALL test multi-word commands (verb + direct object + preposition + indirect object)
4. THE system SHALL test pronoun resolution (IT, THEM, ALL)
5. THE system SHALL test abbreviations and synonyms

### Requirement 4

**User Story:** As a developer, I want to track which tests have been completed, so that I can resume testing from where I left off.

#### Acceptance Criteria

1. THE system SHALL persist test progress to a file after each test session
2. WHEN the system starts THEN the system SHALL load previous test progress if available
3. THE system SHALL display a summary of test coverage (percentage of rooms/objects tested)
4. THE system SHALL allow filtering to show only untested items
5. THE system SHALL allow resetting test progress to start fresh

### Requirement 5

**User Story:** As a developer, I want detailed bug reports for issues found, so that I can efficiently fix problems.

#### Acceptance Criteria

1. WHEN a bug is detected THEN the system SHALL create a bug report with reproduction steps
2. THE system SHALL categorize bugs by type (parser error, action error, missing content, etc.)
3. THE system SHALL include the game state at the time of the bug (room, inventory, flags)
4. THE system SHALL assign a severity level to each bug (critical, major, minor)
5. THE system SHALL track bug status (open, in progress, fixed, verified)

### Requirement 6

**User Story:** As a developer, I want to test puzzle mechanics, so that I can ensure all puzzles are solvable.

#### Acceptance Criteria

1. THE system SHALL test each puzzle's solution path
2. THE system SHALL verify that puzzle prerequisites are met before attempting solutions
3. THE system SHALL test that puzzles cannot be solved in incorrect ways
4. THE system SHALL verify that puzzle completion updates game state correctly
5. THE system SHALL test that puzzles can be solved in the correct order

### Requirement 7

**User Story:** As a developer, I want to test NPC interactions, so that I can ensure NPCs behave correctly.

#### Acceptance Criteria

1. THE system SHALL test combat with each NPC
2. THE system SHALL test giving items to NPCs
3. THE system SHALL test NPC movement and behavior patterns
4. THE system SHALL verify NPC state transitions (alive, unconscious, dead)
5. THE system SHALL test NPC-specific interactions (feeding cyclops, bribing troll)

### Requirement 8

**User Story:** As a developer, I want to test edge cases and error conditions, so that the game handles unexpected input gracefully.

#### Acceptance Criteria

1. THE system SHALL test actions in darkness
2. THE system SHALL test inventory limits and weight constraints
3. THE system SHALL test locked doors and containers
4. THE system SHALL test conditional exits under various conditions
5. THE system SHALL test invalid input and verify appropriate error messages

### Requirement 9

**User Story:** As a developer, I want automated tests where possible, so that testing is efficient and repeatable.

#### Acceptance Criteria

1. THE system SHALL provide automated test scripts for basic interactions
2. THE system SHALL execute test scripts and compare output to expected results
3. THE system SHALL generate test reports showing pass/fail status
4. THE system SHALL allow running specific test suites (rooms only, objects only, etc.)
5. THE system SHALL support regression testing after bug fixes

### Requirement 10

**User Story:** As a developer, I want a testing dashboard, so that I can visualize test progress and results.

#### Acceptance Criteria

1. THE system SHALL display overall test coverage percentage
2. THE system SHALL show a list of untested rooms and objects
3. THE system SHALL display a summary of bugs found by category
4. THE system SHALL show recently tested items
5. THE system SHALL provide export functionality for test results and bug reports

### Requirement 11

**User Story:** As a developer, I want to validate extracted data against the ZIL source, so that I can detect missing or incomplete content.

#### Acceptance Criteria

1. THE system SHALL compare object count in TypeScript data against ZIL source
2. THE system SHALL verify that all readable objects (READBIT) have complete text properties
3. THE system SHALL check that text properties match or exceed ZIL TEXT length
4. THE system SHALL verify that all containers (CONTBIT) have capacity values
5. THE system SHALL verify that all objects have required synonyms from ZIL SYNONYM declarations
6. THE system SHALL verify that all objects have adjectives from ZIL ADJECTIVE declarations
7. THE system SHALL verify that room descriptions match ZIL LDESC content
8. THE system SHALL detect truncated or missing longDescription fields in rooms
9. THE system SHALL verify that all treasures have correct treasureValue properties
10. THE system SHALL generate a report of data completeness issues with severity ratings
