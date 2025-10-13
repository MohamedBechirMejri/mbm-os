import { useEffect, useRef, useState } from "react";
import Counter from "@/components/ui/counter";
import { cn } from "@/lib/utils";

const TICK_COUNT = 60;
const BASE_OPACITY = 0.18;
const HIGHLIGHT_OPACITY = 1;
const NEXT_TICK_BLEND = 0; // fraction of highlight strength shared with the next tick
const RESET_FADE_DURATION = 0.045; // seconds spent fading the previous cycle

function generateTicks({ width, height }: { width: number; height: number }) {
  const ticks = [];
  const perimeter = (width + height) * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // Start from top center (offset by half of top edge)
  const startOffset = width / 2;

  for (let i = 0; i < TICK_COUNT; i++) {
    const distance = ((i / TICK_COUNT) * perimeter + startOffset) % perimeter;
    const progress = i / TICK_COUNT;

    let x: number, y: number;

    if (distance < width) {
      // Top edge: left to right
      x = distance;
      y = 0;
    } else if (distance < width + height) {
      // Right edge: top to bottom
      x = width;
      y = distance - width;
    } else if (distance < width * 2 + height) {
      // Bottom edge: right to left
      x = width - (distance - width - height);
      y = height;
    } else {
      // Left edge: bottom to top
      x = 0;
      y = height - (distance - width * 2 - height);
    }

    // Calculate angle from tick to center (pointing inward)
    const angleToCenter =
      Math.atan2(centerY - y, centerX - x) * (180 / Math.PI);
    const rotation = angleToCenter + 90; // +90 because the tick's default orientation is vertical

    ticks.push({ x, y, rotation, progress });
  }

  return ticks;
}

type HighlightState = {
  currentIndex: number;
  fractionWithinTick: number;
  fadeProgress: number | null;
  fadeFromIndex: number | null;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value: number): number {
  const clamped = clamp01(value);
  return 1 - (1 - clamped) ** 3;
}

function isIndexComplete(
  index: number,
  currentIndex: number,
  fadeFromIndex: number | null,
): boolean {
  if (fadeFromIndex === null) {
    return index < currentIndex;
  }

  if (fadeFromIndex >= currentIndex) {
    return index < currentIndex;
  }

  return index < currentIndex && index > fadeFromIndex;
}

function isInModuloRange(
  value: number,
  startExclusive: number,
  endInclusive: number,
): boolean {
  if (startExclusive === endInclusive) {
    return false;
  }

  if (startExclusive < endInclusive) {
    return value > startExclusive && value <= endInclusive;
  }

  return value > startExclusive || value <= endInclusive;
}

function getTickOpacity(index: number, state: HighlightState): number {
  const { currentIndex, fractionWithinTick, fadeProgress, fadeFromIndex } =
    state;
  const normalized = clamp01(fractionWithinTick);
  const nextIndex = (currentIndex + 1) % TICK_COUNT;

  if (isIndexComplete(index, currentIndex, fadeFromIndex)) {
    return HIGHLIGHT_OPACITY;
  }

  if (index === currentIndex) {
    return BASE_OPACITY + (HIGHLIGHT_OPACITY - BASE_OPACITY) * normalized;
  }

  const fadeOpacity =
    fadeFromIndex !== null &&
    fadeProgress !== null &&
    isInModuloRange(index, currentIndex, fadeFromIndex)
      ? BASE_OPACITY +
        (HIGHLIGHT_OPACITY - BASE_OPACITY) * easeOutCubic(1 - fadeProgress)
      : null;

  if (index === nextIndex) {
    const preview =
      BASE_OPACITY +
      (HIGHLIGHT_OPACITY - BASE_OPACITY) * normalized * NEXT_TICK_BLEND;

    if (fadeOpacity !== null) {
      return Math.min(preview, fadeOpacity);
    }

    return preview;
  }

  if (fadeOpacity !== null) {
    return fadeOpacity;
  }

  return BASE_OPACITY;
}

function Tick({
  tick,
  index,
  highlightState,
}: {
  tick: { x: number; y: number; rotation: number; progress: number };
  index: number;
  highlightState: HighlightState;
}) {
  const opacity = getTickOpacity(index, highlightState);

  return (
    <span
      className={cn(
        "absolute origin-center",
        index % 5 === 0
          ? "h-4 w-[0.1875rem] rounded-full"
          : "h-2 w-[0.125rem] rounded-full",
      )}
      style={{
        left: `${tick.x}px`,
        top: `${tick.y}px`,
        transform: `translate(-50%, -50%) rotate(${tick.rotation}deg)`,
        backgroundColor: "black",
        opacity,
        transition: "opacity 120ms ease-out",
      }}
    />
  );
}

