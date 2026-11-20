import {
  STAT_KEYS,
  catalogById,
  cyberwareById,
  rolesById,
  statsData,
} from "../data";
import type { Character, ValidationError, WizardStep } from "../types";
import { sumStats, pickupPoints } from "./derived";
import { calculateGearCost, calculateRemainingMoney, getMissingRequirements } from "./gear";
import { expectedLifeEventCount } from "./lifepath";
import {
  baseSkillId,
  getActiveCareerSkillsForCharacter,
  getCareerPointLimit,
  getMaxSkillLevel,
  getSkillDef,
  isSkillAllowedForPickup,
  sumSkillPoints,
} from "./skills";

export function validateStep(
  step: WizardStep,
  character: Character,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (step === 1) {
    if (character.identity.handle.trim().length === 0) {
      errors.push({
        step: 1,
        field: "identity.handle",
        message: "Handle is required.",
      });
    }
    if (!rolesById[character.identity.roleId]) {
      errors.push({
        step: 1,
        field: "identity.roleId",
        message: "Please select a valid Role.",
      });
    }
    if (
      !Number.isInteger(character.identity.age) ||
      character.identity.age < 16 ||
      character.identity.age > 120
    ) {
      errors.push({
        step: 1,
        field: "identity.age",
        message: "Age must be an integer between 16 and 120.",
      });
    }
    if (
      !Number.isInteger(character.identity.reputation) ||
      character.identity.reputation < 0 ||
      character.identity.reputation > 10
    ) {
      errors.push({
        step: 1,
        field: "identity.reputation",
        message: "Reputation must be between 0 and 10.",
      });
    }
    return errors;
  }

  if (step === 2) {
    const { min, max } = statsData.range;
    for (const key of STAT_KEYS) {
      const val = character.stats.values[key];
      if (!Number.isInteger(val) || val < min || val > max) {
        errors.push({
          step: 2,
          field: `stats.values.${key}`,
          message: `Stat ${key} must be an integer between ${min} and ${max}.`,
        });
      }
    }
    const spent = sumStats(character.stats.values);
    const pool = character.stats.points;
    if (spent > pool) {
      errors.push({
        step: 2,
        field: "stats.points",
        message:
          character.stats.method === "fast"
            ? `Stat total exceeds Fast roll pool (${spent} / ${pool}).`
            : `Too many stat points spent (${spent} / ${pool}).`,
      });
    }
    return errors;
  }

  if (step === 3) {
    const careerLimit = getCareerPointLimit();
    const careerSpent = sumSkillPoints(character.skills.career);
    if (careerSpent > careerLimit) {
      errors.push({
        step: 3,
        field: "skills.career",
        message: `Career skill points exceed ${careerLimit} (${careerSpent} / ${careerLimit}).`,
      });
    }

    const pickupLimit = pickupPoints(character.stats.values);
    const pickupSpent = sumSkillPoints(character.skills.pickup);
    if (pickupSpent > pickupLimit) {
      errors.push({
        step: 3,
        field: "skills.pickup",
        message: `Pickup skill points exceed ${pickupLimit} (${pickupSpent} / ${pickupLimit}).`,
      });
    }

    const activeCareerSet = new Set(getActiveCareerSkillsForCharacter(character));
    for (const [skillKey, val] of Object.entries(character.skills.career)) {
      if (val <= 0) continue;
      const base = baseSkillId(skillKey);
      if (!activeCareerSet.has(skillKey) && !activeCareerSet.has(base)) {
        const def = getSkillDef(skillKey);
        errors.push({
          step: 3,
          field: `skills.career.${skillKey}`,
          message: `Skill ${def?.name ?? skillKey} is not an active career skill for this role.`,
        });
      }
    }

    for (const [skillKey, val] of Object.entries(character.skills.pickup)) {
      if (val <= 0) continue;
      if (!isSkillAllowedForPickup(character.identity.roleId, skillKey)) {
        const def = getSkillDef(skillKey);
        errors.push({
          step: 3,
          field: `skills.pickup.${skillKey}`,
          message: `Cannot spend pickup points on another role's Special Ability (${def?.name ?? skillKey}).`,
        });
      }
    }

    const maxLevel = getMaxSkillLevel();
    const allKeys = new Set([
      ...Object.keys(character.skills.career),
      ...Object.keys(character.skills.pickup),
    ]);
    for (const skillKey of allKeys) {
      const cVal = character.skills.career[skillKey] ?? 0;
      const pVal = character.skills.pickup[skillKey] ?? 0;
      const total = cVal + pVal;
      const def = getSkillDef(skillKey);
      if (
        !Number.isInteger(cVal) ||
        !Number.isInteger(pVal) ||
        cVal < 0 ||
        pVal < 0 ||
        total > maxLevel
      ) {
        errors.push({
          step: 3,
          field: `skills.${skillKey}`,
          message: `Skill ${def?.name ?? skillKey} level must be an integer between 0 and ${maxLevel}.`,
        });
      }
      if (def?.needsDetail && total > 0) {
        const detail = (character.skills.details[skillKey] ?? "").trim();
        if (detail.length === 0) {
          errors.push({
            step: 3,
            field: `skills.details.${skillKey}`,
            message: `Please specify ${def.detailLabel ?? "Detail"} for ${def.name}.`,
          });
        }
      }
    }
    return errors;
  }

  if (step === 4) {
    const expected = expectedLifeEventCount(character.identity.age);
    if (character.lifepath.events.length !== expected) {
      errors.push({
        step: 4,
        field: "lifepath.events",
        message: `Expected ${expected} life events for age ${character.identity.age}, found ${character.lifepath.events.length}.`,
      });
    }
    return errors;
  }

  if (step === 5) {
    const remaining = calculateRemainingMoney(
      character.gear.startingMoney,
      character.gear.items,
    );
    if (remaining < 0) {
      const spent = calculateGearCost(character.gear.items);
      errors.push({
        step: 5,
        field: "gear.items",
        message: `Total gear cost exceeds starting money (${spent} eb / ${character.gear.startingMoney} eb).`,
      });
    }
    for (const item of character.gear.items) {
      if (!catalogById[item.itemId]) {
        errors.push({
          step: 5,
          field: `gear.items.${item.itemId}`,
          message: `Unknown gear item: ${item.itemId}.`,
        });
        continue;
      }
      const cw = cyberwareById[item.itemId];
      if (cw) {
        const missing = getMissingRequirements(item.itemId, character.gear.items);
        for (const reqId of missing) {
          const reqName = cyberwareById[reqId]?.name ?? reqId;
          errors.push({
            step: 5,
            field: `gear.items.${item.itemId}`,
            message: `Cyberware ${cw.name} requires ${reqName} to be installed.`,
          });
        }
      }
    }
    return errors;
  }

  // Step 6 validates aggregate steps 1..5
  for (const s of [1, 2, 3, 4, 5] as const) {
    errors.push(...validateStep(s, character));
  }
  return errors;
}

export function validateCharacter(
  character: Character,
): Record<WizardStep, ValidationError[]> {
  return {
    1: validateStep(1, character),
    2: validateStep(2, character),
    3: validateStep(3, character),
    4: validateStep(4, character),
    5: validateStep(5, character),
    6: validateStep(6, character),
  };
}
