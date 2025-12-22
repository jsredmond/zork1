# Requirements Document

## Introduction

This document specifies the requirements for fixing and completing the scoring system in the TypeScript Zork I implementation. The current scoring system only partially works - it awards points for placing treasures in the trophy case but has incorrect treasure values, missing action points, missing room entry points, and no death penalty. The goal is to achieve 100% parity with the original ZIL implementation.

## Glossary

- **Scoring_System**: The module responsible for tracking and awarding points throughout the game
- **Treasure**: An object with a TVALUE property that awards points when placed in the trophy case
- **Action_Points**: Points awarded for completing specific actions or puzzles (VALUE property in ZIL)
- **Room_Entry_Points**: Points awarded when entering certain rooms for the first time
- **Trophy_Case**: The container in the living room where treasures must be placed to score
- **Death_Penalty**: The 10-point deduction applied when the player dies
- **BASE_SCORE**: The accumulated action points (separate from treasure points in ZIL)
- **TVALUE**: The treasure value property - points awarded when treasure is in trophy case
- **VALUE**: The action value property - points awarded when action is completed

## Requirements

### Requirement 1: Correct Treasure Values

**User Story:** As a player, I want treasures to award the correct number of points when placed in the trophy case, so that my score matches the original game.

#### Acceptance Criteria

1. THE Scoring_System SHALL use the following TVALUE points for treasures:
   - Crystal skull: 10 points
   - Silver chalice: 5 points (not 10)
   - Crystal trident: 11 points
   - Huge diamond: 10 points
   - Jade figurine: 5 points
   - Large emerald: 10 points (not 5)
   - Bag of coins: 5 points (not 10)
   - Beautiful painting: 6 points (not 4)
   - Sceptre: 6 points (not 4)
   - Gold coffin: 15 points (not 10)
   - Ivory torch: 6 points (not 5)
   - Sapphire bracelet: 5 points
   - Jeweled scarab: 5 points
   - Platinum bar: 5 points
   - Pot of gold: 10 points
   - Trunk of jewels: 5 points (not 15)
   - Jewel-encrusted egg: 5 points
   - Clockwork canary: 4 points
   - Brass bauble: 1 point
   - Broken egg: 2 points (TVALUE)
   - Broken canary: 1 point (TVALUE)

2. WHEN a treasure is placed in the trophy case, THE Scoring_System SHALL award the TVALUE points exactly once

3. WHEN a treasure is removed and re-placed in the trophy case, THE Scoring_System SHALL NOT award additional points

### Requirement 2: Action Points for Puzzle Solutions

**User Story:** As a player, I want to earn points for solving puzzles and completing actions, so that my score reflects my progress through the game.

#### Acceptance Criteria

1. WHEN the player enters the Kitchen (Living Room) for the first time, THE Scoring_System SHALL award 10 points

2. WHEN the player enters the Cellar for the first time, THE Scoring_System SHALL award 25 points

3. WHEN the player defeats the Troll, THE Scoring_System SHALL award 10 points (VALUE property on TROLL)

4. WHEN the player defeats the Thief, THE Scoring_System SHALL award 25 points

5. WHEN the player defeats the Cyclops, THE Scoring_System SHALL award 10 points

6. WHEN the player successfully opens the egg (via thief or tools), THE Scoring_System SHALL award 5 points (VALUE on EGG)

7. WHEN the player puts coal in the machine, THE Scoring_System SHALL award 5 points

8. WHEN the player turns on the machine (creating diamond), THE Scoring_System SHALL award 1 point

9. WHEN the player waves the sceptre at the rainbow, THE Scoring_System SHALL award 5 points

10. WHEN the player completes the exorcism ritual, THE Scoring_System SHALL award 4 points

11. WHEN the player enters Hades after exorcism, THE Scoring_System SHALL award 4 points

12. WHEN the player enters the Treasure Room (Thief's lair), THE Scoring_System SHALL award 25 points

13. WHEN the player inflates the boat, THE Scoring_System SHALL award 5 points

14. WHEN the player raises the dam, THE Scoring_System SHALL award 3 points

15. WHEN the player lowers the dam, THE Scoring_System SHALL award 3 points

16. WHEN the player enters the Lower Shaft with light for the first time, THE Scoring_System SHALL award the LIGHT-SHAFT bonus points

### Requirement 3: Death Penalty

**User Story:** As a player, I want dying to have consequences on my score, so that the game maintains its challenge.

#### Acceptance Criteria

1. WHEN the player dies, THE Scoring_System SHALL subtract 10 points from the score

2. IF the score would become negative after death penalty, THEN THE Scoring_System SHALL set the score to 0

3. WHEN the player is resurrected, THE Scoring_System SHALL NOT restore the lost points

### Requirement 4: Score Display

**User Story:** As a player, I want to see my current score and rank, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the player types SCORE, THE Scoring_System SHALL display the current score out of 350 total points

2. WHEN the player types SCORE, THE Scoring_System SHALL display the number of moves taken

3. THE Scoring_System SHALL display the correct rank based on score:
   - 0-25: Beginner
   - 26-50: Amateur Adventurer
   - 51-100: Novice Adventurer
   - 101-200: Junior Adventurer
   - 201-300: Adventurer
   - 301-330: Master
   - 331-349: Wizard
   - 350: Master Adventurer

### Requirement 5: Score Persistence

**User Story:** As a player, I want my score to be saved and restored correctly, so that I can continue my game without losing progress.

#### Acceptance Criteria

1. WHEN the game is saved, THE Scoring_System SHALL persist both the current score and the scored treasure flags

2. WHEN the game is restored, THE Scoring_System SHALL restore the exact score and scored treasure state

3. WHEN the game is restored, THE Scoring_System SHALL NOT allow re-scoring of already-scored treasures or actions

### Requirement 6: Win Condition

**User Story:** As a player, I want to know when I've achieved the maximum score, so that I can celebrate completing the game.

#### Acceptance Criteria

1. WHEN the player reaches 350 points, THE Scoring_System SHALL display a congratulatory message

2. THE Scoring_System SHALL only display the win message once per game session

3. WHEN the player has won, THE Scoring_System SHALL set the WON_FLAG to true

### Requirement 7: Score Calculation Integrity

**User Story:** As a player, I want the scoring system to be accurate and consistent, so that I can trust my score reflects my actual progress.

#### Acceptance Criteria

1. THE Scoring_System SHALL maintain separate tracking for action points (BASE_SCORE) and treasure points

2. THE Scoring_System SHALL calculate total score as BASE_SCORE plus sum of TVALUE for treasures in trophy case

3. THE Scoring_System SHALL never award the same action points twice

4. THE Scoring_System SHALL never exceed 350 total points
