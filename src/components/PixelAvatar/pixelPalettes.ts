import type { ClothesColorId, HairColorId, SkinToneId } from "../../types";

export interface SkinPalette {
  id: SkinToneId;
  label: string;
  base: string;
  highlight: string;
  shadow: string;
  outline: string;
  swatch: string;
}

export interface HairPalette {
  id: HairColorId;
  label: string;
  base: string;
  highlight: string;
  shadow: string;
  outline: string;
  swatch: string;
}

export interface OutfitPalette {
  primary: string;
  primaryHighlight: string;
  primaryShadow: string;
  secondary: string;
  secondaryShadow: string;
  accent: string;
  accentGlow: string;
  outline: string;
}

export interface ClothesColorOption {
  id: ClothesColorId;
  label: string;
  swatch: string;
  swatchAccent: string;
  override?: Partial<OutfitPalette>;
}

export interface RoleVisualTheme {
  id: string;
  label: string;
  tag: string;
  aura: string;
  auraSoft: string;
  visor: string;
  visorGlow: string;
  defaultOutfit: OutfitPalette;
}

export const SKIN_PALETTES: Record<SkinToneId, SkinPalette> = {
  pale: {
    id: "pale",
    label: "Pale",
    base: "#f2d6c9",
    highlight: "#fff0e8",
    shadow: "#c99f8d",
    outline: "#4d3632",
    swatch: "#f2d6c9",
  },
  fair: {
    id: "fair",
    label: "Fair",
    base: "#e6b89c",
    highlight: "#f9d5be",
    shadow: "#b58268",
    outline: "#4a3026",
    swatch: "#e6b89c",
  },
  olive: {
    id: "olive",
    label: "Olive",
    base: "#c89f78",
    highlight: "#dfb994",
    shadow: "#916b4a",
    outline: "#3d291a",
    swatch: "#c89f78",
  },
  tan: {
    id: "tan",
    label: "Tan",
    base: "#b57b52",
    highlight: "#cf966d",
    shadow: "#7d4f30",
    outline: "#362013",
    swatch: "#b57b52",
  },
  deep: {
    id: "deep",
    label: "Deep",
    base: "#6b422e",
    highlight: "#8a5a42",
    shadow: "#422417",
    outline: "#1f0f0a",
    swatch: "#6b422e",
  },
  chrome: {
    id: "chrome",
    label: "Chrome",
    base: "#9cb3c9",
    highlight: "#e3f2ff",
    shadow: "#52677d",
    outline: "#19232e",
    swatch: "#a8bfd6",
  },
};

export const HAIR_PALETTES: Record<HairColorId, HairPalette> = {
  pink: {
    id: "pink",
    label: "Neon Pink",
    base: "#f02e8c",
    highlight: "#ff85c0",
    shadow: "#941152",
    outline: "#38051e",
    swatch: "#f02e8c",
  },
  cyan: {
    id: "cyan",
    label: "Cyber Cyan",
    base: "#00d4e6",
    highlight: "#85f7ff",
    shadow: "#00748a",
    outline: "#042833",
    swatch: "#00d4e6",
  },
  black: {
    id: "black",
    label: "Obsidian Black",
    base: "#242936",
    highlight: "#424b61",
    shadow: "#12151c",
    outline: "#07080d",
    swatch: "#242936",
  },
  silver: {
    id: "silver",
    label: "Chrome Silver",
    base: "#bfc9d6",
    highlight: "#f2f7ff",
    shadow: "#6e7c8f",
    outline: "#222933",
    swatch: "#bfc9d6",
  },
  red: {
    id: "red",
    label: "Crimson Red",
    base: "#de283b",
    highlight: "#ff6b7a",
    shadow: "#85111e",
    outline: "#33050a",
    swatch: "#de283b",
  },
  yellow: {
    id: "yellow",
    label: "Acid Volt",
    base: "#ebd321",
    highlight: "#fff37a",
    shadow: "#9c830b",
    outline: "#382c02",
    swatch: "#ebd321",
  },
  violet: {
    id: "violet",
    label: "Synth Violet",
    base: "#9945e8",
    highlight: "#cc8fff",
    shadow: "#531b8a",
    outline: "#1f0836",
    swatch: "#9945e8",
  },
  copper: {
    id: "copper",
    label: "Rust Copper",
    base: "#d46428",
    highlight: "#f79760",
    shadow: "#823410",
    outline: "#331205",
    swatch: "#d46428",
  },
};

