#!/usr/bin/env npx tsx

/**
 * Debug script to test verification script command processing
 */

import * as fs from 'fs';
import { createInitialGameState } from './src/game/factories/gameFactory.js';
import { CommandExecutor } from './src/engine/executor.js';
import { Parser } from './src/parser/parser.js';
import { Lexer } from './src/parser/lexer.js';
import { Vocabulary } from './src/parser/vocabulary.js';
import { GameState } from './src/game/state.js';
import { GameObjectImpl } from './src/game/objects.js';
import { ObjectFlag } from './src/game/data/flags.js';
import { enableDeterministicRandom } from './src/testing/seededRandom.js';
import { initializeLampTimer } from './src/engine/daemons.js';

class TestVerifier {
  private executor: CommandExecutor;
  private parser: Parser;
  private lexer: Lexer;
  private vocabulary: Vocabulary;

  constructor() {
    this.executor = new CommandExecutor();
    this.parser = new Parser();
    this.lexer = new Lexer();
    this.vocabulary = new Vocabulary();
  }

  private executeCommand(command: string, state: GameState): string {
    try {
      // Handle debug commands for setup
      if (command.startsWith('teleport ')) {
        const roomId = command.substring(9).trim();
        state.currentRoom = roomId;
        return `[DEBUG: Teleported to ${roomId}]`;
      }
      
      if (command.startsWith('give ') && !command.includes(' to ')) {
        // Debug command: "give OBJECTID" (not "give X to Y")
        const objectId = command.substring(5).trim();
        const obj = state.getObject(objectId);
        if (obj) {
          state.moveObject(objectId, 'PLAYER');
          return `[DEBUG: Given ${objectId}]`;
        }
        return `[DEBUG: Object ${objectId} not found]`;
      }
      
      if (command.startsWith('turnon ')) {
        const objectId = command.substring(7).trim();
        const obj = state.getObject(objectId) as GameObjectImpl;
        if (obj) {
          obj.addFlag(ObjectFlag.ONBIT);
          
          // Initialize lamp timer if this is the lamp
          if (objectId === 'LAMP') {
            initializeLampTimer(state);
          }
          
          return `[DEBUG: Turned on ${objectId}]`;
        }
        return `[DEBUG: Object ${objectId} not found]`;
      }
      
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
          
          // Set up the lamp event
          const events = (state as any).eventSystem.events;
          const lampEvent = events.get('I-LANTERN');
          if (lampEvent && stage < 4) {
            lampEvent.ticksRemaining = ticksRemaining;
            lampEvent.enabled = true;
          } else if (lampEvent && stage >= 4) {
            lampEvent.enabled = false;
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

      // Regular game command processing
      const processedCommand = command.toLowerCase().trim();
      const tokens = this.lexer.tokenize(processedCommand);
      
      const processedTokens = tokens.map(token => {
        const expandedWord = this.vocabulary.expandAbbreviation(token.word);
        return {
          ...token,
          word: expandedWord,
          type: this.vocabulary.lookupWord(expandedWord),
        };
      });

      const availableObjects = new Map();
      const parsedCommand = this.parser.parse(processedTokens, availableObjects);
      const result = this.executor.execute(parsedCommand, state);

      return result.message || '';
    } catch (error) {
      return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  public testCommands() {
    console.log('=== VERIFICATION COMMAND TEST ===\n');
    
    enableDeterministicRandom(12345);
    const state = createInitialGameState();
    
    // Setup commands
    console.log('Running setup commands...');
    console.log('1. teleport LIVING-ROOM');
    const result1 = this.executeCommand('teleport LIVING-ROOM', state);
    console.log(`   Result: ${result1}`);
    
    console.log('2. give LAMP');
    const result2 = this.executeCommand('give LAMP', state);
    console.log(`   Result: ${result2}`);
    
    console.log('3. turnon LAMP');
    const result3 = this.executeCommand('turnon LAMP', state);
    console.log(`   Result: ${result3}`);
    
    console.log('\nState after setup:');
    console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
    console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
    console.log(`- Current turn: ${state.moves}\n`);
    
    // Test debug commands
    console.log('Testing debug commands...');
    console.log('4. setlampfuel 101');
    const result4 = this.executeCommand('setlampfuel 101', state);
    console.log(`   Result: ${result4}`);
    
    console.log('5. advance 1');
    const result5 = this.executeCommand('advance 1', state);
    console.log(`   Result: ${result5}`);
    
    console.log('\nState after debug commands:');
    console.log(`- Lamp fuel: ${state.getGlobalVariable('LAMP_FUEL')}`);
    console.log(`- Lamp stage: ${state.getGlobalVariable('LAMP_STAGE_INDEX')}`);
    console.log(`- Current turn: ${state.moves}`);
  }
}

const tester = new TestVerifier();
tester.testCommands();