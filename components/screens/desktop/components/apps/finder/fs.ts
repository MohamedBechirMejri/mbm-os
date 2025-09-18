export type FileKind = "image" | "video" | "audio" | "text" | "pdf" | "other";

export type FSFile = {
  id: string;
  type: "file";
  name: string;
  kind: FileKind;
  // Public URL to the asset under /public
  path: string;
  size?: number;
};

export type FSFolder = {
  id: string;
  type: "folder";
  name: string;
  children: FSNode[];
};

export type FSNode = FSFile | FSFolder;

export type FSPath = string[]; // array of folder ids starting at root

// Helper to generate ids
function id(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// Virtual filesystem rooted at "Home"
export const FS: FSFolder = {
  id: "home",
  type: "folder",
  name: "Home",
  children: [
    {
      id: id("Desktop"),
      type: "folder",
      name: "Desktop",
      children: [
        {
          id: id("Screenshot 1.jpg"),
          type: "file",
          name: "Screenshot 1.jpg",
          kind: "image",
          path: "/assets/screenshots/screenshot.jpg",
        },
        {
          id: id("Screenshot 2.jpg"),
          type: "file",
          name: "Screenshot 2.jpg",
          kind: "image",
          path: "/assets/screenshots/screenshot1.jpg",
        },
        {
          id: id("Screenshot 3.jpg"),
          type: "file",
          name: "Screenshot 3.jpg",
          kind: "image",
          path: "/assets/screenshots/screenshot2.jpg",
        },
      ],
    },
    {
      id: id("Documents"),
      type: "folder",
      name: "Documents",
      children: [
        {
          id: id("projects.json"),
          type: "file",
          name: "projects.json",
          kind: "text",
          path: "/json/projects.json",
        },
        {
          id: id("socialLinks.json"),
          type: "file",
          name: "socialLinks.json",
          kind: "text",
          path: "/json/socialLinks.json",
        },
      ],
    },
    {
      id: id("Downloads"),
      type: "folder",
      name: "Downloads",
      children: [
        {
          id: id("sample-video.mp4"),
          type: "file",
          name: "sample-video.mp4",
          kind: "video",
          path: "/assets/videos/3089895-hd_1920_1080_30fps.mp4",
        },
        {
          id: id("bittersweet.mp3"),
          type: "file",
          name: "bittersweet.mp3",
          kind: "audio",
          path: "/assets/mp3/bittersweet.mp3",
        },
      ],
    },
    {
      id: id("Pictures"),
      type: "folder",
      name: "Pictures",
      children: [
        {
          id: id("odinbook.png"),
          type: "file",
          name: "odinbook.png",
          kind: "image",
          path: "/assets/previews/odinbook.png",
        },
        {
          id: id("etch-a-sketch.png"),
          type: "file",
          name: "ETCH-A-SKETCH.png",
          kind: "image",
          path: "/assets/previews/ETCH-A-SKETCH.png",
        },
      ],
    },
    {
      id: id("Wallpapers"),
      type: "folder",
      name: "Wallpapers",
      children: [
        {
          id: id("macos-tahoe-26-light.png"),
          type: "file",
          name: "macOS Tahoe 26 Light Wallpaper.png",
          kind: "image",
          path: "/assets/Tahoe%20default%20wallpapers/macOS%20Tahoe%2026%20Light%20Wallpaper.png",
        },
        {
          id: id("macos-tahoe-26-dark.png"),
          type: "file",
          name: "macOS Tahoe 26 Dark Wallpaper.png",
          kind: "image",
          path: "/assets/Tahoe%20default%20wallpapers/macOS%20Tahoe%2026%20Dark%20Wallpaper.png",
        },
      ],
    },
    {
      id: id("Public"),
      type: "folder",
      name: "Public",
      children: [
        {
          id: id("logo.png"),
          type: "file",
          name: "logo.png",
          kind: "image",
          path: "/assets/logo.png",
        },
        {
          id: id("logo.webp"),
          type: "file",
          name: "logo.webp",
          kind: "image",
          path: "/assets/logo.webp",
        },
        {
          id: id("nyutab.svg"),
          type: "file",
          name: "nyutab.svg",
          kind: "image",
          path: "/assets/nyutab.svg",
        },
      ],
    },
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
  for (const id of path) {
    const next = cur.children.find((c) => c.type === "folder" && c.id === id);
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
  for (const id of path) {
    const next = cur.children.find((c) => c.type === "folder" && c.id === id) as
      | FSFolder
      | undefined;
    if (!next) break;
    crumbs.push({ id: next.id, name: next.name });
    cur = next;
  }
  return crumbs;
}
