/**
 * Enhanced Command Executor with Parity Enhancement Integration
 */

import { GameState } from '../game/state.js';
import { ParsedCommand, ParseError } from '../parser/parser.js';
import { ActionResult } from '../game/actions.js';
import { CommandExecutor } from './executor.js';
import { ParityEnhancementEngine } from '../parity/ParityEnhancementEngine.js';

export interface EnhancedCommandResult {
  success: boolean;
  message: string;
  stateChanges: any[];
  parityEnhanced: boolean;
}

/**
 * Enhanced CommandExecutor that integrates parity enhancements
 */
export class EnhancedCommandExecutor extends CommandExecutor {
  private parityEngine: ParityEnhancementEngine;

  constructor() {
    super();
    this.parityEngine = new ParityEnhancementEngine({
      enableStatusDisplay: true,
      enableParserEnhancements: false,
      enableObjectInteractionFixes: false,
      enableMessageStandardization: false,
      enableStateValidation: false,
      strictValidation: false
    });
  }

  /**
   * Execute a command with parity enhancements
   */
  async executeWithParity(
    command: ParsedCommand | ParseError, 
    state: GameState, 
    skipDaemons: boolean = false
  ): Promise<EnhancedCommandResult> {
    
    // First execute the command normally
    const originalResult = super.execute(command, state, skipDaemons);
    
    // Extract command string for parity enhancement
    let commandString = '';
    if ('verb' in command) {
      commandString = this.reconstructCommandString(command as ParsedCommand);
    } else if ('message' in command) {
      // For parse errors, use a generic command representation
      commandString = 'unknown command';
    }

    try {
      // Apply parity enhancements
      const enhancedResponse = await this.parityEngine.enhanceCommand(
        commandString,
        state,
        {
          message: originalResult.message,
          gameState: state,
          success: originalResult.success
        }
      );

      return {
        success: originalResult.success,
        message: enhancedResponse.message,
        stateChanges: originalResult.stateChanges,
        parityEnhanced: true
      };

    } catch (error) {
      // If parity enhancement fails, fall back to original result
      console.error('Parity enhancement failed:', error);
      
      return {
        success: originalResult.success,
        message: originalResult.message,
        stateChanges: originalResult.stateChanges,
        parityEnhanced: false
      };
    }
  }

  /**
   * Reconstruct command string from parsed command for parity processing
   */
  private reconstructCommandString(command: ParsedCommand): string {
    let commandStr = command.verb || '';
    
    if (command.directObject) {
      commandStr += ` ${command.directObject.name}`;
    }
    
    if (command.preposition) {
      commandStr += ` ${command.preposition}`;
    }
    
    if (command.indirectObject) {
      commandStr += ` ${command.indirectObject.name}`;
    }
    
    if (command.isAllObjects) {
      commandStr += ' all';
    }
    
    return commandStr.trim();
  }

  /**
   * Get parity engine configuration
   */
  getParityConfig() {
    return this.parityEngine.getConfig();
  }

  /**
   * Update parity engine configuration
   */
  updateParityConfig(config: any) {
    this.parityEngine.updateConfig(config);
  }

  /**
   * Get component status for debugging
   */
  getParityStatus() {
    return this.parityEngine.getComponentStatus();
  }
}