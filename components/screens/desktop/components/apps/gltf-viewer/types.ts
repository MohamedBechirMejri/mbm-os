"use client";

import type { Group } from "three";

/**
 * Represents a 3D model in the scene
 */
export interface SceneModel {
  id: string;
  name: string;
  url: string;
  assetMap?: Record<string, string>;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
}

/**
 * Transform gizmo mode
 */
export type TransformMode = "translate" | "rotate" | "scale";

/**
 * State for the GLTF viewer
 */
export interface GltfViewerState {
  models: SceneModel[];
  selectedModelId: string | null;
  transformMode: TransformMode;

  // Actions
  addModel: (files: File | File[]) => Promise<void>;
  removeModel: (id: string) => void;
  selectModel: (id: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
  updateModelTransform: (
    id: string,
    transform: Partial<Pick<SceneModel, "position" | "rotation" | "scale">>
  ) => void;
  toggleModelVisibility: (id: string) => void;
  duplicateModel: (id: string) => void;
  renameModel: (id: string, name: string) => void;
}

/**
 * Props for the model item component
 */
export interface ModelItemProps {
  model: SceneModel;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
}

/**
 * Loaded model ref with three.js Group
 */
export interface LoadedModelRef {
  id: string;
  group: Group | null;
}
