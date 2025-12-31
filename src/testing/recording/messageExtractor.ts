/**
 * MessageExtractor - Extracts action responses from full game output blocks
 * 
 * This module provides functionality to isolate the actual game response
 * from full output blocks that may contain room descriptions, status bars,
 * prompts, and headers. This enables accurate parity comparison by focusing
 * on behavioral differences rather than structural/formatting differences.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

/**
 * Extracted message with metadata
 */
export interface ExtractedMessage {
  /** The extracted action response */
  response: string;
  /** The room description if present */
  roomDescription?: string;
  /** Whether this was a movement command */
  isMovement: boolean;
  /** Original full output for debugging */
  originalOutput: string;
}

/**
 * Movement commands that result in room changes
 */
const MOVEMENT_COMMANDS = new Set([
  'n', 'north',
  's', 'south',
  'e', 'east',
  'w', 'west',
  'u', 'up',
  'd', 'down',
  'ne', 'northeast',
  'nw', 'northwest',
  'se', 'southeast',
  'sw', 'southwest',
  'in', 'enter',
  'out', 'exit',
  'land',
  'climb',
  'cross',
  'launch'
]);

/**
 * Game header patterns to strip
 * Matches ZORK I title, copyright, version info, etc.
 */
const HEADER_PATTERNS = [
  /^ZORK I:.*$/im,
  /^The Great Underground Empire$/im,
  /^Copyright.*Infocom.*$/im,
  /^All rights reserved\.?$/im,
  /^ZORK is a registered trademark.*$/im,
  /^Release\s+\d+.*$/im,
  /^Serial number.*$/im,
  /^Revision\s+\d+.*$/im,
  /^interactive fiction.*$/im,
  /^Loading.*$/im,
  /^Using normal formatting\.?$/im,
  /^fantasy story.*$/im,
];

/**
 * Status bar pattern
 * Matches: "Room Name                    Score: X        Moves: Y"
 */
const STATUS_BAR_PATTERN = /^\s*\S.*\s+Score:\s*-?\d+\s+Moves:\s*\d+\s*$/im;

/**
 * Prompt pattern - matches ">" at start of line or at end of output
 */
const PROMPT_PATTERN = /^>\s*$/gm;

/**
 * Prompt at end pattern - matches ">" followed by optional whitespace at end
 */
const PROMPT_AT_END_PATTERN = />\s*$/;

/**
 * Check if a command is a movement command
 * Requirements: 1.6
 * 
 * @param command - The command to check
 * @returns true if the command is a movement command
 */
export function isMovementCommand(command: string): boolean {
  const normalizedCommand = command.toLowerCase().trim();
  
  // Direct movement command
  if (MOVEMENT_COMMANDS.has(normalizedCommand)) {
    return true;
  }
  
  // "go <direction>" format
  if (normalizedCommand.startsWith('go ')) {
    const direction = normalizedCommand.slice(3).trim();
    return MOVEMENT_COMMANDS.has(direction);
  }
  
  // "walk <direction>" format
  if (normalizedCommand.startsWith('walk ')) {
    const direction = normalizedCommand.slice(5).trim();
    return MOVEMENT_COMMANDS.has(direction);
  }
  
  return false;
}

/**
 * Strip game header/intro text from output
 * Removes ZORK I title, copyright, version info, etc.
 * Requirements: 1.2
 * 
 * @param output - The full output to process
 * @returns Output with header stripped
 */
export function stripGameHeader(output: string): string {
  let result = output;
  
  // Remove each header pattern (apply globally to handle multiple occurrences)
  for (const pattern of HEADER_PATTERNS) {
    // Create a global version of the pattern
    const globalPattern = new RegExp(pattern.source, 'gim');
    result = result.replace(globalPattern, '');
  }
  
  // Clean up any resulting empty lines at the start
  result = result.replace(/^\s*\n+/, '');
  
  // Clean up multiple consecutive newlines left by removal
  result = result.replace(/\n{2,}/g, '\n');
  
  return result.trim();
}

/**
 * Strip status bar lines from output
 * Removes "Score: X Moves: Y" lines
 * Requirements: 1.4
 * 
 * @param output - The full output to process
 * @returns Output with status bar stripped
 */
export function stripStatusBar(output: string): string {
  const lines = output.split('\n');
  const filtered = lines.filter(line => !STATUS_BAR_PATTERN.test(line));
  return filtered.join('\n');
}

/**
 * Strip command prompts from output
 * Removes ">" prompts from start of lines and end of output
 * Requirements: 1.3
 * 
 * @param output - The full output to process
 * @returns Output with prompts stripped
 */
export function stripPrompt(output: string): string {
  // First remove prompts on their own lines
  let result = output.replace(PROMPT_PATTERN, '');
  
  // Then remove prompts at the end of the output
  result = result.replace(PROMPT_AT_END_PATTERN, '');
  
  return result.trim();
}

/**
 * Check if a line looks like a room name
 * Room names are typically short, capitalized, and don't end with punctuation
 */
function isRoomNameLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  
  // Room names are typically short (under 50 chars)
  if (trimmed.length > 50) return false;
  
  // Room names don't usually end with sentence punctuation
  if (/[.!?]$/.test(trimmed)) return false;
  
  // Room names typically start with a capital letter
  if (!/^[A-Z]/.test(trimmed)) return false;
  
  // Room names are usually title case or all caps
  // Check if it looks like a title (most words capitalized)
  const words = trimmed.split(/\s+/);
  const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
  
  // At least half the words should be capitalized for a room name
  return capitalizedWords.length >= words.length / 2;
}

/**
 * Strip room description from output for non-movement commands
 * For action commands, we want just the action response, not the room description
 * Requirements: 1.5
 * 
 * @param output - The full output to process
 * @param command - The command that was executed
 * @returns Output with room description stripped (for non-movement commands)
 */
export function stripRoomDescription(output: string, command: string): string {
  // For movement commands, keep the room description
  if (isMovementCommand(command)) {
    return output;
  }
  
  const lines = output.split('\n');
  const result: string[] = [];
  let inRoomDescription = false;
  let foundRoomName = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines at the start
    if (!foundRoomName && !trimmed) {
      continue;
    }
    
    // Check if this looks like a room name (first non-empty line)
    if (!foundRoomName && isRoomNameLine(trimmed)) {
      foundRoomName = true;
      inRoomDescription = true;
      continue; // Skip the room name
    }
    
    // If we're in a room description, skip until we hit an empty line
    // or a line that looks like an action response
    if (inRoomDescription) {
      // Empty line ends room description
      if (!trimmed) {
        inRoomDescription = false;
        continue;
      }
      
      // Check if this line looks like an action response rather than description
      // Action responses often start with "You", "There", "The", etc.
      // But room descriptions also use these, so we need to be careful
      // For now, skip lines that are part of the room description
      continue;
    }
    
    // Add non-room-description lines
    result.push(line);
  }
  
  return result.join('\n').trim();
}

/**
 * Extract the action response from a full output block
 * This is the main function that combines all stripping operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 * 
 * @param output - The full output block from the game
 * @param command - The command that was executed
 * @returns ExtractedMessage with the isolated action response
 */
export function extractActionResponse(output: string, command: string): ExtractedMessage {
  const isMovement = isMovementCommand(command);
  
  // Start with the original output
  let processed = output;
  
  // Step 1: Strip game header
  processed = stripGameHeader(processed);
  
  // Step 2: Strip status bar
  processed = stripStatusBar(processed);
  
  // Step 3: Strip prompts
  processed = stripPrompt(processed);
  
  // Step 4: For non-movement commands, try to extract just the action response
  let roomDescription: string | undefined;
  
  if (!isMovement) {
    // Try to identify and separate room description from action response
    const lines = processed.split('\n');
    const roomLines: string[] = [];
    const responseLines: string[] = [];
    let foundRoomName = false;
    let inRoomDescription = false;
    let passedRoomDescription = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines at the start
      if (!foundRoomName && !trimmed) {
        continue;
      }
      
      // Check if this looks like a room name
      if (!foundRoomName && isRoomNameLine(trimmed)) {
        foundRoomName = true;
        inRoomDescription = true;
        roomLines.push(line);
        continue;
      }
      
      // If we're in a room description
      if (inRoomDescription) {
        // Empty line ends room description
        if (!trimmed) {
          inRoomDescription = false;
          passedRoomDescription = true;
          continue;
        }
        roomLines.push(line);
        continue;
      }
      
      // After room description, everything is the action response
      if (passedRoomDescription || !foundRoomName) {
        responseLines.push(line);
      }
    }
    
    if (roomLines.length > 0) {
      roomDescription = roomLines.join('\n').trim();
    }
    
    if (responseLines.length > 0) {
      processed = responseLines.join('\n').trim();
    } else if (roomLines.length > 0) {
      // If there's only room description and no separate response,
      // the action might have just triggered a look (like "look")
      // In this case, the room description IS the response
      processed = roomLines.join('\n').trim();
      roomDescription = undefined;
    }
  }
  
  // Clean up the final response
  processed = processed.trim();
  
  // Handle empty response
  if (!processed) {
    processed = output.trim();
  }
  
  return {
    response: processed,
    roomDescription,
    isMovement,
    originalOutput: output
  };
}

/**
 * MessageExtractor class for stateful extraction
 */
export class MessageExtractor {
  /**
   * Extract action response from output
   */
  extractActionResponse(output: string, command: string): ExtractedMessage {
    return extractActionResponse(output, command);
  }
  
  /**
   * Strip game header from output
   */
  stripGameHeader(output: string): string {
    return stripGameHeader(output);
  }
  
  /**
   * Strip status bar from output
   */
  stripStatusBar(output: string): string {
    return stripStatusBar(output);
  }
  
  /**
   * Strip prompts from output
   */
  stripPrompt(output: string): string {
    return stripPrompt(output);
  }
  
  /**
   * Strip room description from output
   */
  stripRoomDescription(output: string, command: string): string {
    return stripRoomDescription(output, command);
  }
  
  /**
   * Check if command is a movement command
   */
  isMovementCommand(command: string): boolean {
    return isMovementCommand(command);
  }
}

/**
 * Factory function to create a MessageExtractor
 */
export function createMessageExtractor(): MessageExtractor {
  return new MessageExtractor();
}
