# Day-by-Day Implementation Plan: 95% Message Coverage

**Goal**: Implement 207+ messages to reach 95% coverage (883/929 messages)  
**Current**: 72.77% (676/929 messages)  
**Timeline**: 10 working days  
**Approach**: Systematic batch implementation with validation checkpoints

---

## Overview

This plan breaks down the implementation into manageable daily tasks, each with:
- Specific messages to implement
- Files to modify
- Validation steps
- Success criteria

**Daily Pattern**:
1. Morning: Implement messages (2-3 hours)
2. Midday: Run validation and tests (30 min)
3. Afternoon: Fix issues and commit (1 hour)
4. End of day: Update progress tracking

---

## Week 1: Foundation (Days 1-5)

### Day 1: Quick Wins - Simple Messages (20 messages)

**Target**: 696/929 messages (74.9%)  
**Effort**: 3-4 hours

#### Tasks

**1. THIEF message (1 message)**
- File: `src/engine/thief.ts`
- Message: "your possession Doing unto others before..."
- Context: Thief stealing message variation
- Implementation: Add to thief dialogue array

**2. MIRROR message (1 message)**
- File: `src/game/puzzles.ts`
- Message: "You feel a faint tingling transmitted through the ."
- Context: RUB action on mirror
- Implementation: Add RUB handler for MIRROR-1 and MIRROR-2

**3. HOT-BELL messages (2 messages)**
- File: `src/game/specialBehaviors.ts`
- Messages:
  - "The heat from the bell is too intense."
  - "The water cools the bell and is evaporated."
- Context: HOT-BELL interactions
- Implementation: Enhance HOT-BELL handler

**4. TORCH messages (2 messages)**
- File: `src/game/actions.ts`
- Messages:
  - "The torch is burning."
  - "The torch has burned out."
- Context: Torch state messages
- Implementation: Add torch state handling

**5. CHASM messages (3 messages)**
- File: `src/game/sceneryActions.ts`
- Messages:
  - "The chasm probably leads straight to Hades."
  - "You can't cross the chasm."
  - "You can't reach the other side."
- Context: CHASM scenery interactions
- Implementation: Add CHASM handler

**6. VERB-THROW messages (3 messages)**
- File: `src/game/actions.ts`
- Messages:
  - "The bottle hits the far wall and shatters."
  - "A brilliant maneuver destroys the bottle."
  - "The water spills to the floor and evaporates."
- Context: THROW action variations
- Implementation: Enhance THROW handler with object-specific messages

**7. Miscellaneous simple messages (8 messages)**
- Files: `src/game/sceneryActions.ts`, `src/game/actions.ts`
- Various simple scenery and action messages
- Implementation: Add handlers as needed

#### Validation

```bash
# Run validation
npx tsx scripts/verify-coverage-threshold.ts

# Expected: ~75% coverage
# Run tests
npm test

# Expected: All tests passing
```

#### Success Criteria
- ✅ Coverage increases to ~75%
- ✅ All tests passing
- ✅ No regressions

#### Commit
```bash
git add .
git commit -m "feat: add 20 quick win messages (Day 1)"
```

---

### Day 2: High-Priority Objects (10 messages)

**Target**: 706/929 messages (76.0%)  
**Effort**: 3-4 hours

#### Tasks

**1. ROPE messages (4 messages)**
- File: `src/game/puzzles.ts`
- Messages:
  - "The rope drops over the side and comes within ten feet of th..."
  - "Your attempt to tie up the  awakens him. The  struggles and ..."
  - "The  struggles and you cannot tie him up."
  - Additional rope interaction messages
- Context: Rope puzzle mechanics
- Implementation: Enhance rope TIE/CLIMB handlers

**2. BOTTLE messages (3 messages)**
- File: `src/game/specialBehaviors.ts`
- Messages:
  - "The bottle hits the far wall and shatters."
  - "A brilliant maneuver destroys the bottle."
  - "The water spills to the floor and evaporates."
- Context: Bottle destruction and water interactions
- Implementation: Add THROW and MUNG handlers for BOTTLE

**3. TRAP-DOOR messages (3 messages)**
- File: `src/game/actions.ts`
- Messages:
  - "It's closed."
  - "The trap door crashes shut, and you hear someone barring it."
  - Additional trap door state messages
- Context: Trap door interactions
- Implementation: Enhance trap door handler

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~76%
- ✅ Rope puzzle messages working
- ✅ Bottle interactions correct
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 10 high-priority object messages (Day 2)"
```

---

### Day 3: Water & Container Logic (25 messages)

**Target**: 731/929 messages (78.7%)  
**Effort**: 4-5 hours

#### Tasks

**1. WATER in BOTTLE messages (8 messages)**
- File: `src/game/specialBehaviors.ts`
- Messages:
  - "It's in the bottle. Perhaps you should take that instead."
  - "The water spills to the floor and evaporates immediately."
  - "The water splashes on the walls and evaporates immediately."
  - Additional water/bottle interaction messages
- Context: TAKE, THROW, POUR actions with water in bottle
- Implementation: Enhance WATER handler with bottle state checks

**2. Container interaction messages (10 messages)**
- Files: `src/game/actions.ts`, `src/game/specialBehaviors.ts`
- Messages for:
  - Putting water in containers
  - Taking water from containers
  - Container state messages
- Implementation: Enhance container handlers

**3. Location-dependent water messages (7 messages)**
- File: `src/game/specialBehaviors.ts`
- Messages for water availability in different locations
- Implementation: Add location checks to WATER handler

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~79%
- ✅ Water/bottle interactions working correctly
- ✅ Container logic functional
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 25 water and container messages (Day 3)"
```

