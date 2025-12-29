/**
 * Contextual Command Weighting System
 * Implements intelligent command weighting based on context and frequency
 */

import { 
  CommandTemplate, 
  GameContext, 
  CommandType, 
  GameArea 
} from './types.js';

/**
 * Configuration for command weighting
 */
export interface WeightingConfig {
  baseWeights: Map<CommandType, number>;
  locationMultipliers: Map<string, Map<CommandType, number>>;
  objectPresenceBonus: number;
  inventoryBonus: number;
  contextualRelevanceBonus: number;
}

/**
 * Weighted command template with contextual adjustments
 */
export interface WeightedCommandTemplate extends CommandTemplate {
  adjustedWeight: number;
  contextualReasons: string[];
}

/**
 * Location-specific command preferences
 */
export interface LocationPreferences {
  preferredCommands: CommandType[];
  discouragedCommands: CommandType[];
  specialObjects: string[];
  contextualHints: string[];
}

/**
 * CommandWeightingSystem provides intelligent command weighting based on context
 */
export class CommandWeightingSystem {
  private config: WeightingConfig;
  private locationPreferences: Map<string, LocationPreferences>;

  constructor(config?: Partial<WeightingConfig>) {
    this.config = this.initializeDefaultConfig(config);
    this.locationPreferences = this.initializeLocationPreferences();
  }

  /**
   * Apply contextual weighting to command templates
   */
  applyContextualWeighting(
    templates: CommandTemplate[], 
    context: GameContext
  ): WeightedCommandTemplate[] {
    return templates.map(template => {
      const adjustedWeight = this.calculateAdjustedWeight(template, context);
      const contextualReasons = this.getContextualReasons(template, context);

      return {
        ...template,
        adjustedWeight,
        contextualReasons
      };
    });
  }

  /**
   * Calculate adjusted weight for a template based on context
   */
  private calculateAdjustedWeight(template: CommandTemplate, context: GameContext): number {
    let adjustedWeight = template.weight;
    const reasons: string[] = [];

    // Apply base command type weighting
    const baseWeight = this.config.baseWeights.get(template.type) || 1.0;
    adjustedWeight *= baseWeight;

    // Apply location-specific multipliers
    const locationMultiplier = this.getLocationMultiplier(template.type, context.currentLocation);
    adjustedWeight *= locationMultiplier;

    // Apply object presence bonuses
    const objectBonus = this.calculateObjectPresenceBonus(template, context);
    adjustedWeight += objectBonus;

    // Apply inventory bonuses
    const inventoryBonus = this.calculateInventoryBonus(template, context);
    adjustedWeight += inventoryBonus;

    // Apply contextual relevance bonuses
    const contextualBonus = this.calculateContextualRelevanceBonus(template, context);
    adjustedWeight += contextualBonus;

    // Ensure minimum weight
    return Math.max(adjustedWeight, 0.1);
  }

  /**
   * Get location-specific multiplier for command type
   */
  private getLocationMultiplier(commandType: CommandType, location: string): number {
    const locationMultipliers = this.config.locationMultipliers.get(location.toLowerCase());
    if (locationMultipliers) {
      return locationMultipliers.get(commandType) || 1.0;
    }

    // Apply general location-based logic
    return this.getGeneralLocationMultiplier(commandType, location);
  }

  /**
   * Get general location multiplier based on location characteristics
   */
  private getGeneralLocationMultiplier(commandType: CommandType, location: string): number {
    const locationLower = location.toLowerCase();

    // House/indoor locations
    if (this.isIndoorLocation(locationLower)) {
      switch (commandType) {
        case CommandType.EXAMINATION:
          return 1.3; // More examination indoors
        case CommandType.OBJECT_INTERACTION:
          return 1.2; // More object interaction indoors
        case CommandType.MOVEMENT:
          return 0.9; // Slightly less movement indoors
        default:
          return 1.0;
      }
    }

    // Outdoor/forest locations
    if (this.isOutdoorLocation(locationLower)) {
      switch (commandType) {
        case CommandType.MOVEMENT:
          return 1.3; // More movement outdoors
        case CommandType.EXAMINATION:
          return 1.1; // Some examination outdoors
        case CommandType.OBJECT_INTERACTION:
          return 0.8; // Fewer objects outdoors
        default:
          return 1.0;
      }
    }

    // Underground/dungeon locations
    if (this.isUndergroundLocation(locationLower)) {
      switch (commandType) {
        case CommandType.EXAMINATION:
          return 1.4; // High examination in dungeons
        case CommandType.PUZZLE_ACTION:
          return 1.3; // More puzzles underground
        case CommandType.OBJECT_INTERACTION:
          return 1.2; // More treasure/objects underground
        default:
          return 1.0;
      }
    }

    return 1.0;
  }

