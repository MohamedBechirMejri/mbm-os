"use client";

import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";

export function AppMenus() {
  return (
    <>
      <MenubarMenu>
        <MenubarTrigger className="font-semibold">Finder</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About Finder</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Empty Trash...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Services</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Hide Finder <MenubarShortcut>⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Hide Others <MenubarShortcut>⌥⌘H</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Show All</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Finder Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Folder <MenubarShortcut>⇧⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Smart Folder</MenubarItem>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Open <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Close Window <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Get Info <MenubarShortcut>⌘I</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Rename</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Find <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Show Clipboard</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            as Icons <MenubarShortcut>⌘1</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            as List <MenubarShortcut>⌘2</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            as Columns <MenubarShortcut>⌘3</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            as Gallery <MenubarShortcut>⌘4</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Show Preview <MenubarShortcut>⇧⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Show Toolbar</MenubarItem>
          <MenubarItem>Show Path Bar</MenubarItem>
          <MenubarItem>Show Status Bar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Go</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Back <MenubarShortcut>⌘[</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Forward <MenubarShortcut>⌘]</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Enclosing Folder <MenubarShortcut>⌘↑</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Desktop <MenubarShortcut>⇧⌘D</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Documents <MenubarShortcut>⇧⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Downloads <MenubarShortcut>⌥⌘L</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Applications <MenubarShortcut>⇧⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Utilities <MenubarShortcut>⇧⌘U</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Window</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Minimize <MenubarShortcut>⌘M</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Zoom</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Bring All to Front</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Tile Window to Left of Screen</MenubarItem>
          <MenubarItem>Tile Window to Right of Screen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Search</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>macOS Help</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
