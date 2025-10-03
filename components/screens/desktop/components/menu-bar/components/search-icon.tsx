"use client";

export function SearchIcon() {
  return (
    <div className="flex items-center px-2 hover:bg-white/10 rounded transition-colors cursor-pointer">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white/90"
        aria-label="Search"
      >
        <title>Search</title>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10.5 10.5L13.5 13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
