"use client";

import type { AppMeta } from "../window-manager/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Category =
  | "webgpu"
  | "games"
  | "ai-tools"
  | "productivity"
  | "creative"
  | "utilities"
  | "experiments";

export interface InstallAsset {
  url: string;
  cacheKey?: string;
  bytes?: number;
  kind?: "binary" | "gltf" | "texture" | "audio" | "font" | "icon" | "data";
}

export interface InstallManifest {
  sizeEstimate?: number;
  assets: InstallAsset[];
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Unified app entry combining window-manager metadata with App Store metadata.
 * - Window manager uses: id, title, icon, Component, minSize, maxSize, resizable, etc.
 * - App Store uses: tagline, description, category, tags, featured, available, hidden, installManifest
 */
export interface CatalogApp extends Omit<AppMeta, "icon"> {
  // Icon as a string (icon name) for both the dock and App Store.
  // The window-manager will convert this to an IconComponent when registering.
  icon: string;

  // App Store metadata
  tagline: string;
  description: string;
  category: Category;
  tags: string[];
  featured?: boolean;
  screenshots?: string[];
  githubUrl?: string;
  demoUrl?: string;

  // Whether the app is actually implemented and installable
  available: boolean;
  // If true, the app won't show in the App Store UI
  hidden?: boolean;

