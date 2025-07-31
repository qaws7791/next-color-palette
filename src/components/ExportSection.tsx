"use client";

import { useState } from "react";
import { ColorPalette } from "@/types/color";
import { Button } from "@/components/ui/Button";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { Copy, Download } from "lucide-react";

interface ExportSectionProps {
  palettes: ColorPalette[];
}

export default function ExportSection({ palettes }: ExportSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const generateCSSVariables = () => {
    let css = ":root {\n";
    
    palettes.forEach(palette => {
      palette.variants.forEach(variant => {
        css += `  --color-${variant.name.toLowerCase()}: ${variant.hex};\n`;
        css += `  --color-${variant.name.toLowerCase()}-oklch: oklch(${variant.oklch.l.toFixed(3)} ${variant.oklch.c.toFixed(3)} ${variant.oklch.h.toFixed(1)});\n`;
      });
      css += "\n";
    });
    
    css += "}";
    return css;
  };

  const generateStyleDictionaryTokens = () => {
    const tokens: any = {
      color: {}
    };

    palettes.forEach(palette => {
      tokens.color[palette.name] = {};
      
      palette.variants.forEach((variant, index) => {
        const step = (index + 1) * 100;
        tokens.color[palette.name][step] = {
          value: variant.hex,
          oklch: `oklch(${variant.oklch.l.toFixed(3)} ${variant.oklch.c.toFixed(3)} ${variant.oklch.h.toFixed(1)})`,
          contrast: {
            white: variant.contrastRatios.white.toFixed(2),
            black: variant.contrastRatios.black.toFixed(2),
            aa: variant.contrastRatios.aaWhite || variant.contrastRatios.aaBlack,
            aaa: variant.contrastRatios.aaaWhite || variant.contrastRatios.aaaBlack
          }
        };
      });
    });

    return JSON.stringify(tokens, null, 2);
  };

  const generateTailwindConfig = () => {
    let config = "module.exports = {\n  theme: {\n    extend: {\n      colors: {\n";
    
    palettes.forEach(palette => {
      config += `        ${palette.name}: {\n`;
      palette.variants.forEach((variant, index) => {
        const step = (index + 1) * 100;
        config += `          ${step}: '${variant.hex}',\n`;
      });
      config += "        },\n";
    });
    
    config += "      }\n    }\n  }\n}";
    return config;
  };

  const handleCopy = async (content: string, type: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (palettes.length === 0) {
    return null;
  }

  const cssVariables = generateCSSVariables();
  const styleDictionaryTokens = generateStyleDictionaryTokens();
  const tailwindConfig = generateTailwindConfig();

  return (
    <div className="space-y-6">
      <Tabs defaultSelectedKey="css">
        <TabList>
          <Tab id="css">CSS Variables</Tab>
          <Tab id="tokens">Style Dictionary</Tab>
          <Tab id="tailwind">Tailwind Config</Tab>
        </TabList>

        <TabPanel id="css">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onPress={() => handleCopy(cssVariables, 'css')}
              >
                {copied === 'css' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied === 'css' ? '복사됨' : '복사'}
              </Button>
              <Button
                variant="secondary"
                onPress={() => handleDownload(cssVariables, 'colors.css')}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
            <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{cssVariables}</code>
            </pre>
          </div>
        </TabPanel>

        <TabPanel id="tokens">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onPress={() => handleCopy(styleDictionaryTokens, 'tokens')}
              >
                {copied === 'tokens' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied === 'tokens' ? '복사됨' : '복사'}
              </Button>
              <Button
                variant="secondary"
                onPress={() => handleDownload(styleDictionaryTokens, 'tokens.json')}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
            <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{styleDictionaryTokens}</code>
            </pre>
          </div>
        </TabPanel>

        <TabPanel id="tailwind">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onPress={() => handleCopy(tailwindConfig, 'tailwind')}
              >
                {copied === 'tailwind' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied === 'tailwind' ? '복사됨' : '복사'}
              </Button>
              <Button
                variant="secondary"
                onPress={() => handleDownload(tailwindConfig, 'tailwind.config.js')}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
            <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{tailwindConfig}</code>
            </pre>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}