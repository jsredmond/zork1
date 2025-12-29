# Message Inconsistencies Analysis

**Analysis Date:** December 29, 2024  
**Source:** Spot test results (seed: 738557)  
**Total Message Inconsistencies:** 17 occurrences  

## Executive Summary

Message inconsistencies represent the second-largest category of parity differences (17/41 total differences, 41%). The primary issues involve **error message selection logic** and **malformed command handling** that differ significantly between TypeScript and Z-Machine implementations.

## Message Inconsistency Categories

### 1. Drop All Context-Sensitive Messages (11 occurrences)

**Pattern:** "You are empty-handed" vs "You don't have the [object]"

| Command Index | Command | TS Output | ZM Output | Context Object |
|---------------|---------|-----------|-----------|----------------|
| 5 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 20 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 31 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 33 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 40 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 48 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 90 | `drop all` | "You are empty-handed." | "You don't have the white house." | white house |
| 98 | `drop all` | "You are empty-handed." | "You don't have the white house." | white house |
| 110 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 118 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |
| 185 | `drop all` | "You are empty-handed." | "You don't have the forest." | forest |

**Analysis:**
- **TypeScript Logic:** Generic empty inventory message
- **Z-Machine Logic:** Context-aware message referencing prominent room object
- **Root Cause:** Missing context inference system for empty inventory responses

### 2. Malformed Command Handling (5 occurrences)

**Pattern:** Object visibility error vs syntax error recognition

| Command Index | Command | TS Output | ZM Output | Issue |
|---------------|---------|-----------|-----------|-------|
| 22 | `put  in small mailbox` | "You can't see any small mailbox here!" | "That sentence isn't one I recognize." | Malformed syntax |
| 76 | `put  in forest` | "You can't see any forest here!" | "That sentence isn't one I recognize." | Malformed syntax |
| 132 | `put  in boarded window` | "You can't see any boarded window here!" | "That sentence isn't one I recognize." | Malformed syntax |
| 170 | `put  in small mailbox` | "You can't see any small mailbox here!" | "That sentence isn't one I recognize." | Malformed syntax |
| 181 | `put  in small mailbox` | "You can't see any small mailbox here!" | "That sentence isn't one I recognize." | Malformed syntax |
| 190 | `put  in board` | "You can't see any board here!" | "That sentence isn't one I recognize." | Malformed syntax |

**Analysis:**
- **Command Pattern:** `put  in [object]` (missing direct object, double space)
- **TypeScript Logic:** Attempts to parse and responds with object visibility error
- **Z-Machine Logic:** Recognizes malformed syntax and responds with syntax error
- **Root Cause:** Missing malformed command detection in parser

## Detailed Message Analysis

### 1. Context-Sensitive Drop All Messages

#### Current TypeScript Implementation
```typescript
// Simplified current logic (inferred)
function handleDropAll(inventory: Item[]): string {
    if (inventory.length === 0) {
        return "You are empty-handed.";
    }
    // ... handle dropping items
}
```

#### Required Z-Machine Logic
```typescript
// Required Z-Machine compatible logic
function handleDropAll(inventory: Item[], room: Room): string {
    if (inventory.length === 0) {
        const prominentObject = getProminentObject(room);
        if (prominentObject) {
            return `You don't have the ${prominentObject}.`;
        }
        return "You are empty-handed.";
    }
    // ... handle dropping items
}
```

#### Context Object Mapping
- **Forest areas:** "forest" (9 occurrences)
- **House areas:** "white house" (2 occurrences)
- **Other areas:** Context-dependent or fallback to generic message

### 2. Malformed Command Detection

#### Current TypeScript Parsing
```typescript
// Current problematic parsing (inferred)
// Parser attempts to interpret "put  in [object]" as valid command
// Looks for direct object (missing) and indirect object (present)
// Responds with object visibility error for indirect object
```

#### Required Z-Machine Parsing
```typescript
// Required malformed command detection
function parseCommand(input: string): ParseResult {
    // Detect malformed patterns like "put  in [object]"
    if (isMalformedSyntax(input)) {
        return new ParseResult(ParseError.MALFORMED_SYNTAX);
    }
    // ... continue normal parsing
}

