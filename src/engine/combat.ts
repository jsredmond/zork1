/**
 * Combat System
 * Implements the combat mechanics from ZIL (I-FIGHT daemon)
 * 
 * Based on ZIL routines from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { GameObject, GameObjectImpl } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';
import { ActorState } from './actors.js';
import { getRandom } from '../testing/seededRandom.js';

/**
 * Combat result types
 */
export enum CombatResult {
  MISSED = 1,
  LIGHT_WOUND = 2,
  SERIOUS_WOUND = 3,
  STAGGER = 4,
  LOSE_WEAPON = 5,
  UNCONSCIOUS = 6,
  KILLED = 7,
  HESITATE = 8,
  SITTING_DUCK = 9
}

/**
 * Strength constants from ZIL
 */
export const STRENGTH_MIN = 2;
export const STRENGTH_MAX = 7;
export const MAX_SCORE = 350;
export const CURE_WAIT = 30;

/**
 * Villain data structure
 * Corresponds to VILLAINS table in ZIL
 */
export interface VillainData {
  villainId: string;
  bestWeapon: string;
  bestWeaponAdvantage: number;
  probability: number;
  messages: CombatMessages;
}

/**
 * Combat messages for a villain
 */
export interface CombatMessages {
  missed: string[];
  lightWound: string[];
  seriousWound: string[];
  stagger: string[];
  loseWeapon: string[];
  unconscious: string[];
  killed: string[];
  hesitate: string[];
}

/**
 * Combat result tables from ZIL
 * These determine outcomes based on attacker/defender strength
 */
const DEF1: CombatResult[] = [
  CombatResult.LIGHT_WOUND, CombatResult.LIGHT_WOUND,
  CombatResult.SERIOUS_WOUND, CombatResult.STAGGER,
  CombatResult.LOSE_WEAPON, CombatResult.UNCONSCIOUS,
  CombatResult.KILLED, CombatResult.MISSED,
  CombatResult.MISSED
];

const DEF2A: CombatResult[] = [
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.LIGHT_WOUND, CombatResult.LIGHT_WOUND,
  CombatResult.SERIOUS_WOUND, CombatResult.STAGGER,
  CombatResult.LOSE_WEAPON, CombatResult.UNCONSCIOUS,
  CombatResult.KILLED
];

const DEF2B: CombatResult[] = [
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.LIGHT_WOUND,
  CombatResult.SERIOUS_WOUND, CombatResult.SERIOUS_WOUND,
  CombatResult.SERIOUS_WOUND, CombatResult.SERIOUS_WOUND,
  CombatResult.SERIOUS_WOUND
];

const DEF3A: CombatResult[] = [
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.LIGHT_WOUND,
  CombatResult.SERIOUS_WOUND, CombatResult.STAGGER,
  CombatResult.LOSE_WEAPON
];

const DEF3B: CombatResult[] = [
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.MISSED, CombatResult.MISSED,
  CombatResult.LIGHT_WOUND
];

/**
 * Result tables indexed by defense strength
 */
const DEF1_RES = [DEF1.slice(2), DEF1.slice(4)];
const DEF2_RES = [DEF2A, DEF2A, DEF2B.slice(2), DEF2B.slice(4)];
const DEF3_RES = [DEF3A, DEF3A.slice(2), DEF3A, DEF3B.slice(2)];

/**
 * Calculate player's fighting strength
 * Based on score and current wounds
 */
export function calculateFightStrength(state: GameState, adjust: boolean = true): number {
  // Base strength increases with score
  let strength = STRENGTH_MIN + Math.floor(
    state.score / Math.floor(MAX_SCORE / (STRENGTH_MAX - STRENGTH_MIN))
  );
  
  // Adjust for wounds if requested
  if (adjust) {
    const wounds = state.getGlobalVariable('PLAYER_STRENGTH') || 0;
    strength += wounds;
  }
  
  return strength;
}

/**
 * Calculate villain's fighting strength
 */
export function calculateVillainStrength(
  state: GameState,
  villainId: string,
  villainData: VillainData
): number {
  const villain = state.getObject(villainId) as GameObjectImpl;
  if (!villain) return 0;
  
  let strength = villain.getProperty('strength') || 0;
  
  // If strength is negative, villain is unconscious
  if (strength < 0) {
    return strength;
  }
  
  // Check if player is using villain's best weapon
  const playerWeapon = state.getGlobalVariable('COMBAT_WEAPON');
  if (playerWeapon && playerWeapon === villainData.bestWeapon) {
    const adjusted = strength - villainData.bestWeaponAdvantage;
    strength = Math.max(1, adjusted);
  }
  
  return strength;
}

