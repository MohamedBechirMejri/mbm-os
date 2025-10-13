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
        <p className="text-xs uppercase tracking-[0.22rem]">{dayLabel}</p>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-5xl font-semibold leading-none">
            {dayNumber}
          </span>
          <span className="text-lg">{monthLabel}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAdjustMonth(-1)}
            className="p-0 h-max"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAdjustMonth(1)}
            className="p-0 h-max"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <p className="flex flex-col items-end">
          <span className="font-semibold text-2xl">{formattedTime}</span>
          <span className="text-xs"> {timeZone}</span>
        </p>
      </div>
    </div>
  );
}
