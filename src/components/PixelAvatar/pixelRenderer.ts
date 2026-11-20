import { deriveAppearanceFromCharacter } from "../../rules";
import type { Character, CharacterAppearance } from "../../types";
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

export interface RenderCharacterOptions {
  frame?: number;
  width?: number;
  height?: number;
}

const LOGICAL_WIDTH = 32;
const LOGICAL_HEIGHT = 48;
const ICON_GRID = 16;

class PixelGrid {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly logicalW: number;
  private readonly logicalH: number;
  private readonly width: number;
  private readonly height: number;
  private readonly exactScale: number | null;

  constructor(
    ctx: CanvasRenderingContext2D,
    logicalW: number,
    logicalH: number,
    width: number,
    height: number,
  ) {
    this.ctx = ctx;
    this.logicalW = logicalW;
    this.logicalH = logicalH;
    this.width = width;
    this.height = height;
    const sx = width / logicalW;
    const sy = height / logicalH;
    this.exactScale =
      Number.isInteger(sx) && Number.isInteger(sy) && sx === sy ? sx : null;
  }

  px(x: number, y: number, color: string): void {
    this.rect(x, y, 1, 1, color);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    if (w <= 0 || h <= 0) return;
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rw = Math.round(w);
    const rh = Math.round(h);
    this.ctx.fillStyle = color;
    if (this.exactScale !== null) {
      this.ctx.fillRect(
        rx * this.exactScale,
        ry * this.exactScale,
        rw * this.exactScale,
        rh * this.exactScale,
      );
      return;
    }
    const x0 = Math.floor((rx * this.width) / this.logicalW);
    const y0 = Math.floor((ry * this.height) / this.logicalH);
    const x1 = Math.floor(((rx + rw) * this.width) / this.logicalW);
    const y1 = Math.floor(((ry + rh) * this.height) / this.logicalH);
    this.ctx.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
  }

  hline(x: number, y: number, len: number, color: string): void {
    this.rect(x, y, len, 1, color);
  }

  vline(x: number, y: number, len: number, color: string): void {
    this.rect(x, y, 1, len, color);
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string): void {
    let cx = Math.round(x0);
    let cy = Math.round(y0);
    const tx = Math.round(x1);
    const ty = Math.round(y1);
    const dx = Math.abs(tx - cx);
    const dy = -Math.abs(ty - cy);
    const sx = cx < tx ? 1 : -1;
    const sy = cy < ty ? 1 : -1;
    let err = dx + dy;

    while (true) {
      this.px(cx, cy, color);
      if (cx === tx && cy === ty) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        cx += sx;
      }
      if (e2 <= dx) {
        err += dx;
        cy += sy;
      }
    }
  }
}

interface GearSummary {
  owned: Set<string>;
  cyberarmCount: number;
  cyberlegCount: number;
  hasHelmet: boolean;
  hasFullArmor: boolean;
  hasHeavyVest: boolean;
  hasFlakPants: boolean;
  hasArmorJacket: boolean;
  weaponTier:
    | "sniper_rifle"
    | "assault_rifle"
    | "shotgun"
    | "smg"
    | "monoblade"
    | "sword"
    | "pistol"
    | null;
}

