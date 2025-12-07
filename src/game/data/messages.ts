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
  
  // OOPS command messages (gparser.zil)
  OOPS_NO_WORD: "There was no word to replace!",
  OOPS_MULTI_WORD_WARNING: "Warning: only the first word after OOPS is used.",
  
  // AGAIN/G command messages (gparser.zil)
  AGAIN_BEG_PARDON: "Beg pardon?",
  AGAIN_REPEAT_MISTAKE: "That would just repeat a mistake.",
  AGAIN_FRAGMENTS: "It's difficult to repeat fragments.",
  AGAIN_SYNTAX_ERROR: "I couldn't understand that sentence.",
  
  // Parser ambiguity (WHICH-PRINT in gparser.zil)
  WHICH_ONE: "Which {object} do you mean?",
  
  // SAY verb special case
  SAY_NOTHING_HAPPENS: "Nothing happens.",
  
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
  PRETTY_WEIRD: "That's pretty weird.",
  ONLY_YOUR_OPINION: "That's only your opinion.",
  NOT_CLEAR_HOW: "It's really not clear how.",
  LOST_MIND: "You have lost your mind.",
  LOONY: "What a loony!",
  NUTS: "You're nuts!",
  JOKING: "You must be joking.",
  BIZARRE_CONCEPT: "What a bizarre concept!",
  STRANGE_CONCEPT: "Strange concept, cutting the {object}....",
  VALIANT_ATTEMPT: "A valiant attempt.",
  CANT_BE_SERIOUS: "You can't be serious.",
  INTERESTING_IDEA: "An interesting idea...",
  WHAT_A_CONCEPT: "What a concept!",
  
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
  
  // Contextual errors
  CANT_REACH_CLOSED: "You can't reach something that's inside a closed container.",
  CANT_REACH_FLOATING: "You can't reach that. It's floating above your head.",
  CANT_REACH_CEILING: "You can't reach him; he's on the ceiling.",
  CANT_FIT_CRACK: "You can't fit through the crack.",
  CANT_GET_UP_CARRYING: "You can't get up there with what you're carrying.",
  BOARDED_CANT_OPEN: "The windows are boarded and can't be opened.",
  DOOR_BOARDED: "The door is boarded and you can't remove the boards.",
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
    // Escape special characters in the replacement value to prevent issues with $ and other special chars
    const escapedValue = value.replace(/\$/g, '$$$$');
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), escapedValue);
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
 * Implements PICK-ONE functionality from ZIL
 * @param messages - Array of possible messages
 * @returns Random message from the array
 */
export function pickRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random refusal message for impossible actions
 * @returns Random refusal message
 */
export function getRefusalMessage(): string {
  return pickRandomMessage(REFUSAL_MESSAGES);
}

/**
 * Get a random ineffective action message
 * @param objectName - Name of the object being acted upon
 * @returns Formatted ineffective action message
 */
export function getIneffectiveActionMessage(objectName: string): string {
  const suffix = pickRandomMessage(INEFFECTIVE_ACTION_MESSAGES);
  return `${objectName}${suffix}`;
}

/**
 * Get a random hello message
 * @returns Random greeting
 */
export function getHelloMessage(): string {
  return pickRandomMessage(HELLO_MESSAGES);
}

/**
 * Get a random silly action message
 * @returns Random silly response
 */
export function getSillyActionMessage(): string {
  return pickRandomMessage(SILLY_ACTION_MESSAGES);
}

/**
 * Get a random generic refusal message (YUKS)
 * @returns Random refusal response
 */
export function getGenericRefusalMessage(): string {
  return pickRandomMessage(GENERIC_REFUSAL_MESSAGES);
}

/**
 * Get a random jump failure message
 * @returns Random jump failure message
 */
export function getJumpFailureMessage(): string {
  return pickRandomMessage(JUMP_FAILURE_MESSAGES);
}

/**
 * Get a humorous response for a specific action
 * @param action - The action key from HUMOROUS_RESPONSES
 * @param replacements - Optional replacements for placeholders
 * @returns Formatted humorous response
 */
export function getHumorousResponse(action: string, replacements: Record<string, string> = {}): string {
  const response = HUMOROUS_RESPONSES[action as keyof typeof HUMOROUS_RESPONSES];
  if (!response) {
    return ERROR_MESSAGES.CANT_DO_THAT;
  }
  return formatMessage(response, replacements);
}

