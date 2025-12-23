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
  { ticks: 0, message: "The brass lantern has gone out." }
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
 * Lamp timer interrupt (I-LANTERN)
 * Tracks lamp battery life and displays warnings
 * 
 * Based on ZIL I-LANTERN routine which:
 * 1. Schedules itself to run at specific fuel levels (100, 70, 15, 0)
 * 2. Shows warning messages at each stage
 * 3. Turns off lamp when fuel reaches 0
 * 4. Advances to next stage in LAMP-TABLE
 * 
 * @param state - Current game state
 * @returns true if a message was displayed
 */
export function lampTimerInterrupt(state: GameState): boolean {
  const lamp = state.getObject('LAMP');
  if (!lamp) {
    return false;
  }

  // Only run if lamp is on
  if (!lamp.flags.has(ObjectFlag.ONBIT)) {
    return false;
  }

  // Get current stage index
  let stageIndex = state.getGlobalVariable('LAMP_STAGE_INDEX') || 0;
  
  if (stageIndex >= LAMP_STAGES.length) {
    return false;
  }

  const currentStage = LAMP_STAGES[stageIndex];
  let messageDisplayed = false;

  // Display message if lamp is held or in current room
  if (state.isInInventory('LAMP') || 
      state.getCurrentRoom()?.objects.includes('LAMP')) {
    
    if (currentStage.ticks === 0) {
      // Lamp has burned out
      lamp.flags.delete(ObjectFlag.ONBIT);
      lamp.flags.add('RMUNGBIT' as any); // Burned out flag
      console.log(currentStage.message);
      messageDisplayed = true;
      
      // Disable the lamp timer
      state.eventSystem.disableEvent('I-LANTERN');
    } else {
      // Display warning message
      console.log(currentStage.message);
      messageDisplayed = true;
    }
  }

  // Advance to next stage
  stageIndex++;
  state.setGlobalVariable('LAMP_STAGE_INDEX', stageIndex);

  // Schedule next interrupt if not at final stage
  if (stageIndex < LAMP_STAGES.length) {
    const nextStage = LAMP_STAGES[stageIndex];
    const ticksUntilNext = currentStage.ticks - nextStage.ticks;
    state.eventSystem.queueInterrupt('I-LANTERN', ticksUntilNext);
  }

  return messageDisplayed;
}

/**
 * Candle timer interrupt (I-CANDLES)
 * Tracks candle burn time and displays warnings
 * 
 * Based on ZIL I-CANDLES routine which:
 * 1. Schedules itself to run at specific fuel levels (20, 10, 5, 0)
 * 2. Shows warning messages at each stage
 * 3. Turns off candles when fuel reaches 0
 * 4. Advances to next stage in CANDLE-TABLE
 * 
 * @param state - Current game state
 * @returns true if a message was displayed
 */
export function candleTimerInterrupt(state: GameState): boolean {
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

  // Get current stage index
  let stageIndex = state.getGlobalVariable('CANDLE_STAGE_INDEX') || 0;
  
  if (stageIndex >= CANDLE_STAGES.length) {
    return false;
  }

  const currentStage = CANDLE_STAGES[stageIndex];
  let messageDisplayed = false;

  // Display message if candles are held or in current room
  if (state.isInInventory('CANDLES') || 
      state.getCurrentRoom()?.objects.includes('CANDLES')) {
    
    if (currentStage.ticks === 0) {
      // Candles have burned out
      candles.flags.delete(ObjectFlag.ONBIT);
      candles.flags.add('RMUNGBIT' as any); // Burned out flag
      console.log(currentStage.message);
      messageDisplayed = true;
      
      // Disable the candle timer
      state.eventSystem.disableEvent('I-CANDLES');
    } else {
      // Display warning message
      console.log(currentStage.message);
      messageDisplayed = true;
    }
  }

  // Advance to next stage
  stageIndex++;
  state.setGlobalVariable('CANDLE_STAGE_INDEX', stageIndex);

  // Schedule next interrupt if not at final stage
  if (stageIndex < CANDLE_STAGES.length) {
    const nextStage = CANDLE_STAGES[stageIndex];
    const ticksUntilNext = currentStage.ticks - nextStage.ticks;
    state.eventSystem.queueInterrupt('I-CANDLES', ticksUntilNext);
  }

  return messageDisplayed;
}

/**
 * Initialize lamp timer when lamp is turned on
 * @param state - Current game state
 */
export function initializeLampTimer(state: GameState): void {
  // Reset to first stage
  state.setGlobalVariable('LAMP_STAGE_INDEX', 0);
  
  // Schedule first interrupt at 100 ticks (first warning)
  const firstStage = LAMP_STAGES[0];
  const ticksUntilFirst = INITIAL_LAMP_FUEL - firstStage.ticks; // 200 - 100 = 100 ticks
  state.eventSystem.queueInterrupt('I-LANTERN', ticksUntilFirst);
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
  // Reset to first stage
  state.setGlobalVariable('CANDLE_STAGE_INDEX', 0);
  
  // Schedule first interrupt at 20 ticks (first warning)
  const firstStage = CANDLE_STAGES[0];
  const ticksUntilFirst = INITIAL_CANDLE_FUEL - firstStage.ticks; // 40 - 20 = 20 ticks
  state.eventSystem.queueInterrupt('I-CANDLES', ticksUntilFirst);
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
  state.setGlobalVariable('LAMP_STAGE_INDEX', 0);
  state.eventSystem.disableEvent('I-LANTERN');
}

/**
 * Reset candle timer state (for testing or game restart)
 */
export function resetCandleTimer(state: GameState): void {
  state.setGlobalVariable('CANDLE_STAGE_INDEX', 0);
  state.eventSystem.disableEvent('I-CANDLES');
}

/**
 * Forest rooms where the songbird can be heard
 * Based on ZIL FOREST-ROOM? routine
 */
const FOREST_ROOMS = ['FOREST-1', 'FOREST-2', 'FOREST-3', 'PATH', 'UP-A-TREE'];

/**
 * Check if the current room is a forest room
 * Based on ZIL FOREST-ROOM? routine
 */
export function isForestRoom(state: GameState): boolean {
  const currentRoom = state.getCurrentRoom();
  if (!currentRoom) return false;
  return FOREST_ROOMS.includes(currentRoom.id);
}

/**
 * Forest room daemon (I-FOREST-ROOM)
 * Occasionally displays atmospheric songbird message when in forest rooms
 * 
 * Based on ZIL I-FOREST-ROOM routine which:
 * 1. Checks if player is in a forest room
 * 2. If not, disables itself
 * 3. If yes, has 15% chance to display songbird message
 * 
 * @param state - Current game state
 * @returns true if a message was displayed
 */
export function forestRoomDaemon(state: GameState): boolean {
  // Check if player is in a forest room
  if (!isForestRoom(state)) {
    // Disable the daemon when not in forest
    state.eventSystem.disableEvent('I-FOREST-ROOM');
    return false;
  }

  // 15% probability of showing the message (PROB 15 in ZIL)
  if (Math.random() < 0.15) {
    console.log("You hear in the distance the chirping of a song bird.");
    return true;
  }

  return false;
}

/**
 * Enable the forest room daemon when entering a forest room
 * Called from room entry handlers
 */
export function enableForestRoomDaemon(state: GameState): void {
  state.eventSystem.enableEvent('I-FOREST-ROOM');
}
