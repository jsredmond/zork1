# Design Document: Complete Message Coverage to 100%

## Overview

This design outlines the systematic approach to implement ALL remaining 204 messages to achieve 100% coverage. The implementation will be done in 10 focused batches, organized by message category and complexity, with clear validation checkpoints.

## Architecture

### Batch Processing Approach

```
Analyze → Categorize → Implement → Test → Validate → Next Batch
```

Each batch targets a specific message category with measurable progress toward 100%.

## Components and Interfaces

### Message Implementation Strategy

```typescript
interface MessageImplementation {
  category: 'conditional' | 'parser' | 'generic' | 'v-object' | 'puzzle' | 'scenery' | 'special';
  complexity: 'simple' | 'medium' | 'complex';
  location: string; // File where message should be implemented
  dependencies: string[]; // Required state/flags/objects
  zilReference: string; // Line number in ZIL source
}

interface BatchPlan {
  id: string;
  name: string;
  targetMessages: number;
  targetCoverage: number;
  categories: string[];
  estimatedEffort: string;
  dependencies: string[];
}
```

## Data Models

### Implementation Batches (204 messages total)

**Batch 10: Conditional Messages - Part 1** (30 messages → 81.3%)
- Flag-dependent room descriptions
- Object state variations
- Time-based message changes
- Target: 755/929 messages

**Batch 11: Conditional Messages - Part 2** (30 messages → 84.5%)
- Multi-flag conditions
- Complex state logic
- Lamp/candle timing messages
- Target: 785/929 messages

**Batch 12: Conditional Messages - Part 3** (30 messages → 87.7%)
- Location-dependent variations
- Inventory-dependent messages
- Actor state messages
- Target: 815/929 messages

**Batch 13: V-Object Messages - Part 1** (30 messages → 91.0%)
- Spell-related messages (FEEBLE, FUMBLE, FEAR, etc.)
- Vehicle messages
- Combat messages
- Target: 845/929 messages

**Batch 14: V-Object Messages - Part 2** (32 messages → 94.4%)
- Remaining spell messages
- DESCRIBE floating messages
- Generic V-object responses
- Target: 877/929 messages

**Batch 15: Parser Internal Messages** (15 messages → 96.0%)
- OOPS command handling
- AGAIN/G command feedback
- Parser error variations
- Target: 892/929 messages

**Batch 16: Generic & Error Messages** (15 messages → 97.6%)
- Refusal variations
- Contextual errors
- Edge case responses
- Target: 907/929 messages

**Batch 17: Special Object Messages** (10 messages → 98.7%)
- DEAD state messages
- CRETIN self-reference messages
- Remaining object-specific messages
- Target: 917/929 messages

**Batch 18: Puzzle & Scenery Completion** (8 messages → 99.6%)
- Final puzzle messages
- Final scenery messages
- Edge case interactions
- Target: 925/929 messages

**Batch 19: Final 4 Messages** (4 messages → 100%)
- Most complex/obscure messages
- Final validation
- Target: 929/929 messages (100%)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Complete coverage
*For any* message in the ZIL source, there exists a corresponding implementation in TypeScript
**Validates: Requirements 10.1**

### Property 2: Message exactness
*For any* implemented message, the text matches the ZIL source exactly (with whitespace normalization)
**Validates: Requirements 10.4**

### Property 3: Conditional correctness
*For any* conditional message, the conditions triggering it match the ZIL logic exactly
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 4: Parser parity
*For any* parser message, the triggering conditions and text match the original parser behavior
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 5: Zero regressions
*For any* batch implementation, all existing tests continue to pass
**Validates: Requirements 10.3**

## Error Handling

### Implementation Challenges

1. **Complex Conditional Logic**
   - Solution: Create helper functions for common condition patterns
   - Document flag dependencies clearly
   - Test each condition path

2. **Parser Internals**
   - Solution: Extend parser with message hooks
   - Maintain parser state for OOPS/AGAIN
   - Add parser test coverage

3. **V-Object Messages**
   - Solution: Create V-object handler system
   - Map ZIL V-object to TypeScript handlers
   - Handle spell system integration

4. **State Dependencies**
   - Solution: Document all state requirements
   - Create state setup helpers for testing
   - Validate state transitions

## Testing Strategy

### Per-Batch Testing

