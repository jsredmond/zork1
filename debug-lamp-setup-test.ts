#!/usr/bin/env npx tsx

/**
 * Debug script to test lamp setup behavior
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeLampTimer } from './src/engine/daemons.js';
import { ObjectFlag } from './src/game/data/flags.js';

async function testLampSetup() {
  console.log('=== LAMP SETUP TEST ===\n');
  
  const state = createInitialGameState();
  
  // Get the lamp
  const lamp = state.getObject('LAMP');
  if (!lamp) {
    console.log('ERROR: Lamp not found');
    return;
  }
  
  console.log('Before setup:');
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Lamp on: ${lamp.hasFlag(ObjectFlag.ONBIT)}\n`);
  
  // Move lamp to inventory
  state.moveObject('LAMP', 'PLAYER');
  console.log('After moving to inventory:');
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Lamp on: ${lamp.hasFlag(ObjectFlag.ONBIT)}\n`);
  
  // Turn on lamp
  lamp.addFlag(ObjectFlag.ONBIT);
  initializeLampTimer(state);
  
  console.log('After turning on lamp:');
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Lamp on: ${lamp.hasFlag(ObjectFlag.ONBIT)}`);
  console.log(`- Timer ticks remaining: ${state.eventSystem.getRemainingTicks('I-LANTERN')}\n`);
  
  // Process one turn to see what happens
  console.log('Processing one turn...');
  const output = state.eventSystem.processTurn(state);
  console.log(`Output: "${output}"`);
  
  console.log('After one turn:');
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Timer ticks remaining: ${state.eventSystem.getRemainingTicks('I-LANTERN')}\n`);
}

testLampSetup().catch(console.error);