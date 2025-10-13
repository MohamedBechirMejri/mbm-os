import ClockWidget from "./clock";
import DateWidget from "./date";

type CalendarSummaryProps = {
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
  referenceDate: Date;
  timeZone: string;
  seconds: number;
  openWindowCount: number;
  onAdjustMonth: (delta: number) => void;
};

export function CalendarSummary({
  dayLabel,
  dayNumber,
  monthLabel,
  referenceDate,
  timeZone,
  seconds,
}: CalendarSummaryProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start justify-between gap-4 select-none">
      <DateWidget
        dayLabel={dayLabel}
        dayNumber={dayNumber}
        monthLabel={monthLabel}
      />
      <ClockWidget
        referenceDate={referenceDate}
        timeZone={timeZone}
        seconds={seconds}
      />
    </div>
  );
}
