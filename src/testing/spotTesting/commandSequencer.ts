/**
 * Command Sequencer for Logical Command Flow
 * Maintains logical command sequences and influences subsequent command generation
 */

import { 
  CommandType, 
  GeneratedCommand, 
  GameContext 
} from './types.js';

/**
 * Command flow state tracking
 */
export interface CommandFlowState {
  lastCommand: string | null;
  lastCommandType: CommandType | null;
  commandHistory: string[];
  currentFlow: CommandFlowPattern | null;
  flowStep: number;
  locationHistory: string[];
  recentObjects: string[];
  explorationState: ExplorationState;
}

/**
 * Command flow patterns for logical sequences
 */
export interface CommandFlowPattern {
  name: string;
  steps: CommandFlowStep[];
  priority: number;
  contextRequirements: string[];
}

/**
 * Individual step in a command flow
 */
export interface CommandFlowStep {
  preferredTypes: CommandType[];
  discouragedTypes: CommandType[];
  weight: number;
  description: string;
  completionCriteria?: (command: string, context: GameContext) => boolean;
}

/**
 * Exploration state tracking
 */
export interface ExplorationState {
  newLocation: boolean;
  hasExaminedRoom: boolean;
  hasCheckedInventory: boolean;
  objectsExamined: Set<string>;
  directionsExplored: Set<string>;
  interactionAttempts: number;
}

/**
 * Flow influence on command generation
 */
export interface FlowInfluence {
  typeWeights: Map<CommandType, number>;
  suggestedCommands: string[];
  discouragedCommands: string[];
  reasoning: string[];
}

/**
 * CommandSequencer maintains logical command flow and influences generation
 */
export class CommandSequencer {
  private flowState: CommandFlowState;
  private flowPatterns: CommandFlowPattern[];
  private maxHistoryLength: number = 20;

  constructor() {
    this.flowState = this.initializeFlowState();
    this.flowPatterns = this.initializeFlowPatterns();
  }

  /**
   * Update flow state after command execution
   */
  updateFlowState(command: string, commandType: CommandType, context: GameContext): void {
    // Update basic state
    this.flowState.lastCommand = command;
    this.flowState.lastCommandType = commandType;
    this.flowState.commandHistory.push(command);

    // Maintain history length
    if (this.flowState.commandHistory.length > this.maxHistoryLength) {
      this.flowState.commandHistory.shift();
    }

    // Update location tracking
    if (!this.flowState.locationHistory.includes(context.currentLocation)) {
      this.flowState.locationHistory.push(context.currentLocation);
      this.flowState.explorationState.newLocation = true;
      this.resetLocationExplorationState();
    } else {
      this.flowState.explorationState.newLocation = false;
    }

    // Update exploration state
    this.updateExplorationState(command, commandType, context);

    // Update current flow pattern
    this.updateCurrentFlow(command, commandType, context);

    // Track recent objects
    this.updateRecentObjects(command, context);
  }

  /**
   * Get flow influence for next command generation
   */
  getFlowInfluence(context: GameContext): FlowInfluence {
    const influence: FlowInfluence = {
      typeWeights: new Map(),
      suggestedCommands: [],
      discouragedCommands: [],
      reasoning: []
    };

    // Apply current flow pattern influence
    if (this.flowState.currentFlow) {
      this.applyFlowPatternInfluence(influence);
    }

    // Apply exploration-based influence
    this.applyExplorationInfluence(influence, context);

    // Apply history-based influence
    this.applyHistoryInfluence(influence);

    // Apply location-based influence
    this.applyLocationInfluence(influence, context);

    return influence;
  }

  /**
   * Check if we should start a new flow pattern
   */
  private updateCurrentFlow(command: string, commandType: CommandType, context: GameContext): void {
    // Check if current flow is complete
    if (this.flowState.currentFlow && this.isFlowComplete()) {
      this.flowState.currentFlow = null;
      this.flowState.flowStep = 0;
    }

    // Try to start a new flow pattern
    if (!this.flowState.currentFlow) {
      const newFlow = this.selectAppropriateFlow(command, commandType, context);
      if (newFlow) {
        this.flowState.currentFlow = newFlow;
        this.flowState.flowStep = 0;
      }
    } else {
      // Advance current flow
      this.advanceFlow(command, commandType, context);
    }
  }

