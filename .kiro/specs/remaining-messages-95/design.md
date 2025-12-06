# Design Document: Remaining Messages to 95%

## Overview

This design outlines the systematic approach to implement the remaining 207 messages needed to reach 95% coverage. The implementation will be done in 9 focused batches, each targeting specific message categories with clear validation checkpoints.

## Architecture

### Batch Processing Approach

```
Batch → Implement → Validate → Test → Commit → Next Batch
```

Each batch is self-contained and independently verifiable, allowing for incremental progress with minimal risk.

## Components and Interfaces

### Batch Structure

Each batch follows this pattern:

```typescript
interface MessageBatch {
  id: string;
  name: string;
  messageCount: number;
  targetCoverage: number;
  messages: Message[];
  files: string[];
  estimatedEffort: string;
}

interface Message {
  text: string;
  object?: string;
  verb?: string;
  file: string;
  line: number;
  condition?: string;
}
```

## Data Models

### Implementation Batches

**Batch 1: Quick Wins** (20 messages → 75%)
- Simple messages with no conditions
- Single-file implementations
- Immediate validation feedback

**Batch 2: High-Priority Objects** (10 messages → 76%)
- ROPE, BOTTLE, TRAP-DOOR
- Puzzle-critical messages
- State-dependent logic

**Batch 3: Water & Containers** (25 messages → 79%)
- WATER in BOTTLE scenarios
- Container interactions
- Location dependencies

**Batch 4: Scenery Interactions** (30 messages → 82%)
- WHITE-HOUSE, FOREST, MOUNTAIN-RANGE
- Environmental responses
- Location-specific messages

**Batch 5: Puzzle Messages** (25 messages → 85%)
- BELL, DAM, CYCLOPS, BASKET
- Puzzle feedback
- Success/failure messages

**Batch 6: Conditional Messages Part 1** (30 messages → 88%)
- Flag-dependent variations
- Room description changes
- Object state variations

**Batch 7: Conditional Messages Part 2** (30 messages → 91%)
- Time-dependent messages
- Multi-flag conditions
- Complex state logic

**Batch 8: Generic & Error Messages** (30 messages → 94%)
- Refusal variations
- Parser feedback
- Error responses

**Batch 9: Final Push** (20 messages → 96%+)
- Remaining high-value messages
- Edge cases
- Polish items

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Batch coverage increase
*For any* completed batch, the message coverage percentage should increase by the expected amount
**Validates: Requirements 8.3**

### Property 2: Test stability
*For any* batch implementation, all existing tests should continue to pass
**Validates: Requirements 8.4**

### Property 3: Message exactness
*For any* implemented message, the text should match the ZIL source exactly (with whitespace normalization)
**Validates: Requirements 1.4, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5**

### Property 4: Incremental progress
*For any* batch N, coverage after batch N should be greater than coverage after batch N-1
**Validates: Requirements 8.3**

### Property 5: Final coverage target
*For any* validation after batch 9, coverage should be at least 95%
**Validates: Requirements 9.1, 9.2**

## Error Handling

### Batch Failure Recovery

If a batch fails validation:
1. Revert changes
2. Implement smaller sub-batch
3. Re-validate
4. Continue with remaining messages

### Test Failure Handling

If tests fail after implementation:
1. Identify failing test
2. Check if message breaks existing logic
3. Fix issue or adjust message
4. Re-run tests

## Testing Strategy

### Validation After Each Batch

```bash
# 1. Check coverage increase
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"

# 2. Run full test suite
npm test

# 3. Verify no regressions
# Compare test count before/after
```

### Property-Based Testing

No new property tests required - existing tests will validate new messages automatically through the validation framework.

## Implementation Phases

### Phase 1: Quick Wins (Batch 1)
- **Effort**: 3-4 hours
- **Risk**: Low
- **Dependencies**: None

### Phase 2: Core Objects (Batches 2-3)
- **Effort**: 6-8 hours
- **Risk**: Medium
- **Dependencies**: Batch 1 complete

### Phase 3: World Building (Batches 4-5)
- **Effort**: 8-10 hours
- **Risk**: Low
- **Dependencies**: Batches 1-3 complete

### Phase 4: Conditional Logic (Batches 6-7)
- **Effort**: 8-10 hours
- **Risk**: Medium-High
- **Dependencies**: Batches 1-5 complete

### Phase 5: Polish (Batches 8-9)
- **Effort**: 6-8 hours
- **Risk**: Low
- **Dependencies**: Batches 1-7 complete

## Success Metrics

### Per-Batch Metrics
- Coverage increases by expected amount
- All tests passing
- Zero regressions
- Changes committed

### Final Metrics
- 95%+ coverage achieved
- 883+ messages implemented
- 779+ tests passing
- Documentation updated
