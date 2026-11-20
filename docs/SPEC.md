# Cyberpunk 2020 Character Generator — Technical Specification

> **Source of truth:** `AGENT.md` and `seed-data/*.json`. This specification defines all UI screens, `data-testid` contracts, rules engine APIs, state persistence, acceptance criteria (`AC-01`–`AC-26`), and Playwright E2E scenarios.

---

## 1. Phase 1 Summary & Seed Data Audit

- **Scope:** Frontend-only React + TypeScript + Vite character creation wizard (6 steps) with an interactive **2D Pixel Character Canvas** and RPG HUD aesthetic. Backend services, user accounts, network persistence, and in-game combat tracking ("Play mode") are explicitly out of scope.
- **Wizard Flow & Dependencies:**
  `[1. Identity] -> [2. Stats] -> [3. Skills] -> [4. Lifepath] -> [5. Gear] -> [6. Character Sheet]`
  - `Role` (Step 1) determines highlighted `priorityStats` (Step 2), career skills & Special Ability (Step 3), and salary table (Step 5).
  - `Age` (Step 1) determines life events count `max(0, age - 16)` (Step 4).
  - `INT + REF` (Step 2) determines Pickup skill point pool (Step 3).
  - `EMP` (Step 2) determines base Humanity `EMP * 10` (Step 5).
  - `BODY` (Step 2) updates derived stats (`Lift`, `Save`, `BTM`, `BDM`) and scales the 2D Pixel Avatar's physical build.
  - `Special Ability` level (Step 3) determines monthly salary in Step 5 (`startingMoney`).
  - `Lifepath Style` (`clothes`, `hair`, `affectation`) and Appearance settings synchronize directly with the 2D Pixel Character Canvas.
- **Priorities:**
  - **Must have:** Step 1 Identity, Step 2 Stats, Step 6 Character Sheet (save/load/import/export), Rules Engine + Unit Tests, 2D Pixel Character Renderer.
  - **Should have:** Step 4 Lifepath, "Randomize all", 10 Sample Characters.
  - **Could have:** Step 3 Skills, Step 5 Gear (Weapons/Armor/Cyberware), Print/PDF export.
- **Entries marked `"verify": true` in `seed-data/`:**
  1. `stats.json` -> `pointMethods[2]` (`cinematic` presets: 80, 70, 75, 60, 50)
  2. `roles.json` -> `roles` entries `"techie"` and `"medtechie"`
  3. `gear.json` -> top-level `"verify": true` (salary table, weapons, armor, cyberware catalogs)
  - **Handling:** Used as-is from `src/data/*.json` for the demo; UI renders a subtle `"VERIFY"` badge near those sections/items so reviewers know they await rulebook verification before release.

---

## 2. Screen Specifications & `data-testid` Contracts

### Global App Shell & Persistent 2D Pixel Character Stage

- **Header Bar:**
  - App title (`CYBERPUNK 2020 // CHARGEN`)
  - `data-testid="sample-picker"`: Dropdown/picker to load any of the 10 pre-generated sample characters (`src/data/sample-characters.json`)
  - `data-testid="btn-randomize-all"`: Button that runs `randomizeCharacter` and populates all 6 steps with a valid character
  - `data-testid="btn-reset"`: Button to reset to a blank default character
- **Wizard Stepper (`nav[aria-label="Wizard steps"]`):**
  - 6 step buttons: `data-testid="step-tab-1"` through `data-testid="step-tab-6"`
- **Persistent 2D Pixel Character Dock (`aside[data-testid="pixel-avatar-dock"]`):**
  - Always visible alongside the active step (desktop side-by-side, responsive top/collapsible card on mobile).
  - `<canvas data-testid="pixel-avatar-canvas" width="256" height="384" />` rendering crisp pixel art (`32x48` logical grid scaled `8x` with `image-rendering: pixelated`) tailored to the selected Role (`solo`, `rocker`, `netrunner`, `media`, `nomad`, `fixer`, `cop`, `corporate`, `techie`, `medtechie`).
  - **Live Pixel Layers:**
    1. Role-specific silhouette, armor/jacket/suit design, and iconic hand/back prop
    2. Skin tone palette (`skinTone`) + `BODY`-scaled build (`slim` 2–4, `athletic` 5–7, `heavy` 8–10)
    3. Hairstyle (`hairStyle`, 10 styles matching `lifepath.json`) + hair color (`hairColor`, 8 cyberpunk swatches)
    4. Outfit style & color override (`clothesStyle` matching `lifepath.json` + `clothesColor` swatch)
    5. Affectation overlay (mirrorshades, crawling tattoos, chrome cyberlimb, subdermal glow, gloves, etc.)
    6. Installed cyberware & equipped armor overlays (`cyberoptic`, `cyberarm`, `cyberleg`, `rippers`, `wolvers`, `interface_plugs`, helmets, body armor)
  - **Quick Visual Controls:**
    - `data-testid="appearance-skin"` (skin tone buttons/select)
    - `data-testid="appearance-hair-style"` (hairstyle select, synced with `lifepath.style.hair`)
    - `data-testid="appearance-hair-color"` (hair color swatches)
    - `data-testid="appearance-clothes-style"` (clothes style select, synced with `lifepath.style.clothes`)
    - `data-testid="appearance-clothes-color"` (clothes palette swatches)
