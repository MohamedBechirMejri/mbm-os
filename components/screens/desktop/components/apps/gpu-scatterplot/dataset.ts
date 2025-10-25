import type { ScatterDataset, ScatterPoint } from "./types";

const POINTS_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type DatasetCore = {
  points: ScatterPoint[];
  bounds: ScatterDataset["bounds"];
};

type DatasetCoreGenerator = (pointCount: number) => DatasetCore;

interface DatasetPresetDefinition {
  id: string;
  name: string;
  headline: string;
  description: string;
  tags: string[];
  recommendedRamp: string;
  stats: (pointCount: number) => Array<{ label: string; value: string }>;
  generator: DatasetCoreGenerator;
}

export type DatasetPreset = Omit<DatasetPresetDefinition, "generator">;

const PRESETS: DatasetPresetDefinition[] = [
  {
    id: "singularity-atlas",
    name: "Singularity Atlas",
    headline: "Galactic density field rendered in real time",
    description:
      "Spiral arms warp around a simulated black hole; every point is GPU-projected on the fly to spotlight compute-friendly rendering paths.",
    tags: ["astrophysics", "webgpu", "procedural"],
    recommendedRamp: "plasma",
    stats: (pointCount) => [
      { label: "points", value: formatPoints(pointCount) },
      { label: "arms", value: "5 spiral vectors" },
      { label: "twist", value: "1.3x curvature" },
    ],
    generator: generateGalaxyCore,
  },
  {
    id: "neural-overdrive",
    name: "Neural Overdrive",
    headline: "Synaptic activation topology streaming from the GPU",
    description:
      "Nested Lissajous orbits mimic a neural net under peak load, ideal for dashboards that need to impress machine intelligence teams.",
    tags: ["graph-intelligence", "signal-processing", "lissajous"],
    recommendedRamp: "viridis",
    stats: (pointCount) => [
      { label: "points", value: formatPoints(pointCount) },
      { label: "layers", value: "4 activation bands" },
      { label: "orbit", value: "14-phase loop" },
    ],
    generator: generateNeuralCore,
  },
  {
    id: "liquidity-stress",
    name: "Liquidity Stress Test",
    headline: "Volatility swarms keyed to synthetic market shocks",
    description:
      "Temporal slices collapse into a heatfield, revealing stress propagation during simulated flash crashes for quant storytelling.",
    tags: ["quant-finance", "stress-testing", "anomaly"],
    recommendedRamp: "cool-warm",
    stats: (pointCount) => [
      { label: "points", value: formatPoints(pointCount) },
      { label: "events", value: "4 shock pulses" },
      { label: "volatility", value: "up to 180 percent" },
    ],
    generator: generateMarketCore,
  },
];

export const DATASET_PRESETS: DatasetPreset[] = PRESETS.map(
  ({ generator, ...rest }) => rest,
);

export const DEFAULT_PRESET_ID = PRESETS[0]?.id ?? "singularity-atlas";

export function generatePresetDataset(
  presetId: string,
  pointCount: number,
): ScatterDataset {
  const preset =
    PRESETS.find((candidate) => candidate.id === presetId) ?? PRESETS[0];

  if (!preset) {
    return generateSyntheticDataset(pointCount, {
      name: `Synthetic (${pointCount.toLocaleString()} pts)`,
    });
  }

  const core = preset.generator(pointCount);

  return {
    points: core.points,
    bounds: core.bounds,
    pointCount,
    name: `${preset.name} · ${pointCount.toLocaleString()} pts`,
    meta: {
      presetId: preset.id,
      headline: preset.headline,
      description: preset.description,
      tags: preset.tags,
      stats: preset.stats(pointCount),
    },
  };
}

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
  const points: ScatterPoint[] = new Array(pointCount);
  const bounds = createEmptyBounds();

  const centers = Array.from({ length: clusters }, (_, index) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    category: index,
  }));

  for (let i = 0; i < pointCount; i++) {
    const cluster = centers[i % clusters];
    if (!cluster) continue;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10 + Math.random() * noise * 5;

    const x = cluster.x + Math.cos(angle) * radius;
    const y = cluster.y + Math.sin(angle) * radius;

    const categoryBase = clusters > 1 ? cluster.category / (clusters - 1) : 0;
    const categoryJitter = (Math.random() - 0.5) * noise * 0.2;
    const category = clamp01(categoryBase + categoryJitter);

    points[i] = { x, y, category };
    updateBounds(bounds, x, y);
  }

  return {
    points,
    bounds: finalizeBounds(bounds),
    name: options?.name ?? `Synthetic (${pointCount.toLocaleString()} points)`,
    pointCount,
  };
}

export function formatPoints(pointCount: number): string {
  return POINTS_FORMATTER.format(pointCount);
}

