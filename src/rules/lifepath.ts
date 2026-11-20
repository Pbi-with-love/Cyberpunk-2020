import { lifepathData } from "../data";
import { pickOne, rollDice, type Rng } from "../dice";
import type {
  CharacterAppearance,
  ClothesColorId,
  HairColorId,
  LifepathTable,
  SkinToneId,
} from "../types";

function findSection(id: string) {
  return lifepathData.sections.find((s) => s.id === id);
}

function findTable(sectionId: string, tableId: string): LifepathTable | undefined {
  return findSection(sectionId)?.tables.find((t) => t.id === tableId);
}

export function rollEntryTable(table: LifepathTable, rng?: Rng): { roll: number; text: string } {
  const roll = rollDice(table.dice ?? lifepathData.dice, rng);
  if (table.entries) {
    const entry = table.entries.find((e) => e.roll === roll) ?? table.entries[0];
    return { roll, text: entry?.text ?? "" };
  }
  if (table.ranges) {
    const match = table.ranges.find((r) => roll >= r.min && roll <= r.max) ?? table.ranges[0];
    return { roll, text: match?.text ?? "" };
  }
  return { roll, text: "" };
}

export function rollStyleTable(
  tableId: string,
  rng?: Rng,
  currentOriginRoll?: string,
): Record<string, string> {
  const table = findTable("style", tableId);
  if (!table) return {};

  if (tableId === "origin") {
    const res = rollEntryTable(table, rng);
    const langTable = findTable("style", "language");
    const langs = langTable?.byOrigin?.[String(res.roll)] ?? ["English"];
    return {
      origin: res.text,
      language: pickOne(langs, rng),
    };
  }

  if (tableId === "language") {
    const originTable = findTable("style", "origin");
    const matchedOrigin = originTable?.entries?.find(
      (e) => e.text === currentOriginRoll,
    );
    const originKey = String(matchedOrigin?.roll ?? rollDice("1d10", rng));
    const langs = table.byOrigin?.[originKey] ?? ["English"];
    return { language: pickOne(langs, rng) };
  }

  const res = rollEntryTable(table, rng);
  return { [tableId]: res.text };
}

export function rollAllStyle(rng?: Rng): Record<string, string> {
  const clothes = rollStyleTable("clothes", rng).clothes ?? "";
  const hair = rollStyleTable("hair", rng).hair ?? "";
  const affectation = rollStyleTable("affectation", rng).affectation ?? "";
  const originBundle = rollStyleTable("origin", rng);
  return {
    clothes,
    hair,
    affectation,
    origin: originBundle.origin ?? "North American",
    language: originBundle.language ?? "English",
  };
}

export function rollFamilyTable(tableId: string, rng?: Rng): string {
  const table = findTable("family", tableId);
  if (!table) return "";

  if (tableId === "parents") {
    const roll = rollDice("1d10", rng);
    const range = table.ranges?.find((r) => roll >= r.min && roll <= r.max);
    if (range?.next) {
      const fateTable = findTable("family", range.next);
      const fate = fateTable ? rollEntryTable(fateTable, rng).text : "";
      return `${range.text}: ${fate}`;
    }
    return range?.text ?? "";
  }

  if (tableId === "familyStatus") {
    const roll = rollDice("1d10", rng);
    const range = table.ranges?.find((r) => roll >= r.min && roll <= r.max);
    if (range?.next) {
      const tragedyTable = findTable("family", range.next);
      const tragedy = tragedyTable ? rollEntryTable(tragedyTable, rng).text : "";
      return `${range.text}: ${tragedy}`;
    }
    return range?.text ?? "";
  }

  if (tableId === "siblings" && table.sibling) {
    const roll = rollDice("1d10", rng);
    if (roll >= 8) {
      return "Only child";
    }
    const details: string[] = [];
    for (let i = 0; i < roll; i += 1) {
      const gRoll = rollDice("1d10", rng);
      const aRoll = rollDice("1d10", rng);
      const fRoll = rollDice("1d10", rng);
      const gender =
        table.sibling.gender.ranges.find((r) => gRoll >= r.min && gRoll <= r.max)?.text ??
        "Sibling";
      const age =
        table.sibling.age.ranges.find((r) => aRoll >= r.min && aRoll <= r.max)?.text ??
        "";
      const feeling =
        table.sibling.feeling.ranges.find((r) => fRoll >= r.min && fRoll <= r.max)?.text ??
        "Neutral";
      details.push(`${age} ${gender} (${feeling})`);
    }
    return `${roll}: ${details.join("; ")}`;
  }

  return rollEntryTable(table, rng).text;
}

export function rollAllFamily(rng?: Rng): Record<string, string> {
  return {
    ranking: rollFamilyTable("ranking", rng),
    parents: rollFamilyTable("parents", rng),
    familyStatus: rollFamilyTable("familyStatus", rng),
    childhood: rollFamilyTable("childhood", rng),
    siblings: rollFamilyTable("siblings", rng),
  };
}

