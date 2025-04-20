interface ColorPaletteProps {
  baseColor: {
    l: number;
    c: number;
    h: number;
  };
  steps: number; // 색상 단계 수 (예: 10)
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ baseColor, steps }) => {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {Array.from({ length: steps }, (_, i) => {
        const l = 1 - i * (1 / steps); // L 값은 1에서 0까지 감소
        const c = baseColor.c; // C 값은 고정
        return (
          <div
            key={i}
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: `oklch(${l} ${c} ${baseColor.h})`,
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default ColorPalette;
