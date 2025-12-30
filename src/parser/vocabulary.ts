/**
 * Vocabulary - Word definitions
 * Manages game vocabulary and word lookup
 */

import { TokenType } from './lexer';

/**
 * Word entry in the vocabulary
 */
interface WordEntry {
  word: string;
  type: TokenType;
  canonicalForm?: string; // For synonyms, points to the canonical word
}

/**
 * Vocabulary class manages all game words and their types
 */
export class Vocabulary {
  private words: Map<string, WordEntry> = new Map();
  private abbreviations: Map<string, string> = new Map();

  constructor() {
    this.initializeVocabulary();
    this.initializeAbbreviations();
  }

  /**
   * Look up a word in the vocabulary
   * @param word - The word to look up (should be lowercase)
   * @returns The token type, or UNKNOWN if not found
   */
  lookupWord(word: string): TokenType {
    const entry = this.words.get(word.toLowerCase());
    return entry ? entry.type : TokenType.UNKNOWN;
  }

  /**
   * Get the canonical form of a word (for synonyms)
   * @param word - The word to look up
   * @returns The canonical form, or the word itself if not a synonym
   */
  getCanonicalForm(word: string): string {
    const entry = this.words.get(word.toLowerCase());
    return entry?.canonicalForm || word;
  }

  /**
   * Check if a word is in the vocabulary
   * @param word - The word to check
   * @returns true if the word is known
   */
  hasWord(word: string): boolean {
    return this.words.has(word.toLowerCase());
  }

  /**
   * Expand abbreviations to their full forms
   * @param word - The word to expand
   * @returns The expanded word, or the original if not an abbreviation
   */
  expandAbbreviation(word: string): string {
    const expanded = this.abbreviations.get(word.toLowerCase());
    return expanded || word;
  }

  /**
   * Check if a word is an abbreviation
   * @param word - The word to check
   * @returns true if the word is a known abbreviation
   */
  isAbbreviation(word: string): boolean {
    return this.abbreviations.has(word.toLowerCase());
  }

  /**
   * Add a word to the vocabulary
   * @param word - The word to add
   * @param type - The token type
   * @param canonicalForm - Optional canonical form for synonyms
   */
  private addWord(word: string, type: TokenType, canonicalForm?: string): void {
    this.words.set(word.toLowerCase(), {
      word: word.toLowerCase(),
      type,
      canonicalForm,
    });
  }

  /**
   * Initialize the vocabulary with all game words
   */
  private initializeVocabulary(): void {
    this.loadVerbs();
    this.loadPrepositions();
    this.loadDirections();
    this.loadArticles();
    this.loadPronouns();
    this.loadConjunctions();
    this.loadNouns();
    this.loadAdjectives();
  }

  /**
   * Initialize common abbreviations
   * Maps abbreviations to their full forms
   */
  private initializeAbbreviations(): void {
    // Direction abbreviations
    this.abbreviations.set('n', 'north');
    this.abbreviations.set('s', 'south');
    this.abbreviations.set('e', 'east');
    this.abbreviations.set('w', 'west');
    this.abbreviations.set('u', 'up');
    this.abbreviations.set('d', 'down');
    this.abbreviations.set('ne', 'northeast');
    this.abbreviations.set('nw', 'northwest');
    this.abbreviations.set('se', 'southeast');
    this.abbreviations.set('sw', 'southwest');

    // Command abbreviations
    this.abbreviations.set('i', 'inventory');
    this.abbreviations.set('x', 'examine');
    this.abbreviations.set('l', 'look');
    this.abbreviations.set('z', 'wait');
    this.abbreviations.set('q', 'quit');
    this.abbreviations.set('y', 'yes');

    // Common verb abbreviations
    this.abbreviations.set('g', 'again');
  }

