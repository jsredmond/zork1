# Design Document: Behavioral Parity Verification

## Overview

This design outlines the systematic approach to achieve 100% confidence in behavioral parity between the original Zork I and the TypeScript rewrite. The approach uses exhaustive transcript comparison, comprehensive puzzle verification, daemon timing validation, and automated testing to identify and eliminate all behavioral differences.

## Architecture

### Three-Phase Approach

```
Phase 1: Transcript Creation → Phase 2: Comparison & Verification → Phase 3: Fix & Validate
```

Each phase builds on the previous, with continuous validation to ensure no regressions.

## Components and Interfaces

### Transcript Management System

```typescript
interface ReferenceTranscript {
  id: string;
  name: string;
  description: string;
  category: 'opening' | 'puzzle' | 'npc' | 'combat' | 'edge-case' | 'playthrough';
  priority: 'critical' | 'high' | 'medium' | 'low';
  entries: TranscriptEntry[];
  metadata: {
    created: Date;
    source: 'original-game' | 'documented';
    verified: boolean;
  };
}

interface TranscriptEntry {
  command: string;
  expectedOutput: string;
  notes?: string;
  stateChecks?: StateCheck[];
}

interface StateCheck {
  type: 'flag' | 'object' | 'room' | 'inventory' | 'score';
  target: string;
  expectedValue: any;
}
```

### Comparison Engine

```typescript
interface ComparisonEngine {
  compareTranscript(transcript: ReferenceTranscript): ComparisonResult;
  calculateSimilarity(expected: string, actual: string): number;
  identifyDifferences(expected: string, actual: string): Difference[];
  generateReport(results: ComparisonResult[]): VerificationReport;
}

interface ComparisonResult {
  transcriptId: string;
  passed: boolean;
  totalCommands: number;
  matchedCommands: number;
  averageSimilarity: number;
  differences: Difference[];
  executionTime: number;
}

interface Difference {
  commandIndex: number;
  command: string;
  expected: string;
  actual: string;
  similarity: number;
  category: 'text' | 'state' | 'error';
  severity: 'critical' | 'major' | 'minor';
}
```

### Puzzle Verification System

```typescript
interface PuzzleVerification {
  puzzleId: string;
  name: string;
  solutionSteps: PuzzleStep[];
  alternativeSolutions?: PuzzleStep[][];
  failureConditions: FailureCondition[];
}

interface PuzzleStep {
  stepNumber: number;
  command: string;
  expectedOutput: string;
  stateChanges: StateChange[];
  optional: boolean;
}

interface StateChange {
  type: 'flag' | 'object' | 'room';
  target: string;
  before: any;
  after: any;
}

interface FailureCondition {
  description: string;
  commands: string[];
  expectedBehavior: string;
}
```

## Data Models

### Transcript Categories and Priorities

**Critical Priority (Must Pass - 100%)**
- Opening sequence (mailbox, leaflet)
- Major puzzle solutions (15 puzzles)
- Game completion sequence
- Core navigation

**High Priority (Should Pass - 95%+)**
- NPC interactions (thief, troll, cyclops, bat)
- Combat sequences
- Treasure collection
- Save/restore functionality

**Medium Priority (Should Pass - 90%+)**
- Edge cases
- Error messages
- Unusual command sequences
- Alternative puzzle solutions

**Low Priority (Nice to Pass - 85%+)**
- Flavor text variations
- Rare scenarios
- Easter eggs

### Transcript Library Structure

