import {
  STAT_KEYS,
  gearData,
  rolesById,
  rolesData,
  skillsData,
} from "../data";
import { pickOne, rollDice, rollDie, type Rng } from "../dice";
import type { Character, GearItemSelection, StatKey } from "../types";
import { pickupPoints } from "./derived";
import {
  applyCyberware,
  calculateRemainingMoney,
  getMissingRequirements,
  rollCyberwareHumanityCost,
  rollStartingMoney,
} from "./gear";
import {
  CLOTHES_COLORS,
  HAIR_COLORS,
  SKIN_TONES,
  deriveAppearanceFromCharacter,
  rollAllFamily,
  rollAllMotivations,
  rollAllStyle,
  rollLifeEvents,
} from "./lifepath";
import { getSkillDef, resolveCareerSkills } from "./skills";

const ROLE_HANDLES: Record<string, string[]> = {
  solo: ["Razor", "Chromejack", "Deadlock", "Viper-9", "Kestrel"],
  rocker: ["Johnny Chrome", "Static Pulse", "Riot Velvet", "Neon Riff", "Amp"],
  netrunner: ["Ghost_0x", "NullByte", "ZeroTrace", "DataWraith", "HexRunner"],
  media: ["Vera Truth", "WireTap", "Scoop", "Flashline", "Broadcast"],
  nomad: ["Dust", "Outrider", "Coyote", "Axel", "Redline"],
  fixer: ["Slick", "Broker-K", "Backchannel", "Ledger", "Goldtooth"],
  cop: ["Kowalski", "Badge-44", "Ironwatch", "Valkyrie", "Nightshift"],
  corporate: ["Vance Sterling", "Kurosawa", "Apex", "Director Nine", "Syndic"],
  techie: ["Ratchet", "Spark", "Solder", "Gearhead", "Overclock"],
  medtechie: ["Doc Trauma", "Scalpel", "BioPatch", "Pulse-0", "Triage"],
};

const FIRST_NAMES = [
  "Alex",
  "Kira",
  "Marcus",
  "Elena",
  "Dante",
  "Sora",
  "Victor",
  "Nadia",
  "Ren",
  "Tessa",
];

const LAST_NAMES = [
  "Mercer",
  "Takahashi",
  "Vance",
  "Kowalski",
  "Reyes",
  "Chen",
  "Volkov",
  "Moreau",
  "Sato",
  "Delgado",
];

const GENDERS = ["Male", "Female", "Non-binary"];

const SAMPLE_DETAILS: Record<string, string[]> = {
  expert: ["Street Lore", "Corporate Law", "Ballistics", "Cybernetics", "History of 4th Corp War"],
  know_language: ["Japanese", "Spanish", "Cantonese", "Russian", "German"],
  martial_arts: ["Aikido", "Karate", "Tae Kwon Do", "Arasaka-te", "Boxing"],
  play_instrument: ["Electric Guitar", "Synth Keytar", "Laser Bass", "Chromed Sax"],
};

const ROLE_PREFERRED_GEAR: Record<
  string,
  { weapons: string[]; armor: string[]; cyberware: string[] }
> = {
  solo: {
    weapons: ["assault_rifle", "heavy_pistol", "monoblade"],
    armor: ["medium_armor_jacket", "nylon_helmet"],
    cyberware: ["neural_processor", "reflex_booster", "cyberoptic", "low_light", "skinweave"],
  },
  rocker: {
    weapons: ["medium_pistol", "knife"],
    armor: ["light_armor_jacket", "leather_jacket"],
    cyberware: ["cyberaudio", "light_tattoo", "cyberoptic"],
  },
  netrunner: {
    weapons: ["light_pistol", "medium_pistol"],
    armor: ["kevlar_tshirt", "light_armor_jacket"],
    cyberware: ["interface_plugs", "neural_processor", "cyberoptic", "low_light"],
  },
  media: {
    weapons: ["light_pistol", "club"],
    armor: ["kevlar_tshirt", "light_armor_jacket"],
    cyberware: ["cyberoptic", "cyberaudio", "biomonitor"],
  },
  nomad: {
    weapons: ["shotgun", "heavy_pistol", "knife"],
    armor: ["medium_armor_jacket", "leather_jacket"],
    cyberware: ["muscle_bone_lace", "cyberoptic", "low_light"],
  },
  fixer: {
    weapons: ["heavy_pistol", "light_smg", "knife"],
    armor: ["light_armor_jacket", "kevlar_tshirt"],
    cyberware: ["cyberaudio", "interface_plugs", "biomonitor"],
  },
  cop: {
    weapons: ["heavy_pistol", "shotgun", "club"],
    armor: ["flak_vest", "nylon_helmet", "light_armor_jacket"],
    cyberware: ["cyberoptic", "low_light", "cyberaudio"],
  },
  corporate: {
    weapons: ["medium_pistol", "very_heavy_pistol"],
    armor: ["kevlar_tshirt", "light_armor_jacket"],
    cyberware: ["biomonitor", "interface_plugs", "skinweave"],
  },
  techie: {
    weapons: ["light_smg", "medium_pistol"],
    armor: ["light_armor_jacket", "leather_jacket"],
    cyberware: ["cyberoptic", "low_light", "cyberarm", "interface_plugs"],
  },
  medtechie: {
    weapons: ["medium_pistol", "knife"],
    armor: ["kevlar_tshirt", "light_armor_jacket"],
    cyberware: ["biomonitor", "cyberoptic", "neural_processor"],
  },
};

