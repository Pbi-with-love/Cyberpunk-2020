import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { GearPixelIcon } from "../components/PixelAvatar/GearPixelIcon";
import { PixelAvatarCanvas } from "../components/PixelAvatar/PixelAvatarCanvas";
import { VerifyBadge } from "../components/VerifyBadge";
import {
  STAT_KEYS,
  armorById,
  cyberwareById,
  gearData,
  lifepathData,
  rolesById,
  skillsById,
  statsByKey,
  weaponsById,
} from "../data";
import {
  applyCyberware,
  baseSkillId,
  calculateGearCost,
  calculateRemainingMoney,
  deriveStats,
  getActiveCareerSkillsForCharacter,
  getCareerPointLimit,
  getSkillDef,
  getSpecialAbilityLevel,
  pickupPoints,
  sumSkillPoints,
  sumStats,
} from "../rules";
import type { Character, WizardStep } from "../types";

export interface CharacterSheetStepProps {
  character: Character;
  onEditStep: (step: WizardStep) => void;
  onSave: () => void;
  onLoad: () => void;
  onImport: (rawJson: string) => void;
  onExport: () => string;
  onDownloadPortrait: () => void;
  statusMessage?: string | null;
  importError?: string | null;
}

function getLifepathTableName(sectionId: string, tableId: string): string {
  const section = lifepathData.sections.find((s) => s.id === sectionId);
  const table = section?.tables.find((t) => t.id === tableId);
  return table?.name ?? tableId;
}

function SheetGearRow({
  itemId,
  cost,
  children,
}: {
  itemId: string;
  cost: number;
  children: ReactNode;
}) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-1) 0",
        borderBottom: "1px solid var(--border-subtle)",
        fontSize: "var(--text-sm)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          minWidth: 0,
        }}
      >
        <GearPixelIcon itemId={itemId} size={28} />
        <span>{children}</span>
      </span>
      <span className="mono" style={{ flexShrink: 0 }}>
        {cost} {gearData.currency}
      </span>
    </li>
  );
}

