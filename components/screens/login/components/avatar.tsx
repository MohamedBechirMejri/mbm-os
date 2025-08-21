import type { AvatarProps } from "../types";

export default function Avatar({ username = "Guest", avatar }: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div
        className="relative w-28 h-28 rounded-full overflow-hidden ring-1 ring-white/25 bg-white/5 backdrop-blur-xl saturate-150"
        style={{ filter: "url(#liquidGlassDisplace)" }}
      >
        {/* Liquid glass overlay for avatar */}
        <svg
          className="pointer-events-none absolute inset-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="avatar-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="50"
            fill="rgba(255,255,255,0.08)"
            filter="url(#liquidGlassSpec)"
          />
          <rect
            x="-100"
            y="22"
            width="200"
            height="18"
            fill="url(#avatar-sheen)"
          >
            <animate
              attributeName="x"
              values="-100;100"
              dur="1.6s"
              repeatCount="1"
              fill="freeze"
            />
          </rect>
        </svg>
        {/* Avatar content */}
        <div className="w-full h-full flex items-center justify-center text-3xl text-white/90">
          {avatar || "👤"}
        </div>
      </div>
      <div className="text-white/90 text-lg font-medium">{username}</div>
    </div>
  );
}
