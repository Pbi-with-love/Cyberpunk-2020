import { useEffect, useRef, useState } from "react";
import type { Character } from "../../types";
import { renderPixelCharacter } from "./pixelRenderer";

export interface PixelAvatarCanvasProps {
  character: Character;
  width?: number;
  height?: number;
  animate?: boolean;
  testId?: string;
  className?: string;
  ariaLabel?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  primaryWeaponId?: string | null;
  previewItemId?: string | null;
}

function queryReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PixelAvatarCanvas({
  character,
  width = 256,
  height = 384,
  animate = true,
  testId,
  className,
  ariaLabel,
  onCanvasReady,
  primaryWeaponId,
  previewItemId,
}: PixelAvatarCanvasProps) {
  const resolvedTestId =
    testId !== undefined
      ? testId
      : width === 256 && height === 384
        ? "pixel-avatar-canvas"
        : undefined;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frame, setFrame] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(queryReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(media.matches);
    setReducedMotion(media.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!animate || reducedMotion) {
      setFrame(0);
      return undefined;
    }
    const timer = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % 2);
    }, 500);
    return () => window.clearInterval(timer);
  }, [animate, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    onCanvasReady?.(canvas);
    return () => {
      onCanvasReady?.(null);
    };
  }, [onCanvasReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPixelCharacter(ctx, character, {
      frame: reducedMotion ? 0 : frame,
      width,
      height,
      primaryWeaponId,
      previewItemId,
    });
  }, [
    character,
    frame,
    height,
    previewItemId,
    primaryWeaponId,
    reducedMotion,
    width,
  ]);

  return (
    <canvas
      ref={canvasRef}
      data-testid={resolvedTestId}
      className={className ? `pixel-avatar-canvas ${className}` : "pixel-avatar-canvas"}
      width={width}
      height={height}
      role="img"
      aria-label={
        ariaLabel ??
        `2D pixel avatar for ${character.identity.handle.trim() || "unnamed edgerunner"}`
      }
    />
  );
}
