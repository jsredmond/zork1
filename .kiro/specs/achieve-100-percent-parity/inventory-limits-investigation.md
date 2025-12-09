# Inventory Limits Investigation

## Current State
- Transcript 41-inventory-limits.json: 17.8% similarity
- Transcript has INCORRECT navigation (goes west instead of east from South of House)
- Need to fix transcript AND inventory weight calculation

## Issues Found

### Issue 1: Incorrect Transcript
The transcript says "west" from South of House should go to "Behind House", but according to the ZIL source:
- From SOUTH-OF-HOUSE, WEST goes to WEST-OF-HOUSE
- From SOUTH-OF-HOUSE, EAST goes to EAST-OF-HOUSE (Behind House)

The transcript must be re-recorded with correct navigation.

### Issue 2: Weight Calculation Missing Nested Objects
According to ZIL source (gverbs.zil lines 1988-1999), the WEIGHT function recursively calculates weight:
```zil
<ROUTINE WEIGHT (OBJ "AUX" CONT (WT 0))
	 <COND (<SET CONT <FIRST? .OBJ>>
		<REPEAT ()
			<COND (<AND <EQUAL? .OBJ ,PLAYER>
				    <FSET? .CONT ,WEARBIT>>
			       <SET WT <+ .WT 1>>)
			      (T
			       <SET WT <+ .WT <WEIGHT .CONT>>>)>
			<COND (<NOT <SET CONT <NEXT? .CONT>>> <RETURN>)>>)>
	 <+ .WT <GETP .OBJ ,P?SIZE>>>
```

This means:
1. For each object, add its SIZE property
2. Recursively add the weight of all contained objects
3. Special case: worn items count as weight 1

Our TypeScript implementation only adds the SIZE of top-level inventory items, not nested contents.

### Issue 3: LOAD-ALLOWED vs LOAD-MAX
From gglobals.zil:
- LOAD-MAX: 100 (maximum carrying capacity)
- LOAD-ALLOWED: 100 (current allowed capacity, reduced when wounded)

When player is wounded in combat:
- Light wound: LOAD-ALLOWED reduced by 10
- Serious wound: LOAD-ALLOWED reduced by 20
- Healing restores LOAD-ALLOWED by 10 per turn

Our implementation checks against a fixed 100, but should check against LOAD-ALLOWED which can vary.

## Fix Plan

1. **Fix transcript navigation** - Re-record with correct path (east not west from South of House)
2. **Fix weight calculation** - Implement recursive weight calculation including nested objects
3. **Implement LOAD-ALLOWED** - Add variable carrying capacity that changes with wounds/healing
4. **Test with proper transcript** - Verify inventory limits work correctly

## Expected Behavior

When carrying:
- Leaflet (size: 2)
- Sack (size: 9) containing:
  - Lunch (size: 5)
  - Garlic (size: 3)
- Bottle (size: 4) containing:
  - Water (size: 2)
- Sword (size: 10)
- Lamp (size: 5)
- Painting (size: 20)

Total weight should be: 2 + 9 + 5 + 3 + 4 + 2 + 10 + 5 + 20 = 60

Currently our implementation would calculate: 2 + 9 + 4 + 10 + 5 + 20 = 50 (missing nested contents)

## Next Steps

1. Implement recursive weight calculation
2. Add LOAD-ALLOWED global variable
3. Update weight checks to use LOAD-ALLOWED
4. Re-record transcript with correct navigation
5. Verify transcript passes at 90%+
