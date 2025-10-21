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

  // NEW: Shareable, viral-leaning experiments
  // WebGPU & Graphics
  {
    id: "fluid-lab",
    name: "Fluid Lab",
    tagline: "Satisfying goo physics",
    description:
      "Real-time 2D fluid simulation with mouse/touch interaction, WebGPU compute and dye advection. Record short clips for socials.",
    icon: "preferences-desktop-display",
    category: "webgpu",
    tags: ["webgpu", "fluid", "physics", "2d"],
    featured: true,
    available: false,
  },
  {
    id: "fractal-zoom",
    name: "Infinite Fractal Zoom",
    tagline: "Dive forever",
    description:
      "GPU-powered Mandelbrot/Mandelbulb zoom with bookmarks and shareable seeds.",
    icon: "preferences-desktop-display",
    category: "webgpu",
    tags: ["webgpu", "fractal", "shader", "3d"],
    available: false,
  },
  {
    id: "audio-constellations",
    name: "Audio Constellations",
    tagline: "Stars that dance to your music",
    description:
      "Microphone-driven particle field that syncs to beat onsets and morphs into word shapes.",
    icon: "media-player-banshee",
    category: "webgpu",
    tags: ["audio", "particles", "webgpu"],
    available: false,
  },
  {
    id: "tiny-city",
    name: "Tiny Procedural City",
    tagline: "Build a city with sliders",
    description:
      "Procedurally generate roads and blocks, then fly around your miniature city.",
    icon: "preferences-desktop-display",
    category: "webgpu",
    tags: ["procedural", "city", "3d", "webgpu"],
    available: false,
  },

  // Creative (highly shareable)
  {
    id: "timewarp-scan",
    name: "Timewarp Scan",
    tagline: "The TikTok bar, in your browser",
    description:
      "Rolling shutter effect using WebGL. Freeze and share cursed portraits.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["webcam", "filter", "fun"],
    featured: true,
    available: false,
  },
  {
    id: "kaleidoscope-cam",
    name: "Kaleidoscope Cam",
    tagline: "Mirror-world selfie",
    description:
      "Webcam kaleidoscope and slit-scan tricks with export to GIF.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["webcam", "kaleidoscope", "gif"],
    available: false,
  },
  {
    id: "pixel-sorter",
    name: "Pixel Sorter",
    tagline: "Glitch that looks expensive",
    description:
      "Upload an image and sort pixels along gradients for that album‑cover vibe.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["glitch", "image", "canvas"],
    available: false,
  },
  {
    id: "datamosh-studio",
    name: "Datamosh Studio",
    tagline: "Break video the pretty way",
    description:
      "Iframe removal, P‑frame chaos, export looping webm clips. No installs.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["video", "glitch", "webm"],
    available: false,
  },
  {
    id: "lowpoly-portrait",
    name: "Low‑Poly Portrait",
    tagline: "Triangulate your face",
    description:
      "Delaunay triangulation with draggable points and color quantization.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["image", "triangulation", "canvas"],
    available: false,
  },
  {
    id: "3d-parallax-photo",
    name: "3D Parallax Photo",
    tagline: "Depth from a single image",
    description:
      "Sketch a depth map and generate parallax video with lighting and camera moves.",
    icon: "imagefan-reloaded",
    category: "creative",
    tags: ["parallax", "image", "depth"],
    featured: true,
    available: false,
  },
  {
    id: "text-physics",
    name: "Kinetic Typography",
    tagline: "Type that falls apart",
    description:
      "A mini physics engine for letters. Make them bounce, shatter and melt.",
    icon: "preferences-desktop-display",
    category: "creative",
    tags: ["physics", "typography", "play"],
    available: false,
  },
  {
    id: "emoji-mosaic",
    name: "Emoji Mosaic",
    tagline: "Your photo, thousands of emoji",
    description:
      "Turn images into emoji mosaics with a shareable permalink gallery.",
    icon: "accessories-character-map",
    category: "creative",
    tags: ["image", "emoji", "fun"],
    available: false,
  },

  // Multiplayer / Social experiments
  {
    id: "cursor-party",
    name: "Cursor Party",
    tagline: "100 cursors, one canvas",
    description:
      "P2P WebRTC swarm. Everyone’s cursors leave trails, collide and spark.",
    icon: "hexchat",
    category: "experiments",
    tags: ["multiplayer", "webrtc", "p2p"],
    featured: true,
    available: false,
  },
  {
    id: "multiplayer-doodle",
    name: "Multiplayer Doodle",
    tagline: "Draw together. Chaos optional",
    description:
      "CRDT + WebRTC canvas with replay and time‑lapse export.",
    icon: "hexchat",
    category: "experiments",
    tags: ["multiplayer", "webrtc", "crdt"],
    available: false,
  },

  // XR / Camera / Perception
  {
    id: "face-mesh-booth",
    name: "Face Mesh Booth",
    tagline: "3D mask filters",
    description:
      "Face mesh with 3D masks and scene lighting. Screenshot to share.",
    icon: "input-tablet",
    category: "experiments",
    tags: ["webcam", "3d", "face"],
    available: false,
  },
  {
    id: "illusion-lab",
    name: "Illusion Lab",
    tagline: "Optical tricks you can feel",
    description:
      "A set of interactive optical illusions with sliders and explainers.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["optical", "perception", "education"],
    available: false,
  },
  {
    id: "xr-portal",
    name: "XR Portal",
    tagline: "Step through your screen",
    description:
      "AR/WebXR portal to 360 scenes. Works with phone gyroscope.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["webxr", "ar", "360"],
    available: false,
  },
  {
    id: "screen-peel",
    name: "Screen Peel",
    tagline: "Peel the page like a sticker",
    description:
      "Physics-based page peel that reveals another website underneath.",
    icon: "preferences-desktop-display",
    category: "experiments",
    tags: ["css", "trick", "dom"],
    available: false,
  },

  // AI Tools (share-first)
  {
    id: "meme-writer",
    name: "Meme Writer",
    tagline: "Context‑aware captions",
    description:
      "Drop an image, get 10 spicy captions. One‑click share.",
    icon: "gpt",
    category: "ai-tools",
    tags: ["ai", "caption", "meme"],
    available: false,
  },
  {
    id: "beat-dj",
    name: "AI Beat DJ",
    tagline: "Auto‑cut clips to music",
    description:
      "Upload a song and a clip, get beat‑synced edits and captions.",
    icon: "media-player-banshee",
    category: "ai-tools",
    tags: ["ai", "audio", "video"],
    available: false,
  },
];

export const getFeaturedApps = () =>
  EXPERIMENT_APPS.filter((app) => app.featured);
export const getAppsByCategory = (categoryId: string) =>
  EXPERIMENT_APPS.filter((app) => app.category === categoryId);
export const getCategoryInfo = (categoryId: string) =>
  CATEGORIES.find((cat) => cat.id === categoryId);
