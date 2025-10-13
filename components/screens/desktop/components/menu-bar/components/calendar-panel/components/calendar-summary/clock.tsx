import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

function calculateOpacity(tickIndex: number, currentSecond: number): number {
  // Calculate distance considering wrapping
  let distance = tickIndex - currentSecond;
  if (distance > TICK_COUNT / 2) distance -= TICK_COUNT;
  if (distance < -TICK_COUNT / 2) distance += TICK_COUNT;

  // Future ticks (not yet reached)
  if (distance > 0) return 0.2;

  // Current and near-past ticks with gradient
  const gradientRange = 2;
  if (distance >= -gradientRange) {
    // Smooth interpolation from 1.0 (current) to 0.5 (edge of gradient)
    const progress = Math.abs(distance) / gradientRange;
    return 1 - progress * 0.5; // 1.0 → 0.5
  }

  // Past ticks
  return 0.5;
}

function Tick({
  tick,
  index,
  seconds,
}: {
  tick: { x: number; y: number; rotation: number; progress: number };
  index: number;
  seconds: number;
}) {
  const targetOpacity = calculateOpacity(index, seconds);
  const opacity = useMotionValue(targetOpacity);
  const smoothOpacity = useSpring(opacity, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  // Update target opacity when seconds change
  opacity.set(targetOpacity);

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
        opacity: smoothOpacity,
      }}
    />
  );
}

export default function ClockWidget({
  formattedTime,
  timeZone,
  seconds,
}: {
  formattedTime: string;
  timeZone: string;
  seconds: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  const ticks =
    dimensions.width > 0
      ? generateTicks({ width: dimensions.width, height: dimensions.height })
      : [];

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
            seconds={seconds}
          />
        ))}
      </div>
      <p className="flex flex-col items-center">
        <span className="text-5xl font-semibold tracking-tight">
          {formattedTime}
        </span>
        <span className="text-sm text-black/60">{timeZone}</span>
      </p>
    </div>
  );
}
