/**
 * Random Command Generator for Spot Testing
 * Generates contextually appropriate random commands for parity testing
 */

import { 
  CommandGenerationConfig, 
  GeneratedCommand, 
  GameContext, 
  CommandTemplate, 
  ContextRequirement, 
  CommandType, 
  GameArea 
} from './types.js';
import { GameState } from '../../game/state.js';
import { Direction } from '../../game/rooms.js';

/**
 * RandomCommandGenerator creates contextually appropriate random commands
 * for spot testing parity between TypeScript and Z-Machine implementations
 */
export class RandomCommandGenerator {
  private commandTemplates: CommandTemplate[];
  private rng: () => number;

  constructor(seed?: number) {
    this.commandTemplates = this.initializeCommandTemplates();
    
    // Use seeded random if provided, otherwise Math.random
    if (seed !== undefined) {
      let currentSeed = seed;
      this.rng = () => {
        currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
        return currentSeed / 0x7fffffff;
      };
    } else {
      this.rng = Math.random;
    }
  }

  /**
   * Generate a set of random commands based on configuration
   */
  generateCommands(config: CommandGenerationConfig, gameState: GameState): GeneratedCommand[] {
    const commands: GeneratedCommand[] = [];
    const context = this.extractGameContext(gameState);

    for (let i = 0; i < config.commandCount; i++) {
      const command = this.generateSingleCommand(config, context, gameState);
      if (command) {
        commands.push(command);
      }
    }

    return commands;
  }

  /**
   * Generate a single random command
   */
  private generateSingleCommand(
    config: CommandGenerationConfig, 
    context: GameContext, 
    gameState: GameState
  ): GeneratedCommand | null {
    // Try multiple times to generate a valid command
    const maxAttempts = 5;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Filter templates based on configuration
      let availableTemplates = this.commandTemplates;

      if (config.commandTypes && config.commandTypes.length > 0) {
        availableTemplates = availableTemplates.filter(
          template => config.commandTypes!.includes(template.type)
        );
      }

      if (config.focusAreas && config.focusAreas.length > 0) {
        // Filter by game area if specified
        availableTemplates = this.filterTemplatesByArea(availableTemplates, config.focusAreas, context);
      }

      // Filter templates that meet context requirements
      // On later attempts, be more lenient with requirements
      const strictMode = attempt < 2;
      const validTemplates = availableTemplates.filter(
        template => this.meetsContextRequirements(template, context, strictMode)
      );

      if (validTemplates.length === 0) {
        continue; // Try again with different selection
      }

      // Select template using weighted random selection
      const selectedTemplate = this.selectWeightedTemplate(validTemplates);
      
      // Generate command from template
      const command = this.generateCommandFromTemplate(selectedTemplate, context, gameState, strictMode);
      
      if (!command) {
        continue; // Try again
      }

      // Validate command if game-ending avoidance is enabled
      if (config.avoidGameEnding && this.isGameEndingCommand(command)) {
        continue; // Try again
      }

      return {
        command,
        context,
        expectedType: selectedTemplate.type,
        weight: selectedTemplate.weight
      };
    }

