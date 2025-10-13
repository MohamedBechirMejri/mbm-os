import { type WinInstance } from "@/components/screens/desktop/components/window-manager";

export function describeState(win: WinInstance): string {
  switch (win.state) {
    case "fullscreen":
      return "Fullscreen";
    case "maximized":
      return "Maximized";
    case "minimized":
      return "Minimized";
    case "hidden":
      return "Hidden";
    default:
      return "Active";
  }
}
