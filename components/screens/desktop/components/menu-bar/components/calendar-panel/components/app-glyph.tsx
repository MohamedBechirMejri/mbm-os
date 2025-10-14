import Image from "next/image";
import type { AppMeta } from "@/components/screens/desktop/components/window-manager";

type AppGlyphProps = {
  app: AppMeta;
};

export function AppGlyph({ app }: AppGlyphProps) {
  if (typeof app.icon === "string") {
    return (
      <Image
        src={`/assets/icons/apps/${app.icon}.ico`}
        alt={app.title}
        width={32}
        height={32}
        className="rounded-xl"
      />
    );
  }

  if (app.icon) {
    return <span className="">{app.icon}</span>;
  }

  return <span className="text-sm font-semibold">{app.title.slice(0, 1)}</span>;
}
