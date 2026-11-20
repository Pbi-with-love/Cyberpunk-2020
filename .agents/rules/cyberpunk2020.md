# Cyberpunk 2020 Character Generator — Strict Engineering Rules

All AI agents and contributors working in this repository MUST follow `AGENT.md` (source of truth), `PROMPT.md`, and `docs/SPEC.md`.

## 1. Architecture & Layer Separation

- **Frontend-only demo:** No backend, no API calls, no external network dependencies at runtime, no user accounts.
- **Rules Engine (`src/rules/`):**
  - MUST consist exclusively of **pure TypeScript functions**.
  - MUST NOT import `react`, `react-dom`, browser globals (`window`, `document`, `localStorage`), or UI components.
  - MUST NOT use `any` anywhere (strict TypeScript).
  - Single source of truth for derived stats, point pools, career slot resolution, cyberware/Humanity math, money calculations, validation (`validateStep`), and randomization (`randomizeCharacter`).
- **Dice & RNG (`src/dice/`):**
  - Every random roll MUST go through `src/dice/` using an injectable `Rng` interface so tests are 100% deterministic.
  - NEVER call `Math.random()` directly anywhere in `src/rules/`, `src/state/`, `src/steps/`, or `src/components/`.
- **Data-Driven Content (`src/data/`):**
  - Game content lives in `src/data/*.json` (sourced from `seed-data/*.json`). Do not hardcode role lists, skills, stat descriptions, lifepath tables, or gear catalogs inside React components.
  - Entries marked `"verify": true` in seed data must be used as-is for the demo and flagged with a subtle `"VERIFY"` indicator in the UI where helpful.
  - Never copy rulebook text verbatim, artwork, logos, or code from non-permissive external generators.

## 2. State, Validation & Downstream Synchronization

- Maintain the `Character` schema in `AGENT.md` section 5 (`version: 1`, `identity`, `stats`, `skills`, `lifepath`, `gear`, plus optional `appearance` synced with Lifepath Style).
- Derived values (`Run`, `Leap`, `Lift`, `Humanity`, `Save`, `BTM`, `BDM`, `currentHumanity`, `currentEMP`, `remainingMoney`) are ALWAYS computed from `src/rules/`, never stored in persisted state.
- When upstream values change (Role, Age, INT, REF, EMP, Special Ability level), immediately reconcile downstream state (`reconcileCharacter`) and re-validate.
- Wizard navigation MUST block advancing (`Next`) when `validateStep(currentStep, character)` returns errors, and display inline error messages.
- `randomizeCharacter(rng)` MUST produce a character that passes `validateStep` for every step (`1..6`) across any seed.

## 3. 2D Pixel Character Canvas & Web-Game UI Conventions

- **2D Pixel Character Stage (`src/components/PixelAvatar/`):**
  - Render a dedicated, crisp pixel-art character (`image-rendering: pixelated` on HTML5 `<canvas>`) specifically styled for each of the **10 roles** (`solo`, `rocker`, `netrunner`, `media`, `nomad`, `fixer`, `cop`, `corporate`, `techie`, `medtechie`).
  - Visually reflect player customizations in real time:
    - Skin tone
    - Hairstyle & hair color (synchronized with Lifepath Style `hair`)
    - Outfit / clothes style & palette (synchronized with Lifepath Style `clothes`)
    - Body build silhouette scaled by `BODY` stat (2–4 slim, 5–7 athletic, 8–10 heavy/muscular)
    - Affectations (mirrorshades, glowing tattoos, cyberlimb, subdermal lights, gloves, etc.)
    - Equipped cyberware (`cyberoptic`, `cyberarm`, `cyberleg`, `rippers`, `wolvers`, `interface_plugs`) and armor (`steel_helmet`, `nylon_helmet`, `full_body_armor`, `heavy_vest`).
- **Typography & Game Styling (`src/theme/`):**
  - Dark cyberpunk game aesthetic with crisp neon cyan/pink/amber accents, subtle scanlines/HUD frames, and high-contrast readable modern typography (`Chakra Petch` / `Space Grotesk` / `JetBrains Mono` with local system fallbacks).
  - Respect `@media (prefers-reduced-motion: reduce)` for all animations and glitch effects.
  - Full keyboard accessibility, explicit `<label>` elements on every input, keyboard-accessible tooltips, and responsive layout down to mobile widths.
- **Testability:**
  - Every interactive element and derived stat display MUST expose the `data-testid` attributes defined in `docs/SPEC.md`.

## 4. Verification Discipline

- After changes to rules, data, or UI, run `npm run test`, `npm run lint`, and `npm run build` before finishing.
- Never weaken, skip, or delete tests to make a check pass. Fix the implementation instead (unless a test clearly contradicts `docs/SPEC.md`).
