"use client";

import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Folder,
  MinusCircle,
  PanelLeft,
  PanelRight,
  Settings,
  Store,
  TerminalSquare,
  Wifi as WifiIcon,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AppId,
  type AppMeta,
  DesktopAPI,
  useDesktop,
  type WinInstance,
} from "@/components/screens/desktop/components/window-manager";
import { cn } from "@/lib/utils";
import { useActiveApp } from "../../hooks/use-active-app";
import { useMenuActions } from "../../hooks/use-menu-actions";

type ControlCenterPanelProps = {
  onClose: () => void;
};

type QuickApp = {
  id: AppId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type WindowAction = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  handler: () => void;
};

const tileBase =
  "relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.12)_45%,rgba(120,140,255,0.08)_100%)] p-5 shadow-[0_1.25rem_2.75rem_rgba(15,23,42,0.38)] backdrop-blur-3xl";

const quickApps: QuickApp[] = [
  {
    id: "file-manager",
    label: "Open Finder",
    description: "Browse the Tahoe filesystem",
    icon: Folder,
  },
  {
    id: "safari",
    label: "Launch Safari",
    description: "Visit the latest experiments",
    icon: Compass,
  },
  {
    id: "terminal",
    label: "Start Terminal",
    description: "Drop into the shell",
    icon: TerminalSquare,
  },
  {
    id: "softwarecenter",
    label: "App Store",
    description: "Install more demos",
    icon: Store,
  },
];

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
        width={28}
        height={28}
        className="rounded-xl"
      />
    );
  }

  return <span className="text-white/80">{app.icon}</span>;
}

function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

function QuickLaunchButton({
  app,
  onLaunch,
}: {
  app: QuickApp;
  onLaunch: (id: AppId) => void;
}) {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onClick={() => onLaunch(app.id)}
      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/10 p-4 text-left text-white/75 transition-all hover:bg-white/16 hover:text-white"
    >
      <span className="flex size-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white/80 transition-colors group-hover:bg-white/20">
        <Icon className="size-4" />
      </span>
      <div className="mt-4">
        <p className="text-sm font-semibold leading-tight">{app.label}</p>
        <p className="text-xs text-white/65">{app.description}</p>
      </div>
    </button>
  );
}

function WindowActionButton({ action }: { action: WindowAction }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={action.handler}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-white/75 transition-all hover:bg-white/16 hover:text-white"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-2xl border border-white/20 bg-white/12">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">{action.label}</p>
          <p className="text-xs text-white/65">{action.description}</p>
        </div>
      </div>
    </button>
  );
}

