import { Tooltip } from "./Tooltip";

export interface VerifyBadgeProps {
  label?: string;
}

const VERIFY_TOOLTIP_TEXT =
  "Compiled from memory — verify against CP2020 rulebook before release";

export function VerifyBadge({ label }: VerifyBadgeProps) {
  const badgeText = label ?? "VERIFY";

  return (
    <span className="cp-verify-badge">
      <span className="hud-badge hud-badge--amber cp-verify-badge__tag">
        {badgeText}
      </span>
      <Tooltip text={VERIFY_TOOLTIP_TEXT} label="Verify rulebook notice" />
    </span>
  );
}
