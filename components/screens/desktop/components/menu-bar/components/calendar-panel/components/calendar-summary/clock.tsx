import { cn } from "@/lib/utils";

const TICK_COUNT = 60;

export default function ClockWidget({
  formattedTime,
  timeZone,
  seconds,
}: {
  formattedTime: string;
  timeZone: string;
  seconds: number;
}) {
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
