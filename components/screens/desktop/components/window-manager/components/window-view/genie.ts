import { clamp } from "../../utils";

const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" as const;
const GENIE_DURATION = 0.58;
const GENIE_EASE = [0.22, 0.61, 0.36, 1] as const;

interface GenieFrameSet {
  frames: string[];
  times: number[];
}

export interface GenieProfile {
  idleClip: string;
  minimizedClip: string;
  minimize: GenieFrameSet;
  restore: GenieFrameSet;
  duration: number;
  ease: readonly number[];
}

interface GenieOptions {
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function curveEase(progress: number) {
  return 1 - (1 - progress) ** 2.4;
}

function curveEaseIn(progress: number) {
  return progress ** 1.4;
}

function geniePolygon(
  progress: number,
  anchorXPct: number,
  anchorYPct: number,
): string {
  const eased = curveEase(progress);
  const easedIn = curveEaseIn(progress);

  const topInset = easedIn * 5.5; // pull top corners inward slightly
  const bellyWidth = 100 - eased * 18;
  const neckWidth = 100 - eased * 62;
  const tailWidth = clamp(100 - eased * 88, 6, 42);

  const bellyY = lerp(46, 60, eased);
  const neckY = lerp(70, 82, eased);
  const tailBaseY = clamp(lerp(84, anchorYPct, eased), neckY + 4, anchorYPct);
  const tailPointY = clamp(
    tailBaseY + lerp(2, 9, eased),
    tailBaseY,
    anchorYPct + 10,
  );

  const topLeft = clamp(0 + topInset, 0, 40);
  const topRight = clamp(100 - topInset, 60, 100);

  const bellyLeft = clamp(anchorXPct - bellyWidth / 2, -10, 100);
  const bellyRight = clamp(anchorXPct + bellyWidth / 2, 0, 110);

  const neckLeft = clamp(anchorXPct - neckWidth / 2, -14, 100);
  const neckRight = clamp(anchorXPct + neckWidth / 2, 0, 114);

  const tailLeft = clamp(anchorXPct - tailWidth / 2, -18, 100);
  const tailRight = clamp(anchorXPct + tailWidth / 2, 0, 118);

  return `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bellyRight}% ${bellyY}%, ${neckRight}% ${neckY}%, ${tailRight}% ${tailBaseY}%, ${anchorXPct}% ${tailPointY}%, ${tailLeft}% ${tailBaseY}%, ${neckLeft}% ${neckY}%, ${bellyLeft}% ${bellyY}%)`;
}

export function createGenieProfile(options: GenieOptions): GenieProfile {
  const { width, height, anchorX, anchorY } = options;
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);

  const anchorXPct = clamp((anchorX / safeWidth) * 100, 4, 96);
  const anchorYPct = clamp((anchorY / safeHeight) * 100, 88, 140);

  const times = [0, 0.22, 0.45, 0.68, 1];
  const frames = times.map((t) => geniePolygon(t, anchorXPct, anchorYPct));

  const restoreFrames = [...frames].reverse();

  return {
    idleClip: FULL_CLIP,
    minimizedClip: frames[frames.length - 1] ?? FULL_CLIP,
    minimize: { frames, times },
    restore: { frames: restoreFrames, times },
    duration: GENIE_DURATION,
    ease: GENIE_EASE,
  } satisfies GenieProfile;
}

export { FULL_CLIP, GENIE_DURATION, GENIE_EASE };
