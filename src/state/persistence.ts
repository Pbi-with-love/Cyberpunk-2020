import type { Character } from "../types";
import { STAT_KEYS, rolesById } from "../data";

export const STORAGE_KEY = "cp2020_character_v1";
export const CURRENT_SCHEMA_VERSION = 1;

export function serializeCharacter(character: Character): string {
  return JSON.stringify(character, null, 2);
}

export function deserializeCharacter(rawJson: string): Character {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid JSON file: could not parse syntax.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid character payload: expected a JSON object.");
  }

  const obj = parsed as Record<string, unknown>;
  if (obj.version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported character schema version: ${String(obj.version)}. Expected version ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  const identity = obj.identity as Record<string, unknown> | undefined;
  const stats = obj.stats as Record<string, unknown> | undefined;
  const skills = obj.skills as Record<string, unknown> | undefined;
  const lifepath = obj.lifepath as Record<string, unknown> | undefined;
  const gear = obj.gear as Record<string, unknown> | undefined;

  if (!identity || !stats || !skills || !lifepath || !gear) {
    throw new Error(
      "Incomplete character JSON: missing required section (identity, stats, skills, lifepath, or gear).",
    );
  }

  if (typeof identity.roleId !== "string" || !rolesById[identity.roleId]) {
    throw new Error(`Invalid roleId in character JSON: "${String(identity.roleId)}".`);
  }

  const values = stats.values as Record<string, unknown> | undefined;
  if (!values || typeof values !== "object") {
    throw new Error("Invalid stats.values in character JSON.");
  }
  for (const key of STAT_KEYS) {
    if (typeof values[key] !== "number") {
      throw new Error(`Missing or non-numeric stat "${key}" in character JSON.`);
    }
  }

  if (!Array.isArray(lifepath.events)) {
    throw new Error("Invalid lifepath.events in character JSON.");
  }

  if (!Array.isArray(gear.items) || typeof gear.startingMoney !== "number") {
    throw new Error("Invalid gear section in character JSON.");
  }

  return parsed as Character;
}

export function saveCharacterToStorage(
  character: Character,
  storage: Pick<Storage, "setItem"> = window.localStorage,
): void {
  storage.setItem(STORAGE_KEY, serializeCharacter(character));
}

export function loadCharacterFromStorage(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): Character | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return deserializeCharacter(raw);
}
