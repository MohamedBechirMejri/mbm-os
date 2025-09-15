"use client";

import type { PropsWithChildren } from "react";

export function TabsScrollContainer({ children }: PropsWithChildren) {
  return (
    <div className="flex min-w-max items-center gap-2 pr-4 relative w-full">
      {children}
    </div>
  );
}
