# Cyberpunk 2020 Character Generator — Final Implementation Report

## 1. What Was Built (Mapped to Priorities)

### Must Have
- **Pure Rules & Dice Engine (`src/dice/`, `src/rules/`):**
  - Seedable Mulberry32 PRNG (`createRng`), dice expression parser (`parseDice`, `rollDice`, `rollStatFast`, `pickOne`) with zero `Math.random()` outside `src/dice/index.ts`.
  - Pure rules engine (`deriveStats`, `pickupPoints`, `careerSlots`, `resolveCareerSkills`, `calculateStartingMoney`, `applyCyberware`, `calculateRemainingMoney`, `reconcileCharacter`, `validateStep`, `validateCharacter`, `randomizeCharacter`) with zero React/DOM imports and zero `any`.
- **Step 1 — Identity (`src/steps/IdentityStep.tsx`):**
  - Handle, Real Name, Gender, Age (`16 + 2d6` roller), Reputation (`0–10`), interactive 10-Role archetype selector with pixel icons, Special Ability details, and priority stats.
- **Step 2 — Stats (`src/steps/StatsStep.tsx`):**
  - Random (`9d10`), Fast (`1d10` reroll `<= 2`), and Cinematic (`major_hero`, `major_supporting`, `minor_hero`, `minor_supporting`, `average`) methods; 9 stat controls (`2–10`) with priority badges and keyboard tooltips; live derived stats (`Run`, `Leap`, `Lift`, `Humanity`, `Save`, `BTM`, `BDM`).
- **Step 6 — Character Sheet (`src/steps/CharacterSheetStep.tsx` & `src/state/persistence.ts`):**
  - Read-only dossier with Edit links for Steps 1–5, `localStorage` Save/Load (`cp2020_character_v1`), JSON Export/Import (`version: 1` validation), PNG Pixel Portrait download, and Print/PDF stylesheet.
- **Interactive 2D Pixel Character Canvas (`src/components/PixelAvatar/`):**
  - Layered `<canvas>` renderer (`32x48` logical grid scaled to `256x384` with `image-rendering: pixelated`) supporting distinct outfits & props for all 10 roles, skin tones, 10 hairstyles + 8 hair colors, 10 clothes styles + 8 outfit palettes, `BODY`-scaled physique, lifepath affectations, and live cyberware/armor overlays.
- **Strict Workspace AI Rules:**
  - `.agents/rules/cyberpunk2020.md` and `AGENTS.md` enforcing `AGENT.md`, `PROMPT.md`, and `docs/SPEC.md` compliance.

### Should Have
- **Step 4 — Lifepath (`src/steps/LifepathStep.tsx`):**
  - `1d10` table rollers + manual editing for Style, Family (including parent fate, family tragedy, and sibling details), Motivations, and `age - 16` Life Events, synchronized with the 2D Pixel Avatar.
- **Randomize All (`btn-randomize-all`):**
  - Single-click generation of a fully valid, priority-weighted character across all 6 steps.
- **10 Sample Characters (`src/data/sample-characters.json`):**
  - Pre-generated sample preset for every role (`Razor`, `Johnny Chrome`, `Ghost_0x`, `Vera Truth`, `Dust`, `Slick`, `Kowalski`, `Vance Sterling`, `Ratchet`, `Doc Trauma`).

### Could Have
- **Step 3 — Skills (`src/steps/SkillsStep.tsx`):**
  - `40`-point Career pool + `INT + REF` Pickup pool, Solo `careerChoices`, Techie `careerFreePicks`, specialization details (`Expert`, `Know Language`, `Martial Arts`, `Play Instrument`), search/stat-group filters, and live `Stat + Skill` readouts.
- **Step 5 — Gear (`src/steps/GearStep.tsx`):**
  - Role/Special-Ability starting money (`1d6` multiplier), Weapons, Armor, and Cyberware catalogs with prerequisite enforcement, rolled Humanity Cost dice, `currentEMP` drop, and Cyberpsychosis alert when `currentHumanity <= 0`.
- **Print / PDF Export:**
  - Print stylesheet in `src/theme/global.css` hiding interactive controls and formatting the dossier cleanly.

---

## 2. Acceptance Criteria Coverage

