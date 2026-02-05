import { Point2, Capsule2 } from 'math-ts';
import type { DrawStyle } from './Types';

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  point: Point2.T,
  radius: number,
  { fill, stroke, lineWidth = 1 }: DrawStyle = {}
): void => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  from: Point2.T,
  to: Point2.T,
  { stroke = 'black', lineWidth = 1, dash = [] }: DrawStyle = {}
): void => {
  ctx.beginPath();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);

  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.setLineDash([]);
};

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point2.T[],
  { fill, stroke, lineWidth = 1, lineJoin = 'miter' }: DrawStyle = {}
): void => {
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = lineJoin;
    ctx.stroke();
  }
};

export const drawCapsule = (
  ctx: CanvasRenderingContext2D,
  capsule: Capsule2.T,
  style: DrawStyle = {}
): void => {
  drawPolygon(ctx, capsule.polygon.points, style);
};
