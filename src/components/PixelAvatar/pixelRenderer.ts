import { armorById, cyberwareById, weaponsById } from "../../data";
import { deriveAppearanceFromCharacter } from "../../rules";
import type { Character, CharacterAppearance } from "../../types";
import {
  drawArmorIcon,
  drawCharacterArmArmor,
  drawCharacterHeadArmor,
  drawCharacterLegArmor,
  drawCharacterTorsoArmor,
} from "./pixelArmor";
import {
  drawCharacterHeadCyberware,
  drawCharacterLimbCyberware,
  drawCharacterTorsoCyberware,
  drawCyberwareIcon,
} from "./pixelCyberware";
import { ICON_GRID, LOGICAL_HEIGHT, LOGICAL_WIDTH, PixelGrid } from "./pixelGrid";
import {
  getBodyBuildInfo,
  getHairPalette,
  getRoleVisual,
  getSkinPalette,
  resolveOutfitPalette,
  type HairPalette,
  type OutfitPalette,
  type RoleVisualTheme,
  type SkinPalette,
} from "./pixelPalettes";
import {
  drawBackWeapons,
  drawCharacterWeapons,
  drawWeaponIcon,
} from "./pixelWeapons";

export interface RenderCharacterOptions {
  frame?: number;
  width?: number;
  height?: number;
  primaryWeaponId?: string | null;
  previewItemId?: string | null;
}

interface GearSummary {
  weaponIds: string[];
  armorIds: Set<string>;
  cyberIds: Set<string>;
  cyberarmCount: number;
  cyberlegCount: number;
  primaryWeaponId: string | null;
}

function summarizeGear(
  character: Character,
  primaryWeaponId?: string | null,
  previewItemId?: string | null,
): GearSummary {
  const weaponIds: string[] = [];
  const armorIds = new Set<string>();
  const cyberIds = new Set<string>();
  let cyberarmCount = 0;
  let cyberlegCount = 0;

  for (const item of character.gear.items) {
    const id = item.itemId;
    if (weaponsById[id]) {
      weaponIds.push(id);
    } else if (armorById[id]) {
      armorIds.add(id);
    } else if (cyberwareById[id]) {
      cyberIds.add(id);
      if (id === "cyberarm") cyberarmCount += 1;
      if (id === "cyberleg") cyberlegCount += 1;
    }
  }

  let effectivePrimary: string | null = primaryWeaponId ?? null;

  if (previewItemId) {
    if (weaponsById[previewItemId]) {
      if (!weaponIds.includes(previewItemId)) {
        weaponIds.push(previewItemId);
      }
      effectivePrimary = previewItemId;
    } else if (armorById[previewItemId]) {
      armorIds.add(previewItemId);
    } else if (cyberwareById[previewItemId]) {
      cyberIds.add(previewItemId);
      if (previewItemId === "cyberarm" && cyberarmCount === 0) {
        cyberarmCount = 1;
      }
      if (previewItemId === "cyberleg" && cyberlegCount === 0) {
        cyberlegCount = 1;
      }
    }
  }

  return {
    weaponIds,
    armorIds,
    cyberIds,
    cyberarmCount,
    cyberlegCount,
    primaryWeaponId: effectivePrimary,
  };
}

interface AffectationFlags {
  mirrorshades: boolean;
  tattoos: boolean;
  chewing: boolean;
  cyberlimb: boolean;
  earring: boolean;
  gloves: boolean;
  subdermal: boolean;
}

function parseAffectations(character: Character): AffectationFlags {
  const raw = (character.lifepath.style.affectation ?? "").toLowerCase();
  return {
    mirrorshades: raw.includes("mirrorshade") || raw.includes("shades") || raw.includes("glasses"),
    tattoos: raw.includes("tattoo"),
    chewing: raw.includes("chew"),
    cyberlimb: raw.includes("cyberlimb") || raw.includes("cyber arm"),
    earring: raw.includes("earring"),
    gloves: raw.includes("glove"),
    subdermal: raw.includes("subdermal") || raw.includes("glowing"),
  };
}

function resolveAppearance(character: Character): CharacterAppearance {
  const derived = deriveAppearanceFromCharacter(
    character.identity.roleId,
    character.lifepath.style,
    character.appearance,
  );
  return {
    skinTone: character.appearance?.skinTone ?? derived.skinTone,
    hairStyle: character.appearance?.hairStyle ?? derived.hairStyle,
    hairColor: character.appearance?.hairColor ?? derived.hairColor,
    clothesStyle: character.appearance?.clothesStyle ?? derived.clothesStyle,
    clothesColor: character.appearance?.clothesColor ?? derived.clothesColor,
  };
}