  /**
   * Select appropriate flow pattern based on context
   */
  private selectAppropriateFlow(command: string, commandType: CommandType, context: GameContext): CommandFlowPattern | null {
    // Prioritize flows based on current situation
    const candidateFlows = this.flowPatterns.filter(flow => 
      this.flowMeetsRequirements(flow, context)
    );

    if (candidateFlows.length === 0) {
      return null;
    }

    // Sort by priority and select best match
    candidateFlows.sort((a, b) => b.priority - a.priority);

    // Consider current command type for flow selection
    for (const flow of candidateFlows) {
      if (this.isFlowAppropriateForCommand(flow, commandType, context)) {
        return flow;
      }
    }

    return candidateFlows[0]; // Fallback to highest priority
  }

  /**
   * Check if flow meets requirements
   */
  private flowMeetsRequirements(flow: CommandFlowPattern, context: GameContext): boolean {
    return flow.contextRequirements.every(requirement => {
      switch (requirement) {
        case 'new_location':
          return this.flowState.explorationState.newLocation;
        case 'has_objects':
          return context.visibleObjects.length > 0;
        case 'has_inventory':
          return context.inventory.length > 0;
        case 'unexplored_directions':
          return context.availableDirections.some(dir => 
            !this.flowState.explorationState.directionsExplored.has(dir)
          );
        default:
          return true;
      }
    });
  }

  /**
   * Check if flow is appropriate for current command
   */
  private isFlowAppropriateForCommand(flow: CommandFlowPattern, commandType: CommandType, context: GameContext): boolean {
    if (flow.steps.length === 0) return false;
    
    const firstStep = flow.steps[0];
    return firstStep.preferredTypes.includes(commandType) ||
           !firstStep.discouragedTypes.includes(commandType);
  }

  /**
   * Advance current flow to next step
   */
  private advanceFlow(command: string, commandType: CommandType, context: GameContext): void {
    if (!this.flowState.currentFlow || this.flowState.flowStep >= this.flowState.currentFlow.steps.length) {
      return;
    }

    const currentStep = this.flowState.currentFlow.steps[this.flowState.flowStep];
    
    // Check if current step is complete
    if (currentStep.completionCriteria) {
      if (currentStep.completionCriteria(command, context)) {
        this.flowState.flowStep++;
      }
    } else {
      // Auto-advance if no specific criteria
      if (currentStep.preferredTypes.includes(commandType)) {
        this.flowState.flowStep++;
      }
    }
  }

  /**
   * Check if current flow is complete
   */
  private isFlowComplete(): boolean {
    if (!this.flowState.currentFlow) return false;
    return this.flowState.flowStep >= this.flowState.currentFlow.steps.length;
  }

  /**
   * Apply flow pattern influence to command generation
   */
  private applyFlowPatternInfluence(influence: FlowInfluence): void {
    if (!this.flowState.currentFlow || this.flowState.flowStep >= this.flowState.currentFlow.steps.length) {
      return;
    }

    const currentStep = this.flowState.currentFlow.steps[this.flowState.flowStep];
    
    // Apply type preferences
    currentStep.preferredTypes.forEach(type => {
      const currentWeight = influence.typeWeights.get(type) || 1.0;
      influence.typeWeights.set(type, currentWeight * currentStep.weight);
    });

    // Apply type discouragements
    currentStep.discouragedTypes.forEach(type => {
      const currentWeight = influence.typeWeights.get(type) || 1.0;
      influence.typeWeights.set(type, currentWeight * 0.5);
    });

    influence.reasoning.push(`Following ${this.flowState.currentFlow.name} pattern (step ${this.flowState.flowStep + 1})`);
  }

  /**
   * Apply exploration-based influence
   */
  private applyExplorationInfluence(influence: FlowInfluence, context: GameContext): void {
    const exploration = this.flowState.explorationState;

    // New location - encourage examination
    if (exploration.newLocation && !exploration.hasExaminedRoom) {
      const examWeight = influence.typeWeights.get(CommandType.EXAMINATION) || 1.0;
      influence.typeWeights.set(CommandType.EXAMINATION, examWeight * 2.0);
      influence.suggestedCommands.push('look', 'examine room');
      influence.reasoning.push('New location - should examine surroundings');
    }

    // Haven't checked inventory recently
    if (!exploration.hasCheckedInventory && context.inventory.length > 0) {
      const invWeight = influence.typeWeights.get(CommandType.INVENTORY) || 1.0;
      influence.typeWeights.set(CommandType.INVENTORY, invWeight * 1.5);
      influence.suggestedCommands.push('inventory');
      influence.reasoning.push('Should check inventory');
    }

    // Unexplored directions available
    const unexploredDirections = context.availableDirections.filter(dir => 
      !exploration.directionsExplored.has(dir)
    );
    if (unexploredDirections.length > 0) {
      const moveWeight = influence.typeWeights.get(CommandType.MOVEMENT) || 1.0;
      influence.typeWeights.set(CommandType.MOVEMENT, moveWeight * 1.3);
      influence.reasoning.push(`Unexplored directions: ${unexploredDirections.join(', ')}`);
    }

    // Unexamined objects present
    const unexaminedObjects = context.visibleObjects.filter(obj => 
      !exploration.objectsExamined.has(obj)
    );
    if (unexaminedObjects.length > 0) {
      const examWeight = influence.typeWeights.get(CommandType.EXAMINATION) || 1.0;
      influence.typeWeights.set(CommandType.EXAMINATION, examWeight * 1.4);
      unexaminedObjects.slice(0, 2).forEach(obj => {
        influence.suggestedCommands.push(`examine ${obj}`);
      });
      influence.reasoning.push(`Unexamined objects: ${unexaminedObjects.slice(0, 3).join(', ')}`);
    }
  }

