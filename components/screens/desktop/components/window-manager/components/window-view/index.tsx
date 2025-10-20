"use client";

import { motion, type Transition, type Variants } from "motion/react";
import type React from "react";
import { useMemo, useRef } from "react";
import { focusWin, setAnimationState, setWinState } from "../../api";
import { useWindowDrag, useWindowResize } from "../../hooks";
import { useDesktop } from "../../store";
import type { WinInstance } from "../../types";
import { isWindowTransitionActive } from "../../view-transitions";
import { createGenieProfile, type GenieProfile } from "./genie";
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
  scaleX: 0.52,
  scaleY: 0.24,
  opacity: 0,
  rotateX: 8,
  filter: "blur(12px)",
} as const;

const MINIMIZE_KEYFRAMES = {
  scaleX: [1, 0.98, 0.92, 0.78, MINIMIZED_SIGNATURE.scaleX],
  scaleY: [1, 0.94, 0.7, 0.42, MINIMIZED_SIGNATURE.scaleY],
  rotateX: [0, 1.8, 4.2, 6.4, MINIMIZED_SIGNATURE.rotateX],
  filter: ["blur(0px)", "blur(2px)", "blur(5px)", "blur(9px)", MINIMIZED_SIGNATURE.filter],
  opacity: [1, 1, 0.96, 0.4, MINIMIZED_SIGNATURE.opacity],
};

const RESTORE_KEYFRAMES = {
  scaleX: [MINIMIZED_SIGNATURE.scaleX, 0.74, 0.88, 0.98, 1],
  scaleY: [MINIMIZED_SIGNATURE.scaleY, 0.46, 0.74, 0.92, 1],
  rotateX: [MINIMIZED_SIGNATURE.rotateX, 6.2, 2.8, -1.2, 0],
  filter: [
    MINIMIZED_SIGNATURE.filter,
    "blur(10px)",
    "blur(5px)",
    "blur(1.2px)",
    "blur(0px)",
  ],
  opacity: [0, 0.38, 0.82, 1, 1],
};

const createWindowSpring = (overrides?: Partial<Transition>): Transition => ({
  type: "spring",
  mass: 0.82,
  stiffness: 540,
  damping: 32,
  restDelta: 0.001,
  restSpeed: 0.001,
  ...overrides,
});

const ZERO_TWEEN: Transition = { type: "tween", duration: 0.0001 };

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const linearEase = (t: number) => t;

