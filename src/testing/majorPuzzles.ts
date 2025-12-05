/**
 * Major Puzzle Test Cases
 * Defines test cases for the major puzzles in Zork I
 */

import { PuzzleTestCase } from './puzzleTester.js';
import { ObjectFlag } from '../game/data/flags.js';

/**
 * Grating Puzzle Test Case
 * Open the grating with keys to access the dungeon
 */
export const GRATING_PUZZLE: PuzzleTestCase = {
  puzzleId: 'GRATING',
  name: 'Grating Puzzle',
  description: 'Move leaves to reveal grating, then unlock it with keys',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'KEYS'
    }
  ],
  solutionSteps: [
    {
      action: 'REVEAL_GRATING',
      expectedSuccess: true,
      expectedMessageContains: 'grating is revealed'
    },
    {
      action: 'UNLOCK_GRATING',
      objectId: 'KEYS',
      expectedSuccess: true,
      expectedMessageContains: 'unlocked'
    }
  ],
  expectedStateChanges: [
    {
      type: 'OBJECT_FLAG',
      objectId: 'GRATE',
      objectFlag: ObjectFlag.OPENBIT,
      expectedValue: true
    },
    {
      type: 'OBJECT_FLAG',
      objectId: 'GRATE',
      objectFlag: ObjectFlag.INVISIBLE,
      expectedValue: false
    },
    {
      type: 'GLOBAL_VARIABLE',
      variableName: 'GRATE_REVEALED',
      expectedValue: true
    }
  ]
};

/**
 * Troll Puzzle Test Case
 * Kill the troll or give him treasure to pass
 */
export const TROLL_PUZZLE: PuzzleTestCase = {
  puzzleId: 'TROLL',
  name: 'Troll Puzzle',
  description: 'Defeat the troll to open passages',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'SWORD'
    }
  ],
  solutionSteps: [
    // Note: This is simplified - actual combat is more complex
    // In a real test, we'd need to simulate combat rounds
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'TROLL_FLAG',
      expectedValue: true
    }
  ]
};

/**
 * Cyclops Puzzle Test Case
 * Feed the cyclops lunch and water to make him sleep
 */
export const CYCLOPS_PUZZLE: PuzzleTestCase = {
  puzzleId: 'CYCLOPS',
  name: 'Cyclops Puzzle',
  description: 'Feed cyclops hot peppers and water to make him sleep',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'LUNCH'
    },
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'BOTTLE'
    },
    {
      type: 'OBJECT_IN_ROOM',
      objectId: 'WATER',
      roomId: 'BOTTLE'
    }
  ],
  solutionSteps: [
    // Note: This requires giving items to the cyclops
    // The actual implementation would use GIVE action
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'CYCLOPS_FLAG',
      expectedValue: true
    }
  ]
};

/**
 * Dam Puzzle Test Case
 * Control the dam gates to manage water levels
 */
export const DAM_PUZZLE: PuzzleTestCase = {
  puzzleId: 'DAM',
  name: 'Dam Puzzle',
  description: 'Turn bolt with wrench to control dam gates',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'WRENCH'
    }
  ],
  solutionSteps: [
    {
      action: 'PUSH_BUTTON',
      objectId: 'YELLOW-BUTTON',
      expectedSuccess: true,
      expectedMessageContains: 'click'
    },
    {
      action: 'TURN_BOLT',
      objectId: 'WRENCH',
      expectedSuccess: true,
      expectedMessageContains: 'gates open'
    }
  ],
  expectedStateChanges: [
    {
      type: 'GLOBAL_VARIABLE',
      variableName: 'GATE_FLAG',
      expectedValue: true
    },
    {
      type: 'GLOBAL_VARIABLE',
      variableName: 'GATES_OPEN',
      expectedValue: true
    }
  ]
};

/**
 * Thief Puzzle Test Case
 * Defeat the thief to access the treasure room
 */
export const THIEF_PUZZLE: PuzzleTestCase = {
  puzzleId: 'THIEF',
  name: 'Thief Puzzle',
  description: 'Defeat the thief in combat',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'SWORD'
    }
  ],
  solutionSteps: [
    // Note: This is simplified - actual combat is more complex
    // In a real test, we'd need to simulate combat rounds
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'THIEF_FLAG',
      expectedValue: true
    }
  ]
};

/**
 * Trap Door Puzzle Test Case
 * Move rug and open trap door to access cellar
 */
