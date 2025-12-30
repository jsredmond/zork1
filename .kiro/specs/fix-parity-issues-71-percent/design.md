# Design Document: Fix Parity Issues - 71% to 95%+ Target

## Architecture Overview

This design addresses the systematic resolution of 57 parity differences identified through thorough spot testing, focusing on the five critical categories that prevent the TypeScript implementation from achieving behavioral equivalence with the Z-Machine.

## Problem Analysis

### Root Cause Categories

#### 1. Timing Differences (32/57 occurrences - 56% of issues)
**Primary Issue:** Status bar display inconsistencies
- TypeScript responses lack room name, score, and move count
- Z-Machine includes status information in every response
- Missing synchronization between game state and display

#### 2. Object Behavior (11/57 occurrences - 19% of issues)  
**Primary Issue:** Inconsistent object interaction logic
- Different error messages for object manipulation
- Inconsistent visibility checking
- Wrong context-sensitive responses

#### 3. Message Inconsistency (10/57 occurrences - 18% of issues)
**Primary Issue:** Error message selection logic differs
- "You are empty-handed" vs "You don't have the X"
- Different parser error responses
- Inconsistent article usage

#### 4. Parser Differences (2/57 occurrences - 4% of issues)
**Primary Issue:** Command interpretation varies
- Incomplete command handling differs
- Verb recognition inconsistencies

#### 5. State Divergence (2/57 occurrences - 4% of issues)
**Primary Issue:** Game state synchronization
- Object location tracking differs
- State validation inconsistencies

## Design Solutions

### Solution 1: Status Display Synchronization System

#### Current Problem
```typescript
// TypeScript Output (Missing Status)
"You are empty-handed."

// Z-Machine Output (With Status)
"Clearing                                         Score: 0        Moves: 32\n\nYou are empty-handed."
```

#### Proposed Solution
```typescript
interface StatusDisplayManager {
  formatResponse(message: string, gameState: GameState): string;
  shouldIncludeStatus(commandType: CommandType): boolean;
  formatStatusLine(room: string, score: number, moves: number): string;
}

class ZMachineStatusDisplay implements StatusDisplayManager {
  formatResponse(message: string, gameState: GameState): string {
    const statusLine = this.formatStatusLine(
      gameState.currentRoom.name,
      gameState.score,
      gameState.moves
    );
    return `${statusLine}\n\n${message}`;
  }
  
  formatStatusLine(room: string, score: number, moves: number): string {
    const paddedRoom = room.padEnd(45);
    return `${paddedRoom}Score: ${score}        Moves: ${moves}`;
  }
}
```

#### Implementation Strategy
1. **Create StatusDisplayManager** - Centralized status formatting
2. **Integrate with Command Executor** - Add status to all responses
3. **Configure Display Rules** - Determine when status is shown
4. **Validate Format Matching** - Ensure exact Z-Machine formatting

### Solution 2: Enhanced Parser Error Handling

#### Current Problem
```typescript
// TypeScript: Generic error
"I don't know how to search."

// Z-Machine: Context-aware error  
"What do you want to search?"
```

#### Proposed Solution
```typescript
interface ParserErrorHandler {
  handleIncompleteCommand(verb: string, context: ParseContext): string;
  handleUnknownVerb(input: string): string;
  handleMalformedCommand(input: string): string;
}

class ZMachineParserErrors implements ParserErrorHandler {
  private verbRequirements = new Map([
    ['search', { requiresObject: true, message: 'What do you want to search?' }],
    ['drop', { requiresObject: true, message: 'There seems to be a noun missing in that sentence!' }],
    ['take', { requiresObject: true, message: 'What do you want to take?' }]
  ]);
  
  handleIncompleteCommand(verb: string, context: ParseContext): string {
    const requirement = this.verbRequirements.get(verb);
    if (requirement?.requiresObject && !context.directObject) {
      return requirement.message;
    }
    return this.getGenericError(verb);
  }
}
```

#### Implementation Strategy
1. **Map Verb Requirements** - Define object requirements per verb
2. **Context-Aware Errors** - Generate appropriate error messages
3. **Malformed Command Detection** - Handle syntax errors correctly
4. **Error Message Database** - Centralized error text management

### Solution 3: Object Interaction Consistency System

#### Current Problem
```typescript
// TypeScript: Generic response
"You are empty-handed."

// Z-Machine: Context-specific response
"You don't have the forest."
```

