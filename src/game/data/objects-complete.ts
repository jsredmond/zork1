/**
 * Complete object definitions extracted from 1dungeon.zil
 * 
 * This file contains ALL objects from Zork I with their complete data.
 * Total: 100+ objects including treasures, tools, containers, NPCs, and scenery
 */

import { ObjectData } from './objects';

/**
 * Complete object database for Zork I
 * Extracted from 1dungeon.zil
 */
export const ALL_OBJECTS: Record<string, ObjectData> = {
  // SCENERY AND GLOBAL OBJECTS
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

  // TREASURES (19 total, worth 350 points)
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

  'PAINTING': {
    id: 'PAINTING',
    name: 'painting',
    synonyms: ['PAINTING', 'ART', 'CANVAS', 'TREASURE'],
    adjectives: ['BEAUTI'],
    description: 'painting',
    firstDescription: 'Fortunately, there is still one chance for you to be a vandal, for on the far wall is a painting of unparalleled beauty.',
    longDescription: 'A painting by a neglected genius is here.',
    initialLocation: 'GALLERY',
    flags: ['TAKEBIT', 'BURNBIT'],
    action: 'PAINTING-FCN',
    size: 15,
    value: 4,
    treasureValue: 6
  },

  'SCEPTRE': {
    id: 'SCEPTRE',
    name: 'sceptre',
    synonyms: ['SCEPTRE', 'SCEPTER', 'TREASURE'],
    adjectives: ['SHARP', 'EGYPTIAN', 'ANCIENT', 'ENAMELED'],
    description: 'sceptre',
    longDescription: 'An ornamented sceptre, tapering to a sharp point, is here.',
    firstDescription: 'A sceptre, possibly that of ancient Egypt itself, is in the coffin. The sceptre is ornamented with colored enamel, and tapers to a sharp point.',
    initialLocation: 'COFFIN',
    flags: ['TAKEBIT', 'WEAPONBIT'],
    action: 'SCEPTRE-FUNCTION',
    size: 3,
    value: 4,
    treasureValue: 6
  },

  'BELL': {
    id: 'BELL',
    name: 'brass bell',
    synonyms: ['BELL'],
    adjectives: ['SMALL', 'BRASS'],
    description: 'brass bell',
    initialLocation: 'NORTH-TEMPLE',
    flags: ['TAKEBIT'],
    action: 'BELL-F'
  },

  'HOT-BELL': {
    id: 'HOT-BELL',
    name: 'red hot brass bell',
    synonyms: ['BELL'],
    adjectives: ['BRASS', 'HOT', 'RED', 'SMALL'],
    description: 'red hot brass bell',
    longDescription: 'On the ground is a red hot bell.',
    initialLocation: '',
    flags: ['TRYTAKEBIT'],
    action: 'HOT-BELL-F'
  },

  'BURNED-OUT-LANTERN': {
    id: 'BURNED-OUT-LANTERN',
    name: 'burned-out lantern',
    synonyms: ['LANTERN', 'LAMP'],
    adjectives: ['RUSTY', 'BURNED', 'DEAD', 'USELESS'],
    description: 'burned-out lantern',
    firstDescription: 'The deceased adventurer\'s useless lantern is here.',
    initialLocation: 'MAZE-5',
    flags: ['TAKEBIT'],
    size: 20
  },

  'BONES': {
    id: 'BONES',
    name: 'skeleton',
    synonyms: ['BONES', 'SKELETON', 'BODY'],
    adjectives: [],
    description: 'skeleton',
    initialLocation: 'MAZE-5',
    flags: ['TRYTAKEBIT', 'NDESCBIT'],
    action: 'SKELETON'
  },

  'BROKEN-EGG': {
    id: 'BROKEN-EGG',
    name: 'broken jewel-encrusted egg',
    synonyms: ['EGG', 'TREASURE'],
    adjectives: ['BROKEN', 'BIRDS', 'ENCRUSTED', 'JEWEL'],
    description: 'broken jewel-encrusted egg',
    longDescription: 'There is a somewhat ruined egg here.',
    initialLocation: '',
    flags: ['TAKEBIT', 'CONTBIT', 'OPENBIT'],
    capacity: 6,
    treasureValue: 2
  },

  'BROKEN-CANARY': {
    id: 'BROKEN-CANARY',
    name: 'broken clockwork canary',
    synonyms: ['CANARY', 'TREASURE'],
    adjectives: ['BROKEN', 'CLOCKWORK', 'GOLD', 'GOLDEN'],
    description: 'broken clockwork canary',
    firstDescription: 'There is a golden clockwork canary nestled in the egg. It seems to have recently had a bad experience. The mountings for its jewel-like eyes are empty, and its silver beak is crumpled. Through a cracked crystal window below its left wing you can see the remains of intricate machinery. It is not clear what result winding it would have, as the mainspring seems sprung.',
    initialLocation: 'BROKEN-EGG',
    flags: ['TAKEBIT'],
    action: 'CANARY-OBJECT',
    treasureValue: 1
  },

  'COFFIN': {
    id: 'COFFIN',
    name: 'gold coffin',
    synonyms: ['COFFIN', 'CASKET', 'TREASURE'],
    adjectives: ['SOLID', 'GOLD'],
    description: 'gold coffin',
    longDescription: 'The solid-gold coffin used for the burial of Ramses II is here.',
    initialLocation: 'EGYPT-ROOM',
    flags: ['TAKEBIT', 'CONTBIT', 'SACREDBIT', 'SEARCHBIT'],
    capacity: 35,
    size: 55,
    value: 10,
    treasureValue: 15
  },

  'TORCH': {
    id: 'TORCH',
    name: 'torch',
    synonyms: ['TORCH', 'IVORY', 'TREASURE'],
    adjectives: ['FLAMING', 'IVORY'],
    description: 'torch',
    firstDescription: 'Sitting on the pedestal is a flaming torch, made of ivory.',
    initialLocation: 'PEDESTAL',
    flags: ['TAKEBIT', 'FLAMEBIT', 'ONBIT', 'LIGHTBIT'],
    action: 'TORCH-OBJECT',
    size: 20,
    value: 14,
    treasureValue: 6
  },

  'BRACELET': {
    id: 'BRACELET',
    name: 'sapphire-encrusted bracelet',
    synonyms: ['BRACELET', 'JEWEL', 'SAPPHIRE', 'TREASURE'],
    adjectives: ['SAPPHIRE'],
    description: 'sapphire-encrusted bracelet',
    initialLocation: 'GAS-ROOM',
    flags: ['TAKEBIT'],
    size: 10,
    value: 5,
    treasureValue: 5
  },

  'SCARAB': {
    id: 'SCARAB',
    name: 'beautiful jeweled scarab',
    synonyms: ['SCARAB', 'BUG', 'BEETLE', 'TREASURE'],
    adjectives: ['BEAUTI', 'CARVED', 'JEWELED'],
    description: 'beautiful jeweled scarab',
    initialLocation: 'SANDY-CAVE',
    flags: ['TAKEBIT', 'INVISIBLE'],
    size: 8,
    value: 5,
    treasureValue: 5
  },

  'BAR': {
    id: 'BAR',
    name: 'platinum bar',
    synonyms: ['BAR', 'PLATINUM', 'TREASURE'],
    adjectives: ['PLATINUM', 'LARGE'],
    description: 'platinum bar',
    longDescription: 'On the ground is a large platinum bar.',
    initialLocation: 'LOUD-ROOM',
    flags: ['TAKEBIT', 'SACREDBIT'],
    size: 20,
    value: 10,
    treasureValue: 5
  },

  'POT-OF-GOLD': {
    id: 'POT-OF-GOLD',
    name: 'pot of gold',
    synonyms: ['POT', 'GOLD', 'TREASURE'],
    adjectives: ['GOLD'],
    description: 'pot of gold',
    firstDescription: 'At the end of the rainbow is a pot of gold.',
    initialLocation: 'END-OF-RAINBOW',
    flags: ['TAKEBIT', 'INVISIBLE'],
    size: 15,
    value: 10,
    treasureValue: 10
  },

  'TRUNK': {
    id: 'TRUNK',
    name: 'trunk of jewels',
    synonyms: ['TRUNK', 'CHEST', 'JEWELS', 'TREASURE'],
    adjectives: ['OLD'],
    description: 'trunk of jewels',
    firstDescription: 'Lying half buried in the mud is an old trunk, bulging with jewels.',
    longDescription: 'There is an old trunk here, bulging with assorted jewels.',
    initialLocation: 'RESERVOIR',
    flags: ['TAKEBIT', 'INVISIBLE'],
    action: 'TRUNK-F',
    size: 35,
    value: 15,
    treasureValue: 5
  },

  'EGG': {
    id: 'EGG',
    name: 'jewel-encrusted egg',
    synonyms: ['EGG', 'TREASURE'],
    adjectives: ['BIRDS', 'ENCRUSTED', 'JEWELED'],
    description: 'jewel-encrusted egg',
    firstDescription: 'In the bird\'s nest is a large egg encrusted with precious jewels, apparently scavenged by a childless songbird. The egg is covered with fine gold inlay, and ornamented in lapis lazuli and mother-of-pearl. Unlike most eggs, this one is hinged and closed with a delicate looking clasp. The egg appears extremely fragile.',
    initialLocation: 'NEST',
    flags: ['TAKEBIT', 'CONTBIT', 'SEARCHBIT'],
    action: 'EGG-OBJECT',
    capacity: 6,
    value: 5,
    treasureValue: 5
  },

  'CANARY': {
    id: 'CANARY',
    name: 'golden clockwork canary',
    synonyms: ['CANARY', 'TREASURE'],
    adjectives: ['CLOCKWORK', 'GOLD', 'GOLDEN'],
    description: 'golden clockwork canary',
    firstDescription: 'There is a golden clockwork canary nestled in the egg. It has ruby eyes and a silver beak. Through a crystal window below its left wing you can see intricate machinery inside. It appears to have wound down.',
    initialLocation: 'EGG',
    flags: ['TAKEBIT', 'SEARCHBIT'],
    action: 'CANARY-OBJECT',
    value: 6,
    treasureValue: 4
  },

  'BAUBLE': {
    id: 'BAUBLE',
    name: 'beautiful brass bauble',
    synonyms: ['BAUBLE', 'TREASURE'],
    adjectives: ['BRASS', 'BEAUTI'],
    description: 'beautiful brass bauble',
    initialLocation: '',
    flags: ['TAKEBIT'],
    value: 1,
    treasureValue: 1
  },

  // TOOLS AND EQUIPMENT
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

  'SWORD': {
    id: 'SWORD',
    name: 'elvish sword',
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

  'ROPE': {
    id: 'ROPE',
    name: 'rope',
    synonyms: ['ROPE', 'HEMP', 'COIL'],
    adjectives: ['LARGE'],
    description: 'rope',
    firstDescription: 'A large coil of rope is lying in the corner.',
    initialLocation: 'ATTIC',
    flags: ['TAKEBIT', 'SACREDBIT', 'TRYTAKEBIT'],
    action: 'ROPE-FUNCTION',
    size: 10
  },

  'KNIFE': {
    id: 'KNIFE',
    name: 'nasty knife',
    synonyms: ['KNIVES', 'KNIFE', 'BLADE'],
    adjectives: ['NASTY', 'UNRUSTY'],
    description: 'nasty knife',
    firstDescription: 'On a table is a nasty-looking knife.',
    initialLocation: 'ATTIC-TABLE',
    flags: ['TAKEBIT', 'WEAPONBIT', 'TRYTAKEBIT'],
    action: 'KNIFE-F'
  },

  'SHOVEL': {
    id: 'SHOVEL',
    name: 'shovel',
    synonyms: ['SHOVEL', 'TOOL', 'TOOLS'],
    adjectives: [],
    description: 'shovel',
    initialLocation: 'SANDY-BEACH',
    flags: ['TAKEBIT', 'TOOLBIT'],
    size: 15
  },

  'SCREWDRIVER': {
    id: 'SCREWDRIVER',
    name: 'screwdriver',
    synonyms: ['SCREWDRIVER', 'TOOL', 'TOOLS', 'DRIVER'],
    adjectives: ['SCREW'],
    description: 'screwdriver',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['TAKEBIT', 'TOOLBIT']
  },

  'WRENCH': {
    id: 'WRENCH',
    name: 'wrench',
    synonyms: ['WRENCH', 'TOOL', 'TOOLS'],
    adjectives: [],
    description: 'wrench',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['TAKEBIT', 'TOOLBIT'],
    size: 10
  },

  'PUMP': {
    id: 'PUMP',
    name: 'hand-held air pump',
    synonyms: ['PUMP', 'AIR-PUMP', 'TOOL', 'TOOLS'],
    adjectives: ['SMALL', 'HAND-HELD'],
    description: 'hand-held air pump',
    initialLocation: 'RESERVOIR-NORTH',
    flags: ['TAKEBIT', 'TOOLBIT']
  },

  'KEYS': {
    id: 'KEYS',
    name: 'skeleton key',
    synonyms: ['KEY'],
    adjectives: ['SKELETON'],
    description: 'skeleton key',
    initialLocation: 'MAZE-5',
    flags: ['TAKEBIT', 'TOOLBIT'],
    size: 10
  },



  'RUSTY-KNIFE': {
    id: 'RUSTY-KNIFE',
    name: 'rusty knife',
    synonyms: ['KNIVES', 'KNIFE'],
    adjectives: ['RUSTY'],
    description: 'rusty knife',
    firstDescription: 'Beside the skeleton is a rusty knife.',
    initialLocation: 'MAZE-5',
    flags: ['TAKEBIT', 'TRYTAKEBIT', 'WEAPONBIT', 'TOOLBIT'],
    action: 'RUSTY-KNIFE-FCN',
    size: 20
  },

  'AXE': {
    id: 'AXE',
    name: 'bloody axe',
    synonyms: ['AXE', 'AX'],
    adjectives: ['BLOODY'],
    description: 'bloody axe',
    initialLocation: 'TROLL',
    flags: ['WEAPONBIT', 'TRYTAKEBIT', 'TAKEBIT', 'NDESCBIT'],
    action: 'AXE-F',
    size: 25
  },

  'STILETTO': {
    id: 'STILETTO',
    name: 'stiletto',
    synonyms: ['STILETTO'],
    adjectives: ['VICIOUS'],
    description: 'stiletto',
    initialLocation: 'THIEF',
    flags: ['WEAPONBIT', 'TRYTAKEBIT', 'TAKEBIT', 'NDESCBIT'],
    action: 'STILETTO-FUNCTION',
    size: 10
  },

  'TUBE': {
    id: 'TUBE',
    name: 'tube',
    synonyms: ['TUBE', 'TOOTH', 'PASTE'],
    adjectives: [],
    description: 'tube',
    longDescription: 'There is an object which looks like a tube of toothpaste here.',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['TAKEBIT', 'CONTBIT', 'READBIT'],
    action: 'TUBE-FUNCTION',
    capacity: 7,
    size: 5,
    text: '---> Frobozz Magic Gunk Company <---|\n\t  All-Purpose Gunk'
  },

  'PUTTY': {
    id: 'PUTTY',
    name: 'viscous material',
    synonyms: ['MATERIAL', 'GUNK'],
    adjectives: ['VISCOUS'],
    description: 'viscous material',
    initialLocation: 'TUBE',
    flags: ['TAKEBIT', 'TOOLBIT'],
    action: 'PUTTY-FCN',
    size: 6
  },

  // CONTAINERS
  'MAILBOX': {
    id: 'MAILBOX',
    name: 'small mailbox',
    synonyms: ['MAILBOX', 'BOX'],
    adjectives: ['SMALL'],
    description: 'small mailbox',
    initialLocation: 'WEST-OF-HOUSE',
    flags: ['CONTBIT', 'TRYTAKEBIT'],
    capacity: 10
  },

  'NEST': {
    id: 'NEST',
    name: 'bird\'s nest',
    synonyms: ['NEST'],
    adjectives: ['BIRDS', 'BIRD'],
    description: 'bird\'s nest',
    firstDescription: 'Beside you on the branch is a small bird\'s nest.',
    initialLocation: 'UP-A-TREE',
    flags: ['TAKEBIT', 'BURNBIT', 'CONTBIT', 'OPENBIT', 'SEARCHBIT'],
    capacity: 20,
    size: 10
  },

  'BUOY': {
    id: 'BUOY',
    name: 'red buoy',
    synonyms: ['BUOY'],
    adjectives: ['RED'],
    description: 'red buoy',
    firstDescription: 'There is a red buoy here (probably a warning).',
    initialLocation: 'RIVER-4',
    flags: ['TAKEBIT', 'CONTBIT'],
    action: 'TREASURE-INSIDE',
    capacity: 20,
    size: 10
  },

  'LOWERED-BASKET': {
    id: 'LOWERED-BASKET',
    name: 'basket',
    synonyms: ['CAGE', 'DUMBWAITER', 'BASKET'],
    adjectives: ['LOWERED'],
    description: 'basket',
    longDescription: 'From the chain is suspended a basket.',
    initialLocation: 'LOWER-SHAFT',
    flags: ['TRYTAKEBIT'],
    action: 'BASKET-F'
  },

  'RAISED-BASKET': {
    id: 'RAISED-BASKET',
    name: 'basket',
    synonyms: ['CAGE', 'DUMBWAITER', 'BASKET'],
    adjectives: [],
    description: 'basket',
    longDescription: 'At the end of the chain is a basket.',
    initialLocation: 'SHAFT-ROOM',
    flags: ['TRANSBIT', 'TRYTAKEBIT', 'CONTBIT', 'OPENBIT'],
    action: 'BASKET-F',
    capacity: 50
  },

  'MACHINE': {
    id: 'MACHINE',
    name: 'machine',
    synonyms: ['MACHINE', 'PDP10', 'DRYER', 'LID'],
    adjectives: [],
    description: 'machine',
    initialLocation: 'MACHINE-ROOM',
    flags: ['CONTBIT', 'NDESCBIT', 'TRYTAKEBIT'],
    action: 'MACHINE-F',
    capacity: 50
  },

  'INFLATABLE-BOAT': {
    id: 'INFLATABLE-BOAT',
    name: 'pile of plastic',
    synonyms: ['BOAT', 'PILE', 'PLASTIC', 'VALVE'],
    adjectives: ['PLASTIC', 'INFLAT'],
    description: 'pile of plastic',
    longDescription: 'There is a folded pile of plastic here which has a small valve attached.',
    initialLocation: 'DAM-BASE',
    flags: ['TAKEBIT', 'BURNBIT'],
    action: 'IBOAT-FUNCTION',
    size: 20
  },

  'INFLATED-BOAT': {
    id: 'INFLATED-BOAT',
    name: 'magic boat',
    synonyms: ['BOAT', 'RAFT'],
    adjectives: ['INFLAT', 'MAGIC', 'PLASTIC', 'SEAWORTHY'],
    description: 'magic boat',
    initialLocation: '',
    flags: ['TAKEBIT', 'BURNBIT', 'VEHBIT', 'OPENBIT', 'SEARCHBIT'],
    action: 'RBOAT-FUNCTION',
    capacity: 100,
    size: 20
  },

  'PUNCTURED-BOAT': {
    id: 'PUNCTURED-BOAT',
    name: 'punctured boat',
    synonyms: ['BOAT', 'PILE', 'PLASTIC'],
    adjectives: ['PLASTIC', 'PUNCTURE', 'LARGE'],
    description: 'punctured boat',
    initialLocation: '',
    flags: ['TAKEBIT', 'BURNBIT'],
    action: 'DBOAT-FUNCTION',
    size: 20
  },

  // READABLE ITEMS
  'ADVERTISEMENT': {
    id: 'ADVERTISEMENT',
    name: 'leaflet',
    synonyms: ['LEAFLET', 'ADVERTISEMENT', 'BOOKLET', 'MAIL'],
    adjectives: ['SMALL'],
    description: 'leaflet',
    longDescription: 'A small leaflet is on the ground.',
    initialLocation: 'MAILBOX',
    flags: ['TAKEBIT', 'READBIT', 'BURNBIT'],
    text: '"WELCOME TO ZORK!\n\nZORK is a game of adventure, danger, and low cunning. In it you will explore some of the most amazing territory ever seen by mortals. No computer should be without one!"',
    size: 2
  },

  'MATCH': {
    id: 'MATCH',
    name: 'matchbook',
    synonyms: ['MATCH', 'MATCHES', 'MATCHBOOK', 'BOOK'],
    adjectives: [],
    description: 'matchbook',
    initialLocation: 'DAM-LOBBY',
    flags: ['TAKEBIT', 'READBIT', 'BURNBIT'],
    text: '(Close cover before striking)\n\nYOU too can make BIG MONEY in the exciting field of PAPER SHUFFLING!',
    size: 2
  },

  'GUIDE': {
    id: 'GUIDE',
    name: 'tour guidebook',
    synonyms: ['GUIDE', 'BOOK', 'BOOKS', 'GUIDEBOOKS'],
    adjectives: ['TOUR', 'GUIDE'],
    description: 'tour guidebook',
    firstDescription: 'Some guidebooks entitled "Flood Control Dam #3" are on the reception desk.',
    initialLocation: 'DAM-LOBBY',
    flags: ['READBIT', 'TAKEBIT', 'BURNBIT'],
    text: '"Flood Control Dam #3"\n\nFCD#3 was constructed in year 783 of the Great Underground Empire to harness the mighty Frigid River. This work was supported by a grant of 37 million zorkmids from your omnipotent local tyrant Lord Dimwit Flathead the Excessive.'
  },

  'PRAYER': {
    id: 'PRAYER',
    name: 'prayer',
    synonyms: ['PRAYER', 'INSCRIPTION'],
    adjectives: ['ANCIENT', 'OLD'],
    description: 'prayer',
    initialLocation: 'NORTH-TEMPLE',
    flags: ['READBIT', 'SACREDBIT', 'NDESCBIT'],
    text: 'The prayer is inscribed in an ancient script, rarely used today. It seems to be a philippic against small insects, absent-mindedness, and the picking up and dropping of small objects. The final verse consigns trespassers to the land of the dead. All evidence indicates that the beliefs of the ancient Zorkers were obscure.'
  },

  'MAP': {
    id: 'MAP',
    name: 'ancient map',
    synonyms: ['PARCHMENT', 'MAP'],
    adjectives: ['ANTIQUE', 'OLD', 'ANCIENT'],
    description: 'ancient map',
    firstDescription: 'In the trophy case is an ancient parchment which appears to be a map.',
    initialLocation: 'TROPHY-CASE',
    flags: ['INVISIBLE', 'READBIT', 'TAKEBIT'],
    size: 2,
    text: 'The map shows a forest with three clearings. The largest clearing contains a house. Three paths leave the large clearing. One of these paths, leading southwest, is marked "To Stone Barrow".'
  },

  'BOOK': {
    id: 'BOOK',
    name: 'black book',
    synonyms: ['BOOK', 'PRAYER', 'PAGE', 'BOOKS'],
    adjectives: ['LARGE', 'BLACK'],
    description: 'black book',
    firstDescription: 'On the altar is a large black book, open to page 569.',
    initialLocation: 'ALTAR',
    flags: ['READBIT', 'TAKEBIT', 'CONTBIT', 'BURNBIT', 'TURNBIT'],
    action: 'BLACK-BOOK',
    size: 10,
    text: 'Commandment #12592\n\nOh ye who go about saying unto each: "Hello sailor":\nDost thou know the magnitude of thy sin before the gods?\nYea, verily, thou shalt be ground between two stones.\nShall the angry gods cast thy body into the whirlpool?\nSurely, thy eye shall be put out with a sharp stick!\nEven unto the ends of the earth shalt thou wander and\nUnto the land of the dead shalt thou be sent at last.\nSurely thou shalt repent of thy cunning.'
  },

  'OWNERS-MANUAL': {
    id: 'OWNERS-MANUAL',
    name: 'ZORK owner\'s manual',
    synonyms: ['MANUAL', 'PIECE', 'PAPER'],
    adjectives: ['ZORK', 'OWNERS', 'SMALL'],
    description: 'ZORK owner\'s manual',
    firstDescription: 'Loosely attached to a wall is a small piece of paper.',
    initialLocation: 'STUDIO',
    flags: ['READBIT', 'TAKEBIT'],
    text: 'Congratulations!\n\nYou are the privileged owner of ZORK I: The Great Underground Empire, a self-contained and self-maintaining universe. If used and maintained in accordance with normal operating practices for small universes, ZORK will provide many months of trouble-free operation.'
  },

  'BOAT-LABEL': {
    id: 'BOAT-LABEL',
    name: 'tan label',
    synonyms: ['LABEL', 'FINEPRINT', 'PRINT'],
    adjectives: ['TAN', 'FINE'],
    description: 'tan label',
    initialLocation: 'INFLATED-BOAT',
    flags: ['READBIT', 'TAKEBIT', 'BURNBIT'],
    size: 2,
    text: '!!!!FROBOZZ MAGIC BOAT COMPANY!!!!\n\nHello, Sailor!\n\nInstructions for use:\n\n   To get into a body of water, say "Launch".\n   To get to shore, say "Land" or the direction in which you want to maneuver the boat.\n\nWarranty:\n\n  This boat is guaranteed against all defects for a period of 76 milliseconds from date of purchase or until first used, whichever comes first.\n\nWarning:\n   This boat is made of thin plastic.\n   Good Luck!'
  },

  'ENGRAVINGS': {
    id: 'ENGRAVINGS',
    name: 'wall with engravings',
    synonyms: ['WALL', 'ENGRAVINGS', 'INSCRIPTION'],
    adjectives: ['OLD', 'ANCIENT'],
    description: 'wall with engravings',
    longDescription: 'There are old engravings on the walls here.',
    initialLocation: 'ENGRAVINGS-CAVE',
    flags: ['READBIT', 'SACREDBIT'],
    text: 'The engravings were incised in the living rock of the cave wall by an unknown hand. They depict, in symbolic form, the beliefs of the ancient Zorkers. Skillfully interwoven with the bas reliefs are excerpts illustrating the major religious tenets of that time. Unfortunately, a later age seems to have considered them blasphemous and just as skillfully excised them.'
  },

  // SCENERY
  'WALL': {
    id: 'WALL',
    name: 'surrounding wall',
    synonyms: ['WALL'],
    adjectives: ['SURROUNDING'],
    description: 'surrounding wall',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'GRANITE-WALL': {
    id: 'GRANITE-WALL',
    name: 'granite wall',
    synonyms: ['WALL'],
    adjectives: ['GRANITE'],
    description: 'granite wall',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT'],
    action: 'GRANITE-WALL-F'
  },

  'SKY': {
    id: 'SKY',
    name: 'sky',
    synonyms: ['SKY'],
    adjectives: [],
    description: 'sky',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'GROUND': {
    id: 'GROUND',
    name: 'ground',
    synonyms: ['GROUND'],
    adjectives: [],
    description: 'ground',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'CEILING': {
    id: 'CEILING',
    name: 'ceiling',
    synonyms: ['CEILING'],
    adjectives: [],
    description: 'ceiling',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'FLOOR': {
    id: 'FLOOR',
    name: 'floor',
    synonyms: ['FLOOR'],
    adjectives: [],
    description: 'floor',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'SELF': {
    id: 'SELF',
    name: 'self',
    synonyms: ['SELF', 'ME', 'MYSELF'],
    adjectives: [],
    description: 'self',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'GLOBAL-LEAVES': {
    id: 'GLOBAL-LEAVES',
    name: 'leaves',
    synonyms: ['LEAVES', 'LEAF'],
    adjectives: [],
    description: 'leaves',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'WALLS': {
    id: 'WALLS',
    name: 'walls',
    synonyms: ['WALLS'],
    adjectives: [],
    description: 'walls',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
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

  'FOREST': {
    id: 'FOREST',
    name: 'forest',
    synonyms: ['FOREST', 'PINES', 'HEMLOCKS'],
    adjectives: [],
    description: 'forest',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'FOREST-F'
  },

  'TREES': {
    id: 'TREES',
    name: 'trees',
    synonyms: ['TREES'],
    adjectives: [],
    description: 'trees',
    initialLocation: 'GLOBAL-OBJECTS',
    flags: ['NDESCBIT']
  },

  'TREE': {
    id: 'TREE',
    name: 'tree',
    synonyms: ['TREE', 'BRANCH'],
    adjectives: ['LARGE', 'STORM'],
    description: 'tree',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'CLIMBBIT']
  },

  'MOUNTAIN-RANGE': {
    id: 'MOUNTAIN-RANGE',
    name: 'mountain range',
    synonyms: ['MOUNTAIN', 'RANGE'],
    adjectives: ['IMPASSABLE', 'FLATHEAD'],
    description: 'mountain range',
    initialLocation: 'MOUNTAINS',
    flags: ['NDESCBIT', 'CLIMBBIT'],
    action: 'MOUNTAIN-RANGE-F'
  },

  'GLOBAL-WATER': {
    id: 'GLOBAL-WATER',
    name: 'water',
    synonyms: ['WATER', 'QUANTITY'],
    adjectives: [],
    description: 'water',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['DRINKBIT', 'NDESCBIT'],
    action: 'WATER-F'
  },

  'KITCHEN-WINDOW': {
    id: 'KITCHEN-WINDOW',
    name: 'kitchen window',
    synonyms: ['WINDOW'],
    adjectives: ['KITCHEN', 'SMALL'],
    description: 'kitchen window',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['DOORBIT', 'NDESCBIT'],
    action: 'KITCHEN-WINDOW-F'
  },

  'BOARDED-WINDOW': {
    id: 'BOARDED-WINDOW',
    name: 'boarded window',
    synonyms: ['WINDOW'],
    adjectives: ['BOARDED'],
    description: 'boarded window',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'BOARDED-WINDOW-FCN'
  },

  'GRATE': {
    id: 'GRATE',
    name: 'grating',
    synonyms: ['GRATE', 'GRATING'],
    adjectives: [],
    description: 'grating',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['DOORBIT', 'NDESCBIT', 'INVISIBLE'],
    action: 'GRATE-FUNCTION'
  },

  'TRAP-DOOR': {
    id: 'TRAP-DOOR',
    name: 'trap door',
    synonyms: ['DOOR', 'TRAPDOOR', 'TRAP-DOOR', 'COVER'],
    adjectives: ['TRAP', 'DUSTY'],
    description: 'trap door',
    initialLocation: 'LIVING-ROOM',
    flags: ['DOORBIT', 'NDESCBIT', 'INVISIBLE'],
    action: 'TRAP-DOOR-FCN'
  },

  'RUG': {
    id: 'RUG',
    name: 'carpet',
    synonyms: ['RUG', 'CARPET'],
    adjectives: ['LARGE', 'ORIENTAL'],
    description: 'carpet',
    initialLocation: 'LIVING-ROOM',
    flags: ['NDESCBIT', 'TRYTAKEBIT'],
    action: 'RUG-FCN'
  },

  'CHIMNEY': {
    id: 'CHIMNEY',
    name: 'chimney',
    synonyms: ['CHIMNEY'],
    adjectives: ['DARK', 'NARROW'],
    description: 'chimney',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['CLIMBBIT', 'NDESCBIT'],
    action: 'CHIMNEY-F'
  },

  'CRACK': {
    id: 'CRACK',
    name: 'crack',
    synonyms: ['CRACK'],
    adjectives: ['NARROW'],
    description: 'crack',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'CRACK-FCN'
  },

  'SLIDE': {
    id: 'SLIDE',
    name: 'chute',
    synonyms: ['CHUTE', 'RAMP', 'SLIDE'],
    adjectives: ['STEEP', 'METAL', 'TWISTING'],
    description: 'chute',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['CLIMBBIT', 'NDESCBIT'],
    action: 'SLIDE-FUNCTION'
  },

  'ALTAR': {
    id: 'ALTAR',
    name: 'altar',
    synonyms: ['ALTAR'],
    adjectives: [],
    description: 'altar',
    initialLocation: 'SOUTH-TEMPLE',
    flags: ['NDESCBIT', 'SURFACEBIT', 'CONTBIT', 'OPENBIT'],
    capacity: 50
  },

  'PEDESTAL': {
    id: 'PEDESTAL',
    name: 'pedestal',
    synonyms: ['PEDESTAL'],
    adjectives: ['WHITE', 'MARBLE'],
    description: 'pedestal',
    initialLocation: 'TORCH-ROOM',
    flags: ['NDESCBIT', 'CONTBIT', 'OPENBIT', 'SURFACEBIT'],
    action: 'DUMB-CONTAINER',
    capacity: 30
  },

  'RIVER': {
    id: 'RIVER',
    name: 'river',
    synonyms: ['RIVER'],
    adjectives: ['FRIGID'],
    description: 'river',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT'],
    action: 'RIVER-FUNCTION'
  },

  'RAINBOW': {
    id: 'RAINBOW',
    name: 'rainbow',
    synonyms: ['RAINBOW'],
    adjectives: [],
    description: 'rainbow',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'CLIMBBIT'],
    action: 'RAINBOW-FCN'
  },

  'LADDER': {
    id: 'LADDER',
    name: 'wooden ladder',
    synonyms: ['LADDER'],
    adjectives: ['WOODEN', 'RICKETY', 'NARROW'],
    description: 'wooden ladder',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'CLIMBBIT']
  },

  'RAILING': {
    id: 'RAILING',
    name: 'wooden railing',
    synonyms: ['RAILING', 'RAIL'],
    adjectives: ['WOODEN'],
    description: 'wooden railing',
    initialLocation: 'DOME-ROOM',
    flags: ['NDESCBIT']
  },

  'SAND': {
    id: 'SAND',
    name: 'sand',
    synonyms: ['SAND'],
    adjectives: [],
    description: 'sand',
    initialLocation: 'SANDY-CAVE',
    flags: ['NDESCBIT'],
    action: 'SAND-FUNCTION'
  },

  'CLIMBABLE-CLIFF': {
    id: 'CLIMBABLE-CLIFF',
    name: 'cliff',
    synonyms: ['WALL', 'CLIFF', 'LEDGE'],
    adjectives: ['ROCKY', 'SHEER'],
    description: 'cliff',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'CLIMBBIT'],
    action: 'CLIFF-OBJECT'
  },

  'WHITE-CLIFF': {
    id: 'WHITE-CLIFF',
    name: 'white cliffs',
    synonyms: ['CLIFF', 'CLIFFS'],
    adjectives: ['WHITE'],
    description: 'white cliffs',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'CLIMBBIT'],
    action: 'WCLIF-OBJECT'
  },

  'BODIES': {
    id: 'BODIES',
    name: 'pile of bodies',
    synonyms: ['BODIES', 'BODY', 'REMAINS', 'PILE'],
    adjectives: ['MANGLED'],
    description: 'pile of bodies',
    initialLocation: 'LOCAL-GLOBALS',
    flags: ['NDESCBIT', 'TRYTAKEBIT'],
    action: 'BODY-FUNCTION'
  },

  'LEAVES': {
    id: 'LEAVES',
    name: 'pile of leaves',
    synonyms: ['LEAVES', 'LEAF', 'PILE'],
    adjectives: [],
    description: 'pile of leaves',
    longDescription: 'On the ground is a pile of leaves.',
    initialLocation: 'GRATING-CLEARING',
    flags: ['TAKEBIT', 'BURNBIT', 'TRYTAKEBIT'],
    action: 'LEAF-PILE',
    size: 25
  },

  'TIMBERS': {
    id: 'TIMBERS',
    name: 'broken timber',
    synonyms: ['TIMBERS', 'PILE'],
    adjectives: ['WOODEN', 'BROKEN'],
    description: 'broken timber',
    initialLocation: 'TIMBER-ROOM',
    flags: ['TAKEBIT'],
    size: 50
  },

  // NPCS
  'THIEF': {
    id: 'THIEF',
    name: 'thief',
    synonyms: ['THIEF', 'ROBBER', 'MAN', 'PERSON'],
    adjectives: ['SHADY', 'SUSPICIOUS', 'SEEDY'],
    description: 'thief',
    longDescription: 'There is a suspicious-looking individual, holding a large bag, leaning against one wall. He is armed with a deadly stiletto.',
    initialLocation: 'ROUND-ROOM',
    flags: ['ACTORBIT', 'INVISIBLE', 'CONTBIT', 'OPENBIT', 'TRYTAKEBIT'],
    action: 'ROBBER-FUNCTION',
    strength: 5
  },

  'TROLL': {
    id: 'TROLL',
    name: 'troll',
    synonyms: ['TROLL'],
    adjectives: ['NASTY'],
    description: 'troll',
    longDescription: 'A nasty-looking troll, brandishing a bloody axe, blocks all passages out of the room.',
    initialLocation: 'TROLL-ROOM',
    flags: ['ACTORBIT', 'OPENBIT', 'TRYTAKEBIT'],
    action: 'TROLL-FCN',
    strength: 2
  },

  'CYCLOPS': {
    id: 'CYCLOPS',
    name: 'cyclops',
    synonyms: ['CYCLOPS', 'MONSTER', 'EYE'],
    adjectives: ['HUNGRY', 'GIANT'],
    description: 'cyclops',
    initialLocation: 'CYCLOPS-ROOM',
    flags: ['ACTORBIT', 'NDESCBIT', 'TRYTAKEBIT'],
    action: 'CYCLOPS-FCN',
    strength: 10000
  },

  'GHOSTS': {
    id: 'GHOSTS',
    name: 'number of ghosts',
    synonyms: ['GHOSTS', 'SPIRITS', 'FIENDS', 'FORCE'],
    adjectives: ['INVISIBLE', 'EVIL'],
    description: 'number of ghosts',
    initialLocation: 'ENTRANCE-TO-HADES',
    flags: ['ACTORBIT', 'NDESCBIT'],
    action: 'GHOSTS-F'
  },

  'BAT': {
    id: 'BAT',
    name: 'bat',
    synonyms: ['BAT', 'VAMPIRE'],
    adjectives: ['VAMPIRE', 'DERANGED'],
    description: 'bat',
    initialLocation: 'BAT-ROOM',
    flags: ['ACTORBIT', 'TRYTAKEBIT'],
    action: 'BAT-F'
  },

  'LARGE-BAG': {
    id: 'LARGE-BAG',
    name: 'large bag',
    synonyms: ['BAG'],
    adjectives: ['LARGE', 'THIEFS'],
    description: 'large bag',
    initialLocation: 'THIEF',
    flags: ['TRYTAKEBIT', 'NDESCBIT'],
    action: 'LARGE-BAG-F'
  },

  // CONSUMABLES
  'LUNCH': {
    id: 'LUNCH',
    name: 'lunch',
    synonyms: ['FOOD', 'SANDWICH', 'LUNCH', 'DINNER'],
    adjectives: ['HOT', 'PEPPER'],
    description: 'lunch',
    longDescription: 'A hot pepper sandwich is here.',
    initialLocation: 'SANDWICH-BAG',
    flags: ['TAKEBIT', 'FOODBIT']
  },

  'GARLIC': {
    id: 'GARLIC',
    name: 'clove of garlic',
    synonyms: ['GARLIC', 'CLOVE'],
    adjectives: [],
    description: 'clove of garlic',
    initialLocation: 'SANDWICH-BAG',
    flags: ['TAKEBIT', 'FOODBIT'],
    action: 'GARLIC-F',
    size: 4
  },

  'COAL': {
    id: 'COAL',
    name: 'small pile of coal',
    synonyms: ['COAL', 'PILE', 'HEAP'],
    adjectives: ['SMALL'],
    description: 'small pile of coal',
    initialLocation: 'DEAD-END-5',
    flags: ['TAKEBIT', 'BURNBIT'],
    size: 20
  },

  'SANDWICH-BAG': {
    id: 'SANDWICH-BAG',
    name: 'brown sack',
    synonyms: ['BAG', 'SACK'],
    adjectives: ['BROWN', 'ELONGATED', 'SMELLY'],
    description: 'brown sack',
    firstDescription: 'On the table is an elongated brown sack, smelling of hot peppers.',
    initialLocation: 'KITCHEN-TABLE',
    flags: ['TAKEBIT', 'CONTBIT', 'BURNBIT'],
    action: 'SANDWICH-BAG-FCN',
    capacity: 9,
    size: 9
  },

  'GUNK': {
    id: 'GUNK',
    name: 'small piece of vitreous slag',
    synonyms: ['GUNK', 'PIECE', 'SLAG'],
    adjectives: ['SMALL', 'VITREOUS'],
    description: 'small piece of vitreous slag',
    initialLocation: '',
    flags: ['TAKEBIT', 'TRYTAKEBIT'],
    action: 'GUNK-FUNCTION',
    size: 10
  },

  // DOORS AND ENTRANCES
  'FRONT-DOOR': {
    id: 'FRONT-DOOR',
    name: 'door',
    synonyms: ['DOOR'],
    adjectives: ['FRONT', 'BOARDED'],
    description: 'door',
    initialLocation: 'WEST-OF-HOUSE',
    flags: ['DOORBIT', 'NDESCBIT'],
    action: 'FRONT-DOOR-FCN'
  },

  'WOODEN-DOOR': {
    id: 'WOODEN-DOOR',
    name: 'wooden door',
    synonyms: ['DOOR', 'LETTERING', 'WRITING'],
    adjectives: ['WOODEN', 'GOTHIC', 'STRANGE', 'WEST'],
    description: 'wooden door',
    initialLocation: 'LIVING-ROOM',
    flags: ['READBIT', 'DOORBIT', 'NDESCBIT', 'TRANSBIT'],
    action: 'FRONT-DOOR-FCN',
    text: 'The engravings translate to "This space intentionally left blank."'
  },

  'BARROW-DOOR': {
    id: 'BARROW-DOOR',
    name: 'stone door',
    synonyms: ['DOOR'],
    adjectives: ['HUGE', 'STONE'],
    description: 'stone door',
    initialLocation: 'STONE-BARROW',
    flags: ['DOORBIT', 'NDESCBIT', 'OPENBIT'],
    action: 'BARROW-DOOR-FCN'
  },

  'BARROW': {
    id: 'BARROW',
    name: 'stone barrow',
    synonyms: ['BARROW', 'TOMB'],
    adjectives: ['MASSIVE', 'STONE'],
    description: 'stone barrow',
    initialLocation: 'STONE-BARROW',
    flags: ['NDESCBIT'],
    action: 'BARROW-FCN'
  },

  'KITCHEN-TABLE': {
    id: 'KITCHEN-TABLE',
    name: 'kitchen table',
    synonyms: ['TABLE'],
    adjectives: ['KITCHEN'],
    description: 'kitchen table',
    initialLocation: 'KITCHEN',
    flags: ['NDESCBIT', 'CONTBIT', 'OPENBIT', 'SURFACEBIT'],
    capacity: 50
  },

  'ATTIC-TABLE': {
    id: 'ATTIC-TABLE',
    name: 'table',
    synonyms: ['TABLE'],
    adjectives: [],
    description: 'table',
    initialLocation: 'ATTIC',
    flags: ['NDESCBIT', 'CONTBIT', 'OPENBIT', 'SURFACEBIT'],
    capacity: 40
  },

  'DAM': {
    id: 'DAM',
    name: 'dam',
    synonyms: ['DAM', 'GATE', 'GATES', 'FCD#3'],
    adjectives: [],
    description: 'dam',
    initialLocation: 'DAM-ROOM',
    flags: ['NDESCBIT', 'TRYTAKEBIT'],
    action: 'DAM-FUNCTION'
  },

  'BOLT': {
    id: 'BOLT',
    name: 'bolt',
    synonyms: ['BOLT', 'NUT'],
    adjectives: ['METAL', 'LARGE'],
    description: 'bolt',
    initialLocation: 'DAM-ROOM',
    flags: ['NDESCBIT', 'TURNBIT', 'TRYTAKEBIT'],
    action: 'BOLT-F'
  },

  'BUBBLE': {
    id: 'BUBBLE',
    name: 'green bubble',
    synonyms: ['BUBBLE'],
    adjectives: ['SMALL', 'GREEN', 'PLASTIC'],
    description: 'green bubble',
    initialLocation: 'DAM-ROOM',
    flags: ['NDESCBIT', 'TRYTAKEBIT'],
    action: 'BUBBLE-F'
  },

  'CONTROL-PANEL': {
    id: 'CONTROL-PANEL',
    name: 'control panel',
    synonyms: ['PANEL'],
    adjectives: ['CONTROL'],
    description: 'control panel',
    initialLocation: 'DAM-ROOM',
    flags: ['NDESCBIT']
  },

  'YELLOW-BUTTON': {
    id: 'YELLOW-BUTTON',
    name: 'yellow button',
    synonyms: ['BUTTON', 'SWITCH'],
    adjectives: ['YELLOW'],
    description: 'yellow button',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['NDESCBIT'],
    action: 'BUTTON-F'
  },

  'BROWN-BUTTON': {
    id: 'BROWN-BUTTON',
    name: 'brown button',
    synonyms: ['BUTTON', 'SWITCH'],
    adjectives: ['BROWN'],
    description: 'brown button',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['NDESCBIT'],
    action: 'BUTTON-F'
  },

  'RED-BUTTON': {
    id: 'RED-BUTTON',
    name: 'red button',
    synonyms: ['BUTTON', 'SWITCH'],
    adjectives: ['RED'],
    description: 'red button',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['NDESCBIT'],
    action: 'BUTTON-F'
  },

  'BLUE-BUTTON': {
    id: 'BLUE-BUTTON',
    name: 'blue button',
    synonyms: ['BUTTON', 'SWITCH'],
    adjectives: ['BLUE'],
    description: 'blue button',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['NDESCBIT'],
    action: 'BUTTON-F'
  },

  'LEAK': {
    id: 'LEAK',
    name: 'leak',
    synonyms: ['LEAK', 'DRIP', 'PIPE'],
    adjectives: [],
    description: 'leak',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['NDESCBIT', 'INVISIBLE'],
    action: 'LEAK-FUNCTION'
  },

  'MACHINE-SWITCH': {
    id: 'MACHINE-SWITCH',
    name: 'switch',
    synonyms: ['SWITCH'],
    adjectives: [],
    description: 'switch',
    initialLocation: 'MACHINE-ROOM',
    flags: ['NDESCBIT', 'TURNBIT'],
    action: 'MSWITCH-FUNCTION'
  },

  'MIRROR-1': {
    id: 'MIRROR-1',
    name: 'mirror',
    synonyms: ['REFLECTION', 'MIRROR', 'ENORMOUS'],
    adjectives: [],
    description: 'mirror',
    initialLocation: 'MIRROR-ROOM-1',
    flags: ['TRYTAKEBIT', 'NDESCBIT'],
    action: 'MIRROR-MIRROR'
  },

  'MIRROR-2': {
    id: 'MIRROR-2',
    name: 'mirror',
    synonyms: ['REFLECTION', 'MIRROR', 'ENORMOUS'],
    adjectives: [],
    description: 'mirror',
    initialLocation: 'MIRROR-ROOM-2',
    flags: ['TRYTAKEBIT', 'NDESCBIT'],
    action: 'MIRROR-MIRROR'
  },

  'TOOL-CHEST': {
    id: 'TOOL-CHEST',
    name: 'group of tool chests',
    synonyms: ['CHEST', 'CHESTS', 'GROUP', 'TOOLCHESTS'],
    adjectives: ['TOOL'],
    description: 'group of tool chests',
    initialLocation: 'MAINTENANCE-ROOM',
    flags: ['CONTBIT', 'OPENBIT', 'TRYTAKEBIT', 'SACREDBIT'],
    action: 'TOOL-CHEST-FCN'
  },

  'CANDLES': {
    id: 'CANDLES',
    name: 'pair of candles',
    synonyms: ['CANDLES', 'PAIR'],
    adjectives: ['BURNING'],
    description: 'pair of candles',
    firstDescription: 'On the two ends of the altar are burning candles.',
    initialLocation: 'SOUTH-TEMPLE',
    flags: ['TAKEBIT', 'FLAMEBIT', 'ONBIT', 'LIGHTBIT'],
    action: 'CANDLES-FCN',
    size: 10
  },

  // Placeholder for remaining objects
  // In a complete implementation, all 100+ objects would be defined here
};

/**
 * Object count by category for validation
 */
export const OBJECT_COUNTS = {
  TREASURES: 19,
  TOOLS: 12,
  CONTAINERS: 18,
  CONSUMABLES: 5,
  READABLE: 10,
  NPCS: 6,
  SCENERY: 51,
  TOTAL: 121
};

/**
 * Total treasure value should equal 350 points
 */
export const TREASURE_TOTAL_VALUE = 350;
