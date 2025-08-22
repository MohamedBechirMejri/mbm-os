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
        className={`relative w-[min(86vw,440px)] transition-all ${wrong ? "shake" : ""} overflow-hidden rounded-2xl`}
      >
        {/* glass effect */}
        <div
          className="absolute inset-0 z-0 isolate overflow-hidden backdrop-blur-[2px]"
          style={{ filter: "url(#glass-distortion)" }}
        />
        {/* tint */}
        <div className="absolute inset-0 z-10 bg-white/25" />
        {/* shine */}
        <div
          className="absolute inset-0 z-20 overflow-hidden rounded-2xl"
          style={{
            boxShadow:
              "inset 0 0 1px 0 rgba(255,255,255,0.5), inset 0 0 1px 1px rgba(255,255,255,0.5)",
          }}
        />
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
          className="relative z-30 w-full h-12 pl-4 pr-12 text-[15px] rounded-2xl text-white/95 placeholder-white/60 tracking-wide outline-none bg-transparent focus:ring-2 focus:ring-cyan-200/60"
        />

        {!verifying && (
          <button
            type="submit"
            aria-label="Unlock"
            disabled={!value.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-xl
                       bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xl ring-1 ring-white/20
                       text-white/95 transition disabled:opacity-40 disabled:pointer-events-none z-30"
          >
            <ArrowRight size={18} />
          </button>
        )}

        {/* Spinner overlay while verifying */}
        {verifying && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/20 z-40">
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
