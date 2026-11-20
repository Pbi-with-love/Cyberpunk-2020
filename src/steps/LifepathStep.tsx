import { useMemo } from "react";
import { DiceButton } from "../components/DiceButton";
import { Tooltip } from "../components/Tooltip";
import { lifepathData } from "../data";
import {
  deriveAppearanceFromCharacter,
  expectedLifeEventCount,
  getStyleEntries,
  rollAllFamily,
  rollAllMotivations,
  rollAllStyle,
  rollFamilyTable,
  rollLifeEvents,
  rollMotivationsTable,
  rollSingleLifeEvent,
  rollStyleTable,
} from "../rules";
import type { Character, LifepathTable } from "../types";

export interface LifepathStepProps {
  character: Character;
  onChange: (next: Character) => void;
}

const STYLE_KEYS = ["clothes", "hair", "affectation", "origin", "language"] as const;
const FAMILY_KEYS = ["ranking", "parents", "familyStatus", "childhood", "siblings"] as const;
const MOTIVATION_KEYS = [
  "personality",
  "valuedPerson",
  "valueMost",
  "feelAboutPeople",
  "valuedPossession",
] as const;

function getSection(sectionId: string) {
  return lifepathData.sections.find((s) => s.id === sectionId);
}

function getTable(sectionId: string, tableId: string): LifepathTable | undefined {
  return getSection(sectionId)?.tables.find((t) => t.id === tableId);
}

function normalizeEvents(events: string[], expectedCount: number): string[] {
  const next = events.slice(0, expectedCount);
  while (next.length < expectedCount) {
    next.push("Nothing happened that year");
  }
  return next;
}