function generateGalaxyCore(pointCount: number): DatasetCore {
  const random = createRandom(1_337);
  const points: ScatterPoint[] = new Array(pointCount);
  const bounds = createEmptyBounds();

  const arms = 5;
  const radiusMax = 220;
  const twist = 1.3;
  const armSpread = 0.45;

  for (let i = 0; i < pointCount; i++) {
    const radiusFactor = random();
    const armIndex = Math.floor(random() * arms);
    const baseRadius = radiusFactor ** 0.4 * radiusMax;
    const armAngle = (armIndex / arms) * Math.PI * 2;
    const wobble = (random() - 0.5) * armSpread * baseRadius;
    const angle = baseRadius * twist + armAngle + wobble / radiusMax;

    const x = Math.cos(angle) * (baseRadius + wobble) + (random() - 0.5) * 14;
    const y =
      Math.sin(angle) * (baseRadius + wobble * 0.7) + (random() - 0.5) * 10;

    const radialGradient = (baseRadius / radiusMax) ** 0.75;
    const category = clamp01(
      (armIndex / Math.max(arms - 1, 1)) * 0.65 + radialGradient * 0.35,
    );

    points[i] = { x, y, category };
    updateBounds(bounds, x, y);
  }

  return { points, bounds: finalizeBounds(bounds) };
}

function generateNeuralCore(pointCount: number): DatasetCore {
  const random = createRandom(4_580);
  const points: ScatterPoint[] = new Array(pointCount);
  const bounds = createEmptyBounds();

  const layers = 4;

  for (let i = 0; i < pointCount; i++) {
    const t = i / pointCount;
    const layer = Math.floor(t * layers);
    const layerRatio = layer / Math.max(layers - 1, 1);
    const phaseA = t * Math.PI * (6 + layer * 1.8);
    const phaseB = t * Math.PI * 14;

    const radial = 110 + Math.sin(phaseA * 0.5) * 40 + layer * 18;
    const x = Math.sin(phaseB) * radial + (random() - 0.5) * (12 + layer * 3);
    const y =
      Math.cos(phaseA) * (70 - layer * 8) +
      Math.sin(phaseB * 0.7) * 42 +
      (random() - 0.5) * 14;

    const innerPulse = Math.abs(Math.sin(phaseA * 0.9));
    const category = clamp01(layerRatio * 0.65 + innerPulse * 0.35);

    points[i] = { x, y, category };
    updateBounds(bounds, x, y);
  }

  return { points, bounds: finalizeBounds(bounds) };
}

function generateMarketCore(pointCount: number): DatasetCore {
  const random = createRandom(9_003);
  const points: ScatterPoint[] = new Array(pointCount);
  const bounds = createEmptyBounds();

  const events = [
    { center: 0.18, strength: 68, width: 0.035 },
    { center: 0.42, strength: -92, width: 0.05 },
    { center: 0.66, strength: 105, width: 0.045 },
    { center: 0.86, strength: -60, width: 0.03 },
  ];

  for (let i = 0; i < pointCount; i++) {
    const progress = i / pointCount;
    const x = (progress - 0.5) * 320;

    const macroTrend =
      Math.sin(progress * Math.PI * 2.4) * 60 +
      Math.cos(progress * Math.PI * 0.9) * 35 +
      progress * 90 -
      45;

    let shock = 0;
    for (const event of events) {
      const dist = progress - event.center;
      const gaussian = Math.exp(
        -((dist * dist) / (2 * event.width * event.width)),
      );
      shock += event.strength * gaussian;
    }

    const oscillation =
      Math.sin(progress * Math.PI * 24) * 18 +
      Math.sin(progress * Math.PI * 52) * 6;

    const noiseAmplitude = 8 + Math.abs(oscillation) * 0.35;
    const noise = (random() - 0.5) * noiseAmplitude;

    const y = macroTrend + shock + oscillation + noise;

    const volatility = Math.min(
      1,
      (Math.abs(shock) / 110 + Math.abs(noise) / 24) * 0.8,
    );

    const category = clamp01(0.2 + volatility + progress * 0.25);

    points[i] = { x, y, category };
    updateBounds(bounds, x, y);
  }

  return { points, bounds: finalizeBounds(bounds) };
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createEmptyBounds(): ScatterDataset["bounds"] {
  return {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };
}

function updateBounds(
  bounds: ScatterDataset["bounds"],
  x: number,
  y: number,
): void {
  if (x < bounds.minX) bounds.minX = x;
  if (x > bounds.maxX) bounds.maxX = x;
  if (y < bounds.minY) bounds.minY = y;
  if (y > bounds.maxY) bounds.maxY = y;
}

function finalizeBounds(
  bounds: ScatterDataset["bounds"],
): ScatterDataset["bounds"] {
  if (
    !Number.isFinite(bounds.minX) ||
    !Number.isFinite(bounds.maxX) ||
    !Number.isFinite(bounds.minY) ||
    !Number.isFinite(bounds.maxY)
  ) {
    return {
      minX: -100,
      maxX: 100,
      minY: -100,
      maxY: 100,
    };
  }
  return bounds;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