```
.kiro/transcripts/
├── critical/
│   ├── 01-opening-sequence.json
│   ├── 02-mailbox-puzzle.json
│   ├── 03-trap-door.json
│   ├── 04-lamp-darkness.json
│   └── ...
├── high/
│   ├── 20-thief-encounter.json
│   ├── 21-troll-combat.json
│   ├── 22-cyclops-puzzle.json
│   └── ...
├── medium/
│   ├── 40-edge-cases.json
│   ├── 41-error-messages.json
│   └── ...
└── low/
    ├── 60-flavor-text.json
    └── ...
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Transcript consistency
*For any* reference transcript, executing the same command sequence in TypeScript SHALL produce output identical to the original (allowing only whitespace normalization)
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 2: Puzzle solution equivalence
*For any* puzzle solution path, executing the steps in TypeScript SHALL result in the same puzzle state as the original
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: NPC behavior consistency
*For any* NPC interaction sequence, the NPC behavior in TypeScript SHALL match the original behavior exactly, including movement, combat, and timing
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 4: State transition equivalence
*For any* state-changing action, the resulting game state in TypeScript SHALL match the original game state exactly, including all flags, object properties, and locations
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

### Property 5: Error handling consistency
*For any* invalid command or error condition, the error message in TypeScript SHALL match the original
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 6: Playthrough completability
*For any* valid playthrough sequence, the TypeScript game SHALL be completable with all treasures collectible and behavior matching original exactly
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 7: Daemon timing equivalence
*For any* daemon-triggered event, the timing and effects SHALL match the original exactly
**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

### Property 8: Exhaustive coverage
*For all* game scenarios, there exists a reference transcript that verifies the behavior
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

## Error Handling

### Comparison Failures

1. **Text Mismatch**
   - Solution: Analyze difference type (whitespace, wording, missing content)
   - Update TypeScript to match original
   - Re-run comparison

2. **State Mismatch**
   - Solution: Verify state transition logic
   - Check flag/object updates
   - Fix state management code

3. **Behavioral Difference**
   - Solution: Trace execution in both games
   - Identify divergence point
   - Update TypeScript logic

4. **Timing Difference**
   - Solution: Verify daemon timing
   - Check turn counter
   - Adjust timing logic

## Testing Strategy

### Transcript-Based Testing

```bash
# Run all transcripts
npm run verify:transcripts

# Run specific category
npm run verify:transcripts -- --category critical

# Run specific transcript
npm run verify:transcripts -- --id 01-opening-sequence

# Generate report
npm run verify:transcripts -- --report
```

### Puzzle Verification Testing

```bash
# Verify all puzzles
npm run verify:puzzles

# Verify specific puzzle
npm run verify:puzzles -- --puzzle mailbox

# Verify puzzle failures
npm run verify:puzzles -- --failures
```

### Integration with CI/CD

```yaml
# .github/workflows/behavioral-verification.yml
name: Behavioral Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run critical transcripts
        run: npm run verify:transcripts -- --category critical
      - name: Run puzzle verification
        run: npm run verify:puzzles
      - name: Generate report
        run: npm run verify:report
