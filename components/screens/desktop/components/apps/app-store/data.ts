import type { CategoryInfo, ExperimentApp } from "./types";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "webgpu",
    name: "WebGPU & Graphics",
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
    icon: "gpt",
    color: "#95E1D3",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Tools to enhance your workflow",
    icon: "calc",
    color: "#FFE66D",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Design, art, and creative coding experiments",
    icon: "imagefan-reloaded",
    color: "#A8E6CF",
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Helpful tools and system utilities",
    icon: "utilities-system-monitor",
    color: "#FFD93D",
  },
  {
    id: "experiments",
    name: "Experiments",
    description: "Wild ideas and proof-of-concepts",
    icon: "gpt",
    color: "#C8B6FF",
  },
];

// Sample apps - you can expand this as you build more experiments
export const EXPERIMENT_APPS: ExperimentApp[] = [
  // WebGPU
  {
    id: "music-visualizer",
    name: "Music Visualizer",
    tagline: "Audio-reactive 3D graphics",
    description:
      "Real-time music visualization using WebGPU and Web Audio API. Watch your music come to life with reactive particles and shaders.",
    icon: "media-player-banshee",
    category: "webgpu",
    tags: ["webgpu", "audio", "3d", "shaders"],
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
    category: "webgpu",
    tags: ["webgpu", "particles", "gpu"],
    available: false,
  },
  {
    id: "shader-playground",
    name: "Shader Playground",
    tagline: "Live GLSL editor",
    description:
      "Write and experiment with vertex and fragment shaders in real-time.",
    icon: "imagefan-reloaded",
    category: "webgpu",
    tags: ["webgpu", "shaders", "glsl"],
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
    icon: "imagefan-reloaded",
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
    icon: "imagefan-reloaded",
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
  {
    id: "water-caustics",
    name: "Water Caustics Sandbox",
    tagline: "Fake water that fools your brain",
    description:
      "Heightfield water with physically‑plausible reflections/refractions and moving caustics. Toss draggable objects, tweak viscosity and wind, and record 4–6s loops. Includes a 'reveal grid' dev view for tuning.",
    icon: "preferences-desktop-display",
    category: "webgpu",
    tags: ["webgpu", "water", "caustics", "physics"],
    available: false,
  },
  {
    id: "rotating-snakes",
    name: "Rotating Snakes Live",
    tagline: "Nothing moves. It just looks like it does",
    description:
      "Interactive take on Kitaoka’s illusion. Sliders for contrast, luminance and spacing to dial the effect; a 'prove it' button freezes the illusion for a side‑by‑side share image.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["illusion", "perception", "education"],
    available: false,
  },
  {
    id: "color-lies",
    name: "Color Lies",
    tagline: "Same color, different minds",
    description:
      "Classic same‑color illusions with masks and a hex picker. One‑click 'reveal' generates a before/after card for quote‑tweet ammo.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["illusion", "color", "education"],
    available: false,
  },
  {
    id: "ghostly-gaze",
    name: "Ghostly Gaze",
    tagline: "It looks at you until you step back",
    description:
      "Spatial‑frequency blending demo: up close the portrait faces left, far away it faces right. Distance slider and 'toggle blur bands' explain why. Auto‑generate a share image with both views.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["illusion", "perception", "blend"],
    available: false,
  },
  {
    id: "clickclickclone",
    name: "ClickClickClone",
    tagline: "A website that roasts your browsing",
    description:
      "Records simple client‑side events for 30 seconds and generates a snarky session receipt card (scrolls, hesitations, rage‑clicks). Privacy‑friendly: never uploads raw events; only the generated card is shareable.",
    icon: "utilities-system-monitor",
    category: "experiments",
    tags: ["behavior", "funny", "share"],
    featured: true,
    available: false,
  },
  {
    id: "falling-sand-2025",
    name: "Falling Sand 2025",
    tagline: "Paint lava, water, smoke and plants",
    description:
      "Modern GPU cellular‑automata take on the classic. Tool palette with reactive materials (water + lava → obsidian), simple logic gates, and challenge prompts. Export tiny timelapse loops.",
    icon: "preferences-desktop-display",
    category: "games",
    tags: ["sandbox", "cellular-automata", "sim"],
    available: false,
  },
  {
    id: "pointer-pointer-plus",
    name: "PointerPointer+",
    tagline: "We always point at your cursor",
    description:
      "Reimagining the classic with themed packs (celebrations, anime poses), crisp crops and fast lookups. Generates a still or a short 'chase' animation for posting.",
    icon: "accessories-character-map",
    category: "experiments",
    tags: ["fun", "cursor", "nostalgia"],
    available: false,
  },
  {
    id: "shader-roulette",
    name: "Shader Roulette",
    tagline: "Press space for hypnosis",
    description:
      "Curated set of mesmerizing shaders with seed controls and BPM sync. Emoji ratings feed a daily 'Top 5' share card.",
    icon: "preferences-desktop-display",
    category: "webgpu",
    tags: ["shader", "webgpu", "visual"],
    available: false,
  },
  {
    id: "zoomquilt-canvas",
    name: "Zoomquilt Canvas",
    tagline: "Community infinite zoom",
    description:
      "Submit a frame to the never‑ending zoom. Moderated queue, nightly stitch. Viewer has ambient music and one‑tap clip export with your username stamped in the corner.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["collab", "zoom", "art"],
    featured: true,
    available: false,
  },
];

export const getFeaturedApps = () =>
  EXPERIMENT_APPS.filter((app) => app.featured);
export const getAppsByCategory = (categoryId: string) =>
  EXPERIMENT_APPS.filter((app) => app.category === categoryId);
export const getCategoryInfo = (categoryId: string) =>
  CATEGORIES.find((cat) => cat.id === categoryId);
