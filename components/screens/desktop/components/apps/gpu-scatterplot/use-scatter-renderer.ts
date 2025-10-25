"use client";

import { useEffect, useRef, useState } from "react";
import { ScatterRenderer } from "./scatter-renderer";
import type { RendererConfig, RendererStats, ScatterDataset } from "./types";

export function useScatterRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  config: RendererConfig,
  dataset: ScatterDataset | null,
) {
  const rendererRef = useRef<ScatterRenderer | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RendererStats>({
    fps: 0,
    frameTime: 0,
    pointsRendered: 0,
  });

  const frameCountRef = useRef(0);
  const lastStatsUpdateRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new ScatterRenderer();

    renderer
      .initialize(canvas)
      .then((success) => {
        if (success) {
          rendererRef.current = renderer;
          setInitialized(true);
          setError(null);
        } else {
          setError("Failed to initialize WebGPU renderer");
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Unknown initialization error",
        );
      });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      renderer.destroy();
      rendererRef.current = null;
      setInitialized(false);
    };
  }, [canvasRef]);

  // Update dataset
  useEffect(() => {
    if (!initialized || !rendererRef.current || !dataset) return;
    rendererRef.current.setDataset(dataset);
  }, [initialized, dataset]);

  // Update config
  useEffect(() => {
    if (!initialized || !rendererRef.current) return;
    rendererRef.current.updateConfig(config);
  }, [initialized, config]);

  // Render loop
  useEffect(() => {
    if (!initialized || !rendererRef.current) return;

    let frameStartTime = 0;

    const animate = (timestamp: number) => {
      if (!rendererRef.current) return;

      const frameTime = timestamp - frameStartTime;
      frameStartTime = timestamp;

      rendererRef.current.render();

      // Update stats every second
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastStatsUpdateRef.current >= 1000) {
        const elapsed = (now - lastStatsUpdateRef.current) / 1000;
        const fps = frameCountRef.current / elapsed;
        setStats({
          fps: Math.round(fps),
          frameTime: Math.round(frameTime * 100) / 100,
          pointsRendered: dataset?.pointCount ?? 0,
        });
        frameCountRef.current = 0;
        lastStatsUpdateRef.current = now;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [initialized, dataset?.pointCount]);

  // Handle canvas resize
  useEffect(() => {
    if (!initialized || !rendererRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !rendererRef.current) return;

      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      rendererRef.current.resize(canvas.width, canvas.height);
    });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [initialized, canvasRef]);

  return { initialized, error, stats };
}
