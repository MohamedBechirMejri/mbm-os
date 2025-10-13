import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarSummaryProps = {
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
  formattedTime: string;
  timeZone: string;
  openWindowCount: number;
  onAdjustMonth: (delta: number) => void;
};

export function CalendarSummary({
  dayLabel,
  dayNumber,
  monthLabel,
  formattedTime,
  timeZone,
  openWindowCount,
  onAdjustMonth,
}: CalendarSummaryProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22rem] text-white/60">
          {dayLabel}
        </p>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-5xl font-semibold leading-none">
            {dayNumber}
          </span>
          <span className="text-lg text-white/70">{monthLabel}</span>
        </div>
        <p className="mt-3 text-xs text-white/60">
          {formattedTime} • {timeZone}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAdjustMonth(-1)}
            className="rounded-2xl border border-white/15 bg-white/10 text-white/70 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAdjustMonth(1)}
            className="rounded-2xl border border-white/15 bg-white/10 text-white/70 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-1 text-xs text-white/70">
          {openWindowCount} window{openWindowCount === 1 ? "" : "s"} open
        </span>
      </div>
    </div>
  );
}