- **Footer Navigation:**
  - `data-testid="btn-back"`: Moves to `step - 1` (disabled on step 1)
  - `data-testid="btn-next"`: Validates current step; if errors exist, blocks advance and displays `data-testid="step-errors"` inline; otherwise advances to `step + 1` (hidden/replaced on step 6)

---

### Step 1: Identity (`src/steps/IdentityStep/`)

- **Inputs:**
  - Handle (required text input): `data-testid="input-handle"`
  - Real Name (optional text input): `data-testid="input-real-name"`
  - Role (required, 1 of 10 from `roles.json`):
    - `<select data-testid="select-role">` (keyboard accessible) + interactive Role Cards `data-testid="role-card-<roleId>"`
  - Age (integer >= 16, default `16 + 2d6`): `data-testid="input-age"` + `data-testid="btn-roll-age"` (`Roll 16 + 2d6`)
  - Gender (optional text/datalist): `data-testid="input-gender"`
  - Reputation (integer `0..10`, default `0`): `data-testid="input-reputation"`
- **Displayed Info:**
  - Selected role tagline, description, priority stats badges, and Special Ability name + description (`data-testid="role-details"`).
- **Validation Rules & Exact Error Messages:**
  - `identity.handle.trim().length === 0` -> `"Handle is required."`
  - `!rolesById[identity.roleId]` -> `"Please select a valid Role."`
  - `!Number.isInteger(identity.age) || identity.age < 16 || identity.age > 120` -> `"Age must be an integer between 16 and 120."`
  - `!Number.isInteger(identity.reputation) || identity.reputation < 0 || identity.reputation > 10` -> `"Reputation must be between 0 and 10."`

---

### Step 2: Stats (`src/steps/StatsStep/`)

- **Inputs:**
  - Method selector (`random` | `fast` | `cinematic`): `data-testid="method-random"`, `data-testid="method-fast"`, `data-testid="method-cinematic"`
  - Roll / Reroll Stats button: `data-testid="btn-roll-stats"`
    - `random`: rolls `9d10` for pool `stats.points`
    - `fast`: rolls `1d10` rerolling `<= 2` for each of the 9 stats, sets `stats.points` to their sum
    - `cinematic`: sets `stats.points` from chosen preset (`data-testid="cinematic-preset-select"`)
  - 9 Stat Inputs (`INT`, `REF`, `TECH`, `COOL`, `ATTR`, `LUCK`, `MA`, `BODY`, `EMP`):
    - Number input: `data-testid="stat-<KEY>-input"`
    - Decrement / Increment buttons: `data-testid="stat-<KEY>-dec"`, `data-testid="stat-<KEY>-inc"`
    - Priority stat badge when `KEY` is in `role.priorityStats`: `data-testid="stat-<KEY>-priority"`
    - Keyboard-accessible tooltip button (`aria-describedby` / `title` / expandable info) showing `short` description and `usedFor`
- **Derived Values Shown Live:**
  - Total Pool: `data-testid="stats-total-pool"`
  - Points Spent: `data-testid="stats-spent"`
  - Remaining Points (`points - sum(values)`): `data-testid="remaining-points"`
  - `data-testid="derived-run"` (`MA * 3` m)
  - `data-testid="derived-leap"` (`Run / 4` m)
  - `data-testid="derived-lift"` (`BODY * 40` kg)
  - `data-testid="derived-humanity"` (`EMP * 10`)
  - `data-testid="derived-save"` (`BODY`)
  - `data-testid="derived-btm"` (0, -1, -2, -3, -4)
  - `data-testid="derived-bdm"` (-2, -1, 0, +1, +2)
