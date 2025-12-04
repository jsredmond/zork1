/**
 * Action Handler Tests
 * Tests for TAKE, DROP, and other action handlers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { RoomImpl, Direction } from './rooms.js';
import { 
  TakeAction, DropAction, InventoryAction, MoveAction, LookAction, ExamineAction, 
  OpenAction, CloseAction, ReadAction, PutAction, RemoveAction, TurnOnAction, TurnOffAction,
  AttackAction, KillAction, ScoreAction, QuitAction, RestartAction, VerboseAction, BriefAction,
  WaitAction
} from './actions.js';
import { ObjectFlag, RoomFlag } from './data/flags.js';

describe('TakeAction', () => {
  let state: GameState;
  let takeAction: TakeAction;

  beforeEach(() => {
    // Create a simple test state
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    const objects = new Map();
    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects,
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    takeAction = new TakeAction();
  });

  it('should take a takeable object from the current room', () => {
    const obj = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });
    state.objects.set('SWORD', obj);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    const result = takeAction.execute(state, 'SWORD');

    expect(result.success).toBe(true);
    expect(state.isInInventory('SWORD')).toBe(true);
    expect(obj.location).toBe('PLAYER');
  });

  it('should not take an object that is not takeable', () => {
    const obj = new GameObjectImpl({
      id: 'HOUSE',
      name: 'House',
      description: 'A large house',
      location: 'TEST-ROOM',
      flags: [],
      size: 1000
    });
    state.objects.set('HOUSE', obj);

    const result = takeAction.execute(state, 'HOUSE');

    expect(result.success).toBe(false);
    expect(state.isInInventory('HOUSE')).toBe(false);
  });

  it('should not take an object that is too heavy', () => {
    const obj = new GameObjectImpl({
      id: 'BOULDER',
      name: 'Boulder',
      description: 'A huge boulder',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 150
    });
    state.objects.set('BOULDER', obj);

    const result = takeAction.execute(state, 'BOULDER');

    expect(result.success).toBe(false);
    expect(state.isInInventory('BOULDER')).toBe(false);
  });

  it('should not take an object already in inventory', () => {
    const obj = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });
    state.objects.set('SWORD', obj);
    state.addToInventory('SWORD');

    const result = takeAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already have');
  });
});

describe('DropAction', () => {
  let state: GameState;
  let dropAction: DropAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    const objects = new Map();
    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects,
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    dropAction = new DropAction();
  });

  it('should drop an object from inventory into current room', () => {
    const obj = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });
    state.objects.set('SWORD', obj);
    state.addToInventory('SWORD');

    const result = dropAction.execute(state, 'SWORD');

    expect(result.success).toBe(true);
    expect(state.isInInventory('SWORD')).toBe(false);
    expect(obj.location).toBe('TEST-ROOM');
  });

  it('should not drop an object not in inventory', () => {
    const obj = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });
    state.objects.set('SWORD', obj);

    const result = dropAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("don't have");
  });
});

// Feature: modern-zork-rewrite, Property 8: Object location round-trip
describe('Property Test: Object location round-trip', () => {
  it('should preserve object in current room after take then drop', () => {
    fc.assert(
      fc.property(
        // Generate random takeable objects with valid sizes
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.toUpperCase().replace(/[^A-Z0-9]/g, '')),
          name: fc.string({ minLength: 1, maxLength: 30 }),
          description: fc.string({ minLength: 1, maxLength: 100 }),
          size: fc.integer({ min: 1, max: 50 })
        }),
        (objData) => {
          // Skip invalid IDs
          if (!objData.id || objData.id.length === 0) {
            return true;
          }

          // Create test state
          const rooms = new Map([
            ['TEST-ROOM', new RoomImpl({
              id: 'TEST-ROOM',
              name: 'Test Room',
              description: 'A test room',
              exits: new Map()
            })]
          ]);

          const obj = new GameObjectImpl({
            id: objData.id,
            name: objData.name,
            description: objData.description,
            location: 'TEST-ROOM',
            flags: [ObjectFlag.TAKEBIT],
            size: objData.size
          });

          const objects = new Map([[objData.id, obj]]);
          const state = new GameState({
            currentRoom: 'TEST-ROOM',
            objects,
            rooms,
            inventory: [],
            score: 0,
            moves: 0
          });

          rooms.get('TEST-ROOM')!.addObject(objData.id);

          const takeAction = new TakeAction();
          const dropAction = new DropAction();

          // Take the object
          const takeResult = takeAction.execute(state, objData.id);
          
          // If take succeeded, drop should work
          if (takeResult.success) {
            const dropResult = dropAction.execute(state, objData.id);
            
            // After take then drop, object should be in current room
            expect(dropResult.success).toBe(true);
            expect(obj.location).toBe('TEST-ROOM');
            expect(state.isInInventory(objData.id)).toBe(false);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('InventoryAction', () => {
  let state: GameState;
  let inventoryAction: InventoryAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    const objects = new Map();
    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects,
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    inventoryAction = new InventoryAction();
  });

  it('should display empty-handed message when inventory is empty', () => {
    const result = inventoryAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('empty-handed');
  });

  it('should list all objects in inventory', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A brass lantern',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 5
    });

    state.objects.set('SWORD', sword);
    state.objects.set('LAMP', lamp);
    state.addToInventory('SWORD');
    state.addToInventory('LAMP');

    const result = inventoryAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('carrying');
    expect(result.message).toContain('Sword');
    expect(result.message).toContain('Brass Lantern');
  });
});

// Feature: modern-zork-rewrite, Property 7: Movement state updates
describe('Property Test: Movement state updates', () => {
  it('should update player location and display new room description for valid movements', () => {
    fc.assert(
      fc.property(
        // Generate random room configurations
        fc.record({
          startRoomId: fc.constantFrom('ROOM-A', 'ROOM-B', 'ROOM-C'),
          direction: fc.constantFrom('NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN'),
          destRoomId: fc.constantFrom('ROOM-X', 'ROOM-Y', 'ROOM-Z')
        }),
        (config) => {
          // Create two connected rooms
          const startRoom = new RoomImpl({
            id: config.startRoomId,
            name: `Start Room ${config.startRoomId}`,
            description: `Description of ${config.startRoomId}`,
            exits: new Map(),
            flags: [RoomFlag.ONBIT] // Make room lit for tests
          });

          const destRoom = new RoomImpl({
            id: config.destRoomId,
            name: `Destination Room ${config.destRoomId}`,
            description: `Description of ${config.destRoomId}`,
            exits: new Map(),
            flags: [RoomFlag.ONBIT] // Make room lit for tests
          });

          // Add exit from start to destination
          startRoom.setExit(config.direction as Direction, {
            destination: config.destRoomId
          });

          const rooms = new Map([
            [config.startRoomId, startRoom],
            [config.destRoomId, destRoom]
          ]);

          const state = new GameState({
            currentRoom: config.startRoomId,
            objects: new Map(),
            rooms,
            inventory: [],
            score: 0,
            moves: 0
          });

          const moveAction = new MoveAction();
          const initialMoves = state.moves;

          // Execute movement
          const result = moveAction.execute(state, config.direction);

          // Verify movement succeeded
          expect(result.success).toBe(true);
          
          // Verify player location updated
          expect(state.currentRoom).toBe(config.destRoomId);
          
          // Verify moves counter incremented
          expect(state.moves).toBe(initialMoves + 1);
          
          // Verify destination room is marked as visited
          expect(destRoom.visited).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('MoveAction', () => {
  let state: GameState;
  let moveAction: MoveAction;

  beforeEach(() => {
    const roomA = new RoomImpl({
      id: 'ROOM-A',
      name: 'Room A',
      description: 'First room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    const roomB = new RoomImpl({
      id: 'ROOM-B',
      name: 'Room B',
      description: 'Second room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    // Connect rooms
    roomA.setExit(Direction.NORTH, { destination: 'ROOM-B' });
    roomB.setExit(Direction.SOUTH, { destination: 'ROOM-A' });

    const rooms = new Map([
      ['ROOM-A', roomA],
      ['ROOM-B', roomB]
    ]);

    state = new GameState({
      currentRoom: 'ROOM-A',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    moveAction = new MoveAction();
  });

  it('should move player to valid destination', () => {
    const result = moveAction.execute(state, 'NORTH');

    expect(result.success).toBe(true);
    expect(state.currentRoom).toBe('ROOM-B');
    expect(state.moves).toBe(1);
  });

  it('should reject movement in invalid direction', () => {
    const result = moveAction.execute(state, 'EAST');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't go that way");
    expect(state.currentRoom).toBe('ROOM-A');
    expect(state.moves).toBe(0);
  });

  it('should handle blocked exits with custom messages', () => {
    const roomC = new RoomImpl({
      id: 'ROOM-C',
      name: 'Room C',
      description: 'Third room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    roomC.setExit(Direction.EAST, {
      destination: '',
      message: 'The door is locked.'
    });

    state.rooms.set('ROOM-C', roomC);
    state.currentRoom = 'ROOM-C';

    const result = moveAction.execute(state, 'EAST');

    expect(result.success).toBe(false);
    expect(result.message).toBe('The door is locked.');
    expect(state.currentRoom).toBe('ROOM-C');
  });

  it('should handle conditional exits', () => {
    const roomD = new RoomImpl({
      id: 'ROOM-D',
      name: 'Room D',
      description: 'Fourth room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    const roomE = new RoomImpl({
      id: 'ROOM-E',
      name: 'Room E',
      description: 'Fifth room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    let doorOpen = false;
    roomD.setExit(Direction.WEST, {
      destination: 'ROOM-E',
      condition: () => doorOpen
    });

    state.rooms.set('ROOM-D', roomD);
    state.rooms.set('ROOM-E', roomE);
    state.currentRoom = 'ROOM-D';

    // Try to move with door closed
    let result = moveAction.execute(state, 'WEST');
    expect(result.success).toBe(false);
    expect(state.currentRoom).toBe('ROOM-D');

    // Open door and try again
    doorOpen = true;
    result = moveAction.execute(state, 'WEST');
    expect(result.success).toBe(true);
    expect(state.currentRoom).toBe('ROOM-E');
  });

  it('should mark destination room as visited', () => {
    const roomB = state.rooms.get('ROOM-B')!;
    expect(roomB.visited).toBe(false);

    moveAction.execute(state, 'NORTH');

    expect(roomB.visited).toBe(true);
  });
});

describe('LookAction', () => {
  let state: GameState;
  let lookAction: LookAction;

  beforeEach(() => {
    const room = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A simple test room with white walls.',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    const rooms = new Map([['TEST-ROOM', room]]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    lookAction = new LookAction();
  });

  it('should display room name and description', () => {
    const result = lookAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Test Room');
    expect(result.message).toContain('A simple test room with white walls.');
  });

  it('should list visible objects in room', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A brass lantern',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 5
    });

    state.objects.set('SWORD', sword);
    state.objects.set('LAMP', lamp);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');
    state.rooms.get('TEST-ROOM')!.addObject('LAMP');

    const result = lookAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('sword');
    expect(result.message).toContain('brass lantern');
  });

  it('should not list objects in inventory', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.addToInventory('SWORD');

    const result = lookAction.execute(state);

    expect(result.success).toBe(true);
    // Should not mention sword since it's in inventory, not in room
    expect(result.message).not.toContain('sword');
  });
});

// Feature: modern-zork-rewrite, Property 15: Display consistency
describe('Property Test: Display consistency', () => {
  it('should display associated description text for any game object or room', () => {
    fc.assert(
      fc.property(
        // Generate random objects and rooms with descriptions
        fc.record({
          objectId: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.toUpperCase().replace(/[^A-Z0-9]/g, '')),
          objectName: fc.string({ minLength: 1, maxLength: 30 }),
          objectDescription: fc.string({ minLength: 1, maxLength: 200 }),
          roomId: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.toUpperCase().replace(/[^A-Z0-9]/g, '')),
          roomName: fc.string({ minLength: 1, maxLength: 30 }),
          roomDescription: fc.string({ minLength: 1, maxLength: 200 })
        }),
        (data) => {
          // Skip invalid IDs
          if (!data.objectId || data.objectId.length === 0 || !data.roomId || data.roomId.length === 0) {
            return true;
          }

          // Create room
          const room = new RoomImpl({
            id: data.roomId,
            name: data.roomName,
            description: data.roomDescription,
            exits: new Map(),
            flags: [RoomFlag.ONBIT] // Make room lit for tests
          });

          // Create object in room
          const obj = new GameObjectImpl({
            id: data.objectId,
            name: data.objectName,
            description: data.objectDescription,
            location: data.roomId,
            flags: [ObjectFlag.TAKEBIT],
            size: 10
          });

          const rooms = new Map([[data.roomId, room]]);
          const objects = new Map([[data.objectId, obj]]);
          
          const state = new GameState({
            currentRoom: data.roomId,
            objects,
            rooms,
            inventory: [],
            score: 0,
            moves: 0
          });

          room.addObject(data.objectId);

          // Test 1: LOOK should display room description
          const lookAction = new LookAction();
          const lookResult = lookAction.execute(state);
          
          expect(lookResult.success).toBe(true);
          expect(lookResult.message).toContain(data.roomDescription);

          // Test 2: EXAMINE should display object description
          const examineAction = new ExamineAction();
          const examineResult = examineAction.execute(state, data.objectId);
          
          expect(examineResult.success).toBe(true);
          expect(examineResult.message).toContain(data.objectDescription);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ExamineAction', () => {
  let state: GameState;
  let examineAction: ExamineAction;

  beforeEach(() => {
    const room = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A simple test room.',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    const rooms = new Map([['TEST-ROOM', room]]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    examineAction = new ExamineAction();
  });

  it('should display object description when examining an object in the room', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A finely crafted elvish blade with intricate engravings.',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    const result = examineAction.execute(state, 'SWORD');

    expect(result.success).toBe(true);
    expect(result.message).toContain('finely crafted elvish blade');
  });

  it('should display object description when examining an object in inventory', () => {
    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A battery-powered brass lantern.',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT],
      size: 5
    });

    state.objects.set('LAMP', lamp);
    state.addToInventory('LAMP');

    const result = examineAction.execute(state, 'LAMP');

    expect(result.success).toBe(true);
    expect(result.message).toContain('battery-powered brass lantern');
  });

  it('should display room description when examining without an object', () => {
    const result = examineAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('A simple test room.');
  });

  it('should return error when examining object not visible', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'OTHER-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);

    const result = examineAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't see");
  });

  it('should return error when examining non-existent object', () => {
    const result = examineAction.execute(state, 'DRAGON');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't see");
  });
});

describe('OpenAction', () => {
  let state: GameState;
  let openAction: OpenAction;

  beforeEach(() => {
    const room = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map()
    });

    const rooms = new Map([['TEST-ROOM', room]]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    openAction = new OpenAction();
  });

  it('should open a closed container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT],
      capacity: 50
    });

    state.objects.set('CHEST', chest);
    state.rooms.get('TEST-ROOM')!.addObject('CHEST');

    const result = openAction.execute(state, 'CHEST');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Opened.');
    expect(chest.hasFlag(ObjectFlag.OPENBIT)).toBe(true);
  });

  it('should not open an already open container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
      capacity: 50
    });

    state.objects.set('CHEST', chest);
    state.rooms.get('TEST-ROOM')!.addObject('CHEST');

    const result = openAction.execute(state, 'CHEST');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already open');
  });

  it('should not open non-container objects', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    const result = openAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't open");
  });

  it('should return error when opening non-existent object', () => {
    const result = openAction.execute(state, 'DOOR');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't see");
  });
});

describe('CloseAction', () => {
  let state: GameState;
  let closeAction: CloseAction;

  beforeEach(() => {
    const room = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map()
    });

    const rooms = new Map([['TEST-ROOM', room]]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    closeAction = new CloseAction();
  });

  it('should close an open container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
      capacity: 50
    });

    state.objects.set('CHEST', chest);
    state.rooms.get('TEST-ROOM')!.addObject('CHEST');

    const result = closeAction.execute(state, 'CHEST');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Closed.');
    expect(chest.hasFlag(ObjectFlag.OPENBIT)).toBe(false);
  });

  it('should not close an already closed container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT],
      capacity: 50
    });

    state.objects.set('CHEST', chest);
    state.rooms.get('TEST-ROOM')!.addObject('CHEST');

    const result = closeAction.execute(state, 'CHEST');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already closed');
  });

  it('should not close non-container objects', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    const result = closeAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't close");
  });
});

describe('ReadAction', () => {
  let state: GameState;
  let readAction: ReadAction;

  beforeEach(() => {
    const room = new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map(),
      flags: [RoomFlag.ONBIT] // Make room lit for tests
    });

    const rooms = new Map([['TEST-ROOM', room]]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    readAction = new ReadAction();
  });

  it('should display text from readable object', () => {
    const book = new GameObjectImpl({
      id: 'BOOK',
      name: 'Ancient Book',
      description: 'An old leather-bound book',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.READBIT]
    });
    book.setProperty('text', 'The ancient text speaks of great treasures hidden below.');

    state.objects.set('BOOK', book);
    state.rooms.get('TEST-ROOM')!.addObject('BOOK');

    const result = readAction.execute(state, 'BOOK');

    expect(result.success).toBe(true);
    expect(result.message).toContain('ancient text speaks of great treasures');
  });

  it('should not read non-readable objects', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    const result = readAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't read");
  });

  it('should handle readable object with no text', () => {
    const paper = new GameObjectImpl({
      id: 'PAPER',
      name: 'Blank Paper',
      description: 'A blank piece of paper',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.READBIT]
    });

    state.objects.set('PAPER', paper);
    state.rooms.get('TEST-ROOM')!.addObject('PAPER');

    const result = readAction.execute(state, 'PAPER');

    expect(result.success).toBe(false);
    expect(result.message).toContain('nothing written');
  });

  it('should read object in inventory', () => {
    const note = new GameObjectImpl({
      id: 'NOTE',
      name: 'Note',
      description: 'A small note',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.READBIT]
    });
    note.setProperty('text', 'Meet me at midnight.');

    state.objects.set('NOTE', note);
    state.addToInventory('NOTE');

    const result = readAction.execute(state, 'NOTE');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Meet me at midnight');
  });

  it('should return error when reading non-existent object', () => {
    const result = readAction.execute(state, 'SCROLL');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't see");
  });
});

describe('Inventory Management Integration Tests', () => {
  let state: GameState;
  let takeAction: TakeAction;
  let dropAction: DropAction;
  let inventoryAction: InventoryAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    const objects = new Map();
    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects,
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    takeAction = new TakeAction();
    dropAction = new DropAction();
    inventoryAction = new InventoryAction();
  });

  it('should handle complete take-inventory-drop cycle', () => {
    // Create object in room
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });
    state.objects.set('SWORD', sword);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');

    // Initially inventory should be empty
    let result = inventoryAction.execute(state);
    expect(result.message).toContain('empty-handed');

    // Take the sword
    result = takeAction.execute(state, 'SWORD');
    expect(result.success).toBe(true);

    // Inventory should now show the sword
    result = inventoryAction.execute(state);
    expect(result.message).toContain('Sword');

    // Drop the sword
    result = dropAction.execute(state, 'SWORD');
    expect(result.success).toBe(true);

    // Inventory should be empty again
    result = inventoryAction.execute(state);
    expect(result.message).toContain('empty-handed');
  });

  it('should enforce weight limits when taking objects', () => {
    // Create multiple heavy objects
    const boulder1 = new GameObjectImpl({
      id: 'BOULDER1',
      name: 'Boulder 1',
      description: 'A heavy boulder',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 60
    });

    const boulder2 = new GameObjectImpl({
      id: 'BOULDER2',
      name: 'Boulder 2',
      description: 'Another heavy boulder',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 60
    });

    state.objects.set('BOULDER1', boulder1);
    state.objects.set('BOULDER2', boulder2);
    state.rooms.get('TEST-ROOM')!.addObject('BOULDER1');
    state.rooms.get('TEST-ROOM')!.addObject('BOULDER2');

    // Take first boulder - should succeed
    let result = takeAction.execute(state, 'BOULDER1');
    expect(result.success).toBe(true);
    expect(state.getInventoryWeight()).toBe(60);

    // Try to take second boulder - should fail due to weight limit
    result = takeAction.execute(state, 'BOULDER2');
    expect(result.success).toBe(false);
    expect(result.message).toContain('too much');
  });

  it('should correctly track inventory weight', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A brass lantern',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT],
      size: 5
    });

    state.objects.set('SWORD', sword);
    state.objects.set('LAMP', lamp);
    state.rooms.get('TEST-ROOM')!.addObject('SWORD');
    state.rooms.get('TEST-ROOM')!.addObject('LAMP');

    // Initially weight should be 0
    expect(state.getInventoryWeight()).toBe(0);

    // Take sword
    takeAction.execute(state, 'SWORD');
    expect(state.getInventoryWeight()).toBe(10);

    // Take lamp
    takeAction.execute(state, 'LAMP');
    expect(state.getInventoryWeight()).toBe(15);

    // Drop sword
    dropAction.execute(state, 'SWORD');
    expect(state.getInventoryWeight()).toBe(5);

    // Drop lamp
    dropAction.execute(state, 'LAMP');
    expect(state.getInventoryWeight()).toBe(0);
  });
});

describe('PutAction', () => {
  let state: GameState;
  let putAction: PutAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    putAction = new PutAction();
  });

  it('should put object into open container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
      capacity: 50
    });

    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('CHEST', chest);
    state.objects.set('SWORD', sword);
    state.addToInventory('SWORD');

    const result = putAction.execute(state, 'SWORD', 'CHEST');

    expect(result.success).toBe(true);
    expect(sword.location).toBe('CHEST');
  });

  it('should not put object into closed container', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Wooden Chest',
      description: 'A sturdy wooden chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT],
      capacity: 50
    });

    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('CHEST', chest);
    state.objects.set('SWORD', sword);
    state.addToInventory('SWORD');

    const result = putAction.execute(state, 'SWORD', 'CHEST');

    expect(result.success).toBe(false);
    expect(result.message).toContain("isn't open");
  });

  it('should respect capacity constraints', () => {
    const chest = new GameObjectImpl({
      id: 'CHEST',
      name: 'Small Chest',
      description: 'A small chest',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.CONTBIT, ObjectFlag.OPENBIT],
      capacity: 5
    });

    const boulder = new GameObjectImpl({
      id: 'BOULDER',
      name: 'Boulder',
      description: 'A huge boulder',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 60
    });

    state.objects.set('CHEST', chest);
    state.objects.set('BOULDER', boulder);
    state.addToInventory('BOULDER');

    const result = putAction.execute(state, 'BOULDER', 'CHEST');

    expect(result.success).toBe(false);
    expect(result.message).toContain("no room");
  });
});

describe('TurnOnAction and TurnOffAction', () => {
  let state: GameState;
  let turnOnAction: TurnOnAction;
  let turnOffAction: TurnOffAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    turnOnAction = new TurnOnAction();
    turnOffAction = new TurnOffAction();
  });

  it('should turn on a light source', () => {
    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A brass lantern',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT],
      size: 5
    });

    state.objects.set('LAMP', lamp);
    state.addToInventory('LAMP');

    const result = turnOnAction.execute(state, 'LAMP');

    expect(result.success).toBe(true);
    expect(lamp.hasFlag(ObjectFlag.ONBIT)).toBe(true);
  });

  it('should turn off a light source', () => {
    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'Brass Lantern',
      description: 'A brass lantern',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT],
      size: 5
    });

    state.objects.set('LAMP', lamp);
    state.addToInventory('LAMP');

    const result = turnOffAction.execute(state, 'LAMP');

    expect(result.success).toBe(true);
    expect(lamp.hasFlag(ObjectFlag.ONBIT)).toBe(false);
  });

  it('should not turn on non-light objects', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'PLAYER',
      flags: [ObjectFlag.TAKEBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);
    state.addToInventory('SWORD');

    const result = turnOnAction.execute(state, 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("can't turn that on");
  });
});

describe('AttackAction', () => {
  let state: GameState;
  let attackAction: AttackAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    attackAction = new AttackAction();
  });

  it('should require a weapon to attack', () => {
    const troll = new GameObjectImpl({
      id: 'TROLL',
      name: 'Troll',
      description: 'A nasty troll',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });

    state.objects.set('TROLL', troll);

    const result = attackAction.execute(state, 'TROLL');

    expect(result.success).toBe(false);
    expect(result.message).toContain('bare hands');
  });

  it('should not attack non-actors', () => {
    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.WEAPONBIT],
      size: 10
    });

    state.objects.set('SWORD', sword);

    const result = attackAction.execute(state, 'SWORD', 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain('strange people');
  });

  it('should require holding the weapon', () => {
    const troll = new GameObjectImpl({
      id: 'TROLL',
      name: 'Troll',
      description: 'A nasty troll',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });

    const sword = new GameObjectImpl({
      id: 'SWORD',
      name: 'Sword',
      description: 'A sharp sword',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.TAKEBIT, ObjectFlag.WEAPONBIT],
      size: 10
    });

    state.objects.set('TROLL', troll);
    state.objects.set('SWORD', sword);

    const result = attackAction.execute(state, 'TROLL', 'SWORD');

    expect(result.success).toBe(false);
    expect(result.message).toContain("aren't even holding");
  });
});

describe('ScoreAction', () => {
  let state: GameState;
  let scoreAction: ScoreAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    scoreAction = new ScoreAction();
  });

  it('should display current score and rank', () => {
    state.score = 100;
    state.moves = 50;

    const result = scoreAction.execute(state);

    expect(result.success).toBe(true);
    expect(result.message).toContain('100');
    expect(result.message).toContain('50');
    expect(result.message).toContain('Junior Adventurer');
  });

  it('should show correct rank for different scores', () => {
    // Test Beginner rank
    state.score = 0;
    let result = scoreAction.execute(state);
    expect(result.message).toContain('Beginner');

    // Test Amateur Adventurer rank
    state.score = 50;
    result = scoreAction.execute(state);
    expect(result.message).toContain('Amateur Adventurer');

    // Test Master Adventurer rank
    state.score = 350;
    result = scoreAction.execute(state);
    expect(result.message).toContain('Master Adventurer');
  });
});

describe('VerboseAction and BriefAction', () => {
  let state: GameState;
  let verboseAction: VerboseAction;
  let briefAction: BriefAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    verboseAction = new VerboseAction();
    briefAction = new BriefAction();
  });

  it('should set verbose mode', () => {
    const result = verboseAction.execute(state);

    expect(result.success).toBe(true);
    expect(state.getGlobalVariable('VERBOSE')).toBe(true);
    expect(state.getGlobalVariable('SUPER_BRIEF')).toBe(false);
  });

  it('should set brief mode', () => {
    const result = briefAction.execute(state);

    expect(result.success).toBe(true);
    expect(state.getGlobalVariable('VERBOSE')).toBe(false);
    expect(state.getGlobalVariable('SUPER_BRIEF')).toBe(false);
  });
});

describe('WaitAction', () => {
  let state: GameState;
  let waitAction: WaitAction;

  beforeEach(() => {
    const rooms = new Map([
      ['TEST-ROOM', new RoomImpl({
        id: 'TEST-ROOM',
        name: 'Test Room',
        description: 'A test room',
        exits: new Map()
      })]
    ]);

    state = new GameState({
      currentRoom: 'TEST-ROOM',
      objects: new Map(),
      rooms,
      inventory: [],
      score: 0,
      moves: 0
    });

    waitAction = new WaitAction();
  });

  it('should increment moves counter', () => {
    const initialMoves = state.moves;
    
    const result = waitAction.execute(state);

    expect(result.success).toBe(true);
    expect(state.moves).toBe(initialMoves + 1);
  });
});
