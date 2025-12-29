# Timing Differences Analysis

**Analysis Date:** December 29, 2024  
**Source:** Spot test results (seed: 738557)  
**Total Timing Differences:** 23 occurrences  

## Executive Summary

The primary timing issue is the **missing status bar display** in TypeScript responses. The Z-Machine consistently includes a status line showing room name, score, and move count, while the TypeScript implementation omits this information entirely.

## Status Bar Display Pattern Analysis

### Z-Machine Status Format
```
[Room Name (45 chars padded)]Score: [score]        Moves: [moves]

[Response message]
```

### TypeScript Format (Missing Status)
```
[Response message only]
```

## Detailed Timing Differences

### 1. Inventory Commands (7 occurrences)
**Commands:** `i`, `inventory`  
**Pattern:** Status bar missing from inventory responses

| Command Index | Command | TS Output | ZM Output |
|---------------|---------|-----------|-----------|
| 35 | `i` | "You are empty-handed." | "Clearing                                         Score: 0        Moves: 29\n\nYou are empty-handed." |
| 38 | `i` | "You are empty-handed." | "Clearing                                         Score: 0        Moves: 32\n\nYou are empty-handed." |
| 52 | `i` | "You are empty-handed." | "Clearing                                         Score: 0        Moves: 44\n\nYou are empty-handed." |
| 79 | `i` | "You are empty-handed." | "Forest                                           Score: 0        Moves: 67\n\nYou are empty-handed." |
| 92 | `i` | "You are empty-handed." | "Forest                                           Score: 0        Moves: 78\n\nYou are empty-handed." |
| 97 | `inventory` | "You are empty-handed." | "Forest                                           Score: 0        Moves: 82\n\nYou are empty-handed." |
| 141 | `inventory` | "You are empty-handed." | "Canyon View                                      Score: 0        Moves: 119\n\nYou are empty-handed." |
| 159 | `i` | "You are empty-handed." | "Canyon View                                      Score: 0        Moves: 136\n\nYou are empty-handed." |
| 166 | `i` | "You are empty-handed." | "Forest                                           Score: 0        Moves: 143\n\nYou are empty-handed." |
| 186 | `i` | "You are empty-handed." | "Clearing                                         Score: 0        Moves: 157\n\nYou are empty-handed." |

### 2. Object Interaction Commands (6 occurrences)
**Commands:** Object manipulation verbs  
**Pattern:** Status bar missing from object interaction responses

| Command Index | Command | TS Output | ZM Output |
|---------------|---------|-----------|-----------|
| 1 | `take board` | "The boards are securely fastened." | "North of House                                   Score: 0        Moves: 2\n\nThe boards are securely fastened." |
| 37 | `turn forest` | "This has no effect." | "Clearing                                         Score: 0        Moves: 31\n\nYour bare hands don't appear to be enough." |
| 44 | `pull forest` | "Pulling the forest has no effect." | "Clearing                                         Score: 0        Moves: 37\n\nYou can't move the forest." |
| 71 | `turn white house` | "This has no effect." | "Forest                                           Score: 0        Moves: 60\n\nYour bare hands don't appear to be enough." |
| 82 | `pull white house` | "Pulling the white house has no effect." | "Forest                                           Score: 0        Moves: 70\n\nYou're not at the house." |
| 85 | `push forest` | "Pushing the forest isn't notably helpful." | "Forest                                           Score: 0        Moves: 73\n\nPushing the forest has no effect." |
| 187 | `push forest` | "Pushing the forest isn't notably helpful." | "Clearing                                         Score: 0        Moves: 158\n\nPushing the forest doesn't seem to work." |

### 3. Movement Commands (4 occurrences)
**Commands:** Navigation verbs  
**Pattern:** Status bar missing from movement responses

| Command Index | Command | TS Output | ZM Output |
|---------------|---------|-----------|-----------|
| 122 | `go east` | "The rank undergrowth prevents eastward movement." | "Forest                                           Score: 0        Moves: 102\n\nThe rank undergrowth prevents eastward movement." |
| 133 | `pull white house` | "Pulling the white house isn't notably helpful." | "Clearing                                         Score: 0        Moves: 112\n\nYou're not at the house." |
| 142 | `south` | "Storm-tossed trees block your way." | "Canyon View                                      Score: 0        Moves: 120\n\nStorm-tossed trees block your way." |
| 162 | `south` | "Storm-tossed trees block your way." | "Forest                                           Score: 0        Moves: 139\n\nStorm-tossed trees block your way." |