/**
 * Get a parser feedback message with variation
 * @param feedbackType - Type of feedback (AMBIGUOUS, NOT_HERE, etc.)
 * @param replacements - Optional replacements for placeholders
 * @returns Formatted parser feedback message
 */
export function getParserFeedback(feedbackType: string, replacements: Record<string, string> = {}): string {
  const messages = PARSER_FEEDBACK[feedbackType as keyof typeof PARSER_FEEDBACK];
  if (!messages || !Array.isArray(messages)) {
    return ERROR_MESSAGES.DONT_UNDERSTAND;
  }
  const message = pickRandomMessage(messages);
  return formatMessage(message, replacements);
}

/**
 * Message rotation state for repeated actions
 * Tracks which message was last used for each context
 */
const messageRotationState = new Map<string, number>();

/**
 * Get a message with rotation (PICK-ONE style from ZIL)
 * Cycles through messages to provide variety for repeated actions
 * @param context - Context key for tracking rotation
 * @param messages - Array of messages to rotate through
 * @returns Next message in rotation
 */
export function getRotatedMessage(context: string, messages: string[]): string {
  if (messages.length === 0) {
    return "";
  }
  if (messages.length === 1) {
    return messages[0];
  }
  
  const currentIndex = messageRotationState.get(context) || 0;
  const nextIndex = (currentIndex + 1) % messages.length;
  messageRotationState.set(context, nextIndex);
  
  return messages[currentIndex];
}

/**
 * Reset message rotation for a specific context
 * @param context - Context key to reset
 */
