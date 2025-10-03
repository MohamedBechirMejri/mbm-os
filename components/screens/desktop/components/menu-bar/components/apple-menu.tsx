"use client";

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function AppleMenu() {
  return (
    <MenubarMenu>
      <MenubarTrigger className="px-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Apple Menu"
        >
          <title>Apple Menu</title>
          <path d="M11.182 3.5c-.412.586-1.085.98-1.713.916-.08-.653.242-1.343.643-1.776.412-.448 1.09-.785 1.655-.81.07.676-.197 1.343-.585 1.67zm.585 1.087c-.913-.054-1.689.52-2.124.52-.435 0-1.107-.493-1.822-.48-.938.014-1.805.547-2.287 1.388-.975 1.69-.25 4.195.701 5.57.465.672.99 1.426 1.705 1.399.7-.027.965-.453 1.813-.453.847 0 1.085.453 1.822.44.754-.014 1.198-.686 1.649-1.36.52-.778.735-1.532.75-1.572-.014-.014-1.44-.56-1.454-2.214-.014-1.387 1.131-2.05 1.185-2.09-.645-.964-1.65-1.075-2.004-1.094l.066-.054z" />
        </svg>
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>About This Mac</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>System Preferences...</MenubarItem>
        <MenubarItem>App Store...</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Recent Items</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Force Quit...</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Sleep</MenubarItem>
        <MenubarItem>Restart...</MenubarItem>
        <MenubarItem>Shut Down...</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>
          Lock Screen <MenubarShortcut>⌃⌘Q</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>Log Out...</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
