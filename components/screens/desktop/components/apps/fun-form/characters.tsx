"use client";

import { motion } from "framer-motion";

export type CharacterMood =
  | "idle"
  | "watching"
  | "happy"
  | "sad"
  | "looking-away"
  | "excited";

interface CharacterProps {
  eyeOffset: { x: number; y: number };
  mood: CharacterMood;
}

// ---------------------------------------------------------------------------
// Transition configs (stable refs so repeating animations don't restart)
// ---------------------------------------------------------------------------

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };
const soft = { type: "spring" as const, stiffness: 120, damping: 16 };

// Each character breathes at its own rhythm
const ORANGE_BREATH = { y: [0, -4, 0], scaleY: [1, 1.015, 1] };
const ORANGE_BREATH_T = {
  duration: 4,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const PURPLE_BREATH = { y: [0, -3, 0], rotate: [0, -1.5, 0, 1.5, 0] };
const PURPLE_BREATH_T = {
  duration: 5,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const BLACK_BREATH = { y: [0, -2.5, 0], scaleY: [1, 1.02, 1] };
const BLACK_BREATH_T = {
  duration: 3.2,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const YELLOW_BREATH = { y: [0, -3.5, 0], scaleX: [1, 1.01, 1] };
const YELLOW_BREATH_T = {
  duration: 2.8,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

// Each character blinks at a different rate
const BLINK = { scaleY: [1, 0.05, 1] };
const ORANGE_BLINK_T = {
  duration: 0.18,
  repeat: Infinity,
  repeatDelay: 3.5,
  ease: "easeInOut" as const,
};
const PURPLE_BLINK_T = {
  duration: 0.18,
  repeat: Infinity,
  repeatDelay: 4.2,
  ease: "easeInOut" as const,
};
const BLACK_BLINK_T = {
  duration: 0.2,
  repeat: Infinity,
  repeatDelay: 2.8,
  ease: "easeInOut" as const,
};
const YELLOW_BLINK_T = {
  duration: 0.15,
  repeat: Infinity,
  repeatDelay: 5.5,
  ease: "easeInOut" as const,
};

const EXCITED_T = {
  duration: 0.6,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function eyeShift(
  offset: { x: number; y: number },
  mood: CharacterMood,
  max: number,
) {
  if (mood === "looking-away") return { x: -max * 1.4, y: -max * 0.3 };
  if (mood === "sad") return { x: offset.x * max * 0.25, y: max * 0.5 };
  if (mood === "excited") return { x: offset.x * max * 0.4, y: offset.y * max * 0.3 };
  return { x: offset.x * max, y: offset.y * max * 0.6 };
}

function mouthCurve(mood: CharacterMood, scale: number): number {
  const curves: Record<CharacterMood, number> = {
    happy: 16,
    excited: 20,
    sad: -12,
    "looking-away": -5,
    idle: 7,
    watching: 9,
  };
  return curves[mood] * scale;
}

function bodyTransition(mood: CharacterMood) {
  if (mood === "excited")
    return { default: EXCITED_T, rotate: soft, x: soft };
  return soft;
}

// ---------------------------------------------------------------------------
// Orange dome — the big friendly one
// ---------------------------------------------------------------------------

function OrangeCharacter({ eyeOffset, mood }: CharacterProps) {
  const s = eyeShift(eyeOffset, mood, 7);
  const mc = mouthCurve(mood, 1);
  const lean = eyeOffset.x * 2;
  const squint = mood === "happy" || mood === "looking-away";
  const eyeR = mood === "excited" ? 9 : squint ? 3 : mood === "sad" ? 5 : 7;

  const body =
    mood === "excited"
      ? {
          y: [0, -14, 3, -8, 0],
          scaleX: [1, 1.06, 0.96, 1.02, 1],
          scaleY: [1, 0.9, 1.08, 0.98, 1],
          rotate: lean,
          x: 0,
        }
      : mood === "happy"
        ? { y: -4, scaleX: 1.02, scaleY: 1.03, rotate: lean, x: 0 }
        : mood === "sad"
          ? { y: 10, scaleX: 1.04, scaleY: 0.92, rotate: lean * 0.2, x: 5 }
          : mood === "looking-away"
            ? { y: 0, scaleX: 0.96, scaleY: 1, rotate: lean * 0.2, x: -10 }
            : mood === "watching"
              ? {
                  y: 0,
                  scaleX: 1,
                  scaleY: 1,
                  rotate: lean * 1.5,
                  x: eyeOffset.x * 5,
                }
              : { y: 0, scaleX: 1, scaleY: 1, rotate: lean, x: 0 };

  return (
    <motion.g
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...soft, delay: 0.15 }}
    >
      {/* Mood reaction: bounce / squash / lean */}
      <motion.g
        style={{ transformOrigin: "195px 430px" }}
        animate={body}
        transition={bodyTransition(mood)}
      >
        {/* Idle breathing */}
        <motion.g
          style={{ transformOrigin: "195px 430px" }}
          animate={ORANGE_BREATH}
          transition={ORANGE_BREATH_T}
        >
          <ellipse
            cx="195"
            cy="500"
            rx="180"
            ry="165"
            fill="url(#orange-grad)"
            filter="url(#char-shadow)"
          />

          {/* Eyes: tracking wrapper → blink wrapper → pupils */}
          <motion.g animate={{ x: s.x, y: s.y }} transition={spring}>
            <motion.g
              style={{ transformOrigin: "189px 375px" }}
              animate={BLINK}
              transition={ORANGE_BLINK_T}
            >
              <motion.circle
                fill="#2A1A0A"
                cx={162}
                cy={375}
                animate={{ r: eyeR }}
                transition={spring}
              />
              <motion.circle
                fill="#2A1A0A"
                cx={216}
                cy={375}
                animate={{ r: eyeR }}
                transition={spring}
              />
            </motion.g>
          </motion.g>

          {/* Mouth */}
          <motion.path
            fill="none"
            stroke="#2A1A0A"
            strokeWidth={2.5}
            strokeLinecap="round"
            animate={{ d: `M 165,402 Q 190,${402 + mc} 215,402` }}
            transition={spring}
          />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Purple rectangle — the tall dramatic one
// ---------------------------------------------------------------------------

function PurpleCharacter({ eyeOffset, mood }: CharacterProps) {
  const s = eyeShift(eyeOffset, mood, 6);
  const mc = mouthCurve(mood, 0.65);
  const eyeR =
    mood === "looking-away"
      ? 2.5
      : mood === "excited"
        ? 7
        : mood === "sad"
          ? 4
          : 5;
  const tilt =
    mood === "happy"
      ? -12
      : mood === "sad"
        ? 7
        : mood === "excited"
          ? eyeOffset.x * 3
          : eyeOffset.x * 2.5;

  const body =
    mood === "excited"
      ? {
          y: [0, -20, 5, -12, 0],
          scaleX: [1, 0.95, 1.05, 0.98, 1],
          scaleY: [1, 0.86, 1.14, 0.95, 1],
          rotate: tilt,
          x: 0,
        }
      : mood === "happy"
        ? { y: -8, scaleX: 1, scaleY: 1.04, rotate: tilt, x: 0 }
        : mood === "sad"
          ? { y: 6, scaleX: 1.03, scaleY: 0.93, rotate: tilt, x: 3 }
          : mood === "looking-away"
            ? { y: 0, scaleX: 0.94, scaleY: 1, rotate: tilt, x: -6 }
            : mood === "watching"
              ? {
                  y: -2,
                  scaleX: 1,
                  scaleY: 1.01,
                  rotate: tilt,
                  x: eyeOffset.x * 3,
                }
              : { y: 0, scaleX: 1, scaleY: 1, rotate: tilt, x: 0 };

  return (
    <motion.g
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={soft}
    >
      <motion.g
        style={{ transformOrigin: "170px 370px" }}
        animate={body}
        transition={bodyTransition(mood)}
      >
        <motion.g
          style={{ transformOrigin: "170px 200px" }}
          animate={PURPLE_BREATH}
          transition={PURPLE_BREATH_T}
        >
          <rect
            x="105"
            y="55"
            width="130"
            height="320"
            rx="18"
            fill="url(#purple-grad)"
            filter="url(#char-shadow)"
          />

          <motion.g animate={{ x: s.x, y: s.y }} transition={spring}>
            <motion.g
              style={{ transformOrigin: "173px 140px" }}
              animate={BLINK}
              transition={PURPLE_BLINK_T}
            >
              <motion.circle
                fill="#1A1040"
                cx={148}
                cy={140}
                animate={{ r: eyeR }}
                transition={spring}
              />
              <motion.circle
                fill="#1A1040"
                cx={198}
                cy={140}
                animate={{ r: eyeR }}
                transition={spring}
              />
            </motion.g>
          </motion.g>

          <motion.path
            fill="none"
            stroke="#1A1040"
            strokeWidth={2}
            strokeLinecap="round"
            animate={{ d: `M 152,180 Q 172,${180 + mc} 192,180` }}
            transition={spring}
          />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Black rectangle — the one with the big expressive white eyes
// ---------------------------------------------------------------------------

function BlackCharacter({ eyeOffset, mood }: CharacterProps) {
  const s = eyeShift(eyeOffset, mood, 4);
  const lean = eyeOffset.x * 1.5;

  // Eye socket sizing reacts to mood
  const socketRx =
    mood === "excited"
      ? 12
      : mood === "sad"
        ? 9
        : mood === "looking-away"
          ? 7
          : 10;
  const socketRy =
    mood === "excited"
      ? 15
      : mood === "sad"
        ? 7
        : mood === "looking-away"
          ? 5
          : 12;
  const pupilR = mood === "sad" ? 6 : mood === "excited" ? 4 : 5;

  const body =
    mood === "excited"
      ? {
          y: [0, -10, 2, -6, 0],
          scaleX: [1, 1.05, 0.96, 1.02, 1],
          scaleY: [1, 0.92, 1.08, 0.97, 1],
          rotate: lean,
          x: 0,
        }
      : mood === "happy"
        ? { y: -3, scaleX: 1, scaleY: 1.02, rotate: lean, x: 0 }
        : mood === "sad"
          ? { y: 6, scaleX: 1.02, scaleY: 0.95, rotate: lean * 0.3, x: -3 }
          : mood === "looking-away"
            ? { y: 0, scaleX: 0.95, scaleY: 1, rotate: lean * 0.2, x: -5 }
            : mood === "watching"
              ? {
                  y: -1,
                  scaleX: 1,
                  scaleY: 1,
                  rotate: lean,
                  x: eyeOffset.x * 3,
                }
              : { y: 0, scaleX: 1, scaleY: 1, rotate: lean, x: 0 };

  return (
    <motion.g
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...soft, delay: 0.25 }}
    >
      <motion.g
        style={{ transformOrigin: "269px 380px" }}
        animate={body}
        transition={bodyTransition(mood)}
      >
        <motion.g
          style={{ transformOrigin: "269px 320px" }}
          animate={BLACK_BREATH}
          transition={BLACK_BREATH_T}
        >
          <rect
            x="228"
            y="205"
            width="82"
            height="200"
            rx="13"
            fill="#1A1A1A"
            filter="url(#char-shadow)"
          />

          {/* Blink wraps everything: sockets + pupils + highlights */}
          <motion.g
            style={{ transformOrigin: "269px 278px" }}
            animate={BLINK}
            transition={BLACK_BLINK_T}
          >
            {/* White eye sockets (size reacts to mood) */}
            <motion.ellipse
              fill="white"
              cx={253}
              cy={278}
              animate={{ rx: socketRx, ry: socketRy }}
              transition={spring}
            />
            <motion.ellipse
              fill="white"
              cx={289}
              cy={278}
              animate={{ rx: socketRx, ry: socketRy }}
              transition={spring}
            />

            {/* Pupils (track cursor within sockets) */}
            <motion.circle
              fill="#0A0A0A"
              animate={{ cx: 253 + s.x, cy: 278 + s.y, r: pupilR }}
              transition={spring}
            />
            <motion.circle
              fill="#0A0A0A"
              animate={{ cx: 289 + s.x, cy: 278 + s.y, r: pupilR }}
              transition={spring}
            />

            {/* Tiny glossy highlights (parallax within pupils) */}
            <motion.circle
              fill="white"
              opacity={0.6}
              r={1.5}
              animate={{
                cx: 251 + s.x * 0.4,
                cy: 275 + s.y * 0.4,
              }}
              transition={spring}
            />
            <motion.circle
              fill="white"
              opacity={0.6}
              r={1.5}
              animate={{
                cx: 287 + s.x * 0.4,
                cy: 275 + s.y * 0.4,
              }}
              transition={spring}
            />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Yellow blob — the small beak creature
// ---------------------------------------------------------------------------

function YellowCharacter({ eyeOffset, mood }: CharacterProps) {
  const s = eyeShift(eyeOffset, mood, 4);
  const lean = eyeOffset.x * 1.5;
  const eyeR = mood === "looking-away" ? 2.5 : mood === "excited" ? 7 : 5;

  // Beak opens when excited, tilts with mood
  const beakTilt = mood === "happy" ? -6 : mood === "sad" ? 6 : 0;
  const beakOpen = mood === "excited" ? 4 : 0;

  const body =
    mood === "excited"
      ? {
          y: [0, -16, 5, -9, 0],
          scaleX: [1, 0.95, 1.05, 0.98, 1],
          scaleY: [1, 0.88, 1.12, 0.96, 1],
          rotate: lean,
          x: 0,
        }
      : mood === "happy"
        ? { y: -5, scaleX: 1.02, scaleY: 1.03, rotate: lean, x: 0 }
        : mood === "sad"
          ? { y: 8, scaleX: 1.03, scaleY: 0.93, rotate: lean * 0.3, x: -8 }
          : mood === "looking-away"
            ? { y: 0, scaleX: 0.95, scaleY: 1, rotate: lean * 0.2, x: -6 }
            : mood === "watching"
              ? {
                  y: -2,
                  scaleX: 1,
                  scaleY: 1,
                  rotate: lean,
                  x: eyeOffset.x * 4,
                }
              : { y: 0, scaleX: 1, scaleY: 1, rotate: lean, x: 0 };

  return (
    <motion.g
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...soft, delay: 0.35 }}
    >
      <motion.g
        style={{ transformOrigin: "350px 400px" }}
        animate={body}
        transition={bodyTransition(mood)}
      >
        <motion.g
          style={{ transformOrigin: "350px 400px" }}
          animate={YELLOW_BREATH}
          transition={YELLOW_BREATH_T}
        >
          <ellipse
            cx="350"
            cy="405"
            rx="68"
            ry="92"
            fill="url(#yellow-grad)"
            filter="url(#char-shadow)"
          />

          <motion.g animate={{ x: s.x, y: s.y }} transition={spring}>
            <motion.g
              style={{ transformOrigin: "343px 358px" }}
              animate={BLINK}
              transition={YELLOW_BLINK_T}
            >
              <motion.circle
                fill="#1A1000"
                cx={343}
                cy={358}
                animate={{ r: eyeR }}
                transition={spring}
              />
            </motion.g>
          </motion.g>

          {/* Beak: two lines that spread apart when excited */}
          <motion.path
            fill="none"
            stroke="#1A1000"
            strokeWidth={2.5}
            strokeLinecap="round"
            animate={{
              d: `M 333,${380 - beakOpen} L 372,${380 + beakTilt - beakOpen}`,
            }}
            transition={spring}
          />
          <motion.path
            fill="none"
            stroke="#1A1000"
            strokeWidth={2.5}
            strokeLinecap="round"
            animate={{
              d: `M 333,${380 + beakOpen} L 372,${380 + beakTilt + beakOpen}`,
            }}
            transition={spring}
          />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

// ---------------------------------------------------------------------------
// Composed group
// ---------------------------------------------------------------------------

export function CharacterGroup({ eyeOffset, mood }: CharacterProps) {
  return (
    <svg
      viewBox="0 0 440 480"
      className="w-full h-full select-none pointer-events-none"
      overflow="hidden"
      role="img"
      aria-label="Four cute characters reacting to form interactions"
    >
      <defs>
        <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8C1A" />
          <stop offset="100%" stopColor="#E86800" />
        </linearGradient>
        <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4FD8" />
          <stop offset="100%" stopColor="#4A2FB0" />
        </linearGradient>
        <linearGradient id="yellow-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE033" />
          <stop offset="100%" stopColor="#F5C800" />
        </linearGradient>
        <filter
          id="char-shadow"
          x="-30%"
          y="-20%"
          width="160%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodOpacity="0.08"
          />
        </filter>
      </defs>

      {/* Render order = z-order: back to front */}
      <PurpleCharacter eyeOffset={eyeOffset} mood={mood} />
      <OrangeCharacter eyeOffset={eyeOffset} mood={mood} />
      <BlackCharacter eyeOffset={eyeOffset} mood={mood} />
      <YellowCharacter eyeOffset={eyeOffset} mood={mood} />
    </svg>
  );
}
