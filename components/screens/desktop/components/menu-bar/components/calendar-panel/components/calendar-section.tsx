import { cn } from "@/lib/utils";

import { DAY_LABELS } from "../constants";
import { type CalendarCell } from "../utils/calendar";

type CalendarSectionProps = {
  monthLabel: string;
  cells: CalendarCell[];
};

export function CalendarSection({ monthLabel, cells }: CalendarSectionProps) {
  return (
    <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
        <span>Calendar</span>
        <span>{monthLabel}</span>
      </header>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {DAY_LABELS.map((day) => (
          <span
            key={day.id}
            className="text-center text-xs font-semibold text-white/55"
          >
            {day.label}
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <span
            key={cell.date.toISOString()}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-2xl text-sm transition",
              cell.isToday
                ? "border border-white/45 bg-white/20 text-white shadow-[0_0.75rem_1.75rem_rgba(15,23,42,0.2)]"
                : "border border-white/10 bg-white/6 text-white/75",
              !cell.isCurrentMonth && "text-white/35",
            )}
          >
            {cell.date.getDate()}
          </span>
        ))}
      </div>
    </section>
  );
}
