"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function WiFiIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center px-2 hover:bg-white/10 rounded transition-colors cursor-pointer">
      <Image
        src="/assets/icons/wifi.png"
        alt="WiFi"
        width={16}
        height={16}
        className={`${isOnline ? "invert brightness-0" : "opacity-50"}`}
      />
    </div>
  );
}
