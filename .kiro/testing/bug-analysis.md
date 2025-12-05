# Bug Analysis Report
## Investigation of Issues Found by Comprehensive Testing

Date: 2025-12-05
Test Run: 635 tests, 626 passed (98.6%), 9 failed (1.4%)

---

## Summary

After investigating the ZIL source code, **ALL 9 flagged issues are INTENTIONAL DESIGN**, not bugs. The test system was flagging valid ZIL patterns that it didn't understand.

---

## Issue 1: TAKEBIT + NDESCBIT Combination

**Objects:** AXE, STILETTO  
**Test Error:** "Object has conflicting flags: TAKEBIT and NDESCBIT both set"  
**Status:** ✅ INTENTIONAL - NOT A BUG

### ZIL Source Evidence:

**AXE (line 180-187):**
```zil
<OBJECT AXE
	(IN TROLL)
	(SYNONYM AXE AX)
	(ADJECTIVE BLOODY)
	(DESC "bloody axe")
	(FLAGS WEAPONBIT TRYTAKEBIT TAKEBIT NDESCBIT)
	(ACTION AXE-F)
	(SIZE 25)>
```

**STILETTO (line 889-896):**
```zil
<OBJECT STILETTO
	(IN THIEF)
	(SYNONYM STILETTO)
	(ADJECTIVE VICIOUS)
	(DESC "stiletto")
	(ACTION STILETTO-FUNCTION)
	(FLAGS WEAPONBIT TRYTAKEBIT TAKEBIT NDESCBIT)
	(SIZE 10)>
```

### Analysis:

This is **intentional design** for NPC-carried weapons:

1. **TAKEBIT** = Player CAN take the object (if they defeat the NPC)
2. **NDESCBIT** = Don't show in room descriptions (because it's carried by an NPC)
3. Both objects start **IN TROLL** and **IN THIEF** respectively

The combination makes perfect sense:
- When the troll/thief is present, the weapon is part of their description (LDESC)
- When the troll/thief is defeated, the weapon becomes available to take
- NDESCBIT prevents "You see a bloody axe here" when the troll is holding it

**Recommendation:** Update test to allow TAKEBIT + NDESCBIT for objects with initial location = NPC

---

## Issue 2: CONTBIT + SURFACEBIT Combination

**Objects:** ALTAR, PEDESTAL, KITCHEN-TABLE, ATTIC-TABLE  
**Test Error:** "Object has conflicting flags: CONTBIT and SURFACEBIT both set"  
**Status:** ✅ INTENTIONAL - NOT A BUG

### ZIL Source Evidence:

**ALTAR (line 205-210):**
```zil
<OBJECT ALTAR
	(IN SOUTH-TEMPLE)
	(SYNONYM ALTAR)
	(DESC "altar")
	(FLAGS NDESCBIT SURFACEBIT CONTBIT OPENBIT)
	(CAPACITY 50)>
```

**PEDESTAL (line 980-987):**
```zil
<OBJECT PEDESTAL
	(IN TORCH-ROOM)
	(SYNONYM PEDESTAL)
	(ADJECTIVE WHITE MARBLE)
	(DESC "pedestal")
	(FLAGS NDESCBIT CONTBIT OPENBIT SURFACEBIT)
	(ACTION DUMB-CONTAINER)
	(CAPACITY 30)>
```

**KITCHEN-TABLE (line 271-277):**
```zil
<OBJECT KITCHEN-TABLE
	(IN KITCHEN)
	(SYNONYM TABLE)
	(ADJECTIVE KITCHEN)
	(DESC "kitchen table")
	(FLAGS NDESCBIT CONTBIT OPENBIT SURFACEBIT)
	(CAPACITY 50)>
```

**ATTIC-TABLE (line 278-283):**
```zil
<OBJECT ATTIC-TABLE
	(IN ATTIC)
	(SYNONYM TABLE)
	(DESC "table")
	(FLAGS NDESCBIT CONTBIT OPENBIT SURFACEBIT)
	(CAPACITY 40)>
```

### Analysis:

This is **intentional design** for surfaces that hold items:

