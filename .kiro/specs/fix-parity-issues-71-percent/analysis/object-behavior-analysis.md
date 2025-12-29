# Object Behavior Differences Analysis

**Analysis Date:** December 29, 2024  
**Source:** Spot test results (seed: 738557)  
**Total Object Behavior Differences:** 1 occurrence (classified as state_divergence)  

## Executive Summary

The analysis reveals **1 direct object behavior difference** classified as state divergence, plus several object-related differences that are classified under message inconsistencies. The primary issue involves **object visibility and possession checking logic**.

## Direct Object Behavior Differences

### 1. Object Possession vs Visibility Error (1 occurrence)

| Command Index | Command | TS Output | ZM Output | Issue Type |
|---------------|---------|-----------|-----------|------------|
| 56 | `put door in forest` | "You can't see any door here!" | "You don't have that!" | Possession vs Visibility Logic |

**Analysis:**
- **TypeScript Logic:** Checks object visibility first ("You can't see any door here!")
- **Z-Machine Logic:** Checks object possession first ("You don't have that!")
- **Root Cause:** Different error checking order in object interaction logic

## Related Object Behavior Issues (From Message Inconsistencies)

While classified as message inconsistencies, these reveal underlying object behavior logic differences:

### 2. "Drop All" Context-Sensitive Responses (Multiple occurrences)

| Command Index | Command | TS Output | ZM Output | Pattern |
|---------------|---------|-----------|-----------|---------|
| 5, 20, 31, 33, 40, 48, 90, 98, 110, 118, 185 | `drop all` | "You are empty-handed." | "You don't have the [object]." | Context-aware object reference |

**Analysis:**
- **TypeScript Logic:** Generic empty-handed message
- **Z-Machine Logic:** Context-aware message referencing implied object from environment
- **Root Cause:** Missing implied object detection in drop all logic

**Implied Objects Detected by Z-Machine:**
- "You don't have the forest." (when in forest areas)
- "You don't have the white house." (when near house)

## Object Interaction Logic Analysis

### 1. Error Checking Order Issues

**Current TypeScript Order:**
1. Check object visibility in current location
2. Return "You can't see any [object] here!" if not visible

**Z-Machine Order:**
1. Check object possession first
2. Return "You don't have that!" if not possessed
3. Then check visibility/location

**Impact:** Different error messages for same invalid action

### 2. Implied Object Detection Missing

**Current TypeScript Logic:**
- `drop all` → Check inventory → "You are empty-handed" if empty

**Z-Machine Logic:**
- `drop all` → Check inventory → If empty, infer object from context
- Context inference: Look at prominent objects in current room
- Generate: "You don't have the [prominent object]."

**Missing Implementation:**
- Context-aware object inference system
- Room-based prominent object detection
- Dynamic message generation with inferred objects

### 3. Object Context Analysis Requirements

**Room Context Mapping:**
- **Forest areas:** "forest" is prominent object
- **Near house:** "white house" is prominent object  
- **Other locations:** Context-specific prominent objects

**Implementation Needs:**
- Room → prominent object mapping
- Context inference algorithm
- Dynamic error message generation

## Visibility vs Possession Logic Analysis

### Current TypeScript Implementation Issues

```typescript
// Current problematic logic (inferred)
if (!canSeeObject(object, currentRoom)) {
    return "You can't see any " + object + " here!";
}
// Never reaches possession check for non-visible objects
```

### Required Z-Machine Logic

```typescript
// Required Z-Machine compatible logic
if (!playerHasObject(object)) {
    return "You don't have that!";
}
if (!canSeeObject(object, currentRoom)) {
    return "You can't see any " + object + " here!";
}
// Continue with action...
```

## Object Manipulation Error Categories

### 1. Possession Errors (Priority 1)
- **Message:** "You don't have that!"
- **Condition:** Player doesn't possess the object
- **Check Order:** First priority

### 2. Visibility Errors (Priority 2)  
- **Message:** "You can't see any [object] here!"
- **Condition:** Object not visible in current location
- **Check Order:** Second priority (after possession)

