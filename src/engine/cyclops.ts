/**
 * Cyclops Behavior
 * Implements the cyclops NPC behavior
 * 
 * Based on CYCLOPS-FCN and I-CYCLOPS from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { BaseActorBehavior, ActorState } from './actors.js';
import { ObjectFlag } from '../game/data/flags.js';
import { scoreAction } from '../game/scoring.js';

/**
 * Cyclops wrath messages
 */
const CYCLOPS_MAD_MESSAGES = [
  "The cyclops seems somewhat agitated.",
  "The cyclops appears to be getting more agitated.",
  "The cyclops is moving about the room, looking for something.",
  "The cyclops was looking for salt and pepper. No doubt they are condiments for his upcoming snack."
];

/**
 * Cyclops behavior implementation
 * The cyclops blocks the stairs and can be fed to make him sleep
 */
export class CyclopsBehavior extends BaseActorBehavior {
  private wrathLevel: number = 0;

  constructor() {
    super('CYCLOPS', ActorState.NORMAL);
  }

  executeTurn(state: GameState): boolean {
    const cyclops = this.getActor(state);
    if (!cyclops) return false;

    // Don't act if dead or if player is not in cyclops room
    if (this.state === ActorState.DEAD || !this.isWithPlayer(state)) {
      return false;
    }

    // If sleeping, don't act
    if (this.state === ActorState.SLEEPING) {
      return false;
    }

    // Increment wrath level
    const absWrath = Math.abs(this.wrathLevel);
    
    if (absWrath > 5) {
      // Cyclops eats the player
      console.log("The cyclops, tired of all of your games and trickery, grabs you firmly. As he licks his chops, he says \"Mmm. Just like Mom used to make 'em.\" It's nice to be appreciated.");
      // This would trigger game over
      state.setGlobalVariable('CYCLOPS_ATE_PLAYER', true);
      return true;
    } else {
      // Display wrath message
      if (this.wrathLevel < 0) {
        this.wrathLevel = -this.wrathLevel + 1;
      } else {
        this.wrathLevel = this.wrathLevel + 1;
      }

      const messageIndex = Math.min(absWrath - 1, CYCLOPS_MAD_MESSAGES.length - 1);
      if (messageIndex >= 0) {
        console.log(CYCLOPS_MAD_MESSAGES[messageIndex]);
        return true;
      }
    }

    return false;
  }

  protected onStateChanged(oldState: ActorState, newState: ActorState, state: GameState): void {
    super.onStateChanged(oldState, newState, state);
    
    const cyclops = this.getActor(state);
    if (!cyclops) return;

    if (newState === ActorState.SLEEPING) {
      cyclops.flags.delete(ObjectFlag.FIGHTBIT);
      cyclops.setProperty('LDESC', 'The cyclops is sleeping blissfully at the foot of the stairs.');
      
      // Set flag to indicate cyclops is asleep
      state.setFlag('CYCLOPS_FLAG', true);
      
      // Award points for defeating the cyclops (10 points, one-time only)
      scoreAction(state, 'DEFEAT_CYCLOPS');
    } else if (newState === ActorState.NORMAL && oldState === ActorState.SLEEPING) {
      // Cyclops wakes up
      this.tellIfVisible(state, "The cyclops yawns and stares at the thing that woke him up.");
      
      cyclops.flags.add(ObjectFlag.FIGHTBIT);
      state.setFlag('CYCLOPS_FLAG', false);
      
      // Restore wrath level
      if (this.wrathLevel < 0) {
        this.wrathLevel = -this.wrathLevel;
      }
    }
  }

  onReceiveItem(state: GameState, item: GameObject): boolean {
    const cyclops = this.getActor(state);
    if (!cyclops) return false;

    // Handle lunch (hot peppers)
    if (item.id === 'LUNCH') {
      if (this.wrathLevel >= 0) {
        state.moveObject('LUNCH', null); // Remove lunch
        console.log("The cyclops says \"Mmm Mmm. I love hot peppers! But oh, could I use a drink. Perhaps I could drink the blood of that thing.\" From the gleam in his eye, it could be surmised that you are \"that thing\".");
        
        // Make cyclops thirsty (negative wrath)
        this.wrathLevel = Math.min(-1, -this.wrathLevel);
        
        // Enable cyclops interrupt
        state.eventSystem.registerInterrupt('I-CYCLOPS', () => {
          return state.actorManager.getActor('CYCLOPS')?.executeTurn(state) || false;
        }, 1);
        state.eventSystem.enableEvent('I-CYCLOPS');
        
        return true;
      }
      return false;
    }

    // Handle water
    if (item.id === 'WATER' || (item.id === 'BOTTLE' && state.getObject('WATER')?.location === 'BOTTLE')) {
      if (this.wrathLevel < 0) {
        // Cyclops drinks and falls asleep
        state.moveObject('WATER', null); // Remove water
        
        const bottle = state.getObject('BOTTLE');
        if (bottle) {
          state.moveObject('BOTTLE', state.currentRoom);
          bottle.flags.add(ObjectFlag.OPENBIT);
        }

        cyclops.flags.delete(ObjectFlag.FIGHTBIT);
        console.log("The cyclops takes the bottle, checks that it's open, and drinks the water. A moment later, he lets out a yawn that nearly blows you over, and then falls fast asleep (what did you put in that drink, anyway?).");
        
        this.transitionState(ActorState.SLEEPING, state);
        return true;
      } else {
        console.log("The cyclops apparently is not thirsty and refuses your generous offer.");
        return false;
      }
    }

    // Handle garlic
    if (item.id === 'GARLIC') {
      console.log("The cyclops may be hungry, but there is a limit.");
      return false;
    }

    // Handle other items
    console.log("The cyclops is not so stupid as to eat THAT!");
    return false;
  }

  /**
   * Handle talking to the cyclops
   */
  onTalk(state: GameState): string {
    if (this.state === ActorState.SLEEPING) {
      return "No use talking to him. He's fast asleep.";
    }
    return "The cyclops prefers eating to making conversation.";
  }

  /**
   * Get cyclops description based on state
   */
  getDescription(state: GameState): string {
    if (this.state === ActorState.SLEEPING) {
      return "The cyclops is sleeping like a baby, albeit a very ugly one.";
    }
    return "A hungry cyclops is standing at the foot of the stairs.";
  }

  onAttacked(state: GameState, weapon?: GameObject): void {
    const cyclops = this.getActor(state);
    if (!cyclops) return;

    // Enable cyclops interrupt
    state.eventSystem.registerInterrupt('I-CYCLOPS', () => {
      return state.actorManager.getActor('CYCLOPS')?.executeTurn(state) || false;
    }, 1);
    state.eventSystem.enableEvent('I-CYCLOPS');

    // Cyclops shrugs off attacks
    console.log("The cyclops shrugs but otherwise ignores your pitiful attempt.");
  }

  shouldAct(state: GameState): boolean {
    // Cyclops acts unless dead or player not in room
    if (this.state === ActorState.DEAD) return false;
    
    const cyclops = this.getActor(state);
    if (!cyclops) return false;
    
    return cyclops.location === state.currentRoom;
  }

  /**
   * Get current wrath level
   */
  getWrathLevel(): number {
    return this.wrathLevel;
  }

  /**
   * Set wrath level (for testing or game state restoration)
   */
  setWrathLevel(level: number): void {
    this.wrathLevel = level;
  }
}
