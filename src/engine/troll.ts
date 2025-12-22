/**
 * Troll Behavior
 * Implements the troll NPC behavior
 * 
 * Based on TROLL-FCN from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { BaseActorBehavior, ActorState } from './actors.js';
import { ObjectFlag } from '../game/data/flags.js';
import { getRandom } from '../testing/seededRandom.js';
import { scoreAction } from '../game/scoring.js';

/**
 * Troll behavior implementation
 * The troll blocks passages and fights with an axe
 */
export class TrollBehavior extends BaseActorBehavior {
  constructor() {
    // Troll starts in NORMAL state, combat daemon will set FIGHTBIT probabilistically
    super('TROLL', ActorState.NORMAL);
  }

  executeTurn(state: GameState): boolean {
    const troll = this.getActor(state);
    if (!troll) return false;

    // Check if troll should recover axe
    if (this.state === ActorState.NORMAL || this.state === ActorState.FIGHTING) {
      return this.tryRecoverAxe(state);
    }

    return false;
  }

  /**
   * Try to recover the axe if it's in the same room
   */
  private tryRecoverAxe(state: GameState): boolean {
    const troll = this.getActor(state);
    const axe = state.getObject('AXE');
    
    if (!troll || !axe) return false;

    // If troll already has axe, nothing to do
    if (axe.location === 'TROLL') {
      return false;
    }

    // If axe is in the same room as troll
    if (axe.location === troll.location) {
      // 75% chance to recover axe (90% if troll is fighting)
      const chance = this.state === ActorState.FIGHTING ? 0.90 : 0.75;
      
      if (getRandom() < chance) {
        // Troll recovers axe
        axe.flags.add('NDESCBIT' as any);
        axe.flags.delete(ObjectFlag.WEAPONBIT);
        state.moveObject('AXE', 'TROLL');
        
        // Update the longDescription directly (not via setProperty)
        (troll as any).longDescription = 'A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.';
        
        if (this.isWithPlayer(state)) {
          console.log("The troll, angered and humiliated, recovers his weapon. He appears to have an axe to grind with you.");
          return true;
        }
      } else {
        // Troll is disarmed and cowering
        // Update the longDescription directly (not via setProperty)
        (troll as any).longDescription = 'A pathetically babbling troll is here.';
        
        if (this.isWithPlayer(state)) {
          console.log("The troll, disarmed, cowers in terror, pleading for his life in the guttural tongue of the trolls.");
          return true;
        }
      }
    }

    return false;
  }