  /**
   * Calculate bonus for object presence
   */
  private calculateObjectPresenceBonus(template: CommandTemplate, context: GameContext): number {
    let bonus = 0;

    // Check if template involves objects
    if (this.templateInvolvesObjects(template)) {
      // Bonus for having visible objects
      if (context.visibleObjects.length > 0) {
        bonus += this.config.objectPresenceBonus * context.visibleObjects.length;
      }

      // Extra bonus for specific object types
      const interestingObjects = this.countInterestingObjects(context.visibleObjects);
      bonus += interestingObjects * (this.config.objectPresenceBonus * 0.5);
    }

    return bonus;
  }

  /**
   * Calculate bonus for inventory-related commands
   */
  private calculateInventoryBonus(template: CommandTemplate, context: GameContext): number {
    let bonus = 0;

    if (template.type === CommandType.INVENTORY) {
      // Bonus for having items in inventory
      bonus += context.inventory.length * this.config.inventoryBonus;
    }

    if (template.pattern.includes('{INVENTORY_OBJECT}')) {
      // Bonus for inventory object commands when inventory has items
      bonus += context.inventory.length * (this.config.inventoryBonus * 1.5);
    }

    return bonus;
  }

  /**
   * Calculate contextual relevance bonus
   */
  private calculateContextualRelevanceBonus(template: CommandTemplate, context: GameContext): number {
    let bonus = 0;

    // Location-specific preferences
    const preferences = this.locationPreferences.get(context.currentLocation.toLowerCase());
    if (preferences) {
      if (preferences.preferredCommands.includes(template.type)) {
        bonus += this.config.contextualRelevanceBonus;
      }
      if (preferences.discouragedCommands.includes(template.type)) {
        bonus -= this.config.contextualRelevanceBonus * 0.5;
      }
    }

    // Direction availability bonus
    if (template.type === CommandType.MOVEMENT && context.availableDirections.length > 0) {
      bonus += this.config.contextualRelevanceBonus * 0.3;
    }

    // Object interaction bonus when objects are present
    if (template.type === CommandType.OBJECT_INTERACTION && 
        (context.visibleObjects.length > 0 || context.inventory.length > 0)) {
      bonus += this.config.contextualRelevanceBonus * 0.4;
    }

    return bonus;
  }

  /**
   * Get contextual reasons for weight adjustments
   */
  private getContextualReasons(template: CommandTemplate, context: GameContext): string[] {
    const reasons: string[] = [];

    // Location-based reasons
    const locationMultiplier = this.getLocationMultiplier(template.type, context.currentLocation);
    if (locationMultiplier > 1.1) {
      reasons.push(`Preferred in ${context.currentLocation}`);
    } else if (locationMultiplier < 0.9) {
      reasons.push(`Less common in ${context.currentLocation}`);
    }

    // Object-based reasons
    if (this.templateInvolvesObjects(template) && context.visibleObjects.length > 0) {
      reasons.push(`Objects available: ${context.visibleObjects.slice(0, 3).join(', ')}`);
    }

    // Inventory-based reasons
    if (template.pattern.includes('{INVENTORY_OBJECT}') && context.inventory.length > 0) {
      reasons.push(`Inventory items available: ${context.inventory.slice(0, 3).join(', ')}`);
    }

    // Direction-based reasons
    if (template.type === CommandType.MOVEMENT && context.availableDirections.length > 0) {
      reasons.push(`Directions available: ${context.availableDirections.join(', ')}`);
    }

    return reasons;
  }

  /**
   * Check if template involves object interaction
   */
  private templateInvolvesObjects(template: CommandTemplate): boolean {
    return template.pattern.includes('{OBJECT}') ||
           template.pattern.includes('{VISIBLE_OBJECT}') ||
           template.pattern.includes('{INVENTORY_OBJECT}') ||
           template.type === CommandType.OBJECT_INTERACTION;
  }

  /**
   * Count interesting objects that warrant higher interaction priority
   */
  private countInterestingObjects(objects: string[]): number {
    const interestingKeywords = [
      'treasure', 'jewel', 'gold', 'silver', 'diamond', 'emerald', 'ruby',
      'chest', 'box', 'bag', 'bottle', 'lamp', 'lantern', 'sword', 'knife',
      'key', 'door', 'window', 'book', 'scroll', 'map', 'rope', 'ladder'
    ];

    return objects.filter(obj => 
      interestingKeywords.some(keyword => 
        obj.toLowerCase().includes(keyword)
      )
    ).length;
  }

