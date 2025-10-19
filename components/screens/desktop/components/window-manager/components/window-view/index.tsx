"use client";

import { motion, type Transition, type Variants } from "motion/react";
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
  | "spawn"
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

const createWindowSpring = (overrides?: Partial<Transition>): Transition => ({
  type: "spring",
  mass: 0.82,
  stiffness: 540,
  damping: 32,
  restDelta: 0.001,
  restSpeed: 0.001,
  ...overrides,
});

const WINDOW_VARIANTS: Variants = {
  spawn: {
    scaleX: 0.84,
    scaleY: 0.8,
    y: 28,
    opacity: 0,
    rotateX: 12,
    filter: "blur(16px)",
  },
  idle: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
  },
  entering: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      default: createWindowSpring({ bounce: 0.24 }),
      opacity: createWindowSpring({ damping: 40, stiffness: 480 }),
      filter: createWindowSpring({ damping: 46, stiffness: 420 }),
    },
  },
  closing: {
    scaleX: 0.78,
    scaleY: 0.72,
    y: -24,
    opacity: 0,
    rotateX: -12,
    filter: "blur(18px)",
    transition: {
      default: createWindowSpring({ damping: 26, stiffness: 640, mass: 0.68 }),
      opacity: createWindowSpring({ damping: 24, stiffness: 560, mass: 0.6 }),
      filter: createWindowSpring({ damping: 30, stiffness: 520, mass: 0.62 }),
    },
  },
  minimizing: {
    scaleX: MINIMIZED_SIGNATURE.scaleX,
    scaleY: MINIMIZED_SIGNATURE.scaleY,
    y: 34,
    opacity: MINIMIZED_SIGNATURE.opacity,
    rotateX: MINIMIZED_SIGNATURE.rotateX,
    filter: MINIMIZED_SIGNATURE.filter,
    transition: {
      default: createWindowSpring({ stiffness: 620, damping: 34, mass: 0.74 }),
      filter: createWindowSpring({ stiffness: 520, damping: 38, mass: 0.8 }),
    },
  },
  restoring: {
    scaleX: 1,
    scaleY: 1,
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      default: createWindowSpring({ bounce: 0.2, stiffness: 560, damping: 30 }),
      opacity: createWindowSpring({ damping: 38, stiffness: 460 }),
      filter: createWindowSpring({ damping: 44, stiffness: 420 }),
    },
  },
  minimized: {
    ...MINIMIZED_SIGNATURE,
    y: 34,
    transition: {
      default: createWindowSpring({ stiffness: 720, damping: 40, mass: 0.58 }),
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
        initial={win.animationState === "opening" ? "spawn" : false}
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
