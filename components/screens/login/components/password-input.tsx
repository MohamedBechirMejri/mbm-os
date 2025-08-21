import { ArrowRight } from "lucide-react";
import type { PasswordInputProps } from "../types";

export default function PasswordInput({
  value,
  displayValue,
  onValueChange,
  onSubmit,
  verifying,
  wrong,
  caps,
  showHint,
  onToggleHint,
}: PasswordInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentLength = displayValue.length;
    const newLength = newValue.length;

    if (newLength > currentLength) {
      // Adding characters
      const addedChars = newValue.slice(currentLength);
      const newActualValue = value + addedChars;
      const newDisplayValue = displayValue + "•".repeat(addedChars.length);
      onValueChange(newActualValue, newDisplayValue);
    } else if (newLength < currentLength) {
      // Removing characters
      const removedCount = currentLength - newLength;
      const newActualValue = value.slice(0, -removedCount);
      const newDisplayValue = displayValue.slice(0, -removedCount);
      onValueChange(newActualValue, newDisplayValue);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
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
          readOnly={false}
          aria-label="Password"
          placeholder="Enter password"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={verifying}
          className="w-full h-12 pl-4 pr-12 text-[15px] rounded-2xl text-white/95 placeholder-white/60 tracking-wide outline-none
                     bg-white/5 backdrop-blur-xl saturate-150 ring-1 ring-white/25 focus:ring-2 focus:ring-cyan-200/60
                     shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)]"
        />

        {!verifying && (
          <button
            type="submit"
            aria-label="Unlock"
            disabled={!value.trim()}
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
          onClick={onToggleHint}
          className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-xs ring-1 ring-white/25"
        >
          ?
        </button>
        {showHint && (
          <span className="text-white/80 text-xs">Hint: Anything</span>
        )}
      </div>
    </div>
  );
}