export const CLOTHES_PALETTES: Record<ClothesColorId, ClothesColorOption> = {
  default: {
    id: "default",
    label: "Role Signature",
    swatch: "#3a4559",
    swatchAccent: "#00f0ff",
  },
  neon_pink: {
    id: "neon_pink",
    label: "Neon Pink",
    swatch: "#c71f73",
    swatchAccent: "#ff66b5",
    override: {
      primary: "#361830",
      primaryHighlight: "#6e295d",
      primaryShadow: "#1e0c1a",
      secondary: "#1e2030",
      secondaryShadow: "#11121c",
      accent: "#ff2e97",
      accentGlow: "#ff85c2",
    },
  },
  cyber_cyan: {
    id: "cyber_cyan",
    label: "Cyber Cyan",
    swatch: "#0d758a",
    swatchAccent: "#00f0ff",
    override: {
      primary: "#143042",
      primaryHighlight: "#1f5370",
      primaryShadow: "#0b1a24",
      secondary: "#18222e",
      secondaryShadow: "#0d131a",
      accent: "#00d9f5",
      accentGlow: "#8af8ff",
    },
  },
  tactical_olive: {
    id: "tactical_olive",
    label: "Tactical Olive",
    swatch: "#4b593c",
    swatchAccent: "#b8c76f",
    override: {
      primary: "#435237",
      primaryHighlight: "#60754e",
      primaryShadow: "#283320",
      secondary: "#33382e",
      secondaryShadow: "#1d211a",
      accent: "#d69f31",
      accentGlow: "#ffd166",
    },
  },
  corp_charcoal: {
    id: "corp_charcoal",
    label: "Corp Charcoal",
    swatch: "#262b36",
    swatchAccent: "#a2b0c7",
    override: {
      primary: "#252933",
      primaryHighlight: "#3d4454",
      primaryShadow: "#14171c",
      secondary: "#1b1e26",
      secondaryShadow: "#0f1117",
      accent: "#d9364f",
      accentGlow: "#ff667d",
    },
  },
  crimson: {
    id: "crimson",
    label: "Crimson",
    swatch: "#9e1c2b",
    swatchAccent: "#ff475d",
    override: {
      primary: "#7a1624",
      primaryHighlight: "#ad2437",
      primaryShadow: "#470a13",
      secondary: "#241b20",
      secondaryShadow: "#140e11",
      accent: "#ff4258",
      accentGlow: "#ff8c9a",
    },
  },
  gold_chrome: {
    id: "gold_chrome",
    label: "Gold Chrome",
    swatch: "#c7992c",
    swatchAccent: "#ffe270",
    override: {
      primary: "#4f3f21",
      primaryHighlight: "#8a6d33",
      primaryShadow: "#2b2210",
      secondary: "#211f26",
      secondaryShadow: "#121014",
      accent: "#f2c138",
      accentGlow: "#fff099",
    },
  },
  street_denim: {
    id: "street_denim",
    label: "Street Denim",
    swatch: "#2f4e78",
    swatchAccent: "#6eb2ff",
    override: {
      primary: "#2c466b",
      primaryHighlight: "#44689c",
      primaryShadow: "#192a42",
      secondary: "#25344d",
      secondaryShadow: "#151e2e",
      accent: "#ff8c2b",
      accentGlow: "#ffbe73",
    },
  },
};

