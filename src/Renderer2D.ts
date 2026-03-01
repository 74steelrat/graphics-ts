import * as Scene from './Scene';

/**
 * Lifecycle controller for shared animation loop.
 */
export type Shared = {
  /** Starts the loop. */
  start(): void;

  /** Stops the loop. */
  stop(): void;
};

/**
 * Renderer interface responsible for scene management and render loop control.
 */
export type T = {
  /** Optional renderer label (useful for debugging). */
  readonly label?: string;

  /** Target canvas element. */
  readonly canvas: HTMLCanvasElement;

  /** 2D drawing context. */
  readonly context: CanvasRenderingContext2D;

  /**
   * Logical canvas width in CSS pixels (pre-HiDPI scaling).
   * All drawing code should use this for calculations.
   */
  readonly width: number;

  /**
   * Logical canvas height in CSS pixels (pre-HiDPI scaling).
   * All drawing code should use this for calculations.
   */
  readonly height: number;

  /** Assigns a scene to the renderer. */
  setScene(scene: Scene.T): void;

  /** Starts the internal render loop. */
  start(): void;

  /** Stops the internal render loop. */
  stop(): void;

  /** Executes a single update + render cycle manually. */
  tick(deltaTime: number): void;

  /** Clears the canvas. */
  clear(): void;

  /** Renders the current scene. */
  render(): void;

  /** Cleans up resources. */
  dispose(): void;
};

/**
 * Creates a new Renderer2D instance bound to a canvas element.
 */
export const create = (
  id: string,
  label?: string,
  width?: number,
  height?: number
): T | null => {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return null;

  /* Alternative implementation: throw instead return `null`.
  if (!canvas) {
    throw new Error(`Canvas with id "${id}" not found`);
  }
  */

  const logicalWidth = width || window.innerWidth;
  const logicalHeight = height || window.innerHeight;

  canvas.width = logicalWidth;
  canvas.height = logicalHeight;

  const context = canvas.getContext('2d');
  if (!context) return null;

  let animationFrame: number | null = null;
  let lastTime = 0;
  let scene: Scene.T | null = null;

  /** Sets the active scene and detaches previous scene if present. */
  const setScene = (s: Scene.T) => {
    if (scene) scene.detach();
    scene = s;
    scene.attach(renderer);
  };

  /** Clears entire canvas. */
  const clear = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  /** Starts requestAnimationFrame loop. */
  const start = () => {
    if (!scene || animationFrame) return;

    const loop = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;

      clear();

      if (!scene) return;
      scene.update(deltaTime);
      scene.render(renderer);

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
  };

  /** Stops the render loop. */
  const stop = () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  /** Executes a single frame manually. */
  const tick = (deltaTime: number) => {
    if (!scene) return;
    clear();
    scene.update(deltaTime);
    scene.render(renderer);
  };

  /** Renders scene without updating. */
  const render = () => {
    if (scene) scene.render(renderer);
  };

  /** Stops loop and detaches scene. */
  const dispose = () => {
    stop();
    scene?.detach();
  };

  const renderer: T = {
    label,
    canvas,
    context,
    width: logicalWidth,
    height: logicalHeight,
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

/**
 * Optional setup for High-DPI / Retina displays.
 * Scales canvas and context according to devicePixelRatio.
 * After this, canvas.width / canvas.height are physical pixels,
 * but drawing can still use logical `width` / `height`.
 */
export const setupHiDPICanvas = (renderer: T | null): T | null => {
  if (!renderer) return null;

  const dpr = window.devicePixelRatio || 1;

  // Keep CSS size equal to logical dimensions
  renderer.canvas.style.width = `${renderer.width}px`;
  renderer.canvas.style.height = `${renderer.height}px`;

  // Scale physical canvas resolution
  renderer.canvas.width = renderer.width * dpr;
  renderer.canvas.height = renderer.height * dpr;

  // Scale context so 1 logical unit = 1 CSS pixel
  renderer.context.setTransform(dpr, 0, 0, dpr, 0, 0);

  return renderer;
};

/**
 * Creates a shared animation loop for multiple renderers.
 * Useful for synchronizing multiple canvases.
 */
export const createSharedLoop = (renderers: T[]): Shared => {
  let animationFrame: number | null = null;
  let lastTime = 0;
  let running = false;

  const loop = (time: number) => {
    if (!running) return;

    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;
    renderers.forEach((r) => r.tick(delta));
    animationFrame = requestAnimationFrame(loop);
  };

  /** Starts requestAnimationFrame loop. */
  const start = () => {
    if (!running) {
      running = true;
      animationFrame = requestAnimationFrame(loop);
    }
  };

  /** Stops the render loop. */
  const stop = () => {
    running = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  return { start, stop };
};
