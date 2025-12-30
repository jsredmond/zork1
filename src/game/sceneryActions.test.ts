/**
 * Tests for scenery action handlers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  handleSceneryAction, 
  hasSceneryHandler,
  executeSceneryAction 
} from './sceneryActions.js';
import { GameState } from './state.js';
import { createInitialGameState } from './factories/gameFactory.js';

describe('Scenery Action Handlers', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState();
  });

  describe('BOARD handler', () => {
    it('should return message for TAKE action', () => {
      const result = handleSceneryAction('BOARD', 'TAKE', state);
      expect(result).toBe('The boards are securely fastened.');
    });

    it('should return message for EXAMINE action', () => {
      const result = handleSceneryAction('BOARD', 'EXAMINE', state);
      expect(result).toBe('The boards are securely fastened.');
    });

    it('should return message for REMOVE action', () => {
      const result = handleSceneryAction('BOARD', 'REMOVE', state);
      expect(result).toBe('The boards are securely fastened.');
    });
  });

  describe('GRANITE-WALL handler', () => {
    it('should return different message in SLIDE-ROOM', () => {
      state.currentRoom = 'SLIDE-ROOM';
      const result = handleSceneryAction('GRANITE-WALL', 'TAKE', state);
      expect(result).toBe("The wall isn't granite.");
    });

    it('should return standard message in other rooms', () => {
      state.currentRoom = 'WEST-OF-HOUSE';
      const result = handleSceneryAction('GRANITE-WALL', 'TAKE', state);
      expect(result).toBe("It's solid granite.");
    });

    it('should return location-specific message for FIND in NORTH-TEMPLE', () => {
      state.currentRoom = 'NORTH-TEMPLE';
      const result = handleSceneryAction('GRANITE-WALL', 'FIND', state);
      expect(result).toBe('The west wall is solid granite here.');
    });

    it('should return location-specific message for FIND in TREASURE-ROOM', () => {
      state.currentRoom = 'TREASURE-ROOM';
      const result = handleSceneryAction('GRANITE-WALL', 'FIND', state);
      expect(result).toBe('The east wall is solid granite here.');
    });
  });

  describe('WHITE-HOUSE handler', () => {
    it('should return snarky message when inside house', () => {
      state.currentRoom = 'LIVING-ROOM';
      const result = handleSceneryAction('WHITE-HOUSE', 'EXAMINE', state);
      expect(result).toBe('Why not find your brains?');
    });

    it('should return description when outside house', () => {
      state.currentRoom = 'WEST-OF-HOUSE';
      const result = handleSceneryAction('WHITE-HOUSE', 'EXAMINE', state);
      expect(result).toContain('colonial house');
    });
  });

  describe('FOREST handler', () => {
    // Note: TAKE, PUSH, PULL, CLOSE are intentionally NOT handled by scenery handler
    // They fall through to default action handlers which use random messages (Z-Machine parity)
    it('should return null for TAKE action (falls through to default random handler)', () => {
      const result = handleSceneryAction('FOREST', 'TAKE', state);
      expect(result).toBeNull();
    });

    it('should return message for EXAMINE action', () => {
      const result = handleSceneryAction('FOREST', 'EXAMINE', state);
      expect(result).toContain('forest');
    });

    it('should return null for PUSH action (falls through to default random handler)', () => {
      const result = handleSceneryAction('FOREST', 'PUSH', state);
      expect(result).toBeNull();
    });

    it('should return null for PULL action (falls through to default V-MOVE handler)', () => {
      const result = handleSceneryAction('FOREST', 'PULL', state);
      expect(result).toBeNull();
    });

    it('should return null for CLOSE action (falls through to default V-CLOSE handler)', () => {
      const result = handleSceneryAction('FOREST', 'CLOSE', state);
      expect(result).toBeNull();
    });
  });

  describe('SONGBIRD handler', () => {
    it('should return message for FIND action', () => {
      const result = handleSceneryAction('SONGBIRD', 'FIND', state);
      expect(result).toBe('The songbird is not here but is probably nearby.');
    });

    it('should return message for LISTEN action', () => {
      const result = handleSceneryAction('SONGBIRD', 'LISTEN', state);
      expect(result).toBe("You can't hear the songbird now.");
    });

    it('should return message for FOLLOW action', () => {
      const result = handleSceneryAction('SONGBIRD', 'FOLLOW', state);
      expect(result).toBe("It can't be followed.");
    });
  });

  describe('TEETH handler', () => {
    it('should return dental hygiene message when no items in inventory', () => {
      const result = handleSceneryAction('TEETH', 'BRUSH', state);
      expect(result).toContain('Dental hygiene');
    });

    it('should return death message when player has putty', () => {
      // Add putty to inventory
      state.addToInventory('PUTTY');
      const result = handleSceneryAction('TEETH', 'BRUSH', state);
      expect(result).toContain('grue');
    });
  });

  describe('hasSceneryHandler', () => {
    it('should return true for registered handlers', () => {
      expect(hasSceneryHandler('BOARD')).toBe(true);
      expect(hasSceneryHandler('GRANITE-WALL')).toBe(true);
      expect(hasSceneryHandler('SONGBIRD')).toBe(true);
    });

    it('should return false for unregistered handlers', () => {
      expect(hasSceneryHandler('NONEXISTENT')).toBe(false);
    });
  });

  describe('executeSceneryAction', () => {
    it('should return ActionResult for valid scenery action', () => {
      const result = executeSceneryAction('BOARD', 'TAKE', state);
      expect(result).not.toBeNull();
      // Scenery actions that indicate failure (like "securely fastened") should return success: false
      expect(result?.success).toBe(false);
      expect(result?.message).toBe('The boards are securely fastened.');
      expect(result?.stateChanges).toEqual([]);
    });

    it('should return null for invalid scenery action', () => {
      const result = executeSceneryAction('NONEXISTENT', 'TAKE', state);
      expect(result).toBeNull();
    });
  });
});


describe('Property-Based Tests', () => {
  describe('Property 1: White House Handler Messages (Z-Machine Parity)', () => {
    /**
     * Feature: parity-final-push, Property 1: White House Handler Messages
     * Validates: Requirements 1.1, 1.2, 1.3, 1.4
     * 
     * For any verb in {OPEN, TAKE, PUSH, PULL}, when applied to WHITE-HOUSE,
     * the handler SHALL return the exact Z-Machine message for that verb.
     * Note: TAKE, PUSH, PULL fall through to default random handlers (Z-Machine parity)
     */
    it('should return exact Z-Machine messages for white house verbs with specific handlers', () => {
      const state = createInitialGameState();
      state.currentRoom = 'WEST-OF-HOUSE';
      
      // Only OPEN and THROUGH have specific handlers in WHITE-HOUSE-F
      // TAKE, PUSH, PULL fall through to default random handlers
      const expectedMessages: Record<string, string> = {
        'OPEN': "I can't see how to get in from here.",
        'THROUGH': "I can't see how to get in from here.",
        'BURN': "You must be joking."
      };
      
      for (const [verb, expectedMessage] of Object.entries(expectedMessages)) {
        const result = handleSceneryAction('WHITE-HOUSE', verb, state);
        expect(result).toBe(expectedMessage);
      }
      
      // These should return null (fall through to default handlers) when at house
      const fallThroughVerbs = ['TAKE', 'PUSH', 'PULL', 'MOVE'];
      for (const verb of fallThroughVerbs) {
        const result = handleSceneryAction('WHITE-HOUSE', verb, state);
        expect(result).toBeNull();
      }
    });

    it('should return inside-house message when player is inside for FIND verb', () => {
      const state = createInitialGameState();
      const insideRooms = ['LIVING-ROOM', 'KITCHEN', 'ATTIC'];
      
      for (const room of insideRooms) {
        state.currentRoom = room;
        // Only FIND has the inside-house check in WHITE-HOUSE-F
        const result = handleSceneryAction('WHITE-HOUSE', 'FIND', state);
        expect(result).toBe('Why not find your brains?');
      }
    });
    
    /**
     * Z-Machine Parity Fix: White house visibility from forest rooms
     * When player is NOT at a house-adjacent room, interactions with white house
     * should return "You're not at the house." instead of allowing interaction.
     */
    it('should return "You\'re not at the house." when player is in forest rooms', () => {
      const state = createInitialGameState();
      const forestRooms = ['FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'UP-A-TREE', 'CLEARING', 'GRATING-CLEARING'];
      
      for (const room of forestRooms) {
        state.currentRoom = room;
        
        // All verbs should return "You're not at the house." from forest rooms
        const verbs = ['EXAMINE', 'OPEN', 'THROUGH', 'TAKE', 'PUSH', 'PULL', 'MOVE', 'FIND', 'BURN', 'LOOK'];
        for (const verb of verbs) {
          const result = handleSceneryAction('WHITE-HOUSE', verb, state);
          expect(result).toBe("You're not at the house.");
        }
      }
    });
    
    it('should allow interaction when player is at house-adjacent rooms', () => {
      const state = createInitialGameState();
      const houseAdjacentRooms = ['NORTH-OF-HOUSE', 'SOUTH-OF-HOUSE', 'EAST-OF-HOUSE', 'WEST-OF-HOUSE'];
      
      for (const room of houseAdjacentRooms) {
        state.currentRoom = room;
        
        // EXAMINE should return the house description
        const examineResult = handleSceneryAction('WHITE-HOUSE', 'EXAMINE', state);
        expect(examineResult).toContain('colonial house');
        
        // OPEN should return the specific message
        const openResult = handleSceneryAction('WHITE-HOUSE', 'OPEN', state);
        expect(openResult).toBe("I can't see how to get in from here.");
        
        // FIND should return the "right here" message
        const findResult = handleSceneryAction('WHITE-HOUSE', 'FIND', state);
        expect(findResult).toBe("It's right here! Are you blind or something?");
        
        // TAKE, PUSH, PULL should return null (fall through to default handlers)
        expect(handleSceneryAction('WHITE-HOUSE', 'TAKE', state)).toBeNull();
        expect(handleSceneryAction('WHITE-HOUSE', 'PUSH', state)).toBeNull();
        expect(handleSceneryAction('WHITE-HOUSE', 'PULL', state)).toBeNull();
      }
    });
  });

  describe('Property 2: Forest Handler Messages (Z-Machine Parity)', () => {
    /**
     * Feature: parity-final-push, Property 2: Forest Handler Messages
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4
     * 
     * FOREST-F only handles: WALK-AROUND, DISEMBARK, FIND, LISTEN
     * TAKE, PUSH, PULL, CLOSE fall through to default handlers (Z-Machine parity)
     */
    it('should return exact Z-Machine messages for forest verbs with specific handlers', () => {
      const state = createInitialGameState();
      
      // Only these verbs have specific handlers in FOREST-F
      const expectedMessages: Record<string, string> = {
        'LISTEN': 'The pines and the hemlocks seem to be murmuring.',
        'FIND': 'You cannot see the forest for the trees.',
        'DISEMBARK': 'You will have to specify a direction.'
      };
      
      for (const [verb, expectedMessage] of Object.entries(expectedMessages)) {
        const result = handleSceneryAction('FOREST', verb, state);
        expect(result).toBe(expectedMessage);
      }
      
      // These should return null (fall through to default handlers)
      const fallThroughVerbs = ['TAKE', 'GET', 'PUSH', 'MOVE', 'PULL', 'CLOSE'];
      for (const verb of fallThroughVerbs) {
        const result = handleSceneryAction('FOREST', verb, state);
        expect(result).toBeNull();
      }
    });
    
    /**
     * Z-Machine Parity Fix: Forest EXAMINE response
     * EXAMINE should return "There's nothing special about the forest."
     * instead of a detailed description.
     */
    it('should return Z-Machine parity message for EXAMINE', () => {
      const state = createInitialGameState();
      const result = handleSceneryAction('FOREST', 'EXAMINE', state);
      expect(result).toBe("There's nothing special about the forest.");
    });
  });

  describe('Property 3: Board Handler Messages (Z-Machine Parity)', () => {
    /**
     * Feature: parity-final-push, Property 3: Board Handler Messages
     * Validates: Requirements 3.1, 3.2
     * 
     * BOARD-F only handles: TAKE, EXAMINE
     * PUSH, PULL fall through to default handlers (Z-Machine parity)
     */
    it('should return exact Z-Machine messages for board verbs with specific handlers', () => {
      const state = createInitialGameState();
      
      // Only TAKE and EXAMINE have specific handlers in BOARD-F
      const expectedMessages: Record<string, string> = {
        'TAKE': 'The boards are securely fastened.',
        'EXAMINE': 'The boards are securely fastened.',
        'REMOVE': 'The boards are securely fastened.'
      };
      
      for (const [verb, expectedMessage] of Object.entries(expectedMessages)) {
        const result = handleSceneryAction('BOARD', verb, state);
        expect(result).toBe(expectedMessage);
      }
      
      // These should return null (fall through to default handlers)
      const fallThroughVerbs = ['PULL', 'PUSH', 'MOVE'];
      for (const verb of fallThroughVerbs) {
        const result = handleSceneryAction('BOARD', verb, state);
        expect(result).toBeNull();
      }
    });
  });

  describe('Property 2: Scenery action coverage', () => {
    /**
     * Feature: complete-text-accuracy, Property 2: Scenery action coverage
     * Validates: Requirements 1.1, 1.2, 1.3, 1.4
     * 
     * For any scenery object and any verb attempted on it, if the original ZIL 
     * has a message for that combination, the TypeScript implementation should 
     * display that message. Note: Some verbs intentionally fall through to
     * default handlers for Z-Machine parity.
     */
    it('should have handlers for all registered scenery objects', () => {
      const sceneryObjects = [
        'BOARD',
        'GRANITE-WALL',
        'WHITE-HOUSE',
        'FOREST',
        'SONGBIRD',
        'TEETH',
        'WALL',
        'TREE',
        'MOUNTAIN-RANGE',
        'LEAVES',
        'SAND'
      ];

      for (const objectId of sceneryObjects) {
        expect(hasSceneryHandler(objectId)).toBe(true);
      }
    });

    it('should return non-null messages for scenery actions with specific handlers', () => {
      const state = createInitialGameState();
      
      // Only include actions that have specific handlers (not fall-through)
      const sceneryActions = [
        { object: 'BOARD', verb: 'TAKE' },
        { object: 'BOARD', verb: 'EXAMINE' },
        { object: 'BOARD', verb: 'REMOVE' },
        { object: 'GRANITE-WALL', verb: 'TAKE' },
        { object: 'GRANITE-WALL', verb: 'EXAMINE' },
        { object: 'GRANITE-WALL', verb: 'FIND' },
        { object: 'WHITE-HOUSE', verb: 'EXAMINE' },
        { object: 'WHITE-HOUSE', verb: 'OPEN' },  // Has specific handler
        { object: 'FOREST', verb: 'EXAMINE' },
        { object: 'FOREST', verb: 'LISTEN' },  // Has specific handler
        { object: 'FOREST', verb: 'FIND' },    // Has specific handler
        { object: 'SONGBIRD', verb: 'FIND' },
        { object: 'SONGBIRD', verb: 'LISTEN' },
        { object: 'TEETH', verb: 'BRUSH' },
        { object: 'WALL', verb: 'EXAMINE' },
        { object: 'TREE', verb: 'EXAMINE' },
        { object: 'MOUNTAIN-RANGE', verb: 'EXAMINE' },
        { object: 'LEAVES', verb: 'EXAMINE' },
        { object: 'SAND', verb: 'EXAMINE' }
      ];

      for (const { object, verb } of sceneryActions) {
        const result = handleSceneryAction(object, verb, state);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
        expect(result!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Property 1: Message text exactness (scenery subset)', () => {
    /**
     * Feature: complete-text-accuracy, Property 1: Message text exactness (scenery subset)
     * Validates: Requirements 1.5
     * 
     * For any implemented scenery message, the text displayed to the player should 
     * match the original ZIL message exactly (ignoring whitespace normalization)
     */
    it('should match exact messages from ZIL source for BOARD', () => {
      const state = createInitialGameState();
      const result = handleSceneryAction('BOARD', 'TAKE', state);
      expect(result).toBe('The boards are securely fastened.');
    });

    it('should match exact messages from ZIL source for GRANITE-WALL', () => {
      const state = createInitialGameState();
      
      state.currentRoom = 'SLIDE-ROOM';
      expect(handleSceneryAction('GRANITE-WALL', 'TAKE', state))
        .toBe("The wall isn't granite.");
      
      state.currentRoom = 'NORTH-TEMPLE';
      expect(handleSceneryAction('GRANITE-WALL', 'FIND', state))
        .toBe('The west wall is solid granite here.');
      
      state.currentRoom = 'TREASURE-ROOM';
      expect(handleSceneryAction('GRANITE-WALL', 'FIND', state))
        .toBe('The east wall is solid granite here.');
    });

    it('should match exact messages from ZIL source for SONGBIRD', () => {
      const state = createInitialGameState();
      
      expect(handleSceneryAction('SONGBIRD', 'FIND', state))
        .toBe('The songbird is not here but is probably nearby.');
      
      expect(handleSceneryAction('SONGBIRD', 'LISTEN', state))
        .toBe("You can't hear the songbird now.");
      
      expect(handleSceneryAction('SONGBIRD', 'FOLLOW', state))
        .toBe("It can't be followed.");
    });
  });
});
