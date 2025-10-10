export type Category =
  | "webgl"
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
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}
