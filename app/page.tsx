"use client";

import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import BootScreen from "@/components/screens/boot";
import LoginScreen from "@/components/screens/login";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AppMachineProvider,
  useAppActor,
  useAppSnapshot,
} from "@/lib/app-machine-context";
import { cn } from "@/lib/utils";

const Desktop = dynamic(() => import("@/components/screens/desktop"), {
  ssr: false,
});

export default function AppShellRoot() {
  return (
    <AppMachineProvider>
      <AppShell />
    </AppMachineProvider>
  );
}

function AppShell() {
  const appActor = useAppActor();
  const state = useAppSnapshot();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isBoot = state.matches("boot");
  const isLogin = state.matches("login");
  // const isDesktop = state.matches("desktop");

  const renderScreen = () => {
    if (isBoot)
      return (
        <BootScreen
          onDone={() => {
            appActor.send({ type: "BOOT_FINISHED" });
            console.log("Boot finished");
          }}
        />
      );

    if (isLogin)
      return (
        <LoginScreen
          key="login"
          onSuccess={() => appActor.send({ type: "LOGIN_SUCCESS" })}
        />
      );

    return <Desktop key="desktop" />;
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
        ref={videoRef}
        src="/assets/videos/3089895-hd_1920_1080_30fps.mp4"
        className={cn(
          "absolute inset-0 object-cover w-full h-full",
          isBoot ? "opacity-0" : "opacity-100 transition-opacity duration-500",
        )}
        autoPlay
        loop
        muted
        playsInline
      />

      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
    </main>
  );
}
