"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Plus, Trash2, Layers, Settings2, Move } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const DEFAULT_LAYER: Omit<ShadowLayer, "id"> = {
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#000000",
  opacity: 0.1,
  inset: false,
};

const PRESETS = [
  {
    name: "Soft Drop",
    layers: [
      {
        x: 0,
        y: 4,
        blur: 6,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
      },
      {
        x: 0,
        y: 2,
        blur: 4,
        spread: -1,
        color: "#000000",
        opacity: 0.06,
        inset: false,
      },
    ],
  },
  {
    name: "Hard Edge",
    layers: [
      {
        x: 4,
        y: 4,
        blur: 0,
        spread: 0,
        color: "#000000",
        opacity: 1,
        inset: false,
      },
    ],
  },
  {
    name: "Glow",
    layers: [
      {
        x: 0,
        y: 0,
        blur: 20,
        spread: 5,
        color: "#3b82f6",
        opacity: 0.5,
        inset: false,
      },
    ],
  },
  {
    name: "Neumorphism",
    layers: [
      {
        x: -5,
        y: -5,
        blur: 10,
        spread: 0,
        color: "#ffffff",
        opacity: 0.1,
        inset: false,
      },
      {
        x: 5,
        y: 5,
        blur: 10,
        spread: 0,
        color: "#000000",
        opacity: 0.3,
        inset: false,
      },
    ],
  },
  {
    name: "Inner Depth",
    layers: [
      {
        x: 2,
        y: 2,
        blur: 5,
        spread: 0,
        color: "#000000",
        opacity: 0.2,
        inset: true,
      },
    ],
  },
];

