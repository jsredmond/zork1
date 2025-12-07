# Batch 10: Conditional Messages Analysis

## Overview
Target: 30 conditional messages to increase coverage from 78.04% to 81.3%
Current conditional coverage: 524/677 (77.4%)

## Priority 1: Flag-Dependent Room/Object Descriptions (15 messages)

### 1. BAT with GARLIC condition (1actions.zil:319)
**Message**: "The bat grabs you by the scruff of your neck and lifts you away...."
**Condition**: EQUAL? ,PRSO ,RAISED-BASKET ,LOWERED-BASKET AND EQUAL? <LOC ,GARLIC
**Implementation**: Check if garlic is NOT present when bat interacts with basket
**File**: src/game/conditionalMessages.ts

### 2. ENTRANCE-TO-HADES Fweep (1actions.zil:329)
**Message**: "Fweep!"
**Condition**: EQUAL? ,HERE ,ENTRANCE-TO-HADES
**Implementation**: Bell ringing at entrance to Hades
**File**: src/game/conditionalMessages.ts

### 3. RUG magic carpet (1actions.zil:616)
**Message**: "I suppose you think it's a magic carpet?"
**Condition**: FSET? ,TRAP-DOOR ,OPENBIT AND FSET? ,TRAP-DOOR ,OPENBIT
**Implementation**: Trying to ride rug when trap door is open
**File**: src/game/conditionalMessages.ts

### 4. LEAVES count with grate (1actions.zil:788)
**Message**: "There are 69,105 leaves here."
**Condition**: FSET? ,GRATE ,OPENBIT
**Implementation**: Counting leaves when grate is open
**File**: src/game/conditionalMessages.ts

### 5. LEAVES rustle (1actions.zil:799)
**Message**: "You rustle the leaves around, making quite a mess."
**Condition**: IN? ,PRSO ,HERE
**Implementation**: Moving leaves in current room
**File**: src/game/conditionalMessages.ts

### 6. TORCH extinguish warning (1actions.zil:951)
**Message**: "You nearly burn your hand trying to extinguish the flame."
**Condition**: EQUAL? ,PRSI ,TORCH AND FSET? ,PRSO ,ONBIT
**Implementation**: Trying to extinguish lit torch with hands
**File**: src/game/conditionalMessages.ts

### 7. MIRROR tingling (1actions.zil:974)
**Message**: "You feel a faint tingling transmitted through the ."
**Condition**: EQUAL? .RARG ,M-LOOK AND EQUAL? ,PRSI ,HANDS
**Implementation**: Rubbing mirror with hands
**File**: src/game/conditionalMessages.ts

### 8. BELL ceremony requirement (1actions.zil:1077)
**Message**: "You must perform the ceremony."
**Condition**: IN? ,BELL ,WINNER AND IN? ,BOOK ,WINNER AND IN? ,CANDLES
**Implementation**: Ringing bell without proper ceremony items
**File**: src/game/conditionalMessages.ts

### 9. BOOK exorcism (1actions.zil:1106)
**Message**: "Begone, fiends!\\"
**Condition**: IN? ,CANDLES ,WINNER AND EQUAL? ,PRSO ,BOOK
**Implementation**: Reading book with candles present
**File**: src/game/conditionalMessages.ts

### 10. RESERVOIR water sound (1actions.zil:1276)
**Message**: "The roar of rushing water is quieter now."
**Condition**: EQUAL? ,HERE ,RESERVOIR AND FSET? <LOC ,WINNER
**Implementation**: Water sound changes based on location
**File**: src/game/conditionalMessages.ts

### 11. BLUE-BUTTON shut off (1actions.zil:1316)
**Message**: "shut off."
**Condition**: EQUAL? ,PRSO ,BLUE-BUTTON AND EQUAL? ,PRSO ,RED-BUTTON
**Implementation**: Button state message
**File**: src/game/conditionalMessages.ts

### 12. RED-BUTTON with room on (1actions.zil:1319)
**Message**: "shut off."
**Condition**: EQUAL? ,PRSO ,RED-BUTTON AND FSET? ,HERE ,ONBIT
**Implementation**: Button state with room lighting
**File**: src/game/conditionalMessages.ts

### 13. CHESTS empty (1actions.zil:1334)
**Message**: "The chests are all empty."
**Condition**: (needs analysis)
**Implementation**: Examining empty chests
**File**: src/game/conditionalMessages.ts

### 14. TROLL weapon rejection (1actions.zil:753)
**Message**: "The troll spits in your face, grunting \\"
**Condition**: EQUAL? ,PRSO ,KNIFE ,SWORD ,AXE
**Implementation**: Giving weapons to troll
**File**: src/game/conditionalMessages.ts

### 15. Weapon description (1actions.zil:743)
**Message**: "D ,PRSO"
**Condition**: EQUAL? ,PRSO ,KNIFE ,SWORD ,AXE
**Implementation**: Weapon-specific descriptions
**File**: src/game/conditionalMessages.ts

## Priority 2: Object State Variations (15 messages)

### 16-30. Additional conditional messages based on OPENBIT, ONBIT, TOUCHBIT states
(To be identified from remaining missing messages)

## Implementation Strategy

1. **Helper Functions Needed**:
   - `hasGarlicNearby(state: GameState): boolean`
   - `isAtLocation(state: GameState, location: string): boolean`
   - `hasItemsInInventory(state: GameState, items: string[]): boolean`
   - `checkMultipleFlags(state: GameState, flags: string[]): boolean`

2. **Testing Approach**:
   - Create test cases for each condition
   - Verify message appears only when condition is met
   - Test edge cases (e.g., garlic in room vs inventory)

3. **Documentation**:
   - Document each flag dependency
   - Note any complex multi-condition logic
   - Reference ZIL source line numbers

## Dependencies

- GameState flag system
- Object location tracking
- Inventory management
- Room state tracking

## Validation

After implementation:
```bash
npx tsx scripts/verify-coverage-threshold.ts
# Expected: ~81.3% coverage (755/929 messages)

npm test
# Expected: All tests passing
```
