# Troll Puzzle Transcript Status

## Task: 14.3.3 Fix troll puzzle transcript (75.5% → 100%)

### Current Status: IN PROGRESS

### Achievements:
1. ✅ **Sword Glow Fixed**: The sword now glows when entering the troll room
   - Fixed by adding `processTurn()` call in executor after each command
   - Daemon output is now captured and appended to command result
   - Command 12 now matches at 99.0% (whitespace only difference)

### Remaining Issues:

#### 1. Combat Messages Don't Match (Commands 14-16)
**Current Similarity**: 4.0%, 2.4%, 3.3%
**Target**: 100%

**Expected Combat Sequence** (from transcript with seed 12345):
- Attack 1: "The troll fends you off with a menacing gesture.\nThe axe crashes against the rock, throwing sparks!"
- Attack 2: "The troll's weapon is knocked to the floor, leaving him unarmed.\nThe troll, angered and humiliated, recovers his weapon..."
- Attack 3: "The fatal blow strikes the troll square in the heart: He dies.\nAlmost as soon as the troll breathes his last breath..."

**Actual Combat Sequence**:
- Attack 1: "You miss the troll by an inch.\nThe troll wounds you seriously with his axe!"
- Attack 2: "You miss the troll by an inch."
- Attack 3: "The troll is battered into unconsciousness."

**Analysis**:
- The "fends you off" message is the movement blocking message, not a combat message
- The transcript shows this message appearing during combat, suggesting special troll behavior
- The combat system is using random messages from HERO-MELEE and TROLL-MELEE tables
- Even with deterministic RNG (seed 12345), the messages don't match the transcript
- This suggests either:
  1. The transcript is from a different version of the game
  2. The troll has special scripted combat behavior not yet implemented
  3. The combat system works differently than currently understood

**Possible Solutions**:
1. Implement special troll combat behavior that overrides standard combat
2. Investigate if there's a scripted combat sequence for the troll
3. Check if the combat tables need different selection logic
4. Verify the transcript is accurate by playing the original game with same seed

#### 2. Troll Not Removed After Death (Command 17)
**Current Similarity**: 61.0%
**Target**: 100%

**Expected**: Troll should disappear, only axe remains
**Actual**: Troll still present in room description

**Analysis**:
- The combat system is marking the troll as unconscious, not dead
- The troll removal logic in combat.ts should be triggered when strength reaches 0
- Need to verify the death sequence is properly implemented

#### 3. Object Ordering (Command 5)
**Current Similarity**: 63.4%
**Target**: Deferred to task 14.3.9

**Issue**: Objects in living room appear in wrong order (cosmetic issue)

### Next Steps:
1. Investigate troll combat behavior in ZIL source more thoroughly
2. Check if there's special handling for first troll encounter
3. Verify troll death/removal logic
4. Consider if the transcript needs to be re-recorded from original game

### Files Modified:
- `src/engine/executor.ts`: Added processTurn() call and daemon output capture

### Test Command:
```bash
npx tsx scripts/compare-transcript.ts .kiro/transcripts/critical/05-troll-puzzle.json
```

### Current Results:
- Total commands: 17
- Exact matches: 5 (29.4%)
- Matched (≥98%): 12 (70.6%) - improved from 11
- Average similarity: 77.3%
- Status: ✗ FAILED (need 100% for critical transcripts)
