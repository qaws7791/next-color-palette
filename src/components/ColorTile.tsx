"use client";

import { useState } from "react";
import { ColorVariant } from "@/types/color";
import { Copy, Check } from "lucide-react";

interface ColorTileProps {
  variant: ColorVariant;
}

export default function ColorTile({ variant }: ColorTileProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(variant.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBestTextColor = () => {
    return variant.contrastRatios.black > variant.contrastRatios.white ? "#000000" : "#ffffff";
  };

  const getContrastBadge = () => {
    const { aaWhite, aaaWhite, aaBlack, aaaBlack } = variant.contrastRatios;
    
    if (aaaWhite || aaaBlack) return "AAA";
    if (aaWhite || aaBlack) return "AA";
    return "X";
  };

  const getContrastBadgeColor = () => {
    const badge = getContrastBadge();
    if (badge === "AAA") return "bg-green-500";
    if (badge === "AA") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className="relative aspect-square rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105 group"
      style={{ backgroundColor: variant.hex }}
      onClick={handleCopy}
    >
      {/* 명암비 배지 */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white ${getContrastBadgeColor()}`}>
        {getContrastBadge()}
      </div>

      {/* 복사 아이콘 */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? (
          <Check className="w-4 h-4" style={{ color: getBestTextColor() }} />
        ) : (
          <Copy className="w-4 h-4" style={{ color: getBestTextColor() }} />
        )}
      </div>

      {/* 컬러 정보 */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 rounded-b-xl"
        style={{ color: getBestTextColor() }}
      >
        <div className="text-xs font-medium mb-1">{variant.name}</div>
        <div className="text-xs opacity-80">{variant.hex}</div>
        <div className="text-xs opacity-60 mt-1">
          L: {variant.oklch.l.toFixed(2)}
        </div>
      </div>

      {/* 명암비 상세 정보 (호버 시 표시) */}
      <div className="absolute inset-0 bg-black bg-opacity-75 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white text-center text-xs">
          <div className="mb-2 font-semibold">명암비</div>
          <div>흰색: {variant.contrastRatios.white.toFixed(2)}</div>
          <div>검은색: {variant.contrastRatios.black.toFixed(2)}</div>
          <div className="mt-2 text-xs opacity-75">클릭하여 복사</div>
        </div>
      </div>
    </div>
  );
}