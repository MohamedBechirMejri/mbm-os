"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InstallAsset,
  InstallManifest,
} from "@/components/screens/desktop/components/apps/app-catalog";

const CACHE_NAMESPACE = "mbm-os.app-assets";

export type InstallStatus =
  | "idle"
  | "installing"
  | "finalizing"
  | "completed"
  | "failed";

export interface CachedAsset {
  url: string;
  cacheKey: string;
  bytes: number;
  storedAt: number;
  kind?: InstallAsset["kind"];
}

export interface InstalledAppRecord {
  id: string;
  installedAt: number;
  assets: CachedAsset[];
}

export interface InstallProgress {
  status: InstallStatus;
  percent: number;
  downloadedBytes: number;
  totalBytes?: number;
  currentAssetIndex: number;
  totalAssets: number;
  error?: string;
}

export interface InstallOptions {
  appId: string;
  manifest?: InstallManifest;
  signal?: AbortSignal;
}

interface AppInstallationState {
  installed: Record<string, InstalledAppRecord>;
  progress: Record<string, InstallProgress>;
  queue: string[];
  installApp: (options: InstallOptions) => Promise<void>;
  resetProgress: (appId: string) => void;
  uninstallApp: (appId: string) => Promise<void>;
}

declare global {
  interface Window {
    __MBM_OS_ASSET_CACHE__?: Map<string, Blob>;
  }
}

const getMemoryCache = () => {
  if (typeof window === "undefined") return null;
  window.__MBM_OS_ASSET_CACHE__ ??= new Map<string, Blob>();
  return window.__MBM_OS_ASSET_CACHE__;
};

const normalizeCacheKey = (key: string): string => {
  if (typeof window === "undefined") return key;
  return new URL(key, window.location.origin).toString();
};

const putInCache = async (
  cacheKey: string,
  blob: Blob,
  contentType?: string
) => {
  const absoluteKey = normalizeCacheKey(cacheKey);
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAMESPACE);
      const headers = new Headers();
      if (contentType) headers.set("Content-Type", contentType);
      headers.set("X-MBM-Asset", "1");
      await cache.put(absoluteKey, new Response(blob, { headers }));
      return;
    } catch {
      // Swallow and fallback to memory cache
    }
  }
  const memory = getMemoryCache();
  memory?.set(absoluteKey, blob);
};

const removeFromCache = async (cacheKey: string) => {
  const absoluteKey = normalizeCacheKey(cacheKey);
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(CACHE_NAMESPACE);
      await cache.delete(absoluteKey);
    } catch {
      // ignore cache eviction failures
    }
  }
  const memory = getMemoryCache();
  memory?.delete(absoluteKey);
};

const downloadAndCacheAsset = async (
  asset: InstallAsset,
  onProgress: (downloaded: number, total?: number) => void
): Promise<CachedAsset> => {
  if (typeof fetch === "undefined") {
    throw new Error("Installation requires a browser environment");
  }

  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`Failed to download ${asset.url} (${response.status})`);
  }

  const contentType = response.headers.get("Content-Type") ?? undefined;
  const headerLength = response.headers.get("Content-Length");
  const declaredLength =
    asset.bytes ?? (headerLength ? Number(headerLength) : undefined);
  const reader = response.body?.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
        onProgress(received, declaredLength);
      }
    }
  } else {
    const buffer = new Uint8Array(await response.arrayBuffer());
    chunks.push(buffer);
    received = buffer.byteLength;
    onProgress(received, declaredLength);
  }

  const blob = new Blob(chunks, { type: contentType });
  const cacheKey = asset.cacheKey ?? asset.url;
  await putInCache(cacheKey, blob, contentType);

  return {
    url: asset.url,
    cacheKey: normalizeCacheKey(cacheKey),
    bytes: blob.size,
    storedAt: Date.now(),
    kind: asset.kind,
  };
};

