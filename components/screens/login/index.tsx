"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar, PasswordInput, StatusBar, TimeDisplay } from "./components";
import { APPLE_TEXT_FONT_STACK } from "./constants/fonts";
import { loginStyles } from "./styles/animations";
import type { LoginScreenProps } from "./types";

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  // Login UI state
  const [pwd, setPwd] = useState("");
  const [displayPwd, setDisplayPwd] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);

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

  return (
    <motion.div
      key={"login-screen"}
      className="relative isolate z-10 flex flex-col items-center justify-between h-screen w-full select-none py-12"
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Top-right status: Wi‑Fi + Battery (no clock) */}
      <StatusBar />

      {/* Time and Date Display */}
      <TimeDisplay />

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
          showHint={showHint}
          onToggleHint={() => setShowHint((v) => !v)}
          onSuccess={() => onSuccess?.()}
        />
      </form>

      {/* Local styles for shake animation */}
      <style>{loginStyles}</style>
    </motion.div>
  );
}
