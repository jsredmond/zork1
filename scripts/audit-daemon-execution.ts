#!/usr/bin/env npx tsx

/**
 * Daemon Execution Audit Script
 * 
 * Analyzes the current daemon execution order and timing in the TypeScript implementation
 * compared to the original ZIL implementation.
 */

import { createInitialGameState } from '../src/game/factories/gameFactory.js';
import { GameState } from '../src/game/state.js';

interface DaemonInfo {
  id: string;
  enabled: boolean;
  isDaemon: boolean;
  ticksRemaining: number;
  description: string;
}

/**
 * Audit the current daemon execution system
 */
function auditDaemonExecution(): void {
  console.log('=== DAEMON EXECUTION AUDIT ===\n');
  
  // Create initial game state
  const gameState = createInitialGameState();
  
  // Get all registered events/daemons
  const eventIds = gameState.eventSystem.getEventIds();
  const daemons: DaemonInfo[] = [];
  const interrupts: DaemonInfo[] = [];
  
  console.log('1. REGISTERED EVENTS AND DAEMONS:');
  console.log('================================\n');
  
  for (const id of eventIds) {
    const status = gameState.eventSystem.getEventStatus(id);
    if (status) {
      const info: DaemonInfo = {
        id,
        enabled: status.enabled,
        isDaemon: status.isDaemon,
        ticksRemaining: status.ticksRemaining,
        description: getEventDescription(id)
      };
      
      if (status.isDaemon) {
        daemons.push(info);
      } else {
        interrupts.push(info);
      }
    }
  }
  
  // Display daemons
  console.log('DAEMONS (run every turn):');
  if (daemons.length === 0) {
    console.log('  No daemons registered');
  } else {
    daemons.forEach(daemon => {
      console.log(`  ${daemon.id}: ${daemon.enabled ? 'ENABLED' : 'DISABLED'} - ${daemon.description}`);
    });
  }
  
  console.log('\nINTERRUPTS (run after N turns):');
  if (interrupts.length === 0) {
    console.log('  No interrupts registered');
  } else {
    interrupts.forEach(interrupt => {
      console.log(`  ${interrupt.id}: ${interrupt.enabled ? 'ENABLED' : 'DISABLED'} (${interrupt.ticksRemaining} ticks) - ${interrupt.description}`);
    });
  }
  
  console.log('\n2. EXPECTED ZIL DAEMON ORDER:');
  console.log('=============================\n');
  
  const expectedZilOrder = [
    'I-FIGHT (combat daemon)',
    'I-SWORD (sword glow daemon)', 
    'I-THIEF (thief movement daemon)',
    'I-CANDLES (candle timer)',
    'I-LANTERN (lamp timer)',
    'I-CYCLOPS (cyclops behavior)',
    'I-CURE (healing daemon)',
    'Other interrupts as needed'
  ];
  
  expectedZilOrder.forEach((daemon, index) => {
    console.log(`  ${index + 1}. ${daemon}`);
  });
  
  console.log('\n3. CURRENT TYPESCRIPT IMPLEMENTATION:');
  console.log('====================================\n');
  
  const currentOrder = [
    'combat (I-FIGHT equivalent) - REGISTERED',
    'I-SWORD - COMMENTED OUT in gameFactory.ts',
    'I-THIEF - NOT REGISTERED as daemon',
    'I-CANDLES - Only registered when candles are lit',
    'I-LANTERN - Only registered when lamp is turned on',
    'I-CYCLOPS - Only registered when cyclops is angry',
    'I-CURE - Only registered when player is wounded'
  ];
  
  currentOrder.forEach((daemon, index) => {
    console.log(`  ${index + 1}. ${daemon}`);
  });
  
  console.log('\n4. IDENTIFIED ISSUES:');
  console.log('====================\n');
  
  const issues = [
    'MISSING: I-THIEF daemon not registered at game start',
    'MISSING: I-SWORD daemon commented out in gameFactory.ts',
    'TIMING: Lamp/candle daemons only start when items are activated',
    'TIMING: Cyclops daemon only starts when cyclops becomes angry',
    'ORDER: No guaranteed execution order for daemons',
    'INITIALIZATION: Daemons not initialized in ZIL order'
  ];
  
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  
  console.log('\n5. RECOMMENDATIONS:');
  console.log('==================\n');
  
  const recommendations = [
    'Register I-THIEF daemon at game start (enabled)',
    'Register I-SWORD daemon at game start (enabled)', 
    'Register I-LANTERN daemon at game start (disabled)',
    'Register I-CANDLES daemon at game start (disabled)',
    'Ensure daemon execution order matches ZIL',
    'Initialize all daemons in gameFactory.ts in correct order'
  ];
  
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  console.log('\n6. DAEMON EXECUTION FLOW:');
  console.log('=========================\n');
  
  console.log('Current TypeScript flow:');
  console.log('  1. Player enters command');
  console.log('  2. Command is parsed and executed');
  console.log('  3. EventSystem.processTurn() is called');
  console.log('  4. All enabled daemons run (no guaranteed order)');
  console.log('  5. All interrupts with ticksRemaining=0 run');
  console.log('  6. Move counter is incremented');
  
  console.log('\nExpected ZIL flow:');
  console.log('  1. Player enters command');
  console.log('  2. Command is parsed and executed');
  console.log('  3. CLOCKER routine runs all daemons in order');
  console.log('  4. Daemons run in registration order');
  console.log('  5. Move counter is incremented');
}

/**
 * Get description for an event ID
 */
function getEventDescription(id: string): string {
  const descriptions: Record<string, string> = {
    'combat': 'Combat daemon (I-FIGHT) - handles villain attacks',
    'I-SWORD': 'Sword glow daemon - makes sword glow near enemies',
    'I-THIEF': 'Thief movement daemon - moves thief around dungeon',
    'I-LANTERN': 'Lamp timer daemon - tracks lamp battery life',
    'I-CANDLES': 'Candle timer daemon - tracks candle burn time',
    'I-CYCLOPS': 'Cyclops behavior daemon - handles cyclops actions',
    'I-CURE': 'Healing daemon - gradually heals player wounds'
  };
  
  return descriptions[id] || 'Unknown daemon';
}

// Run the audit
auditDaemonExecution();