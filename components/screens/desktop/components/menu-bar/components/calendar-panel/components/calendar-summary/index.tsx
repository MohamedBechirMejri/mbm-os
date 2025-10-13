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
      <div className="flex flex-col items-end gap-3 bg-[#F4F4F4] w-full h-full p-4 rounded-4xl shadow-xl">
        <p className="flex flex-col items-end">
          <span className="font-semibold text-2xl">{formattedTime}</span>
          <span className="text-xs"> {timeZone}</span>
        </p>
      </div>
    </div>
  );
}
