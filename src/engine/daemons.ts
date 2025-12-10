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
 * 
 * ZIL format: 100 "message" 70 "message" 15 "message" 0
 * This represents the tick counts at which messages are shown
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
 * 
 * ZIL format: 20 "message" 10 "message" 5 "message" 0
 */
const CANDLE_STAGES: LampStage[] = [
  { ticks: 20, message: "The candles grow shorter." },
  { ticks: 10, message: "The candles are becoming quite short." },
  { ticks: 5, message: "The candles won't last long now." },
  { ticks: 0, message: "You'd better have more light than from the pair of candles." }
];

/**
 * Initial candle fuel count from ZIL (QUEUE I-CANDLES 40)
 */
const INITIAL_CANDLE_FUEL = 40;

/**
 * Initial lamp fuel count from ZIL (QUEUE I-LANTERN 200)
 */
const INITIAL_LAMP_FUEL = 200;

/**
 * Lamp timer daemon (I-LANTERN)
 * Tracks lamp battery life and displays warnings
 * 
 * Based on ZIL I-LANTERN routine which:
 * 1. Decrements lamp fuel every turn when lamp is on
 * 2. Shows warning messages at specific fuel levels
 * 3. Turns off lamp when fuel reaches 0
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

  // Get or initialize fuel counter
  let fuelRemaining = state.getGlobalVariable('LAMP_FUEL');
  if (fuelRemaining === undefined) {
    fuelRemaining = INITIAL_LAMP_FUEL;
    state.setGlobalVariable('LAMP_FUEL', fuelRemaining);
  }

  // Decrement fuel
  fuelRemaining--;
  state.setGlobalVariable('LAMP_FUEL', fuelRemaining);

  // Check if we need to show a warning message
  let messageDisplayed = false;
  
  // Find the stage that matches current fuel level
  for (const stage of LAMP_STAGES) {
    if (fuelRemaining === stage.ticks) {
      // Display message if lamp is held or in current room
      if (state.isInInventory('LAMP') || 
          state.getCurrentRoom()?.objects.includes('LAMP')) {
        
        if (stage.ticks === 0) {
          // Lamp has burned out
          lamp.flags.delete(ObjectFlag.ONBIT);
          lamp.flags.add('RMUNGBIT' as any); // Burned out flag
          console.log(stage.message);
          messageDisplayed = true;
        } else {
          // Display warning message
          console.log(stage.message);
          messageDisplayed = true;
        }
      }
      break;
    }
  }

  return messageDisplayed;
}

/**
 * Candle timer daemon (I-CANDLES)
 * Tracks candle burn time and displays warnings
 * 
 * Based on ZIL I-CANDLES routine which:
 * 1. Decrements candle fuel every turn when candles are on
 * 2. Shows warning messages at specific fuel levels
 * 3. Turns off candles when fuel reaches 0
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

  // Get or initialize fuel counter
  let fuelRemaining = state.getGlobalVariable('CANDLE_FUEL');
  if (fuelRemaining === undefined) {
    fuelRemaining = INITIAL_CANDLE_FUEL;
    state.setGlobalVariable('CANDLE_FUEL', fuelRemaining);
  }

  // Decrement fuel
  fuelRemaining--;
  state.setGlobalVariable('CANDLE_FUEL', fuelRemaining);

  // Check if we need to show a warning message
  let messageDisplayed = false;
  
  // Find the stage that matches current fuel level
  for (const stage of CANDLE_STAGES) {
    if (fuelRemaining === stage.ticks) {
      // Display message if candles are held or in current room
      if (state.isInInventory('CANDLES') || 
          state.getCurrentRoom()?.objects.includes('CANDLES')) {
        
        if (stage.ticks === 0) {
          // Candles have burned out
          candles.flags.delete(ObjectFlag.ONBIT);
          candles.flags.add('RMUNGBIT' as any); // Burned out flag
          console.log(stage.message);
          messageDisplayed = true;
        } else {
          // Display warning message
          console.log(stage.message);
          messageDisplayed = true;
        }
      }
      break;
    }
  }

  return messageDisplayed;
}

/**
 * Initialize lamp timer when lamp is turned on
 * @param state - Current game state
 */
export function initializeLampTimer(state: GameState): void {
  // Initialize fuel if not already set
  if (state.getGlobalVariable('LAMP_FUEL') === undefined) {
    state.setGlobalVariable('LAMP_FUEL', INITIAL_LAMP_FUEL);
  }
  
  // Enable the lamp daemon
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
  // Initialize fuel if not already set
  if (state.getGlobalVariable('CANDLE_FUEL') === undefined) {
    state.setGlobalVariable('CANDLE_FUEL', INITIAL_CANDLE_FUEL);
  }
  
  // Enable the candle daemon
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
export function resetLampTimer(state: GameState): void {
  state.setGlobalVariable('LAMP_FUEL', INITIAL_LAMP_FUEL);
}

/**
 * Reset candle timer state (for testing or game restart)
 */
export function resetCandleTimer(state: GameState): void {
  // Reset candle fuel to initial value
  state.setGlobalVariable('CANDLE_FUEL', 40); // From ZIL: QUEUE I-CANDLES 40
}
