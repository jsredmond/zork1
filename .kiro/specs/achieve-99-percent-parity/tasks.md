# Implementation Plan: Achieve 99% Parity

## Overview

This implementation plan systematically addresses each category of parity differences to achieve 99% behavioral parity with the Z-Machine implementation. Tasks are ordered by impact (highest-impact fixes first) and build incrementally on each other.

## Tasks

- [x] 1. Create ErrorMessageStandardizer for centralized Z-Machine message formats
  - Create new file `src/parity/ErrorMessageStandardizer.ts`
  - Define all standard Z-Machine error message templates
  - Export message generation functions for each error type
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 10.5_

- [x] 1.1 Implement core error message templates
  - Add UNKNOWN_WORD template: "I don't know the word 'X'."
  - Add OBJECT_NOT_VISIBLE template: "You can't see any X here!"
  - Add VERB_NEEDS_OBJECT templates for each verb
  - Add DONT_HAVE template: "You don't have that!"
  - Add CONTAINER_CLOSED template: "The X is closed."
  - _Requirements: 1.1, 1.2, 1.3, 7.1_

- [x] 1.2 Add scenery-specific error messages
  - Add "What a concept!" for taking abstract/large objects
  - Add "An interesting idea..." for taking impossible objects
  - Add "Your bare hands don't appear to be enough." for TURN without tools
  - Add "Pushing the X isn't notably helpful." for PUSH immovable
  - Add "You can't move the board." for PULL board
  - Add "I can't see how to get in from here." for OPEN white house
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 10.4_

- [x] 1.3 Write unit tests for ErrorMessageStandardizer
  - Test each message template produces correct format
  - Test message substitution works correctly
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3_

- [x] 1.4 Commit to Git
  - Commit message: "feat: Add ErrorMessageStandardizer for Z-Machine message parity"
  - Include all files from task 1
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 10.5_

---

- [x] 2. Create VocabularyAligner for Z-Machine vocabulary matching
  - Create new file `src/parity/VocabularyAligner.ts`
  - Define UNKNOWN_WORDS set with non-Z-Machine vocabulary
  - Implement vocabulary validation functions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.1 Implement unknown words detection
  - Add "room", "area", "place", "location", "spot", "zone", "region" to UNKNOWN_WORDS
  - Implement isZMachineWord() function
  - Implement getUnknownWordError() function
  - _Requirements: 3.1, 3.3_

- [x] 2.2 Implement synonym handling
  - Add synonym mappings matching Z-Machine (get=take, examine=look at, etc.)
  - Implement getCanonicalForm() function
  - _Requirements: 3.4_

- [x] 2.3 Write property test for vocabulary recognition
  - **Property 5: Vocabulary Recognition Consistency**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 2.4 Commit to Git
  - Commit message: "feat: Add VocabularyAligner for Z-Machine vocabulary parity"
  - Include all files from task 2
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

---

- [x] 3. Enhance ParserConsistencyEngine with error priority logic
  - Update `src/parity/ParserConsistencyEngine.ts`
  - Implement error message priority (unknown word > object not visible > action not possible)
  - Integrate with ErrorMessageStandardizer
  - _Requirements: 1.1, 1.2, 1.3, 3.3_

- [x] 3.1 Implement error priority logic
  - Add getParserErrorWithPriority() method
  - Check unknown word FIRST before object visibility
  - Return appropriate error based on priority
  - _Requirements: 1.1, 1.2, 3.3_

- [x] 3.2 Add verb-specific object requirement messages
  - Implement getVerbObjectRequirementError() for each verb
  - Use exact Z-Machine phrasing ("What do you want to drop?", etc.)
  - _Requirements: 1.3_

- [x] 3.3 Add whitespace and malformed input handling
  - Implement handleWhitespaceInput() returning "I beg your pardon?"
  - Implement handleMalformedInput() returning "I don't understand that sentence."
  - _Requirements: 1.5, 1.6_

- [x] 3.4 Write property tests for parser error messages
  - **Property 1: Error Message Priority**
  - **Property 2: Verb Object Requirement Messages**
  - **Property 3: Whitespace and Malformed Input Handling**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 1.6, 3.3**

- [x] 3.5 Commit to Git
  - Commit message: "feat: Enhance ParserConsistencyEngine with error priority logic"
  - Include all files from task 3
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 3.3_

---

- [x] 4. Enhance ObjectInteractionHarmonizer with scenery error messages
  - Update `src/parity/ObjectInteractionHarmonizer.ts`
  - Add scenery-specific error message mappings
  - Fix PUT possession error messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4.1 Add scenery error message mappings
  - Add SCENERY_ERROR_MAPPINGS array with object/verb/message tuples
  - Implement getSceneryError() method
  - Handle FOREST, WHITE-HOUSE, BOARD, and other scenery objects
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 4.2 Fix TURN/PUSH/PULL error messages
  - Update TURN error to "Your bare hands don't appear to be enough."
  - Update PUSH error to "Pushing the X isn't notably helpful."
  - Update PULL board error to "You can't move the board."
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 4.3 Fix PUT possession error messages
  - Change "You can't see any X here!" to "You don't have that!" for PUT
  - Implement isPossessionError() check
  - _Requirements: 2.6_

