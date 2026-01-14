"use client";

import { Plus, Eye, EyeOff, Trash2, Copy, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import type { GltfViewerState, SceneModel } from "./types";

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

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(model.name);
  };

  const handleSave = () => {
    if (editValue.trim()) {
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
    <div
      className={`
        group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-600/30 border-l-2 border-blue-500"
            : "hover:bg-white/5 border-l-2 border-transparent"
        }
        ${!model.visible ? "opacity-50" : ""}
      `}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      {/* Expand icon placeholder for hierarchy */}
      <ChevronRight className="w-3 h-3 text-neutral-500 shrink-0" />

      {/* Model icon */}
      <div className="w-6 h-6 rounded bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        3D
      </div>

      {/* Name */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-black/30 border border-blue-500 rounded px-1.5 py-0.5 text-sm text-white outline-none"
          onClick={e => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <span className="flex-1 min-w-0 text-sm text-neutral-200 truncate">
          {model.name}
        </span>
      )}

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title={model.visible ? "Hide" : "Show"}
        >
          {model.visible ? (
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5 text-neutral-400" />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-500/30 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  state: GltfViewerState;
}

export function Sidebar({ state }: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
    <div
      className={`
        w-64 bg-[#0d0d0d] border-l border-white/10 flex flex-col
        transition-colors
        ${isDragOver ? "bg-blue-900/20" : ""}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Models
        </span>
        <button
          onClick={handleFileSelect}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Model list */}
      <div className="flex-1 overflow-y-auto">
        {state.models.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-xs">
            <div className="mb-2">No models loaded</div>
            <div className="text-[10px]">
              Click Add or drop .glTF/.glb files
            </div>
          </div>
        ) : (
          <div className="py-1">
            {state.models.map(model => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={state.selectedModelId === model.id}
                onSelect={() => state.selectModel(model.id)}
                onDelete={() => state.removeModel(model.id)}
                onToggleVisibility={() => state.toggleModelVisibility(model.id)}
                onDuplicate={() => state.duplicateModel(model.id)}
                onRename={name => state.renameModel(model.id, name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-500/10 flex items-center justify-center pointer-events-none rounded">
          <div className="text-blue-400 text-sm font-medium">
            Drop to add models
          </div>
        </div>
      )}
    </div>
  );
}