  /**
   * Apply history-based influence
   */
  private applyHistoryInfluence(influence: FlowInfluence): void {
    const recentCommands = this.flowState.commandHistory.slice(-5);
    
    // Count recent command types
    const typeCounts = new Map<CommandType, number>();
    recentCommands.forEach(cmd => {
      const type = this.inferCommandType(cmd);
      if (type) {
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      }
    });

    // Discourage overused types
    typeCounts.forEach((count, type) => {
      if (count >= 3) {
        const currentWeight = influence.typeWeights.get(type) || 1.0;
        influence.typeWeights.set(type, currentWeight * 0.6);
        influence.reasoning.push(`Reducing ${type} commands (used ${count} times recently)`);
      }
    });

    // Avoid immediate repetition
    if (this.flowState.lastCommand) {
      influence.discouragedCommands.push(this.flowState.lastCommand);
    }
  }

  /**
   * Apply location-based influence
   */
  private applyLocationInfluence(influence: FlowInfluence, context: GameContext): void {
    // If we've been in the same location for a while, encourage movement
    const recentLocations = this.flowState.locationHistory.slice(-3);
    const sameLocationCount = recentLocations.filter(loc => loc === context.currentLocation).length;
    
    if (sameLocationCount >= 2 && context.availableDirections.length > 0) {
      const moveWeight = influence.typeWeights.get(CommandType.MOVEMENT) || 1.0;
      influence.typeWeights.set(CommandType.MOVEMENT, moveWeight * 1.5);
      influence.reasoning.push('Been in same location - should explore');
    }
  }

  /**
   * Update exploration state based on command
   */
  private updateExplorationState(command: string, commandType: CommandType, context: GameContext): void {
    const exploration = this.flowState.explorationState;
    const lowerCommand = command.toLowerCase();

    // Track room examination
    if (commandType === CommandType.EXAMINATION && 
        (lowerCommand === 'look' || lowerCommand.includes('room') || lowerCommand.includes('around'))) {
      exploration.hasExaminedRoom = true;
    }

    // Track inventory checking
    if (commandType === CommandType.INVENTORY) {
      exploration.hasCheckedInventory = true;
    }

    // Track object examination
    context.visibleObjects.forEach(obj => {
      if (lowerCommand.includes(obj.toLowerCase())) {
        exploration.objectsExamined.add(obj);
      }
    });

    // Track direction exploration
    context.availableDirections.forEach(dir => {
      if (lowerCommand.includes(dir.toLowerCase()) && commandType === CommandType.MOVEMENT) {
        exploration.directionsExplored.add(dir);
      }
    });

    // Track interaction attempts
    if (commandType === CommandType.OBJECT_INTERACTION || commandType === CommandType.PUZZLE_ACTION) {
      exploration.interactionAttempts++;
    }
  }

  /**
   * Update recent objects tracking
   */
  private updateRecentObjects(command: string, context: GameContext): void {
    const lowerCommand = command.toLowerCase();
    
    // Find objects mentioned in command
    const mentionedObjects = context.visibleObjects.concat(context.inventory)
      .filter(obj => lowerCommand.includes(obj.toLowerCase()));

    // Add to recent objects (keep last 10)
    mentionedObjects.forEach(obj => {
      if (!this.flowState.recentObjects.includes(obj)) {
        this.flowState.recentObjects.push(obj);
        if (this.flowState.recentObjects.length > 10) {
          this.flowState.recentObjects.shift();
        }
      }
    });
  }

  /**
   * Reset exploration state for new location
   */
  private resetLocationExplorationState(): void {
    this.flowState.explorationState.hasExaminedRoom = false;
    this.flowState.explorationState.hasCheckedInventory = false;
    this.flowState.explorationState.objectsExamined.clear();
    this.flowState.explorationState.directionsExplored.clear();
    this.flowState.explorationState.interactionAttempts = 0;
  }