1. **CONTBIT** = Can contain objects
2. **SURFACEBIT** = Objects are placed ON it (not IN it)
3. **OPENBIT** = Always accessible (no lid/door)
4. All have **CAPACITY** defined

In Zork's implementation, SURFACEBIT is a **specialization** of CONTBIT, not a conflict:
- CONTBIT = general container capability
- SURFACEBIT = items go "on" rather than "in"
- Both flags together = "open container that's a surface"

This allows proper messaging:
- "PUT sword ON table" (not "IN table")
- "The sword is on the altar" (not "in the altar")

**Recommendation:** Update test to allow CONTBIT + SURFACEBIT + OPENBIT combination (it's the standard pattern for surfaces)

---

## Issue 3: Containers Without Capacity

**Objects:** BOOK, THIEF, TOOL-CHEST  
**Test Error:** "Container has no capacity defined"  
**Status:** ✅ INTENTIONAL - NOT A BUG (Already identified in data validation)

### ZIL Source Evidence:

**BOOK (line 211-220):**
```zil
<OBJECT BOOK
	(IN ALTAR)
	(SYNONYM BOOK PRAYER PAGE BOOKS)
	(ADJECTIVE LARGE BLACK)
	(DESC "black book")
	(FLAGS READBIT TAKEBIT CONTBIT BURNBIT TURNBIT)
	(ACTION BLACK-BOOK)
	(FDESC "On the altar is a large black book, open to page 569.")
	(SIZE 10)
	(TEXT ...)>
```
**Note:** No CAPACITY property

**THIEF (line 968-979):**
```zil
<OBJECT THIEF
	(IN ROUND-ROOM)
	(SYNONYM THIEF ROBBER MAN PERSON)
	(ADJECTIVE SHADY SUSPICIOUS SEEDY)
	(DESC "thief")
	(FLAGS ACTORBIT INVISIBLE CONTBIT OPENBIT TRYTAKEBIT)
	(ACTION ROBBER-FUNCTION)
	(LDESC "...")
	(STRENGTH 5)>
```
**Note:** No CAPACITY property, has ACTORBIT (NPC inventory)

**TOOL-CHEST (line 298-305):**
```zil
<OBJECT TOOL-CHEST
	(IN MAINTENANCE-ROOM)
	(SYNONYM CHEST CHESTS GROUP TOOLCHESTS)
	(ADJECTIVE TOOL)
	(DESC "group of tool chests")
	(FLAGS CONTBIT OPENBIT TRYTAKEBIT SACREDBIT)
	(ACTION TOOL-CHEST-FCN)>
```
**Note:** No CAPACITY property, has custom ACTION

### Analysis:

These are **non-functional containers** with special handling:

1. **BOOK**: CONTBIT used for "turning pages" mechanic, not actual storage
2. **THIEF**: ACTORBIT NPC with inventory managed by ROBBER-FUNCTION, not standard container
3. **TOOL-CHEST**: SACREDBIT + custom ACTION = special interaction, not player-usable storage

All three have custom ACTION functions that handle their behavior instead of using standard container mechanics.

**Recommendation:** Test should exempt objects with:
- ACTORBIT (NPCs)
- Custom ACTION + SACREDBIT
- READBIT + TURNBIT (books/pages)

---

## Conclusions

### Test System Issues:

The test system needs to be updated to understand these valid ZIL patterns:

1. **TAKEBIT + NDESCBIT** is valid for NPC-carried items
2. **CONTBIT + SURFACEBIT + OPENBIT** is the standard pattern for surfaces
3. **CONTBIT without CAPACITY** is valid for special-case objects with custom actions

### Recommended Actions:

1. ✅ Mark all 9 bugs as **WONT_FIX** (they're not bugs)
2. 🔧 Update `ObjectTester` to recognize these valid patterns
3. 📝 Document these patterns in testing guide
4. ✅ All game data is correctly extracted from ZIL

### Test Results:

**626 tests passed** - These are the real validation  
**9 tests failed** - False positives due to overly strict validation

The game implementation is **accurate to the ZIL source**.
