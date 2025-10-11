"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import BootScreen from "@/components/screens/boot";
import Desktop from "@/components/screens/desktop";
import LoginScreen from "@/components/screens/login";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AppMachineProvider,
  useAppActor,
  useAppSnapshot,
} from "@/lib/app-machine-context";
import { cn } from "@/lib/utils";

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
  const isDesktop = state.matches("desktop");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;
    const MIN_RATE = 0.35;
    const SLOWDOWN_DURATION = 1800;
    const FREEZE_DELAY = 200;

    let frameId: number | undefined;
    let freezeTimeout: number | undefined;
    let cancelled = false;

    const cancelAnimation = () => {
      cancelled = true;
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      if (freezeTimeout !== undefined) clearTimeout(freezeTimeout);
    };

    if (isDesktop) {
      const runSlowdown = async () => {
        try {
          video.playbackRate = 1;
          if (video.paused) {
            await video.play();
          }
        } catch {
          // Autoplay might be blocked; nothing we can do except bail quietly.
          return;
        }

        const initialRate = video.playbackRate || 1;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
          if (cancelled) return;
          if (startTime === null) startTime = timestamp;

          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / SLOWDOWN_DURATION, 1);
          const eased = easeOutQuint(progress);
          const rateDrop = initialRate - MIN_RATE;
          const nextRate = initialRate - rateDrop * eased;

          video.playbackRate = Math.max(nextRate, MIN_RATE);

          if (progress < 1) {
            frameId = requestAnimationFrame(step);
          } else {
            freezeTimeout = window.setTimeout(() => {
              if (cancelled) return;
              video.pause();
              video.playbackRate = 1;
            }, FREEZE_DELAY);
          }
        };

        frameId = requestAnimationFrame(step);
      };

      runSlowdown();

      return () => cancelAnimation();
    }

    cancelAnimation();
    video.playbackRate = 1;
    if (video.paused) {
      void video.play().catch(() => {});
    }

    return () => cancelAnimation();
  }, [isDesktop]);

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
