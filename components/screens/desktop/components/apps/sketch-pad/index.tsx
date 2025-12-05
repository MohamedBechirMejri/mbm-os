"use client";

import { useState, useCallback, useRef } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Tool, Layer, BrushSettings } from "./types";
import { DEFAULT_BRUSH, createDefaultLayer } from "./constants";
import { generateLayerId, exportToPng, clearCanvas } from "./utils";
import { useHistory } from "./hooks/use-history";
import { FloatingPanel } from "./components/floating-panel";
import { CanvasLayer } from "./components/canvas-layer";
import { LayerPanel } from "./components/layer-panel";
import { Toolbar } from "./components/toolbar";

// Canvas dimensions
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export function SketchPadApp({ instanceId: _ }: { instanceId: string }) {
  // Layer state
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: generateLayerId(), ...createDefaultLayer(1) },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>(layers[0].id);

  // Tool state
  const [tool, setTool] = useState<Tool>("brush");
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);

  // Canvas refs - stores reference to each layer's canvas element
  const canvasRefs = useRef(new Map<string, HTMLCanvasElement>());

  // History for undo/redo
  const { canUndo, canRedo, pushHistory, undo, redo, clearHistory } =
    useHistory();

  // Get active layer
  const activeLayer = layers.find(l => l.id === activeLayerId) ?? layers[0];

  // Store canvas ref when layer mounts
  const setCanvasRef = useCallback(
    (layerId: string) => (element: HTMLCanvasElement | null) => {
      if (element) {
        canvasRefs.current.set(layerId, element);
      } else {
        canvasRefs.current.delete(layerId);
      }
    },
    []
  );

  // Layer management
  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: generateLayerId(),
      ...createDefaultLayer(layers.length + 1),
    };
    setLayers(prev => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
  }, [layers.length]);

  const removeLayer = useCallback(
    (id: string) => {
      if (layers.length <= 1) return;

      setLayers(prev => prev.filter(l => l.id !== id));

      // If removing active layer, switch to another
      if (activeLayerId === id) {
        const remaining = layers.filter(l => l.id !== id);
        setActiveLayerId(remaining[0].id);
      }

      // Remove canvas ref
      canvasRefs.current.delete(id);
    },
    [layers, activeLayerId]
  );

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  // Brush settings update
  const updateBrush = useCallback((updates: Partial<BrushSettings>) => {
    setBrush(prev => ({ ...prev, ...updates }));
  }, []);

  // Stroke callbacks for history
  const handleStrokeStart = useCallback(() => {
    const canvas = canvasRefs.current.get(activeLayerId);
    if (canvas) {
      pushHistory(activeLayerId, canvas);
    }
  }, [activeLayerId, pushHistory]);

  const handleStrokeEnd = useCallback(() => {
    // Could add additional logic here if needed
  }, []);

  // History actions
  const handleUndo = useCallback(() => {
    undo(canvasRefs.current);
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo(canvasRefs.current);
  }, [redo]);

  // Clear current layer
  const handleClear = useCallback(() => {
    const canvas = canvasRefs.current.get(activeLayerId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save before clearing for undo
    pushHistory(activeLayerId, canvas);
    clearCanvas(ctx);
  }, [activeLayerId, pushHistory]);

  // Export all layers as PNG
  const handleExport = useCallback(() => {
    exportToPng(canvasRefs.current, layers, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [layers]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Tool switching
      if (e.key === "b" || e.key === "B") {
        setTool("brush");
        return;
      }
      if (e.key === "e" || e.key === "E") {
        setTool("eraser");
        return;
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    },
    [handleUndo, handleRedo]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="relative h-full w-full overflow-hidden bg-[#1E1E1E] text-white"
        role="application"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Checkerboard background for transparent preview */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
              linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
              linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        />

        {/* Canvas layers container - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative bg-white/5 rounded-lg overflow-hidden shadow-2xl"
            style={{
              width: "80%",
              maxWidth: CANVAS_WIDTH,
              aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            }}
          >
            {/* Render layers bottom-to-top */}
            {[...layers].reverse().map(layer => (
              <CanvasLayer
                key={layer.id}
                ref={setCanvasRef(layer.id)}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                isActive={layer.id === activeLayerId}
                isVisible={layer.visible}
                opacity={layer.opacity}
                tool={tool}
                brush={brush}
                onStrokeStart={handleStrokeStart}
                onStrokeEnd={handleStrokeEnd}
              />
            ))}
          </div>
        </div>

        {/* UI Overlay Grid */}
        <div className="absolute inset-0 grid grid-cols-[280px_1fr_320px] p-6 gap-6 pointer-events-none">
          {/* Left Column: Layers */}
          <div className="pointer-events-auto flex flex-col min-h-0">
            <FloatingPanel
              title="Layers"
              className="flex-1 min-h-0"
              contentClassName="p-0"
            >
              <LayerPanel
                layers={layers}
                activeLayerId={activeLayerId}
                onSelectLayer={setActiveLayerId}
                onAddLayer={addLayer}
                onRemoveLayer={removeLayer}
                onToggleVisibility={toggleLayerVisibility}
              />
            </FloatingPanel>
          </div>

          {/* Center Column: Empty for canvas interaction */}
          <div />

          {/* Right Column: Controls */}
          <div className="pointer-events-auto flex flex-col min-h-0">
            <FloatingPanel
              title="Toolbar"
              className="h-full"
              contentClassName="p-0"
            >
              <Toolbar
                tool={tool}
                brush={brush}
                canUndo={canUndo}
                canRedo={canRedo}
                onToolChange={setTool}
                onBrushChange={updateBrush}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClear}
                onExport={handleExport}
              />
            </FloatingPanel>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
