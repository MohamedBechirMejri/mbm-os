"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { FSFile } from "./fs";

export function QuickLook({
  file,
  onClose,
}: {
  file: FSFile | null;
  onClose: () => void;
}) {
  // Global keyboard shortcuts (Esc/Space) to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Always render via a portal to detach from the window transform
  return createPortal(
    <AnimatePresence>
      {file ? (
        <motion.div
          key="ql-overlay"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            key="ql-content"
            className="relative max-h-[85vh] max-w-[85vw] rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl border border-white/20"
            aria-label="Quick Look preview"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
              mass: 0.8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-center text-white/90 text-base font-medium">
              {file.name}
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-black/40 shadow-xl">
              {file.kind === "image" && (
                <div className="relative max-h-[68vh] max-w-[76vw]">
                  <Image
                    src={file.path}
                    alt={file.name}
                    width={1200}
                    height={800}
                    className="h-auto w-auto max-h-[68vh] max-w-[76vw] object-contain"
                  />
                </div>
              )}
              {file.kind === "video" && (
                <video
                  src={file.path}
                  controls
                  className="max-h-[68vh] max-w-[76vw]"
                >
                  <track
                    kind="captions"
                    srcLang="en"
                    label="English captions"
                  />
                </video>
              )}
              {file.kind === "audio" && (
                <audio src={file.path} controls className="w-[50vw]">
                  <track
                    kind="captions"
                    srcLang="en"
                    label="English captions"
                  />
                </audio>
              )}
              {file.kind === "text" && (
                <iframe
                  title={`Preview ${file.name}`}
                  src={file.path}
                  className="h-[68vh] w-[76vw] rounded-lg bg-black"
                />
              )}
              {file.kind === "pdf" && (
                <iframe
                  title={`Preview ${file.name}`}
                  src={file.path}
                  className="h-[68vh] w-[76vw] rounded-lg bg-black"
                />
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
              <kbd className="rounded bg-white/10 px-2 py-1">Space</kbd>
              <span>or</span>
              <kbd className="rounded bg-white/10 px-2 py-1">Esc</kbd>
              <span>to close</span>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
