"use client";

import { useCallback, useState } from "react";
import type { GltfViewerState, SceneModel, TransformMode } from "./types";

/**
 * Generates a unique ID for models
 */
function generateId(): string {
  return `model-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extracts a clean name from a file
 */
function extractName(file: File): string {
  const name = file.name.replace(/\.(gltf|glb)$/i, "");
  // Convert snake_case or kebab-case to Title Case
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Custom hook for managing GLTF viewer state
 */
export function useGltfViewer(): GltfViewerState {
  const [models, setModels] = useState<SceneModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");

  const addModel = useCallback(async (file: File): Promise<void> => {
    // Create a blob URL for the file
    const url = URL.createObjectURL(file);
    const id = generateId();
    const name = extractName(file);

    const newModel: SceneModel = {
      id,
      name,
      url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
    };

    setModels(prev => [...prev, newModel]);
    setSelectedModelId(id);
  }, []);

  const removeModel = useCallback((id: string) => {
    setModels(prev => {
      const model = prev.find(m => m.id === id);
      if (model) {
        // Revoke blob URL to free memory
        URL.revokeObjectURL(model.url);
      }
      return prev.filter(m => m.id !== id);
    });
    setSelectedModelId(prev => (prev === id ? null : prev));
  }, []);

  const selectModel = useCallback((id: string | null) => {
    setSelectedModelId(id);
  }, []);

  const updateModelTransform = useCallback(
    (
      id: string,
      transform: Partial<Pick<SceneModel, "position" | "rotation" | "scale">>
    ) => {
      setModels(prev =>
        prev.map(model =>
          model.id === id ? { ...model, ...transform } : model
        )
      );
    },
    []
  );

  const toggleModelVisibility = useCallback((id: string) => {
    setModels(prev =>
      prev.map(model =>
        model.id === id ? { ...model, visible: !model.visible } : model
      )
    );
  }, []);

  const duplicateModel = useCallback((id: string) => {
    setModels(prev => {
      const original = prev.find(m => m.id === id);
      if (!original) return prev;

      const newId = generateId();
      const duplicate: SceneModel = {
        ...original,
        id: newId,
        name: `${original.name} (Copy)`,
        // Offset position slightly so it's visible
        position: [
          original.position[0] + 1,
          original.position[1],
          original.position[2],
        ],
      };

      return [...prev, duplicate];
    });
  }, []);

  const renameModel = useCallback((id: string, name: string) => {
    setModels(prev =>
      prev.map(model => (model.id === id ? { ...model, name } : model))
    );
  }, []);

  return {
    models,
    selectedModelId,
    transformMode,
    addModel,
    removeModel,
    selectModel,
    setTransformMode,
    updateModelTransform,
    toggleModelVisibility,
    duplicateModel,
    renameModel,
  };
}