function isMalformedSyntax(input: string): boolean {
    // Check for patterns like "verb  in object" (missing direct object)
    // Check for double spaces indicating missing words
    // Check for incomplete verb-preposition-object patterns
}
```

## Error Message Selection Logic Analysis

### 1. Message Priority Hierarchy

**Current TypeScript Priority:**
1. Object visibility checking
2. Generic error responses

**Required Z-Machine Priority:**
1. Syntax validation (malformed commands)
2. Context-aware responses (implied objects)
3. Object visibility checking
4. Generic error responses

### 2. Syntax Error Detection Patterns

#### Malformed "Put" Commands
- **Pattern:** `put  in [object]` (missing direct object)
- **Detection:** Double space after verb, preposition without direct object
- **Response:** "That sentence isn't one I recognize."

#### Other Malformed Patterns (Potential)
- **Missing objects:** `take `, `drop `, `examine `
- **Invalid syntax:** `verb preposition` without objects
- **Incomplete commands:** Partial verb-object combinations

### 3. Context-Aware Message Generation

#### Room Context Analysis
```typescript
interface RoomContext {
    prominentObjects: string[];
    defaultObject: string | null;
    messageTemplates: Map<string, string>;
}

// Forest context
const forestContext: RoomContext = {
    prominentObjects: ["forest", "trees"],
    defaultObject: "forest",
    messageTemplates: new Map([
        ["drop_all_empty", "You don't have the forest."],
        ["take_all_empty", "You don't have the forest."]
    ])
};
```

#### Message Template System
```typescript
interface MessageTemplate {
    pattern: string;
    variables: string[];
    generate(context: MessageContext): string;
}

// Example: "You don't have the {object}."
const dropAllEmptyTemplate: MessageTemplate = {
    pattern: "You don't have the {object}.",
    variables: ["object"],
    generate: (context) => `You don't have the ${context.object}.`
};
```

## Article Usage and Formatting Analysis

### 1. Article Selection Rules
- **"the":** Used for specific, known objects ("the forest", "the white house")
- **"a/an":** Used for generic, countable objects (not seen in current examples)
- **No article:** Used for proper nouns or mass nouns (not seen in current examples)

### 2. Punctuation Consistency
- **Period ending:** All error messages end with period
- **Capitalization:** Sentence case (first word capitalized)
- **Contractions:** "don't" used consistently (not "do not")

### 3. Object Name Consistency
- **"forest":** Always lowercase, with "the"
- **"white house":** Always lowercase, with "the"
- **Compound objects:** Maintain original spacing and articles

## Parser Error Response Variations

### 1. Syntax Error Messages
- **Primary:** "That sentence isn't one I recognize."
- **Usage:** For malformed commands with invalid syntax
- **Triggers:** Missing objects, invalid word order, incomplete patterns

### 2. Object Error Messages
- **Visibility:** "You can't see any [object] here!"
- **Possession:** "You don't have that!"
- **Context-aware:** "You don't have the [object]."

### 3. Command Error Messages
- **Unknown verb:** "I don't know how to [verb]."
- **Incomplete command:** "What do you want to [verb]?"
- **Invalid target:** Various context-specific messages

## Implementation Requirements

### Priority 1: Malformed Command Detection
1. **Implement syntax validation** before object resolution
2. **Add malformed pattern detection** for common syntax errors
3. **Return syntax error message** for malformed commands
4. **Prevent object visibility checking** for syntax errors

### Priority 2: Context-Aware Drop All
1. **Implement room context system** with prominent object mapping
2. **Add context-aware message generation** for empty inventory
3. **Create object inference logic** for contextual responses
4. **Maintain fallback to generic message** when no context available

### Priority 3: Message Consistency Framework
1. **Standardize error message templates** across all commands
2. **Implement consistent article usage** rules
3. **Ensure proper punctuation and capitalization** in all messages
4. **Create message validation system** to prevent inconsistencies

## Testing Requirements

### Unit Tests
1. **Malformed command detection:** Various syntax error patterns
2. **Context inference:** Room-based prominent object detection
3. **Message generation:** Template system with proper article usage
4. **Edge cases:** Commands with no context, multiple objects

### Integration Tests
1. **Parser integration:** Syntax validation before object resolution
2. **Room context consistency:** Same logic across all rooms
3. **Message consistency:** Standardized responses across all commands
4. **Regression prevention:** Existing functionality preservation

## Impact Assessment

### Severity: Critical
- **Frequency:** 17/41 total differences (41% of all issues)
- **User Experience:** Confusing and inconsistent error messages
- **Parity Impact:** Major barrier to Z-Machine behavioral equivalence

### Affected Systems
- **Parser system:** Command syntax validation
- **Message system:** Error response generation
- **Context system:** Room-aware response logic
- **Object system:** Visibility and possession checking

## Recommendations

### Immediate Implementation
1. **Add malformed command detection** to parser (fixes 6 differences)
2. **Implement context-aware drop all** responses (fixes 11 differences)
3. **Standardize message templates** for consistency

### System Architecture
1. **Create MessageConsistencyManager** for centralized message handling
2. **Implement syntax validation layer** in parser
3. **Add room context system** for environment-aware responses
4. **Create comprehensive message testing framework**

This analysis provides the foundation for implementing consistent, context-aware error messages that match Z-Machine behavior and significantly improve user experience.