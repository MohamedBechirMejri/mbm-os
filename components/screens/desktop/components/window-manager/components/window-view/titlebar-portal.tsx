"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Context that carries the mount ref for a single window instance
const TitlebarPortalContext =
  createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function TitlebarPortalProvider({
  value,
  children,
}: {
  value: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <TitlebarPortalContext.Provider value={value}>
      {children}
    </TitlebarPortalContext.Provider>
  );
}

// Render children into the current window's titlebar area
export function TitlebarPortal({ children }: { children: React.ReactNode }) {
  const ref = useContext(TitlebarPortalContext);
  const [, force] = useState(0);

  useEffect(() => {
    if (ref?.current) return; // already mounted
    let alive = true;
    const loop = () => {
      if (!alive) return;
      if (ref?.current) force((n) => n + 1);
      else requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      alive = false;
    };
  }, [ref]);

  if (!ref?.current) return null;
  return createPortal(children, ref.current);
}
