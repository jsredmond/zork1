#!/usr/bin/env tsx

/**
 * Test script to verify mirror room teleportation
 */

import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { Parser } from './src/parser/parser.js';
import { CommandExecutor } from './src/engine/executor.js';

async function testMirrorRoom() {
  console.log('=== Testing Mirror Room Teleportation ===\n');

  // Create game state with deterministic RNG
  const state = createInitialGameState(12345);
  const parser = new Parser();
  const executor = new CommandExecutor();

  // Helper function to execute command
  function exec(cmd: string) {
    const parsed = parser.parse(cmd, state);
    return executor.execute(parsed, state);
  }

  // Commands to reach mirror room
  const commands = [
    'take lamp',
    'take sword',
    'move rug',
    'open trap door',
    'turn on lamp',
    'd',
    'n',
    // Kill troll to get past
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'attack troll with sword',
    'e',
    'e',
    's',
    's', // Should be in MIRROR-ROOM-2
  ];

  console.log('Navigating to Mirror Room...\n');
  for (const cmd of commands) {
    const result = exec(cmd);
    if (cmd.includes('attack')) {
      console.log(`> ${cmd}`);
      console.log(result.message.split('\n')[0]); // Just first line
    }
  }

  console.log('\n--- Arrived at Mirror Room ---');
  console.log(`Current room: ${state.currentRoom}\n`);

  // Look around
  console.log('> look');
  let result = exec('look');
  console.log(result.message);
  console.log();

  // Examine mirror
  console.log('> examine mirror');
  result = exec('examine mirror');
  console.log(result.message);
  console.log();

  // Touch/rub mirror (should teleport)
  console.log('> touch mirror');
  result = exec('touch mirror');
  console.log(result.message);
  console.log(`New room: ${state.currentRoom}`);
  console.log();

  // Look around in new room
  console.log('> look');
  result = exec('look');
  console.log(result.message);
  console.log();

  // Touch mirror again (should teleport back)
  console.log('> rub mirror');
  result = exec('rub mirror');
  console.log(result.message);
  console.log(`New room: ${state.currentRoom}`);
  console.log();

  // Verify we're back
  console.log('> look');
  result = exec('look');
  console.log(result.message);
  console.log();

  console.log('=== Test Complete ===');
}

testMirrorRoom().catch(console.error);
