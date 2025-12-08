# Transcript Verification Guide

This guide explains how to use the enhanced transcript comparison tools for behavioral parity verification.

## Tools Overview

### 1. compare-transcript.ts
Single transcript comparison with detailed difference reporting.

**Usage:**
```bash
# Compare a single transcript
npx tsx scripts/compare-transcript.ts .kiro/transcripts/critical/01-opening-sequence.json

# Run example transcript
npx tsx scripts/compare-transcript.ts --example

# Interactive mode
npx tsx scripts/compare-transcript.ts --interactive

# Show help
npx tsx scripts/compare-transcript.ts --help
```

**Features:**
- Character-by-character comparison after whitespace normalization
- Exact match detection (100% match after normalization)
- State verification support (flags, objects, rooms, inventory, score)
- Detailed difference reporting with side-by-side comparison
- Severity classification (critical, major, minor)
- Difference categorization (whitespace, case, punctuation, content)

### 2. verify-all-transcripts.ts
Batch processing of multiple transcripts with summary reporting.

**Usage:**
```bash
# Verify all transcripts
npx tsx scripts/verify-all-transcripts.ts

# Filter by priority
npx tsx scripts/verify-all-transcripts.ts --priority critical

# Filter by category
npx tsx scripts/verify-all-transcripts.ts --category puzzle

# Save summary report to JSON
npx tsx scripts/verify-all-transcripts.ts --report

# Custom transcript directory
npx tsx scripts/verify-all-transcripts.ts --dir path/to/transcripts

# Show help
npx tsx scripts/verify-all-transcripts.ts --help
```

**Features:**
- Process multiple transcripts in batch
- Filter by category (opening, puzzle, combat, etc.)
- Filter by priority (critical, high, medium, low)
- Generate summary statistics by category and priority
- Calculate overall pass rates and similarity scores
- Save results to JSON for further processing
- Detailed console output with progress tracking

### 3. generate-verification-report.ts
Generate visual HTML reports with charts and statistics.

**Usage:**
```bash
# Generate report from existing summary JSON
npx tsx scripts/generate-verification-report.ts .kiro/testing/transcript-verification-summary.json

# Run verification and generate report in one step
npx tsx scripts/generate-verification-report.ts --run-and-generate

# Show help
npx tsx scripts/generate-verification-report.ts --help
```

**Features:**
- Beautiful HTML report with styling and charts
- Summary statistics with visual progress bars
- Results breakdown by category and priority
- Detailed difference views with side-by-side comparison
- Color-coded severity indicators
- Responsive design for different screen sizes
- Export to `.kiro/testing/verification-report.html`

## Transcript Format

Transcripts are JSON files with the following structure:

```json
{
  "id": "01-opening-sequence",
  "name": "Opening Sequence",
  "description": "Initial game start and mailbox puzzle",
  "category": "opening",
  "priority": "critical",
  "entries": [
    {
      "command": "look",
      "expectedOutput": "West of House\nYou are standing...",
      "notes": "Initial room description",
      "stateChecks": [
        {
          "type": "room",
          "target": "currentRoom",
          "expectedValue": "west-of-house"
        }
      ]
    }
  ],
  "metadata": {
    "created": "2024-12-07T00:00:00.000Z",
    "source": "original-game",
    "verified": false
  }
}
```

### State Checks

State checks verify game state after command execution:

- **flag**: Check global flag values
- **object**: Check object properties or locations
- **room**: Check current room
- **inventory**: Check player inventory
- **score**: Check game score

Example:
```json
{
  "command": "take lamp",
  "expectedOutput": "Taken.",
  "stateChecks": [
    {
      "type": "inventory",
      "target": "lamp",
      "expectedValue": true
    },
    {
      "type": "object",
      "target": "lamp",
      "expectedValue": { "location": "inventory" }
    }
  ]
}
```

## Workflow

### 1. Create Reference Transcripts
Record gameplay from the original Zork I and create JSON transcripts.

### 2. Run Single Transcript Comparison
Test individual transcripts during development:
```bash
npx tsx scripts/compare-transcript.ts .kiro/transcripts/critical/01-opening-sequence.json
```

### 3. Run Batch Verification
Verify all transcripts in a category:
```bash
npx tsx scripts/verify-all-transcripts.ts --priority critical --report
```

### 4. Generate HTML Report
Create visual report for review:
```bash
npx tsx scripts/generate-verification-report.ts --run-and-generate
```

### 5. Review Results
Open the HTML report in your browser:
```bash
open .kiro/testing/verification-report.html
```

### 6. Fix Differences
Address behavioral differences identified in the report.

### 7. Re-verify
Run verification again to confirm fixes:
```bash
npx tsx scripts/verify-all-transcripts.ts --priority critical
```

## Success Criteria

### Target Metrics
- **Critical Priority**: 100% pass rate, 100% exact match
- **High Priority**: 100% pass rate, 98%+ similarity
- **Medium Priority**: 100% pass rate, 98%+ similarity
- **Low Priority**: 98%+ pass rate, 95%+ similarity

### Match Levels
- **Exact Match**: 100% character-by-character match after normalization
- **High Match**: ≥98% similarity (whitespace variations only)
- **Partial Match**: <98% similarity (content differences)

## Tips

1. **Start with Critical**: Focus on critical priority transcripts first
2. **Use State Checks**: Add state verification for important game state changes
3. **Categorize Properly**: Use consistent categories and priorities
4. **Document Notes**: Add notes to transcript entries for context
5. **Iterate Quickly**: Use single transcript comparison during development
6. **Batch Verify**: Use batch verification for comprehensive testing
7. **Review Reports**: Use HTML reports for stakeholder communication

## Troubleshooting

### Low Similarity Scores
- Check for missing game features
- Verify message text matches original
- Review parser implementation
- Check action handlers

### State Verification Failures
- Verify state management logic
- Check flag updates
- Review object property changes
- Validate room transitions

### Performance Issues
- Reduce transcript count for quick tests
- Use category/priority filters
- Run critical transcripts only during development
- Save full verification for CI/CD

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
- name: Verify Behavioral Parity
  run: |
    npx tsx scripts/verify-all-transcripts.ts --priority critical
    npx tsx scripts/generate-verification-report.ts --run-and-generate
```

## Next Steps

1. Create 100+ reference transcripts (Phase 1)
2. Run initial comparison (Phase 3)
3. Fix critical differences (Phase 4)
4. Fix remaining differences (Phase 5)
5. Achieve 100% confidence (Phase 6-7)

See `tasks.md` for the complete implementation plan.
