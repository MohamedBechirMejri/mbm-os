import { UserRound } from "lucide-react";

export default function Avatar({ username = "Guest" }: { username?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative flex h-18 w-18 items-center justify-center overflow-hidden rounded-full">
        {/* glass effect */}
        <div
          className="absolute inset-0 z-0 isolate overflow-hidden  backdrop-blur-[2px]"
          style={{ filter: "url(#glass-distortion)" }}
        />
        {/* tint */}
        <div className="absolute inset-0 z-10 bg-teal-200/25" />
        {/* shine */}
        <div
          className="absolute inset-0 z-20 overflow-hidden rounded-full"
          style={{
            boxShadow:
              "inset 0 0 1px 0 rgba(255,255,255,0.5), inset 0 0 1px 1px rgba(255,255,255,0.5)",
          }}
        />
        {/* content */}
        <div className="absolute z-30 text-4xl">
          <UserRound size={36} className="text-white" />
        </div>
      </div>
        <p className="text-md font-medium text-white/90 -mt-2">{username}</p>
    </div>
  );
}