export function resetMessageRotation(context: string): void {
  messageRotationState.delete(context);
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

/**
 * Generic refusal messages for impossible actions (YUKS from gverbs.zil)
 * Used when player attempts to take/manipulate objects that can't be taken
 */
export const REFUSAL_MESSAGES = [
  "A valiant attempt.",
  "You can't be serious.",
  "An interesting idea...",
  "What a concept!"
];

/**
 * Messages for ineffective actions (HO-HUM from gverbs.zil)
 * Used for PUSH, PULL, WAVE, RUB, LOWER, RAISE, etc.
 */
export const INEFFECTIVE_ACTION_MESSAGES = [
  " doesn't seem to work.",
  " isn't notably helpful.",
  " has no effect."
];

/**
 * Greeting variations (HELLOS from gverbs.zil)
 */
export const HELLO_MESSAGES = [
  "Hello.",
  "Good day.",
  "Nice weather we've been having lately.",
  "Goodbye."
];

/**
 * Silly action responses (WHEEEEE from gverbs.zil)
 * Used for SKIP, JUMP, and other playful actions
 */
export const SILLY_ACTION_MESSAGES = [
  "Very good. Now you can go to the second grade.",
  "Are you enjoying yourself?",
  "Wheeeeeeeeee!!!!!",
  "Do you expect me to applaud?"
];

/**
 * Generic refusal messages (YUKS from gverbs.zil)
 * Used for various impossible or silly actions
 */
export const GENERIC_REFUSAL_MESSAGES = [
  "A valiant attempt.",
  "You can't be serious.",
  "An interesting idea...",
  "What a concept!"
];

/**
 * Jump failure messages (JUMPLOSS from gverbs.zil)
 */
export const JUMP_FAILURE_MESSAGES = [
  "You should have looked before you leaped.",
  "In the movies, your life would be passing before your eyes.",
  "Geronimo..."
];

/**
 * Miscellaneous feedback messages (DUMMY from gverbs.zil)
 */
export const MISC_FEEDBACK_MESSAGES = [
  "Look around.",
  "Too late for that.",
  "Have your eyes checked."
];

/**
 * Humorous responses to silly commands
 * From various V-* routines in gverbs.zil
 */
export const HUMOROUS_RESPONSES = {
  ADVENT: 'A hollow voice says "Fool."',
  BLAST: "You can't blast anything by using words.",
  BUG: "Bug? Not in a flawless program like this! (Cough, cough).",
  CHOMP: "Preposterous!",
  COUNT_BLESSINGS: "Well, for one, you are playing Zork...",
  COUNT_OTHER: "You have lost your mind.",
  CURSES_AT_OBJECT: "Insults of this nature won't help you.",
  CURSES_AT_ACTOR: "Insults of this nature won't help you.",
  CURSES_GENERAL: "Such language in a high-class establishment like this!",
  EXORCISE: "What a bizarre concept!",
  FOLLOW: "You're nuts!",
  FROBOZZ: "The FROBOZZ Corporation created, owns, and operates this dungeon.",
  HATCH: "Bizarre!",
  HELLO_TO_ACTOR: "The {actor} bows his head to you in greeting.",
  HELLO_TO_OBJECT: "It's a well known fact that only schizophrenics say \"Hello\" to a {object}.",
  KISS: "I'd sooner kiss a pig.",
  KNOCK_ON_DOOR: "Nobody's home.",
  KNOCK_ON_OTHER: "Why knock on a {object}?",
  LEAN_ON: "Getting tired?",
  MAKE: "You can't do that.",
  MUMBLE: "You'll have to speak up if you expect me to hear you!",
  ODYSSEUS: "Wasn't he a sailor?",
  OIL: "You probably put spinach in your gas tank, too.",
  PLAY_ACTOR: "You become so engrossed in the role of the {actor} that you kill yourself, just as he might have done!",
  PLAY_OTHER: "That's silly!",
  PLUG: "This has no effect.",
  PRAY: "If you pray enough, your prayers may be answered.",
  RAPE: "What a (ahem!) strange idea.",
  REPENT: "It could very well be too late!",
  REPLY: "It is hardly likely that the {object} is interested.",
  RING: "How, exactly, can you ring that?",
  SAY_WHAT: "Say what?",
  SAY_TO_SELF: "Talking to yourself is a sign of impending mental collapse.",
  SEARCH: "You find nothing unusual.",
  SEND_ACTOR: "Why would you send for the {actor}?",
  SEND_OTHER: "That doesn't make sends.",
  SMELL: "It smells like a {object}.",
  SPIN: "You can't spin that!",
  SQUEEZE_ACTOR: "The {actor} does not understand this.",
  SQUEEZE_OTHER: "How singularly useless.",
  STAB_NO_WEAPON: "No doubt you propose to stab the {object} with your pinky?",
  STAND: "You are already standing, I think.",
  STAY: "You will be lost without me!",
  SWIM_IN_DUNGEON: "Swimming isn't usually allowed in the dungeon.",
  SWIM_OTHER: "Go jump in a lake!",
  THROW_AT_SELF: "A terrific throw! The {object} hits you squarely in the head.",
  THROW_AT_ACTOR: "The {actor} ducks as the {object} flies by and crashes to the ground.",
  TIE_TO_SELF: "You can't tie anything to yourself.",
  TIE_OTHER: "You can't tie the {object} to that.",
  TIE_UP: "You could certainly never tie it with that!",
  UNTIE: "This cannot be tied, so it cannot be untied!",
  WEAR_CANT: "You can't wear the {object}.",
  WIN: "Naturally!",
  WIND: "You cannot wind up a {object}.",
  WISH: "With luck, your wish will come true.",
  YELL: "Aaaarrrrgggghhhh!",
  ZORK: "At your service!"
};

/**
 * Parser feedback variations
 * Multiple ways to express common parser messages
 */
export const PARSER_FEEDBACK = {
  AMBIGUOUS: [
    "Which {object} do you mean?",
    "I see more than one {object} here.",
    "Be more specific about which {object}."
  ],
  NOT_HERE: [
    "You can't see any {object} here.",
    "I don't see any {object} here.",
    "There is no {object} here."
  ],
  DONT_HAVE: [
    "You don't have that.",
    "You're not holding that.",
    "You aren't carrying the {object}."
  ],
  CANT_SEE: [
    "You can't see that here.",
    "I don't see that here.",
    "That's not visible."
  ],
  UNKNOWN_WORD: [
    "I don't know the word \"{word}\".",
    "The word \"{word}\" is not in my vocabulary.",
    "I don't understand the word \"{word}\"."
  ],
  DONT_UNDERSTAND: [
    "I don't understand that.",
    "That doesn't make sense.",
    "I couldn't understand that sentence.",
    "I beg your pardon?"
  ],
  NO_VERB: [
    "There was no verb in that sentence!",
    "I don't see a verb there.",
    "What do you want to do?"
  ]
};
