import { ICON_GRID, PixelGrid } from "./pixelGrid";

/**
 * All 10 armor item IDs defined in src/data/gear.json.
 */
export const ARMOR_IDS: readonly string[] = [
  "leather_jacket",
  "kevlar_tshirt",
  "light_armor_jacket",
  "medium_armor_jacket",
  "flak_vest",
  "flak_pants",
  "heavy_vest",
  "steel_helmet",
  "nylon_helmet",
  "full_body_armor",
] as const;

function drawIconBackdrop(
  g: PixelGrid,
  cornerColor: string,
  innerGlow: string,
): void {
  g.rect(0, 0, ICON_GRID, ICON_GRID, "#101829");
  g.rect(1, 1, ICON_GRID - 2, ICON_GRID - 2, "#090d18");
  g.rect(3, 3, ICON_GRID - 6, ICON_GRID - 6, innerGlow);

  // Corner HUD bracket ticks
  g.hline(0, 0, 3, cornerColor);
  g.vline(0, 0, 3, cornerColor);
  g.hline(13, 0, 3, cornerColor);
  g.vline(15, 0, 3, cornerColor);
  g.hline(0, 15, 3, cornerColor);
  g.vline(0, 13, 3, cornerColor);
  g.hline(13, 15, 3, cornerColor);
  g.vline(15, 13, 3, cornerColor);
}

/**
 * Draws a crisp 16x16 pixel-art item icon on a dark HUD micro-tile backdrop
 * (#090d18 inner frame) for each of the 10 armor items.
 */
