#!/usr/bin/env tsx

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeLampTimer } from './src/engine/daemons.js';
import { ObjectFlag } from './src/game/data/flags.js';

const state = createInitialGameState();

// Give player the lamp
state.moveObject('LAMP', 'PLAYER');
const lamp = state.getObject('LAMP');
if (lamp) {
  lamp.addFlag(ObjectFlag.ONBIT);
  console.log('Lamp turned on');
  
  // Initialize lamp timer
  initializeLampTimer(state);
  console.log('Lamp timer initialized');
  
  // Check initial state
  console.log('Initial LAMP_STAGE_INDEX:', state.getGlobalVariable('LAMP_STAGE_INDEX'));
  
  // Check event system
  const events = (state.eventSystem as any).events;
  const lampEvent = events.get('I-LANTERN');
  console.log('Lamp event registered:', !!lampEvent);
  if (lampEvent) {
    console.log('Lamp event ticks remaining:', lampEvent.ticksRemaining);
    console.log('Lamp event enabled:', lampEvent.enabled);
  }
  
  // Advance 99 turns
  console.log('\nAdvancing 99 turns...');
  for (let i = 0; i < 99; i++) {
    state.eventSystem.processTurn(state);
  }
  
  console.log('After 99 turns:');
  console.log('LAMP_STAGE_INDEX:', state.getGlobalVariable('LAMP_STAGE_INDEX'));
  if (lampEvent) {
    console.log('Lamp event ticks remaining:', lampEvent.ticksRemaining);
  }
  
  // Process turn 100 (should trigger warning)
  console.log('\nProcessing turn 100...');
  const stateChanged = state.eventSystem.processTurn(state);
  console.log('State changed:', stateChanged);
  console.log('LAMP_STAGE_INDEX:', state.getGlobalVariable('LAMP_STAGE_INDEX'));
  if (lampEvent) {
    console.log('Lamp event ticks remaining:', lampEvent.ticksRemaining);
  }
}