export function ControlCenterPanel({ onClose }: ControlCenterPanelProps) {
  const online = useOnlineStatus();
  const desktop = useDesktop((state) => state);
  const activeWindow = desktop.activeId
    ? desktop.windows[desktop.activeId]
    : null;
  const { minimizeActiveWindow, tileLeft, tileRight, closeActiveWindow } =
    useMenuActions();
  const { appId: activeAppId, appTitle, appMeta } = useActiveApp();

  const runningWindows = useMemo(() => {
    return Object.values(desktop.windows)
      .sort((a, b) => b.z - a.z)
      .slice(0, 5);
  }, [desktop.windows]);

  const handleLaunch = useCallback(
    (appId: AppId) => {
      const state = DesktopAPI.getState();
      const existing = Object.values(state.windows).find(
        (win) => win.appId === appId,
      );

      if (existing) {
        if (existing.state === "minimized") {
          DesktopAPI.setState(existing.id, "normal");
        }
        DesktopAPI.focus(existing.id);
        return;
      }

      if (!state.apps[appId]) {
        const meta = desktop.apps[appId];
        if (meta) {
          DesktopAPI.registerApps([meta]);
        }
      }

      DesktopAPI.launch(appId);
    },
    [desktop.apps],
  );

  const handleFocusWindow = useCallback((win: WinInstance) => {
    if (win.state === "minimized") {
      DesktopAPI.setState(win.id, "normal");
    }
    DesktopAPI.focus(win.id);
  }, []);

  const windowActions = useMemo<WindowAction[]>(
    () => [
      {
        id: "minimize",
        label: "Minimize active window",
        description: "Send the frontmost window to the dock",
        icon: MinusCircle,
        handler: minimizeActiveWindow,
      },
      {
        id: "tile-left",
        label: "Snap left",
        description: "Fit the active window to the left half",
        icon: PanelLeft,
        handler: tileLeft,
      },
      {
        id: "tile-right",
        label: "Snap right",
        description: "Fit the active window to the right half",
        icon: PanelRight,
        handler: tileRight,
      },
      {
        id: "close",
        label: "Close active window",
        description: "Quit the focused experiment",
        icon: Settings,
        handler: closeActiveWindow,
      },
    ],
    [closeActiveWindow, minimizeActiveWindow, tileLeft, tileRight],
  );

  return (
    <section className="w-[24rem] space-y-4 text-white">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight">Control Center</p>
          <p className="text-xs text-white/60">
            {runningWindows.length} window
            {runningWindows.length === 1 ? "" : "s"} in this session
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-2xl border border-white/15 bg-white/15 text-white/70 transition-colors hover:bg-white/25"
          aria-label="Close control center"
        >
          <Settings className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        <div className="space-y-4">
          <GlassTile>
            <div className="flex items-center justify-between text-sm font-semibold text-white/80">
              <span>Quick launch</span>
              <span className="text-xs text-white/60">
                {online ? "Online" : "Offline"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickApps.map((app) => (
                <QuickLaunchButton
                  key={app.id}
                  app={app}
                  onLaunch={handleLaunch}
                />
              ))}
            </div>
          </GlassTile>

          <GlassTile>
            <div className="text-sm font-semibold text-white/80">
              Window controls
            </div>
            <div className="mt-4 grid gap-3">
              {windowActions.map((action) => (
                <WindowActionButton key={action.id} action={action} />
              ))}
            </div>
          </GlassTile>
        </div>

        <div className="space-y-4">
          <GlassTile>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/80">
                Currently focused
              </div>
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  online
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                    : "border-white/20 bg-white/10 text-white/70",
                )}
              >
                {online ? (
                  <WifiIcon className="size-3.5" />
                ) : (
                  <WifiOff className="size-3.5" />
                )}
                {online ? "Connected" : "Offline"}
              </span>
            </div>
            {activeAppId && activeWindow ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                {appMeta ? <AppGlyph app={appMeta} /> : null}
                <div>
                  <p className="text-sm font-semibold leading-tight text-white/85">
                    {appTitle}
                  </p>
                  <p className="text-xs text-white/60">{activeWindow.title}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/70">
                No window is focused right now.
              </p>
            )}
          </GlassTile>

          <GlassTile>
            <div className="flex items-center justify-between text-sm font-semibold text-white/80">
              <span>Running windows</span>
              <span className="text-xs text-white/60">Tap to focus</span>
            </div>
            <div className="mt-4 space-y-2">
              {runningWindows.length === 0 ? (
                <p className="text-sm text-white/70">
                  Launch an app to see it listed here.
                </p>
              ) : null}
              {runningWindows.map((win) => {
                const meta = desktop.apps[win.appId];
                return (
                  <button
                    key={win.id}
                    type="button"
                    onClick={() => handleFocusWindow(win)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/16 hover:text-white"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {meta ? <AppGlyph app={meta} /> : null}
                      <div className="truncate">
                        <p className="truncate font-semibold">
                          {win.title || meta?.title || win.appId}
                        </p>
                        <p className="text-xs text-white/60">
                          {meta?.title ?? win.appId}
                        </p>
                      </div>
                    </div>
                    {win.state === "minimized" ? (
                      <span className="text-xs text-white/50">minimized</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </GlassTile>
        </div>
      </div>
    </section>
  );
}
