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
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start justify-between gap-4">
      <div className="bg-[#F4F4F4] rounded-4xl px-8 py-4 flex flex-col items-center shadow-xl">
        <p className="capitalize gap-1 flex font-bold items-center text-2xl">
          <span className="text-rose-500">{dayLabel.slice(0, 3)}</span>
          <span className="text-gray-500">{monthLabel.slice(0, 3)}</span>
        </p>
        <h1 className="text-8xl leading-none font-semibold -mt-1">
          {dayNumber}
        </h1>
      </div>
      <div className="flex flex-col items-end gap-3 bg-[#F4F4F4] w-full h-full p-4 rounded-4xl shadow-xl">
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
