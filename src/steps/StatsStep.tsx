import { useState, type CSSProperties } from "react";
import { DiceButton } from "../components/DiceButton";
import { Tooltip } from "../components/Tooltip";
import { VerifyBadge } from "../components/VerifyBadge";
import { STAT_KEYS, rolesById, statsByKey, statsData } from "../data";
import { createRng, pickOne, rollDice, rollStatFast } from "../dice";
import { deriveStats, reconcileCharacter, sumStats } from "../rules";
import type { Character, PointMethodId, StatKey } from "../types";

export interface StatsStepProps {
  character: Character;
  onChange: (next: Character) => void;
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

interface StatRowProps {
  statKey: StatKey;
  value: number;
  min: number;
  max: number;
  isPriority: boolean;
  onValueChange: (statKey: StatKey, nextVal: number) => void;
}

function StatRow({
  statKey,
  value,
  min,
  max,
  isPriority,
  onValueChange,
}: StatRowProps) {
  const def = statsByKey[statKey];
  const [draftText, setDraftText] = useState<string>(() =>
    Number.isFinite(value) ? String(value) : "",
  );
  const [lastSynced, setLastSynced] = useState<number>(value);

  if (value !== lastSynced) {
    setLastSynced(value);
    setDraftText(Number.isFinite(value) ? String(value) : "");
  }

  const handleTextChange = (raw: string) => {
    setDraftText(raw);
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? 0 : Number(trimmed);
    const nextVal = Number.isFinite(parsed) ? parsed : 0;
    setLastSynced(nextVal);
    onValueChange(statKey, nextVal);
  };

  const handleStep = (delta: number) => {
    const base = Number.isFinite(value) ? value : min;
    const clamped = Math.min(max, Math.max(min, Math.round(base) + delta));
    setLastSynced(clamped);
    setDraftText(String(clamped));
    onValueChange(statKey, clamped);
  };

  const tooltipText = `${def.short} Used for: ${def.usedFor.join(", ")}.`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        flexWrap: "wrap",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-xs)",
        background: isPriority ? "var(--surface-cyan)" : "var(--bg-input)",
        border: isPriority
          ? "1px solid var(--border-strong)"
          : "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          minWidth: "170px",
          flex: "1 1 200px",
        }}
      >
        <label
          htmlFor={`stat-${statKey}-input`}
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: "0.45rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          <span className="mono" style={{ color: "var(--neon-cyan)" }}>
            {statKey}
          </span>
          <span style={{ fontWeight: 500, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {def.name}
          </span>
        </label>
        <Tooltip label={`About ${def.name}`} text={tooltipText} />
        {isPriority && (
          <span
            data-testid={`stat-${statKey}-priority`}
            className="hud-badge hud-badge--pink"
          >
            Priority
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          type="button"
          className="hud-btn hud-btn--sm"
          data-testid={`stat-${statKey}-dec`}
          aria-label={`Decrease ${def.name}`}
          onClick={() => handleStep(-1)}
          disabled={Number.isFinite(value) && value <= min}
          style={{ minWidth: "2.1rem" }}
        >
          -
        </button>
        <input
          id={`stat-${statKey}-input`}
          className="hud-input"
          type="number"
          min={min}
          max={max}
          step={1}
          data-testid={`stat-${statKey}-input`}
          value={draftText}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => {
            if (draftText.trim() === "" && Number.isFinite(value)) {
              setDraftText(String(value));
            }
          }}
          style={{
            width: "4.5rem",
            minHeight: "34px",
            padding: "0.25rem 0.4rem",
            textAlign: "center",
            fontWeight: 700,
          }}
        />
        <button
          type="button"
          className="hud-btn hud-btn--sm"
          data-testid={`stat-${statKey}-inc`}
          aria-label={`Increase ${def.name}`}
          onClick={() => handleStep(1)}
          disabled={Number.isFinite(value) && value >= max}
          style={{ minWidth: "2.1rem" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function distributePool(
  pool: number,
  min: number,
  max: number,
  priorityStats: StatKey[],
): Record<StatKey, number> {
  const rng = createRng();
  const values = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) {
    values[key] = min;
  }

  let remaining = Math.max(
    0,
    Math.min(pool, STAT_KEYS.length * max) - STAT_KEYS.length * min,
  );
  const prioritySet = new Set(priorityStats);
  let guard = 0;

  while (remaining > 0 && guard < 1000) {
    guard += 1;
    const candidates = STAT_KEYS.filter((k) => values[k] < max);
    if (candidates.length === 0) break;
    const weighted: StatKey[] = [];
    for (const k of candidates) {
      const weight = prioritySet.has(k) ? 3 : 1;
      for (let i = 0; i < weight; i += 1) {
        weighted.push(k);
      }
    }
    const chosen = pickOne(weighted, rng);
    values[chosen] += 1;
    remaining -= 1;
  }

  return values;
}

export function StatsStep({ character, onChange }: StatsStepProps) {
  const { stats } = character;
  const { min, max } = statsData.range;

  const cinematicDef = statsData.pointMethods.find((m) => m.id === "cinematic");
  const presets = cinematicDef?.presets ?? [];
  const activePreset =
    presets.find((p) => p.id === stats.cinematicPresetId) ??
    presets.find((p) => p.points === stats.points) ??
    presets[0];

  const activeMethodDef = statsData.pointMethods.find((m) => m.id === stats.method);
  const role = rolesById[character.identity.roleId];
  const prioritySet = new Set<StatKey>(role?.priorityStats ?? []);

  const spent = sumStats(stats.values);
  const remaining = stats.points - spent;

  const safeStatsForDerived = STAT_KEYS.reduce(
    (acc, key) => {
      const val = stats.values[key];
      acc[key] = Number.isFinite(val) ? val : 0;
      return acc;
    },
    {} as Record<StatKey, number>,
  );
  const derived = deriveStats(safeStatsForDerived);

  const commitStats = (patch: Partial<Character["stats"]>) => {
    const next: Character = {
      ...character,
      stats: {
        ...character.stats,
        ...patch,
      },
    };
    onChange(reconcileCharacter(character, next));
  };

  const handleMethodSelect = (methodId: PointMethodId) => {
    if (methodId === "cinematic") {
      const fallbackPreset = activePreset ?? presets[0];
      commitStats({
        method: "cinematic",
        cinematicPresetId: fallbackPreset?.id,
        points: fallbackPreset?.points ?? stats.points,
      });
      return;
    }
    commitStats({ method: methodId });
  };

  const handlePresetChange = (presetId: string) => {
    const chosen = presets.find((p) => p.id === presetId);
    if (!chosen) return;
    commitStats({
      method: "cinematic",
      cinematicPresetId: chosen.id,
      points: chosen.points,
    });
  };

  const handleRollStats = () => {
    const rng = createRng();

    if (stats.method === "random") {
      const diceExpr = activeMethodDef?.dice ?? "9d10";
      const minPool = STAT_KEYS.length * min;
      const rolledPool = Math.max(minPool, rollDice(diceExpr, rng));
      commitStats({ points: rolledPool });
      return;
    }

    if (stats.method === "fast") {
      const rerollLimit = activeMethodDef?.rerollAtOrBelow ?? 2;
      const nextValues = {} as Record<StatKey, number>;
      for (const key of STAT_KEYS) {
        nextValues[key] = rollStatFast(rng, rerollLimit);
      }
      commitStats({
        values: nextValues,
        points: sumStats(nextValues),
      });
      return;
    }

    // cinematic: distribute selected preset pool across stats
    const targetPool = activePreset?.points ?? stats.points;
    const distributed = distributePool(targetPool, min, max, role?.priorityStats ?? []);
    commitStats({
      cinematicPresetId: activePreset?.id,
      points: targetPool,
      values: distributed,
    });
  };

  const handleStatValueChange = (key: StatKey, nextVal: number) => {
    commitStats({
      values: {
        ...stats.values,
        [key]: nextVal,
      },
    });
  };

  const rollButtonLabel =
    stats.method === "random"
      ? "Roll Pool (9d10)"
      : stats.method === "fast"
        ? "Roll All Stats (1d10)"
        : "Distribute Preset Pool";

  const remainingBadgeClass =
    remaining < 0
      ? "hud-badge hud-badge--red"
      : remaining > 0
        ? "hud-badge hud-badge--amber"
        : "hud-badge hud-badge--green";

  return (
    <section
      className="cp-step cp-step-stats"
      style={sectionStyle}
      aria-labelledby="step-stats-title"
    >
      <div className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header">
          <h2 id="step-stats-title" className="hud-panel__title">
            02 // Point Method & Pool
          </h2>
          <span className={remainingBadgeClass} data-testid="remaining-points">
            Remaining: {remaining}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Stat point generation method"
          style={{
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "wrap",
            marginBottom: "var(--space-3)",
          }}
        >
          {statsData.pointMethods.map((method) => {
            const isSelected = stats.method === method.id;
            return (
              <div
                key={method.id}
                style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`method-${method.id}`}
                  className={isSelected ? "hud-btn hud-btn--primary" : "hud-btn"}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <span>{method.name}</span>
                </button>
                {method.verify && <VerifyBadge />}
              </div>
            );
          })}
        </div>

        {activeMethodDef && (
          <p
            style={{
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
          >
            {activeMethodDef.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {stats.method === "cinematic" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <label htmlFor="cinematic-preset-select" style={labelStyle}>
                    Cinematic Preset
                  </label>
                  <VerifyBadge />
                </div>
                <select
                  id="cinematic-preset-select"
                  className="hud-select"
                  data-testid="cinematic-preset-select"
                  value={activePreset?.id ?? ""}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} ({preset.points} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DiceButton
              label={rollButtonLabel}
              onClick={handleRollStats}
              testId="btn-roll-stats"
            />
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div className="hud-stat-chip">
              <span className="hud-stat-chip__label">Total Pool</span>
              <strong className="hud-stat-chip__value" data-testid="stats-total-pool">
                {stats.points}
              </strong>
            </div>

            <div className="hud-stat-chip hud-stat-chip--accent">
              <span className="hud-stat-chip__label">Spent</span>
              <strong className="hud-stat-chip__value" data-testid="stats-spent">
                {spent}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "var(--space-4)",
          alignItems: "start",
        }}
      >
        <div className="hud-panel hud-panel--elevated">
          <div className="hud-panel__header">
            <h3 className="hud-panel__title">
              Primary Stats ({min}–{max})
            </h3>
            {role && (
              <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                {role.name}: {role.priorityStats.join(", ")}
              </span>
            )}
          </div>

          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {STAT_KEYS.map((key) => (
              <StatRow
                key={key}
                statKey={key}
                value={stats.values[key]}
                min={min}
                max={max}
                isPriority={prioritySet.has(key)}
                onValueChange={handleStatValueChange}
              />
            ))}
          </div>
        </div>

        <div className="hud-panel hud-panel--elevated">
          <div className="hud-panel__header">
            <h3 className="hud-panel__title">Derived Combat & Body HUD</h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
              gap: "var(--space-3)",
            }}
          >
            <div className="hud-stat-chip">
              <span className="hud-stat-chip__label">Run (MA × 3)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-run">
                {derived.run} m
              </strong>
            </div>

            <div className="hud-stat-chip">
              <span className="hud-stat-chip__label">Leap (Run / 4)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-leap">
                {derived.leap} m
              </strong>
            </div>

            <div className="hud-stat-chip">
              <span className="hud-stat-chip__label">Lift (BODY × 40)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-lift">
                {derived.lift} kg
              </strong>
            </div>

            <div className="hud-stat-chip hud-stat-chip--amber">
              <span className="hud-stat-chip__label">Humanity (EMP × 10)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-humanity">
                {derived.humanity}
              </strong>
            </div>

            <div className="hud-stat-chip">
              <span className="hud-stat-chip__label">Save (BODY)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-save">
                {derived.save}
              </strong>
            </div>

            <div className="hud-stat-chip hud-stat-chip--accent">
              <span className="hud-stat-chip__label">BTM</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                <strong className="hud-stat-chip__value" data-testid="derived-btm">
                  {derived.btm}
                </strong>
                {derived.btmLabel && (
                  <small style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    {derived.btmLabel}
                  </small>
                )}
              </div>
            </div>

            <div className="hud-stat-chip hud-stat-chip--accent">
              <span className="hud-stat-chip__label">BDM (Melee)</span>
              <strong className="hud-stat-chip__value" data-testid="derived-bdm">
                {derived.bdm > 0 ? `+${derived.bdm}` : String(derived.bdm)}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-3)",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-secondary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Check Difficulty Benchmarks (Stat + Skill + 1d10)
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {statsData.difficulty.map((diff) => (
                <span key={diff.name} className="hud-badge">
                  {diff.name}: {diff.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
