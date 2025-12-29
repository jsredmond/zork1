# Zork I Random Parity Spot Testing Guide

## Overview

The Random Parity Spot Testing system provides a lightweight, fast way to validate parity between the TypeScript Zork I implementation and the original Z-Machine game. Instead of running comprehensive tests that can take hours, spot testing executes a smaller set of randomly generated commands to quickly identify potential issues.

## Key Benefits

- **Fast Execution**: Complete validation in under 30 seconds
- **Intelligent Command Generation**: Context-aware random commands that cover realistic gameplay scenarios
- **Early Issue Detection**: Catch parity problems before they become major issues
- **CI/CD Integration**: Automated testing with configurable pass/fail thresholds
- **Reproducible Results**: Use seeds to reproduce specific test scenarios

## Quick Start

### Basic Usage

Run a standard spot test with default settings:

```bash
npx tsx scripts/spot-test-parity.ts
```

This will:
- Execute 50 random commands
- Complete in approximately 30 seconds
- Report parity percentage and any differences found
- Recommend deeper analysis if issues are detected

### Quick Mode (Fastest)

For rapid feedback during development:

```bash
npx tsx scripts/spot-test-parity.ts --quick
```

- Executes 25 commands
- Completes in ~15 seconds
- Ideal for frequent testing during development

### Thorough Mode (Most Comprehensive)

For more extensive validation:

```bash
npx tsx scripts/spot-test-parity.ts --thorough
```

- Executes 200 commands
- Completes in ~60 seconds
- Uses strict validation
- Recommended before releases

## Configuration Options

### Command Count

Control how many random commands to execute:

```bash
# Light testing
npx tsx scripts/spot-test-parity.ts --commands 25

# Standard testing
npx tsx scripts/spot-test-parity.ts --commands 50

# Heavy testing
npx tsx scripts/spot-test-parity.ts --commands 200
```

### Reproducible Testing

Use seeds to create reproducible test scenarios:

```bash
# Use specific seed
npx tsx scripts/spot-test-parity.ts --seed 12345

# Same seed will always generate identical commands
npx tsx scripts/spot-test-parity.ts --seed 12345 --commands 100
```

### Focus Areas

Target specific game areas for focused testing:

```bash
# Test house exploration
npx tsx scripts/spot-test-parity.ts --focus house

# Test underground areas
npx tsx scripts/spot-test-parity.ts --focus underground

# Test multiple areas
npx tsx scripts/spot-test-parity.ts --focus house,forest,underground
```

Available focus areas:
- `house` - House and immediate surroundings
- `forest` - Forest areas and outdoor locations
- `underground` - Underground maze and caverns
- `puzzles` - Puzzle-heavy areas
- `combat` - Combat scenarios
- `treasure` - Treasure-related interactions

### Command Types

Limit testing to specific command categories:

```bash
# Test only movement commands
npx tsx scripts/spot-test-parity.ts --types movement

# Test object interactions
npx tsx scripts/spot-test-parity.ts --types object_interaction

# Test multiple types
npx tsx scripts/spot-test-parity.ts --types movement,examination,inventory
```

Available command types:
- `movement` - Navigation commands (north, south, go to, etc.)
- `object_interaction` - Take, drop, put, give commands
- `examination` - Look, examine, read commands
- `inventory` - Inventory management commands
- `puzzle_action` - Puzzle-solving commands
- `communication` - Say, hello, yell commands

### Validation Settings

Control validation strictness:

```bash
# Strict validation (more sensitive to differences)
npx tsx scripts/spot-test-parity.ts --strict

# Allow game-ending commands (normally avoided)
npx tsx scripts/spot-test-parity.ts --allow-death

# Set custom pass/fail threshold
npx tsx scripts/spot-test-parity.ts --threshold 95
```

### Output Formats

Choose output format for different use cases:

```bash
# Human-readable text (default)
npx tsx scripts/spot-test-parity.ts --output text

# JSON for programmatic processing
npx tsx scripts/spot-test-parity.ts --output json

# JUnit XML for CI/CD integration
npx tsx scripts/spot-test-parity.ts --output junit
```

