import { APPLE_FONT_STACK, APPLE_TEXT_FONT_STACK } from "../constants/fonts";
import type { TimeDisplayProps } from "../types";

export default function TimeDisplay({ date, time }: TimeDisplayProps) {
  return (
    <h1
      className="relative flex flex-col items-center justify-center text-8xl font-extrabold py-8 pt-24 tracking-tight"
      style={{ fontFamily: APPLE_FONT_STACK }}
    >
      <div className="relative w-full flex justify-center -mb-4">
        <svg
          className="block w-[min(92vw,820px)] h-[80px]"
          viewBox="0 0 1000 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Date text gradient */}
            <linearGradient id="glassFillSmall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.78)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.52)" />
            </linearGradient>

            {/* Date text glass effects */}
            <filter
              id="glassFXSmall"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="0.8"
                result="alphaBlur"
              />
              <feSpecularLighting
                in="alphaBlur"
                surfaceScale="1.6"
                specularConstant="0.5"
                specularExponent="16"
                lightingColor="#ffffff"
                result="spec"
              >
                <fePointLight x="-1800" y="-900" z="4000" />
              </feSpecularLighting>
              <feComposite
                in="spec"
                in2="SourceAlpha"
                operator="in"
                result="specOn"
              />
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="1.1"
                result="shadowBlur"
              />
              <feOffset in="shadowBlur" dx="0" dy="0.6" result="shadowOff" />
              <feComposite
                in="shadowOff"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="innerShadow"
              />
              <feMerge>
                <feMergeNode in="innerShadow" />
                <feMergeNode in="specOn" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Date text soft glow */}
            <filter
              id="softGlowSmall"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* Date text glow layer */}
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            fontSize="38"
            fontWeight="500"
            letterSpacing="0"
            fill="rgba(125,210,255,0.18)"
            filter="url(#softGlowSmall)"
            style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
          >
            {date}
          </text>

          {/* Date text main layer */}
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            fontSize="38"
            fontWeight="500"
            letterSpacing="0"
            fill="url(#glassFillSmall)"
            stroke="white"
            strokeOpacity="0.8"
            strokeWidth="1.5"
            filter="url(#glassFXSmall)"
            style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
          >
            {date}
          </text>
        </svg>
      </div>
      <div className="relative leading-none w-full flex justify-center">
        <svg
          className="block w-[min(92vw,980px)] h-[200px]"
          viewBox="0 0 1000 220"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Time text gradient fill */}
            <linearGradient id="glassFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
            </linearGradient>

            {/* Time text glass effects with bevel, inner shadow, and specular highlight */}
            <filter id="glassFX" x="-50%" y="-50%" width="200%" height="200%">
              {/* Specular highlight */}
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="1.2"
                result="alphaBlur"
              />
              <feSpecularLighting
                in="alphaBlur"
                surfaceScale="3"
                specularConstant="0.55"
                specularExponent="22"
                lightingColor="#ffffff"
                result="spec"
              >
                <fePointLight x="-2500" y="-1200" z="6000" />
              </feSpecularLighting>
              <feComposite
                in="spec"
                in2="SourceAlpha"
                operator="in"
                result="specOn"
              />

              {/* Inner shadow */}
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="2.2"
                result="shadowBlur"
              />
              <feOffset in="shadowBlur" dx="0" dy="1.2" result="shadowOff" />
              <feComposite
                in="shadowOff"
                in2="SourceAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
                result="innerShadow"
              />

              {/* Combine effects */}
              <feMerge>
                <feMergeNode in="innerShadow" />
                <feMergeNode in="specOn" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Time text soft cyan glow */}
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Time text glow layer */}
          <text
            x="50%"
            y="57%"
            textAnchor="middle"
            fontSize="150"
            fontWeight="800"
            letterSpacing="-0.02em"
            fill="rgba(125, 210, 255, 0.35)"
            filter="url(#softGlow)"
            style={{ fontFamily: APPLE_FONT_STACK }}
          >
            {time}
          </text>

          {/* Highlight stripe for specular sweep effect */}
          <rect
            x="140"
            y="20"
            width="720"
            height="90"
            rx="45"
            fill="rgba(255,255,255,0.08)"
          />
          {/* Time text main glassy layer */}
          <text
            x="50%"
            y="57%"
            textAnchor="middle"
            fontSize="150"
            fontWeight="800"
            letterSpacing="-0.02em"
            fill="url(#glassFill)"
            stroke="white"
            strokeOpacity="0.9"
            strokeWidth="3"
            filter="url(#glassFX)"
            style={{ fontFamily: APPLE_FONT_STACK }}
          >
            {time}
          </text>
        </svg>
      </div>
    </h1>
  );
}
