# PROMPT.md: Build the Cyberpunk 2020 Character Generator

Copy everything below the line into your coding agent (Claude Code, Codex, Cursor…) at the root of the repo.

---

You are building a **frontend-only demo** web app: a character generator for the Cyberpunk 2020 tabletop RPG.

Work through the six phases below **in order**. Each phase ends with a checkpoint. Do not start the next phase until its checkpoint passes. After each phase, stop and report:
1. what you did
2. which files you created or changed
3. the checkpoint result
4. any open questions

If anything is unclear or contradicts `AGENT.md`, ask instead of guessing.

## Inputs (read these first)

- `AGENT.md`: project context, rules, architecture, conventions, priorities. **It is the source of truth.**
- `seed-data/*.json`: game content (stats, skills, roles, lifepath, gear)
- `seed-data/gen/build_seed.py`: regenerates and validates the seed data

---

## Phase 1: Read and understand the idea

1. Read `AGENT.md` and every file in `seed-data/` completely.
2. Run `python3 seed-data/gen/build_seed.py seed-data` and confirm it prints `OK`.
3. Summarize back in under 300 words:
   - the user flow (6 steps) and how the steps depend on each other
   - the scope: what is in, and what is explicitly out (backend, play mode)
   - the must / should / could priorities
4. List every entry marked `"verify": true` and note how the app should treat it (use it as-is for the demo).

**Checkpoint:** the summary matches `AGENT.md`. No code written yet.

---

## Phase 2: Write the spec

Create `docs/SPEC.md` with:

1. **Screens:** one section per wizard step plus the Character Sheet. For each, list:
   - inputs and their controls
   - derived values shown
   - validation rules and the exact error messages
   - buttons (Next, Back, Roll, Randomize)
2. **Rules engine API:** function signatures for `src/rules/` and `src/dice/`, for example:
   - `deriveStats(stats) → Derived`
   - `validateStep(step, character) → ValidationError[]`
   - `careerSlots(role) → Slot[]`
   - `pickupPoints(stats) → number`
   - `applyCyberware(character) → { humanity, emp }`
   - `rollDice(expr, rng) → number`
   - `randomizeCharacter(rng) → Character`
3. **State:** the `Character` type, how it is stored in `localStorage` (key name, `version` field), and the import/export format.
4. **Acceptance criteria:** a numbered list of testable statements. Example: "AC-07: With BODY = 8 the sheet shows BTM −3 and BDM +1." Every acceptance criterion must be covered by a unit test or an E2E test later.
5. **E2E scenarios:** the user journeys Playwright will run in Phase 6.

**Checkpoint:** every rule in `AGENT.md` section 4 appears in the spec. Every screen has validation rules. Acceptance criteria are numbered.

---

## Phase 3: Scaffold the project and build the rules engine

1. Scaffold with Vite + React + TypeScript (strict). Add Vitest, ESLint and Playwright (`@playwright/test`).
2. Copy the seed JSON into `src/data/` and load it with typed imports.
3. Implement `src/dice/` with a **seedable RNG**. No `Math.random()` anywhere else.
4. Implement `src/rules/` exactly as specified in `docs/SPEC.md`. These must be pure functions with no React imports.
5. Write Vitest unit tests covering the acceptance criteria that concern rules, including:
   - BTM/BDM boundaries at BODY 2, 4, 5, 7, 8, 9, 10
   - stat range limits and point limits
   - career choices (Solo) and free picks (Techie)
   - Humanity/EMP reduction and the cyberpsychosis threshold

**Checkpoint:** `npm run test`, `npm run lint` and `npm run build` all pass.

---

## Phase 4: Create sample characters

1. Create `src/data/sample-characters.json` with **10 characters, one per role**. Each must:
   - be generated with `randomizeCharacter(rng)` using a fixed seed, then given a hand-picked Handle that fits the role
   - have stats leaning toward the role's `priorityStats`
   - have a complete lifepath, with the number of life events matching the age
   - stay within the starting money for its role
2. Add a unit test: **every sample character passes `validateStep` for all steps** and survives a save → load round-trip unchanged.
3. Add a unit test: `randomizeCharacter` with 500 different seeds always produces a valid character.

**Checkpoint:** all tests pass. Print a one-line summary per sample character (Handle, Role, key stats).

---

## Phase 5: Build the UI

Build in this order and keep the app runnable after each item:

1. App shell, cyberpunk theme (CSS variables, dark background, neon accents, monospace font) and the wizard navigation with a step indicator
2. Step 1 Identity
3. Step 2 Stats (2a point method, 2b distribution with live derived values and a remaining-points counter)
4. Step 6 Character Sheet, with Save/Load from `localStorage` and JSON export/import
5. A "Load sample" picker that loads the Phase 4 characters
6. "Randomize all"
7. Step 4 Lifepath
8. Step 3 Skills
9. Step 5 Gear

Requirements:
- Add `data-testid` attributes to every interactive element and every displayed derived value, so Playwright can target them (e.g. `stat-REF-input`, `derived-btm`, `btn-next`, `remaining-points`).
- Components call `src/rules/` and never re-implement rules.
- Respect `prefers-reduced-motion`. Every input has a label. The wizard works with the keyboard.
- Steps 3 and 5 are "could have". If time runs short, stop after step 7 and say so.

**Checkpoint:** `npm run build` passes, and you can complete the whole wizard manually in `npm run dev`.

---

## Phase 6: Test end to end with the Playwright CLI

1. Configure `playwright.config.ts` to start the app automatically with `webServer` (`npm run dev` or `npm run preview`) and use Chromium.
2. Write specs in `e2e/` that cover every E2E scenario from `docs/SPEC.md`. At minimum:
   - **Happy path:** go through all steps with fixed inputs, check that the sheet shows the expected values, save, reload the page, and confirm the character is still there
   - **Validation:** "Next" is blocked when Handle is empty, when a stat is out of range, or when too many points are spent, and the correct error message appears
   - **Derived values:** changing BODY and MA updates BTM, BDM, Run and Leap live
   - **Randomize all:** produces a sheet with no validation errors
   - **Samples:** each of the 10 sample characters loads and renders the sheet
   - **Export/import:** export JSON, import it again, and get an identical sheet
   - **Keyboard:** the wizard can be completed using only the keyboard
3. Run the tests from the CLI:

   ```bash
   npx playwright install chromium
   npx playwright test
   npx playwright test --reporter=html   # if anything fails, inspect the report
   npx playwright show-report
   ```

4. If a test fails, fix the **app** (not the test) unless the test contradicts `docs/SPEC.md`. Re-run until everything is green.
5. Take screenshots of each wizard step and the sheet (`page.screenshot`) into `docs/screenshots/` for the report.

**Checkpoint:** `npm run test`, `npm run lint`, `npm run build` and `npx playwright test` all pass. Report the final test counts.

---

## Final report

When all phases are done, write `docs/REPORT.md` with:
- what was built, mapped to the must / should / could priorities
- the acceptance criteria table, each one marked with the test that covers it
- the test results (unit + E2E counts)
- any known gaps, plus the data still marked `"verify": true`
- future work: Play mode (wound track, stun, armor per location, combat)

## Rules for the whole task

- Follow `AGENT.md`. If this prompt and `AGENT.md` disagree, ask.
- No backend, accounts or network calls.
- Do not copy rulebook text, art or logos, or code from other generators.
- Small, focused commits, one per phase step, with clear messages.
- Never weaken or delete a test just to make it pass.