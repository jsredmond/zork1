/**
 * Room Definitions
 * Defines rooms and their connections
 */

import { RoomFlag } from './data/flags.js';

/**
 * Direction enum for room exits
 */
export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NE = 'NE',
  NW = 'NW',
  SE = 'SE',
  SW = 'SW',
  UP = 'UP',
  DOWN = 'DOWN',
  IN = 'IN',
  OUT = 'OUT',
}

/**
 * Exit interface defines a connection from one room to another
 * Supports conditional exits that may be blocked based on game state
 */
export interface Exit {
  destination: string;
  condition?: () => boolean;
  message?: string;
}

/**
 * Room interface defines the structure of all game rooms
 * Based on ZIL room definitions from 1dungeon.zil
 */
export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Map<Direction, Exit>;
  objects: string[];
  globalObjects?: string[];
  visited: boolean;
  flags: Set<RoomFlag>;
  
  // Methods
  hasFlag(flag: RoomFlag): boolean;
  addFlag(flag: RoomFlag): void;
  removeFlag(flag: RoomFlag): void;
  getExit(direction: Direction): Exit | undefined;
  setExit(direction: Direction, exit: Exit): void;
  removeExit(direction: Direction): void;
  isExitAvailable(direction: Direction): boolean;
  getAvailableExits(): Direction[];
  addObject(objectId: string): void;
  removeObject(objectId: string): void;
  isLit(): boolean;
  markVisited(): void;
}

/**
 * RoomImpl provides a concrete implementation of Room
 * Manages room state including exits, objects, and visited status
 */
export class RoomImpl implements Room {
  id: string;
  name: string;
  description: string;
  exits: Map<Direction, Exit>;
  objects: string[];
  globalObjects?: string[];
  visited: boolean;
  flags: Set<RoomFlag>;

  constructor(data: {
    id: string;
    name: string;
    description: string;
    exits?: Map<Direction, Exit>;
    objects?: string[];
    globalObjects?: string[];
    visited?: boolean;
    flags?: RoomFlag[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.exits = data.exits || new Map();
    this.objects = data.objects || [];
    this.globalObjects = data.globalObjects;
    this.visited = data.visited || false;
    this.flags = new Set(data.flags || []);
  }

  /**
   * Check if room has a specific flag
   */
  hasFlag(flag: RoomFlag): boolean {
    return this.flags.has(flag);
  }

  /**
   * Add a flag to the room
   */
  addFlag(flag: RoomFlag): void {
    this.flags.add(flag);
  }

  /**
   * Remove a flag from the room
   */
  removeFlag(flag: RoomFlag): void {
    this.flags.delete(flag);
  }

  /**
   * Get exit in a specific direction
   */
  getExit(direction: Direction): Exit | undefined {
    return this.exits.get(direction);
  }

  /**
   * Add or update an exit
   */
  setExit(direction: Direction, exit: Exit): void {
    this.exits.set(direction, exit);
  }

  /**
   * Remove an exit
   */
  removeExit(direction: Direction): void {
    this.exits.delete(direction);
  }

  /**
   * Check if exit is available (exists and condition is met)
   */
  isExitAvailable(direction: Direction): boolean {
    const exit = this.exits.get(direction);
    if (!exit) {
      return false;
    }
    if (exit.condition) {
      return exit.condition();
    }
    return true;
  }

  /**
   * Get all available exits (where conditions are met)
   */
  getAvailableExits(): Direction[] {
    const available: Direction[] = [];
    for (const [direction, exit] of this.exits.entries()) {
      if (!exit.condition || exit.condition()) {
        available.push(direction);
      }
    }
    return available;
  }

  /**
   * Add an object to the room
   */
  addObject(objectId: string): void {
    if (!this.objects.includes(objectId)) {
      this.objects.push(objectId);
    }
  }

  /**
   * Remove an object from the room
   */
  removeObject(objectId: string): void {
    const index = this.objects.indexOf(objectId);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }

  /**
   * Check if room is lit
   */
  isLit(): boolean {
    return this.hasFlag(RoomFlag.ONBIT);
  }

  /**
   * Mark room as visited
   */
  markVisited(): void {
    this.visited = true;
  }
}
