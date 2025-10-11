"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DesktopAPI } from "../window-manager";
import type { AppMeta, WinInstance } from "../window-manager/types";
import { DockIcon } from ".";

interface DockAppIconProps {
  app: AppMeta;
  windows: WinInstance[];
  activeId: string | null;
  onClick: () => void;
}

export function DockAppIcon({
  app,
  windows,
  activeId,
  onClick,
}: DockAppIconProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRunning = windows.length > 0;

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
        magnification={2}
        distance={120}
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
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80 shadow-lg" />
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[12rem] rounded-xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1">
              {windows.length > 1 && (
                <div className="px-3 py-2 text-xs text-white/60 font-medium border-b border-white/10">
                  {app.title} • {windows.length} window
                  {windows.length !== 1 ? "s" : ""}
                </div>
              )}
              {windows.length > 0 && (
                <>
                  {windows.map((win, idx) => (
                    <button
                      key={win.id}
                      type="button"
                      onClick={() => handleWindowClick(win.id, win.state)}
                      className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate flex-1">
                        {win.title || `${app.title} ${idx + 1}`}
                      </span>
                      {win.id === activeId && win.state !== "minimized" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      )}
                      {win.state === "minimized" && (
                        <span className="text-xs text-white/40 flex-shrink-0">
                          minimized
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="h-px bg-white/10 my-1" />
                </>
              )}
              <button
                type="button"
                onClick={handleNewWindow}
                className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between gap-4"
              >
                <span>New Window</span>
                <span className="text-xs text-white/40">⌥ Click</span>
              </button>
              {windows.length > 0 && (
                <button
                  type="button"
                  onClick={handleQuit}
                  className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between gap-4"
                >
                  <span>Quit</span>
                  <span className="text-xs text-white/40">⌘Q</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