export default function ClockWidget({
  referenceDate,
  timeZone,
  seconds,
}: {
  referenceDate: Date;
  timeZone: string;
  seconds: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fractionalSeconds, setFractionalSeconds] = useState(seconds);
  const secondsRef = useRef(seconds);
  const lastTickTsRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : 0,
  );
  const lastIndexRef = useRef<number>(seconds % TICK_COUNT);
  const fadeStartTsRef = useRef<number | null>(null);
  const fadeFromIndexRef = useRef<number | null>(null);
  const fadeProgressRef = useRef<number>(0);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    // Initial measurement
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    secondsRef.current = seconds;
    setFractionalSeconds(seconds);
    lastTickTsRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    lastIndexRef.current = seconds % TICK_COUNT;
    fadeStartTsRef.current = null;
    fadeFromIndexRef.current = null;
    fadeProgressRef.current = 0;
  }, [seconds]);

  // Update fractional seconds continuously for smooth animation tied to provided seconds
  useEffect(() => {
    let rafId: number;

    const updateFractionalSeconds = () => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsed = (now - lastTickTsRef.current) / 1000;
      const fractional =
        (secondsRef.current + elapsed + TICK_COUNT) % TICK_COUNT;

      setFractionalSeconds(fractional);

      if (fadeStartTsRef.current !== null) {
        const fadeElapsed = (now - fadeStartTsRef.current) / 1000;
        const progress = Math.min(1, fadeElapsed / RESET_FADE_DURATION);
        fadeProgressRef.current = progress;

        if (progress >= 1) {
          fadeStartTsRef.current = null;
          fadeFromIndexRef.current = null;
        }
      } else {
        fadeProgressRef.current = 0;
      }

      rafId = requestAnimationFrame(updateFractionalSeconds);
    };

    rafId = requestAnimationFrame(updateFractionalSeconds);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const ticks =
    dimensions.width > 0
      ? generateTicks({ width: dimensions.width, height: dimensions.height })
      : [];

  const minutes = referenceDate.getMinutes();
  const hours = referenceDate.getHours() % 12;
  const fractional =
    ((fractionalSeconds % TICK_COUNT) + TICK_COUNT) % TICK_COUNT;
  const currentIndex = Math.floor(fractional);
  const fractionWithinTick = fractional - currentIndex;
  const fadeFromIndex = fadeFromIndexRef.current;
  const fadeProgress = fadeFromIndex !== null ? fadeProgressRef.current : null;

  const highlightState: HighlightState = {
    currentIndex,
    fractionWithinTick,
    fadeFromIndex,
    fadeProgress,
  };

  useEffect(() => {
    const previous = lastIndexRef.current;

    if (currentIndex === previous) {
      return;
    }

    if (currentIndex < previous) {
      fadeFromIndexRef.current = previous;
      fadeStartTsRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      fadeProgressRef.current = 0;
    } else if (currentIndex - previous > 1) {
      fadeFromIndexRef.current = null;
      fadeStartTsRef.current = null;
      fadeProgressRef.current = 0;
    } else {
      fadeFromIndexRef.current = null;
      fadeStartTsRef.current = null;
      fadeProgressRef.current = 0;
    }

    lastIndexRef.current = currentIndex;
  }, [currentIndex]);

  return (
    <div className="relative z-20 flex h-full w-full items-center justify-center rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-20 rounded-[2.5rem]"
      >
        {ticks.map((tick, index) => (
          <Tick
            key={`${tick.x}-${tick.y}-${index}`}
            tick={tick}
            index={index}
            highlightState={highlightState}
          />
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="text-3xl font-semibold tracking-tight flex items-center">
          <Counter
            value={hours}
            places={[10, 1]}
            textColor="black"
            fontSize={64}
          />
          <span className=" text-black text-5xl">:</span>
          <Counter
            value={minutes}
            places={[10, 1]}
            textColor="black"
            fontSize={64}
          />
        </div>
        <span className="text-sm text-black/60">{timeZone}</span>
      </div>
    </div>
  );
}
