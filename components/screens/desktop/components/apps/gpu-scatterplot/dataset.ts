import type { ScatterDataset } from "./types";

/**
 * Generate a synthetic scatterplot dataset for testing
 */
export function generateSyntheticDataset(
  pointCount: number,
  options?: {
    name?: string;
    clusters?: number;
    noise?: number;
  },
): ScatterDataset {
  const clusters = options?.clusters ?? 5;
  const noise = options?.noise ?? 0.3;
  const points: ScatterDataset["points"] = new Array(pointCount);

  // Generate cluster centers
  const centers = Array.from({ length: clusters }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    category: i,
  }));

  // Pre-allocate bounds
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  // Generate points around clusters - optimized loop
  for (let i = 0; i < pointCount; i++) {
    const cluster = centers[i % clusters];
    if (!cluster) continue;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + Math.random() * noise * 5;

    const x = cluster.x + Math.cos(angle) * radius;
    const y = cluster.y + Math.sin(angle) * radius;

    points[i] = {
      x,
      y,
      category: cluster.category,
    };

    // Update bounds inline
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return {
    points,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
    },
    name: options?.name ?? `Synthetic (${pointCount.toLocaleString()} points)`,
    pointCount,
  };
}
