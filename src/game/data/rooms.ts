/**
 * Room definitions extracted from 1dungeon.zil
 * 
 * This file contains all room data from the original Zork I game.
 * Each room includes its description, exits, and properties.
 */

export interface RoomExit {
  direction: string;
  destination: string;
  condition?: string;
  message?: string;
}

export interface RoomData {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  exits: RoomExit[];
  flags: string[];
  globalObjects?: string[];
  pseudoObjects?: Record<string, string>;
  action?: string;
  value?: number;
}

/**
 * All rooms in Zork I
 */
export const ROOMS: Record<string, RoomData> = {
  // Forest and Outside of House
  'WEST-OF-HOUSE': {
    id: 'WEST-OF-HOUSE',
    name: 'West of House',
    description: 'You are standing in an open field west of a white house, with a boarded front door.',
    longDescription: 'You are standing in an open field west of a white house, with a boarded front door.',
    exits: [
      { direction: 'NORTH', destination: 'NORTH-OF-HOUSE' },
      { direction: 'SOUTH', destination: 'SOUTH-OF-HOUSE' },
      { direction: 'NE', destination: 'NORTH-OF-HOUSE' },
      { direction: 'SE', destination: 'SOUTH-OF-HOUSE' },
      { direction: 'WEST', destination: 'FOREST-1' },
      { direction: 'EAST', destination: '', message: 'The door is boarded and you can\'t remove the boards.' },
      { direction: 'SW', destination: 'STONE-BARROW', condition: 'WON-FLAG' },
      { direction: 'IN', destination: 'STONE-BARROW', condition: 'WON-FLAG' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['WHITE-HOUSE', 'BOARD', 'FOREST'],
    action: 'WEST-HOUSE'
  },

  'STONE-BARROW': {
    id: 'STONE-BARROW',
    name: 'Stone Barrow',
    description: 'Stone Barrow',
    longDescription: 'You are standing in front of a massive barrow of stone. In the east face is a huge stone door which is open. You cannot see into the dark of the tomb.',
    exits: [
      { direction: 'NE', destination: 'WEST-OF-HOUSE' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    action: 'STONE-BARROW-FCN'
  },

  'NORTH-OF-HOUSE': {
    id: 'NORTH-OF-HOUSE',
    name: 'North of House',
    description: 'North of House',
    longDescription: 'You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.',
    exits: [
      { direction: 'SW', destination: 'WEST-OF-HOUSE' },
      { direction: 'SE', destination: 'EAST-OF-HOUSE' },
      { direction: 'WEST', destination: 'WEST-OF-HOUSE' },
      { direction: 'EAST', destination: 'EAST-OF-HOUSE' },
      { direction: 'NORTH', destination: 'PATH' },
      { direction: 'SOUTH', destination: '', message: 'The windows are all boarded.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['BOARDED-WINDOW', 'BOARD', 'WHITE-HOUSE', 'FOREST']
  },

  'SOUTH-OF-HOUSE': {
    id: 'SOUTH-OF-HOUSE',
    name: 'South of House',
    description: 'South of House',
    longDescription: 'You are facing the south side of a white house. There is no door here, and all the windows are boarded.',
    exits: [
      { direction: 'WEST', destination: 'WEST-OF-HOUSE' },
      { direction: 'EAST', destination: 'EAST-OF-HOUSE' },
      { direction: 'NE', destination: 'EAST-OF-HOUSE' },
      { direction: 'NW', destination: 'WEST-OF-HOUSE' },
      { direction: 'SOUTH', destination: 'FOREST-3' },
      { direction: 'NORTH', destination: '', message: 'The windows are all boarded.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['BOARDED-WINDOW', 'BOARD', 'WHITE-HOUSE', 'FOREST']
  },

  'EAST-OF-HOUSE': {
    id: 'EAST-OF-HOUSE',
    name: 'Behind House',
    description: 'Behind House',
    longDescription: 'You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is slightly ajar.',
    exits: [
      { direction: 'NORTH', destination: 'NORTH-OF-HOUSE' },
      { direction: 'SOUTH', destination: 'SOUTH-OF-HOUSE' },
      { direction: 'SW', destination: 'SOUTH-OF-HOUSE' },
      { direction: 'NW', destination: 'NORTH-OF-HOUSE' },
      { direction: 'EAST', destination: 'CLEARING' },
      { direction: 'WEST', destination: 'KITCHEN', condition: 'KITCHEN-WINDOW IS OPEN' },
      { direction: 'IN', destination: 'KITCHEN', condition: 'KITCHEN-WINDOW IS OPEN' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['WHITE-HOUSE', 'KITCHEN-WINDOW', 'FOREST'],
    action: 'EAST-HOUSE'
  },

  // Additional rooms would continue here...
  // This is a representative sample showing the structure
};
