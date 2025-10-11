"use client";

import { ChevronLeft, ChevronRight, Clock3, Monitor } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  type AppMeta,
  DesktopAPI,
  useDesktop,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarPanelProps = {
  referenceDate: Date;
};

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const tileBase =
  "relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.12)_45%,rgba(92,139,255,0.08)_100%)] p-5 shadow-[0_1.25rem_2.75rem_rgba(15,23,42,0.36)] backdrop-blur-3xl";

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
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function AppGlyph({ app }: { app: AppMeta }) {
  if (typeof app.icon === "string") {
    return (
      <Image
        src={`/assets/icons/apps/${app.icon}.ico`}
        alt={app.title}
        width={32}
        height={32}
        className="rounded-xl"
      />
    );
  }

  if (app.icon) {
    return <span className="text-white/80">{app.icon}</span>;
  }

  return (
    <span className="text-sm font-semibold text-white/80">
      {app.title.slice(0, 1)}
    </span>
  );
}

function buildCalendar(month: Date, today: Date): CalendarCell[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + index);

    cells.push({
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === month.getMonth(),
      isToday:
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getDate() === today.getDate(),
    });
  }

  return cells;
}

function describeState(win: WinInstance): string {
  switch (win.state) {
    case "fullscreen":
      return "Fullscreen";
    case "maximized":
      return "Maximized";
    case "minimized":
      return "Minimized";
    case "hidden":
      return "Hidden";
    default:
      return "Active";
  }
}

export function CalendarPanel({ referenceDate }: CalendarPanelProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const apps = useDesktop((state) => state.apps);
  const windows = useDesktop((state) => state.windows);
  const activeId = useDesktop((state) => state.activeId);

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

  const orderedWindows = useMemo(() => {
    return Object.values(windows).sort((first, second) => {
      if (first.createdAt === second.createdAt) {
        return second.z - first.z;
      }

      return second.createdAt - first.createdAt;
    });
  }, [windows]);

  const todayKey = referenceDate.toDateString();

  const todayWindows = useMemo(() => {
    return orderedWindows.filter((win) => {
      return new Date(win.createdAt).toDateString() === todayKey;
    });
  }, [orderedWindows, todayKey]);

  const activeWindow = activeId ? (windows[activeId] ?? null) : null;
  const activeMeta = activeWindow ? apps[activeWindow.appId] : undefined;

  const uniqueApps = useMemo(() => {
    return new Set(orderedWindows.map((win) => win.appId));
  }, [orderedWindows]);

  const timeZone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    [],
  );

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const dayLabel = referenceDate.toLocaleDateString(undefined, {
    weekday: "long",
  });

  const dayNumber = referenceDate.getDate();

  const handleAdjustMonth = useCallback((delta: number) => {
    setMonthOffset((offset) => offset + delta);
  }, []);

  const handleFocusWindow = useCallback((win: WinInstance) => {
    if (win.state === "minimized" || win.state === "hidden") {
      DesktopAPI.setState(win.id, "normal");
    }

    DesktopAPI.focus(win.id);
  }, []);

  const sessionStats = [
    { label: "Open Windows", value: orderedWindows.length.toString() },
    { label: "Unique Apps", value: uniqueApps.size.toString() },
    { label: "Active App", value: activeMeta?.title ?? "None" },
  ];

  return (
    <GlassTile className="w-[30rem] text-white">
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
            {timeFormatter.format(referenceDate)} • {timeZone}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleAdjustMonth(-1)}
              className="rounded-2xl border border-white/15 bg-white/10 text-white/70 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleAdjustMonth(1)}
              className="rounded-2xl border border-white/15 bg-white/10 text-white/70 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-1 text-xs text-white/70">
            {orderedWindows.length} window
            {orderedWindows.length === 1 ? "" : "s"} open
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
          <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
            <span>Calendar</span>
            <span>{monthLabel}</span>
          </header>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {DAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-center text-xs font-semibold text-white/55"
              >
                {label}
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

        <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
          <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
            <span>Active Session</span>
            <span>
              {uniqueApps.size} app
              {uniqueApps.size === 1 ? "" : "s"}
            </span>
          </header>
          <motion.div
            layout
            className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/12 p-4"
          >
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              {activeMeta ? (
                <AppGlyph app={activeMeta} />
              ) : (
                <Monitor className="size-4 text-white/70" />
              )}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {activeWindow ? activeWindow.title : "Nothing focused"}
              </p>
              <p className="text-xs text-white/65">
                {activeWindow && activeMeta
                  ? `${activeMeta.title} • ${describeState(activeWindow)}`
                  : "Pick a window to bring it to the front."}
              </p>
            </div>
            {activeWindow ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleFocusWindow(activeWindow)}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75 transition hover:border-white/25 hover:bg-white/20 hover:text-white"
              >
                Focus
              </Button>
            ) : null}
          </motion.div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {sessionStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/12 px-4 py-3"
              >
                <p className="text-xs text-white/55">{stat.label}</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/12 bg-white/10 p-4">
          <header className="flex items-center justify-between text-xs uppercase tracking-[0.2rem] text-white/60">
            <span className="flex items-center gap-2">
              <Clock3 className="size-3.5" /> Today’s Flow
            </span>
            <span>
              {todayWindows.length} session
              {todayWindows.length === 1 ? "" : "s"}
            </span>
          </header>
          <div className="mt-4 space-y-3">
            {todayWindows.length === 0 ? (
              <p className="text-sm text-white/65">
                Launch an app to start logging today’s usage.
              </p>
            ) : (
              todayWindows.slice(0, 5).map((win) => {
                const meta = apps[win.appId];
                const createdAt = new Date(win.createdAt);
                return (
                  <motion.button
                    key={win.id}
                    type="button"
                    whileHover={{ translateY: -2 }}
                    whileTap={{ translateY: 0 }}
                    onClick={() => handleFocusWindow(win)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/12 px-4 py-3 text-left text-white/80 transition hover:border-white/20 hover:bg-white/16 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                        {meta ? (
                          <AppGlyph app={meta} />
                        ) : (
                          <Monitor className="size-4 text-white/70" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {win.title}
                        </p>
                        <p className="text-xs text-white/65">
                          {timeFormatter.format(createdAt)}
                          {meta ? ` • ${meta.title}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-white/55">
                      <span>{describeState(win)}</span>
                      <span className="text-[0.65rem] uppercase tracking-wider">
                        Focus
                      </span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </section>
      </div>
    </GlassTile>
  );
}
