/**
 * Thief Behavior
 * Implements the thief/robber NPC behavior
 * 
 * Based on I-THIEF daemon from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { BaseActorBehavior, ActorState } from './actors.js';
import { ObjectFlag } from '../game/data/flags.js';
import { getRandom } from '../testing/seededRandom.js';
import { scoreAction } from '../game/scoring.js';

/**
 * Thief behavior implementation
 * The thief moves around, steals treasures, and fights the player
 */
export class ThiefBehavior extends BaseActorBehavior {
  private hasAppeared: boolean = false;

  constructor() {
    super('THIEF', ActorState.NORMAL);
  }

  executeTurn(state: GameState): boolean {
    const thief = this.getActor(state);
    if (!thief) return false;

    const thiefRoom = thief.location;
    const isVisible = this.isVisible(state);
    const isWithPlayer = this.isWithPlayer(state);
    let messageDisplayed = false;

    // If thief is in treasure room and player is not there
    if (thiefRoom === 'TREASURE-ROOM' && !isWithPlayer) {
      if (isVisible) {
        this.hackTreasures(state);
      }
      this.depositBooty(state);
    }
    // If thief is in same room as player, in the dark, and no troll present
    else if (isWithPlayer && !this.isRoomLit(state) && !this.isTrollPresent(state)) {
      // Thief vs adventurer in the dark
      if (this.thiefVsAdventurer(state, isVisible)) {
        return true;
      }
      if (thief.flags.has('INVISIBLE' as any)) {
        // Thief became invisible
        return false;
      }
    }
    // Otherwise, thief roams and steals
    else {
      // If thief is visible in a room, check if player left
      if (isVisible && thiefRoom && thiefRoom !== state.currentRoom) {
        // Player left, thief becomes invisible
        thief.flags.add('INVISIBLE' as any);
        this.hasAppeared = false;
      }

      // If room has been touched by player, rob it
      const room = thiefRoom ? state.getRoom(thiefRoom) : null;
      if (room && room.flags.has('TOUCHBIT' as any)) {
        const stolen = this.robRoom(state, thiefRoom);
        if (stolen) {
          messageDisplayed = true;
        }
      }
    }

    // Move thief to next room if not visible
    if (!isVisible) {
      this.recoverStiletto(state);
      this.moveToNextRoom(state);
    }

    // Drop non-treasure items
    if (thiefRoom && thiefRoom !== 'TREASURE-ROOM') {
      const dropped = this.dropJunk(state, thiefRoom);
      if (dropped) {
        messageDisplayed = true;
      }
    }

    return messageDisplayed;
  }

  /**
   * Thief attacks player in the dark
   */
  private thiefVsAdventurer(state: GameState, isVisible: boolean): boolean {
    // Simplified combat - thief may steal items or attack
    if (getRandom() < 0.3) {
      // Steal from player
      const stolen = this.stealFromPlayer(state);
      if (stolen && isVisible) {
        console.log("The robber stealthily approaches and swipes something from you!");
        return true;
      }
    }
    return false;
  }

  /**
   * Check if room is lit
   */
  private isRoomLit(state: GameState): boolean {
    const room = state.getCurrentRoom();
    if (!room) return false;
    return room.flags.has(ObjectFlag.ONBIT);
  }

  /**
   * Check if troll is present in current room
   */
  private isTrollPresent(state: GameState): boolean {
    const room = state.getCurrentRoom();
    if (!room) return false;
    return room.objects.includes('TROLL');
  }

  /**
   * Hack treasures when thief is visible in treasure room
   * This is where the thief opens the egg if he has it
   */
  private hackTreasures(state: GameState): void {
    // Mark treasures as touched/stolen by thief
    const treasureRoom = state.getRoom('TREASURE-ROOM');
    if (!treasureRoom) return;

    for (const objId of treasureRoom.objects) {
      const obj = state.getObject(objId);
      if (obj && obj.value && obj.value > 0) {
        obj.flags.add('TOUCHBIT' as any);
      }
    }

    // Check if thief has the egg and open it
    const egg = state.getObject('EGG');
    if (egg && egg.location === 'THIEF' && !egg.hasFlag(ObjectFlag.OPENBIT)) {
      // Thief opens the egg
      egg.addFlag(ObjectFlag.OPENBIT);
      state.setGlobalVariable('EGG_SOLVE', true);
      // Note: No points awarded for OPEN_EGG - player cannot open the egg themselves
      // Points come from VALUE when taking the egg (scoreTreasureTake)
    }
  }

