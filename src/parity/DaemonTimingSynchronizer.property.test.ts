/**
 * Property-Based Tests for DaemonTimingSynchronizer
 * 
 * These tests verify universal properties that should hold for all valid inputs.
 * 
 * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events (daemon portion)
 * 
 * **Validates: Requirements 5.3, 5.5**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  // Lamp timing
  LAMP_WARN_1,
  LAMP_WARN_2,
  LAMP_WARN_3,
  LAMP_DEAD,
  INITIAL_LAMP_FUEL,
  LAMP_TIMING_TABLE,
  getLampWarningMessage,
  getLampWarningForFuel,
  getTicksUntilNextLampWarning,
  getLampStageIndex,
  isLampWarningThreshold,
  // Candle timing
  CANDLE_WARN_1,
  CANDLE_WARN_2,
  CANDLE_WARN_3,
  CANDLE_DEAD,
  INITIAL_CANDLE_FUEL,
  CANDLE_TIMING_TABLE,
  getCandleWarningMessage,
  getCandleWarningForFuel,
  getTicksUntilNextCandleWarning,
  getCandleStageIndex,
  isCandleWarningThreshold,
  // Thief timing
  THIEF_APPEAR_PROBABILITY,
  THIEF_LEAVE_PROBABILITY,
  THIEF_CONTINUE_FIGHT_PROBABILITY,
  THIEF_IDLE_PROBABILITY,
  THIEF_STEAL_PROBABILITY,
  THIEF_DROP_JUNK_PROBABILITY,
  // Troll timing
  TROLL_FIRST_STRIKE_PROBABILITY,
  TROLL_AXE_RECOVERY_FIGHTING,
  TROLL_AXE_RECOVERY_NORMAL,
  // Deterministic timing
  setTimingSeed,
  getTimingSeed,
  getTimingRandom,
  shouldEventOccur,
  shouldThiefAppear,
  shouldThiefLeave,
  shouldThiefContinueFight,
  shouldThiefBeIdle,
  shouldThiefSteal,
  shouldThiefDropJunk,
  shouldTrollStrikeFirst,
  shouldTrollRecoverAxe,
  // State management
  createInitialTimingState
} from './DaemonTimingSynchronizer';

describe('DaemonTimingSynchronizer Property Tests', () => {
  /**
   * Generator for valid seeds
   */
  const seedArb = fc.integer({ min: 1, max: 2147483646 });

  /**
   * Generator for lamp fuel values
   */
  const lampFuelArb = fc.integer({ min: 0, max: INITIAL_LAMP_FUEL });

  /**
   * Generator for candle fuel values
   */
  const candleFuelArb = fc.integer({ min: 0, max: INITIAL_CANDLE_FUEL });

  /**
   * Generator for lamp stage indices
   */
  const lampStageArb = fc.integer({ min: 0, max: LAMP_TIMING_TABLE.length - 1 });

  /**
   * Generator for candle stage indices
   */
  const candleStageArb = fc.integer({ min: 0, max: CANDLE_TIMING_TABLE.length - 1 });

  /**
   * Generator for probability values
   */
  const probabilityArb = fc.double({ min: 0, max: 1, noNaN: true });

  // Reset seed before each test
  beforeEach(() => {
    setTimingSeed(12345);
  });

  // ============================================================================
  // PROPERTY 7: DETERMINISTIC RANDOM EVENTS
  // ============================================================================

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * For any fixed random seed, the sequence of daemon events SHALL be identical
   * across multiple runs.
   * 
   * **Validates: Requirements 5.3, 5.5**
   */
  it('Property 7a: Same seed produces identical random sequences', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        // Generate sequence with seed
        setTimingSeed(seed);
        const sequence1: number[] = [];
        for (let i = 0; i < 100; i++) {
          sequence1.push(getTimingRandom());
        }

        // Generate sequence again with same seed
        setTimingSeed(seed);
        const sequence2: number[] = [];
        for (let i = 0; i < 100; i++) {
          sequence2.push(getTimingRandom());
        }

        // Sequences should be identical
        for (let i = 0; i < 100; i++) {
          if (sequence1[i] !== sequence2[i]) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * Different seeds produce different sequences.
   * 
   * **Validates: Requirements 5.5**
   */
  it('Property 7b: Different seeds produce different sequences', () => {
    fc.assert(
      fc.property(seedArb, seedArb, (seed1, seed2) => {
        // Skip if seeds are the same
        if (seed1 === seed2) {
          return true;
        }

        // Generate sequence with seed1
        setTimingSeed(seed1);
        const sequence1: number[] = [];
        for (let i = 0; i < 10; i++) {
          sequence1.push(getTimingRandom());
        }

        // Generate sequence with seed2
        setTimingSeed(seed2);
        const sequence2: number[] = [];
        for (let i = 0; i < 10; i++) {
          sequence2.push(getTimingRandom());
        }

        // At least one value should differ
        let allSame = true;
        for (let i = 0; i < 10; i++) {
          if (sequence1[i] !== sequence2[i]) {
            allSame = false;
            break;
          }
        }
        return !allSame;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * Random values are always in range [0, 1).
   * 
   * **Validates: Requirements 5.5**
   */
  it('Property 7c: Random values are in valid range', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        setTimingSeed(seed);
        
        for (let i = 0; i < 100; i++) {
          const value = getTimingRandom();
          if (value < 0 || value >= 1) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * shouldEventOccur is deterministic for same seed and probability.
   * 
   * **Validates: Requirements 5.3, 5.5**
   */
  it('Property 7d: shouldEventOccur is deterministic', () => {
    fc.assert(
      fc.property(seedArb, probabilityArb, (seed, probability) => {
        // First run
        setTimingSeed(seed);
        const results1: boolean[] = [];
        for (let i = 0; i < 50; i++) {
          results1.push(shouldEventOccur(probability));
        }

        // Second run with same seed
        setTimingSeed(seed);
        const results2: boolean[] = [];
        for (let i = 0; i < 50; i++) {
          results2.push(shouldEventOccur(probability));
        }

        // Results should be identical
        for (let i = 0; i < 50; i++) {
          if (results1[i] !== results2[i]) {
            return false;
          }
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * Thief event functions are deterministic for same seed.
   * 
   * **Validates: Requirements 5.3, 5.5**
   */
  it('Property 7e: Thief events are deterministic', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        // First run
        setTimingSeed(seed);
        const appear1 = shouldThiefAppear();
        const leave1 = shouldThiefLeave();
        const fight1 = shouldThiefContinueFight();
        const idle1 = shouldThiefBeIdle();
        const steal1 = shouldThiefSteal();
        const drop1 = shouldThiefDropJunk();

        // Second run with same seed
        setTimingSeed(seed);
        const appear2 = shouldThiefAppear();
        const leave2 = shouldThiefLeave();
        const fight2 = shouldThiefContinueFight();
        const idle2 = shouldThiefBeIdle();
        const steal2 = shouldThiefSteal();
        const drop2 = shouldThiefDropJunk();

        return (
          appear1 === appear2 &&
          leave1 === leave2 &&
          fight1 === fight2 &&
          idle1 === idle2 &&
          steal1 === steal2 &&
          drop1 === drop2
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: achieve-99-percent-parity, Property 7: Deterministic Random Events
   * 
   * Troll event functions are deterministic for same seed.
   * 
   * **Validates: Requirements 5.3, 5.5**
   */
  it('Property 7f: Troll events are deterministic', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        // First run
        setTimingSeed(seed);
        const strike1 = shouldTrollStrikeFirst();
        const recoverFighting1 = shouldTrollRecoverAxe(true);
        const recoverNormal1 = shouldTrollRecoverAxe(false);

        // Second run with same seed
        setTimingSeed(seed);
        const strike2 = shouldTrollStrikeFirst();
        const recoverFighting2 = shouldTrollRecoverAxe(true);
        const recoverNormal2 = shouldTrollRecoverAxe(false);

        return (
          strike1 === strike2 &&
          recoverFighting1 === recoverFighting2 &&
          recoverNormal1 === recoverNormal2
        );
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // LAMP TIMING PROPERTIES
  // ============================================================================

  /**
   * Lamp warning messages are valid for all stage indices.
   */
  it('Lamp warning messages are valid for all stages', () => {
    fc.assert(
      fc.property(lampStageArb, (stageIndex) => {
        const message = getLampWarningMessage(stageIndex);
        return message !== null && message.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Invalid lamp stage indices return null.
   */
  it('Invalid lamp stage indices return null', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: -1 }),
        (invalidIndex) => {
          return getLampWarningMessage(invalidIndex) === null;
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: LAMP_TIMING_TABLE.length, max: 100 }),
        (invalidIndex) => {
          return getLampWarningMessage(invalidIndex) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Lamp warning thresholds are correctly identified.
   */
  it('Lamp warning thresholds are correctly identified', () => {
    // Known thresholds should return true
    expect(isLampWarningThreshold(LAMP_WARN_1)).toBe(true);
    expect(isLampWarningThreshold(LAMP_WARN_2)).toBe(true);
    expect(isLampWarningThreshold(LAMP_WARN_3)).toBe(true);
    expect(isLampWarningThreshold(LAMP_DEAD)).toBe(true);

    // Non-thresholds should return false
    fc.assert(
      fc.property(lampFuelArb, (fuel) => {
        const isThreshold = isLampWarningThreshold(fuel);
        const expectedThreshold = [LAMP_WARN_1, LAMP_WARN_2, LAMP_WARN_3, LAMP_DEAD].includes(fuel);
        return isThreshold === expectedThreshold;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Ticks until next lamp warning is always non-negative.
   */
  it('Ticks until next lamp warning is non-negative', () => {
    fc.assert(
      fc.property(lampFuelArb, (fuel) => {
        const ticks = getTicksUntilNextLampWarning(fuel);
        return ticks >= 0;
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // CANDLE TIMING PROPERTIES
  // ============================================================================

  /**
   * Candle warning messages are valid for all stage indices.
   */
  it('Candle warning messages are valid for all stages', () => {
    fc.assert(
      fc.property(candleStageArb, (stageIndex) => {
        const message = getCandleWarningMessage(stageIndex);
        return message !== null && message.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Invalid candle stage indices return null.
   */
  it('Invalid candle stage indices return null', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: -1 }),
        (invalidIndex) => {
          return getCandleWarningMessage(invalidIndex) === null;
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: CANDLE_TIMING_TABLE.length, max: 100 }),
        (invalidIndex) => {
          return getCandleWarningMessage(invalidIndex) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Candle warning thresholds are correctly identified.
   */
  it('Candle warning thresholds are correctly identified', () => {
    // Known thresholds should return true
    expect(isCandleWarningThreshold(CANDLE_WARN_1)).toBe(true);
    expect(isCandleWarningThreshold(CANDLE_WARN_2)).toBe(true);
    expect(isCandleWarningThreshold(CANDLE_WARN_3)).toBe(true);
    expect(isCandleWarningThreshold(CANDLE_DEAD)).toBe(true);

    // Non-thresholds should return false
    fc.assert(
      fc.property(candleFuelArb, (fuel) => {
        const isThreshold = isCandleWarningThreshold(fuel);
        const expectedThreshold = [CANDLE_WARN_1, CANDLE_WARN_2, CANDLE_WARN_3, CANDLE_DEAD].includes(fuel);
        return isThreshold === expectedThreshold;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Ticks until next candle warning is always non-negative.
   */
  it('Ticks until next candle warning is non-negative', () => {
    fc.assert(
      fc.property(candleFuelArb, (fuel) => {
        const ticks = getTicksUntilNextCandleWarning(fuel);
        return ticks >= 0;
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROBABILITY CONSTANT VALIDATION
  // ============================================================================

  /**
   * All probability constants are in valid range [0, 1].
   */
  it('All probability constants are in valid range', () => {
    const probabilities = [
      THIEF_APPEAR_PROBABILITY,
      THIEF_LEAVE_PROBABILITY,
      THIEF_CONTINUE_FIGHT_PROBABILITY,
      THIEF_IDLE_PROBABILITY,
      THIEF_STEAL_PROBABILITY,
      THIEF_DROP_JUNK_PROBABILITY,
      TROLL_FIRST_STRIKE_PROBABILITY,
      TROLL_AXE_RECOVERY_FIGHTING,
      TROLL_AXE_RECOVERY_NORMAL
    ];

    for (const prob of probabilities) {
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    }
  });

  /**
   * Timing constants match ZIL source values.
   */
  it('Timing constants match ZIL source values', () => {
    // Lamp timing from ZIL LAMP-TABLE
    expect(LAMP_WARN_1).toBe(100);
    expect(LAMP_WARN_2).toBe(70);
    expect(LAMP_WARN_3).toBe(15);
    expect(LAMP_DEAD).toBe(0);
    expect(INITIAL_LAMP_FUEL).toBe(200);

    // Candle timing from ZIL CANDLE-TABLE
    expect(CANDLE_WARN_1).toBe(20);
    expect(CANDLE_WARN_2).toBe(10);
    expect(CANDLE_WARN_3).toBe(5);
    expect(CANDLE_DEAD).toBe(0);
    expect(INITIAL_CANDLE_FUEL).toBe(40);

    // Thief probabilities from ZIL
    expect(THIEF_APPEAR_PROBABILITY).toBe(0.30);
    expect(THIEF_LEAVE_PROBABILITY).toBe(0.30);
    expect(THIEF_CONTINUE_FIGHT_PROBABILITY).toBe(0.90);
    expect(THIEF_IDLE_PROBABILITY).toBe(0.70);
    expect(THIEF_STEAL_PROBABILITY).toBe(0.75);
    expect(THIEF_DROP_JUNK_PROBABILITY).toBe(0.30);

    // Troll probabilities from ZIL
    expect(TROLL_FIRST_STRIKE_PROBABILITY).toBe(0.33);
    expect(TROLL_AXE_RECOVERY_FIGHTING).toBe(0.90);
    expect(TROLL_AXE_RECOVERY_NORMAL).toBe(0.75);
  });

  // ============================================================================
  // STATE MANAGEMENT PROPERTIES
  // ============================================================================

  /**
   * createInitialTimingState creates valid state.
   */
  it('createInitialTimingState creates valid state', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        const state = createInitialTimingState(seed);
        
        return (
          state.lampFuel === INITIAL_LAMP_FUEL &&
          state.lampStageIndex === -1 &&
          state.candleFuel === INITIAL_CANDLE_FUEL &&
          state.candleStageIndex === -1 &&
          state.thiefVisible === false &&
          state.trollConscious === true &&
          state.seed === seed
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * setTimingSeed and getTimingSeed are consistent.
   */
  it('setTimingSeed and getTimingSeed are consistent', () => {
    fc.assert(
      fc.property(seedArb, (seed) => {
        setTimingSeed(seed);
        return getTimingSeed() === seed;
      }),
      { numRuns: 100 }
    );
  });
});