function drawStageBackground(
  g: PixelGrid,
  role: RoleVisualTheme,
  pulse: boolean,
): void {
  g.rect(0, 0, LOGICAL_WIDTH, 12, "#070912");
  g.rect(0, 12, LOGICAL_WIDTH, 12, "#0b0f1d");
  g.rect(0, 24, LOGICAL_WIDTH, 10, "#10162b");

  // Distant dark megacity skyline silhouette
  g.rect(1, 26, 4, 8, "#151d36");
  g.rect(6, 22, 3, 12, "#131930");
  g.rect(23, 21, 4, 13, "#131930");
  g.rect(28, 25, 3, 9, "#151d36");
  g.px(7, 24, "#243054");
  g.px(25, 24, "#243054");
  g.px(2, 28, role.auraSoft);
  g.px(29, 27, role.auraSoft);

  // Subtle role aura glow behind character
  g.rect(10, 9, 12, 24, role.auraSoft);
  g.rect(12, 7, 8, 26, role.auraSoft);

  // Neon horizon bar
  g.hline(0, 33, LOGICAL_WIDTH, role.auraSoft);
  g.hline(0, 34, LOGICAL_WIDTH, role.aura);

  // Perspective cyber grid floor
  g.rect(0, 35, LOGICAL_WIDTH, 13, "#080b14");
  g.hline(0, 36, LOGICAL_WIDTH, "#162038");
  g.hline(0, 39, LOGICAL_WIDTH, "#1b2745");
  g.hline(0, 43, LOGICAL_WIDTH, "#223157");

  g.line(12, 35, 3, 47, "#16213b");
  g.line(19, 35, 28, 47, "#16213b");
  g.line(8, 35, 0, 42, "#131b30");
  g.line(23, 35, 31, 42, "#131b30");

  // Ground shadow under boots
  g.hline(10, 43, 12, "#05070d");
  g.hline(11, 44, 10, "#04050a");

  // Corner HUD bracket ticks
  const hud = "#294666";
  g.hline(1, 1, 3, hud);
  g.vline(1, 1, 3, hud);
  g.hline(28, 1, 3, hud);
  g.vline(30, 1, 3, hud);
  g.hline(1, 46, 3, hud);
  g.vline(1, 44, 3, hud);
  g.hline(28, 46, 3, hud);
  g.vline(30, 44, 3, hud);

  // Live status LED pixel in top-right HUD corner
  g.px(29, 2, pulse ? role.visorGlow : role.aura);
}

function drawBackHair(
  g: PixelGrid,
  hairStyle: number,
  hair: HairPalette,
  bobY: number,
  pulse: boolean,
): void {
  if (hairStyle === 3) {
    g.rect(10, 8 + bobY, 12, 11, hair.shadow);
    g.vline(10, 10 + bobY, 10, hair.outline);
    g.vline(21, 10 + bobY, 10, hair.outline);
    g.px(11, 19 + bobY, hair.base);
    g.px(20, 19 + bobY, hair.base);
    g.px(11, 21 + bobY, hair.shadow);
    g.px(20, 21 + bobY, hair.shadow);
  } else if (hairStyle === 6) {
    g.rect(10, 9 + bobY, 2, 11, hair.shadow);
    g.rect(20, 9 + bobY, 2, 11, hair.shadow);
    g.px(10, 15 + bobY, pulse ? "#00f0ff" : "#ffaa00");
    g.px(21, 16 + bobY, pulse ? "#ff2e97" : "#00f0ff");
    g.px(11, 19 + bobY, "#00f0ff");
    g.px(20, 19 + bobY, "#ffaa00");
  } else if (hairStyle === 10) {
    g.rect(11, 9 + bobY, 10, 7, hair.shadow);
  }
}

function drawBackCoatAndWeapons(
  g: PixelGrid,
  roleId: string,
  outfit: OutfitPalette,
  gear: GearSummary,
  bobY: number,
): void {
  if (roleId === "media" || roleId === "nomad" || roleId === "fixer" || roleId === "medtechie") {
    g.rect(11, 28 + bobY, 10, 8, outfit.primaryShadow);
    g.vline(10, 29 + bobY, 7, outfit.outline);
    g.vline(21, 29 + bobY, 7, outfit.outline);
    g.hline(11, 35 + bobY, 10, outfit.outline);
  }

  drawBackWeapons(g, {
    weaponIds: gear.weaponIds,
    primaryWeaponId: gear.primaryWeaponId,
    roleId,
    bobY,
  });
}

function drawLegsAndBoots(
  g: PixelGrid,
  leftX: number,
  rightX: number,
  legW: number,
  skin: SkinPalette,
  outfit: OutfitPalette,
  clothesStyle: number,
  gear: GearSummary,
  pulse: boolean,
): void {
  g.rect(leftX, 29, legW, 10, outfit.secondary);
  g.rect(rightX, 29, legW, 10, outfit.secondary);
  g.vline(leftX + legW - 1, 30, 9, outfit.secondaryShadow);
  g.vline(rightX, 30, 9, outfit.secondaryShadow);

  if (clothesStyle === 1) {
    g.px(leftX + 1, 34, skin.base);
    g.px(rightX + legW - 2, 32, outfit.accent);
  } else if (clothesStyle === 3) {
    g.vline(leftX - 1, 33, 3, outfit.secondaryShadow);
    g.vline(rightX + legW, 33, 3, outfit.secondaryShadow);
  } else if (clothesStyle === 4) {
    const stripe = pulse ? outfit.accentGlow : outfit.accent;
    g.vline(leftX, 30, 8, stripe);
    g.vline(rightX + legW - 1, 30, 8, stripe);
  } else if (clothesStyle === 5) {
    g.px(leftX, 31, "#cbd5e1");
    g.px(leftX + 1, 32, "#cbd5e1");
  }

  drawCharacterLegArmor(g, {
    armorIds: gear.armorIds,
    leftX,
    rightX,
    legW,
    pulse,
  });

  const hasFullArmor = gear.armorIds.has("full_body_armor");
  const bootBase = hasFullArmor ? "#2d3748" : "#1a1e29";
  const bootHi = hasFullArmor ? "#64748b" : "#3a4254";
  g.rect(leftX, 39, legW, 4, bootBase);
  g.rect(rightX, 39, legW, 4, bootBase);
  g.hline(leftX, 39, legW, outfit.accent);
  g.hline(rightX, 39, legW, outfit.accent);
  g.px(leftX, 41, bootHi);
  g.px(rightX + legW - 1, 41, bootHi);
  g.hline(leftX - 1, 43, legW + 1, "#090b10");
  g.hline(rightX, 43, legW + 1, "#090b10");
}

