export interface CanvasInteractable {
  attach: (canvas: HTMLCanvasElement) => void;
  detach: () => void;
  enable: () => void;
  disable: () => void;
}
