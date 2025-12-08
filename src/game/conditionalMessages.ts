/**
 * Conditional Message System
 * Handles messages that vary based on game state, flags, or conditions
 */

import { GameState } from './state.js';
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
 * Helper: Check lamp remaining lifetime percentage
 */
export function getLampLifetimePercent(state: GameState): number {
  const lamp = state.getObject('LAMP');
  if (!lamp) return 0;
  
  const currentLife = state.getGlobalVariable('LAMP_LIFE') || 0;
  const maxLife = state.getGlobalVariable('LAMP_MAX_LIFE') || 330;
  
  return (currentLife / maxLife) * 100;
}

/**
 * Helper: Check candle remaining lifetime
 */
export function getCandleLifetime(state: GameState): number {
  return state.getGlobalVariable('CANDLE_LIFE') || 0;
}

/**
 * Helper: Check if lamp is burned out
 */
export function isLampBurnedOut(state: GameState): boolean {
  const lamp = state.getObject('LAMP');
  return lamp?.hasFlag(ObjectFlag.RMUNGBIT) || false;
}

/**
 * Helper: Check if candles are burned out
 */
export function areCandlesBurnedOut(state: GameState): boolean {
  const candles = state.getObject('CANDLES');
  return candles?.hasFlag(ObjectFlag.RMUNGBIT) || false;
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
        message: 'You are standing in an open field west of a white house, with a boarded front\ndoor. A secret path leads southwest into the forest.'
      }
    ],
    defaultMessage: 'You are standing in an open field west of a white house, with a boarded front\ndoor.'
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

  // CYCLOPS-ROOM conditional description (magic flag and cyclops state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-CYCLOPS-ROOM',
    variants: [
      {
        condition: (state) => state.getFlag('MAGIC_FLAG'),
        message: 'This room has an exit on the northwest and a staircase leading up.\nThe east wall, previously solid, now has a cyclops-sized opening in it.'
      },
      {
        condition: (state) => {
          const cyclops = state.getObject('CYCLOPS');
          return cyclops && cyclops.location === 'CYCLOPS-ROOM';
        },
        message: 'This room has an exit on the northwest and a staircase leading up.\nA cyclops, who looks prepared to eat horses (much less mere adventurers), blocks the staircase. In his hand he carries a large, heavy sword.'
      }
    ],
    defaultMessage: 'This room has an exit on the northwest and a staircase leading up.'
  });

  // TREASURE-ROOM conditional description (cyclops state)
  registerConditionalMessage({
    messageId: 'ROOM-DESC-TREASURE-ROOM',
    variants: [
      {
        condition: (state) => {
          // Check if cyclops is still in the game (not removed by ulysses)
          const cyclops = state.getObject('CYCLOPS');
          return cyclops && cyclops.location !== null;
        },
        message: 'This is a large room, whose north wall is solid rock. A cyclops, who looks prepared to eat horses (much less mere adventurers), blocks the entrance on the south.'
      }
    ],
    defaultMessage: 'This is a large room, whose north wall is solid granite. A number of discarded bags, which crumble at your touch, are scattered about on the floor. There is an exit down a staircase and a dark, forbidding staircase leading up.'
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

  // BATCH 10: FLAG-DEPENDENT ROOM/OBJECT DESCRIPTIONS

  // Bell ringing at Entrance to Hades (Fweep sound)
  registerConditionalMessage({
    messageId: 'BELL-FWEEP',
    variants: [
      {
        condition: (state) => state.currentRoom === 'ENTRANCE-TO-HADES',
        message: '    Fweep!\n    Fweep!\n    Fweep!\n    Fweep!\n'
      }
    ],
    defaultMessage: '    Ding, dong!\n    Ding, dong!\n    Ding, dong!\n    Ding, dong!\n'
  });

  // Bat flight without garlic
  registerConditionalMessage({
    messageId: 'BAT-GRABS-YOU',
    variants: [
      {
        condition: (state) => {
          const garlic = state.getObject('GARLIC');
          if (!garlic) return true;
          const garlicLoc = garlic.location;
          return garlicLoc !== 'PLAYER' && garlicLoc !== state.currentRoom;
        },
        message: 'The bat grabs you by the scruff of your neck and lifts you away....'
      }
    ],
    defaultMessage: 'The bat is afraid to come near you.'
  });

  // Rug as magic carpet joke (when trap door is open)
  registerConditionalMessage({
    messageId: 'RUG-MAGIC-CARPET',
    variants: [
      {
        condition: (state) => {
          const trapDoor = state.getObject('TRAP-DOOR');
          return trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: "I suppose you think it's a magic carpet?"
      }
    ],
    defaultMessage: 'Having difficulty, are we?'
  });

  // Leaves count (when grate is open)
  registerConditionalMessage({
    messageId: 'LEAVES-COUNT',
    variants: [
      {
        condition: (state) => {
          const grate = state.getObject('GRATE');
          return grate?.hasFlag(ObjectFlag.OPENBIT) || false;
        },
        message: 'There are 69,105 leaves here.'
      }
    ],
    defaultMessage: 'There are a lot of leaves here.'
  });

  // Leaves rustle (when leaves are in current room)
  registerConditionalMessage({
    messageId: 'LEAVES-RUSTLE',
    variants: [],
    defaultMessage: 'You rustle the leaves around, making quite a mess.'
  });

  // Torch extinguish warning (trying to put out lit torch with hands)
  registerConditionalMessage({
    messageId: 'TORCH-EXTINGUISH-BURN',
    variants: [],
    defaultMessage: 'You nearly burn your hand trying to extinguish the flame.'
  });

  // Mirror tingling (rubbing mirror with hands)
  registerConditionalMessage({
    messageId: 'MIRROR-TINGLING',
    variants: [],
    defaultMessage: 'You feel a faint tingling transmitted through the mirror.'
  });

  // Bell ceremony requirement (need bell, book, and candles)
  registerConditionalMessage({
    messageId: 'BELL-CEREMONY-REQUIRED',
    variants: [
      {
        condition: (state) => {
          const bell = state.getObject('BELL');
          const book = state.getObject('BOOK');
          const candles = state.getObject('CANDLES');
          const hasBell = bell?.location === 'PLAYER';
          const hasBook = book?.location === 'PLAYER';
          const hasCandles = candles?.location === 'PLAYER';
          return !(hasBell && hasBook && hasCandles);
        },
        message: 'You must perform the ceremony.'
      }
    ],
    defaultMessage: 'Ding, dong!'
  });

  // Book exorcism (reading book with candles)
  registerConditionalMessage({
    messageId: 'BOOK-EXORCISM',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          const hasCandles = candles?.location === 'PLAYER';
          const candlesLit = candles?.hasFlag(ObjectFlag.ONBIT) || false;
          return hasCandles && candlesLit;
        },
        message: 'Begone, fiends!\n\nThe wraiths, as if anxious to leave, flee through the walls and are gone.'
      }
    ],
    defaultMessage: 'The book is written in an ancient script, but you can make out the title:\n"Prayers for the Dead"'
  });

  // Reservoir water sound (quieter when dam is open)
  registerConditionalMessage({
    messageId: 'RESERVOIR-WATER-SOUND',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return damOpen && state.currentRoom === 'RESERVOIR';
        },
        message: 'The roar of rushing water is quieter now.'
      }
    ],
    defaultMessage: 'The roar of the water is loud here.'
  });

  // Blue button state
  registerConditionalMessage({
    messageId: 'BLUE-BUTTON-STATE',
    variants: [],
    defaultMessage: 'The blue button is currently off.'
  });

  // Red button state (with room lighting)
  registerConditionalMessage({
    messageId: 'RED-BUTTON-STATE',
    variants: [
      {
        condition: (state) => {
          // Check if current room has lighting on
          const roomLit = state.getGlobalVariable('ROOM_LIT') || false;
          return roomLit;
        },
        message: 'The red button is currently on.'
      }
    ],
    defaultMessage: 'The red button is currently off.'
  });

  // Chests empty message
  registerConditionalMessage({
    messageId: 'CHESTS-EMPTY',
    variants: [],
    defaultMessage: 'The chests are all empty.'
  });

  // Troll weapon rejection
  registerConditionalMessage({
    messageId: 'TROLL-WEAPON-REJECTION',
    variants: [],
    defaultMessage: 'The troll spits in your face, grunting "Better luck next time."'
  });

  // Troll laughs at puny gesture
  registerConditionalMessage({
    messageId: 'TROLL-LAUGHS',
    variants: [],
    defaultMessage: 'The troll laughs at your puny gesture.'
  });

  // Thief places item
  registerConditionalMessage({
    messageId: 'THIEF-PLACES-ITEM',
    variants: [],
    defaultMessage: 'The thief places the treasure in his bag and thanks you politely.'
  });

  // BATCH 10: OBJECT STATE VARIATIONS (OPENBIT, ONBIT, TOUCHBIT)

  // Thief robbed player messages
  registerConditionalMessage({
    messageId: 'THIEF-FOUND-NOTHING',
    variants: [],
    defaultMessage: 'The thief, finding nothing of value, left disgusted.'
  });

  registerConditionalMessage({
    messageId: 'THIEF-ROBBED-BLIND',
    variants: [],
    defaultMessage: 'The thief robbed you blind first.'
  });

  registerConditionalMessage({
    messageId: 'THIEF-APPROPRIATED-VALUABLES',
    variants: [],
    defaultMessage: 'The thief appropriated the valuables in the room.'
  });

  // Thief stealing invisible items
  registerConditionalMessage({
    messageId: 'THIEF-STEALING-SOUND',
    variants: [],
    defaultMessage: 'You hear, off in the distance, someone saying "Thief, thief!"'
  });

  // Thief consciousness recovery
  registerConditionalMessage({
    messageId: 'THIEF-RECOVERS-CONSCIOUSNESS',
    variants: [],
    defaultMessage: 'Your proposed victim suddenly recovers consciousness.'
  });

  // Stiletto description
  registerConditionalMessage({
    messageId: 'STILETTO-DESCRIPTION',
    variants: [],
    defaultMessage: 'The stiletto is a nasty-looking weapon.'
  });

  // Thief bag interaction
  registerConditionalMessage({
    messageId: 'THIEF-BAG-CLOSE-TRICK',
    variants: [],
    defaultMessage: 'Getting close enough would be a good trick.'
  });

  // Treasure room with thief
  registerConditionalMessage({
    messageId: 'THIEF-STAB-IN-BACK',
    variants: [],
    defaultMessage: "You'd be stabbed in the back first."
  });

  // Mailbox anchored (with lamp state check)
  registerConditionalMessage({
    messageId: 'MAILBOX-ANCHORED',
    variants: [
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          const burnedOut = lamp?.hasFlag(ObjectFlag.RMUNGBIT) || false;
          const isOn = lamp?.hasFlag(ObjectFlag.ONBIT) || false;
          return burnedOut && isOn;
        },
        message: 'It is securely anchored.'
      }
    ],
    defaultMessage: 'It is securely anchored.'
  });

  // Match burning state messages
  registerConditionalMessage({
    messageId: 'MATCH-BURNING-EXAMINE',
    variants: [
      {
        condition: (state) => {
          const match = state.getObject('MATCH');
          return match?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: "The match is burning. The matchbook isn't very interesting, except for what's written on it."
      }
    ],
    defaultMessage: "The matchbook isn't very interesting, except for what's written on it."
  });

  // Candles with burning object warning
  registerConditionalMessage({
    messageId: 'CANDLES-BURN-WARNING',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          return candles?.hasFlag(ObjectFlag.ONBIT) || false;
        },
        message: "That wouldn't be smart."
      }
    ],
    defaultMessage: 'Nothing happens.'
  });

  // Cave darkness message (candles going out)
  registerConditionalMessage({
    messageId: 'CAVE-DARKNESS',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          const hasCandles = candles?.location === 'PLAYER';
          const candlesOn = candles?.hasFlag(ObjectFlag.ONBIT) || false;
          return hasCandles && candlesOn;
        },
        message: 'It is now completely dark.'
      }
    ],
    defaultMessage: 'It is dark.'
  });

  // Lighting gas with candles/torch/match warning
  registerConditionalMessage({
    messageId: 'GAS-LIGHT-WARNING',
    variants: [],
    defaultMessage: 'How sad for an aspiring adventurer to light a match near a gas leak.'
  });

  // Slag crumbles (coal in machine)
  registerConditionalMessage({
    messageId: 'SLAG-CRUMBLES',
    variants: [
      {
        condition: (state) => {
          const coal = state.getObject('COAL');
          return coal?.location === 'MACHINE';
        },
        message: 'The slag was rather insubstantial, and crumbles into dust at your touch.'
      }
    ],
    defaultMessage: 'The slag is worthless.'
  });

  // Sceptre on rainbow
  registerConditionalMessage({
    messageId: 'SCEPTRE-RAINBOW-DISPLAY',
    variants: [
      {
        condition: (state) => state.currentRoom === 'ON-RAINBOW',
        message: 'A dazzling display of color briefly emanates from the sceptre.'
      }
    ],
    defaultMessage: 'The sceptre is beautiful.'
  });

  // ============================================================================
  // BATCH 11: TIME-DEPENDENT MESSAGES
  // ============================================================================

  // Lamp dimming warning at 100 turns remaining
  registerConditionalMessage({
    messageId: 'LAMP-DIMMING-WARNING-100',
    variants: [],
    defaultMessage: 'The lamp appears a bit dimmer.'
  });

  // Lamp dimming warning at 70 turns remaining
  registerConditionalMessage({
    messageId: 'LAMP-DIMMING-WARNING-70',
    variants: [],
    defaultMessage: 'The lamp is definitely dimmer now.'
  });

  // Lamp dimming warning at 15 turns remaining
  registerConditionalMessage({
    messageId: 'LAMP-DIMMING-WARNING-15',
    variants: [],
    defaultMessage: 'The lamp is nearly out.'
  });

  // Lamp goes out message
  registerConditionalMessage({
    messageId: 'LAMP-GOES-OUT',
    variants: [],
    defaultMessage: "I'm afraid the lamp has run out of power."
  });

  // Candles grow shorter at 20 turns remaining
  registerConditionalMessage({
    messageId: 'CANDLES-GROW-SHORTER-20',
    variants: [],
    defaultMessage: 'The candles grow shorter.'
  });

  // Candles becoming short at 10 turns remaining
  registerConditionalMessage({
    messageId: 'CANDLES-BECOMING-SHORT-10',
    variants: [],
    defaultMessage: 'The candles are becoming quite short.'
  });

  // Candles won't last long at 5 turns remaining
  registerConditionalMessage({
    messageId: 'CANDLES-WONT-LAST-5',
    variants: [],
    defaultMessage: "The candles won't last long now."
  });

  // Candles go out message
  registerConditionalMessage({
    messageId: 'CANDLES-GO-OUT',
    variants: [],
    defaultMessage: 'The candles have gone out.'
  });

  // Match burns out quickly (1-2 turns)
  registerConditionalMessage({
    messageId: 'MATCH-BURNS-OUT',
    variants: [],
    defaultMessage: 'The match has gone out.'
  });

  // Torch lifetime warning
  registerConditionalMessage({
    messageId: 'TORCH-BURNING-LOW',
    variants: [],
    defaultMessage: 'The torch is burning low.'
  });

  // Torch goes out
  registerConditionalMessage({
    messageId: 'TORCH-GOES-OUT',
    variants: [],
    defaultMessage: 'The torch has gone out.'
  });

  // Time-based room description changes (dam draining)
  registerConditionalMessage({
    messageId: 'DAM-DRAINING-SOUND',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          const turnsOpen = state.getGlobalVariable('DAM_TURNS_OPEN') || 0;
          return damOpen && turnsOpen < 10;
        },
        message: 'You can hear the roar of rushing water from below.'
      }
    ],
    defaultMessage: 'The sound of water has quieted.'
  });

  // Reservoir draining progress
  registerConditionalMessage({
    messageId: 'RESERVOIR-DRAINING',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          const turnsOpen = state.getGlobalVariable('DAM_TURNS_OPEN') || 0;
          return damOpen && turnsOpen >= 5 && turnsOpen < 10;
        },
        message: 'The water level is dropping rapidly.'
      }
    ],
    defaultMessage: 'The water is calm.'
  });

  // Thief appearance timing
  registerConditionalMessage({
    messageId: 'THIEF-APPEARS-SOON',
    variants: [],
    defaultMessage: 'You hear footsteps in the distance.'
  });

  // Cyclops sleep duration
  registerConditionalMessage({
    messageId: 'CYCLOPS-WAKING-UP',
    variants: [],
    defaultMessage: 'The cyclops is starting to stir.'
  });

  // ============================================================================
  // BATCH 11: MULTI-CONDITION MESSAGES (2+ flags/states)
  // ============================================================================

  // Bottle with water and open state
  registerConditionalMessage({
    messageId: 'BOTTLE-WATER-OPEN',
    variants: [
      {
        condition: (state) => {
          const bottle = state.getObject('BOTTLE');
          const water = state.getObject('WATER');
          const bottleOpen = bottle?.hasFlag(ObjectFlag.OPENBIT) || false;
          const waterInBottle = water?.location === 'BOTTLE';
          return bottleOpen && waterInBottle;
        },
        message: 'The bottle is open and contains water.'
      },
      {
        condition: (state) => {
          const bottle = state.getObject('BOTTLE');
          const water = state.getObject('WATER');
          const bottleOpen = bottle?.hasFlag(ObjectFlag.OPENBIT) || false;
          const waterInBottle = water?.location === 'BOTTLE';
          return !bottleOpen && waterInBottle;
        },
        message: 'The bottle is closed and contains water.'
      }
    ],
    defaultMessage: 'The bottle is empty.'
  });

  // Trap door with rug state
  registerConditionalMessage({
    messageId: 'TRAP-DOOR-RUG-STATE',
    variants: [
      {
        condition: (state) => {
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return rugMoved && trapDoorOpen;
        },
        message: 'The rug has been moved aside, revealing an open trap door.'
      },
      {
        condition: (state) => {
          const rugMoved = state.getGlobalVariable('RUG_MOVED') || false;
          const trapDoor = state.getObject('TRAP-DOOR');
          const trapDoorOpen = trapDoor?.hasFlag(ObjectFlag.OPENBIT) || false;
          return rugMoved && !trapDoorOpen;
        },
        message: 'The rug has been moved aside, revealing a closed trap door.'
      }
    ],
    defaultMessage: 'The rug is covering something.'
  });

  // Grate revealed and open state
  registerConditionalMessage({
    messageId: 'GRATE-REVEALED-OPEN',
    variants: [
      {
        condition: (state) => {
          const grate = state.getObject('GRATE');
          const grateRevealed = state.getGlobalVariable('GRATE_REVEALED') || false;
          const grateOpen = grate?.hasFlag(ObjectFlag.OPENBIT) || false;
          return grateRevealed && grateOpen;
        },
        message: 'The grating is open, revealing a dark passage below.'
      },
      {
        condition: (state) => {
          const grateRevealed = state.getGlobalVariable('GRATE_REVEALED') || false;
          return grateRevealed;
        },
        message: 'The grating is closed but visible.'
      }
    ],
    defaultMessage: 'You see nothing special.'
  });

  // Lamp burned out and on state (impossible but handled)
  registerConditionalMessage({
    messageId: 'LAMP-BURNED-OUT-ON',
    variants: [
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          const burnedOut = lamp?.hasFlag(ObjectFlag.RMUNGBIT) || false;
          const isOn = lamp?.hasFlag(ObjectFlag.ONBIT) || false;
          return burnedOut && isOn;
        },
        message: 'The lamp has burned out but is still switched on.'
      }
    ],
    defaultMessage: 'The lamp is off.'
  });

  // Candles burned out and lit state
  registerConditionalMessage({
    messageId: 'CANDLES-BURNED-OUT-LIT',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          const burnedOut = candles?.hasFlag(ObjectFlag.RMUNGBIT) || false;
          const isLit = candles?.hasFlag(ObjectFlag.ONBIT) || false;
          return burnedOut && isLit;
        },
        message: 'The candles have burned down to nothing.'
      }
    ],
    defaultMessage: 'The candles are out.'
  });

  // Machine open with coal inside
  registerConditionalMessage({
    messageId: 'MACHINE-OPEN-COAL',
    variants: [
      {
        condition: (state) => {
          const machine = state.getObject('MACHINE');
          const coal = state.getObject('COAL');
          const machineOpen = machine?.hasFlag(ObjectFlag.OPENBIT) || false;
          const coalInMachine = coal?.location === 'MACHINE';
          return machineOpen && coalInMachine;
        },
        message: 'The machine is open and contains a piece of coal.'
      }
    ],
    defaultMessage: 'The machine is closed.'
  });

  // Boat inflated in water location
  registerConditionalMessage({
    messageId: 'BOAT-INFLATED-WATER',
    variants: [
      {
        condition: (state) => {
          const boat = state.getObject('BOAT');
          const boatInflated = state.getGlobalVariable('BOAT_INFLATED') || false;
          const inWaterRoom = ['RESERVOIR', 'IN-STREAM', 'RIVER'].includes(state.currentRoom);
          return boatInflated && inWaterRoom;
        },
        message: 'The boat is floating on the water.'
      }
    ],
    defaultMessage: 'The boat is here.'
  });

  // Thief alive and in room with treasures
  registerConditionalMessage({
    messageId: 'THIEF-TREASURE-ROOM',
    variants: [
      {
        condition: (state) => {
          const thief = state.getObject('THIEF');
          const thiefAlive = state.getGlobalVariable('THIEF_ALIVE') !== false;
          const thiefHere = thief?.location === state.currentRoom;
          // Check if room has treasures
          const hasTreasures = state.getGlobalVariable('ROOM_HAS_TREASURES') || false;
          return thiefAlive && thiefHere && hasTreasures;
        },
        message: 'The thief is eyeing the treasures greedily.'
      }
    ],
    defaultMessage: 'The thief is here.'
  });

  // Mirror broken and in mirror room
  registerConditionalMessage({
    messageId: 'MIRROR-BROKEN-ROOM',
    variants: [
      {
        condition: (state) => {
          const mirrorBroken = state.getGlobalVariable('MIRROR_BROKEN') || false;
          const inMirrorRoom = ['MIRROR-ROOM-1', 'MIRROR-ROOM-2'].includes(state.currentRoom);
          return mirrorBroken && inMirrorRoom;
        },
        message: 'The enormous mirror is cracked from top to bottom.'
      }
    ],
    defaultMessage: 'The mirror is intact.'
  });

  // Dam open and reservoir drained
  registerConditionalMessage({
    messageId: 'DAM-OPEN-DRAINED',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          const reservoirDrained = state.getGlobalVariable('RESERVOIR_DRAINED') || false;
          return damOpen && reservoirDrained;
        },
        message: 'The dam is open and the reservoir has been drained.'
      }
    ],
    defaultMessage: 'The dam is closed.'
  });

  // Cyclops asleep with treasure room accessible
  registerConditionalMessage({
    messageId: 'CYCLOPS-ASLEEP-ACCESSIBLE',
    variants: [
      {
        condition: (state) => {
          const cyclopsAsleep = state.getGlobalVariable('CYCLOPS_ASLEEP') || false;
          const magicFlag = state.getFlag('MAGIC_FLAG');
          return cyclopsAsleep && magicFlag;
        },
        message: 'The cyclops is sleeping soundly. The passage to the treasure room is open.'
      }
    ],
    defaultMessage: 'The cyclops is awake and blocking the passage.'
  });

  // Rope tied and player in shaft
  registerConditionalMessage({
    messageId: 'ROPE-TIED-SHAFT',
    variants: [
      {
        condition: (state) => {
          const ropeTied = state.getGlobalVariable('ROPE_TIED') || false;
          const inShaft = ['SHAFT-ROOM', 'LOWER-SHAFT'].includes(state.currentRoom);
          return ropeTied && inShaft;
        },
        message: 'A rope descends from above.'
      }
    ],
    defaultMessage: 'There is no rope here.'
  });

  // Basket lowered with items inside
  registerConditionalMessage({
    messageId: 'BASKET-LOWERED-ITEMS',
    variants: [
      {
        condition: (state) => {
          const basketLowered = state.getGlobalVariable('BASKET_LOWERED') || false;
          const basket = state.getObject('BASKET');
          const hasItems = basket && state.getObjectsInContainer('BASKET').length > 0;
          return basketLowered && hasItems;
        },
        message: 'The basket is at the bottom of the shaft and contains items.'
      }
    ],
    defaultMessage: 'The basket is empty.'
  });

  // Bell, book, and candles together (exorcism requirements)
  registerConditionalMessage({
    messageId: 'EXORCISM-ITEMS-READY',
    variants: [
      {
        condition: (state) => {
          const bell = state.getObject('BELL');
          const book = state.getObject('BOOK');
          const candles = state.getObject('CANDLES');
          const hasBell = bell?.location === 'PLAYER';
          const hasBook = book?.location === 'PLAYER';
          const hasCandles = candles?.location === 'PLAYER';
          const candlesLit = candles?.hasFlag(ObjectFlag.ONBIT) || false;
          return hasBell && hasBook && hasCandles && candlesLit;
        },
        message: 'You have everything needed for the exorcism ceremony.'
      }
    ],
    defaultMessage: 'You are not prepared for the ceremony.'
  });

  // Spirits exorcised and gate open
  registerConditionalMessage({
    messageId: 'SPIRITS-EXORCISED-GATE',
    variants: [
      {
        condition: (state) => {
          const spiritsExorcised = state.getGlobalVariable('SPIRITS_EXORCISED') || false;
          const gateOpen = state.getGlobalVariable('GATE_OPEN') || false;
          return spiritsExorcised && gateOpen;
        },
        message: 'The spirits are gone and the gate to Hades stands open.'
      }
    ],
    defaultMessage: 'The gate is closed.'
  });

  // ============================================================================
  // BATCH 12: LOCATION-DEPENDENT MESSAGES
  // ============================================================================

  // Object visibility based on current room
  registerConditionalMessage({
    messageId: 'OBJECT-NOT-HERE',
    variants: [
      {
        condition: (state) => {
          // Generic message for objects not in current room
          return true;
        },
        message: "You can't see that here."
      }
    ],
    defaultMessage: "I don't see that here."
  });

  // Leaves in clearing (location-specific count)
  registerConditionalMessage({
    messageId: 'LEAVES-IN-CLEARING',
    variants: [
      {
        condition: (state) => state.currentRoom === 'CLEARING',
        message: 'The leaves are piled high in the clearing.'
      },
      {
        condition: (state) => state.currentRoom === 'FOREST',
        message: 'The forest floor is covered with leaves.'
      }
    ],
    defaultMessage: 'There are leaves here.'
  });

  // Water location-dependent messages
  registerConditionalMessage({
    messageId: 'WATER-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'RESERVOIR',
        message: 'The water fills the reservoir.'
      },
      {
        condition: (state) => state.currentRoom === 'STREAM',
        message: 'The stream flows gently here.'
      },
      {
        condition: (state) => state.currentRoom === 'RIVER',
        message: 'The river rushes past.'
      }
    ],
    defaultMessage: 'There is water here.'
  });

  // Drafty room message (match goes out)
  registerConditionalMessage({
    messageId: 'DRAFTY-ROOM-MATCH',
    variants: [
      {
        condition: (state) => {
          const draftyRooms = ['ENTRANCE-TO-HADES', 'LAND-OF-LIVING-DEAD', 'CELLAR'];
          return draftyRooms.includes(state.currentRoom);
        },
        message: 'This room is drafty, and the match goes out instantly.'
      }
    ],
    defaultMessage: 'The match lights.'
  });

  // Echo in cave (location-specific)
  registerConditionalMessage({
    messageId: 'ECHO-IN-CAVE',
    variants: [
      {
        condition: (state) => {
          const echoRooms = ['ROUND-ROOM', 'LOUD-ROOM', 'DAMP-CAVE'];
          return echoRooms.includes(state.currentRoom);
        },
        message: 'Your voice echoes loudly through the cave.'
      }
    ],
    defaultMessage: 'Nothing happens.'
  });

  // Rainbow visibility (location-specific)
  registerConditionalMessage({
    messageId: 'RAINBOW-VISIBLE',
    variants: [
      {
        condition: (state) => {
          const rainbowRooms = ['CANYON-VIEW', 'ON-RAINBOW', 'END-OF-RAINBOW'];
          return rainbowRooms.includes(state.currentRoom);
        },
        message: 'The rainbow shimmers brilliantly.'
      }
    ],
    defaultMessage: 'There is no rainbow here.'
  });

  // Troll bridge location messages
  registerConditionalMessage({
    messageId: 'TROLL-BRIDGE-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'TROLL-ROOM',
        message: 'The troll blocks your way across the bridge.'
      },
      {
        condition: (state) => state.currentRoom === 'CHASM',
        message: 'You can see the bridge from here, spanning the chasm.'
      }
    ],
    defaultMessage: 'The bridge is not visible from here.'
  });

  // Thief location-dependent messages
  registerConditionalMessage({
    messageId: 'THIEF-LOCATION-HINT',
    variants: [
      {
        condition: (state) => {
          const thief = state.getObject('THIEF');
          const thiefHere = thief?.location === state.currentRoom;
          return thiefHere;
        },
        message: 'The thief is lurking in the shadows here.'
      }
    ],
    defaultMessage: 'The thief is not here.'
  });

  // Cyclops room location messages
  registerConditionalMessage({
    messageId: 'CYCLOPS-ROOM-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'CYCLOPS-ROOM',
        message: 'You are in the cyclops room.'
      },
      {
        condition: (state) => state.currentRoom === 'TREASURE-ROOM',
        message: 'You can hear the cyclops snoring in the next room.'
      }
    ],
    defaultMessage: 'The cyclops is not nearby.'
  });

  // Maze location messages (different for each maze room)
  registerConditionalMessage({
    messageId: 'MAZE-LOCATION-HINT',
    variants: [
      {
        condition: (state) => state.currentRoom.startsWith('MAZE-'),
        message: 'You are in a maze of twisty little passages, all alike.'
      }
    ],
    defaultMessage: 'You are not in the maze.'
  });

  // Dam location-specific sounds
  registerConditionalMessage({
    messageId: 'DAM-LOCATION-SOUND',
    variants: [
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return state.currentRoom === 'DAM' && damOpen;
        },
        message: 'The roar of water rushing through the dam is deafening.'
      },
      {
        condition: (state) => {
          const damOpen = state.getGlobalVariable('DAM_OPEN') || false;
          return state.currentRoom === 'DAM-LOBBY' && damOpen;
        },
        message: 'You can hear water rushing through the dam above.'
      }
    ],
    defaultMessage: 'All is quiet.'
  });

  // Volcano location messages
  registerConditionalMessage({
    messageId: 'VOLCANO-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'VOLCANO-CORE',
        message: 'The heat is intense here in the volcano core.'
      },
      {
        condition: (state) => state.currentRoom === 'VOLCANO-NEAR',
        message: 'You can feel the heat from the volcano.'
      }
    ],
    defaultMessage: 'The volcano is not nearby.'
  });

  // Altar location messages
  registerConditionalMessage({
    messageId: 'ALTAR-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'TEMPLE',
        message: 'The altar stands in the center of the temple.'
      },
      {
        condition: (state) => state.currentRoom === 'ENTRANCE-TO-HADES',
        message: 'You can see the temple altar through the gate.'
      }
    ],
    defaultMessage: 'There is no altar here.'
  });

  // Boat location messages (in water vs on land)
  registerConditionalMessage({
    messageId: 'BOAT-LOCATION-STATE',
    variants: [
      {
        condition: (state) => {
          const boat = state.getObject('BOAT');
          const boatInflated = state.getGlobalVariable('BOAT_INFLATED') || false;
          const waterRooms = ['RESERVOIR', 'STREAM', 'RIVER', 'FRIGID-RIVER'];
          return boatInflated && waterRooms.includes(state.currentRoom);
        },
        message: 'The boat is floating on the water here.'
      },
      {
        condition: (state) => {
          const boat = state.getObject('BOAT');
          const boatInflated = state.getGlobalVariable('BOAT_INFLATED') || false;
          return boatInflated && !['RESERVOIR', 'STREAM', 'RIVER', 'FRIGID-RIVER'].includes(state.currentRoom);
        },
        message: 'The boat is on dry land here.'
      }
    ],
    defaultMessage: 'The boat is deflated.'
  });

  // Coffin location message (in temple vs elsewhere)
  registerConditionalMessage({
    messageId: 'COFFIN-LOCATION',
    variants: [
      {
        condition: (state) => state.currentRoom === 'EGYPT-ROOM',
        message: 'The gold coffin rests on a pedestal.'
      }
    ],
    defaultMessage: 'The coffin is here.'
  });

  // ============================================================================
  // BATCH 12: INVENTORY-DEPENDENT MESSAGES
  // ============================================================================

  // Lamp in inventory messages
  registerConditionalMessage({
    messageId: 'LAMP-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const lamp = state.getObject('LAMP');
          return lamp?.location === 'PLAYER';
        },
        message: 'You are carrying a brass lantern.'
      }
    ],
    defaultMessage: 'You are not carrying a lamp.'
  });

  // Sword in inventory (affects combat)
  registerConditionalMessage({
    messageId: 'SWORD-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const sword = state.getObject('SWORD');
          return sword?.location === 'PLAYER';
        },
        message: 'You are armed with the elvish sword.'
      }
    ],
    defaultMessage: 'You are unarmed.'
  });

  // Garlic in inventory (affects bat)
  registerConditionalMessage({
    messageId: 'GARLIC-IN-INVENTORY-BAT',
    variants: [
      {
        condition: (state) => {
          const garlic = state.getObject('GARLIC');
          const bat = state.getObject('BAT');
          const hasGarlic = garlic?.location === 'PLAYER';
          const batHere = bat?.location === state.currentRoom;
          return hasGarlic && batHere;
        },
        message: 'The bat recoils from the smell of garlic.'
      }
    ],
    defaultMessage: 'The bat swoops at you!'
  });

  // Water in inventory (bottle with water)
  registerConditionalMessage({
    messageId: 'WATER-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const bottle = state.getObject('BOTTLE');
          const water = state.getObject('WATER');
          const hasBottle = bottle?.location === 'PLAYER';
          const waterInBottle = water?.location === 'BOTTLE';
          return hasBottle && waterInBottle;
        },
        message: 'You are carrying a bottle of water.'
      }
    ],
    defaultMessage: 'You have no water.'
  });

  // Food in inventory
  registerConditionalMessage({
    messageId: 'FOOD-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const lunch = state.getObject('LUNCH');
          return lunch?.location === 'PLAYER';
        },
        message: 'You have a lunch with you.'
      }
    ],
    defaultMessage: 'You have no food.'
  });

  // Keys in inventory (affects locked doors)
  registerConditionalMessage({
    messageId: 'KEYS-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const keys = state.getObject('KEYS');
          return keys?.location === 'PLAYER';
        },
        message: 'You have a set of keys.'
      }
    ],
    defaultMessage: 'You have no keys.'
  });

  // Rope in inventory
  registerConditionalMessage({
    messageId: 'ROPE-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const rope = state.getObject('ROPE');
          return rope?.location === 'PLAYER';
        },
        message: 'You are carrying a rope.'
      }
    ],
    defaultMessage: 'You have no rope.'
  });

  // Torch in inventory (light source)
  registerConditionalMessage({
    messageId: 'TORCH-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const torch = state.getObject('TORCH');
          const hasTorch = torch?.location === 'PLAYER';
          const torchLit = torch?.hasFlag(ObjectFlag.ONBIT) || false;
          return hasTorch && torchLit;
        },
        message: 'You are carrying a burning torch.'
      },
      {
        condition: (state) => {
          const torch = state.getObject('TORCH');
          return torch?.location === 'PLAYER';
        },
        message: 'You are carrying an unlit torch.'
      }
    ],
    defaultMessage: 'You have no torch.'
  });

  // Candles in inventory (for exorcism)
  registerConditionalMessage({
    messageId: 'CANDLES-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          const hasCandles = candles?.location === 'PLAYER';
          const candlesLit = candles?.hasFlag(ObjectFlag.ONBIT) || false;
          return hasCandles && candlesLit;
        },
        message: 'You are carrying lit candles.'
      },
      {
        condition: (state) => {
          const candles = state.getObject('CANDLES');
          return candles?.location === 'PLAYER';
        },
        message: 'You are carrying unlit candles.'
      }
    ],
    defaultMessage: 'You have no candles.'
  });

  // Bell, book, and candles (exorcism set)
  registerConditionalMessage({
    messageId: 'EXORCISM-SET-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const bell = state.getObject('BELL');
          const book = state.getObject('BOOK');
          const candles = state.getObject('CANDLES');
          const hasBell = bell?.location === 'PLAYER';
          const hasBook = book?.location === 'PLAYER';
          const hasCandles = candles?.location === 'PLAYER';
          return hasBell && hasBook && hasCandles;
        },
        message: 'You have the bell, book, and candles needed for the ceremony.'
      }
    ],
    defaultMessage: 'You do not have all the items needed for the ceremony.'
  });

  // Treasures in inventory (affects score)
  registerConditionalMessage({
    messageId: 'TREASURES-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const treasures = ['EGG', 'CHALICE', 'TRIDENT', 'COFFIN', 'PAINTING', 'BAUBLE'];
          let count = 0;
          for (const treasureId of treasures) {
            const treasure = state.getObject(treasureId);
            if (treasure?.location === 'PLAYER') {
              count++;
            }
          }
          return count > 0;
        },
        message: 'You are carrying valuable treasures.'
      }
    ],
    defaultMessage: 'You are not carrying any treasures.'
  });

  // Weapons in inventory (affects combat)
  registerConditionalMessage({
    messageId: 'WEAPONS-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const sword = state.getObject('SWORD');
          const knife = state.getObject('KNIFE');
          const axe = state.getObject('AXE');
          const hasSword = sword?.location === 'PLAYER';
          const hasKnife = knife?.location === 'PLAYER';
          const hasAxe = axe?.location === 'PLAYER';
          return hasSword || hasKnife || hasAxe;
        },
        message: 'You are armed.'
      }
    ],
    defaultMessage: 'You have no weapons.'
  });

  // Tools in inventory (affects puzzles)
  registerConditionalMessage({
    messageId: 'TOOLS-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const screwdriver = state.getObject('SCREWDRIVER');
          const wrench = state.getObject('WRENCH');
          const hasScrewdriver = screwdriver?.location === 'PLAYER';
          const hasWrench = wrench?.location === 'PLAYER';
          return hasScrewdriver || hasWrench;
        },
        message: 'You have tools with you.'
      }
    ],
    defaultMessage: 'You have no tools.'
  });

  // Sack in inventory (container)
  registerConditionalMessage({
    messageId: 'SACK-IN-INVENTORY',
    variants: [
      {
        condition: (state) => {
          const sack = state.getObject('SACK');
          const hasSack = sack?.location === 'PLAYER';
          const sackOpen = sack?.hasFlag(ObjectFlag.OPENBIT) || false;
          return hasSack && sackOpen;
        },
        message: 'You are carrying an open sack.'
      },
      {
        condition: (state) => {
          const sack = state.getObject('SACK');
          return sack?.location === 'PLAYER';
        },
        message: 'You are carrying a closed sack.'
      }
    ],
    defaultMessage: 'You have no sack.'
  });

  // Inventory weight check
  registerConditionalMessage({
    messageId: 'INVENTORY-TOO-HEAVY',
    variants: [
      {
        condition: (state) => {
          // Check if player is carrying too much
          const maxWeight = state.getGlobalVariable('MAX_WEIGHT') || 100;
          const currentWeight = state.getGlobalVariable('CURRENT_WEIGHT') || 0;
          return currentWeight >= maxWeight;
        },
        message: 'You are carrying too much weight.'
      }
    ],
    defaultMessage: 'You can carry more.'
  });
}
