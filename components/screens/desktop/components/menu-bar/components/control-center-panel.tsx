"use client";

import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Bluetooth,
  Mic2,
  Moon,
  Music2,
  PanelsTopLeft,
  RadioTower,
  Settings,
  SunMedium,
  Volume2,
  Wifi,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ControlCenterPanelProps = {
  onClose: () => void;
};

type QuickToggleId =
  | "wifi"
  | "bluetooth"
  | "airdrop"
  | "hotspot"
  | "focus"
  | "stage";

type QuickToggle = {
  id: QuickToggleId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const tileBase =
  "relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.12)_45%,rgba(120,140,255,0.08)_100%)] p-5 shadow-[0_1.25rem_2.75rem_rgba(15,23,42,0.38)] backdrop-blur-3xl";

const PRIMARY_TOGGLES: QuickToggle[] = [
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
    id: "airdrop",
    label: "AirDrop",
    description: "Contacts Only",
    icon: RadioTower,
  },
  {
    id: "hotspot",
    label: "Hotspot",
    description: "Personal",
    icon: SunMedium,
  },
];

const SECONDARY_TOGGLES: QuickToggle[] = [
  {
    id: "focus",
    label: "Focus",
    description: "Do Not Disturb",
    icon: Moon,
  },
  {
    id: "stage",
    label: "Stage Manager",
    description: "On",
    icon: PanelsTopLeft,
  },
];

function GlassTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(tileBase, className)}>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10" />
      <div className="pointer-events-none absolute -top-16 left-8 h-32 w-32 rounded-full bg-white/25 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function QuickToggleButton({
  toggle,
  isActive,
  onToggle,
}: {
  toggle: QuickToggle;
  isActive: boolean;
  onToggle: (id: QuickToggleId) => void;
}) {
  const { id, label, description, icon: Icon } = toggle;

  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-white/10 p-4 text-left transition-all",
        isActive
          ? "bg-white/70 text-slate-950 shadow-[0_1.25rem_2.5rem_rgba(148,163,209,0.45)]"
          : "bg-white/10 text-white/70 hover:bg-white/16 hover:text-white",
      )}
      aria-pressed={isActive}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-2xl border border-white/20 transition-colors",
          isActive
            ? "bg-white/90 text-slate-900"
            : "bg-white/10 text-white/80 group-hover:bg-white/20",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="mt-4">
        <p className="text-sm font-semibold leading-tight">{label}</p>
        <p
          className={cn(
            "text-xs",
            isActive ? "text-slate-900/70" : "text-white/70",
          )}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

function QuickChip({
  toggle,
  isActive,
  onToggle,
}: {
  toggle: QuickToggle;
  isActive: boolean;
  onToggle: (id: QuickToggleId) => void;
}) {
  const { id, label, description, icon: Icon } = toggle;

  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        "flex items-center justify-between rounded-2xl border border-white/10 px-5 py-3 text-left transition-all",
        isActive
          ? "bg-white/60 text-slate-950 shadow-[0_1rem_2.25rem_rgba(148,163,209,0.45)]"
          : "bg-white/10 text-white/70 hover:bg-white/16",
      )}
      aria-pressed={isActive}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-2xl border border-white/15 transition-colors",
            isActive ? "bg-white/80 text-slate-900" : "bg-white/10",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">{label}</p>
          <p
            className={cn(
              "text-xs",
              isActive ? "text-slate-900/70" : "text-white/70",
            )}
          >
            {description}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "size-2 rounded-full",
          isActive ? "bg-emerald-400" : "bg-white/30",
        )}
      />
    </button>
  );
}

function GlassSlider({
  label,
  value,
  onChange,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <GlassTile>
      <div className="flex items-center justify-between text-sm font-medium text-white/80">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white/15">
            <Icon className="size-4" />
          </span>
          {label}
        </div>
        <span className="text-xs text-white/60">{value}%</span>
      </div>
      <div className="relative mt-5 h-3 w-full rounded-full bg-white/10">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", accent)}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </div>
    </GlassTile>
  );
}

