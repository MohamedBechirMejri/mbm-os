"use client";

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { DesktopAPI } from "../../window-manager";
import { useActiveApp } from "../hooks/use-active-app";
import { useMenuActions } from "../hooks/use-menu-actions";

export function AppMenus() {
  const { minimizeActiveWindow, closeActiveWindow, tileLeft, tileRight } =
    useMenuActions();
  const { appTitle, appId } = useActiveApp();

  // Dynamic app-specific actions
  const newWindowLabel = appId ? `New ${appTitle} Window` : "New Finder Window";
  const newWindowAction = () => {
    if (appId) {
      DesktopAPI.launch(appId);
    } else {
      DesktopAPI.launch("file-manager");
    }
  };

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger className="font-semibold">{appTitle}</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled className="opacity-50">
            About {appTitle}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Services
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={minimizeActiveWindow}>
            Hide {appTitle} <MenubarShortcut>⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Hide Others <MenubarShortcut>⌥⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Show All
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={newWindowAction}>
            {newWindowLabel} <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Open <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={closeActiveWindow}>
            Close Window <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled className="opacity-50">
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Show Clipboard
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled className="opacity-50">
            as Icons <MenubarShortcut>⌘1</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            as List <MenubarShortcut>⌘2</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            as Columns <MenubarShortcut>⌘3</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            as Gallery <MenubarShortcut>⌘4</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Show Preview <MenubarShortcut>⇧⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Show Toolbar
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Show Path Bar
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Show Status Bar
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Go</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled className="opacity-50">
            Back <MenubarShortcut>⌘[</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Forward <MenubarShortcut>⌘]</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Enclosing Folder <MenubarShortcut>⌘↑</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Desktop <MenubarShortcut>⇧⌘D</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Documents <MenubarShortcut>⇧⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Downloads <MenubarShortcut>⌥⌘L</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => DesktopAPI.launch("softwarecenter")}>
            Applications <MenubarShortcut>⇧⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Utilities <MenubarShortcut>⇧⌘U</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Window</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={minimizeActiveWindow}>
            Minimize <MenubarShortcut>⌘M</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled className="opacity-50">
            Zoom
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-50">
            Bring All to Front
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={tileLeft}>
            Tile Window to Left of Screen
          </MenubarItem>
          <MenubarItem onClick={tileRight}>
            Tile Window to Right of Screen
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled className="opacity-50">
            Search
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            onClick={() => window.open("https://bechir.xyz", "_blank")}
          >
            Portfolio Website
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
