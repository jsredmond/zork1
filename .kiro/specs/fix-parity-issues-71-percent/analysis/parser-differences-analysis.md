# Parser Differences Analysis

**Analysis Date:** December 29, 2024  
**Source:** Spot test results (seed: 738557)  
**Total Parser Differences:** 1 occurrence (classified as parser_difference)  

## Executive Summary

The analysis reveals **1 direct parser difference** in incomplete command handling, specifically for the "search" verb. This represents a critical difference in how the TypeScript and Z-Machine parsers handle incomplete commands that require objects.

## Direct Parser Differences

### 1. Incomplete "Search" Command Handling

| Command Index | Command | TS Output | ZM Output | Issue Type |
|---------------|---------|-----------|-----------|------------|
| 196 | `search` | "I don't know how to search." | "What do you want to search?" | Incomplete Command Handling |

**Analysis:**
- **TypeScript Logic:** Treats "search" as unknown/unsupported verb
- **Z-Machine Logic:** Recognizes "search" as valid verb requiring an object
- **Root Cause:** Missing verb recognition and incomplete command handling for "search"

## Related Parser Issues (From Message Inconsistencies)

While classified as message inconsistencies, these reveal underlying parser logic differences:

### 2. Malformed Command Parsing (6 occurrences)

| Command Index | Command | TS Output | ZM Output | Pattern |
|---------------|---------|-----------|-----------|---------|
| 22, 76, 132, 170, 181, 190 | `put  in [object]` | "You can't see any [object] here!" | "That sentence isn't one I recognize." | Malformed Syntax Detection |

**Analysis:**
- **TypeScript Parser:** Attempts to parse malformed commands as valid
- **Z-Machine Parser:** Detects malformed syntax and rejects early
- **Root Cause:** Missing syntax validation in parser preprocessing

## Parser Architecture Analysis

### 1. Verb Recognition System

#### Current TypeScript Issues
```typescript
// Current problematic logic (inferred)
const knownVerbs = ['take', 'drop', 'look', 'go', ...];
// 'search' not in known verbs list

function parseVerb(verb: string): VerbInfo | null {
    if (!knownVerbs.includes(verb)) {
        return null; // Treated as unknown verb
    }
    return getVerbInfo(verb);
}
```

#### Required Z-Machine Logic
```typescript
// Required comprehensive verb recognition
const verbRequirements = new Map([
    ['search', { requiresObject: true, message: 'What do you want to search?' }],
    ['take', { requiresObject: true, message: 'What do you want to take?' }],
    ['drop', { requiresObject: true, message: 'What do you want to drop?' }],
    // ... other verbs
]);

function parseVerb(verb: string): VerbInfo | null {
    const requirement = verbRequirements.get(verb);
    if (requirement) {
        return new VerbInfo(verb, requirement);
    }
    return null; // Truly unknown verb
}
```

### 2. Incomplete Command Handling

#### Current TypeScript Flow
1. Parse verb → Not found in verb list
2. Return "I don't know how to [verb]."
3. Never reaches object requirement checking

#### Required Z-Machine Flow
1. Parse verb → Found in verb list with requirements
2. Check if required objects are present
3. If missing required object → "What do you want to [verb]?"
4. If malformed syntax → "That sentence isn't one I recognize."

### 3. Syntax Validation System

#### Missing Syntax Validation
```typescript
// Required syntax validation layer
interface SyntaxValidator {
    validateCommand(input: string): SyntaxValidationResult;
    detectMalformedPatterns(input: string): MalformedPattern[];
    isValidCommandStructure(tokens: string[]): boolean;
}

class ZMachineSyntaxValidator implements SyntaxValidator {
    validateCommand(input: string): SyntaxValidationResult {
        // Check for malformed patterns like "put  in object"
        const malformed = this.detectMalformedPatterns(input);
        if (malformed.length > 0) {
            return SyntaxValidationResult.malformed(malformed);
        }
        
        // Check basic command structure
        const tokens = this.tokenize(input);
        if (!this.isValidCommandStructure(tokens)) {
            return SyntaxValidationResult.invalid();
        }
        
        return SyntaxValidationResult.valid();
    }
}
```

## Verb Requirements Mapping

### 1. Object-Requiring Verbs

**Search Verb:**
- **Requirements:** Requires direct object
- **Incomplete Message:** "What do you want to search?"
- **Valid Examples:** "search mailbox", "search forest"

**Other Object-Requiring Verbs:**
- **take:** "What do you want to take?"
- **drop:** "What do you want to drop?" (Note: Different from current TS behavior)
- **examine:** "What do you want to examine?"
- **open:** "What do you want to open?"
- **close:** "What do you want to close?"

### 2. Optional Object Verbs

**Look Verb:**
- **Requirements:** Object optional
- **No Object:** Shows room description
- **With Object:** Shows object description

**Inventory Verb:**
- **Requirements:** No object needed
- **Always Valid:** Shows inventory regardless of additional words

### 3. No Object Verbs

**Wait Verb:**
- **Requirements:** No object needed
- **Behavior:** Advances time, ignores additional words

## Command Interpretation Differences

### 1. Error Message Selection Logic

