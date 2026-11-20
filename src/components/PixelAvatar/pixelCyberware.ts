import { ICON_GRID, type PixelGrid } from "./pixelGrid";

export const CYBERWARE_IDS: readonly string[] = [
  "interface_plugs",
  "neural_processor",
  "reflex_booster",
  "smartgun_link",
  "cyberoptic",
  "low_light",
  "cyberaudio",
  "cyberarm",
  "cyberleg",
  "muscle_bone_lace",
  "skinweave",
  "subdermal_armor",
  "rippers",
  "wolvers",
  "light_tattoo",
  "biomonitor",
];

export interface TorsoCyberwareOptions {
  cyberIds: Set<string>;
  txLeft: number;
  txRight: number;
  torsoW: number;
  bobY: number;
  pulse: boolean;
}

export interface HeadCyberwareOptions {
  cyberIds: Set<string>;
  bobY: number;
  pulse: boolean;
}

export interface LimbCyberwareOptions {
  cyberIds: Set<string>;
  cyberarmCount: number;
  cyberlegCount: number;
  leftArmX: number;
  rightArmX: number;
  armW: number;
  leftLegX: number;
  rightLegX: number;
  legW: number;
  bobY: number;
  pulse: boolean;
  hasAffectationCyberlimb: boolean;
}

function getIconBracketColor(cyberwareId: string): string {
  switch (cyberwareId) {
    case "interface_plugs":
    case "neural_processor":
    case "cyberaudio":
      return "#00d4ff";
    case "reflex_booster":
      return "#ffaa00";
    case "smartgun_link":
    case "cyberoptic":
      return "#ff2e54";
    case "low_light":
    case "biomonitor":
      return "#00ffaa";
    case "cyberarm":
    case "cyberleg":
    case "skinweave":
      return "#94a3b8";
    case "muscle_bone_lace":
    case "subdermal_armor":
      return "#f59e0b";
    case "rippers":
    case "wolvers":
      return "#e2e8f0";
    case "light_tattoo":
      return "#ff2e97";
    default:
      return "#38bdf8";
  }
}

