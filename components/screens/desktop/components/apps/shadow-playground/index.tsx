"use client";

import { useState, useMemo } from "react";
import { ShadowLayer } from "./types";
import { DEFAULT_LAYER } from "./constants";
import {
  generateCssValue,
  generateTailwindValue,
  generateJsValue,
} from "./utils";
import { PreviewCanvas } from "./components/preview-canvas";
import { LayerList } from "./components/layer-list";
import { ControlPanel } from "./components/control-panel";
import { CodeBlock } from "./components/code-block";
import { FloatingPanel } from "./components/floating-panel";

export function ShadowPlaygroundApp({ instanceId: _ }: { instanceId: string }) {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", ...DEFAULT_LAYER },
  ]);
  const [activeId, setActiveId] = useState<string>("1");
  const [bgColor, setBgColor] = useState("#121212");

  const activeLayer = layers.find(l => l.id === activeId) || layers[0];

  const updateLayer = (id: string, updates: Partial<ShadowLayer>) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const addLayer = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setLayers(prev => [...prev, { id: newId, ...DEFAULT_LAYER, x: 5, y: 5 }]);
    setActiveId(newId);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeId === id) {
      setActiveId(newLayers[newLayers.length - 1].id);
    }
  };

  const cssValue = useMemo(() => generateCssValue(layers), [layers]);
  const tailwindValue = useMemo(() => generateTailwindValue(layers), [layers]);
  const jsValue = useMemo(() => generateJsValue(cssValue), [cssValue]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#1E1E1E] text-white"
      role="application"
    >
      {/* Full Screen Preview Background */}
      <PreviewCanvas cssValue={cssValue} backgroundColor={bgColor} />

      {/* UI Overlay Grid */}
      <div className="absolute inset-0 grid grid-cols-[320px_1fr_360px] p-6 gap-6 pointer-events-none">
        {/* Left Column: Layers & Code */}
        <div className="pointer-events-auto flex flex-col gap-6 min-h-0">
          <FloatingPanel
            title="Layers"
            className="flex-1 min-h-0 overflow-y-auto"
            contentClassName="p-0"
          >
            <LayerList
              layers={layers}
              activeId={activeId}
              onAddLayer={addLayer}
              onRemoveLayer={removeLayer}
              onSelectLayer={setActiveId}
              onApplyPreset={newLayers => {
                setLayers(newLayers);
                setActiveId(newLayers[0].id);
              }}
            />
          </FloatingPanel>

          <FloatingPanel
            title="Code"
            className="shrink-0 h-[300px]"
            contentClassName="p-4"
          >
            <div className="space-y-4 h-full overflow-y-auto pr-2">
              <CodeBlock
                label="CSS"
                code={`box-shadow: ${cssValue};`}
                onCopy={() => copyToClipboard(`box-shadow: ${cssValue};`)}
              />
              <CodeBlock
                label="Tailwind"
                code={tailwindValue}
                onCopy={() => copyToClipboard(tailwindValue)}
              />
              <CodeBlock
                label="React / JS"
                code={jsValue}
                onCopy={() => copyToClipboard(jsValue)}
              />
            </div>
          </FloatingPanel>
        </div>

        {/* Center Column: Empty for Canvas Interaction */}
        <div />

        {/* Right Column: Controls */}
        <div className="pointer-events-auto flex flex-col min-h-0">
          <FloatingPanel
            title="Controls"
            className="h-full"
            contentClassName="overflow-y-auto p-4"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2">
                  Canvas
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Background</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full border border-white/20"
                      style={{ backgroundColor: bgColor }}
                    />
                    <input
                      type="color"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-8 h-8 opacity-0 absolute cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2">
                  Layer Settings
                </div>
                <ControlPanel
                  activeLayer={activeLayer}
                  onUpdateLayer={updates => updateLayer(activeId, updates)}
                />
              </div>
            </div>
          </FloatingPanel>
        </div>
      </div>
    </div>
  );
}
