import { useEffect, useRef, useState } from "react";

interface OkLChColorPickerProps {
  lightness: number; // 0-1 범위의 L 값
  color: {
    l: number; // 0-1 범위의 L 값
    c: number; // C 값
    h: number; // H 값 (0-360)
  };
  onChange: (color: { l: number; c: number; h: number }) => void;
}

export default function OkLChColorPicker({
  lightness = 0.9, // 0-1 범위의 L 값
  color = {
    l: 0.7, // 0-1 범위의 L 값
    c: 0.4, // C 값
    h: 180, // H 값 (0-360)
  },
  onChange,
}: OkLChColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pickerSize = 300;
  const maxChroma = 0.4; // OkLCh의 chroma 최대값 제한 (일부 조합은 sRGB에서 표현 불가)

  // OkLCh를 RGB로 변환하는 함수
  const oklchToRgb = (l, c, h) => {
    // h를 라디안으로 변환
    const hRad = (h * Math.PI) / 180;

    // OkLCh에서 OkLab으로 변환
    const a = c * Math.cos(hRad);
    const bValue = c * Math.sin(hRad);

    // OkLab에서 선형 RGB로 변환하는 행렬 계산
    const l_ = l + 0.3963377774 * a + 0.2158037573 * bValue;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * bValue;
    const s_ = l - 0.0894841775 * a - 1.291485548 * bValue;

    // 입방체 루트 변환
    const l_r = Math.pow(Math.max(0, l_), 3);
    const m_r = Math.pow(Math.max(0, m_), 3);
    const s_r = Math.pow(Math.max(0, s_), 3);

    // 선형 RGB로 변환
    const r_linear =
      +4.0767416621 * l_r - 3.3077115913 * m_r + 0.2309699292 * s_r;
    const g_linear =
      -1.2684380046 * l_r + 2.6097574011 * m_r - 0.3413193965 * s_r;
    const b_linear =
      -0.0041960863 * l_r - 0.7034186147 * m_r + 1.707614701 * s_r;

    // 감마 보정을 적용하여 sRGB로 변환
    const r = gammaCorrectionSRGB(r_linear);
    const g = gammaCorrectionSRGB(g_linear);
    const b = gammaCorrectionSRGB(b_linear);

    // RGB 색상이 유효한지 확인
    if (
      isNaN(r) ||
      isNaN(g) ||
      isNaN(b) ||
      r < 0 ||
      g < 0 ||
      b < 0 ||
      r > 255 ||
      g > 255 ||
      b > 255
    ) {
      return { r: 0, g: 0, b: 0, valid: false };
    }

    return { r, g, b, valid: true };
  };

  // 감마 보정 함수
  const gammaCorrectionSRGB = (channel) => {
    if (channel <= 0.0031308) {
      return 255 * (12.92 * channel);
    } else {
      return 255 * (1.055 * Math.pow(channel, 1 / 2.4) - 0.055);
    }
  };

  // 2D 그라디언트 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 픽셀 밀도를 고려한 캔버스 크기 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = pickerSize * dpr;
    canvas.height = pickerSize * dpr;
    ctx.scale(dpr, dpr);

    // 각 픽셀마다 OkLCh 색상 계산 및 렌더링
    const imageData = ctx.createImageData(pickerSize, pickerSize);
    const data = imageData.data;

    for (let y = 0; y < pickerSize; y++) {
      for (let x = 0; x < pickerSize; x++) {
        // 위치에서 색상 속성 계산
        const h = (x / pickerSize) * 360; // 0-360 색상
        const c = (1 - y / pickerSize) * maxChroma; // 채도 (위쪽이 더 높음)
        const l = lightness;

        // OkLCh를 RGB로 변환
        const { r, g, b, valid } = oklchToRgb(l, c, h);

        // 이미지 데이터에 색상 설정
        const index = (y * pickerSize + x) * 4;
        if (valid) {
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255; // 알파 채널 (완전 불투명)
        } else {
          // 유효하지 않은 RGB 값은 체커보드 패턴으로 표시
          const isCheckerLight =
            (Math.floor(x / 10) + Math.floor(y / 10)) % 2 === 0;
          data[index] = isCheckerLight ? 200 : 150;
          data[index + 1] = isCheckerLight ? 200 : 150;
          data[index + 2] = isCheckerLight ? 200 : 150;
          data[index + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // 선택된 위치에 표시자 그리기
    if (selectedPosition.x !== undefined && selectedPosition.y !== undefined) {
      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, 5, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(selectedPosition.x, selectedPosition.y, 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [selectedColor, selectedPosition]);

  // 캔버스 클릭 이벤트 처리
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // 캔버스 내의 클릭 위치 계산
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 비율 계산하여 색상 값 설정하고 소숫점 4자리까지만 설정
    const c = ((1 - y / pickerSize) * maxChroma).toFixed(4); // 0-0.4 범위의 chroma
    const h = ((x / pickerSize) * 360).toFixed(4); // 0-360 범위의 hue
    const l = lightness; // 현재 설정된 lightness 값

    setSelectedColor({ l, c, h });
    setSelectedPosition({ x, y });
    onChange({ l, c, h });
  };

  // 선택된 색상의 RGB 변환
  const { r, g, b, valid } = oklchToRgb(
    selectedColor.l,
    selectedColor.c,
    selectedColor.h
  );

  return (
    <div className="relative mb-6 inline-block">
      <canvas
        ref={canvasRef}
        width={pickerSize}
        height={pickerSize}
        onClick={handleCanvasClick}
        className="cursor-pointer"
        style={{ width: `${pickerSize}px`, height: `${pickerSize}px` }}
      />
      <div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white p-1 rounded">
        Chroma (C) ↕
      </div>
      <div className="absolute top-2 right-2 text-xs bg-black bg-opacity-50 text-white p-1 rounded">
        Hue (h) ↔
      </div>
    </div>
  );
}
