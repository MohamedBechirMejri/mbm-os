"use client";

import { motion } from "motion/react";

type SearchBackdropProps = {
  onClose: () => void;
};

export function SearchBackdrop({ onClose }: SearchBackdropProps) {
  return (
    <motion.div
      key="search-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70]"
      onPointerDown={onClose}
    />
  );
}
