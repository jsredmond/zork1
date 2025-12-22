/**
 * Scoring System
 * Manages treasure scoring, action points, and rank calculation
 * 
 * The scoring system follows the original ZIL architecture with two score components:
 * TOTAL_SCORE = BASE_SCORE + OTVAL_FROB(TROPHY_CASE)
 * 
 * Where:
 * - BASE_SCORE: Accumulated action points (room entry, puzzle completion, combat)
 * - OTVAL_FROB: Sum of TVALUE for all treasures currently in the trophy case
 */

import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';

/**
 * Treasure take values (VALUE) - points when first taking
 * From ZIL P?VALUE property on objects in 1dungeon.zil
 * Points are awarded once when the treasure is first taken
 */
export const TREASURE_TAKE_VALUES: Record<string, number> = {
  'SKULL': 10,
  'SCEPTRE': 4,
  'COFFIN': 10,
  'TRIDENT': 4,
  'CHALICE': 10,
  'DIAMOND': 10,
  'JADE': 5,
  'BAG-OF-COINS': 10,
  'EMERALD': 5,
  'PAINTING': 4,
  'BAR': 10,
  'POT-OF-GOLD': 10,
  'BRACELET': 5,
  'SCARAB': 5,
  'TORCH': 14,
  'TRUNK': 15,
  'EGG': 5,
  'BAUBLE': 1,
  'CANARY': 6,
  'BROKEN-EGG': 0,     // No VALUE in ZIL, only TVALUE
  'BROKEN-CANARY': 0   // No VALUE in ZIL, only TVALUE
};

/**
 * Treasure case values (TVALUE) - points when in trophy case
 * From ZIL P?TVALUE property on objects in 1dungeon.zil
 * Points are calculated dynamically based on treasures currently in trophy case
 */
export const TREASURE_CASE_VALUES: Record<string, number> = {
  'SKULL': 10,
  'SCEPTRE': 6,
  'COFFIN': 15,
  'TRIDENT': 11,
  'CHALICE': 5,
  'DIAMOND': 10,
  'JADE': 5,
  'BAG-OF-COINS': 5,
  'EMERALD': 10,
  'PAINTING': 6,
  'BAR': 5,
  'POT-OF-GOLD': 10,
  'BRACELET': 5,
  'SCARAB': 5,
  'TORCH': 6,
  'TRUNK': 5,
  'EGG': 5,
  'BAUBLE': 1,
  'CANARY': 4,
  'BROKEN-EGG': 2,
  'BROKEN-CANARY': 1
};

/**
 * Action point values (VALUE) - points for completing actions
 * From ZIL VALUE property on objects and rooms
 */
export const ACTION_VALUES: Record<string, number> = {
  // Room entry points
  'ENTER_KITCHEN': 10,        // Living room / Kitchen
  'ENTER_CELLAR': 25,
  'ENTER_TREASURE_ROOM': 25,
  'ENTER_HADES': 4,
  'ENTER_LOWER_SHAFT_LIT': 5, // LIGHT-SHAFT variable
  
  // Combat victories
  'DEFEAT_TROLL': 10,
  'DEFEAT_THIEF': 25,
  'DEFEAT_CYCLOPS': 10,
  
  // Puzzle completions
  'INFLATE_BOAT': 5,
  'RAISE_DAM': 3,
  'LOWER_DAM': 3,
  'PUT_COAL_IN_MACHINE': 5,
  'TURN_ON_MACHINE': 1,
  'WAVE_SCEPTRE': 5,
  'COMPLETE_EXORCISM': 4
};

/**
 * Death penalty value
 */
export const DEATH_PENALTY = 10;

/**
 * Total possible score in the game
 */
export const MAX_SCORE = 350;

/**
 * Trophy case object ID
 */
export const TROPHY_CASE_ID = 'TROPHY-CASE';

/**
 * Key for storing scored actions in globalVariables
 */
export const SCORED_ACTIONS_KEY = 'SCORED_ACTIONS';

/**
 * Key for storing VALUE-scored treasures in globalVariables
 * Tracks which treasures have had their VALUE points awarded (on first take)
 */
export const VALUE_SCORED_TREASURES_KEY = 'VALUE_SCORED_TREASURES';

