"use client";

import { Move, Rotate3d, Scaling } from "lucide-react";
import { useCallback } from "react";
import { SceneCanvas } from "./scene-canvas";
import { Sidebar } from "./sidebar";
import { useGltfViewer } from "./use-gltf-viewer";
import type { TransformMode } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      className="flex flex-col w-full h-full text-white overflow-hidden select-none relative"
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
    >
      {/* Titlebar with controls */}
      <div className="flex items-center gap-1 left-8 bottom-8 z-10 absolute bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
        {(["translate", "rotate", "scale"] as const).map(mode => {
          const Icon =
            mode === "translate"
              ? Move
              : mode === "rotate"
              ? Rotate3d
              : Scaling;
          const label =
            mode === "translate"
              ? "Move"
              : mode === "rotate"
              ? "Rotate"
              : "Scale";
          const shortcut =
            mode === "translate" ? "G" : mode === "rotate" ? "R" : "S";

          return (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => state.setTransformMode(mode)}
                  className={`
                      p-2 rounded-lg transition-all
                      ${
                        state.transformMode === mode
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-neutral-400 hover:text-white hover:bg-white/10"
                      }
                    `}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex items-center gap-2">
                <span>{label}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">
                  {shortcut}
                </kbd>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 relative">
        <SceneCanvas state={state} />

        {/* Floating Sidebar */}
        <div className="absolute right-6 top-6 bottom-6 w-80 z-20 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Sidebar state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