  /**
   * Check if location is indoor
   */
  private isIndoorLocation(location: string): boolean {
    const indoorKeywords = [
      'room', 'house', 'kitchen', 'living', 'attic', 'cellar', 'basement',
      'hall', 'chamber', 'office', 'study', 'library', 'bedroom', 'closet'
    ];
    
    return indoorKeywords.some(keyword => location.includes(keyword));
  }

  /**
   * Check if location is outdoor
   */
  private isOutdoorLocation(location: string): boolean {
    const outdoorKeywords = [
      'forest', 'clearing', 'path', 'road', 'field', 'meadow', 'hill',
      'mountain', 'river', 'stream', 'bridge', 'garden', 'yard', 'outside'
    ];
    
    return outdoorKeywords.some(keyword => location.includes(keyword));
  }

  /**
   * Check if location is underground
   */
  private isUndergroundLocation(location: string): boolean {
    const undergroundKeywords = [
      'cave', 'cavern', 'tunnel', 'passage', 'underground', 'dungeon',
      'crypt', 'tomb', 'mine', 'shaft', 'pit', 'well', 'cellar', 'basement'
    ];
    
    return undergroundKeywords.some(keyword => location.includes(keyword));
  }

  /**
   * Initialize default weighting configuration
   */
  private initializeDefaultConfig(config?: Partial<WeightingConfig>): WeightingConfig {
    const defaultConfig: WeightingConfig = {
      baseWeights: new Map([
        [CommandType.MOVEMENT, 1.2],
        [CommandType.EXAMINATION, 1.3],
        [CommandType.OBJECT_INTERACTION, 1.1],
        [CommandType.INVENTORY, 1.0],
        [CommandType.PUZZLE_ACTION, 0.8],
        [CommandType.COMMUNICATION, 0.6]
      ]),
      locationMultipliers: new Map(),
      objectPresenceBonus: 2.0,
      inventoryBonus: 1.5,
      contextualRelevanceBonus: 3.0
    };

    // Merge with provided config
    if (config) {
      return {
        ...defaultConfig,
        ...config,
        baseWeights: config.baseWeights || defaultConfig.baseWeights,
        locationMultipliers: config.locationMultipliers || defaultConfig.locationMultipliers
      };
    }

    return defaultConfig;
  }

  /**
   * Initialize location-specific preferences
   */
  private initializeLocationPreferences(): Map<string, LocationPreferences> {
    const preferences = new Map<string, LocationPreferences>();

    // Living Room preferences
    preferences.set('living room', {
      preferredCommands: [CommandType.EXAMINATION, CommandType.OBJECT_INTERACTION],
      discouragedCommands: [CommandType.COMMUNICATION],
      specialObjects: ['lamp', 'rug', 'trophy', 'sword'],
      contextualHints: ['Look around carefully', 'Examine objects']
    });

    // Kitchen preferences
    preferences.set('kitchen', {
      preferredCommands: [CommandType.OBJECT_INTERACTION, CommandType.EXAMINATION],
      discouragedCommands: [],
      specialObjects: ['bottle', 'water', 'sack', 'window'],
      contextualHints: ['Check containers', 'Look for useful items']
    });

    // Forest preferences
    preferences.set('forest', {
      preferredCommands: [CommandType.MOVEMENT, CommandType.EXAMINATION],
      discouragedCommands: [CommandType.OBJECT_INTERACTION],
      specialObjects: ['tree', 'path', 'leaves'],
      contextualHints: ['Explore different directions', 'Look for paths']
    });

    // Underground preferences
    preferences.set('cave', {
      preferredCommands: [CommandType.EXAMINATION, CommandType.PUZZLE_ACTION],
      discouragedCommands: [CommandType.COMMUNICATION],
      specialObjects: ['treasure', 'chest', 'passage', 'wall'],
      contextualHints: ['Search carefully', 'Look for hidden passages']
    });

    return preferences;
  }

  /**
   * Get location preferences for a given location
   */
  getLocationPreferences(location: string): LocationPreferences | null {
    return this.locationPreferences.get(location.toLowerCase()) || null;
  }

  /**
   * Update weighting configuration
   */
  updateConfig(newConfig: Partial<WeightingConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      baseWeights: newConfig.baseWeights || this.config.baseWeights,
      locationMultipliers: newConfig.locationMultipliers || this.config.locationMultipliers
    };
  }

  /**
   * Get current weighting configuration
   */
  getConfig(): WeightingConfig {
    return { ...this.config };
  }
}