  /**
   * Infer command type from command string
   */
  private inferCommandType(command: string): CommandType | null {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.match(/^(go |north|south|east|west|up|down|ne|nw|se|sw|n|s|e|w|u|d|in|out|enter|exit)/)) {
      return CommandType.MOVEMENT;
    }
    if (lowerCommand.match(/^(look|examine|read|l|x)/)) {
      return CommandType.EXAMINATION;
    }
    if (lowerCommand.match(/^(take|get|drop|put|open|close)/)) {
      return CommandType.OBJECT_INTERACTION;
    }
    if (lowerCommand.match(/^(inventory|i)$/)) {
      return CommandType.INVENTORY;
    }
    if (lowerCommand.match(/^(push|pull|turn|move|climb|search|wait)/)) {
      return CommandType.PUZZLE_ACTION;
    }
    if (lowerCommand.match(/^(hello|say|yell)/)) {
      return CommandType.COMMUNICATION;
    }
    
    return null;
  }

  /**
   * Initialize flow state
   */
  private initializeFlowState(): CommandFlowState {
    return {
      lastCommand: null,
      lastCommandType: null,
      commandHistory: [],
      currentFlow: null,
      flowStep: 0,
      locationHistory: [],
      recentObjects: [],
      explorationState: {
        newLocation: true,
        hasExaminedRoom: false,
        hasCheckedInventory: false,
        objectsExamined: new Set(),
        directionsExplored: new Set(),
        interactionAttempts: 0
      }
    };
  }

  /**
   * Initialize flow patterns
   */
  private initializeFlowPatterns(): CommandFlowPattern[] {
    return [
      // New Location Exploration Pattern
      {
        name: 'New Location Exploration',
        priority: 10,
        contextRequirements: ['new_location'],
        steps: [
          {
            preferredTypes: [CommandType.EXAMINATION],
            discouragedTypes: [CommandType.MOVEMENT],
            weight: 2.0,
            description: 'Look around new location',
            completionCriteria: (cmd) => cmd.toLowerCase().includes('look')
          },
          {
            preferredTypes: [CommandType.EXAMINATION, CommandType.OBJECT_INTERACTION],
            discouragedTypes: [],
            weight: 1.5,
            description: 'Examine objects and surroundings',
            completionCriteria: (cmd, ctx) => ctx.visibleObjects.some(obj => 
              cmd.toLowerCase().includes(obj.toLowerCase())
            )
          },
          {
            preferredTypes: [CommandType.INVENTORY],
            discouragedTypes: [],
            weight: 1.3,
            description: 'Check inventory',
            completionCriteria: (cmd) => cmd.toLowerCase().match(/^(inventory|i)$/) !== null
          }
        ]
      },

      // Object Investigation Pattern
      {
        name: 'Object Investigation',
        priority: 8,
        contextRequirements: ['has_objects'],
        steps: [
          {
            preferredTypes: [CommandType.EXAMINATION],
            discouragedTypes: [CommandType.MOVEMENT],
            weight: 1.8,
            description: 'Examine interesting objects'
          },
          {
            preferredTypes: [CommandType.OBJECT_INTERACTION, CommandType.PUZZLE_ACTION],
            discouragedTypes: [],
            weight: 1.4,
            description: 'Interact with objects'
          }
        ]
      },

      // Systematic Exploration Pattern
      {
        name: 'Systematic Exploration',
        priority: 6,
        contextRequirements: ['unexplored_directions'],
        steps: [
          {
            preferredTypes: [CommandType.EXAMINATION],
            discouragedTypes: [],
            weight: 1.2,
            description: 'Look before moving'
          },
          {
            preferredTypes: [CommandType.MOVEMENT],
            discouragedTypes: [CommandType.COMMUNICATION],
            weight: 1.6,
            description: 'Explore new directions'
          }
        ]
      },

      // Inventory Management Pattern
      {
        name: 'Inventory Management',
        priority: 5,
        contextRequirements: ['has_inventory'],
        steps: [
          {
            preferredTypes: [CommandType.INVENTORY],
            discouragedTypes: [],
            weight: 1.5,
            description: 'Check current inventory'
          },
          {
            preferredTypes: [CommandType.EXAMINATION, CommandType.OBJECT_INTERACTION],
            discouragedTypes: [],
            weight: 1.3,
            description: 'Examine or use inventory items'
          }
        ]
      }
    ];
  }

  /**
   * Get current flow state (for debugging/testing)
   */
  getFlowState(): CommandFlowState {
    return { ...this.flowState };
  }

  /**
   * Reset flow state
   */
  resetFlowState(): void {
    this.flowState = this.initializeFlowState();
  }
}