---

### Day 4: Scenery & Simple Interactions (30 messages)

**Target**: 761/929 messages (81.9%)  
**Effort**: 4-5 hours

#### Tasks

**1. WHITE-HOUSE messages (2 messages)**
- File: `src/game/sceneryActions.ts`
- Messages:
  - "You're not at the house."
  - "It's right here! Are you blind or something?"
- Implementation: Enhance WHITE-HOUSE handler with location checks

**2. FOREST messages (2 messages)**
- File: `src/game/sceneryActions.ts`
- Messages:
  - "The pines and the hemlocks seem to be murmuring."
  - Additional forest interaction messages
- Implementation: Add LISTEN handler for FOREST

**3. MOUNTAIN-RANGE messages (2 messages)**
- File: `src/game/sceneryActions.ts`
- Messages:
  - "Don't you believe me? The mountains are impassable!"
  - Additional mountain messages
- Implementation: Enhance MOUNTAIN-RANGE handler

**4. Additional scenery objects (24 messages)**
- File: `src/game/sceneryActions.ts`
- Objects: CHIMNEY, BOARDED-WINDOW, NAILS, TROPHY-CASE, etc.
- Messages: Various scenery interaction messages
- Implementation: Add handlers for remaining scenery objects

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~82%
- ✅ Scenery interactions complete
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 30 scenery interaction messages (Day 4)"
```

---

### Day 5: Puzzle-Specific Messages (25 messages)

**Target**: 786/929 messages (84.6%)  
**Effort**: 4-5 hours

#### Tasks

**1. BELL messages (3 messages)**
- File: `src/game/puzzles.ts`
- Messages:
  - "Ding, dong."
  - "The bell cannot be rung in this location."
  - Additional bell messages
- Implementation: Enhance BELL RING handler

**2. DAM/BOLT messages (5 messages)**
- File: `src/game/puzzles.ts`
- Messages for dam puzzle interactions
- Implementation: Enhance dam puzzle handlers

**3. CYCLOPS messages (5 messages)**
- File: `src/engine/cyclops.ts`
- Messages for cyclops dialogue and interactions
- Implementation: Add cyclops dialogue variations

**4. BASKET/ROPE messages (5 messages)**
- File: `src/game/puzzles.ts`
- Messages for basket raising/lowering
- Implementation: Enhance basket mechanics

**5. Other puzzle messages (7 messages)**
- Files: Various puzzle files
- Messages for rainbow, machine, etc.
- Implementation: Add missing puzzle feedback

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~85%
- ✅ Puzzle messages complete
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 25 puzzle-specific messages (Day 5)"
```

---

## Week 2: Reach 95% Target (Days 6-10)

### Day 6: Conditional Messages Part 1 (30 messages)

**Target**: 816/929 messages (87.8%)  
**Effort**: 4-5 hours

#### Tasks

**1. Room description variations (15 messages)**
- File: `src/game/conditionalMessages.ts`
- Messages: Flag-dependent room descriptions
- Implementation: Add conditional variants for rooms

**2. Object description variations (15 messages)**
- File: `src/game/conditionalMessages.ts`
- Messages: State-dependent object descriptions
- Implementation: Add conditional variants for objects

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~88%
- ✅ Conditional messages working
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 30 conditional messages part 1 (Day 6)"
```

---

### Day 7: Conditional Messages Part 2 (30 messages)

**Target**: 846/929 messages (91.1%)  
**Effort**: 4-5 hours

#### Tasks

**1. Time-dependent messages (15 messages)**
- File: `src/game/conditionalMessages.ts`
- Messages: Lamp dimming, candle burning stages
- Implementation: Add time-based message variations

**2. Multi-flag conditions (15 messages)**
- File: `src/game/conditionalMessages.ts`
- Messages: Complex conditional messages
- Implementation: Add multi-condition handlers

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~91%
- ✅ Complex conditionals working
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 30 conditional messages part 2 (Day 7)"
```

---

### Day 8: Generic & Error Messages (30 messages)

**Target**: 876/929 messages (94.3%)  
**Effort**: 4-5 hours

#### Tasks

**1. Generic refusal messages (15 messages)**
- File: `src/game/errorMessages.ts`
- Messages: "You can't do that." variations
- Implementation: Add generic message variations

**2. Error messages (15 messages)**
- File: `src/game/errorMessages.ts`
- Messages: Invalid action feedback
- Implementation: Add error message handlers

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage increases to ~94%
- ✅ Error handling complete
- ✅ All tests passing

