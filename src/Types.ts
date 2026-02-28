import * as Renderer2D from './Renderer2D';

export interface SceneNode {
  onAttach(renderer: Renderer2D.T): void;
  onDetach(): void;
  onUpdate(deltaTime: number): void;
  onRender(renderer: Renderer2D.T): void;
}

export interface Enableable {
  enable(): void;
  disable(): void;
}

export type InteractiveNode = SceneNode & Enableable;

export interface StrokeStyle {
  readonly stroke?: string;
  readonly lineWidth?: number;
  readonly dash?: number[];
  readonly lineJoin?: 'miter' | 'bevel' | 'round';
  readonly lineCap?: 'butt' | 'square' | 'round';
}

export interface FillStyle {
  readonly fill?: string;
}

export type DrawStyle = StrokeStyle & FillStyle;
