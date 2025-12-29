# Design Document: Random Parity Spot Testing

## Overview

This design implements a lightweight random spot testing system to validate parity between the TypeScript Zork I implementation and the original Z-Machine game. The system generates random but realistic game commands and performs quick parity validation to detect potential issues without requiring exhaustive testing.

**Key Goals:**
- **Fast Validation:** Complete spot tests in under 30 seconds
- **Intelligent Generation:** Create realistic, contextually appropriate commands
- **Issue Detection:** Identify potential parity problems requiring deeper investigation
- **Configurable Testing:** Adjustable parameters for different testing needs

## Architecture

The spot testing system consists of these main components:

```
src/
├── testing/
│   └── spotTesting/
│       ├── randomCommandGenerator.ts    # Intelligent command generation
│       ├── spotTestRunner.ts           # Test execution and coordination
│       ├── quickValidator.ts           # Lightweight parity validation
│       └── issueDetector.ts           # Pattern detection and reporting
└── scripts/
    └── spot-test-parity.ts            # CLI interface for spot testing
```

## Components and Interfaces

### 1. Random Command Generator

**File:** `src/testing/spotTesting/randomCommandGenerator.ts`

Generates contextually appropriate random commands:

```typescript
interface CommandGenerationConfig {
  commandCount: number;
  seed?: number;
  focusAreas?: GameArea[];
  commandTypes?: CommandType[];
  avoidGameEnding?: boolean;
}

interface GeneratedCommand {
  command: string;
  context: GameContext;
  expectedType: CommandType;
  weight: number;
}

enum CommandType {
  MOVEMENT = 'movement',
  OBJECT_INTERACTION = 'object_interaction', 
  EXAMINATION = 'examination',
  INVENTORY = 'inventory',
  PUZZLE_ACTION = 'puzzle_action',
  COMMUNICATION = 'communication'
}

class RandomCommandGenerator {
  generateCommands(config: CommandGenerationConfig, gameState: GameState): GeneratedCommand[] {
    // Intelligent command generation based on current context
  }
  
  private generateMovementCommand(gameState: GameState): string {
    // Generate valid movement commands for current location
  }
  
  private generateObjectCommand(gameState: GameState): string {
    // Generate commands for objects in current location or inventory
  }
  
  private generateExaminationCommand(gameState: GameState): string {
    // Generate examine commands for visible objects/scenery
  }
}
```

**Key Features:**
- **Context Awareness:** Commands appropriate to current game state
- **Weighted Selection:** Common actions more likely than rare ones
- **Object Validation:** Only reference objects that exist in current context
- **Logical Flow:** Maintain reasonable command sequences

### 2. Spot Test Runner

**File:** `src/testing/spotTesting/spotTestRunner.ts`

Coordinates test execution and manages game state:

```typescript
interface SpotTestConfig {
  commandCount: number;
  seed: number;
  timeoutMs: number;
  quickMode: boolean;
  focusAreas?: GameArea[];
}

interface SpotTestResult {
  totalCommands: number;
  differences: CommandDifference[];
  parityScore: number;
  executionTime: number;
  recommendDeepAnalysis: boolean;
  issuePatterns: IssuePattern[];
}

interface CommandDifference {
  commandIndex: number;
  command: string;
  tsOutput: string;
  zmOutput: string;
  differenceType: DifferenceType;
  severity: IssueSeverity;
}

class SpotTestRunner {
  async runSpotTest(config: SpotTestConfig): Promise<SpotTestResult> {
    // Execute random commands and compare outputs
  }
  
  private async executeCommand(command: string): Promise<CommandResult> {
    // Execute command on both TypeScript and Z-Machine
  }
  
  private analyzeResults(results: CommandResult[]): SpotTestResult {
    // Analyze differences and generate recommendations
  }
}
```

### 3. Quick Validator

**File:** `src/testing/spotTesting/quickValidator.ts`

Lightweight parity validation optimized for speed:

