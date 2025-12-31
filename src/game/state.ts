/**
 * Game State Management
 * Manages all game state including objects, rooms, and variables
 */

import { GameObject } from './objects.js';
import { Room } from './rooms.js';
import { GlobalFlags, INITIAL_GLOBAL_FLAGS, RoomFlag } from './data/flags.js';
import { EventSystem } from '../engine/events.js';
import { ActorManager } from '../engine/actors.js';

/**
 * Seeded Random Number Generator
 * 
 * Implements a Linear Congruential Generator (LCG) for deterministic
 * random number generation during testing. When a seed is set, all
 * random operations will produce reproducible results.
 */
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  /**
   * Generate next random number between 0 and 1
   * Uses LCG algorithm matching common implementations
   */
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  /**
   * Generate random integer in range [min, max] (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  /**
   * Get current seed value (for debugging/testing)
   */
  getSeed(): number {
    return this.seed;
  }
}

/**
 * GameState class manages the complete state of the game
 * Includes player location, all objects, rooms, inventory, score, and flags
 */
export class GameState {
  currentRoom: string;
  objects: Map<string, GameObject>;
  rooms: Map<string, Room>;
  globalVariables: Map<string, any>;
  inventory: string[];
  score: number;
  moves: number;
  flags: GlobalFlags;
  eventSystem: EventSystem;
  actorManager: ActorManager;
  pendingAction?: { type: 'SAVE' | 'RESTORE' };
  
  /**
   * Base score from action points (room entry, puzzle completion, combat)
   * This is separate from treasure points which are calculated dynamically
   */
  private baseScore: number;
  
  /**
   * Seeded random number generator for deterministic testing
   * When null, Math.random() is used instead
   */
  private rng: SeededRandom | null = null;

  /**
   * Testing mode flag to suppress random atmospheric messages
   * When true, random messages like song birds are suppressed
   */
  private testingMode: boolean = false;

  constructor(data?: {
    currentRoom?: string;
    objects?: Map<string, GameObject>;
    rooms?: Map<string, Room>;
    globalVariables?: Map<string, any>;
    inventory?: string[];
    score?: number;
    moves?: number;
    flags?: GlobalFlags;
    eventSystem?: EventSystem;
    actorManager?: ActorManager;
    pendingAction?: { type: 'SAVE' | 'RESTORE' };
    baseScore?: number;
  }) {
    this.currentRoom = data?.currentRoom || 'WEST-OF-HOUSE';
    this.objects = data?.objects || new Map();
    this.rooms = data?.rooms || new Map();
    this.globalVariables = data?.globalVariables || new Map();
    this.inventory = data?.inventory || [];
    this.score = data?.score || 0;
    this.moves = data?.moves || 0;
    this.flags = data?.flags || { ...INITIAL_GLOBAL_FLAGS };
    this.eventSystem = data?.eventSystem || new EventSystem();
    this.actorManager = data?.actorManager || new ActorManager();
    this.pendingAction = data?.pendingAction;
    this.baseScore = data?.baseScore || 0;
  }

  /**
   * Initialize game state to match original Zork I starting conditions
   * Player starts at West of House with score 0, moves 0
   */
  static createInitialState(
    objects: Map<string, GameObject>,
    rooms: Map<string, Room>
  ): GameState {
    return new GameState({
      currentRoom: 'WEST-OF-HOUSE',
      objects,
      rooms,
      globalVariables: new Map(),
      inventory: [],
      score: 0,
      moves: 0,
      flags: { ...INITIAL_GLOBAL_FLAGS },
      eventSystem: new EventSystem(),
      actorManager: new ActorManager(),
      baseScore: 0
    });
  }

  /**
   * Get the current room object
   */
  getCurrentRoom(): Room | undefined {
    return this.rooms.get(this.currentRoom);
  }

  /**
   * Set the current room
   */
  setCurrentRoom(roomId: string): void {
    this.currentRoom = roomId;
    const room = this.rooms.get(roomId);
    if (room) {
      room.markVisited();
      // Also set TOUCHBIT flag for ZIL compatibility
      room.addFlag(RoomFlag.TOUCHBIT);
    }
  }

