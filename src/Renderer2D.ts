import type { Renderable } from './Renderable';

export type T = {
  label?: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  // Private
  _animationFrameId: number | null;
  _isAnimating: boolean;
};

export const create = (
  id: string,
  label?: string,
  width?: number,
  height?: number
): T | null => {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const context = canvas.getContext('2d');
  if (!context) return null;

  canvas.width = width || window.innerWidth;
  canvas.height = height || window.innerHeight;

  return {
    label,
    canvas,
    context,
    _animationFrameId: null,
    _isAnimating: false,
  };
};

export const draw = (renderer: T, renderable: Renderable): void => {
  renderable.init(renderer);
  renderable.draw(renderer);
};

export const start = (renderer: T, renderable: Renderable): void => {
  if (renderer._isAnimating) return;

  renderer._isAnimating = true;
  renderable.init(renderer);

  const animate = () => {
    if (!renderer._isAnimating) return;

    renderable.draw(renderer);
    renderable.update(renderer);
    renderer._animationFrameId = window.requestAnimationFrame(animate);
  };

  renderer._animationFrameId = window.requestAnimationFrame(animate);
};

export const stop = (renderer: T): void => {
  renderer._isAnimating = false;

  if (renderer._animationFrameId !== null) {
    window.cancelAnimationFrame(renderer._animationFrameId);
    renderer._animationFrameId = null;
  }
};

export const destroy = (renderer: T, renderable: Renderable): void => {
  stop(renderer);
  renderable.destroy();
};

export const startShared = (
  pairs: { renderer: T; renderable: Renderable }[]
): (() => void) => {
  pairs.forEach(({ renderer, renderable }) => renderable.init(renderer));

  let isAnimating = true;
  let animationFrameId: number | null = null;

  const animate = (time: number) => {
    if (!isAnimating) return;

    pairs.forEach(({ renderer, renderable }) => {
      renderable.draw(renderer, time);
      renderable.update(renderer, time);
    });

    animationFrameId = window.requestAnimationFrame(animate);
  };

  animationFrameId = window.requestAnimationFrame(animate);

  return () => {
    isAnimating = false;
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
};
