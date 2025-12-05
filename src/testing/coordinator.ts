/**
 * Test Coordinator
 * Orchestrates test execution and manages test state
 * Handles test interruption and resumption
 */

import { GameState } from '../game/state';
import { 
  TestOptions, 
  TestResults, 
  TestResult, 
  TestProgress,
  BugReport 
} from './types';
import { 
  loadTestProgress, 
  saveTestProgress, 
  createEmptyTestProgress,
  addBugReport 
} from './persistence';
import { 
  addTestedRoom, 
  addTestedObject, 
  addTestedInteraction,
  incrementTestCount 
} from './testProgress';
import { updateCoverage, generateCoverageSummary } from './coverage';
import { RoomTester, executeRoomTestsForSubset } from './roomTester';
import { ObjectTester, executeObjectTestsForSubset } from './objectTester';
import { createBugReportFromTest } from './bugTracker';

/**
 * TestCoordinator class for orchestrating test execution
 */
export class TestCoordinator {
  private progress: TestProgress;
  private testCount: number = 0;
  private saveInterval: number = 10; // Save after every 10 tests
  private interrupted: boolean = false;
  private autoSave: boolean = true;
  
  constructor(autoSave: boolean = true) {
    // Load existing progress or create new
    const loaded = loadTestProgress();
    this.progress = loaded || createEmptyTestProgress();
    this.autoSave = autoSave;
  }
  
  /**
   * Load test progress from file
   */
  loadProgress(): TestProgress {
    const loaded = loadTestProgress();
    if (loaded) {
      this.progress = loaded;
    }
    return this.progress;
  }
  
  /**
   * Save test progress to file
   */
  saveProgress(progress: TestProgress): void {
    // Update coverage before saving
    const updatedProgress = updateCoverage(progress);
    saveTestProgress(updatedProgress);
    this.progress = updatedProgress;
  }
  
  /**
   * Force save current progress immediately
   */
  forceSave(): void {
    this.saveProgress(this.progress);
  }
  
  /**
   * Reset test progress to start fresh
   */
  resetProgress(): void {
    this.progress = createEmptyTestProgress();
    this.saveProgress(this.progress);
  }
  
  /**
   * Set the save interval (number of tests between saves)
   */
  setSaveInterval(interval: number): void {
    if (interval < 1) {
      throw new Error('Save interval must be at least 1');
    }
    this.saveInterval = interval;
  }
  
  /**
   * Get the current save interval
   */
  getSaveInterval(): number {
    return this.saveInterval;
  }
  
  /**
   * Enable or disable auto-save
   */
  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
  }
  
  /**
   * Run tests with specified options
   */
  async runTests(options: TestOptions, state: GameState): Promise<TestResults> {
    this.interrupted = false;
    this.testCount = 0;
    
    const allResults: TestResult[] = [];
    const allBugs: BugReport[] = [];
    let testsExecuted = 0;
    
    // Determine which test types to run (default all to true)
    const testRooms = options.testRooms !== false;
    const testObjects = options.testObjects !== false;
    const testPuzzles = options.testPuzzles === true;
    const testNPCs = options.testNPCs === true;
    const testEdgeCases = options.testEdgeCases === true;
    
    // Apply max tests limit
    const maxTests = options.maxTests || Infinity;
    
    // Run room tests if enabled
    if (testRooms && testsExecuted < maxTests && !this.interrupted) {
      const roomResults = await this.runRoomTests(
        options,
        state,
        maxTests - testsExecuted
      );
      allResults.push(...roomResults.results);
      allBugs.push(...roomResults.bugs);
      testsExecuted += roomResults.testsRun;
    }
    
    // Run object tests if enabled
    if (testObjects && testsExecuted < maxTests && !this.interrupted) {
      const objectResults = await this.runObjectTests(
        options,
        state,
        maxTests - testsExecuted
      );
      allResults.push(...objectResults.results);
      allBugs.push(...objectResults.bugs);
      testsExecuted += objectResults.testsRun;
    }
    
    // TODO: Add puzzle, NPC, and edge case tests when those modules are ready
    // if (testPuzzles && testsExecuted < maxTests && !this.interrupted) { ... }
    // if (testNPCs && testsExecuted < maxTests && !this.interrupted) { ... }
    // if (testEdgeCases && testsExecuted < maxTests && !this.interrupted) { ... }
    
    // Save final progress
    this.saveProgress(this.progress);
    
    // Calculate final statistics
    const passedTests = allResults.filter(r => r.passed).length;
    const failedTests = allResults.filter(r => !r.passed).length;
    
    return {
      results: allResults,
      totalTests: allResults.length,
      passedTests,
      failedTests,
      bugsFound: allBugs.length,
      coverage: this.progress.coverage
    };
  }
  
  /**
   * Resume tests from where they left off
   */
  async resumeTests(state: GameState): Promise<TestResults> {
    // Load progress
    this.loadProgress();
    
    // Resume with default options, testing untested items
    const options: TestOptions = {
      testRooms: true,
      testObjects: true
    };
    
    return this.runTests(options, state);
  }
  
  /**
   * Interrupt test execution
   * Always saves progress regardless of auto-save setting
   */
  interrupt(): void {
    this.interrupted = true;
    // Always save progress on interruption
    this.saveProgress(this.progress);
  }
  
  /**
   * Check if test execution was interrupted
   */
  wasInterrupted(): boolean {
    return this.interrupted;
  }
  
  /**
   * Run room tests with filtering
   */
  private async runRoomTests(
    options: TestOptions,
    state: GameState,
    maxTests: number
  ): Promise<{ results: TestResult[]; bugs: BugReport[]; testsRun: number }> {
    const results: TestResult[] = [];
    const bugs: BugReport[] = [];
    let testsRun = 0;
    
    // Get all room IDs
    let roomIds = Array.from(state.rooms.keys());
    
    // Apply room filter if specified
    if (options.roomFilter && options.roomFilter.length > 0) {
      roomIds = roomIds.filter(id => options.roomFilter!.includes(id));
    }
    
    // Filter out already tested rooms (for resumption)
    roomIds = roomIds.filter(id => !this.progress.testedRooms.includes(id));
    
    // Limit by maxTests
    const roomsToTest = roomIds.slice(0, Math.floor(maxTests / 3)); // ~3 tests per room
    
    // Execute tests for each room
    for (const roomId of roomsToTest) {
      if (this.interrupted) break;
      
      const roomResult = executeRoomTestsForSubset([roomId], state);
      results.push(...roomResult.results);
      bugs.push(...roomResult.bugsFound);
      
      // Update progress
      this.progress = addTestedRoom(this.progress, roomId);
      this.progress = incrementTestCount(this.progress);
      testsRun += roomResult.results.length;
      this.testCount++;
      
      // Save bugs
      for (const bug of roomResult.bugsFound) {
        addBugReport(bug);
      }
      
      // Save progress periodically if auto-save is enabled
      if (this.autoSave && this.testCount % this.saveInterval === 0) {
        this.saveProgress(this.progress);
      }
    }
    
    return { results, bugs, testsRun };
  }
  
  /**
   * Run object tests with filtering
   */
  private async runObjectTests(
    options: TestOptions,
    state: GameState,
    maxTests: number
  ): Promise<{ results: TestResult[]; bugs: BugReport[]; testsRun: number }> {
    const results: TestResult[] = [];
    const bugs: BugReport[] = [];
    let testsRun = 0;
    
    // Get all object IDs
    let objectIds = Array.from(state.objects.keys());
    
    // Apply object filter if specified
    if (options.objectFilter && options.objectFilter.length > 0) {
      objectIds = objectIds.filter(id => options.objectFilter!.includes(id));
    }
    
    // Filter out already tested objects (for resumption)
    objectIds = objectIds.filter(id => !this.progress.testedObjects.includes(id));
    
    // Limit by maxTests
    const objectsToTest = objectIds.slice(0, Math.floor(maxTests / 5)); // ~5 tests per object
    
    // Execute tests for each object
    for (const objectId of objectsToTest) {
      if (this.interrupted) break;
      
      const objectResult = executeObjectTestsForSubset([objectId], state);
      results.push(...objectResult.results);
      bugs.push(...objectResult.bugsFound);
      
      // Update progress
      this.progress = addTestedObject(this.progress, objectId);
      this.progress = incrementTestCount(this.progress);
      testsRun += objectResult.results.length;
      this.testCount++;
      
      // Track interactions
      for (const result of objectResult.results) {
        // Extract verb from test type (simplified)
        const verb = this.extractVerbFromTestType(result.testType.toString());
        if (verb) {
          this.progress = addTestedInteraction(this.progress, objectId, verb);
        }
      }
      
      // Save bugs
      for (const bug of objectResult.bugsFound) {
        addBugReport(bug);
      }
      
      // Save progress periodically if auto-save is enabled
      if (this.autoSave && this.testCount % this.saveInterval === 0) {
        this.saveProgress(this.progress);
      }
    }
    
    return { results, bugs, testsRun };
  }
  
  /**
   * Extract verb from test type for interaction tracking
   */
  private extractVerbFromTestType(testType: string): string | null {
    const mapping: Record<string, string> = {
      'OBJECT_EXAMINE': 'EXAMINE',
      'OBJECT_TAKE': 'TAKE',
      'OBJECT_ACTION': 'ACTION'
    };
    
    return mapping[testType] || null;
  }
  
  /**
   * Get current test progress
   */
  getProgress(): TestProgress {
    return this.progress;
  }
  
  /**
   * Get coverage summary
   */
  getCoverageSummary() {
    return generateCoverageSummary(this.progress);
  }
  
  /**
   * Filter rooms based on test options
   * Returns list of room IDs to test
   */
  filterRooms(state: GameState, options: TestOptions): string[] {
    let roomIds = Array.from(state.rooms.keys());
    
    // Apply room filter if specified
    if (options.roomFilter && options.roomFilter.length > 0) {
      roomIds = roomIds.filter(id => options.roomFilter!.includes(id));
    }
    
    return roomIds;
  }
  
  /**
   * Filter objects based on test options
   * Returns list of object IDs to test
   */
  filterObjects(state: GameState, options: TestOptions): string[] {
    let objectIds = Array.from(state.objects.keys());
    
    // Apply object filter if specified
    if (options.objectFilter && options.objectFilter.length > 0) {
      objectIds = objectIds.filter(id => options.objectFilter!.includes(id));
    }
    
    return objectIds;
  }
  
  /**
   * Get untested rooms
   */
  getUntestedRooms(state: GameState): string[] {
    const allRooms = Array.from(state.rooms.keys());
    return allRooms.filter(id => !this.progress.testedRooms.includes(id));
  }
  
  /**
   * Get untested objects
   */
  getUntestedObjects(state: GameState): string[] {
    const allObjects = Array.from(state.objects.keys());
    return allObjects.filter(id => !this.progress.testedObjects.includes(id));
  }
  
  /**
   * Create test options for specific test types
   */
  static createOptions(config: {
    rooms?: boolean;
    objects?: boolean;
    puzzles?: boolean;
    npcs?: boolean;
    edgeCases?: boolean;
    roomFilter?: string[];
    objectFilter?: string[];
    maxTests?: number;
  }): TestOptions {
    return {
      testRooms: config.rooms,
      testObjects: config.objects,
      testPuzzles: config.puzzles,
      testNPCs: config.npcs,
      testEdgeCases: config.edgeCases,
      roomFilter: config.roomFilter,
      objectFilter: config.objectFilter,
      maxTests: config.maxTests
    };
  }
}
