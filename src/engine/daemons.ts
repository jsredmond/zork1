/**
 * Game Daemons
 * Implements time-based game events like lamp timer and candle timer
 * 
 * Based on ZIL routines from 1actions.zil
 */

import { GameState } from '../game/state.js';
import { ObjectFlag } from '../game/data/flags.js';

/**
 * Lamp timer stages
 * Each stage has a tick count and a warning message
 */
interface LampStage {
  ticks: number;
  message: string;
}

/**
 * Lamp timer table from ZIL LAMP-TABLE
 * Tracks battery life and warning messages
 */
const LAMP_STAGES: LampStage[] = [
  { ticks: 100, message: "The lamp appears a bit dimmer." },
  { ticks: 70, message: "The lamp is definitely dimmer now." },
  { ticks: 15, message: "The lamp is nearly out." },
  { ticks: 0, message: "You'd better have more light than from the brass lantern." }
];

/**
 * Candle timer table from ZIL CANDLE-TABLE
 * Tracks burn time and warning messages
 */
const CANDLE_STAGES: LampStage[] = [
  { ticks: 20, message: "The candles are getting quite short now." },
  { ticks: 10, message: "The candles are becoming very short." },
  { ticks: 0, message: "You'd better have more light than from the pair of candles." }
];

/**
 * Current lamp stage index
 */
let lampStageIndex = 0;

/**
 * Current candle stage index
 */
let candleStageIndex = 0;

/**
 * Lamp timer daemon (I-LANTERN)
 * Tracks lamp battery life and displays warnings
 * 
 * @param state - Current game state
 * @returns true if a message was displayed
 */
export function lampTimerDaemon(state: GameState): boolean {
  const lamp = state.getObject('LAMP');
  if (!lamp) {
    return false;
  }

  // Only run if lamp is on
  if (!lamp.flags.has(ObjectFlag.ONBIT)) {
    return false;
  }

  // Get current stage
  if (lampStageIndex >= LAMP_STAGES.length) {
    return false;
  }

  const currentStage = LAMP_STAGES[lampStageIndex];
  
  // Get or initialize tick counter
  let ticksRemaining = state.getGlobalVariable('LAMP_TICKS');
  if (ticksRemaining === undefined) {
    ticksRemaining = currentStage.ticks;
    state.setGlobalVariable('LAMP_TICKS', ticksRemaining);
  }

  // Decrement ticks
  ticksRemaining--;
  state.setGlobalVariable('LAMP_TICKS', ticksRemaining);

  // Check if we've reached the next stage
  if (ticksRemaining <= 0) {
    // Display message if lamp is held or in current room
    let messageDisplayed = false;
    if (state.isInInventory('LAMP') || 
        state.getCurrentRoom()?.objects.includes('LAMP')) {
      
      if (currentStage.ticks === 0) {
        // Lamp has burned out
        lamp.flags.delete(ObjectFlag.ONBIT);
        lamp.flags.add('RMUNGBIT' as any); // Burned out flag
        console.log(currentStage.message);
        messageDisplayed = true;
      } else {
        // Display warning message
        console.log(currentStage.message);
        messageDisplayed = true;
      }
    }

    // Move to next stage
    lampStageIndex++;
    if (lampStageIndex < LAMP_STAGES.length) {
      const nextStage = LAMP_STAGES[lampStageIndex];
      state.setGlobalVariable('LAMP_TICKS', nextStage.ticks);
      
      // Re-queue the interrupt for the next stage
      state.eventSystem.queueInterrupt('I-LANTERN', nextStage.ticks);
    }

    return messageDisplayed;
  }

  return false;
}

/**
 * Candle timer daemon (I-CANDLES)
 * Tracks candle burn time and displays warnings
 * 
 * @param state - Current game state
 * @returns true if a message was displayed
 */
export function candleTimerDaemon(state: GameState): boolean {
  const candles = state.getObject('CANDLES');
  if (!candles) {
    return false;
  }

  // Only run if candles are on
  if (!candles.flags.has(ObjectFlag.ONBIT)) {
    return false;
  }

  // Mark candles as touched (first time lit)
  if (!candles.flags.has('TOUCHBIT' as any)) {
    candles.flags.add('TOUCHBIT' as any);
  }

  // Get current stage
  if (candleStageIndex >= CANDLE_STAGES.length) {
    return false;
  }

  const currentStage = CANDLE_STAGES[candleStageIndex];
  
  // Get or initialize tick counter
  let ticksRemaining = state.getGlobalVariable('CANDLE_TICKS');
  if (ticksRemaining === undefined) {
    ticksRemaining = currentStage.ticks;
    state.setGlobalVariable('CANDLE_TICKS', ticksRemaining);
  }

  // Decrement ticks
  ticksRemaining--;
  state.setGlobalVariable('CANDLE_TICKS', ticksRemaining);

  // Check if we've reached the next stage
  if (ticksRemaining <= 0) {
    // Display message if candles are held or in current room
    let messageDisplayed = false;
    if (state.isInInventory('CANDLES') || 
        state.getCurrentRoom()?.objects.includes('CANDLES')) {
      
      if (currentStage.ticks === 0) {
        // Candles have burned out
        candles.flags.delete(ObjectFlag.ONBIT);
        candles.flags.add('RMUNGBIT' as any); // Burned out flag
        console.log(currentStage.message);
        messageDisplayed = true;
      } else {
        // Display warning message
        console.log(currentStage.message);
        messageDisplayed = true;
      }
    }

    // Move to next stage
    candleStageIndex++;
    if (candleStageIndex < CANDLE_STAGES.length) {
      const nextStage = CANDLE_STAGES[candleStageIndex];
      state.setGlobalVariable('CANDLE_TICKS', nextStage.ticks);
      
      // Re-queue the interrupt for the next stage
      state.eventSystem.queueInterrupt('I-CANDLES', nextStage.ticks);
    }

    return messageDisplayed;
  }

  return false;
}

/**
 * Initialize lamp timer when lamp is turned on
 * @param state - Current game state
 */
export function initializeLampTimer(state: GameState): void {
  lampStageIndex = 0;
  const firstStage = LAMP_STAGES[0];
  state.setGlobalVariable('LAMP_TICKS', firstStage.ticks);
  state.eventSystem.registerInterrupt('I-LANTERN', lampTimerDaemon, firstStage.ticks);
  state.eventSystem.enableEvent('I-LANTERN');
}

/**
 * Disable lamp timer when lamp is turned off
 * @param state - Current game state
 */
export function disableLampTimer(state: GameState): void {
  state.eventSystem.disableEvent('I-LANTERN');
}

/**
 * Initialize candle timer when candles are lit
 * @param state - Current game state
 */
export function initializeCandleTimer(state: GameState): void {
  candleStageIndex = 0;
  const firstStage = CANDLE_STAGES[0];
  state.setGlobalVariable('CANDLE_TICKS', firstStage.ticks);
  state.eventSystem.registerInterrupt('I-CANDLES', candleTimerDaemon, firstStage.ticks);
  state.eventSystem.enableEvent('I-CANDLES');
}

/**
 * Disable candle timer when candles are extinguished
 * @param state - Current game state
 */
export function disableCandleTimer(state: GameState): void {
  state.eventSystem.disableEvent('I-CANDLES');
}

/**
 * Reset lamp timer state (for testing or game restart)
 */
export function resetLampTimer(): void {
  lampStageIndex = 0;
}

/**
 * Reset candle timer state (for testing or game restart)
 */
export function resetCandleTimer(): void {
  candleStageIndex = 0;
}
