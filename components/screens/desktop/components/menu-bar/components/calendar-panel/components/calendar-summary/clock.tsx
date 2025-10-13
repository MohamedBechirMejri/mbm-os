import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Counter from "@/components/ui/counter";
import { cn } from "@/lib/utils";

const TICK_COUNT = 60;

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

function calculateOpacity(tickProgress: number, currentSecond: number): number {
  const currentProgress = (currentSecond % TICK_COUNT) / TICK_COUNT;

  // Wrap distance on the unit circle so the highlight glides smoothly past 0 → 1.
  let distance = Math.abs(tickProgress - currentProgress);
  distance = Math.min(distance, 1 - distance);

  // Soft falloff tuned to feel glassy rather than "snake"-like.
  const glowRadius = 0.12;
  const normalized = Math.max(0, 1 - distance / glowRadius);
  const smootherstep = normalized * normalized * (3 - 2 * normalized);

  const baseOpacity = 0.18;
  const peakOpacity = 1;

  return baseOpacity + (peakOpacity - baseOpacity) * smootherstep;
}

function Tick({
  tick,
  index,
  fractionalSeconds,
}: {
  tick: { x: number; y: number; rotation: number; progress: number };
  index: number;
  fractionalSeconds: number;
}) {
  const opacity =
    index < fractionalSeconds - 1
      ? 1
      : calculateOpacity(tick.progress, fractionalSeconds);

  return (
    <motion.span
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

  // Update fractional seconds continuously for smooth animation
  useEffect(() => {
    let rafId: number;

    const updateFractionalSeconds = () => {
      const now = Date.now();
      const fractional = (now / 1000) % 60;
      setFractionalSeconds(fractional);
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
            fractionalSeconds={fractionalSeconds}
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
