/**
 * Atmospheric Messages
 * 
 * Handles random atmospheric messages that add ambiance to the game.
 * Implements deterministic randomization with seed consistency for parity testing.
 * 
 * Based on ZIL atmospheric message handling from 1dungeon.zil
 * 
 * Requirements: 2.3
 */

import { GameState } from './state.js';

/**
 * Atmospheric message configuration
 */
export interface AtmosphericMessageConfig {
  /** Message text */
  message: string;
  /** Probability of displaying (0-1) */
  probability: number;
  /** Rooms where this message can appear (empty = all rooms) */
  validRooms?: string[];
  /** Rooms where this message should NOT appear */
  excludedRooms?: string[];
  /** Condition function for additional checks */
  condition?: (state: GameState) => boolean;
}

/**
 * Forest atmospheric messages
 * Based on ZIL I-FOREST-ROOM routine
 */
const FOREST_MESSAGES: AtmosphericMessageConfig[] = [
  {
    message: "You hear in the distance the chirping of a song bird.",
    probability: 0.15,
    validRooms: ['FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'UP-A-TREE', 'CLEARING']
  }
];

/**
 * Underground atmospheric messages
 * Based on ZIL underground room handling
 */
const UNDERGROUND_MESSAGES: AtmosphericMessageConfig[] = [
  {
    message: "A grue sound echoes in the distance.",
    probability: 0.05,
    condition: (state) => {
      // Check if hasLight method exists before calling
      if (typeof state.hasLight === 'function') {
        return !state.hasLight();
      }
      return false; // Default to not showing if method doesn't exist
    }
  }
];

/**
 * All atmospheric messages by category
 */
const ATMOSPHERIC_MESSAGES: Record<string, AtmosphericMessageConfig[]> = {
  forest: FOREST_MESSAGES,
  underground: UNDERGROUND_MESSAGES
};

/**
 * Seeded random number generator for deterministic atmospheric messages
 * Uses a simple linear congruential generator (LCG)
 */
export class SeededRandom {
  private seed: number;
  
  // LCG parameters (same as many standard implementations)
  private static readonly A = 1664525;
  private static readonly C = 1013904223;
  private static readonly M = Math.pow(2, 32);

  constructor(seed: number) {
    this.seed = seed >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Get next random number between 0 and 1
   */
  next(): number {
    this.seed = (SeededRandom.A * this.seed + SeededRandom.C) % SeededRandom.M;
    return this.seed / SeededRandom.M;
  }

  /**
   * Get current seed value
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Set seed value
   */
  setSeed(seed: number): void {
    this.seed = seed >>> 0;
  }
}

/**
 * AtmosphericMessageManager handles generation and display of atmospheric messages
 */
export class AtmosphericMessageManager {
  private random: SeededRandom;
  private suppressMessages: boolean = false;

  constructor(seed?: number) {
    this.random = new SeededRandom(seed ?? Date.now());
  }

  /**
   * Set the random seed for deterministic behavior
   */
  setSeed(seed: number): void {
    this.random.setSeed(seed);
  }

  /**
   * Get current seed
   */
  getSeed(): number {
    return this.random.getSeed();
  }

  /**
   * Suppress atmospheric messages (for testing mode)
   */
  suppress(suppress: boolean = true): void {
    this.suppressMessages = suppress;
  }

  /**
   * Check if messages are suppressed
   */
  isSuppressed(): boolean {
    return this.suppressMessages;
  }

  /**
   * Generate an atmospheric message for the current game state
   * Returns null if no message should be displayed
   */
  generateAtmosphericMessage(state: GameState): string | null {
    // Don't generate messages in testing mode or when suppressed
    if (state.isTestingMode() || this.suppressMessages) {
      return null;
    }

    const currentRoom = state.getCurrentRoom();
    if (!currentRoom) {
      return null;
    }

    // Check each category of messages
    for (const category of Object.keys(ATMOSPHERIC_MESSAGES)) {
      const messages = ATMOSPHERIC_MESSAGES[category];
      
      for (const config of messages) {
        // Check if message is valid for current room
        if (!this.isValidForRoom(config, currentRoom.id)) {
          continue;
        }

        // Check additional conditions
        if (config.condition && !config.condition(state)) {
          continue;
        }

        // Check probability
        if (this.random.next() < config.probability) {
          return config.message;
        }
      }
    }

    return null;
  }

  /**
   * Check if a message configuration is valid for a given room
   */
  private isValidForRoom(config: AtmosphericMessageConfig, roomId: string): boolean {
    // Check excluded rooms first
    if (config.excludedRooms && config.excludedRooms.includes(roomId)) {
      return false;
    }

    // If validRooms is specified, room must be in the list
    if (config.validRooms && config.validRooms.length > 0) {
      return config.validRooms.includes(roomId);
    }

    // No restrictions, valid for all rooms
    return true;
  }

  /**
   * Get all possible messages for a room (for testing)
   */
  getPossibleMessages(roomId: string, state: GameState): AtmosphericMessageConfig[] {
    const possible: AtmosphericMessageConfig[] = [];

    for (const category of Object.keys(ATMOSPHERIC_MESSAGES)) {
      const messages = ATMOSPHERIC_MESSAGES[category];
      
      for (const config of messages) {
        if (this.isValidForRoom(config, roomId)) {
          if (!config.condition || config.condition(state)) {
            possible.push(config);
          }
        }
      }
    }

    return possible;
  }

  /**
   * Filter atmospheric messages from output
   * Used during parity testing to remove non-deterministic content
   */
  static filterAtmosphericMessages(output: string): string {
    let filtered = output;

    // Remove all known atmospheric message patterns
    const patterns = [
      /You hear in the distance the chirping of a song bird\.\s*/g,
      /A grue sound echoes in the distance\.\s*/g,
      /You hear.*?\.\s*/g,
      /A gentle breeze.*?\.\s*/g,
      /The wind.*?\.\s*/g
    ];

    for (const pattern of patterns) {
      filtered = filtered.replace(pattern, '');
    }

    return filtered.trim();
  }

  /**
   * Check if output contains atmospheric messages
   */
  static containsAtmosphericMessage(output: string): boolean {
    const patterns = [
      /You hear in the distance the chirping of a song bird\./,
      /A grue sound echoes in the distance\./,
      /You hear.*?\./,
      /A gentle breeze.*?\./,
      /The wind.*?\./
    ];

    return patterns.some(pattern => pattern.test(output));
  }
}

/**
 * Default atmospheric message manager instance
 */
let defaultManager: AtmosphericMessageManager | null = null;

/**
 * Get the default atmospheric message manager
 */
export function getAtmosphericMessageManager(): AtmosphericMessageManager {
  if (!defaultManager) {
    defaultManager = new AtmosphericMessageManager();
  }
  return defaultManager;
}

/**
 * Reset the default atmospheric message manager (for testing)
 */
export function resetAtmosphericMessageManager(seed?: number): void {
  defaultManager = new AtmosphericMessageManager(seed);
}
