/**
 * Core interfaces for the parity enhancement system
 */

import { GameState } from '../game/state';

export interface CommandContext {
  verb: string;
  directObject?: string;
  indirectObject?: string;
  preposition?: string;
  rawInput: string;
}

export interface ParseContext {
  verb: string;
  directObject?: string;
  indirectObject?: string;
  preposition?: string;
  hasDirectObject: boolean;
  hasIndirectObject: boolean;
}

export interface ObjectContext {
  object?: string;
  impliedObject?: string;
  location?: string;
  isVisible: boolean;
  isPossessed: boolean;
}

export interface MessageContext {
  object?: string;
  verb?: string;
  location?: string;
  [key: string]: any;
}

export enum ObjectErrorType {
  NOT_POSSESSED = 'not_possessed',
  NOT_VISIBLE = 'not_visible',
  CANNOT_MANIPULATE = 'cannot_manipulate',
  INVALID_OBJECT = 'invalid_object'
}

export enum MessageType {
  MALFORMED_COMMAND = 'malformed_command',
  MISSING_OBJECT = 'missing_object',
  OBJECT_NOT_HERE = 'object_not_here',
  DONT_HAVE_OBJECT = 'dont_have_object',
  EMPTY_HANDED = 'empty_handed',
  UNKNOWN_VERB = 'unknown_verb'
}

export interface ActionResult {
  success: boolean;
  message: string;
  errorType?: ObjectErrorType;
}

export interface ValidationResult {
  isValid: boolean;
  issues: StateIssue[];
}

export interface StateIssue {
  type: string;
  objectId?: string;
  description: string;
}

export interface EnhancedResponse {
  message: string;
  gameState: GameState;
  parityMetrics: ParityMetrics;
}

export interface ParityMetrics {
  statusIncluded: boolean;
  messageStandardized: boolean;
  stateValidated: boolean;
  errorHandlingCorrect: boolean;
}

/**
 * StatusDisplayManager interface for managing status bar display
 */
export interface StatusDisplayManager {
  formatResponse(message: string, gameState: GameState): string;
  shouldIncludeStatus(commandType: string): boolean;
  formatStatusLine(room: string, score: number, moves: number): string;
}

/**
 * ParserErrorHandler interface for managing parser error messages
 */
export interface ParserErrorHandler {
  handleIncompleteCommand(verb: string, context: ParseContext): string;
  handleUnknownVerb(input: string): string;
  handleMalformedCommand(input: string): string;
}

/**
 * ObjectInteractionManager interface for managing object interactions
 */
export interface ObjectInteractionManager {
  validateObjectAction(action: string, object: string, gameState: GameState): ActionResult;
  generateErrorMessage(errorType: ObjectErrorType, context: ObjectContext): string;
  checkObjectVisibility(object: string, gameState: GameState): boolean;
}

/**
 * MessageConsistencyManager interface for standardizing messages
 */
export interface MessageConsistencyManager {
  standardizeMessage(messageType: MessageType, context: MessageContext): string;
  validateMessageFormat(message: string): boolean;
  getCanonicalMessage(messageType: MessageType, context: MessageContext): string;
}

/**
 * StateSynchronizationManager interface for game state validation
 */
export interface StateSynchronizationManager {
  validateGameState(state: GameState): ValidationResult;
  synchronizeObjectLocations(state: GameState): void;
  ensureInventoryConsistency(state: GameState): void;
  validateObjectAction?(action: string, objectId: string, gameState: GameState): any;
}