### 4. Examination Commands (3 occurrences)
**Commands:** Look and examine verbs  
**Pattern:** Status bar missing from examination responses

| Command Index | Command | TS Output | ZM Output |
|---------------|---------|-----------|-----------|
| 135 | `look at white house` | "Clearing\nYou are in a small clearing in a well marked forest path that extends to the east and west." | "Clearing                                         Score: 0        Moves: 113\n\nYou're not at the house." |

### 5. Time Commands (1 occurrence)
**Commands:** Wait and time-related verbs  
**Pattern:** Status bar missing from time command responses

| Command Index | Command | TS Output | ZM Output |
|---------------|---------|-----------|-----------|
| 198 | `wait` | "Time passes..." | "Clearing                                         Score: 0        Moves: 169\n\nTime passes..." |

## Status Bar Format Analysis

### Room Name Formatting
- **Length:** Exactly 45 characters (padded with spaces)
- **Examples:**
  - "North of House                                   "
  - "Clearing                                         "
  - "Forest                                           "
  - "Canyon View                                      "

### Score and Moves Format
- **Pattern:** "Score: [number]        Moves: [number]"
- **Spacing:** 8 spaces between "Score:" and "Moves:"
- **All examples show:** Score: 0, Moves: varying

### Line Separation
- **Pattern:** Status line + "\n\n" + response message
- **Consistent:** Double newline separation in all cases

## Synchronization Issues Identified

### 1. Move Count Tracking
- **Issue:** TypeScript not incrementing/displaying move count
- **Evidence:** Z-Machine shows increasing move counts (2, 29, 32, 44, etc.)
- **Impact:** Status display completely missing

### 2. Score Display Synchronization
- **Issue:** TypeScript not displaying current score
- **Evidence:** All Z-Machine examples show "Score: 0"
- **Impact:** Score tracking not visible to player

### 3. Room Name Display
- **Issue:** TypeScript not showing current room in status
- **Evidence:** Z-Machine shows room names (North of House, Clearing, Forest, Canyon View)
- **Impact:** Player loses location context

## Root Cause Analysis

### Primary Issue: Missing Status Display System
The TypeScript implementation lacks a **StatusDisplayManager** that:
1. Formats status lines with proper padding and spacing
2. Integrates with command execution to include status in responses
3. Synchronizes with game state (room, score, moves)
4. Maintains Z-Machine compatible formatting

### Secondary Issues: State Synchronization
1. **Move counting** may not be properly incremented
2. **Score tracking** may not be properly maintained
3. **Room state** may not be properly synchronized with display

## Fix Requirements

### 1. Status Display Implementation
- Create StatusDisplayManager interface and implementation
- Format status line: "[Room Name (45 chars)]Score: [score]        Moves: [moves]"
- Integrate with all command responses
- Ensure proper newline formatting ("\n\n")

### 2. Game State Synchronization
- Ensure move count increments correctly for all commands
- Ensure score updates are reflected in status display
- Ensure current room name is available for status display

### 3. Command Integration
- Modify command executor to include status in all responses
- Ensure consistent formatting across all command types
- Maintain performance while adding status display

## Impact Assessment

### Severity: Critical
- **Frequency:** 23/41 total differences (56% of all issues)
- **User Experience:** Major - players lose essential game state information
- **Parity Impact:** Resolving this would improve parity significantly

### Affected Commands
- **Inventory commands:** Most frequent (10 occurrences)
- **Object interactions:** Second most frequent (7 occurrences)
- **Movement commands:** Moderate frequency (4 occurrences)
- **All command types:** Universal issue affecting entire game

## Recommendations

### Priority 1: Implement Status Display System
1. Create StatusDisplayManager with Z-Machine compatible formatting
2. Integrate with command executor for universal status display
3. Ensure proper game state synchronization

### Priority 2: Validate Move and Score Tracking
1. Verify move count increments correctly
2. Verify score updates are properly tracked
3. Ensure room state is properly maintained

### Priority 3: Comprehensive Testing
1. Test status display with all command types
2. Verify formatting matches Z-Machine exactly
3. Ensure no performance regression

This analysis provides the foundation for implementing the status display system that will resolve the majority of timing differences and significantly improve parity.