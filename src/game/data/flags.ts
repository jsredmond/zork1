/**
 * Flag definitions extracted from ZIL source
 * 
 * This file documents all object and room flags used in Zork I.
 * Flags control object behavior and properties.
 */

/**
 * Object Flags (from ZIL source)
 * These flags determine object properties and behaviors
 */
export enum ObjectFlag {
  // Object can be picked up by the player
  TAKEBIT = 'TAKEBIT',
  
  // Object is a container that can hold other objects
  CONTBIT = 'CONTBIT',
  
  // Container is currently open
  OPENBIT = 'OPENBIT',
  
  // Object provides light
  LIGHTBIT = 'LIGHTBIT',
  
  // Light source is currently turned on
  ONBIT = 'ONBIT',
  
  // Object can be used as a weapon
  WEAPONBIT = 'WEAPONBIT',
  
  // Object is an actor/NPC
  ACTORBIT = 'ACTORBIT',
  
  // Object is a door
  DOORBIT = 'DOORBIT',
  
  // Object can burn
  BURNBIT = 'BURNBIT',
  
  // Object can be eaten
  FOODBIT = 'FOODBIT',
  
  // Object can be drunk
  DRINKBIT = 'DRINKBIT',
  
  // Object should not be described in room descriptions
  NDESCBIT = 'NDESCBIT',
  
  // Object is invisible (not visible to player)
  INVISIBLE = 'INVISIBLE',
  
  // Object is transparent (can see through it)
  TRANSBIT = 'TRANSBIT',
  
  // Object can be read
  READBIT = 'READBIT',
  
  // Object is a surface (things can be placed ON it)
  SURFACEBIT = 'SURFACEBIT',
  
  // Object is a tool
  TOOLBIT = 'TOOLBIT',
  
  // Object can be turned (like a dial or bolt)
  TURNBIT = 'TURNBIT',
  
  // Object can be climbed
  CLIMBBIT = 'CLIMBBIT',
  
  // Object is sacred (special handling)
  SACREDBIT = 'SACREDBIT',
  
  // Object is a vehicle
  VEHBIT = 'VEHBIT',
  
  // Special handling when trying to take
  TRYTAKEBIT = 'TRYTAKEBIT',
  
  // Object can be searched
  SEARCHBIT = 'SEARCHBIT',
  
  // Object is a flame
  FLAMEBIT = 'FLAMEBIT',
  
  // Object has been used up/destroyed (e.g., burned-out lamp)
  RMUNGBIT = 'RMUNGBIT',
  
  // Object has been touched/used
  TOUCHBIT = 'TOUCHBIT',
  
  // Object is involved in combat
  FIGHTBIT = 'FIGHTBIT',
  
  // Object/actor is staggered
  STAGGERED = 'STAGGERED',
  
  // Object can be worn
  WEARBIT = 'WEARBIT'
}

/**
 * Room Flags (from ZIL source)
 * These flags determine room properties
 */
export enum RoomFlag {
  // Room is on land (vs water)
  RLANDBIT = 'RLANDBIT',
  
  // Room is lit
  ONBIT = 'ONBIT',
  
  // Room is sacred/special
  SACREDBIT = 'SACREDBIT',
  
  // Room is part of the maze
  MAZEBIT = 'MAZEBIT',
  
  // Room is not on land (water/boat required)
  NONLANDBIT = 'NONLANDBIT',
  
  // Room has been visited/touched by player
  TOUCHBIT = 'TOUCHBIT'
}

/**
 * Vehicle Type Flags
 */
export enum VehicleType {
  // Vehicle can only travel on non-land (water)
  NONLANDBIT = 'NONLANDBIT'
}

/**
 * Global Conditional Flags (from ZIL source)
 * These control conditional exits and game state
 */
export interface GlobalFlags {
  CYCLOPS_FLAG: boolean;
  DAM_LIGHTS: boolean;
  DEFLATE: boolean;
  DOME_FLAG: boolean;
  EMPTY_HANDED: boolean;
  LLD_FLAG: boolean;
  LOW_TIDE: boolean;
  MAGIC_FLAG: boolean;
  RAINBOW_FLAG: boolean;
  TROLL_FLAG: boolean;
  WON_FLAG: boolean;
  COFFIN_CURE: boolean;
  PLAYER_STAGGERED: boolean;
}

/**
 * Flag descriptions for documentation
 */
export const FLAG_DESCRIPTIONS: Record<string, string> = {
  // Object Flags
  TAKEBIT: 'Object can be picked up by the player',
  CONTBIT: 'Object is a container that can hold other objects',
  OPENBIT: 'Container is currently open',
  LIGHTBIT: 'Object provides light',
  ONBIT: 'Light source is turned on / Room is lit',
  WEAPONBIT: 'Object can be used as a weapon',
  ACTORBIT: 'Object is an actor/NPC',
  DOORBIT: 'Object is a door',
  BURNBIT: 'Object can burn',
  FOODBIT: 'Object can be eaten',
  DRINKBIT: 'Object can be drunk',
  NDESCBIT: 'Object should not be described in room descriptions',
  INVISIBLE: 'Object is not visible to player',
  TRANSBIT: 'Object is transparent (can see through it)',
  READBIT: 'Object can be read',
  SURFACEBIT: 'Object is a surface (things can be placed ON it)',
  TOOLBIT: 'Object is a tool',
  TURNBIT: 'Object can be turned (like a dial or bolt)',
  CLIMBBIT: 'Object can be climbed',
  SACREDBIT: 'Object/Room is sacred (special handling)',
  VEHBIT: 'Object is a vehicle',
  TRYTAKEBIT: 'Special handling when trying to take',
  SEARCHBIT: 'Object can be searched',
  FLAMEBIT: 'Object is a flame',
  
  // Room Flags
  RLANDBIT: 'Room is on land (vs water)',
  MAZEBIT: 'Room is part of the maze',
  NONLANDBIT: 'Room is not on land (water/boat required)',
  
  // Global Flags
  CYCLOPS_FLAG: 'Cyclops has been dealt with',
  DAM_LIGHTS: 'Dam control panel lights are on',
  DEFLATE: 'Boat has been deflated',
  DOME_FLAG: 'Dome rope has been tied',
  EMPTY_HANDED: 'Player is carrying nothing',
  LLD_FLAG: 'Gate to Land of Living Dead is open',
  LOW_TIDE: 'Reservoir water level is low',
  MAGIC_FLAG: 'Magic word has been spoken',
  RAINBOW_FLAG: 'Rainbow is present',
  TROLL_FLAG: 'Troll has been dealt with',
  WON_FLAG: 'Game has been won',
  COFFIN_CURE: 'Coffin can be moved'
};

/**
 * Initial global flag states
 */
export const INITIAL_GLOBAL_FLAGS: GlobalFlags = {
  CYCLOPS_FLAG: false,
  DAM_LIGHTS: false,
  DEFLATE: false,
  DOME_FLAG: false,
  EMPTY_HANDED: false,
  LLD_FLAG: false,
  LOW_TIDE: false,
  MAGIC_FLAG: false,
  RAINBOW_FLAG: false,
  TROLL_FLAG: false,
  WON_FLAG: false,
  COFFIN_CURE: false,
  PLAYER_STAGGERED: false
};
