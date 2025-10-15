"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function BatteryIndicator() {
  const [battery, setBattery] = useState({ level: 100, charging: false });

  useEffect(() => {
    // Try to get battery info from browser API
    if ("getBattery" in navigator) {
      // biome-ignore lint/suspicious/noExplicitAny: Battery API not in standard types
      (navigator as any)
        .getBattery()
        .then(
          (batteryManager: {
            level: number;
            charging: boolean;
            addEventListener: (event: string, handler: () => void) => void;
            removeEventListener: (event: string, handler: () => void) => void;
          }) => {
            const updateBattery = () => {
              setBattery({
                level: Math.round(batteryManager.level * 100),
                charging: batteryManager.charging,
              });
            };

            updateBattery();
            batteryManager.addEventListener("levelchange", updateBattery);
            batteryManager.addEventListener("chargingchange", updateBattery);

            return () => {
              batteryManager.removeEventListener("levelchange", updateBattery);
              batteryManager.removeEventListener(
                "chargingchange",
                updateBattery,
              );
            };
          },
        );
    }
  }, []);

  const getBatteryIcon = () => {
    const level = Math.floor(battery.level / 10) * 10;
    const suffix = battery.charging ? "-charging" : "";
    return `/assets/icons/status/battery-${level.toString().padStart(3, "0")}${suffix}.ico`;
  };

  return (
    <div className="flex items-center gap-1 px-2 hover:bg-white/10 rounded transition-colors cursor-pointer">
      <span className="text-xs font-bold text-white/90">
        {battery.level}%
      </span>{" "}
      <Image
        src={getBatteryIcon()}
        alt="Battery"
        width={16}
        height={16}
        className="invert brightness-0"
      />
    </div>
  );
}
