# Implementation Plan

**IMPORTANT - Running Tests:**
- The package.json already includes `--run` in the test script
- Use: `npm test` or `npx vitest run <file-path>`
- **NEVER use:** `npm test -- --run` (causes duplicate flag error)

- [x] 1. Set up project structure and development environment
  - Create TypeScript project with Node.js
  - Configure tsconfig.json for strict type checking
  - Set up package.json with dependencies (fast-check for property testing)
  - Create directory structure (src/io, src/parser, src/game, src/engine, src/persistence)
  - Set up testing framework (Jest or Vitest)
  - _Requirements: 8.2, 8.3_

- [x] 2. Extract and organize game content from ZIL source
  - Extract all room descriptions and properties from 1dungeon.zil
  - Extract all object definitions and properties
  - Extract all text strings and messages
  - Create data files or constants for game content
  - Document object flags and their meanings
  - _Requirements: 5.1, 5.2, 9.4_

- [x] 3. Implement core data models
  - [x] 3.1 Create GameObject interface and class
    - Define object properties (id, name, synonyms, adjectives, description, location, flags, capacity, size, value)
    - Implement object flag system using TypeScript Set
    - _Requirements: 3.5, 5.2_
  
  - [x] 3.2 Create Room interface and class
    - Define room properties (id, name, description, exits, objects, visited, flags)
    - Implement conditional exits
    - _Requirements: 5.1_
  
  - [x] 3.3 Create GameState class
    - Define state properties (currentRoom, objects, rooms, globalVariables, inventory, score, moves, flags)
    - Implement state initialization
    - _Requirements: 1.5, 3.1_
  
  - [x] 3.4 Write property test for game initialization
    - **Property 1: Game initialization consistency**
    - **Validates: Requirements 1.5**

- [x] 4. Implement lexer and tokenizer
  - [x] 4.1 Create Token interface and TokenType enum
    - Define token types (VERB, NOUN, ADJECTIVE, PREPOSITION, ARTICLE, etc.)
    - _Requirements: 2.1_
  
  - [x] 4.2 Implement Lexer class
    - Tokenize input string into array of tokens
    - Handle whitespace and punctuation
    - Convert to lowercase for case-insensitive matching
    - _Requirements: 2.1_
  
  - [x] 4.3 Write unit tests for lexer
    - Test tokenization of simple commands
    - Test handling of punctuation and special characters
    - Test case insensitivity
    - _Requirements: 2.1_

- [x] 5. Implement vocabulary and word lookup
  - [x] 5.1 Create Vocabulary class
    - Load verb definitions from ZIL source (gverbs.zil)
    - Load noun synonyms and adjectives from object definitions
    - Load prepositions from ZIL source (gsyntax.zil)
    - Implement word lookup by type
    - _Requirements: 2.4, 6.5_
  
  - [x] 5.2 Implement abbreviation expansion
    - Map common abbreviations (N→NORTH, I→INVENTORY, X→EXAMINE)
    - _Requirements: 6.5_
  
  - [x] 5.3 Write unit tests for vocabulary
    - Test word lookup for verbs, nouns, adjectives
    - Test abbreviation expansion
    - Test unknown word handling
    - _Requirements: 2.4, 6.5_

