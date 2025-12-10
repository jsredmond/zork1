/**
 * Complete room definitions extracted from 1dungeon.zil
 * 
 * This file contains ALL rooms from Zork I with their complete data.
 * Total: 110+ rooms
 */

import { RoomData } from './rooms';

/**
 * Complete room database for Zork I
 * Extracted from 1dungeon.zil lines 1-2661
 */
export const ALL_ROOMS: Record<string, RoomData> = {
  // FOREST AND OUTSIDE OF HOUSE
  'WEST-OF-HOUSE': {
    id: 'WEST-OF-HOUSE',
    name: 'West of House',
    description: 'West of House',
    longDescription: 'You are standing in an open field west of a white house, with a boarded front\ndoor.',
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
    globalObjects: ['WHITE-HOUSE', 'BOARD', 'FOREST', 'BOARDED-WINDOW'],
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

  // FOREST ROOMS
  'FOREST-1': {
    id: 'FOREST-1',
    name: 'Forest',
    description: 'Forest',
    longDescription: 'This is a forest, with trees in all directions. To the east, there appears to be sunlight.',
    exits: [
      { direction: 'NORTH', destination: 'GRATING-CLEARING' },
      { direction: 'EAST', destination: 'PATH' },
      { direction: 'SOUTH', destination: 'FOREST-3' },
      { direction: 'WEST', destination: '', message: 'You would need a machete to go further west.' },
      { direction: 'UP', destination: '', message: 'There is no tree here suitable for climbing.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'SONGBIRD', 'WHITE-HOUSE', 'FOREST']
  },

  'FOREST-2': {
    id: 'FOREST-2',
    name: 'Forest',
    description: 'Forest',
    longDescription: 'This is a dimly lit forest, with large trees all around.',
    exits: [
      { direction: 'NORTH', destination: '', message: 'The forest becomes impenetrable to the north.' },
      { direction: 'EAST', destination: 'MOUNTAINS' },
      { direction: 'SOUTH', destination: 'CLEARING' },
      { direction: 'WEST', destination: 'PATH' },
      { direction: 'UP', destination: '', message: 'There is no tree here suitable for climbing.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'SONGBIRD', 'WHITE-HOUSE', 'FOREST']
  },

  'FOREST-3': {
    id: 'FOREST-3',
    name: 'Forest',
    description: 'Forest',
    longDescription: 'This is a dimly lit forest, with large trees all around.',
    exits: [
      { direction: 'NORTH', destination: 'CLEARING' },
      { direction: 'EAST', destination: '', message: 'The rank undergrowth prevents eastward movement.' },
      { direction: 'SOUTH', destination: '', message: 'Storm-tossed trees block your way.' },
      { direction: 'WEST', destination: 'FOREST-1' },
      { direction: 'NW', destination: 'SOUTH-OF-HOUSE' },
      { direction: 'UP', destination: '', message: 'There is no tree here suitable for climbing.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'SONGBIRD', 'WHITE-HOUSE', 'FOREST']
  },

  'PATH': {
    id: 'PATH',
    name: 'Forest Path',
    description: 'Forest Path',
    longDescription: 'This is a path winding through a dimly lit forest. The path heads north-south here. One particularly large tree with some low branches stands at the edge of the path.',
    exits: [
      { direction: 'NORTH', destination: 'GRATING-CLEARING' },
      { direction: 'EAST', destination: 'FOREST-2' },
      { direction: 'SOUTH', destination: 'NORTH-OF-HOUSE' },
      { direction: 'WEST', destination: 'FOREST-1' },
      { direction: 'UP', destination: 'UP-A-TREE' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'SONGBIRD', 'WHITE-HOUSE', 'FOREST']
  },

  'UP-A-TREE': {
    id: 'UP-A-TREE',
    name: 'Up a Tree',
    description: 'Up a Tree',
    longDescription: 'You are about 10 feet above the ground nestled among some large branches. The nearest branch above you is above your reach.',
    exits: [
      { direction: 'DOWN', destination: 'PATH' },
      { direction: 'UP', destination: '', message: 'You cannot climb any higher.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'FOREST', 'SONGBIRD', 'WHITE-HOUSE']
  },

  'GRATING-CLEARING': {
    id: 'GRATING-CLEARING',
    name: 'Clearing',
    description: 'Clearing',
    longDescription: 'You are in a clearing, with a forest surrounding you on all sides. A path leads south.',
    exits: [
      { direction: 'NORTH', destination: '', message: 'The forest becomes impenetrable to the north.' },
      { direction: 'EAST', destination: 'FOREST-2' },
      { direction: 'WEST', destination: 'FOREST-1' },
      { direction: 'SOUTH', destination: 'PATH' },
      { direction: 'DOWN', destination: 'GRATING-ROOM', condition: 'GRATE IS OPEN' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['WHITE-HOUSE', 'GRATE']
  },

  'CLEARING': {
    id: 'CLEARING',
    name: 'Clearing',
    description: 'Clearing',
    longDescription: 'You are in a small clearing in a well marked forest path that extends to the east and west.',
    exits: [
      { direction: 'EAST', destination: 'CANYON-VIEW' },
      { direction: 'NORTH', destination: 'FOREST-2' },
      { direction: 'SOUTH', destination: 'FOREST-3' },
      { direction: 'WEST', destination: 'EAST-OF-HOUSE' },
      { direction: 'UP', destination: '', message: 'There is no tree here suitable for climbing.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'SONGBIRD', 'WHITE-HOUSE', 'FOREST']
  },

  'CANYON-VIEW': {
    id: 'CANYON-VIEW',
    name: 'Canyon View',
    description: 'Canyon View',
    longDescription: 'You are at the top of the Great Canyon on its west wall. From here there is a marvelous view of the canyon and parts of the Frigid River upstream. Across the canyon, the walls of the White Cliffs join the mighty ramparts of the Flathead Mountains to the east. Following the Canyon upstream to the north, Aragain Falls may be seen, complete with rainbow. The mighty Frigid River flows out from a great dark cavern. To the west and south can be seen an immense forest, stretching for miles around. A path leads northwest. It is possible to climb down into the canyon from here.',
    exits: [
      { direction: 'WEST', destination: 'CLEARING' },
      { direction: 'NW', destination: 'GRATING-CLEARING' },
      { direction: 'DOWN', destination: 'ROCKY-LEDGE' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT']
  },

  'MOUNTAINS': {
    id: 'MOUNTAINS',
    name: 'Forest',
    description: 'Forest',
    longDescription: 'The forest thins out, revealing impassable mountains.',
    exits: [
      { direction: 'NORTH', destination: 'FOREST-2' },
      { direction: 'EAST', destination: '', message: 'The mountains are impassable.' },
      { direction: 'SOUTH', destination: 'FOREST-2' },
      { direction: 'WEST', destination: 'FOREST-2' },
      { direction: 'UP', destination: '', message: 'The mountains are impassable.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['TREE', 'WHITE-HOUSE']
  },

  // HOUSE ROOMS
  'KITCHEN': {
    id: 'KITCHEN',
    name: 'Kitchen',
    description: 'Kitchen',
    longDescription: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open.',
    exits: [
      { direction: 'EAST', destination: 'EAST-OF-HOUSE', condition: 'KITCHEN-WINDOW IS OPEN' },
      { direction: 'WEST', destination: 'LIVING-ROOM' },
      { direction: 'OUT', destination: 'EAST-OF-HOUSE', condition: 'KITCHEN-WINDOW IS OPEN' },
      { direction: 'UP', destination: 'ATTIC' },
      { direction: 'DOWN', destination: '', message: 'Only Santa Claus climbs down chimneys.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['KITCHEN-WINDOW', 'CHIMNEY', 'STAIRS'],
    value: 10
  },

  'ATTIC': {
    id: 'ATTIC',
    name: 'Attic',
    description: 'Attic',
    longDescription: 'This is the attic. The only exit is a stairway leading down.',
    exits: [
      { direction: 'DOWN', destination: 'KITCHEN' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    globalObjects: ['STAIRS']
  },

  'LIVING-ROOM': {
    id: 'LIVING-ROOM',
    name: 'Living Room',
    description: 'Living Room',
    longDescription: 'You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.',
    exits: [
      { direction: 'EAST', destination: 'KITCHEN' },
      { direction: 'WEST', destination: 'STRANGE-PASSAGE', condition: 'MAGIC-FLAG' },
      { direction: 'DOWN', destination: 'CELLAR', condition: 'TRAP-DOOR IS OPEN', message: 'The trap door is closed.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['STAIRS']
  },

  // CELLAR AND VICINITY
  'CELLAR': {
    id: 'CELLAR',
    name: 'Cellar',
    description: 'Cellar',
    longDescription: 'You are in a dark and damp cellar with a narrow passageway leading north, and a crawlway to the south. On the west is the bottom of a steep metal ramp which is unclimbable.',
    exits: [
      { direction: 'NORTH', destination: 'TROLL-ROOM' },
      { direction: 'SOUTH', destination: 'EAST-OF-CHASM' },
      { direction: 'UP', destination: 'LIVING-ROOM', condition: 'TRAP-DOOR IS OPEN' },
      { direction: 'WEST', destination: '', message: 'You try to ascend the ramp, but it is impossible, and you slide back down.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['TRAP-DOOR', 'SLIDE', 'STAIRS'],
    value: 25
  },

  'TROLL-ROOM': {
    id: 'TROLL-ROOM',
    name: 'The Troll Room',
    description: 'The Troll Room',
    longDescription: 'This is a small room with passages to the east and south and a forbidding hole leading west. Bloodstains and deep scratches (perhaps made by an axe) mar the walls.',
    exits: [
      { direction: 'SOUTH', destination: 'CELLAR' },
      { direction: 'EAST', destination: 'EW-PASSAGE', condition: 'TROLL-FLAG' },
      { direction: 'WEST', destination: 'MAZE-1', condition: 'TROLL-FLAG' }
    ],
    flags: ['RLANDBIT']
  },

  'EAST-OF-CHASM': {
    id: 'EAST-OF-CHASM',
    name: 'East of Chasm',
    description: 'East of Chasm',
    longDescription: 'You are on the east edge of a chasm, the bottom of which cannot be seen. A narrow passage goes north, and the path you are on continues to the east.',
    exits: [
      { direction: 'NORTH', destination: 'CELLAR' },
      { direction: 'EAST', destination: 'GALLERY' },
      { direction: 'DOWN', destination: '', message: 'The chasm probably leads straight to the infernal regions.' }
    ],
    flags: ['RLANDBIT']
  },

  'GALLERY': {
    id: 'GALLERY',
    name: 'Gallery',
    description: 'Gallery',
    longDescription: 'This is an art gallery. Most of the paintings which were here have been stolen by vandals with exceptional taste. The vandals left through either the north or west exits.\nHanging on a wall is a beautiful painting by a neglected artist. It is a portrait of an elven maid with a wistful expression.',
    exits: [
      { direction: 'WEST', destination: 'EAST-OF-CHASM' },
      { direction: 'NORTH', destination: 'STUDIO' }
    ],
    flags: ['RLANDBIT', 'ONBIT']
  },

  'STUDIO': {
    id: 'STUDIO',
    name: 'Studio',
    description: 'Studio',
    longDescription: 'This appears to have been an artist\'s studio. The walls and floors are splattered with paints of 69 different colors. Strangely enough, nothing of value is hanging here. At the south end of the room is an open door (also covered with paint). A dark and narrow chimney leads up from a fireplace; although you might be able to get up it, it seems unlikely you could get back down.',
    exits: [
      { direction: 'SOUTH', destination: 'GALLERY' },
      { direction: 'UP', destination: 'KITCHEN', condition: 'UP-CHIMNEY-ALLOWED' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['CHIMNEY']
  },

  // MAZE ROOMS (15 rooms)
  'MAZE-1': {
    id: 'MAZE-1',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'EAST', destination: 'TROLL-ROOM' },
      { direction: 'NORTH', destination: 'MAZE-1' },
      { direction: 'SOUTH', destination: 'MAZE-2' },
      { direction: 'WEST', destination: 'MAZE-4' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-2': {
    id: 'MAZE-2',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'SOUTH', destination: 'MAZE-1' },
      { direction: 'DOWN', destination: 'MAZE-4' },
      { direction: 'EAST', destination: 'MAZE-3' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-3': {
    id: 'MAZE-3',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-2' },
      { direction: 'NORTH', destination: 'MAZE-4' },
      { direction: 'UP', destination: 'MAZE-5' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-4': {
    id: 'MAZE-4',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-3' },
      { direction: 'NORTH', destination: 'MAZE-1' },
      { direction: 'EAST', destination: 'DEAD-END-1' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'DEAD-END-1': {
    id: 'DEAD-END-1',
    name: 'Dead End',
    description: 'Dead End',
    longDescription: 'You have come to a dead end in the maze.',
    exits: [
      { direction: 'SOUTH', destination: 'MAZE-4' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-5': {
    id: 'MAZE-5',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike. A skeleton, probably the remains of a luckless adventurer, lies here.',
    exits: [
      { direction: 'EAST', destination: 'DEAD-END-2' },
      { direction: 'NORTH', destination: 'MAZE-3' },
      { direction: 'SW', destination: 'MAZE-6' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'DEAD-END-2': {
    id: 'DEAD-END-2',
    name: 'Dead End',
    description: 'Dead End',
    longDescription: 'You have come to a dead end in the maze.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-5' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-6': {
    id: 'MAZE-6',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'EAST', destination: 'MAZE-7' },
      { direction: 'WEST', destination: 'MAZE-11' },
      { direction: 'NE', destination: 'MAZE-5' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-7': {
    id: 'MAZE-7',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-6' },
      { direction: 'UP', destination: 'MAZE-8' },
      { direction: 'SOUTH', destination: 'MAZE-10' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-8': {
    id: 'MAZE-8',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'DOWN', destination: 'MAZE-7' },
      { direction: 'EAST', destination: 'MAZE-9' },
      { direction: 'NE', destination: 'MAZE-10' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-9': {
    id: 'MAZE-9',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-8' },
      { direction: 'SE', destination: 'MAZE-10' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-10': {
    id: 'MAZE-10',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'NORTH', destination: 'MAZE-7' },
      { direction: 'SW', destination: 'MAZE-8' },
      { direction: 'NW', destination: 'MAZE-9' },
      { direction: 'EAST', destination: 'MAZE-11' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-11': {
    id: 'MAZE-11',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-10' },
      { direction: 'NORTH', destination: 'MAZE-12' },
      { direction: 'SOUTH', destination: 'MAZE-13' },
      { direction: 'EAST', destination: 'MAZE-6' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-12': {
    id: 'MAZE-12',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'SOUTH', destination: 'MAZE-11' },
      { direction: 'EAST', destination: 'MAZE-13' },
      { direction: 'NE', destination: 'DEAD-END-3' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'DEAD-END-3': {
    id: 'DEAD-END-3',
    name: 'Dead End',
    description: 'Dead End',
    longDescription: 'You have come to a dead end in the maze.',
    exits: [
      { direction: 'SW', destination: 'MAZE-12' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-13': {
    id: 'MAZE-13',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'WEST', destination: 'MAZE-12' },
      { direction: 'NORTH', destination: 'MAZE-11' },
      { direction: 'SE', destination: 'MAZE-14' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-14': {
    id: 'MAZE-14',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'NW', destination: 'MAZE-13' },
      { direction: 'DOWN', destination: 'MAZE-15' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'MAZE-15': {
    id: 'MAZE-15',
    name: 'Maze',
    description: 'Maze',
    longDescription: 'This is part of a maze of twisty little passages, all alike.',
    exits: [
      { direction: 'UP', destination: 'MAZE-14' },
      { direction: 'WEST', destination: 'GRATING-ROOM' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  'GRATING-ROOM': {
    id: 'GRATING-ROOM',
    name: 'Grating Room',
    description: 'Grating Room',
    longDescription: 'You are in a small room near the maze. There are twisty passages in the immediate vicinity.',
    exits: [
      { direction: 'UP', destination: 'GRATING-CLEARING', condition: 'GRATE IS OPEN' },
      { direction: 'EAST', destination: 'MAZE-15' },
      { direction: 'SW', destination: 'DEAD-END-4' }
    ],
    flags: ['RLANDBIT']
  },

  'DEAD-END-4': {
    id: 'DEAD-END-4',
    name: 'Dead End',
    description: 'Dead End',
    longDescription: 'You have come to a dead end in the maze.',
    exits: [
      { direction: 'NE', destination: 'GRATING-ROOM' }
    ],
    flags: ['RLANDBIT', 'MAZEBIT']
  },

  // Additional key rooms for basic functionality
  'EW-PASSAGE': {
    id: 'EW-PASSAGE',
    name: 'East-West Passage',
    description: 'East-West Passage',
    longDescription: 'This is a narrow east-west passageway. There is a narrow stairway leading down at the north end of the room.',
    exits: [
      { direction: 'EAST', destination: 'ROUND-ROOM' },
      { direction: 'WEST', destination: 'TROLL-ROOM' },
      { direction: 'NORTH', destination: 'CHASM-ROOM' },
      { direction: 'DOWN', destination: 'CHASM-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'ROUND-ROOM': {
    id: 'ROUND-ROOM',
    name: 'Round Room',
    description: 'Round Room',
    longDescription: 'This is a circular stone room with passages in all directions. Several of them have unfortunately been blocked by cave-ins.',
    exits: [
      { direction: 'WEST', destination: 'EW-PASSAGE' },
      { direction: 'SE', destination: 'LOUD-ROOM' },
      { direction: 'EAST', destination: 'NS-PASSAGE' },
      { direction: 'SOUTH', destination: 'NARROW-PASSAGE' }
    ],
    flags: ['RLANDBIT']
  },

  // CYCLOPS AREA (Task 1.9)
  'CYCLOPS-ROOM': {
    id: 'CYCLOPS-ROOM',
    name: 'Cyclops Room',
    description: 'Cyclops Room',
    longDescription: 'This room has an exit on the northwest, and a staircase leading up. To the east is a solid rock wall.',
    exits: [
      { direction: 'NW', destination: 'MAZE-15' },
      { direction: 'EAST', destination: 'STRANGE-PASSAGE', condition: 'MAGIC-FLAG' },
      { direction: 'EAST', destination: '', message: 'The east wall is solid rock.' },
      { direction: 'UP', destination: 'TREASURE-ROOM', condition: 'CYCLOPS-FLAG' },
      { direction: 'UP', destination: '', message: 'The cyclops doesn\'t look like he\'ll let you past.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    action: 'CYCLOPS-ROOM-FCN'
  },

  'STRANGE-PASSAGE': {
    id: 'STRANGE-PASSAGE',
    name: 'Strange Passage',
    description: 'Strange Passage',
    longDescription: 'This is a long passage. To the west is one entrance. On the east there is an old wooden door, with a large opening in it (about cyclops sized).',
    exits: [
      { direction: 'WEST', destination: 'CYCLOPS-ROOM' },
      { direction: 'IN', destination: 'CYCLOPS-ROOM' },
      { direction: 'EAST', destination: 'LIVING-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'TREASURE-ROOM': {
    id: 'TREASURE-ROOM',
    name: 'Treasure Room',
    description: 'Treasure Room',
    longDescription: 'This is a large room, whose east wall is solid granite. A number of discarded bags, which crumble at your touch, are scattered about on the floor. There is an exit down a staircase.',
    exits: [
      { direction: 'DOWN', destination: 'CYCLOPS-ROOM' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    value: 25,
    action: 'TREASURE-ROOM-FCN'
  },

  // RESERVOIR AREA (Task 1.1)
  'RESERVOIR-SOUTH': {
    id: 'RESERVOIR-SOUTH',
    name: 'Reservoir South',
    description: 'Reservoir South',
    longDescription: 'You are in a long room on the south shore of a large lake, far too deep and wide for crossing.',
    exits: [
      { direction: 'SE', destination: 'DEEP-CANYON' },
      { direction: 'SW', destination: 'CHASM-ROOM' },
      { direction: 'EAST', destination: 'DAM-ROOM' },
      { direction: 'WEST', destination: 'STREAM-VIEW' },
      { direction: 'NORTH', destination: 'RESERVOIR', condition: 'LOW-TIDE' },
      { direction: 'NORTH', destination: '', message: 'You would drown.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['GLOBAL-WATER'],
    action: 'RESERVOIR-SOUTH-FCN'
  },

  'RESERVOIR': {
    id: 'RESERVOIR',
    name: 'Reservoir',
    description: 'Reservoir',
    longDescription: 'You are on the reservoir. Beaches can be seen north and south. There is a stream here.',
    exits: [
      { direction: 'NORTH', destination: 'RESERVOIR-NORTH' },
      { direction: 'SOUTH', destination: 'RESERVOIR-SOUTH' },
      { direction: 'UP', destination: 'IN-STREAM' },
      { direction: 'WEST', destination: 'IN-STREAM' },
      { direction: 'DOWN', destination: '', message: 'The dam blocks your way.' }
    ],
    flags: ['NONLANDBIT'],
    globalObjects: ['GLOBAL-WATER'],
    action: 'RESERVOIR-FCN'
  },

  'RESERVOIR-NORTH': {
    id: 'RESERVOIR-NORTH',
    name: 'Reservoir North',
    description: 'Reservoir North',
    longDescription: 'You are on the north shore of the reservoir. To the north is a large dome-shaped room.',
    exits: [
      { direction: 'NORTH', destination: 'ATLANTIS-ROOM' },
      { direction: 'SOUTH', destination: 'RESERVOIR', condition: 'LOW-TIDE' },
      { direction: 'SOUTH', destination: '', message: 'You would drown.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['GLOBAL-WATER', 'STAIRS'],
    action: 'RESERVOIR-NORTH-FCN'
  },

  'STREAM-VIEW': {
    id: 'STREAM-VIEW',
    name: 'Stream View',
    description: 'Stream View',
    longDescription: 'You are standing on a path beside a gently flowing stream. The path follows the stream, which flows from west to east.',
    exits: [
      { direction: 'EAST', destination: 'RESERVOIR-SOUTH' },
      { direction: 'WEST', destination: '', message: 'The stream emerges from a spot too small for you to enter.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['GLOBAL-WATER']
  },

  'IN-STREAM': {
    id: 'IN-STREAM',
    name: 'Stream',
    description: 'Stream',
    longDescription: 'You are on the gently flowing stream. The upstream route is too narrow to navigate, and the downstream route is invisible due to twisting walls. There is a narrow beach to land on.',
    exits: [
      { direction: 'UP', destination: '', message: 'The channel is too narrow.' },
      { direction: 'WEST', destination: '', message: 'The channel is too narrow.' },
      { direction: 'LAND', destination: 'STREAM-VIEW' },
      { direction: 'DOWN', destination: 'RESERVOIR' },
      { direction: 'EAST', destination: 'RESERVOIR' }
    ],
    flags: ['NONLANDBIT'],
    globalObjects: ['GLOBAL-WATER']
  },

  // MIRROR ROOM AREA (Task 1.2)
  'MIRROR-ROOM-1': {
    id: 'MIRROR-ROOM-1',
    name: 'Mirror Room',
    description: 'Mirror Room',
    longDescription: 'You are in a large square room with tall ceilings. On the south wall is an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.',
    exits: [
      { direction: 'NORTH', destination: 'COLD-PASSAGE' },
      { direction: 'WEST', destination: 'TWISTING-PASSAGE' },
      { direction: 'EAST', destination: 'SMALL-CAVE' }
    ],
    flags: ['RLANDBIT'],
    action: 'MIRROR-ROOM'
  },

  'MIRROR-ROOM-2': {
    id: 'MIRROR-ROOM-2',
    name: 'Mirror Room',
    description: 'Mirror Room',
    longDescription: 'You are in a large square room with tall ceilings. On the south wall is an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.',
    exits: [
      { direction: 'WEST', destination: 'WINDING-PASSAGE' },
      { direction: 'NORTH', destination: 'NARROW-PASSAGE' },
      { direction: 'EAST', destination: 'TINY-CAVE' }
    ],
    flags: ['RLANDBIT', 'ONBIT'],
    action: 'MIRROR-ROOM'
  },

  'SMALL-CAVE': {
    id: 'SMALL-CAVE',
    name: 'Cave',
    description: 'Cave',
    longDescription: 'This is a tiny cave with entrances west and north, and a staircase leading down.',
    exits: [
      { direction: 'NORTH', destination: 'MIRROR-ROOM-1' },
      { direction: 'DOWN', destination: 'ATLANTIS-ROOM' },
      { direction: 'SOUTH', destination: 'ATLANTIS-ROOM' },
      { direction: 'WEST', destination: 'TWISTING-PASSAGE' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS']
  },

  'TINY-CAVE': {
    id: 'TINY-CAVE',
    name: 'Cave',
    description: 'Cave',
    longDescription: 'This is a tiny cave with entrances west and north, and a dark, forbidding staircase leading down.',
    exits: [
      { direction: 'NORTH', destination: 'MIRROR-ROOM-2' },
      { direction: 'WEST', destination: 'WINDING-PASSAGE' },
      { direction: 'DOWN', destination: 'ENTRANCE-TO-HADES' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    action: 'CAVE2-ROOM'
  },

  'COLD-PASSAGE': {
    id: 'COLD-PASSAGE',
    name: 'Cold Passage',
    description: 'Cold Passage',
    longDescription: 'This is a cold and damp corridor where a long east-west passageway turns into a southward path.',
    exits: [
      { direction: 'SOUTH', destination: 'MIRROR-ROOM-1' },
      { direction: 'WEST', destination: 'SLIDE-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'NARROW-PASSAGE': {
    id: 'NARROW-PASSAGE',
    name: 'Narrow Passage',
    description: 'Narrow Passage',
    longDescription: 'This is a long and narrow corridor where a long north-south passageway briefly narrows even further.',
    exits: [
      { direction: 'NORTH', destination: 'ROUND-ROOM' },
      { direction: 'SOUTH', destination: 'MIRROR-ROOM-2' }
    ],
    flags: ['RLANDBIT']
  },

  'WINDING-PASSAGE': {
    id: 'WINDING-PASSAGE',
    name: 'Winding Passage',
    description: 'Winding Passage',
    longDescription: 'This is a winding passage. It seems that there are only exits on the east and north.',
    exits: [
      { direction: 'NORTH', destination: 'MIRROR-ROOM-2' },
      { direction: 'EAST', destination: 'TINY-CAVE' }
    ],
    flags: ['RLANDBIT']
  },

  'TWISTING-PASSAGE': {
    id: 'TWISTING-PASSAGE',
    name: 'Twisting Passage',
    description: 'Twisting Passage',
    longDescription: 'This is a winding passage. It seems that there are only exits on the east and north.',
    exits: [
      { direction: 'NORTH', destination: 'MIRROR-ROOM-1' },
      { direction: 'EAST', destination: 'SMALL-CAVE' }
    ],
    flags: ['RLANDBIT']
  },

  'ATLANTIS-ROOM': {
    id: 'ATLANTIS-ROOM',
    name: 'Atlantis Room',
    description: 'Atlantis Room',
    longDescription: 'This is an ancient room, long under water. There is an exit to the south and a staircase leading up.',
    exits: [
      { direction: 'UP', destination: 'SMALL-CAVE' },
      { direction: 'SOUTH', destination: 'RESERVOIR-NORTH' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS']
  },

  // ROUND ROOM AREA (Task 1.3)
  'DEEP-CANYON': {
    id: 'DEEP-CANYON',
    name: 'Deep Canyon',
    description: 'Deep Canyon',
    longDescription: 'You are on the south edge of a deep canyon. Passages lead off to the east, northwest and southwest. You can hear the sound of flowing water from below.',
    exits: [
      { direction: 'NW', destination: 'RESERVOIR-SOUTH' },
      { direction: 'EAST', destination: 'DAM-ROOM' },
      { direction: 'SW', destination: 'NS-PASSAGE' },
      { direction: 'DOWN', destination: 'LOUD-ROOM' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    action: 'DEEP-CANYON-F'
  },

  'DAMP-CAVE': {
    id: 'DAMP-CAVE',
    name: 'Damp Cave',
    description: 'Damp Cave',
    longDescription: 'This cave has exits to the west and east, and narrows to a crack toward the south. The earth is particularly damp here.',
    exits: [
      { direction: 'WEST', destination: 'LOUD-ROOM' },
      { direction: 'EAST', destination: 'WHITE-CLIFFS-NORTH' },
      { direction: 'SOUTH', destination: '', message: 'It is too narrow for most insects.' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['CRACK']
  },

  'LOUD-ROOM': {
    id: 'LOUD-ROOM',
    name: 'Loud Room',
    description: 'Loud Room',
    longDescription: 'This is a large room with a ceiling which cannot be detected from the ground. There is a narrow passage from east to west and a stone stairway leading upward. The room is extremely noisy. In fact, it is difficult to hear yourself think.',
    exits: [
      { direction: 'EAST', destination: 'DAMP-CAVE' },
      { direction: 'WEST', destination: 'ROUND-ROOM' },
      { direction: 'UP', destination: 'DEEP-CANYON' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    action: 'LOUD-ROOM-FCN'
  },

  'NS-PASSAGE': {
    id: 'NS-PASSAGE',
    name: 'North-South Passage',
    description: 'North-South Passage',
    longDescription: 'This is a high north-south passage, which forks to the northeast.',
    exits: [
      { direction: 'NORTH', destination: 'CHASM-ROOM' },
      { direction: 'NE', destination: 'DEEP-CANYON' },
      { direction: 'SOUTH', destination: 'ROUND-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'CHASM-ROOM': {
    id: 'CHASM-ROOM',
    name: 'Chasm',
    description: 'Chasm',
    longDescription: 'A chasm runs southwest to northeast and the path follows it. You are on the south side of the chasm, where a crack opens into a passage.',
    exits: [
      { direction: 'NE', destination: 'RESERVOIR-SOUTH' },
      { direction: 'SW', destination: 'EW-PASSAGE' },
      { direction: 'UP', destination: 'EW-PASSAGE' },
      { direction: 'SOUTH', destination: 'NS-PASSAGE' },
      { direction: 'DOWN', destination: '', message: 'Are you out of your mind?' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['CRACK', 'STAIRS']
  },

  // HADES AREA (Task 1.4)
  'ENTRANCE-TO-HADES': {
    id: 'ENTRANCE-TO-HADES',
    name: 'Entrance to Hades',
    description: 'Entrance to Hades',
    longDescription: 'You are outside a large gateway, on which is inscribed: "Abandon every hope all ye who enter here." The gate is open; through it you can see a desolation, with a pile of mangled bodies in one corner. Thousands of voices, lamenting some hideous fate, can be heard.',
    exits: [
      { direction: 'UP', destination: 'TINY-CAVE' },
      { direction: 'IN', destination: 'LAND-OF-LIVING-DEAD', condition: 'LLD-FLAG' },
      { direction: 'IN', destination: '', message: 'Some invisible force prevents you from passing through the gate.' },
      { direction: 'SOUTH', destination: 'LAND-OF-LIVING-DEAD', condition: 'LLD-FLAG' },
      { direction: 'SOUTH', destination: '', message: 'Some invisible force prevents you from passing through the gate.' }
    ],
    flags: ['RLANDBIT', 'ONBIT'],
    globalObjects: ['BODIES'],
    action: 'LLD-ROOM'
  },

  'LAND-OF-LIVING-DEAD': {
    id: 'LAND-OF-LIVING-DEAD',
    name: 'Land of the Dead',
    description: 'Land of the Dead',
    longDescription: 'You have entered the Land of the Living Dead. Thousands of lost souls can be heard weeping and moaning. In the corner are stacked the remains of dozens of previous adventurers less fortunate than yourself. A passage exits to the north.',
    exits: [
      { direction: 'OUT', destination: 'ENTRANCE-TO-HADES' },
      { direction: 'NORTH', destination: 'ENTRANCE-TO-HADES' }
    ],
    flags: ['RLANDBIT', 'ONBIT'],
    globalObjects: ['BODIES']
  },

  // TEMPLE/EGYPT AREA (Task 1.5)
  'ENGRAVINGS-CAVE': {
    id: 'ENGRAVINGS-CAVE',
    name: 'Engravings Cave',
    description: 'Engravings Cave',
    longDescription: 'You have entered a low cave with passages leading northwest and east.',
    exits: [
      { direction: 'NW', destination: 'ROUND-ROOM' },
      { direction: 'EAST', destination: 'DOME-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'EGYPT-ROOM': {
    id: 'EGYPT-ROOM',
    name: 'Egyptian Room',
    description: 'Egyptian Room',
    longDescription: 'This is a room which looks like an Egyptian tomb. There is an ascending staircase to the west.',
    exits: [
      { direction: 'WEST', destination: 'NORTH-TEMPLE' },
      { direction: 'UP', destination: 'NORTH-TEMPLE' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS']
  },

  'DOME-ROOM': {
    id: 'DOME-ROOM',
    name: 'Dome Room',
    description: 'Dome Room',
    longDescription: 'You are at the periphery of a large dome, which forms the ceiling of another room below. Protecting you from a precipitous drop is a wooden railing which circles the dome.',
    exits: [
      { direction: 'WEST', destination: 'ENGRAVINGS-CAVE' },
      { direction: 'DOWN', destination: 'TORCH-ROOM', condition: 'DOME-FLAG' },
      { direction: 'DOWN', destination: '', message: 'You cannot go down without fracturing many bones.' }
    ],
    flags: ['RLANDBIT'],
    action: 'DOME-ROOM-FCN'
  },

  'TORCH-ROOM': {
    id: 'TORCH-ROOM',
    name: 'Torch Room',
    description: 'Torch Room',
    longDescription: 'This is a large room with a prominent doorway leading to a down staircase. Above you is a large dome painted with scenes depicting elvish hacking rites. Up around the edge of the dome (20 feet up) is a wooden railing. In the center of the room there is a white marble pedestal.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot reach the rope.' },
      { direction: 'SOUTH', destination: 'NORTH-TEMPLE' },
      { direction: 'DOWN', destination: 'NORTH-TEMPLE' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS'],
    action: 'TORCH-ROOM-FCN'
  },

  'NORTH-TEMPLE': {
    id: 'NORTH-TEMPLE',
    name: 'Temple',
    description: 'Temple',
    longDescription: 'This is the north end of a large temple. On the east wall is an ancient inscription, probably a prayer in a long-forgotten language. Below the prayer is a staircase leading down. The west wall is solid granite. The exit to the north end of the room is through huge marble pillars.',
    exits: [
      { direction: 'DOWN', destination: 'EGYPT-ROOM' },
      { direction: 'EAST', destination: 'EGYPT-ROOM' },
      { direction: 'NORTH', destination: 'TORCH-ROOM' },
      { direction: 'OUT', destination: 'TORCH-ROOM' },
      { direction: 'UP', destination: 'TORCH-ROOM' },
      { direction: 'SOUTH', destination: 'SOUTH-TEMPLE' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['STAIRS']
  },

  'SOUTH-TEMPLE': {
    id: 'SOUTH-TEMPLE',
    name: 'Altar',
    description: 'Altar',
    longDescription: 'This is the south end of a large temple. In front of you is what appears to be an altar. In one corner is a small hole in the floor which leads into darkness. You probably could not get back up it.',
    exits: [
      { direction: 'NORTH', destination: 'NORTH-TEMPLE' },
      { direction: 'DOWN', destination: 'TINY-CAVE', condition: 'COFFIN-CURE' },
      { direction: 'DOWN', destination: '', message: 'You haven\'t a prayer of getting the coffin down there.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    action: 'SOUTH-TEMPLE-FCN'
  },

  // DAM AREA (Task 1.6)
  'DAM-ROOM': {
    id: 'DAM-ROOM',
    name: 'Dam',
    description: 'Dam',
    longDescription: 'You are standing on the top of the Flood Control Dam #3, which was quite a tourist attraction in times far distant. There are paths to the north, south, and west, and a scramble down.',
    exits: [
      { direction: 'SOUTH', destination: 'DEEP-CANYON' },
      { direction: 'DOWN', destination: 'DAM-BASE' },
      { direction: 'EAST', destination: 'DAM-BASE' },
      { direction: 'NORTH', destination: 'DAM-LOBBY' },
      { direction: 'WEST', destination: 'RESERVOIR-SOUTH' }
    ],
    flags: ['RLANDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER'],
    action: 'DAM-ROOM-FCN'
  },

  'DAM-LOBBY': {
    id: 'DAM-LOBBY',
    name: 'Dam Lobby',
    description: 'Dam Lobby',
    longDescription: 'This room appears to have been the waiting room for groups touring the dam. There are open doorways here to the north and east marked "Private", and there is a path leading south over the top of the dam.',
    exits: [
      { direction: 'SOUTH', destination: 'DAM-ROOM' },
      { direction: 'NORTH', destination: 'MAINTENANCE-ROOM' },
      { direction: 'EAST', destination: 'MAINTENANCE-ROOM' }
    ],
    flags: ['RLANDBIT', 'ONBIT']
  },

  'MAINTENANCE-ROOM': {
    id: 'MAINTENANCE-ROOM',
    name: 'Maintenance Room',
    description: 'Maintenance Room',
    longDescription: 'This is what appears to have been the maintenance room for Flood Control Dam #3. Apparently, this room has been ransacked recently, for most of the valuable equipment is gone. On the wall in front of you is a group of buttons colored blue, yellow, brown, and red. There are doorways to the west and south.',
    exits: [
      { direction: 'SOUTH', destination: 'DAM-LOBBY' },
      { direction: 'WEST', destination: 'DAM-LOBBY' }
    ],
    flags: ['RLANDBIT']
  },

  // RIVER AREA (Task 1.7)
  'DAM-BASE': {
    id: 'DAM-BASE',
    name: 'Dam Base',
    description: 'Dam Base',
    longDescription: 'You are at the base of Flood Control Dam #3, which looms above you and to the north. The river Frigid is flowing by here. Along the river are the White Cliffs which seem to form giant walls stretching from north to south along the shores of the river as it winds its way downstream.',
    exits: [
      { direction: 'NORTH', destination: 'DAM-ROOM' },
      { direction: 'UP', destination: 'DAM-ROOM' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'RIVER-1': {
    id: 'RIVER-1',
    name: 'Frigid River',
    description: 'Frigid River',
    longDescription: 'You are on the Frigid River in the vicinity of the Dam. The river flows quietly here. There is a landing on the west shore.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot go upstream due to strong currents.' },
      { direction: 'WEST', destination: 'DAM-BASE' },
      { direction: 'LAND', destination: 'DAM-BASE' },
      { direction: 'DOWN', destination: 'RIVER-2' },
      { direction: 'EAST', destination: '', message: 'The White Cliffs prevent your landing here.' }
    ],
    flags: ['NONLANDBIT', 'SACREDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'RIVER-2': {
    id: 'RIVER-2',
    name: 'Frigid River',
    description: 'Frigid River',
    longDescription: 'The river turns a corner here making it impossible to see the Dam. The White Cliffs loom on the east bank and large rocks prevent landing on the west.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot go upstream due to strong currents.' },
      { direction: 'DOWN', destination: 'RIVER-3' },
      { direction: 'LAND', destination: '', message: 'There is no safe landing spot here.' },
      { direction: 'EAST', destination: '', message: 'The White Cliffs prevent your landing here.' },
      { direction: 'WEST', destination: '', message: 'Just in time you steer away from the rocks.' }
    ],
    flags: ['NONLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'RIVER-3': {
    id: 'RIVER-3',
    name: 'Frigid River',
    description: 'Frigid River',
    longDescription: 'The river descends here into a valley. There is a narrow beach on the west shore below the cliffs. In the distance a faint rumbling can be heard.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot go upstream due to strong currents.' },
      { direction: 'DOWN', destination: 'RIVER-4' },
      { direction: 'LAND', destination: 'WHITE-CLIFFS-NORTH' },
      { direction: 'WEST', destination: 'WHITE-CLIFFS-NORTH' }
    ],
    flags: ['NONLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'WHITE-CLIFFS-NORTH': {
    id: 'WHITE-CLIFFS-NORTH',
    name: 'White Cliffs Beach',
    description: 'White Cliffs Beach',
    longDescription: 'You are on a narrow strip of beach which runs along the base of the White Cliffs. There is a narrow path heading south along the Cliffs and a tight passage leading west into the cliffs themselves.',
    exits: [
      { direction: 'SOUTH', destination: 'WHITE-CLIFFS-SOUTH', condition: 'DEFLATE' },
      { direction: 'SOUTH', destination: '', message: 'The path is too narrow.' },
      { direction: 'WEST', destination: 'DAMP-CAVE', condition: 'DEFLATE' },
      { direction: 'WEST', destination: '', message: 'The path is too narrow.' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'WHITE-CLIFF', 'RIVER'],
    action: 'WHITE-CLIFFS-FUNCTION'
  },

  'WHITE-CLIFFS-SOUTH': {
    id: 'WHITE-CLIFFS-SOUTH',
    name: 'White Cliffs Beach',
    description: 'White Cliffs Beach',
    longDescription: 'You are on a rocky, narrow strip of beach beside the Cliffs. A narrow path leads north along the shore.',
    exits: [
      { direction: 'NORTH', destination: 'WHITE-CLIFFS-NORTH', condition: 'DEFLATE' },
      { direction: 'NORTH', destination: '', message: 'The path is too narrow.' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'WHITE-CLIFF', 'RIVER'],
    action: 'WHITE-CLIFFS-FUNCTION'
  },

  'RIVER-4': {
    id: 'RIVER-4',
    name: 'Frigid River',
    description: 'Frigid River',
    longDescription: 'The river is running faster here and the sound ahead appears to be that of rushing water. On the east shore is a sandy beach. A small area of beach can also be seen below the cliffs on the west shore.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot go upstream due to strong currents.' },
      { direction: 'DOWN', destination: 'RIVER-5' },
      { direction: 'LAND', destination: '', message: 'You can land either to the east or the west.' },
      { direction: 'WEST', destination: 'WHITE-CLIFFS-SOUTH' },
      { direction: 'EAST', destination: 'SANDY-BEACH' }
    ],
    flags: ['NONLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER'],
    action: 'RIVR4-ROOM'
  },

  'RIVER-5': {
    id: 'RIVER-5',
    name: 'Frigid River',
    description: 'Frigid River',
    longDescription: 'The sound of rushing water is nearly unbearable here. On the east shore is a large landing area.',
    exits: [
      { direction: 'UP', destination: '', message: 'You cannot go upstream due to strong currents.' },
      { direction: 'EAST', destination: 'SHORE' },
      { direction: 'LAND', destination: 'SHORE' }
    ],
    flags: ['NONLANDBIT', 'SACREDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'SHORE': {
    id: 'SHORE',
    name: 'Shore',
    description: 'Shore',
    longDescription: 'You are on the east shore of the river. The water here seems somewhat treacherous. A path travels from north to south here, the south end quickly turning around a sharp corner.',
    exits: [
      { direction: 'NORTH', destination: 'SANDY-BEACH' },
      { direction: 'SOUTH', destination: 'ARAGAIN-FALLS' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'SANDY-BEACH': {
    id: 'SANDY-BEACH',
    name: 'Sandy Beach',
    description: 'Sandy Beach',
    longDescription: 'You are on a large sandy beach on the east shore of the river, which is flowing quickly by. A path runs beside the river to the south here, and a passage is partially buried in sand to the northeast.',
    exits: [
      { direction: 'NE', destination: 'SANDY-CAVE' },
      { direction: 'SOUTH', destination: 'SHORE' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER']
  },

  'SANDY-CAVE': {
    id: 'SANDY-CAVE',
    name: 'Sandy Cave',
    description: 'Sandy Cave',
    longDescription: 'This is a sand-filled cave whose exit is to the southwest.',
    exits: [
      { direction: 'SW', destination: 'SANDY-BEACH' }
    ],
    flags: ['RLANDBIT']
  },

  'ARAGAIN-FALLS': {
    id: 'ARAGAIN-FALLS',
    name: 'Aragain Falls',
    description: 'Aragain Falls',
    longDescription: 'You are at the top of Aragain Falls, an enormous waterfall with a drop of about 450 feet. The only path here is on the north end.',
    exits: [
      { direction: 'WEST', destination: 'ON-RAINBOW', condition: 'RAINBOW-FLAG' },
      { direction: 'DOWN', destination: '', message: 'It\'s a long way...' },
      { direction: 'NORTH', destination: 'SHORE' },
      { direction: 'UP', destination: 'ON-RAINBOW', condition: 'RAINBOW-FLAG' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER', 'RIVER', 'RAINBOW'],
    action: 'FALLS-ROOM'
  },

  'ON-RAINBOW': {
    id: 'ON-RAINBOW',
    name: 'On the Rainbow',
    description: 'On the Rainbow',
    longDescription: 'You are on top of a rainbow (I bet you never thought you would walk on a rainbow), with a magnificent view of the Falls. The rainbow travels east-west here.',
    exits: [
      { direction: 'WEST', destination: 'END-OF-RAINBOW' },
      { direction: 'EAST', destination: 'ARAGAIN-FALLS' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['RAINBOW']
  },

  'END-OF-RAINBOW': {
    id: 'END-OF-RAINBOW',
    name: 'End of Rainbow',
    description: 'End of Rainbow',
    longDescription: 'You are on a small, rocky beach on the continuation of the Frigid River past the Falls. The beach is narrow due to the presence of the White Cliffs. The river canyon opens here and sunlight shines in from above. A rainbow crosses over the falls to the east and a narrow path continues to the southwest.',
    exits: [
      { direction: 'UP', destination: 'ON-RAINBOW', condition: 'RAINBOW-FLAG' },
      { direction: 'NE', destination: 'ON-RAINBOW', condition: 'RAINBOW-FLAG' },
      { direction: 'EAST', destination: 'ON-RAINBOW', condition: 'RAINBOW-FLAG' },
      { direction: 'SW', destination: 'CANYON-BOTTOM' }
    ],
    flags: ['RLANDBIT', 'ONBIT'],
    globalObjects: ['GLOBAL-WATER', 'RAINBOW', 'RIVER']
  },

  'CANYON-BOTTOM': {
    id: 'CANYON-BOTTOM',
    name: 'Canyon Bottom',
    description: 'Canyon Bottom',
    longDescription: 'You are beneath the walls of the river canyon which may be climbable here. The lesser part of the runoff of Aragain Falls flows by below. To the north is a narrow path.',
    exits: [
      { direction: 'UP', destination: 'CLIFF-MIDDLE' },
      { direction: 'NORTH', destination: 'END-OF-RAINBOW' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['GLOBAL-WATER', 'CLIMBABLE-CLIFF', 'RIVER']
  },

  'CLIFF-MIDDLE': {
    id: 'CLIFF-MIDDLE',
    name: 'Rocky Ledge',
    description: 'Rocky Ledge',
    longDescription: 'You are on a ledge about halfway up the wall of the river canyon. You can see from here that the main flow from Aragain Falls twists along a passage which it is impossible for you to enter. Below you is the canyon bottom. Above you is more cliff, which appears climbable.',
    exits: [
      { direction: 'UP', destination: 'CANYON-VIEW' },
      { direction: 'DOWN', destination: 'CANYON-BOTTOM' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['CLIMBABLE-CLIFF', 'RIVER']
  },

  'CANYON-VIEW': {
    id: 'CANYON-VIEW',
    name: 'Canyon View',
    description: 'Canyon View',
    longDescription: 'You are at the top of the Great Canyon on its west wall. From here there is a marvelous view of the canyon and parts of the Frigid River upstream. Across the canyon, the walls of the White Cliffs join the mighty ramparts of the Flathead Mountains to the east. Following the Canyon upstream to the north, Aragain Falls may be seen, complete with rainbow. The mighty Frigid River flows out from a great dark cavern. To the west and south can be seen an immense forest, stretching for miles around. A path leads northwest. It is possible to climb down into the canyon from here.',
    exits: [
      { direction: 'EAST', destination: 'CLIFF-MIDDLE' },
      { direction: 'DOWN', destination: 'CLIFF-MIDDLE' },
      { direction: 'NW', destination: 'CLEARING' },
      { direction: 'WEST', destination: 'FOREST-3' },
      { direction: 'SOUTH', destination: '', message: 'Storm-tossed trees block your way.' }
    ],
    flags: ['RLANDBIT', 'ONBIT', 'SACREDBIT'],
    globalObjects: ['CLIMBABLE-CLIFF', 'RIVER', 'RAINBOW'],
    action: 'CANYON-VIEW-F'
  },

  // COAL MINE AREA (Task 1.8)
  'MINE-ENTRANCE': {
    id: 'MINE-ENTRANCE',
    name: 'Mine Entrance',
    description: 'Mine Entrance',
    longDescription: 'You are standing at the entrance of what might have been a coal mine. The shaft enters the west wall, and there is another exit on the south end of the room.',
    exits: [
      { direction: 'SOUTH', destination: 'SLIDE-ROOM' },
      { direction: 'IN', destination: 'SQUEEKY-ROOM' },
      { direction: 'WEST', destination: 'SQUEEKY-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'SQUEEKY-ROOM': {
    id: 'SQUEEKY-ROOM',
    name: 'Squeaky Room',
    description: 'Squeaky Room',
    longDescription: 'You are in a small room. Strange squeaky sounds may be heard coming from the passage at the north end. You may also escape to the east.',
    exits: [
      { direction: 'NORTH', destination: 'BAT-ROOM' },
      { direction: 'EAST', destination: 'MINE-ENTRANCE' }
    ],
    flags: ['RLANDBIT']
  },

  'BAT-ROOM': {
    id: 'BAT-ROOM',
    name: 'Bat Room',
    description: 'Bat Room',
    longDescription: 'You are in a small room which has doors only to the east and south.',
    exits: [
      { direction: 'SOUTH', destination: 'SQUEEKY-ROOM' },
      { direction: 'EAST', destination: 'SHAFT-ROOM' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    action: 'BATS-ROOM'
  },

  'SHAFT-ROOM': {
    id: 'SHAFT-ROOM',
    name: 'Shaft Room',
    description: 'Shaft Room',
    longDescription: 'This is a large room, in the middle of which is a small shaft descending through the floor into darkness below. To the west and the north are exits from this room. Constructed over the top of the shaft is a metal framework to which a heavy iron chain is attached.',
    exits: [
      { direction: 'DOWN', destination: '', message: 'You wouldn\'t fit and would die if you could.' },
      { direction: 'WEST', destination: 'BAT-ROOM' },
      { direction: 'NORTH', destination: 'SMELLY-ROOM' }
    ],
    flags: ['RLANDBIT']
  },

  'SMELLY-ROOM': {
    id: 'SMELLY-ROOM',
    name: 'Smelly Room',
    description: 'Smelly Room',
    longDescription: 'This is a small nondescript room. However, from the direction of a small descending staircase a foul odor can be detected. To the south is a narrow tunnel.',
    exits: [
      { direction: 'DOWN', destination: 'GAS-ROOM' },
      { direction: 'SOUTH', destination: 'SHAFT-ROOM' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['STAIRS']
  },

  'GAS-ROOM': {
    id: 'GAS-ROOM',
    name: 'Gas Room',
    description: 'Gas Room',
    longDescription: 'This is a small room which smells strongly of coal gas. There is a short climb up some stairs and a narrow tunnel leading east.',
    exits: [
      { direction: 'UP', destination: 'SMELLY-ROOM' },
      { direction: 'EAST', destination: 'MINE-1' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    globalObjects: ['STAIRS'],
    action: 'BOOM-ROOM'
  },

  'LADDER-TOP': {
    id: 'LADDER-TOP',
    name: 'Ladder Top',
    description: 'Ladder Top',
    longDescription: 'This is a very small room. In the corner is a rickety wooden ladder, leading downward. It might be safe to descend. There is also a staircase leading upward.',
    exits: [
      { direction: 'DOWN', destination: 'LADDER-BOTTOM' },
      { direction: 'UP', destination: 'MINE-4' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['LADDER', 'STAIRS']
  },

  'LADDER-BOTTOM': {
    id: 'LADDER-BOTTOM',
    name: 'Ladder Bottom',
    description: 'Ladder Bottom',
    longDescription: 'This is a rather wide room. On one side is the bottom of a narrow wooden ladder. To the west and the south are passages leaving the room.',
    exits: [
      { direction: 'SOUTH', destination: 'DEAD-END-5' },
      { direction: 'WEST', destination: 'TIMBER-ROOM' },
      { direction: 'UP', destination: 'LADDER-TOP' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['LADDER']
  },

  'DEAD-END-5': {
    id: 'DEAD-END-5',
    name: 'Dead End',
    description: 'Dead End',
    longDescription: 'You have come to a dead end in the mine.',
    exits: [
      { direction: 'NORTH', destination: 'LADDER-BOTTOM' }
    ],
    flags: ['RLANDBIT']
  },

  'TIMBER-ROOM': {
    id: 'TIMBER-ROOM',
    name: 'Timber Room',
    description: 'Timber Room',
    longDescription: 'This is a long and narrow passage, which is cluttered with broken timbers. A wide passage comes from the east and turns at the west end of the room into a very narrow passageway. From the west comes a strong draft.',
    exits: [
      { direction: 'EAST', destination: 'LADDER-BOTTOM' },
      { direction: 'WEST', destination: 'LOWER-SHAFT', condition: 'EMPTY-HANDED' },
      { direction: 'WEST', destination: '', message: 'You cannot fit through this passage with that load.' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    action: 'NO-OBJS'
  },

  'LOWER-SHAFT': {
    id: 'LOWER-SHAFT',
    name: 'Drafty Room',
    description: 'Drafty Room',
    longDescription: 'This is a small drafty room in which is the bottom of a long shaft. To the south is a passageway and to the east a very narrow passage. In the shaft can be seen a heavy iron chain.',
    exits: [
      { direction: 'SOUTH', destination: 'MACHINE-ROOM' },
      { direction: 'OUT', destination: 'TIMBER-ROOM', condition: 'EMPTY-HANDED' },
      { direction: 'OUT', destination: '', message: 'You cannot fit through this passage with that load.' },
      { direction: 'EAST', destination: 'TIMBER-ROOM', condition: 'EMPTY-HANDED' },
      { direction: 'EAST', destination: '', message: 'You cannot fit through this passage with that load.' }
    ],
    flags: ['RLANDBIT', 'SACREDBIT'],
    action: 'NO-OBJS'
  },

  'MACHINE-ROOM': {
    id: 'MACHINE-ROOM',
    name: 'Machine Room',
    description: 'Machine Room',
    longDescription: 'This is a large room full of assorted heavy machinery. The room smells of burned resistors. Along one wall of the room are three buttons which are, respectively, round, triangular, and square. Naturally, above these buttons are instructions written in EBCDIC. A large sign above all the buttons says: "DANGER: This machine is not for the use of mere adventurers. Pressing any button is not recommended. The management accepts no responsibility for damage to users from use of this machine." A passage leads to the north.',
    exits: [
      { direction: 'NORTH', destination: 'LOWER-SHAFT' }
    ],
    flags: ['RLANDBIT'],
    action: 'MACHINE-ROOM-FCN'
  },

  'MINE-1': {
    id: 'MINE-1',
    name: 'Coal Mine',
    description: 'Coal Mine',
    longDescription: 'This is a nondescript part of a coal mine.',
    exits: [
      { direction: 'NORTH', destination: 'GAS-ROOM' },
      { direction: 'EAST', destination: 'MINE-1' },
      { direction: 'NE', destination: 'MINE-2' }
    ],
    flags: ['RLANDBIT']
  },

  'MINE-2': {
    id: 'MINE-2',
    name: 'Coal Mine',
    description: 'Coal Mine',
    longDescription: 'This is a nondescript part of a coal mine.',
    exits: [
      { direction: 'NORTH', destination: 'MINE-2' },
      { direction: 'SOUTH', destination: 'MINE-1' },
      { direction: 'SE', destination: 'MINE-3' }
    ],
    flags: ['RLANDBIT']
  },

  'MINE-3': {
    id: 'MINE-3',
    name: 'Coal Mine',
    description: 'Coal Mine',
    longDescription: 'This is a nondescript part of a coal mine.',
    exits: [
      { direction: 'SOUTH', destination: 'MINE-3' },
      { direction: 'SW', destination: 'MINE-4' },
      { direction: 'EAST', destination: 'MINE-2' }
    ],
    flags: ['RLANDBIT']
  },

  'MINE-4': {
    id: 'MINE-4',
    name: 'Coal Mine',
    description: 'Coal Mine',
    longDescription: 'This is a nondescript part of a coal mine.',
    exits: [
      { direction: 'NORTH', destination: 'MINE-3' },
      { direction: 'WEST', destination: 'MINE-4' },
      { direction: 'DOWN', destination: 'LADDER-TOP' }
    ],
    flags: ['RLANDBIT']
  },

  'SLIDE-ROOM': {
    id: 'SLIDE-ROOM',
    name: 'Slide Room',
    description: 'Slide Room',
    longDescription: 'This is a small chamber, which appears to have been part of a coal mine. On the south wall of the chamber the letters "Granite Wall" are etched in the rock. To the east is a long passage, and there is a steep metal slide twisting downward. To the north is a small opening.',
    exits: [
      { direction: 'EAST', destination: 'COLD-PASSAGE' },
      { direction: 'NORTH', destination: 'MINE-ENTRANCE' },
      { direction: 'DOWN', destination: 'CELLAR' }
    ],
    flags: ['RLANDBIT'],
    globalObjects: ['SLIDE']
  }
};

/**
 * Room count by area for validation
 */
export const ROOM_COUNTS = {
  FOREST_OUTSIDE: 12,
  HOUSE: 4,
  CELLAR_VICINITY: 4,
  MAZE: 15,
  CYCLOPS_AREA: 3,
  RESERVOIR: 5,
  MIRROR_ROOMS: 9,
  ROUND_ROOM_AREA: 7,
  HADES: 2,
  TEMPLE_EGYPT: 5,
  DAM: 3,
  RIVER: 13,
  COAL_MINE: 14,
  TOTAL: 110
};