function drawTorsoAndOutfit(
  g: PixelGrid,
  roleId: string,
  torsoHalf: number,
  skin: SkinPalette,
  outfit: OutfitPalette,
  clothesStyle: number,
  gear: GearSummary,
  bobY: number,
  pulse: boolean,
): void {
  const txLeft = 16 - torsoHalf;
  const txRight = 15 + torsoHalf;
  const torsoW = torsoHalf * 2;

  g.rect(txLeft, 17 + bobY, torsoW, 13, outfit.primary);
  g.vline(txLeft, 18 + bobY, 11, outfit.primaryHighlight);
  g.vline(txRight, 18 + bobY, 11, outfit.primaryShadow);
  g.hline(txLeft, 17 + bobY, torsoW, outfit.outline);

  if (roleId === "solo") {
    g.rect(txLeft + 1, 18 + bobY, torsoW - 2, 8, outfit.primaryHighlight);
    g.hline(txLeft + 1, 22 + bobY, torsoW - 2, outfit.primaryShadow);
    g.line(txLeft, 18 + bobY, txRight, 26 + bobY, "#141820");
    g.px(15, 21 + bobY, outfit.accent);
    g.hline(txLeft, 27 + bobY, torsoW, "#14161c");
    g.px(15, 27 + bobY, "#cbd5e1");
    g.px(16, 27 + bobY, "#cbd5e1");
  } else if (roleId === "rocker") {
    g.rect(14, 18 + bobY, 4, 8, skin.base);
    g.px(14, 19 + bobY, skin.shadow);
    g.line(14, 18 + bobY, 17, 25 + bobY, "#1c1926");
    g.px(txLeft + 1, 18 + bobY, "#e2e8f0");
    g.px(txLeft + 1, 20 + bobY, "#e2e8f0");
    g.px(txRight - 1, 19 + bobY, outfit.accent);
    g.hline(txLeft, 27 + bobY, torsoW, "#121017");
    g.px(14, 27 + bobY, "#e2e8f0");
    g.px(17, 27 + bobY, "#e2e8f0");
  } else if (roleId === "netrunner") {
    const glow = pulse ? outfit.accentGlow : outfit.accent;
    g.rect(14, 18 + bobY, 4, 9, outfit.primaryShadow);
    g.vline(13, 19 + bobY, 8, glow);
    g.vline(18, 19 + bobY, 8, glow);
    g.rect(15, 20 + bobY, 2, 2, glow);
    g.hline(txLeft, 26 + bobY, torsoW, "#0b111c");
  } else if (roleId === "media") {
    g.rect(14, 18 + bobY, 4, 8, "#cfd8e3");
    g.vline(15, 19 + bobY, 6, "#2c3647");
    g.px(txRight - 2, 20 + bobY, outfit.accentGlow);
    g.px(txRight - 1, 20 + bobY, outfit.accent);
    g.hline(txLeft, 26 + bobY, torsoW, outfit.primaryShadow);
    g.px(15, 26 + bobY, "#cbd5e1");
  } else if (roleId === "nomad") {
    g.rect(14, 19 + bobY, 4, 9, outfit.secondary);
    g.rect(13, 16 + bobY, 6, 3, outfit.accent);
    g.hline(14, 18 + bobY, 4, outfit.accentGlow);
    g.hline(txLeft, 27 + bobY, torsoW, "#362517");
    g.rect(15, 27 + bobY, 2, 1, "#f5c542");
  } else if (roleId === "fixer") {
    g.rect(14, 18 + bobY, 4, 9, outfit.secondary);
    g.px(13, 17 + bobY, outfit.accent);
    g.px(18, 17 + bobY, outfit.accent);
    g.hline(14, 20 + bobY, 4, outfit.accentGlow);
    g.px(15, 21 + bobY, outfit.accent);
    g.px(16, 21 + bobY, outfit.accent);
    g.hline(txLeft, 27 + bobY, torsoW, outfit.primaryShadow);
  } else if (roleId === "cop") {
    g.rect(txLeft + 1, 18 + bobY, torsoW - 2, 7, outfit.primaryHighlight);
    g.hline(14, 18 + bobY, 4, outfit.primaryShadow);
    g.px(txLeft + 1, 20 + bobY, "#ffd13b");
    g.px(txLeft + 1, 21 + bobY, "#38a5ff");
    g.hline(txLeft, 26 + bobY, torsoW, "#0d111a");
    g.px(15, 26 + bobY, "#cbd5e1");
    g.px(txRight, 27 + bobY, "#38a5ff");
  } else if (roleId === "corporate") {
    g.rect(14, 18 + bobY, 4, 4, "#f1f5f9");
    g.vline(15, 19 + bobY, 6, outfit.accent);
    g.vline(16, 19 + bobY, 6, outfit.accent);
    g.px(14, 22 + bobY, "#cbd5e1");
    g.px(17, 22 + bobY, "#cbd5e1");
    g.px(txRight - 2, 20 + bobY, outfit.accentGlow);
  } else if (roleId === "techie") {
    g.rect(13, 18 + bobY, 6, 2, outfit.secondary);
    g.rect(13, 20 + bobY, 6, 9, outfit.primary);
    g.vline(13, 18 + bobY, 8, outfit.accent);
    g.vline(18, 18 + bobY, 8, outfit.accent);
    g.px(txLeft + 1, 22 + bobY, "#cbd5e1");
    g.px(txLeft + 1, 23 + bobY, "#f59e0b");
    g.hline(txLeft, 27 + bobY, torsoW, "#292017");
  } else if (roleId === "medtechie") {
    g.rect(14, 18 + bobY, 4, 8, outfit.secondary);
    g.px(txRight - 2, 20 + bobY, "#ff2e4d");
    g.hline(txRight - 3, 21 + bobY, 3, "#ff2e4d");
    g.px(txRight - 2, 22 + bobY, "#ff2e4d");
    g.hline(txLeft, 27 + bobY, torsoW, "#475569");
  }

  if (clothesStyle === 1) {
    g.px(txLeft + 1, 25 + bobY, outfit.accent);
    g.px(txRight - 1, 28 + bobY, "#090b10");
  } else if (clothesStyle === 2 && roleId !== "corporate") {
    g.px(14, 18 + bobY, "#e2e8f0");
    g.px(17, 18 + bobY, "#e2e8f0");
  } else if (clothesStyle === 3) {
    g.rect(txLeft + 1, 24 + bobY, 2, 2, outfit.primaryShadow);
    g.rect(txRight - 2, 24 + bobY, 2, 2, outfit.primaryShadow);
  } else if (clothesStyle === 4) {
    const neon = pulse ? outfit.accentGlow : outfit.accent;
    g.hline(txLeft, 18 + bobY, torsoW, neon);
    g.hline(txLeft, 29 + bobY, torsoW, neon);
  } else if (clothesStyle === 5) {
    g.line(txLeft, 25 + bobY, txRight, 28 + bobY, "#cbd5e1");
    g.px(txLeft, 17 + bobY, "#e2e8f0");
    g.px(txRight, 17 + bobY, "#e2e8f0");
  } else if (clothesStyle === 6) {
    g.hline(13, 17 + bobY, 6, outfit.accent);
    g.hline(txLeft, 29 + bobY, torsoW, outfit.primaryHighlight);
  } else if (clothesStyle === 7) {
    g.hline(txLeft + 1, 23 + bobY, torsoW - 2, outfit.accent);
  } else if (clothesStyle === 8) {
    g.rect(txLeft - 1, 17 + bobY, 2, 4, outfit.primaryHighlight);
    g.rect(txRight, 17 + bobY, 2, 4, outfit.primaryHighlight);
  } else if (clothesStyle === 9) {
    g.hline(14, 17 + bobY, 4, outfit.primaryHighlight);
  } else if (clothesStyle === 10) {
    g.hline(txLeft + 1, 29 + bobY, torsoW - 3, "#cbd5e1");
  }

  drawCharacterTorsoArmor(g, {
    armorIds: gear.armorIds,
    txLeft,
    txRight,
    torsoW,
    bobY,
    pulse,
  });

  drawCharacterTorsoCyberware(g, {
    cyberIds: gear.cyberIds,
    txLeft,
    txRight,
    torsoW,
    bobY,
    pulse,
  });
}

