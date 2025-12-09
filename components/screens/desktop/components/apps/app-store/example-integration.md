# Example: How to add a real, working experiment to the app store

This shows you the complete workflow from building an experiment
to making it available in the app store.

## STEP 1: Build your experiment component

Create your experiment component. Every app receives an `instanceId` prop.

```typescript
// File: components/screens/desktop/components/apps/music-visualizer/index.tsx

export function MusicVisualizerApp({ instanceId }: { instanceId: string }) {
  return (
    <div className="h-full w-full bg-black">
      <canvas className="h-full w-full" />
      {/* Your experiment code here */}
    </div>
  );
}
```

## STEP 2: Add it to the unified app catalog

Add your app to `catalogApps` in `../app-catalog.ts`. This is the single source of truth
for both the window manager and the App Store.

```typescript
// File: components/screens/desktop/components/apps/app-catalog.ts

import { MusicVisualizerApp } from "./music-visualizer";

export const catalogApps: CatalogApp[] = [
  // ... existing apps

  {
    // Window manager fields
    id: "music-visualizer",
    title: "Music Visualizer",
    icon: "audio-x-generic",
    Component: MusicVisualizerApp,
    minSize: { w: 600, h: 400 },
    floatingActionBar: true,

    // App Store fields
    tagline: "Audio-reactive 3D graphics",
    description:
      "Real-time music visualization using WebGPU and Web Audio API.",
    category: "webgpu",
    tags: ["webgpu", "audio", "3d", "shaders"],
    featured: false,
    available: true, // Set to true when ready! 🎉
    hidden: false, // Set to true to hide from App Store

    // Optional install manifest for caching assets
    installManifest: {
      sizeEstimate: 1_500_000,
      assets: [
        {
          url: "/assets/icons/apps/audio-x-generic.ico",
          kind: "icon",
          bytes: 4_096,
          cacheKey: "music-visualizer/icon",
        },
      ],
    },
  },
];
```

## THAT'S IT!

Now users can:

1. Browse to the app in the App Store
2. Click "Install" (instead of "Coming Soon")
3. The app gets registered in the window manager
4. Launch it from the dock or anywhere in the OS

## BONUS: Preinstalling an app

To preinstall an app (like Safari, Finder, Terminal), add the app ID to
`PREINSTALLED_IDS` in `../app-catalog.ts`:

```typescript
const PREINSTALLED_IDS = new Set<string>([
  "softwarecenter",
  "safari",
  "file-manager",
  "terminal",
  "music-visualizer", // Add this to preinstall it
]);
```

Preinstalled apps:

- Appear in the dock at boot
- Don't need to be installed from the App Store
- Are typically hidden from the App Store (`hidden: true`)
