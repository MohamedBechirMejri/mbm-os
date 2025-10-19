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
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{
            backdropFilter: "blur(60px) saturate(180%)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="w-full max-w-6xl px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-6 gap-12 p-12">
              {apps.map((app, index) => (
                <motion.button
                  key={app.id}
                  type="button"
                  initial={{
                    scale: 0,
                    opacity: 0,
                    y: 50,
                    rotateX: -90,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    y: -20,
                    transition: { duration: 0.15 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 22,
                    delay: index * 0.025 + 0.05,
                  }}
                  whileHover={{
                    scale: 1.15,
                    y: -8,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    },
                  }}
                  whileTap={{
                    scale: 0.9,
                    transition: { duration: 0.1 },
                  }}
                  onClick={() => handleAppClick(app.id)}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    className="relative w-28 h-28 rounded-[22px] transition-all"
                    whileHover={{
                      filter: "brightness(1.1)",
                    }}
                  >
                    {typeof app.icon === "string" ? (
                      <Image
                        src={`/assets/icons/apps/${app.icon}.ico`}
                        alt={app.title}
                        width={112}
                        height={112}
                        className="pointer-events-none drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl">
                        {app.icon}
                      </div>
                    )}
                  </motion.div>
                  <motion.span
                    className="text-white text-sm font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-center px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.025 + 0.15 }}
                  >
                    {app.title}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
