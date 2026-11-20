import { useState, type CSSProperties } from "react";
import { DiceButton } from "../components/DiceButton";
import { RolePixelIcon } from "../components/PixelAvatar/RolePixelIcon";
import { VerifyBadge } from "../components/VerifyBadge";
import { rolesById, rolesData, skillsById } from "../data";
import { createRng, rollDice } from "../dice";
import { expectedLifeEventCount, reconcileCharacter } from "../rules";
import type { Character } from "../types";

export interface IdentityStepProps {
  character: Character;
  onChange: (next: Character) => void;
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: "var(--space-4)",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-2)",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const roleGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 215px), 1fr))",
  gap: "var(--space-3)",
};

export function IdentityStep({ character, onChange }: IdentityStepProps) {
  const { identity } = character;

  const [ageText, setAgeText] = useState<string>(() =>
    Number.isFinite(identity.age) ? String(identity.age) : "",
  );
  const [lastSyncedAge, setLastSyncedAge] = useState<number>(identity.age);

  const [repText, setRepText] = useState<string>(() =>
    Number.isFinite(identity.reputation) ? String(identity.reputation) : "",
  );
  const [lastSyncedRep, setLastSyncedRep] = useState<number>(identity.reputation);

  if (identity.age !== lastSyncedAge) {
    setLastSyncedAge(identity.age);
    setAgeText(Number.isFinite(identity.age) ? String(identity.age) : "");
  }

  if (identity.reputation !== lastSyncedRep) {
    setLastSyncedRep(identity.reputation);
    setRepText(Number.isFinite(identity.reputation) ? String(identity.reputation) : "");
  }

  const updateIdentity = (
    patch: Partial<Character["identity"]>,
    shouldReconcile = false,
  ) => {
    const next: Character = {
      ...character,
      identity: {
        ...character.identity,
        ...patch,
      },
    };
    onChange(shouldReconcile ? reconcileCharacter(character, next) : next);
  };

  const handleAgeChange = (raw: string) => {
    setAgeText(raw);
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? 0 : Number(trimmed);
    const nextAge = Number.isFinite(parsed) ? parsed : 0;
    setLastSyncedAge(nextAge);
    const validForReconcile = Number.isInteger(nextAge) && nextAge >= 16 && nextAge <= 120;
    updateIdentity({ age: nextAge }, validForReconcile);
  };

  const handleRollAge = () => {
    const rng = createRng();
    const rolledAge = 16 + rollDice("2d6", rng);
    setLastSyncedAge(rolledAge);
    setAgeText(String(rolledAge));
    updateIdentity({ age: rolledAge }, true);
  };

  const handleReputationChange = (raw: string) => {
    setRepText(raw);
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? -1 : Number(trimmed);
    const nextRep = Number.isFinite(parsed) ? parsed : -1;
    setLastSyncedRep(nextRep);
    updateIdentity({ reputation: nextRep }, false);
  };

  const handleRoleChange = (roleId: string) => {
    if (roleId === identity.roleId) return;
    updateIdentity({ roleId }, true);
  };

  const selectedRole = rolesById[identity.roleId];
  const specialSkill = selectedRole ? skillsById[selectedRole.specialAbility] : undefined;
  const lifeEventsCount =
    Number.isInteger(identity.age) && identity.age >= 16
      ? expectedLifeEventCount(identity.age)
      : 0;

  return (
    <section
      className="cp-step cp-step-identity"
      style={sectionStyle}
      aria-labelledby="step-identity-title"
    >
      <div className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header">
          <h2 id="step-identity-title" className="hud-panel__title">
            01 // Street Identity
          </h2>
          <span className="hud-badge hud-badge--cyan">Edgerunner Dossier</span>
        </div>

        <div style={formGridStyle}>
          <div style={fieldStyle}>
            <label htmlFor="identity-handle" style={labelStyle}>
              Handle <span style={{ color: "var(--neon-pink)" }}>*</span>
            </label>
            <input
              id="identity-handle"
              className="hud-input"
              type="text"
              data-testid="input-handle"
              value={identity.handle}
              onChange={(e) => updateIdentity({ handle: e.target.value })}
              placeholder="e.g. Razor, Ghost_0x"
              required
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="identity-real-name" style={labelStyle}>
              Real Name
            </label>
            <input
              id="identity-real-name"
              className="hud-input"
              type="text"
              data-testid="input-real-name"
              value={identity.realName ?? ""}
              onChange={(e) => updateIdentity({ realName: e.target.value })}
              placeholder="Optional legal name"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="identity-gender" style={labelStyle}>
              Gender
            </label>
            <input
              id="identity-gender"
              className="hud-input"
              type="text"
              list="identity-gender-options"
              data-testid="input-gender"
              value={identity.gender ?? ""}
              onChange={(e) => updateIdentity({ gender: e.target.value })}
              placeholder="Optional"
            />
            <datalist id="identity-gender-options">
              <option value="Female" />
              <option value="Male" />
              <option value="Non-binary" />
              <option value="Unspecified" />
            </datalist>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="identity-age" style={labelStyle}>
              Age (16–120)
            </label>
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
              <input
                id="identity-age"
                className="hud-input"
                type="number"
                min={16}
                max={120}
                step={1}
                data-testid="input-age"
                value={ageText}
                onChange={(e) => handleAgeChange(e.target.value)}
                onBlur={() => {
                  if (ageText.trim() === "" && Number.isFinite(identity.age)) {
                    setAgeText(String(identity.age));
                  }
                }}
                style={{ width: "5.5rem", flex: "0 0 auto", textAlign: "center" }}
              />
              <DiceButton
                label="Roll 16 + 2d6"
                onClick={handleRollAge}
                testId="btn-roll-age"
              />
            </div>
            <small className="mono" style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
              Generates {lifeEventsCount} life {lifeEventsCount === 1 ? "event" : "events"} in Step 4
            </small>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="identity-reputation" style={labelStyle}>
              Reputation (0–10)
            </label>
            <input
              id="identity-reputation"
              className="hud-input"
              type="number"
              min={0}
              max={10}
              step={1}
              data-testid="input-reputation"
              value={repText}
              onChange={(e) => handleReputationChange(e.target.value)}
              onBlur={() => {
                if (repText.trim() === "" && identity.reputation >= 0) {
                  setRepText(String(identity.reputation));
                }
              }}
              style={{ width: "6.5rem", textAlign: "center" }}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="identity-role-select" style={labelStyle}>
              Role <span style={{ color: "var(--neon-pink)" }}>*</span>
            </label>
            <select
              id="identity-role-select"
              className="hud-select"
              data-testid="select-role"
              value={identity.roleId}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {rolesData.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} — {role.tagline}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header">
          <h3 className="hud-panel__title">Select Role Archetype</h3>
          <span className="hud-badge">{rolesData.roles.length} Roles</span>
        </div>

        <div
          role="radiogroup"
          aria-label="Character roles"
          style={roleGridStyle}
        >
          {rolesData.roles.map((role) => {
            const isSelected = role.id === identity.roleId;
            return (
              <button
                key={role.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`role-card-${role.id}`}
                onClick={() => handleRoleChange(role.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  textAlign: "left",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-xs)",
                  cursor: "pointer",
                  background: isSelected ? "var(--surface-cyan)" : "var(--bg-input)",
                  border: isSelected
                    ? "2px solid var(--neon-cyan)"
                    : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  boxShadow: isSelected
                    ? "var(--glow-cyan), var(--shadow-pixel-sm)"
                    : "var(--shadow-bevel-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    width: "100%",
                  }}
                >
                  <RolePixelIcon roleId={role.id} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-base)" }}>
                        {role.name}
                      </strong>
                      {role.verify && <VerifyBadge />}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      {role.tagline}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {role.priorityStats.map((statKey) => (
                    <span
                      key={statKey}
                      className={isSelected ? "hud-badge hud-badge--cyan" : "hud-badge"}
                    >
                      {statKey}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedRole && (
        <div
          className="hud-panel hud-panel--accent"
          data-testid="role-details"
        >
          <div className="hud-panel__header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <RolePixelIcon roleId={selectedRole.id} size={44} />
              <div>
                <h3 className="hud-panel__title">
                  {selectedRole.name}{" "}
                  <span style={{ color: "var(--neon-pink)" }}>
                    // {selectedRole.tagline}
                  </span>
                </h3>
              </div>
              {selectedRole.verify && <VerifyBadge />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                Priority Stats:
              </span>
              {selectedRole.priorityStats.map((statKey) => (
                <span key={statKey} className="hud-badge hud-badge--cyan">
                  {statKey}
                </span>
              ))}
            </div>
          </div>

          <p style={{ marginBottom: "var(--space-4)", color: "var(--text-primary)" }}>
            {selectedRole.description}
          </p>

          <div
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-panel)",
              borderLeft: "3px solid var(--neon-amber)",
              borderRadius: "var(--radius-xs)",
              padding: "var(--space-3)",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--neon-amber)",
                marginBottom: "0.25rem",
              }}
            >
              Special Ability
            </div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "0.25rem" }}>
              {specialSkill?.name ?? selectedRole.specialAbility}
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              {specialSkill?.description ?? ""}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