  /**
   * Deposit stolen treasures in treasure room
   */
  private depositBooty(state: GameState): void {
    const thief = this.getActor(state);
    if (!thief) return;

    // Move all treasures from thief to treasure room
    const thiefContents = state.getObjectsInContainer('THIEF');
    for (const obj of thiefContents) {
      if (obj.value && obj.value > 0 && obj.id !== 'STILETTO' && obj.id !== 'LARGE-BAG') {
        obj.flags.delete('INVISIBLE' as any);
        state.moveObject(obj.id, 'TREASURE-ROOM');
      }
    }
  }

  /**
   * Rob a room of treasures
   */
  private robRoom(state: GameState, roomId: string): boolean {
    const room = state.getRoom(roomId);
    if (!room) return false;

    let stolen = false;
    const objectsToSteal: string[] = [];

    // Find treasures to steal
    for (const objId of room.objects) {
      const obj = state.getObject(objId);
      if (obj && obj.value && obj.value > 0 && 
          !obj.flags.has('SACREDBIT' as any) &&
          !obj.flags.has('INVISIBLE' as any)) {
        objectsToSteal.push(objId);
      }
    }

    // Steal treasures (75% chance per treasure)
    for (const objId of objectsToSteal) {
      if (getRandom() < 0.75) {
        const obj = state.getObject(objId);
        if (obj) {
          state.moveObject(objId, 'THIEF');
          obj.flags.add('TOUCHBIT' as any);
          obj.flags.add('INVISIBLE' as any);
          stolen = true;
        }
      }
    }

    return stolen;
  }

