"use client";

import { useState } from "react";
import ColorInput from "@/components/ColorInput";
import ColorPaletteGrid from "@/components/ColorPaletteGrid";
import ExportSection from "@/components/ExportSection";
import { ColorPalette } from "@/types/color";

export default function Home() {
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);

  const addColorPalette = (palette: ColorPalette) => {
    setColorPalettes(prev => [...prev, palette]);
  };

  const removeColorPalette = (id: string) => {
    setColorPalettes(prev => prev.filter(palette => palette.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            OKLCH 컬러 팔레트 생성기
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            지각적으로 균일한 밝기를 가진 디자인 시스템용 컬러 팔레트를 생성하고 
            웹 접근성 명암비를 확인하세요
          </p>
        </header>

        <div className="space-y-12">
          {/* 컬러 입력 영역 */}
          <section className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              컬러 추가
            </h2>
            <ColorInput onAddColor={addColorPalette} />
          </section>

          {/* 컬러 팔레트 그리드 */}
          {colorPalettes.length > 0 && (
            <section className="space-y-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                컬러 팔레트
              </h2>
              <ColorPaletteGrid 
                palettes={colorPalettes} 
                onRemovePalette={removeColorPalette}
              />
            </section>
          )}

          {/* 내보내기 영역 */}
          {colorPalettes.length > 0 && (
            <section className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                내보내기
              </h2>
              <ExportSection palettes={colorPalettes} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}