- **Validation Rules & Exact Error Messages:**
  - For each stat `KEY`: if `!Number.isInteger(val) || val < 2 || val > 10` -> `"Stat <KEY> must be an integer between 2 and 10."`
  - If `(method === "random" || method === "cinematic") && spent > points` -> `"Too many stat points spent (${spent} / ${points})."`
  - If `method === "fast" && spent > points` -> `"Stat total exceeds Fast roll pool (${spent} / ${points})."`

---

### Step 3: Skills (`src/steps/SkillsStep/`)

- **Inputs:**
  - Career Pool (`40` pts): `data-testid="career-remaining"`
  - Pickup Pool (`INT + REF` pts): `data-testid="pickup-remaining"`
  - Role Special Choices (e.g. Solo `brawling` vs `martial_arts`): `data-testid="career-choice-<skillId>"`
  - Role Free Picks (e.g. Techie 3 `TECH` skills): `data-testid="career-freepick-<skillId>"`
  - Skill filter / search input: `data-testid="skills-search"` and stat-group tabs
  - Per-skill controls:
    - Career level input (`0..10`, only for active career skills): `data-testid="skill-<id>-career"`
    - Pickup level input (`0..10`, for any general skill): `data-testid="skill-<id>-pickup"`
    - Specialization detail input (shown when `needsDetail: true`): `data-testid="skill-<id>-detail"`
    - Live total display (`Stat + Career + Pickup`, or `Skill` level): `data-testid="skill-<id>-total"`
- **Validation Rules & Exact Error Messages:**
  - `careerSpent > 40` -> `"Career skill points exceed 40 (${careerSpent} / 40)."`
  - `pickupSpent > pickupPool` -> `"Pickup skill points exceed ${pickupPool} (${pickupSpent} / ${pickupPool})."`
  - Career points assigned to skill not in resolved career skills -> `"Skill <name> is not an active career skill for this role."`
  - Special Ability of another role given pickup points -> `"Cannot spend pickup points on another role's Special Ability (<name>)."`
  - `totalLevel < 0 || totalLevel > 10 || !Number.isInteger(...)` -> `"Skill <name> level must be an integer between 0 and 10."`
  - `skill.needsDetail && totalLevel > 0 && !detail.trim()` -> `"Please specify ${detailLabel} for <name>."`

---

### Step 4: Lifepath (`src/steps/LifepathStep/`)

- **Inputs:**
  - Batch button: `data-testid="btn-roll-lifepath-all"`
  - **Style** (`clothes`, `hair`, `affectation`, `origin`, `language`): editable input + `data-testid="roll-style-<key>"`
  - **Family** (`ranking`, `parents`, `parentFate`, `familyStatus`, `familyTragedy`, `childhood`, `siblings`): editable input + `data-testid="roll-family-<key>"`
  - **Motivations** (`personality`, `valuedPerson`, `valueMost`, `feelAboutPeople`, `valuedPossession`): editable input + `data-testid="roll-motivations-<key>"`
  - **Life Events** (`age - 16` items, 1 per year from age 17 to `age`):
    - Each row `i`: `data-testid="life-event-input-${i}"` + `data-testid="btn-roll-event-${i}"`
    - Batch event roller: `data-testid="btn-roll-all-events"`
- **Validation Rules & Exact Error Messages:**
  - `lifepath.events.length !== Math.max(0, identity.age - 16)` -> `"Expected ${expected} life events for age ${identity.age}, found ${lifepath.events.length}."`

---

### Step 5: Gear (`src/steps/GearStep/`)

- **Displayed Values & Controls:**
  - Starting Money (`eb`): `data-testid="starting-money"` + `data-testid="btn-roll-money"` (rolls `1d6` multiplier `ceil(d6 / 3)`) + manual starting money override input `data-testid="input-starting-money"`
  - Remaining Money (`eb`): `data-testid="remaining-money"`
  - Humanity & EMP Gauge:
    - Base Humanity: `EMP * 10`
    - Current Humanity: `data-testid="current-humanity"`
    - Current EMP: `data-testid="current-emp"`
    - Cyberpsychosis Alert (`currentHumanity <= 0`): `data-testid="cyberpsychosis-warning"`
  - Catalog tabs (`Weapons`, `Armor`, `Cyberware`) with Add buttons (`data-testid="buy-<itemId>"`)
  - Owned inventory list with Humanity Cost rolled badge (for cyberware) and Remove buttons (`data-testid="remove-gear-<index>"`)