- [x] 4.4 Write property test for object action error messages
  - **Property 4: Object Action Error Messages**
  - **Validates: Requirements 2.2, 2.3, 2.6, 10.2, 10.3, 10.4, 10.5**

- [x] 4.5 Commit to Git
  - Commit message: "feat: Enhance ObjectInteractionHarmonizer with scenery error messages"
  - Include all files from task 4
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

---

- [x] 5. Checkpoint - Validate parser and object interaction parity
  - Run parity tests with seed 12345
  - Verify parser error messages match Z-Machine
  - Verify object interaction messages match Z-Machine
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2_

---

- [x] 6. Enhance StatusBarNormalizer for comprehensive contamination removal
  - Update `src/parity/StatusBarNormalizer.ts`
  - Add edge case handling (negative scores, long room names)
  - Ensure idempotent normalization
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.1 Add edge case status bar patterns
  - Handle negative scores in pattern matching
  - Handle room names exceeding 49 characters
  - Handle malformed status bar lines
  - _Requirements: 4.4_

- [x] 6.2 Ensure idempotent normalization
  - Verify normalizing already-normalized output produces identical result
  - Add validation for content preservation
  - _Requirements: 4.2_

- [x] 6.3 Write property test for status bar normalization
  - **Property 6: Status Bar Normalization Round-Trip**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 6.4 Commit to Git
  - Commit message: "feat: Enhance StatusBarNormalizer for comprehensive contamination removal"
  - Include all files from task 6
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

---

- [x] 7. Create DaemonTimingSynchronizer for timing alignment
  - Create new file `src/parity/DaemonTimingSynchronizer.ts`
  - Define timing constants from ZIL source
  - Implement timing synchronization functions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.1 Implement lamp timing constants
  - Add LAMP_WARN_1, LAMP_WARN_2, LAMP_DEAD constants from ZIL
  - Implement getLampWarningMessage() for each stage
  - _Requirements: 5.1_

- [x] 7.2 Implement candle timing constants
  - Add CANDLE_WARN_1, CANDLE_WARN_2, CANDLE_DEAD constants from ZIL
  - Implement getCandleWarningMessage() for each stage
  - _Requirements: 5.2_

- [x] 7.3 Implement thief and troll timing
  - Add THIEF_PROBABILITY constant from ZIL
  - Add TROLL_RECOVERY_INTERVAL constant from ZIL
  - Implement deterministic timing with seed
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 7.4 Write property test for deterministic daemon timing
  - **Property 7: Deterministic Random Events** (daemon portion)
  - **Validates: Requirements 5.3, 5.5**

- [x] 7.5 Commit to Git
  - Commit message: "feat: Add DaemonTimingSynchronizer for timing alignment"
  - Include all files from task 7
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

- [x] 8. Create AtmosphericMessageAligner for message alignment
  - Create new file `src/parity/AtmosphericMessageAligner.ts`
  - Define message probabilities from ZIL source
  - Implement deterministic message generation
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8.1 Implement message probability constants
  - Add FOREST_MESSAGE_PROBABILITY from ZIL
  - Add UNDERGROUND_MESSAGE_PROBABILITY from ZIL
  - Add location-specific message rules
  - _Requirements: 6.1, 6.4_

- [x] 8.2 Implement deterministic message generation
  - Implement getMessageForSeed() with deterministic selection
  - Ensure message text matches Z-Machine exactly
  - _Requirements: 6.2, 6.3_

- [x] 8.3 Write property test for deterministic atmospheric messages
  - **Property 7: Deterministic Random Events** (atmospheric portion)
  - **Validates: Requirements 6.1, 6.3, 6.4**

- [x] 8.4 Commit to Git
  - Commit message: "feat: Add AtmosphericMessageAligner for message alignment"
  - Include all files from task 8
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

---

- [x] 9. Checkpoint - Validate timing and atmospheric message parity
  - Run parity tests with multiple seeds
  - Verify daemon timing matches Z-Machine
  - Verify atmospheric messages match Z-Machine
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2_

---

- [x] 10. Fix container and inventory behavior
  - Update container error messages in actions.ts
  - Ensure inventory state tracking matches Z-Machine
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10.1 Fix container closed error messages
  - Update PUT to closed container: "The X is closed."
  - Update TAKE FROM closed container: "The X is closed."
  - _Requirements: 7.1, 7.2_

- [x] 10.2 Fix inventory full error message
  - Match Z-Machine inventory full message exactly
  - Ensure capacity limits match Z-Machine
  - _Requirements: 7.3, 7.4_

- [x] 10.3 Write property test for container/inventory state
  - **Property 8: Container and Inventory State Consistency**
  - **Validates: Requirements 7.1, 7.2, 7.4**