export const ROLE_VISUALS: Record<string, RoleVisualTheme> = {
  solo: {
    id: "solo",
    label: "Solo",
    tag: "HIRED GUN",
    aura: "#ff2e54",
    auraSoft: "#4a1220",
    visor: "#ff2e54",
    visorGlow: "#ff8fa3",
    defaultOutfit: {
      primary: "#2a313d",
      primaryHighlight: "#444f61",
      primaryShadow: "#171b24",
      secondary: "#1f242e",
      secondaryShadow: "#11141a",
      accent: "#ff2e54",
      accentGlow: "#ff7a92",
      outline: "#090b10",
    },
  },
  rocker: {
    id: "rocker",
    label: "Rockerboy",
    tag: "REBEL ICON",
    aura: "#ff2e97",
    auraSoft: "#4d1236",
    visor: "#ff2e97",
    visorGlow: "#ff94ca",
    defaultOutfit: {
      primary: "#261c2e",
      primaryHighlight: "#483054",
      primaryShadow: "#140e1a",
      secondary: "#1a1821",
      secondaryShadow: "#0d0c12",
      accent: "#ff2e97",
      accentGlow: "#ff82c3",
      outline: "#08060d",
    },
  },
  netrunner: {
    id: "netrunner",
    label: "Netrunner",
    tag: "NETRUNNER",
    aura: "#00f0ff",
    auraSoft: "#0b3b4a",
    visor: "#00f0ff",
    visorGlow: "#99fbff",
    defaultOutfit: {
      primary: "#152236",
      primaryHighlight: "#243b5c",
      primaryShadow: "#0b121f",
      secondary: "#101826",
      secondaryShadow: "#080c14",
      accent: "#00e1ff",
      accentGlow: "#96f7ff",
      outline: "#050912",
    },
  },
  media: {
    id: "media",
    label: "Media",
    tag: "TRUTHSEEKER",
    aura: "#ffaa00",
    auraSoft: "#4a330a",
    visor: "#ff334b",
    visorGlow: "#ff99a5",
    defaultOutfit: {
      primary: "#5b5548",
      primaryHighlight: "#7d7463",
      primaryShadow: "#38342b",
      secondary: "#2b374a",
      secondaryShadow: "#19202b",
      accent: "#ffaa00",
      accentGlow: "#ffe07d",
      outline: "#12100d",
    },
  },
  nomad: {
    id: "nomad",
    label: "Nomad",
    tag: "ROAD WARRIOR",
    aura: "#eb8328",
    auraSoft: "#4a280b",
    visor: "#f2a43d",
    visorGlow: "#ffd485",
    defaultOutfit: {
      primary: "#5c4a35",
      primaryHighlight: "#80674a",
      primaryShadow: "#362b1e",
      secondary: "#2b362b",
      secondaryShadow: "#171f17",
      accent: "#e67b24",
      accentGlow: "#ffb66b",
      outline: "#140f0a",
    },
  },
  fixer: {
    id: "fixer",
    label: "Fixer",
    tag: "DEALMAKER",
    aura: "#f5c542",
    auraSoft: "#47390f",
    visor: "#00e6ff",
    visorGlow: "#94f6ff",
    defaultOutfit: {
      primary: "#2a203b",
      primaryHighlight: "#473561",
      primaryShadow: "#161021",
      secondary: "#1e1a29",
      secondaryShadow: "#100e17",
      accent: "#f5c542",
      accentGlow: "#fff09e",
      outline: "#0b0812",
    },
  },
  cop: {
    id: "cop",
    label: "Cop",
    tag: "NCPD ENFORCER",
    aura: "#2e9bff",
    auraSoft: "#0e2d52",
    visor: "#2e9bff",
    visorGlow: "#8fd1ff",
    defaultOutfit: {
      primary: "#1b2e4d",
      primaryHighlight: "#2c4975",
      primaryShadow: "#0f1a2e",
      secondary: "#1b2230",
      secondaryShadow: "#0f131c",
      accent: "#38a5ff",
      accentGlow: "#a3d8ff",
      outline: "#070c17",
    },
  },
  corporate: {
    id: "corporate",
    label: "Corporate",
    tag: "CORP EXEC",
    aura: "#e63250",
    auraSoft: "#45101c",
    visor: "#38d9ff",
    visorGlow: "#a8f0ff",
    defaultOutfit: {
      primary: "#222630",
      primaryHighlight: "#3a4052",
      primaryShadow: "#12151c",
      secondary: "#1a1d24",
      secondaryShadow: "#0d0f14",
      accent: "#e63250",
      accentGlow: "#ff8095",
      outline: "#08090d",
    },
  },
  techie: {
    id: "techie",
    label: "Techie",
    tag: "GEARWRIGHT",
    aura: "#f2b705",
    auraSoft: "#453405",
    visor: "#00e6ff",
    visorGlow: "#9cf7ff",
    defaultOutfit: {
      primary: "#43523c",
      primaryHighlight: "#607556",
      primaryShadow: "#283324",
      secondary: "#4f3a2a",
      secondaryShadow: "#2e2016",
      accent: "#f2b705",
      accentGlow: "#ffe678",
      outline: "#12140f",
    },
  },
  medtechie: {
    id: "medtechie",
    label: "Medtechie",
    tag: "TRAUMA DOC",
    aura: "#26e6b5",
    auraSoft: "#0c4238",
    visor: "#26e6b5",
    visorGlow: "#9effe6",
    defaultOutfit: {
      primary: "#c9d6e3",
      primaryHighlight: "#f0f7ff",
      primaryShadow: "#8295a8",
      secondary: "#146e6d",
      secondaryShadow: "#0b4242",
      accent: "#ff2e4d",
      accentGlow: "#ff8597",
      outline: "#141d26",
    },
  },
};

export function getSkinPalette(skinTone?: SkinToneId): SkinPalette {
  return (skinTone ? SKIN_PALETTES[skinTone] : undefined) ?? SKIN_PALETTES.tan;
}

export function getHairPalette(hairColor?: HairColorId): HairPalette {
  return (hairColor ? HAIR_PALETTES[hairColor] : undefined) ?? HAIR_PALETTES.cyan;
}

export function getRoleVisual(roleId: string): RoleVisualTheme {
  return ROLE_VISUALS[roleId] ?? (ROLE_VISUALS.solo as RoleVisualTheme);
}

export function resolveOutfitPalette(
  roleId: string,
  clothesColor?: ClothesColorId,
): OutfitPalette {
  const roleTheme = getRoleVisual(roleId);
  const base = roleTheme.defaultOutfit;
  if (!clothesColor || clothesColor === "default") {
    return base;
  }
  const override = CLOTHES_PALETTES[clothesColor]?.override;
  if (!override) {
    return base;
  }
  return {
    ...base,
    ...override,
  };
}

export function getBodyBuildInfo(bodyStat: number): {
  tier: "slim" | "athletic" | "heavy";
  label: string;
} {
  if (bodyStat <= 4) {
    return { tier: "slim", label: "Slim" };
  }
  if (bodyStat >= 8) {
    return { tier: "heavy", label: "Heavy" };
  }
  return { tier: "athletic", label: "Athletic" };
}