export function drawCyberwareIcon(g: PixelGrid, cyberwareId: string): void {
  const accent = getIconBracketColor(cyberwareId);

  // Dark HUD micro-tile frame with #090d18 inner backdrop
  g.rect(0, 0, ICON_GRID, ICON_GRID, "#131c31");
  g.rect(1, 1, ICON_GRID - 2, ICON_GRID - 2, "#090d18");
  g.hline(0, 0, 3, accent);
  g.vline(0, 0, 3, accent);
  g.hline(13, 15, 3, accent);
  g.vline(15, 13, 3, accent);

  switch (cyberwareId) {
    case "interface_plugs": {
      // Twin silver/cyan data-plugs + fiber-cable bus
      g.px(4, 3, "#f8fafc");
      g.px(4, 4, "#cbd5e1");
      g.hline(3, 5, 3, "#94a3b8");
      g.hline(3, 6, 3, "#00f0ff");
      g.rect(3, 7, 3, 3, "#64748b");
      g.vline(3, 7, 3, "#cbd5e1");
      g.vline(4, 10, 2, "#1e293b");

      g.px(11, 3, "#f8fafc");
      g.px(11, 4, "#cbd5e1");
      g.hline(10, 5, 3, "#94a3b8");
      g.hline(10, 6, 3, "#00f0ff");
      g.rect(10, 7, 3, 3, "#64748b");
      g.vline(10, 7, 3, "#cbd5e1");
      g.vline(11, 10, 2, "#1e293b");

      g.hline(4, 12, 8, "#0284c7");
      g.hline(5, 13, 6, "#00f0ff");
      break;
    }

    case "neural_processor": {
      // Neural microchip die + glowing spine conduit & pins
      g.rect(5, 5, 6, 6, "#1e293b");
      g.hline(5, 5, 6, "#64748b");
      g.vline(5, 5, 6, "#64748b");
      g.rect(7, 7, 2, 2, "#00f0ff");
      g.px(6, 6, "#38bdf8");
      g.px(9, 9, "#38bdf8");

      g.vline(6, 3, 2, "#00f0ff");
      g.vline(9, 3, 2, "#00f0ff");
      g.hline(3, 6, 2, "#94a3b8");
      g.hline(3, 9, 2, "#00f0ff");
      g.hline(11, 6, 2, "#00f0ff");
      g.hline(11, 9, 2, "#94a3b8");

      g.vline(7, 11, 3, "#475569");
      g.vline(8, 11, 3, "#00d4ff");
      g.px(7, 13, "#38bdf8");
      break;
    }

    case "reflex_booster": {
      // Dorsal spine column + amber/crimson Kerenzikov speed surge
      g.vline(4, 3, 10, "#94a3b8");
      g.vline(5, 3, 10, "#334155");
      g.px(3, 4, "#cbd5e1");
      g.px(3, 7, "#cbd5e1");
      g.px(3, 10, "#cbd5e1");

      g.px(9, 3, "#fde047");
      g.hline(8, 4, 3, "#ffaa00");
      g.hline(7, 5, 3, "#ffaa00");
      g.hline(7, 6, 6, "#fde047");
      g.hline(7, 7, 5, "#ff6b00");
      g.hline(9, 8, 3, "#ff2e54");
      g.hline(8, 9, 3, "#ff2e54");
      g.hline(7, 10, 2, "#ff2e54");
      g.px(7, 11, "#ff2e54");
      g.px(7, 12, "#ff859d");
      break;
    }

    case "smartgun_link": {
      // Precision crimson targeting reticle + palm link trace
      g.hline(3, 3, 3, "#ff2e54");
      g.vline(3, 3, 3, "#ff2e54");
      g.hline(10, 3, 3, "#ff2e54");
      g.vline(12, 3, 3, "#ff2e54");
      g.hline(3, 12, 3, "#ff2e54");
      g.vline(3, 10, 3, "#ff2e54");
      g.hline(10, 12, 3, "#cbd5e1");
      g.vline(12, 10, 3, "#cbd5e1");

      g.hline(7, 4, 2, "#94a3b8");
      g.hline(7, 11, 2, "#94a3b8");
      g.vline(4, 7, 2, "#94a3b8");
      g.vline(11, 7, 2, "#94a3b8");

      g.rect(7, 7, 2, 2, "#ff2e54");
      g.px(7, 7, "#ffb3c1");
      g.px(9, 9, "#cbd5e1");
      g.px(10, 10, "#ff6b81");
      g.px(11, 11, "#cbd5e1");
      break;
    }

    case "cyberoptic": {
      // Chrome cybernetic eyeball + glowing crimson bionic iris
      g.hline(5, 3, 6, "#475569");
      g.hline(5, 12, 6, "#334155");
      g.rect(4, 4, 8, 8, "#94a3b8");
      g.rect(3, 6, 10, 4, "#64748b");
      g.hline(5, 4, 5, "#e2e8f0");
      g.px(4, 5, "#cbd5e1");

      g.rect(6, 6, 4, 4, "#1e1b2e");
      g.px(6, 6, "#ff2e54");
      g.hline(7, 6, 2, "#ff5c7a");
      g.px(9, 6, "#ff2e54");
      g.vline(6, 7, 2, "#ff2e54");
      g.vline(9, 7, 2, "#ff2e54");
      g.hline(7, 9, 2, "#ff2e54");
      g.rect(7, 7, 2, 2, "#450a14");
      g.px(7, 7, "#fff1f2");

      g.px(13, 8, "#475569");
      g.px(13, 9, "#ff2e54");
      break;
    }

    case "low_light": {
      // Night-vision housing with concentric emerald/cyan optic ring
      g.hline(5, 3, 6, "#475569");
      g.hline(5, 12, 6, "#334155");
      g.vline(3, 5, 6, "#475569");
      g.vline(12, 5, 6, "#475569");
      g.rect(4, 4, 8, 8, "#1e293b");

      g.hline(6, 5, 4, "#00ffaa");
      g.hline(6, 10, 4, "#00d48f");
      g.vline(5, 6, 4, "#00ffaa");
      g.vline(10, 6, 4, "#00d48f");

      g.rect(6, 6, 4, 4, "#042f2e");
      g.rect(7, 7, 2, 2, "#22d3ee");
      g.px(7, 7, "#a7f3d0");
      g.px(7, 6, "#10b981");
      g.px(8, 9, "#10b981");

      g.px(4, 4, "#94a3b8");
      g.px(11, 4, "#94a3b8");
      g.px(4, 11, "#94a3b8");
      g.px(11, 11, "#94a3b8");
      break;
    }

    case "cyberaudio": {
      // Chrome cyber-ear amplifier + antenna + cyan acoustic waves
      g.px(5, 2, "#00f0ff");
      g.px(5, 3, "#cbd5e1");
      g.rect(4, 4, 4, 8, "#94a3b8");
      g.vline(3, 5, 5, "#cbd5e1");
      g.hline(4, 4, 4, "#e2e8f0");
      g.rect(5, 6, 3, 4, "#1e293b");
      g.vline(6, 7, 2, "#00f0ff");
      g.hline(4, 12, 3, "#64748b");
      g.px(5, 12, "#38bdf8");

      g.vline(10, 6, 4, "#38bdf8");
      g.px(11, 5, "#0284c7");
      g.px(11, 10, "#0284c7");
      g.vline(12, 5, 6, "#00f0ff");
      break;
    }

    case "cyberarm": {
      // Articulated chrome arm bent at hydraulic elbow + cyber-hand
      g.rect(3, 3, 4, 3, "#94a3b8");
      g.hline(3, 3, 3, "#e2e8f0");
      g.px(4, 4, "#334155");

      g.rect(3, 6, 3, 4, "#64748b");
      g.vline(3, 6, 4, "#cbd5e1");

      g.rect(3, 9, 4, 3, "#334155");
      g.px(3, 10, "#e2e8f0");
      g.px(4, 10, "#00f0ff");

      g.rect(7, 8, 4, 3, "#94a3b8");
      g.hline(7, 8, 4, "#e2e8f0");
      g.hline(7, 10, 4, "#475569");

      g.rect(11, 8, 2, 3, "#cbd5e1");
      g.px(12, 7, "#e2e8f0");
      g.px(13, 7, "#94a3b8");
      g.px(13, 9, "#e2e8f0");
      g.px(13, 11, "#94a3b8");
      break;
    }

    case "cyberleg": {
      // Articulated chrome leg with knee piston, cyan LED & armored boot
      g.rect(5, 3, 4, 2, "#94a3b8");
      g.hline(5, 3, 3, "#e2e8f0");
      g.rect(5, 5, 4, 3, "#64748b");
      g.vline(5, 5, 3, "#cbd5e1");

      g.rect(4, 8, 5, 2, "#1e293b");
      g.px(5, 8, "#00f0ff");
      g.px(7, 8, "#cbd5e1");
      g.px(8, 9, "#94a3b8");

      g.rect(5, 10, 3, 2, "#94a3b8");
      g.vline(5, 10, 2, "#e2e8f0");
      g.vline(8, 10, 2, "#475569");

      g.rect(5, 12, 7, 2, "#475569");
      g.hline(6, 12, 5, "#cbd5e1");
      g.hline(5, 13, 7, "#1e293b");
      g.px(11, 13, "#94a3b8");
      break;
    }

    case "muscle_bone_lace": {
      // Titanium bone shaft + braided striated synthetic muscle weave
      g.hline(3, 3, 4, "#cbd5e1");
      g.hline(3, 12, 4, "#cbd5e1");
      g.vline(4, 3, 10, "#e2e8f0");
      g.vline(5, 3, 10, "#94a3b8");

      g.rect(6, 5, 6, 6, "#7f1d1d");
      g.hline(7, 4, 4, "#991b1b");
      g.hline(7, 11, 4, "#991b1b");

      g.px(6, 6, "#ef4444");
      g.px(7, 5, "#ef4444");
      g.px(8, 6, "#ef4444");
      g.px(9, 5, "#ef4444");
      g.px(10, 6, "#ef4444");
      g.px(11, 7, "#ef4444");

      g.px(7, 8, "#fca5a5");
      g.px(8, 9, "#fca5a5");
      g.px(9, 8, "#fca5a5");
      g.px(10, 9, "#fca5a5");
      g.px(11, 8, "#fca5a5");

      g.px(6, 7, "#e2e8f0");
      g.px(8, 7, "#cbd5e1");
      g.px(10, 7, "#e2e8f0");
      g.px(7, 10, "#cbd5e1");
      g.px(9, 10, "#cbd5e1");
      break;
    }

    case "skinweave": {
      // Ballistic metallic hexagonal dermal honeycomb mesh
      g.rect(4, 4, 3, 2, "#1e293b");
      g.rect(9, 4, 3, 2, "#1e293b");
      g.rect(6, 7, 4, 2, "#1e293b");
      g.rect(4, 10, 3, 2, "#1e293b");
      g.rect(9, 10, 3, 2, "#1e293b");

      g.hline(4, 3, 3, "#cbd5e1");
      g.hline(9, 3, 3, "#cbd5e1");
      g.px(3, 4, "#94a3b8");
      g.px(7, 4, "#cbd5e1");
      g.px(8, 4, "#cbd5e1");
      g.px(12, 4, "#94a3b8");
      g.px(3, 5, "#64748b");
      g.px(7, 5, "#cbd5e1");
      g.px(8, 5, "#94a3b8");
      g.px(12, 5, "#64748b");

      g.hline(4, 6, 3, "#e2e8f0");
      g.hline(9, 6, 3, "#cbd5e1");
      g.px(3, 7, "#94a3b8");
      g.px(6, 7, "#f8fafc");
      g.px(9, 7, "#94a3b8");
      g.px(12, 7, "#64748b");
      g.px(5, 8, "#38bdf8");
      g.px(10, 8, "#38bdf8");

      g.hline(6, 9, 4, "#cbd5e1");
      g.px(3, 9, "#64748b");
      g.px(12, 9, "#64748b");
      g.px(4, 10, "#94a3b8");
      g.px(7, 10, "#38bdf8");
      g.px(8, 10, "#0284c7");
      g.px(11, 10, "#94a3b8");
      g.hline(4, 11, 3, "#64748b");
      g.hline(9, 11, 3, "#64748b");
      g.hline(6, 12, 4, "#475569");
      break;
    }

    case "subdermal_armor": {
      // Segmented dark titanium ballistic chest armor plates
      g.rect(3, 3, 3, 2, "#475569");
      g.rect(10, 3, 3, 2, "#475569");
      g.rect(3, 5, 10, 3, "#334155");
      g.hline(4, 5, 8, "#94a3b8");
      g.hline(5, 6, 6, "#64748b");
      g.hline(6, 4, 4, "#090d18");
      g.hline(6, 5, 4, "#1e293b");

      g.hline(3, 8, 10, "#0f172a");
      g.rect(4, 9, 8, 2, "#475569");
      g.hline(4, 9, 8, "#cbd5e1");
      g.hline(7, 10, 2, "#0f172a");

      g.rect(5, 11, 6, 2, "#334155");
      g.hline(5, 11, 6, "#64748b");
      g.hline(6, 12, 4, "#1e293b");

      g.px(4, 6, "#f59e0b");
      g.px(11, 6, "#f59e0b");
      g.px(5, 10, "#f59e0b");
      g.px(10, 10, "#f59e0b");
      break;
    }

    case "rippers": {
      // Curved razor-sharp chrome finger talons arcing from fingertips
      g.rect(3, 3, 3, 3, "#475569");
      g.px(3, 3, "#94a3b8");
      g.px(5, 4, "#64748b");

      // Upper claw arc
      g.px(6, 4, "#cbd5e1");
      g.hline(7, 5, 3, "#e2e8f0");
      g.hline(10, 6, 2, "#ffffff");
      g.px(12, 7, "#f8fafc");
      g.px(7, 6, "#475569");

      // Middle claw arc
      g.px(5, 6, "#cbd5e1");
      g.hline(6, 7, 3, "#e2e8f0");
      g.hline(9, 8, 2, "#ffffff");
      g.px(11, 9, "#f8fafc");
      g.px(6, 8, "#475569");

      // Lower claw arc
      g.px(4, 7, "#94a3b8");
      g.px(5, 8, "#cbd5e1");
      g.px(6, 9, "#cbd5e1");
      g.hline(7, 10, 2, "#e2e8f0");
      g.px(9, 11, "#ffffff");
      g.px(5, 9, "#334155");
      break;
    }

    case "wolvers": {
      // Triple straight parallel steel forearm/knuckle blades
      g.rect(3, 9, 4, 4, "#334155");
      g.hline(3, 9, 4, "#64748b");
      g.px(4, 11, "#ff2e54");

      // Blade 1 (x+y = 13)
      g.px(5, 8, "#94a3b8");
      g.px(6, 7, "#cbd5e1");
      g.px(7, 6, "#e2e8f0");
      g.px(8, 5, "#f8fafc");
      g.px(9, 4, "#ffffff");
      g.px(10, 3, "#f8fafc");

      // Blade 2 (x+y = 15, longest)
      g.px(6, 9, "#94a3b8");
      g.px(7, 8, "#cbd5e1");
      g.px(8, 7, "#e2e8f0");
      g.px(9, 6, "#f8fafc");
      g.px(10, 5, "#ffffff");
      g.px(11, 4, "#f8fafc");
      g.px(12, 3, "#ffffff");

      // Blade 3 (x+y = 17)
      g.px(7, 10, "#64748b");
      g.px(8, 9, "#94a3b8");
      g.px(9, 8, "#cbd5e1");
      g.px(10, 7, "#e2e8f0");
      g.px(11, 6, "#f8fafc");
      g.px(12, 5, "#ffffff");
      break;
    }

    case "light_tattoo": {
      // Glowing neon cyan & hot-pink cyber-circuit glyph
      g.px(3, 4, "#ff2e97");
      g.px(4, 4, "#ff85c0");
      g.px(5, 5, "#ff2e97");
      g.vline(5, 6, 2, "#ff2e97");

      g.px(12, 11, "#ff2e97");
      g.px(11, 11, "#ff85c0");
      g.px(10, 10, "#ff2e97");
      g.vline(10, 8, 2, "#ff2e97");

      g.vline(8, 3, 2, "#00f0ff");
      g.px(8, 5, "#67f7ff");
      g.px(7, 6, "#00f0ff");
      g.px(9, 6, "#00f0ff");
      g.px(6, 7, "#00f0ff");
      g.px(10, 7, "#00f0ff");
      g.px(7, 8, "#00f0ff");
      g.px(9, 8, "#00f0ff");
      g.px(8, 9, "#00f0ff");
      g.vline(7, 10, 3, "#00d4ff");

      g.px(11, 4, "#00f0ff");
      g.px(10, 5, "#00d4ff");
      g.px(4, 11, "#00f0ff");
      g.px(5, 10, "#00d4ff");

      g.px(8, 6, "#ff85c0");
      g.px(7, 7, "#67f7ff");
      g.px(8, 7, "#ffffff");
      break;
    }

    case "biomonitor": {
      // Glowing emerald/teal ECG pulse waveform display
      g.rect(2, 4, 12, 8, "#334155");
      g.hline(3, 4, 10, "#64748b");
      g.rect(3, 5, 10, 6, "#041f1e");

      g.px(4, 6, "#0f3d39");
      g.px(11, 6, "#0f3d39");
      g.px(4, 9, "#0f3d39");
      g.px(11, 9, "#0f3d39");

      g.px(3, 8, "#0d9488");
      g.px(4, 8, "#14b8a6");
      g.px(5, 8, "#00e5a3");
      g.px(6, 7, "#00ffaa");
      g.px(7, 5, "#67ffd1");
      g.px(7, 6, "#00ffaa");
      g.px(8, 7, "#00ffaa");
      g.px(8, 8, "#00ffaa");
      g.px(8, 9, "#22d3ee");
      g.px(9, 8, "#00e5a3");
      g.px(10, 8, "#14b8a6");
      g.hline(11, 8, 2, "#0d9488");

      g.px(9, 11, "#22d3ee");
      g.px(11, 11, "#00ffaa");
      break;
    }

    default: {
      // Clean generic cyber-module fallback
      g.rect(4, 4, 8, 8, "#334155");
      g.rect(5, 5, 6, 6, "#1e293b");
      g.rect(7, 7, 2, 2, "#38bdf8");
      break;
    }
  }
}

