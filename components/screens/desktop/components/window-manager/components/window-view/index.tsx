"use client";

import { motion, type Transition, type Variants } from "motion/react";
import type React from "react";
import { useMemo, useRef } from "react";
import { focusWin, setAnimationState, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";
import { isWindowTransitionActive } from "../../view-transitions";
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

interface MinimizedSignature {
  scaleX: number;
  scaleY: number;
  opacity: number;
  rotateX: number;
  filter: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const createWindowSpring = (overrides?: Partial<Transition>): Transition => ({
  type: "spring",
  mass: 0.82,
  stiffness: 540,
  damping: 32,
  restDelta: 0.001,
  restSpeed: 0.001,
  ...overrides,
});

const ZERO_TWEEN: Transition = { duration: 0.0001 };

function createWindowVariants(
  minimizeVector: { x: number; y: number },
  minimizedSignature: MinimizedSignature,
  vtActive: boolean,
): Variants {
  const minimizeTransition = vtActive
    ? { default: ZERO_TWEEN, filter: ZERO_TWEEN }
    : {
        default: {
          duration: 0.56,
          ease: [0.19, 0.84, 0.36, 1] as const,
        },
        opacity: {
          duration: 0.28,
          ease: [0.3, 0.72, 0.46, 1] as const,
        },
        filter: {
          duration: 0.48,
          ease: [0.28, 0.8, 0.38, 1] as const,
        },
        rotateX: {
          duration: 0.52,
          ease: [0.24, 0.82, 0.42, 1] as const,
        },
      };

  const restoreTransition = vtActive
    ? { default: ZERO_TWEEN, opacity: ZERO_TWEEN, filter: ZERO_TWEEN }
    : {
        default: createWindowSpring({
          bounce: 0.14,
          stiffness: 520,
          damping: 34,
        }),
        opacity: {
          duration: 0.28,
          ease: [0.18, 0.86, 0.32, 1] as const,
        },
        filter: {
          duration: 0.32,
          ease: [0.18, 0.82, 0.38, 1] as const,
        },
      };

  const minimizedTransition = vtActive
    ? { default: ZERO_TWEEN }
    : {
        default: createWindowSpring({
          stiffness: 640,
          damping: 36,
          mass: 0.54,
        }),
      };

  return {
    spawn: {
      x: 0,
      scaleX: 0.84,
      scaleY: 0.8,
      y: 28,
      opacity: 0,
      rotateX: 12,
      filter: "blur(16px)",
    },
    idle: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
    },
    entering: {
      x: 0,
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
      x: 0,
      scaleX: 0.78,
      scaleY: 0.72,
      y: -24,
      opacity: 0,
      rotateX: -12,
      filter: "blur(18px)",
      transition: {
        default: createWindowSpring({
          damping: 26,
          stiffness: 640,
          mass: 0.68,
        }),
        opacity: createWindowSpring({ damping: 24, stiffness: 560, mass: 0.6 }),
        filter: createWindowSpring({ damping: 30, stiffness: 520, mass: 0.62 }),
      },
    },
    minimizing: {
      x: minimizeVector.x,
      y: minimizeVector.y,
      scaleX: minimizedSignature.scaleX,
      scaleY: minimizedSignature.scaleY,
      opacity: minimizedSignature.opacity,
      rotateX: minimizedSignature.rotateX,
      filter: minimizedSignature.filter,
      transition: minimizeTransition,
    },
    restoring: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: restoreTransition,
    },
    minimized: {
      x: minimizeVector.x,
      y: minimizeVector.y,
      ...minimizedSignature,
      transition: minimizedTransition,
    },
  } satisfies Variants;
}

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
  const dockHeight = dockRect?.height ?? 56;
  const minimizedSignature = useMemo<MinimizedSignature>(() => {
    const iconWidth = dockRect?.width ?? 72;
    const iconHeight = dockHeight;
    const baseScaleX = 0.18;
    const baseScaleY = 0.12;
    const scaledX = dockRect
      ? clamp(
          (iconWidth / win.bounds.w) * 2.1,
          baseScaleX * 0.85,
          baseScaleX * 1.6,
        )
      : baseScaleX;
    const scaledY = dockRect
      ? clamp(
          (iconHeight / win.bounds.h) * 3.1,
          baseScaleY * 0.8,
          baseScaleY * 1.8,
        )
      : baseScaleY;

    return {
      scaleX: Number(scaledX.toFixed(3)),
      scaleY: Number(scaledY.toFixed(3)),
      opacity: 0.08,
      rotateX: 12,
      filter: "blur(14px)",
    };
  }, [dockRect, dockHeight, win.bounds.h, win.bounds.w]);

  const minimizeVector = useMemo(() => {
    const windowCenterX = win.bounds.x + win.bounds.w / 2;
    const windowCenterY = win.bounds.y + win.bounds.h / 2;
    const targetX = dockOrigin.x;
    const targetY = dockOrigin.y + dockHeight * 0.06;
    const diffX = windowCenterX - dockOrigin.x;
    const diffY = windowCenterY - dockOrigin.y;
    return {
      x: targetX - (dockOrigin.x + minimizedSignature.scaleX * diffX),
      y: targetY - (dockOrigin.y + minimizedSignature.scaleY * diffY),
    };
  }, [
    dockHeight,
    dockOrigin.x,
    dockOrigin.y,
    minimizedSignature.scaleX,
    minimizedSignature.scaleY,
    win.bounds.x,
    win.bounds.y,
    win.bounds.w,
    win.bounds.h,
  ]);

  const viewTransitionActive = isWindowTransitionActive(win.id);
  const variants = useMemo(
    () =>
      createWindowVariants(
        minimizeVector,
        minimizedSignature,
        viewTransitionActive,
      ),
    [minimizeVector, minimizedSignature, viewTransitionActive],
  );

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

    if (
      variant === "minimizing" &&
      win.animationState === "minimizing" &&
      !viewTransitionActive
    ) {
      setAnimationState(win.id, "idle");
    }

    if (
      variant === "restoring" &&
      win.animationState === "restoring" &&
      !viewTransitionActive
    ) {
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
        variants={variants}
        data-win-id={win.id}
        data-app-id={win.appId}
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
