"use client";

import { AppRegistry, preinstalledApps } from "./components/apps/app-registry";
import { Dock } from "./components/dock";
import { DockAppIcon } from "./components/dock/dock-app-icon";
import MenuBar from "./components/menu-bar";
import {
  DesktopAPI,
  useDesktop,
  WindowManagerRoot,
} from "./components/window-manager";

export default function Desktop() {
  const installed = useDesktop((s) => Object.values(s.apps));
  const windows = useDesktop((s) => s.windows);
  const activeId = useDesktop((s) => s.activeId);

  const dockApps = installed.length > 0 ? installed : preinstalledApps;

  const getAppWindows = (appId: string) => {
    return Object.values(windows).filter((w) => w.appId === appId);
  };

  const handleDockClick = (appId: string) => {
    const s = DesktopAPI.getState();

    // Register app if not yet registered
    if (!s.apps[appId]) {
      const meta = preinstalledApps.find((a) => a.id === appId);
      if (meta) {
        DesktopAPI.registerApps([meta]);
      }
    }

    const appWindows = getAppWindows(appId);

    if (appWindows.length === 0) {
      // No windows open - launch new one
      DesktopAPI.launch(appId);
    } else {
      // Has windows - check if any are visible and focused
      const visibleWindows = appWindows.filter(
        (w) => w.state !== "minimized" && w.state !== "hidden",
      );
      const activeWindow = appWindows.find((w) => w.id === activeId);

      if (activeWindow && activeWindow.state !== "minimized") {
        // Active window of this app is frontmost - minimize it
        DesktopAPI.setState(activeWindow.id, "minimized");
      } else if (visibleWindows.length > 0) {
        // Has visible windows - focus the most recently used one
        const mostRecent = visibleWindows.sort((a, b) => b.z - a.z)[0];
        DesktopAPI.focus(mostRecent.id);
      } else {
        // All windows minimized - restore the most recently used one
        const mostRecent = appWindows.sort((a, b) => b.z - a.z)[0];
        DesktopAPI.setState(mostRecent.id, "normal");
        DesktopAPI.focus(mostRecent.id);
      }
    }
  };

  return (
    <div className="relative size-full grid grid-rows-[auto_minmax(0,_1fr)_auto]">
      <MenuBar />
      <div>
        <WindowManagerRoot />
        <AppRegistry />
      </div>
      <Dock className="mb-2 select-none w-max">
        {dockApps.map((app) => (
          <DockAppIcon
            key={app.id}
            app={app}
            windows={getAppWindows(app.id)}
            activeId={activeId}
            onClick={() => handleDockClick(app.id)}
          />
        ))}
      </Dock>
    </div>
  );
}
