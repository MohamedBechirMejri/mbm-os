"use client";

import { Menubar } from "@/components/ui/menubar";
import {
  AppleMenu,
  AppMenus,
  BatteryIndicator,
  Clock,
  ControlCenter,
  SearchIcon,
  WiFiIndicator,
} from "./components";

export default function MenuBar() {
  return (
    <div className="relative z-50">
      <Menubar className="bg-transparent text-white border-none rounded-none h-7 px-2 flex items-center justify-between w-full">
        {/* Left side - Apple menu and app menus */}
        <div className="flex items-center gap-1">
          <AppleMenu />
          <AppMenus />
        </div>

        {/* Right side - Status items */}
        <div className="flex items-center gap-1 ml-auto">
          <SearchIcon />
          <ControlCenter />
          <WiFiIndicator />
          <BatteryIndicator />
          <Clock />
        </div>
      </Menubar>
    </div>
  );
}
