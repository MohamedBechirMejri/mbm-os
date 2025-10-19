"use client";

import { motion } from "motion/react";

interface LaunchpadTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export function LaunchpadTrigger({ onClick, isOpen }: LaunchpadTriggerProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="fixed bottom-3 right-3 z-[9998] rounded-[18px] overflow-hidden shadow-2xl cursor-pointer select-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotate: isOpen ? 45 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        className="relative w-16 h-16 bg-gradient-to-br from-slate-400/40 to-slate-600/40 backdrop-blur-xl border border-white/20"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
            aria-label="Launchpad"
          >
            <title>Launchpad</title>
            <motion.g
              animate={{
                opacity: isOpen ? 0.8 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Grid of 9 squares (3x3) with better spacing */}
              <motion.rect
                x="5"
                y="5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="14.5"
                y="5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="24"
                y="5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />

              <motion.rect
                x="5"
                y="14.5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="14.5"
                y="14.5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="24"
                y="14.5"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />

              <motion.rect
                x="5"
                y="24"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="14.5"
                y="24"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
              <motion.rect
                x="24"
                y="24"
                width="7"
                height="7"
                rx="1.5"
                fill="white"
                whileHover={{ scale: 1.1 }}
              />
            </motion.g>
          </svg>
        </div>

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
          animate={{
            opacity: isOpen ? 0.3 : 0.5,
          }}
        />
      </motion.div>
    </motion.button>
  );
}
