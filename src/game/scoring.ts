/**
 * Scoring System
 * Manages treasure scoring and rank calculation
 */

import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';

/**
 * Treasure definitions with their point values
 * Based on TVALUE property from 1dungeon.zil
 */
export const TREASURE_VALUES: Record<string, number> = {
  'SKULL': 10,
  'CHALICE': 5,
  'TRIDENT': 11,
  'DIAMOND': 10,
  'JADE': 5,
  'EMERALD': 10,
  'BAG-OF-COINS': 5,
  'PAINTING': 6,
  'SCEPTRE': 6,
  'COFFIN': 15,
  'TORCH': 6,
  'BRACELET': 5,
  'SCARAB': 5,
  'BAR': 5,
  'POT-OF-GOLD': 10,
  'TRUNK': 5,
  'EGG': 5,
  'CANARY': 4,
  'BAUBLE': 1
};

/**
 * Total possible score in the game
 */
export const MAX_SCORE = 350;

/**
 * Trophy case object ID
 */
export const TROPHY_CASE_ID = 'TROPHY-CASE';

/**
 * Rank titles based on score
 * From V-SCORE routine in 1actions.zil
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
  } else if (score >= 100) {
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
  return objectId in TREASURE_VALUES;
}

/**
 * Get the treasure value for an object
 */
export function getTreasureValue(objectId: string): number {
  return TREASURE_VALUES[objectId] || 0;
}

/**
 * Award points for placing a treasure in the trophy case
 * Prevents double-scoring by tracking which treasures have been scored
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

  // Award points
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
  
  for (const objectId of Object.keys(TREASURE_VALUES)) {
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
  return Object.keys(TREASURE_VALUES).length;
}
