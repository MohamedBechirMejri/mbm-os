"use client";

import { useCallback } from "react";
import { SceneCanvas } from "./scene-canvas";
import { Sidebar } from "./sidebar";
import { useGltfViewer } from "./use-gltf-viewer";
import type { TransformMode } from "./types";

/**
 * GLTF Viewer App
 *
 * A 3D model viewer for .glTF and .glb files.
 * Features:
 * - Load multiple models via file picker or drag-and-drop
 * - Translate, rotate, and scale models with transform gizmos
 * - Toggle visibility, duplicate, and rename models
 * - Infinite grid and environment lighting
 */
export function GltfViewerApp({ instanceId: _ }: { instanceId: string }) {
  const state = useGltfViewer();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Transform mode shortcuts
      const modeShortcuts: Record<string, TransformMode> = {
        g: "translate",
        r: "rotate",
        s: "scale",
      };

      if (modeShortcuts[key] && state.selectedModelId) {
        e.preventDefault();
        state.setTransformMode(modeShortcuts[key]);
      }

      // Delete selected model
      if (
        (key === "backspace" || key === "delete" || key === "x") &&
        state.selectedModelId
      ) {
        e.preventDefault();
        state.removeModel(state.selectedModelId);
      }

      // Duplicate selected model
      if (key === "d" && (e.metaKey || e.ctrlKey) && state.selectedModelId) {
        e.preventDefault();
        state.duplicateModel(state.selectedModelId);
      }

      // Deselect
      if (key === "escape") {
        state.selectModel(null);
      }
    },
    [state]
  );

  // Handle drop on the whole app
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();

      const files = Array.from(e.dataTransfer.files).filter(
        f => f.name.endsWith(".gltf") || f.name.endsWith(".glb")
      );

      for (const file of files) {
        await state.addModel(file);
      }
    },
    [state]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="flex flex-col w-full h-full bg-[#0d0d0d] text-white overflow-hidden select-none"
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
    >
      {/* Titlebar with controls */}
      <div className="h-[46px] flex items-center justify-between px-4 border-b border-white/10 bg-[#0d0d0d] shrink-0 relative z-10">
        {/* Left side - window buttons go here via floating action bar */}
        <div className="w-20" />

        {/* Center - Transform mode buttons */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(["translate", "rotate", "scale"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => state.setTransformMode(mode)}
              className={`
                px-3 py-1 text-xs font-medium rounded transition-colors
                ${
                  state.transformMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              {mode === "translate"
                ? "Move (G)"
                : mode === "rotate"
                ? "Rotate (R)"
                : "Scale (S)"}
            </button>
          ))}
        </div>

        {/* Right side - info */}
        <div className="w-20 text-right">
          <span className="text-[10px] text-neutral-500 font-mono">
            {state.models.length} model{state.models.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Scene viewer (left) */}
        <SceneCanvas state={state} />

        {/* Model list sidebar (right) */}
        <Sidebar state={state} />
      </div>
    </div>
  );
}