/**
 * Find a weapon in an actor's inventory
 */
export function findWeapon(state: GameState, actorId: string): string | null {
  const weaponIds = ['SWORD', 'KNIFE', 'AXE', 'STILETTO', 'RUSTY-KNIFE'];
  
  if (actorId === 'PLAYER') {
    for (const weaponId of weaponIds) {
      if (state.isInInventory(weaponId)) {
        return weaponId;
      }
    }
  } else {
    // Check if villain has a weapon
    for (const weaponId of weaponIds) {
      const weapon = state.getObject(weaponId);
      if (weapon && weapon.location === actorId) {
        return weaponId;
      }
    }
  }
  
  return null;
}

/**
 * Get combat result based on attacker/defender strength
 */
function getCombatResult(
  attackStrength: number,
  defenseStrength: number,
  isStaggered: boolean
): CombatResult {
  let att = attackStrength;
  let def = defenseStrength;
  let resultTable: CombatResult[];
  
  if (def === 1) {
    att = Math.min(att, 3);
    resultTable = DEF1_RES[att - 1] || DEF1_RES[0];
  } else if (def === 2) {
    att = Math.min(att, 4);
    resultTable = DEF2_RES[att - 1] || DEF2_RES[0];
  } else if (def > 2) {
    att = att - def;
    att = Math.max(-2, Math.min(2, att));
    resultTable = DEF3_RES[att + 2] || DEF3_RES[2];
  } else {
    resultTable = DEF1_RES[0];
  }
  
  // Random result from table
  const index = Math.floor(getRandom() * Math.min(9, resultTable.length));
  let result = resultTable[index] || CombatResult.MISSED;
  
  // Modify result if staggered
  if (isStaggered) {
    if (result === CombatResult.STAGGER) {
      result = CombatResult.HESITATE;
    } else {
      result = CombatResult.SITTING_DUCK;
    }
  }
  
  return result;
}

/**
 * Execute a villain's attack on the player
 */
export function executeVillainAttack(
  state: GameState,
  villainId: string,
  villainData: VillainData
): CombatResult | null {
  const villain = state.getObject(villainId) as GameObjectImpl;
  if (!villain) return null;
  
  // Check if villain is staggered
  const villainStaggered = villain.flags.has('STAGGERED' as any);
  if (villainStaggered) {
    console.log(`The ${villain.name.toLowerCase()} slowly regains his feet.`);
    villain.flags.delete('STAGGERED' as any);
    state.setFlag('PLAYER_STAGGERED', false);
    return CombatResult.HESITATE;
  }
  
  // Calculate strengths
  const attackStrength = calculateVillainStrength(state, villainId, villainData);
  const defenseStrength = calculateFightStrength(state);
  
  if (defenseStrength <= 0) {
    return CombatResult.KILLED;
  }
  
  // Get combat result
  const playerStaggered = state.getFlag('PLAYER_STAGGERED');
  const result = getCombatResult(attackStrength, defenseStrength, playerStaggered);
  
  // Display message
  displayCombatMessage(state, villainData.messages, result, villain.name, findWeapon(state, 'PLAYER'));
  
  // Apply result to player
  applyPlayerDamage(state, result, defenseStrength);
  
  return result;
}

/**
 * Execute player's attack on a villain
 */
export function executePlayerAttack(
  state: GameState,
  villainId: string,
  weaponId: string,
  villainData: VillainData
): CombatResult | null {
  const villain = state.getObject(villainId) as GameObjectImpl;
  if (!villain) return null;
  
  // Set villain to fighting mode
  villain.flags.add(ObjectFlag.FIGHTBIT);
  
  // Check if player is staggered
  const playerStaggered = state.getFlag('PLAYER_STAGGERED');
  if (playerStaggered) {
    console.log("You are still recovering from that last blow, so your attack is ineffective.");
    state.setFlag('PLAYER_STAGGERED', false);
    return CombatResult.HESITATE;
  }
  
  // Calculate strengths
  const attackStrength = calculateFightStrength(state);
  const defenseStrength = calculateVillainStrength(state, villainId, villainData);
  
  // Check if villain is already dead or unconscious
  if (defenseStrength === 0) {
    const villainWeapon = findWeapon(state, villainId);
    if (!villainWeapon) {
      console.log(`The unarmed ${villain.name.toLowerCase()} cannot defend himself: He dies.`);
    } else if (defenseStrength < 0) {
      console.log(`The unconscious ${villain.name.toLowerCase()} cannot defend himself: He dies.`);
    }
    return CombatResult.KILLED;
  }
  
  // Store weapon for combat calculations
  state.setGlobalVariable('COMBAT_WEAPON', weaponId);
  
  // Get combat result
  const villainStaggered = villain.flags.has('STAGGERED' as any);
  const result = getCombatResult(attackStrength, defenseStrength, villainStaggered);
  
  // Display hero combat message
  displayHeroCombatMessage(state, result, villain.name, weaponId);
  
  // Apply result to villain
  applyVillainDamage(state, villainId, result, defenseStrength);
  
  return result;
}

