import { cn } from "@/lib/utils";

const TICK_COUNT = 60;

/**

we need to display ticks around the border of the container and not as a circle.

we have to divide the container into 6 segments, each segment will have 10 ticks.

we start from top-center and go clockwise.

we have to calculate the width and height of the container to position the ticks correctly.

we can use absolute positioning to position the ticks.

we can use transform to rotate the ticks.

we can use a loop to create the ticks.

psuedo code:

for i in range(0, 60):
  angle = (i / 60) * 360
  x = centerX + radius * cos(angle)
  y = centerY + radius * sin(angle)
  create tick at (x, y) with rotation angle

 */

function generateTicks({ width, height }) {
  const length = (width + height) * 2;
  const tickSpacing = length / TICK_COUNT;

  // Define the segments of the rectangle
  const segments = {
    top_center: [width / 2, 0],
    top_right: [width, 0],
    bottom_right: [width, height],
    bottom_center: [width / 2, height],
    bottom_left: [0, height],
    top_left: [0, 0],
  };

  const ticks = [];

  for (let i = 0; i < TICK_COUNT; i++) {
    const progress = i / TICK_COUNT;
    const distance = i * tickSpacing;

    let x, y;

    if (distance <= width / 2) {
      // Top center to top right
      x = segments.top_center[0] + distance;
      y = segments.top_center[1];
    } else if (distance <= width + height / 2) {
      // Top right to bottom right
      x = segments.top_right[0];
      y = segments.top_right[1] + (distance - width / 2);
    } else if (distance <= width + height + width / 2) {
      // Bottom right to bottom center
      x = segments.bottom_right[0] - (distance - (width + height / 2));
      y = segments.bottom_right[1];
    } else if (distance <= width * 2 + height) {
      // Bottom center to bottom left
      x = segments.bottom_center[0] - (distance - (width + height + width / 2));
      y = segments.bottom_center[1];
    } else if (distance <= width * 2 + height + height / 2) {
      // Bottom left to top left
      x = segments.bottom_left[0];
      y = segments.bottom_left[1] - (distance - (width * 2 + height));
    } else {
      // Top left to top center
      x = segments.top_left[0] + (distance - (width * 2 + height + height / 2));
      y = segments.top_left[1];
    }

    ticks.push({ x, y, progress });
  }

  return ticks;
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
  const ticks = generateTicks({ width: 200, height: 200 });
  console.log(ticks);

  return (
    <div className="relative z-20 flex h-full w-full flex-col items-end gap-3 rounded-4xl bg-[#F4F4F4] p-4 shadow-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-20 rounded-[2.5rem]"
      >
        {Array.from({ length: TICK_COUNT }, (_, index) => {
          const isActive = index <= seconds;
          const progress = index / TICK_COUNT;
          const tickId = `tick-${progress.toFixed(4)}`;

          return (
            <div
              key={tickId}
              className="absolute inset-0"
              style={{
                transform: `rotate(${progress * 360}deg)`,
              }}
            >
              <span
                className={cn(
                  "absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 rounded-full transition-colors duration-150",
                  isActive ? "bg-zinc-900" : "bg-zinc-400/50",
                )}
              />
            </div>
          );
        })}
      </div>
      <p className="flex flex-col items-end">
        <span className="text-2xl font-semibold">{formattedTime}</span>
        <span className="text-xs">{timeZone}</span>
      </p>
    </div>
  );
}
