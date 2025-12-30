# Fix Parity Issues - 71% to 95%+ Target

## Overview

The TypeScript Zork I implementation currently achieves 71.5% parity with the original Z-Machine game based on thorough spot testing. This spec addresses the systematic resolution of 57 identified differences to achieve 95%+ parity.

## Current State Analysis

### Parity Score: 71.5% (57 differences in 200 commands)

**Critical Issue Categories:**
1. **Timing Differences (32 occurrences)** - Most critical issue
2. **Object Behavior (11 occurrences)** - Object interaction differs  
3. **Message Inconsistency (10 occurrences)** - Different response text
4. **Parser Differences (2 occurrences)** - Command parsing varies
5. **State Divergence (2 occurrences)** - Game state differs

### Sample Critical Issues

**Parser Issues:**
- `"drop"` command: TS asks "What do you want to drop?" vs ZM says "There seems to be a noun missing in that sentence!"
- `"search"` command: TS says "I don't know how to search" vs ZM asks "What do you want to search?"
- `"put in forest"` command: Different error handling between implementations

**Timing Issues:**
- Status bar display inconsistencies (room name, score, moves)
- Missing status information in TypeScript responses
- Inconsistent move counting and display

**Message Inconsistencies:**
- `"drop all"` when empty-handed: TS says "You are empty-handed." vs ZM says "You don't have the forest."
- Different error messages for invalid object references

## Requirements

### R1: Parser Parity
- **R1.1** Fix incomplete command handling to match Z-Machine exactly
- **R1.2** Implement proper error message selection logic
- **R1.3** Fix verb recognition and disambiguation
- **R1.4** Ensure consistent parser behavior for malformed commands

### R2: Timing System Parity  
- **R2.1** Fix status bar display to match Z-Machine format exactly
- **R2.2** Implement proper move counting and display
- **R2.3** Fix score tracking and display timing
- **R2.4** Ensure consistent room name display in status

### R3: Object Behavior Parity
- **R3.1** Fix object interaction error messages
- **R3.2** Implement proper object visibility checking
- **R3.3** Fix object manipulation responses
- **R3.4** Ensure consistent "You don't have X" vs "You can't see X" logic

### R4: Message Consistency
- **R4.1** Align all error messages with Z-Machine exactly
- **R4.2** Fix context-sensitive message selection
- **R4.3** Implement proper article usage in messages
- **R4.4** Ensure consistent formatting and punctuation

### R5: State Management Parity
- **R5.1** Fix game state synchronization issues
- **R5.2** Ensure consistent object location tracking
- **R5.3** Fix inventory state management
- **R5.4** Implement proper state validation

## Success Criteria

### Primary Goals
- **Parity Score:** Achieve 95%+ parity (from current 71.5%)
- **Difference Reduction:** Reduce from 57 to <10 differences
- **Critical Issues:** Resolve all timing and parser differences
- **Regression Prevention:** Maintain existing working functionality

### Validation Requirements
- **Spot Testing:** Pass thorough spot tests with 95%+ parity
- **Multi-Seed Testing:** Consistent results across different random seeds
- **Regression Testing:** No degradation in existing test sequences
- **Integration Testing:** Full game functionality preserved

### Quality Metrics
- **Parser Accuracy:** 100% correct command interpretation
- **Message Fidelity:** Exact text matching with Z-Machine
- **Timing Precision:** Perfect status display synchronization
- **State Integrity:** Complete game state consistency

## Constraints

### Technical Constraints
- **Minimal Regression Risk:** Changes must not break existing functionality
- **Core System Stability:** Preserve fundamental game mechanics
- **Performance Maintenance:** No significant performance degradation
- **Code Quality:** Maintain clean, maintainable code structure

### Implementation Constraints
- **Incremental Approach:** Fix issues in priority order
- **Comprehensive Testing:** Full validation after each fix
- **Documentation:** Document all changes and rationale
- **Rollback Capability:** Maintain ability to revert changes

## Risk Assessment

### High Risk Areas
- **Parser System:** Core command processing affects entire game
- **Status Display:** Timing changes could affect all interactions
- **State Management:** Changes could cause cascading issues

### Mitigation Strategies
- **Feature Flags:** Implement toggleable fixes for testing
- **Backup Points:** Create git checkpoints before major changes
- **Isolated Testing:** Test each fix independently
- **Gradual Rollout:** Implement fixes incrementally

## Dependencies

### Internal Dependencies
- Existing TypeScript game engine
- Current testing infrastructure
- Spot testing framework
- Parity validation tools

### External Dependencies
- Z-Machine reference implementation (COMPILED/zork1.z3)
- Frotz interpreter for validation
- Node.js and TypeScript toolchain
- Testing frameworks (Vitest)

## Acceptance Criteria

### Functional Requirements
- [ ] Parser handles all command types correctly
- [ ] Status display matches Z-Machine exactly
- [ ] Object interactions behave identically
- [ ] Error messages match Z-Machine text
- [ ] Game state remains synchronized

### Performance Requirements
- [ ] No significant performance regression
- [ ] Response time remains under 100ms
- [ ] Memory usage stays within bounds
- [ ] Startup time unchanged

### Quality Requirements
- [ ] Code coverage maintained above 80%
- [ ] All existing tests continue to pass
- [ ] New tests added for fixed issues
- [ ] Documentation updated for changes

## Out of Scope

### Excluded from This Spec
- **New Features:** No additional game functionality
- **UI Improvements:** Focus only on behavioral parity
- **Performance Optimization:** Unless required for parity
- **Code Refactoring:** Unless necessary for fixes

### Future Considerations
- **Perfect Parity (100%):** Addressed in separate spec
- **Additional Test Coverage:** Expanded testing framework
- **Performance Enhancements:** Optimization opportunities
- **Code Modernization:** TypeScript best practices

## Timeline Estimate

### Phase 1: Parser Fixes (Week 1)
- Fix critical parser differences
- Implement proper error handling
- Validate command interpretation

### Phase 2: Timing System (Week 1)  
- Fix status display issues
- Implement proper move counting
- Synchronize score display

### Phase 3: Object & Messages (Week 1)
- Fix object behavior differences
- Align error messages
- Implement consistent responses

### Phase 4: Validation & Polish (Week 1)
- Comprehensive testing
- Final parity validation
- Documentation and cleanup

**Total Estimated Duration:** 4 weeks