"use client";

export function MindustryClassicApp({ instanceId: _ }: { instanceId: string }) {
  return (
    <iframe
      src="https://anuke.itch.io/mindustry-classic"
      style={{ width: "100%", height: "100%", border: 0 }}
      allow="fullscreen; gamepad; cross-origin-isolated"
      sandbox="allow-forms allow-scripts allow-same-origin allow-pointer-lock allow-popups"
      title="Mindustry Classic"
    />
  );
}
