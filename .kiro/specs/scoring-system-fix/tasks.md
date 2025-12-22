# Implementation Plan: Scoring System Fix

## Overview

This implementation plan fixes and completes the scoring system to achieve 100% parity with the original Zork I. The work is organized into phases: core scoring updates, integration with game actions, and testing.

## Tasks

- [x] 1. Update Core Scoring Module
  - Update `src/game/scoring.ts` with corrected values and new functions
  - _Requirements: 1.1, 2.1-2.16, 3.1, 7.1, 7.2_

- [x] 1.1 Fix treasure values (TVALUE)
  - Update TREASURE_VALUES constant with correct values from ZIL
  - Add BROKEN-EGG (2) and BROKEN-CANARY (1) treasures
  - Correct: EMERALD (10), BAG-OF-COINS (5), PAINTING (6), SCEPTRE (6), COFFIN (15), TORCH (6), TRUNK (5)
  - _Requirements: 1.1_

- [x] 1.2 Add action points constants and scoreAction function
  - Add ACTION_VALUES constant with all action point values
  - Implement scoreAction() function with one-time-only tracking
  - Use Set<string> stored in globalVariables for tracking
  - _Requirements: 2.1-2.16, 7.3_

- [x] 1.3 Add death penalty function
  - Implement applyDeathPenalty() function
  - Ensure score never goes below 0
  - _Requirements: 3.1, 3.2_

- [x] 1.4 Update score calculation
  - Add getBaseScore(), setBaseScore(), addToBaseScore() to GameState
  - Implement calculateTotalScore() and calculateTreasureScore()
  - Update score property to use calculateTotalScore()
  - _Requirements: 7.1, 7.2_

- [x] 1.5 Add win condition check
  - Implement checkWinCondition() function
  - Add WON_FLAG to GlobalFlags
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 1.6 Write property tests for core scoring
  - **Property 1: Treasure scoring idempotence**
  - **Property 2: Rank calculation correctness**
  - **Property 3: Death penalty application**
  - **Property 5: Action scoring idempotence**
  - **Property 6: Max score invariant**
  - **Validates: Requirements 1.2, 1.3, 3.1, 3.2, 4.3, 7.1, 7.2, 7.3, 7.4**

- [x] 1.7 Commit to Git
  - Commit message: "feat: Update core scoring module with correct values and functions"
  - Include src/game/scoring.ts, src/game/state.ts
  - _Requirements: 1.1, 2.1-2.16, 3.1, 7.1, 7.2_

---

- [ ] 2. Integrate Room Entry Scoring
  - Add scoring hooks for room entry events
  - _Requirements: 2.1, 2.2, 2.11, 2.12, 2.16_

- [ ] 2.1 Add Kitchen/Living Room entry scoring
  - In MoveAction, call scoreAction('ENTER_KITCHEN') when entering KITCHEN or LIVING-ROOM
  - Only award points on first entry
  - _Requirements: 2.1_

- [ ] 2.2 Add Cellar entry scoring
  - In MoveAction, call scoreAction('ENTER_CELLAR') when entering CELLAR
  - _Requirements: 2.2_

- [ ] 2.3 Add Treasure Room entry scoring
  - In MoveAction, call scoreAction('ENTER_TREASURE_ROOM') when entering TREASURE-ROOM
  - _Requirements: 2.12_

- [ ] 2.4 Add Hades entry scoring
  - In MoveAction, call scoreAction('ENTER_HADES') when entering HADES
  - Only after exorcism is complete
  - _Requirements: 2.11_

- [ ] 2.5 Add Lower Shaft lit entry scoring
  - In MoveAction, call scoreAction('ENTER_LOWER_SHAFT_LIT') when entering LOWER-SHAFT with light
  - _Requirements: 2.16_

- [ ] 2.6 Write unit tests for room entry scoring
  - Test each room awards correct points on first entry
  - Test no points on subsequent entries
  - _Requirements: 2.1, 2.2, 2.11, 2.12, 2.16_

- [ ] 2.7 Commit to Git
  - Commit message: "feat: Add room entry scoring"
  - Include src/game/actions.ts
  - _Requirements: 2.1, 2.2, 2.11, 2.12, 2.16_

---

- [ ] 3. Integrate Combat Victory Scoring
  - Add scoring hooks for defeating enemies
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 3.1 Add Troll defeat scoring
  - In troll combat resolution, call scoreAction('DEFEAT_TROLL')
  - _Requirements: 2.3_

- [ ] 3.2 Add Thief defeat scoring
  - In thief combat resolution, call scoreAction('DEFEAT_THIEF')
  - _Requirements: 2.4_

- [ ] 3.3 Add Cyclops defeat scoring
  - In cyclops puzzle resolution (ODYSSEUS/ULYSSES), call scoreAction('DEFEAT_CYCLOPS')
  - _Requirements: 2.5_

- [ ] 3.4 Write unit tests for combat scoring
  - Test each enemy defeat awards correct points
  - Test no points on re-defeat (if applicable)
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 3.5 Commit to Git
  - Commit message: "feat: Add combat victory scoring"
  - Include src/engine/troll.ts, src/engine/thief.ts, src/engine/cyclops.ts
  - _Requirements: 2.3, 2.4, 2.5_

