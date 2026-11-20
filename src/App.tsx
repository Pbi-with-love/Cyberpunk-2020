import { useCallback, useMemo, useRef, useState } from "react";
import { PixelAvatarDock } from "./components/PixelAvatar/PixelAvatarDock";
import { StepErrors } from "./components/StepErrors";
import { rolesById, sampleCharacters } from "./data";
import { createRng } from "./dice";
import {
  createBlankCharacter,
  randomizeCharacter,
  reconcileCharacter,
  validateCharacter,
  validateStep,
} from "./rules";
import {
  deserializeCharacter,
  loadCharacterFromStorage,
  saveCharacterToStorage,
  serializeCharacter,
} from "./state/persistence";
import { CharacterSheetStep } from "./steps/CharacterSheetStep";
import { GearStep } from "./steps/GearStep";
import { IdentityStep } from "./steps/IdentityStep";
import { LifepathStep } from "./steps/LifepathStep";
import { SkillsStep } from "./steps/SkillsStep";
import { StatsStep } from "./steps/StatsStep";
import type { Character, ValidationError, WizardStep } from "./types";

const STEP_STORAGE_KEY = "cp2020_step_v1";

const WIZARD_STEPS: { step: WizardStep; label: string; short: string }[] = [
  { step: 1, label: "1. Identity", short: "Identity" },
  { step: 2, label: "2. Stats", short: "Stats" },
  { step: 3, label: "3. Skills", short: "Skills" },
  { step: 4, label: "4. Lifepath", short: "Lifepath" },
  { step: 5, label: "5. Gear", short: "Gear" },
  { step: 6, label: "6. Character Sheet", short: "Sheet" },
];

const SAMPLE_CHARACTERS: Character[] = sampleCharacters;

function getInitialCharacter(): { character: Character; step: WizardStep } {
  try {
    const saved = loadCharacterFromStorage();
    if (saved) {
      const savedStepRaw = window.localStorage.getItem(STEP_STORAGE_KEY);
      const parsedStep = Number(savedStepRaw);
      const step: WizardStep =
        parsedStep >= 1 && parsedStep <= 6 ? (parsedStep as WizardStep) : 6;
      return { character: saved, step };
    }
  } catch {
    // Ignore malformed local storage on boot and fall back to fresh blank character
  }
  return { character: createBlankCharacter(createRng()), step: 1 };
}

