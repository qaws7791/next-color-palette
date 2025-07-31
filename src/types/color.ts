export interface OklchColor {
  l: number; // 0-1 범위의 명도
  c: number; // 채도
  h: number; // 색상 (0-360)
}

export interface ColorVariant {
  name: string;
  oklch: OklchColor;
  hex: string;
  contrastRatios: {
    white: number;
    black: number;
    aaWhite: boolean;
    aaaWhite: boolean;
    aaBlack: boolean;
    aaaBlack: boolean;
  };
}

export interface ColorPalette {
  id: string;
  name: string;
  baseColor: OklchColor;
  variants: ColorVariant[];
}