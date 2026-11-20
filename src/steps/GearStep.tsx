import { useMemo, useState, type KeyboardEvent } from "react";
import { DiceButton } from "../components/DiceButton";
import { Tooltip } from "../components/Tooltip";
import { VerifyBadge } from "../components/VerifyBadge";
import {
  armorById,
  catalogById,
  cyberwareById,
  gearData,
  rolesById,
  skillsById,
  weaponsById,
} from "../data";
import {
  applyCyberware,
  calculateGearCost,
  calculateRemainingMoney,
  getMissingRequirements,
  getMonthlySalary,
  getSpecialAbilityLevel,
  rollCyberwareHumanityCost,
  rollStartingMoney,
} from "../rules";
import type { Character } from "../types";

export interface GearStepProps {
  character: Character;
  onChange: (next: Character) => void;
}

type CatalogTab = "all" | "weapons" | "armor" | "cyberware";

const CATALOG_TABS: { id: CatalogTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "weapons", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "cyberware", label: "Cyberware" },
];

export function GearStep({ character, onChange }: GearStepProps) {
  const [activeTab, setActiveTab] = useState<CatalogTab>("all");

  const specialLevel = Math.max(1, getSpecialAbilityLevel(character));
  const monthlySalary = getMonthlySalary(character.identity.roleId, specialLevel);
  const roleName = rolesById[character.identity.roleId]?.name ?? character.identity.roleId;

  const totalSpent = calculateGearCost(character.gear.items);
  const remainingMoney = calculateRemainingMoney(
    character.gear.startingMoney,
    character.gear.items,
  );
  const cyberStatus = applyCyberware(
    character.stats.values.EMP,
    character.gear.items,
  );

  const humanityPct = useMemo(() => {
    if (cyberStatus.baseHumanity <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, (cyberStatus.humanity / cyberStatus.baseHumanity) * 100),
    );
  }, [cyberStatus.baseHumanity, cyberStatus.humanity]);

  const handleRollStartingMoney = () => {
    const rolled = rollStartingMoney(character.identity.roleId, specialLevel);
    onChange({
      ...character,
      gear: {
        ...character.gear,
        startingMoney: rolled,
      },
    });
  };

  const handleStartingMoneyInput = (raw: string) => {
    const parsed = raw.trim() === "" ? 0 : Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    onChange({
      ...character,
      gear: {
        ...character.gear,
        startingMoney: Math.max(0, parsed),
      },
    });
  };

  const handleAddWeaponOrArmor = (itemId: string) => {
    onChange({
      ...character,
      gear: {
        ...character.gear,
        items: [...character.gear.items, { itemId }],
      },
    });
  };

  const handleAddCyberware = (itemId: string) => {
    const missing = getMissingRequirements(itemId, character.gear.items);
    if (missing.length > 0) return;
    const humanityCostRolled = rollCyberwareHumanityCost(itemId);
    onChange({
      ...character,
      gear: {
        ...character.gear,
        items: [...character.gear.items, { itemId, humanityCostRolled }],
      },
    });
  };

  const handleRemoveGear = (index: number) => {
    onChange({
      ...character,
      gear: {
        ...character.gear,
        items: character.gear.items.filter((_, idx) => idx !== index),
      },
    });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextTab = CATALOG_TABS[(idx + 1) % CATALOG_TABS.length];
      if (nextTab) setActiveTab(nextTab.id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevTab =
        CATALOG_TABS[(idx - 1 + CATALOG_TABS.length) % CATALOG_TABS.length];
      if (prevTab) setActiveTab(prevTab.id);
    }
  };

  const itemCardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "var(--space-2)",
    padding: "var(--space-3)",
    background: "var(--bg-input)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-xs)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header & Money Panel */}
      <section className="hud-panel hud-panel--elevated">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <h2 className="hud-panel__title">Step 5 // Gear & Cyberware</h2>
            {gearData.verify ? <VerifyBadge /> : null}
            {gearData.note ? (
              <Tooltip text={gearData.note} label="Gear catalog note" />
            ) : null}
          </div>
          <DiceButton
            label="Roll Starting Eb (1d6)"
            testId="btn-roll-money"
            onClick={handleRollStartingMoney}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: "var(--space-3)",
            alignItems: "stretch",
          }}
        >
          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Starting Money</span>
            <span className="hud-stat-chip__value" data-testid="starting-money">
              {character.gear.startingMoney} {gearData.currency}
            </span>
          </div>

          <div
            className={`hud-stat-chip ${
              remainingMoney < 0 ? "hud-stat-chip--danger" : "hud-stat-chip--amber"
            }`}
          >
            <span className="hud-stat-chip__label">Remaining Money</span>
            <span className="hud-stat-chip__value" data-testid="remaining-money">
              {remainingMoney} {gearData.currency}
            </span>
          </div>

          <div className="hud-stat-chip">
            <span className="hud-stat-chip__label">Total Spent</span>
            <span className="hud-stat-chip__value">
              {totalSpent} {gearData.currency}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-1)",
              justifyContent: "center",
            }}
          >
            <label
              htmlFor="gear-starting-money-input"
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-secondary)",
              }}
            >
              Override Starting {gearData.currency}
            </label>
            <input
              id="gear-starting-money-input"
              type="number"
              min={0}
              step={50}
              className="hud-input"
              data-testid="input-starting-money"
              value={character.gear.startingMoney}
              onChange={(e) => handleStartingMoneyInput(e.target.value)}
            />
          </div>
        </div>

        <p
          style={{
            marginTop: "var(--space-3)",
            fontSize: "var(--text-xs)",
            color: "var(--text-secondary)",
          }}
        >
          {roleName} Rank {specialLevel} base salary: {monthlySalary} {gearData.currency}/mo.{" "}
          {gearData.startingMoney.multiplierNote}
        </p>
      </section>

      {/* Humanity & EMP Gauge */}
      <section className="hud-panel hud-panel--accent" aria-labelledby="humanity-gauge-heading">
        <div className="hud-panel__header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <h3 id="humanity-gauge-heading" className="hud-panel__title">
              Humanity & Empathy Gauge
            </h3>
            <Tooltip
              text="Each piece of cyberware subtracts rolled Humanity Cost (HC) from Base Humanity (EMP × 10). Current EMP = floor(Current Humanity / 10)."
              label="Humanity and EMP rules"
            />
          </div>
          <span className="hud-badge hud-badge--pink">
            Base Humanity: {cyberStatus.baseHumanity} (−{cyberStatus.humanityLoss} HC)
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
          }}
        >
          <div
            className={`hud-stat-chip ${
              cyberStatus.cyberpsychosis ? "hud-stat-chip--danger" : "hud-stat-chip--accent"
            }`}
          >
            <span className="hud-stat-chip__label">Current Humanity</span>
            <span className="hud-stat-chip__value" data-testid="current-humanity">
              {cyberStatus.humanity}
            </span>
          </div>

          <div
            className={`hud-stat-chip ${
              cyberStatus.cyberpsychosis ? "hud-stat-chip--danger" : ""
            }`}
          >
            <span className="hud-stat-chip__label">
              Current EMP (Base {character.stats.values.EMP})
            </span>
            <span className="hud-stat-chip__value" data-testid="current-emp">
              {cyberStatus.emp}
            </span>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label="Current Humanity"
          aria-valuemin={0}
          aria-valuemax={cyberStatus.baseHumanity}
          aria-valuenow={Math.max(0, cyberStatus.humanity)}
          style={{
            height: "10px",
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xs)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${humanityPct}%`,
              background: cyberStatus.cyberpsychosis
                ? "var(--neon-red)"
                : humanityPct < 35
                  ? "var(--neon-amber)"
                  : "var(--neon-cyan)",
            }}
          />
        </div>

        {cyberStatus.cyberpsychosis ? (
          <div
            role="alert"
            data-testid="cyberpsychosis-warning"
            className="cp-step-errors"
            style={{ marginTop: "var(--space-3)" }}
          >
            <div className="cp-step-errors__header" style={{ marginBottom: "var(--space-1)" }}>
              <span className="cp-step-errors__icon">!</span>
              <strong className="cp-step-errors__title">
                Cyberpsychosis Alert — Humanity Depleted ({cyberStatus.humanity})
              </strong>
            </div>
            <p className="cp-step-errors__item" style={{ fontSize: "var(--text-sm)" }}>
              Current Humanity is at or below 0. Remove cyberware or raise EMP to avoid losing the character to cyberpsychosis.
            </p>
          </div>
        ) : null}
      </section>

      {/* Catalog Panel */}
      <section className="hud-panel" aria-label="Gear catalog">
        <div className="hud-panel__header">
          <h3 className="hud-panel__title">Equipment Catalog</h3>
          <div
            role="tablist"
            aria-label="Gear categories"
            style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}
          >
            {CATALOG_TABS.map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              const count =
                tab.id === "all"
                  ? gearData.weapons.length + gearData.armor.length + gearData.cyberware.length
                  : tab.id === "weapons"
                    ? gearData.weapons.length
                    : tab.id === "armor"
                      ? gearData.armor.length
                      : gearData.cyberware.length;
              return (
                <button
                  key={tab.id}
                  id={`gear-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`gear-tabpanel-${activeTab}`}
                  tabIndex={isSelected ? 0 : -1}
                  data-testid={`gear-tab-${tab.id}`}
                  className={`hud-btn hud-btn--sm ${isSelected ? "hud-btn--primary" : "hud-btn--ghost"}`}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`gear-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`gear-tab-${activeTab}`}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
        >
          {activeTab === "all" || activeTab === "weapons" ? (
            <div>
              {activeTab === "all" ? (
                <h4
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--neon-cyan)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Weapons ({gearData.weapons.length})
                </h4>
              ) : null}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "var(--space-3)",
                }}
              >
                {gearData.weapons.map((w) => {
                  const overBudget = w.cost > remainingMoney;
                  const skillName = skillsById[w.skill]?.name ?? w.skill;
                  return (
                    <article key={w.id} style={itemCardStyle}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "var(--space-2)",
                          }}
                        >
                          <strong style={{ fontFamily: "var(--font-display)" }}>{w.name}</strong>
                          <span className="hud-badge hud-badge--cyan">{w.type}</span>
                        </div>
                        <p
                          className="mono"
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-secondary)",
                            marginTop: "var(--space-1)",
                          }}
                        >
                          DMG {w.damage} · WA {w.wa >= 0 ? `+${w.wa}` : w.wa}
                          {w.shots !== undefined ? ` · Shots ${w.shots}` : ""}
                          {w.rof !== undefined ? ` · ROF ${w.rof}` : ""}
                        </p>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                          Skill: {skillName}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-2)",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span className="mono" style={{ fontWeight: 700, color: "var(--neon-amber)" }}>
                            {w.cost} {gearData.currency}
                          </span>
                          {overBudget ? (
                            <span className="hud-badge hud-badge--amber">Over budget</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="hud-btn hud-btn--primary hud-btn--sm"
                          data-testid={`buy-${w.id}`}
                          onClick={() => handleAddWeaponOrArmor(w.id)}
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "all" || activeTab === "armor" ? (
            <div>
              {activeTab === "all" ? (
                <h4
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--neon-green)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Armor ({gearData.armor.length})
                </h4>
              ) : null}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "var(--space-3)",
                }}
              >
                {gearData.armor.map((a) => {
                  const overBudget = a.cost > remainingMoney;
                  return (
                    <article key={a.id} style={itemCardStyle}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "var(--space-2)",
                          }}
                        >
                          <strong style={{ fontFamily: "var(--font-display)" }}>{a.name}</strong>
                          <span className="hud-badge hud-badge--green">SP {a.sp}</span>
                        </div>
                        <p
                          className="mono"
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-secondary)",
                            marginTop: "var(--space-1)",
                          }}
                        >
                          Covers: {a.covers.join(", ")} · EV {a.ev}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-2)",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span className="mono" style={{ fontWeight: 700, color: "var(--neon-amber)" }}>
                            {a.cost} {gearData.currency}
                          </span>
                          {overBudget ? (
                            <span className="hud-badge hud-badge--amber">Over budget</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="hud-btn hud-btn--primary hud-btn--sm"
                          data-testid={`buy-${a.id}`}
                          onClick={() => handleAddWeaponOrArmor(a.id)}
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "all" || activeTab === "cyberware" ? (
            <div>
              {activeTab === "all" ? (
                <h4
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--neon-pink)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Cyberware ({gearData.cyberware.length})
                </h4>
              ) : null}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "var(--space-3)",
                }}
              >
                {gearData.cyberware.map((c) => {
                  const missingReqs = getMissingRequirements(c.id, character.gear.items);
                  const reqNames = (c.requires ?? []).map(
                    (reqId) => cyberwareById[reqId]?.name ?? reqId,
                  );
                  const missingNames = missingReqs.map(
                    (reqId) => cyberwareById[reqId]?.name ?? reqId,
                  );
                  const overBudget = c.cost > remainingMoney;

                  return (
                    <article
                      key={c.id}
                      style={{
                        ...itemCardStyle,
                        borderColor:
                          missingReqs.length > 0 ? "var(--border-amber)" : "var(--border-subtle)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "var(--space-2)",
                          }}
                        >
                          <strong style={{ fontFamily: "var(--font-display)" }}>{c.name}</strong>
                          <span className="hud-badge hud-badge--pink">HC {c.humanityCost}</span>
                        </div>
                        <p
                          className="mono"
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-secondary)",
                            marginTop: "var(--space-1)",
                          }}
                        >
                          Category: {c.category}
                        </p>
                        {c.effect ? (
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--neon-cyan)", marginTop: "2px" }}>
                            Effect: {c.effect}
                          </p>
                        ) : null}
                        {c.note ? (
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
                            {c.note}
                          </p>
                        ) : null}
                        {reqNames.length > 0 ? (
                          <p
                            style={{
                              fontSize: "var(--text-xs)",
                              color: missingReqs.length > 0 ? "var(--neon-amber)" : "var(--neon-green)",
                              marginTop: "4px",
                              fontWeight: 600,
                            }}
                          >
                            {missingReqs.length > 0
                              ? `Requires: ${missingNames.join(", ")} (install prerequisite first)`
                              : `Requires: ${reqNames.join(", ")} (installed)`}
                          </p>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-2)",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span className="mono" style={{ fontWeight: 700, color: "var(--neon-amber)" }}>
                            {c.cost} {gearData.currency}
                          </span>
                          {overBudget ? (
                            <span className="hud-badge hud-badge--amber">Over budget</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="hud-btn hud-btn--primary hud-btn--sm"
                          data-testid={`buy-${c.id}`}
                          disabled={missingReqs.length > 0}
                          title={
                            missingReqs.length > 0
                              ? `Requires ${missingNames.join(", ")}`
                              : `Install ${c.name}`
                          }
                          onClick={() => handleAddCyberware(c.id)}
                        >
                          Add
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Owned Inventory */}
      <section className="hud-panel" aria-labelledby="owned-gear-heading">
        <div className="hud-panel__header">
          <h3 id="owned-gear-heading" className="hud-panel__title">
            Owned Inventory ({character.gear.items.length})
          </h3>
          <span className="hud-badge hud-badge--cyan">
            {totalSpent} {gearData.currency} total
          </span>
        </div>

        {character.gear.items.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            No weapons, armor, or cyberware purchased yet. Select items from the catalog above.
          </p>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {character.gear.items.map((selection, idx) => {
              const catalog = catalogById[selection.itemId];
              const weapon = weaponsById[selection.itemId];
              const armor = armorById[selection.itemId];
              const cyber = cyberwareById[selection.itemId];
              const missingReqs = cyber
                ? getMissingRequirements(selection.itemId, character.gear.items).map(
                    (reqId) => cyberwareById[reqId]?.name ?? reqId,
                  )
                : [];

              return (
                <li
                  key={`${selection.itemId}-${idx}`}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" }}>
                    <strong>{catalog?.name ?? selection.itemId}</strong>
                    {weapon ? (
                      <span className="hud-badge hud-badge--cyan">Weapon · {weapon.damage}</span>
                    ) : null}
                    {armor ? (
                      <span className="hud-badge hud-badge--green">Armor · SP {armor.sp}</span>
                    ) : null}
                    {cyber ? (
                      <span className="hud-badge hud-badge--pink">
                        Cyberware · Rolled HC: {selection.humanityCostRolled ?? 0}
                      </span>
                    ) : null}
                    {missingReqs.length > 0 ? (
                      <span className="hud-badge hud-badge--red">
                        Missing: {missingReqs.join(", ")}
                      </span>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span className="mono" style={{ color: "var(--neon-amber)", fontWeight: 600 }}>
                      {catalog?.cost ?? 0} {gearData.currency}
                    </span>
                    <button
                      type="button"
                      className="hud-btn hud-btn--danger hud-btn--sm"
                      data-testid={`remove-gear-${idx}`}
                      onClick={() => handleRemoveGear(idx)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
