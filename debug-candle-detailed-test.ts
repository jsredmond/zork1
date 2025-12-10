#!/usr/bin/env npx tsx

/**
 * Debug script to test each candle burning command individually
 */

import { readFile } from 'fs/promises';
import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { initializeCandleTimer } from './src/engine/daemons.js';
import { GameObjectImpl } from './src/game/objects.js';
import { ObjectFlag } from './src/game/data/flags.js';

async function testCandleTranscript() {
  console.log('=== CANDLE TRANSCRIPT DETAILED TEST ===\n');
  
  // Read the transcript
  const transcriptData = await readFile('.kiro/transcripts/timing/72-candle-burning.json', 'utf-8');
  const transcript = JSON.parse(transcriptData);
  
  const state = createInitialGameState();
  
  // Setup commands
  console.log('=== Setup Commands ===');
  for (const setupCmd of transcript.setupCommands) {
    console.log(`> ${setupCmd}`);
    const result = executeCommand(setupCmd, state);
    console.log(result);
    console.log();
  }
  
  // Test each entry
  console.log('=== Test Entries ===');
  for (let i = 0; i < transcript.entries.length; i++) {
    const entry = transcript.entries[i];
    console.log(`[${i+1}/${transcript.entries.length}] > ${entry.command}`);
    
    const actualOutput = executeCommand(entry.command, state);
    const expectedOutput = entry.expectedOutput;
    
    console.log('Expected:');
    console.log(expectedOutput);
    console.log('Actual:');
    console.log(actualOutput);
    
    const match = actualOutput.trim() === expectedOutput.trim();
    console.log(`Match: ${match ? '✓' : '✗'}`);
    
    if (!match) {
      console.log('--- DIFFERENCE ANALYSIS ---');
      console.log('Expected lines:', expectedOutput.split('\n').length);
      console.log('Actual lines:', actualOutput.split('\n').length);
      
      const expectedLines = expectedOutput.split('\n');
      const actualLines = actualOutput.split('\n');
      
      for (let j = 0; j < Math.max(expectedLines.length, actualLines.length); j++) {
        const exp = expectedLines[j] || '<missing>';
        const act = actualLines[j] || '<missing>';
        if (exp !== act) {
          console.log(`Line ${j+1}: Expected "${exp}" vs Actual "${act}"`);
        }
      }
    }
    
    console.log();
  }
}

function executeCommand(command: string, state: any): string {
  // Handle debug commands
  if (command.startsWith('teleport ')) {
    const roomId = command.substring(9).trim();
    state.currentRoom = roomId;
    return `[DEBUG: Teleported to ${roomId}]`;
  }
  
  if (command.startsWith('give ')) {
    const objectId = command.substring(5).trim();
    const obj = state.getObject(objectId);
    if (obj) {
      state.moveObject(objectId, 'PLAYER');
      return `[DEBUG: Given ${objectId}]`;
    }
    return `[DEBUG: Object ${objectId} not found]`;
  }
  
  if (command.startsWith('light ')) {
    const objectId = command.substring(6).trim();
    const obj = state.getObject(objectId) as GameObjectImpl;
    if (obj) {
      obj.addFlag(ObjectFlag.ONBIT);
      
      // Initialize candle timer if this is the candles
      if (objectId === 'CANDLES') {
        initializeCandleTimer(state);
      }
      
      return `[DEBUG: Lit ${objectId}]`;
    }
    return `[DEBUG: Object ${objectId} not found]`;
  }
  
  if (command.startsWith('setcandlefuel ')) {
    const turns = parseInt(command.substring(14).trim());
    if (!isNaN(turns) && turns >= 0 && turns <= 40) {
      let stage = 0;
      let ticksRemaining = 0;
      
      // For testing purposes, set up the interrupt to trigger on next advance
      if (turns === 21) {
        stage = 0;
        ticksRemaining = 1;
      } else if (turns === 11) {
        stage = 1;
        ticksRemaining = 1;
      } else if (turns === 6) {
        stage = 2;
        ticksRemaining = 1;
      } else if (turns === 1) {
        stage = 3;
        ticksRemaining = 1;
      } else {
        // Default behavior
        if (turns > 20) {
          stage = 0;
          ticksRemaining = turns - 20;
        } else if (turns > 10) {
          stage = 1;
          ticksRemaining = turns - 10;
        } else if (turns > 5) {
          stage = 2;
          ticksRemaining = turns - 5;
        } else if (turns > 0) {
          stage = 3;
          ticksRemaining = turns;
        } else {
          stage = 4;
          ticksRemaining = 0;
        }
      }
      
      state.setGlobalVariable('CANDLE_STAGE_INDEX', stage);
      
      const events = (state as any).eventSystem.events;
      const candleEvent = events.get('I-CANDLES');
      if (candleEvent && stage < 4) {
        candleEvent.ticksRemaining = ticksRemaining;
        candleEvent.enabled = true;
      } else if (candleEvent) {
        candleEvent.enabled = false;
      }
      
      return `[DEBUG: Set candle fuel to ${turns} turns (stage ${stage}, next event in ${ticksRemaining} turns)]`;
    }
    return `[DEBUG: Invalid fuel level (0-40)]`;
  }
  
  if (command.startsWith('advance ')) {
    const turns = parseInt(command.substring(8).trim());
    if (!isNaN(turns) && turns > 0) {
      // Capture console output from daemons
      const originalLog = console.log;
      let daemonOutput = '';
      
      console.log = (...args: any[]) => {
        daemonOutput += args.join(' ') + '\n';
      };
      
      try {
        for (let i = 0; i < turns; i++) {
          state.eventSystem.processTurn(state);
        }
      } finally {
        console.log = originalLog;
      }
      
      let result = `[DEBUG: Advanced ${turns} turns to turn ${state.moves}]`;
      if (daemonOutput.trim()) {
        result += '\n' + daemonOutput.trim();
      }
      
      return result;
    }
    return `[DEBUG: Invalid turn count]`;
  }
  
  if (command === 'look') {
    const currentRoom = state.getRoom(state.currentRoom);
    return currentRoom?.description || 'You are in a room.';
  }
  
  return 'Unknown command';
}

testCandleTranscript().catch(console.error);