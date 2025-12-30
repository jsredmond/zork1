# Implementation Plan: Parity Final Push

## Overview

This implementation plan targets the specific remaining differences to achieve 99%+ parity with the Z-Machine implementation. The approach is surgical - updating specific scenery handlers and visibility rules rather than architectural changes.

## Tasks

- [x] 1. Update White House scenery handler
  - Update `src/game/sceneryActions.ts` whiteHouseHandler
  - Add/fix OPEN, TAKE, PUSH, PULL handlers with exact Z-Machine messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Add OPEN handler for white house
  - Return "I can't see how to get in from here."
  - _Requirements: 1.1_

- [x] 1.2 Fix TAKE handler for white house
  - Change from "You can't take that!" to "What a concept!"
  - _Requirements: 1.2_

- [x] 1.3 Add PUSH handler for white house
  - Return "You can't move the white house."
  - _Requirements: 1.3_

- [x] 1.4 Add PULL handler for white house
  - Return "You can't move the white house."
  - _Requirements: 1.4_

- [x] 1.5 Write property test for white house handlers
  - **Property 1: White House Handler Messages**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 1.6 Commit to Git
  - Commit message: "fix: Update white house scenery handlers for Z-Machine parity"
  - Include sceneryActions.ts changes
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

---

- [x] 2. Update Forest scenery handler
  - Update `src/game/sceneryActions.ts` forestHandler
  - Add/fix TAKE, PUSH, PULL, CLOSE handlers with exact Z-Machine messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.1 Fix TAKE handler for forest
  - Change from "You can't be serious." to "What a concept!"
  - _Requirements: 2.1_

- [x] 2.2 Add PUSH handler for forest
  - Return "Pushing the forest has no effect."
  - _Requirements: 2.2_

- [x] 2.3 Add PULL handler for forest
  - Return "You can't move the forest."
  - _Requirements: 2.3_

- [x] 2.4 Add CLOSE handler for forest
  - Return "You must tell me how to do that to a forest."
  - _Requirements: 2.4_

- [x] 2.5 Write property test for forest handlers
  - **Property 2: Forest Handler Messages**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 2.6 Commit to Git
  - Commit message: "fix: Update forest scenery handlers for Z-Machine parity"
  - Include sceneryActions.ts changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

---

- [x] 3. Update Board scenery handler
  - Update `src/game/sceneryActions.ts` boardHandler
  - Add PULL, PUSH handlers with exact Z-Machine messages
  - _Requirements: 3.1, 3.2_

- [x] 3.1 Add PULL handler for board
  - Return "You can't move the board."
  - _Requirements: 3.1_

- [x] 3.2 Add PUSH handler for board
  - Return "You can't move the board."
  - _Requirements: 3.2_

- [x] 3.3 Write property test for board handlers
  - **Property 3: Board Handler Messages**
  - **Validates: Requirements 3.1, 3.2**

- [x] 3.4 Commit to Git
  - Commit message: "fix: Update board scenery handlers for Z-Machine parity"
  - Include sceneryActions.ts changes
  - _Requirements: 3.1, 3.2_

---

- [x] 4. Checkpoint - Validate scenery handler fixes
  - Run parity test with seed 12345
  - Verify white house, forest, board messages match Z-Machine
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

---

- [ ] 5. Fix boarded window visibility
  - Update visibility rules for BOARDED-WINDOW
  - Ensure not visible from WEST-OF-HOUSE
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5.1 Add visibility rule for boarded window
  - Update room definitions or visibility check logic
  - BOARDED-WINDOW should not be visible from WEST-OF-HOUSE
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 Fix TAKE handler for boarded window
  - Return "You can't be serious." when visible
  - _Requirements: 4.3_

- [ ] 5.3 Write property test for boarded window visibility
  - **Property 4: Boarded Window Visibility**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 5.4 Commit to Git
  - Commit message: "fix: Boarded window visibility rules for Z-Machine parity"
  - Include visibility rule changes
  - _Requirements: 4.1, 4.2, 4.3_

---

- [ ] 6. Align greeting responses
  - Update `src/game/data/messages.ts` getHelloMessage
  - Use seeded random to match Z-Machine greeting selection
  - _Requirements: 5.1, 5.2_

- [ ] 6.1 Update getHelloMessage function
  - Return one of: "Hello.", "Good day.", "Nice weather we've been having lately."
  - Use game state random for deterministic selection
  - _Requirements: 5.1, 5.2_

- [ ] 6.2 Write property test for greeting determinism
  - **Property 5: Greeting Determinism**
  - **Validates: Requirements 5.1, 5.2**

- [ ] 6.3 Commit to Git
  - Commit message: "fix: Greeting responses for Z-Machine parity"
  - Include messages.ts changes
  - _Requirements: 5.1, 5.2_

---

- [ ] 7. Add verb-type error messages for scenery
  - Update parser or action handlers for verb-type-specific errors
  - Add "You must tell me how to do that to a [object]." format
  - _Requirements: 6.1, 6.2_

- [ ] 7.1 Add verb-type error handling
  - For CLOSE on scenery objects, return verb-type-specific message
  - _Requirements: 6.1, 6.2_

- [ ] 7.2 Commit to Git
  - Commit message: "fix: Verb-type error messages for Z-Machine parity"
  - Include parser/action changes
  - _Requirements: 6.1, 6.2_

---

- [ ] 8. Ensure visibility check priority
  - Verify action handlers check visibility BEFORE scenery handlers
  - Fix any handlers that check scenery first
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8.1 Audit action handlers for visibility check order
  - Review TakeAction, OpenAction, PushAction, PullAction, CloseAction
  - Ensure visibility check comes first
  - _Requirements: 8.1, 8.2_

- [ ] 8.2 Write property test for visibility error priority
  - **Property 6: Visibility Error Priority**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [ ] 8.3 Commit to Git
  - Commit message: "fix: Visibility check priority for Z-Machine parity"
  - Include action handler changes
  - _Requirements: 8.1, 8.2, 8.3_

---

- [ ] 9. Checkpoint - Full parity validation
  - Run thorough parity tests with all 5 seeds
  - Verify parity percentage for each seed
  - Identify any remaining differences
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

---

- [ ] 10. Final validation and documentation
  - Run final parity tests across all seeds
  - Verify 99% parity achieved on all seeds
  - Update PARITY_STATUS.md with results
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 10.1 Run final multi-seed parity validation
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 12345`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 67890`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 54321`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 99999`
  - Execute: `npx tsx scripts/spot-test-parity.ts --thorough --seed 11111`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10.2 Update PARITY_STATUS.md
  - Document final parity percentages
  - List any remaining known differences
  - _Requirements: 9.6_

- [ ] 10.3 Final commit and tag
  - Commit message: "feat: Achieve 99%+ parity with Z-Machine implementation"
  - Tag: v1.0.0-parity-final
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation order prioritizes highest-impact fixes first (scenery handlers)
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

