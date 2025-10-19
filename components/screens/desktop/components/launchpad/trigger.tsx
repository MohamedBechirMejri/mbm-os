"use client";

import { motion, useMotionValue } from "motion/react";
import GlassSurface from "@/components/ui/glass-surface";

interface LaunchpadTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export function LaunchpadTrigger({ onClick, isOpen }: LaunchpadTriggerProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="ml-auto mt-8 flex min-h-[58px] w-max items-center justify-center gap-2 rounded-2xl relative select-none"
    >
      <GlassSurface
        width={"max-content"}
        height={64}
        borderRadius={24}
        className="!overflow-visible cursor-pointer"
        containerClassName="gap-2 px-3 py-2 !items-center"
      >
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center rounded-full aspect-square"
          style={{ width: 40, height: 40, padding: 6 }}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            animate={{
              rotate: isOpen ? 45 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
              aria-label="Launchpad"
            >
              <title>Launchpad</title>
              <motion.g
                animate={{
                  opacity: isOpen ? 0.7 : 0.9,
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Grid of 9 squares (3x3) matching dock icon style */}
                <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white" />
                <rect x="11" y="3" width="6" height="6" rx="1.5" fill="white" />
                <rect x="19" y="3" width="6" height="6" rx="1.5" fill="white" />

                <rect x="3" y="11" width="6" height="6" rx="1.5" fill="white" />
                <rect
                  x="11"
                  y="11"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                />
                <rect
                  x="19"
                  y="11"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                />

                <rect x="3" y="19" width="6" height="6" rx="1.5" fill="white" />
                <rect
                  x="11"
                  y="19"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                />
                <rect
                  x="19"
                  y="19"
                  width="6"
                  height="6"
                  rx="1.5"
                  fill="white"
                />
              </motion.g>
            </svg>
          </motion.div>
        </motion.button>
      </GlassSurface>
    </motion.div>
  );
}
