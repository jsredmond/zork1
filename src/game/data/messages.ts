/**
 * Text messages and strings extracted from ZIL source
 * 
 * This file contains game messages, error messages, and other text strings.
 */

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
  MAX_SCORE: 350,
  LAMP_LIFETIME: 200, // turns
  CANDLES_LIFETIME: 40, // turns
  MAX_INVENTORY_WEIGHT: 100
};

/**
 * Readable text from objects
 */
export const READABLE_TEXTS: Record<string, string> = {
  ADVERTISEMENT: `"WELCOME TO ZORK!

ZORK is a game of adventure, danger, and low cunning. In it you
will explore some of the most amazing territory ever seen by mortals.
No computer should be without one!"`,

  MATCH: `
(Close cover before striking)

YOU too can make BIG MONEY in the exciting field of PAPER SHUFFLING!

Mr. Anderson of Muddle, Mass. says: "Before I took this course I
was a lowly bit twiddler. Now with what I learned at GUE Tech
I feel really important and can obfuscate and confuse with the best."

Dr. Blank had this to say: "Ten short days ago all I could look
forward to was a dead-end job as a doctor. Now I have a promising
future and make really big Zorkmids."

GUE Tech can't promise these fantastic results to everyone. But when
you earn your degree from GUE Tech, your future will be brighter.`,

  GUIDE: `"	Flood Control Dam #3

FCD#3 was constructed in year 783 of the Great Underground Empire to
harness the mighty Frigid River. This work was supported by a grant of
37 million zorkmids from your omnipotent local tyrant Lord Dimwit
Flathead the Excessive. This impressive structure is composed of
370,000 cubic feet of concrete, is 256 feet tall at the center, and 193
feet wide at the top. The lake created behind the dam has a volume
of 1.7 billion cubic feet, an area of 12 million square feet, and a
shore line of 36 thousand feet.

The construction of FCD#3 took 112 days from ground breaking to
the dedication. It required a work force of 384 slaves, 34 slave
drivers, 12 engineers, 2 turtle doves, and a partridge in a pear
tree. The work was managed by a command team composed of 2345
bureaucrats, 2347 secretaries (at least two of whom could type),
12,256 paper shufflers, 52,469 rubber stampers, 245,193 red tape
processors, and nearly one million dead trees.

We will now point out some of the more interesting features
of FCD#3 as we conduct you on a guided tour of the facilities:

        1) You start your tour here in the Dam Lobby. You will notice
on your right that...."`,

  PRAYER: `The prayer is inscribed in an ancient script, rarely used today. It seems
to be a philippic against small insects, absent-mindedness, and the picking
up and dropping of small objects. The final verse consigns trespassers to
the land of the dead. All evidence indicates that the beliefs of the ancient
Zorkers were obscure.`,

  ENGRAVINGS: `The engravings were incised in the living rock of the cave wall by
an unknown hand. They depict, in symbolic form, the beliefs of the
ancient Zorkers. Skillfully interwoven with the bas reliefs are excerpts
illustrating the major religious tenets of that time. Unfortunately, a
later age seems to have considered them blasphemous and just as skillfully
excised them.`,

  'OWNERS-MANUAL': `Congratulations!

You are the privileged owner of ZORK I: The Great Underground Empire,
a self-contained and self-maintaining universe. If used and maintained
in accordance with normal operating practices for small universes, ZORK
will provide many months of trouble-free operation.`,

  MAP: `The map shows a forest with three clearings. The largest clearing contains
a house. Three paths leave the large clearing. One of these paths, leading
southwest, is marked "To Stone Barrow".`,

  'BOAT-LABEL': `  !!!!FROBOZZ MAGIC BOAT COMPANY!!!!

Hello, Sailor!

Instructions for use:

   To get into a body of water, say "Launch".
   To get to shore, say "Land" or the direction in which you want
to maneuver the boat.

Warranty:

  This boat is guaranteed against all defects for a period of 76
milliseconds from date of purchase or until first used, whichever comes first.

Warning:
   This boat is made of thin plastic.
   Good Luck!`,

  'WOODEN-DOOR': `The engravings translate to "This space intentionally left blank."`,

  TUBE: `---> Frobozz Magic Gunk Company <---|
	  All-Purpose Gunk`,

  BOOK: `Commandment #12592

Oh ye who go about saying unto each:  "Hello sailor":
Dost thou know the magnitude of thy sin before the gods?
Yea, verily, thou shalt be ground between two stones.
Shall the angry gods cast thy body into the whirlpool?
Surely, thy eye shall be put out with a sharp stick!
Even unto the ends of the earth shalt thou wander and
Unto the land of the dead shalt thou be sent at last.
Surely thou shalt repent of thy cunning.`
};

