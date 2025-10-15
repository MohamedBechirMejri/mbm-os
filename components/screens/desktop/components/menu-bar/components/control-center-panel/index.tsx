"use client";

import { AnimatePresence, motion } from "motion/react";
import Display from "./display";

type ControlCenterPanelProps = {
  onClose: () => void;
};

export function ControlCenterPanel(_props: ControlCenterPanelProps) {
  return (
    <section className="w-[20rem] space-y-4 text-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-2 gap-4"
        >
          <Display />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