- [-] 6. Implement parser
  - [x] 6.1 Create ParsedCommand interface
    - Define command structure (verb, directObject, indirectObject, preposition)
    - _Requirements: 2.1, 2.5_
  
  - [x] 6.2 Implement Parser class
    - Parse tokens into structured commands
    - Identify verb, objects, and prepositions
    - Handle multi-word object names
    - _Requirements: 2.1, 2.5_
  
  - [x] 6.3 Implement article filtering
    - Remove articles (THE, A, AN) from parsed commands
    - _Requirements: 6.1_
  
  - [x] 6.4 Write property test for article handling
    - **Property 12: Parser article handling**
    - **Validates: Requirements 6.1**
  
  - [x] 6.5 Implement pronoun resolution
    - Track last mentioned object for IT/THEM resolution
    - Resolve pronouns to actual objects
    - _Requirements: 6.3_
  
  - [x] 6.6 Write property test for pronoun resolution
    - **Property 13: Pronoun resolution**
    - **Validates: Requirements 6.3**
  
  - [x] 6.7 Implement ambiguity detection
    - Detect when object references are ambiguous
    - Generate clarification requests
    - _Requirements: 6.4_
  
  - [x] 6.8 Write property test for ambiguity detection
    - **Property 14: Ambiguity detection**
    - **Validates: Requirements 6.4**
  
  - [x] 6.9 Write property test for multi-word parsing
    - **Property 5: Parser multi-word support**
    - **Validates: Requirements 2.5**
  
  - [x] 6.10 Write unit tests for parser
    - Test parsing of various command structures
    - Test error handling for invalid syntax
    - _Requirements: 2.1, 2.3_

- [x] 7. Implement object system and inventory management
  - [x] 7.1 Implement object location tracking
    - Track object parent-child relationships
    - Implement IN, ON, HELD relationships
    - _Requirements: 3.5_
  
  - [x] 7.2 Implement TAKE action
    - Check if object is takeable (TAKEBIT flag)
    - Check weight/capacity constraints
    - Move object to player inventory
    - _Requirements: 3.3_
  
  - [x] 7.3 Implement DROP action
    - Remove object from inventory
    - Place object in current room
    - _Requirements: 3.4_
  
  - [x] 7.4 Write property test for object location round-trip
    - **Property 8: Object location round-trip**
    - **Validates: Requirements 3.3, 3.4**
  
  - [x] 7.5 Implement INVENTORY command
    - List all objects in player inventory
    - Display "empty-handed" message if inventory is empty
    - _Requirements: 7.5_
  
  - [x] 7.6 Write unit tests for inventory management
    - Test taking and dropping objects
    - Test weight limits
    - Test inventory display
    - _Requirements: 3.3, 3.4, 7.5_

- [x] 8. Implement room navigation
  - [x] 8.1 Implement movement commands
    - Handle directional commands (NORTH, SOUTH, EAST, WEST, UP, DOWN, IN, OUT)
    - Check exit validity and conditions
    - Update player location
    - _Requirements: 3.2_
  
  - [x] 8.2 Implement room description display
    - Display room name and description on entry
    - Handle visited/unvisited room descriptions
    - List visible objects in room
    - _Requirements: 7.1_
  
  - [x] 8.3 Write property test for movement state updates
    - **Property 7: Movement state updates**
    - **Validates: Requirements 3.2**
  
  - [x] 8.4 Write unit tests for navigation
    - Test valid movements
    - Test blocked exits
    - Test conditional exits
    - _Requirements: 3.2, 7.1_

- [x] 9. Implement basic verb actions
  - [x] 9.1 Implement EXAMINE verb
    - Display object detailed descriptions
    - Handle examining rooms and objects
    - _Requirements: 2.4, 7.2_
  
  - [x] 9.2 Implement OPEN/CLOSE verbs
    - Check if object is a container or door
    - Toggle OPENBIT flag
    - Display appropriate messages
    - _Requirements: 2.4_
  
  - [x] 9.3 Implement READ verb
    - Display text property of readable objects
    - _Requirements: 2.4_
  
  - [x] 9.4 Implement LOOK verb
    - Redisplay current room description
    - _Requirements: 2.4, 7.1_
  
  - [x] 9.5 Write property test for display consistency
    - **Property 15: Display consistency**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 9.6 Write unit tests for basic verbs
    - Test each verb with valid and invalid objects
    - Test error messages
    - _Requirements: 2.4_