  /**
   * Get an object by ID
   */
  getObject(objectId: string): GameObject | undefined {
    return this.objects.get(objectId);
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Add object to inventory
   */
  addToInventory(objectId: string): void {
    if (!this.inventory.includes(objectId)) {
      this.inventory.push(objectId);
    }
  }

  /**
   * Remove object from inventory
   */
  removeFromInventory(objectId: string): void {
    const index = this.inventory.indexOf(objectId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  /**
   * Check if object is in inventory
   */
  isInInventory(objectId: string): boolean {
    return this.inventory.includes(objectId);
  }

  /**
   * Get all objects in inventory
   */
  getInventoryObjects(): GameObject[] {
    return this.inventory
      .map(id => this.objects.get(id))
      .filter((obj): obj is GameObject => obj !== undefined);
  }

  /**
   * Get all objects in current room
   */
  getObjectsInCurrentRoom(): GameObject[] {
    const room = this.getCurrentRoom();
    if (!room) {
      return [];
    }
    
    // Get regular objects in the room
    const roomObjects = room.objects
      .map(id => this.objects.get(id))
      .filter((obj): obj is GameObject => obj !== undefined);
    
    // Get global objects for this room
    const globalObjects = (room.globalObjects || [])
      .map(id => this.objects.get(id))
      .filter((obj): obj is GameObject => obj !== undefined);
    
    return [...roomObjects, ...globalObjects];
  }

  /**
   * Move object to a new location
   */
  moveObject(objectId: string, newLocation: string | null, relation?: 'IN' | 'ON' | 'HELD'): void {
    const obj = this.objects.get(objectId);
    if (!obj) {
      return;
    }

    // Remove from old location
    if (obj.location) {
      if (obj.location === 'PLAYER' || this.inventory.includes(objectId)) {
        this.removeFromInventory(objectId);
      } else {
        const oldRoom = this.rooms.get(obj.location);
        if (oldRoom) {
          oldRoom.removeObject(objectId);
        }
        // Also check if it was in another object
        const oldParent = this.objects.get(obj.location);
        if (oldParent) {
          // Object was in a container or on a surface
          // No additional tracking needed for now
        }
      }
    }

    // Add to new location
    obj.location = newLocation;
    if (relation) {
      obj.locationRelation = relation as any;
    }
    
    if (newLocation === 'PLAYER') {
      this.addToInventory(objectId);
      obj.locationRelation = 'HELD' as any;
    } else if (newLocation) {
      const newRoom = this.rooms.get(newLocation);
      if (newRoom) {
        newRoom.addObject(objectId);
      }
      // If it's being placed in another object, the relation should be set
    }
  }

  /**
   * Remove an object from the game entirely
   * This is equivalent to REMOVE-CAREFULLY in ZIL
   */
  removeObject(objectId: string): void {
    const obj = this.objects.get(objectId);
    if (!obj) {
      return;
    }

    // Remove from current location
    if (obj.location) {
      if (obj.location === 'PLAYER' || this.inventory.includes(objectId)) {
        this.removeFromInventory(objectId);
      } else {
        const room = this.rooms.get(obj.location);
        if (room) {
          room.removeObject(objectId);
        }
      }
    }

    // Set location to empty string (removed from game)
    obj.location = '';
  }

  /**
   * Get all objects that are children of a given parent (in or on it)
   */
  getObjectsInContainer(containerId: string): GameObject[] {
    return Array.from(this.objects.values()).filter(
      obj => obj.location === containerId
    );
  }

  /**
   * Check if an object can fit in a container
   */
  canFitInContainer(objectId: string, containerId: string): boolean {
    const obj = this.objects.get(objectId);
    const container = this.objects.get(containerId);
    
    if (!obj || !container || !container.capacity) {
      return false;
    }

    const currentContents = this.getObjectsInContainer(containerId);
    const currentSize = currentContents.reduce((sum, o) => sum + (o.size || 0), 0);
    const objectSize = obj.size || 0;

    return currentSize + objectSize <= container.capacity;
  }

  /**
   * Increment move counter
   */
  incrementMoves(): void {
    this.moves++;
  }

  /**
   * Add to score
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Get the base score (action points only, not treasure points)
   */
  getBaseScore(): number {
    return this.baseScore;
  }

  /**
   * Set the base score directly
   */
  setBaseScore(value: number): void {
    this.baseScore = value;
  }

  /**
   * Add points to the base score
   */
  addToBaseScore(points: number): void {
    this.baseScore += points;
  }

  /**
   * Set a global variable
   */
  setGlobalVariable(key: string, value: any): void {
    this.globalVariables.set(key, value);
  }

  /**
   * Get a global variable
   */
  getGlobalVariable(key: string): any {
    return this.globalVariables.get(key);
  }

  /**
   * Set a global flag
   */
  setFlag(flag: keyof GlobalFlags, value: boolean): void {
    this.flags[flag] = value;
  }

  /**
   * Get a global flag
   */
  getFlag(flag: keyof GlobalFlags): boolean {
    return this.flags[flag];
  }

  /**
   * Calculate weight of an object including its contents (recursive)
   * Matches ZIL WEIGHT function behavior
   */
  private calculateObjectWeight(obj: GameObject): number {
    let weight = obj.size || 0;
    
    // Add weight of all contained objects recursively
    const contents = this.getObjectsInContainer(obj.id);
    for (const containedObj of contents) {
      weight += this.calculateObjectWeight(containedObj);
    }
    
    return weight;
  }

  /**
   * Calculate total inventory weight including nested contents
   * Matches ZIL WEIGHT function behavior
   */
  getInventoryWeight(): number {
    return this.getInventoryObjects().reduce((total, obj) => {
      return total + this.calculateObjectWeight(obj);
    }, 0);
  }

  /**
   * Check if inventory is empty
   */
  isInventoryEmpty(): boolean {
    return this.inventory.length === 0;
  }

  /**
   * Set the seed for deterministic random number generation
   * When set, all random() and randomInt() calls will be deterministic
   * @param seed - The seed value for the RNG
   */
  setSeed(seed: number): void {
    this.rng = new SeededRandom(seed);
  }

  /**
   * Clear the seed, reverting to Math.random() for random operations
   */
  clearSeed(): void {
    this.rng = null;
  }

  /**
   * Check if a seed is currently set
   */
  hasSeed(): boolean {
    return this.rng !== null;
  }

  /**
   * Generate a random number between 0 and 1
   * Uses seeded RNG if seed is set, otherwise Math.random()
   */
  random(): number {
    return this.rng ? this.rng.next() : Math.random();
  }

  /**
   * Generate a random integer in range [min, max] (inclusive)
   * Uses seeded RNG if seed is set, otherwise Math.random()
   */
  randomInt(min: number, max: number): number {
    if (this.rng) {
      return this.rng.nextInt(min, max);
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Set testing mode to suppress random atmospheric messages
   * @param enabled - Whether to enable testing mode
   */
  setTestingMode(enabled: boolean): void {
    this.testingMode = enabled;
  }

  /**
   * Check if testing mode is enabled
   * @returns true if testing mode is enabled
   */
  isTestingMode(): boolean {
    return this.testingMode;
  }

  /**
   * Get the current turn number (alias for moves)
   * Used for compatibility with parity modules
   */
  get turn(): number {
    return this.moves;
  }

  /**
   * Check if the current room is lit
   * Wrapper for lighting system's isRoomLit function
   */
  hasLight(): boolean {
    const room = this.getCurrentRoom();
    if (!room) return false;
    
    // Check if room is inherently lit
    if (room.hasFlag('ONBIT' as any)) return true;
    
    // Check for light sources in inventory
    for (const obj of this.getInventoryObjects()) {
      if (obj.hasFlag('LIGHTBIT' as any) && obj.hasFlag('ONBIT' as any)) {
        return true;
      }
    }
    
    // Check for light sources in room
    for (const objId of room.objects) {
      const obj = this.getObject(objId);
      if (obj && obj.hasFlag('LIGHTBIT' as any) && obj.hasFlag('ONBIT' as any)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if player has an active light source
   * Wrapper for checking inventory light sources
   */
  hasLightSource(): boolean {
    for (const obj of this.getInventoryObjects()) {
      if (obj.hasFlag('LIGHTBIT' as any) && obj.hasFlag('ONBIT' as any)) {
        return true;
      }
    }
    return false;
  }
}
