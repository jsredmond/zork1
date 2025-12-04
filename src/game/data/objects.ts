/**
 * Object definitions extracted from 1dungeon.zil
 * 
 * This file contains all object data from the original Zork I game.
 * Each object includes its properties, synonyms, descriptions, and flags.
 */

export interface ObjectData {
  id: string;
  name: string;
  synonyms: string[];
  adjectives: string[];
  description: string;
  longDescription?: string;
  firstDescription?: string;
  initialLocation: string;
  flags: string[];
  action?: string;
  size?: number;
  capacity?: number;
  value?: number;
  treasureValue?: number;
  text?: string;
  strength?: number;
}

/**
 * All objects in Zork I
 */
export const OBJECTS: Record<string, ObjectData> = {
  'BOARD': {
    id: 'BOARD',
    name: 'board',
    synonyms: ['BOARDS', 'BOARD'],
    adjectives: [],
    description: 'board',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'BOARD-F'
  },

  'TEETH': {
    id: 'TEETH',
    name: 'set of teeth',
    synonyms: ['OVERBOARD', 'TEETH'],
    adjectives: [],
    description: 'set of teeth',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT'],
    action: 'TEETH-F'
  },

  'WALL': {
    id: 'WALL',
    name: 'surrounding wall',
    synonyms: ['WALL', 'WALLS'],
    adjectives: ['SURROUNDING'],
    description: 'surrounding wall',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: []
  },

  'GRANITE-WALL': {
    id: 'GRANITE-WALL',
    name: 'granite wall',
    synonyms: ['WALL'],
    adjectives: ['GRANITE'],
    description: 'granite wall',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: [],
    action: 'GRANITE-WALL-F'
  },

  'SONGBIRD': {
    id: 'SONGBIRD',
    name: 'songbird',
    synonyms: ['BIRD', 'SONGBIRD'],
    adjectives: ['SONG'],
    description: 'songbird',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'SONGBIRD-F'
  },

  'WHITE-HOUSE': {
    id: 'WHITE-HOUSE',
    name: 'white house',
    synonyms: ['HOUSE'],
    adjectives: ['WHITE', 'BEAUTI', 'COLONI'],
    description: 'white house',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'WHITE-HOUSE-F'
  },

  'LAMP': {
    id: 'LAMP',
    name: 'brass lantern',
    synonyms: ['LAMP', 'LANTERN', 'LIGHT'],
    adjectives: ['BRASS'],
    description: 'brass lantern',
    longDescription: 'There is a brass lantern (battery-powered) here.',
    firstDescription: 'A battery-powered brass lantern is on the trophy case.',
    initialLocation: 'LIVING-ROOM',
    flags: ['TAKEBIT', 'LIGHTBIT'],
    action: 'LANTERN',
    size: 15
  },

  'SWORD': {
    id: 'SWORD',
    name: 'sword',
    synonyms: ['SWORD', 'ORCRIST', 'GLAMDRING', 'BLADE'],
    adjectives: ['ELVISH', 'OLD', 'ANTIQUE'],
    description: 'sword',
    firstDescription: 'Above the trophy case hangs an elvish sword of great antiquity.',
    initialLocation: 'LIVING-ROOM',
    flags: ['TAKEBIT', 'WEAPONBIT', 'TRYTAKEBIT'],
    action: 'SWORD-FCN',
    size: 30,
    treasureValue: 0
  },

  'TROPHY-CASE': {
    id: 'TROPHY-CASE',
    name: 'trophy case',
    synonyms: ['CASE'],
    adjectives: ['TROPHY'],
    description: 'trophy case',
    initialLocation: 'LIVING-ROOM',
    flags: ['TRANSBIT', 'CONTBIT', 'NDESCBIT', 'TRYTAKEBIT', 'SEARCHBIT'],
    action: 'TROPHY-CASE-FCN',
    capacity: 10000
  },

  'BOTTLE': {
    id: 'BOTTLE',
    name: 'glass bottle',
    synonyms: ['BOTTLE', 'CONTAINER'],
    adjectives: ['CLEAR', 'GLASS'],
    description: 'glass bottle',
    firstDescription: 'A bottle is sitting on the table.',
    initialLocation: 'KITCHEN-TABLE',
    flags: ['TAKEBIT', 'TRANSBIT', 'CONTBIT'],
    action: 'BOTTLE-FUNCTION',
    capacity: 4
  },

  'WATER': {
    id: 'WATER',
    name: 'quantity of water',
    synonyms: ['WATER', 'QUANTITY', 'LIQUID', 'H2O'],
    adjectives: [],
    description: 'quantity of water',
    initialLocation: 'BOTTLE',
    flags: ['TRYTAKEBIT', 'TAKEBIT', 'DRINKBIT'],
    action: 'WATER-F',
    size: 4
  },

  // Treasures
  'SKULL': {
    id: 'SKULL',
    name: 'crystal skull',
    synonyms: ['SKULL', 'HEAD', 'TREASURE'],
    adjectives: ['CRYSTAL'],
    description: 'crystal skull',
    firstDescription: 'Lying in one corner of the room is a beautifully carved crystal skull. It appears to be grinning at you rather nastily.',
    initialLocation: 'LAND-OF-LIVING-DEAD',
    flags: ['TAKEBIT'],
    value: 10,
    treasureValue: 10
  },

  'CHALICE': {
    id: 'CHALICE',
    name: 'chalice',
    synonyms: ['CHALICE', 'CUP', 'SILVER', 'TREASURE'],
    adjectives: ['SILVER', 'ENGRAVINGS'],
    description: 'chalice',
    longDescription: 'There is a silver chalice, intricately engraved, here.',
    initialLocation: 'TREASURE-ROOM',
    flags: ['TAKEBIT', 'TRYTAKEBIT', 'CONTBIT'],
    action: 'CHALICE-FCN',
    capacity: 5,
    size: 10,
    value: 10,
    treasureValue: 5
  },

  'TRIDENT': {
    id: 'TRIDENT',
    name: 'crystal trident',
    synonyms: ['TRIDENT', 'FORK', 'TREASURE'],
    adjectives: ['POSEIDON', 'OWN', 'CRYSTAL'],
    description: 'crystal trident',
    firstDescription: 'On the shore lies Poseidon\'s own crystal trident.',
    initialLocation: 'ATLANTIS-ROOM',
    flags: ['TAKEBIT'],
    size: 20,
    value: 4,
    treasureValue: 11
  },

  'DIAMOND': {
    id: 'DIAMOND',
    name: 'huge diamond',
    synonyms: ['DIAMOND', 'TREASURE'],
    adjectives: ['HUGE', 'ENORMOUS'],
    description: 'huge diamond',
    longDescription: 'There is an enormous diamond (perfectly cut) here.',
    initialLocation: '',
    flags: ['TAKEBIT'],
    value: 10,
    treasureValue: 10
  },

  'JADE': {
    id: 'JADE',
    name: 'jade figurine',
    synonyms: ['FIGURINE', 'TREASURE'],
    adjectives: ['EXQUISITE', 'JADE'],
    description: 'jade figurine',
    longDescription: 'There is an exquisite jade figurine here.',
    initialLocation: 'BAT-ROOM',
    flags: ['TAKEBIT'],
    size: 10,
    value: 5,
    treasureValue: 5
  },

  'EMERALD': {
    id: 'EMERALD',
    name: 'large emerald',
    synonyms: ['EMERALD', 'TREASURE'],
    adjectives: ['LARGE'],
    description: 'large emerald',
    initialLocation: 'BUOY',
    flags: ['TAKEBIT'],
    value: 5,
    treasureValue: 10
  },

  'BAG-OF-COINS': {
    id: 'BAG-OF-COINS',
    name: 'leather bag of coins',
    synonyms: ['BAG', 'COINS', 'TREASURE'],
    adjectives: ['OLD', 'LEATHER'],
    description: 'leather bag of coins',
    longDescription: 'An old leather bag, bulging with coins, is here.',
    initialLocation: 'MAZE-5',
    flags: ['TAKEBIT'],
    action: 'BAG-OF-COINS-F',
    size: 15,
    value: 10,
    treasureValue: 5
  },

  // Additional objects would continue here...
};
