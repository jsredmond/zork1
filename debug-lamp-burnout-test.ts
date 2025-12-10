#!/usr/bin/env npx tsx

/**
 * Debug script to test lamp burnout behavior
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeLampTimer } from './src/engine/daemons.js';
import { ObjectFlag } from './src/game/data/flags.js';
import { isRoomLit, isActiveLightSource } from './src/engine/lighting.js';

async function testLampBurnout() {
  console.log('=== LAMP BURNOUT TEST ===\n');
  
  const state = createInitialGameState();
  
  // Setup lamp
  const lamp = state.getObject('LAMP');
  state.moveObject('LAMP', 'PLAYER');
  lamp.addFlag(ObjectFlag.ONBIT);
  initializeLampTimer(state);
  
  console.log('Initial state:');
  console.log(`- Lamp ONBIT: ${lamp.hasFlag(ObjectFlag.ONBIT)}`);
  console.log(`- Lamp LIGHTBIT: ${lamp.hasFlag(ObjectFlag.LIGHTBIT)}`);
  console.log(`- Lamp RMUNGBIT: ${lamp.hasFlag(ObjectFlag.RMUNGBIT)}`);
  console.log(`- Is active light source: ${isActiveLightSource(lamp)}`);
  console.log(`- Room is lit: ${isRoomLit(state)}`);
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}\n`);
  
  // Set lamp to 1 fuel and advance to burn it out
  console.log('Setting lamp fuel to 1 and advancing 1 turn...');
  state.setGlobalVariable('LAMP_FUEL', 1);
  state.setGlobalVariable('LAMP_STAGE_INDEX', 3);
  
  // Set up the lamp event
  const events = (state as any).eventSystem.events;
  const lampEvent = events.get('I-LANTERN');
  if (lampEvent) {
    lampEvent.ticksRemaining = 1;
    lampEvent.enabled = true;
  }
  
  // Capture console output
  const originalLog = console.log;
  let daemonOutput = '';
  console.log = (...args: any[]) => {
    daemonOutput += args.join(' ') + '\n';
  };

  try {
    state.eventSystem.processTurn(state);
  } finally {
    console.log = originalLog;
  }
  
  console.log(`Daemon output: "${daemonOutput.trim()}"`);
  
  console.log('\nState after burnout:');
  console.log(`- Lamp ONBIT: ${lamp.hasFlag(ObjectFlag.ONBIT)}`);
  console.log(`- Lamp LIGHTBIT: ${lamp.hasFlag(ObjectFlag.LIGHTBIT)}`);
  console.log(`- Lamp RMUNGBIT: ${lamp.hasFlag(ObjectFlag.RMUNGBIT)}`);
  console.log(`- Is active light source: ${isActiveLightSource(lamp)}`);
  console.log(`- Room is lit: ${isRoomLit(state)}`);
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
}

testLampBurnout().catch(console.error);