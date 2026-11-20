export interface DiceButtonProps {
  label: string;
  onClick: () => void;
  testId?: string;
  disabled?: boolean;
}

function PixelDiceIcon({ kind }: { kind: "d10" | "d6" }) {
  if (kind === "d6") {
    return (
      <svg
        className="cp-dice-btn__icon"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {/* Outer pixel square die */}
        <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z" />
        {/* 5-pip layout */}
        <rect x="5" y="5" width="2" height="2" />
        <rect x="9" y="5" width="2" height="2" />
        <rect x="7" y="7" width="2" height="2" />
        <rect x="5" y="9" width="2" height="2" />
        <rect x="9" y="9" width="2" height="2" />
      </svg>
    );
  }

  return (
    <svg
      className="cp-dice-btn__icon"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/* Pixel d10 kite/diamond silhouette */}
      <rect x="7" y="1" width="2" height="1" />
      <rect x="5" y="2" width="2" height="1" />
      <rect x="9" y="2" width="2" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="1" y="5" width="2" height="4" />
      <rect x="13" y="5" width="2" height="4" />
      <rect x="3" y="9" width="2" height="2" />
      <rect x="11" y="9" width="2" height="2" />
      <rect x="5" y="11" width="2" height="2" />
      <rect x="9" y="11" width="2" height="2" />
      <rect x="7" y="13" width="2" height="2" />
      {/* Inner facet edges */}
      <rect x="7" y="2" width="2" height="3" opacity="0.6" />
      <rect x="3" y="7" width="3" height="1" opacity="0.6" />
      <rect x="10" y="7" width="3" height="1" opacity="0.6" />
      <rect x="6" y="5" width="4" height="4" opacity="0.3" />
      <rect x="7" y="9" width="2" height="4" opacity="0.6" />
    </svg>
  );
}

export function DiceButton({ label, onClick, testId, disabled }: DiceButtonProps) {
  const iconKind = /\bd6\b/i.test(label) ? "d6" : "d10";

  return (
    <button
      type="button"
      className="hud-btn cp-dice-btn"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={label}
    >
      <PixelDiceIcon kind={iconKind} />
      <span>{label}</span>
    </button>
  );
}
