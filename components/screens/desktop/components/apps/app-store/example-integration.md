/**
 * EXAMPLE: How to add a real, working experiment to the app store
 * 
 * This shows you the complete workflow from building an experiment
 * to making it available in the app store.
 */

// ============================================================================
// STEP 1: Build your experiment component
// ============================================================================
// File: components/screens/desktop/components/apps/music-visualizer/index.tsx

export function MusicVisualizerApp({ instanceId }: { instanceId: string }) {
  return (
    <div className="h-full w-full bg-black">
      <canvas className="h-full w-full" />
      {/* Your experiment code here */}
    </div>
  );
}

// ============================================================================
// STEP 2: Register it in the app registry
// ============================================================================
// File: components/screens/desktop/components/apps/app-registry.ts

import { MusicVisualizerApp } from "./music-visualizer";

export const catalogApps: AppMeta[] = [
  // ... existing apps
  
  {
    id: "music-visualizer",
    title: "Music Visualizer",
    icon: "audio-x-generic",
    Component: MusicVisualizerApp,
    minSize: { w: 600, h: 400 },
  },
];

// ============================================================================
// STEP 3: Update the app store data to make it available
// ============================================================================
// File: components/screens/desktop/components/apps/app-store/data.ts

// Find your experiment in EXPERIMENT_APPS and change:
{
  id: "music-visualizer",
  name: "Music Visualizer",
  // ... other fields stay the same
  available: false,  // Change this to true ✅
}

// To:
{
  id: "music-visualizer",
  name: "Music Visualizer",
  // ... other fields stay the same
  available: true,  // Now it's available! 🎉
}

// ============================================================================
// THAT'S IT! 
// ============================================================================
// Now users can:
// 1. Browse to the app in the app store
// 2. Click "Download" (instead of "Coming Soon")
// 3. The app gets registered in the window manager
// 4. Launch it from the dock or anywhere in the OS

/**
 * BONUS TIP: If you want to preinstall an app (like Safari, Finder, etc.)
 * 
 * In app-registry.ts, add the app ID to PREINSTALLED_IDS:
 */

const PREINSTALLED_IDS = new Set<string>([
  "softwarecenter",
  "safari", 
  "file-manager",
  "music-visualizer", // Add this to preinstall it
]);
