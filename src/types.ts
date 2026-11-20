export type StatKey =
  | "INT"
  | "REF"
  | "TECH"
  | "COOL"
  | "ATTR"
  | "LUCK"
  | "MA"
  | "BODY"
  | "EMP";

export type SkillStatGroup =
  | "SPECIAL"
  | "ATTR"
  | "BODY"
  | "COOL"
  | "EMP"
  | "INT"
  | "REF"
  | "TECH";

export type PointMethodId = "random" | "fast" | "cinematic";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type SkinToneId = "pale" | "fair" | "olive" | "tan" | "deep" | "chrome";
export type HairColorId =
  | "pink"
  | "cyan"
  | "black"
  | "silver"
  | "red"
  | "yellow"
  | "violet"
  | "copper";
export type ClothesColorId =
  | "default"
  | "neon_pink"
  | "cyber_cyan"
  | "tactical_olive"
  | "corp_charcoal"
  | "crimson"
  | "gold_chrome"
  | "street_denim";

export interface CharacterAppearance {
  skinTone: SkinToneId;
  hairStyle: number;
  hairColor: HairColorId;
  clothesStyle: number;
  clothesColor: ClothesColorId;
}

export interface GearItemSelection {
  itemId: string;
  humanityCostRolled?: number;
}

export interface Character {
  version: number;
  identity: {
    handle: string;
    realName?: string;
    roleId: string;
    age: number;
    gender?: string;
    reputation: number;
    portrait?: string;
  };
  stats: {
    method: PointMethodId;
    points: number;
    cinematicPresetId?: string;
    values: Record<StatKey, number>;
  };
  skills: {
    career: Record<string, number>;
    pickup: Record<string, number>;
    details: Record<string, string>;
    careerChoices?: string[];
    careerFreePicks?: string[];
  };
  lifepath: {
    style: Record<string, string>;
    family: Record<string, string>;
    motivations: Record<string, string>;
    events: string[];
  };
  gear: {
    startingMoney: number;
    items: GearItemSelection[];
  };
  appearance?: CharacterAppearance;
}

export interface ValidationError {
  field: string;
  message: string;
  step: WizardStep;
}

export interface DerivedStats {
  run: number;
  leap: number;
  lift: number;
  humanity: number;
  save: number;
  btm: number;
  btmLabel: string;
  bdm: number;
}

export interface CinematicPreset {
  id: string;
  name: string;
  points: number;
}

export interface PointMethodDef {
  id: PointMethodId;
  name: string;
  description: string;
  dice?: string;
  rerollAtOrBelow?: number;
  presets?: CinematicPreset[];
  verify?: boolean;
}

export interface StatDef {
  key: StatKey;
  name: string;
  short: string;
  usedFor: string[];
}

export interface DerivedTableEntry {
  min: number;
  max: number;
  value: number;
  label?: string;
}

export interface DerivedDef {
  key: string;
  name: string;
  formula?: string;
  unit?: string;
  table?: DerivedTableEntry[];
}

export interface DifficultyBenchmark {
  name: string;
  value: number;
}

export interface StatsData {
  version: number;
  range: { min: number; max: number };
  pointMethods: PointMethodDef[];
  stats: StatDef[];
  derived: DerivedDef[];
  difficulty: DifficultyBenchmark[];
}

export interface CareerChoiceDef {
  pick: number;
  from: string[];
}

export interface CareerFreePickDef {
  count: number;
  stat: StatKey;
}

export interface RoleDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  specialAbility: string;
  careerSkills: string[];
  careerChoices?: CareerChoiceDef[];
  careerFreePicks?: CareerFreePickDef[];
  priorityStats: StatKey[];
  verify?: boolean;
}

export interface RolesData {
  version: number;
  careerPoints: number;
  pickupPointsFormula: string;
  roles: RoleDef[];
}

export interface SkillDef {
  id: string;
  name: string;
  stat: SkillStatGroup;
  description: string;
  role?: string;
  needsDetail?: boolean;
  detailLabel?: string;
  repeatable?: boolean;
}

export interface SkillsData {
  version: number;
  maxLevel: number;
  statGroups: SkillStatGroup[];
  skills: SkillDef[];
}

export interface LifepathEntry {
  roll: number;
  text: string;
}

export interface LifepathRange {
  min: number;
  max: number;
  text: string;
  next?: string;
}

export interface LifepathTable {
  id: string;
  name: string;
  dice?: string;
  rule?: string;
  note?: string;
  derivedFrom?: string;
  entries?: LifepathEntry[];
  ranges?: LifepathRange[];
  byOrigin?: Record<string, string[]>;
  sibling?: {
    gender: { dice: string; ranges: LifepathRange[] };
    age: { dice: string; ranges: LifepathRange[] };
    feeling: { dice: string; ranges: LifepathRange[] };
  };
  subTables?: LifepathTable[];
}

export interface LifepathSection {
  id: string;
  name: string;
  rule?: string;
  eventType?: { dice: string; ranges: LifepathRange[] };
  tables: LifepathTable[];
}

export interface LifepathData {
  version: number;
  dice: string;
  sections: LifepathSection[];
}

export interface WeaponDef {
  id: string;
  name: string;
  type: string;
  skill: string;
  wa: number;
  damage: string;
  shots?: number;
  rof?: number;
  cost: number;
}

export interface ArmorDef {
  id: string;
  name: string;
  sp: number;
  covers: string[];
  ev: number;
  cost: number;
}

export interface CyberwareDef {
  id: string;
  name: string;
  category: string;
  humanityCost: string;
  cost: number;
  note?: string;
  effect?: string;
  requires?: string[];
}

export interface GearData {
  version: number;
  currency: string;
  verify?: boolean;
  note?: string;
  startingMoney: {
    method: string;
    multiplierDice: string;
    multiplierNote: string;
    salaryBySpecialAbilityLevel: Record<string, number[]>;
  };
  weapons: WeaponDef[];
  armor: ArmorDef[];
  cyberware: CyberwareDef[];
}

export type CatalogItem =
  | (WeaponDef & { kind: "weapon" })
  | (ArmorDef & { kind: "armor" })
  | (CyberwareDef & { kind: "cyberware" });

export interface CareerSlotInfo {
  fixedSkills: string[];
  choices: CareerChoiceDef[];
  freePicks: CareerFreePickDef[];
  totalSlots: number;
}
