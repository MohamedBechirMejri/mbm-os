export type FileKind = "image" | "video" | "audio" | "text" | "pdf" | "other";

type FSBase = {
  id: string;
  name: string;
  icon?: string;
  modified?: string;
  sizeLabel?: string;
  kindLabel?: string;
  hidden?: boolean;
};

export type FSFile = FSBase & {
  type: "file";
  kind: FileKind;
  // Public URL to the asset under /public
  path: string;
  size?: number;
};

export type FSFolder = FSBase & {
  type: "folder";
  children: FSNode[];
};

export type FSNode = FSFile | FSFolder;

export type FSPath = string[]; // array of folder ids starting at root

// Helper to generate ids
function id(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const desktopFolder: FSFolder = {
  id: id("Desktop"),
  type: "folder",
  name: "Desktop",
  icon: "/assets/icons/apps/desktop.ico",
  modified: "Sep 21, 2025 at 9:12 PM",
  children: [
    {
      id: id("Screenshot 1.jpg"),
      type: "file",
      name: "Screenshot 1.jpg",
      kind: "image",
      icon: "/assets/icons/apps/accessories-screenshot.ico",
      modified: "Sep 21, 2025 at 8:02 PM",
      size: 1_024_000,
      path: "/assets/screenshots/screenshot.jpg",
    },
    {
      id: id("Screenshot 2.jpg"),
      type: "file",
      name: "Screenshot 2.jpg",
      kind: "image",
      icon: "/assets/icons/apps/accessories-screenshot.ico",
      modified: "Sep 21, 2025 at 8:05 PM",
      size: 1_210_000,
      path: "/assets/screenshots/screenshot1.jpg",
    },
    {
      id: id("Screenshot 3.jpg"),
      type: "file",
      name: "Screenshot 3.jpg",
      kind: "image",
      icon: "/assets/icons/apps/accessories-screenshot.ico",
      modified: "Sep 21, 2025 at 8:09 PM",
      size: 1_340_000,
      path: "/assets/screenshots/screenshot2.jpg",
    },
  ],
};

const documentsFolder: FSFolder = {
  id: id("Documents"),
  type: "folder",
  name: "Documents",
  icon: "/assets/icons/apps/accessories-text-editor.ico",
  modified: "Sep 20, 2025 at 9:41 PM",
  children: [
    {
      id: id("projects.json"),
      type: "file",
      name: "projects.json",
      kind: "text",
      icon: "/assets/icons/apps/text-editor.ico",
      modified: "Sep 19, 2025 at 6:10 PM",
      size: 6_432,
      path: "/json/projects.json",
    },
    {
      id: id("socialLinks.json"),
      type: "file",
      name: "socialLinks.json",
      kind: "text",
      icon: "/assets/icons/apps/text-editor.ico",
      modified: "Sep 18, 2025 at 11:18 AM",
      size: 3_124,
      path: "/json/socialLinks.json",
    },
  ],
};

const downloadsFolder: FSFolder = {
  id: id("Downloads"),
  type: "folder",
  name: "Downloads",
  icon: "/assets/icons/apps/preferences-system-backup.ico",
  modified: "Sep 22, 2025 at 7:32 PM",
  children: [
    {
      id: id("sample-video.mp4"),
      type: "file",
      name: "sample-video.mp4",
      kind: "video",
      icon: "/assets/icons/apps/media-player-banshee.ico",
      modified: "Sep 18, 2025 at 5:12 PM",
      size: 35_864_000,
      path: "/assets/videos/3089895-hd_1920_1080_30fps.mp4",
    },
    {
      id: id("bittersweet.mp3"),
      type: "file",
      name: "bittersweet.mp3",
      kind: "audio",
      icon: "/assets/icons/apps/multimedia-volume-control.ico",
      modified: "Sep 17, 2025 at 9:01 PM",
      size: 8_560_000,
      path: "/assets/mp3/bittersweet.mp3",
    },
  ],
};

const picturesFolder: FSFolder = {
  id: id("Pictures"),
  type: "folder",
  name: "Pictures",
  icon: "/assets/icons/apps/preferences-desktop-wallpaper.ico",
  modified: "Sep 12, 2025 at 1:07 PM",
  children: [
    {
      id: id("odinbook.png"),
      type: "file",
      name: "odinbook.png",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Sep 10, 2025 at 10:22 PM",
      size: 980_000,
      path: "/assets/previews/odinbook.png",
    },
    {
      id: id("etch-a-sketch.png"),
      type: "file",
      name: "ETCH-A-SKETCH.png",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Sep 10, 2025 at 9:47 PM",
      size: 864_000,
      path: "/assets/previews/ETCH-A-SKETCH.png",
    },
  ],
};

const wallpapersFolder: FSFolder = {
  id: id("Wallpapers"),
  type: "folder",
  name: "Wallpapers",
  icon: "/assets/icons/apps/preferences-desktop-wallpaper.ico",
  modified: "Sep 5, 2025 at 7:03 AM",
  children: [
    {
      id: id("macos-tahoe-26-light.png"),
      type: "file",
      name: "macOS Tahoe 26 Light Wallpaper.png",
      kind: "image",
      icon: "/assets/icons/apps/preferences-desktop-wallpaper.ico",
      modified: "Sep 5, 2025 at 6:54 AM",
      size: 3_120_000,
      path: "/assets/Tahoe%20default%20wallpapers/macOS%20Tahoe%2026%20Light%20Wallpaper.png",
    },
    {
      id: id("macos-tahoe-26-dark.png"),
      type: "file",
      name: "macOS Tahoe 26 Dark Wallpaper.png",
      kind: "image",
      icon: "/assets/icons/apps/preferences-desktop-wallpaper.ico",
      modified: "Sep 5, 2025 at 6:53 AM",
      size: 3_090_000,
      path: "/assets/Tahoe%20default%20wallpapers/macOS%20Tahoe%2026%20Dark%20Wallpaper.png",
    },
  ],
};

const publicFolder: FSFolder = {
  id: id("Public"),
  type: "folder",
  name: "Public",
  icon: "/assets/icons/apps/preferences-system-sharing.ico",
  modified: "Aug 29, 2025 at 3:18 PM",
  children: [
    {
      id: id("logo.png"),
      type: "file",
      name: "logo.png",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Aug 29, 2025 at 3:18 PM",
      size: 256_000,
      path: "/assets/logo.png",
    },
    {
      id: id("logo.webp"),
      type: "file",
      name: "logo.webp",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Aug 29, 2025 at 3:18 PM",
      size: 128_000,
      path: "/assets/logo.webp",
    },
    {
      id: id("nyutab.svg"),
      type: "file",
      name: "nyutab.svg",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Aug 28, 2025 at 11:01 AM",
      size: 42_000,
      path: "/assets/nyutab.svg",
    },
  ],
};

const devFolder: FSFolder = {
  id: id("dev"),
  type: "folder",
  name: "dev",
  icon: "/assets/icons/apps/codeblocks.ico",
  modified: "Sep 15, 2025 at 4:22 PM",
  children: [],
};

const opFolder: FSFolder = {
  id: id("op"),
  type: "folder",
  name: "op",
  icon: "/assets/icons/apps/preferences-system-privacy.ico",
  modified: "Sep 14, 2025 at 9:02 AM",
  children: [],
};

const ytFolder: FSFolder = {
  id: id("yt"),
  type: "folder",
  name: "yt",
  icon: "/assets/icons/apps/youtube.ico",
  modified: "Sep 10, 2025 at 6:55 PM",
  children: [],
};

const recentsFolder: FSFolder = {
  id: id("Recents"),
  type: "folder",
  name: "Recents",
  icon: "/assets/icons/apps/preferences-system-time.ico",
  modified: "Sep 25, 2025 at 9:12 AM",
  hidden: true,
  children: [
    {
      id: id("recent-design.png"),
      type: "file",
      name: "design-overview.png",
      kind: "image",
      icon: "/assets/icons/apps/accessories-image-viewer.ico",
      modified: "Sep 24, 2025 at 11:45 PM",
      size: 1_560_000,
      path: "/assets/previews/odinbook.png",
    },
    {
      id: id("recent-notes.md"),
      type: "file",
      name: "release-notes.md",
      kind: "text",
      icon: "/assets/icons/apps/text-editor.ico",
      modified: "Sep 24, 2025 at 4:37 PM",
      size: 9_800,
      path: "/json/projects.json",
    },
  ],
};

const applicationsFolder: FSFolder = {
  id: id("Applications"),
  type: "folder",
  name: "Applications",
  icon: "/assets/icons/apps/applications-system.ico",
  modified: "Sep 23, 2025 at 6:03 PM",
  children: [
    {
      id: id("Safari.app"),
      type: "file",
      name: "Safari.app",
      kind: "other",
      icon: "/assets/icons/apps/safari.ico",
      modified: "Sep 23, 2025 at 6:02 PM",
      size: 128_000_000,
      path: "/assets/icons/apps/safari.ico",
    },
    {
      id: id("Finder.app"),
      type: "file",
      name: "Finder.app",
      kind: "other",
      icon: "/assets/icons/apps/file-manager.ico",
      modified: "Sep 22, 2025 at 8:50 AM",
      size: 96_000_000,
      path: "/assets/icons/apps/file-manager.ico",
    },
  ],
};

const sharedFolder: FSFolder = {
  id: id("Shared"),
  type: "folder",
  name: "Shared",
  icon: "/assets/icons/apps/network-workgroup.ico",
  modified: "Sep 13, 2025 at 1:14 PM",
  children: [],
};

const mbmUserFolder: FSFolder = {
  id: id("mbm"),
  type: "folder",
  name: "mbm",
  icon: "/assets/icons/apps/userinfo.ico",
  modified: "Sep 25, 2025 at 8:03 AM",
  children: [
    desktopFolder,
    documentsFolder,
    downloadsFolder,
    picturesFolder,
    wallpapersFolder,
    publicFolder,
    devFolder,
    opFolder,
    ytFolder,
  ],
};

const usersFolder: FSFolder = {
  id: id("Users"),
  type: "folder",
  name: "Users",
  icon: "/assets/icons/apps/userinfo.ico",
  modified: "Sep 25, 2025 at 8:03 AM",
  children: [sharedFolder, mbmUserFolder],
};

const icloudDriveFolder: FSFolder = {
  id: id("iCloud Drive"),
  type: "folder",
  name: "iCloud Drive",
  icon: "/assets/icons/apps/icloud.ico",
  modified: "Sep 25, 2025 at 7:59 AM",
  hidden: true,
  children: [],
};

const airdropFolder: FSFolder = {
  id: id("AirDrop"),
  type: "folder",
  name: "AirDrop",
  icon: "/assets/icons/apps/airvpn.ico",
  modified: "Sep 25, 2025 at 7:30 AM",
  hidden: true,
  children: [],
};

const trashFolder: FSFolder = {
  id: id("Trash"),
  type: "folder",
  name: "Trash",
  modified: "Sep 01, 2025 at 9:00 AM",
  hidden: true,
  kindLabel: "Empty",
  children: [],
};

const macintoshHdFolder: FSFolder = {
  id: id("Macintosh HD"),
  type: "folder",
  name: "Macintosh HD",
  icon: "/assets/icons/apps/drive-removable-media.ico",
  modified: "Sep 25, 2025 at 8:03 AM",
  sizeLabel: "463.64 GB",
  kindLabel: "Startup Volume",
  children: [applicationsFolder, usersFolder],
};

const networkFolder: FSFolder = {
  id: id("Network"),
  type: "folder",
  name: "Network",
  icon: "/assets/icons/apps/network-workgroup.ico",
  modified: "Sep 24, 2025 at 2:11 PM",
  kindLabel: "Neighborhood",
  children: [],
};

// Virtual filesystem rooted at the device
export const FS: FSFolder = {
  id: id("MBM's MacBook Pro"),
  type: "folder",
  name: "MBM's MacBook Pro",
  icon: "/assets/icons/apps/drive-removable-media.ico",
  modified: "Sep 25, 2025 at 8:03 AM",
  children: [
    macintoshHdFolder,
    networkFolder,
    recentsFolder,
    icloudDriveFolder,
    airdropFolder,
    trashFolder,
  ],
};

export function isFolder(n: FSNode): n is FSFolder {
  return n.type === "folder";
}

export function isFile(n: FSNode): n is FSFile {
  return n.type === "file";
}

export function findNodeByPath(root: FSFolder, path: FSPath): FSFolder {
  let cur: FSFolder = root;
  for (const segment of path) {
    const next = cur.children.find(
      (c) => c.type === "folder" && c.id === segment,
    );
    if (!next || next.type !== "folder") return cur;
    cur = next;
  }
  return cur;
}

export function getBreadcrumbs(
  root: FSFolder,
  path: FSPath,
): { id: string; name: string }[] {
  const crumbs: { id: string; name: string }[] = [
    { id: root.id, name: root.name },
  ];
  let cur: FSFolder = root;
  for (const segment of path) {
    const next = cur.children.find(
      (c) => c.type === "folder" && c.id === segment,
    ) as FSFolder | undefined;
    if (!next) break;
    crumbs.push({ id: next.id, name: next.name });
    cur = next;
  }
  return crumbs;
}
