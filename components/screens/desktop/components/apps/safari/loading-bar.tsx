"use client";

import { AnimatePresence, motion } from "motion/react";

export function LoadingBar({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          key="loading"
          className="relative h-0.5 w-full bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "60%", "85%", "95%"] }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
