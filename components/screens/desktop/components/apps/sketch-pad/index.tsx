"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionBar } from "./components/action-bar";
import { CanvasLayer } from "./components/canvas-layer";
import { LayerDropdown } from "./components/layer-dropdown";
import { Toolbar } from "./components/toolbar";
import { ZoomControls } from "./components/zoom-controls";
import { createDefaultLayer, DEFAULT_BRUSH } from "./constants";
import { useStrokes } from "./hooks/use-strokes";
import { useViewport } from "./hooks/use-viewport";
import type { BrushSettings, Layer, Point, Tool } from "./types";
import {
  drawStroke,
  exportToPng,
  generateLayerId,
  redrawLayerStrokes,
} from "./utils";

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

  // Track the "base" tool for pen button toggle (excludes pan)
  const baseToolRef = useRef<"brush" | "eraser">("brush");

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

  // Stroke-based drawing and history
  const {
    strokes,
    currentStroke,
    startStroke,
    addPointToStroke,
    endStroke,
    deleteStrokesAtPoint,
    commitEraseBatch,
    clearLayerStrokes,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useStrokes();

  // Store canvas ref when layer mounts
  const setCanvasRef = useCallback(
    (layerId: string) => (element: HTMLCanvasElement | null) => {
      if (element) {
        canvasRefs.current.set(layerId, element);
      } else {
        canvasRefs.current.delete(layerId);
      }
    },
    [],
  );

  // Redraw all layers when strokes change
  useEffect(() => {
    for (const layer of layers) {
      const canvas = canvasRefs.current.get(layer.id);
      if (!canvas) continue;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      redrawLayerStrokes(ctx, strokes, layer.id, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [strokes, layers]);

  // Draw current stroke in real-time
  useEffect(() => {
    if (!currentStroke) return;

    const canvas = canvasRefs.current.get(currentStroke.layerId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw all strokes plus the current one
    redrawLayerStrokes(
      ctx,
      strokes,
      currentStroke.layerId,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
    drawStroke(ctx, currentStroke);
  }, [currentStroke, strokes]);

  // Layer management
  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: generateLayerId(),
      ...createDefaultLayer(layers.length + 1),
    };
    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
  }, [layers.length]);

  const removeLayer = useCallback(
    (id: string) => {
      if (layers.length <= 1) return;

      setLayers((prev) => prev.filter((l) => l.id !== id));

      if (activeLayerId === id) {
        const remaining = layers.filter((l) => l.id !== id);
        setActiveLayerId(remaining[0].id);
      }

      canvasRefs.current.delete(id);
      // Also clear strokes for removed layer
      clearLayerStrokes(id);
    },
    [layers, activeLayerId, clearLayerStrokes],
  );

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  }, []);

  // Brush settings update
  const updateBrush = useCallback((updates: Partial<BrushSettings>) => {
    setBrush((prev) => ({ ...prev, ...updates }));
  }, []);

  // Stroke handlers
  const handleStrokeStart = useCallback(
    (layerId: string, point: Point, size: number, color: string) => {
      startStroke(layerId, point, size, color);
    },
    [startStroke],
  );

  const handleStrokePoint = useCallback(
    (point: Point) => {
      addPointToStroke(point);
    },
    [addPointToStroke],
  );

  const handleStrokeEnd = useCallback(() => {
    endStroke();
  }, [endStroke]);

  // Erase handlers
  const handleErasePoint = useCallback(
    (point: Point, layerId: string) => {
      deleteStrokesAtPoint(point, layerId);
    },
    [deleteStrokesAtPoint],
  );

  const handleEraseEnd = useCallback(() => {
    commitEraseBatch();
  }, [commitEraseBatch]);

  // History actions
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // Clear current layer
  const handleClear = useCallback(() => {
    clearLayerStrokes(activeLayerId);
  }, [activeLayerId, clearLayerStrokes]);

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
    [tool, isSpaceHeld, handleUndo, handleRedo, zoomIn, zoomOut, resetView],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === "Space" && isSpaceHeld) {
        setIsSpaceHeld(false);
        setTool(previousToolRef.current);
      }
    },
    [isSpaceHeld],
  );

  // Handle pen tablet top barrel button (fires as right-click/context menu)
  // Toggle between brush and eraser
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Toggle between brush and eraser
    const newTool = baseToolRef.current === "brush" ? "eraser" : "brush";
    baseToolRef.current = newTool;
    setTool(newTool);
  }, []);

  // Handle pen tablet bottom barrel button (fires as aux click, usually button 1)
  // Trigger undo
  const handleAuxClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Middle click or other aux button = undo
      handleUndo();
    },
    [handleUndo],
  );

  // Pointer handlers for canvas area (panning when in pan mode)
  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Middle mouse button for pan
      if (tool === "pan" || e.button === 1) {
        handlePanStart(e);
      }
    },
    [tool, handlePanStart],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        handlePanMove(e);
      }
    },
    [isPanning, handlePanMove],
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
        // biome-ignore lint/a11y/noNoninteractiveTabindex: dd
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {/* Canvas container with pan/zoom */}
        {/** biome-ignore lint/a11y/noStaticElementInteractions: ddd */}
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
          onContextMenu={handleContextMenu}
          onAuxClick={handleAuxClick}
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
            {[...layers].reverse().map((layer) => (
              <CanvasLayer
                key={layer.id}
                ref={setCanvasRef(layer.id)}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                layerId={layer.id}
                isActive={layer.id === activeLayerId}
                isVisible={layer.visible}
                opacity={layer.opacity}
                tool={activeTool}
                brush={brush}
                viewport={viewport}
                onStrokeStart={handleStrokeStart}
                onStrokePoint={handleStrokePoint}
                onStrokeEnd={handleStrokeEnd}
                onErasePoint={handleErasePoint}
                onEraseEnd={handleEraseEnd}
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