#### Proposed Solution
```typescript
interface ObjectInteractionManager {
  validateObjectAction(action: string, object: string, gameState: GameState): ActionResult;
  generateErrorMessage(errorType: ObjectErrorType, context: ObjectContext): string;
  checkObjectVisibility(object: string, location: Location): boolean;
}

class ZMachineObjectInteraction implements ObjectInteractionManager {
  generateErrorMessage(errorType: ObjectErrorType, context: ObjectContext): string {
    switch (errorType) {
      case ObjectErrorType.NOT_POSSESSED:
        if (context.impliedObject) {
          return `You don't have the ${context.impliedObject}.`;
        }
        return "You are empty-handed.";
      
      case ObjectErrorType.NOT_VISIBLE:
        return `You can't see any ${context.object} here!`;
      
      case ObjectErrorType.CANNOT_MANIPULATE:
        return `You can't do that to the ${context.object}.`;
    }
  }
}
```

#### Implementation Strategy
1. **Object Context Analysis** - Determine implied objects from commands
2. **Error Type Classification** - Categorize different error conditions
3. **Context-Sensitive Messages** - Generate appropriate responses
4. **Visibility Logic** - Implement proper object visibility checking

### Solution 4: Message Consistency Framework

#### Current Problem
```typescript
// Inconsistent error handling across different commands
"put  in forest" → "You can't see any forest here!"  // TypeScript
"put  in forest" → "That sentence isn't one I recognize."  // Z-Machine
```

#### Proposed Solution
```typescript
interface MessageConsistencyManager {
  standardizeMessage(messageType: MessageType, context: MessageContext): string;
  validateMessageFormat(message: string): boolean;
  getCanonicalMessage(situation: GameSituation): string;
}

class ZMachineMessageStandards implements MessageConsistencyManager {
  private messageTemplates = new Map([
    [MessageType.MALFORMED_COMMAND, "That sentence isn't one I recognize."],
    [MessageType.MISSING_OBJECT, "There seems to be a noun missing in that sentence!"],
    [MessageType.OBJECT_NOT_HERE, "You can't see any {object} here!"],
    [MessageType.DONT_HAVE_OBJECT, "You don't have the {object}."]
  ]);
  
  standardizeMessage(messageType: MessageType, context: MessageContext): string {
    const template = this.messageTemplates.get(messageType);
    return this.interpolateTemplate(template, context);
  }
}
```

#### Implementation Strategy
1. **Message Template System** - Centralized message definitions
2. **Context Interpolation** - Dynamic message generation
3. **Consistency Validation** - Ensure uniform message formatting
4. **Error Classification** - Proper categorization of error types

### Solution 5: State Synchronization Architecture

#### Current Problem
```typescript
// State divergence between TypeScript and Z-Machine
// Different object location tracking
// Inconsistent inventory management
```

#### Proposed Solution
```typescript
interface StateSynchronizationManager {
  validateGameState(state: GameState): ValidationResult;
  synchronizeObjectLocations(state: GameState): void;
  ensureInventoryConsistency(state: GameState): void;
}

class ZMachineStateSync implements StateSynchronizationManager {
  validateGameState(state: GameState): ValidationResult {
    const issues: StateIssue[] = [];
    
    // Validate object locations
    for (const object of state.objects) {
      if (!this.isValidLocation(object.location)) {
        issues.push(new StateIssue('INVALID_LOCATION', object.id));
      }
    }
    
    // Validate inventory consistency
    const inventoryObjects = state.objects.filter(obj => obj.location === 'PLAYER');
    if (inventoryObjects.length !== state.inventory.length) {
      issues.push(new StateIssue('INVENTORY_MISMATCH'));
    }
    
    return new ValidationResult(issues);
  }
}
```

#### Implementation Strategy
1. **State Validation Framework** - Comprehensive state checking
2. **Object Location Tracking** - Consistent location management
3. **Inventory Synchronization** - Proper inventory state handling
4. **State Integrity Monitoring** - Continuous validation

## Implementation Architecture

### Core Components

#### 1. Parity Enhancement Engine
```typescript
class ParityEnhancementEngine {
  private statusManager: StatusDisplayManager;
  private parserErrorHandler: ParserErrorHandler;
  private objectManager: ObjectInteractionManager;
  private messageManager: MessageConsistencyManager;
  private stateSync: StateSynchronizationManager;
  
  async enhanceCommand(command: string, gameState: GameState): Promise<EnhancedResponse> {
    // Apply all parity enhancements
    const response = await this.processCommand(command, gameState);
    const enhancedResponse = this.statusManager.formatResponse(response.message, gameState);
    
    // Validate state consistency
    const validation = this.stateSync.validateGameState(gameState);
    if (!validation.isValid) {
      throw new StateInconsistencyError(validation.issues);
    }
    
    return new EnhancedResponse(enhancedResponse, gameState);
  }
}
```

#### 2. Parity Validation Framework
```typescript
class ParityValidator {
  async validateParity(command: string): Promise<ParityResult> {
    const tsResult = await this.runTypeScriptCommand(command);
    const zmResult = await this.runZMachineCommand(command);
    
    const comparison = this.compareResults(tsResult, zmResult);
    return new ParityResult(comparison.matches, comparison.differences);
  }
  