function createWindowVariants(
  minimizeVector: { x: number; y: number },
  vtActive: boolean,
  genie: GenieProfile,
): Variants {
  const minimizeTransition = (
    vtActive
      ? { default: ZERO_TWEEN, filter: ZERO_TWEEN, clipPath: ZERO_TWEEN }
      : {
          default: {
            type: "tween",
            duration: genie.duration,
            ease: genie.ease,
          },
          filter: {
            duration: genie.duration * 0.8,
            ease: easeOutQuad,
          },
          scaleX: {
            duration: genie.duration,
            ease: genie.ease,
          },
          scaleY: {
            duration: genie.duration,
            ease: genie.ease,
          },
          rotateX: {
            duration: genie.duration,
            ease: genie.ease,
          },
          opacity: {
            duration: genie.duration,
            ease: [0.18, 0.48, 0.32, 0.94],
          },
          clipPath: {
            duration: genie.duration,
            ease: linearEase,
            times: genie.minimize.times,
          },
        }
  ) as Transition;

  const restoreTransition = (
    vtActive
      ? {
          default: ZERO_TWEEN,
          opacity: ZERO_TWEEN,
          filter: ZERO_TWEEN,
          clipPath: ZERO_TWEEN,
        }
      : {
          default: {
            type: "tween",
            duration: genie.duration * 0.86,
            ease: genie.ease,
          },
          opacity: {
            duration: genie.duration * 0.7,
            ease: [0.2, 0.7, 0.3, 1],
          },
          filter: {
            duration: genie.duration * 0.74,
            ease: easeOutQuad,
          },
          scaleX: {
            duration: genie.duration * 0.86,
            ease: genie.ease,
          },
          scaleY: {
            duration: genie.duration * 0.86,
            ease: genie.ease,
          },
          rotateX: {
            duration: genie.duration * 0.82,
            ease: genie.ease,
          },
          clipPath: {
            duration: genie.duration,
            ease: linearEase,
            times: genie.restore.times,
          },
        }
  ) as Transition;

  const minimizedTransition = (
    vtActive
      ? { default: ZERO_TWEEN, clipPath: ZERO_TWEEN }
      : {
          default: createWindowSpring({
            stiffness: 720,
            damping: 40,
            mass: 0.58,
          }),
          clipPath: { duration: 0.16, ease: easeOutQuad },
        }
  ) as Transition;

  return {
    spawn: {
      x: 0,
      scaleX: 0.84,
      scaleY: 0.8,
      y: 28,
      opacity: 0,
      rotateX: 12,
      filter: "blur(16px)",
      clipPath: genie.idleClip,
    },
    idle: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      clipPath: genie.idleClip,
    },
    entering: {
      x: 0,
      scaleX: 1,
      scaleY: 1,
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      clipPath: genie.idleClip,
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
      clipPath: genie.idleClip,
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
      scaleX: vtActive ? MINIMIZED_SIGNATURE.scaleX : MINIMIZE_KEYFRAMES.scaleX,
      scaleY: vtActive ? MINIMIZED_SIGNATURE.scaleY : MINIMIZE_KEYFRAMES.scaleY,
      opacity: vtActive ? MINIMIZED_SIGNATURE.opacity : MINIMIZE_KEYFRAMES.opacity,
      rotateX: vtActive ? MINIMIZED_SIGNATURE.rotateX : MINIMIZE_KEYFRAMES.rotateX,
      filter: vtActive ? MINIMIZED_SIGNATURE.filter : MINIMIZE_KEYFRAMES.filter,
      clipPath: vtActive ? genie.idleClip : genie.minimize.frames,
      transition: minimizeTransition,
      transitionEnd: vtActive
        ? undefined
        : { opacity: MINIMIZED_SIGNATURE.opacity, filter: MINIMIZED_SIGNATURE.filter },
    },
    restoring: {
      x: 0,
      y: 0,
      scaleX: vtActive ? 1 : RESTORE_KEYFRAMES.scaleX,
      scaleY: vtActive ? 1 : RESTORE_KEYFRAMES.scaleY,
      opacity: vtActive ? 1 : RESTORE_KEYFRAMES.opacity,
      rotateX: vtActive ? 0 : RESTORE_KEYFRAMES.rotateX,
      filter: vtActive ? "blur(0px)" : RESTORE_KEYFRAMES.filter,
      clipPath: vtActive ? genie.idleClip : genie.restore.frames,
      transition: restoreTransition,
    },
    minimized: {
      x: minimizeVector.x,
      y: minimizeVector.y,
      ...MINIMIZED_SIGNATURE,
      clipPath: vtActive ? genie.idleClip : genie.minimizedClip,
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
  const dockOriginX = dockOrigin.x - win.bounds.x;
  const dockOriginY = dockOrigin.y - win.bounds.y;
  const minimizeVector = useMemo(() => {
    const windowCenterX = win.bounds.x + win.bounds.w / 2;
    const windowCenterY = win.bounds.y + win.bounds.h / 2;
    const targetY = dockOrigin.y - dockHeight * 0.28;
    return {
      x: dockOrigin.x - windowCenterX,
      y: targetY - windowCenterY,
    };
  }, [
    dockHeight,
    dockOrigin.x,
    dockOrigin.y,
    win.bounds.x,
    win.bounds.y,
    win.bounds.w,
    win.bounds.h,
  ]);

  const viewTransitionActive = isWindowTransitionActive(win.id);
  const genieProfile = useMemo(() => {
    const anchorX = dockOriginX;
    const anchorY = dockOriginY + dockHeight * 0.35;
    return createGenieProfile({
      width: win.bounds.w,
      height: win.bounds.h,
      anchorX,
      anchorY,
    });
  }, [dockHeight, dockOriginX, dockOriginY, win.bounds.w, win.bounds.h]);

  const variants = useMemo(
    () =>
      createWindowVariants(minimizeVector, viewTransitionActive, genieProfile),
    [genieProfile, minimizeVector, viewTransitionActive],
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
          clipPath: genieProfile.idleClip,
          willChange: "transform, filter, opacity, clip-path",
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
