import { useEffect, useState } from 'react';

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [now, setNow] = useState<Date>(new Date());

  // Tick every second; super cheap and avoids stale static text
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // macOS lock screen vibe: Tue Jul 8 / 18:14
  const dateText = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeText = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // matches your screenshot; flip to true if you want 12‑hour
  });

  return (
    <div className="relative isolate z-10 flex flex-col items-center justify-between h-screen w-full">
      <h1 className="relative flex flex-col items-center justify-center text-8xl font-extrabold py-8 pt-32 tracking-tight text-white/95 antialiased font-['SF Pro Rounded','SF Pro Display','SF Pro',ui-rounded,-apple-system,system-ui,'Segoe UI Rounded','Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif]">
        <div className="relative w-full flex justify-center mb-3 md:mb-4">
          <svg
            className="block w-[min(92vw,820px)] h-[80px]"
            viewBox="0 0 1000 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="glassFillSmall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.78)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.52)" />
              </linearGradient>
              <filter id="glassFXSmall" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="alphaBlur" />
                <feSpecularLighting in="alphaBlur" surfaceScale="1.6" specularConstant="0.5" specularExponent="16" lightingColor="#ffffff" result="spec">
                  <fePointLight x="-1800" y="-900" z="4000" />
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOn" />
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="shadowBlur" />
                <feOffset in="shadowBlur" dx="0" dy="0.6" result="shadowOff" />
                <feComposite in="shadowOff" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
                <feMerge>
                  <feMergeNode in="innerShadow" />
                  <feMergeNode in="specOn" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softGlowSmall" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              fontSize="38"
              fontWeight="600"
              letterSpacing="0"
              fill="rgba(125,210,255,0.18)"
              filter="url(#softGlowSmall)"
              style={{ fontFamily: "'SF Pro','SF Pro Display','SF Pro Text',-apple-system,system-ui,'Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif" }}
            >
              {dateText}
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              fontSize="38"
              fontWeight="600"
              letterSpacing="0"
              fill="url(#glassFillSmall)"
              stroke="white"
              strokeOpacity="0.8"
              strokeWidth="1.5"
              filter="url(#glassFXSmall)"
              style={{ fontFamily: "'SF Pro','SF Pro Display','SF Pro Text',-apple-system,system-ui,'Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif" }}
            >
              {dateText}
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
              {/* Subtle vertical gradient for glass fill */}
              <linearGradient id="glassFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
              </linearGradient>

              {/* Bevel + inner shadow + specular highlight */}
              <filter id="glassFX" x="-50%" y="-50%" width="200%" height="200%">
                {/* specular highlight on the blurred alpha */}
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="alphaBlur" />
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
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOn" />

                {/* inner shadow */}
                <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="shadowBlur" />
                <feOffset in="shadowBlur" dx="0" dy="1.2" result="shadowOff" />
                <feComposite in="shadowOff" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />

                {/* merge order: inner shadow, spec, original glyphs */}
                <feMerge>
                  <feMergeNode in="innerShadow" />
                  <feMergeNode in="specOn" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* soft cyan glow underneath */}
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Glow layer */}
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              fontSize="150"
              fontWeight="800"
              letterSpacing="-0.02em"
              fill="rgba(125, 210, 255, 0.35)"
              filter="url(#softGlow)"
              style={{ fontFamily: "'SF Pro Rounded','SF Pro Display','SF Pro',-apple-system,system-ui,'Segoe UI Rounded','Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif" }}
            >
              {timeText}
            </text>

            {/* Highlight stripe across top half (specular sweep) */}
            <rect x="140" y="20" width="720" height="90" rx="45" fill="rgba(255,255,255,0.08)" />

            {/* Main glassy text */}
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
              style={{ fontFamily: "'SF Pro Rounded','SF Pro Display','SF Pro',-apple-system,system-ui,'Segoe UI Rounded','Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif" }}
            >
              {timeText}
            </text>
          </svg>
        </div>
      </h1>

      <div></div>
    </div>
  );
}
