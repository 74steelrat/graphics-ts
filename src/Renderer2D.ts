import * as Scene from './Scene';

export type Shared = {
  start(): void;
  stop(): void;
};

export type T = {
  readonly label?: string;
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;

  setScene(scene: Scene.T): void;
  start(): void;
  stop(): void;
  tick(deltaTime: number): void;
  clear(): void;
  render(): void;
  dispose(): void;
};

export const create = (
  id: string,
  label?: string,
  width?: number,
  height?: number
): T | null => {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return null;

  canvas.width = width || window.innerWidth;
  canvas.height = height || window.innerHeight;

  const context = canvas.getContext('2d');
  if (!context) return null;

  let animationFrame: number | null = null;
  let lastTime = 0;
  let scene: Scene.T | null = null;

  const setScene = (s: Scene.T) => {
    if (scene) scene.detach();
    scene = s;
    scene.attach(renderer);
  };

  const clear = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const start = () => {
    if (!scene || animationFrame) return;

    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      clear();

      scene!.update(deltaTime);
      scene!.render(renderer);

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  const tick = (deltaTime: number) => {
    if (!scene) return;
    clear();
    scene.update(deltaTime);
    scene.render(renderer);
  };

  const render = () => {
    if (scene) scene.render(renderer);
  };

  const dispose = () => {
    stop();
    scene?.detach();
  };

  const renderer: T = {
    label,
    canvas,
    context,
    setScene,
    start,
    stop,
    tick,
    clear,
    render,
    dispose,
  };

  return renderer;
};

export const createSharedLoop = (renderers: T[]): Shared => {
  let animationFrame: number | null = null;
  let lastTime = 0;
  let running = false;

  const loop = (time: number) => {
    if (!running) return;
    const delta = time - lastTime;
    lastTime = time;
    renderers.forEach((r) => r.tick(delta));
    animationFrame = requestAnimationFrame(loop);
  };

  const start = () => {
    if (!running) {
      running = true;
      animationFrame = requestAnimationFrame(loop);
    }
  };

  const stop = () => {
    running = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  return { start, stop };
};

/*
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
*/
