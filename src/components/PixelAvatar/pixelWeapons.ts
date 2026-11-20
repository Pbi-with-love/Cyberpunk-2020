import { ICON_GRID, PixelGrid } from "./pixelGrid";

export const WEAPON_IDS: readonly string[] = [
  "light_pistol",
  "medium_pistol",
  "heavy_pistol",
  "very_heavy_pistol",
  "light_smg",
  "medium_smg",
  "heavy_smg",
  "assault_rifle",
  "sniper_rifle",
  "shotgun",
  "knife",
  "club",
  "sword",
  "monoblade",
  "grenade",
] as const;

export interface DrawBackWeaponsOptions {
  weaponIds: string[];
  primaryWeaponId?: string | null;
  roleId: string;
  bobY: number;
}

export interface DrawCharacterWeaponsOptions {
  weaponIds: string[];
  primaryWeaponId?: string | null;
  roleId: string;
  leftArmX: number;
  rightArmX: number;
  armW: number;
  txLeft: number;
  txRight: number;
  bobY: number;
  pulse: boolean;
  hasSmartgunLink: boolean;
}

const WEAPON_ID_SET = new Set<string>(WEAPON_IDS);

const WEAPON_PRIORITY: readonly string[] = [
  "sniper_rifle",
  "assault_rifle",
  "shotgun",
  "monoblade",
  "sword",
  "heavy_smg",
  "medium_smg",
  "light_smg",
  "very_heavy_pistol",
  "heavy_pistol",
  "medium_pistol",
  "light_pistol",
  "club",
  "knife",
  "grenade",
];

const BACK_WEAPON_ORDER: readonly string[] = [
  "sniper_rifle",
  "assault_rifle",
  "shotgun",
  "monoblade",
  "sword",
];

const FIREARM_IDS = new Set<string>([
  "light_pistol",
  "medium_pistol",
  "heavy_pistol",
  "very_heavy_pistol",
  "light_smg",
  "medium_smg",
  "heavy_smg",
  "assault_rifle",
  "sniper_rifle",
  "shotgun",
]);

const SIDEARM_IDS = new Set<string>([
  "very_heavy_pistol",
  "heavy_pistol",
  "medium_pistol",
  "light_pistol",
  "light_smg",
]);

const ICON_CORNER_ACCENTS: Record<string, string> = {
  light_pistol: "#38bdf8",
  medium_pistol: "#0ea5e9",
  heavy_pistol: "#f59e0b",
  very_heavy_pistol: "#ff2e54",
  light_smg: "#22d3ee",
  medium_smg: "#38bdf8",
  heavy_smg: "#00f0ff",
  assault_rifle: "#ff2e54",
  sniper_rifle: "#00f0ff",
  shotgun: "#d97706",
  knife: "#94a3b8",
  club: "#00f0ff",
  sword: "#f5c542",
  monoblade: "#00f0ff",
  grenade: "#84cc16",
};

