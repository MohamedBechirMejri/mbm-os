export type Category =
  | "webgpu"
  | "games"
  | "ai-tools"
  | "productivity"
  | "creative"
  | "utilities"
  | "experiments";

export interface ExperimentApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: Category;
  tags: string[];
  featured?: boolean;
  screenshots?: string[];
  githubUrl?: string;
  demoUrl?: string;
  // For future when apps are actually implemented
  available?: boolean;
  hidden?: boolean;
  installManifest?: InstallManifest;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface InstallManifest {
  sizeEstimate?: number;
  assets: InstallAsset[];
}

export interface InstallAsset {
  url: string;
  cacheKey?: string;
  bytes?: number;
  kind?: "binary" | "gltf" | "texture" | "audio" | "font" | "icon" | "data";
}
