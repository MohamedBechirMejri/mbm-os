"use client";

import { useMachine } from "@xstate/react";
import BootScreen from "@/components/screens/boot";
import LoginScreen from "@/components/screens/login";
import { useIsMobile } from "@/hooks/use-mobile";
import { appMachine } from "@/lib/app-machine";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "motion/react";
import Desktop from "@/components/screens/desktop";

export default function AppShell() {
  const [state, send] = useMachine(appMachine);

  const isMobile = useIsMobile();

  const renderScreen = () => {
    if (state.matches("boot"))
      return (
        <BootScreen
          onDone={() => {
            send({ type: "BOOT_FINISHED" });
            console.log("Boot finished");
          }}
        />
      );
      
    if (state.matches("login"))
      return <LoginScreen onSuccess={() => send({ type: "LOGIN_SUCCESS" })} />;

    return <Desktop />;
  };

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        Unsupported screen size
      </div>
    );
  }

  return (
    <main className="font-sans flex items-center justify-center h-screen w-full bg-black">
      <video
        src="/assets/videos/3089895-hd_1920_1080_30fps.mp4"
        className={cn(
          "absolute inset-0 object-cover w-full h-full",
          state.matches("boot")
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500",
        )}
        autoPlay
        loop
        muted
      />

      <AnimatePresence>{renderScreen()}</AnimatePresence>
    </main>
  );
}
