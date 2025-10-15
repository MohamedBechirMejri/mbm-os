"use client";

import { motion } from "motion/react";
import Display from "./display";

type ControlCenterPanelProps = {
  onClose: () => void;
};

export function ControlCenterPanel(_props: ControlCenterPanelProps) {
  return (
    <section className="w-[20rem] space-y-4 text-white">
      <motion.div
        key={"display controls"}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <Display />
      </motion.div>
    </section>
  );
}
