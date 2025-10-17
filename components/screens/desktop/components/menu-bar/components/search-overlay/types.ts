import type { AppId } from "@/components/screens/desktop/components/window-manager";

export type SearchEntry = {
  id: string;
  label: string;
  description?: string;
  kind: "app" | "window";
  appId?: AppId;
  windowId?: string;
};