export function ControlCenterPanel({ onClose }: ControlCenterPanelProps) {
  const [quickStates, setQuickStates] = useState<
    Record<QuickToggleId, boolean>
  >({
    wifi: true,
    bluetooth: true,
    airdrop: true,
    hotspot: false,
    focus: false,
    stage: true,
  });
  const [brightness, setBrightness] = useState<number>(72);
  const [volume, setVolume] = useState<number>(48);

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
    <section className="w-[24rem] space-y-4 text-white">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight">Control Center</p>
          <p className="text-xs text-white/60">
            {activeQuickCount} toggles active — stay in the flow
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-2xl border border-white/15 bg-white/15 text-white/70 transition-colors hover:bg-white/25"
          aria-label="Close control center"
        >
          <Settings className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-4">
        <div className="space-y-4">
          <GlassTile className="p-0">
            <div className="flex items-center justify-between px-5 pt-5 text-sm font-semibold text-white/80">
              <span>Connectivity</span>
              <span className="text-xs font-medium text-white/60">
                {quickStates.wifi ? "Online" : "Offline"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
              {PRIMARY_TOGGLES.map((toggle) => (
                <QuickToggleButton
                  key={toggle.id}
                  toggle={toggle}
                  isActive={quickStates[toggle.id]}
                  onToggle={toggleQuick}
                />
              ))}
            </div>
          </GlassTile>

          <GlassTile>
            <div className="grid gap-3">
              {SECONDARY_TOGGLES.map((toggle) => (
                <QuickChip
                  key={toggle.id}
                  toggle={toggle}
                  isActive={quickStates[toggle.id]}
                  onToggle={toggleQuick}
                />
              ))}
            </div>
          </GlassTile>

          <div className="grid gap-4 md:grid-cols-2">
            <GlassSlider
              label="Display"
              value={brightness}
              onChange={setBrightness}
              icon={SunMedium}
              accent="bg-gradient-to-r from-white/80 via-sky-200/80 to-sky-400/70"
            />
            <GlassSlider
              label="Sound"
              value={volume}
              onChange={setVolume}
              icon={Volume2}
              accent="bg-gradient-to-r from-white/75 via-emerald-200/80 to-emerald-400/80"
            />
          </div>
        </div>

        <div className="space-y-4">
          <GlassTile>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/20">
                <Music2 className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                  Now Playing
                </p>
                <p className="text-sm font-semibold text-white/90">
                  Midnight Drive — Luma
                </p>
                <p className="text-xs text-white/60">3:42 remaining</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/65">
              <span>Living Room</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-white/15 px-3 py-1 font-medium text-white hover:bg-white/25"
                >
                  AirPlay
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white/15 px-3 py-1 font-medium text-white hover:bg-white/25"
                >
                  Queue
                </button>
              </div>
            </div>
          </GlassTile>

          <GlassTile>
            <div className="flex items-center justify-between text-sm font-semibold text-white/80">
              <span>Capture Tools</span>
              <span className="text-xs text-white/60">Quick access</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Screenshot", "Screen Record", "Mic Input"].map(
                (label, index) => (
                  <button
                    key={label}
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/18"
                  >
                    {index === 0 ? (
                      <PanelsTopLeft className="size-3.5" />
                    ) : null}
                    {index === 1 ? <RadioTower className="size-3.5" /> : null}
                    {index === 2 ? <Mic2 className="size-3.5" /> : null}
                    {label}
                  </button>
                ),
              )}
            </div>
          </GlassTile>

          <GlassTile className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-white/20">
                <BatteryCharging className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/90">Battery</p>
                <p className="text-xs text-white/60">82% · External power</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200">
              Balanced
            </span>
          </GlassTile>
        </div>
      </div>
    </section>
  );
}
