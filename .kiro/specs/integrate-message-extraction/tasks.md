# Implementation Plan: Integrate Message Extraction into Parity Validation

## Overview

This implementation refactors `ExhaustiveParityValidator.compareAndClassify()` to delegate to `TranscriptComparator.compareAndClassify()`, ensuring status bar differences are isolated from logic comparison. The fix should dramatically improve parity percentage by correctly classifying structural differences.

## Tasks

- [x] 1. Extend data models with status bar tracking
  - Add statusBarDifferences and logicParityPercentage fields to SeedResult and ParityResults interfaces
  - _Requirements: 3.1, 3.2, 4.3, 6.4_

- [x] 1.1 Update SeedResult interface
  - Add `statusBarDifferences: number` field
  - Add `logicParityPercentage: number` field
  - _Requirements: 3.1, 4.3_

- [x] 1.2 Update ParityResults interface
  - Add `statusBarDifferences: number` field
  - Add `logicParityPercentage: number` field
  - _Requirements: 3.2, 6.4_

- [x] 1.3 Commit to Git
  - Commit message: "feat: Add status bar tracking fields to parity result interfaces"
  - Include all interface changes
  - _Requirements: 3.1, 3.2, 4.3, 6.4_

---

- [x] 2. Refactor compareAndClassify to use message extraction
  - Update the private compareAndClassify method to delegate to TranscriptComparator
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2.1 Configure TranscriptComparator with extraction options
  - Set `useMessageExtraction: true` and `trackDifferenceTypes: true` in comparator options
  - _Requirements: 2.3_

- [x] 2.2 Refactor compareAndClassify method
  - Replace direct comparison logic with call to `this.comparator.compareAndClassify()`
  - Map ExtendedDiffReport results to internal ClassifiedDifference[] format
  - Track statusBarDifferences from the report's structuralDifferences count
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 2.3 Write property test for message extraction pipeline
  - **Property 1: Message Extraction Pipeline**
  - Verify extraction is used for all comparisons
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 2.4 Commit to Git
  - Commit message: "feat: Refactor compareAndClassify to use TranscriptComparator"
  - Include all method changes
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

---

- [x] 3. Implement status bar isolation
  - Ensure status bar differences are tracked separately and don't affect logic parity
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.1 Update comparison result handling
  - Extract statusBarDifferences from ExtendedDiffReport.structuralDifferences
  - Ensure status bar differences don't increment logicDifferences count
  - _Requirements: 4.2, 4.3_

- [x] 3.2 Update passed calculation
  - Ensure passed=true even when statusBarDifferences > 0
  - Only LOGIC_DIFFERENCE should cause passed=false
  - _Requirements: 4.4_

- [x] 3.3 Write property test for status bar isolation
  - **Property 2: Status Bar Isolation**
  - Generate outputs differing only in status bar, verify isolation
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 3.4 Commit to Git
  - Commit message: "feat: Implement status bar isolation in parity validation"
  - Include all isolation logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

---

- [x] 4. Fix parity percentage calculation
  - Update calculation to only count LOGIC_DIFFERENCE as failures
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3_

- [x] 4.1 Update matchingResponses calculation
  - Count responses as matching if extracted responses are identical
  - Count RNG_DIFFERENCE and STATE_DIVERGENCE as matching
  - _Requirements: 5.1, 6.1, 6.2_

- [x] 4.2 Update parityPercentage formula
  - Formula: `(exactMatches + closeMatches + rngDifferences + stateDivergences) / totalCommands * 100`
  - Only LOGIC_DIFFERENCE reduces parity
  - _Requirements: 6.3_

- [x] 4.3 Calculate logicParityPercentage
  - Separate metric: `(totalCommands - logicDifferences) / totalCommands * 100`
  - This is the "true" parity excluding all non-logic differences
  - _Requirements: 6.4_

- [x] 4.4 Write property test for parity calculation
  - **Property 4: Parity Calculation Accuracy**
  - Verify formula correctness across various scenarios
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 4.5 Commit to Git
  - Commit message: "feat: Fix parity percentage calculation to exclude non-logic differences"
  - Include all calculation changes
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3_

---

- [x] 5. Update summary generation
  - Update generateSummary to include status bar metrics
  - _Requirements: 4.4, 6.4_

- [x] 5.1 Add status bar info to summary
  - Include statusBarDifferences count (informational)
  - Include logicParityPercentage as the primary metric
  - _Requirements: 4.4, 6.4_

- [x] 5.2 Update summary format
  - Clearly distinguish between logic parity and overall parity
  - Show status bar differences as informational, not failures
  - _Requirements: 4.4_

- [x] 5.3 Commit to Git
  - Commit message: "feat: Update summary to show status bar metrics separately"
  - Include summary changes
  - _Requirements: 4.4, 6.4_

---

- [x] 6. Checkpoint - Verify integration
  - Ensure all tests pass, ask the user if questions arise.

---

- [x] 7. Write remaining property tests
  - Complete property test coverage for all correctness properties
  - _Requirements: 3.1, 3.2, 3.3, 5.3, 5.4_

- [x] 7.1 Write property test for non-logic differences
  - **Property 3: Non-Logic Differences Don't Affect Parity**
  - Generate RNG/state differences, verify they count as matches
  - **Validates: Requirements 5.1, 5.2, 6.1, 6.2**

- [x] 7.2 Write property test for API compatibility
  - **Property 5: API Compatibility**
  - Verify return types have all required fields
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 7.3 Write property test for RNG classification
  - **Property 6: RNG Classification Accuracy**
  - Generate RNG pool messages, verify classification
  - **Validates: Requirements 5.3, 5.4**

- [x] 7.4 Commit to Git
  - Commit message: "test: Add property tests for parity validation"
  - Include all test files
  - _Requirements: 3.1, 3.2, 3.3, 5.3, 5.4_

---

- [x] 8. Integration test and validation
  - Run full parity validation to verify improvement
  - _Requirements: All_

- [x] 8.1 Run parity validation with existing transcripts
  - Execute validation and compare results to previous run
  - Verify dramatic improvement in parity percentage
  - _Requirements: All_

- [x] 8.2 Verify status bar isolation works
  - Confirm status bar differences are tracked separately
  - Confirm they don't affect logic parity percentage
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8.3 Final commit and tag
  - Commit message: "feat: Complete message extraction integration for parity validation"
  - Tag: v1.0.0-integrate-message-extraction
  - _Requirements: All_

## Notes

- All tasks including property tests are required for comprehensive coverage
- The core fix is in task 2.2 - refactoring compareAndClassify to delegate to TranscriptComparator
- Status bar differences should be informational only, never causing test failures
- The logicParityPercentage is the "true" parity metric that matters for 100% parity goal
