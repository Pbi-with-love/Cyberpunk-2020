import { useId } from "react";
import { cyberwareById, rolesById } from "../../data";
import {
  CLOTHES_COLORS,
  HAIR_COLORS,
  SKIN_TONES,
  applyCyberware,
  deriveAppearanceFromCharacter,
  getStyleEntries,
} from "../../rules";
import type {
  Character,
  CharacterAppearance,
  ClothesColorId,
  HairColorId,
  SkinToneId,
} from "../../types";
import { PixelAvatarCanvas } from "./PixelAvatarCanvas";
import {
  CLOTHES_PALETTES,
  HAIR_PALETTES,
  ROLE_VISUALS,
  SKIN_PALETTES,
  getBodyBuildInfo,
} from "./pixelPalettes";
import "./PixelAvatar.css";

export interface PixelAvatarDockProps {
  character: Character;
  onChange: (next: Character) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

export function PixelAvatarDock({
  character,
  onChange,
  onCanvasReady,
}: PixelAvatarDockProps) {
  const hairSelectId = useId();
  const clothesSelectId = useId();

  const role = rolesById[character.identity.roleId];
  const roleVisual = ROLE_VISUALS[character.identity.roleId] ?? ROLE_VISUALS.solo;
  const derivedAppearance = deriveAppearanceFromCharacter(
    character.identity.roleId,
    character.lifepath.style,
    character.appearance,
  );
  const appearance: CharacterAppearance = {
    skinTone: character.appearance?.skinTone ?? derivedAppearance.skinTone,
    hairStyle: character.appearance?.hairStyle ?? derivedAppearance.hairStyle,
    hairColor: character.appearance?.hairColor ?? derivedAppearance.hairColor,
    clothesStyle: character.appearance?.clothesStyle ?? derivedAppearance.clothesStyle,
    clothesColor: character.appearance?.clothesColor ?? derivedAppearance.clothesColor,
  };

  const hairEntries = getStyleEntries("hair");
  const clothesEntries = getStyleEntries("clothes");
  const buildInfo = getBodyBuildInfo(character.stats.values.BODY);
  const cyberStatus = applyCyberware(character.stats.values.EMP, character.gear.items);
  const cyberwareCount = character.gear.items.filter(
    (item) => Boolean(cyberwareById[item.itemId]),
  ).length;

  const updateAppearance = (patch: Partial<CharacterAppearance>) => {
    onChange({
      ...character,
      appearance: {
        ...appearance,
        ...patch,
      },
    });
  };

  const handleHairStyleChange = (rollValue: number) => {
    const entry = hairEntries.find((e) => e.roll === rollValue);
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        style: {
          ...character.lifepath.style,
          hair: entry?.text ?? character.lifepath.style.hair ?? "",
        },
      },
      appearance: {
        ...appearance,
        hairStyle: rollValue,
      },
    });
  };

  const handleClothesStyleChange = (rollValue: number) => {
    const entry = clothesEntries.find((e) => e.roll === rollValue);
    onChange({
      ...character,
      lifepath: {
        ...character.lifepath,
        style: {
          ...character.lifepath.style,
          clothes: entry?.text ?? character.lifepath.style.clothes ?? "",
        },
      },
      appearance: {
        ...appearance,
        clothesStyle: rollValue,
      },
    });
  };

  const displayHandle = character.identity.handle.trim() || "UNREGISTERED";
  const roleTitle = role?.name ?? "Edgerunner";

  return (
    <aside
      data-testid="pixel-avatar-dock"
      className="pixel-dock"
      aria-label="Character pixel avatar preview and customization"
    >
      <header className="pixel-dock__header">
        <div className="pixel-dock__identity">
          <span className="pixel-dock__eyebrow">BIOMETRIC FEED // {roleVisual?.tag ?? "RUNNER"}</span>
          <h2 className="pixel-dock__handle">{displayHandle}</h2>
        </div>
        <div className="pixel-dock__badges">
          <span className="pixel-dock__role-badge">{roleTitle}</span>
          {cyberStatus.cyberpsychosis ? (
            <span className="pixel-dock__status pixel-dock__status--danger">
              PSYCHOSIS RISK
            </span>
          ) : (
            <span className="pixel-dock__status">
              HUM {cyberStatus.humanity}
            </span>
          )}
        </div>
      </header>

      <div className="pixel-dock__stage">
        <span className="pixel-dock__corner pixel-dock__corner--tl" aria-hidden="true" />
        <span className="pixel-dock__corner pixel-dock__corner--tr" aria-hidden="true" />
        <span className="pixel-dock__corner pixel-dock__corner--bl" aria-hidden="true" />
        <span className="pixel-dock__corner pixel-dock__corner--br" aria-hidden="true" />
        <PixelAvatarCanvas
          character={character}
          width={256}
          height={384}
          testId="pixel-avatar-canvas"
          onCanvasReady={onCanvasReady}
        />
      </div>

      <div className="pixel-dock__readout" aria-label="Character visual summary">
        <span className="pixel-dock__chip">
          BODY {character.stats.values.BODY} ({buildInfo.label})
        </span>
        <span className="pixel-dock__chip">
          CYBER {cyberwareCount}
        </span>
        {character.lifepath.style.affectation ? (
          <span className="pixel-dock__chip pixel-dock__chip--wide">
            {character.lifepath.style.affectation}
          </span>
        ) : null}
      </div>

      <div className="pixel-dock__controls">
        <div className="pixel-dock__group">
          <span className="pixel-dock__label">Skin Tone</span>
          <div
            data-testid="appearance-skin"
            className="pixel-dock__swatches"
            role="group"
            aria-label="Skin tone"
          >
            {SKIN_TONES.map((tone: SkinToneId) => {
              const palette = SKIN_PALETTES[tone];
              const selected = appearance.skinTone === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  data-testid={`skin-${tone}`}
                  className={
                    selected
                      ? "pixel-swatch pixel-swatch--selected"
                      : "pixel-swatch"
                  }
                  style={{ backgroundColor: palette.swatch }}
                  aria-label={`Skin tone: ${palette.label}`}
                  aria-pressed={selected}
                  title={palette.label}
                  onClick={() => updateAppearance({ skinTone: tone })}
                />
              );
            })}
          </div>
        </div>

        <div className="pixel-dock__group">
          <label className="pixel-dock__label" htmlFor={hairSelectId}>
            Hairstyle
          </label>
          <select
            id={hairSelectId}
            data-testid="appearance-hair-style"
            className="pixel-dock__select"
            value={appearance.hairStyle}
            onChange={(e) => handleHairStyleChange(Number(e.target.value))}
          >
            {hairEntries.map((entry) => (
              <option key={entry.roll} value={entry.roll}>
                {entry.roll}. {entry.text}
              </option>
            ))}
          </select>
        </div>

        <div className="pixel-dock__group">
          <span className="pixel-dock__label">Hair Color</span>
          <div
            data-testid="appearance-hair-color"
            className="pixel-dock__swatches"
            role="group"
            aria-label="Hair color"
          >
            {HAIR_COLORS.map((color: HairColorId) => {
              const palette = HAIR_PALETTES[color];
              const selected = appearance.hairColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  data-testid={`hair-color-${color}`}
                  className={
                    selected
                      ? "pixel-swatch pixel-swatch--selected"
                      : "pixel-swatch"
                  }
                  style={{ backgroundColor: palette.swatch }}
                  aria-label={`Hair color: ${palette.label}`}
                  aria-pressed={selected}
                  title={palette.label}
                  onClick={() => updateAppearance({ hairColor: color })}
                />
              );
            })}
          </div>
        </div>

        <div className="pixel-dock__group">
          <label className="pixel-dock__label" htmlFor={clothesSelectId}>
            Clothes Style
          </label>
          <select
            id={clothesSelectId}
            data-testid="appearance-clothes-style"
            className="pixel-dock__select"
            value={appearance.clothesStyle}
            onChange={(e) => handleClothesStyleChange(Number(e.target.value))}
          >
            {clothesEntries.map((entry) => (
              <option key={entry.roll} value={entry.roll}>
                {entry.roll}. {entry.text}
              </option>
            ))}
          </select>
        </div>

        <div className="pixel-dock__group">
          <span className="pixel-dock__label">Outfit Palette</span>
          <div
            data-testid="appearance-clothes-color"
            className="pixel-dock__swatches"
            role="group"
            aria-label="Outfit palette"
          >
            {CLOTHES_COLORS.map((color: ClothesColorId) => {
              const option = CLOTHES_PALETTES[color];
              const selected = appearance.clothesColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  data-testid={`clothes-color-${color}`}
                  className={
                    selected
                      ? "pixel-swatch pixel-swatch--selected"
                      : "pixel-swatch"
                  }
                  style={{
                    background: `linear-gradient(135deg, ${option.swatch} 60%, ${option.swatchAccent} 100%)`,
                  }}
                  aria-label={`Outfit palette: ${option.label}`}
                  aria-pressed={selected}
                  title={option.label}
                  onClick={() => updateAppearance({ clothesColor: color })}
                />
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
