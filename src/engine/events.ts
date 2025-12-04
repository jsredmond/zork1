/**
 * Event System
 * Manages game events and timing
 * 
 * Based on the ZIL I-CLOCK system from gclock.zil
 * Events (interrupts) can be scheduled to run after a certain number of turns
 * Daemons run every turn when enabled
 */

import { GameState } from '../game/state.js';

/**
 * Event handler function type
 * Returns true if the event caused a state change that should be reported
 */
export type EventHandler = (state: GameState) => boolean;

/**
 * Event entry in the event queue
 */
interface EventEntry {
  id: string;
  handler: EventHandler;
  ticksRemaining: number;
  enabled: boolean;
  isDaemon: boolean; // Daemons run every turn, interrupts run once
}

/**
 * EventSystem manages time-based events and daemons
 * 
 * Events are scheduled to run after a certain number of turns
 * Daemons run every turn when enabled
 */
export class EventSystem {
  private events: Map<string, EventEntry>;
  private clockWait: boolean;

  constructor() {
    this.events = new Map();
    this.clockWait = false;
  }

  /**
   * Register a daemon that runs every turn
   * @param id - Unique identifier for the daemon
   * @param handler - Function to execute each turn
   * @param enabled - Whether the daemon starts enabled
   */
  registerDaemon(id: string, handler: EventHandler, enabled: boolean = true): void {
    this.events.set(id, {
      id,
      handler,
      ticksRemaining: 0,
      enabled,
      isDaemon: true
    });
  }

  /**
   * Register an interrupt that runs after a certain number of turns
   * @param id - Unique identifier for the interrupt
   * @param handler - Function to execute when the interrupt fires
   * @param ticks - Number of turns until the interrupt fires
   */
  registerInterrupt(id: string, handler: EventHandler, ticks: number): void {
    this.events.set(id, {
      id,
      handler,
      ticksRemaining: ticks,
      enabled: true,
      isDaemon: false
    });
  }

  /**
   * Queue an interrupt to run after a certain number of ticks
   * If the interrupt already exists, update its tick count
   * @param id - Unique identifier for the interrupt
   * @param ticks - Number of turns until the interrupt fires
   */
  queueInterrupt(id: string, ticks: number): void {
    const event = this.events.get(id);
    if (event) {
      event.ticksRemaining = ticks;
      event.enabled = true;
    }
  }

  /**
   * Enable an event or daemon
   * @param id - Event identifier
   */
  enableEvent(id: string): void {
    const event = this.events.get(id);
    if (event) {
      event.enabled = true;
    }
  }

  /**
   * Disable an event or daemon
   * @param id - Event identifier
   */
  disableEvent(id: string): void {
    const event = this.events.get(id);
    if (event) {
      event.enabled = false;
    }
  }

  /**
   * Remove an event or daemon
   * @param id - Event identifier
   */
  removeEvent(id: string): void {
    this.events.delete(id);
  }

  /**
   * Check if an event exists
   * @param id - Event identifier
   */
  hasEvent(id: string): boolean {
    return this.events.has(id);
  }

  /**
   * Get the remaining ticks for an interrupt
   * @param id - Event identifier
   * @returns Number of ticks remaining, or -1 if not found
   */
  getRemainingTicks(id: string): number {
    const event = this.events.get(id);
    return event ? event.ticksRemaining : -1;
  }

  /**
   * Set clock wait flag to skip the next clock cycle
   */
  setClockWait(): void {
    this.clockWait = true;
  }

  /**
   * Process all events for one game turn
   * This is called after each player command
   * @param state - Current game state
   * @param playerWon - Whether the player has won (affects which events run)
   * @returns true if any event caused a state change
   */
  processTurn(state: GameState, playerWon: boolean = false): boolean {
    // Check clock wait flag
    if (this.clockWait) {
      this.clockWait = false;
      return false;
    }

    let stateChanged = false;

    // Determine which events to process
    // If player won, only process interrupts, not daemons
    const eventsToProcess = Array.from(this.events.values()).filter(event => {
      if (playerWon) {
        return !event.isDaemon && event.enabled;
      }
      return event.enabled;
    });

    // Process each enabled event
    for (const event of eventsToProcess) {
      if (!event.enabled) {
        continue;
      }

      // For daemons, always execute
      if (event.isDaemon) {
        try {
          const changed = event.handler(state);
          if (changed) {
            stateChanged = true;
          }
        } catch (error) {
          console.error(`Error in daemon ${event.id}:`, error);
        }
      } else {
        // For interrupts, decrement tick counter
        if (event.ticksRemaining > 0) {
          event.ticksRemaining--;
        }

        // Execute when ticks reach 0
        if (event.ticksRemaining === 0) {
          try {
            const changed = event.handler(state);
            if (changed) {
              stateChanged = true;
            }
          } catch (error) {
            console.error(`Error in interrupt ${event.id}:`, error);
          }
        }
      }
    }

    // Increment move counter
    state.incrementMoves();

    return stateChanged;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
    this.clockWait = false;
  }

  /**
   * Get all registered event IDs
   */
  getEventIds(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Get event status for debugging
   */
  getEventStatus(id: string): { enabled: boolean; ticksRemaining: number; isDaemon: boolean } | null {
    const event = this.events.get(id);
    if (!event) {
      return null;
    }
    return {
      enabled: event.enabled,
      ticksRemaining: event.ticksRemaining,
      isDaemon: event.isDaemon
    };
  }
}
