/**
 * Event System Tests
 * Tests for event queue and daemon system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventSystem } from './events.js';
import { GameState } from '../game/state.js';

describe('EventSystem', () => {
  let eventSystem: EventSystem;
  let state: GameState;

  beforeEach(() => {
    eventSystem = new EventSystem();
    state = new GameState();
  });

  describe('Daemon Registration', () => {
    it('should register a daemon', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler);
      
      expect(eventSystem.hasEvent('test-daemon')).toBe(true);
    });

    it('should register a daemon as enabled by default', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler);
      
      const status = eventSystem.getEventStatus('test-daemon');
      expect(status?.enabled).toBe(true);
      expect(status?.isDaemon).toBe(true);
    });

    it('should register a daemon as disabled when specified', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler, false);
      
      const status = eventSystem.getEventStatus('test-daemon');
      expect(status?.enabled).toBe(false);
    });
  });

  describe('Interrupt Registration', () => {
    it('should register an interrupt', () => {
      const handler = () => false;
      eventSystem.registerInterrupt('test-interrupt', handler, 5);
      
      expect(eventSystem.hasEvent('test-interrupt')).toBe(true);
    });

    it('should set correct tick count for interrupt', () => {
      const handler = () => false;
      eventSystem.registerInterrupt('test-interrupt', handler, 10);
      
      expect(eventSystem.getRemainingTicks('test-interrupt')).toBe(10);
    });

    it('should register interrupt as enabled', () => {
      const handler = () => false;
      eventSystem.registerInterrupt('test-interrupt', handler, 5);
      
      const status = eventSystem.getEventStatus('test-interrupt');
      expect(status?.enabled).toBe(true);
      expect(status?.isDaemon).toBe(false);
    });
  });

  describe('Event Control', () => {
    it('should enable an event', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler, false);
      
      eventSystem.enableEvent('test-daemon');
      
      const status = eventSystem.getEventStatus('test-daemon');
      expect(status?.enabled).toBe(true);
    });

    it('should disable an event', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler, true);
      
      eventSystem.disableEvent('test-daemon');
      
      const status = eventSystem.getEventStatus('test-daemon');
      expect(status?.enabled).toBe(false);
    });

    it('should remove an event', () => {
      const handler = () => false;
      eventSystem.registerDaemon('test-daemon', handler);
      
      eventSystem.removeEvent('test-daemon');
      
      expect(eventSystem.hasEvent('test-daemon')).toBe(false);
    });

    it('should queue an interrupt with new tick count', () => {
      const handler = () => false;
      eventSystem.registerInterrupt('test-interrupt', handler, 5);
      
      eventSystem.queueInterrupt('test-interrupt', 10);
      
      expect(eventSystem.getRemainingTicks('test-interrupt')).toBe(10);
    });
  });

  describe('Daemon Execution', () => {
    it('should execute enabled daemon every turn', () => {
      let executionCount = 0;
      const handler = () => {
        executionCount++;
        return false;
      };
      
      eventSystem.registerDaemon('test-daemon', handler);
      
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(3);
    });

    it('should not execute disabled daemon', () => {
      let executionCount = 0;
      const handler = () => {
        executionCount++;
        return false;
      };
      
      eventSystem.registerDaemon('test-daemon', handler, false);
      
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(0);
    });

    it('should return true if daemon causes state change', () => {
      const handler = () => true;
      eventSystem.registerDaemon('test-daemon', handler);
      
      const result = eventSystem.processTurn(state);
      
      expect(result).toBe(true);
    });
  });

  describe('Interrupt Execution', () => {
    it('should decrement interrupt tick count each turn', () => {
      const handler = () => false;
      eventSystem.registerInterrupt('test-interrupt', handler, 3);
      
      eventSystem.processTurn(state);
      expect(eventSystem.getRemainingTicks('test-interrupt')).toBe(2);
      
      eventSystem.processTurn(state);
      expect(eventSystem.getRemainingTicks('test-interrupt')).toBe(1);
    });

    it('should execute interrupt when ticks reach zero', () => {
      let executed = false;
      const handler = () => {
        executed = true;
        return false;
      };
      
      eventSystem.registerInterrupt('test-interrupt', handler, 2);
      
      eventSystem.processTurn(state);
      expect(executed).toBe(false);
      
      eventSystem.processTurn(state);
      expect(executed).toBe(true);
    });

    it('should not execute interrupt before ticks reach zero', () => {
      let executionCount = 0;
      const handler = () => {
        executionCount++;
        return false;
      };
      
      eventSystem.registerInterrupt('test-interrupt', handler, 5);
      
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(0);
    });
  });

  describe('Clock Wait', () => {
    it('should skip turn processing when clock wait is set', () => {
      let executionCount = 0;
      const handler = () => {
        executionCount++;
        return false;
      };
      
      eventSystem.registerDaemon('test-daemon', handler);
      eventSystem.setClockWait();
      
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(0);
    });

    it('should clear clock wait after one turn', () => {
      let executionCount = 0;
      const handler = () => {
        executionCount++;
        return false;
      };
      
      eventSystem.registerDaemon('test-daemon', handler);
      eventSystem.setClockWait();
      
      eventSystem.processTurn(state);
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(1);
    });
  });

  describe('Player Won Mode', () => {
    it('should not execute daemons when player has won', () => {
      let daemonExecuted = false;
      const daemonHandler = () => {
        daemonExecuted = true;
        return false;
      };
      
      eventSystem.registerDaemon('test-daemon', daemonHandler);
      
      eventSystem.processTurn(state, true);
      
      expect(daemonExecuted).toBe(false);
    });

    it('should still execute interrupts when player has won', () => {
      let interruptExecuted = false;
      const interruptHandler = () => {
        interruptExecuted = true;
        return false;
      };
      
      eventSystem.registerInterrupt('test-interrupt', interruptHandler, 0);
      
      eventSystem.processTurn(state, true);
      
      expect(interruptExecuted).toBe(true);
    });
  });

  describe('Move Counter', () => {
    it('should increment move counter each turn', () => {
      const initialMoves = state.moves;
      
      eventSystem.processTurn(state);
      
      expect(state.moves).toBe(initialMoves + 1);
    });

    it('should not increment moves when clock wait is set', () => {
      const initialMoves = state.moves;
      eventSystem.setClockWait();
      
      eventSystem.processTurn(state);
      
      expect(state.moves).toBe(initialMoves);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in daemon gracefully', () => {
      const handler = () => {
        throw new Error('Test error');
      };
      
      eventSystem.registerDaemon('test-daemon', handler);
      
      expect(() => eventSystem.processTurn(state)).not.toThrow();
    });

    it('should handle errors in interrupt gracefully', () => {
      const handler = () => {
        throw new Error('Test error');
      };
      
      eventSystem.registerInterrupt('test-interrupt', handler, 0);
      
      expect(() => eventSystem.processTurn(state)).not.toThrow();
    });
  });

  describe('Clear', () => {
    it('should clear all events', () => {
      eventSystem.registerDaemon('daemon1', () => false);
      eventSystem.registerDaemon('daemon2', () => false);
      eventSystem.registerInterrupt('interrupt1', () => false, 5);
      
      eventSystem.clear();
      
      expect(eventSystem.getEventIds()).toHaveLength(0);
    });

    it('should clear clock wait flag', () => {
      let executionCount = 0;
      eventSystem.setClockWait();
      
      eventSystem.clear();
      eventSystem.registerDaemon('test-daemon', () => {
        executionCount++;
        return false;
      });
      
      eventSystem.processTurn(state);
      
      expect(executionCount).toBe(1);
    });
  });
});
