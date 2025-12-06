# Batch 1 Implementation Guide

This guide provides the exact code changes needed to implement all 20 messages in Batch 1.

## Summary

**Target**: 20 messages → 75% coverage (696/929 messages)  
**Files to modify**: 3 main files  
**Estimated time**: 3-4 hours

---

## File 1: src/game/actions.ts

### Add RING action handler for BELL

Add this new action class after the existing action handlers:

```typescript
/**
 * RING action handler
 * Allows player to ring bells
 */
export class RingAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    const obj = state.getObject(objectId) as GameObjectImpl;
    
    if (!obj) {
      return {
        success: false,
        message: "You can't see that here.",
        stateChanges: []
      };
    }

    // BELL in LLD-ROOM
    if (objectId === 'BELL' && state.currentRoom === 'LLD-ROOM') {
      return {
        success: true,
        message: "Ding, dong.",
        stateChanges: []
      };
    }

    // Default ring response
    return {
      success: false,
      message: "How, exactly, can you ring that?",
      stateChanges: []
    };
  }
}
```

### Modify TAKE action to handle TROPHY-CASE

In the `TakeAction.execute()` method, add this check before the takeable check:

```typescript
// Special case: TROPHY-CASE
if (objectId === 'TROPHY-CASE') {
  return {
    success: false,
    message: "The trophy case is securely fastened to the wall.",
    stateChanges: []
  };
}
```

### Add CLIMB action handler for chimney

```typescript
/**
 * CLIMB action handler  
 * Handles climbing actions
 */
export class ClimbAction implements ActionHandler {
  execute(state: GameState, objectId: string): ActionResult {
    // UP-CHIMNEY without rope
    if (objectId === 'CHIMNEY' && state.currentRoom === 'LIVING-ROOM') {
      if (!state.isInInventory('ROPE')) {
        return {
          success: false,
          message: "Going up empty-handed is a bad idea.",
          stateChanges: []
        };
      }
    }

    return {
      success: false,
      message: "You can't climb that.",
      stateChanges: []
    };
  }
}
```

### Modify OPEN action for TRAP-DOOR

In the `OpenAction.execute()` method, add:

```typescript
// TRAP-DOOR when closed
if (objectId === 'TRAP-DOOR' && !obj.hasFlag(ObjectFlag.OPEN)) {
  return {
    success: false,
    message: "It's closed.",
    stateChanges: []
  };
}
```

---

## File 2: src/game/sceneryActions.ts

### Add BOARDED-WINDOW handler

Add after existing handlers:

```typescript
/**
 * BOARDED-WINDOW scenery handler
 */
const boardedWindowHandler: SceneryHandler = {
  objectId: 'BOARDED-WINDOW',
  actions: new Map([
    ['OPEN', () => "The windows are boarded and can't be opened."],
    ['EXAMINE', () => "The windows are boarded and can't be opened."]
  ])
};

registerSceneryHandler(boardedWindowHandler);
```

### Add NAILS handler

```typescript
/**
 * NAILS pseudo-object handler
 */
const nailsHandler: SceneryHandler = {
  objectId: 'NAILS',
  actions: new Map([
    ['TAKE', () => 'The nails, deeply imbedded in the door, cannot be removed.'],
    ['REMOVE', () => 'The nails, deeply imbedded in the door, cannot be removed.'],
    ['PULL', () => 'The nails, deeply imbedded in the door, cannot be removed.']
  ])
};

registerSceneryHandler(nailsHandler);
```

### Update WHITE-HOUSE handler

Add these actions to the existing whiteHouseHandler:

```typescript
['WALK-AROUND', (state) => {
  const atHouse = ['KITCHEN', 'LIVING-ROOM', 'ATTIC', 'EAST-OF-HOUSE', 
                   'WEST-OF-HOUSE', 'NORTH-OF-HOUSE', 'SOUTH-OF-HOUSE', 
                   'CLEARING'].includes(state.currentRoom);
  if (!atHouse) {
    return "You're not at the house.";
  }
  return "The house is a beautiful colonial house.";
}],
['FIND', (state) => {
  const atHouse = ['KITCHEN', 'LIVING-ROOM', 'ATTIC', 'EAST-OF-HOUSE', 
                   'WEST-OF-HOUSE', 'NORTH-OF-HOUSE', 'SOUTH-OF-HOUSE', 
                   'CLEARING'].includes(state.currentRoom);
  if (atHouse) {
    return "It's right here! Are you blind or something?";
  }
  return "You can't see any white house here.";
}]
```

### Add FOREST handler