export function drawCharacterTorsoCyberware(
  g: PixelGrid,
  opts: TorsoCyberwareOptions,
): void {
  const { cyberIds, txLeft, txRight, torsoW, bobY, pulse } = opts;
  const centerLeft = txLeft + Math.floor(torsoW / 2) - 1;
  const centerRight = centerLeft + 1;

  // Skinweave: subtle metallic hex sheen along upper chest & rib collar
  if (cyberIds.has("skinweave")) {
    const sheen = pulse ? "#dbeafe" : "#9fb8d1";
    const sheenDim = "#7c93aa";
    g.px(centerLeft - 1, 19 + bobY, sheen);
    g.px(centerRight + 1, 19 + bobY, sheen);
    g.px(13, 21 + bobY, sheenDim);
    g.px(18, 21 + bobY, sheenDim);
    if (torsoW >= 8) {
      g.px(txLeft + 1, 18 + bobY, sheen);
      g.px(txRight - 1, 18 + bobY, sheen);
    }
  }

  // Muscle & bone lace: reinforced striated shoulder/collar synthetic musculature
  if (cyberIds.has("muscle_bone_lace")) {
    g.px(txLeft + 1, 17 + bobY, "#94a3b8");
    g.px(txRight - 1, 17 + bobY, "#94a3b8");

    g.px(txLeft, 18 + bobY, "#cbd5e1");
    g.px(txLeft + 1, 18 + bobY, "#64748b");
    g.px(txLeft, 19 + bobY, "#475569");
    g.px(txLeft + 1, 19 + bobY, "#94a3b8");
    g.px(txLeft, 20 + bobY, "#cbd5e1");
    g.px(txLeft + 1, 20 + bobY, "#334155");

    g.px(txRight, 18 + bobY, "#cbd5e1");
    g.px(txRight - 1, 18 + bobY, "#64748b");
    g.px(txRight, 19 + bobY, "#475569");
    g.px(txRight - 1, 19 + bobY, "#94a3b8");
    g.px(txRight, 20 + bobY, "#cbd5e1");
    g.px(txRight - 1, 20 + bobY, "#334155");
  }

  // Subdermal armor: segmented dark titanium sternum/collar plates
  if (cyberIds.has("subdermal_armor")) {
    g.px(14, 20 + bobY, "#475569");
    g.hline(15, 20 + bobY, 2, "#64748b");
    g.px(17, 20 + bobY, "#475569");

    g.hline(14, 21 + bobY, 4, "#0f172a");
    g.hline(15, 21 + bobY, 2, "#334155");

    g.px(14, 22 + bobY, "#334155");
    g.hline(15, 22 + bobY, 2, "#94a3b8");
    g.px(17, 22 + bobY, "#334155");

    g.hline(14, 23 + bobY, 4, "#1e293b");
    g.hline(15, 24 + bobY, 2, "#475569");
  }

  // Neural processor: electric cyan collar-node indicator at upper sternum
  if (cyberIds.has("neural_processor")) {
    const nodeCore = pulse ? "#7df9ff" : "#00d8ff";
    g.px(centerLeft - 1, 18 + bobY, "#334155");
    g.px(centerRight + 1, 18 + bobY, "#334155");
    g.px(centerLeft, 18 + bobY, nodeCore);
    g.px(centerRight, 18 + bobY, nodeCore);
    g.px(centerLeft, 19 + bobY, "#0c4a6e");
    g.px(centerRight, 19 + bobY, "#0284c7");
  }

  // Reflex booster: Kerenzikov/Sandevistan dorsal amber/crimson shoulder rails
  if (cyberIds.has("reflex_booster")) {
    const amber = pulse ? "#fde047" : "#ffaa00";
    const crimson = pulse ? "#ff5c7a" : "#ff2e54";

    g.px(13, 16 + bobY, amber);
    g.px(18, 16 + bobY, amber);
    g.px(13, 17 + bobY, crimson);
    g.px(18, 17 + bobY, crimson);
    g.px(13, 18 + bobY, amber);
    g.px(18, 18 + bobY, amber);

    if (txLeft < 13) {
      g.hline(txLeft, 16 + bobY, 13 - txLeft, "#475569");
      g.px(txLeft, 17 + bobY, crimson);
    }
    if (txRight > 18) {
      g.hline(19, 16 + bobY, txRight - 18, "#475569");
      g.px(txRight, 17 + bobY, crimson);
    }
  }
}

