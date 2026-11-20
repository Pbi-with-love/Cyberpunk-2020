import { useState, type CSSProperties } from "react";
import { Tooltip } from "../components/Tooltip";
import { VerifyBadge } from "../components/VerifyBadge";
import { rolesById, skillsById, skillsData } from "../data";
import {
  baseSkillId,
  careerSlots,
  getActiveCareerSkillsForCharacter,
  getCareerPointLimit,
  getMaxSkillLevel,
  inferChosenCareerSkills,
  inferFreePickCareerSkills,
  isSkillAllowedForPickup,
  pickupPoints,
  reconcileCharacter,
  resolveCareerSkills,
  sumSkillPoints,
} from "../rules";
import type { Character, SkillDef, SkillStatGroup, StatKey } from "../types";

export interface SkillsStepProps {
  character: Character;
  onChange: (next: Character) => void;
}

type StatFilter = "All" | SkillStatGroup;

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-5)",
};

interface SkillNumberInputProps {
  id: string;
  label: string;
  testId: string;
  value: number;
  max: number;
  onValueChange: (nextVal: number) => void;
}

function SkillNumberInput({
  id,
  label,
  testId,
  value,
  max,
  onValueChange,
}: SkillNumberInputProps) {
  const [text, setText] = useState<string>(() =>
    Number.isFinite(value) ? String(value) : "0",
  );
  const [lastSynced, setLastSynced] = useState<number>(value);

  if (value !== lastSynced) {
    setLastSynced(value);
    setText(Number.isFinite(value) ? String(value) : "0");
  }

  const handleChange = (raw: string) => {
    setText(raw);
    const trimmed = raw.trim();
    const parsed = trimmed === "" ? 0 : Number(trimmed);
    const nextVal = Number.isFinite(parsed) ? parsed : 0;
    setLastSynced(nextVal);
    onValueChange(nextVal);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <label
        htmlFor={id}
        className="mono"
        style={{
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        className="hud-input"
        type="number"
        min={0}
        max={max}
        step={1}
        data-testid={testId}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {
          if (text.trim() === "") {
            setText(String(value));
          }
        }}
        style={{
          width: "4.25rem",
          minHeight: "34px",
          padding: "0.25rem 0.4rem",
          textAlign: "center",
          fontWeight: 700,
        }}
      />
    </div>
  );
}

function poolChipModifier(remaining: number): string {
  if (remaining < 0) return "hud-stat-chip hud-stat-chip--danger";
  if (remaining > 0) return "hud-stat-chip hud-stat-chip--amber";
  return "hud-stat-chip";
}

function poolValueColor(remaining: number): string {
  if (remaining < 0) return "var(--neon-red)";
  if (remaining > 0) return "var(--neon-amber)";
  return "var(--neon-green)";
}

export function SkillsStep({ character, onChange }: SkillsStepProps) {
  const [search, setSearch] = useState<string>("");
  const [activeGroup, setActiveGroup] = useState<StatFilter>("All");

  const roleId = character.identity.roleId;
  const role = rolesById[roleId];
  const slots = careerSlots(roleId);

  const chosenChoices = inferChosenCareerSkills(
    roleId,
    character.skills.career,
    character.skills.careerChoices,
  );
  const chosenFreePicks = inferFreePickCareerSkills(
    roleId,
    character.skills.career,
    character.skills.careerFreePicks,
  );
  const activeCareerSkills = getActiveCareerSkillsForCharacter(character);
  const activeCareerSet = new Set(activeCareerSkills);
  const fixedCareerSet = new Set(slots.fixedSkills);

  const careerLimit = getCareerPointLimit();
  const careerSpent = sumSkillPoints(character.skills.career);
  const careerRemaining = careerLimit - careerSpent;

  const pickupLimit = pickupPoints(character.stats.values);
  const pickupSpent = sumSkillPoints(character.skills.pickup);
  const pickupRemaining = pickupLimit - pickupSpent;
  const maxSkillLevel = getMaxSkillLevel();

  const commitSkills = (patch: Partial<Character["skills"]>) => {
    const next: Character = {
      ...character,
      skills: {
        ...character.skills,
        ...patch,
      },
    };
    onChange(reconcileCharacter(character, next));
  };

  const handleToggleChoice = (fromGroup: string[], pickLimit: number, skillId: string) => {
    const groupSet = new Set(fromGroup);
    const otherChoices = chosenChoices.filter((id) => !groupSet.has(id));
    const currentGroupChoices = chosenChoices.filter((id) => groupSet.has(id));

    let nextGroupChoices: string[];
    if (pickLimit === 1) {
      nextGroupChoices = [skillId];
    } else if (currentGroupChoices.includes(skillId)) {
      nextGroupChoices = currentGroupChoices.filter((id) => id !== skillId);
    } else if (currentGroupChoices.length < pickLimit) {
      nextGroupChoices = [...currentGroupChoices, skillId];
    } else {
      return;
    }

    const nextChoices = [...otherChoices, ...nextGroupChoices];
    const nextActiveSet = new Set(
      resolveCareerSkills(roleId, nextChoices, chosenFreePicks),
    );
    const nextCareer: Record<string, number> = {};
    for (const [key, val] of Object.entries(character.skills.career)) {
      if (nextActiveSet.has(key) || nextActiveSet.has(baseSkillId(key))) {
        nextCareer[key] = val;
      }
    }

    commitSkills({
      careerChoices: nextChoices,
      career: nextCareer,
    });
  };

  const handleToggleFreePick = (stat: StatKey, limit: number, skillId: string) => {
    const currentForStat = chosenFreePicks.filter(
      (id) => skillsById[id]?.stat === stat,
    );
    const otherPicks = chosenFreePicks.filter(
      (id) => skillsById[id]?.stat !== stat,
    );

    let nextForStat: string[];
    if (currentForStat.includes(skillId)) {
      nextForStat = currentForStat.filter((id) => id !== skillId);
    } else if (currentForStat.length < limit) {
      nextForStat = [...currentForStat, skillId];
    } else {
      return;
    }

    const nextFreePicks = [...otherPicks, ...nextForStat];
    const nextActiveSet = new Set(
      resolveCareerSkills(roleId, chosenChoices, nextFreePicks),
    );
    const nextCareer: Record<string, number> = {};
    for (const [key, val] of Object.entries(character.skills.career)) {
      if (nextActiveSet.has(key) || nextActiveSet.has(baseSkillId(key))) {
        nextCareer[key] = val;
      }
    }

    commitSkills({
      careerFreePicks: nextFreePicks,
      career: nextCareer,
    });
  };

  const handleSkillAllocation = (
    pool: "career" | "pickup",
    skillId: string,
    val: number,
  ) => {
    const nextRecord = { ...character.skills[pool] };
    if (val === 0) {
      delete nextRecord[skillId];
    } else {
      nextRecord[skillId] = val;
    }
    commitSkills({ [pool]: nextRecord });
  };

  const handleDetailChange = (skillId: string, detailText: string) => {
    const nextDetails = { ...character.skills.details };
    if (detailText.length === 0) {
      delete nextDetails[skillId];
    } else {
      nextDetails[skillId] = detailText;
    }
    commitSkills({ details: nextDetails });
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredSkills = skillsData.skills.filter((skill) => {
    if (activeGroup !== "All" && skill.stat !== activeGroup) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return (
      skill.name.toLowerCase().includes(normalizedSearch) ||
      skill.description.toLowerCase().includes(normalizedSearch) ||
      skill.stat.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedSkills: SkillDef[] = [...filteredSkills].sort((a, b) => {
    const aCareer = activeCareerSet.has(a.id) ? 0 : 1;
    const bCareer = activeCareerSet.has(b.id) ? 0 : 1;
    if (aCareer !== bCareer) return aCareer - bCareer;
    if (aCareer === 0 && bCareer === 0) {
      return activeCareerSkills.indexOf(a.id) - activeCareerSkills.indexOf(b.id);
    }
    const aPickup = isSkillAllowedForPickup(roleId, a.id) ? 0 : 1;
    const bPickup = isSkillAllowedForPickup(roleId, b.id) ? 0 : 1;
    return aPickup - bPickup;
  });

  const filterTabs: StatFilter[] = ["All", ...skillsData.statGroups];

  return (
    <section
      className="cp-step cp-step-skills"
      style={sectionStyle}
      aria-labelledby="step-skills-title"
    >
      <div className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h2 id="step-skills-title" className="hud-panel__title">
              03 // Skill Pools ({role?.name ?? roleId})
            </h2>
            {role?.verify && <VerifyBadge />}
          </div>

          <span className="hud-badge hud-badge--cyan">
            Career Slots: {activeCareerSkills.length} / {slots.totalSlots}
          </span>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <div className={poolChipModifier(careerRemaining)} style={{ flex: "1 1 220px" }}>
            <span className="hud-stat-chip__label">
              Career Pool ({careerSpent} / {careerLimit} spent)
            </span>
            <strong
              className="hud-stat-chip__value"
              data-testid="career-remaining"
              style={{ color: poolValueColor(careerRemaining) }}
            >
              Remaining: {careerRemaining}
            </strong>
          </div>

          <div className={poolChipModifier(pickupRemaining)} style={{ flex: "1 1 220px" }}>
            <span className="hud-stat-chip__label">
              Pickup Pool — INT + REF ({pickupSpent} / {pickupLimit} spent)
            </span>
            <strong
              className="hud-stat-chip__value"
              data-testid="pickup-remaining"
              style={{ color: poolValueColor(pickupRemaining) }}
            >
              Remaining: {pickupRemaining}
            </strong>
          </div>
        </div>
      </div>

      {(slots.choices.length > 0 || slots.freePicks.length > 0) && (
        <div className="hud-panel hud-panel--elevated">
          <div className="hud-panel__header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <h3 className="hud-panel__title">Role Career Skill Selections</h3>
              {role?.verify && <VerifyBadge />}
            </div>
          </div>

          {slots.choices.map((choice, idx) => (
            <div
              key={`choice-${idx}`}
              style={{ marginBottom: slots.freePicks.length > 0 ? "var(--space-4)" : 0 }}
            >
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Choose {choice.pick} career skill{choice.pick > 1 ? "s" : ""}:
              </div>
              <div
                role="radiogroup"
                aria-label="Role career skill choice"
                style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
              >
                {choice.from.map((skillId) => {
                  const def = skillsById[skillId];
                  const isPicked = chosenChoices.includes(skillId);
                  return (
                    <button
                      key={skillId}
                      type="button"
                      role={choice.pick === 1 ? "radio" : "button"}
                      aria-checked={choice.pick === 1 ? isPicked : undefined}
                      aria-pressed={choice.pick !== 1 ? isPicked : undefined}
                      data-testid={`career-choice-${skillId}`}
                      className={isPicked ? "hud-btn hud-btn--primary" : "hud-btn"}
                      onClick={() => handleToggleChoice(choice.from, choice.pick, skillId)}
                    >
                      {def?.name ?? skillId}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {slots.freePicks.map((fp, idx) => {
            const eligible = skillsData.skills.filter(
              (s) => s.stat === fp.stat && !fixedCareerSet.has(s.id),
            );
            const selectedForStat = chosenFreePicks.filter(
              (id) => skillsById[id]?.stat === fp.stat,
            );

            return (
              <div key={`freepick-${fp.stat}-${idx}`}>
                <div
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Choose up to {fp.count} extra <strong>{fp.stat}</strong> career skills (
                  {selectedForStat.length} / {fp.count} selected):
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 195px), 1fr))",
                    gap: "var(--space-2)",
                  }}
                >
                  {eligible.map((skill) => {
                    const isChecked = selectedForStat.includes(skill.id);
                    const disabled = !isChecked && selectedForStat.length >= fp.count;
                    return (
                      <label
                        key={skill.id}
                        htmlFor={`career-freepick-${skill.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          padding: "var(--space-2) var(--space-3)",
                          borderRadius: "var(--radius-xs)",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.5 : 1,
                          background: isChecked ? "var(--surface-cyan)" : "var(--bg-input)",
                          border: isChecked
                            ? "1px solid var(--border-strong)"
                            : "1px solid var(--border-subtle)",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        <input
                          id={`career-freepick-${skill.id}`}
                          type="checkbox"
                          data-testid={`career-freepick-${skill.id}`}
                          checked={isChecked}
                          disabled={disabled}
                          onChange={() => handleToggleFreePick(fp.stat, fp.count, skill.id)}
                        />
                        <span>{skill.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="hud-panel hud-panel--elevated">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "var(--space-3)",
            flexWrap: "wrap",
            marginBottom: "var(--space-4)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 240px" }}>
            <label
              htmlFor="skills-search"
              className="mono"
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-secondary)",
              }}
            >
              Filter Skills
            </label>
            <input
              id="skills-search"
              className="hud-input"
              type="search"
              data-testid="skills-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill name or description..."
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter skills by stat group"
            style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}
          >
            {filterTabs.map((group) => {
              const isSelected = activeGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-testid={`skills-tab-${group}`}
                  className={
                    isSelected
                      ? "hud-btn hud-btn--sm hud-btn--primary"
                      : "hud-btn hud-btn--sm hud-btn--ghost"
                  }
                  onClick={() => setActiveGroup(group)}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {sortedSkills.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No skills match your search filter.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            {sortedSkills.map((skill) => {
              const isCareer = activeCareerSet.has(skill.id);
              const allowPickup = isSkillAllowedForPickup(roleId, skill.id);
              const careerVal = character.skills.career[skill.id] ?? 0;
              const pickupVal = character.skills.pickup[skill.id] ?? 0;
              const totalLevel = careerVal + pickupVal;
              const detailText = character.skills.details[skill.id] ?? "";
              const needsDetailWarning = Boolean(
                skill.needsDetail && totalLevel > 0 && detailText.trim().length === 0,
              );

              const statVal =
                skill.stat === "SPECIAL"
                  ? 0
                  : Number.isFinite(character.stats.values[skill.stat as StatKey])
                    ? character.stats.values[skill.stat as StatKey]
                    : 0;
              const totalReadout =
                skill.stat === "SPECIAL"
                  ? `${totalLevel} (Special)`
                  : `${statVal + totalLevel} (${skill.stat} ${statVal} + ${totalLevel})`;

              const lockedOwner = skill.role ? rolesById[skill.role]?.name ?? skill.role : undefined;

              return (
                <div
                  key={skill.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-3)",
                    flexWrap: "wrap",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-xs)",
                    background: isCareer ? "var(--surface-cyan)" : "var(--bg-input)",
                    border: needsDetailWarning
                      ? "1px solid var(--neon-amber)"
                      : isCareer
                        ? "1px solid var(--border-panel)"
                        : "1px solid var(--border-subtle)",
                    opacity: !isCareer && !allowPickup ? 0.65 : 1,
                  }}
                >
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "var(--text-base)" }}>{skill.name}</strong>
                      <span className="hud-badge">{skill.stat}</span>
                      {isCareer && <span className="hud-badge hud-badge--cyan">Career</span>}
                      {!allowPickup && lockedOwner && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                          ({lockedOwner} only)
                        </span>
                      )}
                      <Tooltip label={`About ${skill.name}`} text={skill.description} />
                    </div>

                    {skill.needsDetail && (
                      <div
                        style={{
                          marginTop: "var(--space-2)",
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          flexWrap: "wrap",
                        }}
                      >
                        <label
                          htmlFor={`skill-${skill.id}-detail`}
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: 600,
                            color: needsDetailWarning ? "var(--neon-amber)" : "var(--text-secondary)",
                          }}
                        >
                          {skill.detailLabel ?? "Specialization"}
                          {totalLevel > 0 ? " *" : ""}:
                        </label>
                        <input
                          id={`skill-${skill.id}-detail`}
                          className="hud-input"
                          type="text"
                          data-testid={`skill-${skill.id}-detail`}
                          value={detailText}
                          onChange={(e) => handleDetailChange(skill.id, e.target.value)}
                          placeholder={`Specify ${skill.detailLabel ?? "detail"}...`}
                          aria-invalid={needsDetailWarning ? true : undefined}
                          style={{
                            width: "auto",
                            minWidth: "160px",
                            minHeight: "32px",
                            padding: "0.25rem 0.5rem",
                            fontSize: "var(--text-xs)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-3)", flexWrap: "wrap" }}>
                    {isCareer && (
                      <SkillNumberInput
                        id={`skill-${skill.id}-career`}
                        label="Career"
                        testId={`skill-${skill.id}-career`}
                        value={careerVal}
                        max={maxSkillLevel}
                        onValueChange={(nextVal) =>
                          handleSkillAllocation("career", skill.id, nextVal)
                        }
                      />
                    )}

                    {allowPickup && (
                      <SkillNumberInput
                        id={`skill-${skill.id}-pickup`}
                        label="Pickup"
                        testId={`skill-${skill.id}-pickup`}
                        value={pickupVal}
                        max={maxSkillLevel}
                        onValueChange={(nextVal) =>
                          handleSkillAllocation("pickup", skill.id, nextVal)
                        }
                      />
                    )}

                    <div className="hud-stat-chip" style={{ minWidth: "136px" }}>
                      <span className="hud-stat-chip__label">Check Base</span>
                      <strong
                        className="mono"
                        data-testid={`skill-${skill.id}-total`}
                        style={{ fontSize: "var(--text-sm)", color: "var(--neon-cyan)" }}
                      >
                        {totalReadout}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