/**
 * Rank titles based on score
 * From V-SCORE routine in 1actions.zil
 * 
 * Thresholds:
 * - 0-25: Beginner
 * - 26-50: Amateur Adventurer
 * - 51-100: Novice Adventurer
 * - 101-200: Junior Adventurer
 * - 201-300: Adventurer
 * - 301-330: Master
 * - 331-349: Wizard
 * - 350: Master Adventurer
 */
export function getRank(score: number): string {
  if (score === 350) {
    return 'Master Adventurer';
  } else if (score > 330) {
    return 'Wizard';
  } else if (score > 300) {
    return 'Master';
  } else if (score > 200) {
    return 'Adventurer';
  } else if (score > 100) {
    return 'Junior Adventurer';
  } else if (score > 50) {
    return 'Novice Adventurer';
  } else if (score > 25) {
    return 'Amateur Adventurer';
  } else {
    return 'Beginner';
  }
}

/**
 * Check if an object is a treasure
 */
export function isTreasure(objectId: string): boolean {
  return objectId in TREASURE_CASE_VALUES;
}

/**
 * Get the treasure case value (TVALUE) for an object
 */
export function getTreasureValue(objectId: string): number {
  return TREASURE_CASE_VALUES[objectId] || 0;
}

/**
 * Get the set of scored actions from game state
 */
function getScoredActions(state: GameState): Set<string> {
  const existing = state.getGlobalVariable(SCORED_ACTIONS_KEY);
  if (existing instanceof Set) {
    return existing;
  }
  // Initialize if not present
  const newSet = new Set<string>();
  state.setGlobalVariable(SCORED_ACTIONS_KEY, newSet);
  return newSet;
}

/**
 * Award action points (one-time only)
 * Tracks which actions have been scored to prevent double-scoring
 * 
 * @param state - The game state
 * @param actionId - The action identifier (e.g., 'ENTER_KITCHEN', 'DEFEAT_TROLL')
 * @returns The points awarded (0 if already scored or invalid action)
 */
export function scoreAction(state: GameState, actionId: string): number {
  const value = ACTION_VALUES[actionId];
  if (value === undefined) {
    return 0;
  }
  
  // Check if already scored
  const scoredActions = getScoredActions(state);
  if (scoredActions.has(actionId)) {
    return 0;
  }
  
  // Mark as scored and award points
  scoredActions.add(actionId);
  state.addToBaseScore(value);
  
  return value;
}

/**
 * Check if an action has already been scored
 */
export function isActionScored(state: GameState, actionId: string): boolean {
  const scoredActions = getScoredActions(state);
  return scoredActions.has(actionId);
}

/**
 * Get the set of VALUE-scored treasures from game state
 * These are treasures that have had their VALUE points awarded on first take
 */
function getValueScoredTreasures(state: GameState): Set<string> {
  const existing = state.getGlobalVariable(VALUE_SCORED_TREASURES_KEY);
  if (existing instanceof Set) {
    return existing;
  }
  // Initialize if not present
  const newSet = new Set<string>();
  state.setGlobalVariable(VALUE_SCORED_TREASURES_KEY, newSet);
  return newSet;
}

/**
 * Check if a treasure has had its VALUE points awarded
 * 
 * @param state - The game state
 * @param objectId - The treasure object ID
 * @returns true if VALUE points have already been awarded for this treasure
 */
export function isTreasureTakeScored(state: GameState, objectId: string): boolean {
  const valueScoredTreasures = getValueScoredTreasures(state);
  return valueScoredTreasures.has(objectId);
}

/**
 * Award VALUE points when taking a treasure for the first time
 * Implements ZIL SCORE-OBJ behavior - awards VALUE points once per treasure
 * 
 * @param state - The game state
 * @param objectId - The treasure object ID
 * @returns The points awarded (0 if already scored, not a treasure, or VALUE is 0)
 */
export function scoreTreasureTake(state: GameState, objectId: string): number {
  // Check if it's a treasure with VALUE > 0
  const value = TREASURE_TAKE_VALUES[objectId];
  if (value === undefined || value === 0) {
    return 0;
  }
  
  // Check if already scored
  const valueScoredTreasures = getValueScoredTreasures(state);
  if (valueScoredTreasures.has(objectId)) {
    return 0;
  }
  
  // Mark as scored and award points to BASE_SCORE
  valueScoredTreasures.add(objectId);
  state.addToBaseScore(value);
  
  return value;
}

