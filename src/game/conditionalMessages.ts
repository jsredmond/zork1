/**
 * Conditional Message System
 * Handles messages that vary based on game state, flags, or conditions
 */

import { GameState } from './state.js';
import { GameObject } from './objects.js';
import { Room } from './rooms.js';
import { ObjectFlag } from './data/flags.js';

/**
 * Condition function that evaluates game state
 */
export type MessageCondition = (state: GameState) => boolean;

/**
 * Message variant with condition
 */
export interface MessageVariant {
  condition: MessageCondition;
  message: string;
}

/**
 * Conditional message definition
 */
export interface ConditionalMessage {
  messageId: string;
  variants: MessageVariant[];
  defaultMessage: string;
}

/**
 * Registry of all conditional messages
 */
const conditionalMessages = new Map<string, ConditionalMessage>();

/**
 * Register a conditional message
 */
export function registerConditionalMessage(message: ConditionalMessage): void {
  conditionalMessages.set(message.messageId, message);
}

/**
 * Get the appropriate message variant based on game state
 */
export function getConditionalMessage(
  messageId: string,
  state: GameState
): string {
  const message = conditionalMessages.get(messageId);
  
  if (!message) {
    return `[Missing conditional message: ${messageId}]`;
  }
  
  // Find first matching variant
  for (const variant of message.variants) {
    if (variant.condition(state)) {
      return variant.message;
    }
  }
  
  // Return default if no variant matches
  return message.defaultMessage;
}

/**
 * Get conditional room description
 */
export function getConditionalRoomDescription(
  roomId: string,
  state: GameState
): string | null {
  const messageId = `ROOM-DESC-${roomId}`;
  
  if (!conditionalMessages.has(messageId)) {
    return null;
  }
  
  return getConditionalMessage(messageId, state);
}

/**
 * Get conditional object description
 */
export function getConditionalObjectDescription(
  objectId: string,
  state: GameState
): string | null {
  const messageId = `OBJECT-DESC-${objectId}`;
  
  if (!conditionalMessages.has(messageId)) {
    return null;
  }
  
  return getConditionalMessage(messageId, state);
}

/**
 * Check if a conditional message exists
 */
export function hasConditionalMessage(messageId: string): boolean {
  return conditionalMessages.has(messageId);
}

/**
 * Clear all registered conditional messages (for testing)
 */
export function clearConditionalMessages(): void {
  conditionalMessages.clear();
}

/**
 * Get all registered message IDs (for testing/debugging)
 */
export function getRegisteredMessageIds(): string[] {
  return Array.from(conditionalMessages.keys());
}

/**
 * Initialize all conditional messages
 * This should be called during game initialization
 */
