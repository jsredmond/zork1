# Save/Restore Investigation Report

## Current State

**Transcript:** 44-save-restore.json  
**Current Similarity:** 59.7%  
**Status:** FAILED (7/15 commands failing)

## Issue Analysis

### Problem
The SAVE and RESTORE commands are not registered in the CommandExecutor, causing them to return "I don't know how to save" and "I don't know how to restore" instead of the expected behavior.

### Expected Behavior (from transcript)
1. **SAVE command:**
   - Should prompt: "Enter a file name.\nDefault is \"ZORK1\":"
   - Should wait for filename input
   - Should respond "Ok." after saving

2. **RESTORE command:**
   - Should prompt: "Enter a file name.\nDefault is \"ZORK1\":"
   - Should wait for filename input
   - Should respond "Ok." after restoring
   - Should restore player to original location
   - Should restore inventory
   - Should restore score and move count

### Current Implementation Status

✅ **Storage class exists** (`src/persistence/storage.ts`)
- Has `save()` method
- Has `restore()` method
- Handles file I/O correctly

✅ **Serializer class exists** (`src/persistence/serializer.ts`)
- Has `serialize()` method
- Has `deserialize()` method
- Handles game state conversion

✅ **Action handlers exist** (`src/game/actions.ts`)
- `SaveAction` class implemented
- `RestoreAction` class implemented
- Both handle errors correctly

❌ **Not registered in executor** (`src/engine/executor.ts`)
- SAVE verb not registered
- RESTORE verb not registered
- This is why commands fail

### Differences from Original Game

1. **Interactive prompting:** The original game prompts for a filename and waits for input. Our implementation needs to handle this two-step interaction.

2. **Default filename:** Original uses "ZORK1" as default, our implementation uses "savegame".

3. **Response messages:** Original responds with "Ok." after successful save/restore, our implementation returns more verbose messages.

## Required Fixes

### 1. Register Save/Restore Actions in Executor
Add to `registerDefaultHandlers()` in `src/engine/executor.ts`:
```typescript
this.actionHandlers.set('SAVE', new SaveAction());
this.actionHandlers.set('RESTORE', new RestoreAction());
```

### 2. Implement Interactive Prompting
The save/restore commands need to:
- First call: Display prompt and wait for filename
- Second call: Use the provided filename to save/restore

This requires state management to track that we're waiting for a filename.

### 3. Update Response Messages
- Change "Game saved to {filename}" to "Ok."
- Change "Game restored from {filename}" to "Ok."
- Add filename prompt: "Enter a file name.\nDefault is \"ZORK1\":"

### 4. Update Default Filename
Change default from "savegame" to "ZORK1" to match original.

## Implementation Plan

1. Add save/restore to executor registration
2. Implement interactive prompting mechanism
3. Update action handlers to match original messages
4. Test with transcript to verify 90%+ similarity

## Expected Outcome

After fixes:
- SAVE command prompts for filename
- RESTORE command prompts for filename
- Both respond with "Ok." on success
- Game state is properly saved and restored
- Transcript similarity: 90%+ (target for medium-priority)
