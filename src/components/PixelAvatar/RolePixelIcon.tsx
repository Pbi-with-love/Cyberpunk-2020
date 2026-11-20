import { useEffect, useRef } from "react";
import { renderRoleIcon } from "./pixelRenderer";

export interface RolePixelIconProps {
  roleId: string;
  size?: number;
  className?: string;
}

export function RolePixelIcon({
  roleId,
  size = 44,
  className,
}: RolePixelIconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderRoleIcon(ctx, roleId, size);
  }, [roleId, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className ? `role-pixel-icon ${className}` : "role-pixel-icon"}
      aria-hidden="true"
    />
  );
}