export function drawArmorIcon(g: PixelGrid, armorId: string): void {
  switch (armorId) {
    case "leather_jacket": {
      drawIconBackdrop(g, "#d97742", "#181012");
      // Sleeves & shoulders
      g.rect(2, 4, 2, 7, "#3d1e17");
      g.rect(12, 4, 2, 7, "#3d1e17");
      g.vline(2, 4, 6, "#703a2c");
      g.vline(13, 5, 5, "#29120d");
      // Main leather torso
      g.rect(4, 3, 8, 10, "#4a251d");
      g.vline(4, 4, 8, "#703a2c");
      g.vline(11, 4, 8, "#29120d");
      // Open V-neck tee + wide biker lapels
      g.rect(7, 3, 2, 3, "#1a1d26");
      g.rect(5, 3, 2, 3, "#874736");
      g.rect(9, 3, 2, 3, "#874736");
      g.px(6, 6, "#874736");
      g.px(9, 6, "#874736");
      // Shoulder & lapel silver studs
      g.px(4, 3, "#cbd5e1");
      g.px(11, 3, "#cbd5e1");
      g.px(5, 4, "#e2e8f0");
      g.px(10, 4, "#e2e8f0");
      // Asymmetrical diagonal silver zipper
      g.px(8, 6, "#f8fafc");
      g.px(8, 7, "#e2e8f0");
      g.vline(7, 8, 3, "#cbd5e1");
      // Belt & chrome buckle
      g.hline(4, 11, 8, "#1c100d");
      g.hline(7, 11, 2, "#f1f5f9");
      g.hline(4, 12, 8, "#29120d");
      break;
    }
    case "kevlar_tshirt": {
      drawIconBackdrop(g, "#38bdf8", "#0b1624");
      // Fitted short ballistic sleeves
      g.rect(2, 4, 2, 4, "#1e2a3b");
      g.rect(12, 4, 2, 4, "#1e2a3b");
      g.hline(2, 4, 3, "#4d6d94");
      g.hline(11, 4, 3, "#4d6d94");
      // Torso shell
      g.rect(4, 3, 8, 10, "#1e2a3b");
      g.vline(4, 4, 8, "#334863");
      g.vline(11, 4, 8, "#101722");
      // High reinforced collar
      g.hline(6, 3, 4, "#4d6d94");
      g.hline(7, 3, 2, "#090d18");
      g.hline(6, 4, 4, "#334863");
      // Woven Kevlar diamond highlight pattern
      for (let y = 5; y <= 10; y += 1) {
        for (let x = 5; x <= 10; x += 1) {
          if ((x + y) % 2 === 0) {
            g.px(x, y, "#334863");
          }
        }
      }
      g.px(6, 6, "#60a5fa");
      g.px(9, 6, "#60a5fa");
      g.px(7, 8, "#60a5fa");
      g.px(8, 8, "#60a5fa");
      // Ballistic rib seam & hem
      g.hline(4, 11, 8, "#101722");
      g.hline(4, 12, 8, "#334863");
      break;
    }
    case "light_armor_jacket": {
      drawIconBackdrop(g, "#00e1ff", "#0a1a26");
      // Tall popped tech collar
      g.px(5, 2, "#4d648a");
      g.px(10, 2, "#4d648a");
      g.hline(5, 3, 6, "#3b4d6b");
      g.hline(7, 3, 2, "#090d18");
      // Sleeves with cyan cuffs
      g.rect(2, 4, 2, 7, "#242f42");
      g.rect(12, 4, 2, 7, "#242f42");
      g.vline(2, 4, 6, "#4d648a");
      g.px(2, 10, "#00e1ff");
      g.px(13, 10, "#00e1ff");
      // Jacket torso & sleek chest plates
      g.rect(4, 4, 8, 9, "#242f42");
      g.rect(5, 5, 2, 4, "#4d648a");
      g.rect(9, 5, 2, 4, "#4d648a");
      // Glowing cyan seam piping
      g.vline(7, 4, 8, "#00e1ff");
      g.px(7, 5, "#b8fcff");
      g.vline(8, 4, 8, "#141b29");
      g.px(5, 10, "#00e1ff");
      g.px(10, 10, "#00e1ff");
      // Hem clasp
      g.hline(4, 12, 8, "#141b29");
      g.hline(7, 12, 2, "#94a3b8");
      break;
    }
    case "medium_armor_jacket": {
      drawIconBackdrop(g, "#f59e0b", "#171924");
      // Padded tactical collar
      g.hline(6, 2, 4, "#475569");
      g.hline(7, 3, 2, "#141a24");
      // Flared composite shoulder pauldrons
      g.rect(2, 3, 3, 4, "#5a6980");
      g.rect(11, 3, 3, 4, "#5a6980");
      g.hline(2, 3, 3, "#94a3b8");
      g.hline(11, 3, 3, "#94a3b8");
      g.px(2, 5, "#f59e0b");
      g.px(13, 5, "#f59e0b");
      // Armored forearm bracers
      g.rect(2, 7, 2, 4, "#333d4d");
      g.rect(12, 7, 2, 4, "#333d4d");
      g.px(2, 9, "#64748b");
      g.px(13, 9, "#64748b");
      // Torso & twin segmented breastplates
      g.rect(4, 4, 8, 9, "#2b3545");
      g.rect(4, 4, 3, 5, "#5a6980");
      g.rect(9, 4, 3, 5, "#5a6980");
      g.hline(4, 7, 8, "#141a24");
      g.rect(7, 4, 2, 6, "#1b222e");
      g.hline(7, 6, 2, "#cbd5e1");
      g.px(5, 5, "#f59e0b");
      // Heavy belt & hem
      g.hline(4, 11, 8, "#141a24");
      g.hline(7, 11, 2, "#cbd5e1");
      g.hline(4, 12, 8, "#1b222e");
      break;
    }
    case "flak_vest": {
      drawIconBackdrop(g, "#93b35c", "#10190e");
      // Heavy webbing shoulder straps & brass buckles
      g.rect(4, 2, 2, 3, "#1c2118");
      g.rect(10, 2, 2, 3, "#1c2118");
      g.px(4, 3, "#d4a84f");
      g.px(11, 3, "#d4a84f");
      // Sleeveless military olive flak body
      g.rect(4, 4, 8, 8, "#4b593c");
      g.rect(6, 3, 4, 2, "#090d18");
      // Segmented horizontal flak baffles
      g.hline(4, 5, 8, "#6b7d56");
      g.hline(4, 6, 8, "#2b3622");
      g.hline(4, 7, 8, "#6b7d56");
      g.hline(4, 8, 8, "#2b3622");
      // Center seam
      g.vline(7, 5, 7, "#2b3622");
      g.vline(8, 5, 7, "#2b3622");
      // Twin front frag/ammo pouches with brass snaps
      g.rect(4, 9, 3, 3, "#3d4a30");
      g.rect(9, 9, 3, 3, "#3d4a30");
      g.px(5, 9, "#d4a84f");
      g.px(10, 9, "#d4a84f");
      // Lower webbing strap
      g.hline(4, 12, 8, "#1c2118");
      break;
    }
    case "flak_pants": {
      drawIconBackdrop(g, "#93b35c", "#10190e");
      // Webbing belt & brass buckle
      g.hline(3, 2, 10, "#1c2118");
      g.hline(7, 2, 2, "#d4a84f");
      // Upper flak hips
      g.rect(3, 3, 10, 4, "#445238");
      g.hline(4, 3, 8, "#657853");
      g.vline(7, 3, 4, "#273020");
      // Flak trouser legs
      g.rect(3, 7, 4, 6, "#445238");
      g.rect(9, 7, 4, 6, "#445238");
      // Side thigh cargo pouches
      g.vline(2, 6, 3, "#2b3622");
      g.vline(13, 6, 3, "#2b3622");
      g.px(2, 6, "#d4a84f");
      g.px(13, 6, "#d4a84f");
      // Dark reinforced knee armor pads
      g.rect(3, 8, 4, 3, "#1f261c");
      g.rect(9, 8, 4, 3, "#1f261c");
      g.hline(3, 8, 4, "#7f9469");
      g.hline(9, 8, 4, "#7f9469");
      // Lower cuff straps
      g.hline(3, 12, 4, "#273020");
      g.hline(9, 12, 4, "#273020");
      break;
    }
    case "heavy_vest": {
      drawIconBackdrop(g, "#94a3b8", "#111824");
      // High SWAT ballistic gorget guard
      g.rect(5, 2, 6, 2, "#475569");
      g.hline(6, 2, 4, "#94a3b8");
      g.hline(7, 2, 2, "#090d18");
      // Heavy carrier straps + steel rivets
      g.rect(3, 3, 2, 3, "#1e293b");
      g.rect(11, 3, 2, 3, "#1e293b");
      g.px(4, 4, "#cbd5e1");
      g.px(11, 4, "#cbd5e1");
      // Massive carrier chassis & beveled chest trauma plate
      g.rect(3, 4, 10, 8, "#2d3646");
      g.rect(4, 4, 8, 6, "#475569");
      g.hline(4, 4, 8, "#94a3b8");
      g.vline(4, 4, 6, "#64748b");
      g.hline(4, 9, 8, "#151b26");
      g.vline(11, 5, 5, "#151b26");
      g.hline(6, 6, 4, "#64748b");
      g.px(5, 5, "#ef4444");
      // Lower pelvis / abdomen armor tab
      g.rect(5, 10, 6, 3, "#334155");
      g.hline(5, 10, 6, "#151b26");
      g.hline(6, 13, 4, "#1e293b");
      break;
    }
    case "steel_helmet": {
      drawIconBackdrop(g, "#cbd5e1", "#121926");
      // Rounded polished steel dome
      g.hline(5, 3, 6, "#475569");
      g.hline(4, 4, 8, "#748499");
      g.rect(3, 5, 10, 4, "#748499");
      // Strong metallic specular gleam
      g.hline(5, 4, 4, "#cbd5e1");
      g.hline(5, 5, 2, "#f8fafc");
      g.vline(4, 5, 3, "#cbd5e1");
      g.px(5, 6, "#94a3b8");
      g.vline(12, 5, 4, "#475569");
      g.px(11, 7, "#475569");
      // Flared steel brim
      g.hline(3, 8, 9, "#94a3b8");
      g.hline(2, 9, 12, "#334155");
      // Buckled chinstrap
      g.vline(4, 10, 2, "#3a2c20");
      g.vline(11, 10, 2, "#3a2c20");
      g.px(5, 12, "#3a2c20");
      g.px(10, 12, "#3a2c20");
      g.hline(6, 13, 4, "#2b2119");
      g.px(7, 13, "#f1f5f9");
      break;
    }
    case "nylon_helmet": {
      drawIconBackdrop(g, "#00e1ff", "#0b1824");
      // Angular matte charcoal combat helmet shell
      g.hline(5, 3, 6, "#11161f");
      g.hline(4, 4, 8, "#232b38");
      g.rect(3, 5, 10, 5, "#232b38");
      g.hline(5, 4, 3, "#3d4a5e");
      g.vline(3, 6, 3, "#3d4a5e");
      // High-cut side ARC rail & comms ear pod
      g.rect(3, 7, 3, 3, "#334155");
      g.px(4, 8, "#94a3b8");
      g.hline(6, 9, 7, "#11161f");
      // Forward NVG shroud mount & glowing cyan HUD optic
      g.rect(10, 5, 2, 3, "#64748b");
      g.px(12, 6, "#00e1ff");
      g.px(13, 6, "#99fbff");
      g.px(12, 7, "#0ea5e9");
      // Tactical chinstrap & comms mic boom
      g.px(5, 10, "#11161f");
      g.px(6, 11, "#11161f");
      g.hline(7, 12, 3, "#475569");
      break;
    }
    case "full_body_armor": {
      drawIconBackdrop(g, "#00f0ff", "#0a1926");
      // Enclosed exo-suit visor helmet
      g.hline(6, 2, 4, "#94a3b8");
      g.rect(5, 3, 6, 5, "#475569");
      g.hline(5, 4, 6, "#0f172a");
      g.hline(6, 4, 4, "#00f0ff");
      g.hline(7, 4, 2, "#e0faff");
      g.rect(7, 6, 2, 2, "#64748b");
      // Heavy armored shoulder pauldrons
      g.rect(2, 7, 3, 4, "#475569");
      g.rect(11, 7, 3, 4, "#475569");
      g.hline(2, 7, 3, "#94a3b8");
      g.hline(11, 7, 3, "#94a3b8");
      g.px(2, 9, "#00f0ff");
      g.px(13, 9, "#00f0ff");
      // Segmented chest plate with glowing cyan core vent
      g.rect(5, 8, 6, 5, "#3b4759");
      g.rect(5, 8, 2, 3, "#64748b");
      g.rect(9, 8, 2, 3, "#64748b");
      g.rect(7, 9, 2, 2, "#00f0ff");
      g.px(7, 9, "#e0faff");
      g.hline(5, 12, 6, "#1e293b");
      g.hline(7, 12, 2, "#94a3b8");
      break;
    }
    default: {
      drawIconBackdrop(g, "#64748b", "#121824");
      g.rect(4, 3, 8, 9, "#475569");
      g.hline(5, 12, 6, "#334155");
      g.hline(4, 3, 8, "#94a3b8");
      break;
    }
  }
}

