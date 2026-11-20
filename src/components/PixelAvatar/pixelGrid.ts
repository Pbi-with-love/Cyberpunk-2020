export const LOGICAL_WIDTH = 32;
export const LOGICAL_HEIGHT = 48;
export const ICON_GRID = 16;

export class PixelGrid {
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
