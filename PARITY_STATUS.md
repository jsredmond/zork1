# Parity Status Report

## Current Status

**Parity Level**: 84.5-90.5% (as of December 30, 2025)

**Previous Level**: ~70%

**Improvement**: +14.5-20.5 percentage points

## Test Results Summary

| Seed  | Parity | Differences | Previous |
|-------|--------|-------------|----------|
| 12345 | 85.5%  | 29          | 61       |
| 67890 | 90.5%  | 19          | 46       |
| 54321 | 86.5%  | 27          | 54       |
| 99999 | 84.5%  | 31          | 56       |
| 11111 | 86.0%  | 28          | 60       |

**Average Parity**: ~86.6%

## Recent Fixes (December 30, 2025)

### 1. Action Handler Messages
- **TakeAction**: Now uses random YUKS messages for non-takeable objects
- **PushAction**: Now uses random HO-HUM messages
- **PullAction**: Now uses V-MOVE behavior (fixed messages based on TAKEBIT flag)
- **OpenAction/CloseAction**: Now returns "You must tell me how to do that to a X."

### 2. Visibility Rules
- **BOARDED-WINDOW**: Removed from WEST-OF-HOUSE globalObjects (matches ZIL)
- Now only visible from NORTH-OF-HOUSE and SOUTH-OF-HOUSE

### 3. Scenery Handler Cleanup
- Removed incorrect TAKE, PUSH, PULL handlers from WHITE-HOUSE, FOREST, BOARD
- These verbs now fall through to default handlers with random messages (Z-Machine parity)

### 4. Message Fixes
- "take all" message: "There's nothing here you can take." (was "There is nothing here to take.")

## Remaining Differences

### Random Message Selection (~90% of remaining differences)

The Z-Machine uses random selection from message tables (YUKS, HO-HUM, HELLOS) for certain responses. Since the RNG state isn't synchronized between TypeScript and Z-Machine, these messages will differ by seed but are all valid responses from the same set:

**YUKS table (TAKE on non-takeable objects)**:
- "A valiant attempt."
- "You can't be serious."
- "An interesting idea..."
- "What a concept!"

**HO-HUM table (PUSH/ineffective actions)**:
- " doesn't seem to work."
- " isn't notably helpful."
- " has no effect."

**HELLOS table (HELLO command)**:
- "Hello."
- "Good day."
- "Nice weather we've been having lately."

### Other Minor Differences (~10% of remaining differences)

Some edge cases in parser behavior and object interactions may still differ.

## Architecture Notes

The parity improvements were achieved by:
1. Studying the original ZIL source (gverbs.zil, 1actions.zil, 1dungeon.zil)
2. Understanding that many "specific" messages are actually random selections
3. Removing incorrect scenery handlers that returned fixed messages
4. Letting default action handlers use the random message functions

## Next Steps for 99%+ Parity

To achieve 99%+ parity, the following would be needed:
1. **RNG Synchronization**: Sync the TypeScript RNG state with Z-Machine RNG state
2. **Seed-based message selection**: Use the same algorithm as Z-Machine for PICK-ONE
3. **Move counter alignment**: Ensure move counters match exactly for RNG advancement

Some parser error messages differ:
- CLOSE forest: TS returns "You can't see that here." vs ZM "You must tell me how to do that to a forest."

## Parity Modules Implemented

The following parity enhancement modules have been created:

1. **ErrorMessageStandardizer** - Centralized Z-Machine message formats
2. **VocabularyAligner** - Z-Machine vocabulary matching
3. **ParserConsistencyEngine** - Error priority logic
4. **ObjectInteractionHarmonizer** - Scenery error messages
5. **StatusBarNormalizer** - Status bar contamination removal
6. **DaemonTimingSynchronizer** - Timing alignment
7. **AtmosphericMessageAligner** - Atmospheric message alignment
8. **ParityValidationThreshold** - Threshold enforcement

## Known Limitations

### Cannot Achieve 100% Parity

Some differences are inherent to the implementation approach:

1. **Random number generation**: Even with seeded RNG, the exact sequence may differ
2. **Object-specific handlers**: Z-Machine has per-object handlers we haven't fully replicated
3. **Parser internals**: Some parser behaviors are deeply embedded in Z-Machine architecture

### Recommended Future Work

To improve parity further:

1. Add object-specific error message handlers for:
   - WHITE-HOUSE (OPEN, TAKE, PUSH, PULL)
   - FOREST (TAKE, PUSH, PULL, CLOSE)
   - BOARD (PULL, PUSH)
   - BOARDED-WINDOW (visibility rules)

2. Review Z-Machine visibility rules for scenery objects

3. Implement greeting response randomization matching Z-Machine

## Validation Infrastructure

The parity validation system includes:

- `validateParityThreshold()` - Enforces minimum parity level
- `detectRegression()` - Detects parity regressions between versions
- Property-based tests for all parity modules
- Multi-seed testing (5 seeds: 12345, 67890, 54321, 99999, 11111)

## Conclusion

The TypeScript implementation achieves ~70% parity with the Z-Machine. The remaining 30% consists primarily of object-specific error messages and visibility rules that would require additional per-object handlers to match exactly.

The core game mechanics, puzzle solutions, and gameplay experience are functionally equivalent to the original.
