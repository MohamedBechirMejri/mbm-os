import { useEffect, useState } from "react";
import {
  Avatar,
  PasswordInput,
  StatusBar,
  TimeDisplay,
  useCapsLockDetection,
} from "./components";
import { APPLE_TEXT_FONT_STACK } from "./constants/fonts";
import { loginStyles } from "./styles/animations";
import type { LoginScreenProps } from "./types";

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [now, setNow] = useState<Date>(new Date());

  // Login UI state
  const [pwd, setPwd] = useState("");
  const [displayPwd, setDisplayPwd] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Use the caps lock detection hook
  const caps = useCapsLockDetection();

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
      onSuccess?.();
    }, 900);
  };

  // Handle password changes
  const handlePasswordChange = (value: string, displayValue: string) => {
    setPwd(value);
    setDisplayPwd(displayValue);
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
    <div className="relative isolate z-10 flex flex-col items-center justify-between h-screen w-full select-none py-12">
      {/* Top-right status: Wi‑Fi + Battery (no clock) */}
      <StatusBar />

      {/* Time and Date Display */}
      <TimeDisplay date={dateText} time={timeText} />

      {/* Vignette overlay to improve text legibility on bright videos */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_65%,rgba(0,0,0,0.45)_100%)]" />

      {/* Center login tile */}
      <form
        onSubmit={submit}
        className="relative z-10 -mt-8 flex flex-col items-center gap-3"
        style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
      >
        {/* Avatar */}
        <Avatar username="Guest" />

        {/* Password field */}
        <PasswordInput
          value={pwd}
          displayValue={displayPwd}
          onValueChange={handlePasswordChange}
          onSubmit={submit}
          verifying={verifying}
          wrong={wrong}
          caps={caps}
          showHint={showHint}
          onToggleHint={() => setShowHint((v) => !v)}
          onSuccess={() => onSuccess?.()}
        />
      </form>

      {/* Local styles for shake animation */}
      <style>{loginStyles}</style>
    </div>
  );
}
