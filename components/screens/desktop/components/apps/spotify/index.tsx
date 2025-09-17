"use client";

type EmbedType = "track" | "playlist" | "album" | "episode" | "show";

interface EmbedItem {
  type: EmbedType;
  id: string; // Spotify ID
  title: string;
}

const ITEMS: EmbedItem[] = [
  { type: "playlist", id: "37i9dQZEVXbMDoHDwVN2tF", title: "Top 50 – Global" },
  {
    type: "album",
    id: "4m2880jivSbbyEGAKfITCa",
    title: "Random Access Memories",
  },
  { type: "track", id: "0VjIjW4GlUZAMYd2vXMi3b", title: "Blinding Lights" },
  { type: "track", id: "1u7kkVrr14iBvrpYnZILJR", title: "Lose Yourself" },
];

function heightFor(item: EmbedItem): number {
  switch (item.type) {
    case "track":
      return 152; // compact
    case "album":
    case "playlist":
      return 352; // richer UI
    case "episode":
    case "show":
      return 232;
    default:
      return 152;
  }
}

function frameUrl(item: EmbedItem): string {
  // Use dark theme, allow reduced color to blend with OS dark look
  return `https://open.spotify.com/embed/${item.type}/${item.id}?utm_source=generator&theme=0`;
}

export function SpotifyApp({ instanceId: _ }: { instanceId: string }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex-1 overflow-auto p-4">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {ITEMS.map((item) => {
            const h = heightFor(item);
            return (
              <div
                key={`${item.type}:${item.id}`}
                className="liquidGlass-wrapper rounded-xl border border-white/10 bg-white/5 shadow-[0_6px_6px_rgba(0,0,0,.2),0_0_20px_rgba(0,0,0,.1)] dark:bg-black/20"
                style={{ minHeight: h }}
              >
                {/* Layers for subtle liquid glass look */}
                <div className="absolute inset-0 [backdrop-filter:blur(3px)] [filter:url(#glass-distortion)] [isolation:isolate]" />
                <div className="absolute inset-0 bg-white/20 dark:bg-white/10" />
                <div className="absolute inset-0 shadow-[inset_2px_2px_1px_rgba(255,255,255,0.5),inset_-1px_-1px_1px_rgba(255,255,255,0.5)]" />

                <div className="relative z-10">
                  <iframe
                    title={item.title}
                    src={frameUrl(item)}
                    width="100%"
                    height={h}
                    style={{ border: 0, borderRadius: "0.75rem" }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden once-per-page SVG filter (duplicated is fine; harmless). Ideally put once per page layout. */}
      <svg style={{ display: "none" }} aria-hidden>
        <title>glass-distortion</title>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves={1}
            seed={5}
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
            <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
            <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale={5}
            specularConstant={1}
            specularExponent={100}
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x={-200} y={-200} z={300} />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k2={1}
            k3={1}
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale={150}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
}

export default SpotifyApp;