```

## Implementation Phases

### Phase 1: Transcript Creation (Week 1-3)

**Goal**: Create 100+ reference transcripts covering all scenarios

**Tasks**:
1. Set up original game environment
2. Play through all scenarios systematically
3. Create JSON transcript files for every puzzle, NPC, room area
4. Organize by category and priority
5. Document any special conditions
6. Verify transcript completeness

**Deliverables**:
- 100+ transcript files
- Complete scenario coverage map
- Transcript creation guide
- Transcript validation tool

### Phase 2: Comparison Infrastructure (Week 2-3)

**Goal**: Build automated comparison system

**Tasks**:
1. Enhance `compare-transcript.ts` tool
2. Add batch processing
3. Implement similarity algorithms
4. Create reporting system
5. Add CI/CD integration

**Deliverables**:
- Enhanced comparison tool
- Batch runner
- HTML report generator
- CI/CD workflow

### Phase 3: Initial Comparison (Week 3)

**Goal**: Run all transcripts and identify differences

**Tasks**:
1. Run all critical transcripts
2. Run all high-priority transcripts
3. Categorize differences
4. Prioritize fixes
5. Document findings

**Deliverables**:
- Initial comparison report
- Difference categorization
- Fix priority list

### Phase 4: Fix Critical Differences (Week 4)

**Goal**: Fix all critical behavioral differences

**Tasks**:
1. Fix puzzle solution differences
2. Fix opening sequence differences
3. Fix navigation differences
4. Verify fixes don't cause regressions
5. Re-run critical transcripts

**Deliverables**:
- Fixed critical issues
- Updated code
- Regression test results

### Phase 5: Fix High-Priority Differences (Week 5)

**Goal**: Fix NPC and combat differences

**Tasks**:
1. Fix NPC behavior differences
2. Fix combat differences
3. Fix treasure collection differences
4. Verify fixes
5. Re-run high-priority transcripts

**Deliverables**:
- Fixed high-priority issues
- Updated code
- Verification results

### Phase 6: Exhaustive Verification (Week 7-8)

**Goal**: Achieve 100% confidence

**Tasks**:
1. Run all 100+ transcripts
2. Verify all puzzles with multiple solution paths
3. Complete multiple full playthroughs
4. Verify daemon timing with dedicated tests
5. Test every room, every major object
6. Eliminate ALL remaining differences
7. Generate final report

**Deliverables**:
- Final verification report
- 100% confidence achieved
- Zero behavioral differences
- Complete evidence documentation

## Success Metrics

### Overall Metrics

- **Transcript Pass Rate**: 100% of transcripts pass with 98%+ similarity (allowing only whitespace variations)
- **Puzzle Verification**: 100% of puzzles solve identically
- **NPC Behavior**: 100% of NPC interactions match original exactly
- **State Transitions**: 100% of state changes match original exactly
- **Daemon Timing**: 100% of daemon events match original timing
- **Overall Confidence**: 100%

### Per-Category Metrics

| Category | Target Pass Rate | Target Similarity | Required |
|----------|------------------|-------------------|----------|
| Critical | 100% | 100% | Yes |
| High | 100% | 98%+ | Yes |
| Medium | 100% | 98%+ | Yes |
| Low | 98%+ | 95%+ | Yes |

### Minimum Coverage Requirements

- **Minimum Transcripts**: 100 (up from 30)
- **Puzzle Coverage**: 100% (all 15+ puzzles)
- **Room Coverage**: 100% (all 110 rooms visited)
- **Object Coverage**: 90%+ (all major objects tested)
- **NPC Coverage**: 100% (all 4 NPCs fully tested)
- **Command Coverage**: 90%+ (all major verbs tested)

## Implementation Guidelines

### Creating Reference Transcripts

1. **Play Original Game**
   - Use Frotz or similar interpreter
   - Play scenario carefully
   - Record every command and output

2. **Format as JSON**
   ```json
   {
     "id": "01-opening-sequence",
     "name": "Opening Sequence",
     "description": "Initial game start and mailbox puzzle",
     "category": "critical",
     "priority": "critical",
     "entries": [
       {
         "command": "look",
         "expectedOutput": "West of House\n..."
       }
     ]
   }
   ```

3. **Validate Transcript**
   - Verify JSON is valid
   - Check all commands are present
   - Verify output is complete

### Running Comparisons

1. **Single Transcript**
   ```bash
   npx tsx scripts/compare-transcript.ts .kiro/transcripts/critical/01-opening-sequence.json
   ```

2. **Batch Processing**
   ```bash
   npx tsx scripts/verify-all-transcripts.ts --category critical
   ```

3. **Review Results**
   - Check pass/fail status
   - Review differences
   - Prioritize fixes

### Fixing Differences

1. **Analyze Difference**
   - Identify root cause
   - Check ZIL source if needed
   - Determine correct behavior

2. **Update Code**
   - Make minimal changes
   - Add comments explaining fix
   - Reference transcript ID

3. **Verify Fix**
   - Re-run transcript
   - Check for regressions
   - Run full test suite

## Risk Mitigation

### High-Risk Areas

1. **Transcript Accuracy** - Transcripts may not perfectly capture original
   - Mitigation: Double-check critical transcripts, use multiple sources

2. **Similarity Threshold** - 95% may be too strict or too lenient
   - Mitigation: Adjust threshold based on results, manual review of borderline cases

3. **Time Investment** - May take longer than 6 weeks
   - Mitigation: Prioritize critical transcripts, accept 90% confidence if needed

4. **Unfixable Differences** - Some differences may be architectural
   - Mitigation: Document as intentional deviations, assess impact

## Timeline Estimate

- **Week 1-3**: Exhaustive transcript creation (100+ transcripts)
- **Week 3-4**: Enhanced comparison infrastructure with state verification
- **Week 4**: Initial comparison and comprehensive analysis
- **Week 5**: Fix all critical differences
- **Week 6**: Fix all remaining differences
- **Week 7**: Daemon timing verification and final fixes
- **Week 8**: Exhaustive verification and 100% confidence validation

**Total**: 8 weeks for 100% confidence

## Conclusion

Achieving 100% behavioral parity confidence requires exhaustive transcript comparison, comprehensive puzzle verification, daemon timing validation, and systematic elimination of all differences. The approach is methodical, measurable, and achievable within 8 weeks. The result will be definitive proof that the TypeScript rewrite behaves identically to the original Zork I in all testable scenarios, with complete documentation of the verification process.