export function LifepathStep({ character, onChange }: LifepathStepProps) {
  const expectedEvents = expectedLifeEventCount(character.identity.age);

  const styleSection = getSection("style");
  const familySection = getSection("family");
  const motivationsSection = getSection("motivations");
  const eventsSection = getSection("lifeEvents");

  const languageSuggestions = useMemo(() => {
    const langTable = getTable("style", "language");
    if (!langTable?.byOrigin) return [];
    const originEntries = getStyleEntries("origin");
    const currentOrigin = (character.lifepath.style.origin ?? "").trim().toLowerCase();
    const matched = originEntries.find(
      (entry) => entry.text.toLowerCase() === currentOrigin,
    );
    if (matched) {
      return langTable.byOrigin[String(matched.roll)] ?? [];
    }
    const allLangs = new Set<string>();
    for (const list of Object.values(langTable.byOrigin)) {
      for (const item of list) {
        allLangs.add(item);
      }
    }
    return Array.from(allLangs);
  }, [character.lifepath.style.origin]);

  const handleRollAllLifepath = () => {
    const nextStyle = rollAllStyle();
    onChange({
      ...character,
      lifepath: {
        style: nextStyle,
        family: rollAllFamily(),
        motivations: rollAllMotivations(),
        events: rollLifeEvents(character.identity.age),
      },
      appearance: deriveAppearanceFromCharacter(
        character.identity.roleId,
        nextStyle,
        character.appearance,
      ),
    });
  };

  const handleStyleChange = (key: string, value: string) => {
    const nextStyle = { ...character.lifepath.style, [key]: value };
    const shouldSyncAppearance = key === "hair" || key === "clothes";
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        style: nextStyle,
      },
      ...(shouldSyncAppearance
        ? {
            appearance: deriveAppearanceFromCharacter(
              character.identity.roleId,
              nextStyle,
              character.appearance,
            ),
          }
        : {}),
    });
  };

  const handleRollStyle = (key: string) => {
    const rolled = rollStyleTable(key, undefined, character.lifepath.style.origin);
    const nextStyle = { ...character.lifepath.style, ...rolled };
    const shouldSyncAppearance = key === "hair" || key === "clothes";
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        style: nextStyle,
      },
      ...(shouldSyncAppearance
        ? {
            appearance: deriveAppearanceFromCharacter(
              character.identity.roleId,
              nextStyle,
              character.appearance,
            ),
          }
        : {}),
    });
  };

  const handleFamilyChange = (key: string, value: string) => {
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        family: {
          ...character.lifepath.family,
          [key]: value,
        },
      },
    });
  };

  const handleRollFamily = (key: string) => {
    const rolled = rollFamilyTable(key);
    handleFamilyChange(key, rolled);
  };

  const handleMotivationChange = (key: string, value: string) => {
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        motivations: {
          ...character.lifepath.motivations,
          [key]: value,
        },
      },
    });
  };

  const handleRollMotivation = (key: string) => {
    const rolled = rollMotivationsTable(key);
    handleMotivationChange(key, rolled);
  };

  const handleEventChange = (index: number, value: string) => {
    const nextEvents = normalizeEvents(character.lifepath.events, expectedEvents);
    nextEvents[index] = value;
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        events: nextEvents,
      },
    });
  };

  const handleRollSingleEvent = (index: number) => {
    const nextEvents = normalizeEvents(character.lifepath.events, expectedEvents);
    nextEvents[index] = rollSingleLifeEvent();
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        events: nextEvents,
      },
    });
  };

  const handleRollAllEvents = () => {
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        events: rollLifeEvents(character.identity.age),
      },
    });
  };

  const fieldRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "var(--space-2)",
    alignItems: "center",
  };

  const fieldGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "var(--space-4)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <section className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header" style={{ marginBottom: 0, borderBottom: 0, paddingBottom: 0 }}>
          <div>
            <h2 className="hud-panel__title">Step 4 // Lifepath Generator</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginTop: "var(--space-1)" }}>
              Roll {lifepathData.dice} tables for background, family, motivations, and life events—or type your own details.
            </p>
          </div>
          <DiceButton
            label="Roll Entire Lifepath (1d10)"
            testId="btn-roll-lifepath-all"
            onClick={handleRollAllLifepath}
          />
        </div>
      </section>

      {/* Style Section */}
      <section className="hud-panel" aria-labelledby="lifepath-style-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h3 id="lifepath-style-heading" className="hud-panel__title">
              {styleSection?.name ?? "Style"}
            </h3>
            <Tooltip
              text="Clothes and Hairstyle automatically sync with your 2D Pixel Avatar."
              label="Style sync details"
            />
          </div>
          <span className="hud-badge hud-badge--cyan">Avatar Synced</span>
        </div>

        <div style={fieldGridStyle}>
          {STYLE_KEYS.map((key) => {
            const table = getTable("style", key);
            const inputId = `lifepath-style-${key}`;
            const listId = `lifepath-style-list-${key}`;
            const options =
              key === "language"
                ? languageSuggestions
                : (table?.entries?.map((e) => e.text) ?? []);
            const tooltipText = [table?.note, table?.rule].filter(Boolean).join(" ");

            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <label
                    htmlFor={inputId}
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {table?.name ?? key}
                  </label>
                  {tooltipText ? (
                    <Tooltip text={tooltipText} label={`${table?.name ?? key} rule`} />
                  ) : null}
                </div>
                <div style={fieldRowStyle}>
                  <input
                    id={inputId}
                    type="text"
                    className="hud-input"
                    list={options.length > 0 ? listId : undefined}
                    data-testid={`input-style-${key}`}
                    value={character.lifepath.style[key] ?? ""}
                    onChange={(e) => handleStyleChange(key, e.target.value)}
                  />
                  <DiceButton
                    label="1d10"
                    testId={`roll-style-${key}`}
                    onClick={() => handleRollStyle(key)}
                  />
                </div>
                {options.length > 0 ? (
                  <datalist id={listId}>
                    {options.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Family Section */}
      <section className="hud-panel" aria-labelledby="lifepath-family-heading">
        <div className="hud-panel__header">
          <h3 id="lifepath-family-heading" className="hud-panel__title">
            {familySection?.name ?? "Family"}
          </h3>
          <span className="hud-badge">Origins & Ties</span>
        </div>

        <div style={fieldGridStyle}>
          {FAMILY_KEYS.map((key) => {
            const table = getTable("family", key);
            const inputId = `lifepath-family-${key}`;
            const listId = `lifepath-family-list-${key}`;
            const options = table?.entries?.map((e) => e.text) ?? [];
            const tooltipText = [table?.rule, table?.note].filter(Boolean).join(" ");

            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <label
                    htmlFor={inputId}
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {table?.name ?? key}
                  </label>
                  {tooltipText ? (
                    <Tooltip text={tooltipText} label={`${table?.name ?? key} rule`} />
                  ) : null}
                </div>
                <div style={fieldRowStyle}>
                  <input
                    id={inputId}
                    type="text"
                    className="hud-input"
                    list={options.length > 0 ? listId : undefined}
                    data-testid={`input-family-${key}`}
                    value={character.lifepath.family[key] ?? ""}
                    onChange={(e) => handleFamilyChange(key, e.target.value)}
                  />
                  <DiceButton
                    label="1d10"
                    testId={`roll-family-${key}`}
                    onClick={() => handleRollFamily(key)}
                  />
                </div>
                {options.length > 0 ? (
                  <datalist id={listId}>
                    {options.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Motivations Section */}
      <section className="hud-panel" aria-labelledby="lifepath-motivations-heading">
        <div className="hud-panel__header">
          <h3 id="lifepath-motivations-heading" className="hud-panel__title">
            {motivationsSection?.name ?? "Motivations"}
          </h3>
          <span className="hud-badge hud-badge--pink">Psychology</span>
        </div>

        <div style={fieldGridStyle}>
          {MOTIVATION_KEYS.map((key) => {
            const table = getTable("motivations", key);
            const inputId = `lifepath-motivations-${key}`;
            const listId = `lifepath-motivations-list-${key}`;
            const options = table?.entries?.map((e) => e.text) ?? [];

            return (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <label
                  htmlFor={inputId}
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {table?.name ?? key}
                </label>
                <div style={fieldRowStyle}>
                  <input
                    id={inputId}
                    type="text"
                    className="hud-input"
                    list={options.length > 0 ? listId : undefined}
                    data-testid={`input-motivations-${key}`}
                    value={character.lifepath.motivations[key] ?? ""}
                    onChange={(e) => handleMotivationChange(key, e.target.value)}
                  />
                  <DiceButton
                    label="1d10"
                    testId={`roll-motivations-${key}`}
                    onClick={() => handleRollMotivation(key)}
                  />
                </div>
                {options.length > 0 ? (
                  <datalist id={listId}>
                    {options.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Life Events Section */}
      <section className="hud-panel" aria-labelledby="lifepath-events-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h3 id="lifepath-events-heading" className="hud-panel__title">
              {eventsSection?.name ?? "Life Events"}
            </h3>
            <span className="hud-badge hud-badge--cyan">
              {expectedEvents} {expectedEvents === 1 ? "Year" : "Years"} (Age {character.identity.age} − 16)
            </span>
            {eventsSection?.rule ? (
              <Tooltip text={eventsSection.rule} label="Life events rule" />
            ) : null}
          </div>
          <DiceButton
            label="Roll All Events (1d10)"
            testId="btn-roll-all-events"
            onClick={handleRollAllEvents}
            disabled={expectedEvents === 0}
          />
        </div>

        {expectedEvents === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            At age 16, your character has no prior annual life events yet. Increase Age in Step 1 to generate yearly events.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {Array.from({ length: expectedEvents }, (_, idx) => {
              const yearAge = 17 + idx;
              const eventInputId = `life-event-${idx}`;
              const value = character.lifepath.events[idx] ?? "";
              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px minmax(0, 1fr) auto",
                    gap: "var(--space-3)",
                    alignItems: "center",
                  }}
                >
                  <label
                    htmlFor={eventInputId}
                    className="mono"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--neon-cyan)",
                    }}
                  >
                    Age {yearAge}
                  </label>
                  <input
                    id={eventInputId}
                    type="text"
                    className="hud-input"
                    data-testid={`life-event-input-${idx}`}
                    value={value}
                    onChange={(e) => handleEventChange(idx, e.target.value)}
                  />
                  <DiceButton
                    label={`Roll Age ${yearAge}`}
                    testId={`btn-roll-event-${idx}`}
                    onClick={() => handleRollSingleEvent(idx)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
