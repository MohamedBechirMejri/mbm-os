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

  const addModel = useCallback(async (files: File | File[]): Promise<void> => {
    const fileList = Array.isArray(files) ? files : [files];

    // Find model files (.gltf or .glb)
    const modelFiles = fileList.filter(f => /\.(gltf|glb)$/i.test(f.name));

    if (modelFiles.length === 0) return;

    for (const modelFile of modelFiles) {
      const id = generateId();
      const name = extractName(modelFile);
      const url = URL.createObjectURL(modelFile);

      // Create asset map for this model
      const getPath = (f: File) => {
        const path = (f as any).fullPath || (f as any).webkitRelativePath || "";
        return path.startsWith("/") ? path.slice(1) : path;
      };

      const assetMap: Record<string, string> = {};
      const modelPath = getPath(modelFile);
      const modelDir = modelPath.includes("/")
        ? modelPath.substring(0, modelPath.lastIndexOf("/") + 1)
        : "";

      for (const assetFile of fileList) {
        if (assetFile === modelFile) continue;

        const assetUrl = URL.createObjectURL(assetFile);
        const assetPath = getPath(assetFile);

        // Store by full name
        assetMap[assetFile.name] = assetUrl;

        // Store by relative path if it's within the same directory structure
        if (modelDir && assetPath.startsWith(modelDir)) {
          const relativePath = assetPath.substring(modelDir.length);
          assetMap[relativePath] = assetUrl;
        }
      }

      const newModel: SceneModel = {
        id,
        name,
        url,
        assetMap,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
      };

      setModels(prev => [...prev, newModel]);
      setSelectedModelId(id);
    }
  }, []);

  const removeModel = useCallback((id: string) => {
    setModels(prev => {
      const model = prev.find(m => m.id === id);
      if (model) {
        // Revoke the main model URL
        URL.revokeObjectURL(model.url);

        // Only revoke assets if they aren't shared with another model (e.g. from duplication)
        const isAssetMapShared = prev.some(
          m => m.id !== id && m.assetMap === model.assetMap
        );

        if (!isAssetMapShared && model.assetMap) {
          for (const assetUrl of Object.values(model.assetMap)) {
            URL.revokeObjectURL(assetUrl);
          }
        }
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
