import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { PasswordInputProps } from "../types";

const Image = motion(NextImage);

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
  const [isInputVisible, setIsInputVisible] = useState(true);

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

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Control" || e.key === "Meta") &&
        !longPressTimer.current
      ) {
        longPressTimer.current = setTimeout(() => {
          setIsInputVisible(false);
        }, 500);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Password field */}
      <AnimatePresence initial={false} mode="wait">
        {isInputVisible ? (
          <motion.div
            key="password-field"
            className={`relative w-[min(86vw,440px)] transition-all ${wrong ? "shake" : ""} overflow-hidden rounded-2xl`}
            initial={{
              opacity: 0,
              clipPath: "inset(0% 12% 0% 12% round 1rem)",
            }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 1rem)" }}
            exit={{ opacity: 0, clipPath: "inset(0% 50% 0% 50% round 1rem)" }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "opacity, clip-path" }}
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
                onClick={onSubmit}
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
                <Spinner className="text-white" />
              </div>
            )}

            {/* CapsLock hint */}
            {caps && !verifying && (
              <div className="absolute -bottom-6 left-1 text-xs text-amber-200/90">
                Caps Lock is on
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="fingerprint"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Fingerprint />
          </motion.div>
        )}
      </AnimatePresence>

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
      </div>
      {showHint && (
        <p className="text-white/80 text-xs">
          Password: Anything
          <br />
          Touch ID: Long press Control
        </p>
      )}
    </div>
  );
}

function Fingerprint() {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsComplete(true);
    }, 1300);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative h-12 w-12 overflow-hidden">
      {/* Overlap both states and crossfade/scale synchronously for a morph-like feel */}
      <AnimatePresence initial={false} mode="sync">
        {!isComplete && (
          <motion.div
            key="scan"
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
          >
            {/* Animated scanning line (CSS keyframes for reliability/perf) */}
            <div className={cn("absolute inset-0")}>
              <div
                className={cn("scan-line scan-anim", isComplete && "!hidden")}
                aria-hidden="true"
              />
            </div>

            <Image
              src="/assets/icons/fingerprint-detection-symbolic.ico"
              alt="Fingerprint scanning"
              width={32}
              height={32}
              priority
            />
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            key="done"
            className="absolute inset-0 grid place-items-center"
            initial={{
              opacity: 0,
              scale: 0.9,
              rotate: -4,
              filter: "blur(2px)",
            }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(2px)" }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
          >
            <Image
              src="/assets/icons/fingerprint-detection-complete-symbolic.ico"
              alt="Fingerprint verified"
              width={32}
              height={32}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Local styles for the scanning line animation */}
      <style jsx>{`
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          top: 10%;
          height: 0.24rem; /* 1 */
          background-image: linear-gradient(90deg, transparent, rgba(165, 243, 252, 1), transparent);
          filter: blur(2px);
          will-change: top;
          border-radius: 9999px;
        }
        .scan-anim { animation: fingerprint-scan-y 1.5s linear infinite; }
        @keyframes fingerprint-scan-y {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scan-anim { animation-duration: 3s; }
        }
      `}</style>
    </div>
  );
}
