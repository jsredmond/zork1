/**
 * DaemonTimingSynchronizer
 * 
 * Ensures daemon timing matches Z-Machine intervals exactly.
 * Based on timing constants from ZIL source (1actions.zil, 1dungeon.zil).
 * 
 * This module provides:
 * - Lamp timing constants and warning messages
 * - Candle timing constants and warning messages
 * - Thief appearance probability
 * - Troll recovery interval
 * - Deterministic timing with seeded random
 */

/**
 * Lamp timing stages from ZIL LAMP-TABLE
 * 
 * ZIL source (1actions.zil):
 * <GLOBAL LAMP-TABLE
 *   <TABLE (PURE)
 *          100 "The lamp appears a bit dimmer."
 *          70  "The lamp is definitely dimmer now."
 *          15  "The lamp is nearly out."
 *          0>>
 * 
 * Initial fuel: <QUEUE I-LANTERN 200>
 */
export interface LampTimingStage {
  /** Remaining fuel ticks when this warning triggers */
  readonly ticks: number;
  /** Warning message displayed at this stage */
  readonly message: string;
}

/**
 * Lamp warning stage 1 - First dimming warning
 * Triggers at 100 ticks remaining (after 100 moves with lamp on)
 */
export const LAMP_WARN_1 = 100;

/**
 * Lamp warning stage 2 - Definitely dimmer
 * Triggers at 70 ticks remaining (after 130 moves with lamp on)
 */
export const LAMP_WARN_2 = 70;

/**
 * Lamp warning stage 3 - Nearly out
 * Triggers at 15 ticks remaining (after 185 moves with lamp on)
 */
export const LAMP_WARN_3 = 15;

/**
 * Lamp dead - Lamp burns out
 * Triggers at 0 ticks remaining (after 200 moves with lamp on)
 */
export const LAMP_DEAD = 0;

/**
 * Initial lamp fuel from ZIL: <QUEUE I-LANTERN 200>
 */
export const INITIAL_LAMP_FUEL = 200;

/**
 * Complete lamp timing table matching ZIL LAMP-TABLE exactly
 */
export const LAMP_TIMING_TABLE: readonly LampTimingStage[] = Object.freeze([
  { ticks: LAMP_WARN_1, message: "The lamp appears a bit dimmer." },
  { ticks: LAMP_WARN_2, message: "The lamp is definitely dimmer now." },
  { ticks: LAMP_WARN_3, message: "The lamp is nearly out." },
  { ticks: LAMP_DEAD, message: "The brass lantern has gone out." }
]);

/**
 * Get lamp warning message for a specific stage
 * @param stageIndex - Index into LAMP_TIMING_TABLE (0-3)
 * @returns The warning message for that stage, or null if invalid index
 */
export function getLampWarningMessage(stageIndex: number): string | null {
  if (stageIndex < 0 || stageIndex >= LAMP_TIMING_TABLE.length) {
    return null;
  }
  return LAMP_TIMING_TABLE[stageIndex].message;
}

/**
 * Get lamp warning message for remaining fuel ticks
 * @param remainingTicks - Current remaining fuel
 * @returns The appropriate warning message, or null if no warning at this level
 */
export function getLampWarningForFuel(remainingTicks: number): string | null {
  for (const stage of LAMP_TIMING_TABLE) {
    if (remainingTicks === stage.ticks) {
      return stage.message;
    }
  }
  return null;
}

/**
 * Calculate ticks until next lamp warning
 * @param currentTicks - Current remaining fuel
 * @returns Ticks until next warning, or 0 if lamp is dead
 */
export function getTicksUntilNextLampWarning(currentTicks: number): number {
  for (const stage of LAMP_TIMING_TABLE) {
    if (currentTicks > stage.ticks) {
      return currentTicks - stage.ticks;
    }
  }
  return 0;
}

/**
 * Get the lamp stage index for remaining fuel
 * @param remainingTicks - Current remaining fuel
 * @returns Stage index (0-3) or -1 if lamp hasn't reached first warning
 */
