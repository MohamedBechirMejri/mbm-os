import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { Layer } from "../types";
import { MAX_LAYERS } from "../constants";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function LayerPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onToggleVisibility,
}: LayerPanelProps) {
  const canAddLayer = layers.length < MAX_LAYERS;
  const canRemoveLayer = layers.length > 1;

  return (
    <div className="flex flex-col h-full">
      {/* Layer list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {layers.map((layer, index) => (
            <motion.button
              key={layer.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onSelectLayer(layer.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left",
                activeLayerId === layer.id
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/5 text-white/70"
              )}
            >
              {/* Visibility toggle */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {layer.visible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>

              {/* Layer name */}
              <span className="flex-1 text-sm truncate">{layer.name}</span>

              {/* Layer index */}
              <span className="text-xs text-white/40">{index + 1}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-2 border-t border-white/10 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddLayer}
              disabled={!canAddLayer}
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Layer</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveLayer(activeLayerId)}
              disabled={!canRemoveLayer}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Layer</TooltipContent>
        </Tooltip>

        <span className="flex-1" />

        <span className="text-xs text-white/40 self-center">
          {layers.length}/{MAX_LAYERS}
        </span>
      </div>
    </div>
  );
}
