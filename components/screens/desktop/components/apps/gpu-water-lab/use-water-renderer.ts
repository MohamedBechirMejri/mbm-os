import { useCallback, useEffect, useRef, useState } from "react";
import type { RendererStats, SimulationBounds, WaterConfig } from "./types";
import { WaterRenderer } from "./water-renderer";

export function useWaterRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: WaterConfig,
  bounds: SimulationBounds,
) {
  const rendererRef = useRef<WaterRenderer | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RendererStats>({
    fps: 0,
    frameTime: 0,
    computeTime: 0,
    renderTime: 0,
  });
  const initialConfigRef = useRef(config);
  const initialBoundsRef = useRef(bounds);

  useEffect(() => {
    initialConfigRef.current = config;
  }, [config]);

  useEffect(() => {
    initialBoundsRef.current = bounds;
  }, [bounds]);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;
    let statsInterval: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      try {
        const renderer = new WaterRenderer(
          initialConfigRef.current,
          initialBoundsRef.current,
        );
        await renderer.init(canvas);

        if (!mounted) {
          renderer.destroy();
          return;
        }

        rendererRef.current = renderer;
        renderer.start();
        setInitialized(true);
        setError(null);

        // Update stats periodically
        statsInterval = setInterval(() => {
          if (rendererRef.current) {
            setStats(rendererRef.current.getStats());
          }
        }, 100);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize");
          setInitialized(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (statsInterval) {
        clearInterval(statsInterval);
      }
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [canvasRef]);

  // Update config
  useEffect(() => {
    if (rendererRef.current && initialized) {
      rendererRef.current.updateConfig(config);
    }
  }, [config, initialized]);

  // Update bounds
  useEffect(() => {
    if (rendererRef.current && initialized) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = bounds.width;
        canvas.height = bounds.height;
      }
      rendererRef.current.updateBounds(bounds);
    }
  }, [bounds, initialized, canvasRef]);

  const setMousePosition = useCallback(
    (x: number, y: number, active: boolean) => {
      rendererRef.current?.setMousePosition(x, y, active);
    },
    [],
  );

  return {
    initialized,
    error,
    stats,
    setMousePosition,
  };
}
