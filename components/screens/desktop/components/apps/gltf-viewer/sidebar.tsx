"use client";

import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronRight,
  Box,
  Settings2,
  Maximize2,
  RotateCw,
  Move as MoveIcon,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import type { GltfViewerState, SceneModel } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/3 border-b border-white/5">
      <div className="flex items-center gap-2.5">
        <span className="text-neutral-500/80">{icon}</span>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Property Field
// ---------------------------------------------------------------------------

interface PropertyFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function PropertyField({ label, value, onChange }: PropertyFieldProps) {
  // Use a string state to allow intermediate states like "0." or "-"
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Sync internal state with external value when it changes (e.g. from gizmo)
  // We use a small epsilon to avoid jitter if needed
  const syncValue = useCallback(() => {
    setDisplayValue(prev => {
      const parsedPrev = parseFloat(prev);
      if (Math.abs(parsedPrev - value) > 0.001 || isNaN(parsedPrev)) {
        return value.toFixed(2);
      }
      return prev;
    });
  }, [value]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only sync when value changes
  useEffect(() => {
    syncValue();
  }, [value, syncValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setDisplayValue(nextValue);

    const parsed = parseFloat(nextValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-neutral-900/50 rounded px-2 py-1 border border-white/5 focus-within:border-blue-500/50 transition-colors group">
      <span className="text-[9px] font-mono text-neutral-600 group-focus-within:text-blue-500 transition-colors w-2 shrink-0">
        {label}
      </span>
      <input
        type="text" // Using text to have full control over the string
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={() => setDisplayValue(value.toFixed(2))}
        className="bg-transparent text-[11px] text-white outline-none w-full font-mono"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Model List Item
// ---------------------------------------------------------------------------

interface ModelItemProps {
  model: SceneModel;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
}

function ModelItem({
  model,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onRename,
}: ModelItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(model.name);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(model.name);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== model.name) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(model.name);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-all border-l-2",
        isSelected
          ? "bg-blue-600/15 border-blue-500 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]"
          : "hover:bg-white/5 border-transparent",
        !model.visible && "opacity-40"
      )}
      onClick={onSelect}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors",
          isSelected
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
            : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700"
        )}
      >
        <Box size={14} />
      </div>