| AC | Description | Covered By |
|---|---|---|
| AC-01 | Step 1 requires non-empty Handle and valid Role | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-02 | Age defaults to `16 + 2d6`; changing age updates life events count | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-03 | Role selection highlights priority stats & filters career skills | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-04 | Stats bounded to integers `2..10` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-05 | Random & Cinematic enforce `sum(stats) <= points` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-06 | Fast method rolls `1d10` rerolling `<= 2` (`3..10`) | `src/dice/dice.test.ts` |
| AC-07 | `BODY = 8` yields `BTM = -3`, `BDM = +1`, `Save = 8`, `Lift = 320 kg` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-08 | BTM/BDM table boundaries (`BODY` 2, 3, 4, 5, 7, 8, 9, 10) | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-09 | `MA = 8` yields `Run = 24 m`, `Leap = 6 m` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-10 | Base `Humanity = EMP * 10` and `Save = BODY` | `src/rules/rules.test.ts` |
| AC-11 | Career pool `40` pts across role's 10 career skills | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-12 | Solo `careerChoices` (`brawling` or `martial_arts`) | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-13 | Techie `careerFreePicks` (up to 3 extra `TECH` skills) | `src/rules/rules.test.ts` |
| AC-14 | Pickup pool `INT + REF`, excluding other roles' Special Abilities | `src/rules/rules.test.ts` |
| AC-15 | `needsDetail` skills require specialization detail when level > 0 | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-16 | Lifepath events count equals `max(0, age - 16)` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-17 | Starting money = `salaryBySpecialAbilityLevel * ceil(d6 / 3)` | `src/rules/rules.test.ts` |
| AC-18 | Gear enforces `remainingMoney >= 0` | `src/rules/rules.test.ts` |
| AC-19 | Cyberware enforces `requires` prerequisites & rolls `humanityCost` | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-20 | Cyberware reduces `currentHumanity` and sets `currentEMP = floor(currentHumanity / 10)` | `src/rules/rules.test.ts` |
| AC-21 | Cyberpsychosis warning displayed when `currentHumanity <= 0` | `src/rules/rules.test.ts` |
| AC-22 | `randomizeCharacter` valid across 500 seeds | `src/rules/rules.test.ts` |
| AC-23 | All 10 sample characters valid and round-trip identically | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-24 | Save -> reload restores exact character from `localStorage` | `e2e/app.spec.ts` |
| AC-25 | JSON export/import round-trip and schema version validation | `src/rules/rules.test.ts`, `e2e/app.spec.ts` |
| AC-26 | 2D Pixel Avatar renders distinct role art and live appearance updates | `e2e/app.spec.ts` |

---

## 3. Test & Verification Results

- **Seed Data Validation (`python3 seed-data/gen/build_seed.py src/data`):** `OK` (`92` skills, `10` roles, `15` weapons, `10` armor, `16` cyberware)
- **ESLint (`npm run lint`):** Passed (`0` errors, `0` warnings)
- **TypeScript + Production Build (`npm run build`):** Passed (`tsc -b && vite build`, `0` errors)
- **Vitest Unit Tests (`npm run test`):** `2` test files passed, `15` tests passed (`5` in `src/dice/dice.test.ts`, `10` in `src/rules/rules.test.ts` including 500-seed fuzz validation and 10 sample characters)
- **Playwright E2E (`npx playwright test`):** `8` specs passed in Chromium, with screenshots saved to `docs/screenshots/step-1-identity.png` through `docs/screenshots/step-6-sheet.png`

---

## 4. Known Gaps & `"verify": true` Data

All seed entries flagged `"verify": true` are used as-is for the demo and marked in the UI with `VERIFY` badges:
- `src/data/stats.json`: Cinematic point presets (`80`, `70`, `75`, `60`, `50`)
- `src/data/roles.json`: `techie` and `medtechie` career skill lists
- `src/data/gear.json`: Salary table by Special Ability level, weapon stats, armor stats, and cyberware stats/costs

---

## 5. Future Work ("Play Mode")

Out of scope for this character-creation demo and deferred to future Play Mode work:
- Wound track, Stun/Death saves, and trauma tracking
- Per-location armor degradation and layering rules
- Live combat initiative tracker, attack/damage rolling, and Netrunning deck interface
