"use client";

import { motion, type Variants } from "motion/react";
import type React from "react";
import { useRef } from "react";
import { focusWin, setAnimationState, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";
import { TitlebarPortalProvider } from "./titlebar-portal";
import { WindowContent } from "./window-content";
import { WindowResizeHandles } from "./window-resize-handles";
import { WindowTitlebar } from "./window-titlebar";

type AnimationVariant =
  | "idle"
  | "entering"
  | "closing"
  | "minimizing"
  | "restoring"
  | "minimized";

const MINIMIZED_SIGNATURE = {
  scaleX: 0.46,
  scaleY: 0.18,
  opacity: 0,
  rotateX: 14,
  filter: "blur(18px)",
} as const;

const WINDOW_VARIANTS: Variants = {
  idle: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
  },
  entering: {
    scaleX: [0.82, 1.06, 0.98, 1],
    scaleY: [0.78, 1.02, 0.99, 1],
    y: [26, -10, 3, 0],
    opacity: [0, 0.86, 1, 1],
    rotateX: [10, 0, -2, 0],
    filter: ["blur(20px)", "blur(6px)", "blur(1px)", "blur(0px)"],
    transition: {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1],
      times: [0, 0.45, 0.75, 1],
    },
  },
  closing: {
    scaleX: [1, 0.96, 0.9, 0.78, 0.68],
    scaleY: [1, 0.94, 0.88, 0.78, 0.68],
    y: [0, -4, -10, -18, -26],
    opacity: [1, 0.88, 0.6, 0.32, 0],
    rotateX: [0, -4, -8, -12, -16],
    filter: ["blur(0px)", "blur(4px)", "blur(9px)", "blur(14px)", "blur(22px)"],
    transition: {
      duration: 0.42,
      ease: [0.4, 0.1, 0.7, 0],
      times: [0, 0.35, 0.6, 0.82, 1],
    },
  },
  minimizing: {
    scaleX: [1, 0.92, 0.7, MINIMIZED_SIGNATURE.scaleX],
    scaleY: [1, 0.86, 0.42, MINIMIZED_SIGNATURE.scaleY],
    y: [0, 10, 26, 36],
    opacity: [1, 1, 0.74, MINIMIZED_SIGNATURE.opacity],
    rotateX: [0, 8, 12, MINIMIZED_SIGNATURE.rotateX],
    filter: [
      "blur(0px)",
      "blur(4px)",
      "blur(12px)",
      MINIMIZED_SIGNATURE.filter,
    ],
    transition: {
      duration: 0.48,
      ease: [0.3, 0.7, 0.4, 1],
      times: [0, 0.32, 0.64, 1],
    },
  },
  restoring: {
    scaleX: [MINIMIZED_SIGNATURE.scaleX, 0.74, 1.04, 1],
    scaleY: [MINIMIZED_SIGNATURE.scaleY, 0.46, 1.02, 1],
    y: [34, 8, -2, 0],
    opacity: [0, 0.72, 1, 1],
    rotateX: [MINIMIZED_SIGNATURE.rotateX, 10, 0, 0],
    filter: [
      MINIMIZED_SIGNATURE.filter,
      "blur(10px)",
      "blur(2px)",
      "blur(0px)",
    ],
    transition: {
      duration: 0.5,
      ease: [0.18, 0.9, 0.2, 1],
      times: [0, 0.38, 0.72, 1],
    },
  },
  minimized: {
    ...MINIMIZED_SIGNATURE,
    y: 36,
    transition: {
      duration: 0.18,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

export function WindowView({
  win,
  rootRef,
}: {
  win: WinInstance;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const titlebarMountRef = useRef<HTMLDivElement | null>(null);
  const drag = useWindowDrag(win, rootRef);
  const resize = useWindowResize(win, rootRef);
  const meta = useDesktop((s) => s.apps[win.appId]);
  const dockRect = useDesktop((s) => s.dockByAppRect[win.appId]);
  const isResizable = meta?.resizable ?? true;

  // Get dock icon position for animations
  const getDockOrigin = () => {
    if (dockRect) {
      return {
        x: dockRect.left + dockRect.width / 2,
        y: dockRect.top + dockRect.height / 2,
      };
    }
    // Fallback to bottom center of screen
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight - 50,
    };
  };

  const dockOrigin = getDockOrigin();

  const getAnimationVariant = (): AnimationVariant => {
    const animState = win.animationState ?? "idle";
    if (animState === "opening") return "entering";
    if (animState === "closing") return "closing";
    if (animState === "minimizing") return "minimizing";
    if (animState === "restoring") return "restoring";
    if (win.state === "minimized") return "minimized";
    return "idle";
  };

  const currentVariant = getAnimationVariant();

  const handleAnimationComplete = (definition: string | string[]) => {
    const variant = Array.isArray(definition)
      ? (definition[definition.length - 1] as AnimationVariant | undefined)
      : (definition as AnimationVariant | undefined);

    if (!variant) return;

    if (variant === "entering" && win.animationState === "opening") {
      setAnimationState(win.id, "idle");
    }

    if (variant === "minimizing" && win.animationState === "minimizing") {
      setAnimationState(win.id, "idle");
    }

    if (variant === "restoring" && win.animationState === "restoring") {
      setAnimationState(win.id, "idle");
    }
  };

  const onTitleDoubleClick = () => {
    if (!isResizable) return;
    setWinState(win.id, win.state === "maximized" ? "normal" : "maximized");
  };

  const isDormant =
    win.state === "minimized" &&
    win.animationState !== "restoring" &&
    win.animationState !== "minimizing";

  const dockOriginX = dockOrigin.x - win.bounds.x;
  const dockOriginY = dockOrigin.y - win.bounds.y;
  const centerOrigin = `${win.bounds.w / 2}px ${win.bounds.h / 2}px`;
  const dockAlignedOrigin = `${dockOriginX}px ${dockOriginY}px`;
  const transformOrigin =
    currentVariant === "minimizing" ||
    currentVariant === "minimized" ||
    currentVariant === "restoring"
      ? dockAlignedOrigin
      : centerOrigin;

  return (
    <TitlebarPortalProvider value={titlebarMountRef}>
      <motion.div
        className={
          `wm-window absolute rounded-xl overflow-hidden select-none ` +
          `bg-black/40 backdrop-blur-[1.4rem] ` +
          (win.focused
            ? "shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
            : "shadow-[0_10px_28px_rgba(0,0,0,0.28)]")
        }
        style={{
          left: win.bounds.x,
          top: win.bounds.y,
          width: win.bounds.w,
          height: win.bounds.h,
          zIndex: win.z,
          transformOrigin,
          visibility: isDormant ? "hidden" : "visible",
          pointerEvents: isDormant ? "none" : "auto",
          transformStyle: "preserve-3d",
        }}
        initial={false}
        animate={currentVariant}
        aria-hidden={isDormant}
        variants={WINDOW_VARIANTS}
        onAnimationComplete={handleAnimationComplete}
        onPointerDown={() => focusWin(win.id)}
      >
        {/* Titlebar with a shared portal mount for this window */}
        <WindowTitlebar
          win={win}
          drag={drag}
          onTitleDoubleClick={onTitleDoubleClick}
          mountRef={titlebarMountRef}
        />

        <WindowContent win={win} />

        {isResizable ? (
          <WindowResizeHandles
            onPointerDown={resize.onPointerDown}
            onPointerMove={resize.onPointerMove}
            onPointerUp={resize.onPointerUp}
          />
        ) : null}
      </motion.div>
    </TitlebarPortalProvider>
  );
}