/**
 * Direction names and abbreviations
 */
export const DIRECTIONS = [
  'NORTH', 'SOUTH', 'EAST', 'WEST',
  'NE', 'NW', 'SE', 'SW',
  'UP', 'DOWN', 'IN', 'OUT', 'LAND'
];

/**
 * Common error messages from original Zork I
 * These maintain the tone and style of the original game
 */
export const ERROR_MESSAGES = {
  // Parser errors
  UNKNOWN_WORD: "I don't know the word \"{word}\".",
  CANT_USE_WORD: "You used the word \"{word}\" in a way that I don't understand.",
  BEG_PARDON: "I beg your pardon?",
  CANT_HELP_CLUMSINESS: "I can't help your clumsiness.",
  CANT_CORRECT_QUOTED: "Sorry, you can't correct mistakes in quoted text.",
  COULDNT_UNDERSTAND: "I couldn't understand that sentence.",
  SENTENCE_NOT_RECOGNIZED: "That sentence isn't one I recognize.",
  NO_VERB: "There was no verb in that sentence!",
  TOO_MANY_NOUNS: "There were too many nouns in that sentence.",
  QUESTION_CANT_ANSWER: "That question can't be answered.",
  DONT_UNDERSTAND_REFERRING: "\"I don't understand! What are you referring to?\"",
  DONT_SEE_REFERRING: "I don't see what you are referring to.",
  DONT_SEE_WHAT_REFERRING: "I don't see what you're referring to.",
  CANT_USE_MULTIPLE: "You can't use multiple {type} objects with \"{verb}\".",
  
  // Object visibility
  CANT_SEE: "You can't see any {object} here.",
  CANT_SEE_THAT: "You can't see that here.",
  THOSE_THINGS_NOT_HERE: "Those things aren't here!",
  NOT_HERE: "You can't see any {object} here!",
  
  // Possession errors
  ALREADY_HAVE: "You already have that!",
  DONT_HAVE: "You don't have that.",
  NOT_HOLDING: "You're not holding that.",
  ARENT_HOLDING: "You aren't even holding the {object}.",
  NOT_HOLDING_PRSI: "That's easy for you to say since you don't even have the {object}.",
  
  // Taking/dropping
  CANT_TAKE: "You can't take the {object}.",
  TOO_HEAVY: "Your load is too heavy.",
  CANT_REACH: "You can't reach it; he's on the ceiling.",
  SECURELY_FASTENED: "The {object} is securely fastened to the {location}.",
  TOO_HEAVY_LIFT: "The {object} is too heavy to lift.",
  EXTREMELY_HEAVY: "The {object} is extremely heavy and cannot be carried.",
  
  // Movement errors
  CANT_GO_THAT_WAY: "You can't go that way.",
  MUST_SPECIFY_DIRECTION: "You must specify a direction to go.",
  CANT_HELP_THERE: "I can't help you there....",
  DOOR_CLOSED: "The door is closed.",
  DOOR_LOCKED: "The door is locked.",
  CANT_FIT_THROUGH: "You can't fit through this passage with that load.",
  CANT_REACH_ROPE: "You cannot reach the rope.",
  CANT_GO_UP: "You cannot climb any higher.",
  CANT_GO_DOWN: "You cannot go down without fracturing many bones.",
  CANT_GO_UPSTREAM: "You cannot go upstream due to strong currents.",
  
  // Container/door operations
  ALREADY_OPEN: "It is already open.",
  ALREADY_CLOSED: "It is already closed.",
  CANT_OPEN: "You can't open the {object}.",
  CANT_CLOSE: "You can't close the {object}.",
  MUST_TELL_HOW: "You must tell me how to do that to a {object}.",
  CANT_OPEN_THAT: "You must tell me how to do that to a {object}.",
  LOCKED: "The {object} is locked.",
  CANT_LOCK: "It doesn't seem to work.",
  CANT_PICK_LOCK: "You can't pick the lock.",
  CANT_REACH_LOCK: "You can't reach the lock from here.",
  CANT_LOCK_FROM_SIDE: "You can't lock it from this side.",
  WONT_FIT_THROUGH: "It won't fit through the grating.",
  
  // Container contents
  EMPTY_HANDED: "You are empty-handed.",
  NOT_CONTAINER: "That's not a container.",
  NOTHING_INSIDE: "The {object} is empty.",
  NOTHING_ON: "There is nothing on the {object}.",
  NOTHING_SPECIAL: "There's nothing special about the {object}.",
  CANT_SEE_INSIDE: "You can't look inside a {object}.",
  CLOSED: "The {object} is closed.",
  
  // Light sources
  PROVIDING_LIGHT: "The {object} is providing light.",
  CANT_TURN_ON: "You can't turn that on.",
  CANT_TURN_OFF: "You can't turn that off.",
  ALREADY_ON: "It is already on.",
  ALREADY_OFF: "It is already off.",
  TOO_HOT: "The {object} is too hot to touch.",
  
  // Combat/violence
  ATTACK_WITH_HANDS: "Trying to attack a {object} with your bare hands is suicidal.",
  ATTACK_WITH_OBJECT: "Trying to attack the {object} with a {weapon} is suicidal.",
  NOT_WEAPON: "The \"cutting edge\" of a {object} is hardly adequate.",
  CANT_ATTACK: "I've known strange people, but fighting a {object}?",
  CANT_MUNG: "Nice try.",
  CANT_BLAST: "You can't blast anything by using words.",
  
  // Interaction errors
  CANT_DO_THAT: "You can't do that.",
  CANT_DO_THAT_TO: "You can't do that to the {object}.",
  NOT_POSSIBLE: "That's not possible.",
  NICE_TRY: "Nice try.",
  BIZARRE: "Bizarre!",
  PREPOSTEROUS: "Preposterous!",
  COME_ON_NOW: "Come on, now!",
  SILLY: "That's silly!",
  PECULIAR: "How peculiar!",
  NOT_CLEAR_HOW: "It's really not clear how.",
  LOST_MIND: "You have lost your mind.",
  LOONY: "What a loony!",
  NUTS: "You're nuts!",
  JOKING: "You must be joking.",
  BIZARRE_CONCEPT: "What a bizarre concept!",
  STRANGE_CONCEPT: "Strange concept, cutting the {object}....",
  
  // NPCs/Actors
  PAYS_NO_ATTENTION: "The {object} pays no attention.",
  CANT_TALK_TO: "You cannot talk to that!",
  NOT_CONVERSATIONALIST: "The {object} isn't much of a conversationalist.",
  REFUSES_POLITELY: "The {object} refuses it politely.",
  CANT_GIVE_TO: "You can't give a {object} to a {target}!",
  
  // Specific actions
  CANT_READ: "You can't read the {object}.",
  NOTHING_TO_READ: "There is nothing to read on the {object}.",
  CANT_EAT: "I don't think that the {object} would agree with you.",
  CANT_DRINK: "How can you drink that?",
  NO_WATER_HERE: "There isn't any water here.",
  CANT_BURN: "You can't burn a {object}.",
  CANT_CLIMB: "You can't climb onto the {object}.",
  CANT_CROSS: "You can't cross that!",
  CANT_DIG: "Not a chance.",
  CANT_INFLATE: "How can you inflate that?",
  CANT_DEFLATE: "Come on, now!",
  CANT_MAKE: "You can't do that.",
  CANT_MELT: "It's not clear that a {object} can be melted.",
  CANT_MOVE: "You can't move the {object}.",
  CANT_PICK: "You can't pick that.",
  CANT_POUR: "You can't pour that.",
  CANT_SQUEEZE: "Keep your hands to yourself!",
  CANT_TIE: "You can't tie that.",
  CANT_UNTIE: "The {object} is not tied to anything.",
  
  // Misc
  NOTHING_HAPPENS: "Nothing happens.",
  DONT_UNDERSTAND: "I don't understand that.",
  WHICH_ONE: "Which {object} do you mean?",
  ITS_DARK: "It is pitch black. You are likely to be eaten by a grue.",
  GETTING_TIRED: "Getting tired?",
  NOT_BRIGHT_IDEA: "Not a bright idea, especially since you're in it.",
  SLIPS_THROUGH_FINGERS: "The water slips through your fingers.",
  SPEAK_UP: "You'll have to speak up if you expect me to hear you!",
  DENTAL_HYGIENE: "Dental hygiene is highly recommended, but I'm not sure what you want to brush them with.",
  INSULTS_WONT_HELP: "Insults of this nature won't help you.",
  HIGH_CLASS: "Such language in a high-class establishment like this!",
  SCHIZOPHRENIC: "It's a well known fact that only schizophrenics say \"Hello\" to a {object}.",
  
  // Default responses
  OK: "OK",
  TAKEN: "Taken.",
  DROPPED: "Dropped.",
  OPENED: "Opened.",
  CLOSED: "Closed.",
  DONE: "Done.",
  TIME_PASSES: "Time passes..."
};