#### Commit
```bash
git commit -m "feat: add 30 generic and error messages (Day 8)"
```

---

### Day 9: Final Push to 95% (20 messages)

**Target**: 896/929 messages (96.4%)  
**Effort**: 3-4 hours

#### Tasks

**1. Remaining high-value messages (20 messages)**
- Files: Various
- Messages: Highest-impact remaining messages
- Implementation: Add final critical messages

#### Validation

```bash
npx tsx scripts/verify-coverage-threshold.ts
npm test
```

#### Success Criteria
- ✅ Coverage reaches 95%+ ✅
- ✅ All tests passing
- ✅ No regressions

#### Commit
```bash
git commit -m "feat: reach 95% message coverage (Day 9)"
```

---

### Day 10: Polish, Testing & Documentation

**Target**: Maintain 95%+  
**Effort**: 4-5 hours

#### Tasks

**1. Comprehensive testing (2 hours)**
- Run full test suite multiple times
- Test edge cases
- Validate all new messages

**2. Documentation updates (1 hour)**
- Update final accuracy report
- Update README
- Document any known limitations

**3. Final validation (1 hour)**
- Run validation 3 times
- Verify consistent 95%+ coverage
- Generate final reports

**4. Code review and cleanup (1 hour)**
- Review all changes
- Clean up any TODO comments
- Ensure code quality

#### Validation

```bash
# Run validation 3 times
for i in {1..3}; do
  echo "=== Run $i ==="
  npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"
done

# Run full test suite
npm test

# Generate final report
npx tsx scripts/generate-final-report.ts
```

#### Success Criteria
- ✅ Coverage consistently 95%+
- ✅ All 779+ tests passing
- ✅ Zero regressions
- ✅ Documentation complete

#### Commit
```bash
git commit -m "docs: update documentation for 95% coverage achievement"
```

---

## Daily Workflow Template

### Morning (2-3 hours)
1. Review day's tasks
2. Read missing messages for the day
3. Implement messages in batches of 5-10
4. Test each batch locally

### Midday (30 min)
1. Run validation: `npx tsx scripts/verify-coverage-threshold.ts`
2. Run tests: `npm test`
3. Check coverage increase

### Afternoon (1 hour)
1. Fix any failing tests
2. Address validation issues
3. Commit changes
4. Update progress tracking

### End of Day (15 min)
1. Document progress
2. Note any blockers
3. Plan next day's work

---

## Progress Tracking

### Daily Checklist

Create a file `.kiro/testing/implementation-progress.md` and update daily:

```markdown
# Implementation Progress

## Day 1: ⬜ Not Started / 🔄 In Progress / ✅ Complete
- Messages implemented: 0/20
- Coverage: 72.77%
- Tests passing: Yes/No
- Blockers: None

## Day 2: ⬜
...
```

---

## Validation Commands

### Quick Coverage Check
```bash
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"
```

### Detailed Validation
```bash
npx tsx scripts/validate-messages.ts
```

### Test Suite
```bash
npm test
```

### Generate Report
```bash
npx tsx scripts/generate-final-report.ts
```

---

## Tips for Success

### 1. Start Each Day Fresh
- Review the plan
- Check validation results
- Set clear goals

### 2. Batch Similar Messages
- Group by object
- Group by verb
- Group by file

### 3. Test Frequently
- After every 5-10 messages
- Before committing
- End of each session

### 4. Commit Often
- After each successful batch
- With descriptive messages
- Enable easy rollback

### 5. Track Progress
- Update daily checklist
- Note coverage increases
- Document blockers

### 6. Ask for Help
- If stuck on complex conditionals
- If tests fail repeatedly
- If coverage doesn't increase

---

## Troubleshooting

### Coverage Not Increasing
- Check message text matches exactly
- Verify whitespace normalization
- Ensure messages are in correct files

### Tests Failing
- Run tests before changes (baseline)
- Isolate failing test
- Check for typos in messages

### Complex Conditionals
- Review ZIL source code
- Start with simple conditions
- Add complexity incrementally

### Performance Issues
- Batch commits
- Run validation less frequently
- Use quick coverage check

---

## Success Metrics

### Daily Targets
- Day 1: 75% coverage
- Day 2: 76% coverage
- Day 3: 79% coverage
- Day 4: 82% coverage
- Day 5: 85% coverage
- Day 6: 88% coverage
- Day 7: 91% coverage
- Day 8: 94% coverage
- Day 9: 95%+ coverage ✅
- Day 10: Maintain 95%+

### Final Goals
- ✅ 95%+ message coverage
- ✅ 779+ tests passing
- ✅ Zero regressions
- ✅ Documentation complete

---

## Next Steps

1. **Review this plan** - Understand the approach
2. **Set up tracking** - Create progress file
3. **Start Day 1** - Begin with quick wins
4. **Stay consistent** - Follow daily workflow
5. **Celebrate milestones** - Acknowledge progress

**Ready to start? Begin with Day 1: Quick Wins!**

Good luck! 🚀
