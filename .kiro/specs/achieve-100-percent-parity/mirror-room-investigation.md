# Mirror Room Investigation Report

## Date: 2024-12-09

## Current Status
- Transcript: 26-mirror-room.json (88.0% similarity)
- Issue: Mirror room teleportation not implemented

## Investigation Findings

### Original ZIL Behavior (1actions.zil, lines 971-994)

When the player RUBs the mirror in either MIRROR-ROOM-1 or MIRROR-ROOM-2:

1. **Teleportation**: Player is moved to the other mirror room
   - If in MIRROR-ROOM-2 → teleport to MIRROR-ROOM-1
   - If in MIRROR-ROOM-1 → teleport to MIRROR-ROOM-2

2. **Object Swapping**: ALL objects in both rooms are swapped
   - Objects in current room → moved to other room
   - Objects in other room → moved to current room
   - This creates the illusion that the rooms are connected through the mirror

3. **Message**: "There is a rumble from deep within the earth and the room shakes."

4. **Tool Check**: If using a tool (not hands), shows different message:
   - "You feel a faint tingling transmitted through the [tool]."
   - Does NOT teleport in this case

### Current TypeScript Implementation (src/game/puzzles.ts, lines 300-325)

The `MirrorPuzzle.rubMirror()` function:

1. ✅ Checks if mirror is broken
2. ✅ Checks if using a tool (shows "Fiddling with the mirror has no effect")
3. ✅ Shows rumble message
4. ❌ **MISSING**: Does NOT teleport player
5. ❌ **MISSING**: Does NOT swap objects between rooms

### Key Differences

| Feature | Original ZIL | TypeScript | Status |
|---------|-------------|------------|--------|
| Check mirror broken | ✓ | ✓ | ✓ |
| Check tool usage | ✓ | ✓ | ✓ |
| Show rumble message | ✓ | ✓ | ✓ |
| Teleport player | ✓ | ✗ | **MISSING** |
| Swap room objects | ✓ | ✗ | **MISSING** |

### ZIL Code Analysis

```zil
<ROUTINE MIRROR-MIRROR ("AUX" (RM2 ,MIRROR-ROOM-2) L1 L2 N)
  <COND (<AND <NOT ,MIRROR-MUNG> <VERB? RUB>>
    ; Check if using tool
    <COND (<AND ,PRSI <NOT <EQUAL? ,PRSI ,HANDS>>>
      <TELL "You feel a faint tingling transmitted through the " D ,PRSI "." CR>
      <RTRUE>)>
    
    ; Determine other room
    <COND (<EQUAL? ,HERE .RM2>
      <SET RM2 ,MIRROR-ROOM-1>)>
    
    ; Get first object in each room
    <SET L1 <FIRST? ,HERE>>
    <SET L2 <FIRST? .RM2>>
    
    ; Move all objects from current room to other room
    <REPEAT ()
      <COND (<NOT .L1> <RETURN>)>
      <SET N <NEXT? .L1>>
      <MOVE .L1 .RM2>
      <SET L1 .N>>
    
    ; Move all objects from other room to current room
    <REPEAT ()
      <COND (<NOT .L2> <RETURN>)>
      <SET N <NEXT? .L2>>
      <MOVE .L2 ,HERE>
      <SET L2 .N>>
    
    ; Teleport player to other room
    <GOTO .RM2 <>>
    
    ; Show message
    <TELL "There is a rumble from deep within the earth and the room shakes." CR>)
```

### Room Descriptions

Both mirror rooms have the same description but with different wall orientations:

**MIRROR-ROOM-1**: "On the **south** wall is an enormous mirror..."
**MIRROR-ROOM-2**: "On the **north** wall is an enormous mirror..."

This creates the illusion that you're looking at the same room from opposite sides.

## Required Fix

The `MirrorPuzzle.rubMirror()` function needs to:

1. Determine which mirror room the player is in
2. Determine the destination room (the other mirror room)
3. Get all objects in the current room
4. Get all objects in the destination room
5. Move all objects from current room to destination room
6. Move all objects from destination room to current room
7. Move the player to the destination room
8. Return success with the rumble message

## Impact

This is a **high-priority** issue because:
- It's a unique puzzle mechanic in Zork I
- It affects gameplay significantly
- The transcript shows 88.0% similarity, likely due to this missing feature
- Players expect to be able to use the mirror for teleportation

## Next Steps

1. Implement teleportation logic in `MirrorPuzzle.rubMirror()`
2. Implement object swapping between rooms
3. Test with transcript 26-mirror-room.json
4. Verify similarity improves to 95%+