export const useAppInstallationStore = create<AppInstallationState>()(
  persist(
    (set, get) => ({
      installed: {},
      progress: {},
      queue: [],
      installApp: async ({ appId, manifest }: InstallOptions) => {
        if (get().installed[appId]) {
          return;
        }

        const assets = manifest?.assets ?? [];
        const totalAssets = assets.length;
        const hintedBytes = manifest?.sizeEstimate;
        const summedBytes = assets.reduce(
          (sum, asset) => sum + (asset.bytes ?? 0),
          0
        );
        const totalBytes =
          hintedBytes ?? (summedBytes > 0 ? summedBytes : undefined);

        const baseProgress: InstallProgress = {
          status: "installing",
          percent: totalAssets === 0 ? 100 : 0,
          downloadedBytes: 0,
          totalBytes,
          currentAssetIndex: totalAssets === 0 ? 0 : 1,
          totalAssets,
        };

        set(state => ({
          progress: { ...state.progress, [appId]: baseProgress },
          queue: state.queue.includes(appId)
            ? state.queue
            : [...state.queue, appId],
        }));

        if (totalAssets === 0) {
          set(state => ({
            installed: {
              ...state.installed,
              [appId]: {
                id: appId,
                installedAt: Date.now(),
                assets: [],
              },
            },
            progress: {
              ...state.progress,
              [appId]: {
                ...baseProgress,
                status: "completed",
                percent: 100,
              },
            },
            queue: state.queue.filter(id => id !== appId),
          }));
          return;
        }

        const cachedAssets: CachedAsset[] = [];
        let completedBytes = 0;

        const updateProgress = (patch: Partial<InstallProgress>) => {
          set(state => {
            const prev = state.progress[appId] ?? baseProgress;
            return {
              ...state,
              progress: {
                ...state.progress,
                [appId]: { ...prev, ...patch },
              },
            };
          });
        };

        try {
          for (let index = 0; index < assets.length; index += 1) {
            const asset = assets[index];
            updateProgress({
              status: "installing",
              currentAssetIndex: index,
            });

            const assetRecord = await downloadAndCacheAsset(
              asset,
              (downloaded, assetTotal) => {
                const localFraction = assetTotal
                  ? Math.min(downloaded / assetTotal, 1)
                  : asset.bytes
                  ? Math.min(downloaded / asset.bytes, 1)
                  : 0;
                const aggregate =
                  (index + localFraction) / Math.max(assets.length, 1);
                updateProgress({
                  percent: Math.min(100, aggregate * 100),
                  downloadedBytes: completedBytes + downloaded,
                });
              }
            );

            cachedAssets.push(assetRecord);
            completedBytes += assetRecord.bytes;
            updateProgress({
              percent: Math.min(
                100,
                ((index + 1) / Math.max(assets.length, 1)) * 100
              ),
              downloadedBytes: completedBytes,
            });
          }

          updateProgress({ status: "finalizing" });

          set(state => ({
            installed: {
              ...state.installed,
              [appId]: {
                id: appId,
                installedAt: Date.now(),
                assets: cachedAssets,
              },
            },
            progress: {
              ...state.progress,
              [appId]: {
                ...(state.progress[appId] ?? baseProgress),
                status: "completed",
                percent: 100,
                downloadedBytes: completedBytes,
                totalBytes: totalBytes ?? completedBytes,
                currentAssetIndex: Math.max(assets.length - 1, 0),
              },
            },
            queue: state.queue.filter(id => id !== appId),
          }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Installation failed";
          updateProgress({ status: "failed", error: message });
          set(state => ({
            queue: state.queue.filter(id => id !== appId),
          }));
          throw error;
        }
      },
      resetProgress: (appId: string) => {
        set(state => {
          const { [appId]: _omit, ...rest } = state.progress;
          return { ...state, progress: rest };
        });
      },
      uninstallApp: async (appId: string) => {
        const record = get().installed[appId];
        if (!record) return;

        set(state => {
          const { [appId]: _installed, ...restInstalled } = state.installed;
          const { [appId]: _progress, ...restProgress } = state.progress;
          return {
            ...state,
            installed: restInstalled,
            progress: restProgress,
            queue: state.queue.filter(id => id !== appId),
          };
        });

        await Promise.all(
          record.assets.map(asset => removeFromCache(asset.cacheKey))
        );
      },
    }),
    {
      name: "app-installation-store",
      partialize: state => ({ installed: state.installed }),
    }
  )
);