export function drawCharacterHeadCyberware(
  g: PixelGrid,
  opts: HeadCyberwareOptions,
): void {
  const { cyberIds, bobY, pulse } = opts;

  // Skinweave: subtle metallic hexagonal sheen across cheek, jaw & collar
  if (cyberIds.has("skinweave")) {
    const glint = pulse ? "#e2e8f0" : "#b8cce0";
    const plate = "#8fa4ba";
    g.px(19, 12 + bobY, glint);
    g.px(18, 13 + bobY, plate);
    g.px(14, 14 + bobY, plate);
    g.px(17, 14 + bobY, glint);
    g.px(17, 16 + bobY, plate);
  }

  // Light tattoo: animated glowing neon cyan/pink cyber-circuit on cheek & neck
  if (cyberIds.has("light_tattoo")) {
    const primary = pulse ? "#00f0ff" : "#ff2e97";
    const secondary = pulse ? "#ff2e97" : "#00d4ff";
    g.px(13, 11 + bobY, primary);
    g.px(12, 12 + bobY, secondary);
    g.px(13, 13 + bobY, primary);
    g.px(14, 15 + bobY, secondary);
    g.px(14, 16 + bobY, primary);
    g.px(14, 17 + bobY, secondary);
  }

  // Neural processor: glowing neural spine/nape socket on neck
  if (cyberIds.has("neural_processor")) {
    g.px(15, 16 + bobY, "#334155");
    g.px(16, 16 + bobY, pulse ? "#7df9ff" : "#00f0ff");
    g.px(15, 17 + bobY, "#64748b");
    g.px(16, 17 + bobY, "#0284c7");
  }

  // Interface plugs: silver/cyan dual data-ports on temple with fiber-cable link
  if (cyberIds.has("interface_plugs")) {
    const portGlow = pulse ? "#67f7ff" : "#00e5ff";
    g.px(12, 9 + bobY, "#e2e8f0");
    g.px(12, 10 + bobY, portGlow);
    g.px(12, 11 + bobY, "#94a3b8");
    g.px(13, 14 + bobY, "#475569");
    g.px(13, 15 + bobY, "#0284c7");
  }

  // Smartgun link: crimson laser-link indicator at temple
  if (cyberIds.has("smartgun_link")) {
    const laser = pulse ? "#ff6b81" : "#ff2e54";
    if (!cyberIds.has("interface_plugs")) {
      g.px(12, 10 + bobY, "#94a3b8");
      g.px(13, 14 + bobY, "#64748b");
    }
    g.px(12, 11 + bobY, laser);
  }

  // Cyberaudio: chrome ear-amp & glowing cyan audio antenna stud
  if (cyberIds.has("cyberaudio")) {
    const stud = pulse ? "#67f7ff" : "#00f0ff";
    g.px(11, 10 + bobY, "#cbd5e1");
    g.px(11, 11 + bobY, "#475569");
    g.px(20, 10 + bobY, "#e2e8f0");
    g.px(20, 11 + bobY, stud);
    g.px(20, 12 + bobY, "#64748b");
    g.px(21, 10 + bobY, "#94a3b8");
    g.px(21, 9 + bobY, stud);
  }

  // Cyberoptic: metallic orbital housing + glowing crimson bionic eye
  if (cyberIds.has("cyberoptic")) {
    g.px(18, 9 + bobY, "#94a3b8");
    g.px(19, 10 + bobY, "#475569");
    g.px(18, 11 + bobY, "#64748b");
    g.px(18, 10 + bobY, "#64748b");
    g.px(17, 10 + bobY, pulse ? "#ff5c7a" : "#ff1e42");
  }

  // Low-light vision: dual emerald/cyan night-vision optic ring inside eye sockets
  if (cyberIds.has("low_light")) {
    const nvCore = pulse ? "#67ffd1" : "#00ffaa";
    const nvRing = "#0d9488";
    g.px(13, 10 + bobY, nvRing);
    g.px(14, 10 + bobY, nvCore);
    g.px(17, 10 + bobY, nvCore);
    g.px(18, 10 + bobY, cyberIds.has("cyberoptic") ? "#14b8a6" : nvRing);
  }
}

