/**
 * Test Scripts for Common Scenarios
 * Pre-defined test scripts for basic navigation, object manipulation, and puzzle solutions
 */

import { TestScript, createTestCommand, createTestScript } from './scriptRunner.js';
import { GameState } from '../game/state.js';

/**
 * Basic navigation test script
 * Tests movement between rooms and basic room descriptions
 */
export function createBasicNavigationScript(): TestScript {
  return createTestScript(
    'basic-navigation',
    'Basic Navigation',
    'Test basic movement and room descriptions',
    [
      createTestCommand('look', undefined, true, 'Look at starting location'),
      createTestCommand('north', undefined, true, 'Move north'),
      createTestCommand('look', undefined, true, 'Look at new location'),
      createTestCommand('south', undefined, true, 'Move back south'),
      createTestCommand('east', undefined, true, 'Move east'),
      createTestCommand('look', undefined, true, 'Look at east location'),
      createTestCommand('west', undefined, true, 'Return to start'),
      createTestCommand('south', undefined, true, 'Move south'),
      createTestCommand('look', undefined, true, 'Look at south location')
    ]
  );
}

/**
 * Object manipulation test script
 * Tests taking, dropping, examining, and using objects
 */
export function createObjectManipulationScript(): TestScript {
  return createTestScript(
    'object-manipulation',
    'Object Manipulation',
    'Test basic object interactions',
    [
      createTestCommand('inventory', undefined, true, 'Check initial inventory'),
      createTestCommand('examine mailbox', undefined, true, 'Examine mailbox'),
      createTestCommand('open mailbox', undefined, true, 'Open mailbox'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet from mailbox'),
      createTestCommand('inventory', undefined, true, 'Check inventory after taking'),
      createTestCommand('read leaflet', undefined, true, 'Read the leaflet'),
      createTestCommand('drop leaflet', undefined, true, 'Drop the leaflet'),
      createTestCommand('inventory', undefined, true, 'Check inventory after dropping'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet again'),
      createTestCommand('close mailbox', undefined, true, 'Close mailbox')
    ]
  );
}

/**
 * Grating puzzle test script
 * Tests opening the grating and entering the dungeon
 */
export function createGratingPuzzleScript(): TestScript {
  return createTestScript(
    'grating-puzzle',
    'Grating Puzzle',
    'Test opening the grating and entering dungeon',
    [
      createTestCommand('south', undefined, true, 'Go to south of house'),
      createTestCommand('look', undefined, true, 'Look at location'),
      createTestCommand('open grating', undefined, false, 'Try to open grating (should fail without key)'),
      createTestCommand('north', undefined, true, 'Return north'),
      createTestCommand('west', undefined, true, 'Go west'),
      createTestCommand('open mailbox', undefined, true, 'Open mailbox'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet'),
      createTestCommand('north', undefined, true, 'Go north'),
      createTestCommand('east', undefined, true, 'Go east'),
      createTestCommand('open window', undefined, true, 'Open window'),
      createTestCommand('in', undefined, true, 'Enter house'),
      createTestCommand('take lamp', undefined, true, 'Take brass lantern'),
      createTestCommand('west', undefined, true, 'Go west'),
      createTestCommand('up', undefined, true, 'Go up to attic'),
      createTestCommand('take rope', undefined, true, 'Take rope'),
      createTestCommand('down', undefined, true, 'Go down'),
      createTestCommand('east', undefined, true, 'Go east'),
      createTestCommand('take sword', undefined, true, 'Take sword'),
      createTestCommand('open case', undefined, true, 'Open trophy case'),
      createTestCommand('west', undefined, true, 'Go west'),
      createTestCommand('out', undefined, true, 'Exit house'),
      createTestCommand('west', undefined, true, 'Go west'),
      createTestCommand('south', undefined, true, 'Go south'),
      createTestCommand('open grating', undefined, true, 'Open grating (should work now or with key)'),
      createTestCommand('down', undefined, true, 'Go down into dungeon')
    ]
  );
}

/**
 * Container interaction test script
 * Tests putting objects in containers and taking them out
 */
export function createContainerInteractionScript(): TestScript {
  return createTestScript(
    'container-interaction',
    'Container Interaction',
    'Test container operations',
    [
      createTestCommand('open mailbox', undefined, true, 'Open mailbox'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet'),
      createTestCommand('close mailbox', undefined, true, 'Close mailbox'),
      createTestCommand('put leaflet in mailbox', undefined, false, 'Try to put in closed mailbox'),
      createTestCommand('open mailbox', undefined, true, 'Open mailbox again'),
      createTestCommand('put leaflet in mailbox', undefined, true, 'Put leaflet in mailbox'),
      createTestCommand('look in mailbox', undefined, true, 'Look in mailbox'),
      createTestCommand('take leaflet from mailbox', undefined, true, 'Take leaflet from mailbox'),
      createTestCommand('inventory', undefined, true, 'Check inventory')
    ]
  );
}

/**
 * Light source test script
 * Tests turning lamp on and off, and navigating in darkness
 */
export function createLightSourceScript(): TestScript {
  return createTestScript(
    'light-source',
    'Light Source',
    'Test lamp and darkness mechanics',
    [
      createTestCommand('east', undefined, true, 'Go east'),
      createTestCommand('open window', undefined, true, 'Open window'),
      createTestCommand('in', undefined, true, 'Enter house'),
      createTestCommand('take lamp', undefined, true, 'Take lamp'),
      createTestCommand('turn on lamp', undefined, true, 'Turn on lamp'),
      createTestCommand('look', undefined, true, 'Look with lamp on'),
      createTestCommand('turn off lamp', undefined, true, 'Turn off lamp'),
      createTestCommand('look', undefined, true, 'Look with lamp off'),
      createTestCommand('turn on lamp', undefined, true, 'Turn lamp back on')
    ]
  );
}

/**
 * Invalid command test script
 * Tests error handling for invalid commands
 */
export function createInvalidCommandScript(): TestScript {
  return createTestScript(
    'invalid-commands',
    'Invalid Commands',
    'Test error handling for invalid input',
    [
      createTestCommand('xyzzy', undefined, false, 'Try nonsense command'),
      createTestCommand('take house', undefined, false, 'Try to take immovable object'),
      createTestCommand('go nowhere', undefined, false, 'Try invalid direction'),
      createTestCommand('open sky', undefined, false, 'Try to open non-openable'),
      createTestCommand('eat mailbox', undefined, false, 'Try invalid action'),
      createTestCommand('north north north', undefined, false, 'Try malformed command')
    ]
  );
}

/**
 * Inventory limits test script
 * Tests inventory capacity and weight limits
 */
export function createInventoryLimitsScript(): TestScript {
  return createTestScript(
    'inventory-limits',
    'Inventory Limits',
    'Test inventory capacity constraints',
    [
      createTestCommand('inventory', undefined, true, 'Check empty inventory'),
      createTestCommand('open mailbox', undefined, true, 'Open mailbox'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet'),
      createTestCommand('east', undefined, true, 'Go east'),
      createTestCommand('open window', undefined, true, 'Open window'),
      createTestCommand('in', undefined, true, 'Enter house'),
      createTestCommand('take lamp', undefined, true, 'Take lamp'),
      createTestCommand('take sword', undefined, true, 'Take sword'),
      createTestCommand('up', undefined, true, 'Go up'),
      createTestCommand('take rope', undefined, true, 'Take rope'),
      createTestCommand('inventory', undefined, true, 'Check full inventory')
    ]
  );
}

/**
 * Pronoun resolution test script
 * Tests IT, THEM, and ALL pronouns
 */
export function createPronounResolutionScript(): TestScript {
  return createTestScript(
    'pronoun-resolution',
    'Pronoun Resolution',
    'Test pronoun handling',
    [
      createTestCommand('examine mailbox', undefined, true, 'Examine mailbox'),
      createTestCommand('open it', undefined, true, 'Open it (mailbox)'),
      createTestCommand('look in it', undefined, true, 'Look in it'),
      createTestCommand('take leaflet', undefined, true, 'Take leaflet'),
      createTestCommand('read it', undefined, true, 'Read it (leaflet)'),
      createTestCommand('drop it', undefined, true, 'Drop it'),
      createTestCommand('take all', undefined, true, 'Take all'),
      createTestCommand('inventory', undefined, true, 'Check inventory')
    ]
  );
}

/**
 * Get all predefined test scripts
 */
export function getAllTestScripts(): TestScript[] {
  return [
    createBasicNavigationScript(),
    createObjectManipulationScript(),
    createGratingPuzzleScript(),
    createContainerInteractionScript(),
    createLightSourceScript(),
    createInvalidCommandScript(),
    createInventoryLimitsScript(),
    createPronounResolutionScript()
  ];
}

/**
 * Get test scripts by category
 */
export function getTestScriptsByCategory(category: 'navigation' | 'objects' | 'puzzles' | 'errors'): TestScript[] {
  const categoryMap: Record<string, () => TestScript[]> = {
    navigation: () => [createBasicNavigationScript()],
    objects: () => [
      createObjectManipulationScript(),
      createContainerInteractionScript(),
      createLightSourceScript(),
      createInventoryLimitsScript(),
      createPronounResolutionScript()
    ],
    puzzles: () => [createGratingPuzzleScript()],
    errors: () => [createInvalidCommandScript()]
  };

  return categoryMap[category]?.() || [];
}