export function createBlankCharacter(rng?: Rng): Character {
  const defaultRole = rolesData.roles[0]?.id ?? "solo";
  const age = 16 + rollDice("2d6", rng);
  const style = rollAllStyle(rng);
  const values: Record<StatKey, number> = {
    INT: 5,
    REF: 5,
    TECH: 5,
    COOL: 5,
    ATTR: 5,
    LUCK: 5,
    MA: 5,
    BODY: 5,
    EMP: 5,
  };
  return {
    version: 1,
    identity: {
      handle: "",
      realName: "",
      roleId: defaultRole,
      age,
      gender: "Unspecified",
      reputation: 0,
    },
    stats: {
      method: "cinematic",
      points: 60,
      cinematicPresetId: "minor_supporting",
      values,
    },
    skills: {
      career: {},
      pickup: {},
      details: {},
      careerChoices: [],
      careerFreePicks: [],
    },
    lifepath: {
      style,
      family: rollAllFamily(rng),
      motivations: rollAllMotivations(rng),
      events: rollLifeEvents(age, rng),
    },
    gear: {
      startingMoney: rollStartingMoney(defaultRole, 1, rng),
      items: [],
    },
    appearance: deriveAppearanceFromCharacter(defaultRole, style),
  };
}

export function randomizeCharacter(
  rng?: Rng,
  roleIdOverride?: string,
): Character {
  const role =
    (roleIdOverride ? rolesById[roleIdOverride] : undefined) ??
    pickOne(rolesData.roles, rng);

  const handlePool = ROLE_HANDLES[role.id] ?? ["Edgerunner"];
  const handle = pickOne(handlePool, rng);
  const realName = `${pickOne(FIRST_NAMES, rng)} ${pickOne(LAST_NAMES, rng)}`;
  const age = 16 + rollDice("2d6", rng);
  const gender = pickOne(GENDERS, rng);
  const reputation = Math.max(0, Math.min(3, rollDice("1d4", rng) - 1));

  // Stats: roll 9d10 and ensure at least 26 for balanced random characters (min 18)
  let points = rollDice("9d10", rng);
  if (points < 30) {
    points = Math.max(points, 30 + rollDice("3d10", rng));
  }
  points = Math.min(90, points);

  const values: Record<StatKey, number> = {
    INT: 2,
    REF: 2,
    TECH: 2,
    COOL: 2,
    ATTR: 2,
    LUCK: 2,
    MA: 2,
    BODY: 2,
    EMP: 2,
  };

  let remainingStatPts = points - 18;
  const prioritySet = new Set(role.priorityStats);
  // Keep EMP at least 4 so cyberware rarely pushes into instant cyberpsychosis
  while (remainingStatPts > 0 && values.EMP < 4) {
    values.EMP += 1;
    remainingStatPts -= 1;
  }

  let guard = 0;
  while (remainingStatPts > 0 && guard < 1000) {
    guard += 1;
    const candidates = STAT_KEYS.filter((k) => values[k] < 10);
    if (candidates.length === 0) break;

    const weighted: StatKey[] = [];
    for (const k of candidates) {
      const weight = prioritySet.has(k) ? 4 : k === "EMP" || k === "INT" || k === "REF" ? 2 : 1;
      for (let w = 0; w < weight; w += 1) {
        weighted.push(k);
      }
    }
    const chosenStat = pickOne(weighted, rng);
    values[chosenStat] += 1;
    remainingStatPts -= 1;
  }

  // Career choices & free picks
  const careerChoices: string[] = [];
  for (const choice of role.careerChoices ?? []) {
    const pool = [...choice.from];
    for (let i = 0; i < choice.pick && pool.length > 0; i += 1) {
      const picked = pickOne(pool, rng);
      careerChoices.push(picked);
      pool.splice(pool.indexOf(picked), 1);
    }
  }

  const careerFreePicks: string[] = [];
  const fixedSet = new Set(role.careerSkills);
  for (const fp of role.careerFreePicks ?? []) {
    const eligible = skillsData.skills
      .filter((s) => s.stat === fp.stat && !fixedSet.has(s.id) && !careerFreePicks.includes(s.id))
      .map((s) => s.id);
    for (let i = 0; i < fp.count && eligible.length > 0; i += 1) {
      const picked = pickOne(eligible, rng);
      careerFreePicks.push(picked);
      eligible.splice(eligible.indexOf(picked), 1);
    }
  }

  const activeCareer = resolveCareerSkills(role.id, careerChoices, careerFreePicks);
  const career: Record<string, number> = {};
  for (const id of activeCareer) {
    career[id] = 0;
  }

  // Ensure Special Ability gets 4..7 points
  const specialLevel = Math.min(7, 3 + rollDice("1d4", rng));
  career[role.specialAbility] = specialLevel;
  let careerPool = rolesData.careerPoints - specialLevel;

  while (careerPool > 0) {
    const available = activeCareer.filter((id) => (career[id] ?? 0) < 9);
    if (available.length === 0) break;
    const pick = pickOne(available, rng);
    const add = Math.min(careerPool, rollDie(2, rng), 10 - (career[pick] ?? 0));
    career[pick] = (career[pick] ?? 0) + add;
    careerPool -= add;
  }

  // Pickup skills
  const pickup: Record<string, number> = {};
  let pickupPool = pickupPoints(values);
  const generalPool = skillsData.skills
    .filter((s) => s.stat !== "SPECIAL")
    .map((s) => s.id);
  let pickupGuard = 0;
  while (pickupPool > 0 && pickupGuard < 300) {
    pickupGuard += 1;
    const pick = pickOne(generalPool, rng);
    const currentTotal = (career[pick] ?? 0) + (pickup[pick] ?? 0);
    if (currentTotal >= 10) continue;
    const add = Math.min(pickupPool, 10 - currentTotal, rollDie(2, rng));
    pickup[pick] = (pickup[pick] ?? 0) + add;
    pickupPool -= add;
  }

  // Fill specialization details for any skill with needsDetail & total > 0
  const details: Record<string, string> = {};
  for (const id of new Set([...Object.keys(career), ...Object.keys(pickup)])) {
    const total = (career[id] ?? 0) + (pickup[id] ?? 0);
    const def = getSkillDef(id);
    if (total > 0 && def?.needsDetail) {
      const sampleList = SAMPLE_DETAILS[def.id] ?? ["General"];
      details[id] = pickOne(sampleList, rng);
    }
  }

  // Lifepath
  const style = rollAllStyle(rng);
  const family = rollAllFamily(rng);
  const motivations = rollAllMotivations(rng);
  const events = rollLifeEvents(age, rng);

  // Gear & Cyberware
  const startingMoney = rollStartingMoney(role.id, specialLevel, rng);
  const items: GearItemSelection[] = [];
  const preferred = ROLE_PREFERRED_GEAR[role.id] ?? {
    weapons: ["medium_pistol"],
    armor: ["light_armor_jacket"],
    cyberware: ["cyberoptic"],
  };

  const tryAddItem = (itemId: string, isCyberware: boolean) => {
    const remaining = calculateRemainingMoney(startingMoney, items);
    const weapon = gearData.weapons.find((w) => w.id === itemId);
    const armor = gearData.armor.find((a) => a.id === itemId);
    const cyber = gearData.cyberware.find((c) => c.id === itemId);
    const cost = weapon?.cost ?? armor?.cost ?? cyber?.cost ?? Infinity;
    if (cost > remaining) return;

    if (isCyberware && cyber) {
      if (getMissingRequirements(itemId, items).length > 0) return;
      const loss = rollCyberwareHumanityCost(itemId, rng);
      const nextPreview = [...items, { itemId, humanityCostRolled: loss }];
      const cyStatus = applyCyberware(values.EMP, nextPreview);
      if (cyStatus.humanity < 10) return; // avoid accidental cyberpsychosis on randomizer
      items.push({ itemId, humanityCostRolled: loss });
    } else {
      items.push({ itemId });
    }
  };

  for (const w of preferred.weapons) {
    if (items.filter((i) => gearData.weapons.some((x) => x.id === i.itemId)).length >= 2) break;
    tryAddItem(w, false);
  }
  for (const a of preferred.armor) {
    if (items.filter((i) => gearData.armor.some((x) => x.id === i.itemId)).length >= 1) break;
    tryAddItem(a, false);
  }
  for (const c of preferred.cyberware) {
    tryAddItem(c, true);
  }

  const baseAppearance = deriveAppearanceFromCharacter(role.id, style);
  const appearance = {
    ...baseAppearance,
    skinTone: pickOne(SKIN_TONES, rng),
    hairColor: pickOne(HAIR_COLORS, rng),
    clothesColor:
      role.id === "rocker"
        ? "neon_pink"
        : role.id === "netrunner"
          ? "cyber_cyan"
          : pickOne(CLOTHES_COLORS, rng),
  };

  return {
    version: 1,
    identity: {
      handle,
      realName,
      roleId: role.id,
      age,
      gender,
      reputation,
    },
    stats: {
      method: "random",
      points,
      values,
    },
    skills: {
      career,
      pickup,
      details,
      careerChoices,
      careerFreePicks,
    },
    lifepath: {
      style,
      family,
      motivations,
      events,
    },
    gear: {
      startingMoney,
      items,
    },
    appearance,
  };
}