/**
 * Apply death penalty
 * Reduces score by DEATH_PENALTY points, but never below 0
 * 
 * @param state - The game state
 */
export function applyDeathPenalty(state: GameState): void {
  const currentScore = state.getBaseScore();
  const newScore = Math.max(0, currentScore - DEATH_PENALTY);
  state.setBaseScore(newScore);
}

/**
 * Calculate sum of TVALUE for treasures in trophy case
 * This matches the ZIL OTVAL-FROB calculation
 * 
 * @param state - The game state
 * @returns Total treasure points for items in trophy case
 */
export function calculateTreasureScore(state: GameState): number {
  let total = 0;
  for (const [objectId, value] of Object.entries(TREASURE_CASE_VALUES)) {
    const obj = state.getObject(objectId);
    if (obj && obj.location === TROPHY_CASE_ID) {
      total += value;
    }
  }
  return total;
}

/**
 * Calculate total score (BASE_SCORE + treasure points)
 * This matches the ZIL scoring formula
 * 
 * @param state - The game state
 * @returns Total score
 */
export function calculateTotalScore(state: GameState): number {
  const baseScore = state.getBaseScore();
  const treasureScore = calculateTreasureScore(state);
  return baseScore + treasureScore;
}

/**
 * Check for win condition and trigger message
 * Returns congratulatory message if player just reached max score
 * 
 * @param state - The game state
 * @returns Win message if just won, null otherwise
 */
export function checkWinCondition(state: GameState): string | null {
  const totalScore = calculateTotalScore(state);
  if (totalScore >= MAX_SCORE && !state.getFlag('WON_FLAG')) {
    state.setFlag('WON_FLAG', true);
    return "Your score has just reached 350 points! Congratulations, you have achieved the rank of Master Adventurer!";
  }
  return null;
}

/**
 * Award points for placing a treasure in the trophy case
 * Marks the treasure as scored to prevent double-scoring
 * 
 * @param state - The game state
 * @param objectId - The treasure object ID
 * @returns The points awarded (0 if already scored or not a treasure)
 */
export function scoreTreasure(state: GameState, objectId: string): number {
  // Check if it's a treasure
  if (!isTreasure(objectId)) {
    return 0;
  }

  // Get the treasure value
  const value = getTreasureValue(objectId);

  // Check if already scored (value is 0 means already scored)
  const obj = state.getObject(objectId) as GameObjectImpl;
  if (!obj) {
    return 0;
  }

  // Check if this treasure has already been scored
  const alreadyScored = obj.getProperty('scored');
  if (alreadyScored) {
    return 0;
  }

  // Mark as scored
  obj.setProperty('scored', true);

  // Award points - add to state.score for backward compatibility
  state.addScore(value);

  return value;
}

/**
 * Check if a treasure is in the trophy case
 */
export function isInTrophyCase(state: GameState, objectId: string): boolean {
  const obj = state.getObject(objectId);
  if (!obj) {
    return false;
  }
  return obj.location === TROPHY_CASE_ID;
}

/**
 * Get all treasures currently in the trophy case
 */
export function getTreasuresInCase(state: GameState): string[] {
  const treasures: string[] = [];
  
  for (const [objectId, obj] of state.objects.entries()) {
    if (isTreasure(objectId) && obj.location === TROPHY_CASE_ID) {
      treasures.push(objectId);
    }
  }
  
  return treasures;
}

/**
 * Get count of treasures that have been scored
 */
export function getScoredTreasureCount(state: GameState): number {
  let count = 0;
  
  for (const objectId of Object.keys(TREASURE_CASE_VALUES)) {
    const obj = state.getObject(objectId) as GameObjectImpl;
    if (obj && obj.getProperty('scored')) {
      count++;
    }
  }
  
  return count;
}

/**
 * Get total number of treasures in the game
 */
export function getTotalTreasureCount(): number {
  return Object.keys(TREASURE_CASE_VALUES).length;
}
