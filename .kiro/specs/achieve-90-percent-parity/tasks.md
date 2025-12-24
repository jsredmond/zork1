# Implementation Plan: Achieve 90% Parity

## Overview

This plan implements targeted fixes to achieve 90%+ aggregate parity by addressing the remaining differences in the worst-performing test sequences.

**Current State:** 88.08% aggregate parity
**Target State:** 90%+ aggregate parity

---

## Phase 1: Analysis and Enhanced Normalization

### Goal
Create analysis tools and enhance content normalization to focus on core game content differences.

---

- [x] 1. Create difference analysis tool
  - Build tool to analyze specific differences in worst-performing sequences
  - _Requirements: 1.1, 2.4, 5.1_

- [x] 1.1 Create analysis script
  - File: `scripts/analyze-differences.ts`
  - Analyze puzzle solutions sequence (77.9% parity) in detail
  - Categorize differences by type (content vs formatting)
  - Identify highest-impact fixes
  - _Requirements: 1.1, 2.4_

- [x] 1.2 Enhance comparison normalization
  - File: `src/testing/recording/comparator.ts`
  - Add filterSongBirdMessages option
  - Add filterAtmosphericMessages option
  - Add normalizeErrorMessages option
  - Add filterLoadingMessages option
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.3 Update comparison options interface
  - File: `src/testing/recording/types.ts`
  - Add EnhancedComparisonOptions interface
  - Add new filtering options
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.4 Write property tests for enhanced normalization
  - File: `src/testing/recording/comparator.test.ts`
  - **Property 1: Song Bird Message Filtering**
  - **Validates: Requirements 2.1**
  - **Property 2: Enhanced Normalization Effectiveness**
  - **Validates: Requirements 2.4**
  - _Requirements: 2.1, 2.4_

- [x] 1.5 Commit analysis and normalization improvements
  - Commit message: "feat: Add difference analysis tool and enhanced normalization"
  - Include analysis script and comparator enhancements
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4_

---

## Phase 2: Fix Puzzle Solutions Sequence (Priority 1)

### Goal
Improve puzzle solutions sequence from 77.9% to 90%+ parity.

---

- [x] 2. Fix puzzle solutions sequence
  - Address the worst-performing sequence (16 differences)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Analyze puzzle solutions differences
  - Run analysis tool on puzzle solutions sequence
  - Identify specific commands causing differences
  - Categorize by fix complexity and impact
  - _Requirements: 1.1_

- [x] 2.2 Fix puzzle-specific action responses
  - File: `src/game/actions.ts` or `src/game/puzzles.ts`
  - Fix identified puzzle command responses
  - Ensure puzzle state changes match Z-Machine
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 2.3 Write property tests for puzzle fixes
  - File: `src/game/puzzles.test.ts`
  - **Property 3: Puzzle Solutions Parity Achievement**
  - **Validates: Requirements 1.1**
  - _Requirements: 1.1_

- [x] 2.4 Verify puzzle solutions parity improvement
  - Run: `npx tsx scripts/record-and-compare.ts --normalize scripts/sequences/puzzle-solutions.txt`
  - Target: 90%+ parity (up from 77.9%)
  - _Requirements: 1.1_

- [x] 2.5 Commit puzzle solutions fixes
  - Commit message: "fix: Improve puzzle solutions sequence parity to 90%+"
  - Include all puzzle-related fixes
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

---

## Phase 3: Fix Inventory Management Sequence (Priority 2)

### Goal
Improve inventory management sequence from 84.2% to 90%+ parity.

---

- [x] 3. Fix inventory management sequence
  - Address inventory operation differences (6 differences)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Analyze inventory management differences
  - Run analysis tool on inventory management sequence
  - Focus on take/drop/inventory command responses
  - _Requirements: 3.1_

- [x] 3.2 Fix inventory action messages
  - File: `src/game/actions.ts`
  - Ensure "Taken." vs "You take the X." consistency
  - Fix inventory limit handling messages
  - Fix drop action response consistency
  - _Requirements: 3.2, 3.3_

- [x] 3.3 Write property tests for inventory fixes
  - File: `src/game/actions.test.ts`
  - **Property 4: Inventory Management Parity Achievement**
  - **Validates: Requirements 3.1**
  - **Property 5: Inventory Message Consistency**
  - **Validates: Requirements 3.2**
  - _Requirements: 3.1, 3.2_

- [x] 3.4 Verify inventory management parity improvement
  - Run: `npx tsx scripts/record-and-compare.ts --normalize scripts/sequences/inventory-management.txt`
  - Target: 90%+ parity (up from 84.2%)
  - _Requirements: 3.1_

