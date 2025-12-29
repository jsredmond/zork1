/**
 * ParityEnhancementEngine - Core class that integrates all parity enhancement components
 */

import { GameState } from '../game/state';
import { 
  StatusDisplayManager, 
  ParserErrorHandler, 
  ObjectInteractionManager, 
  MessageConsistencyManager, 
  StateSynchronizationManager,
  EnhancedResponse,
  ParityMetrics,
  CommandContext,
  ParseContext,
  MessageType,
  ObjectErrorType
} from './interfaces';

import { ZMachineStatusDisplay } from './StatusDisplayManager';
import { ZMachineParserErrors } from './ParserErrorHandler';
import { ZMachineObjectInteraction } from './ObjectInteractionManager';
import { ZMachineMessageStandards } from './MessageConsistencyManager';
import { ZMachineStateSync } from './StateSynchronizationManager';

export interface CommandResult {
  message: string;
  gameState: GameState;
  success: boolean;
}

export interface ParityEnhancementConfig {
  enableStatusDisplay: boolean;
  enableParserEnhancements: boolean;
  enableObjectInteractionFixes: boolean;
  enableMessageStandardization: boolean;
  enableStateValidation: boolean;
  strictValidation: boolean;
}

export class ParityEnhancementEngine {
  private statusManager: StatusDisplayManager;
  private parserErrorHandler: ParserErrorHandler;
  private objectManager: ObjectInteractionManager;
  private messageManager: MessageConsistencyManager;
  private stateSync: StateSynchronizationManager;
  private config: ParityEnhancementConfig;

  constructor(config?: Partial<ParityEnhancementConfig>) {
    // Initialize all parity enhancement components
    this.statusManager = new ZMachineStatusDisplay();
    this.parserErrorHandler = new ZMachineParserErrors();
    this.objectManager = new ZMachineObjectInteraction();
    this.messageManager = new ZMachineMessageStandards();
    this.stateSync = new ZMachineStateSync();

    // Set default configuration
    this.config = {
      enableStatusDisplay: true,
      enableParserEnhancements: true,
      enableObjectInteractionFixes: true,
      enableMessageStandardization: true,
      enableStateValidation: true,
      strictValidation: false,
      ...config
    };
  }

  /**
   * Main method to enhance a command result with parity improvements
   */
  async enhanceCommand(
    command: string, 
    gameState: GameState, 
    originalResult?: CommandResult
  ): Promise<EnhancedResponse> {
    
    // Create parity metrics tracking
    const metrics: ParityMetrics = {
      statusIncluded: false,
      messageStandardized: false,
      stateValidated: false,
      errorHandlingCorrect: false
    };

    let enhancedMessage = originalResult?.message || '';
    let enhancedState = { ...gameState };

    try {
      // 1. Validate and synchronize game state
      if (this.config.enableStateValidation) {
        const validation = this.stateSync.validateGameState(enhancedState);
        
        if (!validation.isValid) {
          if (this.config.strictValidation) {
            throw new Error(`State validation failed: ${validation.issues.map(i => i.description).join(', ')}`);
          } else {
            // Attempt to repair state issues
            const repairResult = this.stateSync.repairStateInconsistencies(enhancedState);
            metrics.stateValidated = repairResult.isValid;
          }
        } else {
          metrics.stateValidated = true;
        }
      }

      // 2. Apply parser enhancements if this was a parser error
      if (this.config.enableParserEnhancements && this.isParserError(enhancedMessage)) {
        const context = this.parseCommand(command);
        enhancedMessage = this.enhanceParserError(command, context, enhancedMessage);
        metrics.errorHandlingCorrect = true;
      }

      // 3. Apply object interaction enhancements
      if (this.config.enableObjectInteractionFixes && this.isObjectError(enhancedMessage)) {
        enhancedMessage = this.enhanceObjectError(command, enhancedState, enhancedMessage);
        metrics.errorHandlingCorrect = true;
      }

      // 4. Standardize message format
      if (this.config.enableMessageStandardization) {
        enhancedMessage = this.standardizeMessage(enhancedMessage, command, enhancedState);
        metrics.messageStandardized = true;
      }

      // 5. Add status display
      if (this.config.enableStatusDisplay) {
        enhancedMessage = this.statusManager.formatResponse(enhancedMessage, enhancedState);
        metrics.statusIncluded = true;
      }

      return {
        message: enhancedMessage,
        gameState: enhancedState,
        parityMetrics: metrics
      };

    } catch (error) {
      // Handle enhancement errors gracefully
      console.error('Parity enhancement error:', error);
      
      // Return original result with minimal enhancements
      return {
        message: originalResult?.message || 'An error occurred.',
        gameState: gameState,
        parityMetrics: {
          statusIncluded: false,
          messageStandardized: false,
          stateValidated: false,
          errorHandlingCorrect: false
        }
      };
    }
  }

