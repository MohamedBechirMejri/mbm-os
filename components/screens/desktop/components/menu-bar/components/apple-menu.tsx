"use client";

import { useMachine } from "@xstate/react";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { appMachine } from "@/lib/app-machine";
import { DesktopAPI } from "../../window-manager";
import { useMenuActions } from "../hooks/use-menu-actions";

export function AppleMenu() {
  const [, send] = useMachine(appMachine);
  const { closeAllWindows } = useMenuActions();

  const handleLockScreen = () => {
    closeAllWindows();
    send({ type: "BOOT_FINISHED" }); // Go to login screen
  };

  const handleRestart = () => {
    closeAllWindows();
    window.location.reload();
  };

  const handleShutDown = () => {
    closeAllWindows();
    // Navigate back to boot screen
    window.location.href = "/";
  };

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
        <MenubarItem disabled className="opacity-50">
          About This Mac
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled className="opacity-50">
          System Preferences...
        </MenubarItem>
        <MenubarItem onClick={() => DesktopAPI.launch("softwarecenter")}>
          App Store
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled className="opacity-50">
          Recent Items
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={closeAllWindows}>Close All Windows</MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled className="opacity-50">
          Sleep
        </MenubarItem>
        <MenubarItem onClick={handleRestart}>Restart...</MenubarItem>
        <MenubarItem onClick={handleShutDown}>Shut Down...</MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleLockScreen}>
          Lock Screen <MenubarShortcut>⌃⌘Q</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleLockScreen}>Log Out...</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
}
