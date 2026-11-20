export type Rng = () => number;

export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
}

const defaultRng: Rng = () => Math.random();

/**
 * Mulberry32 deterministic PRNG when seed is provided.
 * Falls back to default Math.random wrapper when seed is omitted.
 */
export function createRng(seed?: number): Rng {
  if (seed === undefined) {
    return defaultRng;
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollDie(sides: number, rng: Rng = defaultRng): number {
  if (!Number.isInteger(sides) || sides < 1) {
    throw new Error(`Invalid die sides: ${sides}`);
  }
  const val = Math.floor(rng() * sides) + 1;
  return Math.min(sides, Math.max(1, val));
}

export function parseDice(expr: string): DiceExpression {
  const cleaned = expr.trim().toLowerCase().replace(/\s+/g, "");
  if (/^[+-]?\d+$/.test(cleaned)) {
    return { count: 0, sides: 0, modifier: Number.parseInt(cleaned, 10) };
  }
  const match = /^(\d*)d(\d+)([+-]\d+)?$/.exec(cleaned);
  if (!match) {
    throw new Error(`Invalid dice expression: "${expr}"`);
  }
  const count = match[1] ? Number.parseInt(match[1], 10) : 1;
  const sides = Number.parseInt(match[2] ?? "0", 10);
  const modifier = match[3] ? Number.parseInt(match[3], 10) : 0;
  if (count < 0 || sides < 1) {
    throw new Error(`Invalid dice expression: "${expr}"`);
  }
  return { count, sides, modifier };
}

export function rollDice(expr: string, rng: Rng = defaultRng): number {
  const { count, sides, modifier } = parseDice(expr);
  let total = modifier;
  for (let i = 0; i < count; i += 1) {
    total += rollDie(sides, rng);
  }
  return total;
}

export function rollStatFast(rng: Rng = defaultRng, rerollAtOrBelow = 2): number {
  for (let attempt = 0; attempt < 256; attempt += 1) {
    const roll = rollDie(10, rng);
    if (roll > rerollAtOrBelow) {
      return roll;
    }
  }
  return rerollAtOrBelow + 1;
}

export function pickOne<T>(items: readonly T[], rng: Rng = defaultRng): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty array");
  }
  const idx = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[idx] as T;
}
