"use client";

import ColorPalette from "@/components/color-palette";
import OklchColorPicker from "@/components/picker";
import { useState } from "react";

export default function Home() {
  const [lightness, setLightness] = useState<number>(0.7); // 0-1 범위의 L 값
  const [selectedColor, setSelectedColor] = useState<{
    l: number; // 0-1 범위의 L 값
    c: number; // C 값
    h: number; // H 값 (0-360)
  }>({
    l: 0.7, // 0-1 범위의 L 값
    c: 0.4, // C 값
    h: 180, // H 값 (0-360)
  });

  return (
    <div>
      <h1>Color Picker</h1>
      <label>
        Brightness{" "}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={lightness}
          onChange={(e) => {
            console.log(e.target.value);
            setLightness(parseFloat(e.target.value));
          }}
        />
      </label>
      <OklchColorPicker
        key={lightness}
        lightness={lightness}
        color={selectedColor}
        onChange={(color) => {
          setSelectedColor(color);
        }}
      />
      <div>
        <h2>Selected Color</h2>
        <div
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: `oklch(${selectedColor.l} ${selectedColor.c} ${selectedColor.h})`,
          }}
        ></div>
        <p>
          {`oklch(${selectedColor.l} ${selectedColor.c} ${selectedColor.h})`}
        </p>
      </div>
      <div>
        <h2>Color Palette</h2>
        <ColorPalette
          baseColor={{
            l: selectedColor.l,
            c: selectedColor.c,
            h: selectedColor.h,
          }}
          steps={20}
        />
      </div>
    </div>
  );
}