- [x] 10. Implement command execution engine
  - [x] 10.1 Create ActionHandler interface
    - Define execute method signature
    - Define ActionResult structure
    - _Requirements: 2.1_
  
  - [x] 10.2 Implement CommandExecutor class
    - Route parsed commands to appropriate action handlers
    - Handle verb-specific logic
    - Update game state based on action results
    - _Requirements: 2.1, 3.1_
  
  - [x] 10.3 Implement error handling
    - Catch and handle all exceptions gracefully
    - Display user-friendly error messages
    - Maintain game stability on errors
    - _Requirements: 2.3, 10.3_
  
  - [x] 10.4 Write property test for command execution completeness
    - **Property 2: Command execution completeness**
    - **Validates: Requirements 2.1**
  
  - [x] 10.5 Write property test for invalid command handling
    - **Property 4: Invalid command handling**
    - **Validates: Requirements 2.3**
  
  - [x] 10.6 Write property test for state transition consistency
    - **Property 6: State transition consistency**
    - **Validates: Requirements 3.1, 3.5**
  
  - [x] 10.7 Write property test for error resilience
    - **Property 17: Error resilience**
    - **Validates: Requirements 10.3, 10.4, 10.5**

- [ ] 11. Implement serialization and persistence
  - [x] 11.1 Create Serializer class
    - Implement serialize method to convert GameState to JSON
    - Implement deserialize method to restore GameState from JSON
    - Include version information in save format
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 11.2 Implement save file validation
    - Validate JSON structure
    - Check version compatibility
    - Detect corrupted data
    - _Requirements: 4.4_
  
  - [x] 11.3 Implement SAVE command
    - Prompt for filename
    - Serialize current game state
    - Write to file
    - Handle file I/O errors
    - _Requirements: 4.1_
  
  - [x] 11.4 Implement RESTORE command
    - Prompt for filename
    - Read and validate save file
    - Deserialize game state
    - Handle file I/O errors and invalid files
    - _Requirements: 4.2, 4.4, 4.5_
  
  - [x] 11.5 Write property test for save/restore round-trip
    - **Property 9: Save/restore round-trip**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [x] 11.6 Write property test for save file validation
    - **Property 10: Save file validation**
    - **Validates: Requirements 4.4**
  
  - [x] 11.7 Write unit tests for serialization
    - Test serialization of various game states
    - Test deserialization
    - Test error handling for corrupted files
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 12. Implement terminal I/O
  - [ ] 12.1 Create Terminal class
    - Implement readline-based input
    - Implement formatted output
    - Handle CTRL+C gracefully
    - _Requirements: 1.4_
  
  - [ ] 12.2 Implement main game loop
    - Display prompt
    - Read user input
    - Pass to parser and executor
    - Display results
    - Repeat until QUIT
    - _Requirements: 1.1, 1.2, 2.1_
  
  - [ ] 12.3 Write integration tests for I/O
    - Test complete input/output cycle
    - Test game loop
    - _Requirements: 1.4, 2.1_

- [ ] 13. Port all remaining verbs from gverbs.zil
  - [ ] 13.1 Implement container verbs (PUT, REMOVE)
    - Handle putting objects in containers
    - Check capacity constraints
    - _Requirements: 2.4, 2.5_
  
  - [ ] 13.2 Implement light source verbs (TURN ON, TURN OFF)
    - Toggle ONBIT flag for light sources
    - Update room lighting state
    - _Requirements: 2.4_
  
  - [ ] 13.3 Implement combat verbs (ATTACK, KILL)
    - Handle combat with NPCs
    - Port combat logic from ZIL
    - _Requirements: 2.4_
  
  - [ ] 13.4 Implement utility verbs (SCORE, QUIT, RESTART, VERBOSE, BRIEF)
    - Display score
    - Handle game exit
    - Handle game restart
    - Toggle verbosity modes
    - _Requirements: 2.4_
  
  - [ ] 13.5 Implement remaining verbs
    - Port all other verbs from gverbs.zil
    - Ensure complete verb coverage
    - _Requirements: 2.4_
  
  - [ ] 13.6 Write unit tests for all verbs
    - Test each verb implementation
    - Test error cases
    - _Requirements: 2.4_