/**
 * Standard responses
 */
export const STANDARD_RESPONSES = {
  OK: "OK",
  TAKEN: "Taken.",
  DROPPED: "Dropped.",
  OPENED: "Opened.",
  CLOSED: "Closed.",
  TURNED_ON: "The {object} is now on.",
  TURNED_OFF: "The {object} is now off.",
  YOU_CANT: "You can't do that.",
  TIME_PASSES: "Time passes..."
};

/**
 * Helper function to format error messages with placeholders
 * @param template - Message template with {placeholder} syntax
 * @param replacements - Object with placeholder values
 * @returns Formatted message
 */
export function formatMessage(template: string, replacements: Record<string, string> = {}): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Get a contextual error message based on the action and object
 * @param action - The action being attempted
 * @param objectName - The object involved
 * @param reason - Optional specific reason for failure
 * @returns Appropriate error message
 */
export function getContextualError(action: string, objectName?: string, reason?: string): string {
  if (reason) {
    return reason;
  }
  
  // Map actions to appropriate error messages
  const actionErrorMap: Record<string, string> = {
    'take': objectName ? formatMessage(ERROR_MESSAGES.CANT_TAKE, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'drop': ERROR_MESSAGES.DONT_HAVE,
    'open': objectName ? formatMessage(ERROR_MESSAGES.CANT_OPEN, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'close': objectName ? formatMessage(ERROR_MESSAGES.CANT_CLOSE, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'read': objectName ? formatMessage(ERROR_MESSAGES.CANT_READ, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'eat': objectName ? formatMessage(ERROR_MESSAGES.CANT_EAT, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'attack': objectName ? formatMessage(ERROR_MESSAGES.CANT_ATTACK, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'move': objectName ? formatMessage(ERROR_MESSAGES.CANT_MOVE, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'climb': objectName ? formatMessage(ERROR_MESSAGES.CANT_CLIMB, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
    'burn': objectName ? formatMessage(ERROR_MESSAGES.CANT_BURN, { object: objectName }) : ERROR_MESSAGES.CANT_DO_THAT,
  };
  
  return actionErrorMap[action.toLowerCase()] || ERROR_MESSAGES.CANT_DO_THAT;
}

/**
 * Pick a random message from an array (for variety)
 * @param messages - Array of possible messages
 * @returns Random message from the array
 */
export function pickRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Varied responses for common situations
 */
export const VARIED_RESPONSES = {
  ALREADY_DONE: [
    "It's already done.",
    "That's already the case.",
    "Nothing changes."
  ],
  CANT_SEE_VARIATIONS: [
    "You can't see that here.",
    "I don't see that here.",
    "That's not visible."
  ],
  CONFUSION: [
    "I don't understand that.",
    "That doesn't make sense.",
    "I'm not sure what you mean."
  ]
};
