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
    "px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/55";
  const collapsibleHeadingClass =
    "flex items-center gap-2 px-3 py-[0.35rem] text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white/75";

  return (
    <aside className="flex h-full w-48 flex-col p-1.5 overflow-hidden">
      <div className="h-full w-full overflow-hidden! border rounded-3xl border-white/10 bg-[#56BBE8]/5 backdrop-blur-[24rem]">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 text-[0.8125rem] text-white/80 pt-12">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              {section.collapsible ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={collapsibleHeadingClass}
                >
                  {collapsed[section.title] ? (
                    <ChevronRight className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                  {section.title}
                </button>
              ) : (
                <div className={sectionHeadingClass}>{section.title}</div>
              )}

              {!collapsed[section.title] && (
                <div className="flex flex-col gap-[0.3rem]">
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
                          "relative flex w-full items-center gap-2 rounded-[1.1rem] px-3 py-[0.55rem] text-left text-[0.8125rem] font-medium transition-all duration-150 ease-out",
                          isActive
                            ? "bg-white/90 text-[#0f1117] shadow-[0_16px_36px_rgba(10,12,20,0.28)] before:absolute before:inset-y-[0.35rem] before:-left-[0.55rem] before:w-[0.28rem] before:rounded-full before:bg-[#3c84ff]"
                            : "text-white/75 hover:bg-white/14 hover:text-white",
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
        width={18}
        height={18}
        className={cn(
          "rounded-[0.35rem] object-contain transition-opacity",
          active ? "opacity-100" : "opacity-80",
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
          "size-4.5 transition-colors",
          active ? "text-[#0f1117]" : "text-white/75",
        )}
        strokeWidth={1.6}
      />
    );
  }

  return (
    <span
      className="inline-flex size-[0.55rem] items-center justify-center rounded-full"
      style={{ backgroundColor: config.color }}
    />
  );
}
