import { motion } from "motion/react";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  bladeCount?: number;
  speed?: number;
}

type Blade = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  delay: number;
};

const generateBlades = (bladeCount: number): Blade[] => {
  const center = 12;
  const radius = 8;
  const bladeWidth = 2.5;
  const bladeHeight = 7;

  return Array.from({ length: bladeCount }, (_, i) => {
    const angle = i * (360 / bladeCount);
    const x = center - bladeWidth / 2;
    const y = center - radius - bladeHeight / 2;
    return {
      x,
      y,
      width: bladeWidth,
      height: bladeHeight,
      angle,
      delay: -(1 - i / bladeCount),
    };
  });
};

export function Spinner({
  className,
  size = 24,
  bladeCount = 12,
  speed = 1,
  color = "currentColor",
  ...props
}: SpinnerProps) {
  const blades = generateBlades(bladeCount);
  const duration = 1 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <title>Loading...</title>
      {blades.map((blade: Blade) => (
        <motion.rect
          key={`blade#${blade.angle}`}
          x={blade.x}
          y={blade.y}
          width={blade.width}
          height={blade.height}
          fill={color}
          rx={blade.width / 2}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: [0.85, 0.25, 0.25] }}
          transition={{
            duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: blade.delay * duration,
            ease: "linear",
          }}
          transform={`rotate(${blade.angle}, 12, 12)`}
        />
      ))}
    </svg>
  );
}
