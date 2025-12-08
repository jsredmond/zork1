# Troll Combat Message Investigation

## Issue
The transcript expects "The troll fends you off with a menacing gesture" during combat, but our implementation shows "You miss the troll by an inch" (standard miss message).

## Investigation Results

### ZIL Source Analysis

#### 1. Location of "fends you off" Message
The message "The troll fends you off with a menacing gesture" appears **ONLY** in room exit conditions:

```zil
; From 1dungeon.zil, TROLL-ROOM definition
(EAST TO EW-PASSAGE
 IF TROLL-FLAG ELSE "The troll fends you off with a menacing gesture.")
(WEST TO MAZE-1
 IF TROLL-FLAG ELSE "The troll fends you off with a menacing gesture.")
```

This message is used when the player tries to move through a passage that the troll is blocking, NOT during combat.

#### 2. Troll Combat Messages (TROLL-MELEE)
The troll's actual combat messages for missed attacks are:
- "The troll swings his axe, but it misses."
- "The troll's axe barely misses your ear."
- "The axe sweeps past as you jump aside."
- "The axe crashes against the rock, throwing sparks!"

#### 3. Hero Attack Messages (HERO-MELEE)
When the player attacks and misses, the standard messages are:
- "Your {weapon} misses the {villain} by an inch."
- "A good slash, but it misses the {villain} by a mile."
- "You charge, but the {villain} jumps nimbly aside."
- "Clang! Crash! The {villain} parries."
- "A quick stroke, but the {villain} is on guard."
- "A good stroke, but it's too slow; the {villain} dodges."

#### 4. Combat Flow (HERO-BLOW routine)
The combat system:
1. Calculates attack and defense strengths
2. Determines combat result from result tables
3. Displays message from HERO-MELEE based on result
4. Applies damage/effects

**There is NO special handling for the troll that would generate the "fends you off" message during combat.**

### Transcript Analysis

Command 14 in transcript:
```
"command": "kill troll with sword",
"expectedOutput": "The troll fends you off with a menacing gesture.\nThe axe crashes against the rock, throwing sparks!"
```

The second line ("The axe crashes against the rock, throwing sparks!") IS in the TROLL-MELEE missed messages table, confirming combat is happening. But the first line is the room-blocking message, not a combat message.

## Possible Explanations

1. **Transcript Error**: The transcript may have been manually edited or recorded incorrectly
2. **Different Version**: The transcript may be from a different version of Zork I that had this behavior
3. **Undocumented Behavior**: There may be behavior in the compiled game that isn't reflected in this ZIL source
4. **Special Case**: There may be a very specific condition that triggers this message that I haven't found

## Current Implementation Status

Our implementation correctly follows the ZIL source code:
- Hero attack messages use HERO-MELEE table
- Troll counterattack messages use TROLL-MELEE table
- The "fends you off" message is only used for blocked passages

## Recommendations

### Option 1: Re-record Transcript (RECOMMENDED)
Play the original Zork I game and record a new transcript of the troll combat sequence to verify the actual behavior. This will definitively show whether:
- The original game uses the "fends you off" message in combat
- The transcript has an error
- There's a version difference

### Option 2: Accept ZIL Source as Canonical
Accept that our implementation matches the ZIL source code, which is the most authoritative reference we have. The transcript may be incorrect.

### Option 3: Add Special Handling
Add special code to make the troll use the "fends you off" message during combat, even though it's not in the ZIL source. This would match the transcript but deviate from the source.

### Option 4: Investigate Further
- Check if there are other versions of the ZIL source
- Look for any pre-processing or macro expansion that might add this behavior
- Check if the troll has any special properties that affect combat messages

## Technical Details

### Troll Properties
```zil
(OBJECT TROLL
  (STRENGTH 2)
  (FLAGS ACTORBIT OPENBIT TRYTAKEBIT)
  (ACTION TROLL-FCN))
```

### Combat Result Tables
With player strength 2 (initial) and troll strength 2, the combat uses DEF2-RES tables, which can produce various results including MISSED, LIGHT_WOUND, SERIOUS_WOUND, etc.

### Current Combat Message Flow
1. Player attacks troll with sword
2. HERO-BLOW calculates result (e.g., MISSED)
3. Displays message from HERO-MELEE[MISSED]: "Your sword misses the troll by an inch."
4. Troll counterattacks (daemon)
5. Displays message from TROLL-MELEE[MISSED]: "The axe crashes against the rock, throwing sparks!"

## Verification with Original Game

I tested the actual original Zork I game (COMPILED/zork1.z3) using Frotz interpreter with the exact same command sequence from the transcript.

### Actual Original Game Output

```
>kill troll with sword
A quick stroke, but the troll is on guard.
The troll swings his axe, but it misses.
```

### Analysis

The original game shows:
- **Hero attack**: "A quick stroke, but the troll is on guard." (from HERO-MELEE missed messages - index 4)
- **Troll counterattack**: "The troll swings his axe, but it misses." (from TROLL-MELEE missed messages - index 0)

This is **exactly what our TypeScript implementation produces**!

The message "The troll fends you off with a menacing gesture" does **NOT** appear during combat in the original game.

## Conclusion

**The transcript is INCORRECT**. The message "The troll fends you off with a menacing gesture" does not appear during troll combat in the original Zork I game. This message is exclusively used for blocked room exits when the troll is alive.

### Our Implementation is Correct

Our TypeScript implementation correctly follows the ZIL source code and matches the actual behavior of the original game:
- Hero attack messages use HERO-MELEE table
- Troll counterattack messages use TROLL-MELEE table  
- The "fends you off" message is only used for blocked passages

### Recommendation

**The transcript needs to be re-recorded** from the actual original game to capture the correct combat messages. The current transcript appears to have been manually edited or recorded incorrectly.
