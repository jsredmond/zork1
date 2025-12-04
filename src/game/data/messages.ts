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
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNKNOWN_WORD: "I don't know the word \"{word}\".",
  CANT_SEE: "You can't see any {object} here!",
  ALREADY_HAVE: "You already have that!",
  CANT_TAKE: "You can't take that.",
  TOO_HEAVY: "Your load is too heavy.",
  DONT_HAVE: "You don't have that!",
  CANT_DO_THAT: "You can't do that.",
  NOTHING_HAPPENS: "Nothing happens.",
  DONT_UNDERSTAND: "I don't understand that.",
  WHICH_ONE: "Which {object} do you mean?",
  CANT_GO_THAT_WAY: "You can't go that way.",
  ITS_DARK: "It is pitch black. You are likely to be eaten by a grue.",
  ALREADY_OPEN: "It's already open.",
  ALREADY_CLOSED: "It's already closed.",
  CANT_OPEN: "You can't open that.",
  CANT_CLOSE: "You can't close that.",
  EMPTY_HANDED: "You are empty-handed.",
  NOT_CONTAINER: "That's not a container.",
  NOTHING_INSIDE: "There's nothing in the {object}."
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
