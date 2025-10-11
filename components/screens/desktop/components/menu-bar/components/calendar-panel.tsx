"use client";

import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Droplets,
  Sunrise,
  Wind,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type CalendarPanelProps = {
  referenceDate: Date;
};

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type QuickEvent = {
  id: string;
  timeLabel: string;
  description: string;
};

type WeatherPoint = {
  time: string;
  temperature: number;
};

type ActivitySlice = {
  id: string;
  label: string;
  duration: string;
  percentage: number;
  color: string;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const QUICK_EVENTS: QuickEvent[] = [
  {
    id: "standup",
    timeLabel: "09:30",
    description: "Design leadership sync",
  },
  {
    id: "ship",
    timeLabel: "13:00",
    description: "Ship Tahoe wallpapers",
  },
  {
    id: "coffee",
    timeLabel: "16:30",
    description: "Golden hour espresso",
  },
];

const WEATHER_POINTS: WeatherPoint[] = [
  { time: "6 PM", temperature: 24 },
  { time: "7 PM", temperature: 23 },
  { time: "8 PM", temperature: 22 },
  { time: "9 PM", temperature: 21 },
];

const ACTIVITY_BREAKDOWN: ActivitySlice[] = [
  {
    id: "productivity",
    label: "Productivity & Finance",
    duration: "5h 20m",
    percentage: 62,
    color: "from-sky-400/85 to-sky-500/60",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    duration: "1h 40m",
    percentage: 19,
    color: "from-purple-400/85 to-fuchsia-500/60",
  },
  {
    id: "other",
    label: "Other",
    duration: "54m",
    percentage: 12,
    color: "from-white/60 to-white/20",
  },
];

const tileBase =
  "relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.12)_45%,rgba(92,139,255,0.08)_100%)] p-5 shadow-[0_1.25rem_2.75rem_rgba(15,23,42,0.36)] backdrop-blur-3xl";

function buildCalendar(date: Date, referenceDate: Date): CalendarCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const cellDate = new Date(year, month, dayNumber);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday =
      cellDate.getFullYear() === referenceDate.getFullYear() &&
      cellDate.getMonth() === referenceDate.getMonth() &&
      cellDate.getDate() === referenceDate.getDate();

    return {
      date: cellDate,
      isCurrentMonth,
      isToday,
    };
  });
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function GlassTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(tileBase, className)}>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" />
      <div className="pointer-events-none absolute -top-16 left-6 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CalendarPanel({ referenceDate }: CalendarPanelProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const visibleMonth = useMemo(() => {
    const base = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    );

    base.setMonth(base.getMonth() + monthOffset);
    return base;
  }, [referenceDate, monthOffset]);

  const cells = useMemo(
    () => buildCalendar(visibleMonth, referenceDate),
    [visibleMonth, referenceDate],
  );
  const dayNumber = referenceDate.getDate();
  const dayLabel = referenceDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const monthLabel = referenceDate.toLocaleDateString("en-US", {
    month: "long",
  });

  return (
    <section className="w-[26rem] space-y-4 text-white">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-white/60">Today at a glance</p>
        <button
          type="button"
          className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/20"
          onClick={() => setMonthOffset(0)}
        >
          Jump to today
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
        <GlassTile className="flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {dayLabel}
            </p>
            <p className="mt-2 text-[3.25rem] font-semibold leading-none">
              {dayNumber}
            </p>
            <p className="mt-2 text-lg text-white/70">
              {monthLabel} • {referenceDate.getFullYear()}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <CloudSun className="size-4" />
              Mostly cloudy, 25°
            </div>
            <div className="flex items-center gap-2">
              <Sunrise className="size-4" />
              Sunset 5:48 PM
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="size-4" />
              Humidity 62%
            </div>
            <div className="flex items-center gap-2">
              <Wind className="size-4" />
              Breeze 9 km/h
            </div>
          </div>
        </GlassTile>

        <GlassTile className="p-0">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-sm font-semibold leading-tight">
                {getMonthLabel(visibleMonth)}
              </p>
              <p className="text-xs text-white/60">Mini calendar</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white/70 transition-colors hover:bg-white/20"
                onClick={() => setMonthOffset((offset) => offset - 1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white/70 transition-colors hover:bg-white/20"
                onClick={() => setMonthOffset((offset) => offset + 1)}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="grid grid-cols-7 gap-y-2 text-center text-[0.75rem] text-white/60">
              {DAY_LABELS.map((label) => (
                <span
                  key={label}
                  className="font-medium uppercase tracking-wide"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-sm">
              {cells.map((cell) => {
                const dayValue = cell.date.getDate();
                const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${dayValue}`;

                return (
                  <span
                    key={key}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                      cell.isToday &&
                        "bg-white text-slate-950 shadow-[0_0.6rem_1.6rem_rgba(255,255,255,0.55)]",
                      !cell.isToday && cell.isCurrentMonth
                        ? "text-white/80 hover:bg-white/16"
                        : "text-white/30",
                    )}
                  >
                    {dayValue}
                  </span>
                );
              })}
            </div>
          </div>
        </GlassTile>
      </div>

      <GlassTile>
        <div className="flex items-center justify-between text-sm font-semibold text-white/80">
          <span>Hourly outlook</span>
          <span className="text-xs text-white/60">Feels like 24°</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 text-center text-sm text-white/70">
          {WEATHER_POINTS.map((point) => (
            <div key={point.time} className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-white/60">{point.time}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-base font-semibold">
                <CloudSun className="size-4" />
                {point.temperature}°
              </div>
            </div>
          ))}
        </div>
      </GlassTile>

      <GlassTile>
        <div className="flex items-center justify-between text-sm font-semibold text-white/80">
          <span>Up next</span>
          <span className="text-xs text-white/60">Auto-sync with Calendar</span>
        </div>
        <ul className="mt-4 space-y-2">
          {QUICK_EVENTS.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm"
            >
              <span className="font-medium text-white/75">
                {event.description}
              </span>
              <span className="text-xs text-white/60">{event.timeLabel}</span>
            </li>
          ))}
        </ul>
      </GlassTile>

      <GlassTile>
        <div className="flex items-center justify-between text-sm font-semibold text-white/80">
          <div className="flex items-center gap-2">
            <BarChart2 className="size-4" />
            Screen time
          </div>
          <span className="text-xs text-white/60">16h 58m today</span>
        </div>
        <div className="mt-4 space-y-3">
          {ACTIVITY_BREAKDOWN.map((slice) => (
            <div key={slice.id}>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{slice.label}</span>
                <span>{slice.duration}</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/12">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    slice.color,
                  )}
                  style={{ width: `${slice.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassTile>
    </section>
  );
}
