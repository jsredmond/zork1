/**
 * Seeded Random Number Generator
 * 
 * Provides deterministic random numbers for testing purposes.
 * Uses a simple Linear Congruential Generator (LCG) algorithm.
 */

export class SeededRandom {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  /**
   * Reset to initial seed
   */
  reset(seed?: number): void {
    if (seed !== undefined) {
      this.seed = seed;
    }
  }

  /**
   * Get random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

/**
 * Global seeded random instance for testing
 */
let globalSeededRandom: SeededRandom | null = null;

/**
 * Enable deterministic random for testing
 */
export function enableDeterministicRandom(seed: number = 12345): void {
  globalSeededRandom = new SeededRandom(seed);
}

/**
 * Disable deterministic random (use Math.random)
 */
export function disableDeterministicRandom(): void {
  globalSeededRandom = null;
}

/**
 * Get random number (uses seeded random if enabled, otherwise Math.random)
 */
export function getRandom(): number {
  if (globalSeededRandom) {
    return globalSeededRandom.next();
  }
  return Math.random();
}

/**
 * Check if deterministic random is enabled
 */
export function isDeterministicRandomEnabled(): boolean {
  return globalSeededRandom !== null;
}

/**
 * Reset the seeded random generator
 */
export function resetDeterministicRandom(seed?: number): void {
  if (globalSeededRandom) {
    globalSeededRandom.reset(seed);
  }
}