- [x] 3.5 Commit inventory management fixes
  - Commit message: "fix: Improve inventory management sequence parity to 90%+"
  - Include inventory action fixes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

---

## Phase 4: Fix Navigation Directions Sequence (Priority 3)

### Goal
Improve navigation directions sequence from 87.8% to 90%+ parity.

---

- [x] 4. Fix navigation directions sequence
  - Address navigation and movement differences (6 differences)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.1 Analyze navigation directions differences
  - Run analysis tool on navigation directions sequence
  - Focus on movement commands and error messages
  - _Requirements: 4.1_

- [x] 4.2 Fix navigation error messages
  - File: `src/game/verbHandlers.ts`
  - Ensure "You can't go that way" message consistency
  - Fix directional synonym handling
  - Fix room transition descriptions
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 4.3 Write property tests for navigation fixes
  - File: `src/game/verbHandlers.test.ts`
  - **Property 6: Navigation Directions Parity Achievement**
  - **Validates: Requirements 4.1**
  - **Property 7: Navigation Error Message Consistency**
  - **Validates: Requirements 4.2**
  - _Requirements: 4.1, 4.2_

- [x] 4.4 Verify navigation directions parity improvement
  - Run: `npx tsx scripts/record-and-compare.ts --normalize scripts/sequences/navigation-directions.txt`
  - Target: 90%+ parity (up from 87.8%)
  - _Requirements: 4.1_

- [x] 4.5 Commit navigation directions fixes
  - Commit message: "fix: Improve navigation directions sequence parity to 90%+"
  - Include navigation and movement fixes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

---

## Phase 5: Polish Remaining Sequences (Priority 4)

### Goal
Push the remaining close sequences (88%+) over the 90% threshold.

---

- [x] 5. Polish remaining sequences to 90%+
  - Address the sequences close to 90% threshold
  - _Requirements: 5.1, 5.2_

- [x] 5.1 Fix examine objects sequence (88.6% → 90%+)
  - Analyze and fix 5 remaining differences
  - Focus on object examination responses
  - _Requirements: 5.1_

- [x] 5.2 Fix basic exploration sequence (86.2% → 90%+)
  - Analyze and fix 4 remaining differences
  - Focus on room descriptions and basic commands
  - _Requirements: 5.1_

- [x] 5.3 Fix mailbox and leaflet sequence (88.9% → 90%+)
  - Analyze and fix 2 remaining differences
  - Focus on container interactions
  - _Requirements: 5.1_

- [x] 5.4 Write property tests for remaining fixes
  - File: `src/game/actions.test.ts`
  - **Property 8: Individual Sequence Performance**
  - **Validates: Requirements 5.2**
  - _Requirements: 5.2_

- [x] 5.5 Commit remaining sequence fixes
  - Commit message: "fix: Polish remaining sequences to achieve 90%+ individual parity"
  - Include all remaining fixes
  - _Requirements: 5.1, 5.2_

---

## Phase 6: Verification and Documentation

### Goal
Verify 90%+ aggregate parity achievement and document results.

---

- [x] 6. Verify 90%+ aggregate parity achievement
  - Run comprehensive batch tests with all fixes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6.1 Run enhanced batch comparison
  - Execute: `npx tsx scripts/record-and-compare.ts --batch --normalize --enhanced --format text scripts/sequences/`
  - Verify 90%+ aggregate parity
  - Verify at least 7 sequences above 90% individual parity
  - _Requirements: 5.1, 5.2_

- [x] 6.2 Write property tests for aggregate parity
  - File: `src/testing/integration.test.ts`
  - **Property 9: Aggregate Parity Target Achievement**
  - **Validates: Requirements 5.1**
  - **Property 10: Batch Test Reliability**
  - **Validates: Requirements 5.3**
  - _Requirements: 5.1, 5.3_

- [x] 6.3 Document final results
  - Update PARITY_RESULTS.md with 90%+ achievement
  - List all fixes implemented and their impact
  - Document methodology for future improvements
  - _Requirements: 5.1, 5.2_

- [x] 6.4 Final commit and celebration
  - Commit message: "feat: Achieve 90%+ aggregate parity target 🎉"
  - Include final documentation and test results
  - Tag: v1.0.0-parity-90-percent
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## Notes

- Phase 1 (analysis/normalization) provides foundation for targeted fixes
- Phase 2 (puzzle solutions) has highest impact - worst sequence at 77.9%
- Phase 3 (inventory) and Phase 4 (navigation) are medium priority
- Phase 5 (polish) pushes close sequences over 90% threshold
- Phase 6 (verification) confirms 90%+ aggregate parity achieved
- All property-based tests are required for comprehensive validation
- Enhanced normalization should improve all sequence scores
- Focus on content differences, not formatting differences