function drawHeadAndFace(
  g: PixelGrid,
  role: RoleVisualTheme,
  skin: SkinPalette,
  hair: HairPalette,
  affectations: AffectationFlags,
  gear: GearSummary,
  bobY: number,
  pulse: boolean,
): void {
  g.rect(14, 15 + bobY, 4, 3, skin.base);
  g.hline(14, 15 + bobY, 4, skin.shadow);

  g.vline(11, 10 + bobY, 3, skin.shadow);
  g.vline(20, 10 + bobY, 3, skin.shadow);

  g.hline(13, 7 + bobY, 6, skin.base);
  g.rect(12, 8 + bobY, 8, 6, skin.base);
  g.hline(13, 14 + bobY, 6, skin.base);
  g.hline(14, 15 + bobY, 4, skin.shadow);

  g.hline(14, 8 + bobY, 4, skin.highlight);
  g.px(13, 12 + bobY, skin.highlight);
  g.px(18, 12 + bobY, skin.highlight);
  g.px(13, 14 + bobY, skin.shadow);
  g.px(18, 14 + bobY, skin.shadow);

  const browColor = hair.shadow;
  g.hline(13, 9 + bobY, 2, browColor);
  g.hline(17, 9 + bobY, 2, browColor);

  g.px(13, 10 + bobY, "#f1f5f9");
  g.px(14, 10 + bobY, "#151924");
  g.px(17, 10 + bobY, "#151924");
  g.px(18, 10 + bobY, "#f1f5f9");

  g.px(16, 11 + bobY, skin.shadow);
  g.hline(15, 13 + bobY, 2, skin.shadow);

  if (affectations.tattoos) {
    g.px(13, 11 + bobY, "#1f3a52");
    g.px(12, 12 + bobY, "#1f3a52");
    g.px(14, 16 + bobY, "#1f3a52");
  }

  if (affectations.subdermal) {
    const dot = pulse ? "#00f0ff" : "#ff2e97";
    g.px(12, 11 + bobY, dot);
    g.px(19, 11 + bobY, dot);
    g.px(15, 16 + bobY, dot);
  }

  if (role.id === "netrunner") {
    g.hline(13, 10 + bobY, 6, "#082f49");
    g.hline(14, 10 + bobY, 4, pulse ? "#67f7ff" : "#00e1ff");
  } else if (
    role.id === "solo" &&
    !gear.cyberIds.has("cyberoptic") &&
    !gear.cyberIds.has("low_light") &&
    !affectations.mirrorshades
  ) {
    g.hline(16, 10 + bobY, 3, "#47111e");
    g.px(17, 10 + bobY, pulse ? "#ff6685" : "#ff2e54");
  } else if (role.id === "techie") {
    g.hline(12, 8 + bobY, 8, "#473522");
    g.rect(13, 8 + bobY, 2, 2, "#00e1ff");
    g.rect(17, 8 + bobY, 2, 2, "#00e1ff");
    g.hline(15, 8 + bobY, 2, "#94a3b8");
  }

  drawCharacterHeadCyberware(g, {
    cyberIds: gear.cyberIds,
    bobY,
    pulse,
  });

  if (affectations.mirrorshades) {
    g.hline(13, 10 + bobY, 6, "#0f172a");
    g.px(14, 10 + bobY, "#38bdf8");
    g.px(17, 10 + bobY, "#e0f2fe");
  }

  if (affectations.chewing) {
    g.px(17, 13 + bobY, "#e2e8f0");
    g.px(18, 14 + bobY, "#cbd5e1");
  }

  if (affectations.earring) {
    g.px(11, 13 + bobY, "#f5c542");
    g.px(11, 14 + bobY, "#00f0ff");
  }
}