export function App() {
  const initial = useMemo(() => getInitialCharacter(), []);
  const [character, setCharacter] = useState<Character>(initial.character);
  const [step, setStep] = useState<WizardStep>(initial.step);
  const [stepErrors, setStepErrors] = useState<ValidationError[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [primaryWeaponId, setPrimaryWeaponId] = useState<string | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCharacterChange = useCallback((nextRaw: Character) => {
    setCharacter((prev) => reconcileCharacter(prev, nextRaw));
    setStepErrors([]);
    setStatusMessage(null);
  }, []);

  const allStepErrors = useMemo(() => validateCharacter(character), [character]);

  const goToStep = useCallback(
    (target: WizardStep) => {
      if (target <= step) {
        setStepErrors([]);
        if (target !== 5) setPreviewItemId(null);
        setStep(target);
        return;
      }
      for (let s = step; s < target; s += 1) {
        const errs = validateStep(s as WizardStep, character);
        if (errs.length > 0) {
          setStep(s as WizardStep);
          setStepErrors(errs);
          return;
        }
      }
      setStepErrors([]);
      if (target !== 5) setPreviewItemId(null);
      setStep(target);
    },
    [character, step],
  );

  const handleNext = useCallback(() => {
    const errs = validateStep(step, character);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    if (step < 6) {
      const nextStep = (step + 1) as WizardStep;
      if (nextStep !== 5) setPreviewItemId(null);
      setStep(nextStep);
    }
  }, [character, step]);

  const handleBack = useCallback(() => {
    setStepErrors([]);
    if (step > 1) {
      const prevStep = (step - 1) as WizardStep;
      if (prevStep !== 5) setPreviewItemId(null);
      setStep(prevStep);
    }
  }, [step]);

  const handleRandomizeAll = useCallback(() => {
    const randomized = randomizeCharacter(createRng());
    setCharacter(randomized);
    setStepErrors([]);
    setImportError(null);
    setPrimaryWeaponId(null);
    setPreviewItemId(null);
    setStatusMessage("Generated full random character.");
    setSelectedSample("");
    setStep(6);
  }, []);

  const handleReset = useCallback(() => {
    setCharacter(createBlankCharacter(createRng()));
    setStep(1);
    setStepErrors([]);
    setImportError(null);
    setPrimaryWeaponId(null);
    setPreviewItemId(null);
    setStatusMessage(null);
    setSelectedSample("");
  }, []);

  const handleLoadSample = useCallback((roleId: string) => {
    setSelectedSample(roleId);
    if (!roleId) return;
    const found = SAMPLE_CHARACTERS.find((c) => c.identity.roleId === roleId);
    if (!found) return;
    setCharacter(structuredClone(found));
    setStepErrors([]);
    setImportError(null);
    setPrimaryWeaponId(null);
    setPreviewItemId(null);
    setStatusMessage(`Loaded sample character: ${found.identity.handle}`);
    setStep(6);
  }, []);

  const handleSave = useCallback(() => {
    saveCharacterToStorage(character);
    window.localStorage.setItem(STEP_STORAGE_KEY, String(step));
    setImportError(null);
    setStatusMessage(`Saved "${character.identity.handle || "Unnamed"}" to localStorage.`);
  }, [character, step]);

  const handleLoad = useCallback(() => {
    try {
      const loaded = loadCharacterFromStorage();
      if (!loaded) {
        setImportError("No saved character found in localStorage.");
        return;
      }
      setCharacter(loaded);
      setStepErrors([]);
      setImportError(null);
      setStatusMessage(`Loaded "${loaded.identity.handle || "Unnamed"}" from localStorage.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to load saved character.");
    }
  }, []);

  const handleExport = useCallback(() => {
    const payload = serializeCharacter(character);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (character.identity.handle || "edgerunner")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_");
    a.href = url;
    a.download = `cp2020_${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage("Exported character JSON.");
    return payload;
  }, [character]);

  const handleImport = useCallback((rawJson: string) => {
    try {
      const imported = deserializeCharacter(rawJson);
      setCharacter(imported);
      setStepErrors([]);
      setImportError(null);
      setStatusMessage(`Imported "${imported.identity.handle || "Unnamed"}" successfully.`);
      setStep(6);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import JSON.");
    }
  }, []);

  const handleDownloadPortrait = useCallback(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const slug = (character.identity.handle || "edgerunner")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_");
    a.href = url;
    a.download = `cp2020_${slug}_pixel.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [character.identity.handle]);

  const activeRole = rolesById[character.identity.roleId];

  return (
    <div className="app-root">
      <header className="app-header hud-panel">
        <div className="app-brand">
          <span className="brand-chip">CP2020 // CHARGEN v1</span>
          <h1 className="app-title">Cyberpunk 2020 Character Forge</h1>
          <p className="app-subtitle">
            Role: <strong>{activeRole?.name ?? character.identity.roleId}</strong>
            {character.identity.handle ? ` · Handle: ${character.identity.handle}` : ""}
          </p>
        </div>

        <div className="header-actions">
          <div className="sample-picker-wrap">
            <label htmlFor="sample-picker" className="sr-only">
              Load sample character
            </label>
            <select
              id="sample-picker"
              data-testid="sample-picker"
              className="hud-select"
              value={selectedSample}
              onChange={(e) => handleLoadSample(e.target.value)}
            >
              <option value="">Load sample preset...</option>
              {SAMPLE_CHARACTERS.map((sample) => (
                <option key={sample.identity.roleId} value={sample.identity.roleId}>
                  {sample.identity.handle} ({rolesById[sample.identity.roleId]?.name ?? sample.identity.roleId})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="hud-btn hud-btn--accent"
            data-testid="btn-randomize-all"
            onClick={handleRandomizeAll}
          >
            Randomize All
          </button>

          <button
            type="button"
            className="hud-btn hud-btn--ghost"
            data-testid="btn-reset"
            onClick={handleReset}
          >
            New / Reset
          </button>
        </div>
      </header>

      <nav className="wizard-stepper" aria-label="Wizard steps">
        {WIZARD_STEPS.map((item) => {
          const isActive = item.step === step;
          const hasErrors = item.step < 6 && allStepErrors[item.step].length > 0;
          return (
            <button
              key={item.step}
              type="button"
              data-testid={`step-tab-${item.step}`}
              className={`step-tab ${isActive ? "is-active" : ""} ${
                hasErrors ? "has-warning" : "is-valid"
              }`}
              aria-current={isActive ? "step" : undefined}
              onClick={() => goToStep(item.step)}
            >
              <span className="step-num">0{item.step}</span>
              <span className="step-name">{item.short}</span>
            </button>
          );
        })}
      </nav>

      <div className={`app-shell ${step === 6 ? "app-shell--sheet" : ""}`}>
        <main className="wizard-main hud-panel">
          <StepErrors errors={stepErrors} />

          {step === 1 && (
            <IdentityStep character={character} onChange={handleCharacterChange} />
          )}
          {step === 2 && (
            <StatsStep character={character} onChange={handleCharacterChange} />
          )}
          {step === 3 && (
            <SkillsStep character={character} onChange={handleCharacterChange} />
          )}
          {step === 4 && (
            <LifepathStep character={character} onChange={handleCharacterChange} />
          )}
          {step === 5 && (
            <GearStep
              character={character}
              onChange={handleCharacterChange}
              previewItemId={previewItemId}
              onPreviewItem={setPreviewItemId}
              primaryWeaponId={primaryWeaponId}
              onSelectPrimaryWeapon={setPrimaryWeaponId}
            />
          )}
          {step === 6 && (
            <CharacterSheetStep
              character={character}
              onEditStep={goToStep}
              onSave={handleSave}
              onLoad={handleLoad}
              onImport={handleImport}
              onExport={handleExport}
              onDownloadPortrait={handleDownloadPortrait}
              statusMessage={statusMessage}
              importError={importError}
            />
          )}

          <footer className="wizard-footer">
            <button
              type="button"
              className="hud-btn hud-btn--ghost"
              data-testid="btn-back"
              disabled={step === 1}
              onClick={handleBack}
            >
              ← Back
            </button>

            <div className="footer-step-indicator">
              STEP {step} / 6
            </div>

            {step < 6 ? (
              <button
                type="button"
                className="hud-btn hud-btn--primary"
                data-testid="btn-next"
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="hud-btn hud-btn--primary"
                onClick={handleSave}
              >
                Quick Save
              </button>
            )}
          </footer>
        </main>

        <div className="pixel-dock-column">
          <PixelAvatarDock
            character={character}
            onChange={handleCharacterChange}
            primaryWeaponId={primaryWeaponId}
            previewItemId={previewItemId}
            onSelectPrimaryWeapon={setPrimaryWeaponId}
            onClearPreview={() => setPreviewItemId(null)}
            onCanvasReady={(canvas) => {
              avatarCanvasRef.current = canvas;
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
