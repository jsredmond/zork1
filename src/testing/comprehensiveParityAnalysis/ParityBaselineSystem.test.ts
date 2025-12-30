/**
 * Property Tests for ParityBaselineSystem
 * Tests Property 12: Parity Measurement Accuracy
 * Validates: Requirements 5.1
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { DifferenceType, IssueSeverity, CommandDifference } from "../spotTesting/types.js";
import { ParityBaselineSystem, ISpotTestRunner, BaselineSystemConfig } from "./ParityBaselineSystem.js";

vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(false)
}));

vi.mock("../spotTesting/spotTestRunner.js", () => ({
  SpotTestRunner: vi.fn().mockImplementation(() => ({
    runSpotTest: vi.fn().mockResolvedValue({ totalCommands: 100, differences: [], parityScore: 100 })
  }))
}));

const CFG: Partial<BaselineSystemConfig> = {
  baselineFilePath: "test.json",
  progressFilePath: "prog.json",
  targetParity: 95,
  minimumParity: 70,
  validationSeeds: [12345],
  commandCount: 100
};

function mkDiff(i: number, t: DifferenceType = DifferenceType.TIMING_DIFFERENCE): CommandDifference {
  return { commandIndex: i, command: `cmd-${i}`, tsOutput: "ts", zmOutput: "zm", differenceType: t, severity: IssueSeverity.MEDIUM };
}

function mkRunner(total: number, diffs: CommandDifference[], score?: number): ISpotTestRunner {
  const p = score ?? ((total - diffs.length) / total) * 100;
  return { runSpotTest: vi.fn().mockResolvedValue({ totalCommands: total, differences: diffs, parityScore: p }) };
}

describe("ParityBaselineSystem", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("Property 12: Parity Measurement Accuracy", () => {
    it("calculates parity accurately", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 10, max: 200 }), fc.integer({ min: 0, max: 200 }), async (tot, dc) => {
        const n = Math.min(dc, tot);
        const exp = ((tot - n) / tot) * 100;
        const sys = new ParityBaselineSystem(CFG, mkRunner(tot, Array.from({ length: n }, (_, i) => mkDiff(i)), exp));
        const b = await sys.establishBaseline(12345);
        expect(b.parityPercentage).toBeCloseTo(exp, 5);
      }), { numRuns: 100 });
    });


    it("reports 100% when no diffs", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 10, max: 200 }), async (tot) => {
        const sys = new ParityBaselineSystem(CFG, mkRunner(tot, [], 100));
        const b = await sys.establishBaseline(12345);
        expect(b.parityPercentage).toBe(100);
      }), { numRuns: 100 });
    });

    it("detects regressions", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 50, max: 95 }), fc.integer({ min: 1, max: 30 }), async (bp, drop) => {
        const tot = 200;
        const cur = Math.max(0, bp - drop);
        let c = 0;
        const r: ISpotTestRunner = {
          runSpotTest: vi.fn().mockImplementation(async () => {
            c++;
            const p = c === 1 ? bp : cur;
            const dc = Math.round((100 - p) / 100 * tot);
            return { totalCommands: tot, differences: Array.from({ length: dc }, (_, i) => mkDiff(i)), parityScore: p };
          })
        };
        const sys = new ParityBaselineSystem(CFG, r);
        await sys.establishBaseline(12345);
        const chk = await sys.validateChange(12345);
        expect(chk.hasRegression).toBe(true);
      }), { numRuns: 100 });
    });

    it("detects improvements", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 50, max: 85 }), fc.integer({ min: 1, max: 15 }), async (bp, gain) => {
        const tot = 200;
        const cur = Math.min(100, bp + gain);
        let c = 0;
        const r: ISpotTestRunner = {
          runSpotTest: vi.fn().mockImplementation(async () => {
            c++;
            const p = c === 1 ? bp : cur;
            const dc = Math.round((100 - p) / 100 * tot);
            return { totalCommands: tot, differences: Array.from({ length: dc }, (_, i) => mkDiff(i)), parityScore: p };
          })
        };
        const sys = new ParityBaselineSystem(CFG, r);
        await sys.establishBaseline(12345);
        const chk = await sys.validateChange(12345);
        expect(chk.hasRegression).toBe(false);
      }), { numRuns: 100 });
    });


    it("recommends rollback on big drop", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 70, max: 95 }), fc.integer({ min: 6, max: 30 }), async (bp, drop) => {
        const tot = 200;
        const cur = Math.max(0, bp - drop);
        let c = 0;
        const r: ISpotTestRunner = {
          runSpotTest: vi.fn().mockImplementation(async () => {
            c++;
            const p = c === 1 ? bp : cur;
            const dc = Math.round((100 - p) / 100 * tot);
            return { totalCommands: tot, differences: Array.from({ length: dc }, (_, i) => mkDiff(i)), parityScore: p };
          })
        };
        const sys = new ParityBaselineSystem(CFG, r);
        await sys.establishBaseline(12345);
        const chk = await sys.validateChange(12345);
        expect(chk.recommendation).toBe("rollback");
      }), { numRuns: 100 });
    });

    it("tracks progress", async () => {
      await fc.assert(fc.asyncProperty(fc.array(fc.integer({ min: 60, max: 100 }), { minLength: 2, maxLength: 10 }), async (vals) => {
        const tot = 200;
        let idx = 0;
        const r: ISpotTestRunner = {
          runSpotTest: vi.fn().mockImplementation(async () => {
            const p = vals[Math.min(idx++, vals.length - 1)];
            const dc = Math.round((100 - p) / 100 * tot);
            return { totalCommands: tot, differences: Array.from({ length: dc }, (_, i) => mkDiff(i)), parityScore: p };
          })
        };
        const sys = new ParityBaselineSystem(CFG, r);
        await sys.establishBaseline(12345);
        for (let i = 1; i < vals.length; i++) { await sys.validateChange(12345); }
        const prog = sys.trackProgress();
        expect(prog.startingParity).toBe(vals[0]);
        expect(prog.currentParity).toBe(vals[vals.length - 1]);
      }), { numRuns: 100 });
    });

    it("categorizes by type", async () => {
      await fc.assert(fc.asyncProperty(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 10 }), async (t, o, p) => {
        const tot = 200;
        const diffs: CommandDifference[] = [];
        let idx = 0;
        for (let i = 0; i < t; i++) { diffs.push(mkDiff(idx++, DifferenceType.TIMING_DIFFERENCE)); }
        for (let i = 0; i < o; i++) { diffs.push(mkDiff(idx++, DifferenceType.OBJECT_BEHAVIOR)); }
        for (let i = 0; i < p; i++) { diffs.push(mkDiff(idx++, DifferenceType.PARSER_DIFFERENCE)); }
        const sys = new ParityBaselineSystem(CFG, mkRunner(tot, diffs));
        const b = await sys.establishBaseline(12345);
        expect(b.categoryBreakdown.timing).toBe(t);
        expect(b.categoryBreakdown.objectBehavior).toBe(o);
        expect(b.categoryBreakdown.parser).toBe(p);
      }), { numRuns: 100 });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty baseline", async () => {
      const sys = new ParityBaselineSystem(CFG, mkRunner(200, [], 100));
      const chk = await sys.validateChange(12345);
      expect(chk.hasRegression).toBe(false);
    });

    it("handles 0% parity", async () => {
      const diffs = Array.from({ length: 200 }, (_, i) => mkDiff(i));
      const sys = new ParityBaselineSystem(CFG, mkRunner(200, diffs, 0));
      const b = await sys.establishBaseline(12345);
      expect(b.parityPercentage).toBe(0);
    });
  });
});
