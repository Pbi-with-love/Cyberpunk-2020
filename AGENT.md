# AGENT.md: Cyberpunk 2020 Character Generator

This file gives AI coding agents (and human contributors) the context needed to work on this project. Read it fully before making changes.

## 1. Project overview

A web app that guides a user through creating a character for the **Cyberpunk 2020** tabletop RPG (R. Talsorian Games, 1990). It replaces the paper process of rolling dice, distributing points, and looking up tables, and gives the result a cyberpunk-styled UI.

- **Scope:** character *creation* only. In-game tracking (wound track, stun, damage to armor per location, combat) is **out of scope** and listed as future work ("Play mode").
- **Users:** players and GMs who want a valid character quickly, including people who don't know the rules (so every stat and skill needs a short explanation in the UI).

## 2. Tech stack (assumed: change this section if the stack differs)

- **Frontend-only demo.** There is no backend, API, database, or user accounts, so do not add any. Everything runs in the browser.
- React + TypeScript, built with Vite
- Persistence uses `localStorage`, plus JSON import/export
- Deploy as a static site (e.g. GitHub Pages, Netlify, Vercel)
- Testing: Vitest for the rules engine
- Styling: plain CSS or CSS modules with CSS variables for the theme

Commands:

```bash
npm install
npm run dev     # local dev server
npm run build   # production build
npm run test    # unit tests
npm run lint
```

## 3. User flow

The app is a wizard with six steps. The user can move back and forth between steps. A **"Randomize all"** button fills every step automatically to produce a complete, valid character.

```
[1. Identity] → [2. Stats] → [3. Skills] → [4. Lifepath] → [5. Gear] → [6. Character Sheet]
```

Dependencies between steps (if an upstream value changes, re-validate everything downstream):

| Upstream value | Affects |
|---|---|
| Role (step 1) | Career skill list (3), starting money (5), highlighted stats (2) |
| Age (step 1) | Number of life events (4) |
| INT + REF (step 2) | Pickup skill points (3) |
| EMP (step 2) | Base Humanity (5) |
| Special Ability level (3) | Starting money (5) |

### Step 1: Identity
- Inputs: Handle (required), real name, Role (required, 1 of 10), age, gender, Reputation, portrait (optional)
- Age default: 16 + 2d6
- Show the role description and its Special Ability when a role is selected

### Step 2: Stats
- **2a. Point method:**
  - Random: total = 9d10, user distributes
  - Fast: roll 1d10 per stat, reroll results ≤ 2, no distribution needed
  - Cinematic: fixed total chosen from presets (e.g. major hero 80, minor hero 70, average 60)
- **2b. Distribution** across INT, REF, TECH, COOL, ATTR, LUCK, MA, BODY, EMP
- Each stat has a tooltip; the role's priority stats are highlighted; derived stats update live

### Step 3: Skills
- Two separate point pools:
  - **Career:** 40 points, only for the role's 10 career skills (including the Special Ability)
  - **Pickup:** INT + REF points, for any skill
- Each skill row shows `Stat + Skill` (the total used in play before adding 1d10)

### Step 4: Lifepath
- Sections: Style, Family, Motivations, Life Events
- Each item is a d10 table roll with a "roll" button; the result stays editable by hand
- Number of life events = age − 16 (one per year)

### Step 5: Gear
- Starting money based on role and Special Ability level
- Buy weapons, armor, and cyberware from catalogs
- Cyberware has a Humanity Cost (dice expression, rolled when installed)

### Step 6: Character Sheet
- Read-only summary of all steps, with an Edit link per section
- Save to `localStorage`, export/import JSON, export PDF (stretch goal)

## 4. Game rules (single source of truth)

All rules live in **pure functions** in `src/rules/`. UI components must never contain rule logic or magic numbers.

### Stats
- Nine stats, each an integer **2–10**
- Sum of stats must be ≤ the character-point total (Random/Cinematic methods)

### Derived stats

| Derived | Formula |
|---|---|
| Run | `MA * 3` (meters) |
| Leap | `Run / 4` (meters) |
| Lift | `BODY * 40` (kg) |
| Humanity (base) | `EMP * 10` |
| Save | `BODY` |
| BTM | BODY 2 → 0, 3–4 → −1, 5–7 → −2, 8–9 → −3, 10 → −4 |
| BDM | BODY 2 → −2, 3–4 → −1, 5–7 → 0, 8–9 → +1, 10 → +2 |

### Skills
- Level 0–10 per skill; at creation 1 point = 1 level
- Career pool: 40 points; pickup pool: `INT + REF` points
- A skill check in play is `Stat + Skill + 1d10` against a difficulty (Easy 10, Average 15, Difficult 20, Very Difficult 25, Nearly Impossible 30). The app only displays `Stat + Skill`
- Special cases the data model must support:
  - **Choice:** "A or B" (e.g. Solo: Brawling *or* Martial Arts)
  - **Free picks:** "any N skills of stat X" (e.g. Techie: 3 extra TECH skills)
  - **Detail required:** skills needing a free-text specialization (Expert, Know Language, Martial Arts)

### Cyberware and Humanity
- `currentHumanity = baseHumanity - sum(humanityCostRolled)`
- `currentEMP = floor(currentHumanity / 10)`
- Show a cyberpsychosis warning when `currentHumanity <= 0`

### Money
- `remainingMoney = startingMoney - sum(item.cost)`; must not go below 0

## 5. Data model

