import type { CategoryInfo, ExperimentApp } from "./types";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "webgl",
    name: "WebGL & Graphics",
    description: "Interactive 3D experiences and visual experiments",
    icon: "preferences-desktop-display",
    color: "#FF6B6B",
  },
  {
    id: "games",
    name: "Games",
    description: "Interactive entertainment and playful experiments",
    icon: "game-center",
    color: "#4ECDC4",
  },
  {
    id: "ai-tools",
    name: "AI Tools",
    description: "Machine learning and AI-powered applications",
    icon: "applications-science",
    color: "#95E1D3",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Tools to enhance your workflow",
    icon: "accessories-calculator",
    color: "#FFE66D",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Design, art, and creative coding experiments",
    icon: "applications-graphics",
    color: "#A8E6CF",
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Helpful tools and system utilities",
    icon: "applications-utilities",
    color: "#FFD93D",
  },
  {
    id: "experiments",
    name: "Experiments",
    description: "Wild ideas and proof-of-concepts",
    icon: "applications-science",
    color: "#C8B6FF",
  },
];

// Sample apps - you can expand this as you build more experiments
export const EXPERIMENT_APPS: ExperimentApp[] = [
  // WebGL
  {
    id: "music-visualizer",
    name: "Music Visualizer",
    tagline: "Audio-reactive 3D graphics",
    description:
      "Real-time music visualization using WebGL and Web Audio API. Watch your music come to life with reactive particles and shaders.",
    icon: "media-player-banshee",
    category: "webgl",
    tags: ["webgl", "audio", "3d", "shaders"],
    featured: true,
    available: false,
  },
  {
    id: "particle-system",
    name: "Particle System",
    tagline: "GPU-accelerated particles",
    description:
      "Millions of particles rendered at 60fps using compute shaders and instancing.",
    icon: "preferences-desktop-display",
    category: "webgl",
    tags: ["webgl", "particles", "gpu"],
    available: false,
  },
  {
    id: "shader-playground",
    name: "Shader Playground",
    tagline: "Live GLSL editor",
    description:
      "Write and experiment with vertex and fragment shaders in real-time.",
    icon: "applications-graphics",
    category: "webgl",
    tags: ["webgl", "shaders", "glsl"],
    available: false,
  },

  // Games
  {
    id: "2048",
    name: "2048",
    tagline: "The addictive puzzle game",
    description:
      "Slide numbered tiles to combine them and reach 2048. Simple, elegant, addictive.",
    icon: "2048",
    category: "games",
    tags: ["puzzle", "casual"],
    available: false,
  },
  {
    id: "snake",
    name: "Snake",
    tagline: "Classic arcade action",
    description:
      "The timeless snake game with modern graphics and smooth controls.",
    icon: "game-center",
    category: "games",
    tags: ["arcade", "classic"],
    available: false,
  },
  {
    id: "tetris",
    name: "Tetris",
    tagline: "Block-stacking perfection",
    description: "The legendary puzzle game that needs no introduction.",
    icon: "0ad",
    category: "games",
    tags: ["puzzle", "classic"],
    available: false,
  },

  // AI Tools
  {
    id: "ai-chat",
    name: "AI Chat",
    tagline: "Conversational AI assistant",
    description:
      "Chat with a local AI model. Experiment with prompts and see how language models work.",
    icon: "hexchat",
    category: "ai-tools",
    tags: ["ai", "llm", "chat"],
    available: false,
  },
  {
    id: "image-generator",
    name: "Image Generator",
    tagline: "AI-powered artwork",
    description:
      "Generate images from text descriptions using diffusion models.",
    icon: "applications-graphics",
    category: "ai-tools",
    tags: ["ai", "image", "generation"],
    available: false,
  },
  {
    id: "style-transfer",
    name: "Style Transfer",
    tagline: "Artistic filters powered by AI",
    description:
      "Apply the style of famous paintings to your photos using neural networks.",
    icon: "imagefan-reloaded",
    category: "ai-tools",
    tags: ["ai", "image", "neural-network"],
    available: false,
  },

  // Productivity
  {
    id: "markdown-editor",
    name: "Markdown Editor",
    tagline: "Write in markdown with live preview",
    description:
      "A clean, distraction-free markdown editor with syntax highlighting and preview.",
    icon: "accessories-text-editor",
    category: "productivity",
    tags: ["writing", "markdown"],
    available: false,
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    tagline: "Time management made simple",
    description:
      "Focus for 25 minutes, break for 5. The proven productivity technique.",
    icon: "preferences-system-time",
    category: "productivity",
    tags: ["time", "focus"],
    available: false,
  },

  // Creative
  {
    id: "drawing-app",
    name: "Drawing Canvas",
    tagline: "Digital sketchpad",
    description: "Simple drawing app with brushes, colors, and layers.",
    icon: "applications-graphics",
    category: "creative",
    tags: ["drawing", "art"],
    available: false,
  },
  {
    id: "ascii-art",
    name: "ASCII Art Generator",
    tagline: "Turn images into text",
    description: "Convert any image into beautiful ASCII art.",
    icon: "accessories-character-map",
    category: "creative",
    tags: ["ascii", "art", "image"],
    available: false,
  },

  // Experiments
  {
    id: "liquid-glass",
    name: "Liquid Glass Lab",
    tagline: "Refraction experiments",
    description:
      "Play with the liquid glass refraction technique used throughout this OS.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["css", "svg", "filters"],
    featured: true,
    available: false,
  },
  {
    id: "gesture-recognition",
    name: "Gesture Recognition",
    tagline: "Control with hand movements",
    description: "Use your webcam and ML to recognize hand gestures.",
    icon: "input-tablet",
    category: "experiments",
    tags: ["ml", "webcam", "interaction"],
    available: false,
  },
];

export const getFeaturedApps = () =>
  EXPERIMENT_APPS.filter((app) => app.featured);
export const getAppsByCategory = (categoryId: string) =>
  EXPERIMENT_APPS.filter((app) => app.category === categoryId);
export const getCategoryInfo = (categoryId: string) =>
  CATEGORIES.find((cat) => cat.id === categoryId);