      {/* Name */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-black/40 border border-blue-500/50 rounded px-1.5 py-0.5 text-xs text-white outline-none"
          onClick={e => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <span
          className={cn(
            "flex-1 min-w-0 text-xs truncate transition-colors",
            isSelected
              ? "text-white font-medium"
              : "text-neutral-400 group-hover:text-neutral-200"
          )}
          onDoubleClick={handleDoubleClick}
        >
          {model.name}
        </span>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 hover:bg-white/10 rounded-md transition-colors text-neutral-500 hover:text-white"
        >
          {model.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-500/20 rounded-md transition-colors text-neutral-500 hover:text-red-400"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Properties Inspector
// ---------------------------------------------------------------------------

function Inspector({ state }: { state: GltfViewerState }) {
  const selectedModel = state.models.find(m => m.id === state.selectedModelId);

  if (!selectedModel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-600">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Settings2 size={24} className="opacity-20" />
        </div>
        <p className="text-xs font-medium">No selection</p>
        <p className="text-[10px] mt-1 opacity-70">
          Select a model to view and edit its properties
        </p>
      </div>
    );
  }

  const updateTransform = (
    type: "position" | "rotation" | "scale",
    axis: number,
    value: number
  ) => {
    const current = [...selectedModel[type]] as [number, number, number];
    current[axis] = value;
    state.updateModelTransform(selectedModel.id, { [type]: current });
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SectionHeader title="Inspector" icon={<Settings2 size={12} />} />

      <div className="p-4 space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">
            General
          </span>
          <Input
            value={selectedModel.name}
            onChange={e => state.renameModel(selectedModel.id, e.target.value)}
            className="h-8 text-xs bg-neutral-900/50 border-white/5 focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <MoveIcon size={12} className="text-blue-500/70" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Position
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <PropertyField
              label="X"
              value={selectedModel.position[0]}
              onChange={v => updateTransform("position", 0, v)}
            />
            <PropertyField
              label="Y"
              value={selectedModel.position[1]}
              onChange={v => updateTransform("position", 1, v)}
            />
            <PropertyField
              label="Z"
              value={selectedModel.position[2]}
              onChange={v => updateTransform("position", 2, v)}
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <RotateCw size={12} className="text-purple-500/70" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Rotation
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <PropertyField
              label="X"
              value={selectedModel.rotation[0]}
              onChange={v => updateTransform("rotation", 0, v)}
            />
            <PropertyField
              label="Y"
              value={selectedModel.rotation[1]}
              onChange={v => updateTransform("rotation", 1, v)}
            />
            <PropertyField
              label="Z"
              value={selectedModel.rotation[2]}
              onChange={v => updateTransform("rotation", 2, v)}
            />
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Maximize2 size={12} className="text-orange-500/70" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Scale
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <PropertyField
              label="X"
              value={selectedModel.scale[0]}
              onChange={v => updateTransform("scale", 0, v)}
            />
            <PropertyField
              label="Y"
              value={selectedModel.scale[1]}
              onChange={v => updateTransform("scale", 1, v)}
            />
            <PropertyField
              label="Z"
              value={selectedModel.scale[2]}
              onChange={v => updateTransform("scale", 2, v)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => state.duplicateModel(selectedModel.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-medium transition-colors"
          >
            <Copy size={12} />
            Duplicate
          </button>
          <button
            onClick={() => state.removeModel(selectedModel.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-lg text-[10px] font-medium text-red-400 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  state: GltfViewerState;
}

export function Sidebar({ state }: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [outlinerOpen, setOutlinerOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const handleFileSelect = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".gltf,.glb";
    input.multiple = true;

    input.onchange = async () => {
      const files = input.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        await state.addModel(file);
      }
    };

    input.click();
  }, [state]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

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
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <motion.div
      layout
      className={cn(
        "w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col relative overflow-hidden transition-all shadow-2xl",
        isDragOver && "bg-blue-600/10 border-blue-500/50",
        isSidebarMinimized ? "h-14" : "h-full"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      animate={{ height: isSidebarMinimized ? 56 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Root Header / Collapse Button */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors shrink-0"
        onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">
            Scene Hierarchy
          </span>
        </div>
        <motion.div
          animate={{ rotate: isSidebarMinimized ? 180 : 0 }}
          className="text-neutral-500"
        >
          <ChevronRight size={16} className="rotate-90" />
        </motion.div>
      </div>

      <AnimatePresence>
        {!isSidebarMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col min-h-0"
          >
            <Separator className="bg-white/5" />

            {/* Outliner Section */}
            <div
              className={cn(
                "flex flex-col min-h-0 transition-[flex]",
                outlinerOpen ? "flex-1" : "flex-none"
              )}
            >
              <div
                className="flex items-center justify-between px-4 py-3 bg-white/3 border-b border-white/5 cursor-pointer group"
                onClick={() => setOutlinerOpen(!outlinerOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <motion.span
                    animate={{ rotate: outlinerOpen ? 90 : 0 }}
                    className="text-neutral-500/80"
                  >
                    <ChevronRight size={12} />
                  </motion.span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] group-hover:text-neutral-200 transition-colors">
                    Outliner
                  </span>
                </div>
                {outlinerOpen && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleFileSelect();
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-neutral-400 hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: outlinerOpen ? "auto" : 0,
                  opacity: outlinerOpen ? 1 : 0,
                }}
                className="overflow-hidden flex-1"
              >
                <ScrollArea className="h-full max-h-[300px]">
                  <div className="py-1">
                    <AnimatePresence mode="popLayout">
                      {state.models.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-[10px] text-neutral-600 font-medium">
                            No models loaded
                          </p>
                          <p className="text-[9px] text-neutral-700 mt-1">
                            Drop files here
                          </p>
                        </div>
                      ) : (
                        state.models.map(model => (
                          <ModelItem
                            key={model.id}
                            model={model}
                            isSelected={state.selectedModelId === model.id}
                            onSelect={() => state.selectModel(model.id)}
                            onDelete={() => state.removeModel(model.id)}
                            onToggleVisibility={() =>
                              state.toggleModelVisibility(model.id)
                            }
                            onDuplicate={() => state.duplicateModel(model.id)}
                            onRename={name => state.renameModel(model.id, name)}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </motion.div>
            </div>

            <Separator className="bg-white/5" />

            {/* Properties Section */}
            <div
              className={cn(
                "flex flex-col min-h-0 transition-[flex]",
                inspectorOpen ? "flex-1" : "flex-none"
              )}
            >
              <div
                className="flex items-center justify-between px-4 py-3 bg-white/3 border-b border-white/5 cursor-pointer group"
                onClick={() => setInspectorOpen(!inspectorOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <motion.span
                    animate={{ rotate: inspectorOpen ? 90 : 0 }}
                    className="text-neutral-500/80"
                  >
                    <ChevronRight size={12} />
                  </motion.span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] group-hover:text-neutral-200 transition-colors">
                    Inspector
                  </span>
                </div>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: inspectorOpen ? "auto" : 0,
                  opacity: inspectorOpen ? 1 : 0,
                }}
                className="overflow-hidden flex-1"
              >
                <ScrollArea className="h-full">
                  <Inspector state={state} />
                </ScrollArea>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-600/10 border-2 border-dashed border-blue-500/50 flex flex-col items-center justify-center gap-2 z-50 pointer-events-none rounded-[inherit]"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Plus className="text-blue-500" />
            </div>
            <p className="text-sm font-medium text-blue-400">
              Drop models here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