/**
 * Renders leg armor overlays (`flak_pants` or `full_body_armor`) over trousers (y = 29..38).
 */
export function drawCharacterLegArmor(
  g: PixelGrid,
  opts: {
    armorIds: Set<string>;
    leftX: number;
    rightX: number;
    legW: number;
    pulse: boolean;
  },
): void {
  const { armorIds, leftX, rightX, legW, pulse } = opts;

  if (armorIds.has("flak_pants")) {
    // Webbing waistband
    g.hline(leftX, 29, legW, "#273020");
    g.hline(rightX, 29, legW, "#273020");
    // Segmented olive-drab thigh armor panels
    g.rect(leftX, 30, legW, 4, "#445238");
    g.rect(rightX, 30, legW, 4, "#445238");
    g.vline(leftX, 30, 4, "#657853");
    g.vline(rightX + legW - 1, 30, 4, "#657853");
    g.vline(leftX + legW - 1, 30, 4, "#273020");
    g.vline(rightX, 30, 4, "#273020");
    // Side tactical thigh pouches with brass snaps
    g.vline(leftX - 1, 31, 3, "#2b3622");
    g.vline(rightX + legW, 31, 3, "#2b3622");
    g.px(leftX - 1, 31, "#d4a84f");
    g.px(rightX + legW, 31, "#d4a84f");
    // Dark reinforced knee armor plates
    g.rect(leftX, 34, legW, 2, "#1f261c");
    g.rect(rightX, 34, legW, 2, "#1f261c");
    g.hline(leftX, 34, legW, "#7f9469");
    g.hline(rightX, 34, legW, "#7f9469");
    // Lower flak shin panels & ankle strap
    g.rect(leftX, 36, legW, 3, "#445238");
    g.rect(rightX, 36, legW, 3, "#445238");
    g.hline(leftX, 37, legW, "#273020");
    g.hline(rightX, 37, legW, "#273020");
  }

  if (armorIds.has("full_body_armor")) {
    const cyan = pulse ? "#67f7ff" : "#00c8f5";
    // Powered hip/tasset plates
    g.rect(leftX, 29, legW, 2, "#3b4759");
    g.rect(rightX, 29, legW, 2, "#3b4759");
    g.hline(leftX, 29, legW, "#1e293b");
    g.hline(rightX, 29, legW, "#1e293b");
    // Sculpted steel-slate thigh armor
    g.rect(leftX, 31, legW, 3, "#475569");
    g.rect(rightX, 31, legW, 3, "#475569");
    g.vline(leftX, 31, 3, "#94a3b8");
    g.vline(rightX + legW - 1, 31, 3, "#94a3b8");
    g.vline(leftX + legW - 1, 31, 3, "#1e293b");
    g.vline(rightX, 31, 3, "#1e293b");
    // Articulated beveled knee guards
    g.hline(leftX, 34, legW, "#94a3b8");
    g.hline(rightX, 34, legW, "#94a3b8");
    g.hline(leftX, 35, legW, "#1e293b");
    g.hline(rightX, 35, legW, "#1e293b");
    // Armored shin greaves with cyan servo indicator
    g.rect(leftX, 36, legW, 3, "#475569");
    g.rect(rightX, 36, legW, 3, "#475569");
    g.vline(leftX, 36, 3, "#64748b");
    g.vline(rightX + legW - 1, 36, 3, "#64748b");
    g.px(leftX, 37, cyan);
    g.px(rightX + legW - 1, 37, cyan);
    g.hline(leftX, 38, legW, "#1e293b");
    g.hline(rightX, 38, legW, "#1e293b");
  }
}