export function getLampStageIndex(remainingTicks: number): number {
  for (let i = 0; i < LAMP_TIMING_TABLE.length; i++) {
    if (remainingTicks <= LAMP_TIMING_TABLE[i].ticks) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if lamp is at a warning threshold
 * @param remainingTicks - Current remaining fuel
 * @returns true if this is a warning threshold
 */
export function isLampWarningThreshold(remainingTicks: number): boolean {
  return LAMP_TIMING_TABLE.some(stage => stage.ticks === remainingTicks);
}


// ============================================================================
// CANDLE TIMING CONSTANTS
// ============================================================================

/**
 * Candle timing stages from ZIL CANDLE-TABLE
 * 
 * ZIL source (1actions.zil):
 * <GLOBAL CANDLE-TABLE
 *   <TABLE (PURE)
 *          20 "The candles grow shorter."
 *          10 "The candles are becoming quite short."
 *          5  "The candles won't last long now."
 *          0>>
 * 
 * Initial fuel: <QUEUE I-CANDLES 40>
 */
export interface CandleTimingStage {
  /** Remaining fuel ticks when this warning triggers */
  readonly ticks: number;
  /** Warning message displayed at this stage */
  readonly message: string;
}

/**
 * Candle warning stage 1 - Growing shorter
 * Triggers at 20 ticks remaining (after 20 moves with candles lit)
 */
export const CANDLE_WARN_1 = 20;

/**
 * Candle warning stage 2 - Quite short
 * Triggers at 10 ticks remaining (after 30 moves with candles lit)
 */
export const CANDLE_WARN_2 = 10;

/**
 * Candle warning stage 3 - Won't last long
 * Triggers at 5 ticks remaining (after 35 moves with candles lit)
 */
export const CANDLE_WARN_3 = 5;

/**
 * Candle dead - Candles burn out
 * Triggers at 0 ticks remaining (after 40 moves with candles lit)
 */
export const CANDLE_DEAD = 0;

/**
 * Initial candle fuel from ZIL: <QUEUE I-CANDLES 40>
 */
export const INITIAL_CANDLE_FUEL = 40;

/**
 * Complete candle timing table matching ZIL CANDLE-TABLE exactly
 * 
 * Note: The final message when candles burn out is different from the table.
 * ZIL uses LIGHT-INT routine which outputs:
 * "You'd better have more light than from the candles."
 */
export const CANDLE_TIMING_TABLE: readonly CandleTimingStage[] = Object.freeze([
  { ticks: CANDLE_WARN_1, message: "The candles grow shorter." },
  { ticks: CANDLE_WARN_2, message: "The candles are becoming quite short." },
  { ticks: CANDLE_WARN_3, message: "The candles won't last long now." },
  { ticks: CANDLE_DEAD, message: "You'd better have more light than from the candles." }
]);

/**
 * Get candle warning message for a specific stage
 * @param stageIndex - Index into CANDLE_TIMING_TABLE (0-3)
 * @returns The warning message for that stage, or null if invalid index
 */
export function getCandleWarningMessage(stageIndex: number): string | null {
  if (stageIndex < 0 || stageIndex >= CANDLE_TIMING_TABLE.length) {
    return null;
  }
  return CANDLE_TIMING_TABLE[stageIndex].message;
}

/**
 * Get candle warning message for remaining fuel ticks
 * @param remainingTicks - Current remaining fuel
 * @returns The appropriate warning message, or null if no warning at this level
 */
export function getCandleWarningForFuel(remainingTicks: number): string | null {
  for (const stage of CANDLE_TIMING_TABLE) {
    if (remainingTicks === stage.ticks) {
      return stage.message;
    }
  }
  return null;
}

/**
 * Calculate ticks until next candle warning
 * @param currentTicks - Current remaining fuel
 * @returns Ticks until next warning, or 0 if candles are dead
 */
export function getTicksUntilNextCandleWarning(currentTicks: number): number {
  for (const stage of CANDLE_TIMING_TABLE) {
    if (currentTicks > stage.ticks) {
      return currentTicks - stage.ticks;
    }
  }
  return 0;
}

/**
 * Get the candle stage index for remaining fuel
 * @param remainingTicks - Current remaining fuel
 * @returns Stage index (0-3) or -1 if candles haven't reached first warning
 */
export function getCandleStageIndex(remainingTicks: number): number {
  for (let i = 0; i < CANDLE_TIMING_TABLE.length; i++) {
    if (remainingTicks <= CANDLE_TIMING_TABLE[i].ticks) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if candles are at a warning threshold
 * @param remainingTicks - Current remaining fuel
 * @returns true if this is a warning threshold
 */
export function isCandleWarningThreshold(remainingTicks: number): boolean {
  return CANDLE_TIMING_TABLE.some(stage => stage.ticks === remainingTicks);
}


// ============================================================================
// THIEF TIMING CONSTANTS
// ============================================================================

/**
 * Thief appearance probability from ZIL I-THIEF routine
 * 
 * ZIL source (1actions.zil):
 * - <PROB 30> - 30% chance thief appears when not visible
 * - <PROB 70> - 70% chance thief does nothing (inverse: 30% chance to act)
 * - <PROB 90> - 90% chance thief continues fighting if in combat
 * 
 * The thief daemon runs every turn via <ENABLE <QUEUE I-THIEF -1>>
 * (-1 means run every turn)
 */

/**
 * Probability thief appears when not visible (30%)
 * From ZIL: <PROB 30> in THIEF-VS-ADVENTURER
 */
export const THIEF_APPEAR_PROBABILITY = 0.30;

/**
 * Probability thief leaves when visible and not fighting (30%)
 * From ZIL: <PROB 30> in THIEF-VS-ADVENTURER
 */
export const THIEF_LEAVE_PROBABILITY = 0.30;

/**
 * Probability thief continues fighting when in combat (90%)
 * From ZIL: <PROB 90> in THIEF-VS-ADVENTURER
 */
export const THIEF_CONTINUE_FIGHT_PROBABILITY = 0.90;

/**
 * Probability thief does nothing (70%)
 * From ZIL: <PROB 70> - if this passes, thief does nothing
 * Inverse: 30% chance thief acts (steals, etc.)
 */
export const THIEF_IDLE_PROBABILITY = 0.70;

/**
 * Probability thief steals from room (75%)
 * From ZIL: <ROB ,HERE ,THIEF 100> with PROB 75 in ROB routine
 */
export const THIEF_STEAL_PROBABILITY = 0.75;

/**
 * Probability thief drops non-treasure items (30%)
 * From ZIL: <PROB 30 T> in DROP-JUNK routine
 */
export const THIEF_DROP_JUNK_PROBABILITY = 0.30;

/**
 * Probability thief steals junk items (10%)
 * From ZIL: <PROB 10 T> in STEAL-JUNK routine
 */
export const THIEF_STEAL_JUNK_PROBABILITY = 0.10;

// ============================================================================
// TROLL TIMING CONSTANTS
// ============================================================================

/**
 * Troll timing constants from ZIL TROLL-FCN
 * 
 * ZIL source (1actions.zil):
 * - <PROB 33> - 33% chance troll strikes first
 * - Troll recovers from unconsciousness based on combat daemon
 * 
 * The troll doesn't have a dedicated daemon like the thief.
 * Recovery is handled by the combat system (I-FIGHT daemon).
 */

/**
 * Probability troll strikes first when player enters (33%)
 * From ZIL: <PROB 33> in F-FIRST? mode
 */
export const TROLL_FIRST_STRIKE_PROBABILITY = 0.33;

/**
 * Troll recovery interval (turns until troll wakes from unconscious)
 * Based on combat daemon behavior - troll recovers when strength > 0
 * The I-FIGHT daemon runs every turn and calls VILLAIN-STRENGTH
 * which can restore 1 strength point per turn.
 * 
 * From ZIL: VILLAIN-STRENGTH routine adds 1 to strength each turn
 * until it reaches original value.
 */
export const TROLL_RECOVERY_INTERVAL = 1;

/**
 * Troll axe recovery probability when axe is in room (75-90%)
 * From ZIL: Implicit in TROLL-FCN behavior
 * - 90% if troll is fighting
 * - 75% otherwise
 */
export const TROLL_AXE_RECOVERY_FIGHTING = 0.90;
export const TROLL_AXE_RECOVERY_NORMAL = 0.75;

// ============================================================================
// DETERMINISTIC TIMING FUNCTIONS
// ============================================================================

/**
 * Seeded random number generator state
 */
let currentSeed: number = 12345;

/**
 * Set the random seed for deterministic timing
 * @param seed - The seed value
 */
export function setTimingSeed(seed: number): void {
  currentSeed = seed;
}

/**
 * Get the current timing seed
 * @returns The current seed value
 */
export function getTimingSeed(): number {
  return currentSeed;
}

/**
 * Generate a deterministic random number between 0 and 1
 * Uses a simple linear congruential generator for reproducibility
 * @returns A pseudo-random number between 0 and 1
 */
export function getTimingRandom(): number {
  // LCG parameters (same as MINSTD)
  const a = 48271;
  const m = 2147483647;
  currentSeed = (currentSeed * a) % m;
  return currentSeed / m;
}

/**
 * Check if an event should occur based on probability
 * Uses deterministic random for reproducibility
 * @param probability - Probability between 0 and 1
 * @returns true if event should occur
 */
export function shouldEventOccur(probability: number): boolean {
  return getTimingRandom() < probability;
}

/**
 * Determine if thief should appear this turn
 * @returns true if thief should appear
 */
export function shouldThiefAppear(): boolean {
  return shouldEventOccur(THIEF_APPEAR_PROBABILITY);
}

/**
 * Determine if thief should leave this turn
 * @returns true if thief should leave
 */
export function shouldThiefLeave(): boolean {
  return shouldEventOccur(THIEF_LEAVE_PROBABILITY);
}

/**
 * Determine if thief should continue fighting
 * @returns true if thief should continue fighting
 */
export function shouldThiefContinueFight(): boolean {
  return shouldEventOccur(THIEF_CONTINUE_FIGHT_PROBABILITY);
}

/**
 * Determine if thief should be idle (do nothing)
 * @returns true if thief should be idle
 */
export function shouldThiefBeIdle(): boolean {
  return shouldEventOccur(THIEF_IDLE_PROBABILITY);
}

/**
 * Determine if thief should steal an item
 * @returns true if thief should steal
 */
export function shouldThiefSteal(): boolean {
  return shouldEventOccur(THIEF_STEAL_PROBABILITY);
}

/**
 * Determine if thief should drop junk
 * @returns true if thief should drop junk
 */
export function shouldThiefDropJunk(): boolean {
  return shouldEventOccur(THIEF_DROP_JUNK_PROBABILITY);
}

/**
 * Determine if troll should strike first
 * @returns true if troll should strike first
 */
export function shouldTrollStrikeFirst(): boolean {
  return shouldEventOccur(TROLL_FIRST_STRIKE_PROBABILITY);
}

/**
 * Determine if troll should recover axe
 * @param isFighting - Whether troll is currently fighting
 * @returns true if troll should recover axe
 */
export function shouldTrollRecoverAxe(isFighting: boolean): boolean {
  const probability = isFighting ? TROLL_AXE_RECOVERY_FIGHTING : TROLL_AXE_RECOVERY_NORMAL;
  return shouldEventOccur(probability);
}

// ============================================================================
// DAEMON SYNCHRONIZATION INTERFACE
// ============================================================================

/**
 * Daemon timing state for synchronization
 */
export interface DaemonTimingState {
  /** Current lamp fuel remaining */
  lampFuel: number;
  /** Current lamp stage index */
  lampStageIndex: number;
  /** Current candle fuel remaining */
  candleFuel: number;
  /** Current candle stage index */
  candleStageIndex: number;
  /** Whether thief is currently visible */
  thiefVisible: boolean;
  /** Whether troll is conscious */
  trollConscious: boolean;
  /** Current random seed */
  seed: number;
}

/**
 * Create initial daemon timing state
 * @param seed - Optional seed for deterministic timing
 * @returns Initial daemon timing state
 */
export function createInitialTimingState(seed: number = 12345): DaemonTimingState {
  setTimingSeed(seed);
  return {
    lampFuel: INITIAL_LAMP_FUEL,
    lampStageIndex: -1,
    candleFuel: INITIAL_CANDLE_FUEL,
    candleStageIndex: -1,
    thiefVisible: false,
    trollConscious: true,
    seed
  };
}

/**
 * Synchronize daemon timing with Z-Machine behavior
 * @param state - Current daemon timing state
 * @param moveCount - Current move count
 * @returns Updated daemon timing state
 */
export function synchronizeDaemonTiming(
  state: DaemonTimingState,
  moveCount: number
): DaemonTimingState {
  // This function can be extended to handle complex timing synchronization
  // For now, it returns the state unchanged
  return { ...state };
}
