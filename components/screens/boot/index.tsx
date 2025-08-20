"use client";

import type { Variants } from "motion";
import { motion } from "motion/react";
import Image from "next/image";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const progressWrapVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (delay = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.45, ease: "easeOut" },
  }),
};

export default function BootScreen() {
  return (
    <motion.div
      className="flex flex-col items-center justify-between min-h-full w-full"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <div />

      <motion.div variants={logoVariants} className="pointer-events-none">
        <Image
          src={"/assets/devilfruit.png"}
          alt="Logo"
          width={140}
          height={140}
          className="invert"
          draggable={false}
        />
      </motion.div>

      {/* Progress block: appears after logo (delay) and animates with keyframes to emulate realistic loading */}
      <motion.div
        className="w-72 relative -top-32 bg-white/10"
        custom={1.0}
        variants={progressWrapVariants}
      >
        <div className="h-2 rounded-full overflow-hidden w-full">
          <motion.div
            // keyframed width to simulate: small jump -> pause -> steady grow -> final push
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "6%", "6%", "35%", "45%", "78%", "100%"] }}
            transition={{
              // total duration ~4.2s, times control where each keyframe sits
              duration: 4.2,
              times: [0, 0.08, 0.22, 0.6, 0.75, 0.92, 1],
              ease: [
                "easeOut",
                "linear",
                "linear",
                "easeInOut",
                "easeInOut",
                "easeOut",
                "easeOut",
              ],
            }}
            className="h-2 bg-white"
            style={{ transformOrigin: "left center" }}
          />
        </div>

        {/* subtle shimmer/pulse on top of the progress to make it feel alive */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.15, 0] }}
          transition={{ duration: 4.2, times: [0, 0.25, 0.6, 1] }}
          className="absolute left-0 right-0 top-0 h-2 pointer-events-none"
          style={{ mixBlendMode: "screen" }}
        /> */}
      </motion.div>
    </motion.div>
  );
}