export function drawCharacterLimbCyberware(
  g: PixelGrid,
  opts: LimbCyberwareOptions,
): void {
  const {
    cyberIds,
    cyberarmCount,
    cyberlegCount,
    leftArmX,
    rightArmX,
    armW,
    leftLegX,
    rightLegX,
    legW,
    bobY,
    pulse,
    hasAffectationCyberlimb,
  } = opts;

  const effectiveLegCount = Math.max(
    cyberlegCount,
    cyberIds.has("cyberleg") ? 1 : 0,
  );
  const effectiveArmCount = Math.max(
    cyberarmCount,
    cyberIds.has("cyberarm") ? 1 : 0,
  );

  const drawChromeLeg = (lx: number): void => {
    g.rect(lx, 31, legW, 8, "#8fa4ba");
    g.vline(lx, 31, 8, "#e2f1ff");
    if (legW >= 3) {
      g.vline(lx + 1, 32, 6, "#b8cce0");
    }
    g.vline(lx + legW - 1, 31, 8, "#475569");
    g.hline(lx, 34, legW, "#1e293b");
    g.hline(lx, 35, legW, "#334155");
    g.px(lx, 34, "#cbd5e1");
    g.px(lx + legW - 1, 34, "#94a3b8");
    g.px(lx, 35, pulse ? "#7df9ff" : "#00f0ff");
  };

  if (effectiveLegCount >= 1) {
    drawChromeLeg(rightLegX);
  }
  if (effectiveLegCount >= 2) {
    drawChromeLeg(leftLegX);
  }

  const leftChrome = effectiveArmCount >= 2;
  const rightChrome = effectiveArmCount >= 1 || hasAffectationCyberlimb;

  const drawChromeArm = (ax: number): void => {
    g.rect(ax, 18 + bobY, armW, 9, "#8fa4ba");
    g.vline(ax, 18 + bobY, 9, "#e2f1ff");
    g.vline(ax + armW - 1, 18 + bobY, 9, "#475569");
    g.hline(ax, 18 + bobY, armW, "#cbd5e1");
    g.hline(ax, 22 + bobY, armW, "#1e293b");
    g.px(ax + armW - 1, 21 + bobY, "#64748b");
    g.px(ax, 22 + bobY, pulse ? "#7df9ff" : "#00f0ff");
    g.hline(ax, 26 + bobY, armW, "#334155");
    g.rect(ax, 27 + bobY, armW, 2, "#cbd5e1");
    g.vline(ax + armW - 1, 27 + bobY, 2, "#64748b");
  };

  if (rightChrome) {
    drawChromeArm(rightArmX);
  }
  if (leftChrome) {
    drawChromeArm(leftArmX);
  }

  // Light tattoo: animated glowing neon cyan/pink trace on organic forearm
  if (cyberIds.has("light_tattoo")) {
    const primary = pulse ? "#00f0ff" : "#ff2e97";
    const secondary = pulse ? "#ff2e97" : "#00d4ff";
    if (!rightChrome) {
      g.px(rightArmX + armW - 1, 23 + bobY, primary);
      g.px(rightArmX + armW - 1, 24 + bobY, secondary);
      g.px(rightArmX + armW - 1, 25 + bobY, primary);
    } else if (!leftChrome) {
      g.px(leftArmX, 23 + bobY, primary);
      g.px(leftArmX, 24 + bobY, secondary);
      g.px(leftArmX, 25 + bobY, primary);
    }
  }

  // Interface plugs: wrist data-port with faint fiber link
  if (cyberIds.has("interface_plugs")) {
    g.px(rightArmX + armW - 1, 24 + bobY, pulse ? "#0ea5e9" : "#475569");
    g.px(rightArmX + armW - 1, 25 + bobY, "#cbd5e1");
    g.px(rightArmX + armW - 1, 26 + bobY, pulse ? "#67f7ff" : "#00f0ff");
  }

  // Biomonitor: glowing teal/emerald LED strip & pulse-bar on left wrist
  if (cyberIds.has("biomonitor")) {
    g.hline(leftArmX, 25 + bobY, armW, "#0f172a");
    g.hline(leftArmX, 26 + bobY, armW, "#134e4a");
    g.px(leftArmX, 26 + bobY, pulse ? "#34f5c5" : "#00d9a6");
    g.px(leftArmX + armW - 1, 26 + bobY, pulse ? "#67e8f9" : "#0ea5e9");
    if (pulse) {
      g.px(leftArmX, 25 + bobY, "#10b981");
    } else {
      g.px(leftArmX + armW - 1, 25 + bobY, "#14b8a6");
    }
  }

  // Smartgun link: subdermal palm/wrist interface pad + crimson contact LED
  if (cyberIds.has("smartgun_link")) {
    g.px(rightArmX, 26 + bobY, "#475569");
    g.px(rightArmX, 27 + bobY, "#94a3b8");
    g.px(rightArmX + armW - 1, 27 + bobY, "#1e293b");
    g.px(rightArmX, 28 + bobY, pulse ? "#ff5c7a" : "#ff2e54");
  }

  // Rippers: razor-sharp retractable chrome finger blades
  if (cyberIds.has("rippers")) {
    g.px(leftArmX, 29 + bobY, "#cbd5e1");
    g.px(leftArmX, 30 + bobY, "#f8fafc");
    g.px(leftArmX + armW - 1, 29 + bobY, "#94a3b8");

    g.px(rightArmX + armW - 1, 29 + bobY, "#cbd5e1");
    g.px(rightArmX + armW - 1, 30 + bobY, "#f8fafc");
    g.px(rightArmX, 29 + bobY, "#94a3b8");
  }

  // Wolvers: iconic triple long forearm/knuckle steel blades extending below hands
  if (cyberIds.has("wolvers")) {
    // Left hand triple blades
    g.px(leftArmX - 1, 28 + bobY, "#475569");
    g.px(leftArmX, 28 + bobY, "#64748b");
    g.px(leftArmX + 1, 28 + bobY, "#475569");

    g.px(leftArmX - 2, 29 + bobY, "#e2e8f0");
    g.px(leftArmX - 2, 30 + bobY, "#f8fafc");

    g.px(leftArmX, 29 + bobY, "#f8fafc");
    g.px(leftArmX, 30 + bobY, "#e2e8f0");
    g.px(leftArmX, 31 + bobY, "#ffffff");
    g.px(leftArmX, 32 + bobY, "#cbd5e1");

    g.px(leftArmX + 1, 29 + bobY, "#64748b");
    g.px(leftArmX + 1, 30 + bobY, "#94a3b8");
    g.px(leftArmX + 1, 31 + bobY, "#e2e8f0");

    // Right hand triple blades
    const rightOuter = rightArmX + armW;
    const rightMid = rightArmX + armW - 1;
    const rightInner = rightArmX + armW - 2;

    g.px(rightOuter, 28 + bobY, "#475569");
    g.px(rightMid, 28 + bobY, "#64748b");
    g.px(rightInner, 28 + bobY, "#475569");

    g.px(rightOuter + 1, 29 + bobY, "#e2e8f0");
    g.px(rightOuter + 1, 30 + bobY, "#f8fafc");

    g.px(rightMid, 29 + bobY, "#f8fafc");
    g.px(rightMid, 30 + bobY, "#e2e8f0");
    g.px(rightMid, 31 + bobY, "#ffffff");
    g.px(rightMid, 32 + bobY, "#cbd5e1");

    g.px(rightInner, 29 + bobY, "#64748b");
    g.px(rightInner, 30 + bobY, "#94a3b8");
    g.px(rightInner, 31 + bobY, "#e2e8f0");
  }
}
