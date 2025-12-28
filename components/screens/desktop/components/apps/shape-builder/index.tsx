"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useCallback } from "react";
import { Canvas } from "./canvas";
import { CodePanel } from "./code-panel";
import { PreviewPanel } from "./preview-panel";
import { Toolbar } from "./toolbar";
import { useShapeBuilder } from "./use-shape-builder";
import type { ToolType } from "./types";

/**
 * Shape Builder App
 *
 * A visual GUI for the new CSS shape() property.
 * Create custom shapes interactively and copy the generated CSS.
 */
export function ShapeBuilderApp({ instanceId: _ }: { instanceId: string }) {
  const state = useShapeBuilder();

  // Keyboard shortcuts handler
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
      const isMeta = e.metaKey || e.ctrlKey;

      // Undo/Redo
      if (isMeta && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          state.redo();
        } else {
          state.undo();
        }
        return;
      }

      // Tool shortcuts
      const toolShortcuts: Record<string, ToolType> = {
        v: "select",
        l: "line",
        h: "hline",
        c: "curve",
        s: "smooth",
        a: "arc",
        z: "close",
      };

      if (!isMeta && toolShortcuts[key]) {
        e.preventDefault();
        state.setActiveTool(toolShortcuts[key]);
      }

      // Delete selected command
      if (
        (key === "backspace" || key === "delete") &&
        state.selectedCommandId
      ) {
        e.preventDefault();
        state.deleteCommand(state.selectedCommandId);
      }
    },
    [state]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex flex-col w-full h-full bg-[#0d0d0d] text-white overflow-hidden select-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex flex-1 min-h-0">
          {/* Left toolbar */}
          <Toolbar state={state} />

          {/* Main canvas area */}
          <div className="flex flex-col flex-1 min-w-0">
            <Canvas state={state} />
            <CodePanel state={state} />
          </div>

          {/* Right preview panel */}
          <PreviewPanel state={state} />
        </div>
      </div>
    </TooltipProvider>
  );
}
