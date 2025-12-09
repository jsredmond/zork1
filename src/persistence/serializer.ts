/**
 * Serialization Module
 * Handles conversion of GameState to/from JSON for save/restore functionality
 */

import { GameState } from '../game/state.js';
import { GameObject, LocationRelation, GameObjectImpl } from '../game/objects.js';
import { Room, Direction } from '../game/rooms.js';
import { ObjectFlag, RoomFlag, GlobalFlags } from '../game/data/flags.js';

/**
 * Version of the save file format
 * Increment when making breaking changes to the format
 */
const SAVE_FORMAT_VERSION = '1.0.0';

/**
 * SaveData structure that gets serialized to JSON
 */
export interface SaveData {
  version: string;
  timestamp: number;
  state: SerializedGameState;
}

/**
 * Serialized representation of GameState
 */
export interface SerializedGameState {
  currentRoom: string;
  objects: SerializedObject[];
  rooms: SerializedRoom[];
  globalVariables: [string, any][];
  inventory: string[];
  score: number;
  moves: number;
  flags: GlobalFlags;
  pendingAction?: { type: 'SAVE' | 'RESTORE' };
}

/**
 * Serialized representation of GameObject
 */
export interface SerializedObject {
  id: string;
  name: string;
  synonyms: string[];
  adjectives: string[];
  description: string;
  location: string | null;
  locationRelation?: string;
  properties: [string, any][];
  flags: string[];
  capacity?: number;
  size?: number;
  value?: number;
}

/**
 * Serialized representation of Room
 */
export interface SerializedRoom {
  id: string;
  name: string;
  description: string;
  exits: SerializedExit[];
  objects: string[];
  visited: boolean;
  flags: string[];
}

/**
 * Serialized representation of Exit
 */
export interface SerializedExit {
  direction: string;
  destination: string;
  message?: string;
  // Note: condition functions cannot be serialized
}

/**
 * Serializer class handles conversion between GameState and JSON
 */
export class Serializer {
  /**
   * Serialize GameState to JSON string
   */
  serialize(state: GameState): string {
    const saveData: SaveData = {
      version: SAVE_FORMAT_VERSION,
      timestamp: Date.now(),
      state: this.serializeGameState(state)
    };

    return JSON.stringify(saveData, null, 2);
  }

  /**
   * Deserialize JSON string to GameState
   */
  deserialize(data: string): GameState {
    const saveData: SaveData = JSON.parse(data);
    
    // Validate version
    if (!this.isVersionCompatible(saveData.version)) {
      throw new Error(`Incompatible save file version: ${saveData.version}. Expected: ${SAVE_FORMAT_VERSION}`);
    }

    return this.deserializeGameState(saveData.state);
  }