function drawHairAndHeadgear(
  g: PixelGrid,
  roleId: string,
  hairStyle: number,
  hair: HairPalette,
  skin: SkinPalette,
  gear: GearSummary,
  bobY: number,
  pulse: boolean,
): void {
  const coveredByHelmet = drawCharacterHeadArmor(g, {
    armorIds: gear.armorIds,
    bobY,
    pulse,
  });
  if (coveredByHelmet) return;

  switch (hairStyle) {
    case 1: {
      g.hline(14, 7 + bobY, 4, skin.highlight);
      g.px(13, 8 + bobY, skin.shadow);
      g.px(18, 8 + bobY, skin.shadow);
      break;
    }
    case 2: {
      g.rect(15, 2 + bobY, 2, 6, hair.base);
      g.rect(14, 4 + bobY, 4, 4, hair.base);
      g.vline(15, 2 + bobY, 4, hair.highlight);
      g.px(16, 2 + bobY, hair.highlight);
      g.hline(14, 8 + bobY, 4, hair.shadow);
      break;
    }
    case 3: {
      g.rect(12, 5 + bobY, 8, 4, hair.base);
      g.hline(13, 5 + bobY, 6, hair.highlight);
      g.px(11, 7 + bobY, hair.base);
      g.px(20, 7 + bobY, hair.base);
      g.px(12, 9 + bobY, hair.shadow);
      g.px(19, 9 + bobY, hair.shadow);
      break;
    }
    case 4: {
      g.hline(13, 5 + bobY, 6, hair.highlight);
      g.rect(12, 6 + bobY, 8, 2, hair.base);
      g.hline(12, 8 + bobY, 8, hair.shadow);
      break;
    }
    case 5: {
      g.hline(13, 5 + bobY, 6, hair.base);
      g.rect(12, 6 + bobY, 8, 3, hair.shadow);
      g.hline(14, 6 + bobY, 4, hair.highlight);
      g.px(12, 9 + bobY, hair.shadow);
      g.px(19, 9 + bobY, hair.shadow);
      break;
    }
    case 6: {
      g.rect(12, 6 + bobY, 8, 3, hair.base);
      g.px(13, 6 + bobY, hair.highlight);
      g.px(15, 6 + bobY, hair.highlight);
      g.px(17, 6 + bobY, hair.highlight);
      g.vline(11, 8 + bobY, 5, hair.base);
      g.vline(20, 8 + bobY, 5, hair.base);
      break;
    }
    case 7: {
      g.rect(12, 5 + bobY, 7, 3, hair.base);
      g.hline(13, 5 + bobY, 5, hair.highlight);
      g.rect(12, 8 + bobY, 4, 2, hair.base);
      g.px(12, 10 + bobY, hair.shadow);
      g.px(19, 7 + bobY, skin.shadow);
      break;
    }
    case 8: {
      g.hline(13, 6 + bobY, 6, "#cbd5e1");
      g.rect(12, 7 + bobY, 8, 2, "#94a3b8");
      g.hline(14, 6 + bobY, 3, "#f8fafc");
      g.px(12, 8 + bobY, hair.base);
      g.px(19, 8 + bobY, hair.base);
      break;
    }
    case 9: {
      g.px(12, 4 + bobY, hair.base);
      g.px(15, 4 + bobY, hair.highlight);
      g.px(18, 4 + bobY, hair.base);
      g.rect(12, 5 + bobY, 8, 4, hair.base);
      g.px(11, 7 + bobY, hair.shadow);
      g.px(20, 6 + bobY, hair.shadow);
      g.px(14, 9 + bobY, hair.shadow);
      break;
    }
    case 10:
    default: {
      g.hline(13, 5 + bobY, 6, hair.base);
      g.rect(12, 6 + bobY, 8, 3, hair.base);
      g.hline(13, 6 + bobY, 6, hair.highlight);
      g.vline(11, 7 + bobY, 4, hair.shadow);
      g.vline(20, 7 + bobY, 4, hair.shadow);
      break;
    }
  }

  if (roleId === "cop") {
    g.hline(13, 4 + bobY, 6, "#0f1a2e");
    g.rect(12, 5 + bobY, 8, 3, "#1b2e4d");
    g.px(15, 6 + bobY, "#ffd13b");
    g.px(16, 6 + bobY, "#ffd13b");
    g.hline(12, 8 + bobY, 8, "#090e1a");
  }
}

