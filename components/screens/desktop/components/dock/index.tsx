"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  type MotionProps,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from "react";
import GlassSurface from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string;
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
  direction?: "top" | "middle" | "bottom";
  children: React.ReactNode;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

const dockVariants = cva(
  "mx-auto mt-8 flex min-h-[58px] w-max items-center justify-center gap-2 rounded-2xl",
);

interface DockContextValue {
  size: number;
  magnification: number;
  distance: number;
  mouseX: MotionValue<number>;
}

const DockContext = createContext<DockContextValue | null>(null);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = "middle",
      ...props
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);
    const contextValue = useMemo<DockContextValue>(
      () => ({
        size: iconSize,
        magnification: iconMagnification,
        distance: iconDistance,
        mouseX,
      }),
      [iconDistance, iconMagnification, iconSize, mouseX],
    );

    return (
      <DockContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          {...props}
          className={cn(dockVariants({ className }), "relative")}
        >
          <GlassSurface
            width={"max-content"}
            height={64}
            borderRadius={24}
            className="!overflow-visible"
            containerClassName={cn(
              "gap-2 px-3 py-2",
              direction === "top" && "!items-start",
              direction === "middle" && "!items-center",
              direction === "bottom" && "!items-end",
            )}
          >
            {children}
          </GlassSurface>
        </motion.div>
      </DockContext.Provider>
    );
  },
);

Dock.displayName = "Dock";

export interface DockIconProps
  extends Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, "children"> {
  size?: number;
  magnification?: number;
  distance?: number;
  mouseX?: MotionValue<number>;
  className?: string;
  children?: React.ReactNode;
  props?: PropsWithChildren;
}

const DockIcon = ({
  size,
  magnification,
  distance,
  mouseX,
  className,
  children,
  ...props
}: DockIconProps) => {
  const dock = useContext(DockContext);
  const effectiveSize = size ?? dock?.size ?? DEFAULT_SIZE;
  const effectiveMagnification =
    magnification ?? dock?.magnification ?? DEFAULT_MAGNIFICATION;
  const effectiveDistance = distance ?? dock?.distance ?? DEFAULT_DISTANCE;
  const ref = useRef<HTMLDivElement>(null);
  const padding = Math.max(6, effectiveSize * 0.2);
  const defaultMouseX = useMotionValue(Infinity);
  const sharedMouseX = mouseX ?? dock?.mouseX ?? defaultMouseX;
  const distanceCalc = useTransform(sharedMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(
    distanceCalc,
    [-effectiveDistance, 0, effectiveDistance],
    // Interpret small magnification values (<=10) as a scale factor; otherwise treat as absolute px.
    [
      effectiveSize,
      effectiveMagnification <= 10
        ? effectiveSize * effectiveMagnification
        : effectiveMagnification,
      effectiveSize,
    ],
  );

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize, padding }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };
