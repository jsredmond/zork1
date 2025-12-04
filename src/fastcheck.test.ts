/**
 * Verify fast-check property-based testing is configured
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';

describe('Property-Based Testing Setup', () => {
  it('should have fast-check configured', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  it('should support string generators', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        return s.length >= 0;
      }),
      { numRuns: 100 }
    );
  });
});