/**
 * Renders layered torso armor in outermost-on-top order:
 * kevlar_tshirt -> leather_jacket / light_armor_jacket / medium_armor_jacket -> flak_vest -> heavy_vest -> full_body_armor.
 */
export function drawCharacterTorsoArmor(
  g: PixelGrid,
  opts: {
    armorIds: Set<string>;
    txLeft: number;
    txRight: number;
    torsoW: number;
    bobY: number;
    pulse: boolean;
  },
): void {
  const { armorIds, txLeft, txRight, torsoW, bobY, pulse } = opts;
  const midL = txLeft + Math.floor(torsoW / 2) - 1;
  const midR = midL + 1;

  // 1. Base under-layer: Kevlar T-shirt / vest
  if (armorIds.has("kevlar_tshirt")) {
    g.rect(txLeft, 17 + bobY, torsoW, 12, "#1c2738");
    g.vline(txLeft, 18 + bobY, 10, "#2f425e");
    g.vline(txRight, 18 + bobY, 10, "#101722");
    // High reinforced ballistic mock-neck collar
    g.hline(midL - 1, 17 + bobY, 4, "#3b5273");
    g.hline(midL, 17 + bobY, 2, "#101722");
    g.hline(txLeft + 1, 18 + bobY, torsoW - 2, "#2f425e");
    // Kevlar aramid weave pattern across chest
    for (let y = 19; y <= 24; y += 1) {
      for (let x = txLeft + 1; x <= txRight - 1; x += 1) {
        if ((x + y) % 2 === 0) {
          g.px(x, y + bobY, "#283952");
        }
      }
    }
    g.px(midL - 1, 20 + bobY, "#4c6b96");
    g.px(midR + 1, 20 + bobY, "#4c6b96");
    g.px(midL, 22 + bobY, "#4c6b96");
    g.px(midR, 22 + bobY, "#4c6b96");
    // Rib seam & tucked hem
    g.hline(txLeft + 1, 25 + bobY, torsoW - 2, "#101722");
    g.hline(txLeft, 28 + bobY, torsoW, "#101722");
  }

  // 2. Leather jacket (outer biker leather over optional Kevlar tee)
  if (armorIds.has("leather_jacket")) {
    if (!armorIds.has("kevlar_tshirt")) {
      g.rect(midL, 17 + bobY, 2, 3, "#1a1d26");
    }
    g.rect(txLeft, 17 + bobY, midL - txLeft, 3, "#4a251d");
    g.rect(midR + 1, 17 + bobY, txRight - midR, 3, "#4a251d");
    g.rect(txLeft, 20 + bobY, torsoW, 9, "#4a251d");
    g.vline(txLeft, 18 + bobY, 10, "#703a2c");
    g.vline(txRight, 18 + bobY, 10, "#29120d");
    g.hline(txLeft, 17 + bobY, midL - txLeft, "#29120d");
    g.hline(midR + 1, 17 + bobY, txRight - midR, "#29120d");
    // Shoulder studs
    g.px(txLeft, 17 + bobY, "#e2e8f0");
    g.px(txRight, 17 + bobY, "#e2e8f0");
    // Wide biker lapels & silver snap studs
    g.px(midL - 1, 18 + bobY, "#874736");
    g.px(midL - 1, 19 + bobY, "#874736");
    g.px(midL, 20 + bobY, "#874736");
    g.px(midR + 1, 18 + bobY, "#874736");
    g.px(midR + 1, 19 + bobY, "#703a2c");
    g.px(midR, 20 + bobY, "#703a2c");
    g.px(txLeft + 1, 19 + bobY, "#e2e8f0");
    g.px(txRight - 1, 19 + bobY, "#e2e8f0");
    // Asymmetrical silver biker zipper
    g.vline(midR, 20 + bobY, 3, "#cbd5e1");
    g.px(midR, 20 + bobY, "#f8fafc");
    g.vline(midL, 22 + bobY, 5, "#94a3b8");
    // Biker belt & chrome buckle
    g.hline(txLeft, 27 + bobY, torsoW, "#1c100d");
    g.px(midL, 27 + bobY, "#e2e8f0");
    g.px(midR, 27 + bobY, "#cbd5e1");
    g.hline(txLeft, 28 + bobY, torsoW, "#29120d");
  }

  // 3. Light armor jacket (street-tech padded collar, neon seam piping & sleek plates)
  if (armorIds.has("light_armor_jacket")) {
    const neon = pulse ? "#67f7ff" : "#00d9f5";
    g.rect(txLeft, 17 + bobY, torsoW, 12, "#242f42");
    g.vline(txLeft, 18 + bobY, 10, "#3b4d6b");
    g.vline(txRight, 18 + bobY, 10, "#141b29");
    // Padded high tech collar
    g.px(midL - 2, 16 + bobY, "#3b4d6b");
    g.px(midR + 2, 16 + bobY, "#3b4d6b");
    g.hline(midL - 2, 17 + bobY, 6, "#4d648a");
    g.hline(midL, 17 + bobY, 2, "#141b29");
    g.px(midL - 2, 17 + bobY, neon);
    g.px(midR + 2, 17 + bobY, neon);
    // Sleek chest plates & central neon piping
    g.rect(txLeft + 1, 19 + bobY, midL - txLeft, 5, "#3b4d6b");
    g.rect(midR, 19 + bobY, txRight - midR, 5, "#3b4d6b");
    g.hline(txLeft + 1, 23 + bobY, torsoW - 2, "#4d648a");
    g.vline(midL, 19 + bobY, 8, neon);
    g.vline(midR, 19 + bobY, 8, "#141b29");
    // Neon pocket seam accents & waist clasp
    g.px(txLeft + 1, 25 + bobY, neon);
    g.px(txRight - 1, 25 + bobY, neon);
    g.hline(txLeft, 27 + bobY, torsoW, "#141b29");
    g.px(midL, 27 + bobY, "#94a3b8");
    g.px(midR, 27 + bobY, "#64748b");
    g.hline(txLeft, 28 + bobY, torsoW, "#0f1521");
  }

  // 4. Medium armor jacket (bulkier tactical jacket with shoulder flanges & twin chest plates)
  if (armorIds.has("medium_armor_jacket")) {
    const sideW = midL - txLeft;
    g.rect(txLeft, 17 + bobY, torsoW, 12, "#2b3545");
    // Reinforced shoulder collar flanges
    g.rect(txLeft - 1, 17 + bobY, 2, 3, "#5a6980");
    g.rect(txRight, 17 + bobY, 2, 3, "#5a6980");
    g.hline(txLeft - 1, 17 + bobY, 2, "#7c8ea8");
    g.hline(txRight, 17 + bobY, 2, "#7c8ea8");
    // Heavy padded collar
    g.hline(midL - 2, 17 + bobY, 6, "#475569");
    g.hline(midL, 17 + bobY, 2, "#141a24");
    // Composite twin chest armor plates
    g.rect(txLeft, 19 + bobY, sideW, 5, "#475569");
    g.rect(midR + 1, 19 + bobY, sideW, 5, "#475569");
    g.hline(txLeft, 19 + bobY, sideW, "#7c8ea8");
    g.hline(midR + 1, 19 + bobY, sideW, "#7c8ea8");
    g.hline(txLeft, 22 + bobY, torsoW, "#18202c");
    g.hline(txLeft, 23 + bobY, sideW, "#5a6980");
    g.hline(midR + 1, 23 + bobY, sideW, "#5a6980");
    // Center latch channel & tactical amber marker
    g.vline(midL, 18 + bobY, 9, "#141a24");
    g.vline(midR, 18 + bobY, 9, "#141a24");
    g.px(midL, 21 + bobY, "#94a3b8");
    g.px(midR, 21 + bobY, "#94a3b8");
    g.px(txLeft + 1, 20 + bobY, "#f59e0b");
    // Tactical belt & hem
    g.hline(txLeft, 27 + bobY, torsoW, "#141a24");
    g.px(midL, 27 + bobY, "#cbd5e1");
    g.px(midR, 27 + bobY, "#cbd5e1");
    g.hline(txLeft, 28 + bobY, torsoW, "#141a24");
  }

  // 5. Flak vest (sleeveless military olive-drab segmented vest with straps & pouch buckles)
  if (armorIds.has("flak_vest")) {
    const strapW = torsoW >= 8 ? 2 : 1;
    // Heavy webbing shoulder straps leaving neck & armhole edges framed
    g.rect(txLeft + 1, 17 + bobY, strapW, 3, "#1c2118");
    g.rect(txRight - strapW, 17 + bobY, strapW, 3, "#1c2118");
    g.px(txLeft + 1, 18 + bobY, "#d4a84f");
    g.px(txRight - 1, 18 + bobY, "#d4a84f");
    // Segmented olive-drab flak baffles
    g.hline(txLeft + 1, 19 + bobY, torsoW - 2, "#6b7d56");
    g.hline(txLeft, 20 + bobY, torsoW, "#4b593c");
    g.hline(txLeft, 21 + bobY, torsoW, "#2b3622");
    g.hline(txLeft, 22 + bobY, torsoW, "#6b7d56");
    g.hline(txLeft, 23 + bobY, torsoW, "#4b593c");
    g.hline(txLeft, 24 + bobY, torsoW, "#2b3622");
    // Twin lower frag/ammo pouches with brass snaps
    g.rect(txLeft, 25 + bobY, torsoW, 2, "#3d4a30");
    g.rect(txLeft + 1, 25 + bobY, 2, 2, "#2b3622");
    g.rect(txRight - 2, 25 + bobY, 2, 2, "#2b3622");
    g.px(txLeft + 1, 25 + bobY, "#d4a84f");
    g.px(txRight - 1, 25 + bobY, "#d4a84f");
    // Lower webbing belt strap
    g.hline(txLeft, 27 + bobY, torsoW, "#1c2118");
  }

  // 6. Heavy combat vest (massive gunmetal SWAT plate carrier & collar gorget)
  if (armorIds.has("heavy_vest")) {
    // Ballistic collar guard & shoulder straps
    g.px(midL - 2, 16 + bobY, "#64748b");
    g.px(midR + 2, 16 + bobY, "#64748b");
    g.hline(midL - 2, 17 + bobY, 6, "#475569");
    g.hline(midL - 1, 18 + bobY, 4, "#334155");
    g.vline(txLeft + 1, 17 + bobY, 2, "#1e293b");
    g.vline(txRight - 1, 17 + bobY, 2, "#1e293b");
    g.px(txLeft + 1, 18 + bobY, "#94a3b8");
    g.px(txRight - 1, 18 + bobY, "#94a3b8");
    // Heavy carrier chassis
    g.rect(txLeft, 19 + bobY, torsoW, 8, "#242c3a");
    g.vline(txRight, 19 + bobY, 8, "#151b26");
    // Thick beveled front trauma plate
    g.rect(txLeft + 1, 19 + bobY, torsoW - 2, 6, "#3f4c61");
    g.hline(txLeft + 1, 19 + bobY, torsoW - 2, "#94a3b8");
    g.vline(txLeft + 1, 19 + bobY, 6, "#64748b");
    g.vline(txRight - 1, 20 + bobY, 5, "#151b26");
    g.hline(txLeft + 1, 24 + bobY, torsoW - 2, "#151b26");
    g.hline(midL, 21 + bobY, 2, "#64748b");
    g.px(txLeft + 2, 20 + bobY, "#ef4444");
    // Cummerbund & lower abdomen/pelvis armor flap
    g.hline(txLeft, 25 + bobY, torsoW, "#1e293b");
    g.hline(txLeft, 26 + bobY, torsoW, "#334155");
    g.hline(txLeft, 27 + bobY, torsoW, "#0f172a");
    g.hline(midL - 1, 28 + bobY, 4, "#3f4c61");
    g.hline(midL, 29 + bobY, 2, "#1e293b");
  }

  // 7. Full body armor suit (outermost powered combat armor chassis)
  if (armorIds.has("full_body_armor")) {
    const core = pulse ? "#67f7ff" : "#00c8f5";
    const sideW = midL - txLeft;
    // Full exoskeleton base + shoulder collar armor
    g.rect(txLeft, 17 + bobY, torsoW, 13, "#1e293b");
    g.rect(txLeft - 1, 17 + bobY, 2, 3, "#475569");
    g.rect(txRight, 17 + bobY, 2, 3, "#475569");
    g.hline(midL - 2, 17 + bobY, 6, "#64748b");
    g.hline(midL, 17 + bobY, 2, "#94a3b8");
    // Dual sculpted chest armor plates & glowing cyan core vent
    g.rect(txLeft, 18 + bobY, torsoW, 6, "#3b4759");
    g.hline(txLeft, 18 + bobY, torsoW, "#94a3b8");
    g.rect(txLeft, 19 + bobY, sideW, 4, "#64748b");
    g.rect(midR + 1, 19 + bobY, sideW, 4, "#64748b");
    g.rect(midL, 19 + bobY, 2, 4, "#0f172a");
    g.hline(midL, 20 + bobY, 2, core);
    g.hline(txLeft, 23 + bobY, torsoW, "#1e293b");
    // Segmented abdominal armor ribs
    g.hline(txLeft + 1, 24 + bobY, torsoW - 2, "#475569");
    g.hline(txLeft + 1, 25 + bobY, torsoW - 2, "#1e293b");
    g.hline(txLeft + 1, 26 + bobY, torsoW - 2, "#475569");
    // Heavy belt & armored pelvis guard
    g.hline(txLeft, 27 + bobY, torsoW, "#0f172a");
    g.hline(midL, 27 + bobY, 2, "#94a3b8");
    g.hline(midL - 1, 28 + bobY, 4, "#475569");
    g.hline(midL, 29 + bobY, 2, "#3b4759");
  }
}

