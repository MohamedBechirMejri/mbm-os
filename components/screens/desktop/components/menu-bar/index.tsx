"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarPanel } from "@/components/screens/desktop/components/menu-bar/components/calendar-panel";
import { ControlCenterPanel } from "@/components/screens/desktop/components/menu-bar/components/control-center-panel";
import { SearchOverlay } from "@/components/screens/desktop/components/menu-bar/components/search-overlay";
import { useDesktop } from "@/components/screens/desktop/components/window-manager";
import { Menubar } from "@/components/ui/menubar";
import {
  AppleMenu,
  AppMenus,
  BatteryIndicator,
  Clock,
  ControlCenter as ControlCenterButton,
  SearchIcon,
  WiFiIndicator,
} from "./components";

type MenuBarPanel = "calendar" | "control-center";

export default function MenuBar() {
  const menuBarRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<MenuBarPanel | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const apps = useDesktop((state) => Object.values(state.apps));
  const windows = useDesktop((state) => Object.values(state.windows));

  const closeOverlays = useCallback(() => {
    setActivePanel(null);
    setIsSearchOpen(false);
  }, []);

  const togglePanel = useCallback((panel: MenuBarPanel) => {
    setIsSearchOpen(false);
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);

  const toggleSearch = useCallback(() => {
    setActivePanel(null);
    setIsSearchOpen((current) => !current);
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (!activePanel && !isSearchOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuBarRef.current) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && menuBarRef.current.contains(target)) {
        return;
      }

      closeOverlays();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlays();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel, closeOverlays, isSearchOpen]);

  return (
    <div ref={menuBarRef} className="relative z-50">
      <Menubar className="bg-transparent text-white border-none rounded-none h-7 px-2 flex items-center justify-between w-full">
        {/* Left side - Apple menu and app menus */}
        <div className="flex items-center gap-1">
          <AppleMenu />
          <AppMenus />
        </div>

        {/* Right side - Status items */}
        <div className="flex items-center gap-1 ml-auto">
          <div
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <SearchIcon isActive={isSearchOpen} onToggle={toggleSearch} />
          </div>
          <ControlCenterButton
            isActive={activePanel === "control-center"}
            onToggle={() => togglePanel("control-center")}
          />
          <div
            onPointerDown={(event) => {
              event.stopPropagation();
              closeOverlays();
            }}
          >
            <WiFiIndicator />
          </div>
          <div
            onPointerDown={(event) => {
              event.stopPropagation();
              closeOverlays();
            }}
          >
            <BatteryIndicator />
          </div>
          <Clock
            date={currentTime}
            isActive={activePanel === "calendar"}
            onToggle={() => togglePanel("calendar")}
          />
        </div>
      </Menubar>

      <AnimatePresence initial={false} mode="wait">
        {activePanel === "control-center" && (
          <motion.div
            key="control-center"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-2 top-9"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <ControlCenterPanel onClose={closeOverlays} />
          </motion.div>
        )}

        {activePanel === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-2 top-9"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <CalendarPanel referenceDate={currentTime} />
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={isSearchOpen}
        apps={apps}
        windows={windows}
        onClose={closeOverlays}
      />
    </div>
  );
}
