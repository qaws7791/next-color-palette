"use client";

import { ColorPalette } from "@/types/color";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import ColorTile from "./ColorTile";

interface ColorPaletteCardProps {
  palette: ColorPalette;
  onRemove: () => void;
}

export default function ColorPaletteCard({ palette, onRemove }: ColorPaletteCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
          {palette.name}
        </h3>
        <Button
          variant="destructive"
          onPress={onRemove}
          className="p-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-11 gap-4">
        {palette.variants.map((variant, index) => (
          <ColorTile
            key={index}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}