function drawSingleArmArmor(
  g: PixelGrid,
  armorIds: Set<string>,
  ax: number,
  armW: number,
  isLeft: boolean,
  isChrome: boolean,
  bobY: number,
  pulse: boolean,
): void {
  const outerX = isLeft ? ax : ax + armW - 1;
  const innerX = isLeft ? ax + armW - 1 : ax;

  // Leather jacket sleeves (or shoulder cap over chrome cyberarm)
  if (armorIds.has("leather_jacket")) {
    if (isChrome) {
      g.rect(ax, 18 + bobY, armW, 2, "#3d1e17");
      g.px(outerX, 18 + bobY, "#cbd5e1");
    } else {
      g.rect(ax, 18 + bobY, armW, 9, "#3d1e17");
      g.vline(outerX, 18 + bobY, 8, "#6b3529");
      g.vline(innerX, 18 + bobY, 8, "#29120d");
      g.px(outerX, 18 + bobY, "#cbd5e1");
      g.px(outerX, 25 + bobY, "#cbd5e1");
      g.hline(ax, 26 + bobY, armW, "#1c100d");
    }
  }

  // Light armor jacket sleeves + elbow pad + cyan cuff
  if (armorIds.has("light_armor_jacket")) {
    const neon = pulse ? "#67f7ff" : "#00d9f5";
    if (isChrome) {
      g.rect(ax, 18 + bobY, armW, 2, "#3b4d6b");
      g.px(outerX, 18 + bobY, neon);
    } else {
      g.rect(ax, 18 + bobY, armW, 9, "#242f42");
      g.vline(outerX, 18 + bobY, 8, "#3b4d6b");
      g.vline(innerX, 18 + bobY, 8, "#141b29");
      g.px(outerX, 18 + bobY, neon);
      g.rect(ax, 22 + bobY, armW, 2, "#4d648a");
      g.hline(ax, 26 + bobY, armW, "#0284c7");
    }
  }

  // Medium armor jacket composite pauldrons + forearm bracer
  if (armorIds.has("medium_armor_jacket")) {
    // Shoulder pauldron (always drawn, including over cyberarm)
    g.rect(ax, 17 + bobY, armW, 4, "#475569");
    g.hline(ax, 17 + bobY, armW, "#7c8ea8");
    g.vline(outerX, 18 + bobY, 2, "#5a6980");
    g.px(outerX, 19 + bobY, "#f59e0b");
    g.hline(ax, 20 + bobY, armW, "#1b222e");
    if (!isChrome) {
      g.rect(ax, 21 + bobY, armW, 2, "#2b3545");
      g.rect(ax, 23 + bobY, armW, 4, "#333d4d");
      g.vline(outerX, 23 + bobY, 3, "#5a6980");
      g.hline(ax, 26 + bobY, armW, "#141a24");
    }
  }

  // Full body armor powered pauldrons + segmented gauntlets
  if (armorIds.has("full_body_armor")) {
    const cyan = pulse ? "#67f7ff" : "#00c8f5";
    // Heavy powered pauldron (always drawn, including over cyberarm)
    g.rect(ax, 17 + bobY, armW, 4, "#475569");
    g.hline(ax, 17 + bobY, armW, "#94a3b8");
    g.vline(outerX, 18 + bobY, 3, "#64748b");
    g.px(outerX, 19 + bobY, cyan);
    g.hline(ax, 20 + bobY, armW, "#1e293b");
    if (!isChrome) {
      g.hline(ax, 21 + bobY, armW, "#3b4759");
      g.hline(ax, 22 + bobY, armW, "#1e293b");
      // Forearm gauntlet
      g.rect(ax, 23 + bobY, armW, 4, "#475569");
      g.vline(outerX, 23 + bobY, 4, "#94a3b8");
      g.px(outerX, 25 + bobY, cyan);
      g.hline(ax, 26 + bobY, armW, "#1e293b");
      // Armored gauntleted hand
      g.rect(ax, 27 + bobY, armW, 2, "#334155");
      g.px(outerX, 27 + bobY, "#64748b");
    }
  }
}