## Configuration Files

### Creating Configuration Files

Create a JSON configuration file for complex setups:

```json
{
  "commandCount": 100,
  "seed": 12345,
  "timeoutMs": 45000,
  "focusAreas": ["house", "underground"],
  "commandTypes": ["movement", "examination", "object_interaction"],
  "strictValidation": true,
  "passThreshold": 98,
  "verbose": true
}
```

Use the configuration file:

```bash
npx tsx scripts/spot-test-parity.ts --config spot-test.json
```

### Environment Variables

Configure via environment variables for CI/CD:

```bash
export SPOT_TEST_COMMAND_COUNT=75
export SPOT_TEST_SEED=54321
export SPOT_TEST_TIMEOUT=30000
export SPOT_TEST_PASS_THRESHOLD=95
export SPOT_TEST_VERBOSE=true

npx tsx scripts/spot-test-parity.ts
```

## CI/CD Integration

### GitHub Actions

Example workflow for automated spot testing:

```yaml
name: Spot Test Parity

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  spot-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Z-Machine interpreter
      run: sudo apt-get install -y frotz
    
    - name: Run spot test
      run: npx tsx scripts/spot-test-parity.ts --ci --threshold 95 --output junit
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: spot-test-results
        path: spot-test-results.xml
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'apt-get update && apt-get install -y frotz'
            }
        }
        
        stage('Spot Test') {
            steps {
                sh 'npx tsx scripts/spot-test-parity.ts --ci --threshold 98 --output junit'
            }
            post {
                always {
                    junit 'spot-test-results.xml'
                }
            }
        }
    }
}
```

### GitLab CI

```yaml
spot-test:
  stage: test
  image: node:18
  before_script:
    - npm ci
    - apt-get update && apt-get install -y frotz
  script:
    - npx tsx scripts/spot-test-parity.ts --ci --threshold 95 --output junit
  artifacts:
    reports:
      junit: spot-test-results.xml
    when: always
```

## Understanding Results

### Parity Score

The parity score represents the percentage of commands that produced identical results between TypeScript and Z-Machine implementations:

- **100%**: Perfect parity - all commands matched
- **95-99%**: Excellent parity - minor differences only
- **90-94%**: Good parity - some differences that may need investigation
- **85-89%**: Fair parity - multiple differences requiring attention
- **<85%**: Poor parity - significant issues requiring immediate investigation

### Issue Categories

Spot testing categorizes differences into types:

- **Message Inconsistency**: Different text output for same command
- **State Divergence**: Game state differs between implementations
- **Parser Difference**: Command parsing behaves differently
- **Object Behavior**: Object interactions produce different results
- **Timing Difference**: Timing-related behaviors differ

### Severity Levels

Each difference is assigned a severity level:

- **Low**: Minor text differences that don't affect gameplay
- **Medium**: Noticeable differences that may impact user experience
- **High**: Significant differences that affect game mechanics
- **Critical**: Major differences that break game functionality

### Recommendations

The system provides recommendations based on results:

- **✅ PASSED**: No significant issues detected
- **⚠️ ISSUES DETECTED**: Problems found, deeper analysis recommended
- **🔴 CRITICAL ISSUES**: Immediate attention required

## Advanced Usage

### Custom Test Scenarios

Create reproducible test scenarios for specific issues:

```bash
# Test specific area with known issues
npx tsx scripts/spot-test-parity.ts \
  --seed 12345 \
  --focus underground \
  --commands 100 \
  --strict

# Test parser edge cases
npx tsx scripts/spot-test-parity.ts \
  --seed 54321 \
  --types communication,puzzle_action \
  --commands 75
```

### Debugging Workflows

1. **Initial Detection**: Run quick spot test during development
2. **Issue Investigation**: Use specific seed to reproduce problems
3. **Focused Testing**: Target specific areas or command types
4. **Verification**: Run thorough test before committing changes

