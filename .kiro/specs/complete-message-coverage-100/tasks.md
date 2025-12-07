# Implementation Plan: Complete Message Coverage to 100%

## Current Status
- **Starting Coverage**: 78.04% (725/929 messages)
- **Target Coverage**: 100.00% (929/929 messages)
- **Messages to Implement**: 204

---

- [x] 10. Batch 10: Conditional Messages Part 1 (30 messages → 81.3%)
  - Implement flag-dependent room descriptions
  - Target: 755/929 messages (81.3%)
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 10.1 Analyze conditional message patterns
  - Run: `npx tsx scripts/identify-next-messages.ts --category conditional`
  - Identify 30 highest-priority conditional messages
  - Document flag dependencies
  - _Requirements: 1.1_

- [x] 10.2 Implement flag-dependent room descriptions (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Room description variations based on WON_FLAG, LAMP_ON, etc.
  - Add helper functions for common flag patterns
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 10.3 Implement object state variations (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Object descriptions based on OPENBIT, ONBIT, TOUCHBIT
  - Test all state combinations
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 10.4 Validate Batch 10
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~81.3% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 1.5, 10.2, 10.3_

---

- [x] 11. Batch 11: Conditional Messages Part 2 (30 messages → 84.5%)
  - Implement multi-flag conditions and time-based messages
  - Target: 785/929 messages (84.5%)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 11.1 Implement time-dependent messages (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Lamp dimming stages, candle burning stages
  - Add time-based condition helpers
  - _Requirements: 1.2, 1.3_

- [x] 11.2 Implement multi-condition messages (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Complex flag combinations (2+ flags)
  - Document condition logic clearly
  - _Requirements: 1.1, 1.3_

- [x] 11.3 Validate Batch 11
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~84.5% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 1.5, 10.2, 10.3_

- [x] 11.4 Commit to Git
  - Commit message: "feat: Batch 11 - Time-dependent and multi-condition messages (30 messages)"
  - Include all modified files from Batch 11
  - _Requirements: 10.5_

---

- [x] 12. Batch 12: Conditional Messages Part 3 (30 messages → 87.7%)
  - Implement location and inventory-dependent messages
  - Target: 815/929 messages (87.7%)
  - _Requirements: 1.1, 1.4_

- [x] 12.1 Implement location-dependent messages (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Text variations based on current room
  - Add location check helpers
  - _Requirements: 1.1, 1.4_

- [x] 12.2 Implement inventory-dependent messages (15 messages)
  - File: `src/game/conditionalMessages.ts`
  - Messages: Text variations based on carried items
  - Test inventory state combinations
  - _Requirements: 1.1, 1.4_

- [x] 12.3 Validate Batch 12
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~87.7% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 1.5, 10.2, 10.3_

- [x] 12.4 Commit to Git
  - Commit message: "feat: Batch 12 - Location and inventory-dependent messages (30 messages)"
  - Include all modified files from Batch 12
  - _Requirements: 10.5_

---

- [x] 13. Batch 13: V-Object Messages Part 1 (30 messages → 91.0%)
  - Implement spell and vehicle messages from gverbs.zil
  - Target: 845/929 messages (91.0%)
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 13.1 Create V-object handler system
  - File: `src/game/verbHandlers.ts` (new file)
  - Create abstraction for V-object messages
  - Map ZIL V-object patterns to TypeScript
  - _Requirements: 4.1_

- [x] 13.2 Implement spell-related messages (20 messages)
  - File: `src/game/verbHandlers.ts`
  - Messages: FEEBLE, FUMBLE, FEAR, FREEZE, FALL, FERMENT, etc.
  - Integrate with spell system
  - _Requirements: 4.1, 4.2_

- [x] 13.3 Implement vehicle messages (10 messages)
  - File: `src/game/verbHandlers.ts`
  - Messages: Vehicle entry/exit, movement restrictions
  - Test vehicle state transitions
  - _Requirements: 4.1, 4.3_

- [x] 13.4 Validate Batch 13
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~91.0% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 4.5, 10.2, 10.3_

- [x] 13.5 Commit to Git
  - Commit message: "feat: Batch 13 - V-object spell and vehicle messages (30 messages)"
  - Include all modified files from Batch 13
  - _Requirements: 10.5_

---

- [x] 14. Batch 14: V-Object Messages Part 2 (32 messages → 94.4%)
  - Complete remaining V-object messages
  - Target: 877/929 messages (94.4%)
  - _Requirements: 4.1, 4.4_

- [x] 14.1 Implement DESCRIBE floating messages (8 messages)
  - File: `src/game/verbHandlers.ts`
  - Messages: "(floating in midair)" variations
  - Handle FLOAT spell effects
  - _Requirements: 4.1, 4.4_

- [x] 14.2 Implement combat V-object messages (12 messages)
  - File: `src/game/verbHandlers.ts`
  - Messages: Attack, weapon, and combat feedback
  - Integrate with combat system
  - _Requirements: 4.1, 4.3_

- [x] 14.3 Implement remaining V-object messages (12 messages)
  - File: `src/game/verbHandlers.ts`
  - Messages: Echo, burn, filch, and misc V-object responses
  - Complete V-object coverage
  - _Requirements: 4.1, 4.4_

- [x] 14.4 Validate Batch 14
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~94.4% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 4.5, 10.2, 10.3_

- [x] 14.5 Commit to Git
  - Commit message: "feat: Batch 14 - Remaining V-object messages (32 messages)"
  - Include all modified files from Batch 14
  - _Requirements: 10.5_

---

- [x] 15. Batch 15: Parser Internal Messages (15 messages → 96.0%)
  - Implement parser feedback and command handling
  - Target: 892/929 messages (96.0%)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 15.1 Create parser feedback system
  - File: `src/parser/feedback.ts` (new file)
  - Create parser message abstraction
  - Add parser state tracking for OOPS/AGAIN
  - _Requirements: 2.1, 2.2_

- [x] 15.2 Implement OOPS command messages (5 messages)
  - File: `src/parser/feedback.ts`
  - Messages: OOPS handling, word correction feedback
  - Test OOPS command variations
  - _Requirements: 2.1_

- [x] 15.3 Implement AGAIN/G command messages (5 messages)
  - File: `src/parser/feedback.ts`
  - Messages: AGAIN feedback, repeat restrictions
  - Test command repetition
  - _Requirements: 2.2_

- [x] 15.4 Implement parser error variations (5 messages)
  - File: `src/parser/feedback.ts`
  - Messages: Ambiguity, missing noun, syntax errors
  - Test error conditions
  - _Requirements: 2.3, 2.4_

- [x] 15.5 Validate Batch 15
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~96.0% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 2.5, 10.2, 10.3_

- [x] 15.6 Commit to Git
  - Commit message: "feat: Batch 15 - Parser internal messages (15 messages)"
  - Include all modified files from Batch 15
  - _Requirements: 10.5_

---

- [x] 16. Batch 16: Generic & Error Messages (15 messages → 97.6%)
  - Complete generic refusal and error variations
  - Target: 907/929 messages (97.6%)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 16.1 Implement refusal variations (8 messages)
  - File: `src/game/errorMessages.ts`
  - Messages: "You can't do that" variations
  - Add contextual refusal logic
  - _Requirements: 3.1, 3.2_

- [x] 16.2 Implement contextual error messages (7 messages)
  - File: `src/game/errorMessages.ts`
  - Messages: Specific error contexts and edge cases
  - Test error conditions
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 16.3 Validate Batch 16
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~97.6% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 3.5, 10.2, 10.3_

- [x] 16.4 Commit to Git
  - Commit message: "feat: Batch 16 - Generic and error message variations (15 messages)"
  - Include all modified files from Batch 16
  - _Requirements: 10.5_

---

- [x] 17. Batch 17: Special Object Messages (10 messages → 98.7%)
  - Implement DEAD state and CRETIN messages
  - Target: 917/929 messages (98.7%)
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3_

- [x] 17.1 Create death state handler
  - File: `src/game/deadState.ts` (new file)
  - Create death state message system
  - Handle verb restrictions when dead
  - _Requirements: 8.1, 8.2_

- [x] 17.2 Implement DEAD state messages (9 messages)
  - File: `src/game/deadState.ts`
  - Messages: All death state verb responses
  - Test death state interactions
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 17.3 Create self-reference handler
  - File: `src/game/selfReference.ts` (new file)
  - Create CRETIN message system
  - Handle self-directed actions
  - _Requirements: 9.1, 9.2_

- [x] 17.4 Implement CRETIN messages (9 messages)
  - File: `src/game/selfReference.ts`
  - Messages: All self-reference responses
  - Test self-directed actions
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 17.5 Validate Batch 17
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~98.7% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 8.5, 9.5, 10.2, 10.3_

- [x] 17.6 Commit to Git
  - Commit message: "feat: Batch 17 - DEAD state and CRETIN messages (10 messages)"
  - Include all modified files from Batch 17
  - _Requirements: 10.5_

---

- [x] 18. Batch 18: Puzzle & Scenery Completion (8 messages → 99.6%)
  - Complete final puzzle and scenery messages
  - Target: 925/929 messages (99.6%)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_

- [x] 18.1 Implement final puzzle messages (4 messages)
  - Files: `src/game/puzzles.ts`, various puzzle files
  - Messages: Edge case puzzle feedback
  - Test puzzle completion paths
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 18.2 Implement final scenery messages (3 messages)
  - File: `src/game/sceneryActions.ts`
  - Messages: Remaining scenery interactions
  - Test scenery edge cases
  - _Requirements: 7.1, 7.2_

- [x] 18.3 Implement final object messages (1 message)
  - File: `src/game/specialBehaviors.ts`
  - Messages: Remaining object-specific responses
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 18.4 Validate Batch 18
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: ~99.6% coverage
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 5.5, 7.5, 10.2, 10.3_

- [x] 18.5 Commit to Git
  - Commit message: "feat: Batch 18 - Final puzzle and scenery messages (8 messages)"
  - Include all modified files from Batch 18
  - _Requirements: 10.5_

---

- [x] 19. Batch 19: Final 4 Messages (4 messages → 100%)
  - Implement the last 4 most complex/obscure messages
  - Target: 929/929 messages (100.0%)
  - _Requirements: 10.1_

- [x] 19.1 Identify final 4 messages
  - Run: `npx tsx scripts/identify-next-messages.ts`
  - Analyze remaining messages
  - Document complexity and requirements
  - _Requirements: 10.1_

- [x] 19.2 Implement final 4 messages
  - Files: Various (based on message type)
  - Messages: Most complex/obscure remaining messages
  - Test thoroughly
  - _Requirements: 10.1, 10.4_

- [x] 19.3 Validate 100% achievement
  - Run: `npx tsx scripts/verify-coverage-threshold.ts`
  - Expected: 100.0% coverage (929/929 messages)
  - Run: `npm test`
  - Expected: All tests passing
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 19.4 Commit to Git
  - Commit message: "feat: Batch 19 - Final 4 messages - 100% COVERAGE ACHIEVED! 🎉"
  - Include all modified files from Batch 19
  - _Requirements: 10.5_

---

- [x] 20. Final Validation & Documentation
  - Comprehensive validation and documentation
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 20.1 Run comprehensive validation
  - Run coverage validation 5 times
  - Verify consistent 100% coverage
  - Run full test suite 3 times
  - Verify zero regressions
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 20.2 Validate message text accuracy
  - Run: `npx tsx scripts/validate-messages.ts --all`
  - Compare all messages to ZIL source
  - Document any intentional deviations
  - _Requirements: 10.4, 10.5_

- [x] 20.3 Create completion report
  - Document all 204 implemented messages
  - List files modified
  - Summarize implementation approach
  - Note any challenges or deviations
  - _Requirements: 10.5_

- [x] 20.4 Update project documentation
  - Update README with 100% coverage achievement
  - Update COMPLETENESS_REPORT.md
  - Update message accuracy summary
  - Create implementation guide for future reference
  - _Requirements: 10.5_

- [x] 20.5 Final verification
  - Play through game comparing to original
  - Test edge cases and rare conditions
  - Verify all message contexts
  - Confirm 100% coverage is authentic
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 20.6 Final Commit to Git
  - Commit message: "docs: Complete 100% message coverage documentation and verification"
  - Include all documentation updates from Batch 20
  - Tag release: `v1.0.0-complete-coverage`
  - _Requirements: 10.5_