Game content lives in JSON under `src/data/` and is rendered generically. **Adding or fixing content should only require editing data, not components.**

| File | Contents |
|---|---|
| `stats.json` | 9 stats: key, name, short description |
| `roles.json` | 10 roles: id, name, description, specialAbility, careerSkills, careerChoices, careerFreePicks, priorityStats |
| `skills.json` | All skills: id, name, linked stat, `needsDetail` flag, description |
| `lifepath.json` | d10 tables for Style, Family, Motivations, Life Events |
| `gear.json` | Weapons, armor, cyberware catalogs; salary table by role and ability level |

Example shapes:

```json
// skills.json
{ "id": "handgun", "name": "Handgun", "stat": "REF" }
{ "id": "expert", "name": "Expert", "stat": "INT", "needsDetail": true }

// roles.json
{
  "id": "solo",
  "name": "Solo",
  "specialAbility": "combat_sense",
  "careerSkills": ["combat_sense", "awareness_notice", "handgun", "melee", "weaponsmith",
                   "rifle", "athletics", "submachinegun", "stealth"],
  "careerChoices": [{ "pick": 1, "from": ["brawling", "martial_arts"] }],
  "priorityStats": ["REF", "BODY", "COOL"]
}
// Techie: "careerFreePicks": [{ "count": 3, "stat": "TECH" }]
```

Every role resolves to exactly 10 career skills: `careerSkills` + choices + free picks. The generator script `gen/build_seed.py` rebuilds the JSON and checks this, along with skill IDs and cyberware requirements. Edit the script, not the JSON by hand.

Character state (TypeScript):

```ts
type StatKey = "INT" | "REF" | "TECH" | "COOL" | "ATTR" | "LUCK" | "MA" | "BODY" | "EMP";

interface Character {
  version: number;                 // schema version for saved JSON
  identity: { handle: string; realName?: string; roleId: string; age: number;
              gender?: string; reputation: number; portrait?: string };
  stats: { method: "random" | "fast" | "cinematic"; points: number; values: Record<StatKey, number> };
  skills: { career: Record<string, number>; pickup: Record<string, number>;
            details: Record<string, string> };
  lifepath: { style: Record<string, string>; family: Record<string, string>;
              motivations: Record<string, string>; events: string[] };
  gear: { startingMoney: number; items: { itemId: string; humanityCostRolled?: number }[] };
}
```

Derived values (Run, BTM, Humanity…) are **computed, never stored**.

## 6. Architecture and conventions

```
src/
  data/          # JSON game content
  rules/         # pure functions: derived stats, validation, point pools
  dice/          # dice rolling (d10, 2d6, "2d6" expression parser)
  state/         # character state + persistence (localStorage, import/export)
  steps/         # one component folder per wizard step
  components/    # shared UI (StatInput, DiceButton, PointCounter, Tooltip…)
  theme/         # CSS variables, fonts, effects
```

- **Dice must be injectable:** every roll goes through `dice/` with an optional seeded RNG so tests are deterministic. Never call `Math.random()` directly elsewhere.
- **Validation** is a pure function `validateStep(step, character) → Error[]`. The wizard blocks "Next" on errors and shows them inline.
- **Randomize** logic reuses the same rules and validation; a randomized character must always pass validation.
- Saved JSON includes `version`; loading an old version must migrate or fail with a clear message.
- Keep components small; one wizard step per folder.
- TypeScript strict mode; no `any` in `rules/`.

## 7. UI and style

- Cyberpunk look: dark background, neon pink/cyan accents, monospace or techno display font, subtle glitch/scanline effects
- Effects must be subtle and respect `prefers-reduced-motion`
- Accessibility: sufficient contrast on neon text, keyboard navigation through the wizard, labels on all inputs, tooltips reachable by keyboard
- Show remaining points prominently on Stats and Skills (e.g. "Remaining: 12")
- Responsive down to mobile width

## 8. Testing

Unit tests are required for everything in `rules/` and `dice/`:
- Derived stat formulas, including BTM/BDM table boundaries (BODY 2, 4, 5, 7, 8, 9, 10)
- Point-pool limits and stat range validation
- Career choices and free picks
- Humanity/EMP reduction and the cyberpsychosis threshold
- "Randomize all" produces a valid character across many seeds
- Save → load round-trip yields an identical character

## 9. Content and licensing rules

Cyberpunk 2020 is the property of R. Talsorian Games.
- Game **mechanics**, skill names, and numbers may be used.
- **Do not** copy rulebook text, artwork, or logos verbatim. Lifepath table entries and descriptions must be written in our own words.
- **Do not** copy code or data from other character generators unless their license allows it (e.g. MIT). If MIT-licensed material is used, keep its license notice and credit it in `CREDITS.md`.
- Some data (notably the Techie and Medtechie career lists, and the salary table) was compiled from memory. Mark uncertain entries with `"verify": true` and check them against the rulebook before release.

## 10. Priorities

| Priority | Work |
|---|---|
| Must have | Step 1, Step 2, Step 6 (save/load) |
| Should have | Step 4 Lifepath, "Randomize all" |
| Could have | Step 3 Skills, Step 5 Gear, PDF export |
| Future work | Play mode: wound track, stun, armor per location, combat |

The goal is a polished **demo**: a smooth wizard and a convincing cyberpunk look matter more than covering every rule. When in doubt, finish a smaller scope fully (working, validated, tested) rather than starting more steps.