```typescript
interface ValidationConfig {
  strictMode: boolean;
  normalizeOutput: boolean;
  ignoreMinorDifferences: boolean;
}

interface ValidationResult {
  isMatch: boolean;
  differenceType?: DifferenceType;
  severity: IssueSeverity;
  details?: string;
}

class QuickValidator {
  validateResponse(tsOutput: string, zmOutput: string, config: ValidationConfig): ValidationResult {
    // Fast comparison with appropriate normalization
  }
  
  private normalizeForComparison(output: string): string {
    // Apply same normalization as comprehensive tests
  }
  
  private classifyDifference(tsOutput: string, zmOutput: string): DifferenceType {
    // Categorize the type of difference found
  }
}
```

### 4. Issue Detector

**File:** `src/testing/spotTesting/issueDetector.ts`

Analyzes patterns and determines if deeper investigation is needed:

```typescript
interface IssuePattern {
  type: PatternType;
  frequency: number;
  severity: IssueSeverity;
  description: string;
  sampleCommands: string[];
}

enum PatternType {
  MESSAGE_INCONSISTENCY = 'message_inconsistency',
  STATE_DIVERGENCE = 'state_divergence',
  PARSER_DIFFERENCE = 'parser_difference',
  OBJECT_BEHAVIOR = 'object_behavior'
}

enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

class IssueDetector {
  analyzeIssues(differences: CommandDifference[]): IssueAnalysis {
    // Detect patterns and assess severity
  }
  
  shouldRecommendDeepAnalysis(analysis: IssueAnalysis): boolean {
    // Determine if comprehensive testing is needed
  }
  
  generateRecommendations(analysis: IssueAnalysis): string[] {
    // Provide actionable recommendations
  }
}
```

## Data Models

### Command Generation Models

```typescript
interface GameContext {
  currentLocation: string;
  visibleObjects: string[];
  inventory: string[];
  availableDirections: string[];
  gameFlags: Map<string, boolean>;
}

interface CommandTemplate {
  pattern: string;
  type: CommandType;
  weight: number;
  contextRequirements: ContextRequirement[];
}

interface ContextRequirement {
  type: 'object_present' | 'location_type' | 'inventory_item' | 'flag_set';
  value: string;
  required: boolean;
}
```

### Validation Models

