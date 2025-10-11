"use client";

import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Bluetooth,
  Moon,
  RadioTower,
  Settings,
  Sun,
  Volume2,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ControlCenterPanelProps = {
  onClose: () => void;
};

type QuickToggleId = "wifi" | "bluetooth" | "focus" | "airdrop";

type QuickToggle = {
  id: QuickToggleId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const QUICK_TOGGLES: QuickToggle[] = [
  {
    id: "wifi",
    label: "Wi-Fi",
    description: "Tahoe Mesh",
    icon: Wifi,
  },
  {
    id: "bluetooth",
    label: "Bluetooth",
    description: "AirPods Pro",
    icon: Bluetooth,
  },
  {
    id: "focus",
    label: "Focus",
    description: "Do Not Disturb",
    icon: Moon,
  },
  {
    id: "airdrop",
    label: "AirDrop",
    description: "Contacts Only",
    icon: RadioTower,
  },
];

export function ControlCenterPanel({ onClose }: ControlCenterPanelProps) {
  const [quickStates, setQuickStates] = useState<
    Record<QuickToggleId, boolean>
  >({
    wifi: true,
    bluetooth: true,
    focus: false,
    airdrop: true,
  });
  const [brightness, setBrightness] = useState<number>(68);
  const [volume, setVolume] = useState<number>(46);

  const activeQuickCount = useMemo(() => {
    return Object.values(quickStates).filter(Boolean).length;
  }, [quickStates]);

  const toggleQuick = (id: QuickToggleId) => {
    setQuickStates((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  return (
    <section className="w-[22rem] rounded-3xl border border-white/10 bg-gradient-to-br from-white/25 via-white/10 to-white/5 p-4 text-white shadow-[0_1rem_2.25rem_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight">Control Center</p>
          <p className="text-xs text-white/60">
            {activeQuickCount} quick toggles active
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
          aria-label="Close control center"
        >
          <Settings className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {QUICK_TOGGLES.map(({ id, label, description, icon: Icon }) => {
          const isActive = quickStates[id];

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleQuick(id)}
              className={cn(
                "flex h-24 flex-col justify-between rounded-2xl border border-white/10 p-4 text-left transition-all",
                isActive
                  ? "bg-white/25 text-black shadow-[0_0.75rem_2rem_rgba(255,255,255,0.3)]"
                  : "bg-white/10 text-white/80 hover:bg-white/20",
              )}
              aria-pressed={isActive}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-black" : "text-white/80",
                )}
              />
              <div>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                <p className="text-xs text-white/70">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <div className="flex items-center justify-between text-sm font-medium text-white/80">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Display
            </div>
            <span className="text-xs text-white/60">{brightness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/20 accent-white"
            aria-label="Adjust display brightness"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <div className="flex items-center justify-between text-sm font-medium text-white/80">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sound
            </div>
            <span className="text-xs text-white/60">{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/20 accent-white"
            aria-label="Adjust master volume"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white/90">Now Playing</p>
            <p className="text-xs text-white/60">
              Synthwave Focus · 3:42 remaining
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/25"
          >
            Open Music
          </button>
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
        <div className="flex items-center gap-2">
          <BatteryCharging className="h-4 w-4" />
          82% · Power Source: Adapter
        </div>
        <span className="text-xs text-white/60">Balanced</span>
      </footer>
    </section>
  );
}
