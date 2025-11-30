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

export function ShadowPlaygroundApp({ instanceId: _ }: { instanceId: string }) {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", ...DEFAULT_LAYER },
  ]);
  const [activeId, setActiveId] = useState<string>("1");

  const activeLayer = layers.find(l => l.id === activeId) || layers[0];

  const updateLayer = (id: string, updates: Partial<ShadowLayer>) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const addLayer = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setLayers(prev => [
      ...prev,
      { id: newId, ...DEFAULT_LAYER, x: 5, y: 5 }, // slightly offset so it's visible
    ]);
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
      className="flex h-full w-full flex-col bg-[#1E1E1E] text-white md:flex-row overflow-hidden"
      role="application"
    >
      {/* Left Sidebar: Layers */}
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

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Preview Area */}
        <div className="flex-1 relative bg-[#121212] overflow-hidden">
          <PreviewCanvas cssValue={cssValue} />
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-white/10 bg-[#1E1E1E] p-6">
          <ControlPanel
            activeLayer={activeLayer}
            onUpdateLayer={updates => updateLayer(activeId, updates)}
          />

          {/* Code Output */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
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
        </div>
      </div>
    </div>
  );
}
