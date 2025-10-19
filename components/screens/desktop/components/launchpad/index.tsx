"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import { DesktopAPI } from "../window-manager";
import type { AppMeta } from "../window-manager/types";

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppMeta[];
}

export function Launchpad({ isOpen, onClose, apps }: LaunchpadProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleAppClick = (appId: string) => {
    const s = DesktopAPI.getState();

    // Register app if not yet registered
    if (!s.apps[appId]) {
      const meta = apps.find((a) => a.id === appId);
      if (meta) {
        DesktopAPI.registerApps([meta]);
      }
    }

    // Launch the app
    DesktopAPI.launch(appId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{
            backdropFilter: "blur(40px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="w-full max-w-5xl px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-5 gap-8 p-8">
              {apps.map((app, index) => (
                <motion.button
                  key={app.id}
                  type="button"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    delay: index * 0.02,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAppClick(app.id)}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div className="relative w-24 h-24 rounded-2xl transition-all">
                    {typeof app.icon === "string" ? (
                      <Image
                        src={`/assets/icons/apps/${app.icon}.ico`}
                        alt={app.title}
                        width={96}
                        height={96}
                        className="pointer-events-none drop-shadow-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {app.icon}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-sm font-medium drop-shadow-lg text-center px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm">
                    {app.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