function drawArmsAndProps(
  g: PixelGrid,
  roleId: string,
  torsoHalf: number,
  leftLegX: number,
  rightLegX: number,
  legW: number,
  skin: SkinPalette,
  outfit: OutfitPalette,
  affectations: AffectationFlags,
  gear: GearSummary,
  bobY: number,
  pulse: boolean,
): void {
  const txLeft = 16 - torsoHalf;
  const txRight = 15 + torsoHalf;
  const armW = torsoHalf >= 5 ? 3 : 2;
  const leftArmX = txLeft - armW;
  const rightArmX = txRight + 1;

  const effectiveArmCount = Math.max(
    gear.cyberarmCount,
    gear.cyberIds.has("cyberarm") ? 1 : 0,
  );
  const leftChrome = effectiveArmCount >= 2;
  const rightChrome = effectiveArmCount >= 1 || affectations.cyberlimb;
  const shortSleeves = roleId === "rocker" || roleId === "techie";
  const hasFullArmor = gear.armorIds.has("full_body_armor");

  const drawOrganicArm = (ax: number) => {
    const sleeveLen = shortSleeves ? 4 : 8;
    g.rect(ax, 18 + bobY, armW, sleeveLen, outfit.primaryShadow);
    g.vline(ax, 18 + bobY, sleeveLen, outfit.primary);
    if (shortSleeves) {
      g.rect(ax, 22 + bobY, armW, 5, skin.base);
    }
    const handColor =
      affectations.gloves || roleId === "techie" ? "#1e293b" : skin.base;
    g.rect(ax, 27 + bobY, armW, 2, handColor);
  };

  if (!leftChrome) drawOrganicArm(leftArmX);
  if (!rightChrome) drawOrganicArm(rightArmX);

  // Cyberlegs, cyberarms, wrist ports, biomonitor, smartgun pad, rippers & wolvers
  drawCharacterLimbCyberware(g, {
    cyberIds: gear.cyberIds,
    cyberarmCount: gear.cyberarmCount,
    cyberlegCount: gear.cyberlegCount,
    leftArmX,
    rightArmX,
    armW,
    leftLegX,
    rightLegX,
    legW,
    bobY,
    pulse,
    hasAffectationCyberlimb: affectations.cyberlimb,
  });

  // Armored sleeves, shoulder pauldrons & full-body gauntlets over base arms/shoulders
  drawCharacterArmArmor(g, {
    armorIds: gear.armorIds,
    leftArmX,
    rightArmX,
    armW,
    bobY,
    pulse,
    leftChrome,
    rightChrome,
  });

  if (affectations.gloves && !hasFullArmor) {
    g.rect(leftArmX, 27 + bobY, armW, 2, "#1e293b");
    g.rect(rightArmX, 27 + bobY, armW, 2, "#1e293b");
  }

  // Role-specific props
  if (roleId === "rocker") {
    const neckX0 = 13;
    const neckY0 = 24 + bobY;
    g.line(neckX0, neckY0, rightArmX + 2, 12 + bobY, "#cbd5e1");
    g.px(rightArmX + 2, 11 + bobY, "#f8fafc");
    g.rect(10, 23 + bobY, 5, 4, outfit.accent);
    g.rect(11, 24 + bobY, 3, 2, outfit.accentGlow);
    g.px(12, 24 + bobY, "#f8fafc");
  } else if (roleId === "solo" && gear.weaponIds.length === 0) {
    // Default iconic Solo rifle when no catalog weapon is owned yet
    const gunY = 25 + bobY;
    g.hline(leftArmX - 2, gunY, txRight - leftArmX + 4, "#1e293b");
    g.hline(leftArmX, gunY - 1, 7, "#475569");
    g.px(leftArmX - 2, gunY, "#94a3b8");
    g.px(15, gunY + 1, "#334155");
    g.px(17, gunY - 1, pulse ? "#ff2e54" : "#991b1b");
  } else if (roleId === "netrunner") {
    g.rect(leftArmX - 2, 24 + bobY, 3, 3, "#1e293b");
    g.rect(leftArmX - 2, 21 + bobY, 3, 3, pulse ? "#00f0ff" : "#0284c7");
    g.px(leftArmX - 1, 22 + bobY, "#e0f2fe");
  } else if (roleId === "media") {
    g.rect(leftArmX - 1, 13 + bobY, 4, 3, "#334155");
    g.px(leftArmX - 2, 14 + bobY, "#94a3b8");
    g.px(leftArmX + 2, 13 + bobY, pulse ? "#ff2e4c" : "#7f1d1d");
    g.rect(rightArmX, 24 + bobY, 3, 3, "#0f172a");
    g.px(rightArmX + 1, 25 + bobY, "#ffaa00");
  } else if (roleId === "nomad" && gear.weaponIds.length === 0) {
    g.rect(leftArmX - 1, 25 + bobY, 2, 4, "#5c4028");
    g.px(leftArmX - 1, 24 + bobY, "#94a3b8");
  } else if (roleId === "fixer") {
    g.rect(rightArmX, 26 + bobY, 3, 2, "#1e293b");
    g.rect(rightArmX, 22 + bobY, 4, 3, pulse ? "#00f0ff" : "#0ea5e9");
    g.hline(rightArmX + 1, 23 + bobY, 2, "#fef08a");
  } else if (roleId === "cop") {
    if (gear.weaponIds.length === 0) {
      g.rect(leftArmX, 26 + bobY, 2, 4, "#0f172a");
      g.px(leftArmX, 25 + bobY, "#64748b");
    }
    g.vline(rightArmX + armW, 26 + bobY, 6, "#1e293b");
  } else if (roleId === "corporate") {
    g.rect(leftArmX - 2, 28 + bobY, 5, 5, "#262d3d");
    g.hline(leftArmX - 2, 28 + bobY, 5, "#94a3b8");
    g.px(leftArmX, 30 + bobY, pulse ? "#ff2e54" : "#00f0ff");
  } else if (roleId === "techie") {
    g.vline(rightArmX + 1, 16 + bobY, 12, "#94a3b8");
    g.rect(rightArmX, 15 + bobY, 3, 2, "#cbd5e1");
    g.px(rightArmX + 1, 15 + bobY, "#090b10");
    g.px(rightArmX + 1, 21 + bobY, "#f59e0b");
  } else if (roleId === "medtechie") {
    g.rect(rightArmX, 26 + bobY, 4, 5, "#f1f5f9");
    g.px(rightArmX + 2, 27 + bobY, "#ff2e4d");
    g.hline(rightArmX + 1, 28 + bobY, 3, "#ff2e4d");
    g.px(rightArmX + 2, 29 + bobY, "#ff2e4d");
    g.px(leftArmX - 1, 26 + bobY, pulse ? "#26e6b5" : "#0d9488");
  }

  // Draw owned/previewed weapons in hand and at hip/belt
  drawCharacterWeapons(g, {
    weaponIds: gear.weaponIds,
    primaryWeaponId: gear.primaryWeaponId,
    roleId,
    leftArmX,
    rightArmX,
    armW,
    txLeft,
    txRight,
    bobY,
    pulse,
    hasSmartgunLink: gear.cyberIds.has("smartgun_link"),
  });
}