- [ ] 14. Implement special game mechanics
  - [ ] 14.1 Implement thief behavior
    - Port thief AI from ZIL
    - Handle thief stealing items
    - Handle thief combat
    - _Requirements: 5.2, 5.3_
  
  - [ ] 14.2 Implement troll behavior
    - Port troll logic from ZIL
    - Handle troll blocking passages
    - _Requirements: 5.2, 5.3_
  
  - [ ] 14.3 Implement dam and flood control
    - Port dam puzzle logic
    - Handle water level changes
    - _Requirements: 5.3_
  
  - [ ] 14.4 Implement other special puzzles
    - Port remaining puzzle logic from ZIL
    - Ensure all puzzles are solvable
    - _Requirements: 5.3_
  
  - [ ] 14.5 Write integration tests for puzzles
    - Test each puzzle solution
    - Verify puzzle behavior matches original
    - _Requirements: 5.3, 9.5_

- [ ] 15. Implement scoring system
  - [ ] 15.1 Port scoring logic from ZIL
    - Assign point values to treasures
    - Track score changes
    - _Requirements: 5.5_
  
  - [ ] 15.2 Implement treasure scoring
    - Award points when treasures are placed in trophy case
    - Track which treasures have been scored
    - _Requirements: 5.5_
  
  - [ ] 15.3 Implement SCORE command
    - Display current score and rank
    - _Requirements: 5.5_
  
  - [ ] 15.4 Write property test for scoring correctness
    - **Property 11: Action sequence equivalence** (includes scoring)
    - **Validates: Requirements 5.4, 5.5**

- [ ] 16. Implement all rooms and objects
  - [ ] 16.1 Create all room instances
    - Instantiate all rooms from extracted data
    - Set up all exits and connections
    - _Requirements: 5.1_
  
  - [ ] 16.2 Create all object instances
    - Instantiate all objects from extracted data
    - Set initial locations and properties
    - _Requirements: 5.2_
  
  - [ ] 16.3 Verify content completeness
    - Check all rooms are present
    - Check all objects are present
    - Check all text matches original
    - _Requirements: 5.1, 5.2, 9.4_

- [ ] 17. Implement error messages and feedback
  - [ ] 17.1 Port all error messages from ZIL
    - Extract error messages from ZIL source
    - Implement context-appropriate error messages
    - _Requirements: 2.3, 7.3_
  
  - [ ] 17.2 Implement informative error messages
    - Provide specific reasons for action failures
    - Match original Zork I tone and style
    - _Requirements: 7.3_
  
  - [ ] 17.3 Write property test for error message informativeness
    - **Property 16: Error message informativeness**
    - **Validates: Requirements 7.3**

- [ ] 18. Cross-platform testing and packaging
  - [ ] 18.1 Test on macOS
    - Run full test suite on macOS
    - Test game functionality
    - Verify save/restore works
    - _Requirements: 1.1_
  
  - [ ] 18.2 Test on Windows
    - Run full test suite on Windows
    - Test game functionality
    - Verify save/restore works
    - _Requirements: 1.2_
  
  - [ ] 18.3 Package for distribution
    - Create standalone executables for Mac and Windows
    - Test packaged versions
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 19. Final verification and regression testing
  - [ ] 19.1 Run complete test suite
    - Ensure all unit tests pass
    - Ensure all property tests pass
    - Ensure all integration tests pass
    - _Requirements: All_
  
  - [ ] 19.2 Write property test for output correctness
    - **Property 3: Output correctness**
    - **Validates: Requirements 2.2**
  
  - [ ] 19.3 Perform transcript comparison testing
    - Run known command sequences
    - Compare output with original Zork I
    - Fix any discrepancies
    - _Requirements: 5.4, 9.4_
  
  - [ ] 19.4 Verify all puzzles are solvable
    - Test each puzzle solution
    - Ensure game is completable
    - _Requirements: 5.3, 9.5_
  
  - [ ] 19.5 Final playthrough
    - Complete full game playthrough
    - Verify all content is accessible
    - Check for any remaining bugs
    - _Requirements: All_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
