# Phase 5.5: Regression Fix Plan

**Created**: December 8, 2025  
**Purpose**: Address all regressions identified in Phase 5 verification  
**Status**: Ready to Execute

## Overview

Phase 5 verification (Task 14) identified significant regressions that must be fixed before proceeding to Phase 6. This plan adds a new Phase 5.5 with detailed tasks to address all issues.

## Regression Summary

### Unit Tests
- **Total**: 855 tests
- **Passing**: 845 (98.9%)
- **Failing**: 9 (1.1%)
- **Target**: 100% pass rate

### Transcripts
- **Total**: 41 transcripts
- **Passing**: 4 (9.8%)
- **Failing**: 37 (90.2%)
- **Target**: 100% critical/high/medium, 95%+ low

## New Tasks Added

### Task 14.2: Fix Unit Test Regressions (9 failures)

**Subtasks**:
- 14.2.1: Fix error handling regressions (2 failures)
  - Invalid command handling
  - Non-existent object handling
  
- 14.2.2: Fix vocabulary test assumptions (2 failures)
  - Recognize "xyzzy" as valid VERB
  - Update hasWord tests
  
- 14.2.3: Fix display formatting issues (3 failures)
  - Inventory display format
  - Examine action descriptions
  
- 14.2.4: Fix conditional message whitespace (2 failures)
  - WEST-OF-HOUSE line breaks
  - Message normalization
  
- 14.2.5: Run unit tests to verify fixes
- 14.2.6: Commit unit test fixes

### Task 14.3: Fix Critical Transcript Failures (7 failures)

**Subtasks**:
- 14.3.1: Trap door (92.9% → 100%) - 2 differences
- 14.3.2: Lamp/darkness (95.1% → 100%) - 2 differences
- 14.3.3: Troll puzzle (75.5% → 100%) - 7 differences
- 14.3.4: Dam puzzle (39.3% → 100%) - 20 differences + navigation issue
- 14.3.5: Cyclops puzzle (2.1% → 100%) - 3 differences
- 14.3.6: Bell/book/candle (6.6% → 100%) - 4 differences
- 14.3.7: Treasure collection (5.1% → 100%) - 5 differences
- 14.3.8: Commit critical fixes

### Task 14.4: Fix High-Priority Transcript Failures (10 failures)

**Subtasks**:
- 14.4.1: Thief encounter (70.0% → 95%+) - 7 differences
- 14.4.2: Thief defeat (62.0% → 95%+) - 9 differences
- 14.4.3: Troll combat (78.1% → 95%+) - 7 differences
- 14.4.4: Cyclops feeding (81.1% → 95%+) - 8 differences
- 14.4.5: Bat encounter (74.2% → 95%+) - 7 differences
- 14.4.6: Maze navigation (81.4% → 95%+) - 6 differences
- 14.4.7: Mirror room (75.9% → 95%+) - 7 differences
- 14.4.8: Coffin puzzle (69.9% → 95%+) - 8 differences
- 14.4.9: Egg/nest puzzle (69.2% → 95%+) - 8 differences
- 14.4.10: Rainbow puzzle (74.2% → 95%+) - 7 differences
- 14.4.11: Commit high-priority fixes

### Task 14.5: Fix Medium-Priority Transcript Failures (5 failures)

**Subtasks**:
- 14.5.1: Error messages (55.6% → 90%+) - 10 differences
- 14.5.2: Inventory limits (17.8% → 90%+) - 17 differences
- 14.5.3: Unusual commands (58.9% → 90%+) - 11 differences
- 14.5.4: Death/resurrection (28.7% → 90%+) - 12 differences
- 14.5.5: Save/restore (60.1% → 90%+) - 7 differences
- 14.5.6: Commit medium-priority fixes

### Task 14.6: Fix Low-Priority Transcript Failures (15 failures)

**Subtasks**:
- 14.6.1: Flavor text (33.9% → 85%+) - 12 differences
- 14.6.2: Rare interactions (24.8% → 85%+) - 12 differences
- 14.6.3: Alternative paths (64.2% → 85%+) - 6 differences
- 14.6.4: Easter eggs (21.5% → 85%+) - 13 differences
- 14.6.5: Verbose mode (21.3% → 85%+) - 12 differences
- 14.6.6: Note about timing transcripts (deferred to Phase 6)
- 14.6.7: Commit low-priority fixes

### Task 14.7: Final Regression Verification

**Subtasks**:
- 14.7.1: Run full unit test suite (verify 100% pass)
- 14.7.2: Run all transcript verifications (verify targets met)
- 14.7.3: Generate regression fix report
- 14.7.4: Final commit for Phase 5.5

## Deferred Items

### Timing Transcripts (10 failures)
All timing-related transcripts are deferred to Phase 6 (Daemon Timing Verification):
- 70-lamp-fuel-early (51.0%)
- 71-lamp-fuel-warning (17.8%)
- 72-candle-burning (44.6%)
- 73-thief-movement (58.7%)
- 74-cyclops-movement (28.5%)
- 75-bat-timing (33.7%)
- 76-multiple-daemons (47.7%)
- 77-troll-daemon (17.8%)
- 78-flood-control-dam (35.0%)
- 79-resurrection-timing (6.1%)

These require comprehensive daemon timing work and will be addressed systematically in Phase 6.

## Success Criteria

After completing Phase 5.5:
- ✅ 100% unit test pass rate (855/855)
- ✅ 100% critical transcript pass rate (11/11)
- ✅ 100% high-priority transcript pass rate (10/10)
- ✅ 100% medium-priority transcript pass rate (5/5)
- ✅ 95%+ low-priority transcript pass rate (14/15 minimum)
- ⏸️ Timing transcripts deferred to Phase 6

## Execution Strategy

1. **Start with Unit Tests** (Task 14.2)
   - Quick wins, high impact
   - Establishes solid foundation
   
2. **Fix Critical Transcripts** (Task 14.3)
   - Highest priority
   - Core game functionality
   
3. **Fix High-Priority Transcripts** (Task 14.4)
   - NPCs and major puzzles
   - Most visible to players
   
4. **Fix Medium-Priority Transcripts** (Task 14.5)
   - Edge cases and error handling
   - Important for robustness
   
5. **Fix Low-Priority Transcripts** (Task 14.6)
   - Flavor text and easter eggs
   - Polish and completeness
   
6. **Final Verification** (Task 14.7)
   - Confirm all fixes work
   - No new regressions
   - Ready for Phase 6

## Timeline Estimate

- Unit tests: 1-2 days
- Critical transcripts: 2-3 days
- High-priority transcripts: 3-4 days
- Medium-priority transcripts: 2-3 days
- Low-priority transcripts: 2-3 days
- Final verification: 1 day

**Total**: 11-16 days (2-3 weeks)

## Next Steps

1. Review this plan with stakeholders
2. Begin execution with Task 14.2.1 (error handling)
3. Work through tasks sequentially
4. Commit after each major subtask group
5. Run verification after each commit
6. Proceed to Phase 6 only after 100% success criteria met

## Notes

- Each transcript fix should analyze differences first
- Use comparison tools to identify exact mismatches
- Test fixes in isolation before committing
- Run regression tests after each fix
- Document any architectural decisions
- Keep commits focused and atomic
