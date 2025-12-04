/**
 * Room Definitions
 * Defines rooms and their connections
 */

export enum RoomFlag {
  RLANDBIT = 'RLANDBIT',
  ONBIT = 'ONBIT',
  SACREDBIT = 'SACREDBIT',
  VEHBIT = 'VEHBIT',
}

export enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  UP = 'UP',
  DOWN = 'DOWN',
  IN = 'IN',
  OUT = 'OUT',
}

export interface Exit {
  destination: string;
  condition?: () => boolean;
  message?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Map<Direction, Exit>;
  objects: string[];
  visited: boolean;
  flags: Set<RoomFlag>;
}

export class RoomImpl implements Room {
  // TODO: Implement room
  id: string = '';
  name: string = '';
  description: string = '';
  exits: Map<Direction, Exit> = new Map();
  objects: string[] = [];
  visited: boolean = false;
  flags: Set<RoomFlag> = new Set();
}