export function initializeConditionalMessages(): void {
  // WEST-OF-HOUSE conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-WEST-OF-HOUSE',
    variants: [
      {
        condition: (state) => state.getFlag('WON_FLAG'),
        message: 'You are standing in an open field west of a white house, with a boarded front door. A secret path leads southwest into the forest.'
      }
    ],
    defaultMessage: 'You are standing in an open field west of a white house, with a boarded front door.'
  });

  // KITCHEN conditional description (window state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-KITCHEN',
    variants: [
      {
        condition: (state) => {
          const window = state.getObject('KITCHEN-WINDOW');
          return window?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is open.'
      }
    ],
    defaultMessage: 'You are in the kitchen of the white house. A table seems to have been used recently for the preparation of food. A passage leads to the west and a dark staircase can be seen leading upward. A dark chimney leads down and to the east is a small window which is slightly ajar.'
  });

  // CLEARING conditional description (grate state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-CLEARING',
    variants: [
      {
        condition: (state) => {
          const grate = state.getObject('GRATE');
          const grateRevealed = state.getGlobalVariable('GRATE_REVEALED') || false;
          return grate?.hasFlag(ObjectFlag.OPENBIT) && grateRevealed;
        },
        message: 'You are in a clearing, with a forest surrounding you on all sides. A path leads south.\nThere is an open grating, descending into darkness.'
      },
      {
        condition: (state) => {
          const grateRevealed = state.getGlobalVariable('GRATE_REVEALED') || false;
          return grateRevealed;
        },
        message: 'You are in a clearing, with a forest surrounding you on all sides. A path leads south.\nThere is a grating securely fastened into the ground.'
      }
    ],
    defaultMessage: 'You are in a clearing, with a forest surrounding you on all sides. A path leads south.'
  });

  // GRATING-ROOM (MAZE-11) conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-GRATING-ROOM',
    variants: [
      {
        condition: (state) => {
          const grate = state.getObject('GRATE');
          return grate?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'You are in a small room near the maze. There are twisty passages in the immediate vicinity.\nAbove you is an open grating with sunlight pouring in.'
      }
    ],
    defaultMessage: 'You are in a small room near the maze. There are twisty passages in the immediate vicinity.'
  });

  // STONE-BARROW conditional description (door state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-STONE-BARROW',
    variants: [
      {
        condition: (state) => {
          const door = state.getObject('BARROW-DOOR');
          return door?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'You are standing in front of a massive barrow of stone. In the east face is a huge stone door which is open.'
      }
    ],
    defaultMessage: 'You are standing in front of a massive barrow of stone. In the east face is a huge stone door which is closed.'
  });

  // INSIDE-BARROW conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-INSIDE-BARROW',
    variants: [
      {
        condition: (state) => {
          const door = state.getObject('BARROW-DOOR');
          return door?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'You are inside an ancient barrow hidden deep within a dark forest. The barrow opens into a narrow tunnel at its southern end. You can see a faint glow at the far end. A stone door in the west wall is open.'
      }
    ],
    defaultMessage: 'You are inside an ancient barrow hidden deep within a dark forest. The barrow opens into a narrow tunnel at its southern end. You can see a faint glow at the far end. A stone door in the west wall is closed.'
  });

  // DAM conditional description (dam state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-DAM',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen;
        },
        message: 'You are standing on the top of the Flood Control Dam #3, which was quite a tourist attraction in times far distant. There are paths to the north, south, and west, and a scramble down. The sluice gates are open and water is pouring through the dam.'
      }
    ],
    defaultMessage: 'You are standing on the top of the Flood Control Dam #3, which was quite a tourist attraction in times far distant. There are paths to the north, south, and west, and a scramble down. The sluice gates are closed.'
  });

  // RESERVOIR conditional description (water level)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-RESERVOIR',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen;
        },
        message: 'You are in what appears to have been a large reservoir, but which is now merely a large mud pile. There are "shores" to the north and south.'
      }
    ],
    defaultMessage: 'You are in a large reservoir. The water is very deep here. There are "shores" to the north and south.'
  });

  // RESERVOIR-NORTH conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-RESERVOIR-NORTH',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen;
        },
        message: 'You are on the north shore of the reservoir. The water level is very low here. To the north is a large metal gate.'
      }
    ],
    defaultMessage: 'You are on the north shore of the reservoir. The water level is high here. To the north is a large metal gate.'
  });

  // RESERVOIR-SOUTH conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-RESERVOIR-SOUTH',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen;
        },
        message: 'You are on the south shore of the reservoir. The water level is very low here. There is a path to the south.'
      }
    ],
    defaultMessage: 'You are on the south shore of the reservoir. The water level is high here. There is a path to the south.'
  });

  // CYCLOPS-ROOM conditional description (magic flag)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-CYCLOPS-ROOM',
    variants: [
      {
        condition: (state) => state.getFlag('MAGIC_FLAG'),
        message: 'This is a large room with a ceiling which cannot be detected from the ground. There is a narrow passage from east to west and a stone stairway leading upward. The east wall, previously solid, now has a cyclops-sized opening in it.'
      }
    ],
    defaultMessage: 'This is a large room with a ceiling which cannot be detected from the ground. There is a narrow passage from east to west and a stone stairway leading upward. The east wall is solid rock.'
  });

  // TREASURE-ROOM conditional description (cyclops state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-TREASURE-ROOM',
    variants: [
      {
        condition: (state) => {
          const cyclopsAlive = state.getGlobalVariable('CYCLOPS_ALIVE') !== false;
          return cyclopsAlive;
        },
        message: 'This is a large room, whose north wall is solid rock. A cyclops, who looks prepared to eat horses (much less mere adventurers), blocks the entrance on the south.'
      }
    ],
    defaultMessage: 'This is a large room, whose north wall is solid rock. To the south is a narrow passage.'
  });

  // MIRROR-ROOM-1 conditional description (mirror state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-MIRROR-ROOM-1',
    variants: [
      {
        condition: (state) => {
          const mirrorBroken = state.getGlobalVariable('MIRROR_BROKEN') || false;
          return mirrorBroken;
        },
        message: 'You are in a large square room with tall ceilings. On the south wall is an enormous mirror which is now cracked from top to bottom. There are exits on the other three sides of the room.'
      }
    ],
    defaultMessage: 'You are in a large square room with tall ceilings. On the south wall is an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.'
  });

  // MIRROR-ROOM-2 conditional description
  registerConditionalMessage({
    messageId: 'ROOM-DESC-MIRROR-ROOM-2',
    variants: [
      {
        condition: (state) => {
          const mirrorBroken = state.getGlobalVariable('MIRROR_BROKEN') || false;
          return mirrorBroken;
        },
        message: 'You are in a large square room with tall ceilings. On the north wall is an enormous mirror which is now cracked from top to bottom. There are exits on the other three sides of the room.'
      }
    ],
    defaultMessage: 'You are in a large square room with tall ceilings. On the north wall is an enormous mirror which fills the entire wall. There are exits on the other three sides of the room.'
  });

  // ENTRANCE-TO-HADES conditional description (spirits state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-ENTRANCE-TO-HADES',
    variants: [
      {
        condition: (state) => {
          const spiritsExorcised = state.getGlobalVariable('SPIRITS_EXORCISED') || false;
          return spiritsExorcised;
        },
        message: 'You are outside a large gateway, on which is inscribed "Abandon every hope all ye who enter here." The gate is open; through it you can see a desolation, with a pile of mangled bodies in one corner. Thousands of voices, lamenting some hideous fate, can be heard.'
      }
    ],
    defaultMessage: 'You are outside a large gateway, on which is inscribed "Abandon every hope all ye who enter here." The gate is closed and you cannot enter. The exit is to the north.'
  });

  // EAST-OF-HOUSE conditional description (window state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-EAST-OF-HOUSE',
    variants: [
      {
        condition: (state) => {
          const window = state.getObject('KITCHEN-WINDOW');
          return window?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is open.'
      }
    ],
    defaultMessage: 'You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is slightly ajar.'
  });

  // BAT conditional object description (garlic-dependent)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-BAT',
    variants: [
      {
        condition: (state) => {
          const garlic = state.getObject('GARLIC');
          if (!garlic) return false;
          const garlicLoc = garlic.location;
          return garlicLoc === 'PLAYER' || garlicLoc === state.currentRoom;
        },
        message: 'In the corner of the room on the ceiling is a large vampire bat who is obviously deranged and holding his nose.'
      }
    ],
    defaultMessage: 'A large vampire bat, hanging from the ceiling, swoops down at you!'
  });

  // GRATE conditional object description (state-dependent)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-GRATE',
    variants: [
      {
        condition: (state) => {
          const grate = state.getObject('GRATE');
          return grate?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'The grating is open.'
      }
    ],
    defaultMessage: 'The grating is closed.'
  });

  // TRAP-DOOR conditional object description
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-TRAP-DOOR',
    variants: [
      {
        condition: (state) => {
          const trapDoor = state.getObject('TRAP-DOOR');
          return trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'The trap door is open.'
      }
    ],
    defaultMessage: 'The trap door is closed.'
  });

  // BARROW-DOOR conditional object description
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-BARROW-DOOR',
    variants: [
      {
        condition: (state) => {
          const door = state.getObject('BARROW-DOOR');
          return door?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'The stone door is open.'
      }
    ],
    defaultMessage: 'The stone door is closed.'
  });

  // BOLT conditional object description (dam state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-BOLT',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen;
        },
        message: 'The bolt is turned to the left and the sluice gates are open.'
      }
    ],
    defaultMessage: 'The bolt is turned to the right and the sluice gates are closed.'
  });

  // MIRROR conditional object description (broken state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-MIRROR',
    variants: [
      {
        condition: (state) => {
          const mirrorBroken = state.getGlobalVariable('MIRROR_BROKEN') || false;
          return mirrorBroken;
        },
        message: 'The mirror is cracked from top to bottom.'
      }
    ],
    defaultMessage: 'The mirror is intact and reflects the room.'
  });

  // CYCLOPS conditional object description (alive state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-CYCLOPS',
    variants: [
      {
        condition: (state) => {
          const cyclopsAlive = state.getGlobalVariable('CYCLOPS_ALIVE') !== false;
          return !cyclopsAlive;
        },
        message: 'The cyclops is dead.'
      }
    ],
    defaultMessage: 'A cyclops, who looks prepared to eat horses (much less mere adventurers), is standing in the room.'
  });

  // BASKET conditional object description (raised/lowered state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-BASKET',
    variants: [
      {
        condition: (state) => {
          const basketLowered = state.getGlobalVariable('BASKET_LOWERED') || false;
          return basketLowered;
        },
        message: 'At the end of the chain is a basket.'
      }
    ],
    defaultMessage: 'From the chain is suspended a basket.'
  });

  // ROPE conditional object description (tied state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-ROPE',
    variants: [
      {
        condition: (state) => {
          const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;
          return ropeTied;
        },
        message: 'The rope is tied to the railing.'
      }
    ],
    defaultMessage: 'There is a rope here.'
  });

  // CANDLES conditional object description (lit state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-CANDLES',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          return candles?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The candles are burning.'
      }
    ],
    defaultMessage: 'The candles are unlit.'
  });

  // TORCH conditional object description (lit state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-TORCH',
    variants: [
      {
        condition: (state) => {
          const torch = state.getObject('TORCH');
          return torch?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The torch is burning.'
      }
    ],
    defaultMessage: 'The torch is unlit.'
  });

  // MATCH conditional object description (lit state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-MATCH',
    variants: [
      {
        condition: (state) => {
          const match = state.getObject('MATCH');
          return match?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The match is burning.'
      }
    ],
    defaultMessage: 'There is a match here.'
  });

  // LAMP conditional object description (on/off state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-LAMP',
    variants: [
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          return lamp?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The brass lantern is on.'
      }
    ],
    defaultMessage: 'The brass lantern is off.'
  });

  // BOTTLE conditional object description (open/closed state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-BOTTLE',
    variants: [
      {
        condition: (state) => {
          const bottle = state.getObject('BOTTLE');
          return bottle?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'The glass bottle is open.'
      }
    ],
    defaultMessage: 'The glass bottle is closed.'
  });

  // COFFIN conditional object description (open/closed state)
  registerConditionalMessage({
    messageId: 'OBJECT-DESC-COFFIN',
    variants: [
      {
        condition: (state) => {
          const coffin = state.getObject('COFFIN');
          return coffin?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'The gold coffin is open.'
      }
    ],
    defaultMessage: 'The gold coffin is closed.'
  });

  // LIVING-ROOM conditional description (complex multi-state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-LIVING-ROOM',
    variants: [
      {
        // Magic flag set, rug moved, trap door open
        condition: (state) => {
          const magicFlag = state.getFlag('MAGIC_FLAG');
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return magicFlag && rugMoved && trapDoorOpen;
        },
        message: 'You are in the living room. There is a doorway to the east. To the west is a cyclops-shaped opening in an old wooden door, above which is some strange gothic lettering, a trophy case, and a rug lying beside an open trap door.'
      },
      {
        // Magic flag set, rug moved, trap door closed
        condition: (state) => {
          const magicFlag = state.getFlag('MAGIC_FLAG');
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return magicFlag && rugMoved && !trapDoorOpen;
        },
        message: 'You are in the living room. There is a doorway to the east. To the west is a cyclops-shaped opening in an old wooden door, above which is some strange gothic lettering, a trophy case, and a closed trap door at your feet.'
      },
      {
        // Magic flag set, rug not moved, trap door open
        condition: (state) => {
          const magicFlag = state.getFlag('MAGIC_FLAG');
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return magicFlag && !rugMoved && trapDoorOpen;
        },
        message: 'You are in the living room. There is a doorway to the east. To the west is a cyclops-shaped opening in an old wooden door, above which is some strange gothic lettering, a trophy case, and an open trap door at your feet.'
      },
      {
        // Magic flag set, rug not moved, trap door closed
        condition: (state) => {
          const magicFlag = state.getFlag('MAGIC_FLAG');
          return magicFlag;
        },
        message: 'You are in the living room. There is a doorway to the east. To the west is a cyclops-shaped opening in an old wooden door, above which is some strange gothic lettering, a trophy case, and a large oriental rug in the center of the room.'
      },
      {
        // No magic flag, rug moved, trap door open
        condition: (state) => {
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return rugMoved && trapDoorOpen;
        },
        message: 'You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a rug lying beside an open trap door.'
      },
      {
        // No magic flag, rug moved, trap door closed
        condition: (state) => {
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          return rugMoved;
        },
        message: 'You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a closed trap door at your feet.'
      },
      {
        // No magic flag, rug not moved, trap door open
        condition: (state) => {
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return trapDoorOpen;
        },
        message: 'You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and an open trap door at your feet.'
      }
    ],
    defaultMessage: 'You are in the living room. There is a doorway to the east, a wooden door with strange gothic lettering to the west, which appears to be nailed shut, a trophy case, and a large oriental rug in the center of the room.'
  });

  // TIME-DEPENDENT MESSAGES
  
  // Lamp dimming stage messages (based on remaining lifetime)
  registerConditionalMessage({
    messageId: 'TIME-LAMP-DIMMING-100',
    variants: [],
    defaultMessage: 'The lamp appears a bit dimmer.'
  });

  registerConditionalMessage({
    messageId: 'TIME-LAMP-DIMMING-70',
    variants: [],
    defaultMessage: 'The lamp is definitely dimmer now.'
  });

  registerConditionalMessage({
    messageId: 'TIME-LAMP-DIMMING-15',
    variants: [],
    defaultMessage: 'The lamp is nearly out.'
  });

  // Lamp burned-out messages
  registerConditionalMessage({
    messageId: 'LAMP-BURNED-OUT-LIGHT',
    variants: [],
    defaultMessage: "A burned-out lamp won't light."
  });

  registerConditionalMessage({
    messageId: 'LAMP-ALREADY-BURNED-OUT',
    variants: [],
    defaultMessage: 'The lamp has already burned out.'
  });

  registerConditionalMessage({
    messageId: 'LAMP-EXAMINE-BURNED-OUT',
    variants: [],
    defaultMessage: 'The lamp has burned out.'
  });

  // Candle burning stage messages (based on remaining lifetime)
  registerConditionalMessage({
    messageId: 'TIME-CANDLES-SHORTER-20',
    variants: [],
    defaultMessage: 'The candles grow shorter.'
  });

  registerConditionalMessage({
    messageId: 'TIME-CANDLES-SHORT-10',
    variants: [],
    defaultMessage: 'The candles are becoming quite short.'
  });

  registerConditionalMessage({
    messageId: 'TIME-CANDLES-WONT-LAST-5',
    variants: [],
    defaultMessage: "The candles won't last long now."
  });

  // Candle burned-out message
  registerConditionalMessage({
    messageId: 'CANDLES-BURNED-OUT',
    variants: [],
    defaultMessage: "Alas, there's not much left of the candles. Certainly not enough to\nburn."
  });

  // Match messages
  registerConditionalMessage({
    messageId: 'MATCH-OUT-OF-MATCHES',
    variants: [],
    defaultMessage: "I'm afraid that you have run out of matches."
  });

  registerConditionalMessage({
    messageId: 'MATCH-DRAFTY-ROOM',
    variants: [],
    defaultMessage: 'This room is drafty, and the match goes out instantly.'
  });

  registerConditionalMessage({
    messageId: 'MATCH-STARTS-BURNING',
    variants: [],
    defaultMessage: 'One of the matches starts to burn.'
  });

  registerConditionalMessage({
    messageId: 'MATCH-IS-OUT',
    variants: [],
    defaultMessage: 'The match is out.'
  });

  registerConditionalMessage({
    messageId: 'MATCH-HAS-GONE-OUT',
    variants: [],
    defaultMessage: 'The match has gone out.'
  });

  registerConditionalMessage({
    messageId: 'MATCH-IS-BURNING',
    variants: [],
    defaultMessage: 'The match is burning.'
  });

  // MULTI-CONDITION MESSAGES

  // Lamp examine with multiple states
  registerConditionalMessage({
    messageId: 'LAMP-EXAMINE-STATE',
    variants: [
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          return lamp?.hasFlag(ObjectFlag.RMUNGBIT) || false;
        },
        message: 'The lamp has burned out.'
      },
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          return lamp?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The lamp is on.'
      }
    ],
    defaultMessage: 'The lamp is turned off.'
  });

  // Candles examine with multiple states
  registerConditionalMessage({
    messageId: 'CANDLES-EXAMINE-STATE',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          return candles?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: 'The candles are burning.'
      }
    ],
    defaultMessage: 'The candles are out.'
  });

  // Candles already lit message
  registerConditionalMessage({
    messageId: 'CANDLES-ALREADY-LIT',
    variants: [],
    defaultMessage: 'The candles are already lit.'
  });

  // Candles lit successfully
  registerConditionalMessage({
    messageId: 'CANDLES-LIT',
    variants: [],
    defaultMessage: 'The candles are lit.'
  });

  // Candles vaporized by torch
  registerConditionalMessage({
    messageId: 'CANDLES-VAPORIZED',
    variants: [],
    defaultMessage: 'The heat from the torch is so intense that the candles are vaporized.'
  });

  // Candles already lighted (torch attempt)
  registerConditionalMessage({
    messageId: 'CANDLES-ALREADY-LIGHTED-TORCH',
    variants: [],
    defaultMessage: 'You realize, just in time, that the candles are already lighted.'
  });

  // Candles need burning object
  registerConditionalMessage({
    messageId: 'CANDLES-NEED-BURNING',
    variants: [],
    defaultMessage: "You have to light them with something that's burning, you know."
  });

  // Candles extinguished
  registerConditionalMessage({
    messageId: 'CANDLES-EXTINGUISHED',
    variants: [],
    defaultMessage: 'The flame is extinguished.'
  });

  // Candles not lighted
  registerConditionalMessage({
    messageId: 'CANDLES-NOT-LIGHTED',
    variants: [],
    defaultMessage: 'The candles are not lighted.'
  });

  // Candles blown out by wind
  registerConditionalMessage({
    messageId: 'CANDLES-BLOWN-OUT',
    variants: [],
    defaultMessage: 'A gust of wind blows out your candles!'
  });

  // Match count message (multi-condition based on count)
  registerConditionalMessage({
    messageId: 'MATCH-COUNT',
    variants: [],
    defaultMessage: 'You have no matches.'
  });

  // Sword glow messages (multi-condition based on nearby enemies)
  registerConditionalMessage({
    messageId: 'SWORD-GLOW-FAINT',
    variants: [],
    defaultMessage: 'Your sword is glowing with a faint blue glow.'
  });

  registerConditionalMessage({
    messageId: 'SWORD-GLOW-BRIGHT',
    variants: [],
    defaultMessage: 'Your sword is glowing very brightly.'
  });

  registerConditionalMessage({
    messageId: 'SWORD-GLOW-BEGIN-BRIGHT',
    variants: [],
    defaultMessage: 'Your sword has begun to glow very brightly.'
  });

  registerConditionalMessage({
    messageId: 'SWORD-NO-LONGER-GLOWING',
    variants: [],
    defaultMessage: 'Your sword is no longer glowing.'
  });

  // Bottle with water messages
  registerConditionalMessage({
    messageId: 'BOTTLE-NOW-FULL',
    variants: [],
    defaultMessage: 'The bottle is now full of water.'
  });

  registerConditionalMessage({
    messageId: 'WATER-SLIPS-THROUGH-FINGERS',
    variants: [],
    defaultMessage: 'The water slips through your fingers.'
  });

  // Rope tied/untied messages (multi-condition)
  registerConditionalMessage({
    messageId: 'ROPE-ALREADY-TIED',
    variants: [],
    defaultMessage: 'The rope is already tied to it.'
  });

  registerConditionalMessage({
    messageId: 'ROPE-NOW-UNTIED',
    variants: [],
    defaultMessage: 'The rope is now untied.'
  });

  registerConditionalMessage({
    messageId: 'ROPE-NOT-TIED',
    variants: [],
    defaultMessage: 'It is not tied to anything.'
  });

  registerConditionalMessage({
    messageId: 'ROPE-TIED-TO-RAILING',
    variants: [],
    defaultMessage: 'The rope is tied to the railing.'
  });

  registerConditionalMessage({
    messageId: 'ROPE-DESCENDS-FROM-RAILING',
    variants: [],
    defaultMessage: 'A piece of rope descends from the railing above, ending some\nfive feet above your head.'
  });

  // Basket raised/lowered messages (multi-condition)
  registerConditionalMessage({
    messageId: 'BASKET-RAISED-TO-TOP',
    variants: [],
    defaultMessage: 'The basket is raised to the top of the shaft.'
  });

  registerConditionalMessage({
    messageId: 'BASKET-LOWERED-TO-BOTTOM',
    variants: [],
    defaultMessage: 'The basket is lowered to the bottom of the shaft.'
  });

  registerConditionalMessage({
    messageId: 'BASKET-AT-OTHER-END',
    variants: [],
    defaultMessage: 'The basket is at the other end of the chain.'
  });

  registerConditionalMessage({
    messageId: 'BASKET-FASTENED-TO-CHAIN',
    variants: [],
    defaultMessage: 'The cage is securely fastened to the iron chain.'
  });

  // Light source warning (when light source burns out)
  registerConditionalMessage({
    messageId: 'NEED-MORE-LIGHT',
    variants: [],
    defaultMessage: "You'd better have more light than from the "
  });

  // Cyclops drinks water (multi-condition)
  registerConditionalMessage({
    messageId: 'CYCLOPS-DRINKS-WATER',
    variants: [],
    defaultMessage: "The cyclops takes the bottle, checks that it's open, and drinks the water.\nA moment later, he lets out a yawn that nearly blows you over, and then\nfalls fast asleep (what did you put in that drink, anyway?)."
  });
}