```bash
# 1. Check coverage increase
npx tsx scripts/verify-coverage-threshold.ts

# 2. Run full test suite
npm test

# 3. Verify specific message categories
npx tsx scripts/validate-messages.ts --category [category]

# 4. Check for regressions
npm test -- --reporter=verbose
```

### Message Validation

- Extract message from ZIL source
- Implement in appropriate TypeScript file
- Create test case for message trigger
- Validate exact text match
- Test all conditional paths

### Integration Testing

- Test message sequences
- Validate state transitions
- Check message context
- Verify timing-dependent messages

## Implementation Phases

### Phase 1: Conditional Messages (Batches 10-12)
- **Messages**: 90
- **Effort**: 20-25 hours
- **Risk**: Medium
- **Focus**: State-dependent text variations

### Phase 2: V-Object Messages (Batches 13-14)
- **Messages**: 62
- **Effort**: 15-20 hours
- **Risk**: High
- **Focus**: Verb handler responses

### Phase 3: Parser & Generic (Batches 15-16)
- **Messages**: 30
- **Effort**: 10-15 hours
- **Risk**: Medium
- **Focus**: Parser internals and error messages

### Phase 4: Special & Final (Batches 17-19)
- **Messages**: 22
- **Effort**: 8-12 hours
- **Risk**: Low
- **Focus**: Edge cases and completion

## Success Metrics

### Per-Batch Metrics
- Coverage increases by expected amount
- All tests passing
- Zero regressions
- Message text validated against ZIL

### Final Metrics
- 100% coverage achieved (929/929 messages)
- All 779+ tests passing
- Zero known deviations from original
- Complete documentation

## Implementation Guidelines

### Message Implementation Checklist

For each message:
1. ✅ Locate in ZIL source (file:line)
2. ✅ Identify trigger conditions
3. ✅ Determine implementation location
4. ✅ Extract exact message text
5. ✅ Implement with proper conditions
6. ✅ Add test case
7. ✅ Validate against ZIL
8. ✅ Document any deviations

### Code Organization

- **Conditional messages**: `src/game/conditionalMessages.ts`
- **Parser messages**: `src/parser/parser.ts`, `src/parser/feedback.ts`
- **Generic messages**: `src/game/errorMessages.ts`
- **V-object messages**: `src/game/verbHandlers.ts` (new file)
- **Special messages**: `src/game/specialBehaviors.ts`
- **Puzzle messages**: `src/game/puzzles.ts`
- **Scenery messages**: `src/game/sceneryActions.ts`

### New Files Required

1. **src/game/verbHandlers.ts** - V-object message system
2. **src/parser/feedback.ts** - Parser-specific messages
3. **src/game/deadState.ts** - Death state message handling
4. **src/game/selfReference.ts** - CRETIN message handling

## Validation Strategy

### Automated Validation

```typescript
// Validate all messages are implemented
function validateCompleteCoverage(): ValidationResult {
  const zilMessages = extractAllZilMessages();
  const tsMessages = extractAllTsMessages();
  
  const missing = zilMessages.filter(m => !tsMessages.includes(m));
  const extra = tsMessages.filter(m => !zilMessages.includes(m));
  
  return {
    coverage: (tsMessages.length / zilMessages.length) * 100,
    missing: missing,
    extra: extra,
    complete: missing.length === 0
  };
}
```

### Manual Validation

- Play through game comparing to original
- Test edge cases and rare conditions
- Verify message context and timing
- Check for typos or text differences

## Risk Mitigation

### High-Risk Areas

1. **Parser Internals** - May require significant refactoring
   - Mitigation: Implement incrementally, test thoroughly
   
2. **V-Object System** - Complex verb handler architecture
   - Mitigation: Create abstraction layer, document patterns

3. **Conditional Logic** - Easy to miss edge cases
   - Mitigation: Comprehensive test coverage, state validation

4. **Message Text** - Typos or subtle differences
   - Mitigation: Automated text comparison, careful review

## Timeline Estimate

- **Batch 10-12** (Conditional): 3-4 weeks
- **Batch 13-14** (V-Object): 2-3 weeks
- **Batch 15-16** (Parser/Generic): 1-2 weeks
- **Batch 17-19** (Final): 1 week
- **Total**: 7-10 weeks for 100% coverage

## Conclusion

Achieving 100% message coverage is ambitious but achievable with systematic implementation, thorough testing, and careful validation. The batch approach allows for incremental progress with clear milestones and quality gates.
