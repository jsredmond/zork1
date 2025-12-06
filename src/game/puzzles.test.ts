/**
 * Integration tests for special puzzle mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from './state.js';
import { GameObjectImpl } from './objects.js';
import { RoomImpl } from './rooms.js';
import { ObjectFlag } from './data/flags.js';
import { DamPuzzle, MirrorPuzzle, RainbowPuzzle, RopeBasketPuzzle, TrapDoorPuzzle, GratingPuzzle, BoatPuzzle, CoffinPuzzle, MagicWordPuzzle } from './puzzles.js';

describe('Dam Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    // Create test state
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    // Create dam room
    const damRoom = new RoomImpl({
      id: 'DAM-ROOM',
      name: 'Dam',
      description: 'You are at the dam.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('DAM-ROOM', damRoom);

    // Create bolt
    const bolt = new GameObjectImpl({
      id: 'BOLT',
      name: 'Bolt',
      synonyms: ['bolt', 'nut'],
      adjectives: ['metal', 'large'],
      description: 'A large metal bolt.',
      location: 'DAM-ROOM',
      properties: new Map(),
      flags: new Set([ObjectFlag.TURNBIT, ObjectFlag.NDESCBIT])
    });
    objects.set('BOLT', bolt);

    // Create wrench
    const wrench = new GameObjectImpl({
      id: 'WRENCH',
      name: 'Wrench',
      synonyms: ['wrench'],
      adjectives: [],
      description: 'A wrench.',
      location: 'PLAYER',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.TOOLBIT])
    });
    objects.set('WRENCH', wrench);

    state = new GameState({
      currentRoom: 'DAM-ROOM',
      objects,
      rooms,
      inventory: ['WRENCH'],
      globalVariables: new Map([
        ['GATE_FLAG', true],
        ['GATES_OPEN', false]
      ]),
      score: 0,
      moves: 0
    });
  });

  it('should open gates when bolt is turned with wrench', () => {
    const result = DamPuzzle.turnBolt(state, 'WRENCH');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('sluice gates open');
    expect(state.getGlobalVariable('GATES_OPEN')).toBe(true);
  });

  it('should close gates when bolt is turned again', () => {
    state.setGlobalVariable('GATES_OPEN', true);
    
    const result = DamPuzzle.turnBolt(state, 'WRENCH');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('close');
    expect(state.getGlobalVariable('GATES_OPEN')).toBe(false);
  });

  it('should not turn bolt without wrench', () => {
    const result = DamPuzzle.turnBolt(state, '');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("won't turn with your best effort");
  });

  it('should not turn bolt when gate flag is off', () => {
    state.setGlobalVariable('GATE_FLAG', false);
    
    const result = DamPuzzle.turnBolt(state, 'WRENCH');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain("won't turn");
  });

  it('should push blue button to start leak', () => {
    const leak = new GameObjectImpl({
      id: 'LEAK',
      name: 'Leak',
      synonyms: ['leak'],
      adjectives: [],
      description: 'A leak.',
      location: 'MAINTENANCE-ROOM',
      properties: new Map(),
      flags: new Set([ObjectFlag.INVISIBLE])
    });
    state.objects.set('LEAK', leak);
    
    const result = DamPuzzle.pushButton(state, 'BLUE-BUTTON');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('leak');
    expect(state.getGlobalVariable('WATER_LEVEL')).toBe(1);
    expect(leak.hasFlag(ObjectFlag.INVISIBLE)).toBe(false);
  });

  it('should push yellow button to turn on gate flag', () => {
    state.setGlobalVariable('GATE_FLAG', false);
    
    const result = DamPuzzle.pushButton(state, 'YELLOW-BUTTON');
    
    expect(result.success).toBe(true);
    expect(state.getGlobalVariable('GATE_FLAG')).toBe(true);
  });

  it('should fix leak with putty', () => {
    state.setGlobalVariable('WATER_LEVEL', 5);
    
    const result = DamPuzzle.fixLeak(state, 'PUTTY');
    
    expect(result.success).toBe(true);
    expect(state.getGlobalVariable('WATER_LEVEL')).toBe(-1);
  });
});

describe('Mirror Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const mirrorRoom = new RoomImpl({
      id: 'MIRROR-ROOM-1',
      name: 'Mirror Room',
      description: 'You are in a mirror room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('MIRROR-ROOM-1', mirrorRoom);

    state = new GameState({
      currentRoom: 'MIRROR-ROOM-1',
      objects,
      rooms,
      inventory: [],
      globalVariables: new Map([
        ['MIRROR_MUNG', false]
      ]),
      score: 0,
      moves: 0
    });
  });

  it('should break mirror when attacked', () => {
    const result = MirrorPuzzle.breakMirror(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('broken');
    expect(state.getGlobalVariable('MIRROR_MUNG')).toBe(true);
    expect(state.getGlobalVariable('LUCKY')).toBe(false);
  });

  it('should not break mirror twice', () => {
    state.setGlobalVariable('MIRROR_MUNG', true);
    
    const result = MirrorPuzzle.breakMirror(state);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('enough damage');
  });

  it('should examine broken mirror', () => {
    state.setGlobalVariable('MIRROR_MUNG', true);
    
    const result = MirrorPuzzle.examineMirror(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('broken into many pieces');
  });

  it('should examine intact mirror', () => {
    const result = MirrorPuzzle.examineMirror(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('ugly person');
  });
});

describe('Rainbow Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const aragainFalls = new RoomImpl({
      id: 'ARAGAIN-FALLS',
      name: 'Aragain Falls',
      description: 'You are at the falls.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('ARAGAIN-FALLS', aragainFalls);

    const endOfRainbow = new RoomImpl({
      id: 'END-OF-RAINBOW',
      name: 'End of Rainbow',
      description: 'You are at the end of the rainbow.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('END-OF-RAINBOW', endOfRainbow);

    const pot = new GameObjectImpl({
      id: 'POT-OF-GOLD',
      name: 'Pot of Gold',
      synonyms: ['pot', 'gold'],
      adjectives: [],
      description: 'A pot of gold.',
      location: 'END-OF-RAINBOW',
      properties: new Map(),
      flags: new Set([ObjectFlag.INVISIBLE, ObjectFlag.TAKEBIT])
    });
    objects.set('POT-OF-GOLD', pot);

    state = new GameState({
      currentRoom: 'ARAGAIN-FALLS',
      objects,
      rooms,
      inventory: ['SCEPTRE'],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
    state.setFlag('RAINBOW_FLAG', false);
  });

  it('should make rainbow appear when sceptre is waved', () => {
    const result = RainbowPuzzle.waveSceptre(state, 'SCEPTRE');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('rainbow');
    expect(state.getFlag('RAINBOW_FLAG')).toBe(true);
  });

  it('should make rainbow disappear when waved again', () => {
    state.setFlag('RAINBOW_FLAG', true);
    
    const result = RainbowPuzzle.waveSceptre(state, 'SCEPTRE');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('run-of-the-mill');
    expect(state.getFlag('RAINBOW_FLAG')).toBe(false);
  });

  it('should reveal pot of gold at end of rainbow', () => {
    state.setCurrentRoom('END-OF-RAINBOW');
    const pot = state.getObject('POT-OF-GOLD') as GameObjectImpl;
    
    const result = RainbowPuzzle.waveSceptre(state, 'SCEPTRE');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('pot of gold');
    expect(pot.hasFlag(ObjectFlag.INVISIBLE)).toBe(false);
  });

  it('should not climb rainbow when not solid', () => {
    const result = RainbowPuzzle.climbRainbow(state);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('not solid');
  });

  it('should climb rainbow when solid', () => {
    state.setFlag('RAINBOW_FLAG', true);
    
    const result = RainbowPuzzle.climbRainbow(state);
    
    expect(result.success).toBe(true);
  });
});

describe('Rope and Basket Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const shaftRoom = new RoomImpl({
      id: 'SHAFT-ROOM',
      name: 'Shaft Room',
      description: 'You are in a shaft room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('SHAFT-ROOM', shaftRoom);

    const lowerShaft = new RoomImpl({
      id: 'LOWER-SHAFT',
      name: 'Lower Shaft',
      description: 'You are in the lower shaft.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('LOWER-SHAFT', lowerShaft);

    const raisedBasket = new GameObjectImpl({
      id: 'RAISED-BASKET',
      name: 'Basket',
      synonyms: ['basket'],
      adjectives: [],
      description: 'A basket.',
      location: 'SHAFT-ROOM',
      properties: new Map(),
      flags: new Set([ObjectFlag.CONTBIT])
    });
    objects.set('RAISED-BASKET', raisedBasket);

    const loweredBasket = new GameObjectImpl({
      id: 'LOWERED-BASKET',
      name: 'Basket',
      synonyms: ['basket'],
      adjectives: [],
      description: 'A basket.',
      location: 'LOWER-SHAFT',
      properties: new Map(),
      flags: new Set([ObjectFlag.CONTBIT])
    });
    objects.set('LOWERED-BASKET', loweredBasket);

    state = new GameState({
      currentRoom: 'SHAFT-ROOM',
      objects,
      rooms,
      inventory: [],
      globalVariables: new Map([
        ['CAGE_TOP', true]
      ]),
      score: 0,
      moves: 0
    });
  });

  it('should lower basket from top', () => {
    const result = RopeBasketPuzzle.lowerBasket(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('lowered');
    expect(state.getGlobalVariable('CAGE_TOP')).toBe(false);
  });

  it('should raise basket from bottom', () => {
    state.setGlobalVariable('CAGE_TOP', false);
    
    const result = RopeBasketPuzzle.raiseBasket(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('raised');
    expect(state.getGlobalVariable('CAGE_TOP')).toBe(true);
  });

  it('should not lower basket when already at bottom', () => {
    state.setGlobalVariable('CAGE_TOP', false);
    
    const result = RopeBasketPuzzle.lowerBasket(state);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('already at the bottom');
  });

  it('should tie rope to railing', () => {
    const rope = new GameObjectImpl({
      id: 'ROPE',
      name: 'Rope',
      synonyms: ['rope'],
      adjectives: [],
      description: 'A rope.',
      location: 'PLAYER',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT])
    });
    state.objects.set('ROPE', rope);
    state.inventory.push('ROPE');
    
    const result = RopeBasketPuzzle.tieRope(state, 'ROPE', 'RAILING');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('The rope drops over the side and comes within ten feet of the floor.');
    expect(state.getGlobalVariable('ROPE_TIED')).toBe(true);
  });
});

describe('Trap Door Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const livingRoom = new RoomImpl({
      id: 'LIVING-ROOM',
      name: 'Living Room',
      description: 'You are in the living room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('LIVING-ROOM', livingRoom);

    const trapDoor = new GameObjectImpl({
      id: 'TRAP-DOOR',
      name: 'Trap Door',
      synonyms: ['door', 'trapdoor'],
      adjectives: ['trap'],
      description: 'A trap door.',
      location: 'LIVING-ROOM',
      properties: new Map(),
      flags: new Set([ObjectFlag.DOORBIT, ObjectFlag.INVISIBLE])
    });
    objects.set('TRAP-DOOR', trapDoor);

    state = new GameState({
      currentRoom: 'LIVING-ROOM',
      objects,
      rooms,
      inventory: [],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
  });

  it('should reveal trap door when rug is moved', () => {
    const trapDoor = state.getObject('TRAP-DOOR') as GameObjectImpl;
    
    const result = TrapDoorPuzzle.moveRug(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('trap door');
    expect(trapDoor.hasFlag(ObjectFlag.INVISIBLE)).toBe(false);
  });

  it('should open trap door', () => {
    const trapDoor = state.getObject('TRAP-DOOR') as GameObjectImpl;
    trapDoor.removeFlag(ObjectFlag.INVISIBLE);
    
    const result = TrapDoorPuzzle.openTrapDoor(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('staircase');
    expect(trapDoor.hasFlag(ObjectFlag.OPENBIT)).toBe(true);
  });
});

describe('Grating Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const clearing = new RoomImpl({
      id: 'GRATING-CLEARING',
      name: 'Clearing',
      description: 'You are in a clearing.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('GRATING-CLEARING', clearing);

    const grating = new GameObjectImpl({
      id: 'GRATE',
      name: 'Grating',
      synonyms: ['grate', 'grating'],
      adjectives: [],
      description: 'A grating.',
      location: 'GRATING-CLEARING',
      properties: new Map(),
      flags: new Set([ObjectFlag.DOORBIT, ObjectFlag.INVISIBLE])
    });
    objects.set('GRATE', grating);

    const keys = new GameObjectImpl({
      id: 'KEYS',
      name: 'Keys',
      synonyms: ['keys'],
      adjectives: [],
      description: 'A set of keys.',
      location: 'PLAYER',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT])
    });
    objects.set('KEYS', keys);

    state = new GameState({
      currentRoom: 'GRATING-CLEARING',
      objects,
      rooms,
      inventory: ['KEYS'],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
  });

  it('should reveal grating when leaves are moved', () => {
    const grating = state.getObject('GRATE') as GameObjectImpl;
    
    const result = GratingPuzzle.revealGrating(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('grating is revealed');
    expect(grating.hasFlag(ObjectFlag.INVISIBLE)).toBe(false);
  });

  it('should unlock grating with keys', () => {
    const grating = state.getObject('GRATE') as GameObjectImpl;
    grating.removeFlag(ObjectFlag.INVISIBLE);
    
    const result = GratingPuzzle.unlockGrating(state, 'KEYS');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('unlocked');
    expect(grating.hasFlag(ObjectFlag.OPENBIT)).toBe(true);
  });
});

describe('Boat Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const boat = new GameObjectImpl({
      id: 'INFLATABLE-BOAT',
      name: 'Boat',
      synonyms: ['boat'],
      adjectives: [],
      description: 'An inflatable boat.',
      location: 'PLAYER',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT])
    });
    objects.set('INFLATABLE-BOAT', boat);

    const inflatedBoat = new GameObjectImpl({
      id: 'INFLATED-BOAT',
      name: 'Boat',
      synonyms: ['boat'],
      adjectives: [],
      description: 'An inflated boat.',
      location: 'NOWHERE',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.VEHBIT])
    });
    objects.set('INFLATED-BOAT', inflatedBoat);

    const pump = new GameObjectImpl({
      id: 'PUMP',
      name: 'Pump',
      synonyms: ['pump'],
      adjectives: [],
      description: 'A pump.',
      location: 'PLAYER',
      properties: new Map(),
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.TOOLBIT])
    });
    objects.set('PUMP', pump);

    state = new GameState({
      currentRoom: 'DAM-BASE',
      objects,
      rooms: new Map(),
      inventory: ['INFLATABLE-BOAT', 'PUMP'],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
    state.setFlag('DEFLATE', true);
  });

  it('should inflate boat with pump', () => {
    const result = BoatPuzzle.inflateBoat(state, 'INFLATABLE-BOAT', 'PUMP');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('inflates');
    expect(state.getFlag('DEFLATE')).toBe(false);
  });

  it('should deflate boat', () => {
    state.setFlag('DEFLATE', false);
    
    const result = BoatPuzzle.deflateBoat(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('deflates');
    expect(state.getFlag('DEFLATE')).toBe(true);
  });
});

describe('Coffin Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState({
      currentRoom: 'EGYPT-ROOM',
      objects: new Map(),
      rooms: new Map(),
      inventory: [],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
    state.setFlag('COFFIN_CURE', false);
  });

  it('should push coffin to reveal passage', () => {
    const result = CoffinPuzzle.pushCoffin(state);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('passage');
    expect(state.getFlag('COFFIN_CURE')).toBe(true);
  });

  it('should not reveal passage twice', () => {
    state.setFlag('COFFIN_CURE', true);
    
    const result = CoffinPuzzle.pushCoffin(state);
    
    expect(result.success).toBe(true);
    expect(result.message).not.toContain('passage');
  });
});

describe('Magic Word Puzzle', () => {
  let state: GameState;

  beforeEach(() => {
    const objects = new Map<string, GameObjectImpl>();
    const rooms = new Map<string, RoomImpl>();

    const cyclopsRoom = new RoomImpl({
      id: 'CYCLOPS-ROOM',
      name: 'Cyclops Room',
      description: 'You are in the cyclops room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    rooms.set('CYCLOPS-ROOM', cyclopsRoom);

    state = new GameState({
      currentRoom: 'CYCLOPS-ROOM',
      objects,
      rooms,
      inventory: [],
      globalVariables: new Map(),
      score: 0,
      moves: 0
    });
    state.setFlag('MAGIC_FLAG', false);
    state.setFlag('CYCLOPS_FLAG', false);
  });

  it('should say magic word to scare cyclops', () => {
    const result = MagicWordPuzzle.sayMagicWord(state, 'ULYSSES');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('cyclops');
    expect(state.getFlag('MAGIC_FLAG')).toBe(true);
    expect(state.getFlag('CYCLOPS_FLAG')).toBe(true);
  });

  it('should not work with wrong word', () => {
    const result = MagicWordPuzzle.sayMagicWord(state, 'WRONG');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('Nothing happens');
    expect(state.getFlag('MAGIC_FLAG')).toBe(false);
  });

  it('should not work in wrong room', () => {
    // Add a different room
    const livingRoom = new RoomImpl({
      id: 'LIVING-ROOM',
      name: 'Living Room',
      description: 'You are in the living room.',
      exits: new Map(),
      objects: [],
      visited: false,
      flags: new Set()
    });
    state.rooms.set('LIVING-ROOM', livingRoom);
    state.setCurrentRoom('LIVING-ROOM');
    
    const result = MagicWordPuzzle.sayMagicWord(state, 'ULYSSES');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('Nothing happens');
    expect(state.getFlag('MAGIC_FLAG')).toBe(false);
  });
});
