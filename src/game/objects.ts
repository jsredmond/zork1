/**
 * Object System
 * Defines game objects and their properties
 */

export enum ObjectFlag {
  TAKEBIT = 'TAKEBIT',
  CONTBIT = 'CONTBIT',
  OPENBIT = 'OPENBIT',
  LIGHTBIT = 'LIGHTBIT',
  ONBIT = 'ONBIT',
  WEAPONBIT = 'WEAPONBIT',
  ACTORBIT = 'ACTORBIT',
  DOORBIT = 'DOORBIT',
  BURNBIT = 'BURNBIT',
  FOODBIT = 'FOODBIT',
  DRINKBIT = 'DRINKBIT',
}

export interface GameObject {
  id: string;
  name: string;
  synonyms: string[];
  adjectives: string[];
  description: string;
  location: string | null;
  properties: Map<string, any>;
  flags: Set<ObjectFlag>;
  capacity?: number;
  size?: number;
  value?: number;
}

export class GameObjectImpl implements GameObject {
  // TODO: Implement game object
  id: string = '';
  name: string = '';
  synonyms: string[] = [];
  adjectives: string[] = [];
  description: string = '';
  location: string | null = null;
  properties: Map<string, any> = new Map();
  flags: Set<ObjectFlag> = new Set();
}