  // Install manifest for installable apps
  installManifest?: InstallManifest;
}

// ---------------------------------------------------------------------------
// Category Definitions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// App Components (lazy imports to avoid circular deps)
// ---------------------------------------------------------------------------

import { AppStoreApp } from "./app-store";
import { CalculatorApp } from "./calculator";
import { FinderApp } from "./finder";
import { GltfViewerApp } from "./gltf-viewer";
import { GpuWaterLab } from "./gpu-water-lab";
import { ImageConverterApp } from "./image-converter";
import { MillionRowGrid } from "./million-row-grid";
import { SafariApp } from "./safari";
import { ShadowPlaygroundApp } from "./shadow-playground";
import { ShapeBuilderApp } from "./shape-builder";
import { SketchPadApp } from "./sketch-pad";
import { TerminalApp } from "./terminal";
import { SolitaireApp } from "./solitaire";

// ---------------------------------------------------------------------------
// Unified App Catalog
// ---------------------------------------------------------------------------

export const catalogApps: CatalogApp[] = [
  // =========================================================================
  // Creative Apps
  // =========================================================================
  {
    id: "sketch-pad",
    title: "Sketch Pad",
    icon: "imagefan-reloaded",
    Component: SketchPadApp,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    // App Store metadata
    tagline: "Digital Drawing Canvas",
    description:
      "A feature-rich drawing app with brush and eraser tools, adjustable brush size, color picker, up to 10 layers with visibility controls, undo/redo history, and PNG export. Perfect for quick sketches and digital art.",
    category: "creative",
    tags: ["drawing", "art", "canvas", "sketch", "layers"],
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 650_000,
      assets: [
        {
          url: "/assets/icons/apps/imagefan-reloaded.ico",
          kind: "icon",
          bytes: 4_096,
          cacheKey: "sketch-pad/icon",
        },
      ],
    },
  },
  {
    id: "shadow-playground",
    title: "Shadow Lab",
    icon: "preferences-desktop-plasma-theme",
    Component: ShadowPlaygroundApp,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    // App Store metadata
    tagline: "CSS Box Shadow Generator",
    description:
      "Visually design CSS box shadows with real-time preview. Adjust offsets, blur, spread, and color, then copy the generated CSS or Tailwind code.",
    category: "creative",
    tags: ["css", "design", "shadow", "generator", "tool"],
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 850_000,
      assets: [
        {
          url: "/assets/icons/apps/preferences-desktop-plasma-theme.ico",
          kind: "icon",
          bytes: 4_096,
          cacheKey: "shadow-playground/icon",
        },
      ],
    },
  },
  {
    id: "shape-builder",
    title: "Shape Builder",
    icon: "preferences-desktop-plasma-theme",
    Component: ShapeBuilderApp,
    minSize: { w: 1280, h: 800 },
    floatingActionBar: true,
    tagline: "Visual CSS shape() Generator",
    description:
      "Design custom CSS shapes with an interactive canvas. Create complex clip-paths using the new CSS shape() function with lines, curves, and arcs, then copy the generated CSS code.",
    category: "creative",
    tags: ["css", "design", "shape", "generator", "clip-path"],
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 450_000,
      assets: [
        {
          url: "/assets/icons/apps/preferences-desktop-plasma-theme.ico",
          kind: "icon",
          bytes: 4_096,
          cacheKey: "shape-builder/icon",
        },
      ],
    },
  },
  {
    id: "drawing-app",
    title: "Drawing Canvas",
    icon: "imagefan-reloaded",
    Component: () => null, // Placeholder - not implemented
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Digital sketchpad",
    description: "Simple drawing app with brushes, colors, and layers.",
    category: "creative",
    tags: ["drawing", "art"],
    available: false,
    hidden: true,
  },
  {
    id: "ascii-art",
    title: "ASCII Art Generator",
    icon: "accessories-character-map",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Turn images into text",
    description: "Convert any image into beautiful ASCII art.",
    category: "creative",
    tags: ["ascii", "art", "image"],
    available: false,
    hidden: true,
  },
  {
    id: "zoomquilt-canvas",
    title: "Zoomquilt Canvas",
    icon: "imagefan-reloaded",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Community infinite zoom",
    description:
      "Submit a frame to the never‑ending zoom. Moderated queue, nightly stitch. Viewer has ambient music and one‑tap clip export with your username stamped in the corner.",
    category: "creative",
    tags: ["collab", "zoom", "art"],
    featured: true,
    available: false,
    hidden: true,
  },

  // =========================================================================
  // Utilities
  // =========================================================================
  {
    id: "image-converter",
    title: "Image Converter",
    icon: "imagefan-reloaded",
    Component: ImageConverterApp,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Convert, Resize, and Generate Favicons",
    description:
      "A powerful client-side image tool. Convert between formats (PNG, JPG, WEBP), resize images with high quality, and generate complete favicon packages for your websites. All processing happens locally on your device.",
    category: "utilities",
    tags: ["image", "converter", "resize", "favicon", "tool"],
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 1_500_000,
      assets: [
        {
          url: "/assets/icons/apps/imagefan-reloaded.ico",
          kind: "icon",
          bytes: 12_000,
          cacheKey: "image-converter/icon",
        },
      ],
    },
  },
  {
    id: "calculator",
    title: "Calculator",
    icon: "calc",
    Component: CalculatorApp,
    minSize: { w: 200, h: 350 },
    maxSize: { w: 200, h: 350 },
    resizable: false,
    floatingActionBar: true,
    tagline: "Fast arithmetic and conversions",
    description:
      "A lightweight calculator with basic, scientific, and unit conversion modes.",
    category: "utilities",
    tags: ["math", "utility", "converter"],
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 4_200_000,
      assets: [
        {
          url: "/assets/icons/apps/calc.ico",
          kind: "icon",
          bytes: 6_144,
          cacheKey: "calculator/icon",
        },
      ],
    },
  },
  {
    id: "log-tail",
    title: "Streaming Log Tail",
    icon: "utilities-system-monitor",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "100k lines/s without choking",
    description:
      "WebSocket ingest into a ring buffer with drop counters and backpressure, regex search with incremental index in a Worker, and a windowed list UI with pause/resume and jump-to-newest.",
    category: "utilities",
    tags: ["streaming", "backpressure", "workers", "virtualization"],
    available: false,
    hidden: false,
  },

  // =========================================================================
  // System Apps (preinstalled)
  // =========================================================================
  {
    id: "file-manager",
    title: "Finder",
    icon: "file-manager",
    Component: FinderApp,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    titlebarHeight: 46,
    actionButtonsStyle: {
      top: 22,
      left: 22,
      position: "absolute" as const,
    },
    tagline: "Browse your files",
    description: "A file manager for navigating and managing files.",
    category: "utilities",
    tags: ["files", "system"],
    available: true,
    hidden: true, // System app - not shown in App Store
  },
  {
    id: "safari",
    title: "Safari",
    icon: "safari",
    Component: SafariApp,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: false,
    titlebarHeight: 46,
    tagline: "Browse the web",
    description: "A web browser for surfing the internet.",
    category: "utilities",
    tags: ["browser", "web", "system"],
    available: true,
    hidden: true, // System app
  },
  {
    id: "softwarecenter",
    title: "App Store",
    icon: "softwarecenter",
    Component: AppStoreApp,
    minSize: { w: 940, h: 640 },
    floatingActionBar: true,
    actionButtonsStyle: {
      top: 22,
      left: 16,
      position: "absolute" as const,
    },
    tagline: "Discover and install apps",
    description: "Browse and install apps from the catalog.",
    category: "utilities",
    tags: ["apps", "store", "system"],
    available: true,
    hidden: true, // System app
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "terminal",
    Component: TerminalApp,
    minSize: { w: 1280, h: 720 },
    floatingActionBar: true,
    tagline: "Command line interface",
    description: "A terminal for running shell commands.",
    category: "utilities",
    tags: ["terminal", "shell", "system"],
    available: true,
    hidden: true, // System app
  },

  // =========================================================================
  // Productivity
  // =========================================================================
  {
    id: "million-row-grid",
    title: "Million Row Grid",
    icon: "libreoffice-calc",
    Component: MillionRowGrid,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "1,000,000 rows at 60 fps",
    description:
      "Arrow/Parquet decoded in a Web Worker, windowed virtualization, worker-backed sort/filter with backpressure, and a live perf HUD (FPS, mem, query time). Export visible slice to CSV.",
    category: "productivity",
    tags: ["virtualization", "arrow", "wasm", "workers"],
    featured: true,
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 2_500_000,
      assets: [
        {
          url: "/assets/icons/apps/libreoffice-calc.ico",
          kind: "icon",
          bytes: 8_192,
          cacheKey: "million-row-grid/icon",
        },
      ],
    },
  },
  {
    id: "markdown-editor",
    title: "Markdown Editor",
    icon: "accessories-text-editor",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Write in markdown with live preview",
    description:
      "A clean, distraction-free markdown editor with syntax highlighting and preview.",
    category: "productivity",
    tags: ["writing", "markdown"],
    available: false,
    hidden: true,
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    icon: "preferences-system-time",
    Component: () => null,
    minSize: { w: 400, h: 300 },
    floatingActionBar: true,
    tagline: "Time management made simple",
    description:
      "Focus for 25 minutes, break for 5. The proven productivity technique.",
    category: "productivity",
    tags: ["time", "focus"],
    available: false,
    hidden: true,
  },

  // =========================================================================
  // WebGPU & Graphics
  // =========================================================================
  {
    id: "gpu-water-lab",
    title: "GPU Water Lab",
    icon: "preferences-desktop-display",
    Component: GpuWaterLab,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Interactive fluid physics with millions of particles",
    description:
      "Real-time particle-based water simulation powered by WebGPU compute shaders. Watch millions of particles interact with physics-based forces, create ripples and waves with mouse interaction, and tweak gravity, viscosity, and other parameters in real-time. This showcases actual GPU compute power, not just pretty rendering.",
    category: "webgpu",
    tags: ["webgpu", "physics", "simulation", "compute-shaders", "particles"],
    featured: true,
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 1_800_000,
      assets: [
        {
          url: "/assets/icons/apps/preferences-desktop-display.ico",
          kind: "icon",
          bytes: 6_144,
          cacheKey: "gpu-water-lab/icon",
        },
      ],
    },
  },
  {
    id: "gltf-viewer",
    title: "GLTF Viewer",
    icon: "preferences-desktop-display",
    Component: GltfViewerApp,
    minSize: { w: 1280, h: 800 },
    floatingActionBar: true,
    titlebarHeight: 46,
    actionButtonsStyle: {
      top: 14,
      left: 14,
      position: "absolute" as const,
    },
    tagline: "Interactive 3D Model Viewer",
    description:
      "Load, view, and manipulate glTF and GLB 3D models. Features include transform controls (move, rotate, scale), model hierarchy management, visibility toggles, and an infinite grid environment. Perfect for previewing 3D assets.",
    category: "webgpu",
    tags: ["3d", "gltf", "viewer", "three.js", "models"],
    featured: true,
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 2_000_000,
      assets: [
        {
          url: "/assets/icons/apps/preferences-desktop-display.ico",
          kind: "icon",
          bytes: 6_144,
          cacheKey: "gltf-viewer/icon",
        },
      ],
    },
  },
  {
    id: "music-visualizer",
    title: "Music Visualizer",
    icon: "media-player-banshee",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Audio-reactive 3D graphics",
    description:
      "Real-time music visualization using WebGPU and Web Audio API. Watch your music come to life with reactive particles and shaders.",
    category: "webgpu",
    tags: ["webgpu", "audio", "3d", "shaders"],
    featured: true,
    available: false,
    hidden: true,
  },
  {
    id: "particle-system",
    title: "Particle System",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "GPU-accelerated particles",
    description:
      "Millions of particles rendered at 60fps using compute shaders and instancing.",
    category: "webgpu",
    tags: ["webgpu", "particles", "gpu"],
    available: false,
    hidden: true,
  },
  {
    id: "shader-playground",
    title: "Shader Playground",
    icon: "imagefan-reloaded",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Live GLSL editor",
    description:
      "Write and experiment with vertex and fragment shaders in real-time.",
    category: "webgpu",
    tags: ["webgpu", "shaders", "glsl"],
    available: false,
    hidden: true,
  },
  {
    id: "water-caustics",
    title: "Water Caustics Sandbox",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Fake water that fools your brain",
    description:
      "Heightfield water with physically‑plausible reflections/refractions and moving caustics. Toss draggable objects, tweak viscosity and wind, and record 4–6s loops. Includes a 'reveal grid' dev view for tuning.",
    category: "webgpu",
    tags: ["webgpu", "water", "caustics", "physics"],
    available: false,
    hidden: true,
  },
  {
    id: "shader-roulette",
    title: "Shader Roulette",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Press space for hypnosis",
    description:
      "Curated set of mesmerizing shaders with seed controls and BPM sync. Emoji ratings feed a daily 'Top 5' share card.",
    category: "webgpu",
    tags: ["shader", "webgpu", "visual"],
    available: false,
    hidden: true,
  },

  // =========================================================================
  // Games
  // =========================================================================
  {
    id: "solitaire",
    title: "Solitaire",
    icon: "gnome-aisleriot",
    Component: SolitaireApp,
    minSize: { w: 700, h: 560 },
    floatingActionBar: true,
    tagline: "Classic card games: Klondike, Spider, FreeCell",
    description:
      "The classic Windows card game collection. Features Klondike (classic solitaire) with undo/redo, drag-and-drop cards, and win celebration. Spider and FreeCell modes coming soon.",
    category: "games",
    tags: ["cards", "puzzle", "classic", "windows"],
    featured: true,
    available: true,
    hidden: false,
    installManifest: {
      sizeEstimate: 500_000,
      assets: [
        {
          url: "/assets/icons/apps/gnome-aisleriot.ico",
          kind: "icon",
          bytes: 4_096,
          cacheKey: "solitaire/icon",
        },
      ],
    },
  },
  {
    id: "2048",
    title: "2048",
    icon: "2048",
    Component: () => null,
    minSize: { w: 400, h: 500 },
    floatingActionBar: true,
    tagline: "The addictive puzzle game",
    description:
      "Slide numbered tiles to combine them and reach 2048. Simple, elegant, addictive.",
    category: "games",
    tags: ["puzzle", "casual"],
    available: false,
    hidden: true,
  },
  {
    id: "snake",
    title: "Snake",
    icon: "game-center",
    Component: () => null,
    minSize: { w: 600, h: 600 },
    floatingActionBar: true,
    tagline: "Classic arcade action",
    description:
      "The timeless snake game with modern graphics and smooth controls.",
    category: "games",
    tags: ["arcade", "classic"],
    available: false,
    hidden: true,
  },
  {
    id: "tetris",
    title: "Tetris",
    icon: "0ad",
    Component: () => null,
    minSize: { w: 400, h: 600 },
    floatingActionBar: true,
    tagline: "Block-stacking perfection",
    description: "The legendary puzzle game that needs no introduction.",
    category: "games",
    tags: ["puzzle", "classic"],
    available: false,
    hidden: true,
  },
  {
    id: "falling-sand-2025",
    title: "Falling Sand 2025",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Paint lava, water, smoke and plants",
    description:
      "Modern GPU cellular‑automata take on the classic. Tool palette with reactive materials (water + lava → obsidian), simple logic gates, and challenge prompts. Export tiny timelapse loops.",
    category: "games",
    tags: ["sandbox", "cellular-automata", "sim"],
    available: false,
    hidden: true,
  },

  // =========================================================================
  // AI Tools
  // =========================================================================
  {
    id: "ai-chat",
    title: "AI Chat",
    icon: "hexchat",
    Component: () => null,
    minSize: { w: 800, h: 600 },
    floatingActionBar: true,
    tagline: "Conversational AI assistant",
    description:
      "Chat with a local AI model. Experiment with prompts and see how language models work.",
    category: "ai-tools",
    tags: ["ai", "llm", "chat"],
    available: false,
    hidden: true,
  },
  {
    id: "image-generator",
    title: "Image Generator",
    icon: "imagefan-reloaded",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "AI-powered artwork",
    description:
      "Generate images from text descriptions using diffusion models.",
    category: "ai-tools",
    tags: ["ai", "image", "generation"],
    available: false,
    hidden: true,
  },
  {
    id: "style-transfer",
    title: "Style Transfer",
    icon: "imagefan-reloaded",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Artistic filters powered by AI",
    description:
      "Apply the style of famous paintings to your photos using neural networks.",
    category: "ai-tools",
    tags: ["ai", "image", "neural-network"],
    available: false,
    hidden: true,
  },

  // =========================================================================
  // Experiments
  // =========================================================================
  {
    id: "liquid-glass",
    title: "Liquid Glass Lab",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Refraction experiments",
    description:
      "Play with the liquid glass refraction technique used throughout this OS.",
    category: "experiments",
    tags: ["css", "svg", "filters"],
    featured: true,
    available: false,
    hidden: true,
  },
  {
    id: "gesture-recognition",
    title: "Gesture Recognition",
    icon: "input-tablet",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Control with hand movements",
    description: "Use your webcam and ML to recognize hand gestures.",
    category: "experiments",
    tags: ["ml", "webcam", "interaction"],
    available: false,
    hidden: true,
  },
  {
    id: "rotating-snakes",
    title: "Rotating Snakes Live",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Nothing moves. It just looks like it does",
    description:
      "Interactive take on Kitaoka's illusion. Sliders for contrast, luminance and spacing to dial the effect; a 'prove it' button freezes the illusion for a side‑by‑side share image.",
    category: "experiments",
    tags: ["illusion", "perception", "education"],
    available: false,
    hidden: true,
  },
  {
    id: "color-lies",
    title: "Color Lies",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "Same color, different minds",
    description:
      "Classic same‑color illusions with masks and a hex picker. One‑click 'reveal' generates a before/after card for quote‑tweet ammo.",
    category: "experiments",
    tags: ["illusion", "color", "education"],
    available: false,
    hidden: true,
  },
  {
    id: "ghostly-gaze",
    title: "Ghostly Gaze",
    icon: "preferences-desktop-display",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "It looks at you until you step back",
    description:
      "Spatial‑frequency blending demo: up close the portrait faces left, far away it faces right. Distance slider and 'toggle blur bands' explain why. Auto‑generate a share image with both views.",
    category: "experiments",
    tags: ["illusion", "perception", "blend"],
    available: false,
    hidden: true,
  },
  {
    id: "clickclickclone",
    title: "ClickClickClone",
    icon: "utilities-system-monitor",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "A website that roasts your browsing",
    description:
      "Records simple client‑side events for 30 seconds and generates a snarky session receipt card (scrolls, hesitations, rage‑clicks). Privacy‑friendly: never uploads raw events; only the generated card is shareable.",
    category: "experiments",
    tags: ["behavior", "funny", "share"],
    featured: true,
    available: false,
    hidden: true,
  },
  {
    id: "pointer-pointer-plus",
    title: "PointerPointer+",
    icon: "accessories-character-map",
    Component: () => null,
    minSize: { w: 1280, h: 960 },
    floatingActionBar: true,
    tagline: "We always point at your cursor",
    description:
      "Reimagining the classic with themed packs (celebrations, anime poses), crisp crops and fast lookups. Generates a still or a short 'chase' animation for posting.",
    category: "experiments",
    tags: ["fun", "cursor", "nostalgia"],
    available: false,
    hidden: true,
  },
];

