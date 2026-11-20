import { STAT_KEYS, statsData } from "../data";
import type { DerivedStats, DerivedTableEntry, StatKey } from "../types";

function lookupTable(
  table: DerivedTableEntry[] | undefined,
  body: number,
): DerivedTableEntry {
  if (!table || table.length === 0) {
    return { min: 2, max: 10, value: 0 };
  }
  const exact = table.find((row) => body >= row.min && body <= row.max);
  if (exact) {
    return exact;
  }
  if (body < (table[0]?.min ?? 2)) {
    return table[0] as DerivedTableEntry;
  }
  return table[table.length - 1] as DerivedTableEntry;
}

export function deriveStats(stats: Record<StatKey, number>): DerivedStats {
  const run = stats.MA * 3;
  const leap = run / 4;
  const lift = stats.BODY * 40;
  const humanity = stats.EMP * 10;
  const save = stats.BODY;

  const btmDef = statsData.derived.find((d) => d.key === "btm");
  const bdmDef = statsData.derived.find((d) => d.key === "bdm");
  const btmEntry = lookupTable(btmDef?.table, stats.BODY);
  const bdmEntry = lookupTable(bdmDef?.table, stats.BODY);

  return {
    run,
    leap,
    lift,
    humanity,
    save,
    btm: btmEntry.value,
    btmLabel: btmEntry.label ?? "",
    bdm: bdmEntry.value,
  };
}

export function sumStats(values: Record<StatKey, number>): number {
  return STAT_KEYS.reduce((acc, key) => acc + (values[key] ?? 0), 0);
}

export function pickupPoints(stats: Record<StatKey, number>): number {
  return stats.INT + stats.REF;
}
