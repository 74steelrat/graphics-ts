export interface StrokeStyle {
  readonly stroke?: string;
  readonly lineWidth?: number;
  readonly dash?: number[];
  readonly lineJoin?: 'miter' | 'bevel' | 'round';
}

export interface FillStyle {
  readonly fill?: string;
}

export type DrawStyle = StrokeStyle & FillStyle;
