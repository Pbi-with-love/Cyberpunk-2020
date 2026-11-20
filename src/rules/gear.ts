import { catalogById, cyberwareById, gearData } from "../data";
import { rollDice, type Rng } from "../dice";
import type { GearItemSelection } from "../types";

export function getMonthlySalary(roleId: string, specialAbilityLevel: number): number {
  const table = gearData.startingMoney.salaryBySpecialAbilityLevel[roleId];
  if (!table || table.length === 0) {
    return 1000;
  }
  const clamped = Math.max(1, Math.min(table.length, Math.floor(specialAbilityLevel || 1)));
  return table[clamped - 1] ?? table[0] ?? 1000;
}

export function calculateStartingMoney(
  roleId: string,
  specialAbilityLevel: number,
  multiplierRoll = 1,
): number {
  const salary = getMonthlySalary(roleId, specialAbilityLevel);
  const months = Math.max(1, Math.ceil(multiplierRoll / 3));
  return salary * months;
}

export function rollStartingMoney(
  roleId: string,
  specialAbilityLevel: number,
  rng?: Rng,
): number {
  const d6 = rollDice(gearData.startingMoney.multiplierDice, rng);
  return calculateStartingMoney(roleId, specialAbilityLevel, d6);
}

export function calculateGearCost(items: GearItemSelection[]): number {
  return items.reduce((sum, item) => {
    const catalog = catalogById[item.itemId];
    return sum + (catalog ? catalog.cost : 0);
  }, 0);
}

export function calculateRemainingMoney(
  startingMoney: number,
  items: GearItemSelection[],
): number {
  return startingMoney - calculateGearCost(items);
}

export function rollCyberwareHumanityCost(cyberwareId: string, rng?: Rng): number {
  const cw = cyberwareById[cyberwareId];
  if (!cw) return 0;
  return Math.max(0, rollDice(cw.humanityCost, rng));
}

export function applyCyberware(
  baseEmp: number,
  items: GearItemSelection[],
): {
  baseHumanity: number;
  humanityLoss: number;
  humanity: number;
  emp: number;
  cyberpsychosis: boolean;
} {
  const baseHumanity = baseEmp * 10;
  const humanityLoss = items.reduce((sum, item) => {
    if (!cyberwareById[item.itemId]) return sum;
    return sum + Math.max(0, item.humanityCostRolled ?? 0);
  }, 0);
  const humanity = baseHumanity - humanityLoss;
  const emp = Math.max(0, Math.floor(humanity / 10));
  return {
    baseHumanity,
    humanityLoss,
    humanity,
    emp,
    cyberpsychosis: humanity <= 0,
  };
}

export function getMissingRequirements(
  cyberwareId: string,
  ownedItems: GearItemSelection[],
): string[] {
  const cw = cyberwareById[cyberwareId];
  if (!cw?.requires || cw.requires.length === 0) return [];
  const ownedSet = new Set(ownedItems.map((i) => i.itemId));
  return cw.requires.filter((req) => !ownedSet.has(req));
}