  /**
   * Steal junk items from a room
   */
  private stealJunk(state: GameState, roomId: string): boolean {
    const room = state.getRoom(roomId);
    if (!room) return false;

    for (const objId of room.objects) {
      const obj = state.getObject(objId);
      if (obj && (!obj.value || obj.value === 0) &&
          obj.flags.has(ObjectFlag.TAKEBIT) &&
          !obj.flags.has('SACREDBIT' as any) &&
          !obj.flags.has('INVISIBLE' as any) &&
          (objId === 'STILETTO' || getRandom() < 0.1)) {
        
        state.moveObject(objId, 'THIEF');
        obj.flags.add('TOUCHBIT' as any);
        obj.flags.add('INVISIBLE' as any);

        if (roomId === state.currentRoom) {
          console.log(`You suddenly notice that the ${obj.name} vanished.`);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Steal from player inventory
   */
  private stealFromPlayer(state: GameState): boolean {
    const inventory = state.getInventoryObjects();
    const treasures = inventory.filter(obj => obj.value && obj.value > 0);
    
    if (treasures.length > 0) {
      const target = treasures[Math.floor(getRandom() * treasures.length)];
      state.moveObject(target.id, 'THIEF');
      target.flags.add('TOUCHBIT' as any);
      target.flags.add('INVISIBLE' as any);
      return true;
    }
    return false;
  }

  /**
   * Drop non-treasure items
   */
  private dropJunk(state: GameState, roomId: string): boolean {
    const thief = this.getActor(state);
    if (!thief) return false;

    const thiefContents = state.getObjectsInContainer('THIEF');
    let dropped = false;
    let firstDrop = true;

    for (const obj of thiefContents) {
      if (obj.id === 'STILETTO' || obj.id === 'LARGE-BAG') {
        continue;
      }

      // Drop non-treasures with 30% probability
      if ((!obj.value || obj.value === 0) && getRandom() < 0.3) {
        obj.flags.delete('INVISIBLE' as any);
        state.moveObject(obj.id, roomId);
        dropped = true;

        if (firstDrop && roomId === state.currentRoom) {
          console.log("The robber, rummaging through his bag, dropped a few items he found valueless.");
          firstDrop = false;
        }
      }
    }

    return dropped;
  }

  /**
   * Recover stiletto if it's in the same room
   */
  private recoverStiletto(state: GameState): void {
    const thief = this.getActor(state);
    const stiletto = state.getObject('STILETTO');
    
    if (thief && stiletto && stiletto.location === thief.location) {
      stiletto.flags.add('NDESCBIT' as any);
      state.moveObject('STILETTO', 'THIEF');
    }
  }

  /**
   * Move thief to next valid room
   */
  private moveToNextRoom(state: GameState): void {
    const thief = this.getActor(state);
    if (!thief) return;

    const currentRoom = thief.location;
    const rooms = Array.from(state.rooms.keys());
    
    // Find next valid room (not sacred, on land)
    let attempts = 0;
    let nextRoom = currentRoom;
    
    while (attempts < 50) {
      const currentIndex = rooms.indexOf(nextRoom || '');
      const nextIndex = (currentIndex + 1) % rooms.length;
      nextRoom = rooms[nextIndex];
      
      const room = state.getRoom(nextRoom);
      if (room && 
          !room.flags.has('SACREDBIT' as any) &&
          room.flags.has('RLANDBIT' as any)) {
        break;
      }
      attempts++;
    }

    if (nextRoom && nextRoom !== currentRoom) {
      state.moveObject('THIEF', nextRoom);
      thief.flags.delete(ObjectFlag.FIGHTBIT);
      thief.flags.add('INVISIBLE' as any);
      state.setGlobalVariable('THIEF-HERE', false);
    }
  }

  protected onStateChanged(oldState: ActorState, newState: ActorState, state: GameState): void {
    super.onStateChanged(oldState, newState, state);
    
    const thief = this.getActor(state);
    if (!thief) return;

    if (newState === ActorState.DEAD) {
      // Thief dies - drop stiletto and treasures
      const stiletto = state.getObject('STILETTO');
      if (stiletto && stiletto.location === 'THIEF') {
        state.moveObject('STILETTO', state.currentRoom);
        stiletto.flags.delete('NDESCBIT' as any);
        stiletto.flags.add(ObjectFlag.WEAPONBIT);
      }

      // Drop all treasures
      const thiefContents = state.getObjectsInContainer('THIEF');
      for (const obj of thiefContents) {
        obj.flags.delete('INVISIBLE' as any);
        state.moveObject(obj.id, state.currentRoom);
      }

      // Award points for defeating the thief (25 points, one-time only)
      scoreAction(state, 'DEFEAT_THIEF');

      this.tellIfVisible(state, "The robber's booty remains.");
    } else if (newState === ActorState.UNCONSCIOUS) {
      // Thief unconscious - drop stiletto
      const stiletto = state.getObject('STILETTO');
      if (stiletto && stiletto.location === 'THIEF') {
        state.moveObject('STILETTO', state.currentRoom);
        stiletto.flags.delete('NDESCBIT' as any);
      }
      
      thief.flags.delete(ObjectFlag.FIGHTBIT);
      thief.setProperty('LDESC', 'An unconscious robber is lying here.');
    } else if (newState === ActorState.NORMAL && oldState === ActorState.UNCONSCIOUS) {
      // Thief recovers from unconsciousness
      this.tellIfVisible(state, 
        "The robber revives, briefly feigning continued unconsciousness, and, " +
        "when he sees his moment, scrambles away from you.");
      
      thief.flags.add(ObjectFlag.FIGHTBIT);
      thief.setProperty('LDESC', 'A seedy-looking individual with a large bag is here.');
      this.recoverStiletto(state);
    }
  }

  onReceiveItem(state: GameState, item: GameObject): boolean {
    // Thief doesn't accept gifts
    return false;
  }
}
