/**
 * Daemon Tests
 * Tests for lamp and candle timer daemons
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  lampTimerInterrupt, 
  candleTimerInterrupt,
  initializeLampTimer,
  disableLampTimer,
  initializeCandleTimer,
  disableCandleTimer,
  resetLampTimer,
  resetCandleTimer,
  forestRoomDaemon,
  isForestRoom,
  enableForestRoomDaemon
} from './daemons.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';

describe('Lamp Timer Daemon', () => {
  let state: GameState;
  let lamp: GameObjectImpl;

  beforeEach(() => {
    state = new GameState();
    
    // Create a lamp object
    lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'brass lantern',
      synonyms: ['lamp', 'lantern', 'light'],
      adjectives: ['brass'],
      description: 'A battery-powered brass lantern.',
      location: 'PLAYER',
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT]),
      size: 15
    });
    
    state.objects.set('LAMP', lamp);
    state.addToInventory('LAMP');
    
    // Register the lamp timer interrupt (normally done by gameFactory)
    state.eventSystem.registerInterrupt('I-LANTERN', (s) => lampTimerInterrupt(s), 0);
  });

  it('should initialize lamp timer correctly', () => {
    initializeLampTimer(state);
    
    // The implementation uses LAMP_STAGE_INDEX, not LAMP_TICKS
    expect(state.getGlobalVariable('LAMP_STAGE_INDEX')).toBe(0);
    expect(state.eventSystem.hasEvent('I-LANTERN')).toBe(true);
  });

  it('should not run when lamp is off', () => {
    lamp.flags.delete(ObjectFlag.ONBIT);
    initializeLampTimer(state);
    
    const result = lampTimerInterrupt(state);
    
    expect(result).toBe(false);
  });

  it('should advance stage when lamp is on', () => {
    initializeLampTimer(state);
    
    // Run the interrupt
    lampTimerInterrupt(state);
    
    // Stage should advance
    expect(state.getGlobalVariable('LAMP_STAGE_INDEX')).toBe(1);
  });

  it('should disable lamp timer when requested', () => {
    initializeLampTimer(state);
    
    disableLampTimer(state);
    
    const status = state.eventSystem.getEventStatus('I-LANTERN');
    expect(status?.enabled).toBe(false);
  });

  it('should turn off lamp when battery runs out', () => {
    initializeLampTimer(state);
    
    // Run through all stages to reach burnout (4 stages: 100, 70, 15, 0)
    for (let i = 0; i < 4; i++) {
      lampTimerInterrupt(state);
    }
    
    expect(lamp.flags.has(ObjectFlag.ONBIT)).toBe(false);
  });
});

describe('Candle Timer Daemon', () => {
  let state: GameState;
  let candles: GameObjectImpl;

  beforeEach(() => {
    state = new GameState();
    
    // Create candles object
    candles = new GameObjectImpl({
      id: 'CANDLES',
      name: 'pair of candles',
      synonyms: ['candles', 'candle'],
      adjectives: ['pair'],
      description: 'A pair of candles.',
      location: 'PLAYER',
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT]),
      size: 5
    });
    
    state.objects.set('CANDLES', candles);
    state.addToInventory('CANDLES');
    
    // Register the candle timer interrupt (normally done by gameFactory)
    state.eventSystem.registerInterrupt('I-CANDLES', (s) => candleTimerInterrupt(s), 0);
  });

  it('should initialize candle timer correctly', () => {
    initializeCandleTimer(state);
    
    // The implementation uses CANDLE_STAGE_INDEX, not CANDLE_TICKS
    expect(state.getGlobalVariable('CANDLE_STAGE_INDEX')).toBe(0);
    expect(state.eventSystem.hasEvent('I-CANDLES')).toBe(true);
  });

  it('should not run when candles are off', () => {
    candles.flags.delete(ObjectFlag.ONBIT);
    initializeCandleTimer(state);
    
    const result = candleTimerInterrupt(state);
    
    expect(result).toBe(false);
  });

  it('should advance stage when candles are on', () => {
    initializeCandleTimer(state);
    
    // Run the interrupt
    candleTimerInterrupt(state);
    
    // Stage should advance
    expect(state.getGlobalVariable('CANDLE_STAGE_INDEX')).toBe(1);
  });

  it('should mark candles as touched when lit', () => {
    initializeCandleTimer(state);
    
    candleTimerInterrupt(state);
    
    expect(candles.flags.has('TOUCHBIT' as any)).toBe(true);
  });

  it('should disable candle timer when requested', () => {
    initializeCandleTimer(state);
    
    disableCandleTimer(state);
    
    const status = state.eventSystem.getEventStatus('I-CANDLES');
    expect(status?.enabled).toBe(false);
  });

  it('should turn off candles when they burn out', () => {
    initializeCandleTimer(state);
    
    // Run through all stages to reach burnout (4 stages: 20, 10, 5, 0)
    for (let i = 0; i < 4; i++) {
      candleTimerInterrupt(state);
    }
    
    expect(candles.flags.has(ObjectFlag.ONBIT)).toBe(false);
  });
});

describe('Timer Integration', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
    
    // Register both timer interrupts (normally done by gameFactory)
    state.eventSystem.registerInterrupt('I-LANTERN', (s) => lampTimerInterrupt(s), 0);
    state.eventSystem.registerInterrupt('I-CANDLES', (s) => candleTimerInterrupt(s), 0);
  });

  it('should handle both timers running simultaneously', () => {
    // Create lamp
    const lamp = new GameObjectImpl({
      id: 'LAMP',
      name: 'brass lantern',
      synonyms: ['lamp'],
      adjectives: ['brass'],
      description: 'A lamp.',
      location: 'PLAYER',
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT]),
      size: 15
    });
    state.objects.set('LAMP', lamp);
    state.addToInventory('LAMP');

    // Create candles
    const candles = new GameObjectImpl({
      id: 'CANDLES',
      name: 'candles',
      synonyms: ['candles'],
      adjectives: [],
      description: 'Candles.',
      location: 'PLAYER',
      flags: new Set([ObjectFlag.TAKEBIT, ObjectFlag.LIGHTBIT, ObjectFlag.ONBIT]),
      size: 5
    });
    state.objects.set('CANDLES', candles);
    state.addToInventory('CANDLES');

    // Initialize both timers
    initializeLampTimer(state);
    initializeCandleTimer(state);

    // Both should be registered
    expect(state.eventSystem.hasEvent('I-LANTERN')).toBe(true);
    expect(state.eventSystem.hasEvent('I-CANDLES')).toBe(true);

    // Both should have stage indices
    expect(state.getGlobalVariable('LAMP_STAGE_INDEX')).toBeDefined();
    expect(state.getGlobalVariable('CANDLE_STAGE_INDEX')).toBeDefined();
  });
});


describe('Forest Room Daemon', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
    
    // Create forest rooms with all required methods
    const forestRooms = ['FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'UP-A-TREE'];
    for (const roomId of forestRooms) {
      state.rooms.set(roomId, {
        id: roomId,
        name: 'Forest',
        description: 'A forest room',
        longDescription: 'This is a forest room.',
        exits: new Map(),
        objects: [],
        flags: new Set(),
        globalObjects: ['SONGBIRD'],
        getExit: () => undefined,
        isExitAvailable: () => false,
        hasFlag: () => false,
        addFlag: () => {},
        removeFlag: () => {},
        markVisited: () => {},
        visited: false
      } as any);
    }
    
    // Create a non-forest room
    state.rooms.set('WEST-OF-HOUSE', {
      id: 'WEST-OF-HOUSE',
      name: 'West of House',
      description: 'West of House',
      longDescription: 'You are standing in an open field west of a white house.',
      exits: new Map(),
      objects: [],
      flags: new Set(),
      globalObjects: [],
      getExit: () => undefined,
      isExitAvailable: () => false,
      hasFlag: () => false,
      addFlag: () => {},
      removeFlag: () => {},
      markVisited: () => {},
      visited: false
    } as any);
    
    // Register the forest room daemon
    state.eventSystem.registerDaemon('I-FOREST-ROOM', (s) => forestRoomDaemon(s), false);
  });

  it('should identify forest rooms correctly', () => {
    state.setCurrentRoom('FOREST-1');
    expect(isForestRoom(state)).toBe(true);
    
    state.setCurrentRoom('FOREST-2');
    expect(isForestRoom(state)).toBe(true);
    
    state.setCurrentRoom('FOREST-3');
    expect(isForestRoom(state)).toBe(true);
    
    state.setCurrentRoom('PATH');
    expect(isForestRoom(state)).toBe(true);
    
    state.setCurrentRoom('UP-A-TREE');
    expect(isForestRoom(state)).toBe(true);
  });

  it('should identify non-forest rooms correctly', () => {
    state.setCurrentRoom('WEST-OF-HOUSE');
    expect(isForestRoom(state)).toBe(false);
  });

  it('should disable daemon when not in forest room', () => {
    state.setCurrentRoom('WEST-OF-HOUSE');
    enableForestRoomDaemon(state);
    
    // Run the daemon
    forestRoomDaemon(state);
    
    // Daemon should be disabled
    const status = state.eventSystem.getEventStatus('I-FOREST-ROOM');
    expect(status?.enabled).toBe(false);
  });

  it('should enable daemon when entering forest room', () => {
    state.setCurrentRoom('FOREST-1');
    enableForestRoomDaemon(state);
    
    const status = state.eventSystem.getEventStatus('I-FOREST-ROOM');
    expect(status?.enabled).toBe(true);
  });

  it('should sometimes display songbird message in forest room', () => {
    state.setCurrentRoom('FOREST-1');
    enableForestRoomDaemon(state);
    
    // Run the daemon many times to test probability
    // With 15% probability, we should see at least one message in 50 runs
    let messageDisplayed = false;
    const originalLog = console.log;
    console.log = (msg: string) => {
      if (msg.includes('chirping of a song bird')) {
        messageDisplayed = true;
      }
    };
    
    for (let i = 0; i < 50; i++) {
      forestRoomDaemon(state);
    }
    
    console.log = originalLog;
    
    // With 15% probability over 50 runs, the chance of never seeing a message is (0.85)^50 ≈ 0.0003
    // So this test should almost always pass
    expect(messageDisplayed).toBe(true);
  });

  it('should not display message when not in forest room', () => {
    state.setCurrentRoom('WEST-OF-HOUSE');
    
    let messageDisplayed = false;
    const originalLog = console.log;
    console.log = (msg: string) => {
      if (msg.includes('chirping of a song bird')) {
        messageDisplayed = true;
      }
    };
    
    for (let i = 0; i < 50; i++) {
      forestRoomDaemon(state);
    }
    
    console.log = originalLog;
    
    expect(messageDisplayed).toBe(false);
  });
});
