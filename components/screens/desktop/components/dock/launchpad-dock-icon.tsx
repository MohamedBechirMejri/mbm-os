"use client";

import { motion } from "motion/react";
import { DockIcon } from ".";

interface LaunchpadDockIconProps {
  onClick: () => void;
  anyMenuOpen: boolean;
}

export function LaunchpadDockIcon({
  onClick,
  anyMenuOpen,
}: LaunchpadDockIconProps) {
  return (
    <DockIcon
      size={64}
      magnification={anyMenuOpen ? 64 : 2}
      distance={anyMenuOpen ? 0 : 120}
      onClick={onClick}
      className="relative bg-gradient-to-br from-gray-400/30 to-gray-500/30 backdrop-blur-sm"
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
          aria-label="Launchpad"
        >
          <title>Launchpad</title>
          <motion.g
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Grid of 9 squares (3x3) */}
            <rect x="6" y="6" width="8" height="8" rx="2" fill="white" />
            <rect x="16" y="6" width="8" height="8" rx="2" fill="white" />
            <rect x="26" y="6" width="8" height="8" rx="2" fill="white" />

            <rect x="6" y="16" width="8" height="8" rx="2" fill="white" />
            <rect x="16" y="16" width="8" height="8" rx="2" fill="white" />
            <rect x="26" y="16" width="8" height="8" rx="2" fill="white" />

            <rect x="6" y="26" width="8" height="8" rx="2" fill="white" />
            <rect x="16" y="26" width="8" height="8" rx="2" fill="white" />
            <rect x="26" y="26" width="8" height="8" rx="2" fill="white" />
          </motion.g>
        </svg>
      </div>
    </DockIcon>
  );
}