  /**
   * Validate save file format
   */
  validate(data: string): boolean {
    try {
      const saveData = JSON.parse(data);
      
      // Check required fields
      if (!saveData.version || !saveData.timestamp || !saveData.state) {
        return false;
      }

      // Check version compatibility
      if (!this.isVersionCompatible(saveData.version)) {
        return false;
      }

      // Check state structure
      const state = saveData.state;
      if (!state.currentRoom || !Array.isArray(state.objects) || 
          !Array.isArray(state.rooms) || !Array.isArray(state.inventory)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if save file version is compatible with current version
   */
  private isVersionCompatible(version: string): boolean {
    // For now, only exact version match is supported
    // In the future, could implement backward compatibility
    return version === SAVE_FORMAT_VERSION;
  }

  /**
   * Serialize GameState to SerializedGameState
   */
  private serializeGameState(state: GameState): SerializedGameState {
    return {
      currentRoom: state.currentRoom,
      objects: this.serializeObjects(state.objects),
      rooms: this.serializeRooms(state.rooms),
      globalVariables: Array.from(state.globalVariables.entries()),
      inventory: state.inventory,
      score: state.score,
      moves: state.moves,
      flags: state.flags,
      pendingAction: state.pendingAction
    };
  }

  /**
   * Deserialize SerializedGameState to GameState
   */
  private deserializeGameState(serialized: SerializedGameState): GameState {
    const objects = this.deserializeObjects(serialized.objects);
    const rooms = this.deserializeRooms(serialized.rooms);
    const globalVariables = new Map(serialized.globalVariables);

    return new GameState({
      currentRoom: serialized.currentRoom,
      objects,
      rooms,
      globalVariables,
      inventory: serialized.inventory,
      score: serialized.score,
      moves: serialized.moves,
      flags: serialized.flags,
      pendingAction: serialized.pendingAction
    });
  }

  /**
   * Serialize Map of GameObjects to array
   */
  private serializeObjects(objects: Map<string, GameObject>): SerializedObject[] {
    return Array.from(objects.values()).map(obj => ({
      id: obj.id,
      name: obj.name,
      synonyms: obj.synonyms,
      adjectives: obj.adjectives,
      description: obj.description,
      location: obj.location,
      locationRelation: obj.locationRelation,
      properties: Array.from(obj.properties.entries()),
      flags: Array.from(obj.flags),
      capacity: obj.capacity,
      size: obj.size,
      value: obj.value
    }));
  }

  /**
   * Deserialize array to Map of GameObjects
   */
  private deserializeObjects(serialized: SerializedObject[]): Map<string, GameObject> {
    const objects = new Map<string, GameObject>();
    
    for (const obj of serialized) {
      const gameObject = new GameObjectImpl({
        id: obj.id,
        name: obj.name,
        synonyms: obj.synonyms,
        adjectives: obj.adjectives,
        description: obj.description,
        location: obj.location,
        locationRelation: obj.locationRelation as LocationRelation,
        properties: new Map(obj.properties),
        flags: new Set(obj.flags as ObjectFlag[]),
        capacity: obj.capacity,
        size: obj.size,
        value: obj.value
      });
      
      objects.set(obj.id, gameObject);
    }
    
    return objects;
  }

  /**
   * Serialize Map of Rooms to array
   */
  private serializeRooms(rooms: Map<string, Room>): SerializedRoom[] {
    return Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      exits: this.serializeExits(room.exits),
      objects: room.objects,
      visited: room.visited,
      flags: Array.from(room.flags)
    }));
  }

  /**
   * Deserialize array to Map of Rooms
   */
  private deserializeRooms(serialized: SerializedRoom[]): Map<string, Room> {
    const rooms = new Map<string, Room>();
    
    for (const room of serialized) {
      const roomObject: Room = {
        id: room.id,
        name: room.name,
        description: room.description,
        exits: this.deserializeExits(room.exits),
        objects: room.objects,
        visited: room.visited,
        flags: new Set(room.flags as RoomFlag[]),
        hasFlag: function(flag: RoomFlag) { return this.flags.has(flag); },
        addFlag: function(flag: RoomFlag) { this.flags.add(flag); },
        removeFlag: function(flag: RoomFlag) { this.flags.delete(flag); },
        getExit: function(direction: Direction) { return this.exits.get(direction); },
        setExit: function(direction: Direction, exit: any) { this.exits.set(direction, exit); },
        removeExit: function(direction: Direction) { this.exits.delete(direction); },
        isExitAvailable: function(direction: Direction) {
          const exit = this.exits.get(direction);
          if (!exit) return false;
          if (exit.condition) return exit.condition();
          return true;
        },
        getAvailableExits: function() {
          const available: Direction[] = [];
          for (const [direction, exit] of this.exits.entries()) {
            if (!exit.condition || exit.condition()) {
              available.push(direction);
            }
          }
          return available;
        },
        addObject: function(objectId: string) {
          if (!this.objects.includes(objectId)) {
            this.objects.push(objectId);
          }
        },
        removeObject: function(objectId: string) {
          const index = this.objects.indexOf(objectId);
          if (index !== -1) {
            this.objects.splice(index, 1);
          }
        },
        isLit: function() { return this.hasFlag(RoomFlag.ONBIT); },
        markVisited: function() { this.visited = true; }
      };
      
      rooms.set(room.id, roomObject);
    }
    
    return rooms;
  }

  /**
   * Serialize Map of Exits to array
   */
  private serializeExits(exits: Map<Direction, any>): SerializedExit[] {
    return Array.from(exits.entries()).map(([direction, exit]) => ({
      direction,
      destination: exit.destination,
      message: exit.message
      // Note: condition functions cannot be serialized
      // They will need to be re-established when loading
    }));
  }

  /**
   * Deserialize array to Map of Exits
   */
  private deserializeExits(serialized: SerializedExit[]): Map<Direction, any> {
    const exits = new Map<Direction, any>();
    
    for (const exit of serialized) {
      exits.set(exit.direction as Direction, {
        destination: exit.destination,
        message: exit.message
        // Note: condition functions are not restored
        // This is a known limitation - conditional exits will need special handling
      });
    }
    
    return exits;
  }
}
