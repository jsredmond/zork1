# Creating Puzzle Transcripts from Original Zork I

## Overview
This guide helps create accurate transcripts from the original Zork I game using `dfrotz`.

## Challenge: Troll Combat RNG
The troll combat is **random** in the original game, making automated recording difficult. The troll may:
- Block passages
- Attack with varying messages
- Take different numbers of hits to defeat

**Solution**: Use treasure-based approach to bypass troll, or record multiple attempts.

## Method 1: Interactive Recording (Recommended)

### Step 1: Start dfrotz with script recording
```bash
dfrotz -s /tmp/transcript.txt reference/COMPILED/zork1.z3
```

### Step 2: Play through the puzzle
- Follow the puzzle solution steps
- The game will record all input/output to `/tmp/transcript.txt`

### Step 3: Convert to JSON
Use the helper script to convert the text transcript to JSON format.

## Method 2: Semi-Automated with Command File

### Create command file
```bash
cat > /tmp/commands.txt << 'EOF'
n
e
open window
enter
w
take lamp
take sword
e
take sack
w
move rug
open trap door
turn on lamp
d
s
e
take painting
w
n
n
give painting to troll
e
open coffin
take sceptre
w
s
e
s
w
w
s
w
wave sceptre
on rainbow
take pot
look
i
quit
y
EOF
```

### Run with dfrotz
```bash
dfrotz -m -p reference/COMPILED/zork1.z3 < /tmp/commands.txt > /tmp/output.txt 2>&1
```

## Puzzle-Specific Solutions

### 30: Rainbow Puzzle
**Prerequisites**: Sceptre from coffin (need to get past troll)
**Location**: Aragain Falls (w, w, s, w from West of House)
**Commands**:
- `wave sceptre` - Makes rainbow solid
- `on rainbow` - Walk onto rainbow
- `take pot` - Get pot of gold

### 31: Bat Encounter
**Location**: Bat Room (in mine area)
**Note**: Bat randomly carries player to different location
**Commands**:
- Enter bat room
- Bat automatically triggers

### 32: Mirror Room
**Location**: Mirror Room (north of cave)
**Commands**:
- `examine mirror`
- `touch mirror`
- `break mirror` (if possible)

### 33: Egg/Nest Puzzle
**Location**: Up a Tree (s, s, w, u from West of House)
**Commands**:
- `climb tree` or `u`
- `take egg`
- `d`
- `open egg` (carefully, don't break it)

### 34: Coffin Puzzle
**Prerequisites**: Get past troll
**Location**: Egyptian Room (e from Troll Room)
**Commands**:
- `open coffin`
- `take sceptre`

### 35: Cyclops Feeding
**Prerequisites**: Lunch from kitchen
**Location**: Cyclops Room (complex navigation)
**Commands**:
- `give lunch to cyclops`
- Cyclops leaves and opens treasure room

## Getting Past the Troll

### Option 1: Give Treasures
The troll will leave if you give him treasures:
```
give painting to troll
```

### Option 2: Kill Troll (Random)
```
kill troll with sword
```
Keep attacking until troll dies. This is **random** and may take multiple attempts.

### Option 3: Alternative Route
Some areas may be accessible without going through troll room.

## Converting Output to JSON

After recording, create JSON transcript:

```json
{
  "id": "30-rainbow-puzzle",
  "name": "Rainbow Puzzle",
  "description": "Wave sceptre at Aragain Falls to solidify rainbow",
  "category": "puzzle",
  "priority": "high",
  "entries": [
    {
      "command": "wave sceptre",
      "expectedOutput": "[paste exact output]",
      "notes": "Rainbow becomes solid"
    }
  ],
  "metadata": {
    "created": "2024-12-08T00:00:00.000Z",
    "source": "original-game",
    "verified": true
  }
}
```

## Tips

1. **Exact Output**: Copy exact text including line breaks
2. **Clean Up**: Remove dfrotz status lines (Score/Moves headers)
3. **Focus**: Only include puzzle-relevant commands
4. **Verify**: Test transcript against TypeScript implementation

## Automation Script

For puzzles that don't require troll combat, use:
```bash
./scripts/record-puzzle.sh [puzzle-name] [commands-file]
```
