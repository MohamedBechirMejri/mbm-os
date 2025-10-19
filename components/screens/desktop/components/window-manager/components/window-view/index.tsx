"use client";

import { motion } from "motion/react";
import type React from "react";
import { useEffect, useRef } from "react";
import { focusWin, setAnimationState, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";
import { TitlebarPortalProvider } from "./titlebar-portal";
import { WindowContent } from "./window-content";
import { WindowResizeHandles } from "./window-resize-handles";
import { WindowTitlebar } from "./window-titlebar";

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

  // Calculate scale origin based on dock position
  const originX = dockOrigin.x - win.bounds.x;
  const originY = dockOrigin.y - win.bounds.y;

  // Handle animation state changes
  useEffect(() => {
    const animState = win.animationState || "idle";

    if (animState === "opening") {
      // Reset to idle after animation
      setTimeout(() => {
        setAnimationState(win.id, "idle");
      }, 400);
    } else if (animState === "closing") {
      // Animation handled by motion.div
      setTimeout(() => {
        // Actual removal happens in closeWin
      }, 300);
    } else if (animState === "minimizing") {
      setTimeout(() => {
        setAnimationState(win.id, "idle");
      }, 300);
    } else if (animState === "restoring") {
      setTimeout(() => {
        setAnimationState(win.id, "idle");
      }, 400);
    }
  }, [win.animationState, win.id]);

  type AnimationVariant = "idle" | "open" | "closing" | "minimized";

  const getAnimationVariant = (): AnimationVariant => {
    const animState = win.animationState ?? "idle";
    if (animState === "opening" || animState === "restoring") return "open";
    if (animState === "closing" || animState === "minimizing") return "closing";
    if (win.state === "minimized") return "minimized";
    return "idle";
  };

  const currentVariant = getAnimationVariant();

  const onTitleDoubleClick = () => {
    if (!isResizable) return;
    setWinState(win.id, win.state === "maximized" ? "normal" : "maximized");
  };

  const isDormant =
    win.state === "minimized" &&
    win.animationState !== "restoring" &&
    win.animationState !== "minimizing";

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
          transformOrigin: `${originX}px ${originY}px`,
          visibility: isDormant ? "hidden" : "visible",
          pointerEvents: isDormant ? "none" : "auto",
        }}
        initial={false}
        animate={currentVariant}
        aria-hidden={isDormant}
        variants={{
          idle: {
            scale: 1,
            opacity: 1,
          },
          open: {
            scale: [0.3, 1.02, 1],
            opacity: [0, 1, 1],
          },
          closing: {
            scale: 0.3,
            opacity: 0,
          },
          minimized: {
            scale: 0.3,
            opacity: 0,
          },
        }}
        transition={{
          scale:
            currentVariant === "open"
              ? { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
              : currentVariant === "closing"
                ? { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] }
                : { type: "spring", stiffness: 300, damping: 30 },
          opacity:
            currentVariant === "open"
              ? { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
              : currentVariant === "closing"
                ? { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] }
                : { type: "spring", stiffness: 300, damping: 30 },
        }}
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