// ---------------------------------------------------------------------------
// Preinstalled App IDs (system apps that appear in dock by default)
// ---------------------------------------------------------------------------

const PREINSTALLED_IDS = new Set<string>([
  "softwarecenter",
  "safari",
  "file-manager",
  "terminal",
]);

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get all apps that should be preinstalled (shown in dock at boot)
 */
export const preinstalledApps = catalogApps.filter(a =>
  PREINSTALLED_IDS.has(a.id)
);

/**
 * Get apps available for installation from App Store
 */
export const getInstallableApps = () =>
  catalogApps.filter(app => !app.hidden && app.available);

/**
 * Get featured apps for the App Store home
 */
export const getFeaturedApps = () =>
  catalogApps.filter(app => app.featured && !app.hidden);

/**
 * Get apps by category for App Store browsing
 */
export const getAppsByCategory = (categoryId: string) =>
  catalogApps.filter(app => app.category === categoryId && !app.hidden);

/**
 * Get category info by ID
 */
export const getCategoryInfo = (categoryId: string) =>
  CATEGORIES.find(cat => cat.id === categoryId);

/**
 * Get a single app by ID
 */
export const getAppById = (appId: string) =>
  catalogApps.find(app => app.id === appId);

/**
 * Convert CatalogApp to AppMeta for the window manager
 */
export function toAppMeta(app: CatalogApp): AppMeta {
  return {
    id: app.id,
    title: app.title,
    icon: app.icon,
    Component: app.Component,
    minSize: app.minSize,
    maxSize: app.maxSize,
    resizable: app.resizable,
    floatingActionBar: app.floatingActionBar,
    titlebarHeight: app.titlebarHeight,
    actionButtonsStyle: app.actionButtonsStyle,
  };
}