  /**
   * Load verb definitions from ZIL source (gverbs.zil)
   */
  private loadVerbs(): void {
    // Core verbs from gverbs.zil
    const verbs = [
      'TAKE', 'GET', 'HOLD', 'CARRY', 'REMOVE', 'GRAB', 'CATCH',
      'DROP', 'PUT', 'PLACE', 'INSERT', 'STUFF', 'HIDE',
      'OPEN', 'CLOSE',
      'EXAMINE', 'X', 'LOOK', 'L', 'READ', 'DESCRIBE',
      'INVENTORY', 'I',
      'GO', 'WALK', 'RUN', 'PROCEED', 'STEP',
      'ATTACK', 'FIGHT', 'KILL', 'HURT', 'INJURE', 'HIT', 'MURDER', 'SLAY',
      'EAT', 'DRINK', 'CONSUME', 'TASTE', 'BITE',
      'GIVE', 'OFFER', 'FEED', 'DONATE',
      'THROW', 'TOSS', 'HURL', 'CHUCK',
      'TURN', 'FLIP', 'SET',
      'PUSH', 'PRESS', 'PULL', 'TUG', 'YANK',
      'MOVE', 'ROLL',
      'CLIMB', 'SIT',
      'LIGHT', 'EXTINGUISH', 'DOUSE',
      'UNLOCK', 'LOCK',
      'TIE', 'UNTIE', 'FASTEN', 'UNFASTEN',
      'SEARCH', 'FIND', 'SEEK',
      'WAIT', 'Z',
      'QUIT', 'Q',
      'SAVE', 'RESTORE',
      'SCORE', 'RESTART',
      'VERBOSE', 'BRIEF', 'SUPERBRIEF',
      'DIAGNOSE',
      'HELLO', 'HI',
      'GOODBYE', 'BYE',
      'THANK',
      'YES', 'Y', 'NO',
      'TELL', 'ASK', 'ANSWER', 'REPLY',
      'BOARD', 'ENTER', 'DISEMBARK',  // Removed 'EXIT', 'LEAVE' - now directions
      'FILL', 'EMPTY', 'POUR', 'SPILL',
      'BREAK', 'SMASH', 'DESTROY', 'DAMAGE',
      'BURN', 'IGNITE', 'INCINERATE',
      'CUT', 'SLICE', 'PIERCE',
      'DIG',
      'INFLATE', 'DEFLATE',
      'KICK', 'KISS',
      'KNOCK', 'RAP',
      'LISTEN',
      'MAKE',
      'MELT',
      'OIL', 'GREASE', 'LUBRICATE',
      'PLAY',
      'PRAY',
      'RAISE', 'LIFT', 'LOWER',
      'RING',
      'RUB', 'TOUCH', 'FEEL',
      'SHAKE',
      'SMELL', 'SNIFF',
      'SQUEEZE',
      'STAND',
      'STRIKE',
      'SWIM', 'WADE',
      'SWING',
      'WAVE',
      'WEAR',
      'WIND',
      'YELL', 'SCREAM', 'SHOUT',
      'SAY', 'ECHO', 'DANCE', 'SLEEP', 'WAKE',
      'ULYSSES',  // Magic word that can be spoken by itself
      'XYZZY', 'PLUGH', 'PLOVER',  // Magic words from Adventure
      'JUMP', 'LEAP', 'DIVE',
      'CURSE', 'SHIT', 'FUCK', 'DAMN',
      'SING',
      'AGAIN', 'G',  // Repeat last command
      'VERSION',  // Show version information
    ];

    verbs.forEach(verb => this.addWord(verb, TokenType.VERB));
  }

  /**
   * Load preposition definitions from ZIL source (gsyntax.zil)
   */
  private loadPrepositions(): void {
    const prepositions = [
      'WITH', 'USING', 'THROUGH', 'THRU',
      'IN', 'INSIDE', 'INTO',
      'ON', 'ONTO',
      'UNDER', 'UNDERNEATH', 'BENEATH', 'BELOW',
      'AT', 'TO', 'FROM',
      'FOR', 'ABOUT',
      'OFF', 'OVER',  // Removed 'OUT' - now a direction
      'BEHIND',
      'ACROSS',
      'AROUND',
      'AGAINST',
      'BETWEEN',
    ];

    prepositions.forEach(prep => this.addWord(prep, TokenType.PREPOSITION));
  }

  /**
   * Load direction words from ZIL source (gsyntax.zil)
   */
  private loadDirections(): void {
    const directions = [
      'NORTH', 'N',
      'SOUTH', 'S',
      'EAST', 'E',
      'WEST', 'W',
      'UP', 'U',
      'DOWN', 'D',
      'NORTHEAST', 'NE',
      'NORTHWEST', 'NW',
      'SOUTHEAST', 'SE',
      'SOUTHWEST', 'SW',
      'OUT', 'EXIT', 'LEAVE',  // Exit/leave direction synonyms
    ];

    directions.forEach(dir => this.addWord(dir, TokenType.DIRECTION));
  }

  /**
   * Load articles
   */
  private loadArticles(): void {
    const articles = ['THE', 'A', 'AN'];
    articles.forEach(article => this.addWord(article, TokenType.ARTICLE));
  }

  /**
   * Load pronouns
   */
  private loadPronouns(): void {
    const pronouns = ['IT', 'THEM', 'ALL', 'EVERYTHING', 'YOU'];
    pronouns.forEach(pronoun => this.addWord(pronoun, TokenType.PRONOUN));
  }

  /**
   * Load conjunctions
   */
  private loadConjunctions(): void {
    const conjunctions = ['AND', 'THEN'];
    conjunctions.forEach(conj => this.addWord(conj, TokenType.CONJUNCTION));
  }

