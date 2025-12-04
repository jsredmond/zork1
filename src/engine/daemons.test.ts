/**
 * Daemon Tests
 * Tests for lamp and candle timer daemons
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  lampTimerDaemon, 
  candleTimerDaemon,
  initializeLampTimer,
  disableLampTimer,
  initializeCandleTimer,
  disableCandleTimer,
  resetLampTimer,
  resetCandleTimer
} from './daemons.js';
import { GameState } from '../game/state.js';
import { GameObjectImpl } from '../game/objects.js';
import { ObjectFlag } from '../game/data/flags.js';

describe('Lamp Timer Daemon', () => {
  let state: GameState;
  let lamp: GameObjectImpl;

  beforeEach(() => {
    state = new GameState();
    resetLampTimer();
    
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
  });

  it('should initialize lamp timer correctly', () => {
    initializeLampTimer(state);
    
    expect(state.getGlobalVariable('LAMP_TICKS')).toBe(100);
    expect(state.eventSystem.hasEvent('I-LANTERN')).toBe(true);
  });

  it('should not run when lamp is off', () => {
    lamp.flags.delete(ObjectFlag.ONBIT);
    initializeLampTimer(state);
    
    const result = lampTimerDaemon(state);
    
    expect(result).toBe(false);
  });

  it('should decrement ticks when lamp is on', () => {
    initializeLampTimer(state);
    state.setGlobalVariable('LAMP_TICKS', 5);
    
    lampTimerDaemon(state);
    
    expect(state.getGlobalVariable('LAMP_TICKS')).toBe(4);
  });

  it('should disable lamp timer when requested', () => {
    initializeLampTimer(state);
    
    disableLampTimer(state);
    
    const status = state.eventSystem.getEventStatus('I-LANTERN');
    expect(status?.enabled).toBe(false);
  });

  it('should turn off lamp when battery runs out', () => {
    initializeLampTimer(state);
    state.setGlobalVariable('LAMP_TICKS', 1);
    
    // Run through all stages to reach burnout
    for (let i = 0; i < 200; i++) {
      lampTimerDaemon(state);
      if (!lamp.flags.has(ObjectFlag.ONBIT)) {
        break;
      }
    }
    
    expect(lamp.flags.has(ObjectFlag.ONBIT)).toBe(false);
  });
});

describe('Candle Timer Daemon', () => {
  let state: GameState;
  let candles: GameObjectImpl;

  beforeEach(() => {
    state = new GameState();
    resetCandleTimer();
    
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
  });

  it('should initialize candle timer correctly', () => {
    initializeCandleTimer(state);
    
    expect(state.getGlobalVariable('CANDLE_TICKS')).toBe(20);
    expect(state.eventSystem.hasEvent('I-CANDLES')).toBe(true);
  });

  it('should not run when candles are off', () => {
    candles.flags.delete(ObjectFlag.ONBIT);
    initializeCandleTimer(state);
    
    const result = candleTimerDaemon(state);
    
    expect(result).toBe(false);
  });

  it('should decrement ticks when candles are on', () => {
    initializeCandleTimer(state);
    state.setGlobalVariable('CANDLE_TICKS', 5);
    
    candleTimerDaemon(state);
    
    expect(state.getGlobalVariable('CANDLE_TICKS')).toBe(4);
  });

  it('should mark candles as touched when lit', () => {
    initializeCandleTimer(state);
    
    candleTimerDaemon(state);
    
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
    state.setGlobalVariable('CANDLE_TICKS', 1);
    
    // Run through all stages to reach burnout
    for (let i = 0; i < 50; i++) {
      candleTimerDaemon(state);
      if (!candles.flags.has(ObjectFlag.ONBIT)) {
        break;
      }
    }
    
    expect(candles.flags.has(ObjectFlag.ONBIT)).toBe(false);
  });
});

describe('Timer Integration', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
    resetLampTimer();
    resetCandleTimer();
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

    // Both should have tick counts
    expect(state.getGlobalVariable('LAMP_TICKS')).toBeDefined();
    expect(state.getGlobalVariable('CANDLE_TICKS')).toBeDefined();
  });
});