export function renderPixelCharacter(
  ctx: CanvasRenderingContext2D,
  character: Character,
  options: RenderCharacterOptions = {},
): void {
  const width = options.width ?? 256;
  const height = options.height ?? 384;
  const frame = options.frame ?? 0;
  const pulse = frame % 2 === 1;
  const bobY = pulse ? 1 : 0;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);

  const g = new PixelGrid(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT, width, height);

  const role = getRoleVisual(character.identity.roleId);
  const appearance = resolveAppearance(character);
  const skin = getSkinPalette(appearance.skinTone);
  const hair = getHairPalette(appearance.hairColor);
  const outfit = resolveOutfitPalette(role.id, appearance.clothesColor);
  const build = getBodyBuildInfo(character.stats.values.BODY);
  const torsoHalf = build.tier === "slim" ? 3 : build.tier === "athletic" ? 4 : 5;
  const leftLegX = build.tier === "slim" ? 13 : build.tier === "athletic" ? 12 : 11;
  const rightLegX = 17;
  const legW = build.tier === "slim" ? 2 : build.tier === "athletic" ? 3 : 4;

  const gear = summarizeGear(
    character,
    options.primaryWeaponId,
    options.previewItemId,
  );
  const affectations = parseAffectations(character);

  drawStageBackground(g, role, pulse);
  if (!gear.armorIds.has("full_body_armor")) {
    drawBackHair(g, appearance.hairStyle, hair, bobY, pulse);
  }
  drawBackCoatAndWeapons(g, role.id, outfit, gear, bobY);
  drawLegsAndBoots(
    g,
    leftLegX,
    rightLegX,
    legW,
    skin,
    outfit,
    appearance.clothesStyle,
    gear,
    pulse,
  );
  drawTorsoAndOutfit(
    g,
    role.id,
    torsoHalf,
    skin,
    outfit,
    appearance.clothesStyle,
    gear,
    bobY,
    pulse,
  );
  drawHeadAndFace(g, role, skin, hair, affectations, gear, bobY, pulse);
  drawHairAndHeadgear(
    g,
    role.id,
    appearance.hairStyle,
    hair,
    skin,
    gear,
    bobY,
    pulse,
  );
  drawArmsAndProps(
    g,
    role.id,
    torsoHalf,
    leftLegX,
    rightLegX,
    legW,
    skin,
    outfit,
    affectations,
    gear,
    bobY,
    pulse,
  );
}

