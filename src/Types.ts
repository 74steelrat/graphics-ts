export interface StrokeStyle {
  readonly stroke?: string;
  readonly lineWidth?: number;
  readonly dash?: number[];
}

export interface FillStyle {
  readonly fill?: string;
}

export type DrawStyle = StrokeStyle & FillStyle;
