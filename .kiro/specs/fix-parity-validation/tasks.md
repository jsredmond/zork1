# Implementation Plan: Fix Parity Validation System

## Overview

This implementation plan fixes the parity validation system to accurately measure behavioral parity between the TypeScript and Z-Machine implementations. The key fix is adding a message extraction layer that isolates action responses from full output blocks before comparison.

## Tasks

- [x] 1. Implement MessageExtractor
  - Create new module for extracting action responses from output blocks
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 1.1 Create messageExtractor.ts
  - Implement stripGameHeader() to remove ZORK I title, copyright, version
  - Implement stripStatusBar() to remove "Score: X Moves: Y" lines
  - Implement stripPrompt() to remove ">" prompts
  - Implement stripRoomDescription() for non-movement commands
  - Implement extractActionResponse() main function
  - Implement isMovementCommand() helper
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 1.2 Write unit tests for MessageExtractor
  - Test header stripping with various header formats
  - Test status bar stripping
  - Test prompt stripping
  - Test room description handling for movement vs action commands
  - Test preservation of action response content
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 1.3 Write property test for extraction preservation
  - **Property 1: Message Extraction Preserves Action Response**
  - Generate random output blocks with known responses, verify extraction
  - **Validates: Requirements 1.1, 1.5**

- [x] 1.4 Write property test for content removal
  - **Property 2: Extraction Removes Non-Response Content**
  - Generate outputs with headers/status/prompts, verify removal
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 1.5 Commit to Git
  - Commit message: "feat: Add MessageExtractor for isolating action responses"
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

---

- [x] 2. Update Difference Classifier
  - Enhance classifier to work with extracted messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Add extracted message classification
  - Add classifyExtracted() method that takes ExtractedMessage objects
  - Add normalizeResponse() to handle whitespace variations
  - Update RNG pool detection to work on normalized responses
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.2 Write unit tests for enhanced classifier
  - Test RNG detection on extracted messages
  - Test whitespace handling
  - Test multi-line response handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.3 Write property test for RNG classification
  - **Property 4: RNG Pool Messages Classified Correctly**
  - Generate RNG pool message pairs, verify RNG_DIFFERENCE classification
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 2.4 Write property test for whitespace handling
  - **Property 5: Whitespace Handling in Classification**
  - Generate RNG messages with whitespace variations, verify detection
  - **Validates: Requirements 2.4, 2.5**

- [x] 2.5 Commit to Git
  - Commit message: "feat: Enhance difference classifier for extracted messages"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

---

- [x] 3. Checkpoint - Verify extraction and classification
  - Run unit tests for MessageExtractor
  - Run unit tests for enhanced classifier
  - Verify RNG messages are detected in extracted responses
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.1, 1.5, 2.1, 2.4_

---

- [x] 4. Update Comparator to Use Extraction
  - Integrate MessageExtractor into comparison pipeline
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Integrate MessageExtractor into comparator
  - Extract messages before comparison in compareAndClassify()
  - Pass extracted messages to classifier
  - Track structural vs behavioral differences separately
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.2 Add semantic equivalence checking
  - Implement areSemanticallyEquivalent() for common variations
  - Handle known equivalent message pairs
  - _Requirements: 3.4_

- [x] 4.3 Write unit tests for updated comparator
  - Test extraction integration
  - Test structural difference filtering
  - Test semantic equivalence
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.4 Write property test for structural difference handling
  - **Property 6: Structural Differences Ignored**
  - Generate structurally different but equivalent outputs, verify matching
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 4.5 Commit to Git
  - Commit message: "feat: Integrate message extraction into comparator"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

---

- [x] 5. Fix Certification Generator
  - Remove mock data, use real validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.1 Remove mock data generation
  - Delete createDocumentedParityResults() function
  - Update generate-parity-certification.ts to run actual validation
  - Add Z-Machine availability check
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.2 Update certification to use real results
  - Pass actual ParityResults to generator
  - Include real sample differences in output
  - Report actual parity percentage
  - _Requirements: 5.4, 5.5_

- [x] 5.3 Write unit tests for certification generator
  - Test Z-Machine unavailable handling
  - Test real results integration
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 5.4 Commit to Git
  - Commit message: "fix: Use real validation results in certification generator"
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

- [x] 6. Update Regression Prevention
  - Fix baseline to use proper classification
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.1 Update baseline generation
  - Ensure baseline uses extracted message classification
  - Store RNG vs logic difference counts separately
  - _Requirements: 6.1, 6.2_

- [x] 6.2 Update regression detection
  - Allow RNG differences to vary
  - Only fail on new logic differences
  - _Requirements: 6.3, 6.4_

- [x] 6.3 Write unit tests for regression prevention
  - Test baseline generation with proper classification
  - Test regression detection logic
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.4 Write property test for regression detection
  - **Property 7: Regression Detection Fails on New Logic Differences**
  - **Property 8: Regression Detection Allows RNG Variance**
  - **Validates: Requirements 6.3, 6.4**

- [x] 6.5 Commit to Git
  - Commit message: "fix: Update regression prevention with proper classification"
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

---

- [x] 7. Checkpoint - Run full validation
  - Run parity validation with fixed system
  - Verify RNG differences are now detected
  - Verify parity percentage is more accurate
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

---

- [x] 8. Regenerate Baseline and Certification
  - Create new baseline with accurate classification
  - Generate honest certification document
  - _Requirements: 6.5, 5.1, 5.5_

- [x] 8.1 Delete old baseline
  - Remove src/testing/parity-baseline.json
  - _Requirements: 6.5_

- [x] 8.2 Run validation and establish new baseline
  - Run npm run parity:validate -- --establish-baseline
  - Verify baseline has proper RNG vs logic classification
  - _Requirements: 6.1, 6.2_

- [x] 8.3 Generate new certification
  - Run certification generator with real results
  - Verify PARITY_CERTIFICATION.md reflects actual parity
  - _Requirements: 5.1, 5.5_

- [x] 8.4 Update PARITY_STATUS.md
  - Document actual parity achieved
  - Explain remaining differences
  - _Requirements: 5.5_

- [x] 8.5 Commit to Git
  - Commit message: "docs: Regenerate baseline and certification with accurate data"
  - _Requirements: 6.5, 5.1, 5.5_

---

- [x] 9. Final Checkpoint - Verify accurate parity measurement
  - Run all property tests
  - Run all unit tests
  - Run parity validation
  - Verify certification is accurate
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: All_

---

- [-] 10. Final commit and tag
  - Commit message: "feat: Fix parity validation system for accurate measurement"
  - Tag: v2.1.0-accurate-parity-validation
  - _Requirements: All_

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The key fix is the MessageExtractor that isolates action responses

## Expected Results

After completing all tasks:
- **Parity measurement**: Accurate (not inflated by structural differences)
- **RNG detection**: Working on real output
- **Certification**: Based on real validation, not mock data
- **Baseline**: Properly classifies RNG vs logic differences