---

- [ ] 4. Integrate Puzzle Completion Scoring
  - Add scoring hooks for puzzle solutions
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 2.13, 2.14, 2.15_

- [ ] 4.1 Add dam puzzle scoring
  - In DamPuzzle.raiseDam(), call scoreAction('RAISE_DAM')
  - In DamPuzzle.lowerDam(), call scoreAction('LOWER_DAM')
  - _Requirements: 2.14, 2.15_

- [ ] 4.2 Add rainbow puzzle scoring
  - In RainbowPuzzle.waveSceptre(), call scoreAction('WAVE_SCEPTRE')
  - _Requirements: 2.9_

- [ ] 4.3 Add exorcism puzzle scoring
  - In BellPuzzle or exorcism handler, call scoreAction('COMPLETE_EXORCISM')
  - _Requirements: 2.10_

- [ ] 4.4 Add machine puzzle scoring
  - When coal is put in machine, call scoreAction('PUT_COAL_IN_MACHINE')
  - When machine is turned on, call scoreAction('TURN_ON_MACHINE')
  - _Requirements: 2.7, 2.8_

- [ ] 4.5 Add boat inflation scoring
  - In BoatPuzzle.inflate(), call scoreAction('INFLATE_BOAT')
  - _Requirements: 2.13_

- [ ] 4.6 Add egg opening scoring
  - When egg is successfully opened, call scoreAction('OPEN_EGG')
  - _Requirements: 2.6_

- [ ] 4.7 Write unit tests for puzzle scoring
  - Test each puzzle awards correct points
  - Test no points on re-completion
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 2.13, 2.14, 2.15_

- [ ] 4.8 Commit to Git
  - Commit message: "feat: Add puzzle completion scoring"
  - Include src/game/puzzles.ts
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 2.13, 2.14, 2.15_

---

- [ ] 5. Integrate Death Penalty
  - Add death penalty to death handling
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5.1 Add death penalty to death handler
  - In death.ts handlePlayerDeath(), call applyDeathPenalty()
  - Ensure penalty is applied before resurrection
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5.2 Write unit tests for death penalty
  - Test penalty reduces score by 10
  - Test score doesn't go below 0
  - Test resurrection doesn't restore points
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5.3 Commit to Git
  - Commit message: "feat: Add death penalty to scoring"
  - Include src/game/death.ts
  - _Requirements: 3.1, 3.2, 3.3_

---

- [ ] 6. Update Save/Restore for Scoring
  - Ensure scoring state is properly serialized
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6.1 Update serializer for scoring state
  - Add baseScore to serialized state
  - Add scoredActions Set (as array) to serialized state
  - Add wonFlag to serialized state
  - _Requirements: 5.1_

- [ ] 6.2 Update deserializer for scoring state
  - Restore baseScore from saved state
  - Restore scoredActions Set from saved array
  - Restore wonFlag from saved state
  - _Requirements: 5.2_

- [ ] 6.3 Write property test for save/restore round-trip
  - **Property 4: Save/restore round-trip**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 6.4 Commit to Git
  - Commit message: "feat: Update save/restore for scoring state"
  - Include src/persistence/serializer.ts
  - _Requirements: 5.1, 5.2, 5.3_

---

- [ ] 7. Update Score Display
  - Ensure SCORE command shows correct information
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7.1 Update ScoreAction to use calculateTotalScore
  - Ensure displayed score matches calculated total
  - _Requirements: 4.1, 4.2_

- [ ] 7.2 Fix rank thresholds
  - Update getRank() to match original ZIL thresholds exactly
  - Boundary: 25 is Beginner, 26 is Amateur Adventurer
  - _Requirements: 4.3_

- [ ] 7.3 Write unit tests for score display
  - Test score format matches original
  - Test all rank boundaries
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7.4 Commit to Git
  - Commit message: "feat: Update score display and rank calculation"
  - Include src/game/actions.ts, src/game/scoring.ts
  - _Requirements: 4.1, 4.2, 4.3_

---

- [ ] 8. Checkpoint - Verify All Tests Pass
  - Ensure all tests pass, ask the user if questions arise.
  - Run full test suite to verify scoring system
  - _Requirements: All_

---

- [ ] 9. Final Integration Testing
  - End-to-end verification of scoring system
  - _Requirements: All_

- [ ] 9.1 Verify treasure scoring matches original
  - Test placing all treasures awards correct total
  - Verify total treasure points sum correctly
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 9.2 Verify action scoring matches original
  - Test completing all scoreable actions
  - Verify BASE_SCORE accumulates correctly
  - _Requirements: 2.1-2.16_

- [ ] 9.3 Verify win condition
  - Test reaching 350 points triggers win message
  - Test win message only shows once
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9.4 Final commit and tag
  - Commit message: "feat: Complete scoring system fix"
  - Tag: v1.0.0-scoring-fix
  - _Requirements: All_

## Notes

- All tasks including tests are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The scoring system must maintain backward compatibility with existing save files
