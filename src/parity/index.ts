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

// Daemon timing synchronization
export {
  // Lamp timing
  LAMP_WARN_1,
  LAMP_WARN_2,
  LAMP_WARN_3,
  LAMP_DEAD,
  INITIAL_LAMP_FUEL,
  LAMP_TIMING_TABLE,
  getLampWarningMessage,
  getLampWarningForFuel,
  getTicksUntilNextLampWarning,
  getLampStageIndex,
  isLampWarningThreshold,
  // Candle timing
  CANDLE_WARN_1,
  CANDLE_WARN_2,
  CANDLE_WARN_3,
  CANDLE_DEAD,
  INITIAL_CANDLE_FUEL,
  CANDLE_TIMING_TABLE,
  getCandleWarningMessage,
  getCandleWarningForFuel,
  getTicksUntilNextCandleWarning,
  getCandleStageIndex,
  isCandleWarningThreshold,
  // Thief timing
  THIEF_APPEAR_PROBABILITY,
  THIEF_LEAVE_PROBABILITY,
  THIEF_CONTINUE_FIGHT_PROBABILITY,
  THIEF_IDLE_PROBABILITY,
  THIEF_STEAL_PROBABILITY,
  THIEF_DROP_JUNK_PROBABILITY,
  THIEF_STEAL_JUNK_PROBABILITY,
  // Troll timing
  TROLL_FIRST_STRIKE_PROBABILITY,
  TROLL_RECOVERY_INTERVAL,
  TROLL_AXE_RECOVERY_FIGHTING,
  TROLL_AXE_RECOVERY_NORMAL,
  // Deterministic timing
  setTimingSeed,
  getTimingSeed,
  getTimingRandom,
  shouldEventOccur,
  shouldThiefAppear,
  shouldThiefLeave,
  shouldThiefContinueFight,
  shouldThiefBeIdle,
  shouldThiefSteal,
  shouldThiefDropJunk,
  shouldTrollStrikeFirst,
  shouldTrollRecoverAxe,
  // State management
  createInitialTimingState,
  synchronizeDaemonTiming
} from './DaemonTimingSynchronizer';
export type { LampTimingStage, CandleTimingStage, DaemonTimingState } from './DaemonTimingSynchronizer';

// Atmospheric message alignment
export {
  // Probability constants
  FOREST_MESSAGE_PROBABILITY,
  UNDERGROUND_MESSAGE_PROBABILITY,
  THIEF_ANNOUNCEMENT_PROBABILITY,
  // Message definitions
  FOREST_BIRD_MESSAGE,
  ATMOSPHERIC_MESSAGES,
  // Location detection
  FOREST_ROOMS,
  SURFACE_ROOMS,
  isForestRoom,
  isUndergroundRoom,
  // Deterministic generation
  setAtmosphericSeed,
  getAtmosphericSeed,
  getAtmosphericRandom,
  getMessageForSeed,
  generateAtmosphericMessage,
  isMessageValidForRoom,
  // Class
  AtmosphericMessageAligner,
  // Utility functions
  filterAtmosphericMessages,
  containsAtmosphericMessage,
  extractAtmosphericMessage,
  // Default instance
  getAtmosphericMessageAligner,
  resetAtmosphericMessageAligner
} from './AtmosphericMessageAligner';
export type { AtmosphericMessage } from './AtmosphericMessageAligner';

// Parity validation threshold enforcement
export {
  DEFAULT_PARITY_THRESHOLD,
  MINIMUM_PARITY_THRESHOLD,
  validateParityThreshold,
  detectRegression
} from './ParityValidationThreshold';
export type {
  ParityValidationResult,
  RegressionDetectionResult,
  ParityHistoryEntry
} from './ParityValidationThreshold';