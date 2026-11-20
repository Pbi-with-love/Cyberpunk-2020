import { describe, expect, it } from "vitest";
import { createRng, parseDice, pickOne, rollDice, rollDie, rollStatFast } from "./index";

describe("dice engine", () => {
  it("produces deterministic streams for identical seeds", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => rollDie(10, a));
    const seqB = Array.from({ length: 20 }, () => rollDie(10, b));
    expect(seqA).toEqual(seqB);
  });

  it("parses dice expressions including flat constants and modifiers", () => {
    expect(parseDice("1d10")).toEqual({ count: 1, sides: 10, modifier: 0 });
    expect(parseDice("9d10")).toEqual({ count: 9, sides: 10, modifier: 0 });
    expect(parseDice("2d6+2")).toEqual({ count: 2, sides: 6, modifier: 2 });
    expect(parseDice("3d6-1")).toEqual({ count: 3, sides: 6, modifier: -1 });
    expect(parseDice("1")).toEqual({ count: 0, sides: 0, modifier: 1 });
    expect(parseDice("0")).toEqual({ count: 0, sides: 0, modifier: 0 });
    expect(() => parseDice("bad-dice")).toThrow();
  });

  it("rolls within expected bounds for expressions", () => {
    const rng = createRng(12345);
    for (let i = 0; i < 200; i += 1) {
      const r1 = rollDice("1d6+1", rng);
      expect(r1).toBeGreaterThanOrEqual(2);
      expect(r1).toBeLessThanOrEqual(7);

      const r2 = rollDice("2d6+2", rng);
      expect(r2).toBeGreaterThanOrEqual(4);
      expect(r2).toBeLessThanOrEqual(14);

      expect(rollDice("0", rng)).toBe(0);
      expect(rollDice("1", rng)).toBe(1);
    }
  });

  it("rerolls values <= 2 for fast stat generation", () => {
    const rng = createRng(999);
    for (let i = 0; i < 300; i += 1) {
      const stat = rollStatFast(rng);
      expect(stat).toBeGreaterThanOrEqual(3);
      expect(stat).toBeLessThanOrEqual(10);
    }
  });

  it("picks items from arrays safely", () => {
    const rng = createRng(7);
    const items = ["alpha", "beta", "gamma"] as const;
    for (let i = 0; i < 50; i += 1) {
      expect(items).toContain(pickOne(items, rng));
    }
    expect(() => pickOne([], rng)).toThrow();
  });
});
