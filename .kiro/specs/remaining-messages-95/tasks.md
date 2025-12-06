# Implementation Plan: Remaining Messages to 95%

- [x] 1. Batch 1: Quick Wins (20 messages → 75%)
  - Implement simple messages with no conditional logic
  - Target: 696/929 messages (74.9%)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Implement BELL ring message
  - File: `src/game/puzzles.ts`
  - Message: "Ding, dong."
  - Context: BELL + RING action in LLD-ROOM
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Implement HOT-BELL messages
  - File: `src/game/specialBehaviors.ts`
  - Messages: "The heat from the bell is too intense." and "The water cools the bell and is evaporated."
  - Context: HOT-BELL interactions
  - _Requirements: 1.1, 1.2_

- [x] 1.3 Implement BOARDED-WINDOW message
  - File: `src/game/sceneryActions.ts`
  - Message: "The windows are boarded and can't be opened."
  - Context: BOARDED-WINDOW + OPEN action
  - _Requirements: 1.1, 1.2_

- [x] 1.4 Implement NAILS message
  - File: `src/game/sceneryActions.ts`
  - Message: "The nails, deeply imbedded in the door, cannot be removed."
  - Context: NAILS pseudo-object
  - _Requirements: 1.1, 1.2_

- [x] 1.5 Implement TROPHY-CASE message
  - File: `src/game/actions.ts`
  - Message: "The trophy case is securely fastened to the wall."
  - Context: TROPHY-CASE + TAKE/MOVE actions
  - _Requirements: 1.1, 1.2_

- [x] 1.6 Implement TRAP-DOOR closed message
  - File: `src/game/actions.ts`
  - Message: "It's closed."
  - Context: TRAP-DOOR when closed
  - _Requirements: 1.1, 1.2_

- [x] 1.7 Implement CELLAR trap door message
  - File: `src/game/rooms.ts` or `src/game/actions.ts`
  - Message: "The trap door crashes shut, and you hear someone barring it."
  - Context: Entering cellar triggers trap
  - _Requirements: 1.1, 1.2_

- [x] 1.8 Implement UP-CHIMNEY message
  - File: `src/game/actions.ts`
  - Message: "Going up empty-handed is a bad idea."
  - Context: Climbing chimney without rope
  - _Requirements: 1.1, 1.2_

- [x] 1.9 Implement remaining quick win messages (12 messages)
  - Various simple scenery and action messages
  - Files: `src/game/sceneryActions.ts`, `src/game/actions.ts`
  - _Requirements: 1.1, 1.2_

- [x] 1.10 Validate Batch 1
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~75% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 1.4, 1.5, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Batch 2: High-Priority Objects (10 messages → 76%)
  - Implement ROPE, BOTTLE, TRAP-DOOR messages
  - Target: 706/929 messages (76.0%)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Implement ROPE tie messages
  - File: `src/game/puzzles.ts`
  - Messages: Rope tying and climbing messages (4 messages)
  - Context: ROPE puzzle mechanics
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 2.2 Implement BOTTLE destruction messages
  - File: `src/game/specialBehaviors.ts`
  - Messages: Bottle breaking messages (3 messages)
  - Context: BOTTLE + THROW action
  - _Requirements: 2.1, 2.3, 2.5_

- [x] 2.3 Implement TRAP-DOOR state messages
  - File: `src/game/actions.ts`
  - Messages: Additional trap door messages (3 messages)
  - Context: Various trap door states
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 2.4 Validate Batch 2
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~76% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 2.5, 8.1, 8.2, 8.3, 8.4_

- [x] 3. Batch 3: Water & Containers (25 messages → 79%)
  - Implement water and container interaction messages
  - Target: 731/929 messages (78.7%)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Implement WATER in BOTTLE messages
  - File: `src/game/specialBehaviors.ts`
  - Messages: "It's in the bottle. Perhaps you should take that instead." and others (8 messages)
  - Context: WATER + BOTTLE interactions
  - _Requirements: 3.1, 3.5_

- [x] 3.2 Implement water evaporation messages
  - File: `src/game/specialBehaviors.ts`
  - Messages: "The water spills to the floor and evaporates immediately." and variations (5 messages)
  - Context: WATER + THROW/POUR actions
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 3.3 Implement container interaction messages
  - File: `src/game/actions.ts`
  - Messages: Container state and interaction messages (7 messages)
  - Context: Various container operations
  - _Requirements: 3.3, 3.5_

- [x] 3.4 Implement location-dependent water messages
  - File: `src/game/specialBehaviors.ts`
  - Messages: Water availability by location (5 messages)
  - Context: WATER object location checks
  - _Requirements: 3.2, 3.5_

- [x] 3.5 Validate Batch 3
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~79% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 3.5, 8.1, 8.2, 8.3, 8.4_

- [x] 4. Batch 4: Scenery Interactions (30 messages → 82%)
  - Implement scenery object messages
  - Target: 761/929 messages (81.9%)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.1 Implement WHITE-HOUSE messages
  - File: `src/game/sceneryActions.ts`
  - Messages: "You're not at the house." and "It's right here! Are you blind or something?" (2 messages)
  - Context: WHITE-HOUSE location checks
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 4.2 Implement FOREST messages
  - File: `src/game/sceneryActions.ts`
  - Messages: "The pines and the hemlocks seem to be murmuring." and others (3 messages)
  - Context: FOREST interactions
  - _Requirements: 4.1, 4.3, 4.5_