export function CharacterSheetStep({
  character,
  onEditStep,
  onSave,
  onLoad,
  onImport,
  onExport,
  onDownloadPortrait,
  statusMessage,
  importError,
}: CharacterSheetStepProps) {
  const [exportedPayload, setExportedPayload] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const role = rolesById[character.identity.roleId];
  const specialAbilityDef = role ? skillsById[role.specialAbility] : undefined;
  const specialLevel = getSpecialAbilityLevel(character);

  const derived = deriveStats(character.stats.values);
  const totalStatPoints = sumStats(character.stats.values);
  const cyberStatus = applyCyberware(
    character.stats.values.EMP,
    character.gear.items,
  );

  const careerSpent = sumSkillPoints(character.skills.career);
  const pickupSpent = sumSkillPoints(character.skills.pickup);
  const careerLimit = getCareerPointLimit();
  const pickupLimit = pickupPoints(character.stats.values);
  const activeCareerSet = useMemo(
    () => new Set(getActiveCareerSkillsForCharacter(character)),
    [character],
  );

  const activeSkills = useMemo(() => {
    const allKeys = Array.from(
      new Set([
        ...Object.keys(character.skills.career),
        ...Object.keys(character.skills.pickup),
      ]),
    );
    return allKeys
      .map((skillKey) => {
        const career = character.skills.career[skillKey] ?? 0;
        const pickup = character.skills.pickup[skillKey] ?? 0;
        const total = career + pickup;
        const def = getSkillDef(skillKey);
        const detail = character.skills.details[skillKey]?.trim() ?? "";
        const isSpecial = def?.stat === "SPECIAL";
        const isCareer =
          activeCareerSet.has(skillKey) || activeCareerSet.has(baseSkillId(skillKey));
        const baseStatVal =
          def && def.stat !== "SPECIAL" ? character.stats.values[def.stat] : null;
        const statPlusSkill = baseStatVal !== null ? baseStatVal + total : total;
        const effectiveEmpTotal =
          def?.stat === "EMP" && cyberStatus.emp !== character.stats.values.EMP
            ? cyberStatus.emp + total
            : null;
        return {
          skillKey,
          name: def?.name ?? skillKey,
          stat: def?.stat ?? "INT",
          career,
          pickup,
          total,
          detail,
          isSpecial,
          isCareer,
          statPlusSkill,
          effectiveEmpTotal,
        };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => {
        if (a.isSpecial !== b.isSpecial) return a.isSpecial ? -1 : 1;
        if (a.isCareer !== b.isCareer) return a.isCareer ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [activeCareerSet, character, cyberStatus.emp]);

  const spentMoney = calculateGearCost(character.gear.items);
  const remainingMoney = calculateRemainingMoney(
    character.gear.startingMoney,
    character.gear.items,
  );

  const weaponItems = character.gear.items
    .map((entry, idx) => ({ entry, idx, def: weaponsById[entry.itemId] }))
    .filter((x) => x.def !== undefined);
  const armorItems = character.gear.items
    .map((entry, idx) => ({ entry, idx, def: armorById[entry.itemId] }))
    .filter((x) => x.def !== undefined);
  const cyberwareItems = character.gear.items
    .map((entry, idx) => ({ entry, idx, def: cyberwareById[entry.itemId] }))
    .filter((x) => x.def !== undefined);

  const handleExportClick = () => {
    const payload = onExport();
    setExportedPayload(payload);
    setCopiedJson(false);
  };

  const handleCopyExported = async () => {
    if (!exportedPayload || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(exportedPayload);
      setCopiedJson(true);
    } catch {
      setCopiedJson(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text =
        typeof file.text === "function"
          ? await file.text()
          : await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(new Error("Failed to read file."));
              reader.readAsText(file);
            });
      onImport(text);
    } catch {
      onImport("");
    } finally {
      input.value = "";
    }
  };

  const styleFields = ["clothes", "hair", "affectation", "origin", "language"] as const;
  const familyFields = ["ranking", "parents", "familyStatus", "childhood", "siblings"] as const;
  const motivationFields = [
    "personality",
    "valuedPerson",
    "valueMost",
    "feelAboutPeople",
    "valuedPossession",
  ] as const;

  const kvRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: "var(--space-3)",
    padding: "var(--space-1) 0",
    borderBottom: "1px solid var(--border-subtle)",
    fontSize: "var(--text-sm)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Persistence & Export Toolbar */}
      <section className="hud-panel hud-panel--elevated no-print" aria-label="Character sheet actions">
        <div className="hud-panel__header">
          <div>
            <h2 className="hud-panel__title">Step 6 // Character Sheet</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginTop: "var(--space-1)" }}>
              Save locally, export/import JSON, download your 2D pixel portrait, or print your character dossier.
            </p>
          </div>
          <span className="hud-badge hud-badge--cyan">Schema v{character.version}</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
          <button
            type="button"
            className="hud-btn hud-btn--primary"
            data-testid="btn-save"
            onClick={onSave}
          >
            Save
          </button>

          <button
            type="button"
            className="hud-btn"
            data-testid="btn-load"
            onClick={onLoad}
          >
            Load
          </button>

          <button
            type="button"
            className="hud-btn"
            data-testid="btn-export-json"
            onClick={handleExportClick}
          >
            Export JSON
          </button>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "0.2rem 0.6rem",
              border: "1px solid var(--border-panel)",
              borderRadius: "var(--radius-xs)",
              background: "var(--bg-input)",
            }}
          >
            <label
              htmlFor="import-json-file"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--neon-cyan)",
                whiteSpace: "nowrap",
              }}
            >
              Import JSON
            </label>
            <input
              id="import-json-file"
              type="file"
              accept=".json,application/json"
              data-testid="input-import-json"
              onChange={handleImportFile}
              style={{
                fontSize: "var(--text-xs)",
                maxWidth: "210px",
              }}
            />
          </div>

          <button
            type="button"
            className="hud-btn"
            data-testid="btn-print"
            onClick={() => window.print()}
          >
            Print / PDF
          </button>

          <button
            type="button"
            className="hud-btn hud-btn--accent"
            data-testid="btn-download-portrait"
            onClick={onDownloadPortrait}
          >
            Download Portrait PNG
          </button>
        </div>

        {statusMessage ? (
          <div
            role="status"
            data-testid="save-status"
            style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-2) var(--space-3)",
              background: "var(--surface-green)",
              border: "1px solid var(--border-green)",
              borderRadius: "var(--radius-xs)",
              color: "var(--neon-green)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
            }}
          >
            {statusMessage}
          </div>
        ) : null}

        {importError ? (
          <div
            role="alert"
            data-testid="import-error"
            className="cp-step-errors"
            style={{ marginTop: "var(--space-3)" }}
          >
            <div className="cp-step-errors__header" style={{ marginBottom: 0 }}>
              <span className="cp-step-errors__icon">!</span>
              <span className="cp-step-errors__item">{importError}</span>
            </div>
          </div>
        ) : null}

        {exportedPayload ? (
          <div
            style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xs)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--space-2)",
                marginBottom: "var(--space-2)",
              }}
            >
              <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--neon-cyan)" }}>
                Exported JSON Payload
              </span>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="hud-btn hud-btn--sm"
                  onClick={handleCopyExported}
                >
                  {copiedJson ? "Copied" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  className="hud-btn hud-btn--ghost hud-btn--sm"
                  onClick={() => setExportedPayload(null)}
                >
                  Hide
                </button>
              </div>
            </div>
            <pre
              data-testid="exported-json-preview"
              style={{
                margin: 0,
                maxHeight: "180px",
                overflow: "auto",
                fontSize: "var(--text-xs)",
                color: "var(--text-secondary)",
              }}
            >
              {exportedPayload}
            </pre>
          </div>
        ) : null}
      </section>

      {/* Section 1: Identity & Portrait */}
      <section className="hud-panel" aria-labelledby="sheet-identity-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h3 id="sheet-identity-heading" className="hud-panel__title">
              Identity Dossier
            </h3>
            {role?.verify ? <VerifyBadge /> : null}
          </div>
          <button
            type="button"
            className="hud-btn hud-btn--ghost hud-btn--sm no-print"
            data-testid="edit-step-1"
            onClick={() => onEditStep(1)}
          >
            Edit Identity
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gap: "var(--space-5)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "var(--space-2)",
              background: "var(--bg-input)",
              border: "1px solid var(--border-panel)",
              borderRadius: "var(--radius-xs)",
            }}
          >
            <PixelAvatarCanvas
              character={character}
              width={160}
              height={240}
              testId="sheet-pixel-avatar-canvas"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--space-3)" }}>
              <h4 style={{ fontSize: "var(--text-2xl)", color: "var(--neon-cyan)" }}>
                {character.identity.handle || "Unnamed Edgerunner"}
              </h4>
              <span className="hud-badge hud-badge--pink">
                {role?.name ?? character.identity.roleId}
              </span>
              {role?.tagline ? (
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                  {role.tagline}
                </span>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "var(--space-2) var(--space-4)",
                marginTop: "var(--space-1)",
              }}
            >
              <div style={kvRowStyle}>
                <span style={{ color: "var(--text-muted)" }}>Real Name</span>
                <strong>{character.identity.realName || "—"}</strong>
              </div>
              <div style={kvRowStyle}>
                <span style={{ color: "var(--text-muted)" }}>Age</span>
                <strong className="mono">{character.identity.age}</strong>
              </div>
              <div style={kvRowStyle}>
                <span style={{ color: "var(--text-muted)" }}>Gender</span>
                <strong>{character.identity.gender || "—"}</strong>
              </div>
              <div style={kvRowStyle}>
                <span style={{ color: "var(--text-muted)" }}>Reputation</span>
                <strong className="mono">{character.identity.reputation}</strong>
              </div>
              <div style={kvRowStyle}>
                <span style={{ color: "var(--text-muted)" }}>Special Ability</span>
                <strong>
                  {specialAbilityDef?.name ?? role?.specialAbility ?? "—"} (Rank {specialLevel})
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Stats & Derived Stats */}
      <section className="hud-panel" aria-labelledby="sheet-stats-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h3 id="sheet-stats-heading" className="hud-panel__title">
              Attributes & Derived Stats
            </h3>
            <span className="hud-badge">
              {character.stats.method} · {totalStatPoints} / {character.stats.points} pts
            </span>
          </div>
          <button
            type="button"
            className="hud-btn hud-btn--ghost hud-btn--sm no-print"
            data-testid="edit-step-2"
            onClick={() => onEditStep(2)}
          >
            Edit Stats
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
          }}
        >
          {STAT_KEYS.map((key) => {
            const isPriority = role?.priorityStats.includes(key) ?? false;
            const statDef = statsByKey[key];
            return (
              <div
                key={key}
                className={`hud-stat-chip ${isPriority ? "hud-stat-chip--accent" : ""}`}
                title={statDef?.name}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px" }}>
                  <span className="hud-stat-chip__label">{key}</span>
                  {isPriority ? (
                    <span className="hud-badge hud-badge--pink" style={{ fontSize: "0.6rem", padding: "0 4px" }}>
                      Key
                    </span>
                  ) : null}
                </div>
                <span className="hud-stat-chip__value">{character.stats.values[key]}</span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
            gap: "var(--space-2)",
          }}
        >
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Run</span>
            <span className="hud-stat-chip__value">{derived.run} m</span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Leap</span>
            <span className="hud-stat-chip__value">{derived.leap} m</span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Lift</span>
            <span className="hud-stat-chip__value">{derived.lift} kg</span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Save</span>
            <span className="hud-stat-chip__value">{derived.save}</span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">BTM</span>
            <span className="hud-stat-chip__value">
              {derived.btm} {derived.btmLabel ? `(${derived.btmLabel})` : ""}
            </span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">BDM</span>
            <span className="hud-stat-chip__value">
              {derived.bdm >= 0 ? `+${derived.bdm}` : derived.bdm}
            </span>
          </div>
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Base Humanity</span>
            <span className="hud-stat-chip__value">{cyberStatus.baseHumanity}</span>
          </div>
          <div
            className={`hud-stat-chip ${
              cyberStatus.cyberpsychosis ? "hud-stat-chip--danger" : "hud-stat-chip--accent"
            }`}
          >
            <span className="hud-stat-chip__label">Current Humanity</span>
            <span className="hud-stat-chip__value">{cyberStatus.humanity}</span>
          </div>
          <div
            className={`hud-stat-chip ${
              cyberStatus.cyberpsychosis ? "hud-stat-chip--danger" : ""
            }`}
          >
            <span className="hud-stat-chip__label">Current EMP</span>
            <span className="hud-stat-chip__value">{cyberStatus.emp}</span>
          </div>
        </div>

        {cyberStatus.cyberpsychosis ? (
          <div
            role="alert"
            className="cp-step-errors"
            style={{ marginTop: "var(--space-3)" }}
          >
            <div className="cp-step-errors__header" style={{ marginBottom: 0 }}>
              <span className="cp-step-errors__icon">!</span>
              <span className="cp-step-errors__title">
                Cyberpsychosis Alert: Current Humanity is {cyberStatus.humanity} (≤ 0)
              </span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Section 3: Active Skills Table */}
      <section className="hud-panel" aria-labelledby="sheet-skills-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h3 id="sheet-skills-heading" className="hud-panel__title">
              Active Skills
            </h3>
            <span className="hud-badge hud-badge--cyan">
              Career {careerSpent}/{careerLimit}
            </span>
            <span className="hud-badge">
              Pickup {pickupSpent}/{pickupLimit}
            </span>
          </div>
          <button
            type="button"
            className="hud-btn hud-btn--ghost hud-btn--sm no-print"
            data-testid="edit-step-3"
            onClick={() => onEditStep(3)}
          >
            Edit Skills
          </button>
        </div>

        {activeSkills.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            No skill ranks allocated yet.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "var(--text-sm)",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-panel)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "var(--space-2)" }}>Skill</th>
                  <th style={{ padding: "var(--space-2)" }}>Stat</th>
                  <th style={{ padding: "var(--space-2)" }}>Career</th>
                  <th style={{ padding: "var(--space-2)" }}>Pickup</th>
                  <th style={{ padding: "var(--space-2)" }}>Rank</th>
                  <th style={{ padding: "var(--space-2)" }}>Specialization</th>
                  <th style={{ padding: "var(--space-2)" }}>Stat + Skill</th>
                </tr>
              </thead>
              <tbody>
                {activeSkills.map((row) => (
                  <tr
                    key={row.skillKey}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td style={{ padding: "var(--space-2)" }}>
                      <strong>{row.name}</strong>{" "}
                      {row.isSpecial ? (
                        <span className="hud-badge hud-badge--pink">Special</span>
                      ) : row.isCareer ? (
                        <span className="hud-badge hud-badge--cyan">Career</span>
                      ) : null}
                    </td>
                    <td className="mono" style={{ padding: "var(--space-2)" }}>
                      {row.stat}
                    </td>
                    <td className="mono" style={{ padding: "var(--space-2)" }}>
                      {row.career}
                    </td>
                    <td className="mono" style={{ padding: "var(--space-2)" }}>
                      {row.pickup}
                    </td>
                    <td className="mono" style={{ padding: "var(--space-2)", fontWeight: 700 }}>
                      {row.total}
                    </td>
                    <td style={{ padding: "var(--space-2)", color: "var(--text-secondary)" }}>
                      {row.detail || "—"}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "var(--space-2)",
                        fontWeight: 700,
                        color: "var(--neon-cyan)",
                      }}
                    >
                      {row.statPlusSkill}
                      {row.effectiveEmpTotal !== null ? (
                        <span style={{ color: "var(--neon-amber)", fontSize: "var(--text-xs)", marginLeft: "6px" }}>
                          ({row.effectiveEmpTotal} w/ cyber)
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 4: Lifepath Summary */}
      <section className="hud-panel" aria-labelledby="sheet-lifepath-heading">
        <div className="hud-panel__header">
          <h3 id="sheet-lifepath-heading" className="hud-panel__title">
            Lifepath & Background
          </h3>
          <button
            type="button"
            className="hud-btn hud-btn--ghost hud-btn--sm no-print"
            data-testid="edit-step-4"
            onClick={() => onEditStep(4)}
          >
            Edit Lifepath
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-cyan)", marginBottom: "var(--space-2)" }}>
              Style
            </h4>
            {styleFields.map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                  {getLifepathTableName("style", key)}
                </span>
                <span>{character.lifepath.style[key] || "—"}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-cyan)", marginBottom: "var(--space-2)" }}>
              Family
            </h4>
            {familyFields.map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                  {getLifepathTableName("family", key)}
                </span>
                <span>{character.lifepath.family[key] || "—"}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-cyan)", marginBottom: "var(--space-2)" }}>
              Motivations
            </h4>
            {motivationFields.map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                  {getLifepathTableName("motivations", key)}
                </span>
                <span>
                  {character.lifepath.motivations[key] || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "var(--space-4)" }}>
          <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-pink)", marginBottom: "var(--space-2)" }}>
            Life Events ({character.lifepath.events.length})
          </h4>
          {character.lifepath.events.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              No life events recorded (age 16).
            </p>
          ) : (
            <ol
              style={{
                paddingLeft: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
                fontSize: "var(--text-sm)",
              }}
            >
              {character.lifepath.events.map((evt, idx) => (
                <li key={idx}>
                  <span className="mono" style={{ color: "var(--neon-cyan)", marginRight: "var(--space-2)" }}>
                    Age {17 + idx}:
                  </span>
                  <span>{evt}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Section 5: Gear & Cyberware Summary */}
      <section className="hud-panel" aria-labelledby="sheet-gear-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h3 id="sheet-gear-heading" className="hud-panel__title">
              Gear & Cyberware
            </h3>
            {gearData.verify ? <VerifyBadge /> : null}
            <span className="hud-badge hud-badge--amber">
              Starting {character.gear.startingMoney} {gearData.currency}
            </span>
            <span className={`hud-badge ${remainingMoney < 0 ? "hud-badge--red" : "hud-badge--green"}`}>
              Remaining {remainingMoney} {gearData.currency} (Spent {spentMoney} {gearData.currency})
            </span>
          </div>
          <button
            type="button"
            className="hud-btn hud-btn--ghost hud-btn--sm no-print"
            data-testid="edit-step-5"
            onClick={() => onEditStep(5)}
          >
            Edit Gear
          </button>
        </div>

        {character.gear.items.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            No equipment or cyberware installed.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-cyan)", marginBottom: "var(--space-2)" }}>
                Weapons ({weaponItems.length})
              </h4>
              {weaponItems.length === 0 ? (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>None</p>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  {weaponItems.map(({ idx, def }) =>
                    def ? (
                      <SheetGearRow key={`w-${idx}`} itemId={def.id} cost={def.cost}>
                        <strong>{def.name}</strong>{" "}
                        <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                          ({def.damage}, WA {def.wa >= 0 ? `+${def.wa}` : def.wa})
                        </span>
                      </SheetGearRow>
                    ) : null,
                  )}
                </ul>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-green)", marginBottom: "var(--space-2)" }}>
                Armor ({armorItems.length})
              </h4>
              {armorItems.length === 0 ? (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>None</p>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  {armorItems.map(({ idx, def }) =>
                    def ? (
                      <SheetGearRow key={`a-${idx}`} itemId={def.id} cost={def.cost}>
                        <strong>{def.name}</strong>{" "}
                        <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                          (SP {def.sp}, {def.covers.join("/")}, EV {def.ev})
                        </span>
                      </SheetGearRow>
                    ) : null,
                  )}
                </ul>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: "var(--text-sm)", color: "var(--neon-pink)", marginBottom: "var(--space-2)" }}>
                Cyberware ({cyberwareItems.length})
              </h4>
              {cyberwareItems.length === 0 ? (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>None</p>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  {cyberwareItems.map(({ entry, idx, def }) =>
                    def ? (
                      <SheetGearRow key={`c-${idx}`} itemId={def.id} cost={def.cost}>
                        <strong>{def.name}</strong>{" "}
                        <span className="hud-badge hud-badge--pink">
                          HC {entry.humanityCostRolled ?? 0}
                        </span>
                      </SheetGearRow>
                    ) : null,
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