```typescript
interface SpotTestMetrics {
  commandsExecuted: number;
  differencesFound: number;
  parityPercentage: number;
  averageResponseTime: number;
  issuesByType: Map<DifferenceType, number>;
}

interface RecommendationThresholds {
  minDifferencesForDeepAnalysis: number;
  maxParityForConcern: number;
  criticalIssueThreshold: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Command Generation Validity and Context Awareness
*For any* generated random command in any game state, the command SHALL be syntactically valid, use only valid object names and directions from the current context, and be appropriate for the current game situation.
**Validates: Requirements 1.1, 1.3, 1.4, 1.5**

### Property 2: Comprehensive Command Coverage and Weighting
*For any* large set of generated commands, all major verb categories SHALL be represented with common player actions weighted more heavily than rare ones, and logical command flow SHALL be maintained.
**Validates: Requirements 1.2, 3.1, 3.5**

### Property 3: Contextual Command Intelligence
*For any* game state with specific areas and available objects, the generated commands SHALL prefer contextually relevant actions and include object interaction commands when objects are present, while avoiding game-ending commands in normal testing.
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 4: Validation Accuracy and Performance
*For any* spot test execution with configured parameters, the system SHALL execute exactly the specified number of commands, complete within 30 seconds for typical runs, and use identical normalization as comprehensive tests.
**Validates: Requirements 2.1, 2.2, 2.4**

### Property 5: Issue Detection and Categorization
*For any* differences detected during testing, the system SHALL accurately calculate mismatch percentages, categorize issues by type, and provide clear recommendations for deeper investigation with appropriate pattern flagging across multiple runs.
**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 6: Configuration Flexibility and Reproducibility
*For any* test configuration including command count, random seed, focus areas, and testing modes, the system SHALL respect all settings, produce identical results for the same seed, and support automated pass/fail thresholds for CI/CD integration.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

| Error Condition | Response | Recovery Strategy |
|-----------------|----------|-------------------|
| Command generation failure | Skip invalid command, continue with next | Generate alternative command |
| Z-Machine execution timeout | Mark as execution failure | Retry with shorter timeout |
| TypeScript execution error | Log error, continue testing | Report as potential issue |
| Validation system failure | Abort spot test gracefully | Provide diagnostic information |
| Configuration invalid | Reject with clear error message | Suggest valid configuration |

## Testing Strategy

### Unit Testing
- **Command Generator Tests:** Validate generated commands are syntactically correct
- **Validator Tests:** Ensure quick validation matches comprehensive validation
- **Issue Detector Tests:** Verify pattern detection and severity assessment
- **Configuration Tests:** Test parameter validation and edge cases

### Integration Testing
- **End-to-End Spot Tests:** Full spot test execution with known scenarios
- **Performance Tests:** Validate execution time requirements
- **Comparison Tests:** Ensure spot test results align with comprehensive tests
- **Regression Tests:** Verify spot tests catch known parity issues

### Property-Based Testing
- **Command Generation Properties:** Generate thousands of commands, verify all are valid
- **Validation Consistency Properties:** Ensure consistent results across multiple runs with same seed
- **Coverage Properties:** Verify command generation covers all required categories
- **Performance Properties:** Ensure execution time remains within bounds

## Implementation Strategy

### Phase 1: Core Command Generation
1. **Basic Command Generator**
   - Implement simple random command generation
   - Support basic movement, examination, and object interaction
   - Add context awareness for current game state

2. **Command Templates**
   - Create template system for different command types
   - Implement weighted selection based on command frequency
   - Add validation for contextual appropriateness

### Phase 2: Validation and Execution
1. **Spot Test Runner**
   - Implement test execution coordination
   - Add support for both TypeScript and Z-Machine execution
   - Create result comparison and analysis

2. **Quick Validator**
   - Implement fast parity validation
   - Ensure consistency with comprehensive test normalization
   - Add difference classification and severity assessment

### Phase 3: Intelligence and Reporting
1. **Issue Detection**
   - Implement pattern detection for common issues
   - Add recommendation system for deeper analysis
   - Create clear reporting and actionable feedback

2. **Advanced Features**
   - Add configurable test parameters
   - Implement focus areas and command type filtering
   - Add CI/CD integration support

### CLI Interface Design

```bash
# Basic spot test
npx tsx scripts/spot-test-parity.ts

# Quick mode (fewer commands, faster execution)
npx tsx scripts/spot-test-parity.ts --quick

# Thorough mode (more commands, comprehensive)
npx tsx scripts/spot-test-parity.ts --thorough --commands 200

# Focused testing
npx tsx scripts/spot-test-parity.ts --focus-area puzzles --commands 100

# Reproducible testing
npx tsx scripts/spot-test-parity.ts --seed 12345 --commands 50

# CI/CD mode
npx tsx scripts/spot-test-parity.ts --ci --threshold 95
```

### Performance Targets

- **Quick Mode:** Complete in under 15 seconds with 25-50 commands
- **Standard Mode:** Complete in under 30 seconds with 50-100 commands  
- **Thorough Mode:** Complete in under 60 seconds with 100-200 commands
- **Memory Usage:** Keep memory footprint minimal for CI/CD environments

## Success Criteria

The random parity spot testing system will be considered successful when:

- **Fast Execution:** Completes standard spot tests in under 30 seconds
- **Effective Detection:** Catches parity issues that would be found in comprehensive tests
- **Low False Positives:** Minimizes noise from minor, acceptable differences
- **Clear Reporting:** Provides actionable feedback on whether deeper investigation is needed
- **Easy Integration:** Simple to run in development workflow and CI/CD pipelines
- **Configurable:** Supports different testing intensities based on needs

This system will provide developers with a quick, reliable way to validate parity without the overhead of comprehensive testing, enabling more frequent validation and early detection of potential issues.