  protected onStateChanged(oldState: ActorState, newState: ActorState, state: GameState): void {
    super.onStateChanged(oldState, newState, state);
    
    const troll = this.getActor(state);
    if (!troll) return;

    if (newState === ActorState.DEAD) {
      // Troll dies - drop axe, open passages, and remove body
      const axe = state.getObject('AXE');
      if (axe && axe.location === 'TROLL') {
        state.moveObject('AXE', state.currentRoom);
        axe.flags.delete('NDESCBIT' as any);
        axe.flags.add(ObjectFlag.WEAPONBIT);
      }

      // Set troll flag to indicate passages are open
      state.setFlag('TROLL_FLAG', true);
      
      // Remove troll from room (body disappears)
      state.moveObject('TROLL', null);
      
      // Award points for defeating the troll (10 points, one-time only)
      scoreAction(state, 'DEFEAT_TROLL');
      
      this.tellIfVisible(state, "The troll's body disappears in a cloud of greasy black smoke.");
    } else if (newState === ActorState.UNCONSCIOUS) {
      // Troll unconscious - drop axe and open passages
      const axe = state.getObject('AXE');
      if (axe && axe.location === 'TROLL') {
        state.moveObject('AXE', state.currentRoom);
        axe.flags.delete('NDESCBIT' as any);
        axe.flags.add(ObjectFlag.WEAPONBIT);
      }

      troll.flags.delete(ObjectFlag.FIGHTBIT);
      // Update the longDescription directly (not via setProperty)
      (troll as any).longDescription = 'An unconscious troll is sprawled on the floor. All passages out of the room are open.';
      
      // Set troll flag to indicate passages are open
      state.setFlag('TROLL_FLAG', true);
    } else if (newState === ActorState.FIGHTING && oldState === ActorState.UNCONSCIOUS) {
      // Troll wakes up
      troll.flags.add(ObjectFlag.FIGHTBIT);
      
      this.tellIfVisible(state, "The troll stirs, quickly resuming a fighting stance.");

      // Check if troll can recover axe
      const axe = state.getObject('AXE');
      if (axe) {
        if (axe.location === 'TROLL') {
          // Update the longDescription directly (not via setProperty)
          (troll as any).longDescription = 'A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.';
        } else if (axe.location === troll.location) {
          // Axe is in the room, troll will try to recover it
          axe.flags.add('NDESCBIT' as any);
          axe.flags.delete(ObjectFlag.WEAPONBIT);
          state.moveObject('AXE', 'TROLL');
          // Update the longDescription directly (not via setProperty)
          (troll as any).longDescription = 'A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.';
        } else {
          // Update the longDescription directly (not via setProperty)
          (troll as any).longDescription = 'A troll is here.';
        }
      }

      // Close passages again
      state.setFlag('TROLL_FLAG', false);
    }
  }

  onReceiveItem(state: GameState, item: GameObject): boolean {
    const troll = this.getActor(state);
    if (!troll) return false;

    // Special handling for axe
    if (item.id === 'AXE') {
      if (state.isInInventory('AXE')) {
        console.log("The troll scratches his head in confusion, then takes the axe.");
        troll.flags.add(ObjectFlag.FIGHTBIT);
        state.moveObject('AXE', 'TROLL');
        return true;
      } else {
        console.log("You would have to get the axe first, and that seems unlikely.");
        return false;
      }
    }

    // Special handling for weapons (knife, sword)
    if (item.id === 'KNIFE' || item.id === 'SWORD') {
      // 20% chance troll eats it and dies
      if (getRandom() < 0.20) {
        console.log(`The troll, who is not overly proud, graciously accepts the gift and eats it hungrily. Poor troll, he dies from an internal hemorrhage and his carcass disappears in a sinister black fog.`);
        state.moveObject(item.id, null); // Remove item
        this.transitionState(ActorState.DEAD, state);
        state.setFlag('TROLL_FLAG', true);
        return true;
      } else {
        // Troll throws it back
        state.moveObject(item.id, state.currentRoom);
        console.log(`The troll, who is not overly proud, graciously accepts the gift and, being for the moment sated, throws it back. Fortunately, the troll has poor control, and the ${item.name} falls to the floor. He does not look pleased.`);
        troll.flags.add(ObjectFlag.FIGHTBIT);
        return true;
      }
    }

    // For other items, troll eats them
    console.log(`The troll, who is not overly proud, graciously accepts the gift and not having the most discriminating tastes, gleefully eats it.`);
    state.moveObject(item.id, null); // Remove item
    return true;
  }

  /**
   * Handle talking to the troll
   */
  onTalk(state: GameState): string {
    return "The troll isn't much of a conversationalist.";
  }

  onAttacked(state: GameState, weapon?: GameObject): void {
    const troll = this.getActor(state);
    if (!troll) return;

    // Troll becomes hostile when attacked
    if (this.state !== ActorState.FIGHTING) {
      this.transitionState(ActorState.FIGHTING, state);
      
      // 33% chance to immediately fight back
      if (getRandom() < 0.33) {
        troll.flags.add(ObjectFlag.FIGHTBIT);
      }
    }
  }

  shouldAct(state: GameState): boolean {
    // Troll acts unless dead
    return this.state !== ActorState.DEAD;
  }
}
