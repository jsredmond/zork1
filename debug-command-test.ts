#!/usr/bin/env npx tsx

/**
 * Debug script to test debug commands
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeLampTimer } from './src/engine/daemons.js';
import { ObjectFlag } from './src/game/data/flags.js';

// Copy the debug command logic from verify-all-transcripts.ts
function executeDebugCommand(command: string, state: any): string {
  if (command.startsWith('setlampfuel ')) {
    const turns = parseInt(command.substring(12).trim());
    if (!isNaN(turns) && turns >= 0 && turns <= 200) {
      // Set the lamp fuel
      state.setGlobalVariable('LAMP_FUEL', turns);
      
      // Calculate stage based on fuel level
      let stage = 0;
      let ticksRemaining = 0;
      
      if (turns > 100) {
        stage = 0;
        ticksRemaining = turns - 100;
      } else if (turns > 70) {
        stage = 1;
        ticksRemaining = turns - 70;
      } else if (turns > 15) {
        stage = 2;
        ticksRemaining = turns - 15;
      } else if (turns > 0) {
        stage = 3;
        ticksRemaining = turns;
      } else {
        stage = 4; // Dead
        ticksRemaining = 0;
      }
      
      state.setGlobalVariable('LAMP_STAGE_INDEX', stage);
      
      // Update the timer
      const lampEvent = state.eventSystem.getEvent('I-LANTERN');
      if (lampEvent) {
        lampEvent.ticksRemaining = ticksRemaining;
      }
      
      return `[DEBUG: Set lamp fuel to ${turns} turns (stage ${stage}, next event in ${ticksRemaining} turns)]`;
    }
    return `[DEBUG: Invalid fuel level (0-200)]`;
  }
  
  if (command.startsWith('advance ')) {
    const turns = parseInt(command.substring(8).trim());
    if (!isNaN(turns) && turns > 0) {
      for (let i = 0; i < turns; i++) {
        state.eventSystem.processTurn(state);
      }
      return `[DEBUG: Advanced ${turns} turns to turn ${state.moves}]`;
    }
    return `[DEBUG: Invalid turn count]`;
  }
  
  return `[DEBUG: Unknown command: ${command}]`;
}

async function testDebugCommands() {
  console.log('=== DEBUG COMMAND TEST ===\n');
  
  const state = createInitialGameState();
  
  // Setup lamp
  const lamp = state.getObject('LAMP');
  state.moveObject('LAMP', 'PLAYER');
  lamp.addFlag(ObjectFlag.ONBIT);
  initializeLampTimer(state);
  
  console.log('Initial state:');
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Timer ticks: ${state.eventSystem.getRemainingTicks('I-LANTERN')}\n`);
  
  // Test setlampfuel command
  console.log('Testing setlampfuel 101...');
  const result1 = executeDebugCommand('setlampfuel 101', state);
  console.log(`Result: ${result1}`);
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Timer ticks: ${state.eventSystem.getRemainingTicks('I-LANTERN')}\n`);
  
  // Test advance command
  console.log('Testing advance 1...');
  const result2 = executeDebugCommand('advance 1', state);
  console.log(`Result: ${result2}`);
  console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
  console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
  console.log(`- Current turn: ${state.moves}`);
  console.log(`- Timer ticks: ${state.eventSystem.getRemainingTicks('I-LANTERN')}\n`);
}

testDebugCommands().catch(console.error);