export function rollMotivationsTable(tableId: string, rng?: Rng): string {
  const table = findTable("motivations", tableId);
  if (!table) return "";
  return rollEntryTable(table, rng).text;
}

export function rollAllMotivations(rng?: Rng): Record<string, string> {
  return {
    personality: rollMotivationsTable("personality", rng),
    valuedPerson: rollMotivationsTable("valuedPerson", rng),
    valueMost: rollMotivationsTable("valueMost", rng),
    feelAboutPeople: rollMotivationsTable("feelAboutPeople", rng),
    valuedPossession: rollMotivationsTable("valuedPossession", rng),
  };
}

export function rollSingleLifeEvent(rng?: Rng): string {
  const section = findSection("lifeEvents");
  if (!section || !section.eventType) return "Nothing happened that year";

  const typeRoll = rollDice(section.eventType.dice, rng);
  const typeRange =
    section.eventType.ranges.find((r) => typeRoll >= r.min && typeRoll <= r.max) ??
    section.eventType.ranges[0];

  if (!typeRange?.next) {
    return typeRange?.text ?? "Nothing happened that year";
  }

  const nextTable = findTable("lifeEvents", typeRange.next);
  if (!nextTable) return typeRange.text;

  if (nextTable.ranges) {
    const subRoll = rollDice(nextTable.dice ?? "1d10", rng);
    const subRange = nextTable.ranges.find(
      (r) => subRoll >= r.min && subRoll <= r.max,
    );
    if (!subRange?.next) {
      return subRange?.text ?? typeRange.text;
    }
    const leafTable = findTable("lifeEvents", subRange.next);
    if (!leafTable) return subRange.text;

    if (leafTable.subTables) {
      const parts = leafTable.subTables.map((st) => {
        const picked = rollEntryTable(st, rng).text;
        return `${st.name}: ${picked}`;
      });
      return `${subRange.text} — ${parts.join(" | ")}`;
    }
    return `${subRange.text}: ${rollEntryTable(leafTable, rng).text}`;
  }

  return rollEntryTable(nextTable, rng).text;
}

export function expectedLifeEventCount(age: number): number {
  return Math.max(0, Math.floor(age) - 16);
}

export function rollLifeEvents(age: number, rng?: Rng): string[] {
  const count = expectedLifeEventCount(age);
  const events: string[] = [];
  for (let i = 0; i < count; i += 1) {
    events.push(rollSingleLifeEvent(rng));
  }
  return events;
}

export function getStyleEntries(tableId: string): { roll: number; text: string }[] {
  return findTable("style", tableId)?.entries ?? [];
}

const ROLE_DEFAULT_CLOTHES_COLOR: Record<string, ClothesColorId> = {
  solo: "corp_charcoal",
  rocker: "neon_pink",
  netrunner: "cyber_cyan",
  media: "street_denim",
  nomad: "tactical_olive",
  fixer: "gold_chrome",
  cop: "cyber_cyan",
  corporate: "corp_charcoal",
  techie: "tactical_olive",
  medtechie: "crimson",
};

export const SKIN_TONES: SkinToneId[] = [
  "pale",
  "fair",
  "olive",
  "tan",
  "deep",
  "chrome",
];

export const HAIR_COLORS: HairColorId[] = [
  "pink",
  "cyan",
  "black",
  "silver",
  "red",
  "yellow",
  "violet",
  "copper",
];

export const CLOTHES_COLORS: ClothesColorId[] = [
  "default",
  "neon_pink",
  "cyber_cyan",
  "tactical_olive",
  "corp_charcoal",
  "crimson",
  "gold_chrome",
  "street_denim",
];

export function matchStyleRoll(tableId: string, text: string | undefined): number {
  if (!text) return 1;
  const entries = getStyleEntries(tableId);
  const exact = entries.find((e) => e.text.toLowerCase() === text.toLowerCase());
  if (exact) return exact.roll;
  const partial = entries.find((e) =>
    text.toLowerCase().includes(e.text.toLowerCase().slice(0, 10)),
  );
  return partial?.roll ?? 1;
}

export function deriveAppearanceFromCharacter(
  roleId: string,
  style: Record<string, string>,
  current?: CharacterAppearance,
): CharacterAppearance {
  const hairRoll = matchStyleRoll("hair", style.hair);
  const clothesRoll = matchStyleRoll("clothes", style.clothes);

  return {
    skinTone: current?.skinTone ?? "tan",
    hairStyle: hairRoll,
    hairColor: current?.hairColor ?? (hairRoll === 2 ? "pink" : hairRoll === 8 ? "silver" : "cyan"),
    clothesStyle: clothesRoll,
    clothesColor: current?.clothesColor ?? ROLE_DEFAULT_CLOTHES_COLOR[roleId] ?? "default",
  };
}
