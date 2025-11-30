import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShadowLayer } from "../types";
import { PRESETS } from "../constants";

interface LayerListProps {
  layers: ShadowLayer[];
  activeId: string;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onApplyPreset: (presetLayers: ShadowLayer[]) => void;
}

export function LayerList({
  layers,
  activeId,
  onAddLayer,
  onRemoveLayer,
  onSelectLayer,
  onApplyPreset,
}: LayerListProps) {
  return (
    <div className="flex w-full flex-col border-r border-white/10 bg-[#252525] md:w-64 h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
          <Layers className="h-4 w-4" />
          <span>Layers</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddLayer}
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
                onApplyPreset(newLayers as ShadowLayer[]);
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
                  onClick={() => onSelectLayer(layer.id)}
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
                      onRemoveLayer(layer.id);
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
  );
}
