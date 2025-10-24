"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  HardDrive,
  Radio,
  Share2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import GlassSurface from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";
import type { FSPath } from "../fs";

interface SidebarProps {
  path: FSPath;
  onNavigate: (path: FSPath) => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: SidebarIconConfig;
  path: FSPath;
}

type SidebarIconConfig =
  | { type: "asset"; src: string }
  | { type: "lucide"; Icon: LucideIcon }
  | { type: "dot"; color: string };

export function Sidebar({ path, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    Tags: true,
  });

  const currentPathKey = useMemo(() => path.join("/"), [path]);

  const sections: SidebarSection[] = [
    {
      title: "Favorites",
      items: [
        {
          id: "recents",
          label: "Recents",
          icon: {
            type: "asset",
            src: "/assets/icons/apps/preferences-system-time.ico",
          },
          path: ["recents"],
        },
        {
          id: "shared",
          label: "Shared",
          icon: { type: "lucide", Icon: Share2 },
          path: ["macintosh-hd", "users", "shared"],
        },
        {
          id: "applications",
          label: "Applications",
          icon: {
            type: "asset",
            src: "/assets/icons/apps/applications-system.ico",
          },
          path: ["macintosh-hd", "applications"],
        },
        {
          id: "desktop",
          label: "Desktop",
          icon: { type: "asset", src: "/assets/icons/apps/desktop.ico" },
          path: ["macintosh-hd", "users", "mbm", "desktop"],
        },
        {
          id: "documents",
          label: "Documents",
          icon: { type: "lucide", Icon: FileText },
          path: ["macintosh-hd", "users", "mbm", "documents"],
        },
        {
          id: "downloads",
          label: "Downloads",
          icon: {
            type: "asset",
            src: "/assets/icons/apps/preferences-system-backup.ico",
          },
          path: ["macintosh-hd", "users", "mbm", "downloads"],
        },
        {
          id: "dev",
          label: "dev",
          icon: { type: "asset", src: "/assets/icons/apps/codeblocks.ico" },
          path: ["macintosh-hd", "users", "mbm", "dev"],
        },
        {
          id: "op",
          label: "op",
          icon: {
            type: "asset",
            src: "/assets/icons/apps/preferences-system-privacy.ico",
          },
          path: ["macintosh-hd", "users", "mbm", "op"],
        },
        {
          id: "yt",
          label: "yt",
          icon: { type: "asset", src: "/assets/icons/apps/youtube.ico" },
          path: ["macintosh-hd", "users", "mbm", "yt"],
        },
      ],
    },
    {
      title: "Locations",
      items: [
        {
          id: "icloud-drive",
          label: "iCloud Drive",
          icon: { type: "asset", src: "/assets/icons/apps/icloud.ico" },
          path: ["icloud-drive"],
        },
        {
          id: "mbm-macbook-pro",
          label: "MBM's MacBook Pro",
          icon: { type: "lucide", Icon: HardDrive },
          path: [],
        },
        {
          id: "airdrop",
          label: "AirDrop",
          icon: { type: "lucide", Icon: Radio },
          path: ["airdrop"],
        },
        {
          id: "network",
          label: "Network",
          icon: {
            type: "asset",
            src: "/assets/icons/apps/network-workgroup.ico",
          },
          path: ["network"],
        },
        {
          id: "trash",
          label: "Trash",
          icon: { type: "lucide", Icon: Trash2 },
          path: ["trash"],
        },
      ],
    },
    {
      title: "Tags",
      collapsible: true,
      items: [
        {
          id: "tag-red",
          label: "Red",
          icon: { type: "dot", color: "#f87171" },
          path: ["tag-red"],
        },
        {
          id: "tag-orange",
          label: "Orange",
          icon: { type: "dot", color: "#fb923c" },
          path: ["tag-orange"],
        },
        {
          id: "tag-blue",
          label: "Blue",
          icon: { type: "dot", color: "#60a5fa" },
          path: ["tag-blue"],
        },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sectionHeadingClass =
    "px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-white/40";
  const collapsibleHeadingClass =
    "flex items-center gap-1.5 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-white/55";

  return (
    <aside className="flex h-full w-48 flex-col p-1.5 pr-0">
      <div className="h-full w-full overflow-hidden rounded-3xl bg-[#56BBE8]/1 backdrop-blur-[24rem] flex flex-col border border-white/6">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-2 py-3 text-[0.75rem] text-white/70 pt-10">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              {section.collapsible ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={collapsibleHeadingClass}
                >
                  {collapsed[section.title] ? (
                    <ChevronRight className="size-2.5" />
                  ) : (
                    <ChevronDown className="size-2.5" />
                  )}
                  {section.title}
                </button>
              ) : (
                <div className={sectionHeadingClass}>{section.title}</div>
              )}

              {!collapsed[section.title] && (
                <div className="flex flex-col gap-[0.15rem]">
                  {section.items.map((item) => {
                    const itemKey = item.path.join("/");
                    const isActive =
                      itemKey === ""
                        ? currentPathKey === ""
                        : currentPathKey === itemKey ||
                          currentPathKey.startsWith(`${itemKey}/`);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        className={cn(
                          "relative flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[0.75rem] font-normal transition-all duration-100 ease-out",
                          isActive
                            ? "bg-white/15 text-white/90"
                            : "text-white/70 hover:bg-white/8 hover:text-white/85",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="relative flex items-center justify-center">
                          <RenderIcon config={item.icon} active={isActive} />
                        </span>
                        <span className="truncate leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function RenderIcon({
  config,
  active,
}: {
  config: SidebarIconConfig;
  active: boolean;
}) {
  if (config.type === "asset") {
    return (
      <Image
        src={config.src}
        alt=""
        width={16}
        height={16}
        className={cn(
          "rounded-sm object-contain transition-opacity",
          active ? "opacity-90" : "opacity-70",
        )}
        priority={false}
      />
    );
  }

  if (config.type === "lucide") {
    const Icon = config.Icon;
    return (
      <Icon
        className={cn(
          "size-4 transition-colors",
          active ? "text-white/90" : "text-white/60",
        )}
        strokeWidth={1.5}
      />
    );
  }

  return (
    <span
      className="inline-flex size-2 items-center justify-center rounded-full"
      style={{ backgroundColor: config.color }}
    />
  );
}
