/**
 * Parity Enhancement System - Main exports
 */

// Core interfaces
export * from './interfaces';

// Component implementations
export { ZMachineStatusDisplay } from './StatusDisplayManager';
export { ZMachineParserErrors } from './ParserErrorHandler';
export { ZMachineObjectInteraction } from './ObjectInteractionManager';
export { ZMachineMessageStandards } from './MessageConsistencyManager';
export { ZMachineStateSync } from './StateSynchronizationManager';

// Error message standardization
export { 
  ErrorMessageStandardizer,
  ErrorType,
  unknownWord,
  objectNotVisible,
  verbNeedsObject,
  dontHave,
  emptyInput,
  malformedInput,
  containerClosed,
  takeConcept,
  takeInteresting,
  turnBareHands,
  pushNotHelpful,
  pullCantMove,
  openCantGetIn,
  cantDoThat,
  nothingHappens,
  getSceneryError
} from './ErrorMessageStandardizer';
export type { ErrorContext, SceneryErrorMapping } from './ErrorMessageStandardizer';

// Vocabulary alignment
export {
  VocabularyAligner,
  isZMachineWord,
  getUnknownWordError,
  getCanonicalForm
} from './VocabularyAligner';
export type { VocabularyValidationResult, WordCheckResult } from './VocabularyAligner';

// Main engine
export { ParityEnhancementEngine } from './ParityEnhancementEngine';
export type { CommandResult, ParityEnhancementConfig } from './ParityEnhancementEngine';