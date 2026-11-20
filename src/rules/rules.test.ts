import { describe, expect, it } from "vitest";
import { createRng } from "../dice";
import { rolesData, sampleCharacters } from "../data";
import { deserializeCharacter, serializeCharacter } from "../state/persistence";
import type { StatKey } from "../types";
import {
  applyCyberware,
  calculateRemainingMoney,
  calculateStartingMoney,
  careerSlots,
  createBlankCharacter,
  deriveStats,
  pickupPoints,
  randomizeCharacter,
  reconcileCharacter,
  resolveCareerSkills,
  validateStep,
} from "./index";

function makeStats(overrides: Partial<Record<StatKey, number>> = {}): Record<StatKey, number> {
  return {
    INT: 6,
    REF: 6,
    TECH: 6,
    COOL: 6,
    ATTR: 6,
    LUCK: 6,
    MA: 6,
    BODY: 6,
    EMP: 6,
    ...overrides,
  };
}

describe("rules engine", () => {
  it("computes derived stats and BTM/BDM boundaries accurately", () => {
    const cases: Array<{ body: number; btm: number; bdm: number }> = [
      { body: 2, btm: 0, bdm: -2 },
      { body: 3, btm: -1, bdm: -1 },
      { body: 4, btm: -1, bdm: -1 },
      { body: 5, btm: -2, bdm: 0 },
      { body: 7, btm: -2, bdm: 0 },
      { body: 8, btm: -3, bdm: 1 },
      { body: 9, btm: -3, bdm: 1 },
      { body: 10, btm: -4, bdm: 2 },
    ];

    for (const c of cases) {
      const derived = deriveStats(makeStats({ BODY: c.body, MA: 8, EMP: 7 }));
      expect(derived.btm).toBe(c.btm);
      expect(derived.bdm).toBe(c.bdm);
      expect(derived.save).toBe(c.body);
      expect(derived.lift).toBe(c.body * 40);
      expect(derived.run).toBe(24);
      expect(derived.leap).toBe(6);
      expect(derived.humanity).toBe(70);
    }
  });

  it("computes pickup skill points as INT + REF", () => {
    expect(pickupPoints(makeStats({ INT: 8, REF: 9 }))).toBe(17);
  });

  it("validates step 1 identity and step 2 stat ranges & point pools", () => {
    const blank = createBlankCharacter(createRng(1));
    expect(validateStep(1, blank).some((e) => e.message === "Handle is required.")).toBe(true);

    blank.identity.handle = "Nighthawk";
    expect(validateStep(1, blank)).toHaveLength(0);

    // Out of range stat
    blank.stats.values.BODY = 11;
    expect(
      validateStep(2, blank).some((e) => e.message.includes("Stat BODY must be an integer between 2 and 10.")),
    ).toBe(true);

    blank.stats.values.BODY = 1;
    expect(
      validateStep(2, blank).some((e) => e.message.includes("Stat BODY must be an integer between 2 and 10.")),
    ).toBe(true);

    // Too many points spent
    blank.stats.values = makeStats({ INT: 10, REF: 10, TECH: 10, COOL: 10, BODY: 10, EMP: 10 });
    blank.stats.points = 60;
    expect(validateStep(2, blank).some((e) => e.message.includes("Too many stat points spent"))).toBe(true);
  });

  it("resolves Solo career choice and Techie free picks to exactly 10 skills", () => {
    const soloSlots = careerSlots("solo");
    expect(soloSlots.totalSlots).toBe(10);
    expect(resolveCareerSkills("solo", ["martial_arts"])).toHaveLength(10);
    expect(resolveCareerSkills("solo", ["martial_arts"])).toContain("martial_arts");
    expect(resolveCareerSkills("solo", ["martial_arts"])).not.toContain("brawling");

    const techieSlots = careerSlots("techie");
    expect(techieSlots.totalSlots).toBe(10);
    const techieResolved = resolveCareerSkills("techie", [], ["weaponsmith", "pick_lock", "cyberdeck_design"]);
    expect(techieResolved).toHaveLength(10);
    expect(techieResolved).toContain("weaponsmith");

    // Rejects spending career points on both brawling and martial_arts for Solo
    const char = createBlankCharacter(createRng(10));
    char.identity.handle = "SoloTest";
    char.identity.roleId = "solo";
    char.skills.careerChoices = ["brawling"];
    char.skills.career = { brawling: 3, martial_arts: 2 };
    expect(validateStep(3, char).some((e) => e.message.includes("not an active career skill"))).toBe(true);
  });

  it("enforces detail requirement on repeatable/detail skills", () => {
    const char = createBlankCharacter(createRng(11));
    char.identity.handle = "Polyglot";
    char.skills.pickup = { know_language: 3 };
    expect(
      validateStep(3, char).some((e) => e.message.includes("Please specify Language for Know Language.")),
    ).toBe(true);

    char.skills.details.know_language = "Japanese";
    expect(validateStep(3, char)).toHaveLength(0);
  });

  it("computes cyberware humanity loss, EMP reduction, cyberpsychosis, and prerequisites", () => {
    const char = createBlankCharacter(createRng(12));
    char.identity.handle = "Chromed";
    char.stats.values.EMP = 4; // 40 base humanity
    char.gear.startingMoney = 10000;
    char.gear.items = [
      { itemId: "neural_processor", humanityCostRolled: 5 },
      { itemId: "reflex_booster", humanityCostRolled: 12 },
      { itemId: "cyberarm", humanityCostRolled: 14 },
      { itemId: "subdermal_armor", humanityCostRolled: 9 },
    ];
    const res = applyCyberware(4, char.gear.items);
    expect(res.baseHumanity).toBe(40);
    expect(res.humanityLoss).toBe(40);
    expect(res.humanity).toBe(0);
    expect(res.emp).toBe(0);
    expect(res.cyberpsychosis).toBe(true);

    // Partial EMP drop: 40 - 15 = 25 -> EMP 2
    const partial = applyCyberware(4, [{ itemId: "cyberarm", humanityCostRolled: 15 }]);
    expect(partial.humanity).toBe(25);
    expect(partial.emp).toBe(2);
    expect(partial.cyberpsychosis).toBe(false);

    // Prerequisite check: reflex_booster without neural_processor fails
    char.gear.items = [{ itemId: "reflex_booster", humanityCostRolled: 7 }];
    expect(
      validateStep(5, char).some((e) => e.message.includes("requires Neural processor")),
    ).toBe(true);

    // Money overspend check
    char.gear.startingMoney = 500;
    char.gear.items = [{ itemId: "assault_rifle" }]; // 1000 eb
    expect(calculateRemainingMoney(500, char.gear.items)).toBe(-500);
    expect(
      validateStep(5, char).some((e) => e.message.includes("Total gear cost exceeds starting money")),
    ).toBe(true);
  });

  it("computes starting money from role and special ability level", () => {
    expect(calculateStartingMoney("solo", 1, 1)).toBe(2000);
    expect(calculateStartingMoney("solo", 1, 6)).toBe(4000);
    expect(calculateStartingMoney("rocker", 5, 4)).toBe(16000);
  });

  it("reconciles downstream life events when age changes", () => {
    const prev = createBlankCharacter(createRng(5));
    const next = reconcileCharacter(prev, {
      ...prev,
      identity: { ...prev.identity, age: 25 },
    });
    expect(next.lifepath.events).toHaveLength(9);
    expect(validateStep(4, next)).toHaveLength(0);
  });

  it("produces valid characters across 500 distinct seeds", () => {
    for (let seed = 1; seed <= 500; seed += 1) {
      const char = randomizeCharacter(createRng(seed));
      for (const step of [1, 2, 3, 4, 5, 6] as const) {
        const errors = validateStep(step, char);
        expect(errors, `seed ${seed} step ${step}`).toEqual([]);
      }
    }
  });

  it("validates all 10 sample characters and preserves JSON round-trip", () => {
    const samples = sampleCharacters;
    expect(samples).toHaveLength(10);
    const seenRoles = new Set<string>();

    for (const sample of samples) {
      seenRoles.add(sample.identity.roleId);
      for (const step of [1, 2, 3, 4, 5, 6] as const) {
        expect(validateStep(step, sample), `${sample.identity.handle} step ${step}`).toEqual([]);
      }
      const roundTrip = deserializeCharacter(serializeCharacter(sample));
      expect(roundTrip).toEqual(sample);
    }

    for (const role of rolesData.roles) {
      expect(seenRoles.has(role.id)).toBe(true);
    }
  });
});