    return null; // Failed to generate after all attempts
  }

  /**
   * Extract current game context for command generation
   */
  private extractGameContext(gameState: GameState): GameContext {
    const currentRoom = gameState.getCurrentRoom();
    const visibleObjects = gameState.getObjectsInCurrentRoom();
    const inventoryObjects = gameState.getInventoryObjects();

    return {
      currentLocation: gameState.currentRoom,
      visibleObjects: visibleObjects.map(obj => obj.name.toLowerCase()),
      inventory: inventoryObjects.map(obj => obj.name.toLowerCase()),
      availableDirections: currentRoom ? currentRoom.getAvailableExits().map(dir => dir.toLowerCase()) : [],
      gameFlags: new Map(Object.entries(gameState.flags))
    };
  }

  /**
   * Check if template meets context requirements
   */
  private meetsContextRequirements(template: CommandTemplate, context: GameContext, strictMode: boolean = true): boolean {
    return template.contextRequirements.every(req => {
      switch (req.type) {
        case 'object_present':
          const hasObject = context.visibleObjects.includes(req.value.toLowerCase()) ||
                           context.inventory.includes(req.value.toLowerCase());
          // In non-strict mode, allow templates even if specific objects aren't present
          return req.required ? hasObject : true;
        
        case 'inventory_item':
          const hasInventoryItem = context.inventory.includes(req.value.toLowerCase());
          // In non-strict mode, be more lenient about inventory requirements
          return req.required ? (hasInventoryItem || (!strictMode && context.inventory.length > 0)) : true;
        
        case 'flag_set':
          const flagValue = context.gameFlags.get(req.value);
          return req.required ? (flagValue === true) : true;
        
        case 'location_type':
          // Simple location type checking based on room name
          const locationMatches = context.currentLocation.toLowerCase().includes(req.value.toLowerCase());
          return req.required ? locationMatches : true;
        
        default:
          return true;
      }
    });
  }

  /**
   * Filter templates by game area
   */
  private filterTemplatesByArea(templates: CommandTemplate[], areas: GameArea[], context: GameContext): CommandTemplate[] {
    // For now, return all templates - area filtering can be enhanced later
    return templates;
  }

  /**
   * Select template using weighted random selection
   */
  private selectWeightedTemplate(templates: CommandTemplate[]): CommandTemplate {
    const totalWeight = templates.reduce((sum, template) => sum + template.weight, 0);
    let randomValue = this.rng() * totalWeight;

    for (const template of templates) {
      randomValue -= template.weight;
      if (randomValue <= 0) {
        return template;
      }
    }

    // Fallback to last template
    return templates[templates.length - 1];
  }

  /**
   * Generate actual command text from template
   */
  private generateCommandFromTemplate(
    template: CommandTemplate, 
    context: GameContext, 
    gameState: GameState,
    strictMode: boolean = true
  ): string | null {
    let command = template.pattern;

    // Replace placeholders in the pattern
    command = command.replace(/{DIRECTION}/g, () => {
      const validDirection = this.getValidDirection(context);
      return validDirection || '';
    });

    command = command.replace(/{OBJECT}/g, () => {
      const validObject = this.getValidObject(context, 'any', strictMode);
      return validObject || '';
    });

    command = command.replace(/{VISIBLE_OBJECT}/g, () => {
      const validObject = this.getValidObject(context, 'visible', strictMode);
      return validObject || '';
    });

    command = command.replace(/{INVENTORY_OBJECT}/g, () => {
      const validObject = this.getValidObject(context, 'inventory', strictMode);
      return validObject || '';
    });

    // Remove any remaining empty placeholders or invalid commands
    if (command.includes('{}') || command.trim() === '') {
      return null;
    }

    const finalCommand = command.trim();
    
    // Validate the generated command (be more lenient in non-strict mode)
    if (!this.validateGeneratedCommand(finalCommand, context, gameState, strictMode)) {
      return null;
    }

    return finalCommand;
  }

  /**
   * Get a valid direction from available directions
   */
  private getValidDirection(context: GameContext): string | null {
    if (context.availableDirections.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(this.rng() * context.availableDirections.length);
    const direction = context.availableDirections[randomIndex];
    
    // Validate direction exists and is properly formatted
    if (this.isValidDirection(direction)) {
      return direction;
    }
    
    return null;
  }

  /**
   * Get a valid object name from the specified source
   */
  private getValidObject(context: GameContext, source: 'any' | 'visible' | 'inventory', strictMode: boolean = true): string | null {
    let objectPool: string[] = [];
    
    switch (source) {
      case 'visible':
        objectPool = context.visibleObjects;
        break;
      case 'inventory':
        objectPool = context.inventory;
        break;
      case 'any':
        objectPool = [...context.visibleObjects, ...context.inventory];
        break;
    }
    
    // In non-strict mode, provide fallback objects if pool is empty
    if (objectPool.length === 0 && !strictMode) {
      const fallbackObjects = ['lamp', 'sword', 'box', 'door', 'window'];
      objectPool = fallbackObjects;
    }
    
    if (objectPool.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(this.rng() * objectPool.length);
    const objectName = objectPool[randomIndex];
    
    // Validate object name is appropriate
    if (this.isValidObjectName(objectName)) {
      return objectName;
    }
    
    return null;
  }

  /**
   * Validate that a direction is properly formatted and valid
   */
  private isValidDirection(direction: string): boolean {
    const validDirections = [
      'north', 'south', 'east', 'west', 'up', 'down',
      'northeast', 'northwest', 'southeast', 'southwest',
      'ne', 'nw', 'se', 'sw', 'n', 's', 'e', 'w', 'u', 'd',
      'in', 'out', 'enter', 'exit'
    ];
    
    return validDirections.includes(direction.toLowerCase()) && 
           direction.length > 0 && 
           direction.length < 20;
  }

  /**
   * Validate that an object name is appropriate for commands
   */
  private isValidObjectName(objectName: string): boolean {
    // Check basic validity
    if (!objectName || objectName.length === 0 || objectName.length > 50) {
      return false;
    }
    
    // Check for reasonable characters (letters, spaces, hyphens)
    const validNamePattern = /^[a-zA-Z\s\-']+$/;
    if (!validNamePattern.test(objectName)) {
      return false;
    }
    
    // Avoid problematic object names
    const problematicNames = ['', 'undefined', 'null', 'me', 'myself', 'you'];
    if (problematicNames.includes(objectName.toLowerCase())) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate the complete generated command for appropriateness
   */
  private validateGeneratedCommand(command: string, context: GameContext, gameState: GameState, strictMode: boolean = true): boolean {
    // Basic command validation
    if (!command || command.length === 0 || command.length > 100) {
      return false;
    }
    
    // Check for reasonable command structure
    const words = command.toLowerCase().split(/\s+/);
    if (words.length === 0 || words.length > 10) {
      return false;
    }
    
    // Validate first word is likely a verb or direction
    const firstWord = words[0];
    if (!this.isLikelyValidFirstWord(firstWord)) {
      return false;
    }
    
    // In strict mode, validate object and direction references more carefully
    if (strictMode) {
      // Check for object references in context
      if (!this.validateObjectReferencesInCommand(command, context)) {
        return false;
      }
      
      // Check for direction references in context
      if (!this.validateDirectionReferencesInCommand(command, context)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if the first word of a command is likely valid
   */
  private isLikelyValidFirstWord(word: string): boolean {
    const commonVerbs = [
      'go', 'take', 'get', 'drop', 'put', 'open', 'close', 'examine', 'look', 
      'read', 'inventory', 'push', 'pull', 'turn', 'move', 'climb', 'hello',
      'say', 'yell', 'attack', 'kill', 'eat', 'drink', 'give', 'throw',
      'light', 'extinguish', 'unlock', 'lock', 'search', 'wait', 'quit'
    ];
    
    const commonDirections = [
      'north', 'south', 'east', 'west', 'up', 'down', 'northeast', 'northwest',
      'southeast', 'southwest', 'ne', 'nw', 'se', 'sw', 'n', 's', 'e', 'w',
      'u', 'd', 'in', 'out', 'enter', 'exit'
    ];
    
    const commonAbbreviations = ['i', 'l', 'x', 'z', 'q', 'g'];
    
    return commonVerbs.includes(word) || 
           commonDirections.includes(word) || 
           commonAbbreviations.includes(word);
  }

  /**
   * Validate that object references in the command exist in the current context
   */
  private validateObjectReferencesInCommand(command: string, context: GameContext): boolean {
    const allAvailableObjects = [...context.visibleObjects, ...context.inventory];
    const words = command.toLowerCase().split(/\s+/);
    
    // For each word in the command, if it looks like an object name,
    // check if it's available in the current context
    for (const word of words) {
      // Skip common verbs, prepositions, and articles
      if (this.isCommonNonObjectWord(word)) {
        continue;
      }
      
      // If this word might be an object reference, validate it exists
      if (this.mightBeObjectReference(word)) {
        const objectExists = allAvailableObjects.some(obj => 
          obj.toLowerCase().includes(word) || word.includes(obj.toLowerCase())
        );
        
        // If we can't find this object reference, the command might be invalid
        // But we'll be lenient and only reject if it's clearly an object name
        if (!objectExists && this.isLikelyObjectName(word)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Validate that direction references in the command are available
   */
  private validateDirectionReferencesInCommand(command: string, context: GameContext): boolean {
    const words = command.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (this.isValidDirection(word)) {
        // Only validate movement commands strictly
        const isMovementCommand = words[0] === 'go' || (words.length === 1 && this.isValidDirection(words[0]));
        if (isMovementCommand && !context.availableDirections.includes(word)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Check if a word is a common non-object word
   */
  private isCommonNonObjectWord(word: string): boolean {
    const commonWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from',
      'with', 'by', 'for', 'of', 'as', 'is', 'are', 'was', 'were', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'must', 'shall', 'go', 'come', 'get',
      'put', 'take', 'give', 'make', 'see', 'look', 'find', 'use', 'try',
      'want', 'need', 'know', 'think', 'say', 'tell', 'ask', 'help', 'let',
      'move', 'turn', 'open', 'close', 'push', 'pull', 'drop', 'pick', 'hold'
    ];
    
    return commonWords.includes(word);
  }

  /**
   * Check if a word might be an object reference
   */
  private mightBeObjectReference(word: string): boolean {
    // Skip very short words and common words
    if (word.length < 3 || this.isCommonNonObjectWord(word)) {
      return false;
    }
    
    // Skip directions
    if (this.isValidDirection(word)) {
      return false;
    }
    
    // If it's a noun-like word, it might be an object
    return /^[a-zA-Z]+$/.test(word);
  }

  /**
   * Check if a word is likely an object name
   */
  private isLikelyObjectName(word: string): boolean {
    // Common object-like words that should exist if referenced
    const objectIndicators = [
      'lamp', 'lantern', 'sword', 'knife', 'rope', 'bottle', 'box', 'chest',
      'door', 'window', 'table', 'chair', 'book', 'paper', 'key', 'coin',
      'jewel', 'diamond', 'emerald', 'ruby', 'gold', 'silver', 'treasure',
      'bag', 'sack', 'basket', 'bucket', 'cup', 'glass', 'plate', 'food'
    ];
    
    return objectIndicators.includes(word.toLowerCase()) || 
           (word.length > 3 && /^[a-zA-Z]+$/.test(word));
  }

  /**
   * Check if command would immediately end the game
   */
  private isGameEndingCommand(command: string): boolean {
    const lowerCommand = command.toLowerCase();
    
    // Commands that typically end the game
    const gameEndingPatterns = [
      /^quit/,
      /^q$/,
      /^restart/,
      /^kill me/,
      /^suicide/,
      // Add more patterns as needed
    ];

    return gameEndingPatterns.some(pattern => pattern.test(lowerCommand));
  }

  /**
   * Initialize command templates with patterns and weights
   */
  private initializeCommandTemplates(): CommandTemplate[] {
    return [
      // Movement commands (high weight - very common)
      {
        pattern: '{DIRECTION}',
        type: CommandType.MOVEMENT,
        weight: 20,
        contextRequirements: []
      },
      {
        pattern: 'go {DIRECTION}',
        type: CommandType.MOVEMENT,
        weight: 15,
        contextRequirements: []
      },

      // Examination commands (high weight - very common)
      {
        pattern: 'look',
        type: CommandType.EXAMINATION,
        weight: 18,
        contextRequirements: []
      },
      {
        pattern: 'examine {OBJECT}',
        type: CommandType.EXAMINATION,
        weight: 16,
        contextRequirements: []
      },
      {
        pattern: 'look at {OBJECT}',
        type: CommandType.EXAMINATION,
        weight: 12,
        contextRequirements: []
      },
      {
        pattern: 'read {OBJECT}',
        type: CommandType.EXAMINATION,
        weight: 8,
        contextRequirements: []
      },
      {
        pattern: 'examine room',
        type: CommandType.EXAMINATION,
        weight: 10,
        contextRequirements: []
      },
      {
        pattern: 'look around',
        type: CommandType.EXAMINATION,
        weight: 12,
        contextRequirements: []
      },

      // Object interaction commands (medium-high weight)
      {
        pattern: 'take {VISIBLE_OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 14,
        contextRequirements: []
      },
      {
        pattern: 'get {VISIBLE_OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 12,
        contextRequirements: []
      },
      {
        pattern: 'drop {INVENTORY_OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 10,
        contextRequirements: []
      },
      {
        pattern: 'put {INVENTORY_OBJECT} in {VISIBLE_OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 8,
        contextRequirements: []
      },
      {
        pattern: 'open {OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 9,
        contextRequirements: []
      },
      {
        pattern: 'close {OBJECT}',
        type: CommandType.OBJECT_INTERACTION,
        weight: 7,
        contextRequirements: []
      },
      {
        pattern: 'take all',
        type: CommandType.OBJECT_INTERACTION,
        weight: 8,
        contextRequirements: []
      },
      {
        pattern: 'drop all',
        type: CommandType.OBJECT_INTERACTION,
        weight: 6,
        contextRequirements: []
      },

      // Inventory commands (medium weight)
      {
        pattern: 'inventory',
        type: CommandType.INVENTORY,
        weight: 12,
        contextRequirements: []
      },
      {
        pattern: 'i',
        type: CommandType.INVENTORY,
        weight: 10,
        contextRequirements: []
      },

      // Puzzle actions (lower weight - more specific)
      {
        pattern: 'push {OBJECT}',
        type: CommandType.PUZZLE_ACTION,
        weight: 6,
        contextRequirements: []
      },
      {
        pattern: 'pull {OBJECT}',
        type: CommandType.PUZZLE_ACTION,
        weight: 6,
        contextRequirements: []
      },
      {
        pattern: 'turn {OBJECT}',
        type: CommandType.PUZZLE_ACTION,
        weight: 5,
        contextRequirements: []
      },
      {
        pattern: 'move {OBJECT}',
        type: CommandType.PUZZLE_ACTION,
        weight: 5,
        contextRequirements: []
      },
      {
        pattern: 'climb {OBJECT}',
        type: CommandType.PUZZLE_ACTION,
        weight: 4,
        contextRequirements: []
      },
      {
        pattern: 'search',
        type: CommandType.PUZZLE_ACTION,
        weight: 7,
        contextRequirements: []
      },
      {
        pattern: 'wait',
        type: CommandType.PUZZLE_ACTION,
        weight: 6,
        contextRequirements: []
      },

      // Communication commands (low weight - less common)
      {
        pattern: 'hello',
        type: CommandType.COMMUNICATION,
        weight: 3,
        contextRequirements: []
      },
      {
        pattern: 'say hello',
        type: CommandType.COMMUNICATION,
        weight: 2,
        contextRequirements: []
      },
      {
        pattern: 'yell',
        type: CommandType.COMMUNICATION,
        weight: 2,
        contextRequirements: []
      }
    ];
  }
}