import type { AppMeta } from "../../window-manager/types";
import { CalculatorApp } from "../calculator";
import { FinderApp } from "../finder";
import { SafariApp } from "../safari";
import { SpotifyApp } from "../spotify";
import { TerminalApp } from "../terminal";

export interface CatalogEntry {
  meta: AppMeta;
  subtitle?: string;
}

// These are pre-bundled apps. "Installing" just registers them with the WM.
export const CATALOG: CatalogEntry[] = [
  {
    meta: {
      id: "safari",
      title: "Safari",
      icon: "safari",
      Component: SafariApp,
      minSize: { w: 320, h: 240 },
      floatingActionBar: false,
      titlebarHeight: 46,
    },
    subtitle: "Fast, energy‑efficient browsing",
  },
  {
    meta: {
      id: "file-manager",
      title: "Finder",
      icon: "file-manager",
      Component: FinderApp,
      minSize: { w: 520, h: 380 },
      floatingActionBar: false,
      titlebarHeight: 46,
    },
    subtitle: "The home for your files",
  },
  {
    meta: {
      id: "terminal",
      title: "Terminal",
      icon: "terminal",
      Component: TerminalApp,
      minSize: { w: 320, h: 240 },
      floatingActionBar: true,
    },
    subtitle: "Command-line power",
  },
  {
    meta: {
      id: "calculator",
      title: "Calculator",
      icon: "calc",
      Component: CalculatorApp,
      minSize: { w: 200, h: 350 },
      maxSize: { w: 200, h: 350 },
      resizable: false,
      floatingActionBar: true,
    },
    subtitle: "Do the math (beautifully)",
  },
  {
    meta: {
      id: "spotify",
      title: "Spotify",
      icon: "spotify-client",
      Component: SpotifyApp,
      minSize: { w: 480, h: 360 },
    },
    subtitle: "Listen together",
  },
];