function summarizeGear(character: Character): GearSummary {
  const owned = new Set<string>();
  let cyberarmCount = 0;
  let cyberlegCount = 0;

  for (const item of character.gear.items) {
    owned.add(item.itemId);
    if (item.itemId === "cyberarm") cyberarmCount += 1;
    if (item.itemId === "cyberleg") cyberlegCount += 1;
  }

  let weaponTier: GearSummary["weaponTier"] = null;
  if (owned.has("sniper_rifle")) weaponTier = "sniper_rifle";
  else if (owned.has("assault_rifle")) weaponTier = "assault_rifle";
  else if (owned.has("shotgun")) weaponTier = "shotgun";
  else if (owned.has("monoblade")) weaponTier = "monoblade";
  else if (owned.has("sword")) weaponTier = "sword";
  else if (owned.has("heavy_smg") || owned.has("medium_smg") || owned.has("light_smg")) {
    weaponTier = "smg";
  } else if (
    owned.has("very_heavy_pistol") ||
    owned.has("heavy_pistol") ||
    owned.has("medium_pistol") ||
    owned.has("light_pistol")
  ) {
    weaponTier = "pistol";
  }

  return {
    owned,
    cyberarmCount,
    cyberlegCount,
    hasHelmet: owned.has("steel_helmet") || owned.has("nylon_helmet"),
    hasFullArmor: owned.has("full_body_armor"),
    hasHeavyVest: owned.has("heavy_vest") || owned.has("flak_vest"),
    hasFlakPants: owned.has("flak_pants"),
    hasArmorJacket:
      owned.has("medium_armor_jacket") ||
      owned.has("light_armor_jacket") ||
      owned.has("leather_jacket"),
    weaponTier,
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
  // Deep night synth sky bands
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
    // Long and wild mane flowing behind shoulders
    g.rect(10, 8 + bobY, 12, 11, hair.shadow);
    g.vline(10, 10 + bobY, 10, hair.outline);
    g.vline(21, 10 + bobY, 10, hair.outline);
    g.px(11, 19 + bobY, hair.base);
    g.px(20, 19 + bobY, hair.base);
    g.px(11, 21 + bobY, hair.shadow);
    g.px(20, 21 + bobY, hair.shadow);
  } else if (hairStyle === 6) {
    // Braids with data-bead charms hanging behind shoulders
    g.rect(10, 9 + bobY, 2, 11, hair.shadow);
    g.rect(20, 9 + bobY, 2, 11, hair.shadow);
    g.px(10, 15 + bobY, pulse ? "#00f0ff" : "#ffaa00");
    g.px(21, 16 + bobY, pulse ? "#ff2e97" : "#00f0ff");
    g.px(11, 19 + bobY, "#00f0ff");
    g.px(20, 19 + bobY, "#ffaa00");
  } else if (hairStyle === 10) {
    // Sleek salon bob behind neck
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
  // Long coat tails behind legs for Trench / Duster / Overcoat / Trauma coat roles
  if (roleId === "media" || roleId === "nomad" || roleId === "fixer" || roleId === "medtechie") {
    g.rect(11, 28 + bobY, 10, 8, outfit.primaryShadow);
    g.vline(10, 29 + bobY, 7, outfit.outline);
    g.vline(21, 29 + bobY, 7, outfit.outline);
    g.hline(11, 35 + bobY, 10, outfit.outline);
  }

  // Back-slung weapon silhouettes visible behind shoulders
  if (gear.weaponTier === "sniper_rifle") {
    g.line(18, 18 + bobY, 24, 5 + bobY, "#64748b");
    g.px(24, 5 + bobY, "#cbd5e1");
    g.px(22, 9 + bobY, "#00f0ff");
  } else if (gear.weaponTier === "monoblade") {
    g.line(18, 19 + bobY, 24, 7 + bobY, "#94a3b8");
    g.line(19, 17 + bobY, 24, 7 + bobY, "#00f0ff");
    g.px(24, 6 + bobY, "#e2e8f0");
  } else if (gear.weaponTier === "sword") {
    g.line(18, 19 + bobY, 24, 7 + bobY, "#cbd5e1");
    g.px(23, 8 + bobY, "#f5c542");
  } else if (roleId === "nomad" && !gear.weaponTier) {
    // Nomad iconic road rifle slung over shoulder
    g.line(18, 19 + bobY, 23, 8 + bobY, "#7c5836");
    g.line(21, 13 + bobY, 23, 8 + bobY, "#94a3b8");
  }
}

function drawLegsAndBoots(
  g: PixelGrid,
  buildTier: "slim" | "athletic" | "heavy",
  skin: SkinPalette,
  outfit: OutfitPalette,
  clothesStyle: number,
  gear: GearSummary,
  pulse: boolean,
): void {
  const leftX = buildTier === "slim" ? 13 : buildTier === "athletic" ? 12 : 11;
  const rightX = 17;
  const legW = buildTier === "slim" ? 2 : buildTier === "athletic" ? 3 : 4;

  // Trousers (y = 29..38)
  g.rect(leftX, 29, legW, 10, outfit.secondary);
  g.rect(rightX, 29, legW, 10, outfit.secondary);
  // Inner leg shadows
  g.vline(leftX + legW - 1, 30, 9, outfit.secondaryShadow);
  g.vline(rightX, 30, 9, outfit.secondaryShadow);

  // Clothes style trouser modifiers
  if (clothesStyle === 1) {
    // Torn-up denim knee & patch
    g.px(leftX + 1, 34, skin.base);
    g.px(rightX + legW - 2, 32, outfit.accent);
  } else if (clothesStyle === 3) {
    // Military cargo pockets
    g.vline(leftX - 1, 33, 3, outfit.secondaryShadow);
    g.vline(rightX + legW, 33, 3, outfit.secondaryShadow);
  } else if (clothesStyle === 4) {
    // Glowing smart-fabric trouser stripe
    const stripe = pulse ? outfit.accentGlow : outfit.accent;
    g.vline(leftX, 30, 8, stripe);
    g.vline(rightX + legW - 1, 30, 8, stripe);
  } else if (clothesStyle === 5) {
    // Leather/chains hip accent
    g.px(leftX, 31, "#cbd5e1");
    g.px(leftX + 1, 32, "#cbd5e1");
  }

  // Armor leg overlays
  if (gear.hasFlakPants || gear.hasFullArmor) {
    const plate = gear.hasFullArmor ? "#3b4759" : "#3a4538";
    const plateHi = gear.hasFullArmor ? "#64748b" : "#586954";
    g.rect(leftX, 31, legW, 7, plate);
    g.rect(rightX, 31, legW, 7, plate);
    g.hline(leftX, 34, legW, plateHi);
    g.hline(rightX, 34, legW, plateHi);
  }

  // Cyberleg overlays (1 cyberleg -> right leg; 2+ -> both legs)
  if (gear.cyberlegCount >= 1) {
    const drawChromeLeg = (lx: number) => {
      g.rect(lx, 32, legW, 9, "#94a8bd");
      g.vline(lx, 32, 9, "#e2f1ff");
      g.vline(lx + legW - 1, 32, 9, "#48596b");
      g.hline(lx, 35, legW, "#26313d");
      g.px(lx, 35, "#00f0ff");
    };
    drawChromeLeg(rightX);
    if (gear.cyberlegCount >= 2) {
      drawChromeLeg(leftX);
    }
  }

  // Boots (y = 39..43)
  const bootBase = gear.hasFullArmor ? "#2d3748" : "#1a1e29";
  const bootHi = gear.hasFullArmor ? "#64748b" : "#3a4254";
  g.rect(leftX, 39, legW, 4, bootBase);
  g.rect(rightX, 39, legW, 4, bootBase);
  g.hline(leftX, 39, legW, outfit.accent);
  g.hline(rightX, 39, legW, outfit.accent);
  g.px(leftX, 41, bootHi);
  g.px(rightX + legW - 1, 41, bootHi);
  // Boot soles planted firmly at y = 43
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

  // Base jacket / suit torso (y = 17..29)
  g.rect(txLeft, 17 + bobY, torsoW, 13, outfit.primary);
  g.vline(txLeft, 18 + bobY, 11, outfit.primaryHighlight);
  g.vline(txRight, 18 + bobY, 11, outfit.primaryShadow);
  g.hline(txLeft, 17 + bobY, torsoW, outfit.outline);

  // Role-specific torso silhouettes & details
  if (roleId === "solo") {
    // Armored vest plates + diagonal tactical strap
    g.rect(txLeft + 1, 18 + bobY, torsoW - 2, 8, outfit.primaryHighlight);
    g.hline(txLeft + 1, 22 + bobY, torsoW - 2, outfit.primaryShadow);
    g.line(txLeft, 18 + bobY, txRight, 26 + bobY, "#141820");
    g.px(15, 21 + bobY, outfit.accent);
    // Tactical belt & pouches
    g.hline(txLeft, 27 + bobY, torsoW, "#14161c");
    g.px(15, 27 + bobY, "#cbd5e1");
    g.px(16, 27 + bobY, "#cbd5e1");
  } else if (roleId === "rocker") {
    // Open asymmetrical punk jacket with bare/strapped chest
    g.rect(14, 18 + bobY, 4, 8, skin.base);
    g.px(14, 19 + bobY, skin.shadow);
    g.line(14, 18 + bobY, 17, 25 + bobY, "#1c1926");
    // Silver studs on lapel & shoulder
    g.px(txLeft + 1, 18 + bobY, "#e2e8f0");
    g.px(txLeft + 1, 20 + bobY, "#e2e8f0");
    g.px(txRight - 1, 19 + bobY, outfit.accent);
    // Studded belt
    g.hline(txLeft, 27 + bobY, torsoW, "#121017");
    g.px(14, 27 + bobY, "#e2e8f0");
    g.px(17, 27 + bobY, "#e2e8f0");
  } else if (roleId === "netrunner") {
    // Sleek cyber-suit with glowing circuit lines
    const glow = pulse ? outfit.accentGlow : outfit.accent;
    g.rect(14, 18 + bobY, 4, 9, outfit.primaryShadow);
    g.vline(13, 19 + bobY, 8, glow);
    g.vline(18, 19 + bobY, 8, glow);
    g.rect(15, 20 + bobY, 2, 2, glow);
    g.hline(txLeft, 26 + bobY, torsoW, "#0b111c");
  } else if (roleId === "media") {
    // Open press trenchcoat + shirt + tie + PRESS badge
    g.rect(14, 18 + bobY, 4, 8, "#cfd8e3");
    g.vline(15, 19 + bobY, 6, "#2c3647");
    g.px(txRight - 2, 20 + bobY, outfit.accentGlow);
    g.px(txRight - 1, 20 + bobY, outfit.accent);
    g.hline(txLeft, 26 + bobY, torsoW, outfit.primaryShadow);
    g.px(15, 26 + bobY, "#cbd5e1");
  } else if (roleId === "nomad") {
    // Weathered highway duster + desert scarf around neck
    g.rect(14, 19 + bobY, 4, 9, outfit.secondary);
    g.rect(13, 16 + bobY, 6, 3, outfit.accent);
    g.hline(14, 18 + bobY, 4, outfit.accentGlow);
    g.hline(txLeft, 27 + bobY, torsoW, "#362517");
    g.rect(15, 27 + bobY, 2, 1, "#f5c542");
  } else if (roleId === "fixer") {
    // Luxe high-collar overcoat + heavy gold chain across chest
    g.rect(14, 18 + bobY, 4, 9, outfit.secondary);
    g.px(13, 17 + bobY, outfit.accent);
    g.px(18, 17 + bobY, outfit.accent);
    g.hline(14, 20 + bobY, 4, outfit.accentGlow);
    g.px(15, 21 + bobY, outfit.accent);
    g.px(16, 21 + bobY, outfit.accent);
    g.hline(txLeft, 27 + bobY, torsoW, outfit.primaryShadow);
  } else if (roleId === "cop") {
    // NCPD armored patrol uniform + gold/cyan badge + duty belt
    g.rect(txLeft + 1, 18 + bobY, torsoW - 2, 7, outfit.primaryHighlight);
    g.hline(14, 18 + bobY, 4, outfit.primaryShadow);
    g.px(txLeft + 1, 20 + bobY, "#ffd13b");
    g.px(txLeft + 1, 21 + bobY, "#38a5ff");
    g.hline(txLeft, 26 + bobY, torsoW, "#0d111a");
    g.px(15, 26 + bobY, "#cbd5e1");
    g.px(txRight, 27 + bobY, "#38a5ff");
  } else if (roleId === "corporate") {
    // Tailored double-breasted suit + white collar + power tie
    g.rect(14, 18 + bobY, 4, 4, "#f1f5f9");
    g.vline(15, 19 + bobY, 6, outfit.accent);
    g.vline(16, 19 + bobY, 6, outfit.accent);
    g.px(14, 22 + bobY, "#cbd5e1");
    g.px(17, 22 + bobY, "#cbd5e1");
    g.px(txRight - 2, 20 + bobY, outfit.accentGlow);
  } else if (roleId === "techie") {
    // Heavy mechanic coveralls/apron + tool harness + safety stripes
    g.rect(13, 18 + bobY, 6, 2, outfit.secondary);
    g.rect(13, 20 + bobY, 6, 9, outfit.primary);
    g.vline(13, 18 + bobY, 8, outfit.accent);
    g.vline(18, 18 + bobY, 8, outfit.accent);
    g.px(txLeft + 1, 22 + bobY, "#cbd5e1");
    g.px(txLeft + 1, 23 + bobY, "#f59e0b");
    g.hline(txLeft, 27 + bobY, torsoW, "#292017");
  } else if (roleId === "medtechie") {
    // Crisp white trauma coat + biohazard teal scrubs + medical cross
    g.rect(14, 18 + bobY, 4, 8, outfit.secondary);
    // 3x3 medical cross on right chest
    g.px(txRight - 2, 20 + bobY, "#ff2e4d");
    g.hline(txRight - 3, 21 + bobY, 3, "#ff2e4d");
    g.px(txRight - 2, 22 + bobY, "#ff2e4d");
    g.hline(txLeft, 27 + bobY, torsoW, "#475569");
  }

  // Clothes style overlays (from lifepath.json clothes table 1..10)
  if (clothesStyle === 1) {
    // Torn-up street gear & patch
    g.px(txLeft + 1, 25 + bobY, outfit.accent);
    g.px(txRight - 1, 28 + bobY, "#090b10");
  } else if (clothesStyle === 2 && roleId !== "corporate") {
    // Sleek corporate collar trim
    g.px(14, 18 + bobY, "#e2e8f0");
    g.px(17, 18 + bobY, "#e2e8f0");
  } else if (clothesStyle === 3) {
    // Military surplus pockets
    g.rect(txLeft + 1, 24 + bobY, 2, 2, outfit.primaryShadow);
    g.rect(txRight - 2, 24 + bobY, 2, 2, outfit.primaryShadow);
  } else if (clothesStyle === 4) {
    // Glowing smart-fabric trim
    const neon = pulse ? outfit.accentGlow : outfit.accent;
    g.hline(txLeft, 18 + bobY, torsoW, neon);
    g.hline(txLeft, 29 + bobY, torsoW, neon);
  } else if (clothesStyle === 5) {
    // Leather & chains
    g.line(txLeft, 25 + bobY, txRight, 28 + bobY, "#cbd5e1");
    g.px(txLeft, 17 + bobY, "#e2e8f0");
    g.px(txRight, 17 + bobY, "#e2e8f0");
  } else if (clothesStyle === 6) {
    // Loose layered streetwear hood & hem
    g.hline(13, 17 + bobY, 6, outfit.accent);
    g.hline(txLeft, 29 + bobY, torsoW, outfit.primaryHighlight);
  } else if (clothesStyle === 7) {
    // Vintage 20th-century retro stripe
    g.hline(txLeft + 1, 23 + bobY, torsoW - 2, outfit.accent);
  } else if (clothesStyle === 8) {
    // Armored jacket over everything
    g.rect(txLeft - 1, 17 + bobY, 2, 4, outfit.primaryHighlight);
    g.rect(txRight, 17 + bobY, 2, 4, outfit.primaryHighlight);
  } else if (clothesStyle === 9) {
    // Minimal monochrome designer high-neck
    g.hline(14, 17 + bobY, 4, outfit.primaryHighlight);
  } else if (clothesStyle === 10) {
    // Casual untucked tee peeking at hem
    g.hline(txLeft + 1, 29 + bobY, torsoW - 3, "#cbd5e1");
  }

  // Armor overlays on torso
  if (gear.hasArmorJacket && !gear.hasFullArmor) {
    g.rect(txLeft - 1, 17 + bobY, 2, 3, "#475569");
    g.rect(txRight, 17 + bobY, 2, 3, "#475569");
  }
  if (gear.hasHeavyVest && !gear.hasFullArmor) {
    g.rect(txLeft + 1, 19 + bobY, torsoW - 2, 7, "#334155");
    g.hline(txLeft + 1, 19 + bobY, torsoW - 2, "#64748b");
    g.hline(txLeft + 1, 23 + bobY, torsoW - 2, "#1e293b");
  }
  if (gear.hasFullArmor) {
    g.rect(txLeft - 1, 17 + bobY, torsoW + 2, 12, "#3b4759");
    g.rect(txLeft + 1, 19 + bobY, torsoW - 2, 6, "#64748b");
    g.hline(txLeft, 22 + bobY, torsoW, "#1e293b");
    g.px(15, 20 + bobY, pulse ? "#00f0ff" : "#0099cc");
    g.px(16, 20 + bobY, pulse ? "#00f0ff" : "#0099cc");
  }
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
  // Neck
  g.rect(14, 15 + bobY, 4, 3, skin.base);
  g.hline(14, 15 + bobY, 4, skin.shadow);

  // Ears
  g.vline(11, 10 + bobY, 3, skin.shadow);
  g.vline(20, 10 + bobY, 3, skin.shadow);

  // Skull / Face (y = 7..15)
  g.hline(13, 7 + bobY, 6, skin.base);
  g.rect(12, 8 + bobY, 8, 6, skin.base);
  g.hline(13, 14 + bobY, 6, skin.base);
  g.hline(14, 15 + bobY, 4, skin.shadow);

  // Face highlights & jaw shading
  g.hline(14, 8 + bobY, 4, skin.highlight);
  g.px(13, 12 + bobY, skin.highlight);
  g.px(18, 12 + bobY, skin.highlight);
  g.px(13, 14 + bobY, skin.shadow);
  g.px(18, 14 + bobY, skin.shadow);

  // Eyebrows & eyes
  const browColor = hair.shadow;
  g.hline(13, 9 + bobY, 2, browColor);
  g.hline(17, 9 + bobY, 2, browColor);

  g.px(13, 10 + bobY, "#f1f5f9");
  g.px(14, 10 + bobY, "#151924");
  g.px(17, 10 + bobY, "#151924");
  g.px(18, 10 + bobY, "#f1f5f9");

  // Nose & mouth
  g.px(16, 11 + bobY, skin.shadow);
  g.hline(15, 13 + bobY, 2, skin.shadow);

  // Crawling tattoo / light tattoo
  if (affectations.tattoos || gear.owned.has("light_tattoo")) {
    const ink = gear.owned.has("light_tattoo")
      ? pulse
        ? "#00f0ff"
        : "#009ec4"
      : "#1f3a52";
    g.px(13, 11 + bobY, ink);
    g.px(12, 12 + bobY, ink);
    g.px(14, 16 + bobY, ink);
  }

  // Glowing subdermal dots
  if (affectations.subdermal) {
    const dot = pulse ? "#00f0ff" : "#ff2e97";
    g.px(12, 11 + bobY, dot);
    g.px(19, 11 + bobY, dot);
    g.px(15, 16 + bobY, dot);
  }

  // Interface plugs / Smartgun link temple jack
  if (gear.owned.has("interface_plugs") || gear.owned.has("smartgun_link")) {
    g.px(12, 10 + bobY, "#94a3b8");
    g.px(12, 11 + bobY, gear.owned.has("smartgun_link") ? "#ff2e54" : "#00f0ff");
    g.px(14, 16 + bobY, "#cbd5e1");
  }

  // Cyberoptic / Low-light bionic eye
  if (gear.owned.has("cyberoptic") || gear.owned.has("low_light")) {
    const eyeGlow = gear.owned.has("low_light") ? "#00ffaa" : "#ff2244";
    g.px(18, 10 + bobY, "#64748b");
    g.px(17, 10 + bobY, eyeGlow);
  }

  // Role eyewear / headgear accents
  if (role.id === "netrunner") {
    g.hline(13, 10 + bobY, 6, "#082f49");
    g.hline(14, 10 + bobY, 4, pulse ? "#67f7ff" : "#00e1ff");
  } else if (role.id === "solo" && !gear.owned.has("cyberoptic") && !affectations.mirrorshades) {
    g.hline(16, 10 + bobY, 3, "#47111e");
    g.px(17, 10 + bobY, pulse ? "#ff6685" : "#ff2e54");
  } else if (role.id === "techie") {
    // Welding goggles pushed up onto forehead
    g.hline(12, 8 + bobY, 8, "#473522");
    g.rect(13, 8 + bobY, 2, 2, "#00e1ff");
    g.rect(17, 8 + bobY, 2, 2, "#00e1ff");
    g.hline(15, 8 + bobY, 2, "#94a3b8");
  }

  // Mirrorshades affectation
  if (affectations.mirrorshades) {
    g.hline(13, 10 + bobY, 6, "#0f172a");
    g.px(14, 10 + bobY, "#38bdf8");
    g.px(17, 10 + bobY, "#e0f2fe");
  }

  // Chewing toothpick / gum
  if (affectations.chewing) {
    g.px(17, 13 + bobY, "#e2e8f0");
    g.px(18, 14 + bobY, "#cbd5e1");
  }

  // Single strange earring
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
  // Full body armor helmet completely encloses head
  if (gear.hasFullArmor) {
    g.hline(13, 5 + bobY, 6, "#1e293b");
    g.rect(12, 6 + bobY, 8, 8, "#475569");
    g.hline(13, 6 + bobY, 6, "#94a3b8");
    g.hline(13, 10 + bobY, 6, "#0f172a");
    g.hline(14, 10 + bobY, 4, pulse ? "#38f2ff" : "#00b4d8");
    g.hline(13, 14 + bobY, 6, "#1e293b");
    return;
  }

  // Steel / Nylon combat helmet covers crown
  if (gear.hasHelmet) {
    const isNylon = gear.owned.has("nylon_helmet");
    const hBase = isNylon ? "#27303f" : "#64748b";
    const hHi = isNylon ? "#475569" : "#cbd5e1";
    const hDark = isNylon ? "#111827" : "#334155";
    g.hline(13, 5 + bobY, 6, hDark);
    g.rect(12, 6 + bobY, 8, 3, hBase);
    g.hline(13, 6 + bobY, 5, hHi);
    g.hline(11, 8 + bobY, 10, hDark);
    if (isNylon) {
      g.px(15, 7 + bobY, "#00f0ff");
    }
    return;
  }

  // Hairstyles 1..10 (matching lifepath.json)
  switch (hairStyle) {
    case 1: {
      // Shaved clean
      g.hline(14, 7 + bobY, 4, skin.highlight);
      g.px(13, 8 + bobY, skin.shadow);
      g.px(18, 8 + bobY, skin.shadow);
      break;
    }
    case 2: {
      // Neon-dyed mohawk
      g.rect(15, 2 + bobY, 2, 6, hair.base);
      g.rect(14, 4 + bobY, 4, 4, hair.base);
      g.vline(15, 2 + bobY, 4, hair.highlight);
      g.px(16, 2 + bobY, hair.highlight);
      g.hline(14, 8 + bobY, 4, hair.shadow);
      break;
    }
    case 3: {
      // Long and wild
      g.rect(12, 5 + bobY, 8, 4, hair.base);
      g.hline(13, 5 + bobY, 6, hair.highlight);
      g.px(11, 7 + bobY, hair.base);
      g.px(20, 7 + bobY, hair.base);
      g.px(12, 9 + bobY, hair.shadow);
      g.px(19, 9 + bobY, hair.shadow);
      break;
    }
    case 4: {
      // Short and military
      g.hline(13, 5 + bobY, 6, hair.highlight);
      g.rect(12, 6 + bobY, 8, 2, hair.base);
      g.hline(12, 8 + bobY, 8, hair.shadow);
      break;
    }
    case 5: {
      // Slicked back
      g.hline(13, 5 + bobY, 6, hair.base);
      g.rect(12, 6 + bobY, 8, 3, hair.shadow);
      g.hline(14, 6 + bobY, 4, hair.highlight);
      g.px(12, 9 + bobY, hair.shadow);
      g.px(19, 9 + bobY, hair.shadow);
      break;
    }
    case 6: {
      // Braids with data-bead charms
      g.rect(12, 6 + bobY, 8, 3, hair.base);
      g.px(13, 6 + bobY, hair.highlight);
      g.px(15, 6 + bobY, hair.highlight);
      g.px(17, 6 + bobY, hair.highlight);
      g.vline(11, 8 + bobY, 5, hair.base);
      g.vline(20, 8 + bobY, 5, hair.base);
      break;
    }
    case 7: {
      // Asymmetric undercut
      g.rect(12, 5 + bobY, 7, 3, hair.base);
      g.hline(13, 5 + bobY, 5, hair.highlight);
      g.rect(12, 8 + bobY, 4, 2, hair.base);
      g.px(12, 10 + bobY, hair.shadow);
      g.px(19, 7 + bobY, skin.shadow);
      break;
    }
    case 8: {
      // Chrome-plated scalp
      g.hline(13, 6 + bobY, 6, "#cbd5e1");
      g.rect(12, 7 + bobY, 8, 2, "#94a3b8");
      g.hline(14, 6 + bobY, 3, "#f8fafc");
      g.px(12, 8 + bobY, hair.base);
      g.px(19, 8 + bobY, hair.base);
      break;
    }
    case 9: {
      // Messy and unwashed
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
      // Perfect salon styling
      g.hline(13, 5 + bobY, 6, hair.base);
      g.rect(12, 6 + bobY, 8, 3, hair.base);
      g.hline(13, 6 + bobY, 6, hair.highlight);
      g.vline(11, 7 + bobY, 4, hair.shadow);
      g.vline(20, 7 + bobY, 4, hair.shadow);
      break;
    }
  }

  // Cop patrol cap sits cleanly over hair crown
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

  const leftChrome = gear.cyberarmCount >= 2;
  const rightChrome = gear.cyberarmCount >= 1 || affectations.cyberlimb;
  const shortSleeves = roleId === "rocker" || roleId === "techie";

  const drawSingleArm = (ax: number, isChrome: boolean) => {
    if (isChrome) {
      g.rect(ax, 18 + bobY, armW, 9, "#94a8bd");
      g.vline(ax, 18 + bobY, 9, "#e2f1ff");
      g.hline(ax, 22 + bobY, armW, "#475569");
      g.px(ax, 22 + bobY, "#00f0ff");
    } else if (gear.hasFullArmor) {
      g.rect(ax, 18 + bobY, armW, 9, "#3b4759");
      g.hline(ax, 18 + bobY, armW, "#64748b");
    } else {
      const sleeveLen = shortSleeves ? 4 : 8;
      g.rect(ax, 18 + bobY, armW, sleeveLen, outfit.primaryShadow);
      g.vline(ax, 18 + bobY, sleeveLen, outfit.primary);
      if (shortSleeves) {
        g.rect(ax, 22 + bobY, armW, 5, skin.base);
      }
    }

    // Hands (y = 27..28)
    const handColor =
      gear.hasFullArmor || affectations.gloves || roleId === "techie"
        ? "#1e293b"
        : isChrome
          ? "#cbd5e1"
          : skin.base;
    g.rect(ax, 27 + bobY, armW, 2, handColor);
  };

  drawSingleArm(leftArmX, leftChrome);
  drawSingleArm(rightArmX, rightChrome);

  // Biomonitor wrist display
  if (gear.owned.has("biomonitor")) {
    g.px(leftArmX, 26 + bobY, pulse ? "#33ffaa" : "#0ea5e9");
  }

  // Rippers / Wolvers blade cyberware extending from hands
  if (gear.owned.has("wolvers") || gear.owned.has("rippers")) {
    const bladeLen = gear.owned.has("wolvers") ? 3 : 2;
    g.vline(leftArmX, 29 + bobY, bladeLen, "#e2e8f0");
    g.vline(rightArmX + armW - 1, 29 + bobY, bladeLen, "#e2e8f0");
    if (gear.owned.has("wolvers")) {
      g.vline(leftArmX + 1, 29 + bobY, 2, "#94a3b8");
      g.vline(rightArmX, 29 + bobY, 2, "#94a3b8");
    }
  }

  // Role-specific props & equipped weapon overlays
  if (roleId === "rocker") {
    // Iconic electric guitar slung diagonally across body
    const neckX0 = 13;
    const neckY0 = 24 + bobY;
    g.line(neckX0, neckY0, rightArmX + 2, 12 + bobY, "#cbd5e1");
    g.px(rightArmX + 2, 11 + bobY, "#f8fafc");
    g.rect(10, 23 + bobY, 5, 4, outfit.accent);
    g.rect(11, 24 + bobY, 3, 2, outfit.accentGlow);
    g.px(12, 24 + bobY, "#f8fafc");
  } else if (roleId === "solo") {
    // Tactical assault rifle / heavy sidearm held across front
    const gunY = 25 + bobY;
    g.hline(leftArmX - 2, gunY, txRight - leftArmX + 4, "#1e293b");
    g.hline(leftArmX, gunY - 1, 7, "#475569");
    g.px(leftArmX - 2, gunY, "#94a3b8");
    g.px(15, gunY + 1, "#334155");
    g.px(17, gunY - 1, pulse ? "#ff2e54" : "#991b1b");
  } else if (roleId === "netrunner") {
    // Wrist cyberdeck rig & holographic cyan mini-display
    g.rect(leftArmX - 2, 24 + bobY, 3, 3, "#1e293b");
    g.rect(leftArmX - 2, 21 + bobY, 3, 3, pulse ? "#00f0ff" : "#0284c7");
    g.px(leftArmX - 1, 22 + bobY, "#e0f2fe");
  } else if (roleId === "media") {
    // Shoulder camcorder rig with glowing red REC lamp + datapad
    g.rect(leftArmX - 1, 13 + bobY, 4, 3, "#334155");
    g.px(leftArmX - 2, 14 + bobY, "#94a3b8");
    g.px(leftArmX + 2, 13 + bobY, pulse ? "#ff2e4c" : "#7f1d1d");
    g.rect(rightArmX, 24 + bobY, 3, 3, "#0f172a");
    g.px(rightArmX + 1, 25 + bobY, "#ffaa00");
  } else if (roleId === "nomad") {
    // Heavy sidearm or shotgun stock at hip
    g.rect(leftArmX - 1, 25 + bobY, 2, 4, "#5c4028");
    g.px(leftArmX - 1, 24 + bobY, "#94a3b8");
  } else if (roleId === "fixer") {
    // Glowing holographic deal-datapad floating above hand
    g.rect(rightArmX, 26 + bobY, 3, 2, "#1e293b");
    g.rect(rightArmX, 22 + bobY, 4, 3, pulse ? "#00f0ff" : "#0ea5e9");
    g.hline(rightArmX + 1, 23 + bobY, 2, "#fef08a");
  } else if (roleId === "cop") {
    // Sidearm holster on left hip & tactical baton on right hip
    g.rect(leftArmX, 26 + bobY, 2, 4, "#0f172a");
    g.px(leftArmX, 25 + bobY, "#64748b");
    g.vline(rightArmX + armW, 26 + bobY, 6, "#1e293b");
  } else if (roleId === "corporate") {
    // Armored security briefcase with biometric LED
    g.rect(leftArmX - 2, 28 + bobY, 5, 5, "#262d3d");
    g.hline(leftArmX - 2, 28 + bobY, 5, "#94a3b8");
    g.px(leftArmX, 30 + bobY, pulse ? "#ff2e54" : "#00f0ff");
  } else if (roleId === "techie") {
    // Upright steel & amber servo-wrench
    g.vline(rightArmX + 1, 16 + bobY, 12, "#94a3b8");
    g.rect(rightArmX, 15 + bobY, 3, 2, "#cbd5e1");
    g.px(rightArmX + 1, 15 + bobY, "#090b10");
    g.px(rightArmX + 1, 21 + bobY, "#f59e0b");
  } else if (roleId === "medtechie") {
    // Trauma medpack with red cross + bio-scanner
    g.rect(rightArmX, 26 + bobY, 4, 5, "#f1f5f9");
    g.px(rightArmX + 2, 27 + bobY, "#ff2e4d");
    g.hline(rightArmX + 1, 28 + bobY, 3, "#ff2e4d");
    g.px(rightArmX + 2, 29 + bobY, "#ff2e4d");
    g.px(leftArmX - 1, 26 + bobY, pulse ? "#26e6b5" : "#0d9488");
  }

  // Upgrade held weapon sprite when player buys guns (for non-solo roles carrying guns)
  if (roleId !== "solo" && gear.weaponTier === "assault_rifle") {
    g.hline(leftArmX - 3, 25 + bobY, 8, "#1e293b");
    g.hline(leftArmX - 1, 24 + bobY, 5, "#475569");
    g.px(leftArmX - 3, 25 + bobY, "#94a3b8");
  } else if (roleId !== "solo" && (gear.weaponTier === "shotgun" || gear.weaponTier === "smg")) {
    g.hline(leftArmX - 2, 26 + bobY, 6, "#334155");
    g.px(leftArmX - 2, 26 + bobY, "#94a3b8");
  } else if (
    roleId !== "solo" &&
    roleId !== "cop" &&
    gear.weaponTier === "pistol"
  ) {
    g.hline(leftArmX - 2, 26 + bobY, 3, "#475569");
  }
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
  const gear = summarizeGear(character);
  const affectations = parseAffectations(character);

  drawStageBackground(g, role, pulse);
  drawBackHair(g, appearance.hairStyle, hair, bobY, pulse);
  drawBackCoatAndWeapons(g, role.id, outfit, gear, bobY);
  drawLegsAndBoots(
    g,
    build.tier,
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
    skin,
    outfit,
    affectations,
    gear,
    bobY,
    pulse,
  );
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

  // Dark framed micro-card backdrop
  g.rect(0, 0, ICON_GRID, ICON_GRID, "#090d18");
  g.rect(1, 1, ICON_GRID - 2, ICON_GRID - 2, role.auraSoft);
  g.hline(0, 0, 3, role.aura);
  g.vline(0, 0, 3, role.aura);
  g.hline(13, 15, 3, role.aura);
  g.vline(15, 13, 3, role.aura);

  switch (roleId) {
    case "solo": {
      // Tactical helmet + crimson visor + targeting reticle
      g.rect(4, 3, 8, 9, "#334155");
      g.hline(5, 3, 6, "#64748b");
      g.hline(4, 7, 8, "#0f172a");
      g.hline(5, 7, 6, "#ff2e54");
      g.px(8, 7, "#ffa6b8");
      g.rect(3, 12, 10, 2, "#1e293b");
      break;
    }
    case "rocker": {
      // Hot pink electric V-guitar
      g.line(4, 11, 12, 3, "#cbd5e1");
      g.px(12, 3, "#f8fafc");
      g.rect(3, 9, 4, 4, "#ff2e97");
      g.px(2, 12, "#ff2e97");
      g.px(6, 12, "#ff2e97");
      g.px(4, 10, "#ff94ca");
      break;
    }
    case "netrunner": {
      // Cyber visor + matrix data nodes
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
      // Broadcast camcorder + red REC tally
      g.rect(3, 5, 8, 6, "#334155");
      g.rect(11, 6, 2, 4, "#94a3b8");
      g.rect(5, 3, 3, 2, "#64748b");
      g.px(9, 6, "#ff2e4c");
      g.px(5, 8, "#ffaa00");
      break;
    }
    case "nomad": {
      // Highway wheel & desert scarf crest
      g.rect(4, 4, 8, 8, "#5c4a35");
      g.rect(5, 5, 6, 6, "#1f1912");
      g.hline(4, 8, 8, "#e67b24");
      g.hline(6, 7, 4, "#ffd485");
      break;
    }
    case "fixer": {
      // Gold-trimmed holo-chip & shades
      g.rect(3, 5, 10, 3, "#141021");
      g.hline(3, 5, 10, "#f5c542");
      g.px(5, 6, "#00f0ff");
      g.px(10, 6, "#00f0ff");
      g.rect(4, 10, 8, 3, "#f5c542");
      g.hline(5, 11, 6, "#fff09e");
      break;
    }
    case "cop": {
      // NCPD shield badge
      g.rect(4, 3, 8, 8, "#1b2e4d");
      g.hline(5, 11, 6, "#1b2e4d");
      g.hline(6, 12, 4, "#1b2e4d");
      g.hline(4, 3, 8, "#ffd13b");
      g.rect(6, 5, 4, 4, "#38a5ff");
      g.px(7, 6, "#ffd13b");
      break;
    }
    case "corporate": {
      // Suit collar & crimson power tie
      g.rect(3, 4, 10, 9, "#222630");
      g.rect(6, 4, 4, 3, "#f1f5f9");
      g.vline(7, 5, 7, "#e63250");
      g.vline(8, 5, 7, "#e63250");
      g.px(10, 7, "#f5c542");
      break;
    }
    case "techie": {
      // Steel servo-wrench & welding goggles
      g.line(4, 11, 11, 4, "#cbd5e1");
      g.rect(9, 3, 4, 4, "#94a3b8");
      g.px(11, 4, role.auraSoft);
      g.rect(3, 10, 3, 3, "#f2b705");
      break;
    }
    case "medtechie":
    default: {
      // Crisp white trauma shield + red cross
      g.rect(3, 3, 10, 10, "#e2e8f0");
      g.rect(7, 5, 2, 6, "#ff2e4d");
      g.rect(5, 7, 6, 2, "#ff2e4d");
      g.hline(3, 12, 10, "#26e6b5");
      break;
    }
  }
}