function resolvePrimaryWeaponId(
  weaponIds: string[],
  primaryWeaponId?: string | null,
): string | null {
  const owned = new Set<string>();
  for (const id of weaponIds) {
    if (WEAPON_ID_SET.has(id)) {
      owned.add(id);
    }
  }
  if (owned.size === 0) return null;

  if (
    primaryWeaponId &&
    WEAPON_ID_SET.has(primaryWeaponId) &&
    owned.has(primaryWeaponId)
  ) {
    return primaryWeaponId;
  }

  for (const candidate of WEAPON_PRIORITY) {
    if (owned.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

function drawIconBackdrop(g: PixelGrid, accent: string): void {
  g.rect(0, 0, ICON_GRID, ICON_GRID, "#162033");
  g.rect(1, 1, ICON_GRID - 2, ICON_GRID - 2, "#090d18");
  g.hline(0, 0, 3, accent);
  g.vline(0, 0, 3, accent);
  g.hline(13, 15, 3, accent);
  g.vline(15, 13, 3, accent);
  g.px(15, 0, "#24344d");
  g.px(0, 15, "#24344d");
}

/**
 * Renders a 16x16 cyberpunk HUD item icon for any of the 15 weapons in gear.json.
 */
export function drawWeaponIcon(g: PixelGrid, weaponId: string): void {
  const accent = ICON_CORNER_ACCENTS[weaponId] ?? "#38bdf8";
  drawIconBackdrop(g, accent);

  switch (weaponId) {
    case "light_pistol": {
      // Compact sleek silver slide + dark polymer frame
      g.hline(5, 5, 6, "#f1f5f9");
      g.hline(5, 6, 7, "#94a3b8");
      g.px(5, 6, "#64748b");
      g.hline(5, 7, 5, "#1e293b");
      g.px(10, 7, "#334155");
      g.px(8, 8, "#334155");
      g.px(7, 8, "#cbd5e1");
      g.rect(5, 8, 2, 3, "#1e293b");
      g.px(4, 9, "#334155");
      g.px(4, 10, "#1e293b");
      g.px(5, 9, "#475569");
      g.px(5, 10, "#475569");
      g.hline(4, 11, 2, "#0f172a");
      break;
    }
    case "medium_pistol": {
      // Classic matte dark duty pistol with crisp slide highlight & iron sights
      g.px(4, 4, "#64748b");
      g.px(11, 4, "#cbd5e1");
      g.hline(4, 5, 8, "#64748b");
      g.px(6, 5, "#94a3b8");
      g.px(10, 5, "#94a3b8");
      g.hline(4, 6, 9, "#232d3f");
      g.px(8, 5, "#0f172a");
      g.px(5, 6, "#141a26");
      g.hline(4, 7, 8, "#182030");
      g.hline(10, 7, 2, "#334155");
      g.px(9, 8, "#334155");
      g.px(8, 9, "#334155");
      g.px(7, 8, "#94a3b8");
      g.rect(4, 8, 3, 4, "#141b29");
      g.px(4, 9, "#334155");
      g.px(4, 10, "#334155");
      g.px(3, 10, "#0f172a");
      g.px(3, 11, "#0f172a");
      g.hline(4, 12, 2, "#64748b");
      break;
    }
    case "heavy_pistol": {
      // Chunky Desert-Eagle style chrome/black handcannon
      g.px(4, 3, "#94a3b8");
      g.px(12, 3, "#f8fafc");
      g.hline(4, 4, 9, "#f8fafc");
      g.hline(3, 5, 10, "#cbd5e1");
      g.hline(7, 5, 2, "#1e293b");
      g.px(13, 5, "#475569");
      g.hline(4, 6, 9, "#94a3b8");
      g.hline(5, 7, 8, "#0f172a");
      g.px(11, 7, "#334155");
      g.px(9, 8, "#334155");
      g.hline(7, 9, 3, "#1e293b");
      g.px(7, 8, "#cbd5e1");
      g.rect(4, 8, 3, 4, "#0f172a");
      g.vline(5, 9, 3, "#334155");
      g.px(3, 10, "#1e293b");
      g.px(3, 11, "#1e293b");
      g.hline(3, 12, 3, "#cbd5e1");
      break;
    }
    case "very_heavy_pistol": {
      // Oversized long-barrel revolver with cylinder, crimson grip & laser dot
      g.px(12, 3, "#f8fafc");
      g.hline(7, 4, 6, "#cbd5e1");
      g.hline(7, 5, 7, "#94a3b8");
      g.hline(8, 6, 4, "#475569");
      g.px(12, 6, "#ff2e54");
      g.px(14, 6, "rgba(255, 46, 84, 0.55)");
      // Cylinder & hammer
      g.rect(5, 5, 3, 3, "#475569");
      g.px(6, 5, "#e2e8f0");
      g.px(6, 6, "#1e293b");
      g.px(7, 6, "#94a3b8");
      g.px(4, 4, "#cbd5e1");
      g.px(4, 5, "#94a3b8");
      // Trigger & swept crimson grip
      g.px(7, 8, "#64748b");
      g.px(6, 9, "#64748b");
      g.px(6, 8, "#cbd5e1");
      g.px(4, 8, "#991b1b");
      g.px(5, 8, "#dc2626");
      g.px(3, 9, "#dc2626");
      g.px(4, 9, "#ef4444");
      g.px(5, 9, "#991b1b");
      g.px(2, 10, "#991b1b");
      g.px(3, 10, "#ef4444");
      g.px(4, 10, "#7f1d1d");
      g.px(2, 11, "#7f1d1d");
      g.px(3, 11, "#dc2626");
      g.px(2, 12, "#450a0a");
      g.px(3, 12, "#991b1b");
      break;
    }
    case "light_smg": {
      // Compact Uzi/MP7 style SMG with vertical foregrip & extended stick mag
      g.px(3, 5, "#475569");
      g.px(2, 6, "#475569");
      g.px(3, 7, "#475569");
      g.px(6, 4, "#94a3b8");
      g.px(9, 4, "#cbd5e1");
      g.hline(4, 5, 6, "#64748b");
      g.rect(4, 6, 7, 2, "#334155");
      g.px(7, 6, "#0f172a");
      g.hline(11, 6, 2, "#94a3b8");
      // Vertical foregrip
      g.vline(9, 8, 3, "#1e293b");
      g.px(9, 9, "#475569");
      g.px(10, 8, "#334155");
      // Grip + extended stick mag
      g.rect(5, 8, 2, 3, "#1e293b");
      g.px(5, 9, "#475569");
      g.vline(5, 11, 3, "#475569");
      g.vline(6, 11, 3, "#64748b");
      g.px(7, 8, "#94a3b8");
      break;
    }
    case "medium_smg": {
      // Classic tactical MP5-style SMG with curved magazine & stock
      g.hline(2, 5, 3, "#334155");
      g.vline(2, 5, 4, "#475569");
      g.px(3, 6, "#1e293b");
      g.px(6, 4, "#64748b");
      g.px(11, 4, "#cbd5e1");
      g.hline(5, 5, 7, "#64748b");
      g.rect(5, 6, 5, 2, "#1e293b");
      g.hline(5, 6, 5, "#334155");
      g.rect(10, 6, 2, 2, "#263244");
      g.px(10, 7, "#111827");
      g.hline(12, 6, 2, "#94a3b8");
      // Pistol grip
      g.px(6, 8, "#1e293b");
      g.px(5, 9, "#1e293b");
      g.px(5, 10, "#334155");
      g.px(4, 11, "#1e293b");
      // Curved banana mag
      g.px(8, 8, "#475569");
      g.px(8, 9, "#64748b");
      g.px(9, 9, "#334155");
      g.px(9, 10, "#64748b");
      g.px(10, 10, "#334155");
      g.px(9, 11, "#475569");
      g.px(10, 11, "#64748b");
      g.px(10, 12, "#475569");
      g.px(11, 12, "#334155");
      break;
    }
    case "heavy_smg": {
      // Bulky industrial SMG with twin-barrels, drum mag & cyan tactical sight
      g.hline(6, 3, 3, "#64748b");
      g.px(6, 4, "#334155");
      g.px(8, 4, "#334155");
      g.px(7, 4, "#00f0ff");
      g.rect(2, 5, 2, 4, "#334155");
      g.px(2, 5, "#64748b");
      g.rect(4, 5, 7, 3, "#334155");
      g.hline(4, 5, 7, "#94a3b8");
      g.hline(5, 6, 2, "#f59e0b");
      // Twin stacked barrels
      g.hline(11, 5, 3, "#cbd5e1");
      g.hline(11, 7, 3, "#64748b");
      // Drum mag
      g.hline(8, 8, 2, "#475569");
      g.rect(7, 9, 4, 3, "#1e293b");
      g.rect(8, 9, 2, 3, "#475569");
      g.px(8, 10, "#94a3b8");
      g.px(9, 10, "#00f0ff");
      g.hline(8, 12, 2, "#334155");
      // Rear grip
      g.px(5, 8, "#1e293b");
      g.px(4, 9, "#1e293b");
      g.px(4, 10, "#334155");
      g.px(4, 11, "#1e293b");
      break;
    }
    case "assault_rifle": {
      // Tactical cyber-rifle with angled magazine, rail scope & glowing red sight
      g.rect(2, 6, 2, 3, "#1e293b");
      g.px(2, 6, "#475569");
      g.px(3, 9, "#1e293b");
      // Optic rail & glowing red dot
      g.hline(5, 4, 3, "#475569");
      g.px(8, 4, "#ff2e54");
      g.px(6, 5, "#334155");
      g.px(7, 5, "#ff6b81");
      // Receiver & barrel
      g.hline(4, 6, 7, "#64748b");
      g.rect(4, 7, 6, 2, "#1e293b");
      g.hline(9, 6, 2, "#475569");
      g.hline(10, 7, 2, "#334155");
      g.hline(11, 6, 3, "#94a3b8");
      g.px(13, 6, "#cbd5e1");
      g.px(12, 5, "#cbd5e1");
      // Grip & angled mag
      g.px(5, 9, "#1e293b");
      g.px(4, 10, "#1e293b");
      g.px(4, 11, "#334155");
      g.px(7, 9, "#475569");
      g.px(8, 9, "#334155");
      g.px(8, 10, "#64748b");
      g.px(9, 10, "#334155");
      g.px(8, 11, "#475569");
      g.px(9, 11, "#64748b");
      g.px(9, 12, "#475569");
      break;
    }
    case "sniper_rifle": {
      // Very long anti-materiel sniper rifle with cyan/teal optic scope & bipod
      g.hline(1, 7, 3, "#334155");
      g.hline(2, 6, 2, "#475569");
      g.vline(1, 7, 4, "#475569");
      g.px(2, 9, "#1e293b");
      // Large cyan/teal optic scope
      g.hline(4, 4, 6, "#94a3b8");
      g.hline(5, 5, 4, "#475569");
      g.px(4, 4, "#00f0ff");
      g.px(4, 5, "#0d9488");
      g.px(9, 4, "#00f0ff");
      g.px(9, 5, "#2dd4bf");
      g.hline(6, 4, 2, "#14b8a6");
      g.px(5, 6, "#334155");
      g.px(8, 6, "#334155");
      // Receiver & ultra-long barrel + muzzle brake
      g.rect(4, 7, 5, 2, "#334155");
      g.px(5, 7, "#cbd5e1");
      g.hline(9, 7, 4, "#94a3b8");
      g.rect(13, 6, 2, 3, "#cbd5e1");
      g.px(13, 7, "#1e293b");
      // Box mag & deployed bipod
      g.rect(6, 9, 2, 2, "#1e293b");
      g.px(4, 9, "#334155");
      g.px(4, 10, "#1e293b");
      g.px(11, 8, "#64748b");
      g.px(10, 9, "#94a3b8");
      g.px(10, 10, "#64748b");
      g.px(12, 9, "#94a3b8");
      g.px(12, 10, "#64748b");
      g.px(9, 11, "#cbd5e1");
      g.px(13, 11, "#cbd5e1");
      break;
    }
    case "shotgun": {
      // Heavy combat shotgun with dark wood/polymer pump & thick steel receiver
      g.px(4, 7, "#7c4a2d");
      g.px(3, 8, "#9a5b36");
      g.px(4, 8, "#5c3721");
      g.px(2, 9, "#7c4a2d");
      g.px(3, 9, "#5c3721");
      g.px(2, 10, "#4a2b18");
      g.px(3, 10, "#4a2b18");
      // Steel receiver & shell dots
      g.rect(5, 6, 4, 3, "#475569");
      g.hline(5, 6, 4, "#94a3b8");
      g.px(6, 7, "#ef4444");
      g.px(7, 7, "#ef4444");
      // Barrel + mag tube + ribbed pump
      g.hline(9, 6, 5, "#cbd5e1");
      g.px(13, 5, "#f8fafc");
      g.hline(9, 7, 4, "#475569");
      g.hline(9, 8, 3, "#7c4a2d");
      g.px(10, 8, "#4a2b18");
      g.px(11, 8, "#9a5b36");
      g.px(5, 9, "#334155");
      break;
    }
    case "knife": {
      // Sleek combat knife with steel blade & dark grip
      g.px(2, 13, "#64748b");
      g.px(3, 12, "#1e293b");
      g.px(4, 11, "#334155");
      g.px(4, 12, "#1e293b");
      g.px(5, 9, "#94a3b8");
      g.px(6, 10, "#475569");
      g.line(6, 9, 12, 3, "#f1f5f9");
      g.line(6, 8, 11, 3, "#64748b");
      g.px(7, 9, "#94a3b8");
      g.px(8, 8, "#94a3b8");
      g.px(9, 7, "#94a3b8");
      g.px(10, 6, "#cbd5e1");
      break;
    }
    case "club": {
      // Stun baton / shock club with glowing electric cyan tip
      g.px(2, 13, "#475569");
      g.px(3, 12, "#1e293b");
      g.px(4, 11, "#334155");
      g.px(5, 10, "#f59e0b");
      g.px(5, 9, "#94a3b8");
      g.px(6, 10, "#64748b");
      g.line(6, 9, 10, 5, "#475569");
      g.line(7, 9, 10, 6, "#1e293b");
      g.px(10, 4, "#38bdf8");
      g.px(11, 4, "#00f0ff");
      g.px(11, 5, "#38bdf8");
      g.px(12, 3, "#ccfbf1");
      g.px(10, 3, "#00f0ff");
      g.px(12, 5, "#00f0ff");
      g.px(13, 2, "#7dd3fc");
      break;
    }
    case "sword": {
      // Sleek cyber-katana with curved bright steel blade & gold guard
      g.px(2, 13, "#f5c542");
      g.px(3, 12, "#dc2626");
      g.px(4, 11, "#1e293b");
      // Gold tsuba guard
      g.px(4, 10, "#f5c542");
      g.px(5, 11, "#fde047");
      g.px(6, 12, "#ca8a04");
      // Curved bright steel blade
      g.line(5, 10, 9, 6, "#f8fafc");
      g.line(10, 5, 13, 2, "#f8fafc");
      g.line(5, 9, 8, 6, "#94a3b8");
      g.line(9, 5, 12, 2, "#64748b");
      break;
    }
    case "monoblade": {
      // Razor-thin glowing cyan plasma-edged mono-katana
      g.px(2, 13, "#64748b");
      g.px(3, 12, "#00f0ff");
      g.px(4, 11, "#0f172a");
      g.px(4, 10, "#cbd5e1");
      g.px(5, 11, "#00d9f5");
      // Dark alloy spine + blazing plasma edge
      g.line(5, 9, 12, 2, "#334155");
      g.line(6, 9, 12, 3, "#64748b");
      g.line(5, 10, 13, 2, "#00f0ff");
      g.line(7, 8, 12, 3, "#ccfbf1");
      g.px(13, 2, "#ffffff");
      break;
    }
    case "grenade": {
      // Chunky tactical frag grenade with olive body & yellow/red pin ring
      g.rect(7, 4, 2, 2, "#94a3b8");
      g.px(8, 4, "#64748b");
      // Spoon lever
      g.px(9, 4, "#94a3b8");
      g.vline(10, 5, 4, "#64748b");
      g.px(10, 5, "#cbd5e1");
      // Pull pin ring
      g.px(5, 3, "#facc15");
      g.px(4, 4, "#facc15");
      g.px(6, 4, "#ef4444");
      g.px(5, 5, "#eab308");
      // Olive waffle body
      g.hline(6, 6, 4, "#4d6b3c");
      g.rect(5, 7, 6, 5, "#4d6b3c");
      g.hline(6, 12, 4, "#2a3d20");
      g.px(6, 7, "#7aa15c");
      g.px(7, 7, "#7aa15c");
      g.px(6, 9, "#7aa15c");
      g.px(6, 10, "#7aa15c");
      g.vline(8, 7, 5, "#2a3d20");
      g.hline(5, 8, 6, "#2a3d20");
      g.hline(5, 10, 6, "#2a3d20");
      // Hazard band accent
      g.px(6, 8, "#eab308");
      g.px(7, 8, "#ef4444");
      g.px(9, 8, "#eab308");
      break;
    }
    default: {
      // Fallback tactical silhouette
      g.hline(4, 6, 8, "#64748b");
      g.hline(4, 7, 7, "#334155");
      g.rect(4, 8, 2, 3, "#1e293b");
      break;
    }
  }
}

function drawBackSlungWeapon(
  g: PixelGrid,
  weaponId: string,
  bobY: number,
  side: "right" | "left",
): void {
  const s = side === "right" ? 1 : -1;
  const xStart = side === "right" ? 18 : 13;
  const xEnd = (dx: number) => xStart + s * dx;

  switch (weaponId) {
    case "sniper_rifle": {
      // Very long sniper barrel high above shoulder + cyan optic + bottom stock tip
      g.line(xEnd(0), 18 + bobY, xEnd(7), 4 + bobY, "#475569");
      g.px(xEnd(7), 4 + bobY, "#cbd5e1");
      g.px(xEnd(6), 5 + bobY, "#94a3b8");
      g.px(xEnd(4), 9 + bobY, "#00f0ff");
      g.px(xEnd(4) - s, 10 + bobY, "#2dd4bf");
      // Buttstock peeking lower opposite hip
      g.line(side === "right" ? 11 : 20, 28 + bobY, side === "right" ? 9 : 22, 31 + bobY, "#334155");
      break;
    }
    case "assault_rifle": {
      // Tactical rifle barrel angled behind shoulder + red optic dot
      g.line(xEnd(0), 19 + bobY, xEnd(6), 6 + bobY, "#334155");
      g.px(xEnd(6), 6 + bobY, "#94a3b8");
      g.px(xEnd(3), 11 + bobY, "#ff2e54");
      g.px(xEnd(2), 14 + bobY, "#475569");
      g.px(side === "right" ? 10 : 21, 29 + bobY, "#1e293b");
      break;
    }
    case "shotgun": {
      // Heavy steel barrel + warm wood/polymer stock & pump accent
      g.line(xEnd(0), 19 + bobY, xEnd(6), 7 + bobY, "#64748b");
      g.px(xEnd(6), 7 + bobY, "#cbd5e1");
      g.line(xEnd(2), 15 + bobY, xEnd(4), 11 + bobY, "#7c4a2d");
      g.line(side === "right" ? 11 : 20, 29 + bobY, side === "right" ? 10 : 21, 31 + bobY, "#7c4a2d");
      break;
    }
    case "monoblade": {
      // Long dark cyber-scabbard with blazing cyan plasma edge
      g.line(xEnd(0), 19 + bobY, xEnd(6), 6 + bobY, "#334155");
      g.line(xEnd(1), 17 + bobY, xEnd(6), 6 + bobY, "#00f0ff");
      g.px(xEnd(6), 6 + bobY, "#e0ffff");
      g.px(xEnd(4), 10 + bobY, "#94a3b8");
      g.px(side === "right" ? 10 : 21, 30 + bobY, "#00f0ff");
      break;
    }
    case "sword": {
      // Curved steel katana with gold tsuba guard
      g.line(xEnd(0), 19 + bobY, xEnd(6), 7 + bobY, "#cbd5e1");
      g.px(xEnd(6), 7 + bobY, "#f8fafc");
      g.px(xEnd(4), 10 + bobY, "#f5c542");
      g.px(xEnd(5), 8 + bobY, "#dc2626");
      g.px(side === "right" ? 10 : 21, 30 + bobY, "#64748b");
      break;
    }
    default:
      break;
  }
}

/**
 * Draws secondary/unheld long guns or long blades slung diagonally behind the character's shoulders,
 * or keeps the Nomad's iconic road rifle when no weapon is owned.
 */
export function drawBackWeapons(
  g: PixelGrid,
  opts: DrawBackWeaponsOptions,
): void {
  const { weaponIds, primaryWeaponId, roleId, bobY } = opts;
  const activePrimary = resolvePrimaryWeaponId(weaponIds, primaryWeaponId);

  if (activePrimary === null) {
    if (roleId === "nomad") {
      g.line(18, 19 + bobY, 23, 8 + bobY, "#7c5836");
      g.line(21, 13 + bobY, 23, 8 + bobY, "#94a3b8");
    }
    return;
  }

  const owned = new Set(weaponIds);
  const backCandidates: string[] = [];
  for (const id of BACK_WEAPON_ORDER) {
    if (owned.has(id) && id !== activePrimary) {
      backCandidates.push(id);
    }
  }

  const firstBack = backCandidates[0];
  if (firstBack) {
    drawBackSlungWeapon(g, firstBack, bobY, "right");
  }
  const secondBack = backCandidates[1];
  if (secondBack) {
    drawBackSlungWeapon(g, secondBack, bobY, "left");
  }
}

function drawSmartgunCue(
  g: PixelGrid,
  opticX: number,
  opticY: number,
  muzzleX: number,
  muzzleY: number,
  dir: -1 | 1,
  gripX: number,
  gripY: number,
  pulse: boolean,
): void {
  // Glowing smartlink optic dot & grip interface indicator
  g.px(opticX, opticY, pulse ? "#ff2e54" : "#00f0ff");
  g.px(gripX, gripY, "#00f0ff");

  // Faint tactical laser sight extending along firing axis
  for (let step = 1; step <= 4; step += 1) {
    const lx = muzzleX + dir * step;
    if (lx < 0 || lx > 31) break;
    const alpha = step <= 2 ? 0.55 : 0.25;
    g.px(lx, muzzleY, `rgba(255, 46, 84, ${alpha})`);
  }
}

function drawBeltSecondary(
  g: PixelGrid,
  weaponId: string,
  hipX: number,
  bobY: number,
): void {
  if (weaponId === "grenade") {
    g.rect(hipX, 27 + bobY, 2, 2, "#4d6b3c");
    g.px(hipX, 27 + bobY, "#7aa15c");
    g.px(hipX, 26 + bobY, "#facc15");
    return;
  }

  if (weaponId === "knife") {
    // Belt knife sheath + steel hilt
    g.vline(hipX, 27 + bobY, 3, "#1e293b");
    g.px(hipX, 27 + bobY, "#94a3b8");
    g.px(hipX, 26 + bobY, "#334155");
    return;
  }

  if (weaponId === "club") {
    // Clipped shock baton at hip
    g.vline(hipX, 27 + bobY, 4, "#334155");
    g.px(hipX, 26 + bobY, "#94a3b8");
    g.px(hipX, 31 + bobY, "#00f0ff");
    return;
  }

  if (SIDEARM_IDS.has(weaponId)) {
    // Hip holster with distinct grip peeking out
    g.rect(hipX, 28 + bobY, 2, 3, "#0f172a");
    const gripColor =
      weaponId === "very_heavy_pistol"
        ? "#dc2626"
        : weaponId === "heavy_pistol" || weaponId === "light_pistol"
          ? "#cbd5e1"
          : weaponId === "light_smg"
            ? "#38bdf8"
            : "#64748b";
    g.px(hipX, 27 + bobY, gripColor);
    g.px(hipX + 1, 27 + bobY, "#334155");
  }
}

/**
 * Draws the active primary weapon held in hand(s), smartgun link laser/optic cue if equipped,
 * and secondary compact weapons holstered/clipped along the belt/hips.
 */
export function drawCharacterWeapons(
  g: PixelGrid,
  opts: DrawCharacterWeaponsOptions,
): void {
  const {
    weaponIds,
    primaryWeaponId,
    roleId,
    leftArmX,
    rightArmX,
    armW,
    txLeft,
    txRight,
    bobY,
    pulse,
    hasSmartgunLink,
  } = opts;

  const activePrimary = resolvePrimaryWeaponId(weaponIds, primaryWeaponId);
  if (activePrimary === null) return;

  // Roles with left-hand / left-chest props hold 1-handed weapons in right hand to avoid overlap
  const useRightHand =
    roleId === "corporate" || roleId === "netrunner" || roleId === "rocker";
  const dir: -1 | 1 = useRightHand ? 1 : -1;
  const handX = useRightHand ? rightArmX + armW - 1 : leftArmX;
  const handY = 27 + bobY;

  let opticX = handX;
  let opticY = handY - 1;
  let muzzleX = handX;
  let muzzleY = handY - 1;
  let aimDir: -1 | 1 = dir;
  let gripX = handX;
  let gripY = handY;

  switch (activePrimary) {
    case "sniper_rifle": {
      // Very long scoped anti-materiel rifle held across front
      const barrelStart = Math.max(2, leftArmX - 6);
      const stockEnd = Math.min(29, rightArmX + armW - 1);
      const y = 24 + bobY;
      // Stock & cheek rest
      g.rect(txRight + 1, y, Math.max(2, stockEnd - txRight), 2, "#334155");
      g.px(txRight + 2, y - 1, "#475569");
      // Long barrel & receiver
      g.hline(barrelStart, y, txRight - barrelStart + 2, "#475569");
      g.hline(12, y, 7, "#1e293b");
      // Heavy muzzle brake
      g.rect(barrelStart, y - 1, 1, 3, "#cbd5e1");
      g.px(barrelStart + 1, y, "#94a3b8");
      // Large cyan/teal optic scope
      g.hline(14, y - 2, 5, "#64748b");
      g.px(14, y - 2, "#00f0ff");
      g.px(18, y - 2, "#2dd4bf");
      g.px(15, y - 1, "#334155");
      g.px(17, y - 1, "#334155");
      // Box mag & folded bipod
      g.rect(15, y + 1, 2, 2, "#1e293b");
      g.vline(leftArmX - 2, y + 1, 2, "#94a3b8");
      opticX = 16;
      opticY = y - 2;
      muzzleX = barrelStart;
      muzzleY = y;
      aimDir = -1;
      gripX = rightArmX;
      gripY = y + 1;
      break;
    }
    case "assault_rifle": {
      // Tactical cyber-rifle held across body
      const barrelStart = Math.max(3, leftArmX - 4);
      const stockEnd = Math.min(28, rightArmX + armW - 1);
      const y = 25 + bobY;
      g.hline(barrelStart, y, stockEnd - barrelStart + 1, "#1e293b");
      g.hline(leftArmX - 1, y - 1, 6, "#475569");
      g.px(barrelStart, y, "#94a3b8");
      g.px(barrelStart + 1, y - 1, "#64748b");
      // Rail scope with glowing red sight
      g.hline(14, y - 2, 3, "#334155");
      g.px(16, y - 2, pulse ? "#ff2e54" : "#b91c1c");
      // Angled curved magazine
      g.px(15, y + 1, "#334155");
      g.px(14, y + 2, "#475569");
      g.px(14, y + 3, "#334155");
      opticX = 15;
      opticY = y - 2;
      muzzleX = barrelStart;
      muzzleY = y;
      aimDir = -1;
      gripX = rightArmX;
      gripY = y + 1;
      break;
    }
    case "shotgun": {
      // Heavy combat shotgun with wood/polymer pump & sloped stock
      const barrelStart = Math.max(4, leftArmX - 3);
      const stockEnd = Math.min(28, rightArmX + armW - 1);
      const y = 24 + bobY;
      // Thick steel receiver + barrel + tube
      g.hline(barrelStart, y, txRight - barrelStart + 2, "#64748b");
      g.hline(12, y, Math.max(4, txRight - 10), "#94a3b8");
      g.px(barrelStart, y, "#cbd5e1");
      g.hline(barrelStart + 1, y + 1, 7, "#334155");
      // Dark wood/polymer pump forend under left arm
      g.hline(leftArmX - 1, y + 1, 4, "#7c4a2d");
      g.px(leftArmX, y + 1, "#9a5b36");
      // Sloped wood buttstock on right
      g.hline(txRight + 1, y + 1, Math.max(2, stockEnd - txRight), "#7c4a2d");
      g.px(stockEnd, y + 2, "#5c3721");
      opticX = 14;
      opticY = y;
      muzzleX = barrelStart;
      muzzleY = y;
      aimDir = -1;
      gripX = rightArmX;
      gripY = y + 1;
      break;
    }
    case "heavy_smg": {
      // Bulky industrial SMG across ready stance with twin barrels, drum mag & cyan sight
      const barrelStart = Math.max(4, leftArmX - 4);
      const y = 24 + bobY;
      g.rect(barrelStart + 2, y, 11, 2, "#334155");
      g.hline(barrelStart + 3, y, 7, "#64748b");
      g.px(leftArmX + 1, y + 1, "#f59e0b");
      // Twin barrels
      g.hline(barrelStart, y, 2, "#cbd5e1");
      g.hline(barrelStart, y + 2, 2, "#64748b");
      // Cyan tactical sight
      g.px(leftArmX + 2, y - 1, "#00f0ff");
      // Drum magazine
      g.rect(14, y + 2, 3, 2, "#1e293b");
      g.px(15, y + 2, "#475569");
      g.px(15, y + 3, "#00f0ff");
      opticX = leftArmX + 2;
      opticY = y - 1;
      muzzleX = barrelStart;
      muzzleY = y;
      aimDir = -1;
      gripX = leftArmX;
      gripY = y + 2;
      break;
    }
    case "medium_smg": {
      // Classic tactical MP5-style SMG with curved magazine & rear stock
      const barrelStart = Math.max(5, leftArmX - 3);
      const y = 25 + bobY;
      g.hline(barrelStart, y, 10, "#1e293b");
      g.hline(barrelStart + 2, y - 1, 6, "#475569");
      g.px(barrelStart, y, "#94a3b8");
      // Curved forward-swept magazine
      g.px(leftArmX + 2, y + 1, "#475569");
      g.px(leftArmX + 2, y + 2, "#64748b");
      g.px(leftArmX + 1, y + 3, "#475569");
      opticX = leftArmX + 2;
      opticY = y - 1;
      muzzleX = barrelStart;
      muzzleY = y;
      aimDir = -1;
      gripX = leftArmX;
      gripY = y + 1;
      break;
    }
    case "light_smg": {
      // Compact Uzi/MP7 held in dominant hand with foregrip & extended stick mag
      const y = 25 + bobY;
      for (let i = 0; i < 4; i += 1) {
        g.px(handX + dir * i, y, i === 3 ? "#94a3b8" : "#64748b");
        if (i < 3) g.px(handX + dir * i, y + 1, "#334155");
      }
      // Vertical foregrip
      g.px(handX + dir * 2, y + 2, "#1e293b");
      // Extended stick mag dropping down
      g.vline(handX, y + 2, 4, "#475569");
      g.px(handX, y + 5, "#94a3b8");
      opticX = handX + dir;
      opticY = y;
      muzzleX = handX + dir * 3;
      muzzleY = y;
      aimDir = dir;
      gripX = handX;
      gripY = y + 2;
      break;
    }
    case "very_heavy_pistol": {
      // Long-barrel revolver with cylinder, crimson grip & laser dot
      const y = 25 + bobY;
      for (let i = 0; i <= 5; i += 1) {
        g.px(handX + dir * i, y, i >= 4 ? "#cbd5e1" : "#94a3b8");
      }
      // Cylinder
      g.rect(Math.min(handX, handX + dir), y, 2, 2, "#475569");
      // Crimson grip
      g.vline(handX, y + 2, 2, "#dc2626");
      // Underbarrel laser diode
      g.px(handX + dir * 4, y + 1, "#ff2e54");
      if (pulse) {
        const dotX = handX + dir * 6;
        if (dotX >= 0 && dotX <= 31) {
          g.px(dotX, y + 1, "rgba(255, 46, 84, 0.7)");
        }
      }
      opticX = handX + dir * 2;
      opticY = y;
      muzzleX = handX + dir * 5;
      muzzleY = y;
      aimDir = dir;
      gripX = handX;
      gripY = y + 2;
      break;
    }
    case "heavy_pistol": {
      // Chunky chrome/black Desert-Eagle style handcannon
      const y = 25 + bobY;
      for (let i = 0; i <= 4; i += 1) {
        g.px(handX + dir * i, y, i === 4 ? "#f8fafc" : "#cbd5e1");
        g.px(handX + dir * i, y + 1, "#1e293b");
      }
      g.vline(handX, y + 2, 2, "#0f172a");
      opticX = handX + dir;
      opticY = y;
      muzzleX = handX + dir * 4;
      muzzleY = y;
      aimDir = dir;
      gripX = handX;
      gripY = y + 2;
      break;
    }
    case "medium_pistol": {
      // Classic matte dark pistol with crisp slide highlight
      const y = 25 + bobY;
      for (let i = 0; i <= 3; i += 1) {
        g.px(handX + dir * i, y, i === 3 ? "#94a3b8" : "#64748b");
        g.px(handX + dir * i, y + 1, "#1e293b");
      }
      g.vline(handX, y + 2, 2, "#141b29");
      opticX = handX + dir;
      opticY = y;
      muzzleX = handX + dir * 3;
      muzzleY = y;
      aimDir = dir;
      gripX = handX;
      gripY = y + 2;
      break;
    }
    case "light_pistol": {
      // Compact sleek silver/polymer sidearm
      const y = 26 + bobY;
      for (let i = 0; i <= 2; i += 1) {
        g.px(handX + dir * i, y, i === 2 ? "#f1f5f9" : "#cbd5e1");
      }
      g.px(handX + dir, y + 1, "#1e293b");
      g.px(handX, y + 1, "#334155");
      opticX = handX + dir;
      opticY = y;
      muzzleX = handX + dir * 2;
      muzzleY = y;
      aimDir = dir;
      gripX = handX;
      gripY = y + 1;
      break;
    }
    case "monoblade": {
      // Razor-thin glowing cyan plasma-edged mono-katana swept up & outward
      g.px(handX, handY, "#0f172a");
      g.px(handX + dir, handY - 1, "#cbd5e1");
      g.line(handX + dir, handY - 2, handX + dir * 6, handY - 9, "#334155");
      g.line(
        handX + dir * 2,
        handY - 2,
        handX + dir * 7,
        handY - 9,
        pulse ? "#ccfbf1" : "#00f0ff",
      );
      g.px(handX + dir * 7, handY - 9, "#ffffff");
      break;
    }
    case "sword": {
      // Sleek cyber-katana with bright steel blade & gold guard
      g.px(handX, handY, "#1e293b");
      g.px(handX + dir, handY - 1, "#f5c542");
      g.line(handX + dir, handY - 2, handX + dir * 6, handY - 8, "#94a3b8");
      g.line(handX + dir * 2, handY - 2, handX + dir * 7, handY - 8, "#f8fafc");
      break;
    }
    case "club": {
      // Stun baton / shock club with glowing electric cyan tip
      g.px(handX, handY, "#1e293b");
      g.px(handX + dir, handY - 1, "#94a3b8");
      g.line(handX + dir, handY - 2, handX + dir * 4, handY - 5, "#334155");
      g.px(handX + dir * 4, handY - 6, pulse ? "#ccfbf1" : "#00f0ff");
      g.px(handX + dir * 5, handY - 6, "#00f0ff");
      if (pulse) {
        g.px(handX + dir * 4, handY - 7, "#38bdf8");
      }
      break;
    }
    case "knife": {
      // Sleek combat knife with steel blade & dark grip
      g.px(handX, handY, "#1e293b");
      g.px(handX + dir, handY - 1, "#64748b");
      g.line(handX + dir, handY - 2, handX + dir * 3, handY - 4, "#e2e8f0");
      g.px(handX + dir * 2, handY - 2, "#94a3b8");
      break;
    }
    case "grenade": {
      // Chunky tactical frag grenade held with pull pin
      const gx = Math.max(1, Math.min(29, handX + dir));
      g.rect(gx, handY - 1, 2, 3, "#4d6b3c");
      g.px(gx, handY, "#7aa15c");
      g.px(gx, handY - 2, "#facc15");
      g.px(gx + 1, handY - 2, "#ef4444");
      break;
    }
    default:
      break;
  }

  if (hasSmartgunLink && FIREARM_IDS.has(activePrimary)) {
    drawSmartgunCue(g, opticX, opticY, muzzleX, muzzleY, aimDir, gripX, gripY, pulse);
  }

  // Secondary compact weapons clipped/holstered cleanly inside belt/hips
  const secondaryCompact: string[] = [];
  const seenSecondary = new Set<string>();
  for (const id of weaponIds) {
    if (id === activePrimary || seenSecondary.has(id)) continue;
    if (
      id === "grenade" ||
      id === "knife" ||
      id === "club" ||
      SIDEARM_IDS.has(id)
    ) {
      seenSecondary.add(id);
      secondaryCompact.push(id);
    }
  }

  if (secondaryCompact.length > 0) {
    const leftHipX = roleId === "corporate" ? txLeft + 1 : txLeft;
    const rightHipX = txRight - 1;
    const primaryHip = useRightHand ? leftHipX : rightHipX;
    const secondaryHip = useRightHand ? rightHipX : leftHipX;
    const first = secondaryCompact[0];
    if (first) {
      drawBeltSecondary(g, first, primaryHip, bobY);
    }
    const second = secondaryCompact[1];
    if (second) {
      drawBeltSecondary(g, second, secondaryHip, bobY);
    }
  }
}
