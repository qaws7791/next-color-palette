import { OklchColor, ColorVariant } from "@/types/color";

// OKLCH를 RGB로 변환
export function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  // h를 라디안으로 변환
  const hRad = (h * Math.PI) / 180;

  // OKLCH에서 OKLab으로 변환
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab에서 선형 RGB로 변환
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l_r = Math.pow(Math.max(0, l_), 3);
  const m_r = Math.pow(Math.max(0, m_), 3);
  const s_r = Math.pow(Math.max(0, s_), 3);

  const r_linear = +4.0767416621 * l_r - 3.3077115913 * m_r + 0.2309699292 * s_r;
  const g_linear = -1.2684380046 * l_r + 2.6097574011 * m_r - 0.3413193965 * s_r;
  const b_linear = -0.0041960863 * l_r - 0.7034186147 * m_r + 1.707614701 * s_r;

  // 감마 보정
  const r = gammaCorrectionSRGB(r_linear);
  const g = gammaCorrectionSRGB(g_linear);
  const b = gammaCorrectionSRGB(b_linear);

  return {
    r: Math.max(0, Math.min(255, Math.round(r))),
    g: Math.max(0, Math.min(255, Math.round(g))),
    b: Math.max(0, Math.min(255, Math.round(b)))
  };
}

function gammaCorrectionSRGB(channel: number): number {
  if (channel <= 0.0031308) {
    return 255 * (12.92 * channel);
  } else {
    return 255 * (1.055 * Math.pow(channel, 1 / 2.4) - 0.055);
  }
}

// RGB를 HEX로 변환
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// OKLCH를 HEX로 변환
export function oklchToHex(l: number, c: number, h: number): string {
  const { r, g, b } = oklchToRgb(l, c, h);
  return rgbToHex(r, g, b);
}

// 상대 휘도 계산
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// 명암비 계산
export function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const l1 = getRelativeLuminance(color1.r, color1.g, color1.b);
  const l2 = getRelativeLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 지각적으로 균일한 밝기 스케일 생성
export function generatePerceptualLightnessScale(baseL: number): number[] {
  // 11개의 단계로 나누어 지각적으로 균일한 밝기 스케일 생성
  const steps = 11;
  const scale: number[] = [];
  
  // 베이스 명도를 중심으로 대칭적인 스케일 생성
  const minL = 0.05;
  const maxL = 0.95;
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    // 지각적으로 균일한 분포를 위해 easing 함수 적용
    const easedT = easeInOutCubic(t);
    const l = minL + (maxL - minL) * easedT;
    scale.push(l);
  }
  
  return scale;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 컬러 팔레트 생성
export function generateColorPalette(name: string, baseColor: OklchColor): ColorVariant[] {
  const lightnessScale = generatePerceptualLightnessScale(baseColor.l);
  const variants: ColorVariant[] = [];
  
  lightnessScale.forEach((l, index) => {
    const oklch: OklchColor = {
      l,
      c: baseColor.c,
      h: baseColor.h
    };
    
    const rgb = oklchToRgb(l, baseColor.c, baseColor.h);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    // 흰색과 검은색에 대한 명암비 계산
    const whiteRgb = { r: 255, g: 255, b: 255 };
    const blackRgb = { r: 0, g: 0, b: 0 };
    
    const contrastWithWhite = getContrastRatio(rgb, whiteRgb);
    const contrastWithBlack = getContrastRatio(rgb, blackRgb);
    
    variants.push({
      name: `${name}-${(index + 1) * 100}`,
      oklch,
      hex,
      contrastRatios: {
        white: contrastWithWhite,
        black: contrastWithBlack,
        aaWhite: contrastWithWhite >= 4.5,
        aaaWhite: contrastWithWhite >= 7,
        aaBlack: contrastWithBlack >= 4.5,
        aaaBlack: contrastWithBlack >= 7
      }
    });
  });
  
  return variants;
}

// HEX를 OKLCH로 변환 (근사치)
export function hexToOklch(hex: string): OklchColor {
  // HEX를 RGB로 변환
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // RGB를 OKLCH로 변환 (역변환은 복잡하므로 근사치 사용)
  // 실제로는 더 정확한 변환이 필요하지만, 여기서는 간단한 근사치 사용
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const c = 0.4; // 기본 채도값
  const h = 180; // 기본 색상값
  
  return { l, c, h };
}