/**
 * Display combat message
 */
function displayCombatMessage(
  state: GameState,
  messages: CombatMessages,
  result: CombatResult,
  villainName: string,
  weaponId: string | null
): void {
  let messageArray: string[] = [];
  
  switch (result) {
    case CombatResult.MISSED:
      messageArray = messages.missed;
      break;
    case CombatResult.LIGHT_WOUND:
      messageArray = messages.lightWound;
      break;
    case CombatResult.SERIOUS_WOUND:
      messageArray = messages.seriousWound;
      break;
    case CombatResult.STAGGER:
      messageArray = messages.stagger;
      break;
    case CombatResult.LOSE_WEAPON:
      messageArray = messages.loseWeapon;
      break;
    case CombatResult.UNCONSCIOUS:
      messageArray = messages.unconscious;
      break;
    case CombatResult.KILLED:
      messageArray = messages.killed;
      break;
    case CombatResult.HESITATE:
      messageArray = messages.hesitate;
      break;
  }
  
  if (messageArray.length > 0) {
    const message = messageArray[Math.floor(getRandom() * messageArray.length)];
    const formatted = message
      .replace(/\{villain\}/g, villainName.toLowerCase())
      .replace(/\{weapon\}/g, weaponId ? state.getObject(weaponId)?.name.toLowerCase() || 'weapon' : 'weapon');
    console.log(formatted);
  }
}

/**
 * Display hero combat message
 */
function displayHeroCombatMessage(
  state: GameState,
  result: CombatResult,
  villainName: string,
  weaponId: string
): void {
  const weaponName = state.getObject(weaponId)?.name.toLowerCase() || 'weapon';
  const villain = villainName.toLowerCase();
  
  const messages: Record<CombatResult, string[]> = {
    [CombatResult.MISSED]: [
      `Your ${weaponName} misses the ${villain} by an inch.`,
      `A good slash, but it misses the ${villain} by a mile.`,
      `You charge, but the ${villain} jumps nimbly aside.`,
      `Clang! Crash! The ${villain} parries.`,
      `A quick stroke, but the ${villain} is on guard.`,
      `A good stroke, but it's too slow; the ${villain} dodges.`
    ],
    [CombatResult.LIGHT_WOUND]: [
      `The ${villain} is struck on the arm; blood begins to trickle down.`,
      `Your ${weaponName} pinks the ${villain} on the wrist, but it's not serious.`,
      `Your stroke lands, but it was only the flat of the blade.`,
      `The blow lands, making a shallow gash in the ${villain}'s arm!`
    ],
    [CombatResult.SERIOUS_WOUND]: [
      `The ${villain} receives a deep gash in his side.`,
      `A savage blow on the thigh! The ${villain} is stunned but can still fight!`,
      `Slash! Your blow lands! That one hit an artery, it could be serious!`,
      `Slash! Your stroke connects! This could be serious!`
    ],
    [CombatResult.STAGGER]: [
      `The ${villain} is staggered, and drops to his knees.`,
      `The ${villain} is momentarily disoriented and can't fight back.`,
      `The force of your blow knocks the ${villain} back, stunned.`,
      `The ${villain} is confused and can't fight back.`,
      `The quickness of your thrust knocks the ${villain} back, stunned.`
    ],
    [CombatResult.LOSE_WEAPON]: [
      `The ${villain}'s weapon is knocked to the floor, leaving him unarmed.`,
      `The ${villain} is disarmed by a subtle feint past his guard.`
    ],
    [CombatResult.UNCONSCIOUS]: [
      `Your ${weaponName} crashes down, knocking the ${villain} into dreamland.`,
      `The ${villain} is battered into unconsciousness.`,
      `A furious exchange, and the ${villain} is knocked out!`,
      `The haft of your ${weaponName} knocks out the ${villain}.`,
      `The ${villain} is knocked out!`
    ],
    [CombatResult.KILLED]: [
      `It's curtains for the ${villain} as your ${weaponName} removes his head.`,
      `The fatal blow strikes the ${villain} square in the heart: He dies.`,
      `The ${villain} takes a fatal blow and slumps to the floor dead.`
    ],
    [CombatResult.HESITATE]: [
      `The ${villain} hesitates, giving you an opening.`
    ],
    [CombatResult.SITTING_DUCK]: [
      `The ${villain} is defenseless!`
    ]
  };
  
  const messageArray = messages[result] || messages[CombatResult.MISSED];
  const message = messageArray[Math.floor(getRandom() * messageArray.length)];
  console.log(message);
}

