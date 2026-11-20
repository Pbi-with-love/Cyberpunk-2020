import statsRaw from "./stats.json";
import rolesRaw from "./roles.json";
import skillsRaw from "./skills.json";
import lifepathRaw from "./lifepath.json";
import gearRaw from "./gear.json";
import sampleCharactersRaw from "./sample-characters.json";
import type {
  ArmorDef,
  CatalogItem,
  Character,
  CyberwareDef,
  GearData,
  LifepathData,
  RoleDef,
  RolesData,
  SkillDef,
  SkillsData,
  StatDef,
  StatKey,
  StatsData,
  WeaponDef,
} from "../types";

export const statsData: StatsData = statsRaw as StatsData;
export const rolesData: RolesData = rolesRaw as RolesData;
export const skillsData: SkillsData = skillsRaw as SkillsData;
export const lifepathData: LifepathData = lifepathRaw as LifepathData;
export const gearData: GearData = gearRaw as GearData;
export const sampleCharacters: Character[] =
  sampleCharactersRaw as unknown as Character[];

export const STAT_KEYS: StatKey[] = statsData.stats.map((s) => s.key);

export const statsByKey: Record<StatKey, StatDef> = statsData.stats.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<StatKey, StatDef>,
);

export const rolesById: Record<string, RoleDef> = rolesData.roles.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<string, RoleDef>,
);

export const skillsById: Record<string, SkillDef> = skillsData.skills.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, SkillDef>,
);

export const weaponsById: Record<string, WeaponDef> = gearData.weapons.reduce(
  (acc, w) => {
    acc[w.id] = w;
    return acc;
  },
  {} as Record<string, WeaponDef>,
);

export const armorById: Record<string, ArmorDef> = gearData.armor.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, ArmorDef>,
);

export const cyberwareById: Record<string, CyberwareDef> = gearData.cyberware.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, CyberwareDef>,
);

export const catalogById: Record<string, CatalogItem> = {
  ...Object.fromEntries(
    gearData.weapons.map((w) => [w.id, { ...w, kind: "weapon" as const }]),
  ),
  ...Object.fromEntries(
    gearData.armor.map((a) => [a.id, { ...a, kind: "armor" as const }]),
  ),
  ...Object.fromEntries(
    gearData.cyberware.map((c) => [c.id, { ...c, kind: "cyberware" as const }]),
  ),
};
