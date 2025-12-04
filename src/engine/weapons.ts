/**
 * Weapon Interactions
 * Implements weapon-specific behaviors like sword glowing
 * 
 * Based on ZIL routines from 1actions.zil (I-SWORD daemon)
 */

import { GameState } from '../game/state.js';
import { ObjectFlag } from '../game/data/flags.js';

/**
 * Sword glow daemon (I-SWORD)
 * Makes the sword glow when enemies are nearby
 */
export function swordGlowDaemon(state: GameState): boolean {
  const sword = state.getObject('SWORD');
  if (!sword) return false;
  
  // Only run if player is holding the sword
  if (!state.isInInventory('SWORD')) {
    return false;
  }
  
  const currentRoom = state.getCurrentRoom();
  if (!currentRoom) return false;
  
  // Check for enemies in current room or adjacent rooms
  let glowLevel = 0;
  
  // Check current room for enemies
  if (isRoomInfested(state, currentRoom.id)) {
    glowLevel = 2; // Bright glow
  } else {
    // Check adjacent rooms
    for (const [direction, exit] of currentRoom.exits.entries()) {
      if (exit.destination && isRoomInfested(state, exit.destination)) {
        glowLevel = 1; // Faint glow
        break;
      }
    }
  }
  
  // Get current glow level
  const currentGlow = sword.getProperty('glowLevel') || 0;
  
  // Update glow if changed
  if (glowLevel !== currentGlow) {
    sword.setProperty('glowLevel', glowLevel);
    
    // Display message
    if (glowLevel === 2) {
      console.log("Your sword has begun to glow very brightly.");
    } else if (glowLevel === 1) {
      console.log("Your sword is glowing with a faint blue glow.");
    } else {
      console.log("Your sword is no longer glowing.");
    }
    
    return true;
  }
  
  return false;
}

/**
 * Check if a room contains enemies (actors with ACTORBIT)
 */
function isRoomInfested(state: GameState, roomId: string): boolean {
  const room = state.getRoom(roomId);
  if (!room) return false;
  
  // Check all objects in room
  for (const objectId of room.objects) {
    const obj = state.getObject(objectId);
    if (obj && obj.flags.has(ObjectFlag.ACTORBIT) && !obj.flags.has('INVISIBLE' as any)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Handle weapon-specific actions
 */
export class WeaponInteractions {
  /**
   * Handle taking a weapon that belongs to an actor
   */
  static handleWeaponTake(state: GameState, weaponId: string): string | null {
    // Check if weapon belongs to an actor
    const weapon = state.getObject(weaponId);
    if (!weapon) return null;
    
    const location = weapon.location;
    if (!location) return null;
    
    const owner = state.getObject(location);
    if (!owner || !owner.flags.has(ObjectFlag.ACTORBIT)) {
      return null;
    }
    
    // Special handling for specific weapons
    if (weaponId === 'AXE') {
      return this.handleAxeTake(state);
    } else if (weaponId === 'STILETTO') {
      return this.handleStilettoTake(state);
    }
    
    return null;
  }
  
  /**
   * Handle taking the axe (troll's weapon)
   */
  private static handleAxeTake(state: GameState): string | null {
    const troll = state.getObject('TROLL');
    if (!troll) return null;
    
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) return null;
    
    // Check if troll is in room
    if (troll.location !== currentRoom.id) {
      return null;
    }
    
    // Check troll's state
    const trollFlag = state.getGlobalVariable('TROLL_FLAG');
    if (trollFlag) {
      // Troll is defeated, can take axe
      return null;
    }
    
    // Troll will react
    const strength = troll.getProperty('strength') || 0;
    if (strength < 0) {
      // Troll is unconscious
      return "The unconscious troll cannot prevent you from taking his axe.";
    }
    
    // Troll is awake and will fight
    troll.flags.add(ObjectFlag.FIGHTBIT);
    
    // 75% chance troll recovers axe
    if (Math.random() < 0.75) {
      return "The troll deftly catches the axe and, grinning, nimbly flips it from hand to hand.";
    }
    
    return null;
  }
  
  /**
   * Handle taking the stiletto (thief's weapon)
   */
  private static handleStilettoTake(state: GameState): string | null {
    const thief = state.getObject('THIEF');
    if (!thief) return null;
    
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) return null;
    
    // Check if thief is in room
    if (thief.location !== currentRoom.id) {
      return null;
    }
    
    // Check if thief is visible
    if (thief.flags.has('INVISIBLE' as any)) {
      return null;
    }
    
    // Thief will react
    thief.flags.add(ObjectFlag.FIGHTBIT);
    return "The thief is not amused by your attempt to take his stiletto.";
  }
  
  /**
   * Handle weapon effectiveness against specific enemies
   */
  static getWeaponEffectiveness(weaponId: string, enemyId: string): number {
    // Sword is most effective against most enemies
    if (weaponId === 'SWORD') {
      return 2;
    }
    
    // Knife is moderately effective
    if (weaponId === 'KNIFE' || weaponId === 'RUSTY-KNIFE') {
      return 1;
    }
    
    // Axe is effective but heavy
    if (weaponId === 'AXE') {
      return 2;
    }
    
    // Stiletto is quick but less powerful
    if (weaponId === 'STILETTO') {
      return 1;
    }
    
    return 0;
  }
  
  /**
   * Handle disarming mechanics
   */
  static handleDisarm(state: GameState, actorId: string): boolean {
    const weapon = findActorWeapon(state, actorId);
    if (!weapon) return false;
    
    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) return false;
    
    // Drop weapon in current room
    state.moveObject(weapon, currentRoom.id);
    
    const weaponObj = state.getObject(weapon);
    if (weaponObj) {
      console.log(`The ${weaponObj.name.toLowerCase()} falls to the ground.`);
    }
    
    return true;
  }
}

/**
 * Find weapon held by an actor
 */
function findActorWeapon(state: GameState, actorId: string): string | null {
  const weaponIds = ['SWORD', 'KNIFE', 'AXE', 'STILETTO', 'RUSTY-KNIFE'];
  
  for (const weaponId of weaponIds) {
    const weapon = state.getObject(weaponId);
    if (weapon && weapon.location === actorId) {
      return weaponId;
    }
  }
  
  return null;
}

/**
 * Initialize sword glow daemon
 */
export function initializeSwordGlow(state: GameState): void {
  state.eventSystem.registerInterrupt('I-SWORD', swordGlowDaemon, 1);
  state.eventSystem.enableEvent('I-SWORD');
}

/**
 * Disable sword glow daemon
 */
export function disableSwordGlow(state: GameState): void {
  state.eventSystem.disableEvent('I-SWORD');
}
