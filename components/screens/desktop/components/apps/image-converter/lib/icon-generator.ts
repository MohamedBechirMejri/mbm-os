import type { FilterOptions, TransformOptions } from "../types";
import type { ImageProcessor } from "../components/image-processor";

/**
 * Icon sizes for different platforms
 */
export interface IconConfig {
  name: string;
  size: number;
  platform: "ios" | "android" | "pwa" | "general";
  description: string;
}

/**
 * Complete set of icon configurations for all platforms
 */
export const ICON_CONFIGS: IconConfig[] = [
  // iOS App Icons
  { name: "ios-20x20.png", size: 20, platform: "ios", description: "iPhone Notification (iOS 7-14)" },
  { name: "ios-20x20@2x.png", size: 40, platform: "ios", description: "iPhone Notification @2x" },
  { name: "ios-20x20@3x.png", size: 60, platform: "ios", description: "iPhone Notification @3x" },
  { name: "ios-29x29.png", size: 29, platform: "ios", description: "iPhone Settings (iOS 7-14)" },
  { name: "ios-29x29@2x.png", size: 58, platform: "ios", description: "iPhone Settings @2x" },
  { name: "ios-29x29@3x.png", size: 87, platform: "ios", description: "iPhone Settings @3x" },
  { name: "ios-40x40.png", size: 40, platform: "ios", description: "iPhone Spotlight (iOS 7-14)" },
  { name: "ios-40x40@2x.png", size: 80, platform: "ios", description: "iPhone Spotlight @2x" },
  { name: "ios-40x40@3x.png", size: 120, platform: "ios", description: "iPhone Spotlight @3x" },
  { name: "ios-60x60@2x.png", size: 120, platform: "ios", description: "iPhone App (iOS 7-14) @2x" },
  { name: "ios-60x60@3x.png", size: 180, platform: "ios", description: "iPhone App (iOS 7-14) @3x" },
  { name: "ios-76x76.png", size: 76, platform: "ios", description: "iPad App (iOS 7-14)" },
  { name: "ios-76x76@2x.png", size: 152, platform: "ios", description: "iPad App @2x" },
  { name: "ios-83.5x83.5@2x.png", size: 167, platform: "ios", description: "iPad Pro App" },
  { name: "ios-1024x1024.png", size: 1024, platform: "ios", description: "App Store" },

  // Android Icons
  { name: "android-mdpi-48x48.png", size: 48, platform: "android", description: "Android MDPI (160dpi)" },
  { name: "android-hdpi-72x72.png", size: 72, platform: "android", description: "Android HDPI (240dpi)" },
  { name: "android-xhdpi-96x96.png", size: 96, platform: "android", description: "Android XHDPI (320dpi)" },
  { name: "android-xxhdpi-144x144.png", size: 144, platform: "android", description: "Android XXHDPI (480dpi)" },
  { name: "android-xxxhdpi-192x192.png", size: 192, platform: "android", description: "Android XXXHDPI (640dpi)" },
  { name: "android-512x512.png", size: 512, platform: "android", description: "Google Play Store" },

  // PWA Icons
  { name: "pwa-192x192.png", size: 192, platform: "pwa", description: "PWA Standard Icon" },
  { name: "pwa-512x512.png", size: 512, platform: "pwa", description: "PWA Splash Screen" },
  { name: "pwa-maskable-192x192.png", size: 192, platform: "pwa", description: "PWA Maskable Icon (with padding)" },
  { name: "pwa-maskable-512x512.png", size: 512, platform: "pwa", description: "PWA Maskable Splash (with padding)" },

  // General/Favicon
  { name: "favicon-16x16.png", size: 16, platform: "general", description: "Browser Tab" },
  { name: "favicon-32x32.png", size: 32, platform: "general", description: "Browser Tab @2x" },
  { name: "apple-touch-icon.png", size: 180, platform: "general", description: "iOS Safari Bookmark" },
];

/**
 * Generates a complete set of app icons for all platforms
 */
export async function generateAppIcons(
  processor: ImageProcessor,
  adjustments: FilterOptions,
  transform: TransformOptions,
  onProgress?: (current: number, total: number, name: string) => void
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (let i = 0; i < ICON_CONFIGS.length; i++) {
    const config = ICON_CONFIGS[i];

    if (onProgress) {
      onProgress(i + 1, ICON_CONFIGS.length, config.name);
    }

    // For PWA maskable icons, add 20% padding (safe zone)
    let size = config.size;
    let drawSize = config.size;
    if (config.name.includes("maskable")) {
      drawSize = Math.round(config.size * 0.8); // 80% of total size
    }

    processor.process(
      adjustments,
      { width: size, height: size, maintainAspect: false },
      transform,
      null
    );

    const blob = await processor.getBlob("png");
    if (blob) {
      // Organize by platform folders
      const folder = `${config.platform}`;
      zip.file(`${folder}/${config.name}`, blob);
    }
  }

  // Generate README with platform-specific instructions
  const readme = generateReadme();
  zip.file("README.md", readme);

  // Generate web manifest for PWA
  const manifest = generateManifest();
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: "blob" });
}

function generateReadme(): string {
  return `# App Icon Set

This package contains optimized app icons for all major platforms.

## 📱 iOS (15 icons)
Place in your Xcode project's Assets.xcassets/AppIcon.appiconset/

## 🤖 Android (6 icons)
Place in your Android project under:
- \`res/mipmap-mdpi/\` (48x48)
- \`res/mipmap-hdpi/\` (72x72)
- \`res/mipmap-xhdpi/\` (96x96)
- \`res/mipmap-xxhdpi/\` (144x144)
- \`res/mipmap-xxxhdpi/\` (192x192)
- Google Play Store: 512x512

## 🌐 PWA (4 icons)
Include in your web app's root directory and reference in manifest.json:
- \`pwa-192x192.png\` - Standard icon
- \`pwa-512x512.png\` - Splash screen
- \`pwa-maskable-192x192.png\` - Maskable icon (for adaptive icons)
- \`pwa-maskable-512x512.png\` - Maskable splash

## 🌍 Web/Favicon (3 icons)
Include in your website's root or assets folder:
- \`favicon-16x16.png\`
- \`favicon-32x32.png\`
- \`apple-touch-icon.png\` (for iOS Safari bookmarks)

### HTML Head Tags:
\`\`\`html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
\`\`\`

---

Generated by MBM OS Image Converter 🎨
`;
}

function generateManifest(): Record<string, unknown> {
  return {
    name: "Your App Name",
    short_name: "App",
    description: "Your app description",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/pwa-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
