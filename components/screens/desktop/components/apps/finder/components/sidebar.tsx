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

  return (
  <aside className="flex w-[220px] flex-col gap-4 border-r border-white/12 bg-[#0f1117] p-3 text-sm">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          {section.collapsible ? (
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/40 hover:text-white/70"
            >
              {collapsed[section.title] ? (
                <ChevronRight className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              {section.title}
            </button>
          ) : (
            <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
              {section.title}
            </div>
          )}

          {!collapsed[section.title] && (
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const itemKey = item.path.join("/");
                const isActive =
                  currentPathKey === itemKey ||
                  (itemKey !== "" && currentPathKey.startsWith(`${itemKey}/`));
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`relative flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all ${
                      isActive
                        ? "bg-white/14 text-white"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-white/80" />
                    )}
                    <span className="flex items-center justify-center">
                      <RenderIcon config={item.icon} active={isActive} />
                    </span>
                    <span className="truncate text-[13px] leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
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
        width={18}
        height={18}
        className={`rounded-sm object-contain ${active ? "" : "opacity-75"}`}
        priority={false}
      />
    );
  }

  if (config.type === "lucide") {
    const Icon = config.Icon;
    return <Icon className="size-[18px]" strokeWidth={1.7} />;
  }

  return (
    <span
      className="inline-flex size-[10px] items-center justify-center rounded-full"
      style={{ backgroundColor: config.color }}
    />
  );
}