```typescript
/**
 * FOREST scenery handler
 */
const forestHandler: SceneryHandler = {
  objectId: 'FOREST',
  actions: new Map([
    ['LISTEN', (state) => {
      if (state.currentRoom === 'EAST-OF-HOUSE') {
        return 'The pines and the hemlocks seem to be murmuring.';
      }
      return 'The forest is quiet.';
    }],
    ['EXAMINE', () => 'The forest is dense and dark.']
  ])
};

registerSceneryHandler(forestHandler);
```

### Add MOUNTAIN-RANGE handler

```typescript
/**
 * MOUNTAIN-RANGE scenery handler
 */
const mountainRangeHandler: SceneryHandler = {
  objectId: 'MOUNTAIN-RANGE',
  actions: new Map([
    ['CLIMB', (state) => {
      if (state.currentRoom === 'EAST-OF-HOUSE') {
        return "Don't you believe me? The mountains are impassable!";
      }
      return "The mountains are too far away.";
    }],
    ['EXAMINE', () => 'The mountains are in the distance.']
  ])
};

registerSceneryHandler(mountainRangeHandler);
```

---

## File 3: src/game/specialBehaviors.ts

### Add HOT-BELL handler

Add after existing handlers:

```typescript
/**
 * HOT-BELL special behavior
 */
const hotBellBehavior: SpecialBehavior = {
  objectId: 'HOT-BELL',
  condition: (state) => true,
  handler: (verb, state) => {
    if (verb === 'TAKE') {
      return 'The heat from the bell is too intense.';
    }
    
    if (verb === 'RUB' || verb === 'POUR-ON') {
      // Check if using water
      const hasWater = state.isInInventory('WATER');
      if (hasWater) {
        return 'The water cools the bell and is evaporated.';
      }
    }
    
    return null;
  }
};

registerSpecialBehavior(hotBellBehavior);
```

---

## File 4: src/game/rooms.ts (or conditionalMessages.ts)

### Add CELLAR trap door message

In the room transition logic for entering CELLAR, add:

```typescript
// When entering CELLAR from LIVING-ROOM
if (newRoom === 'CELLAR' && oldRoom === 'LIVING-ROOM') {
  const trapDoor = state.getObject('TRAP-DOOR');
  if (trapDoor && trapDoor.hasFlag(ObjectFlag.OPEN) && 
      trapDoor.hasFlag(ObjectFlag.TOUCHED)) {
    // Trap door closes and gets barred
    trapDoor.removeFlag(ObjectFlag.OPEN);
    return {
      success: true,
      message: "The trap door crashes shut, and you hear someone barring it.",
      stateChanges: []
    };
  }
}
```

---

## Remaining 12 Quick Win Messages

These are simpler scenery/action messages to add to sceneryActions.ts:

1. **CHASM** - "The chasm probably leads straight to Hades."
2. **TORCH** - "The torch is burning." / "The torch has burned out."
3. **CANARY** - Canary interaction messages
4. **LANTERN** - Additional lantern messages
5. **LOUD** - Sound-related messages
6. **LEAF** - Leaf pile messages
7. **STONE-BARROW** - Barrow messages
8. **Various** - Other simple scenery responses

Add these as additional SceneryHandler objects following the same pattern.

---

## Testing After Implementation

```bash
# 1. Run validation
npx tsx scripts/verify-coverage-threshold.ts | grep "Coverage:"

# Expected output: ~75% coverage

# 2. Run tests
npm test

# Expected: All tests passing

# 3. Check specific messages
# Test BELL: "ring bell" in LLD-ROOM should show "Ding, dong."
# Test HOT-BELL: "take hot bell" should show heat message
# Test TROPHY-CASE: "take trophy case" should show fastened message
```

---

## Validation Checklist

- [ ] BELL rings with "Ding, dong." in LLD-ROOM
- [ ] HOT-BELL shows heat message when taking
- [ ] HOT-BELL + water shows cooling message
- [ ] BOARDED-WINDOW shows can't open message
- [ ] NAILS show can't remove message
- [ ] TROPHY-CASE shows fastened message
- [ ] TRAP-DOOR shows "It's closed." when closed
- [ ] CELLAR entry shows trap door crash message
- [ ] UP-CHIMNEY shows empty-handed message
- [ ] WHITE-HOUSE location messages work
- [ ] FOREST listen message works
- [ ] MOUNTAIN-RANGE climb message works
- [ ] Coverage increases to ~75%
- [ ] All tests pass

---

## Notes

- Each message must match the ZIL source exactly
- Test each message individually before moving to next
- Commit after successful validation
- If any test fails, revert and fix before proceeding