  /**
   * Enhances parser error messages
   */
  private enhanceParserError(command: string, context: ParseContext, originalMessage: string): string {
    // Check for incomplete command
    if (this.isIncompleteCommand(context)) {
      return this.parserErrorHandler.handleIncompleteCommand(context.verb, context);
    }

    // Check for unknown verb
    if (this.isUnknownVerb(originalMessage)) {
      return this.parserErrorHandler.handleUnknownVerb(command);
    }

    // Check for malformed command
    if (this.isMalformedCommand(command, originalMessage)) {
      return this.parserErrorHandler.handleMalformedCommand(command);
    }

    return originalMessage;
  }

  /**
   * Enhances object interaction error messages
   */
  private enhanceObjectError(command: string, gameState: GameState, originalMessage: string): string {
    const context = this.parseCommand(command);
    
    if (!context.directObject) {
      return originalMessage;
    }

    // Validate object action
    const result = this.objectManager.validateObjectAction(
      context.verb, 
      context.directObject, 
      gameState
    );

    if (!result.success && result.message) {
      return result.message;
    }

    return originalMessage;
  }

  /**
   * Standardizes message format and content
   */
  private standardizeMessage(message: string, command: string, gameState: GameState): string {
    // Determine message type
    const messageType = this.classifyMessage(message);
    
    if (messageType) {
      const context = this.createMessageContext(command, gameState);
      return this.messageManager.standardizeMessage(messageType, context);
    }

    // Ensure proper formatting
    return this.messageManager.formatErrorMessage(message);
  }

  /**
   * Parses a command into context information
   */
  private parseCommand(command: string): ParseContext {
    const words = command.trim().toLowerCase().split(/\s+/);
    
    return {
      verb: words[0] || '',
      directObject: words[1] || undefined,
      indirectObject: words[3] || undefined, // Skip preposition
      preposition: words[2] || undefined,
      hasDirectObject: words.length > 1,
      hasIndirectObject: words.length > 3
    };
  }

  /**
   * Creates message context for standardization
   */
  private createMessageContext(command: string, gameState: GameState): any {
    const context = this.parseCommand(command);
    
    return {
      verb: context.verb,
      object: context.directObject,
      location: gameState.currentRoom?.name,
      command: command
    };
  }

  /**
   * Classifies a message to determine its type
   */
  private classifyMessage(message: string): MessageType | null {
    const lower = message.toLowerCase();
    
    if (lower.includes("that sentence isn't one i recognize")) {
      return MessageType.MALFORMED_COMMAND;
    }
    
    if (lower.includes("noun missing")) {
      return MessageType.MISSING_OBJECT;
    }
    
    if (lower.includes("can't see any") && lower.includes("here")) {
      return MessageType.OBJECT_NOT_HERE;
    }
    
    if (lower.includes("don't have")) {
      return MessageType.DONT_HAVE_OBJECT;
    }
    
    if (lower.includes("empty-handed")) {
      return MessageType.EMPTY_HANDED;
    }
    
    if (lower.includes("don't know the word")) {
      return MessageType.UNKNOWN_VERB;
    }
    
    return null;
  }

  /**
   * Checks if a message indicates a parser error
   */
  private isParserError(message: string): boolean {
    const parserErrorPatterns = [
      /i don't know/i,
      /what do you want to/i,
      /noun missing/i,
      /that sentence isn't/i
    ];
    
    return parserErrorPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Checks if a message indicates an object error
   */
  private isObjectError(message: string): boolean {
    const objectErrorPatterns = [
      /can't see any/i,
      /don't have/i,
      /empty-handed/i,
      /you can't do that/i
    ];
    
    return objectErrorPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Checks if a command is incomplete (verb without required object)
   */
  private isIncompleteCommand(context: ParseContext): boolean {
    return this.parserErrorHandler.verbRequiresObject(context.verb) && !context.hasDirectObject;
  }

  /**
   * Checks if a message indicates an unknown verb
   */
  private isUnknownVerb(message: string): boolean {
    return /i don't know.*how to/i.test(message) || /don't know the word/i.test(message);
  }

  /**
   * Checks if a command is malformed
   */
  private isMalformedCommand(command: string, message: string): boolean {
    // Check for syntax issues
    if (command.includes('  ') || /^\w+\s+in\s*$/.test(command.trim())) {
      return true;
    }
    
    // Check if message suggests malformed syntax
    return /that sentence isn't/i.test(message);
  }

  /**
   * Updates configuration
   */
  updateConfig(newConfig: Partial<ParityEnhancementConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current configuration
   */
  getConfig(): ParityEnhancementConfig {
    return { ...this.config };
  }

  /**
   * Validates that all components are properly initialized
   */
  validateComponents(): boolean {
    return !!(
      this.statusManager &&
      this.parserErrorHandler &&
      this.objectManager &&
      this.messageManager &&
      this.stateSync
    );
  }

  /**
   * Gets component status for debugging
   */
  getComponentStatus(): any {
    return {
      statusManager: !!this.statusManager,
      parserErrorHandler: !!this.parserErrorHandler,
      objectManager: !!this.objectManager,
      messageManager: !!this.messageManager,
      stateSync: !!this.stateSync,
      config: this.config
    };
  }
}