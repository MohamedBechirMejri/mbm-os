import { useCallback, useMemo, useState } from "react";
import {
  DesktopAPI,
  useDesktop,
  type AppMeta,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";

import { buildCalendar, type CalendarCell } from "../utils/calendar";
import { describeState } from "../utils/describe-state";

export type SessionStat = {
  label: string;
  value: string;
};

export type TodayEntry = {
  win: WinInstance;
  meta?: AppMeta;
  createdAt: Date;
  createdAtLabel: string;
  stateLabel: string;
};

type CalendarSummary = {
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
  timeZone: string;
  formattedTime: string;
  seconds: number;
  openWindowCount: number;
};

type CalendarSectionData = {
  monthLabel: string;
  cells: CalendarCell[];
};

type ActiveSessionData = {
  activeWindow: WinInstance | null;
  activeMeta?: AppMeta;
  activeStateLabel?: string;
  uniqueAppsCount: number;
  sessionStats: SessionStat[];
};

type TodayFlowData = {
  totalCount: number;
  entries: TodayEntry[];
};

type CalendarPanelData = {
  summary: CalendarSummary;
  calendar: CalendarSectionData;
  session: ActiveSessionData;
  flow: TodayFlowData;
  handlers: {
    adjustMonth: (delta: number) => void;
    focusWindow: (win: WinInstance) => void;
  };
};

export function useCalendarPanel(referenceDate: Date): CalendarPanelData {
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

  const openWindowCount = orderedWindows.length;
  const uniqueAppsCount = uniqueApps.size;

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

  const adjustMonth = useCallback((delta: number) => {
    setMonthOffset((offset) => offset + delta);
  }, []);

  const focusWindow = useCallback((win: WinInstance) => {
    if (win.state === "minimized" || win.state === "hidden") {
      DesktopAPI.setState(win.id, "normal");
    }

    DesktopAPI.focus(win.id);
  }, []);

  const sessionStats = useMemo<SessionStat[]>(
    () => [
      { label: "Open Windows", value: openWindowCount.toString() },
      { label: "Unique Apps", value: uniqueAppsCount.toString() },
      { label: "Active App", value: activeMeta?.title ?? "None" },
    ],
    [openWindowCount, uniqueAppsCount, activeMeta?.title],
  );

  const todayEntries = useMemo<TodayEntry[]>(() => {
    return todayWindows.slice(0, 5).map((win) => {
      const meta = apps[win.appId];
      const createdAt = new Date(win.createdAt);
      return {
        win,
        meta,
        createdAt,
        createdAtLabel: timeFormatter.format(createdAt),
        stateLabel: describeState(win),
      };
    });
  }, [todayWindows, apps, timeFormatter]);

  return {
    summary: {
      dayLabel,
      dayNumber,
      monthLabel,
      timeZone,
      formattedTime: timeFormatter.format(referenceDate),
      seconds: referenceDate.getSeconds(),
      openWindowCount,
    },
    calendar: {
      monthLabel,
      cells,
    },
    session: {
      activeWindow,
      activeMeta,
      activeStateLabel: activeWindow ? describeState(activeWindow) : undefined,
      uniqueAppsCount,
      sessionStats,
    },
    flow: {
      totalCount: todayWindows.length,
      entries: todayEntries,
    },
    handlers: {
      adjustMonth,
      focusWindow,
    },
  };
}
