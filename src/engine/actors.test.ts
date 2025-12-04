/**
 * Tests for NPC Actor System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ActorManager, ActorState, BaseActorBehavior } from './actors.js';
import { ThiefBehavior } from './thief.js';
import { TrollBehavior } from './troll.js';
import { CyclopsBehavior } from './cyclops.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { RoomImpl } from '../game/rooms.js';
import { ObjectFlag } from '../game/data/flags.js';

describe('ActorManager', () => {
  let actorManager: ActorManager;
  let state: GameState;

  beforeEach(() => {
    actorManager = new ActorManager();
    
    // Create minimal game state
    const objects = new Map();
    const rooms = new Map();
    
    rooms.set('TEST-ROOM', new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map()
    }));
    
    state = GameState.createInitialState(objects, rooms);
    state.currentRoom = 'TEST-ROOM';
  });

  it('should register and retrieve actors', () => {
    const behavior = new ThiefBehavior();
    actorManager.registerActor(behavior);
    
    const retrieved = actorManager.getActor('THIEF');
    expect(retrieved).toBe(behavior);
  });

  it('should unregister actors', () => {
    const behavior = new ThiefBehavior();
    actorManager.registerActor(behavior);
    actorManager.unregisterActor('THIEF');
    
    const retrieved = actorManager.getActor('THIEF');
    expect(retrieved).toBeUndefined();
  });

  it('should execute all actor turns', () => {
    const behavior = new ThiefBehavior();
    actorManager.registerActor(behavior);
    
    // Add thief object
    const thief = new GameObjectImpl({
      id: 'THIEF',
      name: 'thief',
      description: 'A thief',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    state.objects.set('THIEF', thief);
    
    // Execute turn
    const result = actorManager.executeTurn(state);
    expect(typeof result).toBe('boolean');
  });

  it('should handle actor state transitions', () => {
    const behavior = new ThiefBehavior();
    actorManager.registerActor(behavior);
    
    // Add thief object
    const thief = new GameObjectImpl({
      id: 'THIEF',
      name: 'thief',
      description: 'A thief',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    state.objects.set('THIEF', thief);
    
    actorManager.transitionActorState('THIEF', ActorState.DEAD, state);
    expect(behavior.state).toBe(ActorState.DEAD);
  });
});

describe('ThiefBehavior', () => {
  let thief: ThiefBehavior;
  let state: GameState;

  beforeEach(() => {
    thief = new ThiefBehavior();
    
    // Create game state with thief
    const objects = new Map();
    const rooms = new Map();
    
    rooms.set('TEST-ROOM', new RoomImpl({
      id: 'TEST-ROOM',
      name: 'Test Room',
      description: 'A test room',
      exits: new Map()
    }));
    
    rooms.set('TREASURE-ROOM', new RoomImpl({
      id: 'TREASURE-ROOM',
      name: 'Treasure Room',
      description: 'A treasure room',
      exits: new Map()
    }));
    
    const thiefObj = new GameObjectImpl({
      id: 'THIEF',
      name: 'thief',
      description: 'A thief',
      location: 'TEST-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    objects.set('THIEF', thiefObj);
    
    const stiletto = new GameObjectImpl({
      id: 'STILETTO',
      name: 'stiletto',
      description: 'A stiletto',
      location: 'THIEF',
      flags: [ObjectFlag.WEAPONBIT]
    });
    objects.set('STILETTO', stiletto);
    
    state = GameState.createInitialState(objects, rooms);
    state.currentRoom = 'TEST-ROOM';
  });

  it('should initialize with correct state', () => {
    expect(thief.actorId).toBe('THIEF');
    expect(thief.state).toBe(ActorState.NORMAL);
  });

  it('should execute turn without crashing', () => {
    const result = thief.executeTurn(state);
    expect(typeof result).toBe('boolean');
  });

  it('should transition to dead state and drop items', () => {
    const treasure = new GameObjectImpl({
      id: 'TREASURE',
      name: 'treasure',
      description: 'A treasure',
      location: 'THIEF',
      value: 10
    });
    state.objects.set('TREASURE', treasure);
    
    thief.transitionState(ActorState.DEAD, state);
    
    expect(thief.state).toBe(ActorState.DEAD);
    expect(treasure.location).toBe(state.currentRoom);
  });

  it('should not accept items', () => {
    const item = new GameObjectImpl({
      id: 'ITEM',
      name: 'item',
      description: 'An item'
    });
    
    const accepted = thief.onReceiveItem(state, item);
    expect(accepted).toBe(false);
  });
});

describe('TrollBehavior', () => {
  let troll: TrollBehavior;
  let state: GameState;

  beforeEach(() => {
    troll = new TrollBehavior();
    
    // Create game state with troll
    const objects = new Map();
    const rooms = new Map();
    
    rooms.set('TROLL-ROOM', new RoomImpl({
      id: 'TROLL-ROOM',
      name: 'Troll Room',
      description: 'A room with a troll',
      exits: new Map()
    }));
    
    const trollObj = new GameObjectImpl({
      id: 'TROLL',
      name: 'troll',
      description: 'A troll',
      location: 'TROLL-ROOM',
      flags: [ObjectFlag.ACTORBIT, ObjectFlag.FIGHTBIT]
    });
    objects.set('TROLL', trollObj);
    
    const axe = new GameObjectImpl({
      id: 'AXE',
      name: 'axe',
      description: 'An axe',
      location: 'TROLL',
      flags: [ObjectFlag.WEAPONBIT]
    });
    objects.set('AXE', axe);
    
    state = GameState.createInitialState(objects, rooms);
    state.currentRoom = 'TROLL-ROOM';
  });

  it('should initialize with fighting state', () => {
    expect(troll.actorId).toBe('TROLL');
    expect(troll.state).toBe(ActorState.FIGHTING);
  });

  it('should execute turn without crashing', () => {
    const result = troll.executeTurn(state);
    expect(typeof result).toBe('boolean');
  });

  it('should drop axe when unconscious', () => {
    troll.transitionState(ActorState.UNCONSCIOUS, state);
    
    const axe = state.getObject('AXE');
    expect(axe?.location).toBe(state.currentRoom);
    expect(state.getFlag('TROLL_FLAG')).toBe(true);
  });

  it('should drop axe when dead', () => {
    troll.transitionState(ActorState.DEAD, state);
    
    const axe = state.getObject('AXE');
    expect(axe?.location).toBe(state.currentRoom);
    expect(state.getFlag('TROLL_FLAG')).toBe(true);
  });

  it('should accept axe as gift', () => {
    const axe = state.getObject('AXE');
    if (axe) {
      state.moveObject('AXE', 'PLAYER');
      const accepted = troll.onReceiveItem(state, axe);
      expect(accepted).toBe(true);
      expect(axe.location).toBe('TROLL');
    }
  });

  it('should eat other items', () => {
    const item = new GameObjectImpl({
      id: 'ITEM',
      name: 'item',
      description: 'An item'
    });
    state.objects.set('ITEM', item);
    
    const accepted = troll.onReceiveItem(state, item);
    expect(accepted).toBe(true);
    expect(item.location).toBeNull();
  });
});

describe('CyclopsBehavior', () => {
  let cyclops: CyclopsBehavior;
  let state: GameState;

  beforeEach(() => {
    cyclops = new CyclopsBehavior();
    
    // Create game state with cyclops
    const objects = new Map();
    const rooms = new Map();
    
    rooms.set('CYCLOPS-ROOM', new RoomImpl({
      id: 'CYCLOPS-ROOM',
      name: 'Cyclops Room',
      description: 'A room with a cyclops',
      exits: new Map()
    }));
    
    const cyclopsObj = new GameObjectImpl({
      id: 'CYCLOPS',
      name: 'cyclops',
      description: 'A cyclops',
      location: 'CYCLOPS-ROOM',
      flags: [ObjectFlag.ACTORBIT]
    });
    objects.set('CYCLOPS', cyclopsObj);
    
    const lunch = new GameObjectImpl({
      id: 'LUNCH',
      name: 'lunch',
      description: 'Hot peppers'
    });
    objects.set('LUNCH', lunch);
    
    const water = new GameObjectImpl({
      id: 'WATER',
      name: 'water',
      description: 'Water'
    });
    objects.set('WATER', water);
    
    const bottle = new GameObjectImpl({
      id: 'BOTTLE',
      name: 'bottle',
      description: 'A bottle',
      flags: [ObjectFlag.CONTBIT]
    });
    objects.set('BOTTLE', bottle);
    
    state = GameState.createInitialState(objects, rooms);
    state.currentRoom = 'CYCLOPS-ROOM';
  });

  it('should initialize with normal state', () => {
    expect(cyclops.actorId).toBe('CYCLOPS');
    expect(cyclops.state).toBe(ActorState.NORMAL);
  });

  it('should execute turn without crashing', () => {
    const result = cyclops.executeTurn(state);
    expect(typeof result).toBe('boolean');
  });

  it('should accept lunch and become thirsty', () => {
    const lunch = state.getObject('LUNCH');
    if (lunch) {
      const accepted = cyclops.onReceiveItem(state, lunch);
      expect(accepted).toBe(true);
      expect(cyclops.getWrathLevel()).toBeLessThan(0);
    }
  });

  it('should accept water when thirsty and fall asleep', () => {
    // Make cyclops thirsty first
    cyclops.setWrathLevel(-1);
    
    const water = state.getObject('WATER');
    if (water) {
      const accepted = cyclops.onReceiveItem(state, water);
      expect(accepted).toBe(true);
      expect(cyclops.state).toBe(ActorState.SLEEPING);
      expect(state.getFlag('CYCLOPS_FLAG')).toBe(true);
    }
  });

  it('should reject water when not thirsty', () => {
    const water = state.getObject('WATER');
    if (water) {
      const accepted = cyclops.onReceiveItem(state, water);
      expect(accepted).toBe(false);
    }
  });

  it('should not act when not in same room as player', () => {
    state.currentRoom = 'TEST-ROOM';
    const shouldAct = cyclops.shouldAct(state);
    expect(shouldAct).toBe(false);
  });
});
