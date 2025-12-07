# Transcript Library

This directory contains reference transcripts from the original Zork I game, used for behavioral parity verification.

## Purpose

These transcripts serve as ground truth for verifying that the TypeScript rewrite behaves identically to the original game. Each transcript captures a sequence of commands and their exact outputs from the original Zork I.

## Directory Structure

- **critical/** - Critical priority transcripts (must pass at 100%)
  - Opening sequence, major puzzles, core navigation, game completion
- **high/** - High priority transcripts (should pass at 98%+)
  - NPC interactions, combat, treasure collection, save/restore
- **medium/** - Medium priority transcripts (should pass at 98%+)
  - Edge cases, error messages, unusual command sequences
- **low/** - Low priority transcripts (should pass at 95%+)
  - Flavor text, rare scenarios, easter eggs
- **timing/** - Daemon timing transcripts
  - Lamp fuel, candle burning, NPC movement timing

## Transcript Format

Each transcript is a JSON file with the following structure:

```json
{
  "id": "unique-identifier",
  "name": "Human Readable Name",
  "description": "Detailed description of what this transcript tests",
  "category": "opening|puzzle|npc|combat|edge-case|playthrough|timing",
  "priority": "critical|high|medium|low",
  "entries": [
    {
      "command": "look",
      "expectedOutput": "West of House\nYou are standing in an open field...",
      "notes": "Optional notes about this command",
      "stateChecks": [
        {
          "type": "flag|object|room|inventory|score",
          "target": "flag-name or object-id",
          "expectedValue": "expected value"
        }
      ]
    }
  ],
  "metadata": {
    "created": "2024-12-07T00:00:00.000Z",
    "source": "original-game|documented",
    "verified": false
  }
}
```

## Field Descriptions

### Top Level

- **id**: Unique identifier (e.g., "01-opening-sequence")
- **name**: Human-readable name for the transcript
- **description**: What scenario or behavior this transcript verifies
- **category**: Type of scenario being tested
- **priority**: Importance level for verification
- **entries**: Array of command/output pairs
- **metadata**: Information about transcript creation and verification

### Entry Fields

- **command**: The exact command entered by the player
- **expectedOutput**: The complete output text from the original game
- **notes**: (Optional) Additional context or special considerations
- **stateChecks**: (Optional) Array of game state verifications

### State Check Fields

- **type**: What kind of state to check (flag, object, room, inventory, score)
- **target**: The specific flag/object/room to check
- **expectedValue**: What the value should be after this command

## Creating Transcripts

### Using Frotz

1. Start Frotz with the original Zork I:
   ```bash
   frotz COMPILED/zork1.z3
   ```

2. Play through the scenario you want to capture

3. Record each command and its complete output

4. Use the transcript creation tool:
   ```bash
   npx tsx scripts/create-transcript.ts
   ```

### Manual Creation

You can also create transcripts manually by following the JSON format above. Make sure to:

- Capture output exactly as it appears (including whitespace)
- Include all text, even repeated room descriptions
- Note any special conditions or state requirements
- Validate the JSON structure

## Validation

Before committing a transcript, validate it:

```bash
npx tsx scripts/create-transcript.ts --validate path/to/transcript.json
```

## Comparison

To compare a transcript against the TypeScript implementation:

```bash
npx tsx scripts/compare-transcript.ts path/to/transcript.json
```

To run all transcripts in a category:

```bash
npx tsx scripts/verify-all-transcripts.ts --category critical
```

## Naming Conventions

- Use descriptive, kebab-case names
- Prefix with a number for ordering within categories
- Examples:
  - `01-opening-sequence.json`
  - `05-troll-puzzle.json`
  - `20-thief-encounter.json`

## Priority Guidelines

### Critical (100% match required)
- Game must be playable
- Major puzzles must work
- Core navigation must function
- Opening and ending sequences

### High (98%+ match required)
- All NPCs behave correctly
- Combat works properly
- All treasures collectible
- Save/restore functions

### Medium (98%+ match required)
- Error messages are accurate
- Edge cases handled properly
- Alternative solutions work

### Low (95%+ match required)
- Flavor text matches
- Easter eggs present
- Rare scenarios work

## Coverage Goals

- **Minimum**: 100 transcripts total
- **Puzzles**: 100% coverage (all 15+ puzzles)
- **Rooms**: 100% coverage (all 110 rooms)
- **NPCs**: 100% coverage (all 4 major NPCs)
- **Objects**: 90%+ coverage (all major objects)

## Notes

- Transcripts should be created from the original game, not from documentation
- When in doubt, verify behavior in the original game
- Document any ambiguities or special conditions
- Keep transcripts focused on specific scenarios
- Avoid overly long transcripts (split into multiple if needed)
