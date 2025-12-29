/**
 * Types and interfaces for random parity spot testing system
 */

// Command generation configuration
export interface CommandGenerationConfig {
  commandCount: number;
  seed?: number;
  focusAreas?: GameArea[];
  commandTypes?: CommandType[];
  avoidGameEnding?: boolean;
}

// Generated command with metadata
export interface GeneratedCommand {
  command: string;
  context: GameContext;
  expectedType: CommandType;
  weight: number;
}

// Game context for command generation
export interface GameContext {
  currentLocation: string;
  visibleObjects: string[];
  inventory: string[];
  availableDirections: string[];
  gameFlags: Map<string, boolean>;
}

// Command template for generation
export interface CommandTemplate {
  pattern: string;
  type: CommandType;
  weight: number;
  contextRequirements: ContextRequirement[];
}

// Context requirements for command templates
export interface ContextRequirement {
  type: 'object_present' | 'location_type' | 'inventory_item' | 'flag_set';
  value: string;
  required: boolean;
}

// Spot test configuration
export interface SpotTestConfig {
  commandCount: number;
  seed: number;
  timeoutMs: number;
  quickMode: boolean;
  focusAreas?: GameArea[];
}

// Spot test execution result
export interface SpotTestResult {
  totalCommands: number;
  differences: CommandDifference[];
  parityScore: number;
  executionTime: number;
  recommendDeepAnalysis: boolean;
  issuePatterns: IssuePattern[];
}

// Command execution difference
export interface CommandDifference {
  commandIndex: number;
  command: string;
  tsOutput: string;
  zmOutput: string;
  differenceType: DifferenceType;
  severity: IssueSeverity;
}

// Command execution result
export interface CommandResult {
  command: string;
  tsOutput: string;
  zmOutput: string;
  executionTime: number;
  success: boolean;
}

// Validation configuration
export interface ValidationConfig {
  strictMode: boolean;
  normalizeOutput: boolean;
  ignoreMinorDifferences: boolean;
}

// Validation result
export interface ValidationResult {
  isMatch: boolean;
  differenceType?: DifferenceType;
  severity: IssueSeverity;
  details?: string;
}

// Issue pattern detection
export interface IssuePattern {
  type: PatternType;
  frequency: number;
  severity: IssueSeverity;
  description: string;
  sampleCommands: string[];
}

// Issue analysis result
export interface IssueAnalysis {
  patterns: IssuePattern[];
  overallSeverity: IssueSeverity;
  recommendDeepAnalysis: boolean;
  recommendations: string[];
}

// Spot test metrics
export interface SpotTestMetrics {
  commandsExecuted: number;
  differencesFound: number;
  parityPercentage: number;
  averageResponseTime: number;
  issuesByType: Map<DifferenceType, number>;
}

// Recommendation thresholds
export interface RecommendationThresholds {
  minDifferencesForDeepAnalysis: number;
  maxParityForConcern: number;
  criticalIssueThreshold: number;
}

// Enums

// Types of commands that can be generated
export enum CommandType {
  MOVEMENT = 'movement',
  OBJECT_INTERACTION = 'object_interaction',
  EXAMINATION = 'examination',
  INVENTORY = 'inventory',
  PUZZLE_ACTION = 'puzzle_action',
  COMMUNICATION = 'communication'
}

// Game areas for focused testing
export enum GameArea {
  HOUSE = 'house',
  FOREST = 'forest',
  UNDERGROUND = 'underground',
  MAZE = 'maze',
  ENDGAME = 'endgame'
}

// Types of differences found during validation
export enum DifferenceType {
  MESSAGE_INCONSISTENCY = 'message_inconsistency',
  STATE_DIVERGENCE = 'state_divergence',
  PARSER_DIFFERENCE = 'parser_difference',
  OBJECT_BEHAVIOR = 'object_behavior',
  TIMING_DIFFERENCE = 'timing_difference'
}

// Pattern types for issue detection
export enum PatternType {
  MESSAGE_INCONSISTENCY = 'message_inconsistency',
  STATE_DIVERGENCE = 'state_divergence',
  PARSER_DIFFERENCE = 'parser_difference',
  OBJECT_BEHAVIOR = 'object_behavior'
}

// Severity levels for issues
export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Validation result types
export enum ValidationResultType {
  MATCH = 'match',
  MISMATCH = 'mismatch',
  ERROR = 'error'
}