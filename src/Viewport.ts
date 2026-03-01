import { type StateAccessible, stateAccessible } from 'base-ts';
import * as Scene from './Scene';
import * as Renderer2D from './Renderer2D';
import { Point2 } from 'math-ts';

/** Constants for zoom handling. */
const SCALE_STEP = 0.1;
const SCALE_MIN = 1;
const SCALE_MAX = 5;

/** Represents an active panning operation. */
export type Pan = {
  start: Point2.T;
  end: Point2.T;
  offset: Point2.T;
  active: boolean;
};

/** Viewport state. */
export type State = {
  /** Current pan/scroll offset. */
  offset: Point2.T;
  /** Center point of the viewport (canvas center.) */
  center: Point2.T;
  /** Current zoom scale. */
  scale: number;
  /** Current pan operation. */
  pan: Pan;
};

/** Viewport interface. */
export type T = {
  /** Computes mouse position in viewport coordinates. */
  getMouse: (event: MouseEvent, subtractPanOffset?: boolean) => Point2.T;

  /** Gets current viewport offset. */
  getOffset: () => Point2.T;
} & StateAccessible<State> &
  Scene.Node;

/** Creates a default state. */
export const createState = (): State => ({
  offset: Point2.create(0, 0),
  center: Point2.create(0, 0),
  scale: 1,
  pan: {
    start: Point2.create(0, 0),
    end: Point2.create(0, 0),
    offset: Point2.create(0, 0),
    active: false,
  },
});

/**
 * Creates a Node that can be attached to a Scene and manages
 * pan & zoom interactions, state accessibility, and rendering transforms.
 */
export const create = (): T => {
  let state = createState();

  const accessible = stateAccessible(state);

  const getMouse = (
    event: MouseEvent,
    subtractPanOffset: boolean = false
  ): Point2.T => {
    const p = Point2.create(
      (event.offsetX - state.center.x) * state.scale - state.offset.x,
      (event.offsetY - state.center.y) * state.scale - state.offset.y
    );

    return subtractPanOffset ? Point2.subtracted(p, state.pan.offset) : p;
  };

  const getOffset = (): Point2.T => calculateOffset(state);

  let canvas: HTMLCanvasElement | null = null;
  let wheelMouseHandler: ReturnType<typeof createMouseWheelHandler> | null =
    null;
  let mouseDownHandler: ReturnType<typeof createMouseDownHandler> | null = null;
  let mouseMoveHandler: ReturnType<typeof createMouseMoveHandler> | null = null;
  let mouseUpHandler: ReturnType<typeof createMouseUpHandler> | null = null;

  const onAttach = (renderer: Renderer2D.T): void => {
    canvas = renderer.canvas;

    state.center = Point2.create(
      renderer.canvas.width / 2,
      renderer.canvas.height / 2
    );

    state.offset = Point2.multiplied(state.center, -1);

    wheelMouseHandler = createMouseWheelHandler(state);
    renderer.canvas.addEventListener('wheel', wheelMouseHandler, {
      passive: false,
    });

    mouseDownHandler = createMouseDownHandler(state, getMouse);
    renderer.canvas.addEventListener('mousedown', mouseDownHandler);

    mouseMoveHandler = createMouseMoveHandler(state, getMouse);
    renderer.canvas.addEventListener('mousemove', mouseMoveHandler);

    mouseUpHandler = createMouseUpHandler(state);
    renderer.canvas.addEventListener('mouseup', mouseUpHandler);
  };

  const onUpdate = (): void => {};

  const onRender = (renderer: Renderer2D.T): void => {
    const ctx = renderer.context;

    ctx.restore();
    renderer.clear();
    ctx.save();

    ctx.translate(state.center.x, state.center.y);
    ctx.scale(1 / state.scale, 1 / state.scale);
    const offset = calculateOffset(state);
    ctx.translate(offset.x, offset.y);
  };

  const onDetach = (): void => {
    if (!canvas) return;

    if (wheelMouseHandler)
      canvas.removeEventListener('wheel', wheelMouseHandler);

    if (mouseDownHandler)
      canvas.removeEventListener('mousedown', mouseDownHandler);

    if (mouseMoveHandler)
      canvas.removeEventListener('mousemove', mouseMoveHandler);

    if (mouseUpHandler) canvas.removeEventListener('mouseup', mouseUpHandler);
  };

  return {
    ...accessible,
    getMouse,
    getOffset,
    onAttach,
    onUpdate,
    onRender,
    onDetach,
  };
};

const createMouseWheelHandler = (state: State) => (event: WheelEvent) => {
  event.preventDefault();

  const dir = Math.sign(event.deltaY);
  state.scale += dir * SCALE_STEP;
  state.scale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, state.scale));
};

const createMouseDownHandler =
  (state: State, getMouse: (event: MouseEvent) => Point2.T) =>
  (event: MouseEvent) => {
    const isMiddle = event.button === 1;
    const isAltLeft = event.button === 0 && event.altKey;

    if (isMiddle || isAltLeft) {
      state.pan.start = getMouse(event);
      state.pan.active = true;
    }
  };

const createMouseMoveHandler =
  (state: State, getMouse: (event: MouseEvent) => Point2.T) =>
  (event: MouseEvent) => {
    if (state.pan.active) {
      state.pan.end = getMouse(event);
      state.pan.offset = Point2.subtracted(state.pan.end, state.pan.start);
    }
  };

const createMouseUpHandler = (state: State) => () => {
  if (state.pan.active) {
    state.offset = Point2.added(state.offset, state.pan.offset);
    state.pan = {
      start: Point2.create(0, 0),
      end: Point2.create(0, 0),
      offset: Point2.create(0, 0),
      active: false,
    };
  }
};

const calculateOffset = (state: State): Point2.T =>
  Point2.added(state.offset, state.pan.offset);