/**
 * Apply damage to player
 */
function applyPlayerDamage(
  state: GameState,
  result: CombatResult,
  currentDefense: number
): void {
  let newDefense = currentDefense;
  const baseDefense = calculateFightStrength(state, false);
  
  switch (result) {
    case CombatResult.MISSED:
    case CombatResult.HESITATE:
      // No damage
      break;
      
    case CombatResult.LIGHT_WOUND:
      newDefense = Math.max(0, currentDefense - 1);
      // Reduce carrying capacity
      const loadAllowed = state.getGlobalVariable('LOAD_ALLOWED') || 100;
      if (loadAllowed > 50) {
        state.setGlobalVariable('LOAD_ALLOWED', loadAllowed - 10);
      }
      break;
      
    case CombatResult.SERIOUS_WOUND:
      newDefense = Math.max(0, currentDefense - 2);
      // Reduce carrying capacity more
      const loadAllowed2 = state.getGlobalVariable('LOAD_ALLOWED') || 100;
      if (loadAllowed2 > 50) {
        state.setGlobalVariable('LOAD_ALLOWED', loadAllowed2 - 20);
      }
      break;
      
    case CombatResult.STAGGER:
      state.setFlag('PLAYER_STAGGERED', true);
      break;
      
    case CombatResult.LOSE_WEAPON:
      // Drop weapon
      const weapon = findWeapon(state, 'PLAYER');
      if (weapon) {
        const currentRoom = state.getCurrentRoom();
        if (currentRoom) {
          state.moveObject(weapon, currentRoom.id);
          console.log(`Your ${state.getObject(weapon)?.name.toLowerCase()} is knocked from your hand!`);
          
          // Check for another weapon
          const newWeapon = findWeapon(state, 'PLAYER');
          if (newWeapon) {
            console.log(`Fortunately, you still have a ${state.getObject(newWeapon)?.name.toLowerCase()}.`);
          }
        }
      }
      break;
      
    case CombatResult.UNCONSCIOUS:
    case CombatResult.KILLED:
    case CombatResult.SITTING_DUCK:
      newDefense = 0;
      break;
  }
  
  // Update player strength
  const wounds = newDefense - baseDefense;
  state.setGlobalVariable('PLAYER_STRENGTH', wounds);
  
  // Check if player died
  if (newDefense <= 0 && result !== CombatResult.UNCONSCIOUS) {
    state.setGlobalVariable('PLAYER_STRENGTH', -10000);
  }
  
  // Queue healing if wounded
  if (wounds < 0) {
    state.eventSystem.queueInterrupt('I-CURE', CURE_WAIT);
    state.eventSystem.enableEvent('I-CURE');
  }
}

/**
 * Apply damage to villain
 */
