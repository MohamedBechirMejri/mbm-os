"use client";

import { useState, useCallback, useRef } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Tool, Layer, BrushSettings } from "./types";
import { DEFAULT_BRUSH, createDefaultLayer } from "./constants";
import { generateLayerId, exportToPng, clearCanvas } from "./utils";
import { useHistory } from "./hooks/use-history";
import { useViewport } from "./hooks/use-viewport";
import { CanvasLayer } from "./components/canvas-layer";
import { Toolbar } from "./components/toolbar";
import { ZoomControls } from "./components/zoom-controls";
import { LayerDropdown } from "./components/layer-dropdown";
import { ActionBar } from "./components/action-bar";

// Large canvas for "infinite" feel
const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;

export function SketchPadApp({ instanceId: _ }: { instanceId: string }) {
  // Layer state
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: generateLayerId(), ...createDefaultLayer(1) },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>(layers[0].id);

  // Tool state
  const [tool, setTool] = useState<Tool>("brush");
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [bgColor, setBgColor] = useState("#1a1a1a");

  // Track if space is held for temporary pan mode
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const previousToolRef = useRef<Tool>("brush");

  // Canvas refs
  const canvasRefs = useRef(new Map<string, HTMLCanvasElement>());
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport for pan/zoom
  const {
    viewport,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isPanning,
    zoomIn,
    zoomOut,
    resetView,
  } = useViewport();

  // History for undo/redo
  const { canUndo, canRedo, pushHistory, undo, redo } = useHistory();

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

      if (activeLayerId === id) {
        const remaining = layers.filter(l => l.id !== id);
        setActiveLayerId(remaining[0].id);
      }

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

  const handleStrokeEnd = useCallback(() => {}, []);

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
      // Space for temporary pan mode
      if (e.code === "Space" && !isSpaceHeld) {
        e.preventDefault();
        setIsSpaceHeld(true);
        previousToolRef.current = tool;
        setTool("pan");
        return;
      }

      // Tool switching
      if (e.key === "b" || e.key === "B") {
        setTool("brush");
        return;
      }
      if (e.key === "e" || e.key === "E") {
        setTool("eraser");
        return;
      }
      if (e.key === "h" || e.key === "H") {
        setTool("pan");
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

      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        zoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        resetView();
      }
    },
    [tool, isSpaceHeld, handleUndo, handleRedo, zoomIn, zoomOut, resetView]
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === "Space" && isSpaceHeld) {
        setIsSpaceHeld(false);
        setTool(previousToolRef.current);
      }
    },
    [isSpaceHeld]
  );

  // Pointer handlers for canvas area (panning when in pan mode)
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (tool === "pan" || e.button === 1) {
        handlePanStart(e);
      }
    },
    [tool, handlePanStart]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        handlePanMove(e);
      }
    },
    [isPanning, handlePanMove]
  );

  // Current tool for cursor
  const activeTool = isSpaceHeld ? "pan" : tool;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden text-white outline-none"
        style={{ backgroundColor: bgColor }}
        role="application"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {/* Checkerboard pattern to indicate transparency */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #333 25%, transparent 25%),
              linear-gradient(-45deg, #333 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #333 75%),
              linear-gradient(-45deg, transparent 75%, #333 75%)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        />

        {/* Canvas container with pan/zoom */}
        <div
          className="absolute inset-0"
          style={{
            cursor:
              activeTool === "pan"
                ? isPanning
                  ? "grabbing"
                  : "grab"
                : "crosshair",
          }}
          onWheel={handleWheel}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handlePanEnd}
          onPointerLeave={handlePanEnd}
        >
          {/* Transformed canvas layers */}
          <div
            className="absolute"
            style={{
              transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.zoom})`,
              transformOrigin: "0 0",
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
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
                tool={activeTool}
                brush={brush}
                viewport={viewport}
                onStrokeStart={handleStrokeStart}
                onStrokeEnd={handleStrokeEnd}
              />
            ))}
          </div>
        </div>

        {/* Top toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <Toolbar
            tool={activeTool}
            brush={brush}
            canUndo={canUndo}
            canRedo={canRedo}
            onToolChange={setTool}
            onBrushChange={updateBrush}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>

        {/* Top-left: Layers dropdown */}
        <div className="absolute top-4 left-4 z-10">
          <LayerDropdown
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={setActiveLayerId}
            onAddLayer={addLayer}
            onRemoveLayer={removeLayer}
            onToggleVisibility={toggleLayerVisibility}
          />
        </div>

        {/* Bottom-left: Actions */}
        <div className="absolute bottom-4 left-4 z-10">
          <ActionBar
            bgColor={bgColor}
            onBgColorChange={setBgColor}
            onClear={handleClear}
            onExport={handleExport}
          />
        </div>

        {/* Bottom-right: Zoom controls */}
        <div className="absolute bottom-4 right-4 z-10">
          <ZoomControls
            zoom={viewport.zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetView}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
