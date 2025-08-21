import { ArrowRight, Battery, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

// Font families used throughout the component
const APPLE_FONT_STACK =
  "'SF Pro Rounded','SF Pro Display','SF Pro',-apple-system,system-ui,'Segoe UI Rounded','Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif";
const APPLE_TEXT_FONT_STACK =
  "'SF Pro','SF Pro Display','SF Pro Text',-apple-system,system-ui,'Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif";

export default function LoginScreen({
  onSuccess: _onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [now, setNow] = useState<Date>(new Date());

  // Login UI state
  const [pwd, setPwd] = useState("");
  const [displayPwd, setDisplayPwd] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [caps, setCaps] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isReadonly, setIsReadonly] = useState(true);

  // Submit logic: succeed on any non-empty password after a short verify
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pwd.trim()) {
      setWrong(true);
      // brief shake
      setTimeout(() => setWrong(false), 360);
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      _onSuccess?.();
    }, 900);
  };

  // CapsLock detection and Enter-to-submit
  const onPwdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) setCaps(true);
    else setCaps(false);
    if (e.key === "Enter") submit();
  };

  // Update time every second to keep the display current
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Format date and time in macOS lock screen style
  const dateText = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeText = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="relative isolate z-10 flex flex-col items-center justify-between h-screen w-full select-none">
      {/* Hidden SVG defs for liquid glass */}
      <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
        <defs>
          {/* Edge specular highlight */}
          <filter id="liquidGlassSpec">
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation="0.8"
              result="alphaBlur"
            />
            <feSpecularLighting
              in="alphaBlur"
              surfaceScale="2.2"
              specularConstant="0.55"
              specularExponent="18"
              lightingColor="#ffffff"
              result="spec"
            >
              <fePointLight x="-2200" y="-1400" z="5000" />
            </feSpecularLighting>
            <feComposite
              in="spec"
              in2="SourceAlpha"
              operator="in"
              result="specOn"
            />
            <feMerge>
              <feMergeNode in="specOn" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle displacement to simulate refraction */}
          <filter
            id="liquidGlassDisplace"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
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
              {dateText}
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
              <filter
                id="softGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
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
              {timeText}
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
              {timeText}
            </text>
          </svg>
        </div>
      </h1>

      {/* Vignette overlay to improve text legibility on bright videos */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_65%,rgba(0,0,0,0.45)_100%)]" />

      {/* Top-right status: Wi‑Fi + Battery (no clock) */}
      <div
        className="absolute top-3 right-4 flex items-center gap-3 text-white/85 text-sm"
        style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
      >
        <Wifi size={18} className="opacity-90" />
        <Battery size={20} className="opacity-90" />
      </div>

      {/* Center login tile */}
      <form
        onSubmit={submit}
        className="relative z-10 -mt-8 flex flex-col items-center gap-3"
        style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
      >
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
            👤
          </div>
        </div>
        <div className="text-white/90 text-lg font-medium">Guest</div>

        {/* Password field */}
        <div
          className={`relative w-[min(86vw,440px)] transition-all ${wrong ? "shake" : ""}`}
          style={{ filter: "url(#liquidGlassDisplace)" }}
        >
          {/* Decoy field to confuse password managers */}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            tabIndex={-1}
            style={{
              position: "absolute",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none",
            }}
            readOnly
          />

          {/* Liquid glass overlay (specular + sweep) */}
          <svg
            className="pointer-events-none absolute inset-0 h-12 w-full rounded-lg opacity-0 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.35)]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lg-spec-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              rx="18"
              fill="rgba(255,255,255,0.06)"
              filter="url(#liquidGlassSpec)"
            />
            <rect
              x="-100"
              y="18"
              width="200"
              height="22"
              fill="url(#lg-spec-sweep)"
            >
              <animate
                attributeName="x"
                values="-100;100"
                dur="1.8s"
                repeatCount="1"
                fill="freeze"
              />
            </rect>
          </svg>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            name="not-a-password"
            form="non-existent-form"
            readOnly={isReadonly}
            onFocus={() => setIsReadonly(false)}
            onBlur={() => setIsReadonly(true)}
            aria-label="Password"
            placeholder="Enter password"
            value={displayPwd}
            onChange={(e) => {
              const newValue = e.target.value;
              const currentLength = displayPwd.length;
              const newLength = newValue.length;

              if (newLength > currentLength) {
                // Adding characters
                const addedChars = newValue.slice(currentLength);
                setPwd(pwd + addedChars);
                setDisplayPwd(displayPwd + "•".repeat(addedChars.length));
              } else if (newLength < currentLength) {
                // Removing characters
                const removedCount = currentLength - newLength;
                setPwd(pwd.slice(0, -removedCount));
                setDisplayPwd(displayPwd.slice(0, -removedCount));
              }
            }}
            onKeyDown={onPwdKeyDown}
            disabled={verifying}
            className="w-full h-12 pl-4 pr-12 text-[15px] rounded-2xl text-white/95 placeholder-white/60 tracking-wide outline-none
                       bg-white/5 backdrop-blur-xl saturate-150 ring-1 ring-white/25 focus:ring-2 focus:ring-cyan-200/60
                       shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)]"
          />
          {!verifying && (
            <button
              type="submit"
              aria-label="Unlock"
              disabled={!pwd.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-xl
                         bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xl ring-1 ring-white/20
                         text-white/95 transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowRight size={18} />
            </button>
          )}
          {/* Spinner overlay while verifying */}
          {verifying && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/20">
              <svg
                className="animate-spin"
                width="22"
                height="22"
                viewBox="0 0 24 24"
              >
                <title>Loading...</title>
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="white"
                  strokeOpacity="0.25"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M21 12a9 9 0 0 1-9 9"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          {/* CapsLock hint */}
          {caps && !verifying && (
            <div className="absolute -bottom-6 left-1 text-xs text-amber-200/90">
              Caps Lock is on
            </div>
          )}
        </div>

        {/* Touch ID / hint row */}
        <div className="h-6 flex items-center gap-3 text-white/70 text-sm">
          <span className="select-none">Use Touch ID or Enter Password</span>
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-xs ring-1 ring-white/25"
          >
            ?
          </button>
          {showHint && (
            <span className="text-white/80 text-xs">Hint: Anything</span>
          )}
        </div>
      </form>

      {/* Local styles for shake animation */}
      <style>{`
        @keyframes login-shake {
          0% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-6px) }
          80% { transform: translateX(6px) }
          100% { transform: translateX(0) }
        }
        .shake { animation: login-shake 320ms cubic-bezier(.36,.07,.19,.97) both }
      `}</style>
    </div>
  );
}
