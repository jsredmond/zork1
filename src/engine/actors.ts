/**
 * NPC Actor System
 * Implements behavior framework for NPCs (thief, troll, cyclops, etc.)
 * 
 * Based on ZIL actor routines from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { GameObject } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';

/**
 * Actor state enum
 * Represents the current state of an actor
 */
export enum ActorState {
  NORMAL = 'NORMAL',
  FIGHTING = 'FIGHTING',
  UNCONSCIOUS = 'UNCONSCIOUS',
  DEAD = 'DEAD',
  SLEEPING = 'SLEEPING',
  FLEEING = 'FLEEING'
}

/**
 * Actor behavior interface
 * Defines the contract for NPC behavior implementations
 */
export interface ActorBehavior {
  /**
   * Actor ID
   */
  actorId: string;

  /**
   * Current state of the actor
   */
  state: ActorState;

  /**
   * Execute one turn of behavior
   * @param state - Current game state
   * @returns true if behavior caused a visible change
   */
  executeTurn(state: GameState): boolean;

  /**
   * Handle state transitions (e.g., becoming unconscious, dying)
   * @param newState - New state to transition to
   * @param state - Current game state
   */
  transitionState(newState: ActorState, state: GameState): void;

  /**
   * Check if actor should act this turn
   * @param state - Current game state
   * @returns true if actor should act
   */
  shouldAct(state: GameState): boolean;

  /**
   * Handle actor being attacked
   * @param state - Current game state
   * @param weapon - Weapon used (if any)
   */
  onAttacked(state: GameState, weapon?: GameObject): void;

  /**
   * Handle actor receiving an item
   * @param state - Current game state
   * @param item - Item being given
   * @returns true if item was accepted
   */
  onReceiveItem(state: GameState, item: GameObject): boolean;
}

/**
 * Base actor behavior class
 * Provides common functionality for all actors
 */
export abstract class BaseActorBehavior implements ActorBehavior {
  actorId: string;
  state: ActorState;

  constructor(actorId: string, initialState: ActorState = ActorState.NORMAL) {
    this.actorId = actorId;
    this.state = initialState;
  }

  abstract executeTurn(state: GameState): boolean;

  transitionState(newState: ActorState, state: GameState): void {
    const oldState = this.state;
    this.state = newState;
    this.onStateChanged(oldState, newState, state);
  }

  /**
   * Called when state changes
   * Override to handle state-specific logic
   */
  protected onStateChanged(oldState: ActorState, newState: ActorState, state: GameState): void {
    const actor = state.getObject(this.actorId);
    if (!actor) return;

    // Update FIGHTBIT based on state
    if (newState === ActorState.FIGHTING) {
      actor.flags.add(ObjectFlag.FIGHTBIT);
    } else if (newState === ActorState.UNCONSCIOUS || newState === ActorState.DEAD) {
      actor.flags.delete(ObjectFlag.FIGHTBIT);
    }
  }

  shouldAct(state: GameState): boolean {
    // By default, actors don't act when dead
    return this.state !== ActorState.DEAD;
  }

  onAttacked(state: GameState, weapon?: GameObject): void {
    // Default: become hostile
    if (this.state === ActorState.NORMAL) {
      this.transitionState(ActorState.FIGHTING, state);
    }
  }

  onReceiveItem(state: GameState, item: GameObject): boolean {
    // Default: don't accept items
    return false;
  }

  /**
   * Check if actor is in the same room as the player
   */
  protected isWithPlayer(state: GameState): boolean {
    const actor = state.getObject(this.actorId);
    if (!actor) return false;
    return actor.location === state.currentRoom;
  }

  /**
   * Check if actor is visible (not invisible)
   */
  protected isVisible(state: GameState): boolean {
    const actor = state.getObject(this.actorId);
    if (!actor) return false;
    return !actor.flags.has('INVISIBLE' as any);
  }

  /**
   * Move actor to a new room
   */
  protected moveToRoom(state: GameState, roomId: string): void {
    state.moveObject(this.actorId, roomId);
  }

  /**
   * Get the actor object
   */
  protected getActor(state: GameState): GameObject | undefined {
    return state.getObject(this.actorId);
  }

  /**
   * Display a message if actor is visible to player
   */
  protected tellIfVisible(state: GameState, message: string): boolean {
    if (this.isWithPlayer(state) && this.isVisible(state)) {
      console.log(message);
      return true;
    }
    return false;
  }
}

/**
 * Actor Manager
 * Manages all active actors and their behaviors
 */
export class ActorManager {
  private actors: Map<string, ActorBehavior>;

  constructor() {
    this.actors = new Map();
  }

  /**
   * Register an actor behavior
   */
  registerActor(behavior: ActorBehavior): void {
    this.actors.set(behavior.actorId, behavior);
  }

  /**
   * Unregister an actor behavior
   */
  unregisterActor(actorId: string): void {
    this.actors.delete(actorId);
  }

  /**
   * Get an actor behavior
   */
  getActor(actorId: string): ActorBehavior | undefined {
    return this.actors.get(actorId);
  }

  /**
   * Execute all actor behaviors for one turn
   * @param state - Current game state
   * @returns true if any actor caused a visible change
   */
  executeTurn(state: GameState): boolean {
    let anyChange = false;

    for (const actor of this.actors.values()) {
      if (actor.shouldAct(state)) {
        try {
          const changed = actor.executeTurn(state);
          if (changed) {
            anyChange = true;
          }
        } catch (error) {
          console.error(`Error executing actor ${actor.actorId}:`, error);
        }
      }
    }

    return anyChange;
  }

  /**
   * Handle an actor being attacked
   */
  handleAttack(actorId: string, state: GameState, weapon?: GameObject): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.onAttacked(state, weapon);
    }
  }

  /**
   * Handle an actor receiving an item
   */
  handleReceiveItem(actorId: string, state: GameState, item: GameObject): boolean {
    const actor = this.actors.get(actorId);
    if (actor) {
      return actor.onReceiveItem(state, item);
    }
    return false;
  }

  /**
   * Transition an actor to a new state
   */
  transitionActorState(actorId: string, newState: ActorState, state: GameState): void {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.transitionState(newState, state);
    }
  }

  /**
   * Clear all actors
   */
  clear(): void {
    this.actors.clear();
  }

  /**
   * Get all registered actor IDs
   */
  getActorIds(): string[] {
    return Array.from(this.actors.keys());
  }
}