#### Current TypeScript Priority
1. Check if verb is known
2. If unknown → "I don't know how to [verb]."
3. Never reaches object requirement checking

#### Required Z-Machine Priority
1. Validate command syntax
2. If malformed → "That sentence isn't one I recognize."
3. Check if verb is known
4. If unknown → "I don't know how to [verb]."
5. Check verb requirements
6. If missing required object → "What do you want to [verb]?"
7. Continue with command execution

### 2. Malformed Command Detection

#### Required Malformed Patterns
```typescript
enum MalformedPattern {
    MISSING_DIRECT_OBJECT,    // "put  in object"
    DOUBLE_SPACES,            // "verb  word"
    INCOMPLETE_PREPOSITION,   // "put in" (no objects)
    INVALID_WORD_ORDER,       // "in put object"
}

class MalformedPatternDetector {
    detect(input: string): MalformedPattern[] {
        const patterns: MalformedPattern[] = [];
        
        // Check for "verb  in object" pattern
        if (/^\w+\s{2,}in\s+\w+/.test(input)) {
            patterns.push(MalformedPattern.MISSING_DIRECT_OBJECT);
        }
        
        // Check for double spaces
        if (/\s{2,}/.test(input)) {
            patterns.push(MalformedPattern.DOUBLE_SPACES);
        }
        
        return patterns;
    }
}
```

## Parser Enhancement Requirements

### Priority 1: Add Search Verb Support
1. **Add "search" to verb recognition system**
2. **Implement object requirement checking for search**
3. **Return "What do you want to search?" for incomplete search commands**
4. **Add search action handler for complete commands**

### Priority 2: Implement Syntax Validation
1. **Add syntax validation layer before verb processing**
2. **Detect malformed command patterns**
3. **Return syntax error for malformed commands**
4. **Prevent object resolution for syntax errors**

### Priority 3: Comprehensive Verb Requirements
1. **Create complete verb requirements mapping**
2. **Implement object requirement checking for all verbs**
3. **Standardize incomplete command error messages**
4. **Add support for optional object verbs**

## Implementation Architecture

### 1. Enhanced Parser Pipeline
```typescript
class EnhancedCommandParser {
    parse(input: string): ParseResult {
        // Step 1: Syntax validation
        const syntaxResult = this.syntaxValidator.validate(input);
        if (!syntaxResult.isValid) {
            return ParseResult.syntaxError();
        }
        
        // Step 2: Tokenization
        const tokens = this.tokenizer.tokenize(input);
        
        // Step 3: Verb recognition
        const verb = this.verbRecognizer.recognize(tokens[0]);
        if (!verb) {
            return ParseResult.unknownVerb(tokens[0]);
        }
        
        // Step 4: Object requirement checking
        const objectCheck = this.objectChecker.check(verb, tokens);
        if (!objectCheck.satisfied) {
            return ParseResult.incompleteCommand(verb, objectCheck.missing);
        }
        
        // Step 5: Object resolution
        const objects = this.objectResolver.resolve(tokens, gameState);
        
        return ParseResult.success(verb, objects);
    }
}
```

### 2. Verb Requirements System
```typescript
interface VerbRequirement {
    verb: string;
    requiresDirectObject: boolean;
    requiresIndirectObject: boolean;
    incompleteMessage: string;
    allowsOptionalObject: boolean;
}

class VerbRequirementsManager {
    private requirements = new Map<string, VerbRequirement>([
        ['search', {
            verb: 'search',
            requiresDirectObject: true,
            requiresIndirectObject: false,
            incompleteMessage: 'What do you want to search?',
            allowsOptionalObject: false
        }],
        // ... other verbs
    ]);
    
    getRequirement(verb: string): VerbRequirement | null {
        return this.requirements.get(verb) || null;
    }
}
```

## Testing Requirements

### Unit Tests
1. **Search verb recognition:** "search" recognized as valid verb
2. **Incomplete search handling:** "search" → "What do you want to search?"
3. **Malformed command detection:** "put  in object" → syntax error
4. **Verb requirements:** All object-requiring verbs properly handled

### Integration Tests
1. **Parser pipeline:** Complete flow from input to parse result
2. **Error message consistency:** Proper error message selection
3. **Command execution:** Successful parsing leads to proper action execution
4. **Regression prevention:** Existing parser functionality preserved

## Impact Assessment

### Severity: Critical
- **User Experience:** Inconsistent command recognition confuses players
- **Parity Impact:** Essential for Z-Machine behavioral equivalence
- **System Impact:** Affects core command processing pipeline

### Affected Systems
- **Parser system:** Core command interpretation
- **Verb system:** Command recognition and routing
- **Error system:** Consistent error message generation
- **Action system:** Proper command execution flow

## Recommendations

### Immediate Implementation
1. **Add search verb support** with proper object requirements
2. **Implement syntax validation layer** for malformed command detection
3. **Create comprehensive verb requirements mapping**

### System Architecture
1. **Create ParserErrorHandler** for consistent error message generation
2. **Implement SyntaxValidator** for command structure validation
3. **Add VerbRequirementsManager** for centralized verb requirement handling
4. **Create comprehensive parser testing framework**

This analysis provides the foundation for implementing proper parser logic that matches Z-Machine command interpretation and provides consistent, helpful error messages to players.