/**
 * Renders armored sleeves, elbow guards, and shoulder pauldrons for
 * leather_jacket, light_armor_jacket, medium_armor_jacket, and full_body_armor.
 */
export function drawCharacterArmArmor(
  g: PixelGrid,
  opts: {
    armorIds: Set<string>;
    leftArmX: number;
    rightArmX: number;
    armW: number;
    bobY: number;
    pulse: boolean;
    leftChrome?: boolean;
    rightChrome?: boolean;
  },
): void {
  const {
    armorIds,
    leftArmX,
    rightArmX,
    armW,
    bobY,
    pulse,
    leftChrome = false,
    rightChrome = false,
  } = opts;

  drawSingleArmArmor(g, armorIds, leftArmX, armW, true, leftChrome, bobY, pulse);
  drawSingleArmArmor(g, armorIds, rightArmX, armW, false, rightChrome, bobY, pulse);
}

/**
 * Renders head armor: full_body_armor enclosed visor helmet, OR nylon_helmet, OR steel_helmet.
 * Returns true if a helmet was drawn, false otherwise.
 */
export function drawCharacterHeadArmor(
  g: PixelGrid,
  opts: { armorIds: Set<string>; bobY: number; pulse: boolean },
): boolean {
  const { armorIds, bobY, pulse } = opts;

  if (armorIds.has("full_body_armor")) {
    const visor = pulse ? "#67f7ff" : "#00d4ff";
    // Enclosed armored cranium & crest
    g.hline(13, 4 + bobY, 6, "#1e293b");
    g.rect(12, 5 + bobY, 8, 4, "#475569");
    g.hline(13, 5 + bobY, 5, "#94a3b8");
    g.hline(13, 6 + bobY, 6, "#64748b");
    g.vline(15, 4 + bobY, 3, "#64748b");
    g.vline(16, 4 + bobY, 3, "#64748b");
    // Side ear comms pods & cheek armor
    g.vline(11, 7 + bobY, 6, "#1e293b");
    g.vline(20, 7 + bobY, 6, "#1e293b");
    g.px(11, 6 + bobY, "#94a3b8");
    g.px(20, 6 + bobY, "#94a3b8");
    g.px(11, 9 + bobY, "#64748b");
    g.px(20, 9 + bobY, "#64748b");
    // Recessed visor & glowing cyan optical slit
    g.rect(12, 9 + bobY, 8, 3, "#0f172a");
    g.hline(13, 10 + bobY, 6, visor);
    g.hline(15, 10 + bobY, 2, "#e0faff");
    // Respirator mandible & neck seal
    g.rect(12, 12 + bobY, 8, 2, "#3b4759");
    g.hline(13, 14 + bobY, 6, "#1e293b");
    g.rect(15, 12 + bobY, 2, 2, "#64748b");
    g.px(15, 13 + bobY, "#0f172a");
    g.px(16, 13 + bobY, "#0f172a");
    g.hline(13, 15 + bobY, 6, "#1e293b");
    return true;
  }

  if (armorIds.has("nylon_helmet")) {
    const hudCyan = pulse ? "#67f7ff" : "#00e1ff";
    // Modern matte charcoal ballistic helmet shell
    g.hline(13, 4 + bobY, 6, "#11161f");
    g.rect(12, 5 + bobY, 8, 4, "#232b38");
    g.hline(13, 5 + bobY, 3, "#3d4a5e");
    g.vline(12, 6 + bobY, 2, "#3d4a5e");
    g.hline(12, 8 + bobY, 8, "#11161f");
    // Side ear armor & ARC rails
    g.vline(11, 7 + bobY, 4, "#161c26");
    g.vline(20, 7 + bobY, 4, "#161c26");
    g.px(11, 8 + bobY, "#64748b");
    g.px(20, 8 + bobY, "#64748b");
    // Forehead NVG shroud mount & cyan LED
    g.rect(15, 5 + bobY, 2, 3, "#475569");
    g.px(15, 6 + bobY, "#94a3b8");
    g.px(16, 7 + bobY, hudCyan);
    // Tactical flip-down HUD monocle lens over right brow
    g.hline(17, 9 + bobY, 2, "#0e4d64");
    g.px(17, 9 + bobY, hudCyan);
    // Chinstrap & cheek comms mic
    g.px(12, 11 + bobY, "#11161f");
    g.px(12, 12 + bobY, "#11161f");
    g.px(13, 13 + bobY, "#475569");
    g.px(19, 11 + bobY, "#11161f");
    g.px(19, 12 + bobY, "#11161f");
    return true;
  }

  if (armorIds.has("steel_helmet")) {
    // Classic polished steel dome helmet
    g.hline(14, 4 + bobY, 4, "#334155");
    g.hline(12, 5 + bobY, 8, "#748499");
    g.rect(12, 6 + bobY, 8, 2, "#748499");
    // Strong metallic specular highlight band
    g.hline(13, 5 + bobY, 4, "#cbd5e1");
    g.px(14, 5 + bobY, "#f1f5f9");
    g.vline(13, 6 + bobY, 2, "#cbd5e1");
    g.px(13, 6 + bobY, "#f8fafc");
    g.px(14, 6 + bobY, "#cbd5e1");
    g.vline(19, 6 + bobY, 2, "#475569");
    g.px(18, 7 + bobY, "#475569");
    // Flared steel brim
    g.hline(11, 8 + bobY, 10, "#334155");
    g.hline(13, 8 + bobY, 5, "#94a3b8");
    // Buckled leather chinstrap
    g.vline(12, 11 + bobY, 3, "#2b2119");
    g.vline(19, 11 + bobY, 3, "#2b2119");
    g.px(13, 14 + bobY, "#3a2c20");
    g.px(18, 14 + bobY, "#3a2c20");
    g.hline(14, 15 + bobY, 4, "#2b2119");
    g.px(14, 15 + bobY, "#cbd5e1");
    return true;
  }

  return false;
}