- [x] 10.4 Commit to Git
  - Commit message: "fix: Container and inventory behavior parity"
  - Include all files from task 10
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

---

- [x] 11. Fix ambiguity resolution messages
  - Update parser ambiguity handling
  - Match Z-Machine disambiguation prompt format
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 11.1 Fix two-object ambiguity format
  - Update to "Which X do you mean, the Y or the Z?" format
  - _Requirements: 8.1_

- [x] 11.2 Fix multi-object ambiguity format
  - Update to "Which X do you mean?" format for >2 objects
  - _Requirements: 8.2_

- [x] 11.3 Implement Z-Machine ambiguity resolution priority
  - Match Z-Machine object selection priority rules
  - _Requirements: 8.3_

- [x] 11.4 Write property test for ambiguity resolution
  - **Property 9: Ambiguity Resolution Consistency**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 11.5 Commit to Git
  - Commit message: "fix: Ambiguity resolution message parity"
  - Include all files from task 11
  - _Requirements: 8.1, 8.2, 8.3_

---

- [x] 12. Integrate parity modules into game engine
  - Wire ErrorMessageStandardizer into parser
  - Wire VocabularyAligner into parser
  - Wire ObjectInteractionHarmonizer into actions
  - Wire DaemonTimingSynchronizer into daemons
  - Wire AtmosphericMessageAligner into atmospheric messages
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1_

- [x] 12.1 Integrate parser parity modules
  - Update parser.ts to use ParserConsistencyEngine
  - Update parser.ts to use VocabularyAligner
  - Update parser.ts to use ErrorMessageStandardizer
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.3_

- [x] 12.2 Integrate action parity modules
  - Update actions.ts to use ObjectInteractionHarmonizer
  - Update actions.ts to use ErrorMessageStandardizer
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 12.3 Integrate daemon parity modules
  - Update daemons.ts to use DaemonTimingSynchronizer
  - Update atmosphericMessages.ts to use AtmosphericMessageAligner
  - _Requirements: 5.1, 5.2, 6.1, 6.2_

- [x] 12.4 Commit to Git
  - Commit message: "feat: Integrate parity modules into game engine"
  - Include all files from task 12
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1_

---

- [x] 13. Checkpoint - Full parity validation
  - Run thorough parity tests with all 5 seeds
  - Verify parity percentage for each seed
  - Identify any remaining differences
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2, 9.3_
  - **Results**: 66% parity with 68 differences identified
  - **Issues**: timing_difference (30), object_behavior (31), parser_difference (7)

---

- [x] 14. Fix remaining specific message differences
  - Address any remaining differences identified in checkpoint
  - Update specific messages to match Z-Machine exactly
  - _Requirements: 10.1, 10.5_

- [x] 14.1 Fix white house examination description
  - Match Z-Machine's exact description for examining white house
  - _Requirements: 10.1_

- [x] 14.2 Fix any remaining error message mismatches
  - Fixed TurnAction to return "Your bare hands don't appear to be enough."
  - Fixed TakeAllAction to include non-takeable objects with error messages
  - Added visibility checks before scenery handlers in action handlers
  - _Requirements: 10.5_

- [x] 14.3 Commit to Git
  - Commit message: "fix: Remaining specific message differences"
  - Include all files from task 14
  - _Requirements: 10.1, 10.5_

---

- [x] 15. Implement parity validation threshold enforcement
  - Update parity test system to enforce 99% threshold
  - Add regression detection
  - _Requirements: 9.4, 9.5_

- [x] 15.1 Add parity threshold validation
  - Implement validateParityThreshold() function
  - Fail tests if parity < 99% on any seed
  - _Requirements: 9.5_

- [x] 15.2 Add regression detection
  - Implement detectRegression() function
  - Compare before/after parity for changes
  - _Requirements: 9.4_

- [x] 15.3 Write property test for parity validation
  - **Property 10: Parity Validation Threshold**
  - **Validates: Requirements 9.4, 9.5**

- [x] 15.4 Commit to Git
  - Commit message: "feat: Implement parity validation threshold enforcement"
  - Include all files from task 15
  - _Requirements: 9.4, 9.5_

---

- [ ] 16. Final validation and documentation
  - Run final parity tests across all seeds
  - Verify 99% parity achieved on all seeds
  - Document any known remaining differences
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 16.1 Run final multi-seed parity validation
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 12345`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 67890`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 54321`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 99999`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 11111`
  - Verify all seeds achieve ≥99% parity
  - _Requirements: 9.1, 9.5_

- [ ] 16.2 Document remaining differences (if any)
  - Create PARITY_STATUS.md with current parity status
  - Document any known differences that cannot be fixed
  - _Requirements: 9.2, 9.3_

- [ ] 16.3 Final commit and tag
  - Commit message: "feat: Achieve 99% parity with Z-Machine implementation"
  - Tag: v1.0.0-99-percent-parity
  - _Requirements: 9.5_

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation order prioritizes highest-impact fixes first (parser errors, object interactions)