export function ShadowPlaygroundApp({ instanceId: _ }: { instanceId: string }) {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", ...DEFAULT_LAYER },
  ]);
  const [activeId, setActiveId] = useState<string>("1");
  const [copied, setCopied] = useState(false);

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

  // Generate CSS string
  const cssValue = useMemo(() => {
    return layers
      .map(l => {
        const rgb = hexToRgb(l.color);
        let colorStr = l.color;
        if (rgb) {
          colorStr =
            "rgba(" +
            rgb.r +
            ", " +
            rgb.g +
            ", " +
            rgb.b +
            ", " +
            l.opacity +
            ")";
        }
        return (
          (l.inset ? "inset " : "") +
          l.x +
          "px " +
          l.y +
          "px " +
          l.blur +
          "px " +
          l.spread +
          "px " +
          colorStr
        );
      })
      .join(", ");
  }, [layers]);

  // Generate Tailwind string
  const tailwindValue = useMemo(() => {
    const shadowStr = layers
      .map(l => {
        const rgb = hexToRgb(l.color);
        let colorStr = l.color;
        if (rgb) {
          colorStr =
            "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + l.opacity + ")";
        }
        return (
          (l.inset ? "inset_" : "") +
          l.x +
          "px_" +
          l.y +
          "px_" +
          l.blur +
          "px_" +
          l.spread +
          "px_" +
          colorStr
        );
      })
      .join(",");
    return "shadow-[" + shadowStr + "]";
  }, [layers]);

  // Generate JS Object string
  const jsValue = useMemo(() => {
    return '{\n  boxShadow: "' + cssValue + '"\n}';
  }, [cssValue]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex h-full w-full flex-col bg-[#1E1E1E] text-white md:flex-row overflow-hidden"
      role="application"
    >
      {/* Left Sidebar: Layers */}
      <div className="flex w-full flex-col border-r border-white/10 bg-[#252525] md:w-64">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-medium text-white/90">
            <Layers className="h-4 w-4" />
            <span>Layers</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={addLayer}
            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Presets */}
        <div className="p-4 border-b border-white/10">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => {
                  const newLayers = preset.layers.map(l => ({
                    ...l,
                    id: Math.random().toString(36).substr(2, 9),
                  }));
                  setLayers(newLayers);
                  setActiveId(newLayers[0].id);
                }}
                className="text-xs text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <AnimatePresence initial={false}>
              {layers.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => setActiveId(layer.id)}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all cursor-pointer",
                      activeId === layer.id
                        ? "bg-blue-500/20 text-blue-100"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="truncate font-medium">
                      Layer {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      disabled={layers.length === 1}
                      className={cn(
                        "h-6 w-6 opacity-0 transition-opacity hover:bg-red-500/20 hover:text-red-400",
                        layers.length > 1 && "group-hover:opacity-100"
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Preview Area */}
        <div className="flex-1 relative bg-[#121212] overflow-hidden">
          {/* Dot Pattern Background */}
          <div
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <PreviewCanvas cssValue={cssValue} />
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-white/10 bg-[#1E1E1E] p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Position */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                <Move className="h-3 w-3" /> Position
              </div>
              <ControlGroup
                label="X Offset"
                value={activeLayer.x}
                min={-100}
                max={100}
                onChange={v => updateLayer(activeId, { x: v })}
                unit="px"
              />
              <ControlGroup
                label="Y Offset"
                value={activeLayer.y}
                min={-100}
                max={100}
                onChange={v => updateLayer(activeId, { y: v })}
                unit="px"
              />
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                <Settings2 className="h-3 w-3" /> Appearance
              </div>
              <ControlGroup
                label="Blur"
                value={activeLayer.blur}
                min={0}
                max={100}
                onChange={v => updateLayer(activeId, { blur: v })}
                unit="px"
              />
              <ControlGroup
                label="Spread"
                value={activeLayer.spread}
                min={-50}
                max={50}
                onChange={v => updateLayer(activeId, { spread: v })}
                unit="px"
              />
            </div>

            {/* Color & Style */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                <div className="h-3 w-3 rounded-full bg-current" /> Style
              </div>
              <ControlGroup
                label="Opacity"
                value={activeLayer.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={v => updateLayer(activeId, { opacity: v })}
                unit="%"
                displayValue={Math.round(activeLayer.opacity * 100)}
              />

              <div className="flex items-center justify-between pt-2">
                <Label className="text-sm font-medium text-white/80">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full border border-white/20"
                    style={{ backgroundColor: activeLayer.color }}
                  />
                  <Input
                    type="color"
                    value={activeLayer.color}
                    onChange={e =>
                      updateLayer(activeId, { color: e.target.value })
                    }
                    className="absolute opacity-0 w-8 h-8 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white/60 uppercase">
                    {activeLayer.color}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-sm font-medium text-white/80">
                  Inset
                </Label>
                <Switch
                  checked={activeLayer.inset}
                  onCheckedChange={v => updateLayer(activeId, { inset: v })}
                />
              </div>
            </div>
          </div>

          {/* Code Output */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
            {/* CSS */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                CSS
              </Label>
              <div className="group relative rounded-md border border-white/5 bg-black/20 p-3 font-mono text-xs text-white/60 transition-colors hover:bg-black/30">
                <div className="truncate pr-8">box-shadow: {cssValue};</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() =>
                    copyToClipboard("box-shadow: " + cssValue + ";")
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Tailwind */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Tailwind
              </Label>
              <div className="group relative rounded-md border border-white/5 bg-black/20 p-3 font-mono text-xs text-white/60 transition-colors hover:bg-black/30">
                <div className="truncate pr-8">{tailwindValue}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => copyToClipboard(tailwindValue)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* JS */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                React / JS
              </Label>
              <div className="group relative rounded-md border border-white/5 bg-black/20 p-3 font-mono text-xs text-white/60 transition-colors hover:bg-black/30">
                <div className="truncate pr-8">{jsValue}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => copyToClipboard(jsValue)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import ElasticSlider from "@/components/ui/elastic-slider";

// ... (existing imports)

// ... (ShadowPlaygroundApp component code)

function PreviewCanvas({ cssValue }: { cssValue: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newScale = scale.get() - e.deltaY * 0.01;
        scale.set(Math.min(Math.max(0.1, newScale), 5));
      } else {
        x.set(x.get() - e.deltaX);
        y.set(y.get() - e.deltaY);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [x, y, scale]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <motion.div
        drag
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
        style={{ x, y, scale }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-48 w-48 rounded-2xl bg-white will-change-[box-shadow]"
          style={{ boxShadow: cssValue }}
        />
      </motion.div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md"
          onClick={() => {
            x.set(0);
            y.set(0);
            scale.set(1);
          }}
        >
          Reset View
        </Button>
      </div>
    </div>
  );
}

function ControlGroup({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit: string;
  displayValue?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-mono text-white/40">
          {displayValue ?? value}
          {unit}
        </span>
      </div>
      <div className="px-2">
        <ElasticSlider
          defaultValue={value}
          startingValue={min}
          maxValue={max}
          stepSize={step}
          isStepped={true}
          onChange={onChange}
          className="w-full"
          leftIcon={null}
          rightIcon={null}
        />
      </div>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