```bash
# 1. Quick check during development
npx tsx scripts/spot-test-parity.ts --quick

# 2. If issues found, investigate with same seed
npx tsx scripts/spot-test-parity.ts --seed [reported-seed] --verbose

# 3. Focus on problem area
npx tsx scripts/spot-test-parity.ts --focus [problem-area] --commands 100

# 4. Final verification
npx tsx scripts/spot-test-parity.ts --thorough
```

### Performance Optimization

For faster execution in resource-constrained environments:

```bash
# Minimal testing
npx tsx scripts/spot-test-parity.ts --commands 10 --timeout 10000

# Balanced testing
npx tsx scripts/spot-test-parity.ts --commands 30 --timeout 20000

# Skip non-essential validations
npx tsx scripts/spot-test-parity.ts --quick --threshold 90
```

## Troubleshooting

### Common Issues

#### Z-Machine Interpreter Not Found

```
Error: Z-Machine interpreter not available for spot testing
```

**Solution**: Install a Z-Machine interpreter:

```bash
# Ubuntu/Debian
sudo apt-get install frotz

# macOS
brew install frotz

# Windows (using Chocolatey)
choco install frotz
```

#### Timeout Errors

```
Error: Operation timed out
```

**Solutions**:
- Increase timeout: `--timeout 60000`
- Reduce command count: `--commands 25`
- Use quick mode: `--quick`

#### High Failure Rate

If spot tests consistently fail with low parity scores:

1. **Check Z-Machine Setup**: Ensure interpreter is working correctly
2. **Verify Game File**: Confirm `COMPILED/zork1.z3` is present and valid
3. **Run Comprehensive Tests**: Use full test suite to identify systematic issues
4. **Check Recent Changes**: Review recent code changes that might affect parity

#### Inconsistent Results

If results vary between runs:

1. **Use Fixed Seed**: Add `--seed 12345` for reproducible results
2. **Check System Load**: High CPU usage can affect timing
3. **Increase Timeout**: Use `--timeout 45000` for slower systems

### Performance Tuning

#### For Development

```bash
# Fast feedback loop
npx tsx scripts/spot-test-parity.ts --quick --threshold 90
```

#### For CI/CD

```bash
# Balanced speed and coverage
npx tsx scripts/spot-test-parity.ts --ci --commands 75 --threshold 95
```

#### For Release Validation

```bash
# Comprehensive testing
npx tsx scripts/spot-test-parity.ts --thorough --strict --threshold 98
```

## Best Practices

### Development Workflow

1. **Frequent Spot Testing**: Run quick spot tests during development
2. **Seed Documentation**: Record seeds that expose specific issues
3. **Incremental Validation**: Test changes with focused command types
4. **Pre-commit Validation**: Run standard spot test before committing

### CI/CD Integration

1. **Appropriate Thresholds**: Set realistic pass/fail thresholds (95-98%)
2. **Timeout Management**: Allow sufficient time for test completion
3. **Result Archiving**: Save test results for trend analysis
4. **Failure Investigation**: Provide clear guidance for fixing failures

### Issue Management

1. **Categorize Issues**: Use severity levels to prioritize fixes
2. **Track Patterns**: Monitor recurring issue types
3. **Document Fixes**: Record how specific issues were resolved
4. **Regression Testing**: Use seeds to verify fixes don't regress

## API Reference

### Command Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--quick` | Quick mode (25 commands) | false | `--quick` |
| `--thorough` | Thorough mode (200 commands) | false | `--thorough` |
| `--ci` | CI/CD mode (100 commands, strict) | false | `--ci` |
| `--commands <n>` | Number of commands (1-1000) | 50 | `--commands 100` |
| `--seed <n>` | Random seed (0-1000000) | random | `--seed 12345` |
| `--timeout <ms>` | Timeout in milliseconds | 30000 | `--timeout 45000` |
| `--threshold <n>` | Pass threshold percentage | 95 | `--threshold 98` |
| `--focus <areas>` | Focus areas (comma-separated) | all | `--focus house,forest` |
| `--types <types>` | Command types (comma-separated) | all | `--types movement,examination` |
| `--config <file>` | Configuration file path | none | `--config test.json` |
| `--verbose` | Enable verbose output | false | `--verbose` |
| `--strict` | Enable strict validation | false | `--strict` |
| `--allow-death` | Allow game-ending commands | false | `--allow-death` |
| `--output <format>` | Output format (text/json/junit) | text | `--output json` |

### Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | All tests passed (parity above threshold) |
| 1 | Test Failure | Tests failed (parity below threshold) |
| 2 | Configuration Error | Invalid configuration or arguments |
| 3 | Execution Error | Runtime error during test execution |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SPOT_TEST_COMMAND_COUNT` | Number of commands | `75` |
| `SPOT_TEST_SEED` | Random seed | `12345` |
| `SPOT_TEST_TIMEOUT` | Timeout in milliseconds | `30000` |
| `SPOT_TEST_QUICK_MODE` | Enable quick mode | `true` |
| `SPOT_TEST_STRICT_VALIDATION` | Enable strict validation | `true` |
| `SPOT_TEST_PASS_THRESHOLD` | Pass threshold percentage | `95` |
| `SPOT_TEST_VERBOSE` | Enable verbose output | `true` |
| `SPOT_TEST_FOCUS_AREAS` | Focus areas (comma-separated) | `house,forest` |
| `SPOT_TEST_COMMAND_TYPES` | Command types (comma-separated) | `movement,examination` |

## Examples

### Development Examples

```bash
# Quick check during coding
npx tsx scripts/spot-test-parity.ts --quick

# Test specific changes to movement system
npx tsx scripts/spot-test-parity.ts --types movement --commands 50

# Reproduce reported issue
npx tsx scripts/spot-test-parity.ts --seed 98765 --verbose

# Test puzzle implementations
npx tsx scripts/spot-test-parity.ts --focus puzzles --commands 75
```

### CI/CD Examples

```bash
# Standard CI test
npx tsx scripts/spot-test-parity.ts --ci --threshold 95

# Release validation
npx tsx scripts/spot-test-parity.ts --thorough --strict --threshold 98

# Nightly comprehensive test
npx tsx scripts/spot-test-parity.ts --commands 500 --timeout 120000
```

### Debugging Examples

```bash
# Investigate parser issues
npx tsx scripts/spot-test-parity.ts \
  --seed 11111 \
  --types communication,puzzle_action \
  --verbose \
  --output json > parser-debug.json

# Test object interaction edge cases
npx tsx scripts/spot-test-parity.ts \
  --focus house \
  --types object_interaction \
  --commands 100 \
  --strict

# Validate fix for specific issue
npx tsx scripts/spot-test-parity.ts \
  --seed 22222 \
  --commands 25 \
  --threshold 100
```

## Support and Contributing

### Getting Help

1. **Check Documentation**: Review this guide and troubleshooting section
2. **Run Verbose Mode**: Use `--verbose` for detailed output
3. **Check System Requirements**: Ensure Z-Machine interpreter is installed
4. **Review Configuration**: Validate configuration files and environment variables

### Reporting Issues

When reporting spot testing issues, include:

1. **Command Used**: Full command line with all options
2. **System Information**: OS, Node.js version, Z-Machine interpreter
3. **Error Output**: Complete error messages and stack traces
4. **Reproduction Steps**: Seed and configuration to reproduce the issue
5. **Expected vs Actual**: What you expected vs what happened

### Contributing

Contributions to improve spot testing are welcome:

1. **Performance Improvements**: Faster command generation or validation
2. **New Command Types**: Additional command categories
3. **Better Issue Detection**: Improved difference classification
4. **Documentation**: Examples, guides, and troubleshooting tips

See the main project README for contribution guidelines.

---

*This guide covers the Random Parity Spot Testing system for Zork I. For comprehensive testing and detailed parity analysis, see the full testing documentation.*