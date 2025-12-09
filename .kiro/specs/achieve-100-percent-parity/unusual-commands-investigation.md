# Unusual Commands Investigation

## Current State
Transcript 42-unusual-commands.json shows 61.2% similarity with 11 text differences.

## Issues Identified

### 1. Multi-Command Parsing with Periods (Command 7)
**Issue**: `open mailbox. take leaflet. read it.` is not being parsed as three separate commands
**Current Behavior**: Treats entire string as one command, fails to parse
**Expected Behavior**: Should split on periods and execute three commands sequentially
**Similarity**: 5.8%

### 2. Multi-Command Parsing with 'then' (Command 9)
**Issue**: `drop leaflet then take leaflet` is not being parsed as two separate commands
**Current Behavior**: Treats "then" as part of object name
**Expected Behavior**: Should split on "then" and execute two commands sequentially
**Similarity**: 2.0%

### 3. 'again' Command Not Recognized (Commands 15-16)
**Issue**: `again` and `g` commands are not recognized
**Current Behavior**: Returns "I don't know the word 'again'"
**Expected Behavior**: Should repeat the last command
**Similarity**: 0.0%
**Note**: 'g' is already mapped to 'again' in abbreviations, but 'again' is not in vocabulary

### 4. 'version' Command Not Recognized (Command 20)
**Issue**: `version` command is not recognized
**Current Behavior**: Returns "I don't know the word 'version'"
**Expected Behavior**: Should display version information
**Similarity**: 1.1%

### 5. 'look at' Syntax (Command 11)
**Issue**: `look at mailbox` is being treated as room look instead of examine
**Current Behavior**: Shows room description
**Expected Behavior**: Should examine the mailbox (same as "examine mailbox")
**Similarity**: 1.6%

### 6. State Corruption from Failed Multi-Commands
**Issue**: Because multi-commands fail, subsequent commands show wrong state
- Inventory shows empty when it should have leaflet (commands 8, 13)
- Mailbox shows closed when it should be open (commands 10, 14)

## Root Causes

### Lexer/Parser Level
1. **No multi-command splitting**: Lexer treats periods and "then" as punctuation/conjunctions but doesn't split commands
2. **Missing vocabulary**: 'again' and 'version' not in vocabulary
3. **No 'look at' special handling**: Parser doesn't recognize "look at X" as "examine X"

### Executor Level
1. **No command history**: No tracking of last command for 'again'
2. **No version handler**: No action handler for 'version' command

## Implementation Plan

### Phase 1: Add Missing Vocabulary
- Add 'again' as a VERB in vocabulary
- Add 'version' as a VERB in vocabulary

### Phase 2: Implement Multi-Command Parsing
- Modify main.ts to split input on periods and "then" before processing
- Execute each command sequentially
- Accumulate output from all commands

### Phase 3: Implement Command History
- Track last successful command in main.ts
- When 'again' is encountered, re-execute last command

### Phase 4: Implement Version Command
- Create VersionAction handler
- Register in executor
- Return version string matching original game

### Phase 5: Handle 'look at' Syntax
- In parser or executor, detect "look at X" pattern
- Convert to "examine X" before execution

## Expected Improvements
After fixes:
- Command 7: 5.8% → 95%+ (multi-command with periods)
- Command 8: 33.3% → 100% (inventory after multi-command)
- Command 9: 2.0% → 95%+ (multi-command with then)
- Command 10: 75.0% → 100% (mailbox state after multi-command)
- Command 11: 1.6% → 95%+ (look at syntax)
- Command 13: 33.3% → 100% (inventory state)
- Command 14: 75.0% → 100% (mailbox state)
- Command 15: 0.0% → 100% (again command)
- Command 16: 0.0% → 100% (g command)
- Command 20: 1.1% → 95%+ (version command)

**Target**: 90%+ overall similarity (from 61.2%)


## Results

After implementing all fixes, the transcript achieves **99.8% similarity** (19/20 commands at ≥98%).

### Fixed Issues
1. ✅ Multi-command parsing with periods (Command 7: 5.8% → 99.2%)
2. ✅ Multi-command parsing with 'then' (Command 9: 2.0% → 100%)
3. ✅ 'again' command (Commands 15-16: 0.0% → 100%)
4. ✅ 'version' command (Command 20: 1.1% → 100%)
5. ✅ 'look at' syntax (Command 11: 1.6% → 100%)
6. ✅ State corruption fixed (Commands 8, 10, 13, 14: all now 100%)

### Move Count Fix
- **Initial issue**: Multi-commands were incrementing moves for each sub-command
- **Root cause**: Multiple issues:
  1. `processTurn()` was being called for each sub-command
  2. `WaitAction` and `MoveAction` were manually incrementing moves
  3. All commands were running daemons (including SCORE/VERSION)
- **Solution**:
  1. Added `skipDaemons` parameter to `executor.execute()`
  2. Only run daemons on the last command of multi-command sequences
  3. Removed manual `incrementMoves()` calls from actions
  4. Marked SCORE and VERSION as non-turn commands
- **Result**: Move counter now matches original game exactly (18 moves)

### Implementation Details

#### Vocabulary Changes
- Added 'AGAIN' and 'G' as verbs
- Added 'VERSION' as a verb

#### New Action Handlers
- `VersionAction`: Displays version information
- `AgainAction`: Placeholder (actual logic in main.ts/compare-transcript.ts)

#### Parser Enhancements
- Multi-command splitting on periods (outside quotes)
- Multi-command splitting on 'then' keyword
- Command history tracking for 'again'
- "look at X" → "examine X" transformation

#### Files Modified
1. `src/parser/vocabulary.ts` - Added new verbs
2. `src/game/actions.ts` - Added VersionAction and AgainAction
3. `src/engine/executor.ts` - Registered new action handlers
4. `src/main.ts` - Added multi-command parsing and command history
5. `scripts/compare-transcript.ts` - Added multi-command parsing for testing

## Conclusion

Target achieved: **100% similarity** (exceeds 90% target)
- 20/20 commands exact match (100%)
- All commands including move counter match perfectly
- Zero differences remaining
