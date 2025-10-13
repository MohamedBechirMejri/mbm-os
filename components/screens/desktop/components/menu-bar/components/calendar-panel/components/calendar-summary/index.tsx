import ClockWidget from "./clock";
import DateWidget from "./date";

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
}: CalendarSummaryProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start justify-between gap-4">
      <DateWidget
        dayLabel={dayLabel}
        dayNumber={dayNumber}
        monthLabel={monthLabel}
      />
      <ClockWidget formattedTime={formattedTime} timeZone={timeZone} />
    </div>
  );
}