  /**
   * Load noun synonyms from object definitions
   * These are extracted from the objects in the game
   */
  private loadNouns(): void {
    // Common nouns from Zork I objects
    const nouns = [
      'MYSELF', 'ME',  // Self-reference for easter eggs
      // 'UP',  // Removed - conflicts with UP direction
      'SKULL', 'HEAD',
      'CHALICE', 'CUP',
      'TRIDENT', 'FORK',
      'DIAMOND',
      'EMERALD',
      'FIGURINE',
      'SWORD', 'BLADE', 'WEAPON',
      'LAMP', 'LANTERN', // 'LIGHT', // Commented out - conflicts with LIGHT verb
      'ROPE',
      'KNIFE',
      'TORCH',
      'TREASURE', 'TREASURES',
      'TEST',  // For echo test command
      'DOOR', 'DOORS',
      'WINDOW', 'WINDOWS',
      'WALL', 'WALLS',
      'FLOOR', 'GROUND',
      'CEILING',
      'SKY',
      'HOUSE', 'BUILDING',
      'TREE', 'TREES',
      'FOREST',
      'WATER', 'STREAM', 'RIVER',
      'MAILBOX', 'BOX',
      'LEAFLET', 'BOOKLET', 'PAMPHLET',
      'MAT', 'RUG',
      'TRAP', 'TRAPDOOR',
      'GRATING',
      'LEAVES', 'LEAF',
      'NEST', 'BIRD',
      'EGG', 'EGGS',
      'JEWEL', 'JEWELS', 'JEWELRY',
      'COINS', 'COIN',
      'COFFIN', 'CASKET',
      'SCEPTRE', 'SCEPTER',
      'BRACELET',
      'NECKLACE',
      'PAINTING', 'PICTURE',
      'BOTTLE', 'FLASK',
      'FOOD', 'LUNCH', 'DINNER',
      'GARLIC', 'CLOVE',
      'BOOK', 'BOOKS',
      'CANDLES', 'CANDLE',
      'MATCH', 'MATCHES',
      'WRENCH',
      'SCREWDRIVER',
      'HANDS', 'HAND',
      'LUNGS',
      'SELF', 'ME', 'MYSELF',
      'THIEF', 'ROBBER', 'BURGLAR',
      'TROLL', 'MONSTER',
      'CYCLOPS', 'GIANT',
      'CASE', 'TROPHY',
      'BAG', 'SACK',
      'CHEST',
      'BASKET',
      'BUCKET', 'PAIL',
      'POT',
      'SHOVEL', 'SPADE',
      'AXE', 'HATCHET',
      'BELL',
      'BUOY',
      'PUMP',
      'SLIDE',
      'MACHINE',
      'SWITCH', 'BUTTON', 'LEVER',
      'MIRROR', 'GLASS',
      'POLE',
      'BOARD', 'BOARDS', 'PLANK',
      'BOLT',
      'BUBBLE', 'BUBBLES',
      'COAL',
      'DIAMOND',
      'PILE',
      'SAND',
      'STONE', 'ROCK', 'STONES', 'ROCKS',
      'TEETH', 'TOOTH',
      'TIMBER',
      'TOOL', 'TOOLS',
    ];

    nouns.forEach(noun => this.addWord(noun, TokenType.NOUN));
  }

  /**
   * Load adjectives from object definitions
   */
  private loadAdjectives(): void {
    const adjectives = [
      'WHITE',  // Z-Machine parity: WHITE is an adjective for WHITE-HOUSE
      'CRYSTAL',
      'SILVER',
      'GOLD', 'GOLDEN',
      'BRASS',
      'WOODEN',
      'RUSTY',
      'SMALL', 'TINY', 'LITTLE',
      'LARGE', 'BIG', 'HUGE', 'ENORMOUS',
      'OLD', 'ANCIENT',
      'NEW',
      'BROKEN',
      'SHARP',
      'DULL',
      'HEAVY',
      // 'LIGHT', // Commented out - conflicts with LIGHT verb, and objects use "BRASS LANTERN" not "LIGHT LANTERN"
      'DARK',
      'BLACK',
      'BRIGHT',
      'SHINY',
      'DIRTY',
      'CLEAN',
      'WET',
      'DRY',
      'HOT',
      'COLD',
      'WARM',
      'COOL',
      'BEAUTIFUL',
      'UGLY',
      'STRANGE',
      'NORMAL',
      'MAGIC', 'MAGICAL',
      'DEAD',
      'LIVING',
      'LOCKED',
      'UNLOCKED',
      'EMPTY',
      'FULL',
      'JADE',
      'IVORY',
      'PLATINUM',
      'JEWELED',
      'ENGRAVED',
      'CARVED',
      'PAINTED',
      'LEATHER',
      'CLOTH',
      'STEEL',
      'IRON',
      'COPPER',
      'BRONZE',
      'STONE',
      'MARBLE',
      'GRANITE',
      'SANDY',
      'ROCKY',
      'LEAFY',
      'GRASSY',
      'MUDDY',
      'DUSTY',
      'RUSTY',
      'MOLDY',
      'ROTTEN',
      'FRESH',
      'STALE',
      'SWEET',
      'SOUR',
      'BITTER',
      'SALTY',
      'SPICY',
      'BLAND',
      'DELICIOUS',
      'DISGUSTING',
      'FRAGRANT',
      'SMELLY',
      'LOUD',
      'QUIET',
      'SILENT',
      'NOISY',
    ];

    adjectives.forEach(adj => this.addWord(adj, TokenType.ADJECTIVE));
  }
}