### 3. Manipulation Errors (Priority 3)
- **Message:** "You can't do that to the [object]."
- **Condition:** Object exists and visible but action not allowed
- **Check Order:** Third priority (after possession and visibility)

## Context-Sensitive Object Reference System

### Required Components

#### 1. Prominent Object Detector
```typescript
interface ProminentObjectDetector {
    getProminentObject(room: Room): string | null;
    isObjectProminent(object: string, room: Room): boolean;
}
```

#### 2. Context-Aware Message Generator
```typescript
interface ContextAwareMessageGenerator {
    generateDropAllMessage(inventory: Item[], room: Room): string;
    generateObjectErrorMessage(action: string, object: string, context: ObjectContext): string;
}
```

#### 3. Object Context Analyzer
```typescript
interface ObjectContextAnalyzer {
    analyzeContext(command: string, room: Room): ObjectContext;
    inferImpliedObject(action: string, room: Room): string | null;
}
```

## Room-Specific Prominent Objects

### Forest Areas
- **Prominent Object:** "forest"
- **Drop All Message:** "You don't have the forest."
- **Rooms:** Forest, Clearing (when forest visible)

### House Areas  
- **Prominent Object:** "white house"
- **Drop All Message:** "You don't have the white house."
- **Rooms:** North of House, South of House (when house visible)

### Other Areas
- **Context-Dependent:** Based on room description and visible objects
- **Fallback:** Generic "You are empty-handed." if no prominent object

## Error Message Consistency Requirements

### 1. Possession Check Priority
- Always check possession before visibility
- Use "You don't have that!" for possession failures
- Consistent across all object manipulation verbs

### 2. Context-Aware Responses
- Implement implied object detection for "drop all"
- Generate context-specific error messages
- Maintain consistency with room context

### 3. Object Reference Accuracy
- Use proper articles ("the", "a", "an")
- Maintain consistent object naming
- Handle plural vs singular object references

## Implementation Requirements

### Priority 1: Fix Error Checking Order
1. Modify object interaction logic to check possession first
2. Implement proper error message priority system
3. Ensure "You don't have that!" appears before visibility errors

### Priority 2: Implement Context-Aware Drop All
1. Create prominent object detection system
2. Implement room → prominent object mapping
3. Generate context-specific "You don't have the [object]" messages

### Priority 3: Comprehensive Object Error Handling
1. Standardize all object manipulation error messages
2. Implement consistent error checking across all verbs
3. Ensure proper article usage and object naming

## Testing Requirements

### Unit Tests Needed
1. **Error checking order:** Possession before visibility
2. **Context inference:** Prominent object detection per room
3. **Message generation:** Context-aware drop all responses
4. **Edge cases:** Objects with no context, multiple prominent objects

### Integration Tests Needed
1. **Cross-room consistency:** Same logic across all rooms
2. **Verb consistency:** Same error handling across all object verbs
3. **State consistency:** Proper object state tracking

## Impact Assessment

### Severity: High
- **User Experience:** Confusing error messages reduce game playability
- **Parity Impact:** Critical for achieving Z-Machine behavioral equivalence
- **System Impact:** Affects core object interaction system

### Affected Systems
- **Object interaction logic:** Core manipulation verbs
- **Error message system:** Consistent error reporting
- **Room context system:** Environment-aware responses
- **Parser system:** Command interpretation and object resolution

## Recommendations

### Immediate Actions
1. **Fix error checking order** in object manipulation logic
2. **Implement prominent object detection** for context-aware messages
3. **Standardize error message generation** across all object verbs

### System Improvements
1. **Create ObjectInteractionManager** with proper error handling hierarchy
2. **Implement ContextAwareMessageGenerator** for dynamic responses
3. **Add comprehensive object behavior testing** to prevent regressions

This analysis provides the foundation for implementing proper object behavior logic that matches Z-Machine semantics and improves user experience consistency.