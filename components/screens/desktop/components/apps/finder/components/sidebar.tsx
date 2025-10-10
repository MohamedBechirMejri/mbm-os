"use client";

import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  HardDrive,
  Home,
  Image,
  Monitor,
  Tag,
} from "lucide-react";
import { useState } from "react";
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
  icon: React.ReactNode;
  path: FSPath;
  color?: string;
}

export function Sidebar({ path, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sections: SidebarSection[] = [
    {
      title: "Favorites",
      items: [
        {
          id: "home",
          label: "Home",
          icon: <Home className="size-4" />,
          path: [],
          color: "text-blue-400",
        },
        {
          id: "desktop",
          label: "Desktop",
          icon: <Monitor className="size-4" />,
          path: ["desktop"],
          color: "text-cyan-400",
        },
        {
          id: "documents",
          label: "Documents",
          icon: <FileText className="size-4" />,
          path: ["documents"],
          color: "text-indigo-400",
        },
        {
          id: "downloads",
          label: "Downloads",
          icon: <Download className="size-4" />,
          path: ["downloads"],
          color: "text-green-400",
        },
        {
          id: "pictures",
          label: "Pictures",
          icon: <Image className="size-4" />,
          path: ["pictures"],
          color: "text-purple-400",
        },
      ],
    },
    // {
    //   title: "Tags",
    //   collapsible: true,
    //   items: [
    //     {
    //       id: "tag-red",
    //       label: "Red",
    //       icon: <Tag className="size-4 text-red-400" />,
    //       path: [],
    //       color: "text-red-400",
    //     },
    //     {
    //       id: "tag-orange",
    //       label: "Orange",
    //       icon: <Tag className="size-4 text-orange-400" />,
    //       path: [],
    //       color: "text-orange-400",
    //     },
    //     {
    //       id: "tag-blue",
    //       label: "Blue",
    //       icon: <Tag className="size-4 text-blue-400" />,
    //       path: [],
    //       color: "text-blue-400",
    //     },
    //   ],
    // },
    {
      title: "Devices",
      collapsible: true,
      items: [
        {
          id: "mbm-macbook",
          label: "MBM's MacBook",
          icon: <HardDrive className="size-4" />,
          path: [],
          color: "text-gray-400",
        },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="flex w-56 flex-col gap-4 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3 text-sm">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          {section.collapsible ? (
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white/50 hover:text-white/70"
            >
              {collapsed[section.title] ? (
                <ChevronRight className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              {section.title}
            </button>
          ) : (
            <div className="px-2 py-1 text-xs font-medium text-white/50">
              {section.title}
            </div>
          )}

          {!collapsed[section.title] && (
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive =
                  JSON.stringify(path) === JSON.stringify(item.path);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all ${
                      isActive
                        ? "bg-white/15 text-white/90 shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white/90"
                    }`}
                  >
                    <span className={item.color || "text-white/60"}>
                      {item.icon}
                    </span>
                    <span className="truncate text-[13px]">{item.label}</span>
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
