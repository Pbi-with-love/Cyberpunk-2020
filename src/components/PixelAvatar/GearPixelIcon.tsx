import { useEffect, useRef } from "react";
import {
  armorById,
  catalogById,
  cyberwareById,
  weaponsById,
} from "../../data";
import { drawArmorIcon } from "./pixelArmor";
import { drawCyberwareIcon } from "./pixelCyberware";
import { ICON_GRID, PixelGrid } from "./pixelGrid";
import { drawWeaponIcon } from "./pixelWeapons";

export interface GearPixelIconProps {
  itemId: string;
  size?: number;
  className?: string;
  testId?: string;
}

export function GearPixelIcon({
  itemId,
  size = 36,
  className,
  testId,
}: GearPixelIconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;

    const g = new PixelGrid(ctx, ICON_GRID, ICON_GRID, size, size);

    if (weaponsById[itemId]) {
      drawWeaponIcon(g, itemId);
    } else if (armorById[itemId]) {
      drawArmorIcon(g, itemId);
    } else if (cyberwareById[itemId]) {
      drawCyberwareIcon(g, itemId);
    } else {
      g.rect(3, 3, 10, 10, "#1e293b");
      g.rect(4, 4, 8, 8, "#0f172a");
      g.hline(6, 7, 4, "#00f0ff");
      g.vline(7, 6, 4, "#00f0ff");
    }
  }, [itemId, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className ? `gear-pixel-icon ${className}` : "gear-pixel-icon"}
      data-testid={testId}
      aria-hidden="true"
      title={catalogById[itemId]?.name ?? itemId}
    />
  );
}