export const TRAP_DOOR_PUZZLE: PuzzleTestCase = {
  puzzleId: 'TRAP_DOOR',
  name: 'Trap Door Puzzle',
  description: 'Move rug to reveal trap door, then open it',
  prerequisites: [],
  solutionSteps: [
    {
      action: 'MOVE_RUG',
      expectedSuccess: true,
      expectedMessageContains: 'trap door'
    },
    {
      action: 'OPEN_TRAP_DOOR',
      expectedSuccess: true,
      expectedMessageContains: 'staircase'
    }
  ],
  expectedStateChanges: [
    {
      type: 'OBJECT_FLAG',
      objectId: 'TRAP-DOOR',
      objectFlag: ObjectFlag.INVISIBLE,
      expectedValue: false
    },
    {
      type: 'OBJECT_FLAG',
      objectId: 'TRAP-DOOR',
      objectFlag: ObjectFlag.OPENBIT,
      expectedValue: true
    }
  ]
};

/**
 * Rainbow Puzzle Test Case
 * Wave sceptre to make rainbow solid and climbable
 */
export const RAINBOW_PUZZLE: PuzzleTestCase = {
  puzzleId: 'RAINBOW',
  name: 'Rainbow Puzzle',
  description: 'Wave sceptre to make rainbow appear',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'SCEPTRE'
    }
  ],
  solutionSteps: [
    {
      action: 'WAVE_SCEPTRE',
      objectId: 'SCEPTRE',
      expectedSuccess: true,
      expectedMessageContains: 'rainbow'
    }
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'RAINBOW_FLAG',
      expectedValue: true
    }
  ]
};

/**
 * Boat Puzzle Test Case
 * Inflate boat with pump to navigate water
 */
export const BOAT_PUZZLE: PuzzleTestCase = {
  puzzleId: 'BOAT',
  name: 'Boat Puzzle',
  description: 'Inflate boat with pump',
  prerequisites: [
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'INFLATABLE-BOAT'
    },
    {
      type: 'OBJECT_IN_INVENTORY',
      objectId: 'PUMP'
    }
  ],
  solutionSteps: [
    {
      action: 'INFLATE_BOAT',
      objectId: 'INFLATABLE-BOAT',
      secondObjectId: 'PUMP',
      expectedSuccess: true,
      expectedMessageContains: 'inflates'
    }
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'DEFLATE',
      expectedValue: false
    }
  ]
};

/**
 * Coffin Puzzle Test Case
 * Push coffin to reveal passage
 */
export const COFFIN_PUZZLE: PuzzleTestCase = {
  puzzleId: 'COFFIN',
  name: 'Coffin Puzzle',
  description: 'Push coffin to reveal passage to treasure room',
  prerequisites: [],
  solutionSteps: [
    {
      action: 'PUSH_COFFIN',
      expectedSuccess: true,
      expectedMessageContains: 'passage'
    }
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'COFFIN_CURE',
      expectedValue: true
    }
  ]
};

/**
 * Magic Word Puzzle Test Case
 * Say ULYSSES to scare cyclops
 */
export const MAGIC_WORD_PUZZLE: PuzzleTestCase = {
  puzzleId: 'MAGIC_WORD',
  name: 'Magic Word Puzzle',
  description: 'Say ULYSSES to scare the cyclops',
  prerequisites: [],
  solutionSteps: [
    {
      action: 'SAY_MAGIC_WORD',
      word: 'ULYSSES',
      expectedSuccess: true,
      expectedMessageContains: 'cyclops'
    }
  ],
  expectedStateChanges: [
    {
      type: 'FLAG',
      flagName: 'MAGIC_FLAG',
      expectedValue: true
    },
    {
      type: 'FLAG',
      flagName: 'CYCLOPS_FLAG',
      expectedValue: true
    }
  ]
};

/**
 * All major puzzle test cases
 */
export const MAJOR_PUZZLES: PuzzleTestCase[] = [
  GRATING_PUZZLE,
  TRAP_DOOR_PUZZLE,
  TROLL_PUZZLE,
  CYCLOPS_PUZZLE,
  MAGIC_WORD_PUZZLE,
  DAM_PUZZLE,
  THIEF_PUZZLE,
  RAINBOW_PUZZLE,
  BOAT_PUZZLE,
  COFFIN_PUZZLE
];

/**
 * Get puzzle test case by ID
 */
export function getPuzzleTestCase(puzzleId: string): PuzzleTestCase | undefined {
  return MAJOR_PUZZLES.find(p => p.puzzleId === puzzleId);
}

/**
 * Get all puzzle IDs
 */
export function getAllPuzzleIds(): string[] {
  return MAJOR_PUZZLES.map(p => p.puzzleId);
}