function applyVillainDamage(
  state: GameState,
  villainId: string,
  result: CombatResult,
  currentDefense: number
): void {
  const villain = state.getObject(villainId) as GameObjectImpl;
  if (!villain) return;
  
  let newDefense = currentDefense;
  
  switch (result) {
    case CombatResult.MISSED:
    case CombatResult.HESITATE:
      // No damage
      break;
      
    case CombatResult.LIGHT_WOUND:
      newDefense = Math.max(0, currentDefense - 1);
      break;
      
    case CombatResult.SERIOUS_WOUND:
      newDefense = Math.max(0, currentDefense - 2);
      break;
      
    case CombatResult.STAGGER:
      villain.flags.add('STAGGERED' as any);
      break;
      
    case CombatResult.LOSE_WEAPON:
      // Drop weapon
      const weapon = findWeapon(state, villainId);
      if (weapon) {
        const currentRoom = state.getCurrentRoom();
        if (currentRoom) {
          const weaponObj = state.getObject(weapon) as GameObjectImpl;
          if (weaponObj) {
            weaponObj.flags.delete('NDESCBIT' as any);
            weaponObj.flags.add(ObjectFlag.WEAPONBIT);
          }
          state.moveObject(weapon, currentRoom.id);
        }
      }
      break;
      
    case CombatResult.UNCONSCIOUS:
      newDefense = -currentDefense;
      break;
      
    case CombatResult.KILLED:
    case CombatResult.SITTING_DUCK:
      newDefense = 0;
      break;
  }
  
  // Update villain strength
  villain.setProperty('strength', newDefense);
  
  // Handle death
  if (newDefense === 0) {
    villain.flags.delete(ObjectFlag.FIGHTBIT);
    console.log(`Almost as soon as the ${villain.name.toLowerCase()} breathes his last breath, a cloud of sinister black fog envelops him, and when the fog lifts, the carcass has disappeared.`);
    
    // Remove villain from game
    state.moveObject(villainId, null);
    
    // Notify actor system
    if (state.actorManager.getActor(villainId)) {
      state.actorManager.transitionActorState(villainId, ActorState.DEAD, state);
    }
  } else if (result === CombatResult.UNCONSCIOUS) {
    // Notify actor system
    if (state.actorManager.getActor(villainId)) {
      state.actorManager.transitionActorState(villainId, ActorState.UNCONSCIOUS, state);
    }
  }
}

/**
 * Combat daemon - runs each turn to handle active combat
 */
export function combatDaemon(state: GameState, villains: VillainData[]): boolean {
  let anyFighting = false;
  
  // Check each villain
  for (const villainData of villains) {
    const villain = state.getObject(villainData.villainId) as GameObjectImpl;
    if (!villain) continue;
    
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) continue;
    
    // Check if villain is in current room and visible
    if (villain.location === currentRoom.id && !villain.flags.has('INVISIBLE' as any)) {
      const strength = villain.getProperty('strength') || 0;
      
      // Check if villain should wake up
      if (strength < 0) {
        const prob = villainData.probability;
        if (prob > 0 && getRandom() * 100 < prob) {
          villainData.probability = 0;
          // Wake up villain
          villain.setProperty('strength', Math.abs(strength));
          if (state.actorManager.getActor(villainData.villainId)) {
            state.actorManager.transitionActorState(villainData.villainId, ActorState.NORMAL, state);
          }
        } else {
          villainData.probability = Math.min(100, prob + 25);
        }
      } else if (villain.flags.has(ObjectFlag.FIGHTBIT)) {
        anyFighting = true;
      }
    } else {
      // Villain not in room - clear combat state
      if (villain.flags.has(ObjectFlag.FIGHTBIT)) {
        villain.flags.delete(ObjectFlag.FIGHTBIT);
      }
      state.setFlag('PLAYER_STAGGERED', false);
      villain.flags.delete('STAGGERED' as any);
    }
  }
  
  // If any villain is fighting, execute combat round
  if (anyFighting) {
    for (const villainData of villains) {
      const villain = state.getObject(villainData.villainId) as GameObjectImpl;
      if (!villain) continue;
      
      const currentRoom = state.getCurrentRoom();
      if (!currentRoom) continue;
      
      if (villain.location === currentRoom.id && villain.flags.has(ObjectFlag.FIGHTBIT)) {
        executeVillainAttack(state, villainData.villainId, villainData);
      }
    }
  }
  
  return anyFighting;
}

/**
 * Healing daemon - gradually heals player wounds
 */
export function healingDaemon(state: GameState): void {
  let wounds = state.getGlobalVariable('PLAYER_STRENGTH') || 0;
  
  if (wounds > 0) {
    wounds = 0;
    state.setGlobalVariable('PLAYER_STRENGTH', wounds);
  } else if (wounds < 0) {
    wounds += 1;
    state.setGlobalVariable('PLAYER_STRENGTH', wounds);
  }
  
  // Restore carrying capacity
  const loadAllowed = state.getGlobalVariable('LOAD_ALLOWED') || 100;
  if (wounds < 0 && loadAllowed < 100) {
    state.setGlobalVariable('LOAD_ALLOWED', Math.min(100, loadAllowed + 10));
  }
  
  // Continue healing if still wounded
  if (wounds < 0) {
    state.eventSystem.queueInterrupt('I-CURE', CURE_WAIT);
    state.eventSystem.enableEvent('I-CURE');
  }
}