- **Validation Rules & Exact Error Messages:**
  - `remainingMoney < 0` -> `"Total gear cost exceeds starting money (${spent} eb / ${startingMoney} eb)."`
  - Unknown `itemId` -> `"Unknown gear item: ${itemId}."`
  - Missing cyberware prerequisite (`item.requires`) -> `"Cyberware <name> requires <reqName> to be installed."`

---

### Step 6: Character Sheet (`src/steps/CharacterSheetStep/`)

- **Displays:** Full read-only RPG Character Sheet with the 2D Pixel Avatar portrait, Identity, Stats & Derived Stats, Skills (`Stat + Skill`), Lifepath & Life Events, Gear/Weapons/Armor/Cyberware, and Humanity/EMP status.
- **Actions:**
  - Edit section links (`data-testid="edit-step-1"` .. `data-testid="edit-step-5"`)
  - Save to `localStorage`: `data-testid="btn-save"` (shows confirmation banner `data-testid="save-status"`)
  - Load from `localStorage`: `data-testid="btn-load"`
  - Export JSON file: `data-testid="btn-export-json"` (and downloadable JSON payload)
  - Import JSON file: `data-testid="input-import-json"` (validates schema & `version === 1`, reports clear error `data-testid="import-error"` if invalid)
  - Print / Export PDF: `data-testid="btn-print"` (`window.print()`)
  - Download 2D Pixel Portrait PNG: `data-testid="btn-download-portrait"`

---

## 3. Rules Engine & Dice Engine API

### `src/dice/index.ts`

```ts
export type Rng = () => number; // returns float in [0, 1)

export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
}

export function createRng(seed?: number): Rng;
export function rollDie(sides: number, rng?: Rng): number;
export function parseDice(expr: string): DiceExpression;
export function rollDice(expr: string, rng?: Rng): number;
export function rollStatFast(rng?: Rng): number; // 1d10, reroll <= 2
```

### `src/rules/index.ts`

```ts
export function deriveStats(stats: Record<StatKey, number>): DerivedStats;
export function pickupPoints(stats: Record<StatKey, number>): number;
export function careerSlots(roleId: string): CareerSlotInfo;
export function resolveCareerSkills(
  roleId: string,
  chosenSkills?: string[],
  freePickSkills?: string[]
): string[];
export function getSpecialAbilityLevel(character: Character): number;
export function calculateStartingMoney(
  roleId: string,
  specialAbilityLevel: number,
  multiplierRoll?: number
): number;
export function applyCyberware(
  baseEmp: number,
  items: GearItemSelection[]
): {
  baseHumanity: number;
  humanityLoss: number;
  humanity: number;
  emp: number;
  cyberpsychosis: boolean;
};
export function calculateRemainingMoney(
  startingMoney: number,
  items: GearItemSelection[]
): number;
export function reconcileCharacter(prev: Character, next: Character): Character;
export function validateStep(step: WizardStep, character: Character): ValidationError[];
export function validateCharacter(character: Character): Record<WizardStep, ValidationError[]>;
export function randomizeCharacter(rng?: Rng, roleIdOverride?: string): Character;
```

---

## 4. State & Persistence

- **`Character` Schema (`version: 1`):** Matches `AGENT.md` section 5 (`identity`, `stats`, `skills`, `lifepath`, `gear`), plus optional `appearance` (`skinTone`, `hairStyle`, `hairColor`, `clothesStyle`, `clothesColor`) and optional `skills.careerChoices` / `skills.careerFreePicks`.
- **`localStorage` Key:** `"cp2020_character_v1"`
- **Export / Import JSON:** Serializes `Character` with `version: 1`. On import, parses JSON, verifies `version === 1` (rejecting unsupported/future versions or malformed payloads with a descriptive error message), validates/sanitizes, and loads into wizard state.

---

## 5. Numbered Acceptance Criteria

