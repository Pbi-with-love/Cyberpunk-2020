import { rolesById } from "../data";
import type { Character } from "../types";
import { calculateStartingMoney } from "./gear";
import { deriveAppearanceFromCharacter, expectedLifeEventCount } from "./lifepath";
import {
  baseSkillId,
  getSpecialAbilityLevel,
  inferChosenCareerSkills,
  inferFreePickCareerSkills,
  isSkillAllowedForPickup,
  resolveCareerSkills,
} from "./skills";

export * from "./derived";
export * from "./skills";
export * from "./lifepath";
export * from "./gear";
export * from "./validation";
export * from "./randomizer";

export function reconcileCharacter(prev: Character, next: Character): Character {
  let updated = next;

  // 1. Reconcile life events count if age changed
  const expectedEvents = expectedLifeEventCount(updated.identity.age);
  if (updated.lifepath.events.length !== expectedEvents) {
    const current = [...updated.lifepath.events];
    if (current.length > expectedEvents) {
      current.length = expectedEvents;
    } else {
      while (current.length < expectedEvents) {
        current.push("Nothing happened that year");
      }
    }
    updated = {
      ...updated,
      lifepath: {
        ...updated.lifepath,
        events: current,
      },
    };
  }

  // 2. Reconcile role change: prune invalid career skills & reset special ability if needed
  if (prev.identity.roleId !== updated.identity.roleId) {
    const role = rolesById[updated.identity.roleId];
    if (role) {
      const validSet = new Set(resolveCareerSkills(role.id, [], []));
      const nextCareer: Record<string, number> = {};
      for (const [key, val] of Object.entries(updated.skills.career)) {
        if (validSet.has(key) || validSet.has(baseSkillId(key))) {
          nextCareer[key] = val;
        }
      }

      // Preserve special ability level if moving from previous role
      const prevRole = rolesById[prev.identity.roleId];
      const prevSpecial = prevRole
        ? prev.skills.career[prevRole.specialAbility]
        : undefined;
      if (prevSpecial !== undefined) {
        nextCareer[role.specialAbility] = prevSpecial;
      }

      const nextPickup: Record<string, number> = {};
      for (const [key, val] of Object.entries(updated.skills.pickup)) {
        if (isSkillAllowedForPickup(role.id, key)) {
          nextPickup[key] = val;
        }
      }

      const nextSkills = {
        ...updated.skills,
        career: nextCareer,
        pickup: nextPickup,
        careerChoices: inferChosenCareerSkills(role.id, nextCareer, []),
        careerFreePicks: inferFreePickCareerSkills(role.id, nextCareer, []),
      };

      const specialLevel = Math.max(
        1,
        (nextCareer[role.specialAbility] ?? 0) + (nextPickup[role.specialAbility] ?? 0),
      );

      updated = {
        ...updated,
        skills: nextSkills,
        gear: {
          ...updated.gear,
          startingMoney: calculateStartingMoney(role.id, specialLevel, 1),
        },
        appearance: deriveAppearanceFromCharacter(
          role.id,
          updated.lifepath.style,
          updated.appearance,
        ),
      };
    }
  }

  // 3. Reconcile appearance when lifepath.style changes
  if (
    prev.lifepath.style.hair !== updated.lifepath.style.hair ||
    prev.lifepath.style.clothes !== updated.lifepath.style.clothes
  ) {
    updated = {
      ...updated,
      appearance: deriveAppearanceFromCharacter(
        updated.identity.roleId,
        updated.lifepath.style,
        updated.appearance,
      ),
    };
  }

  // 4. Reconcile startingMoney if special ability level changed while in same role
  if (
    prev.identity.roleId === updated.identity.roleId &&
    getSpecialAbilityLevel(prev) !== getSpecialAbilityLevel(updated) &&
    prev.gear.startingMoney === updated.gear.startingMoney
  ) {
    const newLevel = Math.max(1, getSpecialAbilityLevel(updated));
    const prevLevel = Math.max(1, getSpecialAbilityLevel(prev));
    if (newLevel !== prevLevel) {
      updated = {
        ...updated,
        gear: {
          ...updated.gear,
          startingMoney: calculateStartingMoney(updated.identity.roleId, newLevel, 1),
        },
      };
    }
  }

  return updated;
}
