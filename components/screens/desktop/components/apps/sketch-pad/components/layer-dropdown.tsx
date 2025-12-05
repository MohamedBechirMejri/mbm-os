import { Eye, EyeOff, Plus, Trash2, Layers, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Layer } from "../types";
import { MAX_LAYERS } from "../constants";

interface LayerDropdownProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

// Compact layer dropdown - Excalidraw style
export function LayerDropdown({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onToggleVisibility,
}: LayerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const canAddLayer = layers.length < MAX_LAYERS;
  const canRemoveLayer = layers.length > 1;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#232329]/90 backdrop-blur-md rounded-lg border border-white/10 px-3 py-1.5 shadow-xl hover:bg-white/5 transition-colors"
      >
        <Layers className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/90 max-w-[100px] truncate">
          {activeLayer?.name ?? "Layer 1"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-white/50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 z-50 bg-[#232329]/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl min-w-[180px] overflow-hidden">
            {/* Layer list */}
            <div className="max-h-[200px] overflow-y-auto py-1">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5",
                    activeLayerId === layer.id && "bg-white/10"
                  )}
                  onClick={() => {
                    onSelectLayer(layer.id);
                    setIsOpen(false);
                  }}
                >
                  {/* Visibility toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-white/70" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </button>

                  <span className="flex-1 text-sm text-white/80 truncate">
                    {layer.name}
                  </span>

                  {/* Delete button */}
                  {canRemoveLayer && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveLayer(layer.id);
                      }}
                      className="p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/50 hover:text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add layer button */}
            <div className="border-t border-white/10 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onAddLayer();
                  setIsOpen(false);
                }}
                disabled={!canAddLayer}
                className="w-full justify-start gap-2 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Layer
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
