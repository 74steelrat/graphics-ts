import * as Renderer2D from './Renderer2D';

export interface Renderable {
  init(renderer: Renderer2D.T): void;
  draw(renderer: Renderer2D.T, time?: number): void;
  update(renderer: Renderer2D.T, time?: number): void;
  destroy(): void;
}