- [x] 4.3 Implement MOUNTAIN-RANGE messages
  - File: `src/game/sceneryActions.ts`
  - Messages: "Don't you believe me! The mountains are impassable!" and others (3 messages)
  - Context: MOUNTAIN-RANGE interactions
  - _Requirements: 4.1, 4.3, 4.5_

- [x] 4.4 Implement additional scenery objects
  - File: `src/game/sceneryActions.ts`
  - Messages: Various scenery interaction messages (22 messages)
  - Objects: CHIMNEY, WALLS, TREES, etc.
  - _Requirements: 4.1, 4.3, 4.5_

- [x] 4.5 Validate Batch 4
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~82% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 4.4, 4.5, 8.1, 8.2, 8.3, 8.4_

- [x] 5. Batch 5: Puzzle Messages (25 messages → 85%)
  - Implement puzzle-specific feedback messages
  - Target: 786/929 messages (84.6%)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.1 Implement BELL puzzle messages
  - File: `src/game/puzzles.ts`
  - Messages: Bell ringing and location messages (3 messages)
  - Context: BELL puzzle mechanics
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 5.2 Implement DAM/BOLT puzzle messages
  - File: `src/game/puzzles.ts`
  - Messages: Dam control messages (5 messages)
  - Context: DAM puzzle mechanics
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 5.3 Implement CYCLOPS puzzle messages
  - File: `src/engine/cyclops.ts`
  - Messages: Cyclops dialogue and interaction messages (5 messages)
  - Context: CYCLOPS encounter
  - _Requirements: 5.1, 5.2, 5.5_

- [x] 5.4 Implement BASKET/ROPE puzzle messages
  - File: `src/game/puzzles.ts`
  - Messages: Basket raising/lowering messages (5 messages)
  - Context: Basket puzzle mechanics
  - _Requirements: 5.1, 5.4, 5.5_

- [x] 5.5 Implement other puzzle messages
  - Files: Various puzzle files
  - Messages: Rainbow, machine, and other puzzle messages (7 messages)
  - Context: Various puzzle mechanics
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.6 Validate Batch 5
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~85% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 5.5, 8.1, 8.2, 8.3, 8.4_

- [x] 6. Batch 6: Conditional Messages Part 1 (30 messages → 88%)
  - Implement flag-dependent message variations
  - Target: 816/929 messages (87.8%)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.1 Implement flag-dependent room descriptions
  - File: `src/game/conditionalMessages.ts`
  - Messages: Room description variations based on flags (15 messages)
  - Context: WON_FLAG, LAMP_ON, etc.
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 6.2 Implement flag-dependent object descriptions
  - File: `src/game/conditionalMessages.ts`
  - Messages: Object description variations based on state (15 messages)
  - Context: Object state flags
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 6.3 Validate Batch 6
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~88% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 6.4, 6.5, 8.1, 8.2, 8.3, 8.4_

- [x] 7. Batch 7: Conditional Messages Part 2 (30 messages → 91%)
  - Implement time and multi-condition messages
  - Target: 846/929 messages (91.1%)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7.1 Implement time-dependent messages
  - File: `src/game/conditionalMessages.ts`
  - Messages: Lamp dimming, candle burning stages (15 messages)
  - Context: Time-based state changes
  - _Requirements: 6.2, 6.5_

- [x] 7.2 Implement multi-condition messages
  - File: `src/game/conditionalMessages.ts`
  - Messages: Complex conditional logic messages (15 messages)
  - Context: Multiple flag/state checks
  - _Requirements: 6.1, 6.3, 6.5_

- [x] 7.3 Validate Batch 7
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~91% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 6.4, 6.5, 8.1, 8.2, 8.3, 8.4_

- [x] 8. Batch 8: Generic & Error Messages (30 messages → 94%)
  - Implement generic variations and error messages
  - Target: 876/929 messages (94.3%)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8.1 Implement generic refusal messages
  - File: `src/game/errorMessages.ts`
  - Messages: "You can't do that." variations (15 messages)
  - Context: Invalid action attempts
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 8.2 Implement parser feedback variations
  - File: `src/game/errorMessages.ts`
  - Messages: Parser response variations (8 messages)
  - Context: Ambiguous or invalid input
  - _Requirements: 7.3, 7.5_

- [x] 8.3 Implement humorous responses
  - File: `src/game/errorMessages.ts`
  - Messages: Easter egg and silly command responses (7 messages)
  - Context: Unusual player commands
  - _Requirements: 7.4, 7.5_

- [x] 8.4 Validate Batch 8
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~94% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 7.5, 8.1, 8.2, 8.3, 8.4_

- [x] 9. Batch 9: Final Push to 95% (20 messages → 96%+)
  - Implement remaining high-value messages
  - Target: 896/929 messages (96.4%)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 9.1 Identify remaining high-value messages
  - Run: `npx tsx scripts/identify-next-messages.ts`
  - Select 20 highest-impact remaining messages
  - _Requirements: 9.1_

- [x] 9.2 Implement final message batch
  - Files: Various
  - Messages: Top 20 remaining messages
  - Context: Various scenarios
  - _Requirements: 9.1, 9.2_

- [x] 9.3 Validate 95% achievement
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ≥95% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 8.1, 8.2, 8.3, 8.4_

- [x] 9.4 Update documentation
  - Update final accuracy report
  - Update README
  - Update progress tracker
  - _Requirements: 9.5_

- [x] 9.5 Final verification
  - Run validation 3 times
  - Verify consistent 95%+ coverage
  - Verify zero regressions
  - _Requirements: 9.3, 9.4, 9.5, 8.4_