  private compareResults(ts: CommandResult, zm: CommandResult): ComparisonResult {
    // Detailed comparison logic
    const textMatch = this.normalizeText(ts.output) === this.normalizeText(zm.output);
    const stateMatch = this.compareGameStates(ts.state, zm.state);
    
    return new ComparisonResult(textMatch && stateMatch, this.findDifferences(ts, zm));
  }
}
```

### Integration Points

#### 1. Command Executor Integration
```typescript
// Modify existing command executor to use parity enhancements
class EnhancedCommandExecutor extends CommandExecutor {
  constructor(private parityEngine: ParityEnhancementEngine) {
    super();
  }
  
  async executeCommand(command: string, gameState: GameState): Promise<CommandResult> {
    const enhancedResponse = await this.parityEngine.enhanceCommand(command, gameState);
    return new CommandResult(enhancedResponse.message, enhancedResponse.state);
  }
}
```

#### 2. Testing Framework Integration
```typescript
// Enhanced testing with parity validation
describe('Parity Enhancement Tests', () => {
  let validator: ParityValidator;
  
  beforeEach(() => {
    validator = new ParityValidator();
  });
  
  it('should achieve 95%+ parity on spot tests', async () => {
    const results = await validator.runSpotTest(200);
    expect(results.parityScore).toBeGreaterThan(95);
    expect(results.differences.length).toBeLessThan(10);
  });
});
```

## Data Structures

### Enhanced Response Format
```typescript
interface EnhancedResponse {
  message: string;           // Formatted response with status
  gameState: GameState;      // Updated game state
  parityMetrics: ParityMetrics; // Parity validation data
}

interface ParityMetrics {
  statusIncluded: boolean;
  messageStandardized: boolean;
  stateValidated: boolean;
  errorHandlingCorrect: boolean;
}
```

### Difference Analysis
```typescript
interface ParityDifference {
  commandIndex: number;
  command: string;
  tsOutput: string;
  zmOutput: string;
  differenceType: DifferenceType;
  severity: SeverityLevel;
  rootCause: string;
  fixRecommendation: string;
}

enum DifferenceType {
  TIMING_DIFFERENCE = 'timing_difference',
  OBJECT_BEHAVIOR = 'object_behavior',
  MESSAGE_INCONSISTENCY = 'message_inconsistency',
  PARSER_DIFFERENCE = 'parser_difference',
  STATE_DIVERGENCE = 'state_divergence'
}
```

## Testing Strategy

### 1. Unit Testing
- Test each parity enhancement component independently
- Validate message formatting and error handling
- Ensure state synchronization works correctly

### 2. Integration Testing  
- Test complete command processing pipeline
- Validate parity enhancements work together
- Ensure no regression in existing functionality

### 3. Parity Validation Testing
- Run comprehensive spot tests with enhancements
- Compare results against Z-Machine baseline
- Validate 95%+ parity achievement

### 4. Regression Testing
- Ensure existing test sequences still pass
- Validate no performance degradation
- Confirm code quality standards maintained

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading** - Load parity components only when needed
2. **Caching** - Cache formatted messages and status displays
3. **Efficient Comparison** - Optimize parity validation algorithms
4. **Memory Management** - Minimize memory overhead of enhancements

### Performance Targets
- **Response Time** - No increase over 10ms per command
- **Memory Usage** - Less than 5% increase in memory footprint
- **Startup Time** - No significant impact on game initialization
- **Throughput** - Maintain current command processing rate

## Risk Mitigation

### Technical Risks
1. **Regression Risk** - Comprehensive testing and feature flags
2. **Performance Impact** - Careful optimization and monitoring
3. **Complexity Increase** - Clean architecture and documentation
4. **State Corruption** - Robust validation and error handling

### Implementation Risks
1. **Timeline Pressure** - Incremental implementation approach
2. **Scope Creep** - Clear requirements and boundaries
3. **Quality Compromise** - Rigorous testing and code review
4. **Integration Issues** - Careful component design and testing

## Success Metrics

### Primary Metrics
- **Parity Score** - Achieve 95%+ (from 71.5%)
- **Difference Count** - Reduce to <10 (from 57)
- **Critical Issues** - Resolve all timing and parser differences
- **Test Coverage** - Maintain >80% code coverage

### Secondary Metrics
- **Performance** - No significant degradation
- **Code Quality** - Maintain clean architecture
- **Documentation** - Complete design and implementation docs
- **Maintainability** - Clear, understandable code structure

This design provides a comprehensive approach to systematically resolving the 57 identified parity differences while maintaining code quality and preventing regression.