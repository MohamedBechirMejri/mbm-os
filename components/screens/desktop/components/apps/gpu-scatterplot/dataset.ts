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
  const points: ScatterDataset["points"] = [];

  // Generate cluster centers
  const centers = Array.from({ length: clusters }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    category: i,
  }));

  // Generate points around clusters
  for (let i = 0; i < pointCount; i++) {
    const cluster = centers[i % clusters];
    if (!cluster) continue;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + Math.random() * noise * 5;

    points.push({
      x: cluster.x + Math.cos(angle) * radius,
      y: cluster.y + Math.sin(angle) * radius,
      category: cluster.category,
    });
  }

  // Calculate bounds
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    points,
    bounds: {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    },
    name: options?.name ?? `Synthetic (${pointCount.toLocaleString()} points)`,
    pointCount,
  };
}
