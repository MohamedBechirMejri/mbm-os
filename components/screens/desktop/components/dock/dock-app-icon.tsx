"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import GlassSurface from "@/components/ui/glass-surface";
import { DesktopAPI } from "../window-manager";
import type { AppMeta, WinInstance } from "../window-manager/types";
import { DockIcon } from ".";

interface DockAppIconProps {
  app: AppMeta;
  windows: WinInstance[];
  activeId: string | null;
  onClick: () => void;
  anyMenuOpen: boolean;
  setAnyMenuOpen: (open: boolean) => void;
}

export function DockAppIcon({
  app,
  windows,
  activeId,
  onClick,
  anyMenuOpen,
  setAnyMenuOpen,
}: DockAppIconProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRunning = windows.length > 0;
  const hasFocusedWindow = windows.some(
    (win) =>
      win.id === activeId &&
      win.state !== "minimized" &&
      win.state !== "hidden",
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  useEffect(() => {
    setAnyMenuOpen(showMenu);
  }, [showMenu, setAnyMenuOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Option/Alt + Click launches a new window
    if (e.altKey) {
      const s = DesktopAPI.getState();
      if (!s.apps[app.id]) {
        DesktopAPI.registerApps([app]);
      }
      DesktopAPI.launch(app.id);
    } else {
      onClick();
    }
    setShowMenu(false);
  };

  const handleWindowClick = (windowId: string, state: string) => {
    if (state === "minimized" || state === "hidden") {
      DesktopAPI.setState(windowId, "normal");
    }
    DesktopAPI.focus(windowId);
    setShowMenu(false);
  };

  const handleNewWindow = () => {
    const s = DesktopAPI.getState();
    if (!s.apps[app.id]) {
      DesktopAPI.registerApps([app]);
    }
    DesktopAPI.launch(app.id);
    setShowMenu(false);
  };

  const handleQuit = () => {
    for (const win of windows) {
      DesktopAPI.close(win.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <DockIcon
        size={64}
        magnification={anyMenuOpen ? 64 : 2}
        distance={anyMenuOpen ? 0 : 120}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="relative"
      >
        {typeof app.icon === "string" ? (
          <Image
            src={`/assets/icons/apps/${app.icon}.ico`}
            alt={app.title}
            width={64}
            height={64}
            className="pointer-events-none"
          />
        ) : (
          app.icon
        )}
        {isRunning && (
          <div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full shadow-lg ${hasFocusedWindow ? "h-1.5 w-3 bg-sky-400/90" : "h-1.5 w-1.5 bg-white/80"}`}
          />
        )}
      </DockIcon>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-[14rem]"
            style={{ zIndex: 999999999 }}
          >
            <GlassSurface
              width="auto"
              height="auto"
              blur={2.5}
              displace={20}
              borderRadius={14}
              backgroundOpacity={0.45}
              className="shadow-2xl ring-1 ring-white/20"
              containerClassName="!p-1"
            >
              <div className="flex flex-col gap-0.5 w-full">
                {windows.length > 1 && (
                  <div className="px-3 py-2 text-xs text-white/80 font-semibold tracking-wide uppercase">
                    {app.title} • {windows.length} windows
                  </div>
                )}
                {windows.length > 0 && (
                  <>
                    {windows.map((win, idx) => (
                      <button
                        key={win.id}
                        type="button"
                        onClick={() => handleWindowClick(win.id, win.state)}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/20 active:bg-white/25 rounded-[10px] transition-all flex items-center justify-between gap-3"
                      >
                        <span className="truncate flex-1 font-medium drop-shadow-sm">
                          {win.title || `${app.title} ${idx + 1}`}
                        </span>
                        {win.id === activeId && win.state !== "minimized" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                        )}
                        {win.state === "minimized" && (
                          <span className="text-xs text-white/60 flex-shrink-0 font-medium drop-shadow-sm">
                            minimized
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="h-px bg-white/25 my-1 mx-2" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleNewWindow}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/20 active:bg-white/25 rounded-[10px] transition-all flex items-center justify-between gap-3"
                >
                  <span className="truncate flex-1 font-medium drop-shadow-sm">
                    New Window
                  </span>
                  <span className="text-xs text-white/60 flex-shrink-0 font-medium drop-shadow-sm">
                    ⌥ Click
                  </span>
                </button>
                {windows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleQuit}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/20 active:bg-white/25 rounded-[10px] transition-all flex items-center justify-between gap-3"
                  >
                    <span className="truncate flex-1 font-medium drop-shadow-sm">
                      Quit
                    </span>
                    <span className="text-xs text-white/60 flex-shrink-0 font-medium drop-shadow-sm">
                      ⌘Q
                    </span>
                  </button>
                )}
              </div>
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
