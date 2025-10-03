"use client";

export function ControlCenter() {
  return (
    <div className="flex items-center px-2 hover:bg-white/10 rounded transition-colors cursor-pointer">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/90"
        aria-label="Control Center"
      >
        <title>Control Center</title>
        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
      </svg>
    </div>
  );
}