- **AC-01:** Step 1 requires non-empty `handle` and valid `roleId` from `roles.json`.
- **AC-02:** Step 1 age defaults to `16 + 2d6` and Roll Age updates age and downstream life events count (`age - 16`).
- **AC-03:** Selecting a Role highlights its `priorityStats` in Step 2, shows its Special Ability in Step 1, and filters career skills in Step 3.
- **AC-04:** Stats are bounded to integers `2..10`; values outside `2..10` fail validation.
- **AC-05:** Random (`9d10`) and Cinematic presets (`80`, `75`, `70`, `60`, `50`) enforce `sum(stats) <= points`.
- **AC-06:** Fast stat generation rolls `1d10` per stat and rerolls any result `<= 2`, yielding values `3..10`.
- **AC-07:** With `BODY = 8`, derived stats show `BTM = -3` and `BDM = +1` (plus `Save = 8`, `Lift = 320 kg`).
- **AC-08:** BTM/BDM boundary checks match rule table at `BODY = 2, 3, 4, 5, 7, 8, 9, 10`.
- **AC-09:** With `MA = 8`, derived stats show `Run = 24 m` and `Leap = 6 m`.
- **AC-10:** Derived `Humanity = EMP * 10` and `Save = BODY`.
- **AC-11:** Career skill pool is `40` points across the role's 10 resolved career skills.
- **AC-12:** Solo supports `careerChoices` (`brawling` OR `martial_arts`, not both with career points).
- **AC-13:** Techie supports `careerFreePicks` (up to 3 extra `TECH` skills).
- **AC-14:** Pickup skill pool equals `INT + REF` and excludes other roles' `SPECIAL` abilities.
- **AC-15:** Skills with `needsDetail: true` (`expert`, `know_language`, `martial_arts`, `play_instrument`) require a non-empty specialization detail when level > 0.
- **AC-16:** Lifepath `events` count equals `max(0, age - 16)` and each table rolls `1d10` while remaining manually editable.
- **AC-17:** Starting money calculates `salaryBySpecialAbilityLevel[roleId][level - 1] * ceil(d6 / 3)`.
- **AC-18:** Gear purchases enforce `remainingMoney >= 0`.
- **AC-19:** Cyberware installation enforces `requires` prerequisites (e.g. `reflex_booster` requires `neural_processor`) and rolls `humanityCost` dice.
- **AC-20:** Installing cyberware reduces `currentHumanity` by `sum(humanityCostRolled)` and sets `currentEMP = floor(currentHumanity / 10)`.
- **AC-21:** When `currentHumanity <= 0`, a Cyberpsychosis warning is displayed.
- **AC-22:** `randomizeCharacter(rng)` produces a character passing `validateStep` for all steps across 500 distinct seeds.
- **AC-23:** All 10 sample characters in `src/data/sample-characters.json` pass validation for all steps and survive JSON round-trip unchanged.
- **AC-24:** Save -> reload page restores the exact character from `localStorage`.
- **AC-25:** Export JSON -> Import JSON restores an identical character; invalid/unsupported `version` yields a clear error.
- **AC-26:** The 2D Pixel Character Canvas renders distinct role visuals for all 10 roles and reflects changes to skin tone, hair style/color, clothes style/color, `BODY`, and installed cyberware/armor.

---

## 6. Playwright E2E Scenarios

1. **E2E-01 Happy Path & Save/Reload:** Fill Identity (Handle, Role, Age), configure Stats, complete Skills/Lifepath/Gear, inspect Character Sheet, save to `localStorage`, reload page, click Load / verify persistence.
2. **E2E-02 Validation Guards:** Attempt Next with empty Handle (blocked + error), stat `< 2` or `> 10` (blocked + error), overspent stat points (blocked + error).
3. **E2E-03 Live Derived Values:** Change `BODY` (e.g. `2 -> 8 -> 10`) and `MA` (`6 -> 8`) and assert `derived-btm`, `derived-bdm`, `derived-run`, `derived-leap` update immediately.
4. **E2E-04 2D Pixel Avatar Responsiveness:** Switch roles and update appearance controls (skin, hair, clothes); verify canvas renders non-blank pixel data and pixel buffer changes across selections.
5. **E2E-05 Randomize All:** Click `Randomize all`, verify valid Character Sheet renders with zero validation errors.
6. **E2E-06 Sample Characters:** Load each of the 10 sample characters via `sample-picker` and verify sheet renders handle, role, and stats cleanly.
7. **E2E-07 JSON Export & Import:** Export character JSON, reset character, import JSON, verify identical sheet state; verify malformed/wrong-version JSON shows error.
8. **E2E-08 Keyboard Navigation:** Complete wizard navigation using Tab / Enter / Space / Arrow keys.
