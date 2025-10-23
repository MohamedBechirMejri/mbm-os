"use client";

import { motion, type Transition, type Variants } from "motion/react";
import type React from "react";
import { useMemo, useRef } from "react";
import { focusWin, setAnimationState, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import { useDesktop } from "../../store";
import type { AnimationState, WinInstance } from "../../types";
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
  borderRadius: string;
}

const MINIMIZED_SCALE_FLOOR = 0.0001;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const pxToRem = (value: number) => `${(value / 16).toFixed(3)}rem`;

const createWindowSpring = (overrides?: Partial<Transition>): Transition => ({
  type: "spring",
  mass: 0.82,
  stiffness: 540,
  damping: 32,
  restDelta: 0.001,
  restSpeed: 0.001,
  ...overrides,
});

function createWindowVariants(
  minimizeVector: { x: number; y: number },
  minimizedSignature: MinimizedSignature,
): Variants {
  const minimizeTransition = {
    default: {
      duration: 0.56,
      ease: [0.19, 0.84, 0.36, 1] as const,
    },
    scaleX: {
      duration: 0.56,
      ease: [0.19, 0.84, 0.36, 1] as const,
    },
    scaleY: {
      duration: 0.56,
      ease: [0.19, 0.84, 0.36, 1] as const,
    },
    opacity: {
      duration: 0.36,
      ease: [0.24, 0.82, 0.38, 1] as const,
    },
    filter: {
      duration: 0.5,
      ease: [0.28, 0.8, 0.38, 1] as const,
    },
    rotateX: {
      duration: 0.52,
      ease: [0.24, 0.82, 0.42, 1] as const,
    },
    borderRadius: {
      duration: 0.4,
      ease: [0.26, 0.82, 0.4, 1] as const,
    },
  } satisfies Record<string, Transition>;

  const restoreTransition = {
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
    borderRadius: {
      duration: 0.34,
      ease: [0.2, 0.74, 0.32, 1] as const,
    },
  } satisfies Record<string, Transition>;

  const minimizedTransition = {
    default: createWindowSpring({
      stiffness: 640,
      damping: 36,
      mass: 0.54,
    }),
  };

  const collapseScaleX = Math.max(
    minimizedSignature.scaleX * 0.24,
    MINIMIZED_SCALE_FLOOR,
  );
  const collapseScaleY = Math.max(
    minimizedSignature.scaleY * 0.24,
    MINIMIZED_SCALE_FLOOR,
  );

  return {
    spawn: {
      x: 0,
      scaleX: 0.84,
      scaleY: 0.8,
      y: 28,
      opacity: 0,
      rotateX: 12,
      filter: "blur(16px)",
      borderRadius: "2rem",
    },
    idle: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      borderRadius: "2rem",
    },
    entering: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      borderRadius: "2rem",
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
      borderRadius: "2rem",
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
      x: [0, minimizeVector.x, minimizeVector.x],
      y: [0, minimizeVector.y, minimizeVector.y],
      scaleX: [1, minimizedSignature.scaleX, collapseScaleX],
      scaleY: [1, minimizedSignature.scaleY, collapseScaleY],
      opacity: [1, minimizedSignature.opacity, 0],
      rotateX: [0, minimizedSignature.rotateX, minimizedSignature.rotateX],
      filter: [
        "blur(0px)",
        minimizedSignature.filter,
        minimizedSignature.filter,
      ],
      borderRadius: [
        "23rem",
        minimizedSignature.borderRadius,
        minimizedSignature.borderRadius,
      ],
      transition: minimizeTransition,
      transitionEnd: {
        opacity: 0,
      },
    },
    restoring: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      borderRadius: "2rem",
      transition: restoreTransition,
    },
    minimized: {
      x: minimizeVector.x,
      y: minimizeVector.y,
      scaleX: collapseScaleX,
      scaleY: collapseScaleY,
      opacity: 0,
      rotateX: minimizedSignature.rotateX,
      filter: minimizedSignature.filter,
      borderRadius: minimizedSignature.borderRadius,
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
  const dockWidth = dockRect?.width ?? 72;
  const dockHeight = dockRect?.height ?? 56;
  const minimizedSignature = useMemo<MinimizedSignature>(() => {
    const iconWidth = dockWidth;
    const iconHeight = dockHeight;
    const dominantEdge = Math.max(iconWidth, iconHeight);
    const targetSize = clamp(dominantEdge * 0.94, 48, 88);
    const scaleX = clamp(targetSize / win.bounds.w, 0.06, 0.28);
    const scaleY = clamp(targetSize / win.bounds.h, 0.06, 0.28);
    const circleRadius = targetSize / 2;
    return {
      scaleX: Number(scaleX.toFixed(3)),
      scaleY: Number(scaleY.toFixed(3)),
      opacity: 0.24,
      rotateX: 6,
      filter: "blur(12px)",
      borderRadius: pxToRem(circleRadius),
    };
  }, [dockWidth, dockHeight, win.bounds.h, win.bounds.w]);

  const minimizeVector = useMemo(() => {
    const windowCenterX = win.bounds.x + win.bounds.w / 2;
    const windowCenterY = win.bounds.y + win.bounds.h / 2;
    const targetX = dockOrigin.x;
    const targetY = dockOrigin.y;
    const diffX = windowCenterX - dockOrigin.x;
    const diffY = windowCenterY - dockOrigin.y;
    return {
      x: targetX - (dockOrigin.x + minimizedSignature.scaleX * diffX),
      y: targetY - (dockOrigin.y + minimizedSignature.scaleY * diffY),
    };
  }, [
    dockOrigin.x,
    dockOrigin.y,
    minimizedSignature.scaleX,
    minimizedSignature.scaleY,
    win.bounds.x,
    win.bounds.y,
    win.bounds.w,
    win.bounds.h,
  ]);

  const minimizeVectorRef = useRef(minimizeVector);
  const minimizedSignatureRef = useRef(minimizedSignature);
  const previousAnimationStateRef = useRef<AnimationState | undefined>(
    win.animationState,
  );

  // Freeze minimizing target so unrelated re-renders don't restart the glide.
  if (
    win.animationState === "minimizing" &&
    previousAnimationStateRef.current !== "minimizing"
  ) {
    minimizeVectorRef.current = minimizeVector;
    minimizedSignatureRef.current = minimizedSignature;
  } else if (win.animationState !== "minimizing") {
    minimizeVectorRef.current = minimizeVector;
    minimizedSignatureRef.current = minimizedSignature;
  }

  previousAnimationStateRef.current = win.animationState;

  const vectorForAnimation =
    win.animationState === "minimizing"
      ? minimizeVectorRef.current
      : minimizeVector;

  const signatureForAnimation =
    win.animationState === "minimizing"
      ? minimizedSignatureRef.current
      : minimizedSignature;

  const variants = useMemo(
    () => createWindowVariants(vectorForAnimation, signatureForAnimation),
    [vectorForAnimation, signatureForAnimation],
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
          `bg-black/40 border border-[#484848] backdrop-blur-[1.4rem] ` +
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
