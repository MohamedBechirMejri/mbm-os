export default function Avatar({ username = "Guest" }: { username?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full p-8">
        {/* glass effect */}
        <div
          className="absolute inset-0 z-0 isolate overflow-hidden  backdrop-blur-[3px]"
          style={{ filter: "url(#glass-distortion)" }}
        />
        {/* tint */}
        <div className="absolute inset-0 z-10 bg-white/25" />
        {/* shine */}
        <div
          className="absolute inset-0 z-20 overflow-hidden rounded-full"
          style={{
            boxShadow:
              "inset 0 0 1px 0 rgba(255,255,255,0.5), inset 0 0 1px 1px rgba(255,255,255,0.5)",
          }}
        />
        {/* content */}
        <div className="absolute z-30 text-4xl"> 👤</div>
      </div>
      <div className="text-lg font-medium text-white/90">{username}</div>
    </div>
  );
}
