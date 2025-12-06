# Quick Reference Guide: Message Implementation

A cheat sheet for implementing the remaining 253 messages.

---

## 🚀 Getting Started

### 1. Check Current Status
```bash
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"
```

### 2. See What's Next
```bash
npx tsx scripts/identify-next-messages.ts
```

### 3. View Detailed Missing Messages
```bash
cat .kiro/testing/missing-messages-detailed.md
```

---

## 📁 Key Files to Edit

### Scenery Messages
**File**: `src/game/sceneryActions.ts`  
**Pattern**:
```typescript
{
  objectId: 'OBJECT-NAME',
  actions: new Map([
    ['VERB', (state) => 'Message text here.'],
  ])
}
```

### Special Behaviors
**File**: `src/game/specialBehaviors.ts`  
**Pattern**:
```typescript
{
  objectId: 'OBJECT-NAME',
  condition: (state) => /* check condition */,
  handler: (verb, state) => {
    if (verb === 'ACTION') return 'Message text.';
    return null;
  }
}
```

### Conditional Messages
**File**: `src/game/conditionalMessages.ts`  
**Pattern**:
```typescript
{
  messageId: 'MESSAGE-ID',
  variants: [
    {
      condition: (state) => state.flags.SOME_FLAG,
      message: 'Conditional message.'
    }
  ],
  defaultMessage: 'Default message.'
}
```

### Action Handlers
**File**: `src/game/actions.ts`  
**Pattern**: Add to existing action functions

### Error Messages
**File**: `src/game/errorMessages.ts`  
**Pattern**: Add to error message arrays

---

## 🔍 Finding Messages in ZIL

### Location in ZIL Files
- **1actions.zil**: Object-specific actions and responses
- **gverbs.zil**: Generic verb handlers
- **1dungeon.zil**: Object and room descriptions

### Reading ZIL Messages
```zil
<ROUTINE OBJECT-F (...)
  <COND
    (<VERB? ACTION>
      <TELL "Message text here.">)>>
```

Becomes:
```typescript
if (verb === 'ACTION') {
  return 'Message text here.';
}
```

---

## ✅ Validation Workflow

### After Each Batch (5-10 messages)

1. **Save files**
2. **Run quick check**:
   ```bash
   npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"
   ```
3. **If coverage increased**: Continue
4. **If coverage didn't increase**: Check message text

### After Each Session

1. **Run full validation**:
   ```bash
   npx tsx scripts/verify-coverage-threshold.ts
   ```
2. **Run tests**:
   ```bash
   npm test
   ```
3. **Commit if passing**:
   ```bash
   git add .
   git commit -m "feat: add [N] messages - [description]"
   ```

---

## 🐛 Troubleshooting

### Coverage Not Increasing

**Problem**: Added messages but coverage stays same

**Solutions**:
1. Check exact text match (including punctuation)
2. Verify message is in correct file
3. Ensure message is actually returned (not in dead code)
4. Check for typos

**Debug**:
```bash
# Search for your message in TypeScript
grep -r "your message text" src/
```

### Tests Failing

**Problem**: Tests fail after adding messages

**Solutions**:
1. Run tests before changes (establish baseline)
2. Check if message breaks existing logic
3. Verify conditional logic is correct
4. Look for syntax errors

**Debug**:
```bash
# Run specific test file
npm test -- src/game/actions.test.ts
```

### Message Not Found by Validator

**Problem**: Message is in code but validator doesn't find it

**Solutions**:
1. Check whitespace (validator normalizes)
2. Verify message is in `src/` directory
3. Ensure message is in a `.ts` file
4. Check for string concatenation (validator may miss)

---

## 📊 Progress Tracking

### Update Progress File
Edit `.kiro/testing/implementation-progress.md` after each day:
- Mark tasks complete: `- [x]`
- Update coverage percentage
- Note any blockers

### Check Milestones
```bash
# Current coverage
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"

# Messages remaining to 95%
# Target: 883 messages
# Current: [check output]
```

---

## 💡 Implementation Tips

### 1. Batch Similar Messages
Group by:
- Same object (all ROPE messages together)
- Same verb (all THROW messages together)
- Same file (all scenery together)

### 2. Start Simple
- Begin with messages that have no conditions
- Add conditional logic later
- Test frequently

### 3. Copy Patterns
- Find similar existing messages
- Copy the pattern
- Modify for your message

### 4. Test Edge Cases
- What if object not present?
- What if wrong game state?
- What if invalid combination?

### 5. Commit Often
- After each successful batch
- Before trying complex changes
- When tests are passing

---

## 🎯 Daily Workflow

### Morning (2-3 hours)
```bash
# 1. Check plan
cat .kiro/specs/complete-text-accuracy/day-by-day-implementation-plan.md

# 2. See what's next
npx tsx scripts/identify-next-messages.ts

# 3. Start implementing
# Edit files, add messages

# 4. Quick check every 5-10 messages
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"
```

### Midday (30 min)
```bash
# 1. Full validation
npx tsx scripts/verify-coverage-threshold.ts

# 2. Run tests
npm test

# 3. Check progress
# Compare coverage to target
```

### Afternoon (1 hour)
```bash
# 1. Fix any issues
# 2. Final validation
npx tsx scripts/verify-coverage-threshold.ts
npm test

# 3. Commit
git add .
git commit -m "feat: add [N] messages - [description]"

# 4. Update progress
# Edit .kiro/testing/implementation-progress.md
```

---

## 📝 Message Categories

### Quick Reference

| Category | File | Effort | Priority |
|----------|------|--------|----------|
| Scenery | sceneryActions.ts | Low | Low |
| Special | specialBehaviors.ts | Medium | High |
| Conditional | conditionalMessages.ts | High | Medium |
| Actions | actions.ts | Medium | Medium |
| Errors | errorMessages.ts | Low | Medium |
| Puzzles | puzzles.ts | High | High |
| NPCs | actors.ts, thief.ts, etc. | High | High |

---

## 🔗 Useful Commands

### Coverage & Validation
```bash
# Quick coverage check
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"

# Full validation report
npx tsx scripts/verify-coverage-threshold.ts

# Detailed missing messages
npx tsx scripts/validate-messages.ts

# Generate final report
npx tsx scripts/generate-final-report.ts

# Identify next batch
npx tsx scripts/identify-next-messages.ts
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/game/actions.test.ts

# Run tests in watch mode (for development)
npm test -- --watch
```

### Git
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "feat: add [N] messages - [description]"

# View recent commits
git log --oneline -5

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

---

## 🎉 Success Criteria

### Daily
- ✅ Coverage increases by target amount
- ✅ All tests passing
- ✅ Changes committed
- ✅ Progress tracked

### Final (Day 10)
- ✅ 95%+ coverage (883+ messages)
- ✅ 779+ tests passing
- ✅ Zero regressions
- ✅ Documentation updated

---

## 📞 Need Help?

### Stuck on Implementation?
1. Review similar existing messages
2. Check ZIL source for context
3. Start with simpler version
4. Add complexity incrementally

### Tests Failing?
1. Run tests before changes
2. Isolate the failing test
3. Check error message carefully
4. Verify message logic

### Coverage Not Increasing?
1. Check message text exactly
2. Verify file location
3. Ensure message is reachable
4. Test manually in game

---

**Remember**: Progress over perfection. Implement messages in batches, validate frequently, and commit often!

Good luck! 🚀
