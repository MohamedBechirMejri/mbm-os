import { useEffect, useState } from 'react';

export default function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [now, setNow] = useState<Date>(new Date());

  // Tick every second; super cheap and avoids stale static text
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // macOS lock screen vibe: Tue Jul 8 / 18:14
  const dateText = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeText = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // matches your screenshot; flip to true if you want 12‑hour
  });

  return (
    <div className="relative isolate z-10 flex flex-col items-center justify-between h-screen w-full">
      <h1 className="relative flex flex-col items-center justify-center text-8xl font-extrabold py-8 pt-32 tracking-tight text-white/95 antialiased font-['SF Pro Rounded','SF Pro Display','SF Pro',ui-rounded,-apple-system,system-ui,'Segoe UI Rounded','Segoe UI','Helvetica Neue',Arial,Roboto,'Noto Sans',sans-serif]">
        <span className="text-2xl md:text-3xl opacity-95">{dateText}</span>
        <span className="relative mt-2 leading-none">
          {/* Soft outer glow to sell the material */}
          <span aria-hidden className="absolute inset-0 blur-2xl opacity-40 text-sky-200 mix-blend-screen select-none">{timeText}</span>
          {/* Inner tint so digits pick up backdrop color */}
          <span aria-hidden className="absolute inset-0 translate-y-[1px] text-white/25 mix-blend-overlay select-none">{timeText}</span>
          {/* Top highlight strip (specular) */}
          <span aria-hidden className="pointer-events-none absolute -inset-x-6 -top-4 bottom-[55%] rounded-full bg-white/20 blur-2xl mix-blend-soft-light" />
          {/* Crisp edge like carved glass */}
          <span aria-hidden className="absolute inset-0 text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,.85)] select-none">{timeText}</span>
          {/* Foreground fill: slightly translucent to let backdrop shine through */}
          <span className="relative z-10 text-white/85 mix-blend-luminosity">{timeText}</span>
        </span>
      </h1>

      <div></div>
    </div>
  );
}
