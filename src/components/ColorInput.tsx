"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ColorPalette, OklchColor } from "@/types/color";
import { generateColorPalette, hexToOklch } from "@/utils/colorUtils";
import { parseColor } from "react-aria-components";

interface ColorInputProps {
  onAddColor: (palette: ColorPalette) => void;
}

export default function ColorInput({ onAddColor }: ColorInputProps) {
  const [colorName, setColorName] = useState("");
  const [selectedColor, setSelectedColor] = useState(parseColor("#3b82f6"));

  const handleAddColor = () => {
    if (!colorName.trim()) {
      alert("컬러 이름을 입력해주세요.");
      return;
    }

    // 선택된 컬러를 OKLCH로 변환
    const hexColor = selectedColor.toString("hex");
    const oklchColor = hexToOklch(hexColor);
    
    // 더 정확한 OKLCH 값을 위해 조정
    const adjustedOklch: OklchColor = {
      l: oklchColor.l,
      c: Math.min(0.4, oklchColor.c), // 채도 제한
      h: oklchColor.h
    };

    const palette: ColorPalette = {
      id: Date.now().toString(),
      name: colorName.trim(),
      baseColor: adjustedOklch,
      variants: generateColorPalette(colorName.trim(), adjustedOklch)
    };

    onAddColor(palette);
    setColorName("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TextField
            label="컬러 이름"
            placeholder="예: primary, secondary, accent"
            value={colorName}
            onChange={setColorName}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            베이스 컬러 선택
          </label>
          <ColorPicker
            label="컬러 선택"
            value={selectedColor}
            onChange={setSelectedColor}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onPress={handleAddColor}
          className="px-8 py-3 text-lg font-semibold"
        >
          컬러 팔레트 추가
        </Button>
      </div>
    </div>
  );
}