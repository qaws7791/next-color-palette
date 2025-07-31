"use client";

import { ColorPalette } from "@/types/color";
import ColorPaletteCard from "./ColorPaletteCard";

interface ColorPaletteGridProps {
  palettes: ColorPalette[];
  onRemovePalette: (id: string) => void;
}

export default function ColorPaletteGrid({ palettes, onRemovePalette }: ColorPaletteGridProps) {
  return (
    <div className="space-y-8">
      {palettes.map((palette) => (
        <ColorPaletteCard
          key={palette.id}
          palette={palette}
          onRemove={() => onRemovePalette(palette.id)}
        />
      ))}
    </div>
  );
}