export function renderGearIcon(
  ctx: CanvasRenderingContext2D,
  itemId: string,
  size = 36,
): void {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  const g = new PixelGrid(ctx, ICON_GRID, ICON_GRID, size, size);

  if (weaponsById[itemId]) {
    drawWeaponIcon(g, itemId);
  } else if (armorById[itemId]) {
    drawArmorIcon(g, itemId);
  } else if (cyberwareById[itemId]) {
    drawCyberwareIcon(g, itemId);
  } else {
    g.rect(0, 0, ICON_GRID, ICON_GRID, "#090d18");
    g.rect(4, 4, 8, 8, "#334155");
    g.px(7, 7, "#00f0ff");
  }
}

export function renderRoleIcon(
  ctx: CanvasRenderingContext2D,
  roleId: string,
  size = 44,
): void {
  const role = getRoleVisual(roleId);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);

  const g = new PixelGrid(ctx, ICON_GRID, ICON_GRID, size, size);

  g.rect(0, 0, ICON_GRID, ICON_GRID, "#090d18");
  g.rect(1, 1, ICON_GRID - 2, ICON_GRID - 2, role.auraSoft);
  g.hline(0, 0, 3, role.aura);
  g.vline(0, 0, 3, role.aura);
  g.hline(13, 15, 3, role.aura);
  g.vline(15, 13, 3, role.aura);

  switch (roleId) {
    case "solo": {
      g.rect(4, 3, 8, 9, "#334155");
      g.hline(5, 3, 6, "#64748b");
      g.hline(4, 7, 8, "#0f172a");
      g.hline(5, 7, 6, "#ff2e54");
      g.px(8, 7, "#ffa6b8");
      g.rect(3, 12, 10, 2, "#1e293b");
      break;
    }
    case "rocker": {
      g.line(4, 11, 12, 3, "#cbd5e1");
      g.px(12, 3, "#f8fafc");
      g.rect(3, 9, 4, 4, "#ff2e97");
      g.px(2, 12, "#ff2e97");
      g.px(6, 12, "#ff2e97");
      g.px(4, 10, "#ff94ca");
      break;
    }
    case "netrunner": {
      g.rect(4, 4, 8, 7, "#16243d");
      g.hline(4, 7, 8, "#00f0ff");
      g.hline(5, 7, 6, "#b8fcff");
      g.px(3, 4, "#00f0ff");
      g.px(12, 4, "#00f0ff");
      g.px(3, 11, "#00f0ff");
      g.px(12, 11, "#00f0ff");
      break;
    }
    case "media": {
      g.rect(3, 5, 8, 6, "#334155");
      g.rect(11, 6, 2, 4, "#94a3b8");
      g.rect(5, 3, 3, 2, "#64748b");
      g.px(9, 6, "#ff2e4c");
      g.px(5, 8, "#ffaa00");
      break;
    }
    case "nomad": {
      g.rect(4, 4, 8, 8, "#5c4a35");
      g.rect(5, 5, 6, 6, "#1f1912");
      g.hline(4, 8, 8, "#e67b24");
      g.hline(6, 7, 4, "#ffd485");
      break;
    }
    case "fixer": {
      g.rect(3, 5, 10, 3, "#141021");
      g.hline(3, 5, 10, "#f5c542");
      g.px(5, 6, "#00f0ff");
      g.px(10, 6, "#00f0ff");
      g.rect(4, 10, 8, 3, "#f5c542");
      g.hline(5, 11, 6, "#fff09e");
      break;
    }
    case "cop": {
      g.rect(4, 3, 8, 8, "#1b2e4d");
      g.hline(5, 11, 6, "#1b2e4d");
      g.hline(6, 12, 4, "#1b2e4d");
      g.hline(4, 3, 8, "#ffd13b");
      g.rect(6, 5, 4, 4, "#38a5ff");
      g.px(7, 6, "#ffd13b");
      break;
    }
    case "corporate": {
      g.rect(3, 4, 10, 9, "#222630");
      g.rect(6, 4, 4, 3, "#f1f5f9");
      g.vline(7, 5, 7, "#e63250");
      g.vline(8, 5, 7, "#e63250");
      g.px(10, 7, "#f5c542");
      break;
    }
    case "techie": {
      g.line(4, 11, 11, 4, "#cbd5e1");
      g.rect(9, 3, 4, 4, "#94a3b8");
      g.px(11, 4, role.auraSoft);
      g.rect(3, 10, 3, 3, "#f2b705");
      break;
    }
    case "medtechie":
    default: {
      g.rect(3, 3, 10, 10, "#e2e8f0");
      g.rect(7, 5, 2, 6, "#ff2e4d");
      g.rect(5, 7, 6, 2, "#ff2e4d");
      g.hline(3, 12, 10, "#26e6b5");
      break;
    }
  }
}
