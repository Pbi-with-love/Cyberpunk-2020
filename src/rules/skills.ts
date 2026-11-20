import { rolesById, rolesData, skillsById, skillsData } from "../data";
import type { CareerSlotInfo, Character, SkillDef } from "../types";

export function baseSkillId(skillKey: string): string {
  const idx = skillKey.indexOf(":");
  return idx === -1 ? skillKey : skillKey.slice(0, idx);
}

export function getSkillDef(skillKey: string): SkillDef | undefined {
  return skillsById[baseSkillId(skillKey)];
}

export function careerSlots(roleId: string): CareerSlotInfo {
  const role = rolesById[roleId];
  if (!role) {
    return { fixedSkills: [], choices: [], freePicks: [], totalSlots: 0 };
  }
  const choices = role.careerChoices ?? [];
  const freePicks = role.careerFreePicks ?? [];
  const totalSlots =
    role.careerSkills.length +
    choices.reduce((sum, c) => sum + c.pick, 0) +
    freePicks.reduce((sum, p) => sum + p.count, 0);

  return {
    fixedSkills: [...role.careerSkills],
    choices,
    freePicks,
    totalSlots,
  };
}

export function resolveCareerSkills(
  roleId: string,
  chosenSkills: string[] = [],
  freePickSkills: string[] = [],
): string[] {
  const role = rolesById[roleId];
  if (!role) {
    return [];
  }

  const result = [...role.careerSkills];
  const seen = new Set<string>(result);

  for (const choice of role.careerChoices ?? []) {
    let picked = 0;
    for (const candidate of chosenSkills) {
      if (picked >= choice.pick) break;
      if (choice.from.includes(candidate) && !seen.has(candidate)) {
        result.push(candidate);
        seen.add(candidate);
        picked += 1;
      }
    }
  }

  for (const freePick of role.careerFreePicks ?? []) {
    let picked = 0;
    for (const candidate of freePickSkills) {
      if (picked >= freePick.count) break;
      const skill = getSkillDef(candidate);
      if (skill && skill.stat === freePick.stat && !seen.has(candidate)) {
        result.push(candidate);
        seen.add(candidate);
        picked += 1;
      }
    }
  }

  return result;
}

export function inferChosenCareerSkills(
  roleId: string,
  careerAllocations: Record<string, number>,
  explicitChoices?: string[],
): string[] {
  const role = rolesById[roleId];
  if (!role || !role.careerChoices) return [];

  const chosen: string[] = [];
  for (const choice of role.careerChoices) {
    const validExplicit = (explicitChoices ?? []).filter((id) =>
      choice.from.includes(id),
    );
    const activeFromAlloc = choice.from.filter(
      (id) => (careerAllocations[id] ?? 0) > 0,
    );
    const merged = Array.from(new Set([...validExplicit, ...activeFromAlloc]));
    chosen.push(...merged.slice(0, choice.pick));
  }
  return chosen;
}

export function inferFreePickCareerSkills(
  roleId: string,
  careerAllocations: Record<string, number>,
  explicitFreePicks?: string[],
): string[] {
  const role = rolesById[roleId];
  if (!role || !role.careerFreePicks) return [];

  const fixedSet = new Set(role.careerSkills);
  const picks: string[] = [];

  for (const fp of role.careerFreePicks) {
    const validExplicit = (explicitFreePicks ?? []).filter((id) => {
      const def = getSkillDef(id);
      return def && def.stat === fp.stat && !fixedSet.has(id);
    });
    const activeFromAlloc = Object.entries(careerAllocations)
      .filter(([id, val]) => {
        if (val <= 0 || fixedSet.has(id)) return false;
        const def = getSkillDef(id);
        return def?.stat === fp.stat;
      })
      .map(([id]) => id);
    const merged = Array.from(new Set([...validExplicit, ...activeFromAlloc]));
    picks.push(...merged.slice(0, fp.count));
  }

  return picks;
}

export function getActiveCareerSkillsForCharacter(character: Character): string[] {
  const roleId = character.identity.roleId;
  const chosen = inferChosenCareerSkills(
    roleId,
    character.skills.career,
    character.skills.careerChoices,
  );
  const freePicks = inferFreePickCareerSkills(
    roleId,
    character.skills.career,
    character.skills.careerFreePicks,
  );
  return resolveCareerSkills(roleId, chosen, freePicks);
}

export function getSpecialAbilityLevel(character: Character): number {
  const role = rolesById[character.identity.roleId];
  if (!role) return 0;
  const abilityId = role.specialAbility;
  return (
    (character.skills.career[abilityId] ?? 0) +
    (character.skills.pickup[abilityId] ?? 0)
  );
}

export function sumSkillPoints(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, v) => sum + (v || 0), 0);
}

export function getSkillTotalLevel(
  character: Character,
  skillId: string,
): number {
  return (
    (character.skills.career[skillId] ?? 0) +
    (character.skills.pickup[skillId] ?? 0)
  );
}

export function getCareerPointLimit(): number {
  return rolesData.careerPoints;
}

export function getMaxSkillLevel(): number {
  return skillsData.maxLevel;
}

export function isSkillAllowedForPickup(
  roleId: string,
  skillKey: string,
): boolean {
  const def = getSkillDef(skillKey);
  if (!def) return false;
  if (def.stat === "SPECIAL") {
    return def.role === roleId;
  }
  return true;
}
